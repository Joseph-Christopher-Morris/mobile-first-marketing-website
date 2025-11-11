#!/usr/bin/env node

/**
 * Push Photography Page Changes to Remote Repository
 * 
 * This script pushes the committed photography changes to the remote repository.
 */

const { execSync } = require('child_process');

console.log('🚀 Pushing Photography Page Changes to Remote...\n');

try {
  // Check current branch
  const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
  console.log(`📍 Current branch: ${currentBranch}`);
  
  // Check if there are commits to push
  try {
    const unpushedCommits = execSync(`git log origin/${currentBranch}..HEAD --oneline`, { encoding: 'utf8' }).trim();
    if (!unpushedCommits) {
      console.log('ℹ️  No new commits to push.');
      return;
    }
    
    console.log('\n📝 Commits to push:');
    console.log(unpushedCommits);
  } catch (error) {
    console.log('ℹ️  Checking for unpushed commits...');
  }
  
  // Push to remote
  console.log(`\n🔄 Pushing to origin/${currentBranch}...`);
  execSync(`git push origin ${currentBranch}`, { stdio: 'inherit' });
  
  console.log('\n✅ Photography page changes pushed successfully!');
  
  // Show remote status
  console.log('\n📊 Repository Status:');
  execSync('git status', { stdio: 'inherit' });
  
  console.log('\n🎉 Your photography page updates are now live in the repository!');
  console.log('\n💡 Next steps:');
  console.log('   - Your GitHub Actions workflow will automatically deploy changes');
  console.log('   - Monitor deployment at: https://github.com/your-repo/actions');
  console.log('   - Check live site after deployment completes');

} catch (error) {
  console.error('❌ Error pushing photography changes:', error.message);
  
  if (error.message.includes('rejected')) {
    console.log('\n💡 Tip: You may need to pull latest changes first:');
    console.log('   git pull origin main');
  }
  
  process.exit(1);
}