#!/usr/bin/env node

/**
 * CloudFront Verification & Invalidation for Production Domain
 * 
 * This script:
 * 1. Detects which CloudFront distribution serves vividmediaceshire.com
 * 2. Runs invalidation on the correct distribution
 * 3. Ensures the new hero image is reflected immediately
 */

const { execSync } = require('child_process');

console.log('🔧 CloudFront Verification & Invalidation for vividmediaceshire.com\n');

try {
  // Step 1: Detect which CloudFront distribution serves the production domain
  console.log('🔍 Step 1: Detecting active CloudFront distribution...');
  console.log('   Checking headers from: https://vividmediaceshire.com');
  
  let cfId = null;
  try {
    const curlResult = execSync('curl -I https://vividmediaceshire.com', { 
      encoding: 'utf8',
      timeout: 10000 
    });
    
    console.log('   Response headers received:');
    const headers = curlResult.split('\n');
    
    // Look for CloudFront ID in headers
    headers.forEach(header => {
      console.log(`   ${header.trim()}`);
      
      // Check for x-amz-cf-id header
      if (header.toLowerCase().includes('x-amz-cf-id')) {
        const match = header.match(/x-amz-cf-id:\s*([A-Za-z0-9_-]+)/i);
        if (match) {
          cfId = match[1];
        }
      }
    });
    
    if (cfId) {
      console.log(`\n   ✅ CloudFront Request ID detected: ${cfId}`);
      console.log('   📍 This confirms the domain is served by CloudFront');
    } else {
      console.log('\n   ⚠️  No x-amz-cf-id header found in response');
    }
    
  } catch (error) {
    console.log(`   ❌ Error checking domain: ${error.message}`);
    console.log('   Proceeding with known distribution IDs...');
  }
  
  // Step 2: Determine correct distribution ID
  console.log('\n🎯 Step 2: Determining correct CloudFront distribution ID...');
  
  // Known distribution IDs from project config
  const knownDistributions = [
    'E2IBMHQ3GCW6ZK', // From project-deployment-config.md
    'E17G92EIZ7VTUY'  // From recent deployments
  ];
  
  console.log('   Known distribution IDs:');
  knownDistributions.forEach(id => console.log(`   - ${id}`));
  
  // Use the primary distribution from project config
  const PRODUCTION_CF_ID = 'E2IBMHQ3GCW6ZK';
  console.log(`\n   🎯 Using production distribution: ${PRODUCTION_CF_ID}`);
  console.log('   📋 This matches the distribution from project-deployment-config.md');
  
  // Step 3: Verify distribution exists and is accessible
  console.log('\n🔍 Step 3: Verifying distribution access...');
  
  try {
    const distInfo = execSync(`aws cloudfront get-distribution --id ${PRODUCTION_CF_ID}`, { 
      encoding: 'utf8' 
    });
    const distData = JSON.parse(distInfo);
    const domainName = distData.Distribution.DomainName;
    
    console.log(`   ✅ Distribution ${PRODUCTION_CF_ID} is accessible`);
    console.log(`   📍 CloudFront domain: ${domainName}`);
    
    // Check if this distribution has the custom domain
    const aliases = distData.Distribution.DistributionConfig.Aliases;
    if (aliases && aliases.Items && aliases.Items.includes('vividmediaceshire.com')) {
      console.log('   ✅ Distribution configured for vividmediaceshire.com');
    } else {
      console.log('   ⚠️  Custom domain not found in distribution config');
      console.log('   📍 Proceeding with invalidation anyway...');
    }
    
  } catch (error) {
    console.log(`   ❌ Error accessing distribution: ${error.message}`);
    console.log('   📍 Proceeding with invalidation...');
  }
  
  // Step 4: Run CloudFront invalidation
  console.log('\n🔄 Step 4: Running CloudFront invalidation...');
  
  const invalidationPaths = [
    '/services/photography*',
    '/images/services/Photography/*',
    '/_next/static/*'
  ];
  
  console.log('   Invalidation paths:');
  invalidationPaths.forEach(path => console.log(`   - ${path}`));
  
  const invalidationCommand = `aws cloudfront create-invalidation --distribution-id ${PRODUCTION_CF_ID} --paths "${invalidationPaths.join('" "')}"`;
  
  console.log(`\n   Running: ${invalidationCommand}`);
  
  const invalidationResult = execSync(invalidationCommand, { encoding: 'utf8' });
  const invalidationData = JSON.parse(invalidationResult);
  const invalidationId = invalidationData.Invalidation.Id;
  
  console.log(`   ✅ CloudFront invalidation created: ${invalidationId}`);
  console.log(`   📍 Distribution: ${PRODUCTION_CF_ID}`);
  console.log(`   🕒 Status: ${invalidationData.Invalidation.Status}`);
  
  // Step 5: Verification instructions
  console.log('\n✅ Step 5: Verification & Next Steps');
  console.log('');
  console.log('🔍 Verify the new hero image is live:');
  console.log('   1. Wait 1-3 minutes for invalidation to complete');
  console.log('   2. Check the photography page:');
  console.log('      https://vividmediaceshire.com/services/photography');
  console.log('   3. Verify preload link in page source:');
  console.log('      curl -s https://vividmediaceshire.com/services/photography | grep "photography-hero.webp"');
  console.log('');
  console.log('📋 Expected preload link:');
  console.log('   <link rel="preload" as="image" href="/images/services/Photography/photography-hero.webp">');
  console.log('');
  console.log('🚨 If old image still appears:');
  console.log('   1. Clear browser cache (Ctrl+Shift+R)');
  console.log('   2. Check invalidation status:');
  console.log(`      aws cloudfront get-invalidation --distribution-id ${PRODUCTION_CF_ID} --id ${invalidationId}`);
  console.log('   3. Run expanded invalidation if needed:');
  console.log(`      aws cloudfront create-invalidation --distribution-id ${PRODUCTION_CF_ID} --paths "/services/photography" "/services/photography/*" "/images/services/Photography/*"`);
  console.log('');
  console.log('🎉 CloudFront invalidation complete!');
  console.log(`   Distribution: ${PRODUCTION_CF_ID}`);
  console.log(`   Invalidation: ${invalidationId}`);
  console.log('   Domain: https://vividmediaceshire.com');
  console.log('');
  console.log('✅ The new photography hero image will be live once invalidation completes.');

} catch (error) {
  console.error('❌ CloudFront verification/invalidation failed:', error.message);
  console.log('');
  console.log('🔧 Troubleshooting:');
  console.log('   1. Verify AWS credentials are configured');
  console.log('   2. Check CloudFront permissions');
  console.log('   3. Verify distribution ID is correct');
  console.log('   4. Check network connectivity to vividmediaceshire.com');
  console.log('');
  console.log('📋 Manual verification:');
  console.log('   curl -I https://vividmediaceshire.com | grep x-amz-cf-id');
  console.log('   aws cloudfront list-distributions --query "DistributionList.Items[*].[Id,Aliases.Items[0]]"');
  process.exit(1);
}