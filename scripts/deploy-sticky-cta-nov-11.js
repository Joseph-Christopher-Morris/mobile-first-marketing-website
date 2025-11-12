#!/usr/bin/env node

/**
 * Deploy Sticky CTA with GA4 Tracking - November 11, 2025
 * Deploys the context-aware sticky CTA from the successful Nov 11 deployment
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const S3_BUCKET = 'mobile-marketing-site-prod-1759705011281-tyzuo9';
const CLOUDFRONT_DISTRIBUTION_ID = 'E2IBMHQ3GCW6ZK';
const AWS_REGION = 'us-east-1';

console.log('🚀 Deploying Sticky CTA with GA4 Tracking...\n');

// Step 1: Clean previous build
console.log('📦 Step 1: Cleaning previous build...');
try {
  if (fs.existsSync('out')) {
    fs.rmSync('out', { recursive: true, force: true });
    console.log('✅ Previous build cleaned\n');
  }
} catch (error) {
  console.error('⚠️  Warning: Could not clean previous build:', error.message);
}

// Step 2: Build the site
console.log('🔨 Step 2: Building Next.js site...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build complete\n');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// Step 3: Verify build output
console.log('🔍 Step 3: Verifying build output...');
if (!fs.existsSync('out')) {
  console.error('❌ Build output directory "out" not found');
  process.exit(1);
}

const files = fs.readdirSync('out');
console.log(`✅ Found ${files.length} files in build output\n`);

// Step 4: Deploy to S3
console.log('☁️  Step 4: Deploying to S3...');
try {
  execSync(
    `aws s3 sync out/ s3://${S3_BUCKET}/ --delete --region ${AWS_REGION}`,
    { stdio: 'inherit' }
  );
  console.log('✅ S3 deployment complete\n');
} catch (error) {
  console.error('❌ S3 deployment failed:', error.message);
  process.exit(1);
}

// Step 5: Create CloudFront invalidation
console.log('🔄 Step 5: Creating CloudFront invalidation...');
try {
  const result = execSync(
    `aws cloudfront create-invalidation --distribution-id ${CLOUDFRONT_DISTRIBUTION_ID} --paths "/*"`,
    { encoding: 'utf-8' }
  );
  
  const invalidation = JSON.parse(result);
  const invalidationId = invalidation.Invalidation.Id;
  
  console.log('✅ CloudFront invalidation created');
  console.log(`   Invalidation ID: ${invalidationId}\n`);
} catch (error) {
  console.error('❌ CloudFront invalidation failed:', error.message);
  process.exit(1);
}

// Success summary
console.log('═══════════════════════════════════════════════════════════');
console.log('✅ DEPLOYMENT COMPLETE - Sticky CTA with GA4 Tracking');
console.log('═══════════════════════════════════════════════════════════\n');

console.log('📊 What was deployed:');
console.log('   • Context-aware sticky CTA button');
console.log('   • GA4 event tracking (sticky_cta_click)');
console.log('   • GA4 form tracking (cta_form_input, lead_form_submit)');
console.log('   • Service-specific CTA text\n');

console.log('🌐 Website: https://d15sc9fc739ev2.cloudfront.net');
console.log('⏱️  Cache propagation: 5-10 minutes\n');

console.log('📋 Next Steps:');
console.log('   1. Wait 5-10 minutes for cache invalidation');
console.log('   2. Test sticky CTA on different pages');
console.log('   3. Verify GA4 events in Realtime reports');
console.log('   4. Mark lead_form_submit as conversion in GA4');
console.log('   5. Import conversion to Google Ads\n');

console.log('🎯 GA4 Events to verify:');
console.log('   • sticky_cta_click - When user clicks CTA');
console.log('   • cta_form_input - When user fills form field');
console.log('   • lead_form_submit - When user submits form\n');

console.log('═══════════════════════════════════════════════════════════');
