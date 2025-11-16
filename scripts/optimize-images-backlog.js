#!/usr/bin/env node

/**
 * Image Optimization Script - Backlog Implementation
 * 
 * Optimizes specific images identified in IMAGE-OPTIMISATION-BACKLOG.md
 * to improve LCP and reduce page weight without changing visual design.
 */

const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

// Image optimization tasks from backlog
const optimizationTasks = [
  {
    name: 'Hero Background (Homepage)',
    input: 'public/images/hero/230422_Chester_Stock_Photography-84.webp',
    output: 'public/images/hero/230422_Chester_Stock_Photography-84.webp',
    maxWidth: 1600,
    quality: 68,
    targetSize: 60,
  },
  {
    name: 'Logo (Nav) - Create WebP version',
    input: 'public/images/brand/VMC.png',
    output: 'public/images/brand/VMC-nav.webp',
    maxWidth: 160,
    maxHeight: 60,
    quality: 80,
    targetSize: 20,
  },
  {
    name: 'Services - Photography Hero',
    input: 'public/images/services/photography-hero.webp',
    output: 'public/images/services/photography-hero.webp',
    maxWidth: 600,
    quality: 68,
    targetSize: 35,
  },
  {
    name: 'Services - Website Design Hero',
    input: 'public/images/services/Website Design/PXL_20240222_004124044~2.webp',
    output: 'public/images/services/Website Design/PXL_20240222_004124044~2.webp',
    maxWidth: 600,
    quality: 68,
    targetSize: 28,
  },
  {
    name: 'Services - Ad Campaigns Hero',
    input: 'public/images/services/WhatsApp Image 2025-11-11 at 9.27.14 AM.webp',
    output: 'public/images/services/WhatsApp Image 2025-11-11 at 9.27.14 AM.webp',
    maxWidth: 600,
    quality: 68,
    targetSize: 20,
  },
  {
    name: 'Services - Hosting Migration Card',
    input: 'public/images/services/web-hosting-and-migration/hosting-migration-card.webp',
    output: 'public/images/services/web-hosting-and-migration/hosting-migration-card.webp',
    maxWidth: 600,
    quality: 68,
    targetSize: 15,
  },
  {
    name: 'Services - Analytics Dashboard',
    input: 'public/images/services/screenshot-2025-09-23-analytics-dashboard.webp',
    output: 'public/images/services/screenshot-2025-09-23-analytics-dashboard.webp',
    maxWidth: 600,
    quality: 68,
    targetSize: 23,
  },
];

async function getFileSize(filePath) {
  try {
    const stats = await fs.stat(filePath);
    return Math.round(stats.size / 1024);
  } catch (error) {
    return 0;
  }
}

async function backupOriginal(filePath) {
  const backupPath = filePath.replace(/(\.\w+)$/, '.backup$1');
  try {
    await fs.copyFile(filePath, backupPath);
    return backupPath;
  } catch (error) {
    console.warn(`⚠️  Could not create backup for ${filePath}`);
    return null;
  }
}

async function optimizeImage(task) {
  console.log(`\n📸 ${task.name}`);
  console.log(`   Input: ${task.input}`);
  
  const inputPath = path.resolve(task.input);
  const outputPath = path.resolve(task.output);
  const tempPath = outputPath + '.tmp';
  
  // Check if input exists
  try {
    await fs.access(inputPath);
  } catch (error) {
    console.log(`   ❌ Input file not found`);
    return { success: false, error: 'File not found' };
  }
  
  // Get original size
  const originalSize = await getFileSize(inputPath);
  console.log(`   Original: ${originalSize} KB`);
  
  // Backup original if overwriting
  if (inputPath === outputPath) {
    await backupOriginal(inputPath);
  }
  
  try {
    // Load image
    let pipeline = sharp(inputPath);
    
    // Get metadata
    const metadata = await pipeline.metadata();
    console.log(`   Dimensions: ${metadata.width}×${metadata.height}`);
    
    // Resize if needed
    const resizeOptions = {};
    if (task.maxWidth && metadata.width > task.maxWidth) {
      resizeOptions.width = task.maxWidth;
    }
    if (task.maxHeight && metadata.height > task.maxHeight) {
      resizeOptions.height = task.maxHeight;
    }
    
    if (Object.keys(resizeOptions).length > 0) {
      resizeOptions.fit = 'inside';
      resizeOptions.withoutEnlargement = true;
      pipeline = pipeline.resize(resizeOptions);
    }
    
    // Convert to WebP with quality setting
    pipeline = pipeline.webp({
      quality: task.quality,
      effort: 6, // Higher effort for better compression
    });
    
    // Save to temp file first
    await pipeline.toFile(tempPath);
    
    // If overwriting, delete original first
    if (inputPath === outputPath) {
      await fs.unlink(outputPath);
    }
    
    // Move temp file to final destination
    await fs.rename(tempPath, outputPath);
    
    // Get new size
    const newSize = await getFileSize(outputPath);
    const savings = originalSize - newSize;
    const savingsPercent = Math.round((savings / originalSize) * 100);
    
    console.log(`   Optimized: ${newSize} KB`);
    console.log(`   Savings: ${savings} KB (${savingsPercent}%)`);
    console.log(`   Target: ${task.targetSize} KB`);
    
    if (newSize <= task.targetSize) {
      console.log(`   ✅ Target achieved!`);
    } else if (newSize <= task.targetSize * 1.15) {
      console.log(`   ✅ Close to target (within 15%)`);
    } else {
      console.log(`   ⚠️  Above target by ${newSize - task.targetSize} KB`);
    }
    
    return {
      success: true,
      originalSize,
      newSize,
      savings,
      savingsPercent,
      targetMet: newSize <= task.targetSize * 1.15,
    };
  } catch (error) {
    // Clean up temp file if it exists
    try {
      await fs.unlink(tempPath);
    } catch {}
    
    console.log(`   ❌ Optimization failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('🎨 Image Optimization - Backlog Implementation\n');
  console.log('=' .repeat(60));
  
  const results = [];
  let totalOriginalSize = 0;
  let totalNewSize = 0;
  
  for (const task of optimizationTasks) {
    const result = await optimizeImage(task);
    results.push({ task, result });
    
    if (result.success) {
      totalOriginalSize += result.originalSize;
      totalNewSize += result.newSize;
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 OPTIMIZATION SUMMARY\n');
  
  const successful = results.filter(r => r.result.success);
  const failed = results.filter(r => !r.result.success);
  const targetsMet = results.filter(r => r.result.success && r.result.targetMet);
  
  console.log(`✅ Successful: ${successful.length}/${optimizationTasks.length}`);
  console.log(`🎯 Targets met: ${targetsMet.length}/${successful.length}`);
  
  if (failed.length > 0) {
    console.log(`❌ Failed: ${failed.length}`);
    failed.forEach(f => {
      console.log(`   - ${f.task.name}: ${f.result.error}`);
    });
  }
  
  const totalSavings = totalOriginalSize - totalNewSize;
  const totalSavingsPercent = Math.round((totalSavings / totalOriginalSize) * 100);
  
  console.log(`\n💾 Total original size: ${totalOriginalSize} KB`);
  console.log(`💾 Total optimized size: ${totalNewSize} KB`);
  console.log(`💰 Total savings: ${totalSavings} KB (${totalSavingsPercent}%)`);
  
  console.log('\n✨ Optimization complete!');
  console.log('\n📝 Next steps:');
  console.log('   1. Review optimized images visually');
  console.log('   2. Update Header component to use VMC-nav.webp for logo');
  console.log('   3. Run: npm run build');
  console.log('   4. Deploy to production');
  console.log('   5. Test Lighthouse scores');
}

main().catch(console.error);
