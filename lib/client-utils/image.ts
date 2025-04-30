import { Recipe } from '@/lib/types';

// Client-side version of getRecipeImageUrl that doesn't use server-side modules
export function getRecipeImageUrl(recipe: Recipe, index: number = 0): string {
  if (!recipe.images || recipe.images.length === 0) {
    return '/placeholder-recipe.svg'; // Use SVG placeholder for recipes without images
  }
  
  const imagePath = recipe.images[index % recipe.images.length];
  return `/images/${imagePath}`;
}