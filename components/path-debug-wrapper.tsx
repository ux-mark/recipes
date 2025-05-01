'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the PathDebug component with SSR disabled
const PathDebug = dynamic(() => import('./path-debug'), { 
  ssr: false 
});

/**
 * Client component wrapper for PathDebug
 * This handles the dynamic import with ssr: false properly
 */
export default function PathDebugWrapper() {
  const [isClient, setIsClient] = useState(false);
  
  // Only render the debug component on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Don't render anything in production
  if (process.env.NODE_ENV === 'production') {
    return null;
  }
  
  // Only show on client-side
  if (!isClient) {
    return null;
  }
  
  return <PathDebug />;
}