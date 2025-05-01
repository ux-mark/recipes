'use client';

import { useEffect, useState } from 'react';
import { env } from '@/lib/env';

/**
 * A debug component that helps diagnose path issues
 * Only appears in development mode
 */
export default function PathDebug() {
  const [info, setInfo] = useState({
    hostname: '',
    pathname: '',
    isCustomDomain: env.isCustomDomain,
    basePath: env.basePath,
    currentBuild: ''
  });
  
  useEffect(() => {
    // Only run in the client
    if (typeof window === 'undefined') return;
    
    setInfo({
      hostname: window.location.hostname,
      pathname: window.location.pathname,
      isCustomDomain: env.isCustomDomain,
      basePath: env.basePath,
      currentBuild: process.env.NODE_ENV
    });
  }, []);
  
  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-3 rounded shadow-lg text-xs z-50">
      <h4 className="font-bold mb-1">Path Debug</h4>
      <ul className="m-0 p-0 pl-4">
        <li>Hostname: {info.hostname}</li>
        <li>Path: {info.pathname}</li>
        <li>Custom Domain: {String(info.isCustomDomain)}</li>
        <li>Base Path: &quot;{info.basePath}&quot;</li>
        <li>Build: {info.currentBuild}</li>
      </ul>
    </div>
  );
}