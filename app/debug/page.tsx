'use client';

import { useEffect, useState } from 'react';
import { isCustomDomainEnvironment } from '@/lib/utils';
import { env } from '@/lib/env';

interface AssetStatus {
  path: string;
  status: 'success' | 'error' | 'pending';
  statusCode?: number;
}

/**
 * A debug page that helps diagnose path-related issues on GitHub Pages
 * Especially useful for custom domain troubleshooting
 */
export default function DebugPage() {
  const [environment, setEnvironment] = useState({
    isCustomDomain: false,
    hostname: '',
    basePath: '',
    buildTime: '',
  });
  
  const [assetStatuses, setAssetStatuses] = useState<AssetStatus[]>([]);
  
  useEffect(() => {
    // Only run in the browser
    if (typeof window === 'undefined') return;
    
    const hostname = window.location.hostname;
    const isCustomDomain = isCustomDomainEnvironment();
    const buildTimestamp = (window as any).__NEXT_DATA__?.buildId || 'unknown';
    
    setEnvironment({
      isCustomDomain,
      hostname,
      basePath: (window as any).__NEXT_DATA__?.basePath || env.basePath || '',
      buildTime: buildTimestamp,
    });
    
    // Test critical asset paths
    const pathsToCheck = [
      '/_next/static/css/app/layout.css',
      '/_next/static/chunks/app-client.js',
      '/_next/static/chunks/webpack.js',
      '/images/placeholder-recipe.svg',
    ];
    
    // Test with and without /recipes prefix for completeness
    if (isCustomDomain) {
      pathsToCheck.push('/recipes/_next/static/css/app/layout.css');
    }
    
    const initialStatuses = pathsToCheck.map(path => ({
      path,
      status: 'pending' as const,
    }));
    
    setAssetStatuses(initialStatuses);
    
    // Check each path
    Promise.all(
      pathsToCheck.map(path => 
        fetch(path, { method: 'HEAD' })
          .then(response => ({
            path,
            status: response.ok ? 'success' as const : 'error' as const,
            statusCode: response.status,
          }))
          .catch(() => ({
            path,
            status: 'error' as const,
            statusCode: 0,
          }))
      )
    ).then(results => {
      setAssetStatuses(results);
    });
    
    // Also check stylesheet links from the document
    const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
    const stylesheetPaths = Array.from(stylesheets).map(link => link.getAttribute('href')).filter(Boolean) as string[];
    
    Promise.all(
      stylesheetPaths.map(path => 
        fetch(path, { method: 'HEAD' })
          .then(response => ({
            path: path as string,
            status: response.ok ? 'success' as const : 'error' as const,
            statusCode: response.status,
          }))
          .catch(() => ({
            path: path as string,
            status: 'error' as const,
            statusCode: 0,
          }))
      )
    ).then(results => {
      setAssetStatuses(prev => [...prev, ...results]);
    });
    
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">GitHub Pages Path Debugging</h1>
      
      <div className="bg-gray-100 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-bold mb-4">Environment Information</h2>
        <ul className="space-y-2">
          <li><strong>Hostname:</strong> {environment.hostname}</li>
          <li><strong>Custom Domain:</strong> {environment.isCustomDomain ? 'Yes' : 'No'}</li>
          <li><strong>Base Path:</strong> "{environment.basePath}"</li>
          <li><strong>Build ID:</strong> {environment.buildTime}</li>
          <li><strong>User Agent:</strong> {typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown'}</li>
        </ul>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Asset Status Checks</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Path</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {assetStatuses.map((asset, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{asset.path}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {asset.status === 'pending' && <span className="text-yellow-500">Checking...</span>}
                    {asset.status === 'success' && <span className="text-green-500">Success</span>}
                    {asset.status === 'error' && <span className="text-red-500">Failed</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {asset.status !== 'pending' && (
                      asset.statusCode === 0 ? 'Network Error' : asset.statusCode
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="bg-gray-100 p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Runtime Configuration</h2>
        <pre className="bg-gray-800 text-green-300 p-4 rounded overflow-x-auto text-sm">
          {JSON.stringify(typeof window !== 'undefined' ? (window as any).__NEXT_DATA__ || {} : {}, null, 2)}
        </pre>
      </div>
    </div>
  );
}