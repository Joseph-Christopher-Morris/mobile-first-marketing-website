#!/usr/bin/env node

const https = require('https');
const { URL } = require('url');

const CLOUDFRONT_URL = 'https://d3vfzayzqyr2yg.cloudfront.net';
const PHOTOGRAPHY_PATH = '/services/photography';

async function validatePhotographyPage() {
  console.log('🔍 Validating Photography Page Deployment...\n');
  
  const url = new URL(PHOTOGRAPHY_PATH, CLOUDFRONT_URL);
  
  return new Promise((resolve, reject) => {
    const req = https.get(url.toString(), (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`📊 Response Status: ${res.statusCode}`);
        console.log(`📊 Content-Type: ${res.headers['content-type']}`);
        console.log(`📊 Content-Length: ${res.headers['content-length'] || 'Not specified'}`);
        console.log(`📊 Cache-Control: ${res.headers['cache-control'] || 'Not specified'}`);
        
        if (res.statusCode === 200) {
          // Check for key photography page elements
          const checks = {
            'Photography Gallery': data.includes('role="grid"'),
            'Hero Section': data.includes('Professional Photography'),
            'Credibility Indicators': data.includes('BBC') || data.includes('Forbes') || data.includes('Times'),
            'Local Focus': data.includes('Nantwich') || data.includes('Cheshire'),
            'Responsive Meta': data.includes('viewport'),
            'Next.js Image Optimization': data.includes('_next/image'),
            'WebP Images': data.includes('.webp'),
            'Structured Data': data.includes('application/ld+json'),
            'Analytics Tracking': data.includes('G-QJXSCJ0L43')
          };
          
          console.log('\n✅ Photography Page Content Validation:');
          Object.entries(checks).forEach(([check, passed]) => {
            console.log(`   ${passed ? '✅' : '❌'} ${check}`);
          });
          
          const passedChecks = Object.values(checks).filter(Boolean).length;
          const totalChecks = Object.keys(checks).length;
          
          console.log(`\n📊 Overall Score: ${passedChecks}/${totalChecks} checks passed`);
          
          if (passedChecks >= totalChecks * 0.8) {
            console.log('🎉 Photography page deployment validation PASSED');
            resolve(true);
          } else {
            console.log('❌ Photography page deployment validation FAILED');
            resolve(false);
          }
        } else {
          console.log(`❌ HTTP Error: ${res.statusCode}`);
          resolve(false);
        }
      });
    });
    
    req.on('error', (err) => {
      console.error('❌ Request failed:', err.message);
      reject(err);
    });
    
    req.setTimeout(10000, () => {
      console.error('❌ Request timeout');
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function main() {
  try {
    const success = await validatePhotographyPage();
    
    console.log('\n🌐 Live Site URL:', `${CLOUDFRONT_URL}${PHOTOGRAPHY_PATH}`);
    console.log('📝 Note: CloudFront cache may take 5-15 minutes to fully propagate');
    
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error('❌ Validation failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { validatePhotographyPage };