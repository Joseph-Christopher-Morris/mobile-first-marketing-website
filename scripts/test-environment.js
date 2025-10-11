#!/usr/bin/env node

/**
 * Environment Testing Script
 * Comprehensive testing of environment configuration and validation
 */

const {
  validateEnvironment,
  showEnvironmentInfo,
} = require('./validate-env.js');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function testEnvironmentLoading() {
  console.log('🧪 Testing environment variable loading...');

  // Test that critical variables are loaded
  const criticalVars = ['NEXT_PUBLIC_SITE_NAME', 'NEXT_PUBLIC_SITE_URL'];

  const missing = criticalVars.filter(varName => !process.env[varName]);

  if (missing.length > 0) {
    console.error(`❌ Critical variables not loaded: ${missing.join(', ')}`);
    return false;
  }

  console.log('✅ Environment variables loaded successfully');
  return true;
}

function testValidationScript() {
  console.log('🧪 Testing validation script...');

  try {
    validateEnvironment();
    console.log('✅ Validation script working correctly');
    return true;
  } catch (error) {
    console.error('❌ Validation script failed:', error.message);
    return false;
  }
}

function testContentValidation() {
  console.log('🧪 Testing content validation scripts...');

  try {
    // Test content structure validation
    execSync('npm run content:validate-structure', { stdio: 'pipe' });
    console.log('✅ Content structure validation working');

    // Test content validation
    execSync('npm run content:validate', { stdio: 'pipe' });
    console.log('✅ Content validation working');

    return true;
  } catch (error) {
    console.error('❌ Content validation failed:', error.message);
    return false;
  }
}

function testEnvironmentFiles() {
  console.log('🧪 Testing environment files...');

  const envFiles = ['.env.example', '.env.local', '.env.production'];

  let allExist = true;

  envFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file} exists`);
    } else {
      console.error(`❌ ${file} missing`);
      allExist = false;
    }
  });

  return allExist;
}

function testProductionConfiguration() {
  console.log('🧪 Testing production configuration...');

  const prodEnvPath = '.env.production';
  if (!fs.existsSync(prodEnvPath)) {
    console.error('❌ .env.production file not found');
    return false;
  }

  const prodContent = fs.readFileSync(prodEnvPath, 'utf8');
  const requiredProdVars = [
    'NEXT_PUBLIC_SITE_URL',
    'CONTACT_EMAIL',
    'NODE_ENV=production',
  ];

  let allPresent = true;
  requiredProdVars.forEach(varPattern => {
    if (prodContent.includes(varPattern)) {
      console.log(`✅ Production config includes: ${varPattern}`);
    } else {
      console.error(`❌ Production config missing: ${varPattern}`);
      allPresent = false;
    }
  });

  return allPresent;
}

function runAllTests() {
  console.log('🚀 Running comprehensive environment tests...\n');

  const tests = [
    { name: 'Environment Loading', fn: testEnvironmentLoading },
    { name: 'Validation Script', fn: testValidationScript },
    { name: 'Content Validation', fn: testContentValidation },
    { name: 'Environment Files', fn: testEnvironmentFiles },
    { name: 'Production Configuration', fn: testProductionConfiguration },
  ];

  let passed = 0;
  let failed = 0;

  tests.forEach(test => {
    console.log(`\n--- ${test.name} ---`);
    try {
      if (test.fn()) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.error(`❌ ${test.name} failed with error:`, error.message);
      failed++;
    }
  });

  console.log('\n📊 Test Results:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);

  if (failed === 0) {
    console.log('\n🎉 All environment tests passed!');
    showEnvironmentInfo();
  } else {
    console.log('\n⚠️  Some tests failed. Please review the output above.');
    process.exit(1);
  }
}

// Run tests if called directly
if (require.main === module) {
  runAllTests();
}

module.exports = {
  testEnvironmentLoading,
  testValidationScript,
  testContentValidation,
  testEnvironmentFiles,
  testProductionConfiguration,
  runAllTests,
};
