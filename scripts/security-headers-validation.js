#!/usr/bin/env node

/**
 * Security Headers Validation Script
 * Verifies that existing security headers and SSL configuration are maintained
 * Requirements: 8.5
 */

const https = require('https');

// Configuration
const BASE_URL = 'https://d15sc9fc739ev2.cloudfront.net';

console.log('🔒 Security Headers Validation');
console.log(`🌐 Base URL: ${BASE_URL}`);
console.log('');

/**
 * Make HTTPS request and return response headers
 */
function checkHeaders(url) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, (response) => {
      resolve({
        statusCode: response.statusCode,
        headers: response.headers,
        url: url
      });
    });
    
    request.on('error', (error) => {
      reject({
        error: error.message,
        url: url
      });
    });
    
    request.setTimeout(10000, () => {
      request.destroy();
      reject({
        error: 'Request timeout',
        url: url
      });
    });
  });
}

/**
 * Validate security headers
 */
async function validateSecurityHeaders() {
  try {
    console.log('🔍 Checking security headers...');
    const response = await checkHeaders(BASE_URL);
    
    console.log(`📊 HTTP Status: ${response.statusCode}`);
    console.log('');
    
    // Check SSL/HTTPS
    console.log('🔐 SSL/HTTPS Configuration:');
    if (BASE_URL.startsWith('https://')) {
      console.log('✅ HTTPS enabled');
    } else {
      console.log('❌ HTTPS not enabled');
    }
    
    // Check security headers
    console.log('\n🛡️  Security Headers:');
    
    const securityHeaders = {
      'strict-transport-security': 'HSTS (HTTP Strict Transport Security)',
      'x-content-type-options': 'X-Content-Type-Options',
      'x-frame-options': 'X-Frame-Options',
      'x-xss-protection': 'X-XSS-Protection',
      'referrer-policy': 'Referrer-Policy',
      'content-security-policy': 'Content Security Policy'
    };
    
    let securityScore = 0;
    const totalHeaders = Object.keys(securityHeaders).length;
    
    for (const [headerName, description] of Object.entries(securityHeaders)) {
      const headerValue = response.headers[headerName];
      if (headerValue) {
        console.log(`✅ ${description}: ${headerValue}`);
        securityScore++;
      } else {
        console.log(`⚠️  ${description}: Not set`);
      }
    }
    
    // Check caching headers
    console.log('\n📦 Caching Headers:');
    const cacheControl = response.headers['cache-control'];
    const expires = response.headers['expires'];
    const etag = response.headers['etag'];
    
    if (cacheControl) {
      console.log(`✅ Cache-Control: ${cacheControl}`);
    } else {
      console.log('⚠️  Cache-Control: Not set');
    }
    
    if (expires) {
      console.log(`✅ Expires: ${expires}`);
    }
    
    if (etag) {
      console.log(`✅ ETag: ${etag}`);
    }
    
    // Check CloudFront headers
    console.log('\n☁️  CloudFront Headers:');
    const cfHeaders = Object.keys(response.headers).filter(h => h.startsWith('x-amz-cf-'));
    
    if (cfHeaders.length > 0) {
      console.log('✅ CloudFront distribution active');
      cfHeaders.forEach(header => {
        console.log(`   ${header}: ${response.headers[header]}`);
      });
    } else {
      console.log('⚠️  CloudFront headers not detected');
    }
    
    // Generate summary
    console.log('\n📊 Security Summary:');
    console.log(`🛡️  Security Headers: ${securityScore}/${totalHeaders} configured`);
    console.log(`🔐 HTTPS: ${BASE_URL.startsWith('https://') ? 'Enabled' : 'Disabled'}`);
    console.log(`☁️  CloudFront: ${cfHeaders.length > 0 ? 'Active' : 'Not detected'}`);
    
    const isSecure = BASE_URL.startsWith('https://') && securityScore >= 3;
    
    if (isSecure) {
      console.log('\n🎉 Security validation passed! SSL and security headers are properly configured.');
      return true;
    } else {
      console.log('\n⚠️  Security validation has concerns. Please review the configuration.');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Security validation failed:', error.error || error.message);
    return false;
  }
}

// Run validation
validateSecurityHeaders()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Validation failed:', error.message);
    process.exit(1);
  });