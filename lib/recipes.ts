// We need to mark this file as server-only
'use server';

import fs from 'fs';
import path from 'path';
import { Recipe, RecipeTag } from './types';

// Path to the recipes JSON file
// TODO: Move this to a config file or environment variable
const recipesFilePath = path.join(process.cwd(), './lib/recipes.json');

/**
 * Helper function to normalize tags consistently throughout the app
 * This handles edge cases like inconsistent spaces before/after emojis
 * and ensures we get consistent tag comparisons regardless of environment
 */
function normalizeTag(tag: string): string {
  // First trim any leading/trailing whitespace
  const trimmed = tag.trim();
  
  // Additional normalization to handle emoji characters and inconsistent spacing
  // This regex handles cases where emoji might have inconsistent spacing
  // For example: "🎄Xmas" vs "🎄 Xmas" will be normalized the same
  return trimmed.replace(/\s+/g, ' ');
}

// Function to get all recipes
export async function getAllRecipes(): Promise<Recipe[]> {
  try {
    const fileContents = fs.readFileSync(recipesFilePath, 'utf8');
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