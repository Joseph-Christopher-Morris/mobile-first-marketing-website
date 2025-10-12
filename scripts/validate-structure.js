#!/usr/bin/env node

/**
 * Content structure validation script
 * Validates the overall content directory structure and ensures proper setup
 */

const fs = require('fs');
const path = require('path');

const CONTENT_DIR = path.join(process.cwd(), 'content');

// Expected directory structure
const EXPECTED_STRUCTURE = {
  blog: {
    description: 'Blog posts and articles',
    minFiles: 1,
    filePattern: /\.md$/,
  },
  services: {
    description: 'Service pages',
    minFiles: 3,
    filePattern: /\.md$/,
    expectedFiles: ['photography.md', 'analytics.md', 'ad-campaigns.md'],
  },
  testimonials: {
    description: 'Customer testimonials',
    minFiles: 2,
    filePattern: /\.md$/,
  },
  pages: {
    description: 'Static pages',
    minFiles: 1,
    filePattern: /\.md$/,
    expectedFiles: ['about.md'],
  },
};

function validateStructure() {
  console.log('🏗️  Validating content directory structure...\n');

  let hasErrors = false;
  let totalFiles = 0;

  // Check if main content directory exists
  if (!fs.existsSync(CONTENT_DIR)) {
    console.error('❌ Content directory not found at:', CONTENT_DIR);
    process.exit(1);
  }

  console.log('📁 Content directory found:', CONTENT_DIR);

  // Validate each expected subdirectory
  Object.entries(EXPECTED_STRUCTURE).forEach(([dirName, config]) => {
    const dirPath = path.join(CONTENT_DIR, dirName);

    console.log(`\n📂 Checking ${dirName}/ (${config.description}):`);

    if (!fs.existsSync(dirPath)) {
      console.error(`  ❌ Directory missing: ${dirName}/`);
      hasErrors = true;
      return;
    }

    const files = fs
      .readdirSync(dirPath)
      .filter(file => config.filePattern.test(file));

    console.log(`  📄 Found ${files.length} markdown files`);
    totalFiles += files.length;

    // Check minimum file count
    if (files.length < config.minFiles) {
      console.error(
        `  ❌ Expected at least ${config.minFiles} files, found ${files.length}`
      );
      hasErrors = true;
    }

    // Check for expected files
    if (config.expectedFiles) {
      config.expectedFiles.forEach(expectedFile => {
        if (!files.includes(expectedFile)) {
          console.error(`  ❌ Expected file missing: ${expectedFile}`);
          hasErrors = true;
        } else {
          console.log(`  ✅ Required file found: ${expectedFile}`);
        }
      });
    }

    // List all files
    if (files.length > 0) {
      console.log(`  📋 Files: ${files.join(', ')}`);
    }
  });

  // Check for unexpected directories
  const actualDirs = fs
    .readdirSync(CONTENT_DIR)
    .filter(item => fs.statSync(path.join(CONTENT_DIR, item)).isDirectory());

  const expectedDirs = Object.keys(EXPECTED_STRUCTURE);
  const unexpectedDirs = actualDirs.filter(dir => !expectedDirs.includes(dir));

  if (unexpectedDirs.length > 0) {
    console.log(
      `\n⚠️  Unexpected directories found: ${unexpectedDirs.join(', ')}`
    );
  }

  // Summary
  console.log('\n📊 Structure Validation Summary:');
  console.log(
    `  📁 Directories: ${actualDirs.length} found, ${expectedDirs.length} expected`
  );
  console.log(`  📄 Total files: ${totalFiles}`);

  if (hasErrors) {
    console.error('\n❌ Content structure validation failed');
    process.exit(1);
  } else {
    console.log('\n✅ Content structure validation passed');
  }
}

// Run validation if called directly
if (require.main === module) {
  validateStructure();
}

module.exports = { validateStructure };
