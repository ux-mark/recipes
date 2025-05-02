# Troubleshooting Guide: Fixing 404 Errors for Special Tags on Vercel

## Purpose and Problem Statement

This document provides a comprehensive strategy for resolving 404 errors occurring specifically on Vercel deployments when accessing tag pages with special characters (emojis) and spaces, such as "🎄 Xmas" and "To trial". While these tags function correctly in local development environments, they fail in production on Vercel.

The solutions are presented in priority order, from most likely to resolve the issue to more complex alternatives. Each approach is designed to address potential routing, encoding, or configuration discrepancies between development and production environments.

## Priority-Ordered Solution Approaches

### 1. Next.js Middleware for URL Normalization

**Priority: Highest**

Middleware offers the earliest intervention point in the request lifecycle, making it ideal for normalizing URLs before page components process them.

#### Implementation Steps:
1. Create a middleware.ts file in your project root:

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Clone the URL to modify it
  const url = request.nextUrl.clone();
  
  // Check if it's a tag route
  if (url.pathname.startsWith('/tags/')) {
    // Log for debugging
    console.log('Original URL path:', url.pathname);
    
    // Extract the tag portion (everything after /tags/)
    const tagPath = url.pathname.replace('/tags/', '');
    const decodedTag = decodeURIComponent(tagPath);
    
    // Log decoded tag
    console.log('Decoded tag:', decodedTag);
    
    // You can normalize or rewrite the URL here if needed
    // Example: If you need to handle specific edge cases:
    // const normalizedTag = decodedTag.trim().replace(/\s+/g, ' ');
    // url.pathname = `/tags/${encodeURIComponent(normalizedTag)}`;
    // return NextResponse.rewrite(url);
  }
  
  return NextResponse.next();
}

// Apply middleware only to tag routes for performance
export const config = {
  matcher: '/tags/:path*',
};
```

2. Deploy this to Vercel and check logs to see what's happening with your URLs

3. If needed, uncomment the rewrite section to actively correct problematic URLs

**Key Benefits:**
- Intercepts requests before they reach page components
- Provides visibility into exactly how URLs are being processed
- Can actively rewrite problematic URLs

### 2. Custom Catch-All Route Configuration

**Priority: High**

This approach uses Next.js's catch-all route feature to handle more complex tag paths.

#### Implementation Steps:
1. Rename your existing tag page:
   - App Router: `/app/tags/[tag]/page.tsx` → `/app/tags/[[...tag]]/page.tsx`
   - Pages Router: `/pages/tags/[tag].tsx` → `/pages/tags/[[...tag]].tsx`

2. Update the component to handle the potentially array-based parameter:

```typescript
// For App Router
export default async function TagPage({ params }) {
  // Handle both single tag and array of segments
  const tagParts = Array.isArray(params.tag) ? params.tag : [params.tag];
  const fullTag = decodeURIComponent(tagParts.join('/'));
  
  console.log('Tag parts:', tagParts);
  console.log('Full tag after joining:', fullTag);
  
  // Use your existing getRecipesByTag function with the full tag
  const recipes = await getRecipesByTag(fullTag);
  
  // Rest of your component remains the same
  return (
    // Your existing JSX
  );
}

// If using static generation
export async function generateStaticParams() {
  const allTags = await getAllTags();
  return allTags.map(tag => ({
    // Catch-all routes expect arrays, but for single-segment routes we use single-item arrays
    tag: [encodeURIComponent(tag.name)]
  }));
}
```

**Key Benefits:**
- More flexible handling of URL segments
- Can handle tags with additional characters that might be interpreted as path separators
- Potentially bypasses path normalization issues in Vercel

### 3. Diagnostic API Endpoint

**Priority: Medium-High**

This approach creates a dedicated API endpoint to diagnose tag processing issues.

#### Implementation Steps:
1. Create a new API endpoint:

```typescript
// App Router: app/api/debug-tag/route.ts
export async function GET(request) {
  const url = new URL(request.url);
  const tag = url.searchParams.get('tag');
  
  if (!tag) {
    return Response.json({
      error: 'No tag provided',
      usage: 'Add a tag parameter: /api/debug-tag?tag=yourTagHere'
    });
  }
  
  // Process the tag the same way your tag page would
  const decodedTag = decodeURIComponent(tag);
  
  // Try to find recipes with this tag
  try {
    const recipes = await getRecipesByTag(decodedTag);
    
    // Return comprehensive diagnostic information
    return Response.json({
      requestInfo: {
        originalTagParam: tag,
        decodedTag: decodedTag,
        encodedForComparison: encodeURIComponent(decodedTag),
      },
      results: {
        recipesFound: recipes.length,
        recipesList: recipes.map(r => ({ 
          title: r.title, 
          tags: r.tags
        })),
      },
      tagAnalysis: {
        length: decodedTag.length,
        containsEmoji: /\p{Emoji}/u.test(decodedTag),
        containsSpaces: /\s/.test(decodedTag),
        hexEncoded: Array.from(decodedTag).map(char => ({
          char,
          hex: char.codePointAt(0).toString(16)
        }))
      }
    });
  } catch (error) {
    return Response.json({
      error: 'Error processing tag',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
```

2. Access this endpoint with your problematic tags:
   - `/api/debug-tag?tag=%F0%9F%8E%84%20Xmas`
   - `/api/debug-tag?tag=To%20trial`

3. Analyze the results to identify where the processing diverges from expected behavior

**Key Benefits:**
- Provides detailed insight into how tags are processed
- Isolates tag handling from page rendering
- Helps identify processing differences between environments

### 4. Next.js Configuration Adjustments

**Priority: Medium**

Changes to next.config.js can affect how URLs are processed.

#### Implementation Steps:
1. Update your next.config.js:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Try toggling this setting
  trailingSlash: true,
  
  // Add custom rewrites for tag pages
  async rewrites() {
    return [
      {
        // Handle tag URLs with explicit rewrites
        source: '/tags/:tag*',
        destination: '/tags/[tag]',
      },
    ];
  },
  
  // Add this to see more verbose build output
  onDemandEntries: {
    // Keep pages in memory for longer during development
    maxInactiveAge: 25 * 1000,
    // Track more pages in development
    pagesBufferLength: 5,
  },
};

module.exports = nextConfig;
```

2. Deploy with this configuration and test the problematic tag URLs

**Key Benefits:**
- Can fix routing inconsistencies between environments
- Provides more control over URL handling
- Simple to implement and test

### 5. Unicode Normalization for Special Characters

**Priority: Medium**

This approach focuses on handling Unicode and special character encoding discrepancies.

#### Implementation Steps:
1. Create a robust tag normalization utility:

```typescript
// utils/tagNormalization.ts

/**
 * Comprehensive tag normalization function that handles Unicode variations
 * and special characters consistently
 */
export function normalizeTag(tag: string): string {
  try {
    // Ensure we're working with a string
    if (typeof tag !== 'string') {
      console.warn('Non-string tag received:', tag);
      return String(tag);
    }
    
    // First decode if it appears to be URI encoded
    let processedTag = tag;
    if (tag.includes('%')) {
      try {
        processedTag = decodeURIComponent(tag);
      } catch (e) {
        console.warn('Failed to decode URI component:', tag);
      }
    }
    
    // Normalize Unicode to composed form (NFC)
    // This addresses differences in how characters may be encoded
    processedTag = processedTag.normalize('NFC');
    
    // Remove any leading/trailing whitespace
    processedTag = processedTag.trim();
    
    // Normalize internal spaces (replace multiple spaces with a single space)
    processedTag = processedTag.replace(/\s+/g, ' ');
    
    return processedTag;
  } catch (e) {
    console.error('Error in normalizeTag:', e);
    // Fall back to the original
    return tag;
  }
}

/**
 * Safe encodeURIComponent that handles potential errors
 */
export function safeEncodeURIComponent(tag: string): string {
  try {
    return encodeURIComponent(tag);
  } catch (e) {
    console.error('Error encoding tag:', e);
    // Apply basic encoding on error
    return tag.replace(/\s/g, '%20');
  }
}
```

2. Use this utility in all tag-related code:
   - When creating tag links
   - When comparing tags
   - When processing tag parameters

**Key Benefits:**
- Addresses potential Unicode normalization issues
- Provides consistent character encoding/decoding
- Handles edge cases with special characters

### 6. Server-Side Logging and Debugging

**Priority: Medium**

Enhanced logging helps identify the exact point of failure.

#### Implementation Steps:
1. Add detailed logging to your tag page:

```typescript
// app/tags/[tag]/page.tsx
export default async function TagPage({ params }: TagPageProps) {
  console.log('--- TAG PAGE DEBUG INFO ---');
  console.log('Raw params received:', JSON.stringify(params));
  
  const rawTag = params.tag;
  console.log('Raw tag:', rawTag, 'Type:', typeof rawTag);
  
  const decodedTag = decodeURIComponent(rawTag);
  console.log('Decoded tag:', decodedTag);
  
  // Add timing logs to see performance
  console.time('getRecipesByTag');
  const recipes = await getRecipesByTag(decodedTag);
  console.timeEnd('getRecipesByTag');
  
  console.log('Found recipes count:', recipes.length);
  console.log('Recipe titles:', recipes.map(r => r.title));
  console.log('--- END TAG PAGE DEBUG INFO ---');
  
  // Rest of your component
}
```

2. Check Vercel logs after deployment

3. If needed, create a staging environment with DEBUG=* environment variable set

**Key Benefits:**
- Provides visibility into the exact request flow
- Helps identify where the tag processing differs from expected
- Minimal implementation effort

### 7. Static Generation with Explicit Paths

**Priority: Medium-Low**

Prebuilding all tag pages can bypass dynamic route issues.

#### Implementation Steps:
1. Update your tag page with explicit static generation:

```typescript
// app/tags/[tag]/page.tsx
export async function generateStaticParams() {
  const allTags = await getAllTags();
  
  console.log('Generating static paths for tags:', 
    allTags.map(t => t.name).join(', '));
  
  return allTags.map((tag) => {
    const encodedTag = encodeURIComponent(tag.name);
    console.log(`Tag: "${tag.name}" → Encoded: "${encodedTag}"`);
    
    return {
      tag: encodedTag,
    };
  });
}

// Mark the page as statically generated
export const dynamic = 'force-static';
```

2. Ensure your build process can access all tags

**Key Benefits:**
- Prebuilds pages for all known tags
- Avoids dynamic routing issues
- Can provide better performance

### 8. Direct Server-Side URL Access with getServerSideProps

**Priority: Low (Pages Router only)**

This approach bypasses Next.js's parameter parsing.

#### Implementation Steps:
1. If using Pages Router, modify your tag page:

```typescript
// pages/tags/[tag].tsx
export async function getServerSideProps(context) {
  // Access the raw request object
  const { req } = context;
  
  // Get the raw URL path
  const fullPath = req.url;
  console.log('Full request URL:', fullPath);
  
  // Extract tag directly from URL to avoid Next.js parameter parsing
  const tagFromUrl = fullPath.split('/tags/')[1]?.split('?')[0];
  console.log('Tag extracted from URL:', tagFromUrl);
  
  if (!tagFromUrl) {
    return {
      notFound: true
    };
  }
  
  const decodedTag = decodeURIComponent(tagFromUrl);
  console.log('Decoded tag:', decodedTag);
  
  // Fetch recipes with the tag
  const recipes = await getRecipesByTag(decodedTag);
  
  return {
    props: {
      rawTag: tagFromUrl,
      tag: decodedTag,
      recipes,
    },
  };
}
```

**Key Benefits:**
- Bypasses Next.js parameter parsing
- Gives direct access to the raw URL
- Provides more control over tag extraction

## Execution Strategy

1. **Start with Diagnostics**: Before implementing solutions, deploy the Diagnostic API Endpoint (#3) to understand exactly how tags are being processed on Vercel.

2. **Implement Core Solutions**: Based on diagnostic results, implement either the Middleware (#1) or Catch-All Route (#2) approach.

3. **Add Robust Tag Handling**: Regardless of which solution is chosen, implement the Unicode Normalization (#5) to ensure consistent character handling.

4. **Monitor and Refine**: Deploy with enhanced logging (#6), analyze results, and refine the approach as needed.

5. **Consider Architecture Changes**: If issues persist, evaluate moving to Static Generation (#7) or direct URL access (#8).

## Conclusion

The approaches in this guide address different aspects of the tag routing and processing issue. By following the priority-ordered solutions, you should be able to resolve the 404 errors for special tags on Vercel deployments.

Start with the middleware approach as it provides both diagnostic information and a potential fix with minimal changes to your codebase. The diagnostic API will help pinpoint exactly where the processing differs between your local environment and Vercel.

Remember that the issue might be a combination of factors, so you may need to implement multiple solutions together for complete resolution.