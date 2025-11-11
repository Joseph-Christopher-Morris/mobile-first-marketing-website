#!/usr/bin/env node

/**
 * Press Logos and Services Layout Fix Validation
 * Validates the deployment of updated press logos and services card spacing
 */

const https = require('https');
const fs = require('fs');

const CLOUDFRONT_URL = 'https://d15sc9fc739ev2.cloudfront.net';

const VALIDATION_CHECKS = [
  {
    name: 'Home Page',
    path: '/',
    checks: [
      { type: 'content', pattern: /PressLogoRow/, description: 'Uses PressLogoRow component' },
      { type: 'content', pattern: /rounded-xl bg-white\/95/, description: 'Has white panel with rounded-xl' },
      { type: 'content', pattern: /gap-10 xl:gap-12/, description: 'Services cards have proper spacing' },
    ]
  },
  {
    name: 'Photography Page',
    path: '/services/photography',
    checks: [
      { type: 'content', pattern: /PressLogoRow variant="photography"/, description: 'Uses photography variant' },
      { type: 'content', pattern: /rounded-xl bg-white\/95/, description: 'Has white panel with rounded-xl' },
      { type: 'content', pattern: /As featured in:/, description: 'Has "As featured in:" label' },
    ]
  },
  {
    name: 'Services Page',
    path: '/services',
    checks: [
      { type: 'content', pattern: /gap-10 xl:gap-12/, description: 'Services cards have proper spacing' },
      { type: 'content', pattern: /max-w-6xl/, description: 'Uses max-w-6xl container' },
    ]
  },
];

const SVG_LOGOS = [
  '/images/press-logos/bbc-logo.svg',
  '/images/press-logos/forbes-logo.svg',
  '/images/press-logos/financial-times-logo.svg',
  '/images/press-logos/cnn-logo.svg',
  '/images/press-logos/daily-mail-logo.svg',
  '/images/press-logos/business-insider-logo.svg',
  '/images/press-logos/autotrader-logo.svg',
];

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    }).on('error', reject);
  });
}

async function validatePage(check) {
  console.log(`\n📄 Validating: ${check.name}`);
  console.log(`   URL: ${CLOUDFRONT_URL}${check.path}`);
  
  try {
    const { status, data } = await fetchUrl(`${CLOUDFRONT_URL}${check.path}`);
    
    if (status !== 200) {
      console.log(`   ❌ HTTP ${status}`);
      return false;
    }
    
    let allPassed = true;
    for (const test of check.checks) {
      if (test.type === 'content') {
        const passed = test.pattern.test(data);
        console.log(`   ${passed ? '✓' : '✗'} ${test.description}`);
        if (!passed) allPassed = false;
      }
    }
    
    return allPassed;
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return false;
  }
}

async function validateSvgLogos() {
  console.log(`\n🖼️  Validating SVG Logos`);
  
  let allPassed = true;
  for (const logo of SVG_LOGOS) {
    try {
      const { status } = await fetchUrl(`${CLOUDFRONT_URL}${logo}`);
      const passed = status === 200;
      console.log(`   ${passed ? '✓' : '✗'} ${logo.split('/').pop()}`);
      if (!passed) allPassed = false;
    } catch (error) {
      console.log(`   ✗ ${logo.split('/').pop()} - ${error.message}`);
      allPassed = false;
    }
  }
  
  return allPassed;
}

async function main() {
  console.log('========================================');
  console.log('Press Logos & Services Layout Validation');
  console.log('========================================');
  
  const results = [];
  
  // Validate pages
  for (const check of VALIDATION_CHECKS) {
    const passed = await validatePage(check);
    results.push({ name: check.name, passed });
  }
  
  // Validate SVG logos
  const svgsPassed = await validateSvgLogos();
  results.push({ name: 'SVG Logos', passed: svgsPassed });
  
  // Summary
  console.log('\n========================================');
  console.log('Validation Summary');
  console.log('========================================');
  
  const allPassed = results.every(r => r.passed);
  results.forEach(r => {
    console.log(`${r.passed ? '✓' : '✗'} ${r.name}`);
  });
  
  console.log('\n========================================');
  if (allPassed) {
    console.log('✓ All validations passed!');
    console.log('\nManual checks to perform:');
    console.log('1. Home hero: 6 logos in neat grid, no overlap');
    console.log('2. Photography hero: 4 logos visible with good contrast');
    console.log('3. Services cards: generous spacing on desktop (3 top, 2 bottom)');
    console.log('4. Mobile: logos wrap to 2-3 per row, cards stack properly');
  } else {
    console.log('✗ Some validations failed');
    process.exit(1);
  }
}

main().catch(console.error);
