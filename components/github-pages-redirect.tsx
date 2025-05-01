'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This component handles the client-side portion of GitHub Pages SPA navigation
export default function GitHubPagesRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    // @ts-expect-error - This is set by our script in layout.tsx
    const redirectPath = window.__NEXT_REDIRECT_PATH;
    
    if (redirectPath) {
      // Clear the redirect path to prevent infinite redirects
      // @ts-expect-error - Setting property on window object that TypeScript doesn't know about
      window.__NEXT_REDIRECT_PATH = null;
      
      // Navigate to the correct path
      console.log('Redirecting to', redirectPath);
      router.push(redirectPath);
    }
  }, [router]);
  
  // This component doesn't render anything
  return null;
}