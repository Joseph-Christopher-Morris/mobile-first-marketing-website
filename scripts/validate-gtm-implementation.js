#!/usr/bin/env node

/**
 * GTM Implementation Validation Script
 * 
 * Tests the GTM + GA4 implementation to ensure all tracking is working correctly.
 */

const fs = require('fs');
const path = require('path');

class GTMValidator {
  constructor() {
    this.buildDir = 'out';
    this.errors = [];
    this.warnings = [];
    this.successes = [];
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
    if (!this[`${type}s`]) {
      this[`${type}s`] = [];
    }
    this[`${type}s`].push(message);
    this.log(message, type);
  }

  validateEnvironmentVariables() {
    this.log('Validating environment variables...', 'test');
    
    const requiredVars = {
      'NEXT_PUBLIC_GTM_ID': 'GTM-W7L94JHW',
      'NEXT_PUBLIC_GA_ID': 'G-QJXSCJ0L43'
    };
    
    Object.entries(requiredVars).forEach(([envVar, expectedValue]) => {
      const actualValue = process.env[envVar];
      
      if (!actualValue) {
        this.addResult(`Missing environment variable: ${envVar}`, 'error');
      } else if (actualValue !== expectedValue) {
        this.addResult(`Environment variable ${envVar} has unexpected value: ${actualValue} (expected: ${expectedValue})`, 'warning');
      } else {
        this.addResult(`Environment variable ${envVar} is correctly set`, 'success');
      }
    });
  }

  validateLayoutImplementation() {
    this.log('Validating layout.tsx implementation...', 'test');
    
    const layoutPath = 'src/app/layout.tsx';
    
    if (!fs.existsSync(layoutPath)) {
      this.addResult('Layout file not found: src/app/layout.tsx', 'error');
      return;
    }
    
    const layoutContent = fs.readFileSync(layoutPath, 'utf8');
    
    const requiredElements = [
      {
        pattern: 'GTM-W7L94JHW',
        description: 'GTM Container ID'
      },
      {
        pattern: 'googletagmanager.com/gtm.js',
        description: 'GTM JavaScript URL'
      },
      {
        pattern: 'googletagmanager.com/ns.html',
        description: 'GTM Noscript URL'
      },
      {
        pattern: 'scroll_depth',
        description: 'Scroll depth tracking event'
      },
      {
        pattern: 'outbound_click',
        description: 'Outbound click tracking event'
      },
      {
        pattern: 'form_submission',
        description: 'Form submission tracking event'
      },
      {
        pattern: 'engaged_session',
        description: 'Engaged session tracking event'
      },
      {
        pattern: 'window.dataLayer',
        description: 'Data Layer initialization'
      }
    ];
    
    requiredElements.forEach(element => {
      if (layoutContent.includes(element.pattern)) {
        this.addResult(`${element.description} found in layout`, 'success');
      } else {
        this.addResult(`${element.description} missing from layout`, 'error');
      }
    });
  }

  validateBuildOutput() {
    this.log('Validating build output...', 'test');
    
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
    
    let gtmImplemented = 0;
    let noscriptImplemented = 0;
    let smartEventsImplemented = 0;
    
    htmlFiles.forEach(htmlFile => {
      const content = fs.readFileSync(htmlFile, 'utf8');
      const fileName = path.basename(htmlFile);
      
      // Check for GTM implementation
      if (content.includes('GTM-W7L94JHW')) {
        gtmImplemented++;
      } else {
        this.addResult(`GTM code missing from ${fileName}`, 'warning');
      }
      
      // Check for noscript implementation
      if (content.includes('googletagmanager.com/ns.html')) {
        noscriptImplemented++;
      } else {
        this.addResult(`GTM noscript missing from ${fileName}`, 'warning');
      }
      
      // Check for smart events
      const smartEvents = ['scroll_depth', 'outbound_click', 'form_submission', 'engaged_session'];
      const foundEvents = smartEvents.filter(event => content.includes(event));
      
      if (foundEvents.length === smartEvents.length) {
        smartEventsImplemented++;
      } else {
        const missingEvents = smartEvents.filter(event => !content.includes(event));
        this.addResult(`Smart events missing from ${fileName}: ${missingEvents.join(', ')}`, 'warning');
      }
    });
    
    this.addResult(`GTM implemented in ${gtmImplemented}/${htmlFiles.length} HTML files`, gtmImplemented === htmlFiles.length ? 'success' : 'warning');
    this.addResult(`Noscript implemented in ${noscriptImplemented}/${htmlFiles.length} HTML files`, noscriptImplemented === htmlFiles.length ? 'success' : 'warning');
    this.addResult(`Smart events implemented in ${smartEventsImplemented}/${htmlFiles.length} HTML files`, smartEventsImplemented === htmlFiles.length ? 'success' : 'warning');
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

  validateSmartEventLogic() {
    this.log('Validating smart event tracking logic...', 'test');
    
    const layoutPath = 'src/app/layout.tsx';
    const layoutContent = fs.readFileSync(layoutPath, 'utf8');
    
    const eventChecks = [
      {
        name: 'Scroll Depth Tracking',
        patterns: ['scrollDepthTracked', 'trackScrollDepth', '[25, 50, 75, 100]'],
        description: 'Tracks scroll depth at 25%, 50%, 75%, and 100%'
      },
      {
        name: 'Outbound Link Tracking',
        patterns: ['trackOutboundLinks', 'url.hostname !== currentDomain', 'outbound_click'],
        description: 'Tracks clicks to external domains'
      },
      {
        name: 'Form Submission Tracking',
        patterns: ['trackFormSubmissions', 'form.tagName === \'FORM\'', 'form_submission'],
        description: 'Tracks contact form submissions'
      },
      {
        name: 'Engagement Timer',
        patterns: ['trackEngagement', 'setTimeout', '30000', 'engaged_session'],
        description: 'Tracks 30-second engagement sessions'
      }
    ];
    
    eventChecks.forEach(check => {
      const foundPatterns = check.patterns.filter(pattern => layoutContent.includes(pattern));
      
      if (foundPatterns.length === check.patterns.length) {
        this.addResult(`${check.name} logic is complete`, 'success');
      } else {
        const missingPatterns = check.patterns.filter(pattern => !layoutContent.includes(pattern));
        this.addResult(`${check.name} logic incomplete - missing: ${missingPatterns.join(', ')}`, 'error');
      }
    });
  }

  generateTestingGuide() {
    const guide = {
      title: 'GTM + GA4 Testing Guide',
      timestamp: new Date().toISOString(),
      
      manualTests: [
        {
          name: 'Google Tag Assistant Test',
          steps: [
            '1. Install Google Tag Assistant browser extension',
            '2. Visit https://d15sc9fc739ev2.cloudfront.net/',
            '3. Click the Tag Assistant icon',
            '4. Verify GTM-W7L94JHW is firing',
            '5. Verify GA4 G-QJXSCJ0L43 is receiving data'
          ]
        },
        {
          name: 'Scroll Depth Test',
          steps: [
            '1. Visit any page on the site',
            '2. Scroll to 25%, 50%, 75%, and 100% of page',
            '3. Check GA4 Realtime > Events for scroll_depth events',
            '4. Verify scroll_depth parameter shows correct percentages'
          ]
        },
        {
          name: 'Outbound Click Test',
          steps: [
            '1. Visit the site',
            '2. Click on social media links (Facebook, Instagram, LinkedIn)',
            '3. Check GA4 Realtime > Events for outbound_click events',
            '4. Verify link_url parameter shows external URLs'
          ]
        },
        {
          name: 'Form Submission Test',
          steps: [
            '1. Visit /contact/ page',
            '2. Fill out and submit the contact form',
            '3. Check GA4 Realtime > Events for form_submission events',
            '4. Verify form_id and form_class parameters'
          ]
        },
        {
          name: 'Engagement Timer Test',
          steps: [
            '1. Visit any page on the site',
            '2. Stay on page for at least 30 seconds',
            '3. Check GA4 Realtime > Events for engaged_session events',
            '4. Verify engagement_time parameter shows 30'
          ]
        }
      ],
      
      ga4ConversionSetup: [
        {
          step: 1,
          action: 'Go to GA4 Admin > Events',
          description: 'Navigate to the Events section in GA4'
        },
        {
          step: 2,
          action: 'Mark form_submission as conversion',
          description: 'Toggle the conversion switch for form_submission event'
        },
        {
          step: 3,
          action: 'Mark outbound_click as conversion',
          description: 'Toggle the conversion switch for outbound_click event'
        },
        {
          step: 4,
          action: 'Optionally mark scroll_depth as conversion',
          description: 'For engagement tracking (optional)'
        },
        {
          step: 5,
          action: 'Optionally mark engaged_session as conversion',
          description: 'For quality engagement tracking (optional)'
        }
      ],
      
      troubleshooting: [
        {
          issue: 'GTM not firing',
          solutions: [
            'Check browser console for JavaScript errors',
            'Verify GTM container ID is correct (GTM-W7L94JHW)',
            'Ensure CloudFront cache is invalidated',
            'Check if ad blockers are interfering'
          ]
        },
        {
          issue: 'Events not showing in GA4',
          solutions: [
            'Wait 5-10 minutes for data processing',
            'Check GA4 Realtime reports instead of standard reports',
            'Verify GA4 measurement ID is correct (G-QJXSCJ0L43)',
            'Ensure GTM container is published'
          ]
        },
        {
          issue: 'Smart events not triggering',
          solutions: [
            'Check browser console for JavaScript errors',
            'Verify event tracking code is present in HTML',
            'Test on different browsers and devices',
            'Check if Content Security Policy is blocking scripts'
          ]
        }
      ]
    };
    
    const guidePath = 'gtm-testing-guide.json';
    fs.writeFileSync(guidePath, JSON.stringify(guide, null, 2));
    this.addResult(`Testing guide saved to ${guidePath}`, 'success');
    
    return guide;
  }

  generateValidationReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.errors.length + this.warnings.length + this.successes.length,
        errors: this.errors.length,
        warnings: this.warnings.length,
        successes: this.successes.length,
        status: this.errors.length === 0 ? 'PASSED' : 'FAILED'
      },
      results: {
        errors: this.errors,
        warnings: this.warnings,
        successes: this.successes
      }
    };
    
    const reportPath = `gtm-validation-report-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    this.log('', 'info');
    this.log('📊 Validation Summary:', 'info');
    this.log(`   ✅ Successes: ${this.successes.length}`, 'success');
    this.log(`   ⚠️  Warnings: ${this.warnings.length}`, 'warning');
    this.log(`   ❌ Errors: ${this.errors.length}`, 'error');
    this.log(`   📄 Report saved: ${reportPath}`, 'info');
    
    return report;
  }

  async validate() {
    this.log('🧪 Starting GTM + GA4 Implementation Validation', 'test');
    this.log('', 'info');
    
    // Run all validations
    this.validateEnvironmentVariables();
    this.validateLayoutImplementation();
    this.validateBuildOutput();
    this.validateSmartEventLogic();
    
    // Generate guides and reports
    this.generateTestingGuide();
    const report = this.generateValidationReport();
    
    this.log('', 'info');
    if (report.summary.status === 'PASSED') {
      this.log('🎉 GTM + GA4 implementation validation PASSED!', 'success');
      this.log('', 'info');
      this.log('🎯 Next Steps:', 'info');
      this.log('1. Deploy the site: node scripts/deploy-gtm-ga4.js', 'info');
      this.log('2. Configure GTM manually: node scripts/setup-gtm-ga4-configuration.js', 'info');
      this.log('3. Test with Google Tag Assistant', 'info');
      this.log('4. Verify events in GA4 Realtime', 'info');
    } else {
      this.log('❌ GTM + GA4 implementation validation FAILED!', 'error');
      this.log('Please fix the errors above before deploying.', 'error');
    }
    
    return report;
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new GTMValidator();
  validator.validate().catch(error => {
    console.error('Validation failed:', error);
    process.exit(1);
  });
}

module.exports = GTMValidator;