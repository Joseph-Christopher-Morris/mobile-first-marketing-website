#!/usr/bin/env node

/**
 * Node.js 22.19.0 Compatibility Verification Script
 * Tests critical functionality to ensure compatibility
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Verifying Node.js 22.19.0 Compatibility\n');

// Check current Node version
const nodeVersion = process.version;
console.log(`Current Node.js version: ${nodeVersion}`);

if (!nodeVersion.startsWith('v22.')) {
  console.log('⚠️  Note: Running on Node.js ' + nodeVersion + ', not Node 22.19.0');
  console.log('   For full verification, run this script with Node 22.19.0\n');
}

const tests = [];

// Test 1: Package.json engines field
tests.push({
  name: 'Package.json engines field',
  test: () => {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const nodeEngine = packageJson.engines?.node;
    if (!nodeEngine) {
      throw new Error('No Node.js engine requirement specified');
    }
    if (!nodeEngine.includes('22.19.0') && !nodeEngine.includes('>=22.19.0')) {
      throw new Error(`Engine requirement "${nodeEngine}" may not include Node 22.19.0`);
    }
    return `✅ Node engine: ${nodeEngine}`;
  }
});

// Test 2: TypeScript compilation
tests.push({
  name: 'TypeScript compilation',
  test: () => {
    try {
      execSync('npx tsc --noEmit --skipLibCheck', { stdio: 'pipe' });
      return '✅ TypeScript compiles without errors';
    } catch (error) {
      throw new Error('TypeScript compilation failed: ' + error.message);
    }
  }
});

// Test 3: Next.js build check
tests.push({
  name: 'Next.js configuration',
  test: () => {
    if (!fs.existsSync('next.config.js')) {
      throw new Error('next.config.js not found');
    }
    // Try to require the config
    const nextConfig = require(path.join(process.cwd(), 'next.config.js'));
    return '✅ Next.js configuration loads successfully';
  }
});

// Test 4: Critical dependencies import test
tests.push({
  name: 'Critical dependencies import',
  test: () => {
    const criticalDeps = [
      'next',
      'react',
      'react-dom',
      'sharp',
      'gray-matter',
      'zod'
    ];
    
    const results = [];
    for (const dep of criticalDeps) {
      try {
        require(dep);
        results.push(`${dep} ✅`);
      } catch (error) {
        throw new Error(`Failed to import ${dep}: ${error.message}`);
      }
    }
    return '✅ All critical dependencies import successfully:\n      ' + results.join(', ');
  }
});

// Test 5: AWS SDK import test
tests.push({
  name: 'AWS SDK compatibility',
  test: () => {
    try {
      const { S3Client } = require('@aws-sdk/client-s3');
      const { CloudFrontClient } = require('@aws-sdk/client-cloudfront');
      return '✅ AWS SDK packages import successfully';
    } catch (error) {
      throw new Error(`AWS SDK import failed: ${error.message}`);
    }
  }
});

// Test 6: ESLint configuration
tests.push({
  name: 'ESLint configuration',
  test: () => {
    try {
      execSync('npx eslint --print-config src/app/page.tsx', { stdio: 'pipe' });
      return '✅ ESLint configuration loads successfully';
    } catch (error) {
      throw new Error('ESLint configuration failed: ' + error.message);
    }
  }
});

// Run all tests
let passed = 0;
let failed = 0;

console.log('Running compatibility tests...\n');

for (const test of tests) {
  try {
    const result = test.test();
    console.log(`${test.name}: ${result}`);
    passed++;
  } catch (error) {
    console.log(`${test.name}: ❌ ${error.message}`);
    failed++;
  }
}

console.log('\n📊 Test Results:');
console.log(`   Passed: ${passed}`);
console.log(`   Failed: ${failed}`);
console.log(`   Total: ${tests.length}`);

if (failed === 0) {
  console.log('\n🎉 All compatibility tests passed!');
  console.log('   The project appears ready for Node.js 22.19.0');
} else {
  console.log('\n⚠️  Some tests failed. Review the issues above before upgrading.');
  process.exit(1);
}

// Additional recommendations
console.log('\n💡 Next Steps:');
console.log('   1. Install Node.js 22.19.0 locally');
console.log('   2. Run: npm ci');
console.log('   3. Run: npm run build');
console.log('   4. Run: npm test');
console.log('   5. Test the application thoroughly');
console.log('   6. Update CI/CD pipeline to use Node 22.19.0');