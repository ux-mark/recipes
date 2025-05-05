/**
 * Utility functions for string manipulation and normalization
 */

/**
 * Normalizes a string to be used as a filename or ID.
 * This function:
 * - Converts to lowercase
 * - Removes special characters and diacritics
 * - Replaces spaces with hyphens
 * - Ensures the result is a valid filename
 * 
 * @param input The string to normalize
 * @returns A normalized string suitable for filenames and URLs
 */
export function normalizeFileName(input: string): string {
  if (!input) return '';
  
  // Convert to lowercase
  let result = input.toLowerCase();
  
  // Remove diacritics/accents
  result = result.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  // Replace spaces and underscores with hyphens
  result = result.replace(/[\s_]+/g, '-');
  
  // Remove special characters except hyphens
  result = result.replace(/[^\w-]/g, '');
  
  // Replace multiple hyphens with a single hyphen
  result = result.replace(/-+/g, '-');
  
  // Remove leading and trailing hyphens
  result = result.replace(/^-+|-+$/g, '');
  
  // Ensure the result is not empty
  if (!result) {
    // Generate a timestamp-based ID if the result is empty
    result = `recipe-${Date.now()}`;
  }
  
  return result;
}