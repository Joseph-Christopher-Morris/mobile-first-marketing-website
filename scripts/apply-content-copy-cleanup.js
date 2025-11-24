#!/usr/bin/env node

/**
 * Content Copy Cleanup Script
 * Based on: docs/specs/CONTENT-COPY-CLEANUP-GUIDE.md
 * 
 * This script applies the following rules:
 * 1. Remove all em dashes (— and –)
 * 2. Maintain UK English throughout
 * 3. Keep current page theming
 * 4. Remove deprecated testimonials
 */

const fs = require('fs');
const path = require('path');

const filesToProcess = [
  'src/app/services/website-design/page.tsx',
  'src/app/services/ad-campaigns/page.tsx',
  'src/app/services/analytics/page.tsx',
  'src/app/services/hosting/page.tsx',
  'src/app/services/website-hosting/page.tsx',
  'src/app/free-audit/page.tsx',
];

// Em dash replacements based on context
const emDashReplacements = [
  // Clause connections - replace with full stop or connecting words
  {
    from: 'Takes 60 seconds — no obligation',
    to: 'Takes about 60 seconds with no obligation'
  },
  {
    from: "Every project is tailored to your specific needs — you'll get a precise quote before any work begins",
    to: "Every project is tailored to your specific needs. You will get a precise quote before any work begins"
  },
  {
    from: "This isn't just good practice—it's better for SEO, user experience, and legal compliance",
    to: "This is not just good practice. It is better for SEO, user experience, and legal compliance"
  },
  {
    from: '— includes custom events and conversion tracking',
    to: ' (includes custom events and conversion tracking)'
  },
  // Comments in code - replace with regular hyphen
  {
    from: '// Hampson Auctions — DRONE',
    to: '// Hampson Auctions - DRONE'
  },
  {
    from: '// Hampson Auctions — creative',
    to: '// Hampson Auctions - creative'
  },
  {
    from: '// The Times — UK Car Finance scandal',
    to: '// The Times - UK Car Finance scandal'
  },
];

// Deprecated testimonials to remove
const deprecatedTestimonials = {
  'Sarah Mitchell': {
    pattern: /<div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border-l-4 border-pink-600">[\s\S]*?Sarah Mitchell[\s\S]*?<\/div>/g,
    context: 'website-design'
  },
  'David Thompson': {
    pattern: /<div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border-l-4 border-purple-600">[\s\S]*?David Thompson[\s\S]*?<\/div>/g,
    context: 'website-design'
  },
  'Mark Stevens': {
    pattern: /<div className='bg-white rounded-xl p-6 shadow-lg border-l-4 border-brand-pink'>[\s\S]*?Mark Stevens[\s\S]*?<\/div>/g,
    context: 'analytics'
  },
  'Lisa Chen': {
    pattern: /<div className='bg-white rounded-xl p-6 shadow-lg border-l-4 border-purple-600'>[\s\S]*?Lisa Chen[\s\S]*?<\/div>/g,
    context: 'analytics'
  },
};

// Testimonial section headings to remove
const testimonialHeadingsToRemove = [
  {
    pattern: /<h2 className="text-2xl font-semibold text-slate-900 mb-6 text-center">\s*What Cheshire businesses say\s*<\/h2>/g,
    replacement: ''
  },
  {
    pattern: /<h2 className='text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center'>\s*What Cheshire businesses say\s*<\/h2>/g,
    replacement: ''
  },
];

// Testimonial sections to remove entirely
const testimonialSectionsToRemove = [
  {
    // Website Design testimonials section
    pattern: /<section className="max-w-5xl mx-auto px-4 pb-12">\s*<h2 className="text-2xl font-semibold text-slate-900 mb-6 text-center">\s*What Cheshire businesses say\s*<\/h2>[\s\S]*?<\/section>\s*(?=<!\-\- Real-World Performance Results \-\->)/g,
    replacement: ''
  },
  {
    // Analytics testimonials section
    pattern: /<section className='py-16 md:py-20 bg-gray-50'>\s*<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>\s*<h2 className='text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center'>\s*What Cheshire businesses say\s*<\/h2>[\s\S]*?<\/section>/g,
    replacement: ''
  },
];

function processFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`  ⚠️  File not found, skipping`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let changes = 0;

  // 1. Replace em dashes
  console.log('  📝 Replacing em dashes...');
  emDashReplacements.forEach(({ from, to }) => {
    if (content.includes(from)) {
      content = content.replace(new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), to);
      changes++;
      console.log(`    ✓ Replaced: "${from.substring(0, 40)}..."`);
    }
  });

  // 2. Remove testimonial sections entirely
  console.log('  🗑️  Removing testimonial sections...');
  testimonialSectionsToRemove.forEach(({ pattern, replacement }) => {
    const matches = content.match(pattern);
    if (matches) {
      content = content.replace(pattern, replacement);
      changes += matches.length;
      console.log(`    ✓ Removed ${matches.length} testimonial section(s)`);
    }
  });

  // 3. Remove individual deprecated testimonials (fallback)
  console.log('  🗑️  Removing individual testimonials...');
  Object.entries(deprecatedTestimonials).forEach(([name, { pattern }]) => {
    const matches = content.match(pattern);
    if (matches) {
      content = content.replace(pattern, '');
      changes += matches.length;
      console.log(`    ✓ Removed testimonial: ${name}`);
    }
  });

  // 4. Remove testimonial headings
  console.log('  🗑️  Removing testimonial headings...');
  testimonialHeadingsToRemove.forEach(({ pattern, replacement }) => {
    const matches = content.match(pattern);
    if (matches) {
      content = content.replace(pattern, replacement);
      changes += matches.length;
      console.log(`    ✓ Removed ${matches.length} heading(s)`);
    }
  });

  // 5. Check for US English (report only, don't auto-fix to avoid breaking code)
  const usEnglishTerms = ['optimize', 'optimized', 'optimization', 'color', 'behavior', 'center', 'analyze'];
  const foundUsTerms = usEnglishTerms.filter(term => {
    const regex = new RegExp(`\\b${term}\\b`, 'gi');
    return regex.test(content);
  });
  
  if (foundUsTerms.length > 0) {
    console.log(`  ⚠️  Found US English terms (manual review needed): ${foundUsTerms.join(', ')}`);
  }

  if (changes > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  ✅ Applied ${changes} change(s)`);
  } else {
    console.log(`  ℹ️  No changes needed`);
  }
}

console.log('🧹 Content Copy Cleanup Script');
console.log('================================\n');
console.log('Based on: docs/specs/CONTENT-COPY-CLEANUP-GUIDE.md\n');

filesToProcess.forEach(processFile);

console.log('\n✅ Content cleanup complete!');
console.log('\nNext steps:');
console.log('1. Review changes with: git diff');
console.log('2. Test locally: npm run build');
console.log('3. Deploy: node scripts/deploy.js');
