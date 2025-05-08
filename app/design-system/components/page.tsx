'use client';

import { useState } from 'react';
import Link from 'next/link';

type ComponentCategory = {
  name: string;
  description: string;
  components: {
    name: string;
    description: string;
    href: string;
  }[];
};

export default function ComponentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  
  // These will be dynamically populated as components are added to the design system
  const componentCategories: ComponentCategory[] = [
    {
      name: 'Recipe Components',
      description: 'Components related to displaying and interacting with recipes',
      components: [
        {
          name: 'Recipe Card',
          description: 'Card component to display recipe preview information',
          href: '/design-system/components/recipe-card'
        }
      ]
    },
    {
      name: 'Navigation',
      description: 'Components used for site navigation',
      components: [
        {
          name: 'Header Navigation',
          description: 'Main site navigation component',
          href: '/design-system/components/header-navigation'
        }
      ]
    },
    {
      name: 'Form Elements',
      description: 'Components used in forms and user input',
      components: [
        {
          name: 'Button',
          description: 'Standard button component with various styles',
          href: '/design-system/components/button'
        },
        {
          name: 'Input',
          description: 'Text input components',
          href: '/design-system/components/input'
        }
      ]
    }
  ];

  // Filter components based on search query
  const filteredCategories = searchQuery 
    ? componentCategories.map(category => ({
        ...category,
        components: category.components.filter(component => 
          component.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          component.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(category => category.components.length > 0)
    : componentCategories;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
      <header>
        <div className="border-b border-gray-200 pb-6">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Components</h1>
          <p className="mt-2 text-lg text-gray-600">
            Browse all UI components used across the recipe website.
          </p>
          
          {/* Search input */}
          <div className="mt-6">
            <div className="relative rounded-md shadow-sm">
              <input
                type="text"
                placeholder="Search components..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full rounded-md border-gray-300 pl-3 pr-12 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="mt-10 space-y-12">
        {filteredCategories.map((category) => (
          <div key={category.name}>
            <h2 className="text-2xl font-semibold text-gray-900">{category.name}</h2>
            <p className="mt-1 text-gray-600">{category.description}</p>
            
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {category.components.map((component) => (
                <Link
                  key={component.name}
                  href={component.href}
                  className="block p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-50 transition-colors"
                >
                  <h3 className="text-lg font-semibold text-gray-900">{component.name}</h3>
                  <p className="mt-2 text-gray-600">{component.description}</p>
                  <div className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-500">
                    View component →
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
        
        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No components found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}