#!/usr/bin/env node

/**
 * Validation Script for Pricing & Logos Fix
 * Verifies all changes are in place before deployment
 */

const fs = require('fs');
const path = require('path');

console.log('\n========================================');
console.log('Validating Pricing & Logos Fix');
console.log('========================================\n');

let allChecks = true;

// Check 1: Build directory exists
console.log('✓ Checking build directory...');
if (!fs.existsSync('out')) {
  console.log('  ❌ Build directory "out" not found!');
  console.log('  → Run: npm run build');
  allChecks = false;
} else {
  console.log('  ✅ Build directory exists');
}

// Check 2: Pricing page exists in build
console.log('\n✓ Checking pricing page...');
if (!fs.existsSync('out/pricing.html') && !fs.existsSync('out/pricing/index.html')) {
  console.log('  ❌ Pricing page not found in build!');
  allChecks = false;
} else {
  console.log('  ✅ Pricing page exists in build');
}

// Check 3: PressLogos component updated
console.log('\n✓ Checking PressLogos component...');
const pressLogosPath = 'src/components/PressLogos.tsx';
if (fs.existsSync(pressLogosPath)) {
  const content = fs.readFileSync(pressLogosPath, 'utf8');
  if (content.includes('hue-rotate') || content.includes('sepia') || content.includes('saturate-[2000%]')) {
    console.log('  ❌ PressLogos still has complex hover effects!');
    allChecks = false;
  } else if (content.includes('opacity-80 hover:opacity-100')) {
    console.log('  ✅ PressLogos simplified correctly');
  } else {
    console.log('  ⚠️  PressLogos may need review');
  }
} else {
  console.log('  ❌ PressLogos component not found!');
  allChecks = false;
}

// Check 4: Pricing page source exists
console.log('\n✓ Checking pricing page source...');
if (!fs.existsSync('src/app/pricing/page.tsx')) {
  console.log('  ❌ Pricing page source not found!');
  allChecks = false;
} else {
  console.log('  ✅ Pricing page source exists');
}

// Check 5: Navigation includes pricing
console.log('\n✓ Checking navigation...');
const headerPath = 'src/components/layout/Header.tsx';
if (fs.existsSync(headerPath)) {
  const content = fs.readFileSync(headerPath, 'utf8');
  if (content.includes("{ label: 'Pricing', href: '/pricing' }")) {
    console.log('  ✅ Pricing link in header navigation');
  } else {
    console.log('  ❌ Pricing link missing from header!');
    allChecks = false;
  }
}

// Check 6: Footer includes pricing
console.log('\n✓ Checking footer...');
const footerPath = 'src/components/layout/Footer.tsx';
if (fs.existsSync(footerPath)) {
  const content = fs.readFileSync(footerPath, 'utf8');
  if (content.includes("href='/pricing'")) {
    console.log('  ✅ Pricing link in footer');
  } else {
    console.log('  ❌ Pricing link missing from footer!');
    allChecks = false;
  }
}

// Check 7: Service pages have pricing blocks
console.log('\n✓ Checking service pages...');
const servicePages = [
  'src/app/services/hosting/page.tsx',
  'src/app/services/photography/page.tsx',
  'src/app/services/ad-campaigns/page.tsx',
  'src/app/services/analytics/page.tsx'
];

servicePages.forEach(pagePath => {
  if (fs.existsSync(pagePath)) {
    const content = fs.readFileSync(pagePath, 'utf8');
    const pageName = path.basename(path.dirname(pagePath));
    if (content.includes('Pricing') && content.includes('/pricing')) {
      console.log(`  ✅ ${pageName} has pricing block`);
    } else {
      console.log(`  ❌ ${pageName} missing pricing block!`);
      allChecks = false;
    }
  }
});

// Check 8: Home page has pricing teaser
console.log('\n✓ Checking home page...');
const homePath = 'src/app/page.tsx';
if (fs.existsSync(homePath)) {
  const content = fs.readFileSync(homePath, 'utf8');
  if (content.includes('Simple, transparent pricing') && content.includes('View full pricing')) {
    console.log('  ✅ Home page has pricing teaser');
  } else {
    console.log('  ❌ Home page missing pricing teaser!');
    allChecks = false;
  }
}

// Check 9: Press logos on home page
console.log('\n✓ Checking press logos on home page...');
if (fs.existsSync(homePath)) {
  const content = fs.readFileSync(homePath, 'utf8');
  if (content.includes('<PressLogos />') || content.includes('<PressLogos')) {
    console.log('  ✅ Press logos on home page');
  } else {
    console.log('  ❌ Press logos missing from home page!');
    allChecks = false;
  }
}

// Check 10: Press logos on photography page
console.log('\n✓ Checking press logos on photography page...');
const photoPath = 'src/app/services/photography/page.tsx';
if (fs.existsSync(photoPath)) {
  const content = fs.readFileSync(photoPath, 'utf8');
  if (content.includes('<PressLogos />') || content.includes('<PressLogos')) {
    console.log('  ✅ Press logos on photography page');
  } else {
    console.log('  ❌ Press logos missing from photography page!');
    allChecks = false;
  }
}

// Check 11: Deployment script exists
console.log('\n✓ Checking deployment script...');
if (!fs.existsSync('deploy-pricing-logos-fix.ps1')) {
  console.log('  ❌ Deployment script not found!');
  allChecks = false;
} else {
  console.log('  ✅ Deployment script exists');
}

// Final summary
console.log('\n========================================');
if (allChecks) {
  console.log('✅ All validation checks passed!');
  console.log('========================================\n');
  console.log('Ready to deploy:');
  console.log('  .\\deploy-pricing-logos-fix.bat\n');
  process.exit(0);
} else {
  console.log('❌ Some validation checks failed!');
  console.log('========================================\n');
  console.log('Please fix the issues above before deploying.\n');
  process.exit(1);
}
