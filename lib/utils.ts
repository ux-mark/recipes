import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { env } from "./env"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Enhanced utility to determine if we're on a custom domain
 * Works on both client-side and server-side
 */
export function isCustomDomainEnvironment(): boolean {
  // Server-side check (build time)
  if (typeof process !== 'undefined' && process.env.USE_CUSTOM_DOMAIN === 'true') {
    return true;
  }
  
  // Client-side check (runtime)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    return !(
      hostname === 'localhost' || 
      hostname === '127.0.0.1' || 
      hostname.includes('.github.io') || 
      hostname.includes('.githubusercontent.com')
    );
  }
  
  // Fallback to env util detection
  return env.isCustomDomain;
}

/**
 * Get the correct path for assets (images, etc.) considering the base path
 * This works correctly across GitHub Pages and custom domains
 */
export function getAssetPath(path: string): string {
  // Don't modify URLs that are already absolute or data URLs
  if (!path || path.startsWith('http') || path.startsWith('data:')) {
    return path;
  }
  
  // Runtime check for custom domain, which is more reliable than build-time check
  const effectiveIsCustomDomain = isCustomDomainEnvironment();
  
  // If path already includes the base path when it's not empty, return as is
  if (env.basePath && path.startsWith(env.basePath) && !effectiveIsCustomDomain) {
    return path;
  }
  
  // Special handling for recipe paths
  if (path.startsWith('/recipes/') && effectiveIsCustomDomain) {
    // For custom domains, strip the /recipes/ prefix
    return path.replace('/recipes/', '/');
  }
  
  // Get effective base path - might be different at runtime vs build time on custom domains
  const effectiveBasePath = effectiveIsCustomDomain ? '' : env.basePath;

  // Handle paths with or without leading slash
  if (path.startsWith('/')) {
    return `${effectiveBasePath}${path}`;
  } else {
    return `${effectiveBasePath}/${path}`;
  }
}

/**
 * Fix a URL that might have duplicate or incorrect base paths
 * Particularly useful for handling redirects between GitHub Pages and custom domains
 */
export function fixPathConsistency(path: string): string {
  if (!path) return path;
  
  const isCustomDomain = isCustomDomainEnvironment();
  
  // For custom domains, remove any /recipes/ prefix
  if (isCustomDomain) {
    // Handle different possible formats
    if (path.startsWith('/recipes/')) {
      return path.replace(/^\/recipes\//, '/');
    }
    
    // Handle cases where there might be multiple /recipes/ instances
    if (path.includes('/recipes/')) {
      return path.replace(/\/recipes\//g, '/');
    }
  } 
  // For GitHub Pages (not custom domain)
  else {
    // Make sure /recipes prefix exists for GitHub Pages
    if (!path.startsWith('/recipes') && path.startsWith('/')) {
      return `/recipes${path}`;
    }
  }
  
  return path;
}
