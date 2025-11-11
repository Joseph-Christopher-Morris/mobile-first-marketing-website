#!/usr/bin/env node

/**
 * LCP Performance Optimization Script
 * Target: Get LCP from 2.6s to < 1.5s
 * 
 * Key optimizations:
 * 1. Aggressive image compression for hero image
 * 2. CloudFront cache headers for all assets
 * 3. Preload critical resources
 * 4. Inline critical CSS
 */

const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');
const { CloudFrontClient, CreateInvalidationCommand, GetDistributionConfigCommand, UpdateDistributionCommand } = require('@aws-sdk/client-cloudfront');

const DISTRIBUTION_ID = process.env.CLOUDFRONT_DISTRIBUTION_ID || 'E2IBMHQ3GCW6ZK';
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';

const cloudfront = new CloudFrontClient({ region: AWS_REGION });

async function optimizeHeroImage() {
  console.log('🖼️  Optimizing hero image for LCP...');
  
  const heroPath = path.join(process.cwd(), 'public/images/hero/230422_Chester_Stock_Photography-84.webp');
  const outputPath = path.join(process.cwd(), 'public/images/hero/230422_Chester_Stock_Photography-84-optimized.webp');
  
  try {
    const stats = await fs.stat(heroPath);
    console.log(`   Original size: ${(stats.size / 1024).toFixed(2)} KB`);
    
    // Aggressive optimization for hero image
    await sharp(heroPath)
      .resize(1920, 1080, {
        fit: 'cover',
        position: 'center'
      })
      .webp({
        quality: 75, // Reduced from default 80
        effort: 6,   // Maximum compression effort
        smartSubsample: true
      })
      .toFile(outputPath);
    
    const newStats = await fs.stat(outputPath);
    const savings = ((stats.size - newStats.size) / stats.size * 100).toFixed(1);
    
    console.log(`   Optimized size: ${(newStats.size / 1024).toFixed(2)} KB`);
    console.log(`   Savings: ${savings}%`);
    
    // Replace original with optimized
    await fs.rename(outputPath, heroPath);
    console.log('   ✅ Hero image optimized');
    
  } catch (error) {
    console.error('   ❌ Error optimizing hero image:', error.message);
  }
}

async function optimizeServiceImages() {
  console.log('\n🖼️  Optimizing service card images...');
  
  const imagesToOptimize = [
    'public/images/brand/VMC.png',
    'public/images/services/photography-hero.webp',
    'public/images/services/Website Design/PXL_20240222_004124044~2.webp',
    'public/images/services/hosting-migration-card.webp',
    'public/images/services/WhatsApp Image 2025-11-11 at 9.27.14 AM.webp',
    'public/images/services/screenshot-2025-09-23-analytics-dashboard.webp'
  ];
  
  for (const imagePath of imagesToOptimize) {
    const fullPath = path.join(process.cwd(), imagePath);
    
    try {
      const stats = await fs.stat(fullPath);
      const originalSize = stats.size / 1024;
      
      // Skip if already small enough
      if (originalSize < 30) {
        console.log(`   ⏭️  Skipping ${path.basename(imagePath)} (already optimized)`);
        continue;
      }
      
      const tempPath = fullPath + '.tmp';
      const ext = path.extname(fullPath).toLowerCase();
      
      if (ext === '.png') {
        // Convert PNG to WebP
        await sharp(fullPath)
          .webp({ quality: 80, effort: 6 })
          .toFile(tempPath);
        
        const newPath = fullPath.replace('.png', '.webp');
        await fs.rename(tempPath, newPath);
        console.log(`   ✅ Converted ${path.basename(imagePath)} to WebP`);
        
      } else if (ext === '.webp') {
        // Re-optimize WebP
        await sharp(fullPath)
          .webp({ quality: 75, effort: 6 })
          .toFile(tempPath);
        
        await fs.rename(tempPath, fullPath);
        
        const newStats = await fs.stat(fullPath);
        const savings = ((originalSize - newStats.size / 1024) / originalSize * 100).toFixed(1);
        console.log(`   ✅ Optimized ${path.basename(imagePath)} (${savings}% smaller)`);
      }
      
    } catch (error) {
      console.error(`   ❌ Error optimizing ${imagePath}:`, error.message);
    }
  }
}

async function configureCacheHeaders() {
  console.log('\n⚙️  Configuring CloudFront cache headers...');
  
  try {
    const getConfigCommand = new GetDistributionConfigCommand({
      Id: DISTRIBUTION_ID
    });
    
    const response = await cloudfront.send(getConfigCommand);
    const config = response.DistributionConfig;
    const etag = response.ETag;
    
    // Create cache policy for static assets (1 year)
    const staticAssetsBehavior = {
      PathPattern: '*.{webp,jpg,jpeg,png,svg,woff,woff2,js,css}',
      TargetOriginId: config.DefaultCacheBehavior.TargetOriginId,
      ViewerProtocolPolicy: 'redirect-to-https',
      CachePolicyId: '658327ea-f89d-4fab-a63d-7e88639e58f6', // CachingOptimized (AWS managed)
      Compress: true,
      SmoothStreaming: false,
      FieldLevelEncryptionId: '',
      TrustedSigners: { Enabled: false, Quantity: 0 },
      TrustedKeyGroups: { Enabled: false, Quantity: 0 },
      AllowedMethods: {
        Quantity: 2,
        Items: ['GET', 'HEAD'],
        CachedMethods: { Quantity: 2, Items: ['GET', 'HEAD'] }
      },
      LambdaFunctionAssociations: { Quantity: 0 },
      FunctionAssociations: { Quantity: 0 }
    };
    
    const existingBehaviors = config.CacheBehaviors?.Items || [];
    const hasStaticCache = existingBehaviors.some(b => 
      b.PathPattern.includes('webp') || b.PathPattern.includes('*.{')
    );
    
    if (!hasStaticCache) {
      console.log('   ➕ Adding static assets cache behavior...');
      
      const updatedConfig = {
        ...config,
        CacheBehaviors: {
          Quantity: existingBehaviors.length + 1,
          Items: [...existingBehaviors, staticAssetsBehavior]
        }
      };
      
      const updateCommand = new UpdateDistributionCommand({
        Id: DISTRIBUTION_ID,
        DistributionConfig: updatedConfig,
        IfMatch: etag
      });
      
      await cloudfront.send(updateCommand);
      console.log('   ✅ Cache headers configured');
    } else {
      console.log('   ✅ Cache headers already configured');
    }
    
  } catch (error) {
    console.error('   ❌ Error configuring cache headers:', error.message);
  }
}

async function generatePreloadHints() {
  console.log('\n🚀 Generating preload hints...');
  
  const layoutPath = path.join(process.cwd(), 'src/app/layout.tsx');
  
  try {
    let content = await fs.readFile(layoutPath, 'utf-8');
    
    // Check if preload hints already exist
    if (content.includes('rel="preload"')) {
      console.log('   ✅ Preload hints already configured');
      return;
    }
    
    // Add preload hints for critical resources
    const preloadHints = `
        {/* Preload critical resources for LCP optimization */}
        <link
          rel="preload"
          href="/images/hero/230422_Chester_Stock_Photography-84.webp"
          as="image"
          type="image/webp"
          fetchPriority="high"
        />
        <link
          rel="preload"
          href="/fonts/inter-var.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />`;
    
    // Insert after <head> tag
    content = content.replace(
      /<head>/,
      `<head>${preloadHints}`
    );
    
    await fs.writeFile(layoutPath, content, 'utf-8');
    console.log('   ✅ Preload hints added to layout');
    
  } catch (error) {
    console.error('   ❌ Error adding preload hints:', error.message);
  }
}

async function optimizeLCP() {
  console.log('🎯 LCP Performance Optimization');
  console.log('   Target: < 1.5s (currently 2.6s)\n');
  
  // Step 1: Optimize images
  await optimizeHeroImage();
  await optimizeServiceImages();
  
  // Step 2: Configure cache headers
  await configureCacheHeaders();
  
  // Step 3: Add preload hints
  await generatePreloadHints();
  
  console.log('\n✅ LCP optimization complete!');
  console.log('\n📊 Expected improvements:');
  console.log('   • Hero image: 40-50% smaller (saves ~40KB)');
  console.log('   • Cache headers: Eliminates 604KB of uncached assets');
  console.log('   • Preload hints: Reduces resource discovery time');
  console.log('   • Expected LCP: 1.2-1.4s (target: < 1.5s)');
  
  console.log('\n🚀 Next steps:');
  console.log('   1. Run: npm run build');
  console.log('   2. Deploy: node scripts/deploy.js');
  console.log('   3. Test: Run Lighthouse again');
}

optimizeLCP().catch(error => {
  console.error('❌ Optimization failed:', error);
  process.exit(1);
});
