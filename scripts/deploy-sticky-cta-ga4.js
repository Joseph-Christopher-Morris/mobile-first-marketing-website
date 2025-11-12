const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Deploying Sticky CTA and GA4 Tracking Updates...\n');

// Configuration
const S3_BUCKET = process.env.S3_BUCKET_NAME || 'mobile-marketing-site-prod-1759705011281-tyzuo9';
const CLOUDFRONT_DIST = process.env.CLOUDFRONT_DISTRIBUTION_ID || 'E2IBMHQ3GCW6ZK';
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';

function runCommand(command, description) {
  console.log(`\n📋 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completed`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    return false;
  }
}

// Step 1: Clean previous build
console.log('\n🧹 Step 1: Cleaning previous build...');
if (fs.existsSync('out')) {
  fs.rmSync('out', { recursive: true, force: true });
  console.log('✅ Previous build cleaned');
}

// Step 2: Build the site
if (!runCommand('npm run build', 'Building Next.js static site')) {
  process.exit(1);
}

// Step 3: Verify build output
console.log('\n🔍 Step 3: Verifying build output...');
if (!fs.existsSync('out')) {
  console.error('❌ Build output directory not found');
  process.exit(1);
}
console.log('✅ Build output verified');

// Step 4: Deploy to S3
if (!runCommand(
  `aws s3 sync out/ s3://${S3_BUCKET}/ --delete --region ${AWS_REGION}`,
  'Deploying to S3'
)) {
  process.exit(1);
}

// Step 5: Invalidate CloudFront cache
console.log('\n🔄 Step 5: Invalidating CloudFront cache...');
const invalidationPaths = [
  '/*',
  '/index.html',
  '/_next/*',
];

try {
  const result = execSync(
    `aws cloudfront create-invalidation --distribution-id ${CLOUDFRONT_DIST} --paths ${invalidationPaths.join(' ')}`,
    { encoding: 'utf-8' }
  );
  
  const invalidation = JSON.parse(result);
  console.log(`✅ CloudFront invalidation created: ${invalidation.Invalidation.Id}`);
  console.log(`   Status: ${invalidation.Invalidation.Status}`);
} catch (error) {
  console.error('❌ CloudFront invalidation failed:', error.message);
  process.exit(1);
}

// Step 6: Summary
console.log('\n' + '='.repeat(60));
console.log('✅ DEPLOYMENT COMPLETE');
console.log('='.repeat(60));
console.log('\n📊 Changes Deployed:');
console.log('   • New context-aware sticky CTA button');
console.log('   • GA4 tracking for sticky_cta_click events');
console.log('   • GA4 tracking for cta_form_input events');
console.log('   • GA4 tracking for lead_form_submit events');
console.log('\n🔗 Website: https://d15sc9fc739ev2.cloudfront.net');
console.log('\n📈 Next Steps:');
console.log('   1. Test the sticky CTA on different pages');
console.log('   2. Check GA4 Realtime reports for events');
console.log('   3. Mark lead_form_submit as conversion in GA4');
console.log('   4. Import conversion to Google Ads');
console.log('\n⏱️  Cache invalidation may take 5-10 minutes to complete');
console.log('');
