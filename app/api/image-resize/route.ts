import { NextResponse } from 'next/server';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { headers } from 'next/headers';

// Consistent security check function across all routes
function isEditEnabled() {
  // For simplicity, just check the environment variable
  // This avoids TypeScript errors with the headers API
  return process.env.EDIT_INTERFACE === '1';
}

export async function POST(request: Request) {
  // Using the consistent security check function
  if (!await isEditEnabled()) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 403 }
    );
  }

  try {
    // Parse the request body with proper error handling
    let data;
    try {
      const text = await request.text();
      data = JSON.parse(text);
    } catch (error) {
      console.error("Failed to parse request body:", error);
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }
    
    const { 
      imagePath, 
      width, 
      height, 
      format = 'webp', 
      quality = 80 
    } = data;

    // Validate inputs
    if (!imagePath || !width || !height) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Resolve the absolute path to the image
    const absolutePath = path.join(process.cwd(), 'public', imagePath);
    
    // Ensure the file exists
    if (!fs.existsSync(absolutePath)) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    // Create output directory if it doesn't exist
    const outputDir = path.join(process.cwd(), 'public', 'resized-images');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Generate a unique filename
    const filename = path.basename(imagePath, path.extname(imagePath));
    const outputPath = path.join('resized-images', `${filename}-${width}x${height}.${format}`);
    const absoluteOutputPath = path.join(process.cwd(), 'public', outputPath);

    // Process the image
    await sharp(absolutePath)
      .resize({
        width: parseInt(width.toString(), 10),
        height: parseInt(height.toString(), 10),
        fit: 'cover',
        position: 'centre'
      })
      .toFormat(format as keyof sharp.FormatEnum, { quality })
      .toFile(absoluteOutputPath);

    // Return the path to the resized image
    return NextResponse.json({ 
      success: true, 
      resizedImagePath: `/${outputPath.replace(/\\/g, '/')}` 
    });
  } catch (error) {
    console.error('Image resizing error:', error);
    return NextResponse.json({ error: 'Failed to resize image' }, { status: 500 });
  }
}