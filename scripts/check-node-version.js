#!/usr/bin/env node

/**
 * Node.js Version Compatibility Checker
 * Verifies that the current Node.js version meets project requirements
 */

const fs = require('fs');
const path = require('path');

// Required versions
const REQUIRED_NODE_VERSION = '22.19.0';
const REQUIRED_NPM_VERSION = '10.8.0';

function parseVersion(version) {
  return version.replace(/^v/, '').split('.').map(Number);
}

function compareVersions(current, required) {
  const currentParts = parseVersion(current);
  const requiredParts = parseVersion(required);
  
  for (let i = 0; i < Math.max(currentParts.length, requiredParts.length); i++) {
    const currentPart = currentParts[i] || 0;
    const requiredPart = requiredParts[i] || 0;
    
    if (currentPart > requiredPart) return 1;
    if (currentPart < requiredPart) return -1;
  }
  return 0;
}

function checkNodeVersion() {
  const currentNodeVersion = process.version;
  const comparison = compareVersions(currentNodeVersion, REQUIRED_NODE_VERSION);
  
  console.log('🔍 Node.js Version Check');
  console.log('========================');
  console.log(`Current Node.js version: ${currentNodeVersion}`);
  console.log(`Required Node.js version: v${REQUIRED_NODE_VERSION}`);
  
  if (comparison === 0) {
    console.log('✅ Node.js version is correct!');
    return true;
  } else if (comparison < 0) {
    console.log('❌ Node.js version is too old!');
    console.log(`\n📖 Upgrade instructions:`);
    console.log(`   - Complete guide: docs/node-22-upgrade-guide.md`);
    console.log(`   - Quick reference: docs/node-upgrade-quick-reference.md`);
    return false;
  } else {
    console.log('⚠️  Node.js version is newer than required (should work, but not tested)');
    return true;
  }
}

function checkNpmVersion() {
  try {
    const { execSync } = require('child_process');
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    const comparison = compareVersions(npmVersion, REQUIRED_NPM_VERSION);
    
    console.log('\n🔍 npm Version Check');
    console.log('===================');
    console.log(`Current npm version: ${npmVersion}`);
    console.log(`Required npm version: ${REQUIRED_NPM_VERSION}+`);
    
    if (comparison >= 0) {
      console.log('✅ npm version is compatible!');
      return true;
    } else {
      console.log('❌ npm version is too old!');
      console.log('\n📖 Upgrade npm:');
      console.log('   npm install -g npm@latest');
      return false;
    }
  } catch (error) {
    console.log('\n❌ Could not check npm version');
    console.log('Make sure npm is installed and available in PATH');
    return false;
  }
}

function checkPackageEngines() {
  try {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    console.log('\n🔍 Package.json Engines Check');
    console.log('=============================');
    
    if (packageJson.engines) {
      console.log('Engines configuration:');
      console.log(`  Node: ${packageJson.engines.node || 'not specified'}`);
      console.log(`  npm: ${packageJson.engines.npm || 'not specified'}`);
      
      if (packageJson.engines.node && packageJson.engines.node.includes('22.19.0')) {
        console.log('✅ Package.json engines field is correctly configured');
        return true;
      } else {
        console.log('⚠️  Package.json engines field may need updating');
        return false;
      }
    } else {
      console.log('⚠️  No engines field found in package.json');
      return false;
    }
  } catch (error) {
    console.log('❌ Could not read package.json');
    return false;
  }
}

function main() {
  console.log('🚀 Project Node.js Compatibility Check\n');
  
  const nodeOk = checkNodeVersion();
  const npmOk = checkNpmVersion();
  const enginesOk = checkPackageEngines();
  
  console.log('\n📋 Summary');
  console.log('==========');
  
  if (nodeOk && npmOk) {
    console.log('✅ Your environment is compatible!');
    console.log('\n🎯 Next steps:');
    console.log('   npm install    # Install dependencies');
    console.log('   npm run build  # Test build process');
    process.exit(0);
  } else {
    console.log('❌ Environment needs updates before proceeding');
    console.log('\n📚 Resources:');
    console.log('   - Node.js upgrade guide: docs/node-22-upgrade-guide.md');
    console.log('   - Quick reference: docs/node-upgrade-quick-reference.md');
    console.log('   - GitHub Actions workflow: .github/workflows/quality-check.yml');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { checkNodeVersion, checkNpmVersion, compareVersions };