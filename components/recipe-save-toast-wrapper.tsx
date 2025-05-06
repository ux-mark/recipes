'use client';

import { Suspense } from 'react';
import { RecipeSaveToast } from './recipe-save-toast';

export function RecipeSaveToastWrapper() {
  return (
    <Suspense fallback={null}>
      <RecipeSaveToast />
    </Suspense>
  );
}