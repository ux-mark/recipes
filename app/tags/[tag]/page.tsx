import { getRecipesByTag, getAllTags } from '@/lib/recipes';
import RecipeCard from '@/components/recipe-card';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { notFound } from 'next/navigation';

interface TagPageProps {
  params: {
    tag: string;
  };
}

export async function generateMetadata({ params }: TagPageProps) {
  const tag = decodeURIComponent(params.tag);
  const recipes = await getRecipesByTag(tag);
  
  if (recipes.length === 0) {
    return {
      title: 'Category Not Found | Fairy Bites',
    };
  }
  
  return {
    title: `${tag} Recipes | Fairy Bites`,
    description: `Browse our collection of ${recipes.length} ${tag.toLowerCase()} recipes.`,
  };
}

export async function generateStaticParams() {
  const tags = await getAllTags();
  
  return tags.map((tag) => ({
    tag: encodeURIComponent(tag.name),
  }));
}

export default async function TagPage({ params }: TagPageProps) {
  const tag = decodeURIComponent(params.tag);
  const recipes = await getRecipesByTag(tag);
  
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