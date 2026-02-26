#!/usr/bin/env node

/**
 * Validate Blog Images - Round 2
 * Verifies all blog image references point to existing files
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating Blog Images - Round 2\n');

// Get all blog content files
const blogDir = path.join(process.cwd(), 'src/content/blog');
const blogFiles = fs.readdirSync(blogDir)
  .filter(f => f.endsWith('.ts'))
  .map(f => path.join(blogDir, f));
const imageDir = path.join(process.cwd(), 'public/images/blog');

let totalImages = 0;
let brokenImages = 0;
let validImages = 0;

const brokenImagesList = [];

blogFiles.forEach(filePath => {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Extract all image references - match complete filenames with extensions
  const imageRegex = /\/images\/blog\/([^"'\s<>]+\.(webp|jpg|jpeg|png|gif))/gi;
  let match;
  
  while ((match = imageRegex.exec(content)) !== null) {
    totalImages++;
    const imagePath = match[1];
    
    // Remove query parameters
    const cleanImagePath = imagePath.split('?')[0];
    const fullPath = path.join(imageDir, cleanImagePath);
    
    if (fs.existsSync(fullPath)) {
      validImages++;
    } else {
      brokenImages++;
      brokenImagesList.push({
        file: path.basename(filePath),
        image: cleanImagePath
      });
    }
  }
});

console.log('📊 Validation Results:\n');
console.log(`   Total images referenced: ${totalImages}`);
console.log(`   ✅ Valid images: ${validImages}`);
console.log(`   ❌ Broken images: ${brokenImages}\n`);

if (brokenImagesList.length > 0) {
  console.log('🚨 Broken Images Found:\n');
  brokenImagesList.forEach(item => {
    console.log(`   ${item.file}: ${item.image}`);
  });
  console.log('');
  process.exit(1);
} else {
  console.log('✨ All blog images are valid!\n');
  process.exit(0);
}
