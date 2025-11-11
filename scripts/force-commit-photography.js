#!/usr/bin/env node

/**
 * Force Commit Photography Changes
 * 
 * This script will force add and commit any photography-related files,
 * even if git doesn't detect changes automatically.
 */

const { execSync } = require('child_process');

console.log('🔄 Force Committing Photography Changes...\n');

try {
  // Force add all photography-related files
  console.log('📁 Adding all photography files...');
  
  const photographyPaths = [
    'src/app/services/photography/',
    'src/components/services/PhotographyGallery.tsx',
    'public/images/services/Photography/',
    '.env.production'
  ];
  
  for (const path of photographyPaths) {
    try {
      execSync(`git add "${path}"`, { stdio: 'inherit' });
      console.log(`✅ Added: ${path}`);
    } catch (error) {
      console.log(`ℹ️  Path not found or no changes: ${path}`);
    }
  }
  
  // Check if there's anything to commit
  try {
    const stagedFiles = execSync('git diff --cached --name-only', { encoding: 'utf8' }).trim();
    
    if (!stagedFiles) {
      console.log('\n⚠️  No staged changes found for photography files.');
      console.log('\n🔍 Let me check what files you might want to commit:');
      
      // Show current status
      console.log('\n📊 Current git status:');
      execSync('git status --short', { stdio: 'inherit' });
      
      console.log('\n💡 If you made changes to the photography page:');
      console.log('1. Make sure the file is saved');
      console.log('2. Try: git add src/app/services/photography/page.tsx');
      console.log('3. Then run: git commit -m "Update photography page"');
      
      return;
    }
    
    console.log('\n📋 Files staged for commit:');
    stagedFiles.split('\n').forEach(file => console.log(`   - ${file}`));
    
  } catch (error) {
    console.log('ℹ️  Checking staged files...');
  }
  
  // Create commit message
  const timestamp = new Date().toLocaleString();
  const commitMessage = `feat: Photography page updates (${timestamp})

- Updated photography page content and images
- Enhanced gallery presentation
- Improved text and messaging
- Added new photography samples

Manual commit to ensure all photography changes are captured.`;

  // Commit the changes
  console.log('\n🔄 Creating commit...');
  execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
  
  console.log('\n✅ Photography changes committed successfully!');
  
  // Show commit details
  const commitHash = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim().substring(0, 7);
  console.log(`\n🔗 Commit hash: ${commitHash}`);
  
  console.log('\n🚀 Ready to push:');
  console.log('   git push origin main');

} catch (error) {
  if (error.message.includes('nothing to commit')) {
    console.log('\n✅ No changes to commit - everything is up to date!');
    console.log('\n💡 If you made changes:');
    console.log('1. Save your files first');
    console.log('2. Check: git status');
    console.log('3. Add files: git add <filename>');
    console.log('4. Commit: git commit -m "Your message"');
  } else {
    console.error('❌ Error committing changes:', error.message);
  }
}