#!/usr/bin/env node

/**
 * Validate Build Consistency
 * 
 * This script validates that builds work identically in local and CI-like environments
 * by testing different environment configurations and build scenarios.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');

class BuildConsistencyValidator {
  constructor() {
    this.results = {
      localBuild: { status: 'pending', details: [] },
      ciBuild: { status: 'pending', details: [] },
      buildArtifacts: { status: 'pending', details: [] },
      environmentConsistency: { status: 'pending', details: [] }
    };
    this.buildOutputs = {};
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : type === 'success' ? '✅' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  cleanBuildDirectory() {
    this.log('Cleaning build directories...');
    
    try {
      if (fs.existsSync('.next')) {
        execSync('rmdir /s /q .next', { stdio: 'pipe' });
      }
      if (fs.existsSync('out')) {
        execSync('rmdir /s /q out', { stdio: 'pipe' });
      }
      this.log('Build directories cleaned', 'success');
    } catch (error) {
      this.log(`Error cleaning build directories: ${error.message}`, 'warning');
    }
  }

  async testLocalBuild() {
    this.log('Testing local development build...', 'info');
    
    try {
      this.cleanBuildDirectory();
      
      // Test local build with development environment
      const startTime = Date.now();
      
      execSync('npm run build', {
        stdio: 'pipe',
        env: {
          ...process.env,
          NODE_ENV: 'development'
        }
      });
      
      const buildTime = Date.now() - startTime;
      
      // Check build artifacts
      const artifacts = this.analyzeBuildArtifacts('local');
      
      this.results.localBuild.status = 'pass';
      this.results.localBuild.details.push(`Build completed in ${buildTime}ms`);
      this.results.localBuild.details.push(`Generated ${artifacts.fileCount} files`);
      this.results.localBuild.details.push(`Total size: ${artifacts.totalSize} bytes`);
      
      this.buildOutputs.local = artifacts;
      this.log('Local build test passed', 'success');
      
    } catch (error) {
      this.results.localBuild.status = 'fail';
      this.results.localBuild.details.push(`Build failed: ${error.message}`);
      this.log(`Local build test failed: ${error.message}`, 'error');
    }
  }

  async testCIBuild() {
    this.log('Testing CI-like build...', 'info');
    
    try {
      this.cleanBuildDirectory();
      
      // Test CI build with production environment
      const startTime = Date.now();
      
      execSync('npm run build', {
        stdio: 'pipe',
        env: {
          ...process.env,
          CI: 'true',
          NEXT_TELEMETRY_DISABLED: '1',
          NODE_ENV: 'production'
        }
      });
      
      const buildTime = Date.now() - startTime;
      
      // Check build artifacts
      const artifacts = this.analyzeBuildArtifacts('ci');
      
      this.results.ciBuild.status = 'pass';
      this.results.ciBuild.details.push(`Build completed in ${buildTime}ms`);
      this.results.ciBuild.details.push(`Generated ${artifacts.fileCount} files`);
      this.results.ciBuild.details.push(`Total size: ${artifacts.totalSize} bytes`);
      
      this.buildOutputs.ci = artifacts;
      this.log('CI build test passed', 'success');
      
    } catch (error) {
      this.results.ciBuild.status = 'fail';
      this.results.ciBuild.details.push(`Build failed: ${error.message}`);
      this.log(`CI build test failed: ${error.message}`, 'error');
    }
  }

  analyzeBuildArtifacts(buildType) {
    const buildDir = '.next';
    const artifacts = {
      fileCount: 0,
      totalSize: 0,
      files: [],
      hash: null
    };
    
    if (!fs.existsSync(buildDir)) {
      return artifacts;
    }
    
    const walkDir = (dir) => {
      const files = fs.readdirSync(dir);
      
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          walkDir(filePath);
        } else {
          artifacts.fileCount++;
          artifacts.totalSize += stat.size;
          artifacts.files.push({
            path: filePath,
            size: stat.size,
            modified: stat.mtime
          });
        }
      }
    };
    
    walkDir(buildDir);
    
    // Generate hash of build structure for comparison
    const fileList = artifacts.files
      .map(f => `${f.path}:${f.size}`)
      .sort()
      .join('\n');
    
    artifacts.hash = crypto.createHash('md5').update(fileList).digest('hex');
    
    return artifacts;
  }

  async compareBuildArtifacts() {
    this.log('Comparing build artifacts...', 'info');
    
    try {
      const local = this.buildOutputs.local;
      const ci = this.buildOutputs.ci;
      
      if (!local || !ci) {
        this.results.buildArtifacts.status = 'fail';
        this.results.buildArtifacts.details.push('Missing build outputs for comparison');
        this.log('Cannot compare builds - missing outputs', 'error');
        return;
      }
      
      // Compare file counts
      const fileCountDiff = Math.abs(local.fileCount - ci.fileCount);
      this.results.buildArtifacts.details.push(`Local files: ${local.fileCount}, CI files: ${ci.fileCount}`);
      
      // Compare total sizes
      const sizeDiff = Math.abs(local.totalSize - ci.totalSize);
      const sizePercentDiff = (sizeDiff / Math.max(local.totalSize, ci.totalSize)) * 100;
      this.results.buildArtifacts.details.push(`Size difference: ${sizeDiff} bytes (${sizePercentDiff.toFixed(2)}%)`);
      
      // Compare structure hashes
      const structureMatch = local.hash === ci.hash;
      this.results.buildArtifacts.details.push(`Structure hash match: ${structureMatch}`);
      
      // Determine overall status
      if (fileCountDiff === 0 && sizePercentDiff < 5 && structureMatch) {
        this.results.buildArtifacts.status = 'pass';
        this.log('Build artifacts are consistent', 'success');
      } else if (fileCountDiff <= 2 && sizePercentDiff < 10) {
        this.results.buildArtifacts.status = 'warning';
        this.log('Build artifacts have minor differences', 'warning');
      } else {
        this.results.buildArtifacts.status = 'fail';
        this.log('Build artifacts have significant differences', 'error');
      }
      
    } catch (error) {
      this.results.buildArtifacts.status = 'error';
      this.results.buildArtifacts.details.push(`Comparison failed: ${error.message}`);
      this.log(`Build artifact comparison failed: ${error.message}`, 'error');
    }
  }

  async testEnvironmentConsistency() {
    this.log('Testing environment consistency...', 'info');
    
    try {
      // Check Node.js version
      const nodeVersion = process.version;
      this.results.environmentConsistency.details.push(`Node.js version: ${nodeVersion}`);
      
      // Check npm version
      const npmVersion = execSync('npm -v', { encoding: 'utf8' }).trim();
      this.results.environmentConsistency.details.push(`npm version: ${npmVersion}`);
      
      // Check package.json engines
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const nodeRequirement = packageJson.engines?.node;
      const npmRequirement = packageJson.engines?.npm;
      
      this.results.environmentConsistency.details.push(`Required Node.js: ${nodeRequirement}`);
      this.results.environmentConsistency.details.push(`Required npm: ${npmRequirement}`);
      
      // Check CI workflow configuration
      const workflowPath = '.github/workflows/quality-check.yml';
      if (fs.existsSync(workflowPath)) {
        const workflowContent = fs.readFileSync(workflowPath, 'utf8');
        const ciNodeMatch = workflowContent.match(/node-version:\s*['"]?([^'"\\s]+)['"]?/);
        if (ciNodeMatch) {
          const ciNodeVersion = ciNodeMatch[1];
          this.results.environmentConsistency.details.push(`CI Node.js version: ${ciNodeVersion}`);
          
          // Check consistency
          const localMajor = parseInt(nodeVersion.slice(1).split('.')[0]);
          const ciMajor = parseInt(ciNodeVersion.split('.')[0]);
          
          if (localMajor === ciMajor) {
            this.results.environmentConsistency.status = 'pass';
            this.log('Environment versions are consistent', 'success');
          } else {
            this.results.environmentConsistency.status = 'warning';
            this.log(`Version mismatch: local ${nodeVersion} vs CI v${ciNodeVersion}`, 'warning');
          }
        }
      }
      
      // Test dependency resolution
      try {
        execSync('npm ls --depth=0', { stdio: 'pipe' });
        this.results.environmentConsistency.details.push('Dependency tree is consistent');
      } catch (error) {
        this.results.environmentConsistency.details.push('Dependency tree has issues');
        this.log('Dependency tree validation failed', 'warning');
      }
      
    } catch (error) {
      this.results.environmentConsistency.status = 'error';
      this.results.environmentConsistency.details.push(`Environment check failed: ${error.message}`);
      this.log(`Environment consistency check failed: ${error.message}`, 'error');
    }
  }

  generateReport() {
    const timestamp = new Date().toISOString();
    const report = {
      timestamp,
      nodeVersion: process.version,
      summary: {
        totalTests: Object.keys(this.results).length,
        passed: Object.values(this.results).filter(r => r.status === 'pass').length,
        failed: Object.values(this.results).filter(r => r.status === 'fail').length,
        warnings: Object.values(this.results).filter(r => r.status === 'warning').length,
        errors: Object.values(this.results).filter(r => r.status === 'error').length
      },
      results: this.results,
      buildOutputs: this.buildOutputs,
      recommendations: this.generateRecommendations()
    };
    
    return report;
  }

  generateRecommendations() {
    const recommendations = [];
    
    if (this.results.localBuild.status === 'fail' || this.results.ciBuild.status === 'fail') {
      recommendations.push({
        category: 'Build Failures',
        priority: 'high',
        action: 'Fix build configuration and dependencies',
        details: 'Ensure all dependencies are compatible with Node.js 22.19.0'
      });
    }
    
    if (this.results.buildArtifacts.status === 'fail') {
      recommendations.push({
        category: 'Build Consistency',
        priority: 'medium',
        action: 'Investigate build artifact differences',
        details: 'Check for environment-specific build configurations'
      });
    }
    
    if (this.results.environmentConsistency.status === 'warning') {
      recommendations.push({
        category: 'Environment Consistency',
        priority: 'medium',
        action: 'Align local and CI Node.js versions',
        details: 'Upgrade local Node.js to match CI requirements'
      });
    }
    
    return recommendations;
  }

  async run() {
    this.log('🏗️ Starting Build Consistency Validation', 'info');
    this.log('='.repeat(60));
    
    await this.testEnvironmentConsistency();
    await this.testLocalBuild();
    await this.testCIBuild();
    await this.compareBuildArtifacts();
    
    const report = this.generateReport();
    
    // Save report
    const reportPath = `build-consistency-report-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Display summary
    this.log('='.repeat(60));
    this.log('📊 Build Consistency Summary', 'info');
    this.log(`Total Tests: ${report.summary.totalTests}`);
    this.log(`Passed: ${report.summary.passed}`, 'success');
    this.log(`Failed: ${report.summary.failed}`, report.summary.failed > 0 ? 'error' : 'info');
    this.log(`Warnings: ${report.summary.warnings}`, report.summary.warnings > 0 ? 'warning' : 'info');
    this.log(`Errors: ${report.summary.errors}`, report.summary.errors > 0 ? 'error' : 'info');
    
    if (report.recommendations.length > 0) {
      this.log('\n💡 Recommendations:', 'info');
      report.recommendations.forEach(rec => {
        this.log(`\n${rec.category} (${rec.priority} priority):`, 'info');
        this.log(`  Action: ${rec.action}`);
        this.log(`  Details: ${rec.details}`);
      });
    }
    
    this.log(`\n📄 Full report saved to: ${reportPath}`);
    
    // Exit with appropriate code
    const hasFailures = report.summary.failed > 0 || report.summary.errors > 0;
    if (hasFailures) {
      this.log('\n❌ Build consistency validation FAILED', 'error');
      process.exit(1);
    } else {
      this.log('\n✅ Build consistency validation PASSED', 'success');
      process.exit(0);
    }
  }
}

// Run the validator if called directly
if (require.main === module) {
  const validator = new BuildConsistencyValidator();
  validator.run().catch(error => {
    console.error('❌ Build consistency validator failed:', error);
    process.exit(1);
  });
}

module.exports = BuildConsistencyValidator;