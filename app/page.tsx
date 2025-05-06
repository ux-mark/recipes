import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, UtensilsCrossed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import RecipeCard from '@/components/recipe-card';
import { getFeaturedRecipes, getAllTags, getRecipesByTag, getAllRecipes } from '@/lib/recipes';
import { getRecipeImageUrl } from '@/lib/client-utils/image';

export default async function Home() {
  const allRecipes = await getAllRecipes();
  const featuredRecipes = await getFeaturedRecipes(6);
  const allTags = await getAllTags();
  const popularTags = allTags
    .filter(tag => !tag.name.includes('Needs')) // Filter out tags containing "Needs"
    .slice(0, 6); // Get top 6 popular tags
  
  // Get a few dinner recipes
  const dinnerRecipes = (await getRecipesByTag('Dinner')).slice(0, 3);

  // UPDATED: First look for recipes explicitly marked for hero display
  let heroRecipes = allRecipes
    .filter(recipe => recipe.showInHero === true && recipe.images && recipe.images.length > 0)
    .slice(0, 4);

  // If we don't have enough hero-flagged recipes, fall back to the original algorithm
  if (heroRecipes.length < 4) {
    // Get additional recipes using the original algorithm
    const additionalRecipes = [...featuredRecipes.slice(1), ...dinnerRecipes]
      .filter(recipe => 
        // Only include recipes with images that aren't already in heroRecipes
        recipe.images && recipe.images.length > 0 && 
        !heroRecipes.some(heroRecipe => heroRecipe.id === recipe.id)
      );
    
    // Combine heroRecipes with additional recipes, up to 4 total
    heroRecipes = [...heroRecipes, ...additionalRecipes].slice(0, 4);
  }

  // Deduplicate recipes by ID (keeping the original order)
  const collageRecipes = Array.from(
    new Map(heroRecipes.map(recipe => [recipe.id, recipe]))
  ).map(([, recipe]) => recipe);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-50 to-secondary-50">
        <div className="container py-12 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="pl-4 md:pl-6 lg:pl-8">
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight">
                Discover Delicious <span className="text-primary-600">Recipes</span> for Every Occasion
              </h1>
              <p className="text-neutral-600 text-lg mb-6 max-w-md">
                Explore our collection of tasty and easy-to-follow recipes for everyday cooking and special celebrations.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="rounded-full">
                  <Link href="/recipes">Browse All Recipes</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-full">
                  <Link href="/search">Search Recipes</Link>
                </Button>
              </div>
            </div>

            {/* Right side with image collage and caption */}
            <div className="flex flex-col">
              {/* Image Collage Container */}
              <div className="relative h-96 w-full">
                {collageRecipes.length > 0 ? (
                  <>
                    {/* One large image if we only have one */}
                    {collageRecipes.length === 1 && (
                      <div className="absolute inset-0 rounded-2xl overflow-hidden">
                        <Link href={`/recipes/${collageRecipes[0].id}`} className="relative block w-full h-full">
                          <Image
                            src={getRecipeImageUrl(collageRecipes[0])}
                            alt={collageRecipes[0].name}
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            className="object-cover"
                            priority
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-6">
                            <span className="text-white text-lg font-medium">{collageRecipes[0].name}</span>
                          </div>
                        </Link>
                      </div>
                    )}
                    
                    {/* 2x1 grid for two images */}
                    {collageRecipes.length === 2 && (
                      <>
                        <div className="absolute left-0 top-0 bottom-0 w-1/2 rounded-l-2xl overflow-hidden">
                          <Link href={`/recipes/${collageRecipes[0].id}`} className="relative block w-full h-full">
                            <Image
                              src={getRecipeImageUrl(collageRecipes[0])}
                              alt={collageRecipes[0].name}
                              fill
                              sizes="(max-width: 768px) 50vw, 25vw"
                              className="object-cover"
                              priority
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                              <span className="text-white text-sm font-medium">{collageRecipes[0].name}</span>
                            </div>
                          </Link>
                        </div>
                        <div className="absolute right-0 top-0 bottom-0 w-1/2 rounded-r-2xl overflow-hidden">
                          <Link href={`/recipes/${collageRecipes[1].id}`} className="relative block w-full h-full">
                            <Image
                              src={getRecipeImageUrl(collageRecipes[1])}
                              alt={collageRecipes[1].name}
                              fill
                              sizes="(max-width: 768px) 50vw, 25vw"
                              className="object-cover"
                              priority
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                              <span className="text-white text-sm font-medium">{collageRecipes[1].name}</span>
                            </div>
                          </Link>
                        </div>
                      </>
                    )}
                    
                    {/* 2x2 grid for 3-4 images */}
                    {collageRecipes.length >= 3 && (
                      <>
                        <div className="absolute left-0 top-0 w-1/2 h-1/2 rounded-tl-2xl overflow-hidden">
                          <Link href={`/recipes/${collageRecipes[0].id}`} className="relative block w-full h-full">
                            <Image
                              src={getRecipeImageUrl(collageRecipes[0])}
                              alt={collageRecipes[0].name}
                              fill
                              sizes="(max-width: 768px) 50vw, 25vw"
                              className="object-cover"
                              priority
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                              <span className="text-white text-sm font-medium">{collageRecipes[0].name}</span>
                            </div>
                          </Link>
                        </div>
                        <div className="absolute right-0 top-0 w-1/2 h-1/2 rounded-tr-2xl overflow-hidden">
                          <Link href={`/recipes/${collageRecipes[1].id}`} className="relative block w-full h-full">
                            <Image
                              src={getRecipeImageUrl(collageRecipes[1])}
                              alt={collageRecipes[1].name}
                              fill
                              sizes="(max-width: 768px) 50vw, 25vw"
                              className="object-cover"
                              priority
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                              <span className="text-white text-sm font-medium">{collageRecipes[1].name}</span>
                            </div>
                          </Link>
                        </div>
                        <div className="absolute left-0 bottom-0 w-1/2 h-1/2 rounded-bl-2xl overflow-hidden">
                          <Link href={`/recipes/${collageRecipes[2].id}`} className="relative block w-full h-full">
                            <Image
                              src={getRecipeImageUrl(collageRecipes[2])}
                              alt={collageRecipes[2].name}
                              fill
                              sizes="(max-width: 768px) 50vw, 25vw"
                              className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                              <span className="text-white text-sm font-medium">{collageRecipes[2].name}</span>
                            </div>
                          </Link>
                        </div>
                        {collageRecipes.length >= 4 && (
                          <div className="absolute right-0 bottom-0 w-1/2 h-1/2 rounded-br-2xl overflow-hidden">
                            <Link href={`/recipes/${collageRecipes[3].id}`} className="relative block w-full h-full">
                              <Image
                                src={getRecipeImageUrl(collageRecipes[3])}
                                alt={collageRecipes[3].name}
                                fill
                                sizes="(max-width: 768px) 50vw, 25vw"
                                className="object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                                <span className="text-white text-sm font-medium">{collageRecipes[3].name}</span>
                              </div>
                            </Link>
                          </div>
                        )}
                      </>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-neutral-100 rounded-2xl">
                    <UtensilsCrossed className="h-16 w-16 text-neutral-300" />
                  </div>
                )}
              </div>
              
              {/* Caption text as a separate element outside the image container */}
              {collageRecipes.length > 0 && (
                <div className="mt-4 text-right">
                  <p className="text-lg font-medium text-primary-600">
                    Explore our delicious recipes
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Recipes Section */}
      <section className="py-16">
        <div className="container">
          <h2 className="font-serif text-3xl font-bold mb-8 text-center">Featured Recipes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredRecipes.slice(0, 6).map(recipe => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/recipes">View All Recipes <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-neutral-50">
        <div className="container">
          <h2 className="font-serif text-3xl font-bold mb-8 text-center">Popular Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {popularTags.map(tag => (
              <Link 
                key={tag.name}
                href={`/tags/${encodeURIComponent(tag.name)}`}
                className="bg-white rounded-lg p-4 text-center shadow-sm hover:shadow-md transition-shadow"
              >
                <h3 className="font-medium text-lg">{tag.name}</h3>
                <p className="text-sm text-neutral-500">{tag.count} recipes</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Dinner Ideas Section */}
      <section className="py-16">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-serif text-3xl font-bold">Dinner Ideas</h2>
            <Link href="/tags/Dinner" className="text-primary-600 hover:underline flex items-center">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {dinnerRecipes.map(recipe => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-50">
        <div className="container text-center">
          <h2 className="font-serif text-3xl font-bold mb-4">Ready to Start Cooking?</h2>
          <p className="text-neutral-600 max-w-2xl mx-auto mb-8">
            Explore our collection of tasty recipes and find your next favorite meal.
          </p>
          <Button asChild size="lg" className="rounded-full">
            <Link href="/recipes">Browse All Recipes</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
