import { NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import path from 'path';
import fs from 'fs';
import { headers } from 'next/headers';

// Consistent security check function across all routes
function isEditEnabled() {
  // For simplicity, just check the environment variable
  // This avoids TypeScript errors with the headers API
  return process.env.EDIT_INTERFACE === '1';
}

export async function DELETE(request: Request) {
  // Using the consistent security check function
  if (!await isEditEnabled()) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 403 }
    );
  }
  
  try {
    // Parse the request body with proper error handling
    let requestData;
    try {
      const text = await request.text();
      requestData = JSON.parse(text);
    } catch (error) {
      console.error("Failed to parse request body:", error);
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }
    
    const { imagePaths, deleteOptimized = false } = requestData;
    
    if (!imagePaths || !Array.isArray(imagePaths) || imagePaths.length === 0) {
      return NextResponse.json(
        { error: 'No image paths provided' },
        { status: 400 }
      );
    }
    
    const results = [];
    
    for (const imagePath of imagePaths) {
      try {
        // Delete original image
        const fullPath = path.join(
          process.cwd(),
          'public',
          'images',
          imagePath
        );
        
        await unlink(fullPath);
        
        // Delete optimized versions if requested
        if (deleteOptimized) {
          const parts = imagePath.split('/');
          if (parts.length >= 2) {
            const recipeName = parts[0];
            const imageFileName = parts[1];
            const baseName = imageFileName.split('.')[0];
            
            const optimizedDir = path.join(
              process.cwd(),
              'public',
              'resized-images',
              recipeName
            );
            
            // Check if directory exists
            if (fs.existsSync(optimizedDir)) {
              // Get all optimized versions matching the base name
              const files = fs.readdirSync(optimizedDir).filter(file => 
                file.startsWith(baseName + '-')
              );
              
              // Delete each optimized version
              for (const file of files) {
                await unlink(path.join(optimizedDir, file));
              }
            }
          }
        }
        
        results.push({
          path: imagePath,
          deleted: true
        });
      } catch (err) {
        console.error(`Failed to delete image ${imagePath}:`, err);
        
        results.push({
          path: imagePath,
          deleted: false,
          error: 'File not found or could not be deleted'
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      results
    });
  } catch (error) {
    console.error('Error deleting images:', error);
    return NextResponse.json(
      { error: 'Failed to delete images' },
      { status: 500 }
    );
  }
}