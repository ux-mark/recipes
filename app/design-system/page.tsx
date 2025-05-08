'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function DesignSystemPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Prevents hydration issues
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
      <header>
        <div className="border-b border-gray-200 pb-6">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">Recipe Website Design System</h1>
          <p className="mt-2 text-lg text-gray-600">
            A comprehensive catalog of UI components, styles, and design patterns used across the recipe website.
          </p>
        </div>
      </header>

      <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        <SectionCard 
          title="Components" 
          description="Browse all UI components used across the site."
          href="/design-system/components"
        />
        <SectionCard 
          title="Styles" 
          description="Typography, colors, spacing, and other style tokens."
          href="/design-system/styles"
        />
        <SectionCard 
          title="Tokens" 
          description="Design tokens that define our visual language."
          href="/design-system/tokens"
        />
      </div>
    </div>
  );
}

function SectionCard({ title, description, href }: { title: string; description: string; href: string }) {
  return (
    <Link 
      href={href}
      className="block p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-50 transition-colors"
    >
      <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
      <p className="mt-2 text-gray-600">{description}</p>
      <div className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-500">
        View details →
      </div>
    </Link>
  );
}