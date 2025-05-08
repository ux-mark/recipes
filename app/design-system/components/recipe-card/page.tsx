'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// Example recipe data for demonstration
const exampleRecipe = {
  id: 'example-recipe-1',
  title: 'Vegetable Stir Fry',
  description: 'A quick and healthy vegetable stir fry with ginger and garlic sauce.',
  cookTime: 20,
  prepTime: 15,
  difficulty: 'Easy',
  tags: ['vegetarian', 'healthy', 'quick'],
  image: '/images/placeholder-recipe.jpg'
};

export default function RecipeCardPage() {
  const [variant, setVariant] = useState<'default' | 'compact' | 'featured'>('default');

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
      <div className="border-b border-gray-200 pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Recipe Card</h1>
        <p className="mt-2 text-lg text-gray-600">
          Card component used to display recipe preview information across the site.
        </p>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900">Variants</h2>
        <div className="mt-4 flex space-x-4">
          <button
            onClick={() => setVariant('default')}
            className={`px-4 py-2 rounded-md ${
              variant === 'default' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Default
          </button>
          <button
            onClick={() => setVariant('compact')}
            className={`px-4 py-2 rounded-md ${
              variant === 'compact' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Compact
          </button>
          <button
            onClick={() => setVariant('featured')}
            className={`px-4 py-2 rounded-md ${
              variant === 'featured' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Featured
          </button>
        </div>
      </div>

      <div className="mt-8 bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Preview</h2>
        
        <div className="max-w-md mx-auto">
          {variant === 'default' && (
            <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="relative h-48 w-full">
                <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">Recipe Image</span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-medium text-gray-900">{exampleRecipe.title}</h3>
                <p className="mt-1 text-gray-600 text-sm line-clamp-2">{exampleRecipe.description}</p>
                <div className="mt-3 flex items-center text-sm text-gray-500">
                  <span className="mr-3">Prep: {exampleRecipe.prepTime} min</span>
                  <span>Cook: {exampleRecipe.cookTime} min</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-1">
                  {exampleRecipe.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-4 text-sm font-medium text-blue-600">
                  View recipe →
                </div>
              </div>
            </div>
          )}

          {variant === 'compact' && (
            <div className="flex border border-gray-200 rounded-lg overflow-hidden hover:bg-gray-50 transition-colors">
              <div className="relative h-24 w-24 flex-shrink-0">
                <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 text-xs">Image</span>
                </div>
              </div>
              <div className="p-3 flex-1">
                <h3 className="text-md font-medium text-gray-900">{exampleRecipe.title}</h3>
                <p className="mt-1 text-gray-600 text-xs line-clamp-1">{exampleRecipe.description}</p>
                <div className="mt-1 text-xs text-gray-500">
                  {exampleRecipe.prepTime + exampleRecipe.cookTime} min • {exampleRecipe.difficulty}
                </div>
              </div>
            </div>
          )}

          {variant === 'featured' && (
            <div className="border border-gray-200 rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow">
              <div className="relative h-64 w-full">
                <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">Featured Recipe Image</span>
                </div>
                <div className="absolute top-3 left-3 px-3 py-1 bg-blue-500 text-white text-sm font-medium rounded-full">
                  Featured
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-xl font-semibold text-gray-900">{exampleRecipe.title}</h3>
                <p className="mt-2 text-gray-600">{exampleRecipe.description}</p>
                <div className="mt-4 flex items-center text-sm text-gray-500">
                  <span className="mr-4">Prep: {exampleRecipe.prepTime} min</span>
                  <span className="mr-4">Cook: {exampleRecipe.cookTime} min</span>
                  <span>{exampleRecipe.difficulty}</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {exampleRecipe.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
                <button className="mt-5 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                  View recipe
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-xl font-semibold text-gray-900">Component Usage</h2>
        <div className="mt-4 bg-gray-800 text-white p-4 rounded-md overflow-auto">
          <pre className="text-sm">
            {`// Import the RecipeCard component
import RecipeCard from '@/components/RecipeCard';

// Use with default variant
<RecipeCard 
  recipe={recipe} 
  variant="default" 
/>

// Use with compact variant
<RecipeCard 
  recipe={recipe} 
  variant="compact" 
/>

// Use with featured variant
<RecipeCard 
  recipe={recipe} 
  variant="featured" 
/>`}
          </pre>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-xl font-semibold text-gray-900">Props</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300">
            <thead>
              <tr>
                <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Prop</th>
                <th className="py-3.5 px-3 text-left text-sm font-semibold text-gray-900">Type</th>
                <th className="py-3.5 px-3 text-left text-sm font-semibold text-gray-900">Required</th>
                <th className="py-3.5 px-3 text-left text-sm font-semibold text-gray-900">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">recipe</td>
                <td className="whitespace-nowrap py-4 px-3 text-sm text-gray-500">Recipe</td>
                <td className="whitespace-nowrap py-4 px-3 text-sm text-gray-500">Yes</td>
                <td className="py-4 px-3 text-sm text-gray-500">Recipe object with title, description, times, etc.</td>
              </tr>
              <tr>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">variant</td>
                <td className="whitespace-nowrap py-4 px-3 text-sm text-gray-500">"default" | "compact" | "featured"</td>
                <td className="whitespace-nowrap py-4 px-3 text-sm text-gray-500">No</td>
                <td className="py-4 px-3 text-sm text-gray-500">Style variant of the card. Defaults to "default".</td>
              </tr>
              <tr>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">onClick</td>
                <td className="whitespace-nowrap py-4 px-3 text-sm text-gray-500">() => void</td>
                <td className="whitespace-nowrap py-4 px-3 text-sm text-gray-500">No</td>
                <td className="py-4 px-3 text-sm text-gray-500">Optional click handler for the card.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}