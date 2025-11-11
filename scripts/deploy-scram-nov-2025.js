#!/usr/bin/env node

/**
 * SCRAM November 2025 Deployment Script
 * 
 * Deploys all SCRAM checklist updates for Vivid Media Cheshire
 * 
 * Changes include:
 * - Website Hosting: Hero image update, mobile phone field required, removed duplicate image
 * - Website Design: Mobile phone field required
 * - Ad Campaigns: Updated metrics copy
 * - Analytics: Updated ROI copy (£ instead of $)
 * - About: Credentials section updated (BBC News instead of Business Insider)
 * - Footer: Added Website Design & Development, updated Privacy Policy link text
 * - Forms: Added Website Design & Development option, mobile phone required
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting SCRAM November 2025 Deployment...\n');

// Verify we're in the right directory
if (!fs.existsSync('package.json')) {
  console.error('❌ Error: Must run from project root directory');
  process.exit(1);
}

try {
  // Step 1: Build the project
  console.log('📦 Building Next.js project...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completed successfully\n');

  // Step 2: Deploy to S3 and CloudFront
  console.log('☁️  Deploying to AWS S3 + CloudFront...');
  execSync('node scripts/deploy.js', { stdio: 'inherit' });
  console.log('✅ Deployment completed successfully\n');

  // Step 3: Invalidate CloudFront cache
  console.log('🔄 Invalidating CloudFront cache...');
  execSync('node scripts/cloudfront-invalidation-vivid-auto.js', { stdio: 'inherit' });
  console.log('✅ Cache invalidation completed\n');

  console.log('🎉 SCRAM November 2025 deployment completed successfully!');
  console.log('\n📋 Summary of changes deployed:');
  console.log('  ✓ Website Hosting: Hero image updated, mobile phone required');
  console.log('  ✓ Website Design: Mobile phone field required');
  console.log('  ✓ Ad Campaigns: Updated metrics (NYCC 35% booking increase)');
  console.log('  ✓ Analytics: Currency updated to £');
  console.log('  ✓ About: Credentials updated (BBC News featured)');
  console.log('  ✓ Footer: Website Design & Development added, Privacy Policy link updated');
  console.log('  ✓ Forms: Website Design & Development option added, mobile phone required');
  console.log('\n🌐 Live at: https://d15sc9fc739ev2.cloudfront.net');

} catch (error) {
  console.error('\n❌ Deployment failed:', error.message);
  process.exit(1);
}
