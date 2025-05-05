'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Recipe } from '@/lib/types';
import { getRecipeImageUrl } from '@/lib/client-utils/image';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Badge } from '@/components/ui/badge';

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

interface RecipeCardProps {
  recipe: Recipe;
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  const router = useRouter();
  
  // Navigate to recipe page
  const navigateToRecipe = () => {
    router.push(`/recipes/${recipe.id}`);
  };
  
  // Navigate to tag page
  const navigateToTag = (e: React.MouseEvent, tag: string) => {
    e.stopPropagation(); // Prevent bubbling up to the card click
    router.push(`/tags/${encodeURIComponent(normalizeTag(tag))}`);
  };

  return (
    <Card 
      className="overflow-hidden h-full transition-all hover:shadow-lg cursor-pointer" 
      onClick={navigateToRecipe}
    >
      <CardHeader className="p-0">
        <div className="relative">
          <AspectRatio ratio={4/3}>
            <Image 
              src={getRecipeImageUrl(recipe)}
              alt={recipe.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </AspectRatio>
          {recipe.rating > 0 && (
            <div className="absolute top-2 right-2 bg-accent-500 text-white rounded-full px-2 py-1 text-sm font-bold">
              {recipe.rating}/5
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <h3 className="text-xl font-semibold mb-2 line-clamp-1">{recipe.name}</h3>
        <p className="text-sm text-neutral-600 line-clamp-2">{recipe.description || "A delicious recipe waiting to be explored."}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <div className="flex flex-wrap gap-1">
          {recipe.tags.slice(0, 3).map(tag => (
            <Badge 
              key={tag}
              variant="secondary"
              className="cursor-pointer"
              onClick={(e) => navigateToTag(e, tag)}
            >
              {tag}
            </Badge>
          ))}
          {recipe.tags.length > 3 && (
            <Badge variant="outline">
              +{recipe.tags.length - 3}
            </Badge>
          )}
        </div>
        <span className="text-xs text-neutral-500">
          {recipe.prepTime && recipe.cookTime ? `${recipe.prepTime} + ${recipe.cookTime}` : ""}
        </span>
      </CardFooter>
    </Card>
  );
}