'use client';

import { useState, useEffect } from 'react';
import { Recipe } from '@/lib/types';
import { ImageUploader } from './image-uploader';
import { IngredientsList } from './ingredients-list';
import { InstructionsList } from './instructions-list';
import { TagSelector } from './tag-selector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

interface RecipeEditFormProps {
  initialRecipe?: Recipe;
  onSave: (recipe: Recipe) => Promise<void>;
}

function createEmptyRecipe(): Recipe {
  return {
    id: '',
    name: '',
    description: '',
    ingredients: [''],
    instructions: [''],
    tags: [],
    prepTime: '',
    cookTime: '',
    servings: '',
    rating: 0,
    createdDate: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }),
    source: {
      name: '',
      url: ''
    },
    images: [],
  };
}

function saveToLocalStorage(recipe: Recipe) {
  localStorage.setItem('recipe-draft', JSON.stringify(recipe));
  localStorage.setItem('recipe-draft-timestamp', new Date().toISOString());
}

function getFromLocalStorage(): Recipe | null {
  const savedRecipe = localStorage.getItem('recipe-draft');
  if (!savedRecipe) return null;
  
  try {
    return JSON.parse(savedRecipe) as Recipe;
  } catch (error) {
    console.error('Failed to parse saved recipe:', error);
    return null;
  }
}

export function RecipeEditForm({ initialRecipe, onSave }: RecipeEditFormProps) {
  const [recipe, setRecipe] = useState<Recipe>(initialRecipe || createEmptyRecipe());
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [hasDraft, setHasDraft] = useState(false);
  const [formDebug, setFormDebug] = useState<string | null>(null);
  
  // Check for draft on mount
  useEffect(() => {
    if (!initialRecipe) {
      const draft = getFromLocalStorage();
      const timestamp = localStorage.getItem('recipe-draft-timestamp');
      
      if (draft && timestamp) {
        const saveDate = new Date(timestamp);
        setHasDraft(true);
        setLastSaved(saveDate.toLocaleString());
      }
    }
  }, [initialRecipe]);
  
  // Load draft if user chooses to
  const loadDraft = () => {
    const draft = getFromLocalStorage();
    if (draft) {
      setRecipe(draft);
      setHasDraft(false);
    }
  };
  
  // Autosave functionality
  useEffect(() => {
    const interval = setInterval(() => {
      if (!initialRecipe) {
        saveToLocalStorage(recipe);
        setLastSaved(new Date().toLocaleString());
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [recipe, initialRecipe]);
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!recipe.name.trim()) {
      newErrors.name = 'Recipe name is required';
    }
    
    if (!recipe.ingredients.length || !recipe.ingredients[0].trim()) {
      newErrors.ingredients = 'At least one ingredient is required';
    }
    
    if (!recipe.instructions.length || !recipe.instructions[0].trim()) {
      newErrors.instructions = 'At least one instruction is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormDebug("Form submission started");
    console.log("Form submitted", recipe);
    
    if (!validateForm()) {
      setFormDebug("Form validation failed: " + JSON.stringify(errors));
      return;
    }
    
    setFormDebug("Form validation succeeded, attempting to save");
    setIsSaving(true);
    
    try {
      console.log("Calling onSave with recipe data", recipe);
      setFormDebug("Calling parent component's onSave function");
      await onSave(recipe);
      
      setFormDebug("onSave completed successfully");
      // Clear draft on successful save
      if (!initialRecipe) {
        localStorage.removeItem('recipe-draft');
        localStorage.removeItem('recipe-draft-timestamp');
      }
    } catch (error) {
      console.error('Failed to save recipe:', error);
      setFormDebug(`Error during save: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Debug information */}
      {formDebug && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-md">
          <p className="font-medium">Form Debug:</p>
          <p className="text-sm text-gray-600">{formDebug}</p>
        </div>
      )}
      
      {/* Draft notification */}
      {hasDraft && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-md flex justify-between items-center">
          <div>
            <p className="font-medium">You have an unsaved draft</p>
            <p className="text-sm text-gray-600">Last saved: {lastSaved}</p>
          </div>
          <Button type="button" onClick={loadDraft} variant="secondary">
            Restore Draft
          </Button>
        </div>
      )}
      
      {/* Basic Information */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Basic Information</h2>
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Recipe Name*
              </label>
              <Input
                id="name"
                value={recipe.name}
                onChange={(e) => setRecipe({...recipe, name: e.target.value})}
                className={errors.name ? 'border-red-500' : ''}
                required
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-1">
                Description
              </label>
              <Textarea
                id="description"
                value={recipe.description}
                onChange={(e) => setRecipe({...recipe, description: e.target.value})}
                className="min-h-[100px]"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="prepTime" className="block text-sm font-medium mb-1">
                  Preparation Time
                </label>
                <Input
                  id="prepTime"
                  value={recipe.prepTime}
                  onChange={(e) => setRecipe({...recipe, prepTime: e.target.value})}
                  placeholder="e.g. 30 mins"
                />
              </div>
              
              <div>
                <label htmlFor="cookTime" className="block text-sm font-medium mb-1">
                  Cooking Time
                </label>
                <Input
                  id="cookTime"
                  value={recipe.cookTime}
                  onChange={(e) => setRecipe({...recipe, cookTime: e.target.value})}
                  placeholder="e.g. 1 hour"
                />
              </div>
              
              <div>
                <label htmlFor="servings" className="block text-sm font-medium mb-1">
                  Servings
                </label>
                <Input
                  id="servings"
                  value={recipe.servings}
                  onChange={(e) => setRecipe({...recipe, servings: e.target.value})}
                  placeholder="e.g. 4-6"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="aside" className="block text-sm font-medium mb-1">
                Notes/Tips (Optional)
              </label>
              <Textarea
                id="aside"
                value={recipe.aside || ''}
                onChange={(e) => setRecipe({...recipe, aside: e.target.value})}
                className="min-h-[100px]"
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Ingredients */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Ingredients*</h2>
            <IngredientsList
              ingredients={recipe.ingredients}
              onChange={(ingredients) => setRecipe({...recipe, ingredients})}
              error={errors.ingredients}
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Instructions */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Instructions*</h2>
            <InstructionsList
              instructions={recipe.instructions}
              onChange={(instructions) => setRecipe({...recipe, instructions})}
              error={errors.instructions}
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Images */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Images</h2>
            <ImageUploader
              existingImages={recipe.images}
              recipeName={recipe.name}
              onChange={(images) => setRecipe({...recipe, images})}
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Tags */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Tags</h2>
            <TagSelector
              selectedTags={recipe.tags}
              onChange={(tags) => setRecipe({...recipe, tags})}
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Source */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Source</h2>
            
            <div>
              <label htmlFor="sourceName" className="block text-sm font-medium mb-1">
                Source Name
              </label>
              <Input
                id="sourceName"
                value={recipe.source.name}
                onChange={(e) => setRecipe({
                  ...recipe, 
                  source: { ...recipe.source, name: e.target.value }
                })}
              />
            </div>
            
            <div>
              <label htmlFor="sourceUrl" className="block text-sm font-medium mb-1">
                Source URL
              </label>
              <Input
                id="sourceUrl"
                value={recipe.source.url}
                onChange={(e) => setRecipe({
                  ...recipe, 
                  source: { ...recipe.source, url: e.target.value }
                })}
                type="url"
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Rating */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Rating</h2>
            
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRecipe({...recipe, rating: star})}
                  className="text-2xl focus:outline-none"
                >
                  {star <= recipe.rating ? '★' : '☆'}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Submit Button */}
      <div className="sticky bottom-0 bg-white p-4 border-t flex justify-between items-center">
        <div className="text-sm text-gray-500">
          {lastSaved && <span>Last saved: {lastSaved}</span>}
        </div>
        <Button
          type="submit"
          disabled={isSaving}
          className="px-4 py-2"
          onClick={() => console.log("Save button clicked")}
        >
          {isSaving ? 'Saving...' : 'Save Recipe'}
        </Button>
      </div>
    </form>
  );
}