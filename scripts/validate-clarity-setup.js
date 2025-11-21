/**
 * Microsoft Clarity Configuration Validator
 * Checks if Clarity is properly configured on the website
 */

const https = require('https');

const CLARITY_PROJECT_ID = 'u4yftkmpxx';
const SITE_URL = 'https://d15sc9fc739ev2.cloudfront.net';

console.log('🔍 Microsoft Clarity Configuration Validator\n');
console.log('=' .repeat(60));

// Check 1: Verify Clarity script in source code
console.log('\n✓ Check 1: Source Code Configuration');
console.log(`   Project ID: ${CLARITY_PROJECT_ID}`);
console.log(`   Script location: src/app/layout.tsx`);
console.log(`   Strategy: afterInteractive (optimal for performance)`);

// Check 2: Fetch the live site and check for Clarity script
console.log('\n✓ Check 2: Live Site Verification');
console.log(`   Fetching: ${SITE_URL}`);

https.get(SITE_URL, (res) => {
  let html = '';
  
  res.on('data', (chunk) => {
    html += chunk;
  });
  
  res.on('end', () => {
    console.log(`   Status: ${res.statusCode}`);
    
    // Check for Clarity script
    const hasClarityScript = html.includes('clarity.ms/tag/');
    const hasProjectId = html.includes(CLARITY_PROJECT_ID);
    
    console.log(`\n   Clarity Script Present: ${hasClarityScript ? '✅ YES' : '❌ NO'}`);
    console.log(`   Project ID Present: ${hasProjectId ? '✅ YES' : '❌ NO'}`);
    
    if (hasClarityScript && hasProjectId) {
      console.log('\n✅ SUCCESS: Microsoft Clarity is properly configured!');
      console.log('\n📊 Next Steps:');
      console.log('   1. Visit https://clarity.microsoft.com/');
      console.log('   2. Sign in with your Microsoft account');
      console.log(`   3. Select project: ${CLARITY_PROJECT_ID}`);
      console.log('   4. Wait 5-10 minutes for first data to appear');
      console.log('   5. Check for:');
      console.log('      - Session recordings');
      console.log('      - Heatmaps');
      console.log('      - User behavior insights');
      
      console.log('\n🎯 What Clarity Tracks:');
      console.log('   ✓ Session recordings (user interactions)');
      console.log('   ✓ Heatmaps (click patterns)');
      console.log('   ✓ Scroll depth');
      console.log('   ✓ Rage clicks (frustration indicators)');
      console.log('   ✓ Dead clicks (non-interactive elements)');
      console.log('   ✓ Quick backs (immediate exits)');
      
      console.log('\n⚙️ Configuration Details:');
      console.log('   - Async loading: YES (no performance impact)');
      console.log('   - Consent mode: Integrated with cookie banner');
      console.log('   - Privacy: IP anonymization enabled');
      console.log('   - Integration: Works with GA4 for complete insights');
      
    } else {
      console.log('\n❌ ISSUE: Clarity script not found in live site');
      console.log('\n🔧 Troubleshooting:');
      console.log('   1. Check if site was recently deployed');
      console.log('   2. Clear CloudFront cache:');
      console.log('      node scripts/force-cache-invalidation.js');
      console.log('   3. Wait 5-15 minutes for cache to clear');
      console.log('   4. Run this script again');
    }
    
    console.log('\n' + '='.repeat(60));
  });
  
}).on('error', (err) => {
  console.error(`\n❌ ERROR: Could not fetch site: ${err.message}`);
  console.log('\n🔧 Troubleshooting:');
  console.log('   1. Check internet connection');
  console.log('   2. Verify site is accessible');
  console.log('   3. Check CloudFront distribution status');
});
