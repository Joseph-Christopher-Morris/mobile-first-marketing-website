#!/usr/bin/env node

/**
 * SCRAM Final Deployment - Core Functionality Testing
 * 
 * Validates:
 * - Core user journeys work correctly after deployment (Requirement 12.4)
 * - Site functionality across different pages and components (Requirement 12.4)
 * - Build artifacts contain all required files (Requirement 9.5)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  buildDir: 'out',
  siteUrl: 'https://d15sc9fc739ev2.cloudfront.net',
  localTestPort: 3000,
  requiredPages: [
    'index.html',
    'services/index.html',
    'services/photography/index.html',
    'services/ad-campaigns/index.html',
    'services/analytics/index.html',
    'blog/index.html',
    'privacy-policy/index.html',
    'about/index.html',
    'contact/index.html'
  ],
  requiredAssets: [
    'sitemap.xml',
    'robots.txt',
    '_next/static',
    'images'
  ],
  coreUserJourneys: [
    {
      name: 'Homepage Navigation',
      description: 'User visits homepage and navigates to services',
      steps: ['/', '/services']
    },
    {
      name: 'Service Discovery',
      description: 'User explores different service offerings',
      steps: ['/services', '/services/photography', '/services/ad-campaigns']
    },
    {
      name: 'Blog Engagement',
      description: 'User reads blog content',
      steps: ['/blog', '/blog/stock-photography-lessons']
    },
    {
      name: 'Contact Journey',
      description: 'User seeks contact information',
      steps: ['/contact', '/about']
    }
  ]
};

class CoreFunctionalityTester {
  constructor() {
    this.results = {
      buildArtifacts: { passed: false, details: [] },
      pageStructure: { passed: false, details: [] },
      userJourneys: { passed: false, details: [] },
      contentValidation: { passed: false, details: [] }
    };
  }

  async testCoreFunctionality() {
    console.log('🧪 Starting core functionality testing...\n');

    try {
      // Step 1: Validate build artifacts
      await this.validateBuildArtifacts();
      
      // Step 2: Test page structure and content
      await this.testPageStructure();
      
      // Step 3: Validate core user journeys
      await this.validateUserJourneys();
      
      // Step 4: Test content functionality
      await this.testContentFunctionality();
      
      // Generate comprehensive report
      this.generateReport();
      
    } catch (error) {
      console.error('❌ Core functionality testing failed:', error.message);
      process.exit(1);
    }
  }

  async validateBuildArtifacts() {
    console.log('📦 Validating build artifacts...');
    
    try {
      // Check if build directory exists
      if (!fs.existsSync(CONFIG.buildDir)) {
        this.results.buildArtifacts.details.push(`❌ Build directory ${CONFIG.buildDir} not found`);
        console.log(`   ❌ Build directory ${CONFIG.buildDir} not found`);
        return;
      }
      
      console.log(`   ✅ Build directory ${CONFIG.buildDir} exists`);
      
      // Check required pages
      let missingPages = [];
      let presentPages = [];
      
      for (const page of CONFIG.requiredPages) {
        const pagePath = path.join(CONFIG.buildDir, page);
        if (fs.existsSync(pagePath)) {
          presentPages.push(page);
          
          // Validate page content
          const content = fs.readFileSync(pagePath, 'utf8');
          if (content.length > 100 && content.includes('<html') && content.includes('</html>')) {
            this.results.buildArtifacts.details.push(`✅ ${page} - Valid HTML structure`);
          } else {
            this.results.buildArtifacts.details.push(`⚠️  ${page} - May have content issues`);
          }
        } else {
          missingPages.push(page);
        }
      }
      
      if (missingPages.length === 0) {
        console.log(`   ✅ All ${CONFIG.requiredPages.length} required pages present`);
      } else {
        console.log(`   ❌ ${missingPages.length} pages missing:`);
        missingPages.forEach(page => {
          console.log(`      - ${page}`);
          this.results.buildArtifacts.details.push(`❌ Missing page: ${page}`);
        });
      }
      
      // Check required assets
      let missingAssets = [];
      let presentAssets = [];
      
      for (const asset of CONFIG.requiredAssets) {
        const assetPath = path.join(CONFIG.buildDir, asset);
        if (fs.existsSync(assetPath)) {
          presentAssets.push(asset);
          
          // Check if it's a directory or file
          const stats = fs.statSync(assetPath);
          if (stats.isDirectory()) {
            const files = fs.readdirSync(assetPath);
            this.results.buildArtifacts.details.push(`✅ ${asset}/ directory with ${files.length} files`);
          } else {
            const size = Math.round(stats.size / 1024);
            this.results.buildArtifacts.details.push(`✅ ${asset} file (${size}KB)`);
          }
        } else {
          missingAssets.push(asset);
        }
      }
      
      if (missingAssets.length === 0) {
        console.log(`   ✅ All ${CONFIG.requiredAssets.length} required assets present`);
      } else {
        console.log(`   ❌ ${missingAssets.length} assets missing:`);
        missingAssets.forEach(asset => {
          console.log(`      - ${asset}`);
          this.results.buildArtifacts.details.push(`❌ Missing asset: ${asset}`);
        });
      }
      
      // Check for Next.js static files
      const nextStaticPath = path.join(CONFIG.buildDir, '_next', 'static');
      if (fs.existsSync(nextStaticPath)) {
        const staticFiles = this.countFilesRecursively(nextStaticPath);
        console.log(`   ✅ Next.js static files present (${staticFiles} files)`);
        this.results.buildArtifacts.details.push(`✅ Next.js static assets: ${staticFiles} files`);
      } else {
        console.log(`   ⚠️  Next.js static files may be missing`);
        this.results.buildArtifacts.details.push(`⚠️  Next.js static files not found`);
      }
      
      // Overall build artifacts validation
      if (missingPages.length === 0 && missingAssets.length === 0) {
        this.results.buildArtifacts.passed = true;
        console.log('   ✅ Build artifacts validation PASSED');
      } else {
        console.log('   ❌ Build artifacts validation FAILED');
      }
      
    } catch (error) {
      this.results.buildArtifacts.details.push(`❌ Build artifacts validation error: ${error.message}`);
      console.log(`   ❌ Build artifacts validation error: ${error.message}`);
    }
    
    console.log('');
  }

  async testPageStructure() {
    console.log('🏗️  Testing page structure and content...');
    
    try {
      let validPages = 0;
      let totalPages = 0;
      
      for (const page of CONFIG.requiredPages) {
        const pagePath = path.join(CONFIG.buildDir, page);
        
        if (!fs.existsSync(pagePath)) {
          this.results.pageStructure.details.push(`❌ ${page} - File not found`);
          continue;
        }
        
        totalPages++;
        const content = fs.readFileSync(pagePath, 'utf8');
        
        // Basic HTML structure validation
        const hasHtmlTags = content.includes('<html') && content.includes('</html>');
        const hasHead = content.includes('<head>') && content.includes('</head>');
        const hasBody = content.includes('<body>') && content.includes('</body>');
        const hasTitle = content.includes('<title>') && content.includes('</title>');
        
        if (hasHtmlTags && hasHead && hasBody && hasTitle) {
          validPages++;
          
          // Extract title for validation
          const titleMatch = content.match(/<title>(.*?)<\/title>/);
          const title = titleMatch ? titleMatch[1] : 'No title';
          
          // Check for Vivid Auto branding
          const hasVividAuto = content.toLowerCase().includes('vivid auto');
          
          // Check for proper meta tags
          const hasViewport = content.includes('name="viewport"');
          const hasDescription = content.includes('name="description"');
          
          this.results.pageStructure.details.push(
            `✅ ${page} - "${title}" ${hasVividAuto ? '(Branded)' : ''} ${hasViewport && hasDescription ? '(SEO)' : ''}`
          );
          
          console.log(`   ✅ ${page} - Valid structure`);
        } else {
          this.results.pageStructure.details.push(`❌ ${page} - Invalid HTML structure`);
          console.log(`   ❌ ${page} - Invalid HTML structure`);
        }
      }
      
      if (validPages === totalPages && totalPages > 0) {
        this.results.pageStructure.passed = true;
        console.log(`   ✅ Page structure validation PASSED (${validPages}/${totalPages})`);
      } else {
        console.log(`   ❌ Page structure validation FAILED (${validPages}/${totalPages})`);
      }
      
    } catch (error) {
      this.results.pageStructure.details.push(`❌ Page structure testing error: ${error.message}`);
      console.log(`   ❌ Page structure testing error: ${error.message}`);
    }
    
    console.log('');
  }

  async validateUserJourneys() {
    console.log('🚶 Validating core user journeys...');
    
    try {
      let validJourneys = 0;
      
      for (const journey of CONFIG.coreUserJourneys) {
        console.log(`   Testing: ${journey.name}`);
        
        let journeyValid = true;
        const journeyDetails = [];
        
        for (const step of journey.steps) {
          // Convert URL path to file path
          let filePath = step === '/' ? 'index.html' : step.substring(1) + '/index.html';
          if (step.startsWith('/blog/') && !step.endsWith('/')) {
            // Handle specific blog posts
            filePath = step.substring(1) + '/index.html';
          }
          
          const fullPath = path.join(CONFIG.buildDir, filePath);
          
          if (fs.existsSync(fullPath)) {
            const content = fs.readFileSync(fullPath, 'utf8');
            
            // Check for navigation elements
            const hasNavigation = content.includes('nav') || content.includes('menu');
            const hasLinks = content.includes('<a href=');
            
            if (hasNavigation && hasLinks) {
              journeyDetails.push(`✅ ${step} - Navigation available`);
            } else {
              journeyDetails.push(`⚠️  ${step} - Limited navigation`);
            }
          } else {
            journeyDetails.push(`❌ ${step} - Page not found`);
            journeyValid = false;
          }
        }
        
        if (journeyValid) {
          validJourneys++;
          console.log(`      ✅ ${journey.name} - Journey valid`);
        } else {
          console.log(`      ❌ ${journey.name} - Journey broken`);
        }
        
        this.results.userJourneys.details.push({
          journey: journey.name,
          description: journey.description,
          valid: journeyValid,
          steps: journeyDetails
        });
      }
      
      if (validJourneys === CONFIG.coreUserJourneys.length) {
        this.results.userJourneys.passed = true;
        console.log(`   ✅ User journeys validation PASSED (${validJourneys}/${CONFIG.coreUserJourneys.length})`);
      } else {
        console.log(`   ❌ User journeys validation FAILED (${validJourneys}/${CONFIG.coreUserJourneys.length})`);
      }
      
    } catch (error) {
      this.results.userJourneys.details.push(`❌ User journeys validation error: ${error.message}`);
      console.log(`   ❌ User journeys validation error: ${error.message}`);
    }
    
    console.log('');
  }

  async testContentFunctionality() {
    console.log('📝 Testing content functionality...');
    
    try {
      const contentTests = [];
      
      // Test 1: Blog content restoration (Requirement from task 8.1)
      const blogIndexPath = path.join(CONFIG.buildDir, 'blog', 'index.html');
      if (fs.existsSync(blogIndexPath)) {
        const blogContent = fs.readFileSync(blogIndexPath, 'utf8');
        
        // Check that newsletter text is removed but component preserved
        const hasProhibitedText = blogContent.includes('👉 Join the Newsletter');
        const hasNewsletterComponent = blogContent.toLowerCase().includes('newsletter');
        
        if (!hasProhibitedText && hasNewsletterComponent) {
          contentTests.push('✅ Blog newsletter text properly removed, component preserved');
        } else if (hasProhibitedText) {
          contentTests.push('❌ Blog still contains prohibited newsletter text');
        } else {
          contentTests.push('⚠️  Blog newsletter component may be missing');
        }
      } else {
        contentTests.push('❌ Blog index page not found');
      }
      
      // Test 2: Privacy Policy implementation (Requirement from task 8.2)
      const privacyPath = path.join(CONFIG.buildDir, 'privacy-policy', 'index.html');
      if (fs.existsSync(privacyPath)) {
        const privacyContent = fs.readFileSync(privacyPath, 'utf8');
        
        if (privacyContent.includes('Privacy Policy') || privacyContent.includes('privacy')) {
          contentTests.push('✅ Privacy Policy page accessible and contains relevant content');
        } else {
          contentTests.push('⚠️  Privacy Policy page may have content issues');
        }
      } else {
        contentTests.push('❌ Privacy Policy page not found at /privacy-policy/');
      }
      
      // Test 3: Sitemap includes Privacy Policy
      const sitemapPath = path.join(CONFIG.buildDir, 'sitemap.xml');
      if (fs.existsSync(sitemapPath)) {
        const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
        
        if (sitemapContent.includes('privacy-policy')) {
          contentTests.push('✅ Sitemap includes Privacy Policy URL');
        } else {
          contentTests.push('❌ Sitemap missing Privacy Policy URL');
        }
      } else {
        contentTests.push('❌ Sitemap.xml not found');
      }
      
      // Test 4: Navigation menus exclude Privacy Policy
      const homePath = path.join(CONFIG.buildDir, 'index.html');
      if (fs.existsSync(homePath)) {
        const homeContent = fs.readFileSync(homePath, 'utf8');
        
        // Look for navigation that might include privacy policy
        const navHasPrivacyLink = homeContent.includes('href="/privacy-policy"') || 
                                 homeContent.includes('href="/privacy-policy/"');
        
        if (!navHasPrivacyLink) {
          contentTests.push('✅ Navigation menus exclude Privacy Policy links');
        } else {
          contentTests.push('❌ Navigation menus still contain Privacy Policy links');
        }
      }
      
      // Test 5: Logo responsive design (Requirement from task 4)
      const servicesPath = path.join(CONFIG.buildDir, 'services', 'index.html');
      if (fs.existsSync(servicesPath)) {
        const servicesContent = fs.readFileSync(servicesPath, 'utf8');
        
        // Check for responsive logo CSS
        const hasResponsiveLogo = servicesContent.includes('height: 44px') || 
                                 servicesContent.includes('object-fit: contain');
        
        if (hasResponsiveLogo) {
          contentTests.push('✅ Logo responsive design implemented');
        } else {
          contentTests.push('⚠️  Logo responsive design may not be implemented');
        }
      }
      
      // Evaluate content functionality results
      const passedTests = contentTests.filter(test => test.startsWith('✅')).length;
      const totalTests = contentTests.length;
      
      if (passedTests >= Math.ceil(totalTests * 0.8)) { // 80% pass rate
        this.results.contentValidation.passed = true;
        console.log(`   ✅ Content functionality PASSED (${passedTests}/${totalTests})`);
      } else {
        console.log(`   ❌ Content functionality FAILED (${passedTests}/${totalTests})`);
      }
      
      this.results.contentValidation.details = contentTests;
      
      // Log individual test results
      contentTests.forEach(test => console.log(`   ${test}`));
      
    } catch (error) {
      this.results.contentValidation.details.push(`❌ Content functionality testing error: ${error.message}`);
      console.log(`   ❌ Content functionality testing error: ${error.message}`);
    }
    
    console.log('');
  }

  countFilesRecursively(dir) {
    let count = 0;
    
    try {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stats = fs.statSync(fullPath);
        
        if (stats.isDirectory()) {
          count += this.countFilesRecursively(fullPath);
        } else {
          count++;
        }
      }
    } catch (error) {
      // Ignore errors for inaccessible directories
    }
    
    return count;
  }

  generateReport() {
    console.log('📊 CORE FUNCTIONALITY TEST REPORT');
    console.log('==================================\n');
    
    const allPassed = this.results.buildArtifacts.passed && 
                     this.results.pageStructure.passed && 
                     this.results.userJourneys.passed && 
                     this.results.contentValidation.passed;
    
    // Build Artifacts Results
    console.log('📦 Build Artifacts Validation:');
    console.log(`   Status: ${this.results.buildArtifacts.passed ? '✅ PASSED' : '❌ FAILED'}`);
    this.results.buildArtifacts.details.forEach(detail => console.log(`   ${detail}`));
    console.log('');
    
    // Page Structure Results
    console.log('🏗️  Page Structure Testing:');
    console.log(`   Status: ${this.results.pageStructure.passed ? '✅ PASSED' : '❌ FAILED'}`);
    this.results.pageStructure.details.forEach(detail => console.log(`   ${detail}`));
    console.log('');
    
    // User Journeys Results
    console.log('🚶 User Journeys Validation:');
    console.log(`   Status: ${this.results.userJourneys.passed ? '✅ PASSED' : '❌ FAILED'}`);
    this.results.userJourneys.details.forEach(detail => {
      if (typeof detail === 'object') {
        console.log(`   ${detail.valid ? '✅' : '❌'} ${detail.journey}: ${detail.description}`);
      } else {
        console.log(`   ${detail}`);
      }
    });
    console.log('');
    
    // Content Functionality Results
    console.log('📝 Content Functionality Testing:');
    console.log(`   Status: ${this.results.contentValidation.passed ? '✅ PASSED' : '❌ FAILED'}`);
    this.results.contentValidation.details.forEach(detail => console.log(`   ${detail}`));
    console.log('');
    
    // Overall Result
    console.log('🎯 OVERALL CORE FUNCTIONALITY TEST:');
    if (allPassed) {
      console.log('   ✅ ALL TESTS PASSED - Core functionality verified!');
      console.log('   🚀 Site is ready for user traffic');
    } else {
      console.log('   ❌ SOME TESTS FAILED - Review issues above');
      console.log('   ⚠️  Site functionality may need attention');
    }
    
    // Requirements compliance
    console.log('\n📋 REQUIREMENTS COMPLIANCE:');
    console.log(`   Requirement 12.4 (Core user journeys): ${this.results.userJourneys.passed ? '✅' : '❌'} ${this.results.userJourneys.passed ? 'PASSED' : 'FAILED'}`);
    console.log(`   Requirement 9.5 (Build artifacts): ${this.results.buildArtifacts.passed ? '✅' : '❌'} ${this.results.buildArtifacts.passed ? 'PASSED' : 'FAILED'}`);
    
    // Save detailed report
    const reportData = {
      timestamp: new Date().toISOString(),
      overall: allPassed ? 'PASSED' : 'FAILED',
      results: this.results,
      config: CONFIG,
      requirements: {
        '12.4': this.results.userJourneys.passed ? 'PASSED' : 'FAILED',
        '9.5': this.results.buildArtifacts.passed ? 'PASSED' : 'FAILED'
      }
    };
    
    const reportFile = `core-functionality-test-report-${Date.now()}.json`;
    fs.writeFileSync(reportFile, JSON.stringify(reportData, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportFile}`);
    
    if (!allPassed) {
      process.exit(1);
    }
  }
}

// CLI execution
if (require.main === module) {
  const tester = new CoreFunctionalityTester();
  tester.testCoreFunctionality().catch(error => {
    console.error('💥 Core functionality testing failed:', error);
    process.exit(1);
  });
}

module.exports = CoreFunctionalityTester;