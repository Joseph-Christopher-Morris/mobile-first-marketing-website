#!/usr/bin/env node

/**
 * Clean Build Script for Windows
 * Fixes common Windows file permission issues with Next.js builds
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧹 Cleaning build directories...');

function forceRemoveDir(dirPath) {
  if (fs.existsSync(dirPath)) {
    try {
      // Try normal removal first
      fs.rmSync(dirPath, { recursive: true, force: true });
      console.log(`✅ Removed ${dirPath}`);
    } catch (error) {
      try {
        // Windows-specific force removal
        execSync(`rmdir /s /q "${dirPath}"`, { stdio: 'ignore' });
        console.log(`✅ Force removed ${dirPath}`);
      } catch (winError) {
        console.log(`⚠️  Could not remove ${dirPath}, continuing...`);
      }
    }
  }
}

// Clean build directories
forceRemoveDir('.next');
forceRemoveDir('out');
forceRemoveDir('node_modules/.cache');

console.log('✅ Clean complete!');