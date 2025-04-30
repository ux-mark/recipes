import allRecipes from '@/lib/recipes.json';

// Extract all unique tags from recipes to pre-generate static paths
export async function generateStaticParams() {
  // Create a Set to store unique tags
  const uniqueTags = new Set<string>();
  
  // Extract all tags from recipes
  allRecipes.forEach(recipe => {
    recipe.tags.forEach(tag => {
      uniqueTags.add(tag);
    });
  });
  
  // Convert the Set to an array of objects with the required format
  return Array.from(uniqueTags).map(tag => ({
    tag: tag,
  }));
}