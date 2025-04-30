'use client';

import { useState, useEffect } from 'react';
import RecipeCard from '@/components/recipe-card';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Recipe } from '@/lib/types';

export default function TagPage({ params }: { params: { tag: string } }) {
  const router = useRouter();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const tag = decodeURIComponent(params.tag);

  useEffect(() => {
    async function fetchRecipes() {
      try {
        const response = await fetch('/api/recipes');
        const allRecipes = await response.json();
        const matchingRecipes = allRecipes.filter((recipe: Recipe) => 
          recipe.tags.includes(tag)
        );
        
        if (matchingRecipes.length === 0) {
          // No recipes found for this tag, redirect back to recipes page
          router.push('/recipes');
        } else {
          setRecipes(matchingRecipes);
        }
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch recipes by tag:', error);
        setLoading(false);
      }
    }

    fetchRecipes();
  }, [tag, router]);

  if (loading) {
    return (
      <div className="container py-8">
        <div className="mb-6">
          <Link 
            href="/recipes" 
            className="text-primary-600 hover:underline inline-flex items-center"
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Back to recipes
          </Link>
        </div>
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container py-8">
      <div className="mb-6">
        <Link 
          href="/recipes" 
          className="text-primary-600 hover:underline inline-flex items-center"
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to recipes
        </Link>
      </div>
      
      <header className="mb-8">
        <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">{tag} Recipes</h1>
        <p className="text-neutral-600">Browse our collection of {recipes.length} {tag.toLowerCase()} recipes.</p>
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