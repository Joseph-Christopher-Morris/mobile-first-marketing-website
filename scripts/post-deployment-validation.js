#!/usr/bin/env node

/**
 * Post-Deployment Validation Script
 * Verifies that all critical images and pages load correctly after deployment
 * Requirements: 8.4, 8.5
 */

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = 'https://d15sc9fc739ev2.cloudfront.net';

// Critical pages to validate
const CRITICAL_PAGES = [
  '/',
  '/about/',
  '/services/',
  '/services/photography/',
  '/services/analytics/',
  '/services/ad-campaigns/',
  '/blog/',
  '/contact/',
];

// Critical images to validate
const CRITICAL_IMAGES = [
  '/images/hero/aston-martin-db6-website.webp',
  '/images/services/photography-hero.webp',
  '/images/services/analytics-hero.webp',
  '/images/services/ad-campaigns-hero.webp',
  '/images/hero/whatsapp-image-2025-07-11-flyers-roi.webp',
  '/images/about/A7302858.webp',
];

console.log('🔍 Post-Deployment Validation');
console.log(`🌐 Base URL: ${BASE_URL}`);
console.log(`📄 Pages to validate: ${CRITICAL_PAGES.length}`);
console.log(`🖼️  Images to validate: ${CRITICAL_IMAGES.length}`);
console.log('');

/**
 * Make HTTP request and return response details
 */
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https:') ? https : http;
    
    const request = protocol.get(url, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        resolve({
          statusCode: response.statusCode,
          headers: response.headers,
          data: data,
          url: url
        });
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
 * Validate a single page
 */
async function validatePage(path) {
  const url = `${BASE_URL}${path}`;
  
  try {
    const response = await makeRequest(url);
    
    if (response.statusCode === 200) {
      // Check for basic HTML structure
      const hasHtml = response.data.includes('<html');
      const hasTitle = response.data.includes('<title>');
      const hasBody = response.data.includes('<body');
      
      if (hasHtml && hasTitle && hasBody) {
        console.log(`✅ ${path} - OK (${response.statusCode})`);
        return { success: true, path, statusCode: response.statusCode };
      } else {
        console.log(`⚠️  ${path} - Invalid HTML structure (${response.statusCode})`);
        return { success: false, path, statusCode: response.statusCode, error: 'Invalid HTML' };
      }
    } else {
      console.log(`❌ ${path} - HTTP ${response.statusCode}`);
      return { success: false, path, statusCode: response.statusCode };
    }
  } catch (error) {
    console.log(`❌ ${path} - ${error.error}`);
    return { success: false, path, error: error.error };
  }
}

/**
 * Validate a single image
 */
async function validateImage(path) {
  const url = `${BASE_URL}${path}`;
  
  try {
    const response = await makeRequest(url);
    
    if (response.statusCode === 200) {
      // Check content type
      const contentType = response.headers['content-type'] || '';
      const isImage = contentType.startsWith('image/');
      
      if (isImage) {
        console.log(`✅ ${path} - OK (${contentType})`);
        return { success: true, path, statusCode: response.statusCode, contentType };
      } else {
        console.log(`⚠️  ${path} - Invalid content type: ${contentType}`);
        return { success: false, path, statusCode: response.statusCode, error: 'Invalid content type' };
      }
    } else {
      console.log(`❌ ${path} - HTTP ${response.statusCode}`);
      return { success: false, path, statusCode: response.statusCode };
    }
  } catch (error) {
    console.log(`❌ ${path} - ${error.error}`);
    return { success: false, path, error: error.error };
  }
}

/**
 * Main validation function
 */
async function runValidation() {
  console.log('📄 Validating Critical Pages...');
  const pageResults = [];
  
  for (const page of CRITICAL_PAGES) {
    const result = await validatePage(page);
    pageResults.push(result);
  }
  
  console.log('\n🖼️  Validating Critical Images...');
  const imageResults = [];
  
  for (const image of CRITICAL_IMAGES) {
    const result = await validateImage(image);
    imageResults.push(result);
  }
  
  // Generate summary
  console.log('\n📊 Validation Summary:');
  
  const successfulPages = pageResults.filter(r => r.success).length;
  const successfulImages = imageResults.filter(r => r.success).length;
  
  console.log(`📄 Pages: ${successfulPages}/${CRITICAL_PAGES.length} successful`);
  console.log(`🖼️  Images: ${successfulImages}/${CRITICAL_IMAGES.length} successful`);
  
  const allSuccessful = successfulPages === CRITICAL_PAGES.length && 
                       successfulImages === CRITICAL_IMAGES.length;
  
  if (allSuccessful) {
    console.log('\n🎉 All validations passed! Deployment is successful.');
    return true;
  } else {
    console.log('\n⚠️  Some validations failed. Please check the issues above.');
    
    // Show failed items
    const failedPages = pageResults.filter(r => !r.success);
    const failedImages = imageResults.filter(r => !r.success);
    
    if (failedPages.length > 0) {
      console.log('\n❌ Failed Pages:');
      failedPages.forEach(page => {
        console.log(`   ${page.path} - ${page.error || `HTTP ${page.statusCode}`}`);
      });
    }
    
    if (failedImages.length > 0) {
      console.log('\n❌ Failed Images:');
      failedImages.forEach(image => {
        console.log(`   ${image.path} - ${image.error || `HTTP ${image.statusCode}`}`);
      });
    }
    
    return false;
  }
}

// Run validation
runValidation()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Validation failed:', error.message);
    process.exit(1);
  });