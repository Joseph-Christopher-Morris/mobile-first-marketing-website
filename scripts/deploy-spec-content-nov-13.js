#!/usr/bin/env node

/**
 * Spec Content Deployment Script - November 13, 2025
 * 
 * Implements comprehensive website copy updates from:
 * - MASTER-WEBSITE-COPY-KIRO (1).md
 * - MESSAGE 3 — SYSTEM COMPONENTS + SEO + CTA FRAMEWORK.md
 * - PAGE 6 — ANALYTICS & INSIGHTS.md
 * 
 * This script validates the implementation and prepares for deployment.
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Spec Content Deployment - November 13, 2025\n');

// Validation checks
const checks = {
  stickyCTA: false,
  footer: false,
  homePageSEO: false,
  servicesPageSEO: false,
  analyticsPage: false,
};

// Check StickyCTA component
try {
  const stickyPath = path.join(__dirname, '../src/components/StickyCTA.tsx');
  const stickyContent = fs.readFileSync(stickyPath, 'utf8');
  
  if (stickyContent.includes('Call for a Free Ad Plan') &&
      stickyContent.includes('Call to Discuss Your Project') &&
      stickyContent.includes('Call About Tracking Setup')) {
    checks.stickyCTA = true;
    console.log('✅ StickyCTA component updated with new mapping');
  } else {
    console.log('❌ StickyCTA component needs updating');
  }
} catch (error) {
  console.log('❌ Error checking StickyCTA:', error.message);
}

// Check Footer component
try {
  const footerPath = path.join(__dirname, '../src/components/layout/Footer.tsx');
  const footerContent = fs.readFileSync(footerPath, 'utf8');
  
  if (footerContent.includes('Business Hours (UK)') &&
      footerContent.includes('Monday to Friday: 09:00 to 18:00')) {
    checks.footer = true;
    console.log('✅ Footer component updated with new business hours');
  } else {
    console.log('❌ Footer component needs updating');
  }
} catch (error) {
  console.log('❌ Error checking Footer:', error.message);
}

// Check Home page SEO
try {
  const homePath = path.join(__dirname, '../src/app/page.tsx');
  const homeContent = fs.readFileSync(homePath, 'utf8');
  
  if (homeContent.includes('Websites, Google Ads and Analytics for Cheshire Businesses')) {
    checks.homePageSEO = true;
    console.log('✅ Home page SEO metadata updated');
  } else {
    console.log('⚠️  Home page SEO needs updating');
  }
} catch (error) {
  console.log('❌ Error checking Home page:', error.message);
}

console.log('\n📊 Implementation Status:');
console.log('========================');
const completed = Object.values(checks).filter(Boolean).length;
const total = Object.keys(checks).length;
console.log(`Progress: ${completed}/${total} components updated`);

if (completed === total) {
  console.log('\n✅ All infrastructure components updated!');
  console.log('\n📝 Next Steps:');
  console.log('1. Update remaining page content');
  console.log('2. Run: npm run build');
  console.log('3. Deploy using: node scripts/deploy.js');
} else {
  console.log('\n⚠️  Some components still need updating');
  console.log('Please complete the updates before deploying.');
}

console.log('\n🎯 Deployment Target: S3 + CloudFront');
console.log('📍 Distribution: E2IBMHQ3GCW6ZK');
console.log('🪣 Bucket: mobile-marketing-site-prod-1759705011281-tyzuo9\n');
