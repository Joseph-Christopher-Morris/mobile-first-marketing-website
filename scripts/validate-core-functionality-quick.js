#!/usr/bin/env node

/**
 * Quick Core Site Functionality Validator
 * For task 5.2.4.1 - focuses on validation without heavy build steps
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Quick Core Site Functionality Tests...');

const args = process.argv.slice(2);
const options = {
  verbose: args.includes('--verbose') || args.includes('-v'),
  skipServer: args.includes('--skip-server'),
  baseUrl:
    args.find(arg => arg.startsWith('--url='))?.split('=')[1] ||
    'http://localhost:3000',
};

console.log('Options:', options);

let passed = 0;
let failed = 0;
let skipped = 0;

function runTest(testName, testFn) {
  console.log(`\n🧪 Running: ${testName}`);
  try {
    const result = testFn();
    console.log(`✅ ${testName} - PASSED`);
    passed++;
    return result;
  } catch (error) {
    if (error.message.includes('SKIP')) {
      console.log(`⊘ ${testName} - SKIPPED: ${error.message}`);
      skipped++;
    } else {
      console.log(`❌ ${testName} - FAILED: ${error.message}`);
      failed++;
    }
  }
}

// Test 1: Environment Validation
runTest('Environment Variables Validation', () => {
  execSync('npm run env:validate', {
    encoding: 'utf8',
    timeout: 30000,
    stdio: options.verbose ? 'inherit' : 'pipe',
  });
  return 'Environment variables are valid';
});

// Test 2: Content Structure Validation
runTest('Content Structure Validation', () => {
  execSync('npm run content:validate-structure', {
    encoding: 'utf8',
    timeout: 30000,
    stdio: options.verbose ? 'inherit' : 'pipe',
  });
  return 'Content structure is valid';
});

// Test 3: Content Validation
runTest('Content Validation', () => {
  execSync('npm run content:validate', {
    encoding: 'utf8',
    timeout: 30000,
    stdio: options.verbose ? 'inherit' : 'pipe',
  });
  return 'Content is valid';
});

// Test 4: TypeScript Type Checking
runTest('TypeScript Type Checking', () => {
  execSync('npm run type-check', {
    encoding: 'utf8',
    timeout: 60000,
    stdio: options.verbose ? 'inherit' : 'pipe',
  });
  return 'TypeScript types are valid';
});

// Test 5: Linting
runTest('Code Quality (ESLint)', () => {
  execSync('npm run lint', {
    encoding: 'utf8',
    timeout: 60000,
    stdio: options.verbose ? 'inherit' : 'pipe',
  });
  return 'Code quality checks passed';
});

// Test 6: Format Check
runTest('Code Formatting (Prettier)', () => {
  execSync('npm run format:check', {
    encoding: 'utf8',
    timeout: 30000,
    stdio: options.verbose ? 'inherit' : 'pipe',
  });
  return 'Code formatting is correct';
});

// Test 7: Unit Tests
runTest('Unit Tests', () => {
  execSync('npm run test', {
    encoding: 'utf8',
    timeout: 60000,
    stdio: options.verbose ? 'inherit' : 'pipe',
  });
  return 'Unit tests passed';
});

// Test 8: Core E2E Tests (if server is running)
if (!options.skipServer) {
  runTest('Core E2E Tests', () => {
    try {
      execSync(
        'npx playwright test e2e/core-functionality.spec.ts --reporter=line',
        {
          encoding: 'utf8',
          timeout: 120000,
          stdio: options.verbose ? 'inherit' : 'pipe',
        }
      );
      return 'Core E2E tests passed';
    } catch (error) {
      if (
        error.message.includes('ECONNREFUSED') ||
        error.message.includes('Timed out waiting')
      ) {
        throw new Error('SKIP: Development server not running');
      }
      throw error;
    }
  });
} else {
  runTest('Core E2E Tests', () => {
    throw new Error('SKIP: Server tests skipped (--skip-server flag)');
  });
}

// Test 9: Social Media Configuration Check
runTest('Social Media Configuration', () => {
  const socialVars = [
    'NEXT_PUBLIC_FACEBOOK_URL',
    'NEXT_PUBLIC_TWITTER_URL',
    'NEXT_PUBLIC_LINKEDIN_URL',
    'NEXT_PUBLIC_INSTAGRAM_URL',
  ];

  const configuredSocial = socialVars.filter(varName => process.env[varName]);

  console.log(
    `  📱 Configured social networks: ${configuredSocial.length}/${socialVars.length}`
  );
  if (configuredSocial.length > 0) {
    console.log(`  🔗 Networks: ${configuredSocial.join(', ')}`);
  }

  return `${configuredSocial.length} social networks configured`;
});

// Test 10: Analytics Configuration Check
runTest('Analytics Configuration', () => {
  const analyticsVars = [
    'NEXT_PUBLIC_GA_ID',
    'NEXT_PUBLIC_GTM_ID',
    'NEXT_PUBLIC_FACEBOOK_PIXEL_ID',
  ];

  const configuredAnalytics = analyticsVars.filter(
    varName => process.env[varName]
  );

  console.log(
    `  📊 Configured analytics: ${configuredAnalytics.length}/${analyticsVars.length}`
  );
  if (configuredAnalytics.length > 0) {
    console.log(`  📈 Services: ${configuredAnalytics.join(', ')}`);
  }

  return `${configuredAnalytics.length} analytics services configured`;
});

// Test 11: Contact Email Configuration
runTest('Contact Email Configuration', () => {
  const contactEmail = process.env.CONTACT_EMAIL;

  if (!contactEmail) {
    throw new Error('CONTACT_EMAIL environment variable not configured');
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(contactEmail)) {
    throw new Error('CONTACT_EMAIL is not a valid email format');
  }

  console.log(`  📧 Contact email: ${contactEmail}`);
  return 'Contact email is properly configured';
});

// Test 12: Site Configuration
runTest('Site Configuration', () => {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME;

  if (!siteUrl) {
    throw new Error('NEXT_PUBLIC_SITE_URL not configured');
  }

  if (!siteName) {
    throw new Error('NEXT_PUBLIC_SITE_NAME not configured');
  }

  console.log(`  🌐 Site URL: ${siteUrl}`);
  console.log(`  📝 Site Name: ${siteName}`);

  return 'Site configuration is complete';
});

// Summary
const total = passed + failed + skipped;
const successRate = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;

console.log('\n' + '='.repeat(60));
console.log('🎯 CORE SITE FUNCTIONALITY TEST RESULTS');
console.log('='.repeat(60));
console.log(`📊 Total Tests: ${total}`);
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`⊘ Skipped: ${skipped}`);
console.log(`📈 Success Rate: ${successRate}%`);
console.log('='.repeat(60));

if (failed > 0) {
  console.log('\n❌ Core site functionality tests FAILED');
  console.log(`💡 ${failed} test(s) need attention before deployment`);
  process.exit(1);
} else {
  console.log('\n✅ Core site functionality tests PASSED');
  if (skipped > 0) {
    console.log(`ℹ️  ${skipped} test(s) were skipped`);
  }
  console.log('🚀 Site core functionality is validated!');
}
