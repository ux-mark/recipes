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

/**
 * Helper function to normalize tag handling throughout the app
 * This should match the same logic as in recipes.ts
 */
function normalizeTag(tag: string): string {
  // First trim any leading/trailing whitespace
  const trimmed = tag.trim();
  
  // Additional normalization to handle emoji characters and inconsistent spacing
  return trimmed.replace(/\s+/g, ' ');
}

export async function generateMetadata({ params }: TagPageProps) {
  // Normalize the tag after decoding to match the logic in recipes.ts
  const decodedTag = decodeURIComponent(params.tag);
  const tag = normalizeTag(decodedTag);
  
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
    // Make sure we're using the same normalization logic when generating static paths
    tag: encodeURIComponent(normalizeTag(tag.name)),
  }));
}

export default async function TagPage({ params }: TagPageProps) {
  // First decode the URL parameter, then normalize it
  const decodedTag = decodeURIComponent(params.tag);
  const normalizedTag = normalizeTag(decodedTag);
  
  // Use the normalized tag to fetch recipes
  const recipes = await getRecipesByTag(normalizedTag);
  
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
        <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">{normalizedTag} Recipes</h1>
        <p className="text-neutral-600">Browse our collection of {recipes.length} {normalizedTag.toLowerCase()} recipes.</p>
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