#!/usr/bin/env node

/**
 * Node.js 22.19.0 Dependency Compatibility Checker
 * Analyzes all dependencies for potential compatibility issues with Node 22.19.0
 */

const fs = require('fs');
const path = require('path');

// Known compatibility information for Node.js 22.x
const COMPATIBILITY_DATA = {
  // Dependencies that are known to work with Node 22.x
  compatible: {
    'next': '>=14.0.0', // Next.js 14+ supports Node 18+, 15+ supports Node 20+
    'react': '>=18.0.0', // React 18+ works with Node 22
    'react-dom': '>=18.0.0',
    'typescript': '>=5.0.0', // TypeScript 5+ supports Node 22
    'eslint': '>=8.0.0', // ESLint 8+ supports Node 22
    'prettier': '>=3.0.0', // Prettier 3+ supports Node 22
    'tailwindcss': '>=3.0.0', // Tailwind 3+ supports Node 22
    'vitest': '>=0.34.0', // Vitest supports Node 22
    'playwright': '>=1.40.0', // Playwright supports Node 22
    'lighthouse': '>=11.0.0', // Lighthouse 11+ supports Node 22
    'sharp': '>=0.32.0', // Sharp 0.32+ supports Node 22
    'puppeteer': '>=20.0.0', // Puppeteer 20+ supports Node 22
  },
  
  // Dependencies that might have issues
  potentialIssues: {
    '@types/node': {
      version: '>=20.0.0',
      note: 'Should be updated to @types/node@22.x for full Node 22 type support'
    },
    'jsdom': {
      version: '>=22.0.0',
      note: 'Check for Node 22 compatibility in newer versions'
    }
  },
  
  // AWS SDK compatibility
  awsSdk: {
    note: 'AWS SDK v3 packages generally support Node 18+ and should work with Node 22'
  }
};

function checkDependencyCompatibility() {
  console.log('🔍 Checking Node.js 22.19.0 Dependency Compatibility\n');
  
  // Read package.json
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    console.error('❌ package.json not found');
    process.exit(1);
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const allDeps = {
    ...packageJson.dependencies || {},
    ...packageJson.devDependencies || {}
  };
  
  const results = {
    compatible: [],
    potentialIssues: [],
    needsInvestigation: [],
    awsSdkPackages: []
  };
  
  // Analyze each dependency
  Object.entries(allDeps).forEach(([name, version]) => {
    // Check AWS SDK packages
    if (name.startsWith('@aws-sdk/')) {
      results.awsSdkPackages.push({ name, version });
      return;
    }
    
    // Check known compatible packages
    const basePackageName = name.replace(/^@[^/]+\//, '').split('/')[0];
    if (COMPATIBILITY_DATA.compatible[basePackageName] || COMPATIBILITY_DATA.compatible[name]) {
      results.compatible.push({ name, version, status: 'Compatible' });
      return;
    }
    
    // Check potential issues
    if (COMPATIBILITY_DATA.potentialIssues[name]) {
      results.potentialIssues.push({
        name,
        version,
        ...COMPATIBILITY_DATA.potentialIssues[name]
      });
      return;
    }
    
    // Everything else needs investigation
    results.needsInvestigation.push({ name, version });
  });
  
  // Report results
  console.log('✅ Compatible Dependencies:');
  results.compatible.forEach(dep => {
    console.log(`   ${dep.name}@${dep.version}`);
  });
  
  if (results.awsSdkPackages.length > 0) {
    console.log('\n🔧 AWS SDK Packages:');
    results.awsSdkPackages.forEach(dep => {
      console.log(`   ${dep.name}@${dep.version} - ${COMPATIBILITY_DATA.awsSdk.note}`);
    });
  }
  
  if (results.potentialIssues.length > 0) {
    console.log('\n⚠️  Potential Issues:');
    results.potentialIssues.forEach(dep => {
      console.log(`   ${dep.name}@${dep.version}`);
      console.log(`      Note: ${dep.note}`);
    });
  }
  
  if (results.needsInvestigation.length > 0) {
    console.log('\n🔍 Needs Investigation:');
    results.needsInvestigation.forEach(dep => {
      console.log(`   ${dep.name}@${dep.version}`);
    });
  }
  
  // Summary and recommendations
  console.log('\n📋 Summary:');
  console.log(`   Compatible: ${results.compatible.length}`);
  console.log(`   AWS SDK: ${results.awsSdkPackages.length}`);
  console.log(`   Potential Issues: ${results.potentialIssues.length}`);
  console.log(`   Needs Investigation: ${results.needsInvestigation.length}`);
  
  console.log('\n💡 Recommendations:');
  
  if (results.potentialIssues.length > 0) {
    console.log('   1. Update @types/node to version 22.x for full Node 22 type support');
    console.log('   2. Test jsdom functionality with Node 22');
  }
  
  if (results.needsInvestigation.length > 0) {
    console.log('   3. Test the following packages with Node 22:');
    results.needsInvestigation.forEach(dep => {
      console.log(`      - ${dep.name}`);
    });
  }
  
  console.log('   4. Run a test build with Node 22.19.0 to verify compatibility');
  console.log('   5. Check for any runtime errors during development and testing');
  
  // Check current engines field
  console.log('\n🔧 Current Engine Requirements:');
  if (packageJson.engines) {
    console.log(`   Node: ${packageJson.engines.node || 'Not specified'}`);
    console.log(`   NPM: ${packageJson.engines.npm || 'Not specified'}`);
  } else {
    console.log('   No engine requirements specified');
  }
  
  return results;
}

// Run the check
if (require.main === module) {
  checkDependencyCompatibility();
}

module.exports = { checkDependencyCompatibility };