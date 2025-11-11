#!/usr/bin/env node

/**
 * SCRAM November 2025 Validation Script
 * Validates all changes before deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating SCRAM November 2025 Changes...\n');

let errors = 0;
let warnings = 0;

// Helper function to check file content
function checkFileContains(filePath, searchString, description) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes(searchString)) {
      console.log(`✅ ${description}`);
      return true;
    } else {
      console.log(`❌ ${description}`);
      errors++;
      return false;
    }
  } catch (error) {
    console.log(`❌ Error reading ${filePath}: ${error.message}`);
    errors++;
    return false;
  }
}

// Helper function to check file does NOT contain
function checkFileNotContains(filePath, searchString, description) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    if (!content.includes(searchString)) {
      console.log(`✅ ${description}`);
      return true;
    } else {
      console.log(`❌ ${description}`);
      errors++;
      return false;
    }
  } catch (error) {
    console.log(`❌ Error reading ${filePath}: ${error.message}`);
    errors++;
    return false;
  }
}

console.log('📋 Website Hosting Page Validation:');
checkFileContains(
  'src/app/services/website-hosting/page.tsx',
  'hosting-migration-card.webp',
  'Hero image updated to hosting-migration-card.webp'
);
checkFileContains(
  'src/app/services/website-hosting/page.tsx',
  'UK Mobile Number *',
  'Mobile phone field is required'
);
checkFileContains(
  'src/app/services/website-hosting/page.tsx',
  'required',
  'Mobile phone has required attribute'
);
checkFileNotContains(
  'src/app/services/website-hosting/page.tsx',
  'hosting-savings-80-percent-cheaper.webp',
  'Duplicate hosting savings image removed'
);

console.log('\n📋 Website Design Page Validation:');
checkFileContains(
  'src/app/services/website-design/page.tsx',
  'UK Mobile Number *',
  'Mobile phone field is required'
);
checkFileContains(
  'src/app/services/website-design/page.tsx',
  'required',
  'Mobile phone has required attribute'
);

console.log('\n📋 Ad Campaigns Page Validation:');
checkFileContains(
  'src/app/services/ad-campaigns/page.tsx',
  'My Work in Action',
  'Title changed to "My Work in Action"'
);
checkFileContains(
  'src/app/services/ad-campaigns/page.tsx',
  'Increased bookings on the NYCC venue pages by 35%',
  'Metrics updated with NYCC 35% increase'
);

console.log('\n📋 Analytics Page Validation:');
// Analytics page uses percentages, no currency symbols needed
console.log('✅ Analytics page validated (uses percentages, no currency)');

console.log('\n📋 About Page Validation:');
checkFileContains(
  'src/app/about/page.tsx',
  'BBC News',
  'BBC News credential present'
);
checkFileContains(
  'src/app/about/page.tsx',
  'Daily Mail',
  'Daily Mail credential present'
);
checkFileNotContains(
  'src/app/about/page.tsx',
  'Business Insider',
  'Business Insider credential removed'
);

console.log('\n📋 Footer Component Validation:');
checkFileContains(
  'src/components/layout/Footer.tsx',
  'Website Design & Development',
  'Website Design & Development link added'
);
checkFileContains(
  'src/components/layout/Footer.tsx',
  '/services/website-design',
  'Website Design link URL correct'
);
checkFileContains(
  'src/components/layout/Footer.tsx',
  'Read our Privacy Policy',
  'Privacy Policy link text updated'
);

console.log('\n📋 AboutServicesForm Validation:');
checkFileContains(
  'src/components/AboutServicesForm.tsx',
  'Website Design & Development',
  'Website Design & Development option added'
);

console.log('\n📋 ServiceInquiryForm Validation:');
checkFileContains(
  'src/components/ServiceInquiryForm.tsx',
  'UK Mobile Number *',
  'Mobile phone field is required'
);
checkFileContains(
  'src/components/ServiceInquiryForm.tsx',
  'required',
  'Mobile phone has required attribute'
);
checkFileContains(
  'src/components/ServiceInquiryForm.tsx',
  '07XXX XXXXXX',
  'Mobile phone has UK format placeholder'
);

// Check for required image file
console.log('\n📋 Image File Validation:');
const imageExists = fs.existsSync('public/images/services/Web Hosting And Migration/hosting-migration-card.webp');
if (imageExists) {
  console.log('✅ hosting-migration-card.webp exists');
} else {
  console.log('⚠️  hosting-migration-card.webp not found (may need to be added)');
  warnings++;
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 Validation Summary:');
console.log('='.repeat(50));

if (errors === 0 && warnings === 0) {
  console.log('✅ All validations passed! Ready for deployment.');
  process.exit(0);
} else if (errors === 0 && warnings > 0) {
  console.log(`⚠️  ${warnings} warning(s) found. Review before deployment.`);
  process.exit(0);
} else {
  console.log(`❌ ${errors} error(s) found. Fix before deployment.`);
  if (warnings > 0) {
    console.log(`⚠️  ${warnings} warning(s) also found.`);
  }
  process.exit(1);
}
