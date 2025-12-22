#!/usr/bin/env node

/**
 * Analytics Validation Dashboard
 * Comprehensive GA4 and Microsoft Clarity validation and monitoring
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class AnalyticsValidationDashboard {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      ga4: { status: 'unknown', checks: {} },
      clarity: { status: 'unknown', checks: {} },
      conversion: { status: 'unknown', checks: {} },
      recommendations: [],
      issues: []
    };

    this.expectedGA4Id = 'G-QJXSCJ0L43';
    this.expectedClarityId = 'o5ggbmm8wd';
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      warning: '\x1b[33m',
      error: '\x1b[31m',
      reset: '\x1b[0m'
    };
    console.log(`${colors[type]}${message}${colors.reset}`);
  }

  async validateGA4Implementation() {
    this.log('\n📊 Validating Google Analytics 4 Implementation...', 'info');

    const checks = {
      configurationFound: false,
      correctTrackingId: false,
      properImplementation: false,
      nextjsIntegration: false,
      cspCompliant: false,
      conversionEvents: false
    };

    try {
      // Check layout.tsx for GA4 implementation
      const layoutPath = 'src/app/layout.tsx';
      if (fs.existsSync(layoutPath)) {
        const layoutContent = fs.readFileSync(layoutPath, 'utf8');
        
        // Check for GA4 tracking ID
        checks.configurationFound = layoutContent.includes('googletagmanager') || 
                                   layoutContent.includes('gtag') ||
                                   layoutContent.includes(this.expectedGA4Id);

        checks.correctTrackingId = layoutContent.includes(this.expectedGA4Id);

        // Check for proper Next.js Script implementation
        checks.nextjsIntegration = layoutContent.includes('next/script') &&
                                  layoutContent.includes('strategy=');

        // Check for afterInteractive strategy (recommended for performance)
        checks.properImplementation = layoutContent.includes('afterInteractive') ||
                                     layoutContent.includes('strategy="afterInteractive"');

        if (checks.configurationFound) {
          this.log('✓ GA4 configuration found in layout', 'success');
        } else {
          this.results.issues.push('GA4 configuration not found in layout.tsx');
        }

        if (!checks.correctTrackingId) {
          this.results.issues.push(`Expected GA4 ID ${this.expectedGA4Id} not found`);
        }

        if (!checks.properImplementation) {
          this.results.recommendations.push('Use afterInteractive strategy for GA4 scripts to improve performance');
        }
      }

      // Check for conversion tracking
      const conversionFiles = [
        'src/app/thank-you/Conversion.tsx',
        'src/components/analytics/ConversionTracker.tsx'
      ];

      checks.conversionEvents = conversionFiles.some(file => fs.existsSync(file));

      // Check CloudFront CSP configuration for GA4 domains
      const cspConfigPath = 'config/cloudfront-s3-config.json';
      if (fs.existsSync(cspConfigPath)) {
        const cspConfig = JSON.parse(fs.readFileSync(cspConfigPath, 'utf8'));
        const cspHeader = cspConfig.headers?.['Content-Security-Policy'] || '';
        
        const requiredDomains = [
          'googletagmanager.com',
          'google-analytics.com',
          'analytics.google.com'
        ];

        checks.cspCompliant = requiredDomains.every(domain => 
          cspHeader.includes(domain) || cspHeader.includes('*')
        );

        if (!checks.cspCompliant) {
          this.results.recommendations.push('Update CloudFront CSP headers to include GA4 domains');
        }
      }

      // Validate GA4 events configuration
      await this.validateGA4Events();

      this.results.ga4 = {
        status: this.calculateStatus(checks),
        checks,
        trackingId: this.expectedGA4Id
      };

    } catch (error) {
      this.results.ga4 = { status: 'error', error: error.message };
      this.log(`✗ GA4 validation failed: ${error.message}`, 'error');
    }
  }

  async validateGA4Events() {
    this.log('  🎯 Validating GA4 Event Tracking...', 'info');

    const eventFiles = this.findFiles('src', /\.(tsx|ts)$/)
      .filter(file => {
        const content = fs.readFileSync(file, 'utf8');
        return content.includes('gtag') || content.includes('analytics');
      });

    const standardEvents = [
      'page_view',
      'click',
      'form_submit',
      'conversion',
      'purchase',
      'contact'
    ];

    let eventsFound = 0;
    eventFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      standardEvents.forEach(event => {
        if (content.includes(event)) {
          eventsFound++;
        }
      });
    });

    if (eventsFound === 0) {
      this.results.recommendations.push('Implement GA4 event tracking for user interactions');
    }

    this.log(`  ✓ Found ${eventsFound} GA4 event implementations`, 'success');
  }

  async validateClarityImplementation() {
    this.log('\n🔍 Validating Microsoft Clarity Implementation...', 'info');

    const checks = {
      configurationFound: false,
      correctProjectId: false,
      properImplementation: false,
      noConflicts: false
    };

    try {
      // Check layout.tsx for Clarity implementation
      const layoutPath = 'src/app/layout.tsx';
      if (fs.existsSync(layoutPath)) {
        const layoutContent = fs.readFileSync(layoutPath, 'utf8');
        
        checks.configurationFound = layoutContent.includes('clarity.ms') ||
                                   layoutContent.includes('microsoft.com/clarity');

        checks.correctProjectId = layoutContent.includes(this.expectedClarityId);

        // Check for proper implementation (not raw script injection)
        checks.properImplementation = layoutContent.includes('next/script') &&
                                     !layoutContent.includes('dangerouslySetInnerHTML');

        // Check for conflicts with other analytics
        const hasMultipleAnalytics = (layoutContent.match(/gtag|clarity|facebook|analytics/g) || []).length;
        checks.noConflicts = hasMultipleAnalytics <= 3; // GA4 + Clarity + maybe one more

        if (checks.configurationFound) {
          this.log('✓ Microsoft Clarity configuration found', 'success');
        } else {
          this.results.issues.push('Microsoft Clarity configuration not found');
        }

        if (!checks.correctProjectId) {
          this.results.issues.push(`Expected Clarity ID ${this.expectedClarityId} not found`);
        }

        if (!checks.properImplementation) {
          this.results.recommendations.push('Use Next.js Script component for Clarity instead of raw script injection');
        }
      }

      this.results.clarity = {
        status: this.calculateStatus(checks),
        checks,
        projectId: this.expectedClarityId
      };

    } catch (error) {
      this.results.clarity = { status: 'error', error: error.message };
      this.log(`✗ Clarity validation failed: ${error.message}`, 'error');
    }
  }

  async validateConversionTracking() {
    this.log('\n🎯 Validating Conversion Tracking...', 'info');

    const checks = {
      thankYouPage: false,
      conversionEvents: false,
      googleAdsTracking: false,
      formTracking: false,
      ecommerceTracking: false
    };

    try {
      // Check for thank you page
      checks.thankYouPage = fs.existsSync('src/app/thank-you/page.tsx');

      // Check for conversion components
      const conversionFiles = [
        'src/app/thank-you/Conversion.tsx',
        'src/components/analytics/ConversionTracker.tsx',
        'src/components/analytics/ConversionDashboard.tsx'
      ];

      checks.conversionEvents = conversionFiles.some(file => fs.existsSync(file));

      // Check for Google Ads conversion tracking
      const layoutPath = 'src/app/layout.tsx';
      if (fs.existsSync(layoutPath)) {
        const content = fs.readFileSync(layoutPath, 'utf8');
        checks.googleAdsTracking = content.includes('googleadservices.com') ||
                                  content.includes('AW-');
      }

      // Check for form tracking
      const formFiles = this.findFiles('src/components', /Form\.tsx$/)
        .concat(this.findFiles('src/app', /page\.tsx$/));

      checks.formTracking = formFiles.some(file => {
        const content = fs.readFileSync(file, 'utf8');
        return content.includes('onSubmit') && 
               (content.includes('gtag') || content.includes('analytics'));
      });

      // Check for enhanced ecommerce tracking
      checks.ecommerceTracking = this.findFiles('src', /\.(tsx|ts)$/)
        .some(file => {
          const content = fs.readFileSync(file, 'utf8');
          return content.includes('purchase') || content.includes('add_to_cart');
        });

      this.results.conversion = {
        status: this.calculateStatus(checks),
        checks
      };

      if (checks.conversionEvents) {
        this.log('✓ Conversion tracking implemented', 'success');
      } else {
        this.results.recommendations.push('Implement conversion tracking for form submissions and key actions');
      }

    } catch (error) {
      this.results.conversion = { status: 'error', error: error.message };
      this.log(`✗ Conversion tracking validation failed: ${error.message}`, 'error');
    }
  }

  async testAnalyticsInProduction() {
    this.log('\n🌐 Testing Analytics in Production...', 'info');

    try {
      const websiteUrl = 'https://d15sc9fc739ev2.cloudfront.net';
      
      // Test if GA4 is loading (basic check)
      const testCommand = `curl -s "${websiteUrl}" | grep -i "googletagmanager\\|${this.expectedGA4Id}"`;
      
      try {
        execSync(testCommand, { stdio: 'pipe' });
        this.log('✓ GA4 scripts detected in production', 'success');
      } catch (error) {
        this.results.issues.push('GA4 scripts not detected in production HTML');
      }

      // Test if Clarity is loading
      const clarityTestCommand = `curl -s "${websiteUrl}" | grep -i "clarity.ms\\|${this.expectedClarityId}"`;
      
      try {
        execSync(clarityTestCommand, { stdio: 'pipe' });
        this.log('✓ Clarity scripts detected in production', 'success');
      } catch (error) {
        this.results.issues.push('Clarity scripts not detected in production HTML');
      }

    } catch (error) {
      this.log(`⚠️  Could not test production analytics: ${error.message}`, 'warning');
    }
  }

  calculateStatus(checks) {
    const totalChecks = Object.keys(checks).length;
    const passedChecks = Object.values(checks).filter(Boolean).length;
    
    if (passedChecks === totalChecks) return 'excellent';
    if (passedChecks >= totalChecks * 0.8) return 'good';
    if (passedChecks >= totalChecks * 0.6) return 'fair';
    return 'needs-improvement';
  }

  findFiles(dir, pattern, fileList = []) {
    if (!fs.existsSync(dir)) return fileList;
    
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
        this.findFiles(filePath, pattern, fileList);
      } else if (stat.isFile() && pattern.test(file)) {
        fileList.push(filePath);
      }
    });
    
    return fileList;
  }

  async generateAnalyticsReport() {
    const reportPath = `analytics-validation-report-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    
    this.log(`\n📄 Analytics report saved: ${reportPath}`, 'success');
    return reportPath;
  }

  async generateDashboard() {
    this.log('\n📊 Generating Analytics Dashboard...', 'info');

    const dashboardHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Analytics Validation Dashboard</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .status-excellent { border-left: 4px solid #10b981; }
        .status-good { border-left: 4px solid #f59e0b; }
        .status-fair { border-left: 4px solid #ef4444; }
        .status-needs-improvement { border-left: 4px solid #ef4444; }
        .status-error { border-left: 4px solid #dc2626; }
        .check-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
        .check-item:last-child { border-bottom: none; }
        .check-pass { color: #10b981; }
        .check-fail { color: #ef4444; }
        .recommendations { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 4px; padding: 15px; margin-top: 20px; }
        .issues { background: #fee2e2; border: 1px solid #ef4444; border-radius: 4px; padding: 15px; margin-top: 20px; }
        .timestamp { color: #6b7280; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Analytics Validation Dashboard</h1>
            <p class="timestamp">Generated: ${this.results.timestamp}</p>
        </div>
        
        <div class="grid">
            <div class="card status-${this.results.ga4.status}">
                <h2>🔍 Google Analytics 4</h2>
                <p><strong>Status:</strong> ${this.results.ga4.status}</p>
                <p><strong>Tracking ID:</strong> ${this.expectedGA4Id}</p>
                ${this.renderChecks(this.results.ga4.checks)}
            </div>
            
            <div class="card status-${this.results.clarity.status}">
                <h2>👁️ Microsoft Clarity</h2>
                <p><strong>Status:</strong> ${this.results.clarity.status}</p>
                <p><strong>Project ID:</strong> ${this.expectedClarityId}</p>
                ${this.renderChecks(this.results.clarity.checks)}
            </div>
            
            <div class="card status-${this.results.conversion.status}">
                <h2>🎯 Conversion Tracking</h2>
                <p><strong>Status:</strong> ${this.results.conversion.status}</p>
                ${this.renderChecks(this.results.conversion.checks)}
            </div>
        </div>
        
        ${this.results.recommendations.length > 0 ? `
        <div class="recommendations">
            <h3>💡 Recommendations</h3>
            <ul>
                ${this.results.recommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
        </div>
        ` : ''}
        
        ${this.results.issues.length > 0 ? `
        <div class="issues">
            <h3>⚠️ Issues Found</h3>
            <ul>
                ${this.results.issues.map(issue => `<li>${issue}</li>`).join('')}
            </ul>
        </div>
        ` : ''}
    </div>
</body>
</html>`;

    const dashboardPath = 'analytics-validation-dashboard.html';
    fs.writeFileSync(dashboardPath, dashboardHtml);
    
    this.log(`✓ Dashboard generated: ${dashboardPath}`, 'success');
    return dashboardPath;
  }

  renderChecks(checks) {
    if (!checks || typeof checks !== 'object') return '';
    
    return Object.entries(checks)
      .map(([check, passed]) => `
        <div class="check-item">
          <span>${check.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
          <span class="${passed ? 'check-pass' : 'check-fail'}">${passed ? '✓' : '✗'}</span>
        </div>
      `).join('');
  }

  async run() {
    this.log('📊 Starting Analytics Validation Dashboard...', 'info');

    await this.validateGA4Implementation();
    await this.validateClarityImplementation();
    await this.validateConversionTracking();
    await this.testAnalyticsInProduction();

    const reportPath = await this.generateAnalyticsReport();
    const dashboardPath = await this.generateDashboard();

    this.log('\n' + '='.repeat(60), 'success');
    this.log('📊 ANALYTICS VALIDATION COMPLETED!', 'success');
    this.log('='.repeat(60), 'success');
    this.log(`GA4 Status: ${this.results.ga4.status}`, 'info');
    this.log(`Clarity Status: ${this.results.clarity.status}`, 'info');
    this.log(`Conversion Status: ${this.results.conversion.status}`, 'info');
    this.log(`Report: ${reportPath}`, 'info');
    this.log(`Dashboard: ${dashboardPath}`, 'info');

    return this.results;
  }
}

// Run if called directly
if (require.main === module) {
  const dashboard = new AnalyticsValidationDashboard();
  dashboard.run().then(results => {
    process.exit(0);
  }).catch(error => {
    console.error('Analytics validation failed:', error);
    process.exit(1);
  });
}

module.exports = AnalyticsValidationDashboard;