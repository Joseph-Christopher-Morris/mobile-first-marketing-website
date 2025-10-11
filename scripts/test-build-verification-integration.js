#!/usr/bin/env node

/**
 * Test Build Verification Integration
 *
 * This script tests that the build verification is properly integrated
 * into the deployment pipeline without running a full deployment.
 */

const Deployment = require('./deploy.js');

async function testBuildVerificationIntegration() {
  console.log('🧪 Testing Build Verification Integration');
  console.log('========================================\n');

  try {
    // Create deployment instance
    const deployment = new Deployment();

    // Test just the build portion (which includes verification)
    console.log('🔨 Testing build with verification...\n');

    const buildStats = await deployment.buildProject();

    console.log('✅ Build verification integration test passed!');
    console.log(`   Build completed with ${buildStats.fileCount} files`);
    console.log(
      `   Total size: ${deployment.formatBytes(buildStats.totalSize)}`
    );

    return true;
  } catch (error) {
    console.error(
      '❌ Build verification integration test failed:',
      error.message
    );
    return false;
  }
}

// Run test
testBuildVerificationIntegration()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Test execution failed:', error);
    process.exit(1);
  });
