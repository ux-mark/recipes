'use client';

import { getAssetPath } from '@/components/asset-path';

/**
 * Returns the URL for a recipe image with proper path handling
 * for both GitHub Pages and custom domains
 */
export function getRecipeImageUrl(recipePath: string, imageName: string): string {
  // Detect if we're on a custom domain directly in the browser
  let isCustomDomain = false;
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    isCustomDomain = !hostname.includes('github.io') && !hostname.includes('localhost');
  }

  // Form the image path
  const imagePath = `/images/${recipePath}/${imageName}`;
  
  // If we're on a custom domain and the path starts with /recipes/,
  // remove the /recipes/ prefix
  if (isCustomDomain && imagePath.startsWith('/recipes/')) {
    return imagePath.replace('/recipes/', '/');
  }
  
  // Use the asset path helper to ensure proper path handling
  return getAssetPath(imagePath);
}