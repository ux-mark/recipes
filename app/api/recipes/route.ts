import { NextResponse } from 'next/server';
import { getAllRecipes } from '@/lib/recipes';

// This forces the route to be statically generated at build time
export const dynamic = "force-static";

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