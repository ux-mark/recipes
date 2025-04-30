'use client';

import { useState, useEffect } from 'react';
import RecipeCard from '@/components/recipe-card';
import { Separator } from '@/components/ui/separator';
import { Recipe } from '@/lib/types';

export default function AllRecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecipes() {
      try {
        const response = await fetch('/api/recipes');
        const data = await response.json();
        setRecipes(data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch recipes:', error);
        setLoading(false);
      }
    }

    fetchRecipes();
  }, []);

  if (loading) {
    return (
      <div className="container py-8">
        <header className="mb-8">
          <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">All Recipes</h1>
          <p className="text-neutral-600">Loading recipes...</p>
          <Separator className="mt-4" />
        </header>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <header className="mb-8">
        <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">All Recipes</h1>
        <p className="text-neutral-600">Browse our collection of {recipes.length} delicious recipes.</p>
        <Separator className="mt-4" />
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {recipes.map(recipe => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </div>
  );
}