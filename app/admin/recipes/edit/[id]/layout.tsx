import { ReactNode } from 'react';
import { getAllRecipes } from '@/lib/recipes';

export async function generateStaticParams() {
  try {
    // Get all recipes and generate paths for each one
    const recipes = await getAllRecipes();
    return recipes.map((recipe) => ({
      id: recipe.id,
    }));
  } catch (error) {
    console.error("Error generating static params for admin edit routes:", error);
    return []; // Return empty array if there's an error
  }
}

export default function AdminEditLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}