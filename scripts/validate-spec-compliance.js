#!/usr/bin/env node

/**
 * Specification Compliance Validator
 * Validates implementation against mobile.md and final_master_instructions.md requirements
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating Specification Compliance...\n');

const results = {
  passed: [],
  failed: [],
  warnings: []
};

// Test 1: Mobile Testimonials - Check for shortened versions
console.log('📝 Test 1: Mobile Testimonials Implementation');
try {
  const testimonialsFile = fs.readFileSync(
    path.join(__dirname, '../src/components/sections/TestimonialsCarousel.tsx'),
    'utf8'
  );
  
  if (testimonialsFile.includes('mobileQuote')) {
    results.passed.push('✅ Mobile testimonials: Shortened versions implemented');
  } else {
    results.failed.push('❌ Mobile testimonials: Missing mobileQuote field');
  }
  
  if (testimonialsFile.includes('md:hidden') && testimonialsFile.includes('hidden md:block')) {
    results.passed.push('✅ Mobile testimonials: Responsive display logic implemented');
  } else {
    results.warnings.push('⚠️  Mobile testimonials: Check responsive display logic');
  }
} catch (error) {
  results.failed.push('❌ Mobile testimonials: File not found or unreadable');
}

// Test 2: CTA System - Check for correct text and aria-labels
console.log('\n📝 Test 2: CTA System Implementation');
try {
  const heroFile = fs.readFileSync(
    path.join(__dirname, '../src/components/HeroWithCharts.tsx'),
    'utf8'
  );
  
  if (heroFile.includes('Call Now') && heroFile.includes('Call for a Free Ad Plan')) {
    results.passed.push('✅ Hero CTAs: Mobile and desktop variants implemented');
  } else {
    results.failed.push('❌ Hero CTAs: Missing correct CTA text');
  }
  
  if (heroFile.includes('Call now to get your free, personalised ad plan')) {
    results.passed.push('✅ Hero CTAs: Correct aria-label implemented');
  } else {
    results.failed.push('❌ Hero CTAs: Missing or incorrect aria-label');
  }
  
  const stickyFile = fs.readFileSync(
    path.join(__dirname, '../src/components/StickyCTA.tsx'),
    'utf8'
  );
  
  if (stickyFile.includes('Call for a Free Ad Plan')) {
    results.passed.push('✅ Sticky CTA: Correct text implemented');
  } else {
    results.failed.push('❌ Sticky CTA: Missing correct text');
  }
  
  if (stickyFile.includes('Call now to get your free, personalised ad plan')) {
    results.passed.push('✅ Sticky CTA: Correct aria-label implemented');
  } else {
    results.failed.push('❌ Sticky CTA: Missing or incorrect aria-label');
  }
} catch (error) {
  results.failed.push('❌ CTA System: Files not found or unreadable');
}

// Test 3: Structured Data - Check for Service schemas
console.log('\n📝 Test 3: Structured Data Implementation');
try {
  const serviceSchemaFile = fs.readFileSync(
    path.join(__dirname, '../src/components/seo/ServiceSchema.tsx'),
    'utf8'
  );
  
  if (serviceSchemaFile.includes('ServiceSchema') && serviceSchemaFile.includes('@type": "Service')) {
    results.passed.push('✅ Service Schema: Component created');
  } else {
    results.failed.push('❌ Service Schema: Component missing or incomplete');
  }
  
  const servicePages = [
    'src/app/services/website-design/page.tsx',
    'src/app/services/hosting/page.tsx',
    'src/app/services/ad-campaigns/page.tsx',
    'src/app/services/analytics/page.tsx',
    'src/app/services/photography/page.tsx'
  ];
  
  let schemaCount = 0;
  servicePages.forEach(pagePath => {
    try {
      const pageContent = fs.readFileSync(path.join(__dirname, '..', pagePath), 'utf8');
      if (pageContent.includes('ServiceSchemas')) {
        schemaCount++;
      }
    } catch (e) {
      // Page might not exist
    }
  });
  
  if (schemaCount === servicePages.length) {
    results.passed.push(`✅ Service Schemas: All ${schemaCount} service pages have schemas`);
  } else {
    results.warnings.push(`⚠️  Service Schemas: Only ${schemaCount}/${servicePages.length} pages have schemas`);
  }
} catch (error) {
  results.failed.push('❌ Service Schema: Component not found');
}

// Test 4: Mobile Copy Length - Check for concise descriptions
console.log('\n📝 Test 4: Mobile Copy Optimization');
try {
  const homePageFile = fs.readFileSync(
    path.join(__dirname, '../src/app/page.tsx'),
    'utf8'
  );
  
  // Check if service descriptions are shortened
  const longPhrases = [
    'Fast, mobile-first websites that turn visitors into enquiries',
    'Make your site 82% faster with enterprise hosting',
    'Google Ads that bring real leads, not wasted clicks'
  ];
  
  let hasLongPhrases = false;
  longPhrases.forEach(phrase => {
    if (homePageFile.includes(phrase)) {
      hasLongPhrases = true;
    }
  });
  
  if (!hasLongPhrases) {
    results.passed.push('✅ Mobile Copy: Service descriptions shortened');
  } else {
    results.warnings.push('⚠️  Mobile Copy: Some descriptions may still be too long');
  }
} catch (error) {
  results.failed.push('❌ Mobile Copy: Homepage not found');
}

// Test 5: Hero Section - Check for "what Joe does" in first 2 lines
console.log('\n📝 Test 5: Hero Section Clarity');
try {
  const heroFile = fs.readFileSync(
    path.join(__dirname, '../src/components/HeroWithCharts.tsx'),
    'utf8'
  );
  
  if (heroFile.includes('I build fast websites, run Google Ads, and set up analytics')) {
    results.passed.push('✅ Hero Section: Clear statement of services in first line');
  } else {
    results.failed.push('❌ Hero Section: Missing clear service statement');
  }
} catch (error) {
  results.failed.push('❌ Hero Section: File not found');
}

// Print Results
console.log('\n' + '='.repeat(60));
console.log('📊 VALIDATION RESULTS');
console.log('='.repeat(60) + '\n');

if (results.passed.length > 0) {
  console.log('✅ PASSED TESTS:\n');
  results.passed.forEach(item => console.log(`   ${item}`));
  console.log('');
}

if (results.warnings.length > 0) {
  console.log('⚠️  WARNINGS:\n');
  results.warnings.forEach(item => console.log(`   ${item}`));
  console.log('');
}

if (results.failed.length > 0) {
  console.log('❌ FAILED TESTS:\n');
  results.failed.forEach(item => console.log(`   ${item}`));
  console.log('');
}

console.log('='.repeat(60));
console.log(`Summary: ${results.passed.length} passed, ${results.warnings.length} warnings, ${results.failed.length} failed`);
console.log('='.repeat(60) + '\n');

// Exit with error code if any tests failed
if (results.failed.length > 0) {
  process.exit(1);
}
