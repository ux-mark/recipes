'use client';

import { useMemo, useEffect, useState } from 'react';
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
  // We need to detect client-side if we're on a custom domain
  const [isCustomDomainClient, setIsCustomDomainClient] = useState(env.isCustomDomain);
  
  useEffect(() => {
    // Double-check custom domain status on the client side
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const isGitHubPages = hostname.includes('github.io');
      setIsCustomDomainClient(!isGitHubPages);
    }
  }, []);
  
  const fixedSrc = useMemo(() => {
    // Use either the server-provided value or the client-side detected value
    const effectiveIsCustomDomain = isCustomDomainClient;
    
    // Don't modify external URLs or data URLs
    if (!src || src.startsWith('http') || src.startsWith('data:')) {
      return src;
    }
    
    // If it's already prefixed with the repo name, handle based on domain type
    if (src.startsWith('/recipes/')) {
      // For custom domains, remove the /recipes/ prefix
      if (effectiveIsCustomDomain) {
        return src.replace('/recipes/', '/');
      }
      return src;
    }
    
    // For custom domain, ensure correct path format without /recipes prefix
    if (effectiveIsCustomDomain) {
      return src.startsWith('/') ? src : `/${src}`;
    }
    
    // Add the repository name prefix for absolute paths
    if (src.startsWith('/')) {
      return `${env.basePath}${src}`;
    }
    
    // Add the repository name prefix for relative paths
    return `${env.basePath}/${src}`;
  }, [src, isCustomDomainClient]);

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
  // Detect if we're on a custom domain directly in the browser
  let isCustomDomainClient = env.isCustomDomain;
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isGitHubPages = hostname.includes('github.io');
    isCustomDomainClient = !isGitHubPages;
  }
  
  // Don't modify external URLs or data URLs
  if (!src || src.startsWith('http') || src.startsWith('data:')) {
    return src;
  }
  
  // If it's already prefixed with the repo name, handle based on domain type
  if (src.startsWith('/recipes/')) {
    // For custom domains, remove the /recipes/ prefix
    if (isCustomDomainClient) {
      return src.replace('/recipes/', '/');
    }
    return src;
  }
  
  // For custom domain, ensure correct path format without /recipes prefix
  if (isCustomDomainClient) {
    return src.startsWith('/') ? src : `/${src}`;
  }
  
  // Get basePath from runtime if available, otherwise use env.basePath
  const runtimeBasePath = typeof window !== 'undefined' && 
    (window as any).__NEXT_DATA__ &&
    (window as any).__NEXT_DATA__.basePath;
    
  const effectiveBasePath = runtimeBasePath || env.basePath;
  
  // Add the repository name prefix for absolute paths
  if (src.startsWith('/')) {
    return `${effectiveBasePath}${src}`;
  }
  
  // Add the repository name prefix for relative paths
  return `${effectiveBasePath}/${src}`;
}

export default AssetImage;