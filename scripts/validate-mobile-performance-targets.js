#!/usr/bin/env node

/**
 * Mobile Performance Validation Script
 * Validates performance targets for CI/CD pipeline
 */

const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

const PERFORMANCE_TARGETS = {
  performance: 100,
  lcp: 1.8, // seconds
  cls: 0.00,
  tbt: 50, // milliseconds
  si: 3.5 // seconds
};

const SITE_URL = process.env.SITE_URL || 'https://d15sc9fc739ev2.cloudfront.net';

async function validateMobilePerformance() {
  console.log('🚀 Validating mobile performance targets...');
  console.log(`   Site URL: ${SITE_URL}`);
  console.log('   Device: Mobile (Moto G Power)');
  console.log('   Network: Slow 4G');
  
  let chrome;
  
  try {
    // Launch Chrome
    chrome = await chromeLauncher.launch({
      chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu']
    });
    
    // Run Lighthouse audit
    console.log('\n📊 Running Lighthouse audit...');
    const options = {
      logLevel: 'info',
      output: 'json',
      onlyCategories: ['performance'],
      port: chrome.port,
      formFactor: 'mobile',
      throttling: {
        rttMs: 150,
        throughputKbps: 1638.4,
        cpuSlowdownMultiplier: 4
      }
    };
    
    const runnerResult = await lighthouse(SITE_URL, options);
    const report = runnerResult.lhr;
    
    // Extract metrics
    const metrics = {
      performance: Math.round(report.categories.performance.score * 100),
      lcp: report.audits['largest-contentful-paint'].numericValue / 1000,
      cls: report.audits['cumulative-layout-shift'].numericValue,
      tbt: report.audits['total-blocking-time'].numericValue,
      si: report.audits['speed-index'].numericValue / 1000
    };
    
    console.log('\n📋 Performance Results:');
    console.log(`   Performance Score: ${metrics.performance}/100`);
    console.log(`   LCP: ${metrics.lcp.toFixed(2)}s`);
    console.log(`   CLS: ${metrics.cls.toFixed(2)}`);
    console.log(`   TBT: ${metrics.tbt}ms`);
    console.log(`   SI: ${metrics.si.toFixed(2)}s`);
    
    // Validate against targets
    const results = validateTargets(metrics);
    
    if (results.passed) {
      console.log('\n✅ All performance targets met!');
      process.exit(0);
    } else {
      console.log('\n❌ Performance targets not met:');
      results.failures.forEach(failure => {
        console.log(`   ${failure}`);
      });
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Error running performance validation:', error.message);
    process.exit(1);
  } finally {
    if (chrome) {
      await chrome.kill();
    }
  }
}

function validateTargets(metrics) {
  const failures = [];
  
  if (metrics.performance < PERFORMANCE_TARGETS.performance) {
    failures.push(`Performance: ${metrics.performance} < ${PERFORMANCE_TARGETS.performance}`);
  }
  
  if (metrics.lcp > PERFORMANCE_TARGETS.lcp) {
    failures.push(`LCP: ${metrics.lcp.toFixed(2)}s > ${PERFORMANCE_TARGETS.lcp}s`);
  }
  
  if (metrics.cls > PERFORMANCE_TARGETS.cls) {
    failures.push(`CLS: ${metrics.cls.toFixed(2)} > ${PERFORMANCE_TARGETS.cls}`);
  }
  
  if (metrics.tbt > PERFORMANCE_TARGETS.tbt) {
    failures.push(`TBT: ${metrics.tbt}ms > ${PERFORMANCE_TARGETS.tbt}ms`);
  }
  
  if (metrics.si > PERFORMANCE_TARGETS.si) {
    failures.push(`SI: ${metrics.si.toFixed(2)}s > ${PERFORMANCE_TARGETS.si}s`);
  }
  
  return {
    passed: failures.length === 0,
    failures
  };
}

// Run validation
validateMobilePerformance().catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});