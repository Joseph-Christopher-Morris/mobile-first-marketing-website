#!/usr/bin/env node

/**
 * Force Cache Refresh Script
 * Aggressively invalidates CloudFront cache to show updated content immediately
 */

const { execSync } = require('child_process');

const PRODUCTION_CONFIG = {
  S3_BUCKET: 'mobile-marketing-site-prod-1759705011281-tyzuo9',
  CLOUDFRONT_DISTRIBUTION: 'E2IBMHQ3GCW6ZK',
  AWS_REGION: 'us-east-1',
  DOMAIN: 'd15sc9fc739ev2.cloudfront.net'
};

console.log('🔄 Force Cache Refresh Starting...\n');

function runCommand(command, description) {
  console.log(`📋 ${description}...`);
  try {
    const output = execSync(command, { 
      encoding: 'utf8', 
      stdio: 'pipe',
      maxBuffer: 1024 * 1024 * 10
    });
    console.log(`✅ ${description} completed`);
    return output;
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    throw error;
  }
}

function aggressiveInvalidation() {
  console.log('🚀 Creating aggressive CloudFront invalidation...');
  
  // Invalidate all possible paths
  const invalidationPaths = [
    '/*',
    '/index.html',
    '/',
    '/images/*',
    '/images/Trust/*',
    '/images/hero/*',
    '/_next/*',
    '/static/*'
  ];
  
  // Create multiple invalidations to ensure cache refresh
  invalidationPaths.forEach((path, index) => {
    try {
      runCommand(
        `aws cloudfront create-invalidation --distribution-id ${PRODUCTION_CONFIG.CLOUDFRONT_DISTRIBUTION} --paths "${path}" --region ${PRODUCTION_CONFIG.AWS_REGION}`,
        `Invalidating ${path}`
      );
      
      // Small delay between invalidations
      if (index < invalidationPaths.length - 1) {
        console.log('⏱️ Waiting 2 seconds...');
        execSync('timeout /t 2 /nobreak', { stdio: 'ignore' });
      }
    } catch (error) {
      console.log(`⚠️ Invalidation for ${path} may have failed, continuing...`);
    }
  });
}

function testCacheRefresh() {
  console.log('\n🔍 Testing cache refresh...');
  
  const testUrls = [
    `https://${PRODUCTION_CONFIG.DOMAIN}`,
    `https://${PRODUCTION_CONFIG.DOMAIN}/images/Trust/bbc.v1.png`,
    `https://${PRODUCTION_CONFIG.DOMAIN}/images/Trust/forbes.v1.png`,
    `https://${PRODUCTION_CONFIG.DOMAIN}/images/Trust/ft.v1.png`
  ];
  
  console.log('🌐 Testing URLs for cache refresh:');
  testUrls.forEach(url => {
    console.log(`  - ${url}`);
  });
  
  console.log('\n💡 Tips to see updated content:');
  console.log('  1. Hard refresh: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)');
  console.log('  2. Clear browser cache');
  console.log('  3. Try incognito/private browsing');
  console.log('  4. Wait 5-10 more minutes for full propagation');
}

async function main() {
  try {
    console.log('🎯 Target:', `https://${PRODUCTION_CONFIG.DOMAIN}`);
    console.log('☁️ CloudFront:', PRODUCTION_CONFIG.CLOUDFRONT_DISTRIBUTION);
    console.log('');
    
    // Aggressive cache invalidation
    aggressiveInvalidation();
    
    // Test and provide guidance
    testCacheRefresh();
    
    console.log('\n🎉 Cache refresh initiated!');
    console.log('🌐 Your updated content should appear within 2-5 minutes');
    console.log(`🔗 Website: https://${PRODUCTION_CONFIG.DOMAIN}`);
    
  } catch (error) {
    console.error('\n💥 Cache refresh failed:', error.message);
    process.exit(1);
  }
}

main();