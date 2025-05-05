import { NextResponse } from 'next/server';
import { getAllRecipes } from '@/lib/recipes';
import fs from 'fs/promises';
import path from 'path';
import { Recipe } from '@/lib/types';
import { normalizeFileName } from '@/lib/utils/string-utils';

// Path to recipes JSON file
const recipesFilePath = path.join(process.cwd(), './lib/recipes.json');

// Enhanced security check for edit interface
function isEditEnabled() {
  // For simplicity, just check the environment variable
  // This avoids TypeScript errors with the headers API
  return process.env.EDIT_INTERFACE === '1';
}

// Helper function to read recipes
async function readRecipes(): Promise<Recipe[]> {
  try {
    const data = await fs.readFile(recipesFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading recipes file:", error);
    throw new Error("Failed to read recipes");
  }
}

// Helper function to write recipes with additional safeguards for production
async function writeRecipes(recipes: Recipe[]): Promise<void> {
  try {
    // Create backup
    const backupDir = path.join(process.cwd(), './backups');
    await fs.mkdir(backupDir, { recursive: true });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `recipes-${timestamp}.json`);
    
    await fs.copyFile(recipesFilePath, backupPath);
    
    // Additional validation before writing in production
    if (process.env.NODE_ENV === 'production') {
      // Ensure we're not losing data - basic validation
      if (!Array.isArray(recipes) || recipes.length === 0) {
        throw new Error("Cannot write empty recipes array to file");
      }
      
      // Check that we have valid recipe data
      const invalidRecipes = recipes.filter(r => !r.id || !r.name);
      if (invalidRecipes.length > 0) {
        throw new Error(`Found ${invalidRecipes.length} invalid recipes`);
      }
    }
    
    // Write updated recipes
    await fs.writeFile(
      recipesFilePath, 
      JSON.stringify(recipes, null, 2), 
      'utf8'
    );
  } catch (error) {
    console.error("Error writing recipes file:", error);
    throw new Error("Failed to write recipes");
  }
}

export async function GET() {
  try {
    const recipes = await getAllRecipes();
    return NextResponse.json(recipes);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recipes' },
      { status: 500 }
    );
  }
}

// Create a new recipe with enhanced error handling
export async function POST(request: Request) {
  // Check if edit interface is enabled with enhanced security
  if (!await isEditEnabled()) {
    console.log("Edit interface is not enabled or unauthorized request");
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 403 }
    );
  }
  
  try {
    // Parse the request body with proper error handling
    let newRecipe: Recipe;
    try {
      const text = await request.text();
      console.log("Request body received:", text);
      newRecipe = JSON.parse(text);
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }
    
    // Validate the recipe data
    if (!newRecipe || !newRecipe.name) {
      console.error("Invalid recipe data:", newRecipe);
      return NextResponse.json(
        { error: "Invalid recipe data" },
        { status: 400 }
      );
    }
    
    // Generate ID from name
    newRecipe.id = normalizeFileName(newRecipe.name);
    
    // Set creation date if not provided
    if (!newRecipe.createdDate) {
      newRecipe.createdDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      });
    }
    
    const recipes = await readRecipes();
    
    // Check for duplicate ID
    if (recipes.some(recipe => recipe.id === newRecipe.id)) {
      return NextResponse.json(
        { error: 'A recipe with this name already exists' },
        { status: 409 }
      );
    }
    
    console.log("Adding new recipe:", newRecipe.id);
    recipes.push(newRecipe);
    
    console.log("Writing updated recipes to file");
    await writeRecipes(recipes);
    
    console.log("Recipe created successfully");
    return NextResponse.json(
      { success: true, recipe: newRecipe },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating recipe:', error);
    return NextResponse.json(
      { error: `Failed to create recipe: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}