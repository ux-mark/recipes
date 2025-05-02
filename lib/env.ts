/**
 * Environment configuration
 * 
 * This file centralizes environment-specific settings to make them
 * consistently available throughout the application.
 */

const isProduction = typeof process !== 'undefined' && process.env.NODE_ENV === 'production';
const isClientSide = typeof window !== 'undefined';

// Enhanced custom domain detection with more reliable client-side checks
let isCustomDomain = false;

// Server-side check using environment variable
if (typeof process !== 'undefined' && process.env.USE_CUSTOM_DOMAIN === 'true') {
  isCustomDomain = true;
} 
// Client-side check based on hostname
else if (isClientSide) {
  // More robust client-side detection for custom domains
  const hostname = window.location.hostname;
  
  // If hostname is localhost or a GitHub Pages domain, it's not a custom domain
  if (hostname === 'localhost' || 
      hostname === '127.0.0.1' || 
      hostname.includes('.github.io') || 
      hostname.includes('.githubusercontent.com')) {
    isCustomDomain = false;
  } else {
    // Any other hostname is likely a custom domain
    isCustomDomain = true;
  }
  
  // Add to window for debugging purposes
  if (process.env.NODE_ENV !== 'production') {
    (window as any).__ENV_DEBUG = {
      isCustomDomain,
      hostname,
      isProduction,
    };
  }
}

/**
 * Central environment configuration object
 */
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