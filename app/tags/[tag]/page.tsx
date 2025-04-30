import RecipeCard from '@/components/recipe-card';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { notFound } from 'next/navigation';

// Import recipes directly for static site generation
import allRecipes from '@/lib/recipes.json';
import { generateStaticParams } from './generateStaticParams';

// Re-export the generateStaticParams function
export { generateStaticParams };

interface TagPageProps {
  params: {
    tag: string;
  };
}

export default function TagPage({ params }: TagPageProps) {
  const tag = decodeURIComponent(params.tag);
  
  // Filter recipes directly at render time
  const recipes = allRecipes.filter(recipe => 
    recipe.tags.includes(tag)
  );
  
  // If no recipes found for this tag, show 404
  if (recipes.length === 0) {
    notFound();
  }
  
  return (
    <div className="container py-8">
      <div className="mb-6">
        <Link 
          href="/recipes" 
          className="text-primary-600 hover:underline inline-flex items-center"
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to recipes
        </Link>
      </div>
      
      <header className="mb-8">
        <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">{tag} Recipes</h1>
        <p className="text-neutral-600">Browse our collection of {recipes.length} {tag.toLowerCase()} recipes.</p>
        <Separator className="mt-4" />
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {recipes.map(recipe => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </div>
  );
}