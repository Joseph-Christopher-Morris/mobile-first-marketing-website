#!/usr/bin/env node

/**
 * SCRAM November 2025 Post-Deployment QA Validation
 * 
 * Tests:
 * 1. Form validation (mobile phone required)
 * 2. Hero image verification
 * 3. Content updates
 * 4. Performance metrics
 */

const https = require('https');
const { execSync } = require('child_process');

const SITE_URL = 'https://d15sc9fc739ev2.cloudfront.net';
const PAGES_TO_TEST = [
  '/services/website-hosting',
  '/services/website-design',
  '/services/ad-campaigns',
  '/services/analytics',
  '/about'
];

console.log('🔍 SCRAM November 2025 - Post-Deployment QA Validation\n');
console.log(`Testing site: ${SITE_URL}\n`);

let passed = 0;
let failed = 0;
let warnings = 0;

// Helper to fetch page content
function fetchPage(path) {
  return new Promise((resolve, reject) => {
    https.get(`${SITE_URL}${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

// Test 1: Website Hosting Page
async function testWebsiteHostingPage() {
  console.log('📋 Testing Website Hosting Page...');
  try {
    const html = await fetchPage('/services/website-hosting');
    
    // Check hero image
    if (html.includes('hosting-migration-card.webp')) {
      console.log('  ✅ Hero image updated to hosting-migration-card.webp');
      passed++;
    } else {
      console.log('  ❌ Hero image NOT updated');
      failed++;
    }
    
    // Check mobile phone field is required
    if (html.includes('UK Mobile Number *') || html.includes('UK Mobile Number \\*')) {
      console.log('  ✅ Mobile phone field marked as required');
      passed++;
    } else {
      console.log('  ⚠️  Mobile phone field requirement not visible in HTML');
      warnings++;
    }
    
    // Check duplicate image removed
    if (!html.includes('hosting-savings-80-percent-cheaper.webp')) {
      console.log('  ✅ Duplicate hosting savings image removed');
      passed++;
    } else {
      console.log('  ❌ Duplicate image still present');
      failed++;
    }
    
  } catch (error) {
    console.log(`  ❌ Error testing page: ${error.message}`);
    failed++;
  }
  console.log('');
}

// Test 2: Website Design Page
async function testWebsiteDesignPage() {
  console.log('📋 Testing Website Design Page...');
  try {
    const html = await fetchPage('/services/website-design');
    
    if (html.includes('UK Mobile Number *') || html.includes('UK Mobile Number \\*')) {
      console.log('  ✅ Mobile phone field marked as required');
      passed++;
    } else {
      console.log('  ⚠️  Mobile phone field requirement not visible');
      warnings++;
    }
    
  } catch (error) {
    console.log(`  ❌ Error testing page: ${error.message}`);
    failed++;
  }
  console.log('');
}

// Test 3: Ad Campaigns Page
async function testAdCampaignsPage() {
  console.log('📋 Testing Ad Campaigns Page...');
  try {
    const html = await fetchPage('/services/ad-campaigns');
    
    // Check title update
    if (html.includes('My Work in Action')) {
      console.log('  ✅ Title updated to "My Work in Action"');
      passed++;
    } else {
      console.log('  ❌ Title not updated');
      failed++;
    }
    
    // Check metrics update
    if (html.includes('Increased bookings on the NYCC venue pages by 35%')) {
      console.log('  ✅ Metrics updated with NYCC 35% increase');
      passed++;
    } else {
      console.log('  ❌ Metrics not updated');
      failed++;
    }
    
  } catch (error) {
    console.log(`  ❌ Error testing page: ${error.message}`);
    failed++;
  }
  console.log('');
}

// Test 4: About Page
async function testAboutPage() {
  console.log('📋 Testing About Page...');
  try {
    const html = await fetchPage('/about');
    
    // Check BBC News present
    if (html.includes('BBC News')) {
      console.log('  ✅ BBC News credential present');
      passed++;
    } else {
      console.log('  ❌ BBC News credential missing');
      failed++;
    }
    
    // Check Daily Mail present
    if (html.includes('Daily Mail')) {
      console.log('  ✅ Daily Mail credential present');
      passed++;
    } else {
      console.log('  ❌ Daily Mail credential missing');
      failed++;
    }
    
    // Check Business Insider removed from text
    if (!html.includes('Business Insider')) {
      console.log('  ✅ Business Insider reference removed');
      passed++;
    } else {
      console.log('  ⚠️  Business Insider still mentioned (check context)');
      warnings++;
    }
    
  } catch (error) {
    console.log(`  ❌ Error testing page: ${error.message}`);
    failed++;
  }
  console.log('');
}

// Test 5: Footer
async function testFooter() {
  console.log('📋 Testing Footer...');
  try {
    const html = await fetchPage('/');
    
    // Check Website Design & Development link
    if (html.includes('Website Design') && html.includes('/services/website-design')) {
      console.log('  ✅ Website Design & Development link present');
      passed++;
    } else {
      console.log('  ❌ Website Design & Development link missing');
      failed++;
    }
    
    // Check Privacy Policy link text
    if (html.includes('Read our Privacy Policy')) {
      console.log('  ✅ Privacy Policy link text updated');
      passed++;
    } else {
      console.log('  ⚠️  Privacy Policy link text not updated');
      warnings++;
    }
    
  } catch (error) {
    console.log(`  ❌ Error testing footer: ${error.message}`);
    failed++;
  }
  console.log('');
}

// Test 6: Image Accessibility
async function testImageAccessibility() {
  console.log('📋 Testing Image Accessibility...');
  try {
    const response = await new Promise((resolve, reject) => {
      https.get(`${SITE_URL}/images/services/Web%20Hosting%20And%20Migration/hosting-migration-card.webp`, 
        (res) => resolve(res.statusCode)
      ).on('error', reject);
    });
    
    if (response === 200) {
      console.log('  ✅ hosting-migration-card.webp is accessible');
      passed++;
    } else {
      console.log(`  ❌ Image returned status ${response}`);
      failed++;
    }
    
  } catch (error) {
    console.log(`  ❌ Error accessing image: ${error.message}`);
    failed++;
  }
  console.log('');
}

// Test 7: PageSpeed Insights (Mobile)
async function testPageSpeed() {
  console.log('📋 Running PageSpeed Insights (Mobile)...');
  console.log('  ⏳ This may take 30-60 seconds...\n');
  
  const testUrl = `${SITE_URL}/services/website-hosting`;
  const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(testUrl)}&strategy=mobile&category=performance&category=accessibility`;
  
  try {
    const response = await new Promise((resolve, reject) => {
      https.get(apiUrl, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error('Failed to parse PageSpeed response'));
          }
        });
      }).on('error', reject);
    });
    
    const perfScore = Math.round(response.lighthouseResult.categories.performance.score * 100);
    const a11yScore = Math.round(response.lighthouseResult.categories.accessibility.score * 100);
    const cls = response.lighthouseResult.audits['cumulative-layout-shift'].displayValue;
    const lcp = response.lighthouseResult.audits['largest-contentful-paint'].displayValue;
    
    console.log(`  📊 Performance Score: ${perfScore}/100`);
    if (perfScore >= 85) {
      console.log('  ✅ Performance target met (≥85)');
      passed++;
    } else {
      console.log('  ⚠️  Performance below target (expected ≥85)');
      warnings++;
    }
    
    console.log(`  📊 Accessibility Score: ${a11yScore}/100`);
    if (a11yScore >= 98) {
      console.log('  ✅ Accessibility target met (≥98)');
      passed++;
    } else {
      console.log('  ⚠️  Accessibility below target (expected ≥98)');
      warnings++;
    }
    
    console.log(`  📊 Cumulative Layout Shift: ${cls}`);
    console.log(`  📊 Largest Contentful Paint: ${lcp}`);
    
  } catch (error) {
    console.log(`  ⚠️  PageSpeed test failed: ${error.message}`);
    console.log('  💡 You can manually test at: https://pagespeed.web.dev/');
    warnings++;
  }
  console.log('');
}

// Run all tests
async function runAllTests() {
  console.log('Starting QA validation...\n');
  console.log('='.repeat(60) + '\n');
  
  await testWebsiteHostingPage();
  await testWebsiteDesignPage();
  await testAdCampaignsPage();
  await testAboutPage();
  await testFooter();
  await testImageAccessibility();
  await testPageSpeed();
  
  // Summary
  console.log('='.repeat(60));
  console.log('📊 QA Validation Summary');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⚠️  Warnings: ${warnings}`);
  console.log('');
  
  if (failed === 0 && warnings === 0) {
    console.log('🎉 All tests passed! SCRAM deployment successful.');
    console.log('');
    console.log('✅ Next Steps:');
    console.log('  1. Manually test form submissions on mobile device');
    console.log('  2. Verify mobile phone validation works correctly');
    console.log('  3. Check forms render correctly on Android + iPhone');
    console.log('  4. Monitor form submissions for 24-48 hours');
    return 0;
  } else if (failed === 0) {
    console.log('⚠️  Tests passed with warnings. Review warnings above.');
    console.log('');
    console.log('📝 Action Items:');
    console.log('  1. Review warnings and determine if action needed');
    console.log('  2. Test forms manually on mobile devices');
    console.log('  3. Run manual PageSpeed test if automated test failed');
    return 0;
  } else {
    console.log('❌ Some tests failed. Review failures above.');
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('  1. Wait 5-10 minutes for CloudFront cache to update');
    console.log('  2. Re-run this script: node scripts/post-deployment-scram-qa.js');
    console.log('  3. Check deployment logs for errors');
    console.log('  4. Verify files were uploaded to S3 correctly');
    return 1;
  }
}

// Execute
runAllTests()
  .then(code => process.exit(code))
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
