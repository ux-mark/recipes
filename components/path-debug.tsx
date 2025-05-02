'use client';

import { useState, useEffect } from 'react';
import { env } from '@/lib/env';

interface PathInfo {
  hostname: string;
  pathname: string;
  isCustomDomain: boolean;
  basePath: string;
  currentBuild: string;
  nextData: {
    basePath: string;
    buildId: string;
    assetPrefix: string;
  };
  cssLoaded: boolean[];
  jsLoaded: boolean[];
}

/**
 * Path debugging component that shows key information
 * about the current environment and path configuration
 */
export default function PathDebug() {
  const [info, setInfo] = useState<PathInfo>({
    hostname: '',
    pathname: '',
    isCustomDomain: env.isCustomDomain,
    basePath: env.basePath,
    currentBuild: '',
    nextData: {
      basePath: '',
      buildId: '',
      assetPrefix: '',
    },
    cssLoaded: [],
    jsLoaded: []
  });

  useEffect(() => {
    // Only run this client-side
    if (typeof window !== 'undefined') {
      // Get hostname and path
      const hostname = window.location.hostname;
      const pathname = window.location.pathname;
      
      // Detect if we're on a custom domain from the client side
      const isGitHubPages = hostname.includes('github.io') || hostname.includes('.githubusercontent.com');
      const isCustomDomain = !isGitHubPages && hostname !== 'localhost' && hostname !== '127.0.0.1';
      
      // Extract build info from Next.js data
      let nextData = {
        basePath: '',
        buildId: '',
        assetPrefix: '',
      };
      
      // Access Next.js runtime configuration if available
      if ((window as any).__NEXT_DATA__) {
        const data = (window as any).__NEXT_DATA__;
        nextData = {
          basePath: data.basePath || '',
          buildId: data.buildId || '',
          assetPrefix: data.assetPrefix || '',
        };
      }
      
      // Check if CSS and JS are loaded properly
      const cssStatus: boolean[] = [];
      const jsStatus: boolean[] = [];
      
      // Check for CSS stylesheets
      const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
      stylesheets.forEach((link, index) => {
        const href = link.getAttribute('href');
        if (href) {
          // Create a test request to check if the CSS file is accessible
          fetch(href, { method: 'HEAD' })
            .then(response => {
              cssStatus[index] = response.ok;
              setInfo(prev => ({
                ...prev,
                cssLoaded: [...cssStatus]
              }));
            })
            .catch(() => {
              cssStatus[index] = false;
              setInfo(prev => ({
                ...prev,
                cssLoaded: [...cssStatus]
              }));
            });
        }
      });
      
      // Check for JS scripts
      const scripts = document.querySelectorAll('script[src]');
      scripts.forEach((script, index) => {
        const src = script.getAttribute('src');
        if (src && src.includes('_next')) {
          // Create a test request to check if the JS file is accessible
          fetch(src, { method: 'HEAD' })
            .then(response => {
              jsStatus[index] = response.ok;
              setInfo(prev => ({
                ...prev,
                jsLoaded: [...jsStatus]
              }));
            })
            .catch(() => {
              jsStatus[index] = false;
              setInfo(prev => ({
                ...prev,
                jsLoaded: [...jsStatus]
              }));
            });
        }
      });
      
      // Get the current build mode
      let currentBuild = 'Development';
      if (env.isProduction) {
        if (isCustomDomain) {
          currentBuild = 'Production (Custom Domain)';
        } else {
          currentBuild = 'Production (GitHub Pages)';
        }
      }
      
      // Update state with all the information
      setInfo({
        hostname,
        pathname,
        isCustomDomain,
        basePath: env.basePath,
        currentBuild,
        nextData,
        cssLoaded: cssStatus,
        jsLoaded: jsStatus
      });
    }
  }, []);
  
  // In production, don't render this component at all
  if (env.isProduction) {
    return null;
  }
  
  // Count loaded vs total resources
  const cssLoadedCount = info.cssLoaded.filter(Boolean).length;
  const cssTotal = info.cssLoaded.length;
  const jsLoadedCount = info.jsLoaded.filter(Boolean).length;
  const jsTotal = info.jsLoaded.length;
  
  // Format path for display, adding quotes so spaces are visible
  const displayPath = (path: string) => path === '' ? `&quot;&quot;` : `&quot;${path}&quot;`;
  
  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-3 rounded shadow-lg text-xs z-50 max-w-xs">
      <h4 className="font-bold mb-1 border-b border-gray-500 pb-1">Path Debug</h4>
      <ul className="m-0 p-0 pl-4 space-y-1">
        <li>Hostname: {info.hostname}</li>
        <li>Path: {info.pathname}</li>
        <li>Custom Domain: {String(info.isCustomDomain)}</li>
        <li>Base Path: {displayPath(info.basePath)}</li>
        <li>Build: {info.currentBuild}</li>
      </ul>
      
      <div className="mt-2 pt-1 border-t border-gray-500">
        <h5 className="font-bold text-xs mb-1">Next.js Config</h5>
        <ul className="m-0 p-0 pl-4 space-y-1">
          <li>basePath: {displayPath(info.nextData.basePath)}</li>
          <li>assetPrefix: {displayPath(info.nextData.assetPrefix)}</li>
          <li>buildId: {info.nextData.buildId.slice(0, 8)}...</li>
        </ul>
      </div>
      
      <div className="mt-2 pt-1 border-t border-gray-500">
        <h5 className="font-bold text-xs mb-1">Asset Status</h5>
        <ul className="m-0 p-0 pl-4">
          <li className={cssLoadedCount === cssTotal ? 'text-green-400' : 'text-red-400'}>
            CSS: {cssLoadedCount}/{cssTotal} loaded
          </li>
          <li className={jsLoadedCount === jsTotal ? 'text-green-400' : 'text-red-400'}>
            JS: {jsLoadedCount}/{jsTotal} loaded
          </li>
        </ul>
      </div>
    </div>
  );
}