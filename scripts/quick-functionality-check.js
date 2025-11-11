#!/usr/bin/env node

/**
 * Quick Core Functionality Check - Rapid validation of essential functionality
 * 
 * Performs essential checks for:
 * - Key pages exist and have valid structure
 * - Core user journeys are possible
 * - Critical content is present
 */

const fs = require('fs');
const path = require('path');

const CONFIG = {
  buildDir: 'out',
  essentialPages: [
    'index.html',
    'services/index.html', 
    'blog/index.html',
    'contact/index.html'
  ]
};

class QuickFunctionalityChecker {
  constructor() {
    this.issues = [];
    this.results = {
      buildDirectory: false,
      essentialPages: false,
      criticalAssets: false,
      contentValidation: false
    };
  }

  async quickCheck() {
    console.log('⚡ Quick functionality check...\n');
    
    let allGood = true;
    
    try {
      return await this.validateQuickFunctionality();
    } catch (error) {
      console.error('❌ Quick functionality check failed:', error.message);
      this.issues.push(`Check failed: ${error.message}`);
      return false;
    }
  }

  async validateQuickFunctionality() {
    let allGood = true;
    
    // Check build directory exists
    if (!fs.existsSync(CONFIG.buildDir)) {
      console.log(`❌ Build directory ${CONFIG.buildDir} not found`);
      this.issues.push('Build directory missing');
      allGood = false;
    } else {
      console.log(`✅ Build directory exists`);
      this.results.buildDirectory = true;
    }
    
    // Check essential pages
    for (const page of CONFIG.essentialPages) {
      const pagePath = path.join(CONFIG.buildDir, page);
      
      if (fs.existsSync(pagePath)) {
        const content = fs.readFileSync(pagePath, 'utf8');
        
        // Basic validation
        const hasHtml = content.includes('<html') && content.includes('</html>');
        const hasTitle = content.includes('<title>');
        const hasVividAuto = content.toLowerCase().includes('vivid auto');
        
        if (hasHtml && hasTitle) {
          console.log(`✅ ${page} - Valid ${hasVividAuto ? '(Branded)' : ''}`);
        } else {
          console.log(`⚠️  ${page} - Structure issues`);
          this.issues.push(`${page} has structure issues`);
          allGood = false;
        }
      } else {
        console.log(`❌ ${page} - Missing`);
        this.issues.push(`${page} is missing`);
        allGood = false;
      }
    }
    
    // Check critical assets
    const criticalAssets = ['sitemap.xml', 'robots.txt', '_next/static'];
    
    for (const asset of criticalAssets) {
      const assetPath = path.join(CONFIG.buildDir, asset);
      if (fs.existsSync(assetPath)) {
        console.log(`✅ ${asset} - Present`);
      } else {
        console.log(`⚠️  ${asset} - Missing`);
        this.issues.push(`${asset} is missing`);
      }
    }
    
    // Quick content checks
    const blogPath = path.join(CONFIG.buildDir, 'blog', 'index.html');
    if (fs.existsSync(blogPath)) {
      const blogContent = fs.readFileSync(blogPath, 'utf8');
      const hasProhibitedText = blogContent.includes('👉 Join the Newsletter');
      
      if (!hasProhibitedText) {
        console.log('✅ Blog newsletter text properly removed');
      } else {
        console.log('❌ Blog still contains prohibited newsletter text');
        this.issues.push('Blog contains prohibited newsletter text');
        allGood = false;
      }
    }
    
    const privacyPath = path.join(CONFIG.buildDir, 'privacy-policy', 'index.html');
    if (fs.existsSync(privacyPath)) {
      console.log('✅ Privacy Policy page exists');
    } else {
      console.log('⚠️  Privacy Policy page missing');
      this.issues.push('Privacy Policy page missing');
    }
    
    // Update results
    this.results.essentialPages = CONFIG.essentialPages.every(page => 
      fs.existsSync(path.join(CONFIG.buildDir, page))
    );
    this.results.criticalAssets = ['sitemap.xml', 'robots.txt', '_next/static'].every(asset =>
      fs.existsSync(path.join(CONFIG.buildDir, asset))
    );
    this.results.contentValidation = allGood;

    console.log(`\n${allGood ? '✅ Quick functionality check PASSED' : '❌ Quick functionality check FAILED'}`);
    
    if (this.issues.length > 0) {
      console.log('\n⚠️  Issues found:');
      this.issues.forEach(issue => console.log(`   - ${issue}`));
    }

    // Generate report
    this.generateReport(allGood);
    
    if (!allGood) {
      process.exit(1);
    }
    
    return allGood;
  }

  generateReport(passed) {
    try {
      const reportData = {
        timestamp: new Date().toISOString(),
        overall: passed ? 'PASSED' : 'FAILED',
        results: this.results,
        issues: this.issues,
        config: CONFIG
      };
      
      const reportFile = `quick-functionality-check-report-${Date.now()}.json`;
      fs.writeFileSync(reportFile, JSON.stringify(reportData, null, 2));
      console.log(`\n📄 Report saved to: ${reportFile}`);
    } catch (error) {
      console.log(`⚠️  Could not save report: ${error.message}`);
    }
  }
}

if (require.main === module) {
  const checker = new QuickFunctionalityChecker();
  checker.quickCheck().catch(error => {
    console.error('Quick functionality check failed:', error);
    process.exit(1);
  });
}

module.exports = QuickFunctionalityChecker;