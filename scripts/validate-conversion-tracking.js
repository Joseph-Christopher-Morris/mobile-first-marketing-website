#!/usr/bin/env node

/**
 * Validate Conversion Tracking Implementation
 * Checks all components are properly configured
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating Conversion Tracking Implementation...\n');

const checks = [];
let passed = 0;
let failed = 0;

function check(name, condition, details = '') {
  const result = condition ? '✅' : '❌';
  const status = condition ? 'PASS' : 'FAIL';
  
  checks.push({ name, status, details });
  
  if (condition) {
    passed++;
    console.log(`${result} ${name}`);
  } else {
    failed++;
    console.log(`${result} ${name}`);
    if (details) console.log(`   ${details}`);
  }
}

// Check 1: trackPhone utility exists
const trackPhonePath = path.join(process.cwd(), 'src/lib/trackPhone.ts');
const trackPhoneExists = fs.existsSync(trackPhonePath);
check('trackPhone.ts utility exists', trackPhoneExists);

if (trackPhoneExists) {
  const trackPhoneContent = fs.readFileSync(trackPhonePath, 'utf8');
  check(
    'trackPhone has phone_click event',
    trackPhoneContent.includes('phone_click'),
    'Should fire phone_click GA4 event'
  );
  check(
    'trackPhone has conversion event',
    trackPhoneContent.includes('AW-17708257497/AtMkCIiD1r4bENmh-vtB'),
    'Should fire Google Ads conversion'
  );
}

// Check 2: Layout has proper tracking tags
const layoutPath = path.join(process.cwd(), 'src/app/layout.tsx');
if (fs.existsSync(layoutPath)) {
  const layoutContent = fs.readFileSync(layoutPath, 'utf8');
  
  check(
    'Layout has GA4 tag',
    layoutContent.includes('G-QJXSCJ0L43'),
    'GA4 tracking ID present'
  );
  
  check(
    'Layout has Google Ads tag',
    layoutContent.includes('AW-17708257497'),
    'Google Ads ID present'
  );
  
  check(
    'Layout has Clarity tag',
    layoutContent.includes('u4yftkmpxx'),
    'Microsoft Clarity ID present'
  );
  
  check(
    'Layout has consent mode',
    layoutContent.includes('analytics_storage') && layoutContent.includes('ad_storage'),
    'Consent mode configured'
  );
  
  check(
    'Layout has consent default denied',
    layoutContent.includes("'denied'"),
    'Default consent is denied'
  );
}

// Check 3: Thank you page
const thankYouPath = path.join(process.cwd(), 'src/app/thank-you/page.tsx');
if (fs.existsSync(thankYouPath)) {
  const thankYouContent = fs.readFileSync(thankYouPath, 'utf8');
  
  check(
    'Thank you page has proper metadata',
    thankYouContent.includes('Thank you | Vivid Media Cheshire'),
    'Title includes brand name'
  );
  
  check(
    'Thank you page is noindex',
    thankYouContent.includes('index: false'),
    'Robots set to noindex'
  );
  
  check(
    'Thank you page has canonical',
    thankYouContent.includes('canonical'),
    'Canonical URL set'
  );
  
  check(
    'Thank you page imports Conversion',
    thankYouContent.includes('import Conversion'),
    'Conversion component imported'
  );
}

// Check 4: Conversion component
const conversionPath = path.join(process.cwd(), 'src/app/thank-you/Conversion.tsx');
if (fs.existsSync(conversionPath)) {
  const conversionContent = fs.readFileSync(conversionPath, 'utf8');
  
  check(
    'Conversion has duplicate guard',
    conversionContent.includes('sessionStorage') && conversionContent.includes('vmc_thankyou_conv_fired'),
    'SessionStorage prevents duplicate conversions'
  );
  
  check(
    'Conversion fires lead_form_submit',
    conversionContent.includes('lead_form_submit'),
    'GA4 event present'
  );
  
  check(
    'Conversion fires Google Ads event',
    conversionContent.includes('AW-17708257497/AtMkCIiD1r4bENmh-vtB'),
    'Conversion event present'
  );
}

// Check 5: Cookie banner
const cookieBannerPath = path.join(process.cwd(), 'src/components/CookieBanner.tsx');
if (fs.existsSync(cookieBannerPath)) {
  const cookieBannerContent = fs.readFileSync(cookieBannerPath, 'utf8');
  
  check(
    'Cookie banner grants analytics_storage',
    cookieBannerContent.includes('analytics_storage') && (cookieBannerContent.includes("'granted'") || cookieBannerContent.includes('"granted"')),
    'Analytics storage granted on accept'
  );
  
  check(
    'Cookie banner grants ad_storage',
    cookieBannerContent.includes('ad_storage') && (cookieBannerContent.includes("'granted'") || cookieBannerContent.includes('"granted"')),
    'Ad storage granted on accept'
  );
}

// Check 6: StickyCTA uses trackPhone
const stickyCTAPath = path.join(process.cwd(), 'src/components/StickyCTA.tsx');
if (fs.existsSync(stickyCTAPath)) {
  const stickyCTAContent = fs.readFileSync(stickyCTAPath, 'utf8');
  
  check(
    'StickyCTA imports trackPhone',
    stickyCTAContent.includes('import { trackPhoneClick }'),
    'trackPhone utility imported'
  );
  
  check(
    'StickyCTA calls trackPhoneClick',
    stickyCTAContent.includes('trackPhoneClick'),
    'Phone tracking function called'
  );
}

// Check 7: Forms have redirect
const formsToCheck = [
  'src/components/sections/GeneralContactForm.tsx',
  'src/components/sections/NewsletterSignup.tsx',
  'src/components/sections/ServicesContactSection.tsx',
  'src/app/services/website-hosting/page.tsx',
  'src/app/services/website-design/page.tsx',
];

formsToCheck.forEach(formPath => {
  const fullPath = path.join(process.cwd(), formPath);
  if (fs.existsSync(fullPath)) {
    const formContent = fs.readFileSync(fullPath, 'utf8');
    const hasRedirect = formContent.includes('_redirect') && formContent.includes('thank-you');
    check(
      `${path.basename(formPath)} has redirect`,
      hasRedirect,
      'Form redirects to thank-you page'
    );
  }
});

// Summary
console.log('\n' + '='.repeat(60));
console.log(`\n📊 Validation Summary:`);
console.log(`   ✅ Passed: ${passed}`);
console.log(`   ❌ Failed: ${failed}`);
console.log(`   📝 Total:  ${passed + failed}`);

if (failed === 0) {
  console.log('\n🎉 All checks passed! Ready for deployment.\n');
  process.exit(0);
} else {
  console.log('\n⚠️  Some checks failed. Please review and fix.\n');
  process.exit(1);
}
