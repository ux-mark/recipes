'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ComponentsLayout({
  children
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // Components navigation sidebar items
  const componentNavigation = [
    {
      category: 'Form Elements',
      components: [
        { name: 'Button', href: '/design-system/components/button' },
        { name: 'Input', href: '/design-system/components/input' },
      ]
    },
    {
      category: 'Navigation',
      components: [
        { name: 'Header Navigation', href: '/design-system/components/header-navigation' },
      ]
    },
    {
      category: 'Recipe Components',
      components: [
        { name: 'Recipe Card', href: '/design-system/components/recipe-card' },
      ]
    }
  ];

  // Handle hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  // If we're on the components index page, just render children
  if (pathname === '/design-system/components') {
    return <>{children}</>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center mb-8">
        <Link href="/design-system/components" className="text-blue-500 hover:text-blue-700">
          ← Back to Components
        </Link>
      </div>
      
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* Sidebar Navigation */}
        <div className="hidden lg:block">
          <div className="sticky top-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Components</h3>
            <div className="space-y-6">
              {componentNavigation.map((group) => (
                <div key={group.category}>
                  <h4 className="text-sm font-medium text-gray-500">{group.category}</h4>
                  <ul className="mt-2 space-y-2">
                    {group.components.map((component) => {
                      const isActive = pathname === component.href;
                      return (
                        <li key={component.name}>
                          <Link
                            href={component.href}
                            className={`block text-sm py-1 ${
                              isActive
                                ? 'text-blue-600 font-medium'
                                : 'text-gray-700 hover:text-blue-600'
                            }`}
                          >
                            {component.name}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Main content */}
        <div className="lg:col-span-3">
          {children}
        </div>
      </div>
    </div>
  );
}