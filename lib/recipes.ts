// We need to mark this file as server-only
'use server';

import { readFileSync } from 'fs';
import { join } from 'path';
import { Recipe, RecipeTag } from './types';

// Path to the recipes JSON file
// TODO: Move this to a config file or environment variable
const recipesFilePath = join(process.cwd(), './lib/recipes.json');

/**
 * Comprehensive tag normalization function that handles Unicode variations
 * and special characters consistently
 */
function normalizeTag(tag: string): string {
  try {
    // Ensure we're working with a string
    if (typeof tag !== 'string') {
      console.warn('Non-string tag received:', tag);
      return String(tag);
    }
    
    // First decode if it appears to be URI encoded
    let processedTag = tag;
    if (tag.includes('%')) {
      try {
        processedTag = decodeURIComponent(tag);
      } catch (e) {
        // Use the error in a log statement so it's not unused
        console.warn('Failed to decode URI component:', tag, String(e));
      }
    }
    
    // Normalize Unicode to composed form (NFC)
    // This addresses differences in how characters may be encoded
    processedTag = processedTag.normalize('NFC');
    
    // Remove any leading/trailing whitespace
    processedTag = processedTag.trim();
    
    // Normalize internal spaces (replace multiple spaces with a single space)
    processedTag = processedTag.replace(/\s+/g, ' ');
    
    return processedTag;
  } catch (e) {
    // Use the error in a log statement so it's not unused
    console.error('Error in normalizeTag:', String(e));
    // Fall back to the original
    return tag;
  }
}

// Function to get all recipes
export async function getAllRecipes(): Promise<Recipe[]> {
  try {
    const fileContents = readFileSync(recipesFilePath, 'utf8');
    const recipes: Recipe[] = JSON.parse(fileContents);
    return recipes;
  } catch (error) {
    console.error('Error loading recipe data:', error);
    return [];
  }
}

// Function to get a single recipe by ID
export async function getRecipeById(id: string): Promise<Recipe | undefined> {
  const recipes = await getAllRecipes();
  return recipes.find(recipe => recipe.id === id);
}

// Function to get recipes by tag
export async function getRecipesByTag(tag: string): Promise<Recipe[]> {
  const recipes = await getAllRecipes();
  const normalizedSearchTag = normalizeTag(tag);
  
  return recipes.filter(recipe => 
    recipe.tags.some(recipeTag => 
      // Use the shared normalization function for consistent comparison
      normalizeTag(recipeTag) === normalizedSearchTag
    )
  );
}

// Function to get all unique tags with counts
export async function getAllTags(): Promise<RecipeTag[]> {
  const recipes = await getAllRecipes();
  const tagCounts: Record<string, { count: number, originalTag: string }> = {};
  
  // Count occurrences of each tag
  recipes.forEach(recipe => {
    recipe.tags.forEach(tag => {
      const normalizedTag = normalizeTag(tag);
      
      if (tagCounts[normalizedTag]) {
        tagCounts[normalizedTag].count++;
      } else {
        // Store both normalized form (as key) and original form
        tagCounts[normalizedTag] = {
          count: 1,
          originalTag: tag // Keep the original tag for display
        };
      }
    });
  });
  
  // Convert to array of RecipeTag objects
  // Using eslint-disable for the underscore to indicate intentionally unused variable
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return Object.entries(tagCounts).map(([_, data]) => ({
    name: data.originalTag, // Use the original tag for display
    count: data.count
  })).sort((a, b) => b.count - a.count);
}

// Function to get featured recipes (highest rated)
export async function getFeaturedRecipes(count: number = 4): Promise<Recipe[]> {
  const recipes = await getAllRecipes();
  return [...recipes]
    .filter(recipe => recipe.rating > 0) // Only include recipes with positive ratings
    .sort((a, b) => b.rating - a.rating)
    .slice(0, count);
}

// Function to get the image URL for a recipe
export async function getRecipeImageUrl(recipe: Recipe, index: number = 0): Promise<string> {
  if (!recipe.images || recipe.images.length === 0) {
    return '/placeholder-recipe.svg'; // Use SVG placeholder for recipes without images
  }
  
  const imagePath = recipe.images[index % recipe.images.length];
  return `/images/${imagePath}`;
}