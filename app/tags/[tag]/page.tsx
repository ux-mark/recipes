import { getRecipesByTag, getAllTags } from '@/lib/recipes';
import RecipeCard from '@/components/recipe-card';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { notFound } from 'next/navigation';

interface TagPageProps {
  params: {
    tag: string;
  } | Promise<{
    tag: string;
  }>;
}

/**
 * Comprehensive tag normalization function that handles Unicode variations
 * and special characters consistently
 */
function normalizeTag(tag: string): string {
  try {
    // Ensure we're working with a string
    if (typeof tag !== 'string') {
      console.warn('Non-string tag received:', tag);
      return String(tag);
    }
    
    // First decode if it appears to be URI encoded
    let processedTag = tag;
    if (tag.includes('%')) {
      try {
        processedTag = decodeURIComponent(tag);
      } catch (e) {
        // Use the error in a log statement so it's not unused
        console.warn('Failed to decode URI component:', tag, String(e));
      }
    }
    
    // Normalize Unicode to composed form (NFC)
    // This addresses differences in how characters may be encoded
    processedTag = processedTag.normalize('NFC');
    
    // Remove any leading/trailing whitespace
    processedTag = processedTag.trim();
    
    // Normalize internal spaces (replace multiple spaces with a single space)
    processedTag = processedTag.replace(/\s+/g, ' ');
    
    return processedTag;
  } catch (e) {
    // Use the error in a log statement so it's not unused
    console.error('Error in normalizeTag:', String(e));
    // Fall back to the original
    return tag;
  }
}

export async function generateMetadata({ params }: TagPageProps) {
  // Properly unwrap params with React.use() if it's a Promise
  const resolvedParams = params instanceof Promise ? await params : params;
  const decodedTag = decodeURIComponent(resolvedParams.tag);
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
  try {
    // Properly unwrap params with a consistent approach (using await instead of use())
    const resolvedParams = params instanceof Promise ? await params : params;
    
    // First decode the URL parameter, then normalize it
    const decodedTag = decodeURIComponent(resolvedParams.tag);
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
  } catch (error) {
    console.error("Error rendering tag page:", error);
    return (
      <div className="container py-8">
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
          An error occurred while loading recipes for this category. Please try again.
        </div>
        <Link 
          href="/recipes" 
          className="mt-4 inline-block text-primary-600 hover:underline"
        >
          Back to recipes
        </Link>
      </div>
    );
  }
}