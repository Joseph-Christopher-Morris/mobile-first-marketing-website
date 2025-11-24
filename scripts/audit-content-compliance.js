#!/usr/bin/env node

/**
 * Content Compliance Auditor
 * Audits all pages against Kiro Content Requirements Master Specification
 */

const fs = require('fs');
const path = require('path');

const SPEC_REQUIREMENTS = {
  ukEnglish: {
    required: ['optimise', 'optimisation', 'centre', 'enquiries', 'visualisation'],
    forbidden: ['optimize', 'optimization', 'center', 'inquiries', 'visualization']
  },
  accessibility: {
    required: 'I follow WCAG 2.1 accessibility standards',
    pages: ['website-design', 'services', 'hosting']
  },
  clarity: {
    short: 'I use Microsoft Clarity to review how visitors use your website',
    long: 'I use Microsoft Clarity to analyse how visitors interact with your website',
    pages: ['website-design', 'ad-campaigns', 'analytics', 'hosting', 'services']
  },
  googleAds: {
    websiteDesign: ['Website design for Cheshire businesses', 'fast, mobile‑first websites', 'from £300'],
    analytics: ['GA4 and tracking setup', 'insight reporting', 'conversion tracking for Google Ads'],
    hosting: ['secure cloud hosting', 'fast websites for Cheshire businesses', 'annual hosting from £120']
  },
  testimonials: {
    required: ['Anna', 'Claire', 'Zach'],
    carouselPages: ['free-audit']
  },
  pricing: {
    websiteDesign: 'from £300',
    hosting: 'from £120'
  },
  cta: {
    approved: [
      'Get a Free Website Quote',
      'Get Hosting Quote',
      'Get a Free Ads and Tracking Audit',
      'Start Your Free Audit'
    ]
  },
  aboveFold: {
    required: ['headline', 'subheadline', 'CTA', 'local trust indicator']
  },
  scram: {
    secureCloud: ['website-design', 'hosting'],
    mobileFist: ['website-design'],
    structuredModular: ['website-design'],
    analytics: ['analytics'],
    wcagClarity: ['website-design', 'services', 'hosting'],
    pricing: ['website-design', 'hosting']
  }
};

class ContentAuditor {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      summary: {
        totalPages: 0,
        compliant: 0,
        nonCompliant: 0,
        warnings: 0
      },
      pages: []
    };
  }

  async auditAllPages() {
    console.log('🔍 Starting Content Compliance Audit...\n');

    const pagesDir = path.join(process.cwd(), 'src/app');
    const pages = this.findPages(pagesDir);

    for (const pagePath of pages) {
      await this.auditPage(pagePath);
    }

    this.generateReport();
    return this.results;
  }

  findPages(dir, pages = []) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        this.findPages(filePath, pages);
      } else if (file === 'page.tsx' || file === 'page.ts') {
        pages.push(filePath);
      }
    }

    return pages;
  }

  async auditPage(pagePath) {
    const content = fs.readFileSync(pagePath, 'utf-8');
    const pageName = this.getPageName(pagePath);

    console.log(`📄 Auditing: ${pageName}`);

    const pageResult = {
      page: pageName,
      path: pagePath,
      issues: [],
      warnings: [],
      compliant: true
    };

    // Check UK English
    this.checkUKEnglish(content, pageResult);

    // Check Accessibility wording
    this.checkAccessibility(content, pageName, pageResult);

    // Check Microsoft Clarity
    this.checkClarity(content, pageName, pageResult);

    // Check Google Ads message match
    this.checkGoogleAds(content, pageName, pageResult);

    // Check Testimonials
    this.checkTestimonials(content, pageName, pageResult);

    // Check Pricing
    this.checkPricing(content, pageName, pageResult);

    // Check CTAs
    this.checkCTAs(content, pageResult);

    // Check SCRAM requirements
    this.checkSCRAM(content, pageName, pageResult);

    if (pageResult.issues.length > 0) {
      pageResult.compliant = false;
      this.results.summary.nonCompliant++;
    } else {
      this.results.summary.compliant++;
    }

    if (pageResult.warnings.length > 0) {
      this.results.summary.warnings++;
    }

    this.results.summary.totalPages++;
    this.results.pages.push(pageResult);

    console.log(`  ✓ Issues: ${pageResult.issues.length}, Warnings: ${pageResult.warnings.length}\n`);
  }

  getPageName(pagePath) {
    const parts = pagePath.split(path.sep);
    const appIndex = parts.indexOf('app');
    if (appIndex === -1) return 'unknown';

    const pathParts = parts.slice(appIndex + 1);
    pathParts.pop(); // Remove page.tsx

    return pathParts.length > 0 ? pathParts.join('/') : 'home';
  }

  checkUKEnglish(content, result) {
    const forbidden = SPEC_REQUIREMENTS.ukEnglish.forbidden;

    for (const word of forbidden) {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      if (regex.test(content)) {
        result.issues.push({
          type: 'UK_ENGLISH',
          severity: 'error',
          message: `American spelling detected: "${word}" (use UK English)`
        });
      }
    }
  }

  checkAccessibility(content, pageName, result) {
    const requiredPages = SPEC_REQUIREMENTS.accessibility.pages;
    const requiredText = SPEC_REQUIREMENTS.accessibility.required;

    if (requiredPages.some(p => pageName.includes(p))) {
      if (!content.includes('WCAG 2.1')) {
        result.issues.push({
          type: 'ACCESSIBILITY',
          severity: 'error',
          message: 'Missing required WCAG 2.1 accessibility statement'
        });
      }
    }
  }

  checkClarity(content, pageName, result) {
    const requiredPages = SPEC_REQUIREMENTS.clarity.pages;

    if (requiredPages.some(p => pageName.includes(p))) {
      if (!content.includes('Microsoft Clarity') && !content.includes('Clarity')) {
        result.issues.push({
          type: 'CLARITY',
          severity: 'error',
          message: 'Missing required Microsoft Clarity statement'
        });
      }
    }
  }

  checkGoogleAds(content, pageName, result) {
    if (pageName.includes('website-design')) {
      const required = SPEC_REQUIREMENTS.googleAds.websiteDesign;
      for (const phrase of required) {
        if (!content.toLowerCase().includes(phrase.toLowerCase())) {
          result.warnings.push({
            type: 'GOOGLE_ADS',
            severity: 'warning',
            message: `Missing Google Ads message match: "${phrase}"`
          });
        }
      }
    }

    if (pageName.includes('analytics')) {
      const required = SPEC_REQUIREMENTS.googleAds.analytics;
      for (const phrase of required) {
        if (!content.toLowerCase().includes(phrase.toLowerCase())) {
          result.warnings.push({
            type: 'GOOGLE_ADS',
            severity: 'warning',
            message: `Missing Google Ads message match: "${phrase}"`
          });
        }
      }
    }

    if (pageName.includes('hosting')) {
      const required = SPEC_REQUIREMENTS.googleAds.hosting;
      for (const phrase of required) {
        if (!content.toLowerCase().includes(phrase.toLowerCase())) {
          result.warnings.push({
            type: 'GOOGLE_ADS',
            severity: 'warning',
            message: `Missing Google Ads message match: "${phrase}"`
          });
        }
      }
    }
  }

  checkTestimonials(content, pageName, result) {
    if (pageName.includes('free-audit')) {
      const required = SPEC_REQUIREMENTS.testimonials.required;
      const missing = required.filter(name => !content.includes(name));

      if (missing.length > 0) {
        result.issues.push({
          type: 'TESTIMONIALS',
          severity: 'error',
          message: `Missing required testimonials: ${missing.join(', ')}`
        });
      }
    }
  }

  checkPricing(content, pageName, result) {
    if (pageName.includes('website-design') || pageName.includes('pricing')) {
      if (!content.includes('£300')) {
        result.warnings.push({
          type: 'PRICING',
          severity: 'warning',
          message: 'Missing website design pricing: "from £300"'
        });
      }
    }

    if (pageName.includes('hosting')) {
      if (!content.includes('£120')) {
        result.warnings.push({
          type: 'PRICING',
          severity: 'warning',
          message: 'Missing hosting pricing: "from £120"'
        });
      }
    }
  }

  checkCTAs(content, result) {
    const approved = SPEC_REQUIREMENTS.cta.approved;
    const hasCTA = approved.some(cta => content.includes(cta));

    if (content.includes('button') || content.includes('CTA')) {
      if (!hasCTA) {
        result.warnings.push({
          type: 'CTA',
          severity: 'warning',
          message: 'CTA detected but may not use approved wording'
        });
      }
    }
  }

  checkSCRAM(content, pageName, result) {
    // Check secure cloud hosting
    if (SPEC_REQUIREMENTS.scram.secureCloud.some(p => pageName.includes(p))) {
      if (!content.toLowerCase().includes('secure cloud hosting')) {
        result.issues.push({
          type: 'SCRAM',
          severity: 'error',
          message: 'Missing SCRAM requirement: "secure cloud hosting"'
        });
      }
    }

    // Check mobile-first
    if (SPEC_REQUIREMENTS.scram.mobileFist.some(p => pageName.includes(p))) {
      if (!content.toLowerCase().includes('mobile')) {
        result.warnings.push({
          type: 'SCRAM',
          severity: 'warning',
          message: 'Missing SCRAM requirement: mobile-first design mention'
        });
      }
    }
  }

  generateReport() {
    const reportPath = path.join(process.cwd(), `content-compliance-audit-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));

    console.log('\n' + '='.repeat(60));
    console.log('📊 CONTENT COMPLIANCE AUDIT SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Pages Audited: ${this.results.summary.totalPages}`);
    console.log(`✅ Compliant: ${this.results.summary.compliant}`);
    console.log(`❌ Non-Compliant: ${this.results.summary.nonCompliant}`);
    console.log(`⚠️  Pages with Warnings: ${this.results.summary.warnings}`);
    console.log('='.repeat(60));

    if (this.results.summary.nonCompliant > 0) {
      console.log('\n❌ NON-COMPLIANT PAGES:');
      this.results.pages
        .filter(p => !p.compliant)
        .forEach(page => {
          console.log(`\n  ${page.page}:`);
          page.issues.forEach(issue => {
            console.log(`    • [${issue.type}] ${issue.message}`);
          });
        });
    }

    console.log(`\n📄 Full report saved: ${reportPath}\n`);
  }
}

// Run audit
if (require.main === module) {
  const auditor = new ContentAuditor();
  auditor.auditAllPages()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Audit failed:', err);
      process.exit(1);
    });
}

module.exports = ContentAuditor;
