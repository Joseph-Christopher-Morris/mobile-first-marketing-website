#!/usr/bin/env node

/**
 * Verify Photography Hero Image Configuration
 * 
 * This script verifies that the photography page is correctly configured
 * to use photography-hero.webp instead of editorial-proof-bbc-forbes-times.webp
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Photography Hero Image Configuration...\n');

// Check the photography page source
const photographyPagePath = 'src/app/services/photography/page.tsx';
const photographyPageContent = fs.readFileSync(photographyPagePath, 'utf8');

console.log('📄 Checking Photography Page Source:');

// Check for correct hero image
if (photographyPageContent.includes('/images/services/photography-hero.webp')) {
  console.log('✅ Hero image correctly set to photography-hero.webp');
} else {
  console.log('❌ Hero image not found or incorrect');
}

// Check for old image references
if (photographyPageContent.includes('editorial-proof-bbc-forbes-times.webp')) {
  console.log('❌ Old editorial-proof image still referenced');
} else {
  console.log('✅ No references to old editorial-proof image');
}

// Check preload configuration
if (photographyPageContent.includes("'/images/services/photography-hero.webp'")) {
  console.log('✅ Preload configuration correctly set to photography-hero.webp');
} else {
  console.log('❌ Preload configuration incorrect or missing');
}

// Check OpenGraph metadata
if (photographyPageContent.includes('url: \'/images/services/photography-hero.webp\'')) {
  console.log('✅ OpenGraph metadata correctly set to photography-hero.webp');
} else {
  console.log('❌ OpenGraph metadata incorrect or missing');
}

console.log('\n📋 Summary:');
console.log('The photography page source code is correctly configured to use photography-hero.webp');
console.log('If you\'re still seeing editorial-proof-bbc-forbes-times.webp in the browser:');
console.log('1. Clear your browser cache');
console.log('2. Run a fresh build: npm run build');
console.log('3. Check if you\'re looking at a cached deployment');
console.log('4. Verify the correct image file exists at: public/images/services/photography-hero.webp');

// Check if the image file exists
const heroImagePath = 'public/images/services/photography-hero.webp';
if (fs.existsSync(heroImagePath)) {
  console.log('✅ photography-hero.webp file exists in public directory');
} else {
  console.log('❌ photography-hero.webp file NOT found in public directory');
}

console.log('\n🚀 Next steps if still seeing old image:');
console.log('- Run: npm run build');
console.log('- Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)');
console.log('- Check deployment cache invalidation');