'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import TagsMenu from '@/components/tags-menu';
import { RecipeTag } from '@/lib/types';

// Import recipes directly for static site generation
import allRecipes from '@/lib/recipes.json';

interface SiteHeaderProps {
  tags?: RecipeTag[];
}

export default function SiteHeader({ tags: initialTags = [] }: SiteHeaderProps) {
  const [tags, setTags] = useState<RecipeTag[]>(initialTags);

  // Process tags on the client side from static data
  useEffect(() => {
    if (initialTags.length === 0) {
      try {
        // Extract unique tags
        const tagMap = new Map();
        allRecipes.forEach(recipe => {
          recipe.tags.forEach(tag => {
            if (!tagMap.has(tag) && !tag.includes('Needs')) {
              const count = allRecipes.filter(r => r.tags.includes(tag)).length;
              tagMap.set(tag, { name: tag, count });
            }
          });
        });
        
        // Convert map to array and take first 20 tags
        const tagArray = Array.from(tagMap.values())
          .sort((a, b) => b.count - a.count)
          .slice(0, 20);
        setTags(tagArray);
      } catch (error) {
        console.error('Failed to process tags:', error);
      }
    }
  }, [initialTags]);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader className="pb-6">
                <SheetTitle>Fairy Bites</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-4">
                <Link href="/" className="text-lg font-medium hover:text-primary-500 transition-colors">
                  Home
                </Link>
                <Link href="/recipes" className="text-lg font-medium hover:text-primary-500 transition-colors">
                  All Recipes
                </Link>
                <TagsMenu orientation="vertical" tags={tags} />
              </nav>
            </SheetContent>
          </Sheet>
          <Link href="/" className="font-serif text-2xl font-bold tracking-tight">
            Fairy<span className="text-primary-600">Bites</span>
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium hover:text-primary-500 transition-colors">
            Home
          </Link>
          <Link href="/recipes" className="text-sm font-medium hover:text-primary-500 transition-colors">
            All Recipes
          </Link>
          <TagsMenu tags={tags} />
        </nav>
        
        <div className="flex items-center gap-2">
          <Link href="/search">
            <Button variant="ghost" size="icon">
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}