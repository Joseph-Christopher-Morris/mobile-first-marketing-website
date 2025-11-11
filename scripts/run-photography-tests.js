#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Running Photography Page Comprehensive Test Suite\n');

// Test configuration
const testConfig = {
  accessibility: {
    name: 'Accessibility Tests',
    command: 'npx playwright test e2e/photography-accessibility.spec.ts --reporter=html',
    required: true
  },
  responsive: {
    name: 'Responsive Design Tests', 
    command: 'npx playwright test e2e/photography-responsive.spec.ts --reporter=html',
    required: true
  },
  performance: {
    name: 'Performance Tests',
    command: 'npx playwright test e2e/photography-performance.spec.ts --reporter=html',
    required: true
  },
  lighthouse: {
    name: 'Lighthouse CI Performance Audit',
    command: 'npx lhci autorun --config=lighthouserc.photography.json',
    required: false // Optional since it requires server to be running
  }
};

// Results tracking
const results = {
  passed: [],
  failed: [],
  skipped: []
};

// Helper function to run command with error handling
function runTest(testName, command, required = true) {
  console.log(`\n📋 Running ${testName}...`);
  console.log(`Command: ${command}\n`);
  
  try {
    const output = execSync(command, { 
      stdio: 'inherit',
      timeout: 300000 // 5 minute timeout
    });
    
    console.log(`✅ ${testName} - PASSED\n`);
    results.passed.push(testName);
    return true;
    
  } catch (error) {
    if (required) {
      console.error(`❌ ${testName} - FAILED`);
      console.error(`Error: ${error.message}\n`);
      results.failed.push(testName);
      return false;
    } else {
      console.warn(`⚠️  ${testName} - SKIPPED (Optional)`);
      console.warn(`Reason: ${error.message}\n`);
      results.skipped.push(testName);
      return true;
    }
  }
}

// Check if required dependencies are installed
function checkDependencies() {
  console.log('🔍 Checking test dependencies...\n');
  
  const requiredPackages = [
    '@playwright/test',
    '@axe-core/playwright'
  ];
  
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const allDeps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies
  };
  
  const missingPackages = requiredPackages.filter(pkg => !allDeps[pkg]);
  
  if (missingPackages.length > 0) {
    console.warn('⚠️  Missing test dependencies:');
    missingPackages.forEach(pkg => console.warn(`   - ${pkg}`));
    console.warn('\nInstalling missing dependencies...\n');
    
    try {
      execSync(`npm install --save-dev ${missingPackages.join(' ')}`, { stdio: 'inherit' });
      console.log('✅ Dependencies installed successfully\n');
    } catch (error) {
      console.error('❌ Failed to install dependencies');
      console.error('Please install manually:', missingPackages.join(' '));
      return false;
    }
  }
  
  return true;
}

// Install Playwright browsers if needed
function installPlaywrightBrowsers() {
  console.log('🌐 Ensuring Playwright browsers are installed...\n');
  
  try {
    execSync('npx playwright install', { stdio: 'inherit' });
    console.log('✅ Playwright browsers ready\n');
    return true;
  } catch (error) {
    console.error('❌ Failed to install Playwright browsers');
    console.error(error.message);
    return false;
  }
}

// Generate test report
function generateReport() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = `test-results/photography-test-report-${timestamp}.json`;
  
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: results.passed.length + results.failed.length + results.skipped.length,
      passed: results.passed.length,
      failed: results.failed.length,
      skipped: results.skipped.length,
      success: results.failed.length === 0
    },
    results: results,
    testSuite: 'Photography Page Comprehensive Tests',
    coverage: {
      accessibility: results.passed.includes('Accessibility Tests'),
      responsive: results.passed.includes('Responsive Design Tests'),
      performance: results.passed.includes('Performance Tests'),
      lighthouse: results.passed.includes('Lighthouse CI Performance Audit')
    }
  };
  
  // Ensure test-results directory exists
  if (!fs.existsSync('test-results')) {
    fs.mkdirSync('test-results', { recursive: true });
  }
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log('\n📊 Test Report Generated:');
  console.log(`   File: ${reportPath}`);
  console.log(`   Total Tests: ${report.summary.total}`);
  console.log(`   Passed: ${report.summary.passed}`);
  console.log(`   Failed: ${report.summary.failed}`);
  console.log(`   Skipped: ${report.summary.skipped}`);
  
  return report;
}

// Main execution
async function main() {
  console.log('🚀 Photography Page Test Suite Starting...\n');
  
  // Pre-flight checks
  if (!checkDependencies()) {
    process.exit(1);
  }
  
  if (!installPlaywrightBrowsers()) {
    process.exit(1);
  }
  
  // Run tests in sequence
  let allPassed = true;
  
  for (const [key, config] of Object.entries(testConfig)) {
    const success = runTest(config.name, config.command, config.required);
    if (!success && config.required) {
      allPassed = false;
    }
  }
  
  // Generate final report
  const report = generateReport();
  
  // Final summary
  console.log('\n' + '='.repeat(60));
  console.log('📋 PHOTOGRAPHY PAGE TEST SUITE COMPLETE');
  console.log('='.repeat(60));
  
  if (report.summary.success) {
    console.log('🎉 ALL TESTS PASSED!');
    console.log('\n✅ Photography page meets all quality standards:');
    console.log('   • Accessibility (WCAG 2.1 AA compliant)');
    console.log('   • Responsive design (all breakpoints)');
    console.log('   • Performance (Core Web Vitals targets)');
    if (results.passed.includes('Lighthouse CI Performance Audit')) {
      console.log('   • Lighthouse audit (90+ scores)');
    }
  } else {
    console.log('❌ SOME TESTS FAILED');
    console.log('\n🔧 Issues to address:');
    results.failed.forEach(test => console.log(`   • ${test}`));
    
    console.log('\n📖 Check detailed reports in:');
    console.log('   • playwright-report/ (for Playwright tests)');
    console.log('   • lighthouse-reports/ (for Lighthouse audits)');
  }
  
  console.log('\n📊 Detailed report:', path.resolve(reportPath));
  console.log('='.repeat(60));
  
  // Exit with appropriate code
  process.exit(allPassed ? 0 : 1);
}

// Handle errors gracefully
process.on('unhandledRejection', (error) => {
  console.error('\n❌ Unhandled error:', error);
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log('\n\n⏹️  Test suite interrupted by user');
  process.exit(1);
});

// Run the test suite
main().catch(error => {
  console.error('\n❌ Test suite failed:', error);
  process.exit(1);
});