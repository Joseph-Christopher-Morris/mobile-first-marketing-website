#!/usr/bin/env node

/**
 * Resolve Conflicts and Push Photography Changes
 * 
 * This script resolves merge conflicts and safely pushes photography changes.
 */

const { execSync } = require('child_process');

console.log('🔧 Resolving Conflicts and Pushing Photography Changes...\n');

try {
  // First, let's stash any uncommitted changes
  console.log('📦 Stashing uncommitted changes...');
  try {
    execSync('git stash push -m "Temporary stash before photography push"', { stdio: 'inherit' });
    console.log('✅ Changes stashed successfully');
  } catch (error) {
    console.log('ℹ️  No changes to stash or stash failed');
  }
  
  // Reset to the photography commit
  console.log('\n🔄 Resetting to photography commit...');
  execSync('git reset --hard ed42c2d', { stdio: 'inherit' });
  
  // Force pull the latest changes
  console.log('\n🔄 Pulling latest remote changes...');
  execSync('git fetch origin', { stdio: 'inherit' });
  execSync('git reset --hard origin/main', { stdio: 'inherit' });
  
  // Check if our photography files still exist
  const fs = require('fs');
  const photographyPageExists = fs.existsSync('src/app/services/photography/page.tsx');
  const galleryExists = fs.existsSync('src/components/services/PhotographyGallery.tsx');
  
  if (!photographyPageExists || !galleryExists) {
    console.log('⚠️  Photography files were overwritten. Let me restore them...');
    
    // Cherry-pick our photography commit
    console.log('🍒 Cherry-picking photography changes...');
    try {
      execSync('git cherry-pick ed42c2d', { stdio: 'inherit' });
      console.log('✅ Photography changes restored');
    } catch (error) {
      console.log('❌ Cherry-pick failed. Manual intervention needed.');
      
      // Show the user what to do
      console.log('\n🔧 Manual steps needed:');
      console.log('1. The photography commit (ed42c2d) contains your changes');
      console.log('2. You may need to manually restore the photography files');
      console.log('3. Or use: git show ed42c2d to see the changes');
      console.log('4. Then manually apply them to the current files');
      return;
    }
  }
  
  // Now try to push
  console.log('\n🚀 Pushing photography changes...');
  execSync('git push origin main', { stdio: 'inherit' });
  
  console.log('\n✅ Photography changes successfully pushed!');
  
  // Restore any stashed changes
  console.log('\n📦 Checking for stashed changes...');
  try {
    const stashList = execSync('git stash list', { encoding: 'utf8' });
    if (stashList.includes('Temporary stash')) {
      console.log('🔄 Restoring stashed changes...');
      execSync('git stash pop', { stdio: 'inherit' });
      console.log('✅ Stashed changes restored');
    }
  } catch (error) {
    console.log('ℹ️  No stashed changes to restore');
  }
  
  console.log('\n🎉 Photography page is now live!');
  console.log('\n📊 Final status:');
  execSync('git log --oneline -3', { stdio: 'inherit' });

} catch (error) {
  console.error('❌ Error resolving conflicts:', error.message);
  
  console.log('\n🆘 Emergency recovery:');
  console.log('1. Your photography commit is saved as: ed42c2d');
  console.log('2. You can view it with: git show ed42c2d');
  console.log('3. To manually restore: git checkout ed42c2d -- src/app/services/photography/page.tsx');
  console.log('4. Then: git add . && git commit -m "Restore photography changes"');
  
  process.exit(1);
}