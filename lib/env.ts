/**
 * Environment configuration
 * 
 * This file centralizes environment-specific settings to make them
 * consistently available throughout the application.
 */

const isProduction = typeof process !== 'undefined' && process.env.NODE_ENV === 'production';
const isClientSide = typeof window !== 'undefined';

// Custom domain detection with both SSR and browser compatibility
let isCustomDomain = false;
if (typeof process !== 'undefined' && process.env.USE_CUSTOM_DOMAIN === 'true') {
  // Server-side detection
  isCustomDomain = true;
} else if (isClientSide) {
  // Client-side detection for custom domains
  // Check if we're on a GitHub Pages hostname (username.github.io)
  const hostname = window.location.hostname;
  isCustomDomain = !hostname.includes('github.io');
}

export const env = {
  /**
   * Base path for the application
   * In production (GitHub Pages), this will be /recipes unless using a custom domain
   * In development, this will be empty
   * When using a custom domain (process.env.USE_CUSTOM_DOMAIN=true), this will be empty
   */
  basePath: isProduction && !isCustomDomain ? '/recipes' : '',
  
  /**
   * Whether the application is running in production mode
   */
  isProduction,
  
  /**
   * Whether the application is running on the client side
   */
  isClientSide,
  
  /**
   * Whether the application is using a custom domain
   */
  isCustomDomain,
};