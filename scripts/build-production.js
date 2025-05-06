// Production build script for Recipe Website
// This script prepares the application for production deployment

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Get current file directory equivalent to __dirname in CommonJS
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔄 Starting production build process...');

// Function to execute shell commands with output
function runCommand(command) {
  console.log(`\n📋 Running: ${command}`);
  try {
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`❌ Command failed: ${command}`);
    console.error(error.message);
    return false;
  }
}

// Check if .env.production exists
const envProdPath = path.join(process.cwd(), '.env.production');
if (!fs.existsSync(envProdPath)) {
  console.error('❌ .env.production file not found. Please create it first.');
  process.exit(1);
}

console.log('✅ .env.production file found');

// Clean previous builds
console.log('\n🧹 Cleaning previous builds...');
if (fs.existsSync(path.join(process.cwd(), '.next'))) {
  try {
    fs.rmSync(path.join(process.cwd(), '.next'), { recursive: true, force: true });
    console.log('✅ Previous build files cleaned');
  } catch (error) {
    console.warn('⚠️  Could not clean previous build:', error.message);
  }
}

// Install dependencies
console.log('\n📦 Installing dependencies...');
if (!runCommand('npm install --production=false')) {
  process.exit(1);
}

// Create backup of recipes.json
const recipesPath = path.join(process.cwd(), 'lib', 'recipes.json');
const backupDir = path.join(process.cwd(), 'backups');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupPath = path.join(backupDir, `recipes-${timestamp}-pre-deploy.json`);

try {
  fs.copyFileSync(recipesPath, backupPath);
  console.log(`✅ Created backup of recipes.json at ${backupPath}`);
} catch (error) {
  console.warn('⚠️  Could not create backup of recipes.json:', error.message);
}

// Build the application
console.log('\n🏗️ Building production application...');
if (!runCommand('NODE_ENV=production npm run build')) {
  process.exit(1);
}

console.log('\n✅ Production build completed successfully!');
console.log('\n🚀 To deploy the application:');
console.log('   1. Use "npm run start" to run the production server');
console.log('   2. Or deploy to Vercel with "vercel --prod"');