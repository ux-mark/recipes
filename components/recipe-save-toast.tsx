'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

export function RecipeSaveToast() {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    // Check if we just saved this recipe
    const saved = searchParams.get('saved');
    const recipeName = searchParams.get('recipeName');
    
    if (saved === 'true' && recipeName) {
      // Show success toast notification
      toast.success('Recipe saved successfully!', {
        description: `${decodeURIComponent(recipeName)} has been updated.`,
        duration: 5000,
      });
    }
  }, [searchParams]);
  
  // This component doesn't render anything visible
  return null;
}