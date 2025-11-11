#!/usr/bin/env node

/**
 * Quick Deployment Verification - Simplified version for rapid checks
 * 
 * Performs essential verification of:
 * - Key files exist in S3
 * - Basic cache headers are correct
 * - Recent invalidation status
 */

const { S3Client, HeadObjectCommand } = require('@aws-sdk/client-s3');
const { CloudFrontClient, ListInvalidationsCommand } = require('@aws-sdk/client-cloudfront');

const CONFIG = {
  s3Bucket: 'mobile-marketing-site-prod-1759705011281-tyzuo9',
  cloudfrontDistribution: 'E2IBMHQ3GCW6ZK',
  region: 'us-east-1'
};

class QuickVerifier {
  constructor() {
    this.s3Client = new S3Client({ region: CONFIG.region });
    this.cloudfrontClient = new CloudFrontClient({ region: CONFIG.region });
  }

  async quickVerify() {
    console.log('⚡ Quick deployment verification...\n');
    
    let allGood = true;
    
    // Check key files
    const keyFiles = ['index.html', 'services/index.html', 'blog/index.html', 'sitemap.xml'];
    
    for (const file of keyFiles) {
      try {
        const result = await this.s3Client.send(new HeadObjectCommand({
          Bucket: CONFIG.s3Bucket,
          Key: file
        }));
        
        const cacheControl = result.CacheControl;
        const expectedCache = file.endsWith('.html') || file.endsWith('.xml') ? 
          'public, max-age=600' : 'public, max-age=31536000, immutable';
        
        if (cacheControl === expectedCache) {
          console.log(`✅ ${file} - OK (${cacheControl})`);
        } else {
          console.log(`⚠️  ${file} - Cache header mismatch: ${cacheControl}`);
          allGood = false;
        }
      } catch (error) {
        console.log(`❌ ${file} - Missing or error: ${error.message}`);
        allGood = false;
      }
    }
    
    // Check recent invalidation
    try {
      const invalidations = await this.cloudfrontClient.send(new ListInvalidationsCommand({
        DistributionId: CONFIG.cloudfrontDistribution,
        MaxItems: 1
      }));
      
      if (invalidations.InvalidationList?.Items?.length > 0) {
        const recent = invalidations.InvalidationList.Items[0];
        const ageMinutes = Math.floor((Date.now() - new Date(recent.CreateTime).getTime()) / (1000 * 60));
        console.log(`🔄 Recent invalidation: ${recent.Status} (${ageMinutes}m ago)`);
      } else {
        console.log('⚠️  No recent invalidations found');
      }
    } catch (error) {
      console.log(`❌ Invalidation check failed: ${error.message}`);
      allGood = false;
    }
    
    console.log(`\n${allGood ? '✅ Quick verification PASSED' : '❌ Quick verification FAILED'}`);
    
    if (!allGood) {
      process.exit(1);
    }
  }
}

if (require.main === module) {
  const verifier = new QuickVerifier();
  verifier.quickVerify().catch(error => {
    console.error('Quick verification failed:', error);
    process.exit(1);
  });
}

module.exports = QuickVerifier;