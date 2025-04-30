'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, UtensilsCrossed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import RecipeCard from '@/components/recipe-card';
import { Recipe, RecipeTag } from '@/lib/types';

// Import recipes.json directly for static site generation
import allRecipes from '@/lib/recipes.json';

export default function Home() {
  const [featuredRecipes, setFeaturedRecipes] = useState<Recipe[]>([]);
  const [popularTags, setPopularTags] = useState<RecipeTag[]>([]);
  const [dinnerRecipes, setDinnerRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Process the already imported data instead of fetching
    try {
      // Get featured recipes (first 6)
      const featured = allRecipes.slice(0, 6);
      setFeaturedRecipes(featured);
      
      // Extract unique tags
      const tagMap = new Map();
      allRecipes.forEach(recipe => {
        recipe.tags.forEach(tag => {
          if (tagMap.has(tag)) {
            tagMap.get(tag).count += 1;
          } else {
            tagMap.set(tag, { name: tag, count: 1 });
          }
        });
      });
      
      // Filter and sort tags
      const tags = Array.from(tagMap.values());
      const filtered = tags
        .filter(tag => !tag.name.includes('Needs'))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);
      setPopularTags(filtered);
      
      // Get dinner recipes
      const dinner = allRecipes
        .filter(recipe => recipe.tags.includes('Dinner'))
        .slice(0, 3);
      setDinnerRecipes(dinner);
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to process recipe data:', error);
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Rest of the component remains the same
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-50 to-secondary-50">
        <div className="container py-12 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
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
            {featuredRecipes[0]?.images && featuredRecipes[0].images.length > 0 ? (
              <div className="relative aspect-square max-w-lg mx-auto lg:ml-auto">
                <Image
                  src={`/images/${featuredRecipes[0].images[0]}`}
                  alt="Featured Recipe"
                  fill
                  className="object-cover rounded-2xl shadow-xl"
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-2xl flex flex-col justify-end p-6">
                  <h3 className="text-white text-2xl font-bold mb-2">{featuredRecipes[0].name}</h3>
                  <Link href={`/recipes/${featuredRecipes[0].id}`} className="text-white hover:underline inline-flex items-center">
                    View Recipe <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-neutral-100 rounded-2xl aspect-square max-w-lg mx-auto flex items-center justify-center">
                <UtensilsCrossed className="h-16 w-16 text-neutral-300" />
              </div>
            )}
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
