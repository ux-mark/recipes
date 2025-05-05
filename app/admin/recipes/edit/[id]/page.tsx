'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { RecipeEditForm } from '@/components/recipe-edit/recipe-edit-form';
import { Recipe } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

export default function EditRecipePage({ params }: { params: { id: string } | Promise<{ id: string }> }) {
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [saveDebugInfo, setSaveDebugInfo] = useState<string | null>(null);
  
  // Unwrap params using React.use()
  const resolvedParams = params instanceof Promise ? use(params) : params;
  const recipeId = resolvedParams.id;

  // Fetch the recipe data
  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const response = await fetch(`/api/recipes`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch recipes');
        }
        
        const recipes = await response.json();
        const foundRecipe = recipes.find((r: Recipe) => r.id === recipeId);
        
        if (!foundRecipe) {
          throw new Error(`Recipe with ID ${recipeId} not found`);
        }
        
        setRecipe(foundRecipe);
      } catch (err) {
        console.error('Error fetching recipe:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while loading the recipe');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecipe();
  }, [recipeId]);

  // Handle recipe update with improved error handling and debugging
  const handleSave = async (updatedRecipe: Recipe) => {
    console.log("Save button clicked - Starting save process");
    setError(null);
    setSaveDebugInfo(null);
    let debugInfo = `Attempting to save recipe with ID: ${recipeId}\n`;
    
    try {
      debugInfo += `Sending PUT request to: /api/recipes/${recipeId}\n`;
      setSaveDebugInfo(debugInfo);
      
      const response = await fetch(`/api/recipes/${recipeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedRecipe),
      });
      
      debugInfo += `Received response with status: ${response.status}\n`;
      setSaveDebugInfo(debugInfo);
      
      // Get the response text first (works even if not JSON)
      const responseText = await response.text();
      debugInfo += `Response body: ${responseText}\n`;
      setSaveDebugInfo(debugInfo);
      
      let responseData;
      try {
        // Try to parse as JSON if possible
        responseData = JSON.parse(responseText);
        debugInfo += `Parsed response data: ${JSON.stringify(responseData)}\n`;
      } catch {
        debugInfo += `Not a JSON response\n`;
      }

      if (!response.ok) {
        throw new Error(
          responseData?.error || 
          `Failed to update recipe (Status ${response.status})`
        );
      }

      debugInfo += `Save successful, redirecting to recipe page\n`;
      setSaveDebugInfo(debugInfo);
      
      // Redirect to the recipe view
      router.push(`/recipes/${recipeId}`);
      
      // Ensure all routes are refreshed
      router.refresh();
    } catch (err) {
      console.error('Error updating recipe:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while updating the recipe');
      debugInfo += `Error: ${err instanceof Error ? err.message : String(err)}\n`;
      setSaveDebugInfo(debugInfo);
    }
  };
  
  // Handle recipe deletion
  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/recipes/${recipeId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete recipe');
      }

      // Close the dialog
      setDeleteDialogOpen(false);
      
      // Redirect to the recipes list
      router.push('/recipes');
      
      // Ensure all routes are refreshed
      router.refresh();
    } catch (err) {
      console.error('Error deleting recipe:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while deleting the recipe');
      setDeleteDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="container mx-auto py-8">
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {error || 'Recipe not found'}
        </div>
        <Button 
          onClick={() => router.push('/recipes')}
          className="mt-4"
        >
          Back to Recipes
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Edit Recipe</h1>
        <Button 
          variant="destructive" 
          onClick={() => setDeleteDialogOpen(true)}
        >
          Delete Recipe
        </Button>
      </div>
      
      {error && (
        <div className="p-4 mb-6 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {saveDebugInfo && (
        <div className="p-4 mb-6 bg-blue-50 border border-blue-200 text-blue-700 rounded-md">
          <h3 className="font-bold mb-2">Debug Information:</h3>
          <pre className="whitespace-pre-wrap text-sm">{saveDebugInfo}</pre>
        </div>
      )}
      
      <RecipeEditForm 
        initialRecipe={recipe} 
        onSave={handleSave} 
      />
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Recipe</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the recipe &quot;{recipe.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}