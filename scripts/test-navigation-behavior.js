#!/usr/bin/env node

/**
 * Navigation Behavior Testing Script
 * 
 * This script runs comprehensive navigation behavior tests across different devices and screen sizes
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`🚀 Running: ${command} ${args.join(' ')}`);
    
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

async function buildProject() {
  console.log('📦 Building project for testing...');
  try {
    await runCommand('npm', ['run', 'build']);
    console.log('✅ Build completed successfully');
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    throw error;
  }
}

async function runNavigationTests() {
  console.log('🧪 Running navigation behavior validation tests...');
  
  try {
    // Run specific navigation test file
    await runCommand('npx', [
      'playwright', 
      'test', 
      'e2e/navigation-behavior-validation.spec.ts',
      '--reporter=list',
      '--project=chromium'
    ]);
    
    console.log('✅ Navigation tests completed successfully');
    return true;
  } catch (error) {
    console.error('❌ Navigation tests failed:', error.message);
    return false;
  }
}

async function runCrossBrowserTests() {
  console.log('🌐 Running cross-browser navigation tests...');
  
  const browsers = ['chromium', 'firefox', 'webkit'];
  const results = {};
  
  for (const browser of browsers) {
    console.log(`\n🔍 Testing navigation in ${browser}...`);
    
    try {
      await runCommand('npx', [
        'playwright', 
        'test', 
        'e2e/navigation-behavior-validation.spec.ts',
        '--reporter=list',
        `--project=${browser}`,
        '--grep=Cross-browser Navigation'
      ]);
      
      results[browser] = 'passed';
      console.log(`✅ ${browser} navigation tests passed`);
    } catch (error) {
      results[browser] = 'failed';
      console.error(`❌ ${browser} navigation tests failed:`, error.message);
    }
  }
  
  return results;
}

async function runMobileDeviceTests() {
  console.log('📱 Running mobile device navigation tests...');
  
  const mobileProjects = ['Mobile Chrome', 'Mobile Safari'];
  const results = {};
  
  for (const project of mobileProjects) {
    console.log(`\n📱 Testing navigation on ${project}...`);
    
    try {
      await runCommand('npx', [
        'playwright', 
        'test', 
        'e2e/navigation-behavior-validation.spec.ts',
        '--reporter=list',
        `--project=${project}`,
        '--grep=Touch Device Navigation'
      ]);
      
      results[project] = 'passed';
      console.log(`✅ ${project} navigation tests passed`);
    } catch (error) {
      results[project] = 'failed';
      console.error(`❌ ${project} navigation tests failed:`, error.message);
    }
  }
  
  return results;
}

async function runAccessibilityTests() {
  console.log('♿ Running navigation accessibility tests...');
  
  try {
    await runCommand('npx', [
      'playwright', 
      'test', 
      'e2e/navigation-behavior-validation.spec.ts',
      '--reporter=list',
      '--project=chromium',
      '--grep=Navigation Accessibility'
    ]);
    
    console.log('✅ Navigation accessibility tests passed');
    return true;
  } catch (error) {
    console.error('❌ Navigation accessibility tests failed:', error.message);
    return false;
  }
}

function generateTestReport(results) {
  const timestamp = new Date().toISOString();
  const report = {
    timestamp,
    testSuite: 'Navigation Behavior Validation',
    summary: {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0
    },
    results: {
      desktop: results.desktop || 'not_run',
      crossBrowser: results.crossBrowser || {},
      mobileDevices: results.mobileDevices || {},
      accessibility: results.accessibility || 'not_run'
    },
    testCategories: [
      {
        category: 'Desktop Navigation (≥768px)',
        description: 'Tests desktop navigation visibility and hamburger menu hiding',
        requirements: ['6.1', '6.2']
      },
      {
        category: 'Mobile Navigation (<768px)',
        description: 'Tests mobile hamburger menu functionality',
        requirements: ['6.3', '6.4']
      },
      {
        category: 'Touch Device Navigation',
        description: 'Tests navigation on actual mobile and tablet devices',
        requirements: ['6.3', '6.4']
      },
      {
        category: 'Navigation Accessibility',
        description: 'Tests keyboard navigation and screen reader support',
        requirements: ['6.4']
      },
      {
        category: 'Cross-browser Compatibility',
        description: 'Tests navigation across different browsers',
        requirements: ['6.3', '6.4']
      }
    ]
  };

  // Calculate summary statistics
  const allResults = [
    results.desktop,
    ...Object.values(results.crossBrowser || {}),
    ...Object.values(results.mobileDevices || {}),
    results.accessibility
  ].filter(result => result !== 'not_run');

  report.summary.totalTests = allResults.length;
  report.summary.passedTests = allResults.filter(result => result === 'passed' || result === true).length;
  report.summary.failedTests = allResults.filter(result => result === 'failed' || result === false).length;

  const reportPath = path.join(__dirname, '../navigation-behavior-test-results.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`\n📄 Test report saved to: ${reportPath}`);
  
  return report;
}

async function main() {
  console.log('🚀 Navigation Behavior Validation Test Suite\n');
  console.log('This test suite validates navigation behavior across different devices and screen sizes');
  console.log('Testing requirements 6.1, 6.2, 6.3, and 6.4 from the specification.\n');
  
  const results = {};
  
  try {
    // Build project first
    await buildProject();
    
    // Run desktop navigation tests
    console.log('\n' + '='.repeat(60));
    console.log('DESKTOP NAVIGATION TESTS');
    console.log('='.repeat(60));
    results.desktop = await runNavigationTests();
    
    // Run cross-browser tests
    console.log('\n' + '='.repeat(60));
    console.log('CROSS-BROWSER NAVIGATION TESTS');
    console.log('='.repeat(60));
    results.crossBrowser = await runCrossBrowserTests();
    
    // Run mobile device tests
    console.log('\n' + '='.repeat(60));
    console.log('MOBILE DEVICE NAVIGATION TESTS');
    console.log('='.repeat(60));
    results.mobileDevices = await runMobileDeviceTests();
    
    // Run accessibility tests
    console.log('\n' + '='.repeat(60));
    console.log('NAVIGATION ACCESSIBILITY TESTS');
    console.log('='.repeat(60));
    results.accessibility = await runAccessibilityTests();
    
    // Generate comprehensive report
    const report = generateTestReport(results);
    
    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('TEST SUMMARY');
    console.log('='.repeat(60));
    
    console.log(`📊 Total Tests: ${report.summary.totalTests}`);
    console.log(`✅ Passed: ${report.summary.passedTests}`);
    console.log(`❌ Failed: ${report.summary.failedTests}`);
    
    if (report.summary.failedTests === 0) {
      console.log('\n🎉 All navigation behavior tests passed!');
      console.log('✅ Desktop navigation works correctly (≥768px)');
      console.log('✅ Mobile hamburger menu works correctly (<768px)');
      console.log('✅ Touch device navigation is functional');
      console.log('✅ Navigation accessibility is compliant');
      console.log('✅ Cross-browser compatibility confirmed');
      
      console.log('\n🎯 Requirements Validated:');
      console.log('✅ 6.1 - Desktop hamburger icon removed');
      console.log('✅ 6.2 - Desktop navigation remains functional');
      console.log('✅ 6.3 - Mobile hamburger menu functional');
      console.log('✅ 6.4 - Navigation accessibility maintained');
      
      process.exit(0);
    } else {
      console.log('\n❌ Some navigation tests failed');
      console.log('Please review the test results and fix any issues');
      
      console.log('\n🔧 Common Issues to Check:');
      console.log('- Responsive breakpoints (md vs lg classes)');
      console.log('- Mobile menu JavaScript functionality');
      console.log('- Touch target sizes on mobile');
      console.log('- ARIA attributes and accessibility');
      console.log('- Cross-browser CSS compatibility');
      
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('1. Ensure the development server can start');
    console.error('2. Check that all dependencies are installed');
    console.error('3. Verify Playwright browsers are installed');
    console.error('4. Review the navigation component implementation');
    
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  runNavigationTests,
  runCrossBrowserTests,
  runMobileDeviceTests,
  runAccessibilityTests,
  generateTestReport
};