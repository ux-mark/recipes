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
  // Remove leading slash if present to prevent double slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Use the base path from our environment configuration
  return `${env.basePath}/${cleanPath}`;
}
