#!/usr/bin/env node

/**
 * GA4 Implementation Verification Script
 * 
 * Verifies that GA4 tracking (G-QJXSCJ0L43) is properly implemented
 * and provides testing instructions.
 */

const fs = require('fs');
const path = require('path');

class GA4Verifier {
  constructor() {
    this.buildDir = 'out';
    this.ga4Id = 'G-QJXSCJ0L43';
    this.siteUrl = 'https://d15sc9fc739ev2.cloudfront.net';
    this.results = {
      passed: [],
      failed: [],
      warnings: []
    };
  }

  log(message, type = 'info') {
    const icons = {
      info: '📋',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      test: '🧪'
    };
    
    console.log(`${icons[type]} ${message}`);
  }

  addResult(message, type) {
    this.results[type === 'error' ? 'failed' : type === 'warning' ? 'warnings' : 'passed'].push(message);
    this.log(message, type === 'error' ? 'error' : type === 'warning' ? 'warning' : 'success');
  }

  verifyLayoutFile() {
    this.log('Verifying layout.tsx implementation...', 'test');
    
    const layoutPath = 'src/app/layout.tsx';
    
    if (!fs.existsSync(layoutPath)) {
      this.addResult('Layout file not found: src/app/layout.tsx', 'error');
      return;
    }
    
    const layoutContent = fs.readFileSync(layoutPath, 'utf8');
    
    const requiredElements = [
      {
        pattern: 'G-QJXSCJ0L43',
        description: 'GA4 Measurement ID'
      },
      {
        pattern: 'googletagmanager.com/gtag/js',
        description: 'GA4 gtag.js script URL'
      },
      {
        pattern: 'window.dataLayer',
        description: 'Data Layer initialization'
      },
      {
        pattern: 'gtag\\(\'config\'',
        description: 'GA4 configuration call'
      },
      {
        pattern: 'strategy="afterInteractive"',
        description: 'Next.js Script strategy'
      },
      {
        pattern: 'import Script from [\'"]next/script[\'"]',
        description: 'Next.js Script import'
      }
    ];
    
    requiredElements.forEach(element => {
      const regex = new RegExp(element.pattern);
      if (regex.test(layoutContent)) {
        this.addResult(`${element.description} found in layout`, 'success');
      } else {
        this.addResult(`${element.description} missing from layout`, 'error');
      }
    });

    // Check for unwanted elements
    const unwantedElements = [
      {
        pattern: 'GTM-',
        description: 'GTM container ID (should be removed)'
      },
      {
        pattern: 'googletagmanager.com/gtm.js',
        description: 'GTM JavaScript (should be removed)'
      },
      {
        pattern: 'googletagmanager.com/ns.html',
        description: 'GTM noscript (should be removed)'
      }
    ];

    unwantedElements.forEach(element => {
      const regex = new RegExp(element.pattern);
      if (regex.test(layoutContent)) {
        this.addResult(`${element.description} found - should be removed`, 'warning');
      } else {
        this.addResult(`${element.description} correctly removed`, 'success');
      }
    });
  }

  verifyBuildOutput() {
    this.log('Verifying build output...', 'test');
    
    if (!fs.existsSync(this.buildDir)) {
      this.addResult('Build directory not found. Run npm run build first.', 'error');
      return;
    }
    
    const htmlFiles = this.getAllFiles(this.buildDir).filter(file => file.endsWith('.html'));
    
    if (htmlFiles.length === 0) {
      this.addResult('No HTML files found in build output', 'error');
      return;
    }
    
    this.addResult(`Found ${htmlFiles.length} HTML files in build`, 'success');
    
    let ga4Implemented = 0;
    let gtagConfigFound = 0;
    
    htmlFiles.forEach(htmlFile => {
      const content = fs.readFileSync(htmlFile, 'utf8');
      const fileName = path.basename(htmlFile);
      
      // Check for GA4 implementation
      if (content.includes(this.ga4Id)) {
        ga4Implemented++;
      }
      
      // Check for gtag config
      if (content.includes(`gtag('config', '${this.ga4Id}')`)) {
        gtagConfigFound++;
      }
    });
    
    if (ga4Implemented === htmlFiles.length) {
      this.addResult(`GA4 tracking ID found in all ${htmlFiles.length} HTML files`, 'success');
    } else {
      this.addResult(`GA4 tracking ID missing from ${htmlFiles.length - ga4Implemented} HTML files`, 'error');
    }

    if (gtagConfigFound === htmlFiles.length) {
      this.addResult(`GA4 configuration found in all ${htmlFiles.length} HTML files`, 'success');
    } else {
      this.addResult(`GA4 configuration missing from ${htmlFiles.length - gtagConfigFound} HTML files`, 'error');
    }
  }

  getAllFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        this.getAllFiles(filePath, fileList);
      } else {
        fileList.push(filePath);
      }
    });
    
    return fileList;
  }

  generateTestingInstructions() {
    const instructions = {
      title: 'GA4 Implementation Testing Guide',
      timestamp: new Date().toISOString(),
      
      verificationSteps: [
        {
          step: 1,
          title: 'View Source Verification',
          instructions: [
            `1. Visit ${this.siteUrl} in an incognito window`,
            '2. Right-click → View Page Source',
            '3. Search for "G-QJXSCJ0L43" in the source code',
            '4. Confirm both script tags are present in <head>:',
            '   - <script async src="https://www.googletagmanager.com/gtag/js?id=G-QJXSCJ0L43">',
            '   - gtag(\'config\', \'G-QJXSCJ0L43\');'
          ]
        },
        {
          step: 2,
          title: 'Google Analytics Realtime Verification',
          instructions: [
            '1. Go to Google Analytics 4',
            '2. Navigate to Reports → Realtime',
            `3. Visit ${this.siteUrl} in another tab`,
            '4. Confirm active user appears in Realtime report',
            '5. Verify page views are being tracked'
          ]
        },
        {
          step: 3,
          title: 'Browser Developer Tools Check',
          instructions: [
            '1. Open browser Developer Tools (F12)',
            '2. Go to Network tab',
            '3. Refresh the page',
            '4. Look for requests to:',
            '   - googletagmanager.com/gtag/js?id=G-QJXSCJ0L43',
            '   - google-analytics.com/g/collect'
          ]
        },
        {
          step: 4,
          title: 'GA4 Installation Test',
          instructions: [
            '1. Go to Google Analytics 4 → Admin → Data Streams',
            '2. Click on your web data stream',
            '3. Click "Test your website" in the installation panel',
            '4. Should show ✅ green success icon'
          ]
        }
      ],
      
      troubleshooting: [
        {
          issue: 'GA4 not tracking',
          solutions: [
            'Check browser console for JavaScript errors',
            'Verify gtag.js is loading (check Network tab)',
            'Clear browser cache and try again',
            'Disable ad blockers for testing',
            'Wait 5-15 minutes for CloudFront cache to update'
          ]
        },
        {
          issue: 'Script not loading',
          solutions: [
            'Check Content Security Policy settings',
            'Verify CloudFront invalidation completed',
            'Test in different browsers',
            'Check for network connectivity issues'
          ]
        }
      ],
      
      expectedResults: [
        'Page views tracked automatically in GA4',
        'User sessions recorded with proper attribution',
        'Real-time data visible within minutes',
        'Enhanced measurement events (scroll, clicks, etc.)',
        'Geographic and device data collection'
      ]
    };
    
    const guidePath = 'ga4-testing-instructions.json';
    fs.writeFileSync(guidePath, JSON.stringify(instructions, null, 2));
    this.addResult(`Testing instructions saved to ${guidePath}`, 'success');
    
    return instructions;
  }

  generateSummaryReport() {
    const report = {
      timestamp: new Date().toISOString(),
      ga4Id: this.ga4Id,
      siteUrl: this.siteUrl,
      summary: {
        total: this.results.passed.length + this.results.failed.length + this.results.warnings.length,
        passed: this.results.passed.length,
        failed: this.results.failed.length,
        warnings: this.results.warnings.length,
        status: this.results.failed.length === 0 ? 'PASSED' : 'FAILED'
      },
      results: this.results
    };
    
    const reportPath = `ga4-verification-report-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    this.log('', 'info');
    this.log('📊 Verification Summary:', 'info');
    this.log(`   ✅ Passed: ${this.results.passed.length}`, 'success');
    this.log(`   ⚠️  Warnings: ${this.results.warnings.length}`, 'warning');
    this.log(`   ❌ Failed: ${this.results.failed.length}`, 'error');
    this.log(`   📄 Report saved: ${reportPath}`, 'info');
    
    return report;
  }

  async verify() {
    this.log('🧪 Starting GA4 Implementation Verification', 'test');
    this.log(`GA4 Measurement ID: ${this.ga4Id}`, 'info');
    this.log(`Site URL: ${this.siteUrl}`, 'info');
    this.log('', 'info');
    
    // Run all verifications
    this.verifyLayoutFile();
    this.verifyBuildOutput();
    
    // Generate guides and reports
    this.generateTestingInstructions();
    const report = this.generateSummaryReport();
    
    this.log('', 'info');
    if (report.summary.status === 'PASSED') {
      this.log('🎉 GA4 implementation verification PASSED!', 'success');
      this.log('', 'info');
      this.log('🎯 Next Steps:', 'info');
      this.log(`1. Visit ${this.siteUrl} to test tracking`, 'info');
      this.log('2. Check GA4 Realtime reports for active users', 'info');
      this.log('3. Verify page views are being recorded', 'info');
      this.log('4. Run Lighthouse audit to confirm performance', 'info');
    } else {
      this.log('❌ GA4 implementation verification FAILED!', 'error');
      this.log('Please fix the errors above before testing.', 'error');
    }
    
    return report;
  }
}

// Run verification if called directly
if (require.main === module) {
  const verifier = new GA4Verifier();
  verifier.verify().catch(error => {
    console.error('Verification failed:', error);
    process.exit(1);
  });
}

module.exports = GA4Verifier;