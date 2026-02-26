#!/usr/bin/env node

/**
 * Fix Broken Blog Images - Round 2
 * Fixes image references in blog posts based on Ahrefs crawl data
 * 
 * Issues found:
 * 1. Files with "(1)" suffix exist as .jpg but referenced as .webp
 * 2. WhatsApp images exist with different extensions (.jpg, .jpeg)
 * 3. Chart images have naming mismatches
 * 4. Some images need extension corrections
 */

const fs = require('fs');
const path = require('path');

// Mapping of broken image references to correct filenames
const imageFixMap = {
  // Model car images - exist as .jpg but referenced as .webp
  '240708-Model_Car_Collection-69 (1).webp': '240708-Model_Car_Collection-69 (1).jpg',
  '240620-Model_Car_Collection-96 (1).webp': '240620-Model_Car_Collection-96 (1).jpg',
  '240804-Model_Car_Collection-46 (1).webp': '240804-Model_Car_Collection-46 (1).jpg',
  '240616-Model_Car_Collection-10 (1).webp': '240616-Model_Car_Collection-10 (1).jpg',
  '240708-Model_Car_Collection-21 (1).webp': '240708-Model_Car_Collection-21 (1).jpg',
  
  // WhatsApp images - exist with different extensions
  'WhatsApp Image 2025-07-04 at 8.44.20 PM (1).webp': 'WhatsApp Image 2025-07-04 at 8.44.20 PM (1).jpg',
  'WhatsApp Image 2025-07-05 at 9.00.50 PM.webp': 'WhatsApp Image 2025-07-05 at 9.00.50 PM.jpg',
  'WhatsApp Image 2025-07-06 at 9.09.08 PM.webp': 'WhatsApp Image 2025-07-06 at 9.09.08 PM.jpeg',
  
  // Chart/graph images - naming mismatches
  'image (1).webp': 'image (1).jpg',
  'image (2).webp': 'image (2).jpg',
  
  // Chart images that need .png extension
  'Stock_Photography_Earnings_Comparison_Clear.webp': 'Stock_Photography_Earnings_Comparison_Clear.png',
  'Cumulative_Shutterstock_Downloads_Earnings_Jan-Apr2023.webp': 'Cumulative_Shutterstock_Downloads_Earnings_Jan-Apr2023.png',
  'Stock_Photography_Revenue_Bar_Chart.webp': 'Stock_Photography_Revenue_Bar_Chart.png',
  
  // Screenshot images - lowercase to uppercase (with spaces)
  'screenshot-2025-08-11-143943.webp': 'Screenshot 2025-08-11 143943.webp',
  'screenshot-2025-05-25-191000.webp': 'Screenshot 2025-05-25 191000.webp',
  'screenshot-2025-08-14-093957.webp': 'Screenshot 2025-08-14 093957.webp',
  'screenshot-2025-08-14-094204.webp': 'Screenshot 2025-08-14 094204.webp',
  'screenshot-2025-08-14-093805-cropped.webp': 'Screenshot 2025-08-14 093805-cropped.webp',
  'screenshot-2025-08-14-094416.webp': 'Screenshot 2025-08-14 094416.webp',
};

// Blog content files to update
const blogFiles = [
  'src/content/blog/paid-ads-campaign-learnings.ts',
  'src/content/blog/ebay-business-side-part-5.ts',
  'src/content/blog/ebay-repeat-buyers-part-4.ts',
  'src/content/blog/stock-photography-getting-started.ts',
  'src/content/blog/stock-photography-lessons.ts',
  'src/content/blog/stock-photography-breakthrough.ts',
  'src/content/blog/stock-photography-income-growth.ts',
  'src/content/blog/ebay-model-car-sales-timing-bundles.ts',
  'src/content/blog/ebay-photography-workflow-part-2.ts',
  'src/content/blog/exploring-istock-data-deepmeta.ts',
];

let totalFixes = 0;
let filesModified = 0;

console.log('🔧 Starting Blog Image Fix - Round 2\n');

blogFiles.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  let fileModified = false;
  let fixCount = 0;
  
  // Apply each fix
  Object.entries(imageFixMap).forEach(([broken, correct]) => {
    const brokenPath = `/images/blog/${broken}`;
    const correctPath = `/images/blog/${correct}`;
    
    if (content.includes(brokenPath)) {
      content = content.replace(new RegExp(brokenPath.replace(/[()]/g, '\\$&'), 'g'), correctPath);
      fixCount++;
      fileModified = true;
      console.log(`  ✓ Fixed: ${broken} → ${correct}`);
    }
  });
  
  if (fileModified) {
    fs.writeFileSync(fullPath, content, 'utf8');
    filesModified++;
    totalFixes += fixCount;
    console.log(`✅ Updated ${filePath} (${fixCount} fixes)\n`);
  }
});

console.log('\n📊 Summary:');
console.log(`   Files modified: ${filesModified}`);
console.log(`   Total fixes applied: ${totalFixes}`);
console.log('\n✨ Blog image fix complete!\n');
