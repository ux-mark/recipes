import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { env } from "./env"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get the correct path for assets (images, etc.) considering the GitHub Pages base path
 */
export function getAssetPath(path: string): string {
  // Don't modify URLs that are already absolute or data URLs
  if (path.startsWith('http') || path.startsWith('data:')) {
    return path;
  }
  
  // If path already includes the base path, return as is
  if (env.basePath && path.startsWith(env.basePath)) {
    return path;
  }

  // Handle paths with or without leading slash
  if (path.startsWith('/')) {
    return `${env.basePath}${path}`;
  } else {
    return `${env.basePath}/${path}`;
  }
}
