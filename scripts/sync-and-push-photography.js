#!/usr/bin/env node

/**
 * Sync and Push Photography Page Changes
 * 
 * This script safely pulls remote changes and pushes your photography updates.
 */

const { execSync } = require('child_process');

console.log('🔄 Syncing and Pushing Photography Page Changes...\n');

try {
  // Check current status
  console.log('📍 Current repository status:');
  execSync('git status --porcelain', { stdio: 'inherit' });
  
  // Fetch latest changes from remote
  console.log('\n🔄 Fetching latest changes from remote...');
  execSync('git fetch origin', { stdio: 'inherit' });
  
  // Check if there are conflicts
  console.log('\n🔄 Pulling latest changes...');
  try {
    execSync('git pull origin main', { stdio: 'inherit' });
    console.log('✅ Successfully pulled remote changes');
  } catch (error) {
    console.log('⚠️  Pull resulted in conflicts or issues');
    
    // Check if there are merge conflicts
    try {
      const conflictFiles = execSync('git diff --name-only --diff-filter=U', { encoding: 'utf8' }).trim();
      if (conflictFiles) {
        console.log('\n❌ Merge conflicts detected in:');
        console.log(conflictFiles);
        console.log('\n💡 Please resolve conflicts manually and then run:');
        console.log('   git add .');
        console.log('   git commit -m "Resolve merge conflicts"');
        console.log('   git push origin main');
        return;
      }
    } catch (e) {
      // No conflicts, continue
    }
  }
  
  // Check if our commit is still there
  try {
    const recentCommits = execSync('git log --oneline -5', { encoding: 'utf8' });
    console.log('\n📝 Recent commits:');
    console.log(recentCommits);
    
    if (recentCommits.includes('photography page') || recentCommits.includes('GA4 integration')) {
      console.log('✅ Photography changes are still present');
    }
  } catch (error) {
    console.log('ℹ️  Checking commit history...');
  }
  
  // Try to push again
  console.log('\n🚀 Attempting to push changes...');
  execSync('git push origin main', { stdio: 'inherit' });
  
  console.log('\n✅ Photography page changes successfully pushed!');
  
  // Final status
  console.log('\n📊 Final repository status:');
  execSync('git status', { stdio: 'inherit' });
  
  console.log('\n🎉 Your photography page updates are now live in the repository!');
  console.log('\n💡 Next steps:');
  console.log('   - GitHub Actions will automatically deploy your changes');
  console.log('   - Monitor deployment progress in your GitHub repository');
  console.log('   - Check the live website after deployment completes');

} catch (error) {
  console.error('❌ Error syncing photography changes:', error.message);
  
  console.log('\n🔧 Manual resolution steps:');
  console.log('1. Check status: git status');
  console.log('2. Resolve any conflicts if present');
  console.log('3. Add resolved files: git add .');
  console.log('4. Commit if needed: git commit -m "Resolve conflicts"');
  console.log('5. Push: git push origin main');
  
  process.exit(1);
}