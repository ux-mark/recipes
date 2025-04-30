'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Search as SearchIcon } from 'lucide-react';
import RecipeCard from '@/components/recipe-card';
import { Recipe } from '@/lib/types';

// Import recipes directly for static site generation
import allRecipes from '@/lib/recipes.json';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  // Initialize with data right away
  const [recipes] = useState<Recipe[]>(allRecipes);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>(allRecipes);

  // Simple useEffect for client-side logic if needed in future
  useEffect(() => {
    // Client-side code can run here if needed
  }, []);

  // Filter recipes based on search query
  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    
    if (!query.trim()) {
      setFilteredRecipes(recipes);
      return;
    }
    
    const lowerQuery = query.toLowerCase();
    
    const results = recipes.filter(recipe => 
      recipe.name.toLowerCase().includes(lowerQuery) ||
      recipe.description.toLowerCase().includes(lowerQuery) ||
      recipe.ingredients.some(i => i.toLowerCase().includes(lowerQuery)) ||
      recipe.instructions.some(i => i.toLowerCase().includes(lowerQuery)) ||
      recipe.tags.some(t => t.toLowerCase().includes(lowerQuery))
    );
    
    setFilteredRecipes(results);
  }

  return (
    <div className="container py-8">
      <header className="mb-8">
        <h1 className="font-serif text-3xl md:text-4xl font-bold mb-4">Search Recipes</h1>
        <form onSubmit={handleSearch} className="flex gap-2 max-w-xl">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-500" />
            <Input
              type="search"
              placeholder="Search by recipe name, ingredients, etc."
              className="pl-9"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Button type="submit">Search</Button>
        </form>
        <Separator className="mt-8" />
      </header>

      <div>
        <h2 className="text-lg font-medium mb-4">
          {filteredRecipes.length} {filteredRecipes.length === 1 ? 'recipe' : 'recipes'} found
          {query && ` for "${query}"`}
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRecipes.map(recipe => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
        
        {filteredRecipes.length === 0 && (
          <div className="text-center py-8">
            <p className="text-neutral-500">No recipes found. Try a different search term.</p>
          </div>
        )}
      </div>
    </div>
  );
}