/**
 * Design Tokens
 * 
 * This file defines all the design tokens used across the recipe website.
 * These tokens represent the foundation of our design system and should be
 * used consistently across all components.
 */

export const colorTokens = {
  // Primary colors
  primary: '#3B82F6', // Blue 500
  'primary-dark': '#2563EB', // Blue 600
  'primary-light': '#60A5FA', // Blue 400
  
  // Secondary colors
  secondary: '#10B981', // Emerald 500
  'secondary-dark': '#059669', // Emerald 600
  'secondary-light': '#34D399', // Emerald 400
  
  // Grays
  'gray-50': '#F9FAFB',
  'gray-100': '#F3F4F6',
  'gray-200': '#E5E7EB',
  'gray-300': '#D1D5DB',
  'gray-400': '#9CA3AF',
  'gray-500': '#6B7280',
  'gray-600': '#4B5563',
  'gray-700': '#374151',
  'gray-800': '#1F2937',
  'gray-900': '#111827',
  
  // Feedback colors
  success: '#10B981', // Emerald 500
  warning: '#F59E0B', // Amber 500
  error: '#EF4444', // Red 500
  info: '#3B82F6', // Blue 500
};

export const spacingTokens = {
  'spacing-xs': '0.5rem', // 8px
  'spacing-sm': '1rem',   // 16px
  'spacing-md': '1.5rem', // 24px
  'spacing-lg': '2rem',   // 32px
  'spacing-xl': '3rem',   // 48px
};

export const typographyTokens = {
  // Font families
  'font-family-base': 'ui-sans-serif, system-ui, sans-serif',
  'font-family-heading': 'ui-sans-serif, system-ui, sans-serif',
  
  // Font sizes
  'font-size-xs': '0.75rem',   // 12px
  'font-size-sm': '0.875rem',  // 14px
  'font-size-base': '1rem',    // 16px
  'font-size-lg': '1.125rem',  // 18px
  'font-size-xl': '1.25rem',   // 20px
  'font-size-2xl': '1.5rem',   // 24px
  'font-size-3xl': '1.875rem', // 30px
  'font-size-4xl': '2.25rem',  // 36px
  
  // Font weights
  'font-weight-normal': '400',
  'font-weight-medium': '500',
  'font-weight-semibold': '600',
  'font-weight-bold': '700',
  
  // Line heights
  'line-height-tight': '1.25',
  'line-height-normal': '1.5',
  'line-height-relaxed': '1.75',
};

export const borderTokens = {
  'border-radius-sm': '0.125rem', // 2px
  'border-radius-md': '0.25rem',  // 4px
  'border-radius-lg': '0.5rem',   // 8px
  'border-radius-xl': '1rem',     // 16px
  'border-width-thin': '1px',
  'border-width-normal': '2px',
  'border-width-thick': '4px',
};

export const shadowTokens = {
  'shadow-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  'shadow-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  'shadow-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  'shadow-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
};

// Combine all tokens for easy export
export const designTokens = {
  colors: colorTokens,
  spacing: spacingTokens,
  typography: typographyTokens,
  borders: borderTokens,
  shadows: shadowTokens,
};

export default designTokens;