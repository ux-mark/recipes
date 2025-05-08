import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Normalize a tag string
 */
function normalizeTag(tag: string): string {
  try {
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
        // Silent catch
      }
    }
    
    // Normalize Unicode to composed form (NFC)
    processedTag = processedTag.normalize('NFC');
    
    // Remove any leading/trailing whitespace
    processedTag = processedTag.trim();
    
    // Normalize internal spaces
    processedTag = processedTag.replace(/\s+/g, ' ');
    
    return processedTag;
  } catch (e) {
    // Fall back to the original
    return tag;
  }
}

// Main middleware function with simplified logic to minimize errors
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle design system routes - checking for ENABLE_DESIGN_SYSTEM feature flag
  if (pathname.startsWith('/design-system')) {
    const enableDesignSystem = process.env.ENABLE_DESIGN_SYSTEM === 'true';
    
    if (!enableDesignSystem) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    // In production, could add additional auth requirements
    if (process.env.NODE_ENV === 'production') {
      // Additional authentication logic can be added here
    }
    
    return NextResponse.next();
  }

  // Handle admin routes - checking for EDIT_INTERFACE feature flag
  if (pathname.startsWith('/admin/')) {
    const isEditInterfaceEnabled = process.env.EDIT_INTERFACE === '1';
    
    if (!isEditInterfaceEnabled) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    return NextResponse.next();
  }

  // Handle tag routes with normalization
  if (pathname.startsWith('/tags/')) {
    try {
      const tagPath = pathname.slice(6); // remove '/tags/'
      if (!tagPath) return NextResponse.next();
      
      const decodedTag = decodeURIComponent(tagPath);
      const normalizedTag = normalizeTag(decodedTag);
      
      // Only rewrite if normalization changed the tag
      if (normalizedTag !== decodedTag) {
        const url = new URL(request.url);
        url.pathname = `/tags/${encodeURIComponent(normalizedTag)}`;
        return NextResponse.rewrite(url);
      }
    } catch (error) {
      // If any error occurs in tag handling, continue to the next middleware
      console.error('Error in tag middleware:', error);
    }
  }
  
  return NextResponse.next();
}

// Use a simpler matcher format for better Next.js 15.3.1 compatibility
export const config = {
  matcher: [
    '/admin/:path*', 
    '/tags/:path*',
    '/design-system/:path*'
  ]
};