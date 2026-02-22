#!/usr/bin/env node

/**
 * Quick deployment script that skips the build step
 * Use when you already have a fresh build in the out/ directory
 */

const { S3Client, PutObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const { CloudFrontClient, CreateInvalidationCommand } = require('@aws-sdk/client-cloudfront');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const S3_BUCKET = process.env.S3_BUCKET_NAME || 'mobile-marketing-site-prod-1759705011281-tyzuo9';
const CLOUDFRONT_ID = process.env.CLOUDFRONT_DISTRIBUTION_ID || 'E2IBMHQ3GCW6ZK';
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
const BUILD_DIR = 'out';

const s3Client = new S3Client({ region: AWS_REGION });
const cloudFrontClient = new CloudFrontClient({ region: AWS_REGION });

const getContentType = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  const types = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.txt': 'text/plain',
    '.xml': 'application/xml',
    '.pdf': 'application/pdf',
  };
  return types[ext] || 'application/octet-stream';
};

const getCacheControl = (filePath) => {
  if (filePath.includes('/_next/static/')) {
    return 'public, max-age=31536000, immutable';
  }
  if (filePath.endsWith('.html')) {
    return 'public, max-age=0, must-revalidate';
  }
  if (filePath.match(/\.(css|js|json)$/)) {
    return 'public, max-age=31536000, immutable';
  }
  if (filePath.match(/\.(png|jpg|jpeg|webp|svg|ico)$/)) {
    return 'public, max-age=31536000, immutable';
  }
  return 'public, max-age=3600';
};

async function uploadFile(localPath, s3Key) {
  const fileContent = fs.readFileSync(localPath);
  const contentType = getContentType(localPath);
  const cacheControl = getCacheControl(s3Key);

  await s3Client.send(new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: s3Key,
    Body: fileContent,
    ContentType: contentType,
    CacheControl: cacheControl,
  }));
}

async function uploadDirectory(dir, baseDir = '') {
  const files = fs.readdirSync(dir);
  let uploadCount = 0;

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      uploadCount += await uploadDirectory(filePath, path.join(baseDir, file));
    } else {
      const s3Key = path.join(baseDir, file).replace(/\\/g, '/');
      try {
        await uploadFile(filePath, s3Key);
        uploadCount++;
        if (uploadCount % 50 === 0) {
          console.log(`   Uploaded ${uploadCount} files...`);
        }
      } catch (error) {
        console.error(`❌ Failed to upload ${s3Key}:`, error.message);
      }
    }
  }

  return uploadCount;
}

async function invalidateCloudFront() {
  console.log('\n🔄 Invalidating CloudFront cache...');
  
  const invalidation = await cloudFrontClient.send(new CreateInvalidationCommand({
    DistributionId: CLOUDFRONT_ID,
    InvalidationBatch: {
      CallerReference: `deploy-${Date.now()}`,
      Paths: {
        Quantity: 2,
        Items: ['/_next/*', '/*'],
      },
    },
  }));

  console.log(`✅ CloudFront invalidation created: ${invalidation.Invalidation.Id}`);
}

async function main() {
  console.log('🚀 Quick Deployment (Skip Build)');
  console.log(`📦 S3 Bucket: ${S3_BUCKET}`);
  console.log(`☁️  CloudFront: ${CLOUDFRONT_ID}`);
  console.log(`📂 Build Dir: ${BUILD_DIR}\n`);

  if (!fs.existsSync(BUILD_DIR)) {
    console.error(`❌ Build directory '${BUILD_DIR}' not found. Run 'npm run build' first.`);
    process.exit(1);
  }

  console.log('📤 Uploading files to S3...');
  const uploadCount = await uploadDirectory(BUILD_DIR);
  console.log(`✅ Uploaded ${uploadCount} files\n`);

  await invalidateCloudFront();

  console.log('\n🎉 Deployment complete!');
  console.log('🌐 Site: https://d15sc9fc739ev2.cloudfront.net/');
  console.log('⏱️  Cache invalidation takes 5-15 minutes to propagate\n');
}

main().catch(error => {
  console.error('\n❌ Deployment failed:', error.message);
  process.exit(1);
});
