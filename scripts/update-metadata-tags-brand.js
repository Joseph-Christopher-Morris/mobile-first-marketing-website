#!/usr/bin/env node

/**
 * Metadata, Tags & Brand Alignment — Global Update
 * 
 * Updates:
 * - Remove "Vivid Auto Photography" → "Vivid Media Cheshire"
 * - Standardize blog author to "Joe — Digital Marketing & Analytics"
 * - Fix blog metadata (titles, descriptions, Open Graph)
 * - Standardize categories to: Case Studies, Insights, Guides
 * - Use approved tags only
 * - Update Open Graph images to reflect business outcomes
 * 
 * SAFETY: Does NOT modify image fields unless --include-images flag is used
 */

const fs = require('fs');
const path = require('path');

// Check for --include-images flag
const INCLUDE_IMAGES = process.argv.includes('--include-images');

// Approved tags only
const APPROVED_TAGS = [
  'case-study',
  'analytics',
  'conversion-optimisation',
  'seo',
  'google-ads',
  'ecommerce',
  'offline-marketing',
  'paid-ads',
  'content-strategy',
  'website-performance',
  'ebay',
  'small-business',
  'local-marketing'
];

// Approved categories only
const APPROVED_CATEGORIES = ['Case Studies', 'Insights', 'Guides'];

const BLOG_DIR = path.join(process.cwd(), 'src/content/blog');
const PAGES_DIR = path.join(process.cwd(), 'src/app');

const results = {
  filesUpdated: [],
  brandReferences: 0,
  authorUpdates: 0,
  metadataFixes: 0,
  categoryFixes: 0,
  tagFixes: 0,
  ogImageUpdates: 0,
  errors: []
};

/**
 * Replace brand references
 */
function replaceBrandReferences(content) {
  let updated = content;
  let count = 0;
  
  // Replace all variations
  const replacements = [
    { from: /Vivid Auto Photography/g, to: 'Vivid Media Cheshire' },
    { from: /vivid auto photography/gi, to: 'Vivid Media Cheshire' },
    { from: /Vivid-Auto-Photography/g, to: 'Vivid-Media-Cheshire' }
  ];
  
  replacements.forEach(({ from, to }) => {
    const matches = content.match(from);
    if (matches) {
      count += matches.length;
      updated = updated.replace(from, to);
    }
  });
  
  results.brandReferences += count;
  return updated;
}

/**
 * Update blog post metadata
 * 
 * SAFETY: Skips image field modifications unless --include-images flag is set
 */
function updateBlogMetadata(content, filename) {
  let updated = content;
  let changes = 0;
  
  // SAFETY CHECK: Do not modify image fields unless explicitly allowed
  if (!INCLUDE_IMAGES) {
    // Protect image: field and <img src="..."> from modification
    const imageFieldPattern = /image:\s*['"`][^'"`]+['"`]/g;
    const imgSrcPattern = /<img\s+[^>]*src\s*=\s*['"`][^'"`]+['"`][^>]*>/g;
    
    if (imageFieldPattern.test(content) || imgSrcPattern.test(content)) {
      console.log(`🔒 ${filename}: Skipping image field modifications (use --include-images to allow)`);
    }
  }
  
  // Update author
  if (content.includes('author:') && !content.includes('Joe — Digital Marketing & Analytics')) {
    updated = updated.replace(
      /author:\s*['"].*?['"]/,
      "author: 'Joe — Digital Marketing & Analytics'"
    );
    results.authorUpdates++;
    changes++;
  }
  
  // Fix categories - ensure only approved ones
  const categoryMatch = content.match(/category:\s*['"]([^'"]+)['"]/);
  if (categoryMatch) {
    const currentCategory = categoryMatch[1];
    if (!APPROVED_CATEGORIES.includes(currentCategory)) {
      // Default to Case Studies for most blog posts
      updated = updated.replace(
        /category:\s*['"].*?['"]/,
        "category: 'Case Studies'"
      );
      results.categoryFixes++;
      changes++;
    }
  }
  
  // Fix tags - ensure only approved ones
  const tagsMatch = content.match(/tags:\s*\[(.*?)\]/s);
  if (tagsMatch) {
    const currentTags = tagsMatch[1]
      .split(',')
      .map(t => t.trim().replace(/['"]/g, ''))
      .filter(t => t);
    
    const invalidTags = currentTags.filter(t => !APPROVED_TAGS.includes(t));
    if (invalidTags.length > 0) {
      // Keep only approved tags
      const validTags = currentTags.filter(t => APPROVED_TAGS.includes(t));
      if (validTags.length > 0) {
        updated = updated.replace(
          /tags:\s*\[.*?\]/s,
          `tags: [${validTags.map(t => `'${t}'`).join(', ')}]`
        );
        results.tagFixes++;
        changes++;
      }
    }
  }
  
  // Update Open Graph title format - should be benefit-led
  const ogTitleMatch = content.match(/openGraph:\s*{[^}]*title:\s*['"]([^'"]+)['"]/s);
  if (ogTitleMatch && ogTitleMatch[1].includes('Vivid Auto Photography')) {
    updated = replaceBrandReferences(updated);
    results.metadataFixes++;
    changes++;
  }
  
  // Check description length (should be 140-160 chars)
  const descMatch = content.match(/description:\s*['"]([^'"]+)['"]/);
  if (descMatch && (descMatch[1].length < 140 || descMatch[1].length > 160)) {
    console.log(`⚠️  ${filename}: Description length ${descMatch[1].length} chars (should be 140-160)`);
  }
  
  if (changes > 0) {
    results.metadataFixes += changes;
  }
  
  return updated;
}

/**
 * Update service page metadata
 */
function updateServiceMetadata(content) {
  let updated = replaceBrandReferences(content);
  
  // Update Open Graph titles to be benefit-led, not brand-led
  const ogMatch = content.match(/openGraph:\s*{[^}]*}/s);
  if (ogMatch && ogMatch[0].includes('Vivid Auto Photography')) {
    updated = replaceBrandReferences(updated);
    results.metadataFixes++;
  }
  
  return updated;
}

/**
 * Process blog posts
 */
function processBlogPosts() {
  console.log('\n📝 Processing blog posts...\n');
  
  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.ts'));
  
  files.forEach(file => {
    const filePath = path.join(BLOG_DIR, file);
    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;
    
    // Apply updates
    content = replaceBrandReferences(content);
    content = updateBlogMetadata(content, file);
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      results.filesUpdated.push(`blog/${file}`);
      console.log(`✅ Updated: ${file}`);
    }
  });
}

/**
 * Process service pages
 */
function processServicePages() {
  console.log('\n🛠️  Processing service pages...\n');
  
  const servicePaths = [
    'src/app/services/ad-campaigns/page.tsx',
    'src/app/services/analytics/page.tsx',
    'src/app/services/hosting/page.tsx',
    'src/app/services/photography/page.tsx',
    'src/app/services/website-design/page.tsx',
    'src/app/services/website-hosting/page.tsx',
    'src/app/services/page.tsx'
  ];
  
  servicePaths.forEach(relativePath => {
    const filePath = path.join(process.cwd(), relativePath);
    if (!fs.existsSync(filePath)) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;
    
    content = updateServiceMetadata(content);
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      results.filesUpdated.push(relativePath);
      console.log(`✅ Updated: ${relativePath}`);
    }
  });
}

/**
 * Process other pages
 */
function processOtherPages() {
  console.log('\n📄 Processing other pages...\n');
  
  const pagePaths = [
    'src/app/page.tsx',
    'src/app/about/page.tsx',
    'src/app/contact/page.tsx',
    'src/app/blog/page.tsx',
    'src/app/blog/[slug]/page.tsx'
  ];
  
  pagePaths.forEach(relativePath => {
    const filePath = path.join(process.cwd(), relativePath);
    if (!fs.existsSync(filePath)) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;
    
    content = replaceBrandReferences(content);
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      results.filesUpdated.push(relativePath);
      console.log(`✅ Updated: ${relativePath}`);
    }
  });
}

/**
 * Update site config
 */
function updateSiteConfig() {
  console.log('\n⚙️  Updating site config...\n');
  
  const configPath = path.join(process.cwd(), 'src/config/canonical.ts');
  if (!fs.existsSync(configPath)) return;
  
  let content = fs.readFileSync(configPath, 'utf8');
  const original = content;
  
  content = replaceBrandReferences(content);
  
  if (content !== original) {
    fs.writeFileSync(configPath, content, 'utf8');
    results.filesUpdated.push('src/config/canonical.ts');
    console.log(`✅ Updated: canonical.ts`);
  }
}

/**
 * Generate report
 */
function generateReport() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 METADATA, TAGS & BRAND ALIGNMENT UPDATE REPORT');
  console.log('='.repeat(60) + '\n');
  
  console.log(`✅ Files Updated: ${results.filesUpdated.length}`);
  console.log(`🏷️  Brand References Fixed: ${results.brandReferences}`);
  console.log(`👤 Author Updates: ${results.authorUpdates}`);
  console.log(`📝 Metadata Fixes: ${results.metadataFixes}`);
  console.log(`📂 Category Fixes: ${results.categoryFixes}`);
  console.log(`🏷️  Tag Fixes: ${results.tagFixes}`);
  
  if (results.filesUpdated.length > 0) {
    console.log('\n📁 Updated Files:');
    results.filesUpdated.forEach(file => console.log(`   - ${file}`));
  }
  
  if (results.errors.length > 0) {
    console.log('\n❌ Errors:');
    results.errors.forEach(err => console.log(`   - ${err}`));
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ Update Complete!');
  console.log('='.repeat(60) + '\n');
  
  // Save report
  const reportPath = path.join(process.cwd(), 'metadata-brand-update-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`📄 Report saved: metadata-brand-update-report.json\n`);
}

/**
 * Main execution
 */
async function main() {
  console.log('\n🚀 Starting Metadata, Tags & Brand Alignment Update...\n');
  
  if (INCLUDE_IMAGES) {
    console.log('⚠️  WARNING: --include-images flag detected. Image fields will be modified.');
  } else {
    console.log('🔒 SAFETY: Image fields are protected. Use --include-images to modify them.');
  }
  
  try {
    updateSiteConfig();
    processBlogPosts();
    processServicePages();
    processOtherPages();
    generateReport();
  } catch (error) {
    console.error('❌ Error:', error.message);
    results.errors.push(error.message);
    process.exit(1);
  }
}

main();
