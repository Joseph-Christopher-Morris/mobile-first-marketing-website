#!/usr/bin/env node

/**
 * Verify GA4 + Gallery Deployment
 * Quick verification script to test both implementations
 */

const https = require('https');

const CLOUDFRONT_URL = 'https://d15sc9fc739ev2.cloudfront.net';

/**
 * Make HTTP request
 */
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, { timeout: 10000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.end();
  });
}

/**
 * Test GA4 implementation
 */
async function testGA4Implementation() {
  console.log('🔍 Testing GA4 Implementation...');
  
  try {
    const response = await makeRequest(CLOUDFRONT_URL);
    
    if (response.statusCode !== 200) {
      console.log(`❌ Website not accessible: ${response.statusCode}`);
      return false;
    }
    
    // Check for GA4 script tags
    const hasGtagScript = response.body.includes('googletagmanager.com/gtag/js?id=G-QJXSCJ0L43');
    const hasGtagInit = response.body.includes('gtag(\'config\', \'G-QJXSCJ0L43\')');
    const hasDataLayer = response.body.includes('window.dataLayer');
    
    console.log(`   GA4 Script Tag: ${hasGtagScript ? '✅' : '❌'}`);
    console.log(`   GA4 Init Code: ${hasGtagInit ? '✅' : '❌'}`);
    console.log(`   DataLayer Setup: ${hasDataLayer ? '✅' : '❌'}`);
    
    if (hasGtagScript && hasGtagInit && hasDataLayer) {
      console.log('✅ GA4 implementation verified');
      return true;
    } else {
      console.log('❌ GA4 implementation incomplete');
      return false;
    }
    
  } catch (error) {
    console.log(`❌ GA4 test failed: ${error.message}`);
    return false;
  }
}

/**
 * Test Photography Gallery
 */
async function testPhotographyGallery() {
  console.log('\n🖼️  Testing Photography Gallery...');
  
  try {
    const url = `${CLOUDFRONT_URL}/services/photography`;
    const response = await makeRequest(url);
    
    if (response.statusCode !== 200) {
      console.log(`❌ Photography page not accessible: ${response.statusCode}`);
      return false;
    }
    
    // Check for gallery improvements
    const hasAspectRatio = response.body.includes('aspect-[3/4]') || response.body.includes('aspect-[4/3]');
    const hasResponsiveGrid = response.body.includes('sm:grid-cols-2') || response.body.includes('grid-cols-1');
    const hasObjectContain = response.body.includes('object-contain') || response.body.includes('object-cover');
    const hasGallerySection = response.body.includes('Portfolio Gallery');
    
    console.log(`   Aspect Ratios: ${hasAspectRatio ? '✅' : '❌'}`);
    console.log(`   Responsive Grid: ${hasResponsiveGrid ? '✅' : '❌'}`);
    console.log(`   Object Handling: ${hasObjectContain ? '✅' : '❌'}`);
    console.log(`   Gallery Section: ${hasGallerySection ? '✅' : '❌'}`);
    
    if (hasAspectRatio && hasResponsiveGrid && hasGallerySection) {
      console.log('✅ Photography Gallery improvements verified');
      return true;
    } else {
      console.log('❌ Photography Gallery improvements not detected');
      return false;
    }
    
  } catch (error) {
    console.log(`❌ Gallery test failed: ${error.message}`);
    return false;
  }
}

/**
 * Test image loading
 */
async function testImageLoading() {
  console.log('\n📸 Testing Image Loading...');
  
  const testImages = [
    '/images/services/photography-hero.webp',
    '/images/services/analytics-hero.webp',
    '/images/about/A7302858.webp'
  ];
  
  let passedImages = 0;
  
  for (const imagePath of testImages) {
    try {
      const url = `${CLOUDFRONT_URL}${imagePath}`;
      const response = await makeRequest(url);
      
      if (response.statusCode === 200 && response.headers['content-type']?.startsWith('image/')) {
        console.log(`   ✅ ${imagePath}`);
        passedImages++;
      } else {
        console.log(`   ❌ ${imagePath} (${response.statusCode})`);
      }
    } catch (error) {
      console.log(`   ❌ ${imagePath} (${error.message})`);
    }
  }
  
  const success = passedImages === testImages.length;
  console.log(`${success ? '✅' : '❌'} Image loading: ${passedImages}/${testImages.length} passed`);
  
  return success;
}

/**
 * Main verification function
 */
async function runVerification() {
  console.log('🚀 GA4 + Gallery Deployment Verification');
  console.log('=' .repeat(50));
  console.log(`Testing: ${CLOUDFRONT_URL}`);
  console.log('');
  
  const results = {
    ga4: false,
    gallery: false,
    images: false
  };
  
  // Test GA4
  results.ga4 = await testGA4Implementation();
  
  // Test Gallery
  results.gallery = await testPhotographyGallery();
  
  // Test Images
  results.images = await testImageLoading();
  
  // Summary
  console.log('\n' + '=' .repeat(50));
  console.log('📋 Verification Summary:');
  console.log(`   GA4 Integration: ${results.ga4 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Gallery Improvements: ${results.gallery ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Image Loading: ${results.images ? '✅ PASS' : '❌ FAIL'}`);
  
  const allPassed = results.ga4 && results.gallery && results.images;
  
  console.log('');
  if (allPassed) {
    console.log('🎉 All verifications PASSED!');
    console.log('');
    console.log('🔍 Manual Verification Steps:');
    console.log('1. Open browser console and check: window.gtag');
    console.log('2. Check GA4 Realtime reports for active users');
    console.log('3. Test photography gallery on mobile device');
    console.log('4. Verify no CSP violations in console');
  } else {
    console.log('⚠️  Some verifications FAILED');
    console.log('');
    console.log('🔧 Troubleshooting:');
    if (!results.ga4) console.log('- Check GA4 script implementation in layout.tsx');
    if (!results.gallery) console.log('- Check photography gallery component updates');
    if (!results.images) console.log('- Check image paths and CloudFront distribution');
  }
  
  return allPassed;
}

// Run verification
if (require.main === module) {
  runVerification()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Verification failed:', error);
      process.exit(1);
    });
}

module.exports = { runVerification };