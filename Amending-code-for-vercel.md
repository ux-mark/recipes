# Steps to Host on Vercel and Resolve Build Errors

## Overview
This document outlines the steps to host the Fairy Bites recipe website on Vercel using their default settings for free hosting. It also addresses the build error encountered during deployment.

## Key Issues Identified
1. **Image Copy Script Issue**:
   - The `copy-images.js` script fails because the `RECIPE_IMAGES_SOURCE_DIR` environment variable is not set in the Vercel environment.
   - The script attempts to access a directory that does not exist in the deployment environment.

2. **TypeScript Type Error**:
   - Missing return type annotations for metadata and static params generation functions.
   - TypeScript strict mode errors in Next.js App Router components.

## Steps to Resolve

### 1. Fix the Image Copy Script
The current `copy-images.js` script already has some error handling, but we can improve it for Vercel deployment:

- **Use Cross-Platform Solution in package.json**:
  Update the `package.json` file to use a cross-platform compatible approach:
  ```json
  "scripts": {
    "prebuild": "node -e \"process.env.NODE_ENV !== 'production' ? require('child_process').execSync('npm run copy-images') : console.log('Skipping image copy in production')\"",
    "copy-images": "node scripts/copy-images.js"
  }
  ```

- **Enhance the Script's Error Handling**:
  The script already handles missing directories gracefully, but we can optimize it further:
  ```javascript
  // In copy-images.js:
  // Set a deployment flag
  const isVercelDeployment = process.env.VERCEL === '1';
  
  // Skip extensive error logging in deployment
  if (isVercelDeployment && !fs.existsSync(sourceDir)) {
    console.log('Skipping image copy in Vercel deployment environment');
    process.exit(0);
  }
  ```

- **Commit Public Image Directory**:
  Ensure the `/public/images` directory is committed to git (even if empty) to maintain the structure in deployments.

### 2. Resolve TypeScript Type Error
To fix the type errors in `app/recipes/[id]/page.tsx`:

- **Add Proper Type Imports**:
  ```typescript
  import type { Metadata } from 'next';
  ```

- **Keep the Correct Parameter Types**:
  The params object should remain as a plain object (not a Promise):
  ```typescript
  interface RecipePageProps {
    params: {
      id: string;
    };
    searchParams?: Record<string, string | string[] | undefined>;
  }
  ```

- **Add Return Type Annotations**:
  ```typescript
  export async function generateMetadata({ params }: RecipePageProps): Promise<Metadata> {
    const recipe = await getRecipeById(params.id);
    
    if (!recipe) {
      return {
        title: 'Recipe Not Found | Fairy Bites',
      };
    }
    
    return {
      title: `${recipe.name} | Fairy Bites`,
      description: recipe.description || `A delicious recipe for ${recipe.name}`,
    };
  }

  export async function generateStaticParams(): Promise<{ id: string }[]> {
    const recipes = await getAllRecipes();
    
    return recipes.map((recipe) => ({
      id: recipe.id,
    }));
  }
  ```

### 3. Improve Next.js Configuration
Update the `next.config.ts` file for better Vercel compatibility:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    domains: [], // Add any external image domains here if needed
    unoptimized: false, // Set to true if you want to disable Next.js image optimization
  },
  // Only use this if type errors persist after adding proper annotations
  // typescript: {
  //   ignoreBuildErrors: true,
  // },
};

export default nextConfig;
```

### 4. Configure Vercel Deployment
- **Add Build Output Configuration**:
  In your Vercel project settings, ensure the "Build and Development Settings" match your Next.js version.

- **Set Environment Variables**:
  In the Vercel dashboard, add the following environment variables:
  ```
  VERCEL=1
  ```

- **Optimize Image Handling**:
  Consider using Vercel's built-in image optimization instead of copying images. This would involve:
  1. Storing images in a separate repo or service like Cloudinary
  2. Updating image references to use Next.js Image component with remote sources

### 5. Test Locally Before Deployment
- Run the following commands to test the build locally:
  ```bash
  NODE_ENV=production npm run build
  npm start
  ```
- Fix any errors encountered during the local build process.

### 6. Deploy to Vercel
- Push the changes to the repository.
- Connect the repository to Vercel for automatic deployments.

