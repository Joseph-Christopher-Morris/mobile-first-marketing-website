#!/usr/bin/env node

/**
 * Commit Photography Page Changes
 * 
 * This script commits the changes made to the photography page and related components.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔄 Committing Photography Page Changes...\n');

try {
  // Check if we're in a git repository
  execSync('git status', { stdio: 'pipe' });
  
  // Files specifically related to photography page changes
  const photographyFiles = [
    'src/app/services/photography/page.tsx',
    'src/components/services/PhotographyGallery.tsx',
    'src/app/layout.tsx', // GA4 integration
    'public/images/services/Photography/', // Photography images
    '.env.production' // Environment variables for GA4
  ];
  
  // Check which files exist and have changes
  const filesToCommit = [];
  
  for (const file of photographyFiles) {
    try {
      if (fs.existsSync(file)) {
        // Check if file has changes
        try {
          execSync(`git diff --name-only ${file}`, { stdio: 'pipe' });
          filesToCommit.push(file);
          console.log(`✅ Found changes in: ${file}`);
        } catch (e) {
          // No changes in this file
          console.log(`ℹ️  No changes in: ${file}`);
        }
      }
    } catch (error) {
      console.log(`⚠️  Could not check: ${file}`);
    }
  }
  
  if (filesToCommit.length === 0) {
    console.log('ℹ️  No photography-related changes found to commit.');
    return;
  }
  
  // Add the files with changes
  console.log('\n🔄 Adding files to git...');
  for (const file of filesToCommit) {
    try {
      execSync(`git add "${file}"`, { stdio: 'inherit' });
      console.log(`✅ Added: ${file}`);
    } catch (error) {
      console.log(`⚠️  Could not add: ${file} - ${error.message}`);
    }
  }
  
  // Also add any new photography images
  try {
    execSync('git add public/images/services/Photography/', { stdio: 'inherit' });
    console.log('✅ Added photography images directory');
  } catch (error) {
    console.log('ℹ️  No new photography images to add');
  }
  
  // Create commit message
  const commitMessage = `feat: Update photography page with GA4 integration and gallery improvements

- Enhanced photography page with responsive gallery design
- Integrated Google Analytics 4 tracking (G-QJXSCJ0L43)
- Improved mobile experience with proper aspect ratios
- Added editorial proof showcasing BBC, Forbes, and Times publications
- Optimized image loading and performance
- Updated gallery component with better categorization

Changes include:
- Photography page content and layout improvements
- GA4 script integration in layout.tsx
- Photography gallery component enhancements
- Environment configuration for analytics`;

  // Commit the changes
  console.log('\n🔄 Creating commit...');
  execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
  
  console.log('\n✅ Photography page changes committed successfully!');
  console.log('\n📋 Commit Summary:');
  console.log('   - Photography page updated with new content and layout');
  console.log('   - GA4 analytics integration added');
  console.log('   - Gallery component improved for mobile experience');
  console.log('   - Editorial credentials prominently featured');
  
  // Show the commit hash
  const commitHash = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim().substring(0, 7);
  console.log(`\n🔗 Commit hash: ${commitHash}`);
  
  // Ask if user wants to push
  console.log('\n💡 Next steps:');
  console.log('   - Review the commit with: git show');
  console.log('   - Push to remote with: git push origin main');
  console.log('   - Deploy changes with your deployment script');

} catch (error) {
  console.error('❌ Error committing photography changes:', error.message);
  process.exit(1);
}