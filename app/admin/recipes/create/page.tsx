'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RecipeEditForm } from '@/components/recipe-edit/recipe-edit-form';
import { Recipe } from '@/lib/types';

export default function CreateRecipePage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (recipe: Recipe) => {
    try {
      const response = await fetch('/api/recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(recipe),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create recipe');
      }

      const data = await response.json();
      
      // Redirect to the newly created recipe
      router.push(`/recipes/${data.recipe.id}`);
    } catch (err) {
      console.error('Error saving recipe:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while creating the recipe');
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Create New Recipe</h1>
      
      {error && (
        <div className="p-4 mb-6 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <RecipeEditForm onSave={handleSave} />
    </div>
  );
}