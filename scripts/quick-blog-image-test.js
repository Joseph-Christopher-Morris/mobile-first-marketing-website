#!/usr/bin/env node

/**
 * Quick Blog Image Test
 * 
 * Fast test for the specific blog image that was failing.
 * Use this for quick validation during development.
 */

const https = require('https');

const CLOUDFRONT_DOMAIN = 'd15sc9fc739ev2.cloudfront.net';
const BLOG_IMAGE_PATH = '/images/hero/paid-ads-analytics-screenshot.webp';

async function quickTest() {
  const url = `https://${CLOUDFRONT_DOMAIN}${BLOG_IMAGE_PATH}`;
  
  console.log('🔍 Quick Blog Image Test');
  console.log('='.repeat(40));
  console.log(`📷 Testing: ${BLOG_IMAGE_PATH}`);
  console.log(`🌐 URL: ${url}`);
  console.log('');

  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const req = https.get(url, {
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'image/webp,image/*,*/*;q=0.8'
      }
    }, (res) => {
      const responseTime = Date.now() - startTime;
      
      console.log(`📊 Results:`);
      console.log(`   Status Code: ${res.statusCode}`);
      console.log(`   Content Type: ${res.headers['content-type'] || 'N/A'}`);
      console.log(`   Content Length: ${res.headers['content-length'] || 'N/A'} bytes`);
      console.log(`   Response Time: ${responseTime}ms`);
      console.log(`   Cache Status: ${res.headers['x-cache'] || 'N/A'}`);
      console.log('');

      if (res.statusCode === 200 && res.headers['content-type']?.startsWith('image/')) {
        console.log('✅ SUCCESS: Blog image is accessible and working!');
        resolve(true);
      } else {
        console.log('❌ FAILED: Blog image is not working properly');
        if (res.statusCode !== 200) {
          console.log(`   Error: HTTP ${res.statusCode}`);
        }
        if (!res.headers['content-type']?.startsWith('image/')) {
          console.log(`   Error: Invalid content type: ${res.headers['content-type']}`);
        }
        resolve(false);
      }
    });

    req.on('timeout', () => {
      console.log('❌ FAILED: Request timeout');
      req.destroy();
      resolve(false);
    });

    req.on('error', (error) => {
      console.log(`❌ FAILED: ${error.message}`);
      resolve(false);
    });

    req.setTimeout(5000);
  });
}

// Main execution
async function main() {
  try {
    const success = await quickTest();
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error('❌ Quick test failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}