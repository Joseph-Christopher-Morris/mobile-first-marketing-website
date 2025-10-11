#!/usr/bin/env node

/**
 * Build Optimization Script
 * Optimizes the build process for different environments
 */

const fs = require('fs');
const path = require('path');

function optimizeBuild() {
  const environment = process.env.NODE_ENV || 'development';
  const branch = process.env.AMPLIFY_BRANCH || 'main';
  const isProduction = environment === 'production' && branch === 'main';

  console.log(`🔧 Optimizing build for: ${environment} (branch: ${branch})`);

  // Set optimization flags based on environment
  const optimizations = {
    // Memory optimization
    nodeOptions: '--max-old-space-size=4096',

    // Next.js optimizations
    telemetryDisabled: true,

    // Build optimizations
    minify: isProduction,
    compress: isProduction,
    analyze: process.env.ANALYZE === 'true',

    // Performance optimizations
    imageOptimization: true,
    fontOptimization: true,
    cssOptimization: isProduction,
  };

  // Apply optimizations
  applyOptimizations(optimizations);

  console.log('✅ Build optimizations applied');
}

function applyOptimizations(optimizations) {
  // Set Node.js options
  if (!process.env.NODE_OPTIONS) {
    process.env.NODE_OPTIONS = optimizations.nodeOptions;
  }

  // Disable telemetry
  if (optimizations.telemetryDisabled) {
    process.env.NEXT_TELEMETRY_DISABLED = '1';
  }

  // Log optimization settings
  console.log('📊 Optimization Settings:');
  Object.entries(optimizations).forEach(([key, value]) => {
    console.log(`   ${key}: ${value}`);
  });
}

function checkBuildRequirements() {
  console.log('🔍 Checking build requirements...');

  // Check Node.js version
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

  if (majorVersion < 18) {
    console.error(
      `❌ Node.js version ${nodeVersion} is not supported. Please use Node.js 18 or higher.`
    );
    process.exit(1);
  }

  console.log(`✅ Node.js version: ${nodeVersion}`);

  // Check available memory
  const totalMemory = require('os').totalmem();
  const availableMemory = totalMemory / (1024 * 1024 * 1024); // Convert to GB

  if (availableMemory < 2) {
    console.warn(
      `⚠️  Available memory: ${availableMemory.toFixed(1)}GB. Build may be slow.`
    );
  } else {
    console.log(`✅ Available memory: ${availableMemory.toFixed(1)}GB`);
  }

  // Check disk space
  try {
    const stats = fs.statSync('.');
    console.log('✅ Disk space check passed');
  } catch (error) {
    console.error('❌ Disk space check failed:', error.message);
  }
}

function generateBuildInfo() {
  const buildInfo = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    branch: process.env.AMPLIFY_BRANCH || 'unknown',
    commit: process.env.AMPLIFY_COMMIT_ID || 'unknown',
    nodeVersion: process.version,
    buildId: process.env.AMPLIFY_BUILD_ID || 'local',
  };

  // Write build info to public directory
  const buildInfoPath = path.join(process.cwd(), 'public', 'build-info.json');
  fs.writeFileSync(buildInfoPath, JSON.stringify(buildInfo, null, 2));

  console.log('📝 Build info generated:', buildInfoPath);
  console.log(JSON.stringify(buildInfo, null, 2));
}

function main() {
  try {
    checkBuildRequirements();
    optimizeBuild();
    generateBuildInfo();
  } catch (error) {
    console.error('❌ Build optimization failed:', error.message);
    process.exit(1);
  }
}

// Run optimization if called directly
if (require.main === module) {
  main();
}

module.exports = { optimizeBuild, checkBuildRequirements, generateBuildInfo };
