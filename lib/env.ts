/**
 * Environment configuration
 * 
 * This file centralizes environment-specific settings to make them
 * consistently available throughout the application.
 */

export const env = {
  /**
   * Base path for the application
   * In production (GitHub Pages), this will be /recipe-website
   * In development, this will be empty
   */
  basePath: typeof process !== 'undefined' && process.env.NEXT_PUBLIC_BASE_PATH || '',
  
  /**
   * Whether the application is running in production mode
   */
  isProduction: typeof process !== 'undefined' && process.env.NODE_ENV === 'production',
};