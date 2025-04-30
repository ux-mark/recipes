'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Menu, Search } from "lucide-react";
import TagsMenu from "./tags-menu";
import { RecipeTag } from "@/lib/types";

interface SiteHeaderProps {
  tags: RecipeTag[];
}

export default function SiteHeader({ tags }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-6 md:px-8 lg:px-12">
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] sm:w-[300px]">
              <nav className="flex flex-col gap-4 mt-8">
                <Link href="/" className="text-lg font-semibold hover:text-primary-500 transition-colors">
                  Home
                </Link>
                <Link href="/recipes" className="text-lg font-semibold hover:text-primary-500 transition-colors">
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