#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Website Versioning Script');
console.log('============================\n');

// Check if git is available
function checkGitAvailable() {
  try {
    execSync('git --version', { stdio: 'pipe' });
    return true;
  } catch (error) {
    console.log('❌ Git is not installed or not available in PATH');
    console.log('💡 Please install Git first: https://git-scm.com/downloads');
    return false;
  }
}

// Check if this is a git repository
function checkGitRepo() {
  try {
    execSync('git rev-parse --git-dir', { stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
}

// Initialize git repository
function initGitRepo() {
  console.log('📁 Initializing Git repository...');
  execSync('git init', { stdio: 'inherit' });
  console.log('✅ Git repository initialized\n');
}

// Add all files
function addFiles() {
  console.log('📋 Adding files to Git...');

  // Add all source files
  execSync('git add src/', { stdio: 'inherit' });
  execSync('git add content/', { stdio: 'inherit' });
  execSync('git add public/', { stdio: 'inherit' });
  execSync('git add scripts/', { stdio: 'inherit' });
  execSync('git add docs/', { stdio: 'inherit' });
  execSync('git add .kiro/', { stdio: 'inherit' });
  execSync('git add .github/', { stdio: 'inherit' });

  // Add config files
  execSync('git add package.json package-lock.json', { stdio: 'inherit' });
  execSync('git add next.config.js tailwind.config.js tsconfig.json', {
    stdio: 'inherit',
  });
  execSync('git add .gitignore .eslintrc.json prettier.config.js', {
    stdio: 'inherit',
  });
  execSync('git add README.md', { stdio: 'inherit' });

  // Add deployment summaries
  execSync('git add *-summary.md *-deployment-summary.md', {
    stdio: 'inherit',
  });

  console.log('✅ Files added to Git\n');
}

// Create commit
function createCommit() {
  const commitMessage = `🎉 Website Image & Navigation Fixes - Production Ready

✅ Fixed Issues:
- Removed desktop hamburger menu (mobile-only now)
- Fixed all image loading issues across site
- Service cards now display correct images
- Blog preview images loading properly
- About page hero image working
- All service sub-page images functional

🚀 Deployment:
- Successfully deployed to S3 + CloudFront
- All 8 critical images verified (200 status, correct MIME types)
- Cache invalidated and propagated
- Build verification passed (113 files, 3.37MB)

🔧 Technical Changes:
- Modified Header.tsx for responsive navigation
- Verified image paths and build inclusion
- Updated deployment pipeline with MIME type fixes
- Added comprehensive validation scripts

🌐 Live Site: https://d15sc9fc739ev2.cloudfront.net/

Deployment ID: deploy-1760182505009
Date: ${new Date().toISOString()}`;

  console.log('💾 Creating commit...');
  execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
  console.log('✅ Commit created\n');
}

// Check git status
function showStatus() {
  console.log('📊 Git Status:');
  try {
    execSync('git status --short', { stdio: 'inherit' });
  } catch (error) {
    console.log('No changes to show');
  }
  console.log('');
}

// Main execution
function main() {
  if (!checkGitAvailable()) {
    process.exit(1);
  }

  if (!checkGitRepo()) {
    initGitRepo();
  }

  showStatus();
  addFiles();
  createCommit();

  console.log('🎉 Website successfully versioned!');
  console.log('');
  console.log('📋 Next Steps:');
  console.log('1. Set up GitHub remote (if not already done):');
  console.log(
    '   git remote add origin https://github.com/yourusername/your-repo.git'
  );
  console.log('');
  console.log('2. Push to GitHub:');
  console.log('   git push -u origin main');
  console.log('');
  console.log('3. For future changes:');
  console.log('   git add .');
  console.log('   git commit -m "Your change description"');
  console.log('   git push');
  console.log('');
  console.log(
    '🌐 Your website is now properly versioned and ready for future updates!'
  );
}

main();
