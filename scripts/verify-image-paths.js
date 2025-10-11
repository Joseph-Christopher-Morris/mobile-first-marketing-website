#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying image paths for website-image-navigation-fixes...\n');

// Define required images based on the spec
const requiredImages = [
  // Service cards (Homepage & Services page)
  '/images/services/photography-hero.webp',
  '/images/services/screenshot-2025-09-23-analytics-dashboard.webp',
  '/images/services/ad-campaigns-hero.webp',

  // Blog preview images (Homepage)
  '/images/hero/google-ads-analytics-dashboard.webp',
  '/images/hero/whatsapp-image-2025-07-11-flyers-roi.webp',
  '/images/hero/240619-london-19.webp',

  // About page hero
  '/images/about/A7302858.webp',

  // Service page heroes
  '/images/services/250928-hampson-auctions-sunday-11.webp', // Photography hero

  // Sample portfolio images
  '/images/services/240217-australia-trip-232.webp',
  '/images/services/240219-australia-trip-148.webp',
  '/images/services/accessible-top8-campaigns-source.webp',
  '/images/services/top-3-mediums-by-conversion-rate.webp',
];

let allExist = true;
const missingImages = [];
const existingImages = [];

console.log('Checking required images:\n');

requiredImages.forEach(imagePath => {
  const fullPath = path.join(process.cwd(), 'public', imagePath);
  const exists = fs.existsSync(fullPath);

  if (exists) {
    console.log(`✅ ${imagePath}`);
    existingImages.push(imagePath);
  } else {
    console.log(`❌ ${imagePath} - NOT FOUND`);
    missingImages.push(imagePath);
    allExist = false;
  }
});

console.log('\n' + '='.repeat(60));
console.log(`📊 SUMMARY:`);
console.log(`✅ Found: ${existingImages.length} images`);
console.log(`❌ Missing: ${missingImages.length} images`);

if (missingImages.length > 0) {
  console.log('\n🚨 Missing images:');
  missingImages.forEach(img => console.log(`   - ${img}`));
}

console.log('\n📁 Available images in directories:');

// List what's actually in each directory
const imageDirs = ['services', 'hero', 'about'];
imageDirs.forEach(dir => {
  const dirPath = path.join(process.cwd(), 'public', 'images', dir);
  if (fs.existsSync(dirPath)) {
    const files = fs
      .readdirSync(dirPath)
      .filter(
        f => f.endsWith('.webp') || f.endsWith('.jpg') || f.endsWith('.png')
      );
    console.log(`\n📂 /images/${dir}/ (${files.length} files):`);
    files.forEach(file => console.log(`   - ${file}`));
  }
});

console.log('\n' + '='.repeat(60));

if (allExist) {
  console.log('🎉 All required images found! Ready for deployment.');
  process.exit(0);
} else {
  console.log('⚠️  Some images are missing. Check the paths above.');
  process.exit(1);
}
