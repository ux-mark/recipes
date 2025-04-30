import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get current file's directory (ES modules don't have __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Source and destination directories
// TODO: Update the source directory path to point to be cofigured in a .env file
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
}

// Start copying files from source to destination
try {
  copyFilesRecursively(sourceDir, destDir);
  console.log('Image copy completed successfully.');
} catch (error) {
  console.error('Error copying images:', error);
}