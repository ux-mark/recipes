import { NextResponse } from 'next/server';
import { getAllRecipes } from '@/lib/recipes';
import fs from 'fs/promises';
import path from 'path';
import { Recipe } from '@/lib/types';
import { normalizeFileName } from '@/lib/utils/string-utils';

// Path to recipes JSON file
const recipesFilePath = path.join(process.cwd(), './lib/recipes.json');

// Check if edit interface is enabled
function isEditEnabled() {
  return process.env.EDIT_INTERFACE === '1';
}

// Helper function to read recipes
async function readRecipes(): Promise<Recipe[]> {
  const data = await fs.readFile(recipesFilePath, 'utf8');
  return JSON.parse(data);
}

// Helper function to write recipes
async function writeRecipes(recipes: Recipe[]): Promise<void> {
  // Create backup
  const backupDir = path.join(process.cwd(), './backups');
  await fs.mkdir(backupDir, { recursive: true });
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(backupDir, `recipes-${timestamp}.json`);
  
  await fs.copyFile(recipesFilePath, backupPath);
  
  // Write updated recipes
  await fs.writeFile(
    recipesFilePath, 
    JSON.stringify(recipes, null, 2), 
    'utf8'
  );
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

// Create a new recipe
export async function POST(request: Request) {
  if (!isEditEnabled()) {
    return NextResponse.json(
      { error: 'Edit interface is not enabled' },
      { status: 403 }
    );
  }
  
  try {
    const newRecipe = await request.json();
    
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
    
    recipes.push(newRecipe);
    await writeRecipes(recipes);
    
    return NextResponse.json(
      { success: true, recipe: newRecipe },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating recipe:', error);
    return NextResponse.json(
      { error: 'Failed to create recipe' },
      { status: 500 }
    );
  }
}