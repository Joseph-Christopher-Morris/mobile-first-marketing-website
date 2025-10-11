#!/usr/bin/env node

console.log('🌐 Testing CloudFront MIME Type Response...');

const https = require('https');

const config = {
  cloudfrontDomain: 'd15sc9fc739ev2.cloudfront.net',
};

function getHttpHeaders(url) {
  return new Promise((resolve, reject) => {
    const request = https.request(url, { method: 'HEAD' }, response => {
      resolve(response.headers);
    });

    request.on('error', error => {
      reject(error);
    });

    request.setTimeout(10000, () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });

    request.end();
  });
}

async function testCloudFrontMimeTypes() {
  const testFiles = [
    'images/hero/paid-ads-analytics-screenshot.webp',
    '404.html',
    '_next/static/chunks/139.7a5a8e93a21948c1.js',
  ];

  for (const file of testFiles) {
    const url = `https://${config.cloudfrontDomain}/${file}`;

    try {
      console.log(`\n🔍 Testing: ${file}`);
      console.log(`   URL: ${url}`);

      const headers = await getHttpHeaders(url);

      console.log(`   Content-Type: ${headers['content-type']}`);
      console.log(`   Cache-Control: ${headers['cache-control']}`);
      console.log(`   Server: ${headers['server']}`);
      console.log(`   Via: ${headers['via']}`);
      console.log(`   X-Cache: ${headers['x-cache']}`);

      // Check if MIME type is correct
      const extension = file.split('.').pop().toLowerCase();
      const expectedMimeTypes = {
        webp: 'image/webp',
        html: 'text/html',
        js: 'application/javascript',
      };

      const expectedMimeType = expectedMimeTypes[extension];
      const actualMimeType = headers['content-type'];

      if (expectedMimeType && actualMimeType) {
        const isCorrect = actualMimeType.includes(expectedMimeType);
        console.log(
          `   MIME Type Check: ${isCorrect ? '✅' : '❌'} Expected: ${expectedMimeType}, Got: ${actualMimeType}`
        );
      }
    } catch (error) {
      console.error(`❌ Error testing ${file}:`, error.message);
    }
  }
}

testCloudFrontMimeTypes()
  .then(() => {
    console.log('\n✅ CloudFront MIME type test completed');
  })
  .catch(error => {
    console.error('❌ CloudFront test failed:', error.message);
    process.exit(1);
  });
