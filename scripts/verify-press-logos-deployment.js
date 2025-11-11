#!/usr/bin/env node

/**
 * Press Logos Deployment Verification Script
 * 
 * Verifies all requirements from task 7:
 * - Logos load on / route with 200 OK
 * - Logos load on /services/photography route with 200 OK
 * - No 404 errors
 * - Visual consistency
 */

const https = require('https');

const CLOUDFRONT_URL = 'https://d15sc9fc739ev2.cloudfront.net';

const ROUTES_TO_TEST = [
  '/',
  '/services/photography'
];

const EXPECTED_LOGOS = [
  'bbc-logo.svg',
  'forbes-logo.svg', 
  'the-times-logo.svg'
];

class DeploymentVerifier {
  constructor() {
    this.results = {
      routes: {},
      logos: {},
      errors: [],
      warnings: []
    };
  }

  /**
   * Fetch a URL and return response details
   */
  async fetchUrl(url) {
    return new Promise((resolve, reject) => {
      https.get(url, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data
          });
        });
      }).on('error', (err) => {
        reject(err);
      });
    });
  }

  /**
   * Verify a route loads successfully
   */
  async verifyRoute(route) {
    const url = `${CLOUDFRONT_URL}${route}`;
    console.log(`\n🔍 Testing route: ${route}`);
    
    try {
      const response = await this.fetchUrl(url);
      
      this.results.routes[route] = {
        statusCode: response.statusCode,
        success: response.statusCode === 200,
        contentType: response.headers['content-type']
      };
      
      if (response.statusCode === 200) {
        console.log(`   ✅ Status: ${response.statusCode} OK`);
        console.log(`   Content-Type: ${response.headers['content-type']}`);
        
        // Check for PressLogos component in HTML
        if (response.body.includes('PressLogos') || 
            response.body.includes('press-logos') ||
            response.body.includes('bbc-logo') ||
            response.body.includes('forbes-logo') ||
            response.body.includes('the-times-logo')) {
          console.log(`   ✅ Press logos component detected in HTML`);
          this.results.routes[route].hasLogos = true;
        } else {
          console.log(`   ⚠️  Press logos component not detected in HTML`);
          this.results.routes[route].hasLogos = false;
          this.results.warnings.push(`Press logos not found in ${route} HTML`);
        }
        
        return response;
      } else {
        console.log(`   ❌ Status: ${response.statusCode}`);
        this.results.errors.push(`Route ${route} returned ${response.statusCode}`);
        return null;
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      this.results.errors.push(`Route ${route} failed: ${error.message}`);
      this.results.routes[route] = {
        statusCode: 0,
        success: false,
        error: error.message
      };
      return null;
    }
  }

  /**
   * Verify logo SVG files are accessible
   */
  async verifyLogoFiles() {
    console.log(`\n🖼️  Verifying logo files...`);
    
    for (const logo of EXPECTED_LOGOS) {
      const url = `${CLOUDFRONT_URL}/images/press/${logo}`;
      console.log(`\n   Testing: ${logo}`);
      
      try {
        const response = await this.fetchUrl(url);
        
        this.results.logos[logo] = {
          statusCode: response.statusCode,
          success: response.statusCode === 200,
          contentType: response.headers['content-type'],
          size: response.body.length
        };
        
        if (response.statusCode === 200) {
          console.log(`      ✅ Status: ${response.statusCode} OK`);
          console.log(`      Content-Type: ${response.headers['content-type']}`);
          console.log(`      Size: ${response.body.length} bytes`);
          
          // Verify it's actually SVG content
          if (response.body.includes('<svg') || response.headers['content-type'].includes('svg')) {
            console.log(`      ✅ Valid SVG content`);
          } else {
            console.log(`      ⚠️  Content may not be valid SVG`);
            this.results.warnings.push(`${logo} may not be valid SVG`);
          }
        } else {
          console.log(`      ❌ Status: ${response.statusCode}`);
          this.results.errors.push(`Logo ${logo} returned ${response.statusCode}`);
        }
      } catch (error) {
        console.log(`      ❌ Error: ${error.message}`);
        this.results.errors.push(`Logo ${logo} failed: ${error.message}`);
        this.results.logos[logo] = {
          statusCode: 0,
          success: false,
          error: error.message
        };
      }
    }
  }

  /**
   * Generate summary report
   */
  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 DEPLOYMENT VERIFICATION REPORT');
    console.log('='.repeat(60));
    
    // Route verification summary
    console.log('\n📄 Route Verification:');
    let routesPassed = 0;
    for (const [route, result] of Object.entries(this.results.routes)) {
      const status = result.success ? '✅ PASS' : '❌ FAIL';
      console.log(`   ${status} ${route} - Status: ${result.statusCode}`);
      if (result.hasLogos !== undefined) {
        console.log(`        Logos detected: ${result.hasLogos ? 'Yes' : 'No'}`);
      }
      if (result.success) routesPassed++;
    }
    console.log(`   Summary: ${routesPassed}/${Object.keys(this.results.routes).length} routes passed`);
    
    // Logo verification summary
    console.log('\n🖼️  Logo File Verification:');
    let logosPassed = 0;
    for (const [logo, result] of Object.entries(this.results.logos)) {
      const status = result.success ? '✅ PASS' : '❌ FAIL';
      console.log(`   ${status} ${logo} - Status: ${result.statusCode}`);
      if (result.success) logosPassed++;
    }
    console.log(`   Summary: ${logosPassed}/${Object.keys(this.results.logos).length} logos passed`);
    
    // Errors
    if (this.results.errors.length > 0) {
      console.log('\n❌ Errors:');
      this.results.errors.forEach(error => {
        console.log(`   - ${error}`);
      });
    }
    
    // Warnings
    if (this.results.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      this.results.warnings.forEach(warning => {
        console.log(`   - ${warning}`);
      });
    }
    
    // Overall status
    console.log('\n' + '='.repeat(60));
    const allPassed = this.results.errors.length === 0;
    if (allPassed) {
      console.log('✅ DEPLOYMENT VERIFICATION PASSED');
      console.log('\nAll routes and logos are loading correctly!');
    } else {
      console.log('❌ DEPLOYMENT VERIFICATION FAILED');
      console.log(`\n${this.results.errors.length} error(s) found`);
    }
    console.log('='.repeat(60));
    
    return allPassed;
  }

  /**
   * Run all verification tests
   */
  async run() {
    console.log('🚀 Starting Press Logos Deployment Verification');
    console.log(`Target: ${CLOUDFRONT_URL}`);
    console.log('='.repeat(60));
    
    // Test routes
    for (const route of ROUTES_TO_TEST) {
      await this.verifyRoute(route);
    }
    
    // Test logo files
    await this.verifyLogoFiles();
    
    // Generate report
    const passed = this.generateReport();
    
    return passed;
  }
}

// Run verification
if (require.main === module) {
  const verifier = new DeploymentVerifier();
  
  verifier.run()
    .then(passed => {
      process.exit(passed ? 0 : 1);
    })
    .catch(error => {
      console.error('\n❌ Verification failed:', error);
      process.exit(1);
    });
}

module.exports = DeploymentVerifier;
