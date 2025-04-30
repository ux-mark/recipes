import { getAllRecipes } from '@/lib/recipes';
import RecipeCard from '@/components/recipe-card';
import { Separator } from '@/components/ui/separator';

export const metadata = {
  title: 'All Recipes | Bites by The Fairies',
  description: 'Browse all recipes in our collection.',
};

export default async function AllRecipesPage() {
  const recipes = await getAllRecipes();

  return (
    <div className="container py-8">
      <header className="mb-8">
        <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">All Recipes</h1>
        <p className="text-neutral-600">Browse our collection of {recipes.length} delicious recipes.</p>
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