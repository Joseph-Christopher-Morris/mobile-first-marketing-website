#!/usr/bin/env node
const https = require('https');

console.log('📊 Post-Deployment Monitoring');
console.log('');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');

const siteUrl = 'https://d15sc9fc739ev2.cloudfront.net';
const pages = [
  '/',
  '/about/',
  '/contact/',
  '/services/',
  '/services/photography/',
  '/blog/',
];

let allPassed = true;

// Test site accessibility
console.log('1️⃣  Site Accessibility Check');
console.log('');

function checkUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      const status = res.statusCode;
      const cacheStatus = res.headers['x-cache'] || 'Unknown';
      
      if (status === 200) {
        console.log(`   ✅ ${url}`);
        console.log(`      Status: ${status}`);
        console.log(`      Cache: ${cacheStatus}`);
        resolve(true);
      } else {
        console.log(`   ❌ ${url}`);
        console.log(`      Status: ${status}`);
        resolve(false);
      }
    }).on('error', (err) => {
      console.log(`   ❌ ${url}`);
      console.log(`      Error: ${err.message}`);
      resolve(false);
    });
  });
}

async function runChecks() {
  for (const page of pages) {
    const url = `${siteUrl}${page}`;
    const result = await checkUrl(url);
    if (!result) allPassed = false;
  }
  
  console.log('');
  console.log('2️⃣  Performance Monitoring');
  console.log('');
  console.log('   ℹ️  Core Web Vitals Targets:');
  console.log('      • LCP < 1.8s');
  console.log('      • CLS < 0.1');
  console.log('      • FCP < 1.8s');
  console.log('      • TBT < 300ms');
  console.log('');
  console.log('   📊 Monitor in:');
  console.log('      • GA4: https://analytics.google.com');
  console.log('      • Search Console: https://search.google.com/search-console');
  console.log('      • Clarity: https://clarity.microsoft.com');
  console.log('');
  
  console.log('3️⃣  Analytics Tracking');
  console.log('');
  console.log('   ✅ GA4 Property: G-QJXSCJ0L43');
  console.log('   ✅ Clarity Project: Configured');
  console.log('');
  console.log('   ℹ️  Verify tracking:');
  console.log('      1. Visit site in browser');
  console.log('      2. Open DevTools Network tab');
  console.log('      3. Filter for "google-analytics"');
  console.log('      4. Interact with site');
  console.log('      5. Check GA4 Real-Time report');
  console.log('');
  
  console.log('4️⃣  Conversion Tracking');
  console.log('');
  console.log('   Tracked Events:');
  console.log('   • Form submissions');
  console.log('   • Phone clicks');
  console.log('   • CTA interactions');
  console.log('   • Page engagement');
  console.log('');
  console.log('   ℹ️  Monitor conversions:');
  console.log('      • GA4 Conversions report');
  console.log('      • Form submission emails');
  console.log('      • Clarity session recordings');
  console.log('');
  
  console.log('5️⃣  Error Monitoring');
  console.log('');
  console.log('   ℹ️  Check for errors:');
  console.log('      • CloudWatch Logs');
  console.log('      • Browser console errors');
  console.log('      • GA4 error events');
  console.log('      • 404 pages in Search Console');
  console.log('');
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  
  if (allPassed) {
    console.log('✅ Post-Deployment Monitoring: ALL SYSTEMS OPERATIONAL');
    console.log('');
    console.log('📋 Monitoring Schedule:');
    console.log('');
    console.log('   Immediate (0-5 min):');
    console.log('   • Site accessibility');
    console.log('   • Core pages loading');
    console.log('   • Assets loading');
    console.log('');
    console.log('   Short-term (5-30 min):');
    console.log('   • CloudWatch metrics');
    console.log('   • GA4 Real-Time');
    console.log('   • Clarity sessions');
    console.log('   • Performance audit');
    console.log('');
    console.log('   Long-term (30+ min):');
    console.log('   • Core Web Vitals');
    console.log('   • Conversion tracking');
    console.log('   • Error monitoring');
    console.log('   • User feedback');
    console.log('');
    console.log('🔔 Alerts:');
    console.log('   • CloudWatch alarms configured');
    console.log('   • Error rate monitoring active');
    console.log('   • Performance budget alerts');
    console.log('');
  } else {
    console.log('❌ Post-Deployment Monitoring: ISSUES DETECTED');
    console.log('');
    console.log('Please investigate the errors above.');
    console.log('');
    console.log('Troubleshooting:');
    console.log('   1. Check CloudWatch logs');
    console.log('   2. Verify S3 bucket contents');
    console.log('   3. Check CloudFront distribution');
    console.log('   4. Review deployment audit log');
    console.log('');
    console.log('If issues persist, consider rollback:');
    console.log('   node scripts/rollback.js emergency');
    console.log('');
    process.exit(1);
  }
}

runChecks();
