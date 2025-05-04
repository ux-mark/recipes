import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Comprehensive tag normalization function that handles Unicode variations
 * and special characters consistently
 */
function normalizeTag(tag: string): string {
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    console.error('Error in normalizeTag:', e);
    // Fall back to the original
    return tag;
  }
}

/**
 * Safe encodeURIComponent that handles potential errors
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function safeEncodeURIComponent(tag: string): string {
  try {
    return encodeURIComponent(tag);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    console.error('Error encoding tag:', e);
    // Apply basic encoding on error
    return tag.replace(/\s/g, '%20');
  }
}

export function middleware(request: NextRequest) {
  // Clone the URL to modify it
  const url = request.nextUrl.clone();
  
  // Check if it's a tag route
  if (url.pathname.startsWith('/tags/')) {
    console.log('🔍 Middleware intercepted:', url.pathname);
    
    // Extract the tag portion (everything after /tags/)
    const tagPath = url.pathname.slice(6); // remove '/tags/'
    const decodedTag = decodeURIComponent(tagPath);
    
    console.log('📥 Decoded tag:', decodedTag);
    
    // Normalize the tag
    const normalizedTag = normalizeTag(decodedTag);
    console.log('🔄 Normalized tag:', normalizedTag);
    
    // Only rewrite if normalization changed the tag
    if (normalizedTag !== decodedTag) {
      console.log('✅ Rewriting URL:', `/tags/${encodeURIComponent(normalizedTag)}`);
      
      // Use safe encoding to handle special characters and emoji
      url.pathname = `/tags/${encodeURIComponent(normalizedTag)}`;
      return NextResponse.rewrite(url);
    } else {
      console.log('⏩ No rewrite needed, continuing with:', normalizedTag);
    }
  }
  
  return NextResponse.next();
}

// Apply middleware only to tag routes for performance
export const config = {
  matcher: '/tags/:path*',
};