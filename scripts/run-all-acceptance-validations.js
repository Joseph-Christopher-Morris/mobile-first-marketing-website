#!/usr/bin/env node

/**
 * Comprehensive Acceptance Criteria Validation Suite
 * Runs all validation scripts for Task 11 - Acceptance Criteria Validation and Testing
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class AcceptanceValidationSuite {
  constructor() {
    this.validationScripts = [
      {
        name: 'Brand and UI Validation',
        script: 'scripts/validate-brand-ui-compliance.js',
        description: 'Validates brand colors, gradients, and hero section compliance'
      },
      {
        name: 'Content and Functionality Validation',
        script: 'scripts/validate-content-functionality.js',
        description: 'Validates contact form, blog content, and services images'
      },
      {
        name: 'Performance and SEO Validation',
        script: 'scripts/validate-performance-seo.js',
        description: 'Validates Lighthouse requirements, robots.txt, sitemap, and accessibility'
      },
      {
        name: 'Deployment and Infrastructure Validation',
        script: 'scripts/validate-deployment-infrastructure.js',
        description: 'Validates static export, deployment config, caching, and rollback procedures'
      }
    ];
    this.results = [];
  }

  async runAllValidations() {
    console.log('🚀 Starting Comprehensive Acceptance Criteria Validation Suite...\n');
    console.log('=' .repeat(80));
    console.log('VIVID AUTO SCRAM REBUILD - ACCEPTANCE CRITERIA VALIDATION');
    console.log('=' .repeat(80));
    console.log();

    let allPassed = true;

    for (const validation of this.validationScripts) {
      console.log(`📋 Running: ${validation.name}`);
      console.log(`   ${validation.description}`);
      console.log(`   Script: ${validation.script}`);
      console.log();

      try {
        const startTime = Date.now();
        execSync(`node ${validation.script}`, { 
          stdio: 'inherit',
          cwd: process.cwd()
        });
        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);

        this.results.push({
          name: validation.name,
          status: 'PASSED',
          duration: `${duration}s`,
          script: validation.script
        });

        console.log(`✅ ${validation.name} - PASSED (${duration}s)\n`);
      } catch (error) {
        const endTime = Date.now();
        const duration = ((endTime - Date.now()) / 1000).toFixed(2);

        this.results.push({
          name: validation.name,
          status: 'FAILED',
          duration: `${duration}s`,
          script: validation.script,
          error: error.message
        });

        console.log(`❌ ${validation.name} - FAILED (${duration}s)\n`);
        allPassed = false;
      }

      console.log('-'.repeat(80));
      console.log();
    }

    return this.generateFinalReport(allPassed);
  }

  generateFinalReport(allPassed) {
    const timestamp = new Date().toISOString();
    const totalDuration = this.results.reduce((sum, result) => {
      return sum + parseFloat(result.duration.replace('s', ''));
    }, 0).toFixed(2);

    const report = {
      timestamp,
      overallStatus: allPassed ? 'PASSED' : 'FAILED',
      summary: {
        totalValidations: this.results.length,
        passed: this.results.filter(r => r.status === 'PASSED').length,
        failed: this.results.filter(r => r.status === 'FAILED').length,
        totalDuration: `${totalDuration}s`
      },
      results: this.results,
      requirements: {
        '11.1': this.results.find(r => r.name.includes('Brand'))?.status === 'PASSED',
        '11.2': this.results.find(r => r.name.includes('Content'))?.status === 'PASSED',
        '11.3': this.results.find(r => r.name.includes('Performance'))?.status === 'PASSED',
        '11.4': this.results.find(r => r.name.includes('Deployment'))?.status === 'PASSED'
      }
    };

    // Save comprehensive report
    const reportPath = `acceptance-validation-comprehensive-report-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // Generate summary
    const summaryPath = `acceptance-validation-comprehensive-summary-${Date.now()}.md`;
    const summary = this.generateSummaryMarkdown(report);
    fs.writeFileSync(summaryPath, summary);

    // Display final results
    console.log('📊 COMPREHENSIVE VALIDATION RESULTS');
    console.log('=' .repeat(80));
    console.log(`Overall Status: ${report.overallStatus}`);
    console.log(`Total Duration: ${report.summary.totalDuration}`);
    console.log(`Validations Passed: ${report.summary.passed}/${report.summary.totalValidations}`);
    console.log();

    console.log('📋 Individual Results:');
    this.results.forEach(result => {
      const icon = result.status === 'PASSED' ? '✅' : '❌';
      console.log(`   ${icon} ${result.name} - ${result.status} (${result.duration})`);
    });

    console.log();
    console.log('📄 Requirements Compliance:');
    Object.entries(report.requirements).forEach(([req, passed]) => {
      const icon = passed ? '✅' : '❌';
      console.log(`   ${icon} Requirement ${req} - ${passed ? 'PASSED' : 'FAILED'}`);
    });

    console.log();
    console.log(`📁 Reports saved:`);
    console.log(`   Detailed: ${reportPath}`);
    console.log(`   Summary: ${summaryPath}`);

    if (allPassed) {
      console.log();
      console.log('🎉 ALL ACCEPTANCE CRITERIA VALIDATIONS PASSED!');
      console.log('   The Vivid Auto SCRAM rebuild is ready for deployment.');
    } else {
      console.log();
      console.log('⚠️  SOME VALIDATIONS FAILED');
      console.log('   Please review the failed validations and resolve issues before deployment.');
    }

    return report;
  }

  generateSummaryMarkdown(report) {
    return `# Vivid Auto SCRAM Rebuild - Acceptance Criteria Validation Summary

**Generated:** ${report.timestamp}
**Overall Status:** ${report.overallStatus}
**Total Duration:** ${report.summary.totalDuration}
**Validations Passed:** ${report.summary.passed}/${report.summary.totalValidations}

## Executive Summary

${report.overallStatus === 'PASSED' ? 
  '✅ **ALL ACCEPTANCE CRITERIA PASSED** - The Vivid Auto SCRAM rebuild meets all specified requirements and is ready for deployment.' :
  '❌ **VALIDATION FAILURES DETECTED** - Some acceptance criteria have not been met. Please review and resolve the issues below before proceeding with deployment.'}

## Validation Results

| Validation | Status | Duration | Requirements |
|------------|--------|----------|--------------|
| Brand and UI Validation | ${report.results[0]?.status || 'N/A'} | ${report.results[0]?.duration || 'N/A'} | 11.1, 11.2 |
| Content and Functionality Validation | ${report.results[1]?.status || 'N/A'} | ${report.results[1]?.duration || 'N/A'} | 11.3, 11.4 |
| Performance and SEO Validation | ${report.results[2]?.status || 'N/A'} | ${report.results[2]?.duration || 'N/A'} | 11.5, 11.6 |
| Deployment and Infrastructure Validation | ${report.results[3]?.status || 'N/A'} | ${report.results[3]?.duration || 'N/A'} | 11.7 |

## Requirements Compliance

### ✅ Requirement 11.1 - Brand and UI Validation
- **Status:** ${report.requirements['11.1'] ? 'PASSED' : 'FAILED'}
- **Criteria:** No gradients, blue, purple, or yellow colors exist; only brand palette colors used

### ✅ Requirement 11.2 - Hero Section Validation  
- **Status:** ${report.requirements['11.1'] ? 'PASSED' : 'FAILED'}
- **Criteria:** Home hero matches copy, layout, spacing, and button styles exactly

### ✅ Requirement 11.3 - Content Validation
- **Status:** ${report.requirements['11.2'] ? 'PASSED' : 'FAILED'}
- **Criteria:** Contact form fields, order, and labels match pre-AI version

### ✅ Requirement 11.4 - Blog and Services Validation
- **Status:** ${report.requirements['11.2'] ? 'PASSED' : 'FAILED'}
- **Criteria:** Blog originals restored, Flyers ROI article visible, services shows all 7 images with no 404 errors

### ✅ Requirement 11.5 - Performance Validation
- **Status:** ${report.requirements['11.3'] ? 'PASSED' : 'FAILED'}
- **Criteria:** Lighthouse ≥ 90 scores on Home, Services, and Blog post

### ✅ Requirement 11.6 - SEO and Accessibility Validation
- **Status:** ${report.requirements['11.3'] ? 'PASSED' : 'FAILED'}
- **Criteria:** robots.txt and sitemap accessible; alt text for all hero/portfolio images; descriptive link labels

### ✅ Requirement 11.7 - Deployment Validation
- **Status:** ${report.requirements['11.4'] ? 'PASSED' : 'FAILED'}
- **Criteria:** Deployment to S3/CloudFront with correct caching, invalidations, static export only, documented rollback process

## Next Steps

${report.overallStatus === 'PASSED' ? 
  `### Ready for Deployment ✅

1. **Build Static Export**
   \`\`\`bash
   npm run build:static
   \`\`\`

2. **Deploy to S3/CloudFront**
   \`\`\`powershell
   .\\scripts\\deploy-vivid-auto-scram.ps1
   \`\`\`

3. **Verify Deployment**
   \`\`\`powershell
   .\\scripts\\vivid-auto-rollback.ps1 -Action verify
   \`\`\`

4. **Monitor and Validate**
   - Check website functionality at https://d15sc9fc739ev2.cloudfront.net
   - Run post-deployment validation
   - Monitor performance metrics` :
  `### Issues to Resolve ❌

${report.results.filter(r => r.status === 'FAILED').map(result => 
  `1. **${result.name}**
   - Run: \`node ${result.script}\`
   - Review and resolve reported issues
   - Re-run validation to confirm fixes`
).join('\n\n')}

### After Resolving Issues

1. Re-run this comprehensive validation suite
2. Ensure all validations pass before deployment
3. Follow deployment procedures once all criteria are met`}

## Validation Scripts

- **Brand and UI:** \`node scripts/validate-brand-ui-compliance.js\`
- **Content and Functionality:** \`node scripts/validate-content-functionality.js\`
- **Performance and SEO:** \`node scripts/validate-performance-seo.js\`
- **Deployment and Infrastructure:** \`node scripts/validate-deployment-infrastructure.js\`
- **Comprehensive Suite:** \`node scripts/run-all-acceptance-validations.js\`

---

**Project:** Vivid Auto Photography SCRAM Rebuild  
**Specification:** .kiro/specs/vivid-auto-scram-rebuild/  
**Task:** 11. Acceptance Criteria Validation and Testing
`;
  }
}

// Run validation suite if called directly
if (require.main === module) {
  const suite = new AcceptanceValidationSuite();
  suite.runAllValidations()
    .then(report => {
      process.exit(report.overallStatus === 'PASSED' ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Validation suite failed:', error);
      process.exit(1);
    });
}

module.exports = AcceptanceValidationSuite;