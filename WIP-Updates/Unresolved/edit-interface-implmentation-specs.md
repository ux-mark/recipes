# Recipe Edit Interface Specification

## 1. Overview

This document outlines the implementation of a comprehensive recipe editing interface for the Fairy Bites recipe website. The system will allow users to directly edit recipes, upload multiple images, and manage recipe content through an intuitive interface that integrates with the existing website architecture.

## 2. Feature Flag

The edit interface will be controlled by an environment variable:

```
# Enable or disable recipe editing interface (1 = enabled, 0 = disabled)
EDIT_INTERFACE=1
```

This replaces the previous `ENABLE_IMAGE_RESIZING` variable while maintaining compatibility with existing image handling functionality.

## 3. User Interface Components

### 3.1 Recipe Edit Modal/Page

The edit interface will be accessible through two entry points:
1. An "Edit" button on recipe detail pages (when authenticated)
2. A "New Recipe" button in the site header or navigation menu

### 3.2 Form Structure

The edit form will include the following fields, corresponding to the Recipe interface:

#### Basic Information
- **Name** (text input) - Recipe title
- **Description** (textarea) - Recipe description
- **Aside** (textarea) - Optional notes/tips
- **Preparation Time** (text input) - Format: "30 mins"
- **Cooking Time** (text input) - Format: "1 hour"
- **Servings** (text input) - Format: "4-6"
- **Rating** (star selector) - 0-5 stars

#### Lists (with Add/Remove/Reorder capabilities)
- **Ingredients** (dynamic list of text inputs)
- **Instructions** (dynamic list of larger text inputs)
- **Tags** (dynamic list with autocomplete from existing tags)

#### Source Information
- **Source Name** (text input)
- **Source URL** (text input)

#### Image Management
- **Image Upload** (multi-file uploader with preview)
- **Image Reordering** (drag-and-drop interface)
- **Image Deletion** (with confirmation)

## 4. Technical Implementation

### 4.1 Image Handling

#### 4.1.1 Storage Path Convention

Images will be stored following this path convention:
```
/public/images/{normalized-recipe-name}/{normalized-recipe-name}-{index}.{extension}
```

Where:
- `normalized-recipe-name` is derived from the recipe name with:
  - All characters converted to lowercase
  - Spaces replaced with hyphens
  - Special characters and accents removed
  - Example: "Crème Brûlée" → "creme-brulee"
- `index` is a sequential number starting at 1
- `extension` is the file's original extension (jpg, jpeg, png, webp)

#### 4.1.2 Image Normalization Utility

Create a utility function to handle consistent name normalization:

```typescript
// utils/string-utils.ts
export function normalizeFileName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')  // Normalize to decomposed form (separate base chars from diacritics)
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9]+/g, '-')  // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '')      // Remove leading/trailing hyphens
    .replace(/-{2,}/g, '-');      // Replace multiple hyphens with single hyphen
}
```

### 4.2 API Routes

#### 4.2.1 Recipe CRUD Operations

Create the following API routes for recipe management:

```
POST /api/recipes - Create new recipe
PUT /api/recipes/:id - Update existing recipe
DELETE /api/recipes/:id - Delete a recipe
```

#### 4.2.2 Image Upload Endpoint

```
POST /api/images/upload - Upload recipe images
```

This endpoint will:
1. Accept multiple images
2. Normalize the recipe name for folder/file naming
3. Create directories as needed
4. Save images in the appropriate format
5. Return paths for storage in the recipe JSON

#### 4.2.3 Image Deletion Endpoint

```
DELETE /api/images - Delete recipe images
```

This endpoint will:
1. Accept an array of image paths
2. Delete the specified images
3. Return success/failure status

### 4.3 Data Management

#### 4.3.1 Recipe JSON Management

The system will:
1. Read the current recipes.json file
2. Make the requested changes (add/update/delete recipes)
3. Write the updated JSON back to the file
4. Include appropriate locking mechanisms to handle concurrent edits

#### 4.3.2 Change History

Implement a simple change history by:
1. Creating timestamped backups of recipes.json before each write
2. Storing backups in a `/backups` directory
3. Limiting the number of historical versions kept

### 4.4 Server-Side Validation

Implement comprehensive validation:
1. Required fields: name, ingredients, instructions
2. Format validation for URLs and other structured fields
3. Image size and type validation
4. Security checks (sanitization of inputs)

### 4.5 Image Resizing Integration

Incorporate image resizing capabilities to automatically optimize uploaded images:

#### 4.5.1 Image Resizing Configuration

Add additional environment variables to control image resizing behavior:

```
# Image resizing configuration
MAX_IMAGE_WIDTH=1920
MAX_IMAGE_HEIGHT=1080
IMAGE_QUALITY=80
```

#### 4.5.2 Image Processing API Route

Create a dedicated API route for image resizing at `/app/api/image-resize/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

export async function POST(request: Request) {
  // Check if edit interface is enabled
  if (process.env.EDIT_INTERFACE !== '1') {
    return NextResponse.json({ error: 'Edit interface is disabled' }, { status: 400 });
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

#### 4.5.3 On-Upload Image Optimization

Enhance the image upload endpoint to automatically resize uploaded images:

```typescript
// app/api/images/upload/route.ts - Additional code for image optimization
// After saving the original image, generate resized versions

// Define standard sizes for recipe images
const standardSizes = [
  { width: 800, height: 600, format: 'webp', quality: 80 }, // Recipe detail view
  { width: 400, height: 300, format: 'webp', quality: 75 }, // Recipe card view 
  { width: 200, height: 150, format: 'webp', quality: 70 }  // Thumbnail/preview
];

// Generate resized versions if edit interface includes resizing
for (const { width, height, format, quality } of standardSizes) {
  try {
    const outputDir = path.join(process.cwd(), 'public', 'resized-images', normalizedName);
    if (!fs.existsSync(outputDir)) {
      await mkdir(outputDir, { recursive: true });
    }
    
    const outputFilename = `${normalizedName}-${imageIndex}-${width}x${height}.${format}`;
    const outputPath = path.join(outputDir, outputFilename);
    
    await sharp(imagePath)
      .resize({
        width,
        height,
        fit: 'cover',
        position: 'centre'
      })
      .toFormat(format as keyof sharp.FormatEnum, { quality })
      .toFile(outputPath);
    
    // Add to response but don't include in recipe.images array
    optimizedPaths.push(`resized-images/${normalizedName}/${outputFilename}`);
  } catch (error) {
    console.error(`Failed to create optimized version (${width}x${height}):`, error);
    // Non-fatal error, continue with other sizes
  }
}
```

#### 4.5.4 Bulk Image Processing Utility

Create a utility function for processing all recipe images:

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

export async function processRecipeImages(configs: ResizeConfig[]) {
  // Check if edit interface is enabled
  if (process.env.EDIT_INTERFACE !== '1') {
    console.log('Edit interface is disabled. Skipping bulk processing.');
    return { success: false, message: 'Edit interface is disabled' };
  }

  const sourceFolder = path.join(process.cwd(), 'public', 'images');
  const outputFolder = path.join(process.cwd(), 'public', 'resized-images');

  // Ensure output directory exists
  if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder, { recursive: true });
  }

  // Process recipe directories
  // ... implementation as in the image resizer specification ...
  
  return results;
}
```

#### 4.5.5 Enhanced Recipe Image Component

Create a component for displaying optimized recipe images:

```tsx
// components/OptimizedRecipeImage.tsx
'use client';

import Image, { ImageProps } from 'next/image';
import { useState, useEffect } from 'react';
import { Recipe } from '@/lib/types';

interface OptimizedRecipeImageProps extends Omit<ImageProps, 'src'> {
  recipe: Recipe;
  index?: number;
  quality?: number;
}

export default function OptimizedRecipeImage({
  recipe,
  index = 0,
  quality = 80,
  ...props
}: OptimizedRecipeImageProps) {
  const [imageSrc, setImageSrc] = useState<string>('');
  
  useEffect(() => {
    // Determine the initial image source
    if (!recipe.images || recipe.images.length === 0) {
      setImageSrc('/placeholder-recipe.svg');
      return;
    }
    
    const imagePath = recipe.images[index % recipe.images.length];
    setImageSrc(`/images/${imagePath}`);
    
    // If edit interface is enabled, try to get or create a resized version
    if (process.env.NEXT_PUBLIC_EDIT_INTERFACE === '1' && props.width && props.height) {
      // Attempt to load or generate a resized version
      // ... implementation as in the image resizer specification ...
    }
  }, [recipe, index, props.width, props.height, quality]);
  
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

## 5. User Experience Enhancements

### 5.1 Drafts and Autosave

Implement autosave functionality to prevent data loss:
1. Save draft recipes to localStorage every 30 seconds
2. Provide a "recover unsaved changes" option
3. Show "last saved" timestamp

### 5.2 Rich Text Editing

Enhance the editing experience:
1. Use a rich text editor for instructions and description
2. Support for basic formatting (bold, italic, links)
3. Support for lists (numbered and bulleted)
4. Markdown support as an alternative

### 5.3 Image Preview & Manipulation

Improve image handling UX:
1. Show image previews during upload
2. Allow image reordering via drag and drop
3. Basic image cropping functionality
4. Ability to add alt text for accessibility
5. Automatic image optimization with various preset sizes
6. Preview of how images will appear in different contexts (card view vs. detail view)
7. Support for WebP format with JPEG fallback for older browsers

### 5.4 Tag Management

Streamline tag usage:
1. Autocomplete for existing tags
2. Tag grouping for common categories (meal type, cuisine, etc.)
3. Tag suggestions based on recipe content

### 5.5 Form Navigation

For complex recipes:
1. Tab-based navigation between form sections
2. Sticky save/publish buttons always visible
3. Collapsible sections for better organization

## 6. Authentication & Authorization

### 6.1 Editor Access Control

Restrict edit access to authenticated users:
1. Integrate with existing authentication system
2. Role-based permissions (admin, editor, contributor)
3. Visibility controls for edit buttons based on permissions

### 6.2 Security Considerations

Implement proper security measures:
1. CSRF protection for form submissions
2. Input sanitization to prevent XSS
3. Rate limiting for API endpoints
4. File type validation for uploads

## 7. Mobile Responsiveness

Ensure the edit interface works well on all devices:
1. Responsive layout adjustments for small screens
2. Touch-friendly controls for image manipulation
3. Simplified interface on mobile with core functionality preserved
4. Specialized input controls optimized for touch

## 8. Implementation Details

### 8.1 Front-End Components

```tsx
// components/RecipeEditForm.tsx
import { useState, useEffect } from 'react';
import { Recipe } from '@/lib/types';
import ImageUploader from './ImageUploader';
import IngredientsList from './IngredientsList';
import InstructionsList from './InstructionsList';
import TagSelector from './TagSelector';

interface RecipeEditFormProps {
  initialRecipe?: Recipe;
  onSave: (recipe: Recipe) => Promise<void>;
}

export default function RecipeEditForm({ initialRecipe, onSave }: RecipeEditFormProps) {
  const [recipe, setRecipe] = useState<Recipe>(initialRecipe || createEmptyRecipe());
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Form handling logic
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSaving(true);
    try {
      await onSave(recipe);
      // Show success message
    } catch (error) {
      // Handle error
    } finally {
      setIsSaving(false);
    }
  };
  
  const validateForm = () => {
    // Validation logic
    return true;
  };
  
  // Autosave functionality
  useEffect(() => {
    const interval = setInterval(() => {
      saveToLocalStorage(recipe);
    }, 30000);
    
    return () => clearInterval(interval);
  }, [recipe]);
  
  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium">
              Recipe Name
            </label>
            <input
              type="text"
              id="name"
              value={recipe.name}
              onChange={(e) => setRecipe({...recipe, name: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              required
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>
          
          {/* More fields... */}
        </div>
      </section>
      
      {/* Ingredients */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Ingredients</h2>
        <IngredientsList
          ingredients={recipe.ingredients}
          onChange={(ingredients) => setRecipe({...recipe, ingredients})}
        />
      </section>
      
      {/* Instructions */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Instructions</h2>
        <InstructionsList
          instructions={recipe.instructions}
          onChange={(instructions) => setRecipe({...recipe, instructions})}
        />
      </section>
      
      {/* Images */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Images</h2>
        <ImageUploader
          existingImages={recipe.images}
          recipeName={recipe.name}
          onChange={(images) => setRecipe({...recipe, images})}
        />
      </section>
      
      {/* Tags */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Tags</h2>
        <TagSelector
          selectedTags={recipe.tags}
          onChange={(tags) => setRecipe({...recipe, tags})}
        />
      </section>
      
      {/* Submit Button */}
      <div className="sticky bottom-0 bg-white p-4 border-t flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-gray-400"
        >
          {isSaving ? 'Saving...' : 'Save Recipe'}
        </button>
      </div>
    </form>
  );
}

function createEmptyRecipe(): Recipe {
  return {
    id: '',
    name: '',
    description: '',
    ingredients: [],
    instructions: [],
    tags: [],
    prepTime: '',
    cookTime: '',
    servings: '',
    rating: 0,
    createdDate: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }),
    source: {
      name: '',
      url: ''
    },
    images: [],
  };
}

function saveToLocalStorage(recipe: Recipe) {
  localStorage.setItem('recipe-draft', JSON.stringify(recipe));
  localStorage.setItem('recipe-draft-timestamp', new Date().toISOString());
}
```

### 8.2 Enhanced Image Upload Component with Optimization

```tsx
// components/ImageUploader.tsx
import { useState, useRef } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { normalizeFileName } from '@/utils/string-utils';

interface ImageUploaderProps {
  existingImages: string[];
  recipeName: string;
  onChange: (images: string[]) => void;
}

export default function ImageUploader({ 
  existingImages, 
  recipeName,
  onChange 
}: ImageUploaderProps) {
  const [images, setImages] = useState<string[]>(existingImages);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [optimizedPreviews, setOptimizedPreviews] = useState<Record<string, string[]>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploading(true);
    setError(null);
    
    const formData = new FormData();
    Array.from(e.target.files).forEach((file) => {
      formData.append('images', file);
    });
    
    formData.append('recipeName', recipeName);
    formData.append('generateOptimized', 'true'); // Request optimized versions
    
    try {
      const response = await fetch('/api/images/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const data = await response.json();
      const newImages = [...images, ...data.imagePaths];
      setImages(newImages);
      onChange(newImages);
      
      // Store optimized image paths for previews
      if (data.optimizedPaths) {
        setOptimizedPreviews({
          ...optimizedPreviews,
          ...data.optimizedPaths
        });
      }
    } catch (err) {
      setError('Failed to upload images. Please try again.');
      console.error(err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const handleRemove = async (index: number) => {
    const imageToRemove = images[index];
    const newImages = [...images];
    newImages.splice(index, 1);
    
    setImages(newImages);
    onChange(newImages);
    
    try {
      await fetch('/api/images', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          imagePaths: [imageToRemove],
          deleteOptimized: true // Also delete optimized versions
        }),
      });
    } catch (err) {
      console.error('Failed to delete image from server', err);
    }
  };
  
  const moveImage = (dragIndex: number, hoverIndex: number) => {
    const dragImage = images[dragIndex];
    const newImages = [...images];
    newImages.splice(dragIndex, 1);
    newImages.splice(hoverIndex, 0, dragImage);
    
    setImages(newImages);
    onChange(newImages);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleUpload}
          className="hidden"
          id="image-upload"
        />
        <label
          htmlFor="image-upload"
          className="px-4 py-2 bg-secondary-500 text-white rounded-md hover:bg-secondary-600 cursor-pointer"
        >
          Select Images
        </label>
        <span className="ml-4 text-sm text-gray-500">
          {uploading ? 'Uploading...' : 'JPG, PNG, WebP up to 5MB'}
        </span>
      </div>
      
      {error && <p className="text-red-500">{error}</p>}
      
      {/* Display image size optimization info */}
      <div className="text-sm text-gray-500 mb-2">
        Images will be automatically optimized for web display and various device sizes.
      </div>
      
      <DndProvider backend={HTML5Backend}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((src, index) => (
            <DraggableImage
              key={src}
              src={src}
              index={index}
              optimizedVersions={optimizedPreviews[src] || []}
              onRemove={() => handleRemove(index)}
              onMove={moveImage}
            />
          ))}
        </div>
      </DndProvider>
    </div>
  );
}

interface DraggableImageProps {
  src: string;
  index: number;
  optimizedVersions: string[];
  onRemove: () => void;
  onMove: (dragIndex: number, hoverIndex: number) => void;
}

function DraggableImage({ 
  src, 
  index, 
  optimizedVersions,
  onRemove, 
  onMove 
}: DraggableImageProps) {
  // React DnD implementation for drag and drop
  // ...
  
  return (
    <div className="relative aspect-square">
      <img
        src={`/images/${src}`}
        alt={`Recipe image ${index + 1}`}
        className="object-cover w-full h-full rounded-md"
      />
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
        aria-label="Remove image"
      >
        &times;
      </button>
      
      {/* Image optimization indicator */}
      {optimizedVersions.length > 0 && (
        <div className="absolute bottom-1 right-1 bg-green-500 text-white text-xs px-1 py-0.5 rounded">
          Optimized
        </div>
      )}
    </div>
  );
}
```

### 8.3 Server-Side API Routes

```typescript
// app/api/recipes/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { Recipe } from '@/lib/types';
import { normalizeFileName } from '@/utils/string-utils';

// Path to recipes JSON file
const recipesFilePath = path.join(process.cwd(), './lib/recipes.json');

// Check if edit interface is enabled
function isEditEnabled() {
  return process.env.EDIT_INTERFACE === '1';
}

// Helper function to read recipes
async function readRecipes(): Promise<Recipe[]> {
  const data = await fs.readFile(recipesFilePath, 'utf8');
  return JSON.parse(data);
}

// Helper function to write recipes
async function writeRecipes(recipes: Recipe[]): Promise<void> {
  // Create backup
  const backupDir = path.join(process.cwd(), './backups');
  await fs.mkdir(backupDir, { recursive: true });
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(backupDir, `recipes-${timestamp}.json`);
  
  await fs.copyFile(recipesFilePath, backupPath);
  
  // Write updated recipes
  await fs.writeFile(
    recipesFilePath, 
    JSON.stringify(recipes, null, 2), 
    'utf8'
  );
}

// Create a new recipe
export async function POST(request: Request) {
  if (!isEditEnabled()) {
    return NextResponse.json(
      { error: 'Edit interface is not enabled' },
      { status: 403 }
    );
  }
  
  try {
    const newRecipe = await request.json();
    
    // Generate ID from name
    newRecipe.id = normalizeFileName(newRecipe.name);
    
    // Set creation date if not provided
    if (!newRecipe.createdDate) {
      newRecipe.createdDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      });
    }
    
    const recipes = await readRecipes();
    
    // Check for duplicate ID
    if (recipes.some(recipe => recipe.id === newRecipe.id)) {
      return NextResponse.json(
        { error: 'A recipe with this name already exists' },
        { status: 409 }
      );
    }
    
    recipes.push(newRecipe);
    await writeRecipes(recipes);
    
    return NextResponse.json(
      { success: true, recipe: newRecipe },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating recipe:', error);
    return NextResponse.json(
      { error: 'Failed to create recipe' },
      { status: 500 }
    );
  }
}

// Additional methods for PUT and DELETE would follow a similar pattern
```

```typescript
// app/api/recipes/[id]/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { Recipe } from '@/lib/types';

// Path to recipes JSON file
const recipesFilePath = path.join(process.cwd(), './lib/recipes.json');

// Check if edit interface is enabled
function isEditEnabled() {
  return process.env.EDIT_INTERFACE === '1';
}

// Helper function to read recipes
async function readRecipes(): Promise<Recipe[]> {
  const data = await fs.readFile(recipesFilePath, 'utf8');
  return JSON.parse(data);
}

// Helper function to write recipes
async function writeRecipes(recipes: Recipe[]): Promise<void> {
  // Create backup
  const backupDir = path.join(process.cwd(), './backups');
  await fs.mkdir(backupDir, { recursive: true });
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(backupDir, `recipes-${timestamp}.json`);
  
  await fs.copyFile(recipesFilePath, backupPath);
  
  // Write updated recipes
  await fs.writeFile(
    recipesFilePath, 
    JSON.stringify(recipes, null, 2), 
    'utf8'
  );
}

// Update an existing recipe
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!isEditEnabled()) {
    return NextResponse.json(
      { error: 'Edit interface is not enabled' },
      { status: 403 }
    );
  }
  
  try {
    const id = params.id;
    const updatedRecipe = await request.json();
    
    const recipes = await readRecipes();
    const index = recipes.findIndex(recipe => recipe.id === id);
    
    if (index === -1) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      );
    }
    
    // Preserve the original ID
    updatedRecipe.id = id;
    
    recipes[index] = updatedRecipe;
    await writeRecipes(recipes);
    
    return NextResponse.json(
      { success: true, recipe: updatedRecipe }
    );
  } catch (error) {
    console.error('Error updating recipe:', error);
    return NextResponse.json(
      { error: 'Failed to update recipe' },
      { status: 500 }
    );
  }
}

// Delete a recipe
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!isEditEnabled()) {
    return NextResponse.json(
      { error: 'Edit interface is not enabled' },
      { status: 403 }
    );
  }
  
  try {
    const id = params.id;
    
    const recipes = await readRecipes();
    const newRecipes = recipes.filter(recipe => recipe.id !== id);
    
    if (newRecipes.length === recipes.length) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      );
    }
    
    await writeRecipes(newRecipes);
    
    return NextResponse.json(
      { success: true }
    );
  } catch (error) {
    console.error('Error deleting recipe:', error);
    return NextResponse.json(
      { error: 'Failed to delete recipe' },
      { status: 500 }
    );
  }
}
```

```typescript
// app/api/images/upload/route.ts
import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { normalizeFileName } from '@/utils/string-utils';

export async function POST(request: Request) {
  if (process.env.EDIT_INTERFACE !== '1') {
    return NextResponse.json(
      { error: 'Edit interface is not enabled' },
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
        const optimizedVersions = [];
        
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
```

```typescript
// app/api/images/route.ts
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
```

## 9. Configuration Updates

Update the Next.js configuration in `next.config.ts` to handle the environment variable:

```typescript
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  env: {
    NEXT_PUBLIC_EDIT_INTERFACE: process.env.EDIT_INTERFACE
  },
  images: {
    domains: [], 
    formats: ['image/webp', 'image/avif'],
    remotePatterns: [],
  },
  // Existing configuration
};

export default nextConfig;
```

Update the `.env.example` file:

```
# Recipe image source directory relative to scripts folder
RECIPE_IMAGES_SOURCE_DIR="../../Recipes-and-photos"

# Edit interface feature flag (1 = enabled, 0 = disabled)
EDIT_INTERFACE=1
NEXT_PUBLIC_EDIT_INTERFACE=1

# Image optimization configuration
MAX_IMAGE_WIDTH=1920
MAX_IMAGE_HEIGHT=1080
IMAGE_QUALITY=80
```

## 10. Deployment Considerations

### 10.1 File System Access

When deployed, ensure the application has write access to:
- `/lib/recipes.json`
- `/public/images/` directory
- `/public/resized-images/` directory
- `/backups/` directory

### 10.2 Environment Variables

Set the appropriate environment variables in the deployment environment:
- `EDIT_INTERFACE=1` to enable the edit interface
- `NEXT_PUBLIC_EDIT_INTERFACE=1` for client-side feature detection

### 10.3 Required Dependencies

Ensure these dependencies are installed:

```bash
npm install --save sharp react-dnd react-dnd-html5-backend
```

### 10.4 Build Process

No special build process changes are needed beyond ensuring the environment variables are set correctly.

### 10.5 Security

The edit interface should only be enabled in protected environments or with proper authentication in place. Consider:

1. Restricting access based on user roles
2. Implementing rate limiting for the API endpoints
3. Setting up proper CORS policies for the API routes

## 11. Future Enhancements

### 11.1 Advanced Editor Features

- Recipe template selection for quick starts
- Ingredient quantity scaling functionality
- Recipe duplication for creating variations
- Recipe versioning and change history

### 11.2 Advanced Image Optimization

- AI-driven image cropping for better focal point detection
- Automated generation of social media image variants
- Background removal or style transfer capabilities
- Integration with third-party image CDNs
- Image compression quality controls
- Lazy-loading strategies for improved performance
- AVIF format support for even better compression
- Progressive image loading for improved perceived performance

### 11.3 Content Validation

- Nutritional information calculators
- Cooking time estimator based on ingredients
- Cooking step validation logic
- Ingredient quantity validation

### 11.4 Integration Capabilities

- Recipe import from external URLs
- Structured data export for SEO
- Print layout optimization
- Integration with meal planning features