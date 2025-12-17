#!/usr/bin/env node

/**
 * QA Validation for Metadata, Tags & Brand Alignment
 * 
 * Checks:
 * - No legacy brand references remain
 * - Metadata consistent across similar posts
 * - Tags reused across multiple posts
 * - Categories limited to 3 approved ones
 * - Author attribution correct
 * - Description lengths appropriate
 */

const fs = require('fs');
const path = require('path');

const APPROVED_TAGS = [
  'case-study', 'analytics', 'conversion-optimisation', 'seo', 'google-ads',
  'ecommerce', 'offline-marketing', 'paid-ads', 'content-strategy',
  'website-performance', 'ebay', 'small-business', 'local-marketing'
];

const APPROVED_CATEGORIES = ['Case Studies', 'Insights', 'Guides'];
const CORRECT_AUTHOR = 'Joe — Digital Marketing & Analytics';
const LEGACY_BRANDS = ['Vivid Auto Photography', 'vivid auto photography'];

const issues = {
  legacyBrands: [],
  wrongAuthor: [],
  invalidCategories: [],
  invalidTags: [],
  descriptionLength: [],
  missingMetadata: [],
  tagUsage: {},
  categoryUsage: {}
};

function checkFile(filePath, relativePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check for legacy brand references
  LEGACY_BRANDS.forEach(brand => {
    if (content.toLowerCase().includes(brand.toLowerCase())) {
      issues.legacyBrands.push({
        file: relativePath,
        brand: brand,
        context: content.substring(content.toLowerCase().indexOf(brand.toLowerCase()) - 50, content.toLowerCase().indexOf(brand.toLowerCase()) + 100)
      });
    }
  });
  
  // Check author
  const authorMatch = content.match(/author:\s*['"]([^'"]+)['"]/);
  if (authorMatch && authorMatch[1] !== CORRECT_AUTHOR) {
    issues.wrongAuthor.push({
      file: relativePath,
      current: authorMatch[1],
      expected: CORRECT_AUTHOR
    });
  }
  
  // Check category
  const categoryMatch = content.match(/category:\s*['"]([^'"]+)['"]/);
  if (categoryMatch) {
    const category = categoryMatch[1];
    issues.categoryUsage[category] = (issues.categoryUsage[category] || 0) + 1;
    
    if (!APPROVED_CATEGORIES.includes(category)) {
      issues.invalidCategories.push({
        file: relativePath,
        category: category
      });
    }
  }
  
  // Check tags
  const tagsMatch = content.match(/tags:\s*\[(.*?)\]/s);
  if (tagsMatch) {
    const tags = tagsMatch[1]
      .split(',')
      .map(t => t.trim().replace(/['"]/g, ''))
      .filter(t => t);
    
    tags.forEach(tag => {
      issues.tagUsage[tag] = (issues.tagUsage[tag] || 0) + 1;
      
      if (!APPROVED_TAGS.includes(tag)) {
        issues.invalidTags.push({
          file: relativePath,
          tag: tag
        });
      }
    });
  }
  
  // Check description length
  const descMatch = content.match(/description:\s*['"]([^'"]+)['"]/);
  if (descMatch) {
    const length = descMatch[1].length;
    if (length < 140 || length > 160) {
      issues.descriptionLength.push({
        file: relativePath,
        length: length,
        description: descMatch[1]
      });
    }
  }
}

function validateBlogPosts() {
  console.log('\n📝 Validating blog posts...\n');
  
  const blogDir = path.join(process.cwd(), 'src/content/blog');
  const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.ts'));
  
  files.forEach(file => {
    checkFile(path.join(blogDir, file), `blog/${file}`);
  });
}

function validatePages() {
  console.log('📄 Validating pages...\n');
  
  const pagePaths = [
    'src/app/page.tsx',
    'src/app/about/page.tsx',
    'src/app/contact/page.tsx',
    'src/app/blog/page.tsx',
    'src/app/blog/[slug]/page.tsx',
    'src/app/services/ad-campaigns/page.tsx',
    'src/app/services/analytics/page.tsx',
    'src/app/services/hosting/page.tsx',
    'src/app/services/photography/page.tsx',
    'src/app/services/website-design/page.tsx',
    'src/app/services/website-hosting/page.tsx',
    'src/app/services/page.tsx',
    'src/config/site.ts'
  ];
  
  pagePaths.forEach(relativePath => {
    const filePath = path.join(process.cwd(), relativePath);
    if (fs.existsSync(filePath)) {
      checkFile(filePath, relativePath);
    }
  });
}

function generateReport() {
  console.log('\n' + '='.repeat(70));
  console.log('📊 METADATA & BRAND ALIGNMENT QA REPORT');
  console.log('='.repeat(70) + '\n');
  
  let hasIssues = false;
  
  // Legacy brand references
  if (issues.legacyBrands.length > 0) {
    hasIssues = true;
    console.log('❌ LEGACY BRAND REFERENCES FOUND:');
    issues.legacyBrands.forEach(issue => {
      console.log(`   ${issue.file}: "${issue.brand}"`);
    });
    console.log('');
  } else {
    console.log('✅ No legacy brand references found\n');
  }
  
  // Wrong author
  if (issues.wrongAuthor.length > 0) {
    hasIssues = true;
    console.log('❌ INCORRECT AUTHOR ATTRIBUTION:');
    issues.wrongAuthor.forEach(issue => {
      console.log(`   ${issue.file}: "${issue.current}" (should be "${issue.expected}")`);
    });
    console.log('');
  } else {
    console.log('✅ All author attributions correct\n');
  }
  
  // Invalid categories
  if (issues.invalidCategories.length > 0) {
    hasIssues = true;
    console.log('❌ INVALID CATEGORIES:');
    issues.invalidCategories.forEach(issue => {
      console.log(`   ${issue.file}: "${issue.category}"`);
    });
    console.log('');
  } else {
    console.log('✅ All categories valid\n');
  }
  
  // Invalid tags
  if (issues.invalidTags.length > 0) {
    hasIssues = true;
    console.log('❌ INVALID TAGS:');
    issues.invalidTags.forEach(issue => {
      console.log(`   ${issue.file}: "${issue.tag}"`);
    });
    console.log('');
  } else {
    console.log('✅ All tags valid\n');
  }
  
  // Description length warnings
  if (issues.descriptionLength.length > 0) {
    console.log('⚠️  DESCRIPTION LENGTH WARNINGS (should be 140-160 chars):');
    issues.descriptionLength.forEach(issue => {
      console.log(`   ${issue.file}: ${issue.length} chars`);
    });
    console.log('');
  } else {
    console.log('✅ All descriptions within optimal length\n');
  }
  
  // Category usage
  console.log('📂 CATEGORY USAGE:');
  Object.entries(issues.categoryUsage)
    .sort((a, b) => b[1] - a[1])
    .forEach(([category, count]) => {
      const valid = APPROVED_CATEGORIES.includes(category) ? '✅' : '❌';
      console.log(`   ${valid} ${category}: ${count} posts`);
    });
  console.log('');
  
  // Tag usage (top 10)
  console.log('🏷️  TAG USAGE (Top 10):');
  Object.entries(issues.tagUsage)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([tag, count]) => {
      const valid = APPROVED_TAGS.includes(tag) ? '✅' : '❌';
      console.log(`   ${valid} ${tag}: ${count} posts`);
    });
  console.log('');
  
  console.log('='.repeat(70));
  if (hasIssues) {
    console.log('❌ QA FAILED - Issues found that need fixing');
  } else {
    console.log('✅ QA PASSED - All checks successful!');
  }
  console.log('='.repeat(70) + '\n');
  
  // Save report
  const reportPath = path.join(process.cwd(), 'metadata-brand-qa-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(issues, null, 2));
  console.log(`📄 Detailed report saved: metadata-brand-qa-report.json\n`);
  
  return !hasIssues;
}

async function main() {
  console.log('\n🔍 Starting QA Validation...\n');
  
  try {
    validateBlogPosts();
    validatePages();
    const passed = generateReport();
    
    process.exit(passed ? 0 : 1);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
