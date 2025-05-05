import { NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import path from 'path';
import fs from 'fs';

export async function DELETE(request: Request) {
  if (process.env.EDIT_INTERFACE !== '1') {
    return NextResponse.json(
      { error: 'Edit interface is not enabled' },
      { status: 403 }
    );
  }
  
  try {
    const { imagePaths, deleteOptimized = false } = await request.json();
    
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