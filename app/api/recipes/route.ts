import { NextResponse } from 'next/server';
import { getAllRecipes } from '@/lib/recipes';

// Required for static site export with API routes
export const dynamic = 'error';
export const dynamicParams = false;
export const revalidate = false;

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