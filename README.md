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

### Key Files
- `app/layout.tsx`: Root layout with header and footer
- `app/page.tsx`: Homepage with featured recipes
- `app/recipes/page.tsx`: All recipes listing page
- `lib/recipes.ts`: Server-side functions for recipe data retrieval
- `lib/types.ts`: TypeScript interfaces for data models

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
`/`: Homepage
`/recipes`: All recipes listing
`/recipes/[id]`: Individual recipe page
`/tags/[tag]`: Recipes filtered by tag
`/search`: Recipe search page

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
- Run npm run dev to start the development server
- Access the site at http://localhost:3000
Edit pages in app directory
Create and modify components in components directory
Update data models and utility functions in lib directory

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
The site can be deployed on Vercel or any platform supporting Next.js applications:
- Set up environment variables if needed
- Build the project with `npm run build`
- Deploy the output to your hosting provider

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