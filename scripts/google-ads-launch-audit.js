#!/usr/bin/env node

/**
 * Google Ads Launch Readiness Audit
 * Comprehensive pre-launch validation
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Google Ads Launch Readiness Audit\n');
console.log('=' .repeat(60));

const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  checks: []
};

function check(category, name, condition, details = '', priority = 'MEDIUM') {
  const status = condition ? '✅ PASS' : '❌ FAIL';
  const result = {
    category,
    name,
    status: condition ? 'PASS' : 'FAIL',
    details,
    priority
  };
  
  results.checks.push(result);
  
  if (condition) {
    results.passed++;
  } else {
    results.failed++;
  }
  
  console.log(`${status} [${priority}] ${category}: ${name}`);
  if (details && !condition) {
    console.log(`   → ${details}`);
  }
}

function warn(category, name, details = '') {
  console.log(`⚠️  WARN [CHECK] ${category}: ${name}`);
  if (details) {
    console.log(`   → ${details}`);
  }
  results.warnings++;
}

console.log('\n📊 1. CONVERSION TRACKING\n');

// Check conversion tracking files
const conversionPath = path.join(process.cwd(), 'src/app/thank-you/Conversion.tsx');
const trackPhonePath = path.join(process.cwd(), 'src/lib/trackPhone.ts');

check(
  'Conversion',
  'Conversion component exists',
  fs.existsSync(conversionPath),
  'Create src/app/thank-you/Conversion.tsx',
  'HIGH'
);

check(
  'Conversion',
  'Phone tracking utility exists',
  fs.existsSync(trackPhonePath),
  'Create src/lib/trackPhone.ts',
  'HIGH'
);

if (fs.existsSync(conversionPath)) {
  const conversionContent = fs.readFileSync(conversionPath, 'utf8');
  
  check(
    'Conversion',
    'Has conversion event',
    conversionContent.includes('AW-17708257497/AtMkCIiD1r4bENmh-vtB'),
    'Add Google Ads conversion event',
    'HIGH'
  );
  
  check(
    'Conversion',
    'Has duplicate guard',
    conversionContent.includes('sessionStorage') && conversionContent.includes('vmc_thankyou_conv_fired'),
    'Add sessionStorage duplicate guard',
    'HIGH'
  );
  
  check(
    'Conversion',
    'Has GA4 event',
    conversionContent.includes('lead_form_submit'),
    'Add GA4 lead_form_submit event',
    'MEDIUM'
  );
}

console.log('\n⚡ 2. PERFORMANCE & CORE WEB VITALS\n');

warn('Performance', 'LCP target < 1.8s', 'Run PageSpeed Insights to measure');
warn('Performance', 'CLS target < 0.1', 'Run PageSpeed Insights to measure');
warn('Performance', 'TTFB target < 0.5s', 'Run PageSpeed Insights to measure');
warn('Performance', 'Mobile Speed 90-100', 'Run PageSpeed Insights to measure');

// Check hero image optimization
const heroImages = [
  'public/images/hero/230422_Chester_Stock_Photography-84.webp',
  'public/images/hero/aston-martin-db6-website.webp'
];

heroImages.forEach(imagePath => {
  const fullPath = path.join(process.cwd(), imagePath);
  if (fs.existsSync(fullPath)) {
    const stats = fs.statSync(fullPath);
    const sizeKB = Math.round(stats.size / 1024);
    check(
      'Performance',
      `Hero image ${path.basename(imagePath)} < 150KB`,
      sizeKB < 150,
      `Current size: ${sizeKB}KB - compress to <150KB`,
      'HIGH'
    );
  }
});

console.log('\n📄 3. LANDING PAGE EXPERIENCE\n');

// Check key landing pages
const landingPages = [
  'src/app/page.tsx',
  'src/app/services/page.tsx',
  'src/app/services/website-design/page.tsx',
  'src/app/services/ad-campaigns/page.tsx'
];

landingPages.forEach(pagePath => {
  const fullPath = path.join(process.cwd(), pagePath);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    const pageName = path.basename(path.dirname(pagePath));
    
    check(
      'Landing Page',
      `${pageName} has metadata`,
      content.includes('export const metadata') || content.includes('Metadata'),
      'Add metadata export',
      'HIGH'
    );
    
    warn('Landing Page', `${pageName} H1 matches Ad copy`, 'Manual review required');
  }
});

// Check layout for structured data
const layoutPath = path.join(process.cwd(), 'src/app/layout.tsx');
if (fs.existsSync(layoutPath)) {
  const layoutContent = fs.readFileSync(layoutPath, 'utf8');
  
  check(
    'SEO',
    'LocalBusiness schema present',
    layoutContent.includes('LocalBusiness') && layoutContent.includes('schema.org'),
    'Add LocalBusiness structured data',
    'MEDIUM'
  );
  
  check(
    'Tracking',
    'GA4 tag present',
    layoutContent.includes('G-QJXSCJ0L43'),
    'Add GA4 tracking tag',
    'HIGH'
  );
  
  check(
    'Tracking',
    'Google Ads tag present',
    layoutContent.includes('AW-17708257497'),
    'Add Google Ads tag',
    'HIGH'
  );
  
  check(
    'Tracking',
    'Consent mode configured',
    layoutContent.includes('consent') && layoutContent.includes('analytics_storage'),
    'Configure consent mode',
    'HIGH'
  );
}

console.log('\n📱 4. MOBILE & DESKTOP UX\n');

// Check StickyCTA
const stickyCTAPath = path.join(process.cwd(), 'src/components/StickyCTA.tsx');
if (fs.existsSync(stickyCTAPath)) {
  const ctaContent = fs.readFileSync(stickyCTAPath, 'utf8');
  
  check(
    'UX',
    'StickyCTA has phone tracking',
    ctaContent.includes('trackPhoneClick') || ctaContent.includes('phone_click'),
    'Add phone click tracking to StickyCTA',
    'HIGH'
  );
  
  check(
    'UX',
    'StickyCTA has per-page copy',
    ctaContent.includes('getCTAConfig') || ctaContent.includes('pathname'),
    'Add per-page CTA copy logic',
    'MEDIUM'
  );
}

warn('UX', 'Hero CTA visible without scroll on mobile', 'Test on real device');
warn('UX', 'No header overlap on desktop', 'Visual QA required');

console.log('\n🎯 5. SMART BIDDING READINESS\n');

warn('Smart Bidding', 'Set bidding strategy', 'Configure in Google Ads UI');
warn('Smart Bidding', 'Enable enhanced CPC', 'Configure in Google Ads UI');
warn('Smart Bidding', 'Target 15+ conversions/month', 'Monitor after launch');

console.log('\n📊 6. ANALYTICS & INSIGHTS\n');

// Check for Clarity
if (fs.existsSync(layoutPath)) {
  const layoutContent = fs.readFileSync(layoutPath, 'utf8');
  
  check(
    'Analytics',
    'Microsoft Clarity installed',
    layoutContent.includes('clarity') && layoutContent.includes('u4yftkmpxx'),
    'Add Microsoft Clarity tracking',
    'MEDIUM'
  );
}

// Check cookie banner
const cookieBannerPath = path.join(process.cwd(), 'src/components/CookieBanner.tsx');
if (fs.existsSync(cookieBannerPath)) {
  const bannerContent = fs.readFileSync(cookieBannerPath, 'utf8');
  
  check(
    'Consent',
    'Cookie banner grants analytics_storage',
    bannerContent.includes('analytics_storage') && bannerContent.includes('granted'),
    'Update cookie banner to grant analytics_storage',
    'HIGH'
  );
  
  check(
    'Consent',
    'Cookie banner grants ad_storage',
    bannerContent.includes('ad_storage') && bannerContent.includes('granted'),
    'Update cookie banner to grant ad_storage',
    'HIGH'
  );
}

console.log('\n' + '='.repeat(60));
console.log('\n📈 AUDIT SUMMARY\n');
console.log(`✅ Passed:   ${results.passed}`);
console.log(`❌ Failed:   ${results.failed}`);
console.log(`⚠️  Warnings: ${results.warnings}`);
console.log(`📝 Total:    ${results.passed + results.failed}`);

// Priority breakdown
const highPriority = results.checks.filter(c => c.priority === 'HIGH' && c.status === 'FAIL');
const mediumPriority = results.checks.filter(c => c.priority === 'MEDIUM' && c.status === 'FAIL');

if (highPriority.length > 0) {
  console.log(`\n🚨 HIGH PRIORITY FAILURES: ${highPriority.length}`);
  highPriority.forEach(c => {
    console.log(`   - ${c.category}: ${c.name}`);
    if (c.details) console.log(`     ${c.details}`);
  });
}

if (mediumPriority.length > 0) {
  console.log(`\n⚠️  MEDIUM PRIORITY FAILURES: ${mediumPriority.length}`);
  mediumPriority.forEach(c => {
    console.log(`   - ${c.category}: ${c.name}`);
  });
}

console.log('\n📋 NEXT STEPS:\n');
console.log('1. Fix all HIGH priority failures');
console.log('2. Run PageSpeed Insights: https://pagespeed.web.dev/');
console.log('3. Test with Tag Assistant: https://tagassistant.google.com/');
console.log('4. Deploy and verify on production');
console.log('5. Configure Smart Bidding in Google Ads');
console.log('6. Monitor for 7-14 days during learning phase');

console.log('\n🔗 Production URLs:');
console.log('   Home:      https://vividmediacheshire.com/');
console.log('   Services:  https://vividmediacheshire.com/services');
console.log('   Contact:   https://vividmediacheshire.com/contact');
console.log('   Thank You: https://vividmediacheshire.com/thank-you');

console.log('\n' + '='.repeat(60) + '\n');

// Exit with appropriate code
if (highPriority.length > 0) {
  console.log('❌ HIGH PRIORITY ISSUES FOUND - Fix before launch\n');
  process.exit(1);
} else if (results.failed > 0) {
  console.log('⚠️  Some checks failed - Review before launch\n');
  process.exit(0);
} else {
  console.log('✅ All automated checks passed!\n');
  process.exit(0);
}
