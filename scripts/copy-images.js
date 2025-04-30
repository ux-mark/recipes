import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

/**
 * Copy recipe images from source to destination directory
 * @param {Object} options - Options for copying images
 * @param {string} options.sourceDir - Source directory (overrides env variable if provided)
 * @param {string} options.destDir - Destination directory (defaults to public/images)
 * @returns {Object} - Result of the operation
 */
export async function copyImages(options = {}) {
  try {
    // Get current file's directory (ES modules don't have __dirname)
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    // Source and destination directories
    // Read source directory from .env file with fallback
    const defaultSourceDir = process.env.RECIPE_IMAGES_SOURCE_DIR || '../../Recipes-and-photos';
    const sourceDir = options.sourceDir || path.resolve(__dirname, defaultSourceDir);
    const destDir = options.destDir || path.join(__dirname, '../public/images');

    // Create destination directory if it doesn't exist
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
      console.log(`Created directory: ${destDir}`);
    }

    // Start copying files from source to destination
    const success = copyFilesRecursively(sourceDir, destDir);
    
    if (success) {
      console.log('Image copy completed successfully.');
      return { success: true, message: 'Images copied successfully' };
    } else {
      console.log('Skipping image copy. Source directory not found.');
      
      // Ensure the images directory exists even if we don't copy anything
      ensureDirectoryExists(destDir);
      return { 
        success: false, 
        message: 'Source directory not found',
        sourceDir,
        destDir
      };
    }
  } catch (error) {
    console.error('Error in copy-images script:', error);
    return { 
      success: false, 
      message: 'Error copying images', 
      error: error.message 
    };
  }
}

// Helper function to copy a file
function copyFile(source, dest) {
  fs.copyFileSync(source, dest);
  console.log(`Copied: ${path.basename(source)} to ${dest}`);
}

// Helper function to create directory if it doesn't exist
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
}

// Recursive function to copy files from source to destination
function copyFilesRecursively(source, dest) {
  // Check if the source directory exists
  if (!fs.existsSync(source)) {
    console.log(`Source directory not found: ${source}`);
    return false;
  }

  // Get all files in the source directory
  const files = fs.readdirSync(source);
  
  files.forEach(file => {
    // Skip .DS_Store and other hidden files
    if (file.startsWith('.')) return;
    
    const sourcePath = path.join(source, file);
    const destPath = path.join(dest, file);
    
    // Check if it's a directory
    if (fs.statSync(sourcePath).isDirectory()) {
      // Create the directory in the destination
      ensureDirectoryExists(destPath);
      
      // Recursively copy files from this directory
      copyFilesRecursively(sourcePath, destPath);
    } else {
      // It's a file, copy it
      copyFile(sourcePath, destPath);
    }
  });
  
  return true;
}

// Run the script if it's called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  copyImages()
    .then(result => {
      if (!result.success) {
        // Exit with success code to continue the build even if image copy fails
        process.exit(0);
      }
    })
    .catch(error => {
      console.error('Unhandled error:', error);
      process.exit(0); // Continue the build process even if the image copy fails
    });
}