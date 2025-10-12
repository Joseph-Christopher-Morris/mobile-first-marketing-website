#!/usr/bin/env node

/**
 * Final Deployment Validation Script
 * Validates all key components are ready for production
 */

const fs = require('fs');
const path = require('path');

function checkFile(filePath, description) {
  const exists = fs.existsSync(filePath);
  console.log(`${exists ? '✅' : '❌'} ${description}: ${filePath}`);
  return exists;
}

function checkNodeVersion() {
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  const isValid = majorVersion >= 22;
  console.log(`${isValid ? '✅' : '❌'} Node.js version: ${nodeVersion} (required: >=22.19.0)`);
  return isValid;
}

function checkPackageJson() {
  try {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const hasEngines = pkg.engines && pkg.engines.node;
    const hasPreinstall = pkg.scripts && pkg.scripts.preinstall;
    const noOverrides = !pkg.overrides || !pkg.overrides['@types/node'];
    
    console.log(`${hasEngines ? '✅' : '❌'} package.json engines configured`);
    console.log(`${hasPreinstall ? '✅' : '❌'} preinstall guard script present`);
    console.log(`${noOverrides ? '✅' : '❌'} @types/node override removed`);
    
    return hasEngines && hasPreinstall && noOverrides;
  } catch (error) {
    console.log('❌ package.json validation failed:', error.message);
    return false;
  }
}

function checkWorkflowConfig() {
  try {
    const workflow = fs.readFileSync('.github/workflows/quality-check.yml', 'utf8');
    const hasCorrectNode = workflow.includes("node-version: '22.19.0'");
    const hasNpmCi = workflow.includes('npm ci');
    
    console.log(`${hasCorrectNode ? '✅' : '❌'} Quality check workflow uses Node 22.19.0`);
    console.log(`${hasNpmCi ? '✅' : '❌'} Quality check workflow uses npm ci`);
    
    return hasCorrectNode && hasNpmCi;
  } catch (error) {
    console.log('❌ Workflow validation failed:', error.message);
    return false;
  }
}

function checkCriticalAssets() {
  const criticalAssets = [
    'public/images/hero/aston-martin-db6-website.webp',
    'src/components/ui/OptimizedImage.tsx',
    'src/app/layout.tsx',
    'src/app/page.tsx'
  ];
  
  let allPresent = true;
  console.log('\n📁 Critical Assets:');
  
  criticalAssets.forEach(asset => {
    const exists = checkFile(asset, 'Critical asset');
    if (!exists) allPresent = false;
  });
  
  return allPresent;
}

function checkServicePages() {
  const servicePages = [
    'src/app/services/ad-campaigns/page.tsx',
    'src/app/services/analytics/page.tsx',
    'src/app/services/photography/page.tsx'
  ];
  
  let allPresent = true;
  console.log('\n📄 Service Pages:');
  
  servicePages.forEach(page => {
    const exists = checkFile(page, 'Service page');
    if (!exists) allPresent = false;
  });
  
  return allPresent;
}

function main() {
  console.log('🔍 Final Deployment Validation\n');
  
  console.log('🔧 Environment Configuration:');
  const nodeOk = checkNodeVersion();
  const nvmrcOk = checkFile('.nvmrc', 'Node version lock file');
  const packageOk = checkPackageJson();
  const workflowOk = checkWorkflowConfig();
  
  const assetsOk = checkCriticalAssets();
  const servicesOk = checkServicePages();
  
  console.log('\n📋 Summary:');
  const allChecks = [nodeOk, nvmrcOk, packageOk, workflowOk, assetsOk, servicesOk];
  const passedChecks = allChecks.filter(Boolean).length;
  const totalChecks = allChecks.length;
  
  console.log(`${passedChecks}/${totalChecks} validation checks passed`);
  
  if (passedChecks === totalChecks) {
    console.log('\n🎉 All validations passed! Ready for deployment.');
    console.log('\n📋 Next steps:');
    console.log('1. Run quality-check workflow in GitHub Actions');
    console.log('2. If green, your S3/CloudFront deployment should work');
    console.log('3. Use scripts/quick-cache-invalidation.js if needed');
  } else {
    console.log('\n⚠️  Some validations failed. Please address the issues above.');
    
    if (!nodeOk) {
      console.log('\n💡 Node.js Issue:');
      console.log('- Install Node.js 22.19.0 or later');
      console.log('- Use nvm: nvm install 22.19.0 && nvm use 22.19.0');
    }
  }
  
  return passedChecks === totalChecks;
}

if (require.main === module) {
  const success = main();
  process.exit(success ? 0 : 1);
}

module.exports = { main };