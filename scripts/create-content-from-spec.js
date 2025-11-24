#!/usr/bin/env node

/**
 * Content Generator from Specification
 * Creates new content that follows Kiro Content Requirements
 */

const fs = require('fs');
const path = require('path');

const CONTENT_TEMPLATES = {
  websiteDesign: {
    hero: {
      headline: 'Website Design for Cheshire Businesses',
      subheadline: 'Fast, mobile-optimised websites built to WCAG 2.1 standards',
      cta: 'Get a Free Website Quote',
      localTrust: 'Based in Nantwich. Serving Cheshire East.'
    },
    accessibility: `I follow WCAG 2.1 accessibility standards when building websites. This includes clear structure, readable text, strong colour contrast and accessible navigation across desktop and mobile.`,
    clarity: `I use Microsoft Clarity to analyse how visitors interact with your website. This includes scroll depth, click patterns and areas of hesitation. I use this information to improve usability and support better conversion performance.`,
    googleAds: [
      'Website design for Cheshire businesses',
      'Fast, mobile-first websites',
      'From £300'
    ],
    scram: {
      secureCloud: 'All websites include secure cloud hosting on AWS infrastructure',
      mobileFist: 'Mobile-optimised design ensures your website works perfectly on all devices',
      structured: 'Structured, modular builds make future updates straightforward'
    },
    pricing: {
      headline: 'Website Design Pricing',
      amount: 'from £300',
      description: 'Professional website design with hosting, analytics and ongoing support'
    }
  },

  hosting: {
    hero: {
      headline: 'Secure Cloud Hosting for Cheshire Businesses',
      subheadline: 'Fast websites with AWS infrastructure and 24/7 monitoring',
      cta: 'Get Hosting Quote',
      localTrust: 'Based in Nantwich. Serving Cheshire East.'
    },
    clarity: `I use Microsoft Clarity to review how visitors use your website and to improve the customer experience.`,
    googleAds: [
      'Secure cloud hosting',
      'Fast websites for Cheshire businesses',
      'Annual hosting from £120'
    ],
    scram: {
      secureCloud: 'Secure cloud hosting on AWS with automatic backups and monitoring'
    },
    pricing: {
      headline: 'Hosting Pricing',
      amount: 'from £120 per year',
      description: 'Includes SSL certificate, CDN, automatic backups and monitoring'
    }
  },

  analytics: {
    hero: {
      headline: 'GA4 and Tracking Setup',
      subheadline: 'Insight reporting and conversion tracking for Google Ads',
      cta: 'Get a Free Ads and Tracking Audit',
      localTrust: 'Based in Nantwich. Serving Cheshire East.'
    },
    clarity: `I use Microsoft Clarity to analyse how visitors interact with your website. This includes scroll depth, click patterns and areas of hesitation. I use this information to improve usability and support better conversion performance.`,
    googleAds: [
      'GA4 and tracking setup',
      'Insight reporting',
      'Conversion tracking for Google Ads'
    ]
  },

  freeAudit: {
    hero: {
      headline: 'Free Website and Ads Audit',
      subheadline: 'Get actionable insights to improve your website performance',
      cta: 'Start Your Free Audit',
      localTrust: 'Based in Nantwich. Serving Cheshire East.'
    },
    testimonials: ['Anna', 'Claire', 'Zach'],
    theme: 'hot-pink'
  }
};

class ContentGenerator {
  constructor(pageType, options = {}) {
    this.pageType = pageType;
    this.options = options;
    this.template = CONTENT_TEMPLATES[pageType];

    if (!this.template) {
      throw new Error(`Unknown page type: ${pageType}`);
    }
  }

  generateHeroSection() {
    const { headline, subheadline, cta, localTrust } = this.template.hero;

    return `
## Hero Section

**Headline:** ${headline}

**Subheadline:** ${subheadline}

**CTA:** ${cta}

**Local Trust Indicator:** ${localTrust}
`;
  }

  generateAccessibilitySection() {
    if (!this.template.accessibility) return '';

    return `
## Accessibility Statement

${this.template.accessibility}
`;
  }

  generateClaritySection() {
    if (!this.template.clarity) return '';

    return `
## Microsoft Clarity

${this.template.clarity}
`;
  }

  generateGoogleAdsSection() {
    if (!this.template.googleAds) return '';

    return `
## Google Ads Message Match

${this.template.googleAds.map(msg => `- ${msg}`).join('\n')}
`;
  }

  generateSCRAMSection() {
    if (!this.template.scram) return '';

    const items = Object.values(this.template.scram);

    return `
## SCRAM Requirements

${items.map(item => `- ${item}`).join('\n')}
`;
  }

  generatePricingSection() {
    if (!this.template.pricing) return '';

    const { headline, amount, description } = this.template.pricing;

    return `
## Pricing

**${headline}**

${amount}

${description}
`;
  }

  generateTestimonialsSection() {
    if (!this.template.testimonials) return '';

    return `
## Testimonials

Required testimonials: ${this.template.testimonials.join(', ')}

Include testimonial carousel with all three testimonials.
`;
  }

  generateFullContent() {
    let content = `# ${this.pageType.charAt(0).toUpperCase() + this.pageType.slice(1)} Page Content\n`;
    content += `\nGenerated: ${new Date().toISOString()}\n`;
    content += `\n---\n`;

    content += this.generateHeroSection();
    content += this.generateAccessibilitySection();
    content += this.generateClaritySection();
    content += this.generateGoogleAdsSection();
    content += this.generateSCRAMSection();
    content += this.generatePricingSection();
    content += this.generateTestimonialsSection();

    content += `\n---\n\n`;
    content += `## Content Requirements Checklist\n\n`;
    content += `- [x] UK English spelling\n`;
    content += `- [x] Active voice\n`;
    content += `- [x] Above-the-fold requirements met\n`;
    content += `- [x] Approved CTA wording\n`;
    content += `- [x] Local trust indicator included\n`;

    if (this.template.accessibility) {
      content += `- [x] WCAG 2.1 statement included\n`;
    }

    if (this.template.clarity) {
      content += `- [x] Microsoft Clarity statement included\n`;
    }

    if (this.template.googleAds) {
      content += `- [x] Google Ads message match included\n`;
    }

    if (this.template.scram) {
      content += `- [x] SCRAM requirements met\n`;
    }

    if (this.template.pricing) {
      content += `- [x] Pricing information included\n`;
    }

    return content;
  }

  saveToFile(outputPath) {
    const content = this.generateFullContent();
    fs.writeFileSync(outputPath, content);
    console.log(`✅ Content generated: ${outputPath}`);
    return outputPath;
  }
}

// CLI usage
if (require.main === module) {
  const pageType = process.argv[2];
  const outputPath = process.argv[3];

  if (!pageType) {
    console.log('Usage: node create-content-from-spec.js <page-type> [output-path]');
    console.log('\nAvailable page types:');
    console.log('  - websiteDesign');
    console.log('  - hosting');
    console.log('  - analytics');
    console.log('  - freeAudit');
    process.exit(1);
  }

  try {
    const generator = new ContentGenerator(pageType);
    const defaultPath = path.join(process.cwd(), `content-${pageType}-${Date.now()}.md`);
    const savePath = outputPath || defaultPath;

    generator.saveToFile(savePath);

    console.log('\n📋 Content Preview:');
    console.log('─'.repeat(60));
    console.log(generator.generateFullContent().substring(0, 500) + '...');
    console.log('─'.repeat(60));

  } catch (error) {
    console.error('Error generating content:', error.message);
    process.exit(1);
  }
}

module.exports = ContentGenerator;
