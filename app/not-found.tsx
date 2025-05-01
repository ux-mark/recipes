'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  // Handle client-side routing for GitHub Pages
  useEffect(() => {
    // Get the current path excluding the basePath if we're on GitHub Pages
    const path = window.location.pathname.replace('/recipe-website', '');
    
    // If this is a direct navigation to a page that should exist in our app
    // but GitHub Pages 404'd because it doesn't understand SPA routing
    if (
      path.startsWith('/recipes/') || 
      path.startsWith('/tags/') || 
      path === '/search'
    ) {
      // Redirect to home with a note to use navigation
      console.log('Detected SPA route:', path);
    }
  }, []);

  return (
    <div className="container flex flex-col items-center justify-center py-20 text-center">
      <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6">Page Not Found</h1>
      <p className="text-lg text-neutral-600 mb-8 max-w-lg">
        Sorry, we couldn&apos;t find the page you were looking for. It might have been moved or deleted.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button asChild size="lg">
          <Link href="/">Go Home</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/recipes">Browse Recipes</Link>
        </Button>
      </div>
    </div>
  );
}