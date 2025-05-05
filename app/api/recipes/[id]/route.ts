import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { Recipe } from '@/lib/types';
import { headers } from 'next/headers';

// Path to recipes JSON file
const recipesFilePath = path.join(process.cwd(), './lib/recipes.json');

// Enhanced security check for edit interface
function isEditEnabled() {
  // Check both environment variable and request headers
  const envEnabled = process.env.EDIT_INTERFACE === '1';
  
  // In production, add extra layers of security
  if (process.env.NODE_ENV === 'production') {
    const headersList = headers();
    const referer = headersList.get('referer') || '';
    
    // Make sure the request is coming from our admin pages
    const isFromAdminPage = referer.includes('/admin/');
    
    return envEnabled && isFromAdminPage;
  }
  
  return envEnabled;
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

// Get a specific recipe
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const recipes = await readRecipes();
    const recipe = recipes.find(r => r.id === params.id);
    
    if (!recipe) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(recipe);
  } catch (error) {
    console.error('Error fetching recipe:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recipe' },
      { status: 500 }
    );
  }
}

// Update a recipe with improved error handling
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log(`PUT request received for recipe ID: ${params.id}`);
  
  // Check if edit interface is enabled with enhanced security
  if (!isEditEnabled()) {
    console.log("Edit interface is not enabled or unauthorized request");
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 403 }
    );
  }
  
  // Rate limiting for production
  if (process.env.NODE_ENV === 'production') {
    // Simple in-memory rate limiting would go here
    // Just log the source IP for now without using the variable
    console.log('Request source:', headers().get('x-forwarded-for') || 'unknown');
  }
  
  try {
    // Parse the request body
    let updatedRecipe: Recipe;
    try {
      const text = await request.text();
      console.log("Request body received:", text);
      updatedRecipe = JSON.parse(text);
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }
    
    // Validate the recipe
    if (!updatedRecipe || !updatedRecipe.name) {
      console.error("Invalid recipe data:", updatedRecipe);
      return NextResponse.json(
        { error: "Invalid recipe data" },
        { status: 400 }
      );
    }
    
    console.log("Reading recipes from file");
    const recipes = await readRecipes();
    const recipeIndex = recipes.findIndex(r => r.id === params.id);
    
    console.log(`Recipe index for ID ${params.id}: ${recipeIndex}`);
    if (recipeIndex === -1) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      );
    }
    
    // Ensure ID remains the same
    updatedRecipe.id = params.id;
    
    // Update the recipe
    recipes[recipeIndex] = updatedRecipe;
    
    console.log("Writing updated recipes to file");
    await writeRecipes(recipes);
    
    console.log("Recipe updated successfully");
    return NextResponse.json({ 
      success: true, 
      recipe: updatedRecipe 
    });
  } catch (error) {
    console.error('Error updating recipe:', error);
    return NextResponse.json(
      { error: `Failed to update recipe: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

// Delete a recipe with enhanced security
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Check if edit interface is enabled with enhanced security
  if (!isEditEnabled()) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 403 }
    );
  }
  
  try {
    const recipes = await readRecipes();
    const recipeIndex = recipes.findIndex(r => r.id === params.id);
    
    if (recipeIndex === -1) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      );
    }
    
    // Remove the recipe
    recipes.splice(recipeIndex, 1);
    
    await writeRecipes(recipes);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    return NextResponse.json(
      { error: 'Failed to delete recipe' },
      { status: 500 }
    );
  }
}