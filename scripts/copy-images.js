import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get current file's directory (ES modules don't have __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Source and destination directories
// If running in Digital Ocean or other deployment environment, we'll skip the external source directory
const sourceDir = path.join(__dirname, '../../Recipes-and-photos');
const destDir = path.join(__dirname, '../public/images');

// Create destination directory if it doesn't exist
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
  console.log(`Created directory: ${destDir}`);
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

// Start copying files from source to destination
try {
  // Try to copy files but don't fail if the source directory doesn't exist
  const success = copyFilesRecursively(sourceDir, destDir);
  
  if (success) {
    console.log('Image copy completed successfully.');
  } else {
    console.log('Skipping image copy in deployment environment.');
    
    // Ensure the images directory exists even if we don't copy anything
    ensureDirectoryExists(destDir);
  }
} catch (error) {
  console.error('Error in copy-images script:', error);
  // Continue with the build process even if the image copy fails
  process.exit(0); // Exit with success code to continue the build
}