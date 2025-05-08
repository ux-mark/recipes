'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Suspense } from 'react';

export default function DesignSystemLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const pathname = usePathname();
  
  const navigation = [
    { name: 'Overview', href: '/design-system' },
    { name: 'Components', href: '/design-system/components' },
    { name: 'Styles', href: '/design-system/styles' },
    { name: 'Tokens', href: '/design-system/tokens' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="text-xl font-bold text-gray-900">
                  Recipe Website
                </Link>
                <span className="ml-2 text-sm py-0.5 px-2 bg-blue-100 text-blue-800 rounded-md">
                  Design System
                </span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navigation.map((item) => {
                  const isActive = 
                    item.href === '/design-system' 
                      ? pathname === '/design-system'
                      : pathname.startsWith(item.href);
                  
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                        isActive
                          ? 'border-blue-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      }`}
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </nav>
      
      <main>
        <Suspense fallback={<div className="flex justify-center items-center h-64">Loading...</div>}>
          {children}
        </Suspense>
      </main>
    </div>
  );
}