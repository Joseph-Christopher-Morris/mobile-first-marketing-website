#!/usr/bin/env node

/**
 * Image Optimization Script - Safe Version
 * Creates optimized versions with -optimized suffix, then provides instructions to replace
 */

const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

const optimizationTasks = [
  {
    name: 'Hero Background (Homepage)',
    input: 'public/images/hero/230422_Chester_Stock_Photography-84.webp',
    maxWidth: 1600,
    quality: 68,
    targetSize: 60,
  },
  {
    name: 'Services - Photography Hero',
    input: 'public/images/services/photography-hero.webp',
    maxWidth: 600,
    quality: 68,
    targetSize: 35,
  },
  {
    name: 'Services - Website Design Hero',
    input: 'public/images/services/Website Design/PXL_20240222_004124044~2.webp',
    maxWidth: 600,
    quality: 68,
    targetSize: 28,
  },
  {
    name: 'Services - Ad Campaigns Hero',
    input: 'public/images/services/WhatsApp Image 2025-11-11 at 9.27.14 AM.webp',
    maxWidth: 600,
    quality: 68,
    targetSize: 20,
  },
  {
    name: 'Services - Hosting Migration Card',
    input: 'public/images/services/web-hosting-and-migration/hosting-migration-card.webp',
    maxWidth: 600,
    quality: 68,
    targetSize: 15,
  },
  {
    name: 'Services - Analytics Dashboard',
    input: 'public/images/services/screenshot-2025-09-23-analytics-dashboard.webp',
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

async function optimizeImage(task) {
  console.log(`\n📸 ${task.name}`);
  console.log(`   Input: ${task.input}`);
  
  const inputPath = path.resolve(task.input);
  const outputPath = inputPath.replace(/\.webp$/, '-optimized.webp');
  
  try {
    await fs.access(inputPath);
  } catch (error) {
    console.log(`   ❌ Input file not found`);
    return { success: false, error: 'File not found' };
  }
  
  const originalSize = await getFileSize(inputPath);
  console.log(`   Original: ${originalSize} KB`);
  
  try {
    let pipeline = sharp(inputPath);
    const metadata = await pipeline.metadata();
    console.log(`   Dimensions: ${metadata.width}×${metadata.height}`);
    
    const resizeOptions = {};
    if (task.maxWidth && metadata.width > task.maxWidth) {
      resizeOptions.width = task.maxWidth;
      resizeOptions.fit = 'inside';
      resizeOptions.withoutEnlargement = true;
      pipeline = pipeline.resize(resizeOptions);
    }
    
    pipeline = pipeline.webp({
      quality: task.quality,
      effort: 6,
    });
    
    await pipeline.toFile(outputPath);
    
    const newSize = await getFileSize(outputPath);
    const savings = originalSize - newSize;
    const savingsPercent = Math.round((savings / originalSize) * 100);
    
    console.log(`   Optimized: ${newSize} KB`);
    console.log(`   Savings: ${savings} KB (${savingsPercent}%)`);
    console.log(`   Target: ${task.targetSize} KB`);
    console.log(`   Output: ${outputPath.replace(process.cwd() + '\\', '')}`);
    
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
      inputPath: task.input,
      outputPath: outputPath.replace(process.cwd() + '\\', ''),
    };
  } catch (error) {
    console.log(`   ❌ Optimization failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('🎨 Image Optimization - Safe Mode\n');
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
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 OPTIMIZATION SUMMARY\n');
  
  const successful = results.filter(r => r.result.success);
  const targetsMet = results.filter(r => r.result.success && r.result.targetMet);
  
  console.log(`✅ Successful: ${successful.length}/${optimizationTasks.length}`);
  console.log(`🎯 Targets met: ${targetsMet.length}/${successful.length}`);
  
  const totalSavings = totalOriginalSize - totalNewSize;
  const totalSavingsPercent = Math.round((totalSavings / totalOriginalSize) * 100);
  
  console.log(`\n💾 Total original size: ${totalOriginalSize} KB`);
  console.log(`💾 Total optimized size: ${totalNewSize} KB`);
  console.log(`💰 Total savings: ${totalSavings} KB (${totalSavingsPercent}%)`);
  
  console.log('\n📝 PowerShell commands to replace originals:\n');
  successful.forEach(r => {
    const original = r.result.inputPath;
    const optimized = r.result.outputPath;
    console.log(`Move-Item -Force "${optimized}" "${original}"`);
  });
  
  console.log('\n✨ Optimization complete!');
}

main().catch(console.error);
