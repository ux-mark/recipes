import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { normalizeFileName } from '@/lib/utils/string-utils';

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
    const formData = await request.formData();
    const recipeName = formData.get('recipeName') as string;
    const generateOptimized = formData.get('generateOptimized') === 'true';
    
    if (!recipeName) {
      return NextResponse.json(
        { error: 'Recipe name is required' },
        { status: 400 }
      );
    }
    
    const normalizedName = normalizeFileName(recipeName);
    const dirPath = path.join(process.cwd(), 'public', 'images', normalizedName);
    
    // Create directory if it doesn't exist
    await mkdir(dirPath, { recursive: true });
    
    const images = formData.getAll('images');
    if (!images || images.length === 0) {
      return NextResponse.json(
        { error: 'No images provided' },
        { status: 400 }
      );
    }
    
    const imagePaths: string[] = [];
    const optimizedPaths: Record<string, string[]> = {};
    
    // Define standard sizes for recipe images
    const standardSizes = [
      { width: 800, height: 600, format: 'webp', quality: 80 }, // Recipe detail view
      { width: 400, height: 300, format: 'webp', quality: 75 }, // Recipe card view 
      { width: 200, height: 150, format: 'webp', quality: 70 }  // Thumbnail/preview
    ];
    
    for (let i = 0; i < images.length; i++) {
      const image = images[i] as File;
      
      // Validate file type
      if (!image.type.startsWith('image/')) {
        continue; // Skip non-image files
      }
      
      // Get a unique filename
      const extension = image.name.split('.').pop() || 'jpg';
      const imageIndex = i + 1;
      const fileName = `${normalizedName}-${imageIndex}.${extension}`;
      
      // Full path where the image will be saved
      const imagePath = path.join(dirPath, fileName);
      
      // Convert the file to an array buffer for saving
      const buffer = Buffer.from(await image.arrayBuffer());
      
      // Write the file to disk
      await writeFile(imagePath, buffer);
      
      // Store the relative path for the recipe JSON
      const relativeImagePath = `${normalizedName}/${fileName}`;
      imagePaths.push(relativeImagePath);
      
      // Create optimized versions if requested
      if (generateOptimized) {
        const optimizedVersions: string[] = [];
        
        // Create resized-images directory if it doesn't exist
        const optimizedDir = path.join(process.cwd(), 'public', 'resized-images', normalizedName);
        await mkdir(optimizedDir, { recursive: true });
        
        for (const { width, height, format, quality } of standardSizes) {
          try {
            const optimizedFileName = `${normalizedName}-${imageIndex}-${width}x${height}.${format}`;
            const optimizedPath = path.join(optimizedDir, optimizedFileName);
            
            await sharp(buffer)
              .resize({
                width,
                height,
                fit: 'cover',
                position: 'centre'
              })
              .toFormat(format as keyof sharp.FormatEnum, { quality })
              .toFile(optimizedPath);
            
            optimizedVersions.push(`resized-images/${normalizedName}/${optimizedFileName}`);
          } catch (err) {
            console.error(`Failed to create optimized version: ${err}`);
            // Non-fatal error, continue with other sizes
          }
        }
        
        // Store optimized paths for this image
        if (optimizedVersions.length > 0) {
          optimizedPaths[relativeImagePath] = optimizedVersions;
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      imagePaths,
      optimizedPaths: Object.keys(optimizedPaths).length > 0 ? optimizedPaths : undefined
    });
  } catch (error) {
    console.error('Error uploading images:', error);
    return NextResponse.json(
      { error: 'Failed to upload images' },
      { status: 500 }
    );
  }
}