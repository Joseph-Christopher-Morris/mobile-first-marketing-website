#!/usr/bin/env node

/**
 * Performance and Deployment Validation Script
 * Validates requirements 6.1-6.6, 7.1-7.4, 8.1-8.6
 */

const fs = require('fs');
const https = require('https');
const { execSync } = require('child_process');

class PerformanceDeploymentValidator {
  constructor() {
    this.results = {
      performance: { passed: 0, failed: 0, issues: [] },
      seo: { passed: 0, failed: 0, issues: [] },
      deployment: { passed: 0, failed: 0, issues: [] }
    };
    this.baseUrl = 'https://d15sc9fc739ev2.cloudfront.net';
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  // Make HTTP request with promise
  makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const req = https.request(url, options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ 
          statusCode: res.statusCode, 
          headers: res.headers, 
          data 
        }));
      });
      req.on('error', reject);
      req.setTimeout(10000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
      req.end();
    });
  }

  // Validate performance requirements (6.1-6.6)
  async validatePerformance() {
    this.log('Validating performance requirements...', 'info');

    try {
      // Check if next/image is being used (6.1)
      const imageUsageFiles = [
        'src/app/page.tsx',
        'src/app/services/photography/page.tsx',
        'src/app/services/analytics/page.tsx',
        'src/app/about/page.tsx'
      ];

      let usesNextImage = true;
      for (const file of imageUsageFiles) {
        if (fs.existsSync(file)) {
          const content = fs.readFileSync(file, 'utf8');
          if (!content.includes('from \'next/image\'') && !content.includes('from "next/image"')) {
            usesNextImage = false;
            this.results.performance.issues.push(`File not using next/image: ${file}`);
          }
        }
      }

      if (usesNextImage) {
        this.results.performance.passed++;
        this.log('✓ Using next/image for optimization', 'success');
      } else {
        this.results.performance.failed++;
      }

      // Check cache headers for images (6.2)
      try {
        const imageUrl = `${this.baseUrl}/images/hero/aston-martin-db6-website.webp`;
        const imageResponse = await this.makeRequest(imageUrl, { method: 'HEAD' });
        
        const cacheControl = imageResponse.headers['cache-control'];
        if (cacheControl && cacheControl.includes('max-age=31536000')) {
          this.results.performance.passed++;
          this.log('✓ Images have proper long-term cache headers', 'success');
        } else {
          this.results.performance.failed++;
          this.results.performance.issues.push('Images missing proper cache headers');
        }
      } catch (error) {
        this.results.performance.failed++;
        this.results.performance.issues.push(`Image cache header check failed: ${error.message}`);
      }

      // Check HTML cache headers (6.3)
      try {
        const htmlResponse = await this.makeRequest(this.baseUrl, { method: 'HEAD' });
        const cacheControl = htmlResponse.headers['cache-control'];
        
        if (cacheControl && (cacheControl.includes('max-age=600') || cacheControl.includes('no-cache'))) {
          this.results.performance.passed++;
          this.log('✓ HTML has appropriate cache headers', 'success');
        } else {
          this.results.performance.failed++;
          this.results.performance.issues.push('HTML missing appropriate cache headers');
        }
      } catch (error) {
        this.results.performance.failed++;
        this.results.performance.issues.push(`HTML cache header check failed: ${error.message}`);
      }

      // Check Core Web Vitals from recent monitoring (6.6)
      const cwvFiles = fs.readdirSync('.').filter(f => f.startsWith('core-web-vitals-monitoring-') && f.endsWith('.json'));
      if (cwvFiles.length > 0) {
        const latestCwvFile = cwvFiles.sort().pop();
        const cwvData = JSON.parse(fs.readFileSync(latestCwvFile, 'utf8'));
        
        let allCwvPassed = true;
        for (const page of cwvData.pages) {
          if (page.metrics.lcp > 2500 || page.metrics.cls > 0.1) {
            allCwvPassed = false;
            this.results.performance.issues.push(`Core Web Vitals failed for ${page.url}`);
          }
        }

        if (allCwvPassed) {
          this.results.performance.passed++;
          this.log('✓ Core Web Vitals meet performance targets', 'success');
        } else {
          this.results.performance.failed++;
        }
      } else {
        this.results.performance.failed++;
        this.results.performance.issues.push('No Core Web Vitals data found');
      }

      // Check Lighthouse scores from recent audit
      const lighthouseFiles = fs.readdirSync('lighthouse-reports').filter(f => f.startsWith('lighthouse-audit-summary-') && f.endsWith('.json'));
      if (lighthouseFiles.length > 0) {
        const latestLighthouseFile = lighthouseFiles.sort().pop();
        const lighthouseData = JSON.parse(fs.readFileSync(`lighthouse-reports/${latestLighthouseFile}`, 'utf8'));
        
        const avgScores = lighthouseData.summary.averageScores;
        if (avgScores.performance >= 90 && avgScores.accessibility >= 90 && avgScores.bestPractices >= 90) {
          this.results.performance.passed++;
          this.log('✓ Lighthouse performance scores meet 90+ target', 'success');
        } else {
          this.results.performance.failed++;
          this.results.performance.issues.push(`Lighthouse scores below target: P:${avgScores.performance} A:${avgScores.accessibility} BP:${avgScores.bestPractices}`);
        }
      } else {
        this.results.performance.failed++;
        this.results.performance.issues.push('No Lighthouse audit data found');
      }

    } catch (error) {
      this.results.performance.failed++;
      this.results.performance.issues.push(`Performance validation error: ${error.message}`);
    }
  }

  // Validate SEO requirements (7.1-7.4)
  async validateSEO() {
    this.log('Validating SEO requirements...', 'info');

    try {
      // Check robots.txt (7.1)
      if (fs.existsSync('public/robots.txt')) {
        const robotsContent = fs.readFileSync('public/robots.txt', 'utf8');
        if (robotsContent.includes('User-agent: *') && 
            robotsContent.includes('Allow: /') && 
            robotsContent.includes('Sitemap:')) {
          this.results.seo.passed++;
          this.log('✓ robots.txt properly configured', 'success');
        } else {
          this.results.seo.failed++;
          this.results.seo.issues.push('robots.txt missing required content');
        }
      } else {
        this.results.seo.failed++;
        this.results.seo.issues.push('robots.txt not found');
      }

      // Check sitemap.xml
      if (fs.existsSync('public/sitemap.xml')) {
        const sitemapContent = fs.readFileSync('public/sitemap.xml', 'utf8');
        if (sitemapContent.includes('<urlset') && sitemapContent.includes('<url>')) {
          this.results.seo.passed++;
          this.log('✓ sitemap.xml properly configured', 'success');
        } else {
          this.results.seo.failed++;
          this.results.seo.issues.push('sitemap.xml malformed');
        }
      } else {
        this.results.seo.failed++;
        this.results.seo.issues.push('sitemap.xml not found');
      }

      // Check meta tags in layout (7.2)
      const layoutPath = 'src/app/layout.tsx';
      if (fs.existsSync(layoutPath)) {
        const layoutContent = fs.readFileSync(layoutPath, 'utf8');
        if (layoutContent.includes('metadata') || layoutContent.includes('title') || layoutContent.includes('description')) {
          this.results.seo.passed++;
          this.log('✓ Layout includes proper metadata configuration', 'success');
        } else {
          this.results.seo.failed++;
          this.results.seo.issues.push('Layout missing metadata configuration');
        }
      } else {
        this.results.seo.failed++;
        this.results.seo.issues.push('Layout file not found');
      }

      // Check for semantic HTML (7.4)
      const pageFiles = [
        'src/app/page.tsx',
        'src/app/services/photography/page.tsx',
        'src/app/contact/page.tsx'
      ];

      let usesSemanticHTML = true;
      for (const file of pageFiles) {
        if (fs.existsSync(file)) {
          const content = fs.readFileSync(file, 'utf8');
          if (!content.includes('<section') && !content.includes('<article') && !content.includes('<header')) {
            usesSemanticHTML = false;
            this.results.seo.issues.push(`File not using semantic HTML: ${file}`);
          }
        }
      }

      if (usesSemanticHTML) {
        this.results.seo.passed++;
        this.log('✓ Pages use semantic HTML structure', 'success');
      } else {
        this.results.seo.failed++;
      }

      // Check image alt attributes (7.3)
      let hasProperAltText = true;
      for (const file of pageFiles) {
        if (fs.existsSync(file)) {
          const content = fs.readFileSync(file, 'utf8');
          // Look for Image components without alt or with empty alt
          if (content.includes('<Image') && (!content.includes('alt=') || content.includes('alt=""'))) {
            hasProperAltText = false;
            this.results.seo.issues.push(`File missing proper alt attributes: ${file}`);
          }
        }
      }

      if (hasProperAltText) {
        this.results.seo.passed++;
        this.log('✓ Images have proper alt attributes', 'success');
      } else {
        this.results.seo.failed++;
      }

    } catch (error) {
      this.results.seo.failed++;
      this.results.seo.issues.push(`SEO validation error: ${error.message}`);
    }
  }

  // Validate deployment requirements (8.1-8.6)
  async validateDeployment() {
    this.log('Validating deployment requirements...', 'info');

    try {
      // Check S3 + CloudFront infrastructure (8.1)
      try {
        const response = await this.makeRequest(this.baseUrl, { method: 'HEAD' });
        
        if (response.headers['server'] && response.headers['server'].includes('CloudFront')) {
          this.results.deployment.passed++;
          this.log('✓ Using CloudFront CDN', 'success');
        } else if (response.headers['via'] && response.headers['via'].includes('CloudFront')) {
          this.results.deployment.passed++;
          this.log('✓ Using CloudFront CDN', 'success');
        } else {
          this.results.deployment.failed++;
          this.results.deployment.issues.push('Not using CloudFront CDN');
        }
      } catch (error) {
        this.results.deployment.failed++;
        this.results.deployment.issues.push(`CloudFront check failed: ${error.message}`);
      }

      // Check security headers (8.5)
      try {
        const response = await this.makeRequest(this.baseUrl);
        const headers = response.headers;
        
        let securityHeadersCount = 0;
        const expectedHeaders = ['x-content-type-options', 'x-frame-options', 'strict-transport-security'];
        
        for (const header of expectedHeaders) {
          if (headers[header]) {
            securityHeadersCount++;
          }
        }

        if (securityHeadersCount >= 2) {
          this.results.deployment.passed++;
          this.log('✓ Security headers configured', 'success');
        } else {
          this.results.deployment.failed++;
          this.results.deployment.issues.push('Missing security headers');
        }
      } catch (error) {
        this.results.deployment.failed++;
        this.results.deployment.issues.push(`Security headers check failed: ${error.message}`);
      }

      // Check static export build (8.6)
      if (fs.existsSync('out') || fs.existsSync('dist')) {
        this.results.deployment.passed++;
        this.log('✓ Static build output exists', 'success');
      } else {
        this.results.deployment.failed++;
        this.results.deployment.issues.push('Static build output not found');
      }

      // Check deployment scripts exist
      const deploymentScripts = ['scripts/deploy.js', 'scripts/setup-infrastructure.js'];
      let hasDeploymentScripts = true;
      
      for (const script of deploymentScripts) {
        if (!fs.existsSync(script)) {
          hasDeploymentScripts = false;
          this.results.deployment.issues.push(`Missing deployment script: ${script}`);
        }
      }

      if (hasDeploymentScripts) {
        this.results.deployment.passed++;
        this.log('✓ Deployment scripts available', 'success');
      } else {
        this.results.deployment.failed++;
      }

      // Check website accessibility
      try {
        const response = await this.makeRequest(this.baseUrl);
        if (response.statusCode === 200) {
          this.results.deployment.passed++;
          this.log('✓ Website is accessible', 'success');
        } else {
          this.results.deployment.failed++;
          this.results.deployment.issues.push(`Website returned status ${response.statusCode}`);
        }
      } catch (error) {
        this.results.deployment.failed++;
        this.results.deployment.issues.push(`Website accessibility check failed: ${error.message}`);
      }

    } catch (error) {
      this.results.deployment.failed++;
      this.results.deployment.issues.push(`Deployment validation error: ${error.message}`);
    }
  }

  // Generate comprehensive report
  generateReport() {
    const timestamp = new Date().toISOString();
    const totalPassed = Object.values(this.results).reduce((sum, category) => sum + category.passed, 0);
    const totalFailed = Object.values(this.results).reduce((sum, category) => sum + category.failed, 0);
    const totalTests = totalPassed + totalFailed;
    const successRate = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : 0;

    const report = {
      timestamp,
      summary: {
        totalTests,
        passed: totalPassed,
        failed: totalFailed,
        successRate: `${successRate}%`
      },
      categories: this.results,
      recommendations: this.generateRecommendations()
    };

    // Write detailed report
    fs.writeFileSync(
      `performance-deployment-report-${Date.now()}.json`,
      JSON.stringify(report, null, 2)
    );

    // Write summary report
    const summaryReport = `# Performance and Deployment Validation Report

Generated: ${timestamp}

## Summary
- **Total Tests**: ${totalTests}
- **Passed**: ${totalPassed}
- **Failed**: ${totalFailed}
- **Success Rate**: ${successRate}%

## Category Breakdown

### Performance (Requirements 6.1-6.6)
- Passed: ${this.results.performance.passed}
- Failed: ${this.results.performance.failed}
${this.results.performance.issues.length > 0 ? '- Issues:\n  - ' + this.results.performance.issues.join('\n  - ') : '- No issues found'}

### SEO (Requirements 7.1-7.4)
- Passed: ${this.results.seo.passed}
- Failed: ${this.results.seo.failed}
${this.results.seo.issues.length > 0 ? '- Issues:\n  - ' + this.results.seo.issues.join('\n  - ') : '- No issues found'}

### Deployment (Requirements 8.1-8.6)
- Passed: ${this.results.deployment.passed}
- Failed: ${this.results.deployment.failed}
${this.results.deployment.issues.length > 0 ? '- Issues:\n  - ' + this.results.deployment.issues.join('\n  - ') : '- No issues found'}

## Recommendations

${report.recommendations.join('\n')}

## Status

${successRate >= 90 ? '✅ **PASSED** - Performance and deployment meet quality standards' : 
  successRate >= 75 ? '⚠️ **NEEDS ATTENTION** - Some performance/deployment issues need to be addressed' : 
  '❌ **FAILED** - Critical performance/deployment issues found'}
`;

    fs.writeFileSync(
      `performance-deployment-summary-${Date.now()}.md`,
      summaryReport
    );

    return report;
  }

  generateRecommendations() {
    const recommendations = [];
    
    if (this.results.performance.failed > 0) {
      recommendations.push('- Optimize performance: ensure next/image usage, proper cache headers, and Core Web Vitals targets');
    }
    
    if (this.results.seo.failed > 0) {
      recommendations.push('- Improve SEO: add missing robots.txt, sitemap.xml, meta tags, and semantic HTML');
    }
    
    if (this.results.deployment.failed > 0) {
      recommendations.push('- Fix deployment issues: ensure CloudFront CDN, security headers, and proper infrastructure');
    }

    if (recommendations.length === 0) {
      recommendations.push('- All performance and deployment requirements are met! Ready for production.');
    }

    return recommendations;
  }

  async runAllValidations() {
    this.log('Starting performance and deployment validation...', 'info');
    
    await this.validatePerformance();
    await this.validateSEO();
    await this.validateDeployment();
    
    const report = this.generateReport();
    
    this.log(`Validation complete! Success rate: ${report.summary.successRate}`, 
      report.summary.successRate >= '90.0%' ? 'success' : 'error');
    
    return report;
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new PerformanceDeploymentValidator();
  validator.runAllValidations()
    .then(report => {
      console.log('\n📊 Performance & Deployment Validation Summary:');
      console.log(`Total Tests: ${report.summary.totalTests}`);
      console.log(`Passed: ${report.summary.passed}`);
      console.log(`Failed: ${report.summary.failed}`);
      console.log(`Success Rate: ${report.summary.successRate}`);
      
      if (report.summary.failed > 0) {
        console.log('\n❌ Issues found that need attention:');
        Object.entries(report.categories).forEach(([category, results]) => {
          if (results.issues.length > 0) {
            console.log(`\n${category.toUpperCase()}:`);
            results.issues.forEach(issue => console.log(`  - ${issue}`));
          }
        });
        process.exit(1);
      } else {
        console.log('\n✅ All performance and deployment validation passed!');
        process.exit(0);
      }
    })
    .catch(error => {
      console.error('❌ Performance & deployment validation failed:', error);
      process.exit(1);
    });
}

module.exports = PerformanceDeploymentValidator;