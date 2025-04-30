import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Default paths with fallback
const defaultSourceDir = process.env.RECIPE_IMAGES_SOURCE_DIR || "../../Recipes-and-photos";
const defaultDestDir = "../public/images";

/**
 * Copies recipe images from source to public directory
 * @param {Object} options - Configuration options
 * @param {string} options.sourceDir - Source directory for images (defaults to env var or relative path)
 * @param {string} options.destDir - Destination directory for images (defaults to public/images)
 * @returns {Promise<Object>} Result of the operation
 */
export async function copyImages(options = {}) {
  const sourceDir = path.resolve(__dirname, options.sourceDir || defaultSourceDir);
  const destDir = path.resolve(__dirname, options.destDir || defaultDestDir);
  
  console.log(`Source directory: ${sourceDir}`);
  
  // Check if source directory exists
  if (!fs.existsSync(sourceDir)) {
    console.log(`Source directory not found: ${sourceDir}`);
    console.log('Skipping image copy. Source directory not found.');
    
    // Important: Check if we have the destination directory with images already
    if (fs.existsSync(destDir) && fs.readdirSync(destDir).length > 0) {
      console.log(`Destination directory ${destDir} exists and contains files.`);
      console.log('Continuing with existing images...');
      return {
        success: true,
        message: 'Using existing images in destination directory',
      };
    }
    
    // Create the destination directory if it doesn't exist
    if (!fs.existsSync(destDir)) {
      console.log(`Creating destination directory: ${destDir}`);
      fs.mkdirSync(destDir, { recursive: true });
    }
    
    return {
      success: true,
      message: 'Source directory not found, but build can proceed with empty images directory',
    };
  }
  
  try {
    // Create destination directory if it doesn't exist
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    
    // For simplicity in this example, just copy the entire directory
    // In a real implementation, you might want to filter or transform the images
    copyDir(sourceDir, destDir);
    
    return {
      success: true,
      message: 'Images copied successfully',
    };
  } catch (error) {
    console.error('Error copying images:', error);
    return {
      success: false,
      message: 'Failed to copy images',
      error,
    };
  }
}

/**
 * Helper function to copy directory recursively
 * @param {string} src - Source directory
 * @param {string} dest - Destination directory
 */
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Allow running directly from command line
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  copyImages()
    .then(result => {
      if (result.success) {
        console.log(result.message);
        process.exit(0);
      } else {
        console.error(result.message);
        process.exit(1);
      }
    })
    .catch(err => {
      console.error('Unhandled error:', err);
      process.exit(1);
    });
}