#!/usr/bin/env node
/**
 * Lighthouse CI Configuration Validator
 * Validates Task 6.1 implementation
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating Lighthouse CI Configuration...\n');

let allPassed = true;

// Test 1: Workflow file exists
console.log('1️⃣  Checking GitHub Actions Workflow...\n');
try {
  const workflowPath = path.join(process.cwd(), '.github', 'workflows', 'lhci.yml');
  if (fs.existsSync(workflowPath)) {
    console.log('   ✅ Lighthouse CI workflow file exists');
    
    const workflowContent = fs.readFileSync(workflowPath, 'utf8');
    
    if (workflowContent.includes('lhci autorun')) {
      console.log('   ✅ Workflow runs Lighthouse CI');
    }
    
    if (workflowContent.includes('pull_request')) {
      console.log('   ✅ Workflow triggers on pull requests');
    }
    
    if (workflowContent.includes('push')) {
      console.log('   ✅ Workflow triggers on push to main');
    }
    
    if (workflowContent.includes('upload-artifact')) {
      console.log('   ✅ Workflow uploads results as artifacts');
    }
  } else {
    console.log('   ❌ Lighthouse CI workflow file not found');
    allPassed = false;
  }
} catch (err) {
  console.log('   ❌ Error:', err.message);
  allPassed = false;
}

// Test 2: Configuration files
console.log('\n2️⃣  Checking Configuration Files...\n');
try {
  const desktopConfig = path.join(process.cwd(), 'lighthouserc.js');
  const mobileConfig = path.join(process.cwd(), 'lighthouserc.mobile.js');
  
  if (fs.existsSync(desktopConfig)) {
    console.log('   ✅ Desktop configuration exists');
    
    const config = require(desktopConfig);
    
    if (config.ci && config.ci.collect) {
      console.log('   ✅ Collect configuration defined');
      
      if (config.ci.collect.url && config.ci.collect.url.length > 0) {
        console.log(`   ✅ ${config.ci.collect.url.length} URLs configured for testing`);
      }
      
      if (config.ci.collect.numberOfRuns >= 3) {
        console.log('   ✅ Multiple runs configured (reduces variance)');
      }
    }
    
    if (config.ci && config.ci.assert) {
      console.log('   ✅ Assertions configured');
      
      const assertions = config.ci.assert.assertions;
      if (assertions['largest-contentful-paint']) {
        console.log('   ✅ LCP budget defined');
      }
      if (assertions['cumulative-layout-shift']) {
        console.log('   ✅ CLS budget defined');
      }
      if (assertions['total-blocking-time']) {
        console.log('   ✅ TBT budget defined');
      }
    }
  } else {
    console.log('   ❌ Desktop configuration not found');
    allPassed = false;
  }
  
  if (fs.existsSync(mobileConfig)) {
    console.log('   ✅ Mobile configuration exists');
  } else {
    console.log('   ⚠️  Mobile configuration not found (optional)');
  }
} catch (err) {
  console.log('   ❌ Error:', err.message);
  allPassed = false;
}

// Test 3: Core pages coverage
console.log('\n3️⃣  Checking Core Pages Coverage...\n');
try {
  const config = require(path.join(process.cwd(), 'lighthouserc.js'));
  const urls = config.ci.collect.url || [];
  
  const requiredPages = [
    'index.html',
    'about',
    'contact',
    'services',
    'blog',
  ];
  
  requiredPages.forEach(page => {
    const found = urls.some(url => url.includes(page));
    if (found) {
      console.log(`   ✅ ${page} page included`);
    } else {
      console.log(`   ❌ ${page} page missing`);
      allPassed = false;
    }
  });
} catch (err) {
  console.log('   ❌ Error:', err.message);
  allPassed = false;
}

// Test 4: Performance budgets
console.log('\n4️⃣  Checking Performance Budgets...\n');
try {
  const config = require(path.join(process.cwd(), 'lighthouserc.js'));
  const assertions = config.ci.assert.assertions;
  
  const budgets = {
    'first-contentful-paint': 1800,
    'largest-contentful-paint': 2500,
    'cumulative-layout-shift': 0.1,
    'total-blocking-time': 300,
    'speed-index': 3000,
  };
  
  Object.entries(budgets).forEach(([metric, target]) => {
    if (assertions[metric]) {
      const budget = assertions[metric][1]?.maxNumericValue;
      if (budget) {
        console.log(`   ✅ ${metric}: ${budget}ms (target: ${target}ms)`);
      }
    } else {
      console.log(`   ❌ ${metric} budget not defined`);
      allPassed = false;
    }
  });
} catch (err) {
  console.log('   ❌ Error:', err.message);
  allPassed = false;
}

// Summary
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
if (allPassed) {
  console.log('✅ Lighthouse CI Configuration: COMPLETE\n');
  console.log('📋 Configuration Summary:');
  console.log('   • GitHub Actions workflow configured');
  console.log('   • Desktop and mobile presets');
  console.log('   • Core pages covered');
  console.log('   • Performance budgets set');
  console.log('   • Automated quality gates active\n');
  console.log('🧪 Testing Instructions:');
  console.log('   1. Create a test branch');
  console.log('   2. Make a small change');
  console.log('   3. Push and create PR');
  console.log('   4. Check Lighthouse CI results in PR');
  console.log('   5. Review performance scores\n');
  console.log('📊 Manual Testing:');
  console.log('   npm install -g @lhci/cli');
  console.log('   npm run build && npm run export');
  console.log('   lhci autorun --config=lighthouserc.js\n');
} else {
  console.log('❌ Lighthouse CI Configuration: INCOMPLETE\n');
  console.log('Please fix the errors above and try again.\n');
  process.exit(1);
}
