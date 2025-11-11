#!/usr/bin/env node

/**
 * Troubleshoot Photography Page Deployment
 * 
 * This script checks deployment status and forces a new deployment if needed.
 */

const { execSync } = require('child_process');

console.log('🔍 Troubleshooting Photography Page Deployment...\n');

try {
  // Check current git status
  console.log('📊 Current Git Status:');
  execSync('git status', { stdio: 'inherit' });
  
  console.log('\n📋 Recent Commits:');
  execSync('git log --oneline -5', { stdio: 'inherit' });
  
  // Check if GitHub Actions is running
  console.log('\n🔄 Checking GitHub Actions Status...');
  console.log('Visit: https://github.com/Joseph-Christopher-Morris/mobile-first-marketing-website/actions');
  
  // Check if the photography page file exists and has content
  console.log('\n📁 Checking Photography Page File:');
  const fs = require('fs');
  
  if (fs.existsSync('src/app/services/photography/page.tsx')) {
    const fileSize = fs.statSync('src/app/services/photography/page.tsx').size;
    console.log(`✅ Photography page exists (${fileSize} bytes)`);
    
    // Check if it has recent changes
    try {
      const lastModified = fs.statSync('src/app/services/photography/page.tsx').mtime;
      console.log(`📅 Last modified: ${lastModified}`);
    } catch (error) {
      console.log('ℹ️  Could not check modification time');
    }
  } else {
    console.log('❌ Photography page file not found!');
  }
  
  // Check photography images
  console.log('\n🖼️  Checking Photography Images:');
  if (fs.existsSync('public/images/services/Photography/')) {
    const images = fs.readdirSync('public/images/services/Photography/');
    console.log(`✅ Found ${images.length} photography images`);
    images.slice(0, 5).forEach(img => console.log(`   - ${img}`));
    if (images.length > 5) console.log(`   ... and ${images.length - 5} more`);
  } else {
    console.log('❌ Photography images directory not found!');
  }
  
  // Check if we need to build and deploy
  console.log('\n🔧 Deployment Troubleshooting:');
  
  // Check if there are uncommitted changes
  try {
    const uncommittedChanges = execSync('git diff --name-only', { encoding: 'utf8' }).trim();
    if (uncommittedChanges) {
      console.log('⚠️  Found uncommitted changes:');
      uncommittedChanges.split('\n').forEach(file => console.log(`   - ${file}`));
      console.log('\n💡 These changes need to be committed first!');
    } else {
      console.log('✅ No uncommitted changes found');
    }
  } catch (error) {
    console.log('ℹ️  Could not check for uncommitted changes');
  }
  
  // Check build configuration
  console.log('\n⚙️  Checking Build Configuration:');
  if (fs.existsSync('next.config.js')) {
    console.log('✅ Next.js config found');
  }
  
  if (fs.existsSync('package.json')) {
    console.log('✅ Package.json found');
  }
  
  // Suggest next steps
  console.log('\n🚀 Recommended Actions:');
  console.log('1. Check GitHub Actions deployment status');
  console.log('2. Force a new deployment if needed');
  console.log('3. Clear CloudFront cache');
  console.log('4. Verify live website after deployment');
  
  console.log('\n💡 Quick Fixes:');
  console.log('• Run: node scripts/force-deploy-photography.js');
  console.log('• Or manually: npm run build && npm run deploy');
  console.log('• Check live site: https://d15sc9fc739ev2.cloudfront.net/services/photography');

} catch (error) {
  console.error('❌ Error during troubleshooting:', error.message);
}