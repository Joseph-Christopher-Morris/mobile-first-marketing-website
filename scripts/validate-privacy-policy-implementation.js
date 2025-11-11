#!/usr/bin/env node

/**
 * Privacy Policy Implementation Validation Script
 * 
 * Validates:
 * - Privacy Policy page accessibility at /privacy-policy/ URL
 * - Privacy Policy is excluded from navigation menus
 * - Privacy Policy URL appears in sitemap.xml
 * 
 * Requirements: 11.3, 11.4, 11.5
 */

const fs = require('fs');
const path = require('path');

class PrivacyPolicyValidator {
  constructor() {
    this.results = {
      pageAccessibility: { passed: 0, failed: 0, details: [] },
      navigationExclusion: { passed: 0, failed: 0, details: [] },
      sitemapInclusion: { passed: 0, failed: 0, details: [] }
    };
  }

  // Validate Privacy Policy page exists and is accessible
  validatePageAccessibility() {
    console.log('\n🔍 Validating Privacy Policy page accessibility...');
    
    const privacyPolicyFile = 'src/app/privacy-policy/page.tsx';
    
    if (!fs.existsSync(privacyPolicyFile)) {
      this.results.pageAccessibility.failed++;
      this.results.pageAccessibility.details.push({
        file: privacyPolicyFile,
        issue: 'Privacy Policy page file not found',
        status: 'FAILED'
      });
      return;
    }
    
    const content = fs.readFileSync(privacyPolicyFile, 'utf8');
    
    // Check for required elements
    const requiredElements = [
      { pattern: /Privacy Policy/, description: 'Privacy Policy title' },
      { pattern: /export default function PrivacyPolicyPage/, description: 'Privacy Policy component export' },
      { pattern: /export const metadata[\s\S]*?Privacy Policy/, description: 'Privacy Policy metadata' },
      { pattern: /<Layout>/, description: 'Layout wrapper' },
      { pattern: /GDPR/, description: 'GDPR compliance content' },
      { pattern: /joe@vividauto\.photography/, description: 'Contact email' }
    ];
    
    requiredElements.forEach(element => {
      if (element.pattern.test(content)) {
        this.results.pageAccessibility.passed++;
        this.results.pageAccessibility.details.push({
          file: privacyPolicyFile,
          issue: `${element.description} is present`,
          status: 'PASSED'
        });
      } else {
        this.results.pageAccessibility.failed++;
        this.results.pageAccessibility.details.push({
          file: privacyPolicyFile,
          issue: `${element.description} is missing`,
          status: 'FAILED'
        });
      }
    });
    
    // Check for static export configuration
    if (content.includes("export const dynamic = 'force-static'")) {
      this.results.pageAccessibility.passed++;
      this.results.pageAccessibility.details.push({
        file: privacyPolicyFile,
        issue: 'Static export configuration is present',
        status: 'PASSED'
      });
    } else {
      this.results.pageAccessibility.failed++;
      this.results.pageAccessibility.details.push({
        file: privacyPolicyFile,
        issue: 'Static export configuration is missing',
        status: 'FAILED'
      });
    }
  }

  // Validate Privacy Policy is excluded from navigation menus
  validateNavigationExclusion() {
    console.log('\n🧭 Validating Privacy Policy exclusion from navigation...');
    
    const navigationFiles = [
      'src/components/layout/Header.tsx',
      'src/components/layout/Footer.tsx',
      'src/components/layout/MobileMenu.tsx'
    ];
    
    navigationFiles.forEach(file => {
      if (!fs.existsSync(file)) {
        this.results.navigationExclusion.failed++;
        this.results.navigationExclusion.details.push({
          file,
          issue: 'Navigation file not found',
          status: 'FAILED'
        });
        return;
      }
      
      const content = fs.readFileSync(file, 'utf8');
      
      // Check that Privacy Policy is NOT in navigation
      const privacyPolicyPatterns = [
        /privacy-policy/i,
        /Privacy Policy/,
        /href.*privacy/i
      ];
      
      let hasPrivacyPolicyLink = false;
      privacyPolicyPatterns.forEach(pattern => {
        if (pattern.test(content)) {
          hasPrivacyPolicyLink = true;
        }
      });
      
      if (hasPrivacyPolicyLink) {
        this.results.navigationExclusion.failed++;
        this.results.navigationExclusion.details.push({
          file,
          issue: 'Contains Privacy Policy link (should be excluded)',
          status: 'FAILED'
        });
      } else {
        this.results.navigationExclusion.passed++;
        this.results.navigationExclusion.details.push({
          file,
          issue: 'Privacy Policy correctly excluded from navigation',
          status: 'PASSED'
        });
      }
    });
    
    // Verify navigation items array doesn't include privacy policy
    const headerFile = 'src/components/layout/Header.tsx';
    if (fs.existsSync(headerFile)) {
      const headerContent = fs.readFileSync(headerFile, 'utf8');
      
      // Extract navigation items
      const navItemsMatch = headerContent.match(/const navigationItems.*?=.*?\[(.*?)\];/s);
      if (navItemsMatch) {
        const navItemsContent = navItemsMatch[1];
        
        if (!navItemsContent.toLowerCase().includes('privacy')) {
          this.results.navigationExclusion.passed++;
          this.results.navigationExclusion.details.push({
            file: headerFile,
            issue: 'Navigation items array correctly excludes Privacy Policy',
            status: 'PASSED'
          });
        } else {
          this.results.navigationExclusion.failed++;
          this.results.navigationExclusion.details.push({
            file: headerFile,
            issue: 'Navigation items array includes Privacy Policy',
            status: 'FAILED'
          });
        }
      }
    }
  }

  // Validate Privacy Policy URL appears in sitemap.xml
  validateSitemapInclusion() {
    console.log('\n🗺️ Validating Privacy Policy inclusion in sitemap...');
    
    const sitemapFiles = ['public/sitemap.xml', 'out/sitemap.xml'];
    let sitemapFound = false;
    
    sitemapFiles.forEach(sitemapFile => {
      if (fs.existsSync(sitemapFile)) {
        sitemapFound = true;
        const content = fs.readFileSync(sitemapFile, 'utf8');
        
        // Check for Privacy Policy URL
        const privacyPolicyUrl = 'https://d15sc9fc739ev2.cloudfront.net/privacy-policy/';
        
        if (content.includes(privacyPolicyUrl)) {
          this.results.sitemapInclusion.passed++;
          this.results.sitemapInclusion.details.push({
            file: sitemapFile,
            issue: 'Privacy Policy URL is included in sitemap',
            status: 'PASSED'
          });
        } else {
          this.results.sitemapInclusion.failed++;
          this.results.sitemapInclusion.details.push({
            file: sitemapFile,
            issue: 'Privacy Policy URL is missing from sitemap',
            status: 'FAILED'
          });
        }
        
        // Check for proper XML structure
        if (content.includes('<urlset') && content.includes('</urlset>')) {
          this.results.sitemapInclusion.passed++;
          this.results.sitemapInclusion.details.push({
            file: sitemapFile,
            issue: 'Sitemap has proper XML structure',
            status: 'PASSED'
          });
        } else {
          this.results.sitemapInclusion.failed++;
          this.results.sitemapInclusion.details.push({
            file: sitemapFile,
            issue: 'Sitemap has invalid XML structure',
            status: 'FAILED'
          });
        }
        
        // Check for CloudFront domain
        if (content.includes('d15sc9fc739ev2.cloudfront.net')) {
          this.results.sitemapInclusion.passed++;
          this.results.sitemapInclusion.details.push({
            file: sitemapFile,
            issue: 'Sitemap uses correct CloudFront domain',
            status: 'PASSED'
          });
        } else {
          this.results.sitemapInclusion.failed++;
          this.results.sitemapInclusion.details.push({
            file: sitemapFile,
            issue: 'Sitemap does not use CloudFront domain',
            status: 'FAILED'
          });
        }
      }
    });
    
    if (!sitemapFound) {
      this.results.sitemapInclusion.failed++;
      this.results.sitemapInclusion.details.push({
        file: 'sitemap.xml',
        issue: 'No sitemap.xml file found',
        status: 'FAILED'
      });
    }
  }

  // Generate validation report
  generateReport() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportData = {
      timestamp,
      summary: {
        pageAccessibility: {
          total: this.results.pageAccessibility.passed + this.results.pageAccessibility.failed,
          passed: this.results.pageAccessibility.passed,
          failed: this.results.pageAccessibility.failed,
          passRate: `${Math.round((this.results.pageAccessibility.passed / (this.results.pageAccessibility.passed + this.results.pageAccessibility.failed)) * 100)}%`
        },
        navigationExclusion: {
          total: this.results.navigationExclusion.passed + this.results.navigationExclusion.failed,
          passed: this.results.navigationExclusion.passed,
          failed: this.results.navigationExclusion.failed,
          passRate: `${Math.round((this.results.navigationExclusion.passed / (this.results.navigationExclusion.passed + this.results.navigationExclusion.failed)) * 100)}%`
        },
        sitemapInclusion: {
          total: this.results.sitemapInclusion.passed + this.results.sitemapInclusion.failed,
          passed: this.results.sitemapInclusion.passed,
          failed: this.results.sitemapInclusion.failed,
          passRate: `${Math.round((this.results.sitemapInclusion.passed / (this.results.sitemapInclusion.passed + this.results.sitemapInclusion.failed)) * 100)}%`
        }
      },
      details: this.results,
      requirements: {
        '11.3': 'Privacy Policy page accessibility at /privacy-policy/ URL',
        '11.4': 'Privacy Policy is excluded from navigation menus',
        '11.5': 'Privacy Policy URL appears in sitemap.xml'
      }
    };

    // Save detailed report
    const reportFile = `privacy-policy-validation-report-${Date.now()}.json`;
    fs.writeFileSync(reportFile, JSON.stringify(reportData, null, 2));

    // Generate summary
    const summaryFile = `privacy-policy-validation-summary-${Date.now()}.md`;
    const summaryContent = this.generateSummaryMarkdown(reportData);
    fs.writeFileSync(summaryFile, summaryContent);

    return { reportFile, summaryFile, data: reportData };
  }

  generateSummaryMarkdown(data) {
    return `# Privacy Policy Implementation Validation Summary

**Generated:** ${data.timestamp}

## Overall Results

| Category | Total | Passed | Failed | Pass Rate |
|----------|-------|--------|--------|-----------|
| Page Accessibility | ${data.summary.pageAccessibility.total} | ${data.summary.pageAccessibility.passed} | ${data.summary.pageAccessibility.failed} | ${data.summary.pageAccessibility.passRate} |
| Navigation Exclusion | ${data.summary.navigationExclusion.total} | ${data.summary.navigationExclusion.passed} | ${data.summary.navigationExclusion.failed} | ${data.summary.navigationExclusion.passRate} |
| Sitemap Inclusion | ${data.summary.sitemapInclusion.total} | ${data.summary.sitemapInclusion.passed} | ${data.summary.sitemapInclusion.failed} | ${data.summary.sitemapInclusion.passRate} |

## Requirements Validation

- **Requirement 11.3:** ${data.summary.pageAccessibility.failed === 0 ? '✅ PASSED' : '❌ FAILED'} - Privacy Policy page accessibility at /privacy-policy/ URL
- **Requirement 11.4:** ${data.summary.navigationExclusion.failed === 0 ? '✅ PASSED' : '❌ FAILED'} - Privacy Policy is excluded from navigation menus
- **Requirement 11.5:** ${data.summary.sitemapInclusion.failed === 0 ? '✅ PASSED' : '❌ FAILED'} - Privacy Policy URL appears in sitemap.xml

## Key Findings

### Page Accessibility
${data.details.pageAccessibility.details.map(detail => `- ${detail.status === 'PASSED' ? '✅' : '❌'} ${detail.file}: ${detail.issue}`).join('\n')}

### Navigation Exclusion
${data.details.navigationExclusion.details.map(detail => `- ${detail.status === 'PASSED' ? '✅' : '❌'} ${detail.file}: ${detail.issue}`).join('\n')}

### Sitemap Inclusion
${data.details.sitemapInclusion.details.map(detail => `- ${detail.status === 'PASSED' ? '✅' : '❌'} ${detail.file}: ${detail.issue}`).join('\n')}

## Recommendations

${data.summary.pageAccessibility.failed > 0 ? '- Fix Privacy Policy page accessibility issues' : ''}
${data.summary.navigationExclusion.failed > 0 ? '- Remove Privacy Policy links from navigation menus' : ''}
${data.summary.sitemapInclusion.failed > 0 ? '- Add Privacy Policy URL to sitemap.xml' : ''}

---
*Generated by Privacy Policy Implementation Validation Script*
`;
  }

  async run() {
    console.log('🚀 Starting Privacy Policy Implementation Validation...');
    console.log('📋 Task 8.2: Validate Privacy Policy implementation');
    console.log('📋 Requirements: 11.3, 11.4, 11.5');
    
    this.validatePageAccessibility();
    this.validateNavigationExclusion();
    this.validateSitemapInclusion();
    
    const report = this.generateReport();
    
    console.log('\n📊 Validation Complete!');
    console.log(`📄 Detailed report: ${report.reportFile}`);
    console.log(`📝 Summary report: ${report.summaryFile}`);
    
    // Display summary in console
    const totalTests = Object.values(report.data.summary).reduce((sum, category) => sum + category.total, 0);
    const totalPassed = Object.values(report.data.summary).reduce((sum, category) => sum + category.passed, 0);
    const totalFailed = Object.values(report.data.summary).reduce((sum, category) => sum + category.failed, 0);
    const overallPassRate = Math.round((totalPassed / totalTests) * 100);
    
    console.log(`\n📈 Overall Results: ${totalPassed}/${totalTests} tests passed (${overallPassRate}%)`);
    
    if (totalFailed === 0) {
      console.log('✅ All Privacy Policy implementation requirements validated successfully!');
      return true;
    } else {
      console.log(`❌ ${totalFailed} validation issues found. Check reports for details.`);
      return false;
    }
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new PrivacyPolicyValidator();
  validator.run().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('❌ Validation failed:', error);
    process.exit(1);
  });
}

module.exports = PrivacyPolicyValidator;