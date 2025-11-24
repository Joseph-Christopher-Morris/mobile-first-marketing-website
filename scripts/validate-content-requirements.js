#!/usr/bin/env node

/**
 * Content Requirements Validator
 * Real-time validation script for checking content compliance
 */

const fs = require('fs');
const path = require('path');

const VALIDATION_RULES = {
  // UK English validation
  ukEnglish: {
    name: 'UK English Compliance',
    check: (content) => {
      const americanSpellings = [
        { us: 'optimize', uk: 'optimise' },
        { us: 'optimization', uk: 'optimisation' },
        { us: 'center', uk: 'centre' },
        { us: 'inquiries', uk: 'enquiries' },
        { us: 'visualization', uk: 'visualisation' },
        { us: 'color', uk: 'colour' },
        { us: 'analyze', uk: 'analyse' }
      ];

      const violations = [];
      americanSpellings.forEach(({ us, uk }) => {
        const regex = new RegExp(`\\b${us}\\b`, 'gi');
        if (regex.test(content)) {
          violations.push(`Use "${uk}" instead of "${us}"`);
        }
      });

      return {
        passed: violations.length === 0,
        violations
      };
    }
  },

  // Active voice check
  activeVoice: {
    name: 'Active Voice Usage',
    check: (content) => {
      const passiveIndicators = [
        'was built by',
        'is created by',
        'are designed by',
        'were developed by'
      ];

      const violations = [];
      passiveIndicators.forEach(phrase => {
        if (content.toLowerCase().includes(phrase)) {
          violations.push(`Passive voice detected: "${phrase}"`);
        }
      });

      return {
        passed: violations.length === 0,
        violations,
        warning: violations.length > 0
      };
    }
  },

  // WCAG 2.1 requirement
  wcagAccessibility: {
    name: 'WCAG 2.1 Accessibility Statement',
    requiredPages: ['website-design', 'services', 'hosting'],
    check: (content, pageName) => {
      const required = 'WCAG 2.1';
      const hasStatement = content.includes(required);

      return {
        passed: hasStatement,
        violations: hasStatement ? [] : ['Missing WCAG 2.1 accessibility statement']
      };
    }
  },

  // Microsoft Clarity requirement
  clarityStatement: {
    name: 'Microsoft Clarity Statement',
    requiredPages: ['website-design', 'ad-campaigns', 'analytics', 'hosting', 'services'],
    check: (content, pageName) => {
      const hasClarity = content.includes('Microsoft Clarity') || content.includes('Clarity');

      return {
        passed: hasClarity,
        violations: hasClarity ? [] : ['Missing Microsoft Clarity statement']
      };
    }
  },

  // Testimonial requirements
  testimonials: {
    name: 'Required Testimonials',
    check: (content, pageName) => {
      if (pageName.includes('free-audit')) {
        const required = ['Anna', 'Claire', 'Zach'];
        const missing = required.filter(name => !content.includes(name));

        return {
          passed: missing.length === 0,
          violations: missing.length > 0 ? [`Missing testimonials: ${missing.join(', ')}`] : []
        };
      }

      return { passed: true, violations: [] };
    }
  },

  // Pricing requirements
  pricing: {
    name: 'Pricing Information',
    check: (content, pageName) => {
      const violations = [];

      if (pageName.includes('website-design') || pageName.includes('pricing')) {
        if (!content.includes('£300')) {
          violations.push('Missing website design pricing: "from £300"');
        }
      }

      if (pageName.includes('hosting')) {
        if (!content.includes('£120')) {
          violations.push('Missing hosting pricing: "from £120"');
        }
      }

      return {
        passed: violations.length === 0,
        violations
      };
    }
  },

  // CTA validation
  ctaApproved: {
    name: 'Approved CTA Wording',
    check: (content) => {
      const approvedCTAs = [
        'Get a Free Website Quote',
        'Get Hosting Quote',
        'Get a Free Ads and Tracking Audit',
        'Start Your Free Audit'
      ];

      const hasCTA = approvedCTAs.some(cta => content.includes(cta));
      const hasCTAElement = content.includes('button') || content.includes('CTA');

      if (hasCTAElement && !hasCTA) {
        return {
          passed: false,
          violations: ['CTA may not use approved wording'],
          warning: true
        };
      }

      return { passed: true, violations: [] };
    }
  },

  // SCRAM requirements
  scramCompliance: {
    name: 'SCRAM List Compliance',
    check: (content, pageName) => {
      const violations = [];

      // Secure cloud hosting
      if (pageName.includes('website-design') || pageName.includes('hosting')) {
        if (!content.toLowerCase().includes('secure cloud hosting')) {
          violations.push('Missing: "secure cloud hosting"');
        }
      }

      // Mobile-first
      if (pageName.includes('website-design')) {
        if (!content.toLowerCase().includes('mobile')) {
          violations.push('Missing: mobile-first design reference');
        }
      }

      return {
        passed: violations.length === 0,
        violations
      };
    }
  },

  // Exit intent requirements
  exitIntent: {
    name: 'Exit Intent Configuration',
    check: (content, pageName) => {
      if (content.includes('exit') && content.includes('intent')) {
        const violations = [];

        if (!content.includes('5 seconds') && !content.includes('5000')) {
          violations.push('Exit intent should trigger after 5 seconds');
        }

        if (!content.includes('session')) {
          violations.push('Exit intent should use session storage');
        }

        return {
          passed: violations.length === 0,
          violations,
          warning: true
        };
      }

      return { passed: true, violations: [] };
    }
  }
};

class ContentValidator {
  constructor(filePath) {
    this.filePath = filePath;
    this.content = '';
    this.pageName = '';
    this.results = {
      file: filePath,
      timestamp: new Date().toISOString(),
      passed: true,
      errors: [],
      warnings: []
    };
  }

  async validate() {
    try {
      this.content = fs.readFileSync(this.filePath, 'utf-8');
      this.pageName = this.getPageName();

      console.log(`\n🔍 Validating: ${this.pageName}`);
      console.log('─'.repeat(60));

      // Run all validation rules
      for (const [key, rule] of Object.entries(VALIDATION_RULES)) {
        // Skip if rule has required pages and this page isn't one of them
        if (rule.requiredPages && !rule.requiredPages.some(p => this.pageName.includes(p))) {
          continue;
        }

        const result = rule.check(this.content, this.pageName);

        if (!result.passed) {
          if (result.warning) {
            this.results.warnings.push({
              rule: rule.name,
              violations: result.violations
            });
            console.log(`⚠️  ${rule.name}:`);
          } else {
            this.results.passed = false;
            this.results.errors.push({
              rule: rule.name,
              violations: result.violations
            });
            console.log(`❌ ${rule.name}:`);
          }

          result.violations.forEach(v => console.log(`   • ${v}`));
        } else {
          console.log(`✅ ${rule.name}`);
        }
      }

      this.printSummary();
      return this.results;

    } catch (error) {
      console.error(`Error validating ${this.filePath}:`, error.message);
      this.results.passed = false;
      this.results.errors.push({
        rule: 'File Access',
        violations: [error.message]
      });
      return this.results;
    }
  }

  getPageName() {
    const parts = this.filePath.split(path.sep);
    const appIndex = parts.indexOf('app');
    if (appIndex === -1) return 'unknown';

    const pathParts = parts.slice(appIndex + 1);
    pathParts.pop(); // Remove page.tsx

    return pathParts.length > 0 ? pathParts.join('/') : 'home';
  }

  printSummary() {
    console.log('─'.repeat(60));

    if (this.results.passed && this.results.warnings.length === 0) {
      console.log('✅ All checks passed!');
    } else if (this.results.passed && this.results.warnings.length > 0) {
      console.log(`⚠️  Passed with ${this.results.warnings.length} warning(s)`);
    } else {
      console.log(`❌ Failed with ${this.results.errors.length} error(s)`);
    }
  }
}

// CLI usage
if (require.main === module) {
  const filePath = process.argv[2];

  if (!filePath) {
    console.error('Usage: node validate-content-requirements.js <file-path>');
    process.exit(1);
  }

  const validator = new ContentValidator(filePath);
  validator.validate()
    .then(results => {
      process.exit(results.passed ? 0 : 1);
    })
    .catch(err => {
      console.error('Validation failed:', err);
      process.exit(1);
    });
}

module.exports = ContentValidator;
