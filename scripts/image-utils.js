import { copyImages } from './copy-images.js';

/**
 * Utility to refresh recipe images when needed
 * @param {Object} options - Optional configuration
 * @returns {Promise<Object>} Result of the operation
 */
export async function refreshRecipeImages(options = {}) {
  console.log('Refreshing recipe images...');
  
  // Call the copyImages function with optional custom parameters
  const result = await copyImages({
    sourceDir: options.sourceDir, // Override source directory if needed
    destDir: options.destDir      // Override destination directory if needed
  });
  
  return result;
}

// Example usage:
// import { refreshRecipeImages } from './scripts/image-utils.js';
//
// // Call when needed in your application
// refreshRecipeImages()
//   .then(result => {
//     if (result.success) {
//       console.log('Images refreshed successfully!');
//     } else {
//       console.warn('Image refresh issue:', result.message);
//     }
//   });