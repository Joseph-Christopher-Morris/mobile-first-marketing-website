#!/usr/bin/env node

/**
 * Privacy Policy Deployment Validator
 * 
 * Validates that the privacy policy page is properly deployed with navigation
 */

const https = require('https');
const fs = require('fs');

const CONFIG = {
  SITE_URL: 'https://d15sc9fc739ev2.cloudfront.net',
  PRIVACY_URL: 'https://d15sc9fc739ev2.cloudfront.net/privacy-policy/',
  TIMEOUT: 30000
};

class PrivacyPolicyValidator {
  constructor() {
    this.results = {
      accessibility: { status: 'pending', details: [] },
      navigation: { status: 'pending', details: [] },
      content: { status: 'pending', details: [] },
      seo: { status: 'pending', details: [] },
      overallStatus: 'pending'
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const req = https.request(url, {
        method: options.method || 'GET',
        timeout: CONFIG.TIMEOUT,
        headers: {
          'User-Agent': 'Privacy-Policy-Validator/1.0',
          ...options.headers
        }
      }, (res) => {
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
      });
      
      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
      
      req.end();
    });
  }

  async validateAccessibility() {
    this.log('Validating privacy policy accessibility...');
    
    try {
      const response = await this.makeRequest(CONFIG.PRIVACY_URL);
      
      if (response.statusCode === 200) {
        this.results.accessibility.status = 'success';
        this.results.accessibility.details.push('✅ Privacy policy is accessible (HTTP 200)');
        this.log('Privacy policy is accessible', 'success');
      } else {
        this.results.accessibility.status = 'warning';
        this.results.accessibility.details.push(`⚠️ Privacy policy returned HTTP ${response.statusCode}`);
        this.log(`Privacy policy returned HTTP ${response.statusCode}`, 'error');
      }
      
      // Check response headers
      if (response.headers['content-type'] && response.headers['content-type'].includes('text/html')) {
        this.results.accessibility.details.push('✅ Correct content-type header');
      } else {
        this.results.accessibility.details.push('⚠️ Unexpected content-type header');
      }
      
      // Check cache headers
      if (response.headers['cache-control']) {
        this.results.accessibility.details.push(`Cache-Control: ${response.headers['cache-control']}`);
      }
      
    } catch (error) {
      this.results.accessibility.status = 'error';
      this.results.accessibility.details.push(`❌ Accessibility error: ${error.message}`);
      this.log(`Error validating accessibility: ${error.message}`, 'error');
    }
  }

  async validateNavigation() {
    this.log('Validating navigation integration...');
    
    try {
      const response = await this.makeRequest(CONFIG.PRIVACY_URL);
      
      if (response.statusCode !== 200) {
        this.results.navigation.status = 'error';
        this.results.navigation.details.push('❌ Cannot validate navigation - page not accessible');
        return;
      }
      
      const html = response.body.toLowerCase();
      
      // Check for navigation elements
      const navigationElements = [
        { name: 'Header', pattern: /<header|class=".*header.*"|id=".*header.*"/ },
        { name: 'Navigation', pattern: /<nav|class=".*nav.*"|role="navigation"/ },
        { name: 'Menu', pattern: /class=".*menu.*"|id=".*menu.*"/ },
        { name: 'Logo/Brand', pattern: /vivid.*auto.*photography|logo/ }
      ];
      
      let foundElements = 0;
      navigationElements.forEach(element => {
        if (element.pattern.test(html)) {
          this.results.navigation.details.push(`✅ ${element.name} detected`);
          foundElements++;
        } else {
          this.results.navigation.details.push(`⚠️ ${element.name} not clearly detected`);
        }
      });
      
      if (foundElements >= 2) {
        this.results.navigation.status = 'success';
        this.log('Navigation integration validated', 'success');
      } else {
        this.results.navigation.status = 'warning';
        this.log('Navigation integration may be incomplete', 'error');
      }
      
      // Check for responsive design
      if (html.includes('viewport') || html.includes('responsive')) {
        this.results.navigation.details.push('✅ Responsive design elements detected');
      }
      
    } catch (error) {
      this.results.navigation.status = 'error';
      this.results.navigation.details.push(`❌ Navigation validation error: ${error.message}`);
      this.log(`Error validating navigation: ${error.message}`, 'error');
    }
  }

  async validateContent() {
    this.log('Validating privacy policy content...');
    
    try {
      const response = await this.makeRequest(CONFIG.PRIVACY_URL);
      
      if (response.statusCode !== 200) {
        this.results.content.status = 'error';
        this.results.content.details.push('❌ Cannot validate content - page not accessible');
        return;
      }
      
      const html = response.body.toLowerCase();
      
      // Check for essential privacy policy content
      const contentChecks = [
        { name: 'Privacy Policy Title', pattern: /privacy\s+policy/ },
        { name: 'Vivid Auto Photography', pattern: /vivid\s+auto\s+photography/ },
        { name: 'GDPR Compliance', pattern: /gdpr|general\s+data\s+protection/ },
        { name: 'Data Collection', pattern: /data\s+collect|personal\s+data/ },
        { name: 'Contact Information', pattern: /joe@vividauto\.photography|contact/ },
        { name: 'Your Rights', pattern: /your\s+rights|data\s+subject/ },
        { name: 'Data Security', pattern: /data\s+security|security\s+measures/ }
      ];
      
      let foundContent = 0;
      contentChecks.forEach(check => {
        if (check.pattern.test(html)) {
          this.results.content.details.push(`✅ ${check.name} found`);
          foundContent++;
        } else {
          this.results.content.details.push(`⚠️ ${check.name} not detected`);
        }
      });
      
      if (foundContent >= 5) {
        this.results.content.status = 'success';
        this.log('Privacy policy content validated', 'success');
      } else {
        this.results.content.status = 'warning';
        this.log('Privacy policy content may be incomplete', 'error');
      }
      
      // Check content length
      const textLength = html.replace(/<[^>]*>/g, '').length;
      if (textLength > 5000) {
        this.results.content.details.push(`✅ Comprehensive content (${textLength} characters)`);
      } else {
        this.results.content.details.push(`⚠️ Content may be too brief (${textLength} characters)`);
      }
      
    } catch (error) {
      this.results.content.status = 'error';
      this.results.content.details.push(`❌ Content validation error: ${error.message}`);
      this.log(`Error validating content: ${error.message}`, 'error');
    }
  }

  async validateSEO() {
    this.log('Validating SEO and metadata...');
    
    try {
      const response = await this.makeRequest(CONFIG.PRIVACY_URL);
      
      if (response.statusCode !== 200) {
        this.results.seo.status = 'error';
        this.results.seo.details.push('❌ Cannot validate SEO - page not accessible');
        return;
      }
      
      const html = response.body;
      
      // Check for SEO elements
      const seoChecks = [
        { name: 'Title Tag', pattern: /<title[^>]*>.*privacy.*policy.*<\/title>/i },
        { name: 'Meta Description', pattern: /<meta[^>]*name="description"[^>]*content="[^"]*privacy[^"]*"/i },
        { name: 'H1 Tag', pattern: /<h1[^>]*>.*privacy.*policy.*<\/h1>/i },
        { name: 'Canonical URL', pattern: /<link[^>]*rel="canonical"/i },
        { name: 'Viewport Meta', pattern: /<meta[^>]*name="viewport"/i }
      ];
      
      let foundSEO = 0;
      seoChecks.forEach(check => {
        if (check.pattern.test(html)) {
          this.results.seo.details.push(`✅ ${check.name} found`);
          foundSEO++;
        } else {
          this.results.seo.details.push(`⚠️ ${check.name} not detected`);
        }
      });
      
      if (foundSEO >= 3) {
        this.results.seo.status = 'success';
        this.log('SEO validation passed', 'success');
      } else {
        this.results.seo.status = 'warning';
        this.log('SEO may need improvement', 'error');
      }
      
      // Check for structured data
      if (html.includes('application/ld+json') || html.includes('schema.org')) {
        this.results.seo.details.push('✅ Structured data detected');
      }
      
    } catch (error) {
      this.results.seo.status = 'error';
      this.results.seo.details.push(`❌ SEO validation error: ${error.message}`);
      this.log(`Error validating SEO: ${error.message}`, 'error');
    }
  }

  generateReport() {
    const timestamp = new Date().toISOString();
    
    // Determine overall status
    const statuses = Object.values(this.results).map(r => r.status).filter(s => s !== 'pending');
    if (statuses.includes('error')) {
      this.results.overallStatus = 'error';
    } else if (statuses.includes('warning')) {
      this.results.overallStatus = 'warning';
    } else if (statuses.every(s => s === 'success')) {
      this.results.overallStatus = 'success';
    }

    const report = {
      timestamp,
      testType: 'Privacy Policy Deployment Validation',
      url: CONFIG.PRIVACY_URL,
      results: this.results,
      summary: {
        overallStatus: this.results.overallStatus,
        testsRun: Object.keys(this.results).length - 1,
        successCount: statuses.filter(s => s === 'success').length,
        warningCount: statuses.filter(s => s === 'warning').length,
        errorCount: statuses.filter(s => s === 'error').length
      }
    };

    // Write report
    const reportPath = `privacy-policy-validation-report-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Write summary
    const summaryPath = `privacy-policy-validation-summary-${Date.now()}.md`;
    fs.writeFileSync(summaryPath, this.generateMarkdownSummary(report));
    
    this.log(`Detailed report saved to: ${reportPath}`);
    this.log(`Summary report saved to: ${summaryPath}`);
    
    return report;
  }

  generateMarkdownSummary(report) {
    const statusEmoji = {
      success: '✅',
      warning: '⚠️',
      error: '❌',
      pending: '⏳'
    };

    return `# Privacy Policy Deployment Validation Summary

**Test Date:** ${report.timestamp}
**Overall Status:** ${statusEmoji[report.summary.overallStatus]} ${report.summary.overallStatus.toUpperCase()}
**URL Tested:** ${report.url}

## Test Results

### Accessibility ${statusEmoji[report.results.accessibility.status]}
${report.results.accessibility.details.map(d => `- ${d}`).join('\n')}

### Navigation Integration ${statusEmoji[report.results.navigation.status]}
${report.results.navigation.details.map(d => `- ${d}`).join('\n')}

### Content Validation ${statusEmoji[report.results.content.status]}
${report.results.content.details.map(d => `- ${d}`).join('\n')}

### SEO and Metadata ${statusEmoji[report.results.seo.status]}
${report.results.seo.details.map(d => `- ${d}`).join('\n')}

## Summary Statistics

- **Tests Run:** ${report.summary.testsRun}
- **Successful:** ${report.summary.successCount}
- **Warnings:** ${report.summary.warningCount}
- **Errors:** ${report.summary.errorCount}

## Recommendations

${report.summary.errorCount > 0 ? '- Address any errors found above' : ''}
${report.summary.warningCount > 0 ? '- Review warnings for potential improvements' : ''}
${report.summary.overallStatus === 'success' ? '- Privacy policy deployment is successful!' : ''}
`;
  }

  async runAllValidations() {
    this.log('Starting Privacy Policy Deployment Validation...');
    this.log('='.repeat(60));
    
    await this.validateAccessibility();
    await this.validateNavigation();
    await this.validateContent();
    await this.validateSEO();
    
    this.log('='.repeat(60));
    const report = this.generateReport();
    
    this.log(`Validation completed with status: ${report.summary.overallStatus.toUpperCase()}`);
    
    // Exit with appropriate code
    if (report.summary.overallStatus === 'error') {
      process.exit(1);
    } else {
      process.exit(0);
    }
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new PrivacyPolicyValidator();
  validator.runAllValidations().catch(error => {
    console.error('❌ Validation failed:', error);
    process.exit(1);
  });
}

module.exports = PrivacyPolicyValidator;