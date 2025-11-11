#!/usr/bin/env node

const fs = require('fs');

function validateCoreWebVitals() {
  console.log('🔍 Validating Core Web Vitals for Photography Page...\n');
  
  try {
    const lighthouseData = JSON.parse(fs.readFileSync('lighthouse-photography-production.json', 'utf8'));
    
    const performanceScore = Math.round(lighthouseData.categories.performance.score * 100);
    const fcp = parseFloat(lighthouseData.audits['first-contentful-paint'].numericValue);
    const lcp = parseFloat(lighthouseData.audits['largest-contentful-paint'].numericValue);
    const cls = parseFloat(lighthouseData.audits['cumulative-layout-shift'].numericValue);
    const tbt = parseFloat(lighthouseData.audits['total-blocking-time'].numericValue);
    const fid = parseFloat(lighthouseData.audits['max-potential-fid'].numericValue);
    
    console.log('📊 Performance Metrics:');
    console.log(`   Performance Score: ${performanceScore}/100`);
    console.log(`   First Contentful Paint: ${(fcp/1000).toFixed(2)}s`);
    console.log(`   Largest Contentful Paint: ${(lcp/1000).toFixed(2)}s`);
    console.log(`   Cumulative Layout Shift: ${cls.toFixed(3)}`);
    console.log(`   Total Blocking Time: ${tbt.toFixed(0)}ms`);
    console.log(`   Max Potential FID: ${fid.toFixed(0)}ms`);
    
    console.log('\n🎯 Core Web Vitals Targets vs Actual:');
    
    const targets = {
      'Performance Score': { target: 90, actual: performanceScore, unit: '/100' },
      'LCP (Good)': { target: 2500, actual: lcp, unit: 'ms', reverse: true },
      'FID (Good)': { target: 100, actual: fid, unit: 'ms', reverse: true },
      'CLS (Good)': { target: 0.1, actual: cls, unit: '', reverse: true }
    };
    
    let passedTargets = 0;
    const totalTargets = Object.keys(targets).length;
    
    Object.entries(targets).forEach(([metric, data]) => {
      const passed = data.reverse ? 
        data.actual <= data.target : 
        data.actual >= data.target;
      
      const status = passed ? '✅' : '❌';
      const actualDisplay = data.unit === 'ms' && data.actual >= 1000 ? 
        `${(data.actual/1000).toFixed(2)}s` : 
        `${data.actual}${data.unit}`;
      const targetDisplay = data.unit === 'ms' && data.target >= 1000 ? 
        `${(data.target/1000).toFixed(2)}s` : 
        `${data.target}${data.unit}`;
      
      console.log(`   ${status} ${metric}: ${actualDisplay} (target: ${data.reverse ? '≤' : '≥'} ${targetDisplay})`);
      
      if (passed) passedTargets++;
    });
    
    console.log(`\n📊 Overall Core Web Vitals: ${passedTargets}/${totalTargets} targets met`);
    
    // Performance improvement recommendations
    console.log('\n🔧 Performance Improvement Recommendations:');
    
    if (lcp > 2500) {
      console.log('   • Optimize Largest Contentful Paint:');
      console.log('     - Preload hero images');
      console.log('     - Optimize image sizes and formats');
      console.log('     - Reduce server response times');
    }
    
    if (tbt > 300) {
      console.log('   • Reduce Total Blocking Time:');
      console.log('     - Code splitting for JavaScript');
      console.log('     - Remove unused JavaScript');
      console.log('     - Optimize third-party scripts');
    }
    
    if (fcp > 1800) {
      console.log('   • Improve First Contentful Paint:');
      console.log('     - Optimize critical rendering path');
      console.log('     - Inline critical CSS');
      console.log('     - Reduce render-blocking resources');
    }
    
    if (cls > 0.1) {
      console.log('   • Fix Cumulative Layout Shift:');
      console.log('     - Add size attributes to images');
      console.log('     - Reserve space for dynamic content');
      console.log('     - Use CSS aspect-ratio');
    } else {
      console.log('   ✅ Cumulative Layout Shift is within good range');
    }
    
    const overallPassed = passedTargets >= totalTargets * 0.75; // 75% threshold
    
    console.log(`\n${overallPassed ? '🎉' : '❌'} Core Web Vitals Validation: ${overallPassed ? 'PASSED' : 'NEEDS IMPROVEMENT'}`);
    
    return overallPassed;
    
  } catch (error) {
    console.error('❌ Error reading Lighthouse data:', error.message);
    return false;
  }
}

if (require.main === module) {
  const success = validateCoreWebVitals();
  process.exit(success ? 0 : 1);
}

module.exports = { validateCoreWebVitals };