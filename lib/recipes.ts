// We need to mark this file as server-only
'use server';

import fs from 'fs';
import path from 'path';
import { Recipe, RecipeTag } from './types';

// Path to the recipes JSON file
// TODO: Move this to a config file or environment variable
const recipesFilePath = path.join(process.cwd(), './lib/recipes.json');

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
  return recipes.filter(recipe => recipe.tags.includes(tag));
}

// Function to get all unique tags with counts
export async function getAllTags(): Promise<RecipeTag[]> {
  const recipes = await getAllRecipes();
  const tagCounts: Record<string, number> = {};
  
  // Count occurrences of each tag
  recipes.forEach(recipe => {
    recipe.tags.forEach(tag => {
      if (tagCounts[tag]) {
        tagCounts[tag]++;
      } else {
        tagCounts[tag] = 1;
      }
    });
  });
  
  // Convert to array of RecipeTag objects
  return Object.entries(tagCounts).map(([name, count]) => ({
    name,
    count
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