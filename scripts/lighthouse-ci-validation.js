#!/usr/bin/env node

/**
 * Lighthouse CI Validation Script for SCRAM Final Deployment
 * 
 * Validates Lighthouse CI results against SCRAM requirements:
 * - Home page ≥ 90 scores for performance, accessibility, SEO, and best practices
 * - Services page ≥ 90 scores for performance, accessibility, SEO, and best practices  
 * - Blog page ≥ 90 scores for performance, accessibility, SEO, and best practices
 * 
 * Requirements: 9.1
 */

const fs = require('fs');
const path = require('path');

function validateLighthouseCIResults() {
  console.log('🔍 Validating Lighthouse CI Results for SCRAM Final Deployment...\n');

  // Check if .lighthouseci directory exists
  const lhciDir = path.join(process.cwd(), '.lighthouseci');
  if (!fs.existsSync(lhciDir)) {
    console.error('❌ .lighthouseci directory not found. Run "npm run lighthouse:ci" first.');
    return false;
  }

  // Find manifest.json file
  const manifestPath = path.join(lhciDir, 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    console.error('❌ Lighthouse CI manifest.json not found');
    return false;
  }

  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    
    console.log('📊 LIGHTHOUSE CI VALIDATION RESULTS');
    console.log('====================================');
    console.log(`Audit Timestamp: ${new Date().toLocaleString()}`);
    console.log(`Total Reports: ${manifest.length}`);
    
    const targetScore = 90;
    const requiredPages = [
      'https://d15sc9fc739ev2.cloudfront.net/',
      'https://d15sc9fc739ev2.cloudfront.net/services/',
      'https://d15sc9fc739ev2.cloudfront.net/blog/'
    ];
    
    const results = [];
    let allPagesPass = true;
    
    console.log('\n🎯 PAGE VALIDATION RESULTS');
    console.log('===========================');
    
    for (const page of requiredPages) {
      const pageReports = manifest.filter(report => report.url === page);
      
      if (pageReports.length === 0) {
        console.log(`❌ ${page}: No reports found`);
        allPagesPass = false;
        continue;
      }
      
      // Get the latest report for this page
      const latestReport = pageReports[pageReports.length - 1];
      const reportPath = path.join(lhciDir, latestReport.jsonPath);
      
      if (!fs.existsSync(reportPath)) {
        console.log(`❌ ${page}: Report file not found`);
        allPagesPass = false;
        continue;
      }
      
      const reportData = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
      const categories = reportData.categories;
      
      const scores = {
        performance: Math.round(categories.performance.score * 100),
        accessibility: Math.round(categories.accessibility.score * 100),
        'best-practices': Math.round(categories['best-practices'].score * 100),
        seo: Math.round(categories.seo.score * 100)
      };
      
      const pagePass = Object.values(scores).every(score => score >= targetScore);
      const status = pagePass ? '✅' : '❌';
      
      console.log(`${status} ${page}:`);
      console.log(`   Performance: ${scores.performance}/100 ${scores.performance >= targetScore ? '✅' : '❌'}`);
      console.log(`   Accessibility: ${scores.accessibility}/100 ${scores.accessibility >= targetScore ? '✅' : '❌'}`);
      console.log(`   Best Practices: ${scores['best-practices']}/100 ${scores['best-practices'] >= targetScore ? '✅' : '❌'}`);
      console.log(`   SEO: ${scores.seo}/100 ${scores.seo >= targetScore ? '✅' : '❌'}`);
      
      results.push({
        url: page,
        scores,
        pass: pagePass
      });
      
      if (!pagePass) {
        allPagesPass = false;
      }
    }
    
    console.log('\n📈 OVERALL VALIDATION SUMMARY');
    console.log('==============================');
    
    const passingPages = results.filter(r => r.pass).length;
    console.log(`Pages meeting all targets (≥90): ${passingPages}/${results.length}`);
    
    if (allPagesPass) {
      console.log('🎉 ALL PAGES MEET LIGHTHOUSE REQUIREMENTS!');
      console.log('✅ Home page: All scores ≥ 90');
      console.log('✅ Services page: All scores ≥ 90');
      console.log('✅ Blog page: All scores ≥ 90');
    } else {
      console.log('❌ Some pages do not meet the ≥90 score requirement');
      
      const failingPages = results.filter(r => !r.pass);
      failingPages.forEach(page => {
        console.log(`⚠️  ${page.url}: Needs improvement`);
        Object.entries(page.scores).forEach(([category, score]) => {
          if (score < targetScore) {
            console.log(`   - ${category}: ${score}/100 (needs ${targetScore - score} more points)`);
          }
        });
      });
    }
    
    console.log('\n📁 GENERATED REPORTS');
    console.log('====================');
    console.log(`📊 Lighthouse CI Reports: .lighthouseci/`);
    console.log(`📄 Manifest: .lighthouseci/manifest.json`);
    console.log(`🌐 HTML Reports: ${manifest.length} detailed reports`);
    
    console.log('\n✅ SCRAM REQUIREMENT 9.1 STATUS');
    console.log('=================================');
    if (allPagesPass) {
      console.log('✅ Lighthouse CI validation for Home, Services page, and Blog post: PASSED');
      console.log('✅ Target ≥ 90 scores for performance, accessibility, SEO, and best practices: ACHIEVED');
      console.log('✅ Validation configured to run after deployment: IMPLEMENTED');
      console.log('\n🎯 TASK 7.3: SUCCESSFULLY COMPLETED');
    } else {
      console.log('❌ Lighthouse CI validation: FAILED');
      console.log('❌ Some pages do not meet ≥ 90 score requirements');
      console.log('\n⚠️  TASK 7.3: NEEDS IMPROVEMENT');
    }
    
    return allPagesPass;

  } catch (error) {
    console.error('❌ Error reading Lighthouse CI results:', error.message);
    return false;
  }
}

// Run validation
if (require.main === module) {
  const success = validateLighthouseCIResults();
  process.exit(success ? 0 : 1);
}

module.exports = validateLighthouseCIResults;