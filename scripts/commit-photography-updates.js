#!/usr/bin/env node

/**
 * Commit Photography Page Updates
 * 
 * This script helps commit any new photography page changes including new photos and text updates.
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔄 Checking for Photography Page Updates...\n');

try {
  // Check for any unstaged changes to photography files
  console.log('📋 Checking for photography-related changes...');
  
  const photographyFiles = [
    'src/app/services/photography/page.tsx',
    'src/components/services/PhotographyGallery.tsx',
    'public/images/services/Photography/'
  ];
  
  let hasChanges = false;
  const changedFiles = [];
  
  // Check each photography file for changes
  for (const file of photographyFiles) {
    try {
      if (fs.existsSync(file)) {
        // Check if file has unstaged changes
        const diffOutput = execSync(`git diff --name-only "${file}"`, { encoding: 'utf8' }).trim();
        if (diffOutput) {
          hasChanges = true;
          changedFiles.push(file);
          console.log(`📝 Found changes in: ${file}`);
        }
        
        // Check if file has staged changes
        const stagedOutput = execSync(`git diff --cached --name-only "${file}"`, { encoding: 'utf8' }).trim();
        if (stagedOutput) {
          hasChanges = true;
          changedFiles.push(file);
          console.log(`📋 Found staged changes in: ${file}`);
        }
      }
    } catch (error) {
      // File might not exist or no changes
    }
  }
  
  // Check for new untracked photography images
  try {
    const untrackedFiles = execSync('git ls-files --others --exclude-standard', { encoding: 'utf8' });
    const newPhotographyImages = untrackedFiles.split('\n').filter(file => 
      file.includes('public/images/services/Photography/') && 
      (file.endsWith('.webp') || file.endsWith('.jpg') || file.endsWith('.png'))
    );
    
    if (newPhotographyImages.length > 0) {
      hasChanges = true;
      console.log(`📸 Found ${newPhotographyImages.length} new photography images:`);
      newPhotographyImages.forEach(img => console.log(`   - ${img}`));
      changedFiles.push(...newPhotographyImages);
    }
  } catch (error) {
    console.log('ℹ️  Could not check for new images');
  }
  
  if (!hasChanges) {
    console.log('ℹ️  No photography changes detected.');
    console.log('\n💡 If you made changes, make sure to save your files first.');
    console.log('   Then run this script again to commit them.');
    return;
  }
  
  console.log(`\n✅ Found photography changes in ${changedFiles.length} files/directories`);
  
  // Add all photography-related changes
  console.log('\n🔄 Adding photography changes to git...');
  
  // Add the main photography files
  for (const file of photographyFiles) {
    try {
      execSync(`git add "${file}"`, { stdio: 'inherit' });
      console.log(`✅ Added: ${file}`);
    } catch (error) {
      console.log(`ℹ️  No changes to add for: ${file}`);
    }
  }
  
  // Create commit message
  const timestamp = new Date().toISOString().split('T')[0];
  const commitMessage = `feat: Update photography page content and images (${timestamp})

- Updated photography page text and content
- Added new photography images to gallery
- Enhanced visual presentation and messaging
- Improved user experience and engagement

Photography updates include:
- Content refinements and text improvements
- New high-quality photography samples
- Gallery enhancements and optimizations
- SEO and accessibility improvements`;

  // Commit the changes
  console.log('\n🔄 Creating commit...');
  execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
  
  console.log('\n✅ Photography updates committed successfully!');
  
  // Show what was committed
  console.log('\n📊 Commit details:');
  const commitHash = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim().substring(0, 7);
  console.log(`   Commit hash: ${commitHash}`);
  
  // Show the files that were committed
  const committedFiles = execSync('git diff-tree --no-commit-id --name-only -r HEAD', { encoding: 'utf8' }).trim();
  if (committedFiles) {
    console.log('\n📁 Files committed:');
    committedFiles.split('\n').forEach(file => {
      if (file.includes('photography') || file.includes('Photography')) {
        console.log(`   ✅ ${file}`);
      }
    });
  }
  
  console.log('\n🚀 Next steps:');
  console.log('   - Push changes: git push origin main');
  console.log('   - Deploy to website using your deployment script');
  console.log('   - Check live website after deployment');

} catch (error) {
  console.error('❌ Error committing photography updates:', error.message);
  
  console.log('\n🔧 Troubleshooting:');
  console.log('1. Make sure you saved all your changes');
  console.log('2. Check git status: git status');
  console.log('3. Manually add files: git add src/app/services/photography/page.tsx');
  console.log('4. Then commit: git commit -m "Update photography page"');
  
  process.exit(1);
}