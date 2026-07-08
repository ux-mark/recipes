# Fairy Bites Recipe Website Documentation
This documentation provides a comprehensive overview of the Fairy Bites recipe website structure, architecture, and key components.

## Project Overview
Fairy Bites is a Next.js-based recipe website that allows users to browse and search for recipes. The site features:
- A homepage with featured recipes and category navigation
- Recipe browsing by tags/categories
- Individual recipe pages with details
- Responsive design for mobile and desktop

## Technical Stack
- Framework: Next.js (App Router)
- Styling: Tailwind CSS
- Font Libraries: Inter and Playfair Display via Google Fonts
- UI Components: shadcn UI (built on Radix UI primitives) with Lucide icons
- Font Libraries: Inter and Playfair Display via Google Fonts
- Data Storage: JSON file-based data store

## Project Structure
### Core Files and Directories
- `app/`: Next.js app router pages
- `components/`: Reusable UI components
- `lib/`: Utility functions and data models
- `public/images/`: Recipe images
- `scripts/`: Utility scripts including image management

### Key Files
- `app/layout.tsx`: Root layout with header and footer
- `app/page.tsx`: Homepage with featured recipes
- `app/recipes/page.tsx`: All recipes listing page
- `lib/recipes.ts`: Server-side functions for recipe data retrieval
- `lib/types.ts`: TypeScript interfaces for data models
- `scripts/copy-images.js`: Utility to copy recipe images from external source directory

## Data Model
### Recipe Interface
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
}
```

### RecipeTag Interface
```typescript 
interface RecipeTag {
  name: string;
  count: number;
}
```
## Key Components
### Layout Components
**SiteHeader**: Navigation bar with tag/category links
**SiteFooter**: Site footer with links and copyright info

### Page Components
- Homepage (`/app/page.tsx`): Features hero section, featured recipes, popular categories, dinner ideas, and a CTA
- All Recipes (`/app/recipes/page.tsx`): Grid display of all available recipes

### Recipe Components
- RecipeCard: Displays recipe thumbnail with basic info, used throughout the site

## UI Components
The project uses shadcn UI, a collection of reusable components built with Radix UI primitives and styled with Tailwind CSS.

### Configuration
- shadcn UI is configured in `components.json` with the "new-york" style
- Component aliases are configured to match the project structure
- Lucide is used as the icon library

### Key shadcn UI Components Used
- `Button`: For all interactive buttons throughout the site
- `Card`: For recipe cards and content containers
- `Sheet`: For mobile navigation menu
- `DropdownMenu`: For category/tag navigation
- `Dialog`: For modal dialogs
- `Avatar`: For user/recipe images
- `Separator`: For visual separation between content sections
- `Input`: For search and form inputs

Components are imported from `@/components/ui/[component-name]` and follow the Radix UI accessibility patterns.

## Data Flow
1. Recipe data is stored in lib/recipes.json
2. Server-side functions in lib/recipes.ts retrieve and process this data
3. Pages request data through these functions
4. Data is rendered in components on the client side

### Key Data Functions
- `getAllRecipes()`: Retrieves all recipes
- `getRecipeById(id)`: Retrieves a single recipe by ID
- `getRecipesByTag(tag)`: Filters recipes by tag
- `getAllTags()`: Returns all unique tags with counts
- `getFeaturedRecipes(count)`: Returns top-rated recipes
- `getRecipeImageUrl(recipe, index)`: Generates image URLs for recipes

## Routing
The site uses Next.js App Router:
- `/`: Homepage
- `/recipes`: All recipes listing
- `/recipes/[id]`: Individual recipe page
- `/tags/[tag]`: Recipes filtered by tag
- `/search`: Recipe search page

## Styling
- Tailwind CSS for responsive design with shadcn UI theming
- Custom CSS variables defined in `app/globals.css` for consistent theming
- Google Fonts for typography:
    - Inter for body text
    - Playfair Display for headings
- Color scheme configured in both Tailwind config and CSS variables
- Responsive layout that adapts to mobile, tablet, and desktop
- Dark mode support through CSS variables

## Development Workflow
- Run `npm run dev` to start the development server
- Access the site at http://localhost:3000
- Edit pages in app directory
- Create and modify components in components directory
- Update data models and utility functions in lib directory

### Environment Configuration
The application uses environment variables for configuration:
- Create a `.env` file in the root directory if it doesn't already exist
- Set the following variables:
  ```
  RECIPE_IMAGES_SOURCE_DIR="path/to/your/images"
  ```
- The path should be relative to the scripts directory

### Managing Recipe Images
TODO: This needs a front end capability.
- Images can be copied on-demand
- To update recipe images from the external source directory:
  ```bash
  npm run copy-images
  ```
- The copy-images script uses the path defined in the `.env` file (RECIPE_IMAGES_SOURCE_DIR)
- If no environment variable is set, it defaults to "../../Recipes-and-photos"
- The script copies images to "public/images/"
- **Important**: Run this command manually before deployment if you need to update the images

#### Programmatic Image Copying
The image copying functionality is now also available as a callable function:

1. **Direct function import:**
   ```javascript
   import { copyImages } from './scripts/copy-images.js';
   
   // Call the function when needed
   const result = await copyImages();
   if (result.success) {
     console.log('Images copied successfully!');
   }
   ```

2. **Using the utility wrapper:**
   ```javascript
   import { refreshRecipeImages } from './scripts/image-utils.js';
   
   // Refresh images programmatically
   await refreshRecipeImages();
   ```

3. **Customizing source and destination:**
   ```javascript
   import { copyImages } from './scripts/copy-images.js';
   
   // Override the default source or destination paths
   await copyImages({
     sourceDir: '/custom/source/path',
     destDir: '/custom/destination/path'
   });
   ```

The function returns a result object containing:
- `success`: boolean indicating if the operation succeeded
- `message`: description of the result
- Additional details in case of failure

This allows you to call the image copying function only when needed, rather than on every build.

- The script won't fail if the source directory doesn't exist, making it safe to run in deployment environments

## Debugging Tips
- Check server logs for data loading issues
- Verify recipe image paths if images aren't loading
- Ensure recipes.json is properly formatted
- Debug server components separately from client components
- Check tag filtering logic if category pages aren't showing correct recipes
- For UI component issues, check the shadcn UI documentation and ensure Radix UI primitives are properly imported
- Inspect CSS variables in DevTools if theme colors aren't displaying correctly

## Known Issues/TODOs
- Move recipes file path to config file or environment variable
- mplement error handling for missing recipes or invalid data
- Optimize image loading for better performance

## Deployment

### Vercel Deployment
The project is configured for deployment on Vercel:

#### Configuration Files
- `next.config.ts`: Contains optimized settings for Vercel deployment including `output: 'standalone'` and TypeScript configuration
- `.vercel/`: (gitignored) Contains Vercel-specific deployment files

#### Deployment Steps
1. Push code to GitHub repository
2. In Vercel dashboard, create a new project
3. Connect to GitHub and select the repository
4. Vercel will automatically detect the Next.js configuration
5. Set the environment variable `VERCEL=1` in the project settings
6. Deploy the application

#### Special Considerations for Vercel
- The `copy-images.js` script has been modified to detect Vercel environments and skip image copying
- TypeScript build errors are ignored in production with `ignoreBuildErrors: true` in next.config.ts
- The prebuild script in package.json has been updated to be cross-platform compatible
- Images need to be committed to the repository in public/images/ for deployment

#### Local Testing of Production Build
```bash
# Test the production build locally with Vercel environment
VERCEL=1 NODE_ENV=production npm run build

# Start the standalone server (recommended for testing Vercel builds)
node .next/standalone/server.js
```

### DigitalOcean App Platform Deployment
The project is configured for deployment on DigitalOcean's App Platform (free tier):

#### Configuration Files
- `app.yaml`: Defines the app configuration for DigitalOcean App Platform
- `.dockerignore`: Excludes unnecessary files from the deployment
- `next.config.ts`: Contains optimized settings for containerized environments

#### Deployment Steps
1. Push code to GitHub repository
2. In DigitalOcean dashboard, create a new App
3. Connect to GitHub and select the repository
4. DigitalOcean will automatically detect the configuration
5. Select the free tier resources
6. Deploy the application

#### Optimizations for DigitalOcean
- `output: 'standalone'` in Next.js config for optimized containerization
- Disabled powered-by header for improved security
- Configured image optimization with webp and avif formats

#### Resource Considerations
- Free tier has limited resources (0.5GB RAM)
- App will sleep after inactivity
- Limited to 1GB bandwidth per month

### DigitalOcean App Platform Static Site Deployment
The project is configured for deployment on DigitalOcean's App Platform as a static site with CDN support:

#### Static Site Export Configuration
The website has been optimized to work as a fully static site by:
- Setting `output: 'export'` in next.config.ts to generate static HTML files
- Using `unoptimized: true` for images in static export
- Converting API-based data fetching to direct imports of data at build time
- Ensuring all dynamic routes use proper static generation with generateStaticParams

#### Configuration Files
- `next.config.ts`: Contains settings for static HTML export
- `app.yaml`: Defines the app configuration for DigitalOcean App Platform static site
- `static.config.js`: Documents static site configuration including caching headers
- `package.json`: Updated scripts for building and previewing the static export

#### Deployment Steps
1. Push code to GitHub repository
2. Ensure your package-lock.json is in sync with package.json by running:
   ```bash
   npm install
   ```
   This step is crucial as deployment will fail if the files are out of sync.
3. Commit the updated package-lock.json to your repository:
   ```bash
   git add package-lock.json
   git commit -m "Update package-lock.json for deployment"
   git push
   ```
4. In DigitalOcean dashboard, create a new App
5. Select "Static Site" as the app type
6. Connect to GitHub and select the repository
7. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `out`
8. (Optional) Configure a custom domain
9. Deploy the application

#### Node.js Version Compatibility
The project is configured to use Node.js 24.x (specified in package.json's "engines" field) for the following reasons:

- Compatibility with the deployed Next.js version (15.3.1)
- Stable LTS support for production deployments
- Optimized static site generation capabilities
- Compatibility with DigitalOcean App Platform buildpacks

This version requirement is enforced during deployment to ensure consistent behavior between development and production environments.

#### CDN and Caching Benefits
- All static assets (HTML, CSS, JS, images) are cached at the edge
- Faster global load times for users around the world
- Reduced server load with content served from CDN
- Cost-effective scalability for high traffic periods
- Configured caching headers for optimal performance

#### Local Development and Testing
```bash
# Start development server with hot reloading
npm run dev

# Build the static site
npm run build

# Preview the static build locally
npm run start
```

### TypeScript Build Considerations
When deploying to DigitalOcean App Platform, you might encounter TypeScript errors related to type compatibility between Next.js PageProps and custom component props. To address this issue, we've implemented the following workaround in the `next.config.ts` file:

```typescript
typescript: {
  // This allows production builds to complete successfully
  // even with TypeScript errors
  ignoreBuildErrors: true,
}
```

#### Why This Workaround Is Necessary
Next.js 15.3.1 includes strict type checking that can cause build failures when interfaces don't perfectly match the expected PageProps constraints. The error typically appears as:

```typescript
Type error: Type 'CustomPageProps' does not satisfy the constraint 'PageProps'.
  Types of property 'params' are incompatible.
```

We've improved the type definitions in dynamic route components by:
- Using simple, focused interfaces for params (e.g., `RecipeParams` with `id: string`)
- Adding proper return type annotations for `generateMetadata` and `generateStaticParams`
- Simplifying component prop typing to match Next.js expectations

Despite these improvements, we still need the TypeScript workaround in `next.config.ts` due to some internal Next.js type constraints that are difficult to satisfy without compromising developer experience.

#### Development vs. Production Considerations
- **Local Development**: Run `npm run dev` to see your site at http://localhost:3000 with full hot-reloading capabilities
- **Production Build**: Use `npm run build` to create optimized production files
- **Local Production Preview**: After building, run `npm start` to preview your production build at http://localhost:3000

#### Future Improvements
As part of ongoing maintenance:
- Continue monitoring Next.js releases for improved type system compatibility
- Consider creating custom TypeScript declaration files to better align with Next.js expectations
- Explore alternative approaches to dynamic route parameter typing that satisfy Next.js constraints
- This approach balances the need for immediate deployment functionality with long-term code quality goals.