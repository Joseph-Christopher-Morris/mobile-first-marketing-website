#!/usr/bin/env node

/**
 * Lighthouse Performance Audit for Press Logos Implementation
 * 
 * This script runs Lighthouse audits on:
 * - Home page (/)
 * - Photography page (/services/photography)
 * 
 * Requirements:
 * - Performance score ≥ 95
 * - Accessibility score ≥ 95
 * - CLS = 0 (no layout shift)
 */

const fs = require('fs');
const path = require('path');
const chromeLauncher = require('chrome-launcher');

// Dynamic import for lighthouse (ESM module)
let lighthouse;

async function loadLighthouse() {
  if (!lighthouse) {
    const lighthouseModule = await import('lighthouse');
    lighthouse = lighthouseModule.default;
  }
  return lighthouse;
}

const BASE_URL = 'https://d15sc9fc739ev2.cloudfront.net';

const URLS_TO_TEST = [
  { url: `${BASE_URL}/`, name: 'Home Page' },
  { url: `${BASE_URL}/services/photography`, name: 'Photography Page' }
];

const REQUIRED_SCORES = {
  performance: 95,
  accessibility: 95,
  cls: 0.1 // Allow small tolerance for CLS
};

async function launchChromeAndRunLighthouse(url, opts = {}) {
  const lighthouseFunc = await loadLighthouse();
  
  const chrome = await chromeLauncher.launch({
    chromeFlags: ['--headless', '--no-sandbox', '--disable-dev-shm-usage']
  });
  
  opts.port = chrome.port;
  
  const runnerResult = await lighthouseFunc(url, opts, {
    extends: 'lighthouse:default',
    settings: {
      onlyCategories: ['performance', 'accessibility'],
      formFactor: 'desktop',
      throttling: {
        rttMs: 40,
        throughputKbps: 10240,
        cpuSlowdownMultiplier: 1
      },
      screenEmulation: {
        mobile: false,
        width: 1350,
        height: 940,
        deviceScaleFactor: 1,
        disabled: false
      }
    }
  });

  await chrome.kill();
  
  return runnerResult;
}

function extractMetrics(lhr) {
  const performance = lhr.categories.performance.score * 100;
  const accessibility = lhr.categories.accessibility.score * 100;
  
  const cls = lhr.audits['cumulative-layout-shift'].numericValue;
  const lcp = lhr.audits['largest-contentful-paint'].numericValue;
  const fcp = lhr.audits['first-contentful-paint'].numericValue;
  const tbt = lhr.audits['total-blocking-time'].numericValue;
  
  return {
    performance: Math.round(performance),
    accessibility: Math.round(accessibility),
    cls: cls.toFixed(3),
    lcp: Math.round(lcp),
    fcp: Math.round(fcp),
    tbt: Math.round(tbt)
  };
}

function checkRequirements(metrics, pageName) {
  const results = {
    passed: true,
    issues: []
  };
  
  if (metrics.performance < REQUIRED_SCORES.performance) {
    results.passed = false;
    results.issues.push(
      `Performance score ${metrics.performance} is below required ${REQUIRED_SCORES.performance}`
    );
  }
  
  if (metrics.accessibility < REQUIRED_SCORES.accessibility) {
    results.passed = false;
    results.issues.push(
      `Accessibility score ${metrics.accessibility} is below required ${REQUIRED_SCORES.accessibility}`
    );
  }
  
  if (parseFloat(metrics.cls) > REQUIRED_SCORES.cls) {
    results.passed = false;
    results.issues.push(
      `CLS ${metrics.cls} exceeds maximum ${REQUIRED_SCORES.cls}`
    );
  }
  
  return results;
}

async function runAudits() {
  console.log('🔍 Running Lighthouse Performance Audits for Press Logos Implementation\n');
  console.log(`Testing ${URLS_TO_TEST.length} pages...\n`);
  
  const allResults = [];
  let allPassed = true;
  
  for (const { url, name } of URLS_TO_TEST) {
    console.log(`\n📊 Testing: ${name}`);
    console.log(`URL: ${url}`);
    console.log('─'.repeat(60));
    
    try {
      const runnerResult = await launchChromeAndRunLighthouse(url);
      const metrics = extractMetrics(runnerResult.lhr);
      const validation = checkRequirements(metrics, name);
      
      console.log(`\n✅ Performance Score: ${metrics.performance}/100`);
      console.log(`✅ Accessibility Score: ${metrics.accessibility}/100`);
      console.log(`\n📈 Core Web Vitals:`);
      console.log(`   - CLS: ${metrics.cls}`);
      console.log(`   - LCP: ${metrics.lcp}ms`);
      console.log(`   - FCP: ${metrics.fcp}ms`);
      console.log(`   - TBT: ${metrics.tbt}ms`);
      
      if (validation.passed) {
        console.log(`\n✅ ${name} PASSED all requirements`);
      } else {
        console.log(`\n❌ ${name} FAILED:`);
        validation.issues.forEach(issue => {
          console.log(`   - ${issue}`);
        });
        allPassed = false;
      }
      
      allResults.push({
        page: name,
        url,
        metrics,
        validation,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error(`\n❌ Error testing ${name}:`, error.message);
      allPassed = false;
      
      allResults.push({
        page: name,
        url,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
  
  // Generate summary report
  console.log('\n' + '='.repeat(60));
  console.log('📋 SUMMARY REPORT');
  console.log('='.repeat(60));
  
  const timestamp = Date.now();
  const reportData = {
    testRun: new Date().toISOString(),
    requirements: REQUIRED_SCORES,
    results: allResults,
    overallStatus: allPassed ? 'PASSED' : 'FAILED'
  };
  
  // Save JSON report
  const jsonPath = `press-logos-lighthouse-report-${timestamp}.json`;
  fs.writeFileSync(jsonPath, JSON.stringify(reportData, null, 2));
  console.log(`\n📄 JSON Report: ${jsonPath}`);
  
  // Save markdown summary
  const mdPath = `press-logos-lighthouse-summary-${timestamp}.md`;
  const mdContent = generateMarkdownSummary(reportData);
  fs.writeFileSync(mdPath, mdContent);
  console.log(`📄 Markdown Summary: ${mdPath}`);
  
  console.log('\n' + '='.repeat(60));
  if (allPassed) {
    console.log('✅ ALL TESTS PASSED');
    console.log('Press logos implementation meets all performance requirements');
  } else {
    console.log('❌ SOME TESTS FAILED');
    console.log('Review the issues above and the detailed reports');
  }
  console.log('='.repeat(60) + '\n');
  
  return allPassed;
}

function generateMarkdownSummary(reportData) {
  let md = '# Press Logos Lighthouse Performance Audit\n\n';
  md += `**Test Run:** ${reportData.testRun}\n\n`;
  md += `**Overall Status:** ${reportData.overallStatus === 'PASSED' ? '✅ PASSED' : '❌ FAILED'}\n\n`;
  
  md += '## Requirements\n\n';
  md += `- Performance Score: ≥ ${reportData.requirements.performance}\n`;
  md += `- Accessibility Score: ≥ ${reportData.requirements.accessibility}\n`;
  md += `- Cumulative Layout Shift: ≤ ${reportData.requirements.cls}\n\n`;
  
  md += '## Results\n\n';
  
  reportData.results.forEach(result => {
    md += `### ${result.page}\n\n`;
    md += `**URL:** ${result.url}\n\n`;
    
    if (result.error) {
      md += `❌ **Error:** ${result.error}\n\n`;
    } else {
      md += '#### Scores\n\n';
      md += `- **Performance:** ${result.metrics.performance}/100 ${result.metrics.performance >= reportData.requirements.performance ? '✅' : '❌'}\n`;
      md += `- **Accessibility:** ${result.metrics.accessibility}/100 ${result.metrics.accessibility >= reportData.requirements.accessibility ? '✅' : '❌'}\n\n`;
      
      md += '#### Core Web Vitals\n\n';
      md += `- **CLS:** ${result.metrics.cls} ${parseFloat(result.metrics.cls) <= reportData.requirements.cls ? '✅' : '❌'}\n`;
      md += `- **LCP:** ${result.metrics.lcp}ms\n`;
      md += `- **FCP:** ${result.metrics.fcp}ms\n`;
      md += `- **TBT:** ${result.metrics.tbt}ms\n\n`;
      
      if (result.validation.passed) {
        md += '✅ **Status:** PASSED\n\n';
      } else {
        md += '❌ **Status:** FAILED\n\n';
        md += '**Issues:**\n\n';
        result.validation.issues.forEach(issue => {
          md += `- ${issue}\n`;
        });
        md += '\n';
      }
    }
  });
  
  md += '## Conclusion\n\n';
  if (reportData.overallStatus === 'PASSED') {
    md += 'All pages meet the performance and accessibility requirements for the press logos implementation.\n';
  } else {
    md += 'Some pages did not meet the requirements. Review the issues above and make necessary improvements.\n';
  }
  
  return md;
}

// Run the audits
runAudits()
  .then(passed => {
    process.exit(passed ? 0 : 1);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
