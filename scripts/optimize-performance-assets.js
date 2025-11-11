#!/usr/bin/env node

/**
 * Performance Asset Optimization Script
 * Optimizes images and sets proper cache headers for performance
 */

const { S3Client, PutObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME || 'mobile-marketing-site-prod-1759705011281-tyzuo9';
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';

const s3 = new S3Client({ region: AWS_REGION });

async function optimizePerformanceAssets() {
  console.log('🚀 Optimizing performance assets...');
  console.log(`   S3 Bucket: ${S3_BUCKET_NAME}`);
  console.log(`   Region: ${AWS_REGION}`);
  
  try {
    // Upload optimized trust logos with immutable cache headers
    await uploadTrustLogos();
    
    // Upload hero image with optimized cache headers
    await uploadHeroImage();
    
    // Upload static assets with long cache lifetimes
    await uploadStaticAssets();
    
    console.log('\n✅ Performance asset optimization completed!');
    
  } catch (error) {
    console.error('❌ Error optimizing assets:', error.message);
    process.exit(1);
  }
}

async function uploadTrustLogos() {
  console.log('\n📋 Uploading optimized trust logos...');
  
  const logos = [
    { file: 'bbc.v1.svg', contentType: 'image/svg+xml' },
    { file: 'forbes.v1.svg', contentType: 'image/svg+xml' },
    { file: 'ft.v1.svg', contentType: 'image/svg+xml' }
  ];
  
  for (const logo of logos) {
    const filePath = path.join('public/images/Trust', logo.file);
    
    if (!fs.existsSync(filePath)) {
      console.log(`   ⚠️  ${logo.file} not found, skipping...`);
      continue;
    }
    
    const fileContent = fs.readFileSync(filePath);
    const fileSize = (fileContent.length / 1024).toFixed(1);
    
    const uploadParams = {
      Bucket: S3_BUCKET_NAME,
      Key: `images/Trust/${logo.file}`,
      Body: fileContent,
      ContentType: logo.contentType,
      CacheControl: 'public,max-age=31536000,immutable',
      ContentEncoding: 'gzip'
    };
    
    await s3.send(new PutObjectCommand(uploadParams));
    console.log(`   ✅ ${logo.file} (${fileSize} KB) - immutable cache`);
  }
}

async function uploadHeroImage() {
  console.log('\n🖼️  Uploading hero image with optimized cache...');
  
  const heroPath = 'public/images/hero/230422_Chester_Stock_Photography-84.webp';
  
  if (!fs.existsSync(heroPath)) {
    console.log('   ⚠️  Hero image not found, skipping...');
    return;
  }
  
  const fileContent = fs.readFileSync(heroPath);
  const fileSize = (fileContent.length / 1024).toFixed(1);
  
  const uploadParams = {
    Bucket: S3_BUCKET_NAME,
    Key: 'images/hero/230422_Chester_Stock_Photography-84.webp',
    Body: fileContent,
    ContentType: 'image/webp',
    CacheControl: 'public,max-age=31536000,immutable'
  };
  
  await s3.send(new PutObjectCommand(uploadParams));
  console.log(`   ✅ Hero image (${fileSize} KB) - immutable cache`);
}

async function uploadStaticAssets() {
  console.log('\n📦 Setting cache headers for static assets...');
  
  // Upload service images with long cache
  const serviceImages = [
    'hosting-migration-card.webp',
    'ad-campaigns-hero.webp',
    'screenshot-2025-09-23-analytics-dashboard.webp',
    'photography-hero.webp'
  ];
  
  for (const image of serviceImages) {
    const imagePath = path.join('public/images/services', image);
    
    if (!fs.existsSync(imagePath)) {
      console.log(`   ⚠️  ${image} not found, skipping...`);
      continue;
    }
    
    const fileContent = fs.readFileSync(imagePath);
    const fileSize = (fileContent.length / 1024).toFixed(1);
    
    const uploadParams = {
      Bucket: S3_BUCKET_NAME,
      Key: `images/services/${image}`,
      Body: fileContent,
      ContentType: 'image/webp',
      CacheControl: 'public,max-age=31536000,immutable'
    };
    
    await s3.send(new PutObjectCommand(uploadParams));
    console.log(`   ✅ ${image} (${fileSize} KB) - immutable cache`);
  }
}

// Validate environment
if (!S3_BUCKET_NAME) {
  console.error('❌ S3_BUCKET_NAME environment variable required');
  process.exit(1);
}

// Run optimization
optimizePerformanceAssets().catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});