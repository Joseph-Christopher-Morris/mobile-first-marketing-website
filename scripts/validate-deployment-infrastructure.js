#!/usr/bin/env node

/**
 * Deployment and Infrastructure Validation Script
 * Validates S3/CloudFront deployment, static export, caching, and rollback procedures
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class DeploymentInfrastructureValidator {
  constructor() {
    this.results = {
      staticExportValidation: { passed: false, issues: [] },
      deploymentConfigValidation: { passed: false, issues: [] },
      cachingValidation: { passed: false, issues: [] },
      rollbackValidation: { passed: false, issues: [] }
    };
    this.srcDir = path.join(process.cwd(), 'src');
    this.publicDir = path.join(process.cwd(), 'public');
  }

  // Validate static export configuration
  validateStaticExport() {
    console.log('📦 Validating static export configuration...');
    
    const issues = [];
    
    // Check next.config.js for static export
    const nextConfigFile = path.join(process.cwd(), 'next.config.js');
    if (!fs.existsSync(nextConfigFile)) {
      issues.push({
        issue: 'next.config.js file not found',
        file: 'next.config.js'
      });
    } else {
      const content = fs.readFileSync(nextConfigFile, 'utf8');
      
      // Check for required static export configuration
      const requiredConfigs = [
        { pattern: /output:\s*['"]export['"]/, name: 'Static export output configuration' },
        { pattern: /images:\s*{[\s\S]*?unoptimized:\s*true/, name: 'Image unoptimized for static export' }
      ];

      requiredConfigs.forEach(config => {
        if (!config.pattern.test(content)) {
          issues.push({
            issue: `Missing configuration: ${config.name}`,
            file: 'next.config.js'
          });
        }
      });

      // Check for server-side features that shouldn't be used
      const prohibitedFeatures = [
        { pattern: /getServerSideProps/, name: 'getServerSideProps (not compatible with static export)' },
        { pattern: /api\//, name: 'API routes (not compatible with static export)' },
        { pattern: /middleware/, name: 'Middleware (not compatible with static export)' }
      ];

      prohibitedFeatures.forEach(feature => {
        if (feature.pattern.test(content)) {
          issues.push({
            issue: `Prohibited server feature found: ${feature.name}`,
            file: 'next.config.js'
          });
        }
      });
    }

    // Check package.json for build:static script
    const packageJsonFile = path.join(process.cwd(), 'package.json');
    if (fs.existsSync(packageJsonFile)) {
      const content = fs.readFileSync(packageJsonFile, 'utf8');
      const packageJson = JSON.parse(content);
      
      if (!packageJson.scripts || !packageJson.scripts['build:static']) {
        issues.push({
          issue: 'Missing build:static script in package.json',
          file: 'package.json'
        });
      } else {
        const buildScript = packageJson.scripts['build:static'];
        if (!buildScript.includes('npm run build') || !buildScript.includes('npm run export')) {
          issues.push({
            issue: 'build:static script should include "npm run build && npm run export"',
            file: 'package.json'
          });
        }
      }
    }

    // Check if static build can be created
    const outDir = path.join(process.cwd(), 'out');
    if (!fs.existsSync(outDir)) {
      issues.push({
        issue: 'Static build output directory not found. Run "npm run build:static" to generate',
        file: 'out/',
        severity: 'warning'
      });
    } else {
      // Check for essential files in build output
      const essentialFiles = ['index.html', '_next'];
      essentialFiles.forEach(file => {
        const filePath = path.join(outDir, file);
        if (!fs.existsSync(filePath)) {
          issues.push({
            issue: `Missing essential file in build output: ${file}`,
            file: `out/${file}`
          });
        }
      });
    }

    this.results.staticExportValidation = {
      passed: issues.filter(i => i.severity !== 'warning').length === 0,
      issues
    };

    if (issues.length === 0) {
      console.log('✅ Static export validation passed');
    } else {
      console.log(`❌ Found ${issues.length} static export issue(s)`);
      issues.forEach(issue => {
        const icon = issue.severity === 'warning' ? '⚠️' : '❌';
        console.log(`   ${icon} ${issue.file} - ${issue.issue}`);
      });
    }
  }

  // Validate deployment configuration
  validateDeploymentConfig() {
    console.log('🚀 Validating deployment configuration...');
    
    const issues = [];
    
    // Check for deployment scripts
    const deploymentScripts = [
      'scripts/deploy-vivid-auto-scram.ps1',
      'scripts/deploy-with-differentiated-caching.ps1',
      'scripts/cloudfront-invalidation-vivid-auto.js'
    ];

    deploymentScripts.forEach(scriptPath => {
      if (!fs.existsSync(scriptPath)) {
        issues.push({
          issue: `Deployment script not found: ${scriptPath}`,
          file: scriptPath
        });
      } else {
        const content = fs.readFileSync(scriptPath, 'utf8');
        
        // Check for required S3/CloudFront configuration based on file type
        if (scriptPath.includes('cloudfront')) {
          // CloudFront scripts should have distribution ID
          if (!content.includes('E2IBMHQ3GCW6ZK')) {
            issues.push({
              issue: `Missing CloudFront distribution ID in ${scriptPath}`,
              file: scriptPath
            });
          }
        }
        
        if (scriptPath.includes('deploy') || scriptPath.includes('s3')) {
          // S3 deployment scripts should have bucket name
          if (!content.includes('mobile-marketing-site-prod-1759705011281-tyzuo9')) {
            issues.push({
              issue: `Missing S3 bucket name in ${scriptPath}`,
              file: scriptPath
            });
          }
        }
      }
    });

    // Check for AWS CLI availability (simulated)
    try {
      // This would normally check if AWS CLI is available
      // execSync('aws --version', { stdio: 'ignore' });
      console.log('   AWS CLI availability check skipped (would require actual AWS setup)');
    } catch (error) {
      issues.push({
        issue: 'AWS CLI not available or not configured',
        file: 'System configuration',
        severity: 'warning'
      });
    }

    this.results.deploymentConfigValidation = {
      passed: issues.filter(i => i.severity !== 'warning').length === 0,
      issues
    };

    if (issues.length === 0) {
      console.log('✅ Deployment configuration validation passed');
    } else {
      console.log(`❌ Found ${issues.length} deployment configuration issue(s)`);
      issues.forEach(issue => {
        const icon = issue.severity === 'warning' ? '⚠️' : '❌';
        console.log(`   ${icon} ${issue.file} - ${issue.issue}`);
      });
    }
  }

  // Validate caching configuration
  validateCaching() {
    console.log('💾 Validating caching configuration...');
    
    const issues = [];
    
    // Check for caching strategy scripts
    const cachingScripts = [
      'scripts/configure-s3-caching.js',
      'scripts/cloudfront-invalidation-strategy.js',
      'scripts/deploy-with-caching-strategy.js'
    ];

    cachingScripts.forEach(scriptPath => {
      if (!fs.existsSync(scriptPath)) {
        issues.push({
          issue: `Caching script not found: ${scriptPath}`,
          file: scriptPath
        });
      } else {
        const content = fs.readFileSync(scriptPath, 'utf8');
        
        // Check for differentiated caching strategy
        const cachingElements = [
          { pattern: /max-age=600/, name: 'HTML files short cache (600s)' },
          { pattern: /max-age=31536000/, name: 'Static assets long cache (1 year)' },
          { pattern: /immutable/, name: 'Immutable cache directive for assets' }
        ];

        cachingElements.forEach(element => {
          if (!element.pattern.test(content)) {
            issues.push({
              issue: `Missing caching configuration in ${scriptPath}: ${element.name}`,
              file: scriptPath
            });
          }
        });
      }
    });

    // Check for CloudFront invalidation paths
    const invalidationScript = 'scripts/cloudfront-invalidation-vivid-auto.js';
    if (fs.existsSync(invalidationScript)) {
      const content = fs.readFileSync(invalidationScript, 'utf8');
      
      const requiredPaths = [
        '/',
        '/index.html',
        '/services/*',
        '/blog*',
        '/images/*',
        '/sitemap.xml',
        '/_next/*'
      ];

      requiredPaths.forEach(pathPattern => {
        if (!content.includes(pathPattern)) {
          issues.push({
            issue: `Missing invalidation path: ${pathPattern}`,
            file: invalidationScript
          });
        }
      });
    }

    this.results.cachingValidation = {
      passed: issues.length === 0,
      issues
    };

    if (issues.length === 0) {
      console.log('✅ Caching validation passed');
    } else {
      console.log(`❌ Found ${issues.length} caching issue(s)`);
      issues.forEach(issue => {
        console.log(`   ${issue.file} - ${issue.issue}`);
      });
    }
  }

  // Validate rollback procedures
  validateRollback() {
    console.log('🔄 Validating rollback procedures...');
    
    const issues = [];
    
    // Check for rollback documentation
    const rollbackDocs = [
      'docs/vivid-auto-rollback-procedures.md',
      'docs/vivid-auto-operational-runbook-template.md'
    ];

    rollbackDocs.forEach(docPath => {
      if (!fs.existsSync(docPath)) {
        issues.push({
          issue: `Rollback documentation not found: ${docPath}`,
          file: docPath
        });
      } else {
        const content = fs.readFileSync(docPath, 'utf8');
        
        // Check for required rollback procedures (either direct AWS CLI or script-based)
        const rollbackElements = [
          { 
            pattern: /s3api list-object-versions|list-versions/, 
            name: 'S3 version listing command' 
          },
          { 
            pattern: /s3api copy-object|copy-object|rollback.*-File|Action rollback/, 
            name: 'S3 version restoration command' 
          },
          { 
            pattern: /cloudfront create-invalidation|invalidation|Action verify/, 
            name: 'CloudFront invalidation command' 
          },
          { 
            pattern: /version-?id|VersionId/i, 
            name: 'Version ID handling' 
          }
        ];

        rollbackElements.forEach(element => {
          if (!element.pattern.test(content)) {
            issues.push({
              issue: `Missing rollback procedure in ${docPath}: ${element.name}`,
              file: docPath
            });
          }
        });
      }
    });

    // Check for rollback scripts
    const rollbackScripts = [
      'scripts/vivid-auto-rollback.ps1',
      'scripts/vivid-auto-deployment-logger.js',
      'scripts/vivid-auto-version-tracker.ps1'
    ];

    rollbackScripts.forEach(scriptPath => {
      if (!fs.existsSync(scriptPath)) {
        issues.push({
          issue: `Rollback script not found: ${scriptPath}`,
          file: scriptPath
        });
      } else {
        const content = fs.readFileSync(scriptPath, 'utf8');
        
        // Check for version management functionality
        if (!content.includes('version') && !content.includes('rollback')) {
          issues.push({
            issue: `Script ${scriptPath} doesn't appear to handle versioning or rollback`,
            file: scriptPath
          });
        }
      }
    });

    this.results.rollbackValidation = {
      passed: issues.length === 0,
      issues
    };

    if (issues.length === 0) {
      console.log('✅ Rollback validation passed');
    } else {
      console.log(`❌ Found ${issues.length} rollback issue(s)`);
      issues.forEach(issue => {
        console.log(`   ${issue.file} - ${issue.issue}`);
      });
    }
  }

  // Generate validation report
  generateReport() {
    const timestamp = new Date().toISOString();
    const report = {
      timestamp,
      summary: {
        totalChecks: 4,
        passed: Object.values(this.results).filter(r => r.passed).length,
        failed: Object.values(this.results).filter(r => !r.passed).length
      },
      results: this.results,
      overallStatus: Object.values(this.results).every(r => r.passed) ? 'PASSED' : 'FAILED'
    };

    // Save detailed report
    const reportPath = `deployment-infrastructure-validation-report-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // Generate summary
    const summaryPath = `deployment-infrastructure-validation-summary-${Date.now()}.md`;
    const summary = this.generateSummaryMarkdown(report);
    fs.writeFileSync(summaryPath, summary);

    console.log('\n📊 VALIDATION SUMMARY');
    console.log('='.repeat(50));
    console.log(`Overall Status: ${report.overallStatus}`);
    console.log(`Checks Passed: ${report.summary.passed}/${report.summary.totalChecks}`);
    console.log(`Report saved: ${reportPath}`);
    console.log(`Summary saved: ${summaryPath}`);

    return report;
  }

  // Generate markdown summary
  generateSummaryMarkdown(report) {
    return `# Deployment and Infrastructure Validation Summary

**Generated:** ${report.timestamp}
**Overall Status:** ${report.overallStatus}
**Checks Passed:** ${report.summary.passed}/${report.summary.totalChecks}

## Validation Results

### 📦 Static Export Validation
- **Status:** ${report.results.staticExportValidation.passed ? 'PASSED' : 'FAILED'}
- **Issues:** ${report.results.staticExportValidation.issues.length}

### 🚀 Deployment Configuration Validation  
- **Status:** ${report.results.deploymentConfigValidation.passed ? 'PASSED' : 'FAILED'}
- **Issues:** ${report.results.deploymentConfigValidation.issues.length}

### 💾 Caching Validation
- **Status:** ${report.results.cachingValidation.passed ? 'PASSED' : 'FAILED'}  
- **Issues:** ${report.results.cachingValidation.issues.length}

### 🔄 Rollback Validation
- **Status:** ${report.results.rollbackValidation.passed ? 'PASSED' : 'FAILED'}
- **Issues:** ${report.results.rollbackValidation.issues.length}

## Issues Found

${Object.entries(report.results).map(([key, result]) => {
  if (result.issues.length === 0) return '';
  return `### ${key}\n${result.issues.map(issue => 
    `- **${issue.file}** - ${issue.issue}`
  ).join('\n')}`;
}).filter(Boolean).join('\n\n')}

## Requirements Validation

- **Requirement 11.7:** ${report.overallStatus === 'PASSED' ? '✅ PASSED' : '❌ FAILED'} - Deployment to S3/CloudFront with correct caching, invalidations, static export only, and documented rollback process

## Deployment Readiness

${report.overallStatus === 'PASSED' ? 
  '✅ **READY FOR DEPLOYMENT** - All infrastructure and deployment validations passed' : 
  '❌ **NOT READY** - Please resolve the issues above before deploying'}

## Next Steps

${report.overallStatus === 'PASSED' ? 
  '1. Run `npm run build:static` to generate the static build\n2. Execute deployment scripts to deploy to S3/CloudFront\n3. Verify deployment with post-deployment validation\n4. Test rollback procedures if needed' : 
  '1. Resolve all validation issues listed above\n2. Re-run this validation script\n3. Proceed with deployment once all checks pass'}
`;
  }

  // Run all validations
  async runAllValidations() {
    console.log('🚀 Starting Deployment and Infrastructure Validation...\n');
    
    this.validateStaticExport();
    this.validateDeploymentConfig();
    this.validateCaching();
    this.validateRollback();
    
    return this.generateReport();
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new DeploymentInfrastructureValidator();
  validator.runAllValidations()
    .then(report => {
      process.exit(report.overallStatus === 'PASSED' ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Validation failed:', error);
      process.exit(1);
    });
}

module.exports = DeploymentInfrastructureValidator;