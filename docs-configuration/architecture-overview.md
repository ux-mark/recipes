# Fairy Bites Recipe Website - Architecture Overview

This document provides a comprehensive overview of the Fairy Bites Recipe Website architecture to help new engineers understand the system design and how different components interact.

## 1. Technology Stack

- **Frontend Framework**: Next.js 15.3.1 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.1.4 with shadcn UI components
- **Component Library**: shadcn built on Radix UI primitives
- **Icons**: Lucide React
- **Fonts**: Google Fonts (Inter for body text, Playfair Display for headings)
- **Analytics**: Vercel Analytics and Speed Insights (production only)
- **Image Processing**: Sharp
- **Module System**: ES Modules (using `"type": "module"` in package.json)

## 2. Project Structure

```
recipe-website/
├── app/                    # Next.js App Router pages and API routes
│   ├── layout.tsx          # Root layout with header and footer
│   ├── page.tsx            # Homepage
│   ├── recipes/            # Recipe browsing and detail pages
│   ├── tags/               # Tag-filtered recipe pages
│   ├── search/             # Search functionality
│   ├── admin/              # Admin/editor interface (protected)
│   └── api/                # Backend API routes
├── components/             # Reusable UI components
│   ├── ui/                 # shadcn UI components
│   └── [component-name].tsx # Custom components
├── lib/                    # Data models and utility functions
│   ├── recipes.ts          # Recipe data access functions
│   ├── recipes.json        # Recipe data store
│   └── types.ts            # TypeScript interfaces
├── public/                 # Static assets
│   ├── images/             # Recipe images
│   └── resized-images/     # Optimized recipe images
├── scripts/                # Utility scripts
├── middleware.ts           # Next.js middleware for routing and auth
└── [config files]          # Configuration files
```

## 3. Core Architecture Components

### 3.1 Data Layer

The application uses a file-based data store with JSON:

- **Data Source**: `lib/recipes.json` - Contains all recipe data
- **Data Model**: Defined in `lib/types.ts`
  ```typescript
  interface Recipe {
    id: string;
    name: string;
    description: string;
    ingredients: string[];
    instructions: string[];
    tags: string[];
    prepTime: string;
    cookTime: string;
    servings: string;
    rating: number;
    createdDate: string;
    source: {
      name: string;
      url: string;
    };
    images: string[];
    aside?: string;
    variations?: string;
    showInHero?: boolean;
  }

  interface RecipeTag {
    name: string;
    count: number;
  }
  ```

- **Data Access Layer**: `lib/recipes.ts` provides server-side functions:
  - `getAllRecipes()`: Retrieves all recipes
  - `getRecipeById(id)`: Gets a single recipe by ID
  - `getRecipesByTag(tag)`: Filters recipes by tag
  - `getAllTags()`: Returns all unique tags with counts
  - `getFeaturedRecipes(count)`: Returns top-rated recipes
  - `getRecipeImageUrl(recipe, index)`: Generates image URLs

### 3.2 Frontend Architecture

The application uses Next.js App Router with a combination of server and client components:

- **Server Components**: Handle data fetching and initial rendering
  - Root layout (`app/layout.tsx`)
  - Page components (`app/page.tsx`, `app/recipes/page.tsx`, etc.)
  
- **Client Components**: Handle interactivity
  - Navigation components (`components/site-header.tsx`)
  - UI components with state management
  - Form components in admin section
  
- **Component Hierarchy**:
  ```
  RootLayout
  ├── SiteHeader (with TagsMenu)
  ├── Page Content (varies by route)
  │   ├── Home Page
  │   │   ├── Hero Section
  │   │   ├── Featured Recipes (RecipeCard components)
  │   │   ├── Categories Section
  │   │   └── CTA Section
  │   ├── Recipes Page
  │   │   └── RecipeCard Grid
  │   └── Recipe Detail Page
  │       ├── Recipe Header
  │       ├── Recipe Content
  │       └── Related Recipes
  └── SiteFooter
  ```

### 3.3 API Layer

The application includes server-side API routes for data manipulation and image processing:

- **Recipe CRUD Operations**:
  - `GET /api/recipes` - Get all recipes
  - `POST /api/recipes` - Create a new recipe
  - `GET /api/recipes/[id]` - Get a specific recipe
  - `PUT /api/recipes/[id]` - Update a recipe
  - `DELETE /api/recipes/[id]` - Delete a recipe

- **Image Management**:
  - `POST /api/images/upload` - Handle recipe image uploads
  - `DELETE /api/images` - Delete images
  - `POST /api/image-resize` - Resize images to different dimensions

- **Status Check**:
  - `GET /api/status` - Check if edit interface is enabled

### 3.4 Middleware

The application uses Next.js middleware (`middleware.ts`) for:

1. **URL Normalization**: Handles tag route normalization for consistent filtering
   - Normalizes Unicode characters and whitespace in tag URLs
   - Ensures consistent URL encoding across environments

2. **Admin Route Protection**:
   - Protects `/admin/*` routes based on the `EDIT_INTERFACE` environment flag
   - Redirects unauthorized users to the home page

## 4. Key Features Implementation

### 4.1 Tag Filtering System

The tag filtering system operates across multiple layers:

1. **Middleware Layer**: Intercepts and normalizes tag URLs before reaching page components
2. **Data Layer**: Normalizes tags when filtering recipes
3. **Component Layer**: Uses consistent tag normalization in UI components

The normalization function handles Unicode variations, whitespace, and special characters:

```typescript
function normalizeTag(tag: string): string {
  // Ensure we're working with a string
  if (typeof tag !== 'string') {
    return String(tag);
  }
  
  // First decode if it appears to be URI encoded
  let processedTag = tag;
  if (tag.includes('%')) {
    try {
      processedTag = decodeURIComponent(tag);
    } catch (e) {
      // Handle decoding errors
    }
  }
  
  // Normalize Unicode to composed form (NFC)
  processedTag = processedTag.normalize('NFC');
  
  // Remove leading/trailing whitespace
  processedTag = processedTag.trim();
  
  // Normalize internal spaces
  processedTag = processedTag.replace(/\s+/g, ' ');
  
  return processedTag;
}
```

### 4.2 Image Processing System

The website includes an image processing system to handle recipe images:

1. **Image Upload**: 
   - Stores original images in `/public/images/{recipe-name}/`
   - Normalizes filenames for consistency
   - Creates nested directories automatically

2. **Image Optimization**:
   - Generates optimized versions in different sizes using Sharp
   - Creates WebP format for better performance
   - Stores optimized images in `/public/resized-images/{recipe-name}/`
   - Standard sizes: 800×600px (detail view), 400×300px (cards), 200×150px (thumbnails)

3. **Image Serving**:
   - Uses Next.js Image component for responsive loading
   - Handles image sizing based on viewport

### 4.3 Admin Interface

The website includes a protected admin interface for content management:

1. **Security**:
   - Protected by the `EDIT_INTERFACE` environment variable
   - Middleware prevents access to `/admin/*` routes when disabled
   - API routes validate permissions before allowing modifications

2. **Recipe Management**:
   - Create, edit, and delete recipes
   - Form-based interface for recipe data
   - Rich image upload and management

3. **Data Integrity**:
   - Creates backups before modifying recipe data (stored in `/backups/`)
   - Validates recipe data before saving
   - Prevents empty/corrupt data writes

## 5. Routing and Navigation

The application uses Next.js App Router for page routing:

- `/` - Homepage with featured recipes
- `/recipes` - All recipes listing
- `/recipes/[id]` - Individual recipe page
- `/tags/[tag]` - Recipes filtered by tag
- `/search` - Recipe search page
- `/admin/recipes` - Recipe management (protected)
- `/admin/recipes/create` - Create new recipe (protected)
- `/admin/recipes/edit/[id]` - Edit existing recipe (protected)

### 5.1 Static and Dynamic Rendering

- **Static Routes**: Most pages use static generation with dynamic data paths
- **Dynamic Routes**: Some routes like tag filtering use dynamic rendering
- **Static Parameters**: Generated via `generateStaticParams` functions

## 6. Styling System

The website uses a tailored styling system:

1. **Tailwind CSS**: For responsive utility-based styling
2. **shadcn UI**: High-quality UI components built on Radix UI
3. **CSS Variables**: Custom variables defined in `app/globals.css`
4. **Color Scheme**: Configured in both Tailwind config and CSS variables
5. **Typography**: Google Fonts with CSS variables
   - Inter for body text (`--font-inter`)
   - Playfair Display for headings (`--font-serif`)

## 7. Environment Configuration

The application can be configured with environment variables:

- `EDIT_INTERFACE`: When set to `1`, enables admin functionality
- `RECIPE_IMAGES_SOURCE_DIR`: Source directory for recipe images
- `VERCEL`: Detected automatically by Vercel platform
- `NODE_ENV`: Standard environment variable (`development` or `production`)

## 8. Deployment Architecture

The application is configured for multiple deployment targets:

### 8.1 Vercel Deployment

- **Configuration**: `next.config.js` with Vercel-specific settings
- **Special Considerations**:
  - Analytics only active in production
  - Image copying skipped in Vercel environments
  - TypeScript build errors ignored in production

### 8.2 DigitalOcean App Platform

- **Configuration**: App Platform settings with containerized Node.js
- **Optimizations**:
  - `output: 'standalone'` for containerization
  - Disabled powered-by header
  - Image optimization with WebP and AVIF formats

### 8.3 Static Site Export

- **Configuration**: `output: 'export'` setting
- **Optimizations**:
  - Unoptimized images for static export
  - CDN-friendly file structure
  - Pre-rendered HTML files

## 9. Performance Considerations

1. **Image Optimizations**:
   - WebP format for modern browsers
   - Responsive image loading with Next.js Image
   - Multiple sizes for different viewports

2. **Caching and CDN**:
   - Optimized for edge caching
   - Vercel's global CDN (when deployed to Vercel)
   - Static assets with appropriate cache headers

3. **Selective Analytics**:
   - Analytics only loaded in production environments
   - No performance impact in development

4. **Component Architecture**:
   - Server components for improved initial load
   - Client components only where interactivity is needed

## 10. Development Workflow

1. **Local Development**:
   ```bash
   npm run dev          # Start development server
   ```

2. **Production Build**:
   ```bash
   npm run build        # Create optimized production build
   npm start            # Run production server
   ```

3. **Vercel Deployment**:
   ```bash
   npm run deploy:vercel  # Deploy to Vercel
   ```

4. **Testing Production Build Locally**:
   ```bash
   VERCEL=1 NODE_ENV=production npm run build
   node .next/standalone/server.js
   ```

## 11. Security Measures

1. **API Protection**:
   - Environment variable-based feature flags
   - Input validation on all API routes
   - Rate limiting framework in place for production

2. **Data Protection**:
   - Backup creation before data modifications
   - Validation to prevent data corruption
   - Error handling for failed operations

3. **Admin Security**:
   - Protected routes via middleware
   - Consistent security checks across API routes
   - Environment variable control of admin features

## 12. Testing Strategy

The application includes testing directories for components and libraries:

- `__tests__/components/` - Component tests
- `__tests__/lib/` - Library function tests
- `__tests__/examples/` - Example test patterns

Jest is configured as the testing framework.

---

This architecture overview provides a solid foundation for new engineers to understand the Fairy Bites recipe website structure and implementation. The application follows modern Next.js patterns with a clear separation of concerns between data access, UI components, and API functionality.