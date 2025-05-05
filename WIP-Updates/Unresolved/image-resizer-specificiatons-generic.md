# Specification: Automatic Image Resizing Implementation for Fairy Bites Recipe Website

## 1. Overview

This document outlines the implementation of an automatic image resizing system for the Fairy Bites recipe website. The system will allow the website to efficiently handle recipe images, automatically resize images to different dimensions as needed, and serve optimized images to users, improving loading times and overall user experience.

## 2. Objectives

- Implement server-side image processing to automatically resize uploaded recipe images
- Create an API route for dynamic image resizing on demand
- Integrate with Next.js's built-in image optimization
- Support bulk image processing for existing recipe images
- Ensure high-quality image output with appropriate compression
- Add environment variable flag to enable/disable the feature

## 3. Technology Stack

- **Next.js**: The React framework providing the foundation for the Fairy Bites website
- **Sharp**: High-performance Node.js image processing library
- **next/image**: Next.js's built-in Image component for client-side optimization
- **Node.js**: Runtime environment for server-side image processing
- **TypeScript**: For type safety and better developer experience

## 4. Implementation Approach

### 4.1 Environment Variable Configuration

Add a new environment variable to control whether the image resizing feature is enabled:

```
# Enable or disable automatic image resizing (1 = enabled, 0 = disabled)
ENABLE_IMAGE_RESIZING=1

# Maximum image dimensions to process
MAX_IMAGE_WIDTH=1920
MAX_IMAGE_HEIGHT=1080

# Default image quality (0-100)
IMAGE_QUALITY=80
```

This allows the feature to be toggled on or off without code changes, making it easy to disable during development or in specific environments.

### 4.2 Server-Side Image Processing with API Routes

We'll implement a server-side image processing system using Next.js API routes and the Sharp library. This will be our primary approach for handling image resizing operations.

#### 4.2.1 Creating the Image Processing API Route

Create a new API route at `/app/api/image-resize/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

export async function POST(request: Request) {
  // Check if image resizing is enabled
  if (process.env.ENABLE_IMAGE_RESIZING !== '1') {
    return NextResponse.json({ error: 'Image resizing is disabled' }, { status: 400 });
  }

  try {
    const data = await request.json();
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
```

### 4.3 Integration with Existing Recipe Image System

Update the client-side image utility in `lib/client-utils/image.ts` to use resized images when available:

```typescript
import { Recipe } from '@/lib/types';

// Client-side version of getRecipeImageUrl that supports resizing
export function getRecipeImageUrl(recipe: Recipe, index: number = 0, options?: {
  width?: number;
  height?: number;
  format?: 'webp' | 'jpeg' | 'png';
}): string {
  if (!recipe.images || recipe.images.length === 0) {
    return '/placeholder-recipe.svg'; // Use SVG placeholder for recipes without images
  }
  
  const imagePath = recipe.images[index % recipe.images.length];
  
  // If image resizing is disabled or no options are provided, return the original path
  if (!options || !process.env.NEXT_PUBLIC_ENABLE_IMAGE_RESIZING) {
    return `/images/${imagePath}`;
  }
  
  // If resizing is enabled and options are provided, use the resized image path
  const { width, height, format = 'webp' } = options;
  if (!width || !height) {
    return `/images/${imagePath}`;
  }
  
  const filename = imagePath.split('/').pop();
  const basename = filename?.split('.')[0];
  return `/resized-images/${basename}-${width}x${height}.${format}`;
}
```

### 4.4 Bulk Image Processing Utility

Create a utility function to process multiple images in the recipe directories:

```typescript
// utils/bulkImageProcessor.ts
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

interface ResizeConfig {
  width: number;
  height: number;
  format: 'jpeg' | 'png' | 'webp' | 'avif';
  quality: number;
}

export async function processRecipeImages(
  configs: ResizeConfig[]
) {
  // Check if image resizing is enabled
  if (process.env.ENABLE_IMAGE_RESIZING !== '1') {
    console.log('Image resizing is disabled. Skipping bulk processing.');
    return { success: false, message: 'Image resizing is disabled' };
  }

  const sourceFolder = path.join(process.cwd(), 'public', 'images');
  const outputFolder = path.join(process.cwd(), 'public', 'resized-images');

  // Ensure output directory exists
  if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder, { recursive: true });
  }

  const results = {
    success: true,
    processed: 0,
    failed: 0,
    skipped: 0,
    details: [] as any[]
  };

  // Process each recipe directory
  const directories = fs.readdirSync(sourceFolder, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  for (const dir of directories) {
    const recipeDirPath = path.join(sourceFolder, dir);
    
    // Get all image files in the recipe directory
    const files = fs.readdirSync(recipeDirPath)
      .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file));
    
    for (const file of files) {
      const inputPath = path.join(recipeDirPath, file);
      
      for (const config of configs) {
        try {
          // Create output directory structure matching the source
          const recipeOutputDir = path.join(outputFolder, dir);
          if (!fs.existsSync(recipeOutputDir)) {
            fs.mkdirSync(recipeOutputDir, { recursive: true });
          }
          
          const filename = path.basename(file, path.extname(file));
          const outputFilename = `${filename}-${config.width}x${config.height}.${config.format}`;
          const outputPath = path.join(recipeOutputDir, outputFilename);
          
          // Skip if the resized image already exists and is newer than the source
          if (fs.existsSync(outputPath)) {
            const outputStat = fs.statSync(outputPath);
            const inputStat = fs.statSync(inputPath);
            if (outputStat.mtime > inputStat.mtime) {
              results.skipped++;
              continue;
            }
          }
          
          await sharp(inputPath)
            .resize({
              width: config.width,
              height: config.height,
              fit: 'cover',
              position: 'centre'
            })
            .toFormat(config.format, { quality: config.quality })
            .toFile(outputPath);
          
          results.processed++;
          results.details.push({
            original: `${dir}/${file}`,
            resized: `${dir}/${outputFilename}`,
            success: true
          });
        } catch (error) {
          console.error(`Error processing ${dir}/${file} with config ${JSON.stringify(config)}:`, error);
          results.failed++;
          results.details.push({
            original: `${dir}/${file}`,
            config,
            success: false,
            error: (error as Error).message
          });
        }
      }
    }
  }

  return results;
}
```

### 4.5 Integration with copy-images.js Script

Modify the existing `copy-images.js` script to optionally process images after copying:

```javascript
// scripts/copy-images.js
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { processRecipeImages } from '../utils/bulkImageProcessor.js';

// Load environment variables from .env file
dotenv.config();

// Set a deployment flag - explicitly check for Vercel environment
const isVercelDeployment = process.env.VERCEL === '1' || process.env.VERCEL === 'true';
const enableImageResizing = process.env.ENABLE_IMAGE_RESIZING === '1';

// ... existing copy-images.js code ...

// After copying images, process them if resizing is enabled
if (enableImageResizing && success && !isVercelDeployment) {
  console.log('Image resizing is enabled. Processing images...');
  
  const resizeConfigs = [
    { width: 800, height: 600, format: 'webp', quality: 80 }, // Recipe detail view
    { width: 400, height: 300, format: 'webp', quality: 75 }, // Recipe card view
    { width: 200, height: 150, format: 'webp', quality: 70 }  // Thumbnail
  ];
  
  try {
    const result = await processRecipeImages(resizeConfigs);
    console.log(`Image processing completed: ${result.processed} processed, ${result.skipped} skipped, ${result.failed} failed`);
  } catch (error) {
    console.error('Error during image processing:', error);
  }
}
```

### 4.6 Enhanced OptimizedImage Component

Create a new component to use optimized images throughout the site:

```tsx
// components/OptimizedImage.tsx
'use client';

import Image, { ImageProps } from 'next/image';
import { useState, useEffect } from 'react';
import { Recipe } from '@/lib/types';
import { getRecipeImageUrl } from '@/lib/client-utils/image';

interface OptimizedRecipeImageProps extends Omit<ImageProps, 'src'> {
  recipe: Recipe;
  index?: number;
  useResizing?: boolean;
  quality?: number;
}

export default function OptimizedRecipeImage({
  recipe,
  index = 0,
  useResizing = true,
  quality = 80,
  ...props
}: OptimizedRecipeImageProps) {
  const [imageSrc, setImageSrc] = useState<string>('');
  const imageResizingEnabled = process.env.NEXT_PUBLIC_ENABLE_IMAGE_RESIZING === '1';
  
  useEffect(() => {
    // Determine the initial image source
    const initialSrc = getRecipeImageUrl(recipe, index, (imageResizingEnabled && useResizing) ? {
      width: props.width ? Number(props.width) : undefined,
      height: props.height ? Number(props.height) : undefined,
      format: 'webp'
    } : undefined);
    
    setImageSrc(initialSrc);
    
    // If resizing is enabled, try to get or create a resized version
    if (imageResizingEnabled && useResizing && recipe.images && recipe.images.length > 0) {
      const requestResizedImage = async () => {
        try {
          const res = await fetch('/api/image-resize', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              imagePath: `/images/${recipe.images[index % recipe.images.length]}`,
              width: props.width,
              height: props.height,
              format: 'webp',
              quality,
            }),
          });
          
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.resizedImagePath) {
              setImageSrc(data.resizedImagePath);
            }
          }
        } catch (error) {
          // Fallback to original image if resizing fails
          console.error('Failed to get resized image:', error);
        }
      };
      
      requestResizedImage();
    }
  }, [recipe, index, props.width, props.height, quality, useResizing, imageResizingEnabled]);
  
  if (!imageSrc) {
    return null;
  }
  
  return (
    <Image
      {...props}
      src={imageSrc}
      alt={props.alt || recipe.name}
    />
  );
}
```

### 4.7 CLI Script for Bulk Processing

Create a script to run the bulk processor from the command line:

```typescript
// scripts/resize-images.ts
import { processRecipeImages } from '../utils/bulkImageProcessor';

// Default resize configurations
const DEFAULT_CONFIGS = [
  { width: 800, height: 600, format: 'webp', quality: 80 }, // Recipe detail view
  { width: 400, height: 300, format: 'webp', quality: 75 }, // Recipe card view
  { width: 200, height: 150, format: 'webp', quality: 70 }  // Thumbnail
];

async function main() {
  console.log('Starting image processing for recipe images...');
  
  try {
    const results = await processRecipeImages(DEFAULT_CONFIGS as any);
    
    if (results.success) {
      console.log(`Successfully processed ${results.processed} images`);
      console.log(`Skipped ${results.skipped} images (already up to date)`);
      
      if (results.failed > 0) {
        console.error(`Failed to process ${results.failed} images`);
      }
    } else {
      console.log(results.message);
    }
  } catch (error) {
    console.error('Script failed:', error);
  }
}

main();
```

Add to package.json:

```json
"scripts": {
  "resize-images": "ts-node scripts/resize-images.ts"
}
```

## 5. Updates to RecipeCard Component

Modify the RecipeCard component to use the OptimizedRecipeImage component:

```tsx
// components/recipe-card.tsx
'use client';

import Link from 'next/link';
import { Recipe } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import OptimizedRecipeImage from '@/components/OptimizedImage';

// Comprehensive tag normalization function
function normalizeTag(tag: string): string {
  // ...existing code...
}

interface RecipeCardProps {
  recipe: Recipe;
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  const handleTagClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <Link href={`/recipes/${recipe.id}`} className="block h-full">
      <Card className="overflow-hidden h-full transition-all hover:shadow-lg">
        <CardHeader className="p-0">
          <div className="relative">
            <AspectRatio ratio={4/3}>
              <OptimizedRecipeImage 
                recipe={recipe}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                width={400}
                height={300}
              />
            </AspectRatio>
            {recipe.rating > 0 && (
              <div className="absolute top-2 right-2 bg-accent-500 text-white rounded-full px-2 py-1 text-sm font-bold">
                {recipe.rating}/5
              </div>
            )}
          </div>
        </CardHeader>
        
        {/* Rest of the component remains the same */}
      </Card>
    </Link>
  );
}
```

## 6. Next.js Configuration

Update the Next.js configuration to support our image optimization:

```typescript
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    domains: [], // Add any external image domains here if needed
    formats: ['image/webp', 'image/avif'],
    remotePatterns: [],
  },
  experimental: {
    // Any experimental features needed
  },
  // Existing configuration
};

export default nextConfig;
```

## 7. Environment Variables

Update the `.env.example` file with the new environment variables:

```
# Recipe image source directory relative to scripts folder
RECIPE_IMAGES_SOURCE_DIR="../../Recipes-and-photos"

# Image resizing feature flag (1 = enabled, 0 = disabled)
ENABLE_IMAGE_RESIZING=1
NEXT_PUBLIC_ENABLE_IMAGE_RESIZING=1

# Image resizing configuration
MAX_IMAGE_WIDTH=1920
MAX_IMAGE_HEIGHT=1080
IMAGE_QUALITY=80
```

## 8. Deployment Considerations

### 8.1 Required Dependencies

Ensure these dependencies are installed:

```bash
npm install --save sharp
```

### 8.2 Vercel Configuration

When deploying to Vercel, make sure to:

1. Set the environment variables in the Vercel project settings:
   ```
   ENABLE_IMAGE_RESIZING=1
   NEXT_PUBLIC_ENABLE_IMAGE_RESIZING=1
   VERCEL=1
   ```

2. Configure build settings to handle the increased build requirements:
   ```
   Build Command: npm run build
   Output Directory: .next
   ```

3. Consider using Vercel's image optimization service instead of custom image processing for production.

### 8.3 DigitalOcean App Platform Considerations

For DigitalOcean App Platform:

1. Ensure the environment variables are set in the App Platform settings
2. Monitor disk usage as resized images will increase storage requirements
3. Consider enabling the built-in CDN for better image delivery performance

## 9. Performance Benefits

Implementing this image resizing system will provide several benefits:

1. **Reduced bandwidth usage**: Smaller, optimized images mean less data transferred
2. **Faster loading times**: Properly sized images load faster on all devices
3. **Improved Core Web Vitals**: Better LCP (Largest Contentful Paint) metrics
4. **Reduced storage requirements for users**: Cached optimized images are smaller
5. **Appropriate image sizes for different devices**: Mobile users get mobile-optimized images

## 10. Future Enhancements

For future iterations, consider implementing:

1. Integration with cloud storage services (AWS S3, Google Cloud Storage)
2. Advanced image manipulation features (filters, watermarks, text overlays)
3. Automated image optimization based on user device and connection speed
4. Machine learning-based smart cropping for better focal point detection
5. Progressive loading for large images
6. WebP and AVIF format conversion for browsers that support them
7. Integration with a CDN for global distribution of optimized images