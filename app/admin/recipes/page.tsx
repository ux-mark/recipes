'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Recipe } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

export default function RecipeAdminPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await fetch('/api/recipes');
        
        if (!response.ok) {
          throw new Error('Failed to fetch recipes');
        }
        
        const data = await response.json();
        setRecipes(data);
      } catch (err) {
        console.error('Error fetching recipes:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while loading recipes');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecipes();
  }, []);

  // Filter recipes based on search term
  const filteredRecipes = recipes.filter(recipe => 
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">Recipe Management</h1>
        <Link href="/admin/recipes/create">
          <Button>Create New Recipe</Button>
        </Link>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <label htmlFor="search" className="text-sm font-medium block">
              Search Recipes
            </label>
            <Input
              id="search"
              type="text"
              placeholder="Search by recipe name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {loading && (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md mb-6">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">
            {filteredRecipes.length} {filteredRecipes.length === 1 ? 'Recipe' : 'Recipes'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRecipes.map((recipe) => (
              <Card key={recipe.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <h3 className="font-medium truncate">{recipe.name}</h3>
                    
                    <div className="flex flex-wrap gap-1">
                      {recipe.tags && recipe.tags.slice(0, 3).map((tag) => (
                        <span 
                          key={tag} 
                          className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                      {recipe.tags && recipe.tags.length > 3 && (
                        <span className="text-gray-500 text-xs">
                          +{recipe.tags.length - 3} more
                        </span>
                      )}
                    </div>
                    
                    <div className="pt-2 flex justify-between">
                      <Link href={`/recipes/${recipe.id}`}>
                        <Button variant="outline" size="sm">View</Button>
                      </Link>
                      <Link href={`/admin/recipes/edit/${recipe.id}`}>
                        <Button size="sm">Edit</Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {filteredRecipes.length === 0 && (
            <div className="text-center p-8 bg-gray-50 rounded-md">
              <p className="text-gray-500">No recipes found matching your search.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}