'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface CustomWindow extends Window {
  __NEXT_REDIRECT_PATH?: string;
  __NEXT_DATA__?: {
    basePath?: string;
    assetPrefix?: string;
    buildId?: string;
  };
}

/**
 * Component that handles SPA-style redirects for GitHub Pages
 * This is needed because GitHub Pages doesn't support server-side routing
 */
export function GitHubPagesRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    // Skip if not client-side
    if (typeof window === 'undefined') return;
    
    const win = window as CustomWindow;
    
    // Check if we have a path to redirect to from the 404.html page
    if (win.__NEXT_REDIRECT_PATH) {
      const path = win.__NEXT_REDIRECT_PATH;
      
      // Clear the redirect path to prevent future redirects
      delete win.__NEXT_REDIRECT_PATH;
      
      // Get hostname to detect custom domain
      const hostname = window.location.hostname;
      const isGitHubPages = hostname.includes('github.io') || hostname.includes('.githubusercontent.com');
      
      // Get effective basePath (empty for custom domains)
      const config = win.__NEXT_DATA__ || {};
      const basePath = config.basePath || (isGitHubPages ? '/recipes' : '');
      
      // Handle path differently based on domain type
      let processedPath = path;
      
      // Remove repo prefix from path if needed
      if (processedPath.startsWith('/recipes/') && !isGitHubPages) {
        processedPath = processedPath.replace(/^\/recipes/, '');
      }
      
      console.log(`[GitHubPagesRedirect] Redirecting to: ${processedPath}`);
      router.push(processedPath);
    }
  }, [router]);
  
  return null;
}

export default GitHubPagesRedirect;