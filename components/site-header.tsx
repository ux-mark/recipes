'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Menu, Search, Edit, Palette } from "lucide-react";
import TagsMenu from "./tags-menu";
import { RecipeTag } from "@/lib/types";
import { useEffect, useState } from "react";

interface SiteHeaderProps {
  tags: RecipeTag[];
}

export default function SiteHeader({ tags }: SiteHeaderProps) {
  // Default to false for both features - will be updated by API response
  const [isEditEnabled, setIsEditEnabled] = useState(false);
  const [isDesignSystemEnabled, setIsDesignSystemEnabled] = useState(false);
  // Track if API has been checked to handle races/errors
  const [flagsChecked, setFlagsChecked] = useState(false);
  
  // Check feature flags on client-side using the status API
  useEffect(() => {
    const checkFeatureFlags = async () => {
      try {
        const response = await fetch('/api/status');
        if (response.ok) {
          const data = await response.json();
          setIsEditEnabled(!!data.editInterfaceEnabled);
          setIsDesignSystemEnabled(!!data.designSystemEnabled);
        } else {
          console.error('Failed to fetch feature flags status');
        }
      } catch (error) {
        console.error('Error checking feature flags status:', error);
      } finally {
        setFlagsChecked(true);
      }
    };
    
    checkFeatureFlags();
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
                {isEditEnabled && flagsChecked && (
                  <Link href="/admin/recipes" className="text-lg font-semibold text-primary-600 hover:text-primary-500 transition-colors flex items-center gap-2">
                    <Edit className="h-4 w-4" /> Edit Recipes
                  </Link>
                )}
                {isDesignSystemEnabled && flagsChecked && (
                  <Link href="/design-system" className="text-lg font-semibold text-secondary-600 hover:text-secondary-500 transition-colors flex items-center gap-2">
                    <Palette className="h-4 w-4" /> Design System
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
          {isEditEnabled && flagsChecked && (
            <Link href="/admin/recipes" className="text-sm font-medium text-primary-600 hover:text-primary-500 transition-colors flex items-center gap-1">
              <Edit className="h-4 w-4" /> Edit
            </Link>
          )}
          {isDesignSystemEnabled && flagsChecked && (
            <Link href="/design-system" className="text-sm font-medium text-secondary-600 hover:text-secondary-500 transition-colors flex items-center gap-1">
              <Palette className="h-4 w-4" /> Design System
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