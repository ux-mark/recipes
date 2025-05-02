import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { getRecipeById, getAllRecipes } from '@/lib/recipes';
import { Separator } from '@/components/ui/separator';
import { Clock, Utensils, Star, ChevronLeft } from 'lucide-react';
import type { Metadata } from 'next';

// Helper function to normalize tag handling throughout the app
function normalizeTag(tag: string): string {
  // First trim any leading/trailing whitespace
  const trimmed = tag.trim();
  
  // Additional normalization to handle emoji characters and inconsistent spacing
  return trimmed.replace(/\s+/g, ' ');
}

interface RecipePageProps {
  params: {
    id: string;
  };
  searchParams?: Record<string, string | string[] | undefined>;
}

export async function generateMetadata({ params }: RecipePageProps): Promise<Metadata> {
  const recipe = await getRecipeById(params.id);
  
  if (!recipe) {
    return {
      title: 'Recipe Not Found | Fairy Bites',
    };
  }
  
  return {
    title: `${recipe.name} | Fairy Bites`,
    description: recipe.description || `A delicious recipe for ${recipe.name}`,
  };
}

export async function generateStaticParams(): Promise<{ id: string }[]> {
  const recipes = await getAllRecipes();
  
  return recipes.map((recipe) => ({
    id: recipe.id,
  }));
}

export default async function RecipePage({ params }: RecipePageProps) {
  const recipe = await getRecipeById(params.id);
  
  if (!recipe) {
    notFound();
  }
  
  // Format the created date
  let formattedDate = '';
  try {
    formattedDate = format(parseISO(recipe.createdDate), 'MMMM d, yyyy');
  } catch {
    // Use the raw date if parsing fails
    formattedDate = recipe.createdDate;
  }
  
  return (
    <article className="container py-8">
      <div className="mb-6">
        <Link 
          href="/recipes" 
          className="text-primary-600 hover:underline inline-flex items-center"
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to recipes
        </Link>
      </div>
      
      <header className="mb-8">
        <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold mb-4">{recipe.name}</h1>
        
        {recipe.description && (
          <p className="text-lg text-neutral-600 mb-4 max-w-3xl">{recipe.description}</p>
        )}
        
        <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500 mb-6">
          {recipe.prepTime && recipe.cookTime && (
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>Prep: {recipe.prepTime}, Cook: {recipe.cookTime}</span>
            </div>
          )}
          
          {recipe.servings && (
            <div className="flex items-center">
              <Utensils className="h-4 w-4 mr-1" />
              <span>Serves: {recipe.servings}</span>
            </div>
          )}
          
          {recipe.rating > 0 && (
            <div className="flex items-center">
              <Star className="h-4 w-4 mr-1 text-accent-500 fill-accent-500" />
              <span>{recipe.rating}/5</span>
            </div>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2 mb-6">
          {recipe.tags.map(tag => (
            <Link 
              key={tag}
              href={`/tags/${encodeURIComponent(normalizeTag(tag))}`}
              className="bg-neutral-100 hover:bg-neutral-200 transition-colors text-sm px-3 py-1 rounded-full"
            >
              {tag}
            </Link>
          ))}
        </div>
      </header>
      
      {/* Recipe Images */}
      {recipe.images && recipe.images.length > 0 && (
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recipe.images.slice(0, 2).map((image, index) => (
              <div 
                key={index} 
                className="relative aspect-[4/3] rounded-lg overflow-hidden"
              >
                <Image
                  src={`/images/${image}`}
                  alt={`${recipe.name} - image ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Ingredients */}
        <div className="lg:col-span-1">
          <div className="bg-neutral-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Ingredients</h2>
            <Separator className="mb-4" />
            <ul className="space-y-2">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-start">
                  <span className="inline-block w-2 h-2 rounded-full bg-primary-400 mt-2 mr-2"></span>
                  <span>{ingredient}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Recipe Metadata */}
          <div className="mt-6 bg-neutral-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Information</h2>
            <Separator className="mb-4" />
            <dl className="space-y-2">
              {recipe.source && (recipe.source.name || recipe.source.url) && (
                <>
                  <dt className="font-medium">Source</dt>
                  <dd className="text-neutral-600 mb-2">
                    {recipe.source.url ? (
                      <a 
                        href={recipe.source.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:underline"
                      >
                        {recipe.source.name || recipe.source.url}
                      </a>
                    ) : (
                      recipe.source.name
                    )}
                  </dd>
                </>
              )}
              
              <dt className="font-medium">Added</dt>
              <dd className="text-neutral-600">{formattedDate}</dd>
            </dl>
          </div>
        </div>
        
        {/* Instructions */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-semibold mb-4">Instructions</h2>
          <Separator className="mb-6" />
          
          {recipe.aside && (
            <div className="bg-secondary-50 border-l-4 border-secondary-300 p-4 mb-6 rounded-r-lg">
              <p className="text-neutral-700 italic">{recipe.aside}</p>
            </div>
          )}
          
          <ol className="space-y-6">
            {recipe.instructions.map((instruction, index) => (
              <li key={index} className="flex">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 text-primary-800 flex items-center justify-center font-bold mr-4">
                  {index + 1}
                </span>
                <p className="mt-1">{instruction}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </article>
  );
}