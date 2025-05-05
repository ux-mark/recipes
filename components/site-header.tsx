'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Menu, Search, Edit } from "lucide-react";
import TagsMenu from "./tags-menu";
import { RecipeTag } from "@/lib/types";
import { useEffect, useState } from "react";

interface SiteHeaderProps {
  tags: RecipeTag[];
}

export default function SiteHeader({ tags }: SiteHeaderProps) {
  const [isEditEnabled, setIsEditEnabled] = useState(false);
  
  // Check if edit interface is enabled on client-side
  useEffect(() => {
    const checkEditEnabled = async () => {
      try {
        const response = await fetch('/api/recipes', { method: 'HEAD' });
        // If we get a 403, it means the edit interface is not enabled
        setIsEditEnabled(response.status !== 403);
      } catch (error) {
        console.error('Error checking edit interface status:', error);
        setIsEditEnabled(false);
      }
    };
    
    checkEditEnabled();
  }, []);

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
                {isEditEnabled && (
                  <Link href="/admin/recipes" className="text-lg font-semibold text-primary-600 hover:text-primary-500 transition-colors flex items-center gap-2">
                    <Edit className="h-4 w-4" /> Edit Recipes
                  </Link>
                )}
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
          {isEditEnabled && (
            <Link href="/admin/recipes" className="text-sm font-medium text-primary-600 hover:text-primary-500 transition-colors flex items-center gap-1">
              <Edit className="h-4 w-4" /> Edit
            </Link>
          )}
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