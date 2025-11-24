#!/usr/bin/env node

/**
 * Comprehensive Conversion Improvements Validation
 * Validates UK English, conversion optimizations, and tracking setup
 */

const fs = require('fs');
const path = require('path');

class ConversionImprovementsValidator {
  constructor() {
    this.results = {
      ukEnglish: { passed: [], failed: [] },
      conversionElements: { passed: [], failed: [] },
      tracking: { passed: [], failed: [] },
      clarity: { passed: [], failed: [] },
      ga4: { passed: [], failed: [] }
    };
  }

  // UK English validation patterns
  validateUKEnglish() {
    console.log('\n🇬🇧 Validating UK English Normalisation...\n');

    const ukPatterns = {
      'optimise/optimisation': /\boptimi[sz]e/gi,
      'centre': /\bcenter/gi,
      'visualisation': /\bvisuali[sz]ation/gi,
      'enquiries': /\binquir(y|ies)/gi,
      'colour': /\bcolor/gi,
      'analyse': /\banalyze/gi,
      'organisation': /\borganization/gi
    };

    const filesToCheck = [
      'src/app/page.tsx',
      'src/app/about/page.tsx',
      'src/app/contact/page.tsx',
      'src/app/services/website-design/page.tsx',
      'src/app/services/analytics/page.tsx',
      'src/app/services/hosting/page.tsx',
      'src/app/services/photography/page.tsx',
      'src/app/services/ad-campaigns/page.tsx'
    ];

    filesToCheck.forEach(file => {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf-8');
        let hasUSSpelling = false;

        Object.entries(ukPatterns).forEach(([term, pattern]) => {
          const matches = content.match(pattern);
          if (matches) {
            matches.forEach(match => {
              // Check if it's US spelling
              if (match.match(/center|ize|ization|olor|inquiry|inquiries/i)) {
                hasUSSpelling = true;
                this.results.ukEnglish.failed.push({
                  file,
                  issue: `US spelling found: "${match}"`,
                  suggestion: this.getUKEquivalent(match)
                });
              }
            });
          }
        });

        if (!hasUSSpelling) {
          this.results.ukEnglish.passed.push({
            file,
            status: 'UK English compliant'
          });
        }
      }
    });
  }

  getUKEquivalent(usWord) {
    const map = {
      'optimize': 'optimise',
      'optimization': 'optimisation',
      'center': 'centre',
      'visualization': 'visualisation',
      'inquiry': 'enquiry',
      'inquiries': 'enquiries',
      'color': 'colour',
      'analyze': 'analyse',
      'organization': 'organisation'
    };
    return map[usWord.toLowerCase()] || usWord;
  }

  // Validate conversion elements
  validateConversionElements() {
    console.log('\n🎯 Validating Conversion Elements...\n');

    const elementsToCheck = [
      {
        name: 'Above-fold CTAs',
        files: ['src/app/page.tsx', 'src/app/services/website-design/page.tsx'],
        pattern: /(Get a Free|Get Your|Request|Contact Us|Start Your)/i
      },
      {
        name: 'Local trust indicators',
        files: ['src/app/page.tsx', 'src/components/layout/Footer.tsx'],
        pattern: /(Nantwich|Cheshire East|Crewe|Sandbach|Congleton)/i
      },
      {
        name: 'Clear value propositions',
        files: ['src/app/services/website-design/page.tsx', 'src/app/services/analytics/page.tsx'],
        pattern: /(secure cloud hosting|modular builds|performance-focused|GA4.*experience|insight generation)/i
      },
      {
        name: 'Mobile-optimised CTAs',
        files: ['src/components/StickyCTA.tsx', 'src/components/DualStickyCTA.tsx'],
        pattern: /(sticky|fixed|bottom-0|z-\[9999\])/i
      },
      {
        name: 'Accessibility improvements',
        files: ['src/app/globals.css', 'src/components/layout/Header.tsx'],
        pattern: /(aria-label|role=|focus:|contrast)/i
      }
    ];

    elementsToCheck.forEach(element => {
      let found = false;
      element.files.forEach(file => {
        if (fs.existsSync(file)) {
          const content = fs.readFileSync(file, 'utf-8');
          if (element.pattern.test(content)) {
            found = true;
          }
        }
      });

      if (found) {
        this.results.conversionElements.passed.push({
          element: element.name,
          status: 'Implemented'
        });
      } else {
        this.results.conversionElements.failed.push({
          element: element.name,
          status: 'Missing or needs improvement'
        });
      }
    });
  }

  // Validate GA4 tracking
  validateGA4Tracking() {
    console.log('\n📊 Validating GA4 Tracking Setup...\n');

    const ga4Checks = [
      {
        name: 'GA4 Script Tag',
        file: 'src/app/layout.tsx',
        pattern: /G-QJXSCJ0L43/
      },
      {
        name: 'GA4 Event Tracking',
        file: 'src/components/analytics/ConversionTracker.tsx',
        pattern: /gtag\('event'/
      },
      {
        name: 'CTA Click Tracking',
        file: 'src/components/StickyCTA.tsx',
        pattern: /(onClick.*gtag|trackEvent|ga4Event)/i
      },
      {
        name: 'Form Submission Tracking',
        file: 'src/components/sections/TrackedContactForm.tsx',
        pattern: /(onSubmit.*gtag|form_submit|conversion)/i
      }
    ];

    ga4Checks.forEach(check => {
      if (fs.existsSync(check.file)) {
        const content = fs.readFileSync(check.file, 'utf-8');
        if (check.pattern.test(content)) {
          this.results.ga4.passed.push({
            check: check.name,
            status: 'Configured'
          });
        } else {
          this.results.ga4.failed.push({
            check: check.name,
            file: check.file,
            status: 'Not found or needs configuration'
          });
        }
      } else {
        this.results.ga4.failed.push({
          check: check.name,
          file: check.file,
          status: 'File not found'
        });
      }
    });
  }

  // Validate Microsoft Clarity
  validateClaritySetup() {
    console.log('\n🔍 Validating Microsoft Clarity Setup...\n');

    const clarityChecks = [
      {
        name: 'Clarity Script',
        file: 'src/app/layout.tsx',
        pattern: /clarity\.ms|microsoft.*clarity/i
      },
      {
        name: 'Clarity Project ID',
        file: 'src/app/layout.tsx',
        pattern: /clarity\(.*['"]\w+['"]\)/
      }
    ];

    clarityChecks.forEach(check => {
      if (fs.existsSync(check.file)) {
        const content = fs.readFileSync(check.file, 'utf-8');
        if (check.pattern.test(content)) {
          this.results.clarity.passed.push({
            check: check.name,
            status: 'Configured'
          });
        } else {
          this.results.clarity.failed.push({
            check: check.name,
            file: check.file,
            status: 'Not found'
          });
        }
      }
    });
  }

  // Validate tracking integration
  validateTrackingIntegration() {
    console.log('\n🔗 Validating Tracking Integration...\n');

    const integrationChecks = [
      {
        name: 'CloudFront CSP Headers for GA4',
        file: 'config/cloudfront-s3-config.json',
        pattern: /google-analytics\.com|googletagmanager\.com/
      },
      {
        name: 'Cookie Consent Banner',
        file: 'src/components/CookieBanner.tsx',
        pattern: /(analytics|tracking|consent)/i
      }
    ];

    integrationChecks.forEach(check => {
      if (fs.existsSync(check.file)) {
        const content = fs.readFileSync(check.file, 'utf-8');
        if (check.pattern.test(content)) {
          this.results.tracking.passed.push({
            check: check.name,
            status: 'Configured'
          });
        } else {
          this.results.tracking.failed.push({
            check: check.name,
            file: check.file,
            status: 'Needs configuration'
          });
        }
      }
    });
  }

  // Generate report
  generateReport() {
    const timestamp = new Date().toISOString();
    const report = {
      timestamp,
      summary: {
        ukEnglish: {
          passed: this.results.ukEnglish.passed.length,
          failed: this.results.ukEnglish.failed.length
        },
        conversionElements: {
          passed: this.results.conversionElements.passed.length,
          failed: this.results.conversionElements.failed.length
        },
        ga4: {
          passed: this.results.ga4.passed.length,
          failed: this.results.ga4.failed.length
        },
        clarity: {
          passed: this.results.clarity.passed.length,
          failed: this.results.clarity.failed.length
        },
        tracking: {
          passed: this.results.tracking.passed.length,
          failed: this.results.tracking.failed.length
        }
      },
      details: this.results
    };

    // Save JSON report
    const reportPath = `conversion-improvements-validation-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // Generate markdown summary
    this.generateMarkdownSummary(report);

    return report;
  }

  generateMarkdownSummary(report) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const summaryPath = `conversion-improvements-summary-${timestamp}.md`;

    let markdown = `# Conversion Improvements Validation Report\n\n`;
    markdown += `**Generated:** ${new Date().toLocaleString()}\n\n`;

    markdown += `## Summary\n\n`;
    markdown += `| Category | Passed | Failed | Status |\n`;
    markdown += `|----------|--------|--------|--------|\n`;

    Object.entries(report.summary).forEach(([category, stats]) => {
      const status = stats.failed === 0 ? '✅' : '⚠️';
      markdown += `| ${category} | ${stats.passed} | ${stats.failed} | ${status} |\n`;
    });

    markdown += `\n## UK English Normalisation\n\n`;
    if (report.details.ukEnglish.failed.length > 0) {
      markdown += `### Issues Found\n\n`;
      report.details.ukEnglish.failed.forEach(issue => {
        markdown += `- **${issue.file}**: ${issue.issue}\n`;
        markdown += `  - Suggestion: ${issue.suggestion}\n`;
      });
    } else {
      markdown += `✅ All files use UK English spelling\n`;
    }

    markdown += `\n## Conversion Elements\n\n`;
    report.details.conversionElements.passed.forEach(item => {
      markdown += `- ✅ ${item.element}: ${item.status}\n`;
    });
    report.details.conversionElements.failed.forEach(item => {
      markdown += `- ⚠️ ${item.element}: ${item.status}\n`;
    });

    markdown += `\n## GA4 Tracking\n\n`;
    report.details.ga4.passed.forEach(item => {
      markdown += `- ✅ ${item.check}: ${item.status}\n`;
    });
    report.details.ga4.failed.forEach(item => {
      markdown += `- ⚠️ ${item.check}: ${item.status}\n`;
    });

    markdown += `\n## Microsoft Clarity\n\n`;
    report.details.clarity.passed.forEach(item => {
      markdown += `- ✅ ${item.check}: ${item.status}\n`;
    });
    report.details.clarity.failed.forEach(item => {
      markdown += `- ⚠️ ${item.check}: ${item.status}\n`;
    });

    markdown += `\n## Recommendations\n\n`;
    markdown += `### Immediate Actions\n`;
    markdown += `- Monitor scroll maps and heatmaps in Microsoft Clarity\n`;
    markdown += `- Track CTA clicks in GA4 Realtime reports\n`;
    markdown += `- Review bounce rates for Google Ads landing pages\n`;
    markdown += `\n### Short-Term Improvements\n`;
    markdown += `- Add lead magnets (free audits, checklists)\n`;
    markdown += `- Create service-focused case studies\n`;
    markdown += `- Implement exit-intent popups for high-value pages\n`;
    markdown += `\n### Medium-Term Optimizations\n`;
    markdown += `- A/B test hero sections\n`;
    markdown += `- Test different CTA copy variations\n`;
    markdown += `- Optimize images further for mobile\n`;

    fs.writeFileSync(summaryPath, markdown);
    console.log(`\n✅ Summary saved to: ${summaryPath}\n`);
  }

  async run() {
    console.log('🚀 Starting Conversion Improvements Validation\n');
    console.log('='.repeat(60));

    this.validateUKEnglish();
    this.validateConversionElements();
    this.validateGA4Tracking();
    this.validateClaritySetup();
    this.validateTrackingIntegration();

    const report = this.generateReport();

    console.log('\n' + '='.repeat(60));
    console.log('\n📊 Validation Complete!\n');
    console.log(`✅ Passed: ${Object.values(report.summary).reduce((sum, cat) => sum + cat.passed, 0)}`);
    console.log(`⚠️  Failed: ${Object.values(report.summary).reduce((sum, cat) => sum + cat.failed, 0)}`);

    return report;
  }
}

// Run validation
if (require.main === module) {
  const validator = new ConversionImprovementsValidator();
  validator.run().catch(console.error);
}

module.exports = ConversionImprovementsValidator;
