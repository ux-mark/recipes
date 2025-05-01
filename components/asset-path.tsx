'use client';

import { useMemo } from 'react';
import { env } from '../lib/env';

interface AssetPathProps {
  src: string;
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
}

/**
 * Component that handles proper asset path resolution for GitHub Pages
 * This helps fix the 404 errors for images and other assets
 */
export function AssetImage({ src, alt = '', className = '', width, height }: AssetPathProps) {
  const fixedSrc = useMemo(() => {
    // Don't modify external URLs or data URLs
    if (src.startsWith('http') || src.startsWith('data:')) {
      return src;
    }
    
    // If it's already prefixed with the repo name, don't change it
    if (src.startsWith('/recipes/')) {
      return src;
    }
    
    // For custom domain, don't add recipes prefix
    if (env.isCustomDomain) {
      return src.startsWith('/') ? src : `/${src}`;
    }
    
    // Add the repository name prefix for absolute paths
    if (src.startsWith('/')) {
      return `${env.basePath}${src}`;
    }
    
    // Add the repository name prefix for relative paths
    return `${env.basePath}/${src}`;
  }, [src]);

  return (
    <img 
      src={fixedSrc} 
      alt={alt} 
      className={className} 
      width={width} 
      height={height}
    />
  );
}

/**
 * Helper function to fix asset paths for use in client components only
 */
export function getAssetPath(src: string): string {
  // Don't modify external URLs or data URLs
  if (!src || src.startsWith('http') || src.startsWith('data:')) {
    return src;
  }
  
  // If it's already prefixed with the repo name, don't change it
  if (src.startsWith('/recipes/')) {
    return src;
  }
  
  // For custom domain, don't add recipes prefix
  if (env.isCustomDomain) {
    return src.startsWith('/') ? src : `/${src}`;
  }
  
  // Add the repository name prefix for absolute paths
  if (src.startsWith('/')) {
    return `${env.basePath}${src}`;
  }
  
  // Add the repository name prefix for relative paths
  return `${env.basePath}/${src}`;
}

export default AssetImage;