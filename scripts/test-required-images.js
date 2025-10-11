#!/usr/bin/env node

const https = require('https');

const CLOUDFRONT_DOMAIN = 'd15sc9fc739ev2.cloudfront.net';

// Test the specific images mentioned in the requirements
const requiredImages = [
  // Service cards (Homepage & Services page)
  '/images/services/photography-hero.webp',
  '/images/services/screenshot-2025-09-23-analytics-dashboard.webp',
  '/images/services/ad-campaigns-hero.webp',

  // Blog preview images (Homepage)
  '/images/hero/google-ads-analytics-dashboard.webp',
  '/images/hero/whatsapp-image-2025-07-11-flyers-roi.webp',
  '/images/hero/240619-london-19.webp',

  // About page hero
  '/images/about/A7302858.webp',

  // Photography service hero
  '/images/services/250928-hampson-auctions-sunday-11.webp',
];

console.log('🔍 Testing Required Images for Image Loading Fix...\n');
console.log(`🌐 CloudFront Domain: ${CLOUDFRONT_DOMAIN}\n`);

async function testImage(imagePath) {
  return new Promise(resolve => {
    const url = `https://${CLOUDFRONT_DOMAIN}${imagePath}`;

    const req = https.get(url, res => {
      const contentType = res.headers['content-type'];
      const contentLength = res.headers['content-length'];

      if (
        res.statusCode === 200 &&
        contentType &&
        contentType.startsWith('image/')
      ) {
        console.log(`✅ ${imagePath}`);
        console.log(`   Status: ${res.statusCode}`);
        console.log(`   Content-Type: ${contentType}`);
        console.log(`   Size: ${contentLength} bytes\n`);
        resolve({
          success: true,
          path: imagePath,
          status: res.statusCode,
          contentType,
        });
      } else {
        console.log(`❌ ${imagePath}`);
        console.log(`   Status: ${res.statusCode}`);
        console.log(`   Content-Type: ${contentType}`);
        console.log(`   Expected: image/* content type\n`);
        resolve({
          success: false,
          path: imagePath,
          status: res.statusCode,
          contentType,
        });
      }

      // Consume response to free up memory
      res.resume();
    });

    req.on('error', err => {
      console.log(`❌ ${imagePath}`);
      console.log(`   Error: ${err.message}\n`);
      resolve({ success: false, path: imagePath, error: err.message });
    });

    req.setTimeout(10000, () => {
      console.log(`❌ ${imagePath}`);
      console.log(`   Error: Request timeout\n`);
      req.destroy();
      resolve({ success: false, path: imagePath, error: 'Timeout' });
    });
  });
}

async function testAllImages() {
  const results = [];

  for (const imagePath of requiredImages) {
    const result = await testImage(imagePath);
    results.push(result);

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log('='.repeat(60));
  console.log(`📊 SUMMARY:`);
  console.log(`✅ Successful: ${successful}/${requiredImages.length}`);
  console.log(`❌ Failed: ${failed}/${requiredImages.length}`);

  if (failed > 0) {
    console.log('\n❌ Failed images:');
    results
      .filter(r => !r.success)
      .forEach(r => {
        console.log(
          `   - ${r.path}: ${r.error || `${r.status} ${r.contentType}`}`
        );
      });
  }

  console.log('\n🌐 Test completed!');

  if (successful === requiredImages.length) {
    console.log(
      '🎉 All required images are accessible with correct MIME types!'
    );
    process.exit(0);
  } else {
    console.log('⚠️  Some images failed. Check the results above.');
    process.exit(1);
  }
}

testAllImages().catch(console.error);
