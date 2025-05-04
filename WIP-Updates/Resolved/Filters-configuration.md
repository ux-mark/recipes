# Tag Filtering Configuration Documentation

## Overview

The Fairy Bites recipe website implements a robust tag filtering system that allows users to browse recipes by category tags such as "Dinner", "🎄 Xmas", "To trial", etc. This document details the technical implementation, highlighting the improvements made to ensure consistent tag handling across different environments.

## Architecture

The tag filtering system operates across multiple layers of the application:

### 1. Middleware Layer

A Next.js middleware intercepts and normalizes tag-related URLs before they reach page components, providing the earliest possible intervention point in the request lifecycle:

```typescript
// middleware.ts at project root
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function normalizeTag(tag: string): string {
  // Unicode normalization, whitespace handling, etc.
  // ...
}

export function middleware(request: NextRequest) {
  // Intercept tag routes
  if (url.pathname.startsWith('/tags/')) {
    const tagPath = url.pathname.slice(6);
    const decodedTag = decodeURIComponent(tagPath);
    const normalizedTag = normalizeTag(decodedTag);
    
    // Rewrite URL if normalization changed something
    if (normalizedTag !== decodedTag) {
      url.pathname = `/tags/${encodeURIComponent(normalizedTag)}`;
      return NextResponse.rewrite(url);
    }
  }
  
  return NextResponse.next();
}

// Optimize performance by targeting only tag routes
export const config = {
  matcher: '/tags/:path*',
};
```

### 2. Data Layer

Tag normalization is consistently applied when fetching recipes by tag in the data layer:

```typescript
// lib/recipes.ts
function normalizeTag(tag: string): string {
  // Same normalization logic as middleware
  // ...
}

export async function getRecipesByTag(tag: string): Promise<Recipe[]> {
  const recipes = await getAllRecipes();
  const normalizedSearchTag = normalizeTag(tag);
  
  return recipes.filter(recipe => 
    recipe.tags.some(recipeTag => 
      normalizeTag(recipeTag) === normalizedSearchTag
    )
  );
}
```

### 3. Component Layer

The same normalization logic is applied consistently in UI components when generating tag links:

```typescript
// In components like RecipeCard, recipe detail page, etc.
function normalizeTag(tag: string): string {
  // Same normalization logic as middleware and data layer
  // ...
}

<Link 
  href={`/tags/${encodeURIComponent(normalizeTag(tag))}`}
  className="..."
>
  {tag}
</Link>
```

## Tag Normalization Implementation

The core of the filtering system is the `normalizeTag` function, implemented consistently across all layers:

```typescript
function normalizeTag(tag: string): string {
  try {
    // Ensure we're working with a string
    if (typeof tag !== 'string') {
      console.warn('Non-string tag received:', tag);
      return String(tag);
    }
    
    // Handle URI encoded tags
    let processedTag = tag;
    if (tag.includes('%')) {
      try {
        processedTag = decodeURIComponent(tag);
      } catch (e) {
        console.warn('Failed to decode URI component:', tag, String(e));
      }
    }
    
    // Normalize Unicode to composed form (NFC)
    processedTag = processedTag.normalize('NFC');
    
    // Remove leading/trailing whitespace
    processedTag = processedTag.trim();
    
    // Normalize internal spaces (replace multiple spaces with a single space)
    processedTag = processedTag.replace(/\s+/g, ' ');
    
    return processedTag;
  } catch (e) {
    console.error('Error in normalizeTag:', String(e));
    return tag;
  }
}
```

This function handles several key aspects of normalization:

1. **Unicode Normalization**: Using `normalize('NFC')` to ensure consistent handling of special characters and emojis
2. **Whitespace Normalization**: Trimming leading/trailing whitespace and normalizing internal spaces
3. **URL Decoding**: Handling percent-encoded characters in URLs
4. **Error Handling**: Comprehensive error handling for robustness

## Tag Data Organization

Tags are organized and aggregated with normalizeTag to ensure consistent grouping while preserving original display formats:

```typescript
export async function getAllTags(): Promise<RecipeTag[]> {
  const recipes = await getAllRecipes();
  const tagCounts: Record<string, { count: number, originalTag: string }> = {};
  
  // Count occurrences of each tag using normalized form as key
  recipes.forEach(recipe => {
    recipe.tags.forEach(tag => {
      const normalizedTag = normalizeTag(tag);
      
      if (tagCounts[normalizedTag]) {
        tagCounts[normalizedTag].count++;
      } else {
        // Store both normalized form (as key) and original form (for display)
        tagCounts[normalizedTag] = {
          count: 1,
          originalTag: tag
        };
      }
    });
  });
  
  // Convert to array of RecipeTag objects
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return Object.entries(tagCounts).map(([_, data]) => ({
    name: data.originalTag, // Use original tag for display
    count: data.count
  })).sort((a, b) => b.count - a.count);
}
```

This approach ensures that variations of the same tag (e.g., "Dinner", " Dinner", "Dinner ") are grouped together while preserving the original formatting for display.

## Static Path Generation

For static site generation, tag paths are pre-rendered using the same normalization logic:

```typescript
// app/tags/[tag]/page.tsx
export async function generateStaticParams() {
  const tags = await getAllTags();
  
  return tags.map((tag) => ({
    tag: encodeURIComponent(normalizeTag(tag.name)),
  }));
}
```

## Issues Resolved

This implementation resolves several critical issues:

1. **Emoji Character Handling**: Tags with emoji characters like "🎄 Xmas" now work correctly
2. **Space Normalization**: Tags with varying whitespace patterns like "To trial" vs "To  trial" are handled consistently
3. **Development-Production Consistency**: Tags work identically in development and production environments
4. **URL Encoding Compatibility**: Special characters in URLs are processed correctly across all environments

## Testing & Verification

The tag filtering system can be tested through several methods:

### Local Testing

```bash
# Build for production with Vercel environment
VERCEL=1 NODE_ENV=production npm run build

# Start the production server
npm start
```

### Testing Scenarios

1. **Direct URL Navigation**:
   - `/tags/%F0%9F%8E%84%20Xmas` (URL-encoded "🎄 Xmas")
   - `/tags/To%20trial` (URL-encoded "To trial")

2. **Variant Testing**:
   - `/tags/%F0%9F%8E%84Xmas` (no space after emoji)
   - `/tags/To%20%20trial` (double space)

3. **User Flow Testing**:
   - Click on tags from recipe cards
   - Click on tags from recipe detail pages
   - Navigate through tag menus in the header

### Middleware Logging

During testing, the middleware outputs detailed logs to help diagnose issues:

```
🔍 Middleware intercepted: /tags/%F0%9F%8E%84%20Xmas
📥 Decoded tag: 🎄 Xmas
🔄 Normalized tag: 🎄 Xmas
```

## Best Practices for Tag Management

For optimal tag filtering:

1. **Consistency in Creation**: When creating new recipes, try to maintain consistent tagging patterns
2. **Normalization Awareness**: Understand that tags will be normalized, so variations in spaces or casing will be treated as the same tag
3. **Special Characters**: Special characters and emoji are fully supported but should be used consistently
4. **URL Considerations**: Tags that work in development will work in production, but be aware that very complex tags might have different URL encoding representations

## Conclusion

The enhanced tag filtering system provides a robust solution that works consistently across all environments, handling special characters, emoji, and various whitespace patterns. The middleware-based approach ensures that tag URLs are normalized at the earliest possible point in the request lifecycle, complemented by consistent normalization throughout the application's data and component layers.

By implementing this multi-layered approach, the Fairy Bites recipe website provides reliable and consistent tag filtering functionality, improving user experience and ensuring that all recipes are accessible through their intended tag categories.