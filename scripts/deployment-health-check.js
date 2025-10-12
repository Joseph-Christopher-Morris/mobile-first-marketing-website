#!/usr/bin/env node

/**
 * Comprehensive Deployment Health Check
 * Checks all aspects of GitHub to CloudFront deployment pipeline
 */

const https = require('https');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class DeploymentHealthChecker {
  constructor() {
    this.siteUrl = 'https://d15sc9fc739ev2.cloudfront.net';
    this.results = {
      status: 'unknown',
      checks: [],
      issues: [],
      recommendations: []
    };
  }

  async runAllChecks() {
    console.log('🔍 Running Comprehensive Deployment Health Check...\n');
    
    try {
      await this.checkGitStatus();
      await this.checkBuildHealth();
      await this.checkSiteAvailability();
      await this.checkCacheStatus();
      await this.checkPerformance();
      
      this.generateReport();
    } catch (error) {
      console.error('❌ Health check failed:', error.message);
      this.results.status = 'failed';
    }
  }

  async checkGitStatus() {
    console.log('📋 1. Git Status Check');
    
    try {
      const status = execSync('git status --porcelain', { encoding: 'utf8' });
      const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
      const lastCommit = execSync('git log -1 --format="%h %s"', { encoding: 'utf8' }).trim();
      
      if (status.trim()) {
        this.results.issues.push('Uncommitted changes detected');
        console.log('⚠️  Uncommitted changes found');
      } else {
        console.log('✅ Working directory clean');
      }
      
      console.log(`   Branch: ${branch}`);
      console.log(`   Last commit: ${lastCommit}`);
      
      this.results.checks.push({
        name: 'Git Status',
        status: status.trim() ? 'warning' : 'pass',
        details: { branch, lastCommit, hasChanges: !!status.trim() }
      });
      
    } catch (error) {
      this.results.issues.push(`Git check failed: ${error.message}`);
    }
    
    console.log('');
  }

  async checkBuildHealth() {
    console.log('🔨 2. Build Health Check');
    
    try {
      // Check if out directory exists
      const outDir = path.join(process.cwd(), 'out');
      const buildExists = fs.existsSync(outDir);
      
      if (!buildExists) {
        console.log('⚠️  No build output found - running build...');
        execSync('npm run build', { stdio: 'inherit' });
      } else {
        console.log('✅ Build output exists');
      }
      
      // Check build size
      if (fs.existsSync(outDir)) {
        const stats = this.getDirSize(outDir);
        console.log(`   Build size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
        console.log(`   File count: ${stats.files}`);
        
        this.results.checks.push({
          name: 'Build Health',
          status: 'pass',
          details: { 
            buildExists: true, 
            sizeMB: (stats.size / 1024 / 1024).toFixed(2),
            fileCount: stats.files 
          }
        });
      }
      
    } catch (error) {
      this.results.issues.push(`Build check failed: ${error.message}`);
      console.log('❌ Build check failed:', error.message);
    }
    
    console.log('');
  }

  async checkSiteAvailability() {
    console.log('🌐 3. Site Availability Check');
    
    try {
      const response = await this.makeRequest(this.siteUrl);
      
      if (response.statusCode === 200) {
        console.log('✅ Site is accessible');
        console.log(`   Status: ${response.statusCode}`);
        console.log(`   Response time: ${response.responseTime}ms`);
        
        // Check for key content
        const hasTitle = response.body.includes('<title>');
        const hasContent = response.body.length > 1000;
        
        console.log(`   Has title: ${hasTitle ? '✅' : '❌'}`);
        console.log(`   Content size: ${(response.body.length / 1024).toFixed(2)} KB`);
        
        this.results.checks.push({
          name: 'Site Availability',
          status: 'pass',
          details: {
            statusCode: response.statusCode,
            responseTime: response.responseTime,
            hasTitle,
            contentSize: response.body.length
          }
        });
        
      } else {
        throw new Error(`HTTP ${response.statusCode}`);
      }
      
    } catch (error) {
      this.results.issues.push(`Site availability check failed: ${error.message}`);
      console.log('❌ Site check failed:', error.message);
    }
    
    console.log('');
  }

  async checkCacheStatus() {
    console.log('🗄️  4. Cache Status Check');
    
    try {
      const response = await this.makeRequest(this.siteUrl, { 
        'Cache-Control': 'no-cache' 
      });
      
      const cacheHeaders = {
        'cache-control': response.headers['cache-control'],
        'cloudfront-cache-status': response.headers['x-cache'],
        'age': response.headers['age']
      };
      
      console.log('   Cache headers:');
      Object.entries(cacheHeaders).forEach(([key, value]) => {
        if (value) {
          console.log(`     ${key}: ${value}`);
        }
      });
      
      this.results.checks.push({
        name: 'Cache Status',
        status: 'pass',
        details: cacheHeaders
      });
      
    } catch (error) {
      this.results.issues.push(`Cache check failed: ${error.message}`);
      console.log('❌ Cache check failed:', error.message);
    }
    
    console.log('');
  }

  async checkPerformance() {
    console.log('⚡ 5. Performance Check');
    
    try {
      const startTime = Date.now();
      const response = await this.makeRequest(this.siteUrl);
      const loadTime = Date.now() - startTime;
      
      console.log(`   Page load time: ${loadTime}ms`);
      console.log(`   Content size: ${(response.body.length / 1024).toFixed(2)} KB`);
      
      // Performance thresholds
      const performanceStatus = loadTime < 2000 ? 'pass' : 'warning';
      
      if (loadTime > 2000) {
        this.results.recommendations.push('Consider optimizing page load time (currently > 2s)');
      }
      
      this.results.checks.push({
        name: 'Performance',
        status: performanceStatus,
        details: {
          loadTime,
          contentSize: response.body.length
        }
      });
      
    } catch (error) {
      this.results.issues.push(`Performance check failed: ${error.message}`);
      console.log('❌ Performance check failed:', error.message);
    }
    
    console.log('');
  }

  generateReport() {
    console.log('📊 DEPLOYMENT HEALTH REPORT');
    console.log('=' .repeat(50));
    
    const passCount = this.results.checks.filter(c => c.status === 'pass').length;
    const warningCount = this.results.checks.filter(c => c.status === 'warning').length;
    const failCount = this.results.checks.filter(c => c.status === 'fail').length;
    
    console.log(`✅ Passed: ${passCount}`);
    console.log(`⚠️  Warnings: ${warningCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log(`🔧 Issues: ${this.results.issues.length}`);
    
    if (this.results.issues.length > 0) {
      console.log('\n🔧 ISSUES TO ADDRESS:');
      this.results.issues.forEach((issue, i) => {
        console.log(`${i + 1}. ${issue}`);
      });
    }
    
    if (this.results.recommendations.length > 0) {
      console.log('\n💡 RECOMMENDATIONS:');
      this.results.recommendations.forEach((rec, i) => {
        console.log(`${i + 1}. ${rec}`);
      });
    }
    
    // Overall status
    if (failCount > 0) {
      this.results.status = 'failed';
      console.log('\n🚨 OVERALL STATUS: FAILED');
    } else if (warningCount > 0) {
      this.results.status = 'warning';
      console.log('\n⚠️  OVERALL STATUS: WARNING');
    } else {
      this.results.status = 'healthy';
      console.log('\n✅ OVERALL STATUS: HEALTHY');
    }
    
    // Save detailed report
    const reportPath = path.join(process.cwd(), 'deployment-health-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  }

  makeRequest(url, headers = {}) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      const req = https.get(url, { headers }, (res) => {
        let body = '';
        
        res.on('data', (chunk) => {
          body += chunk;
        });
        
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body,
            responseTime: Date.now() - startTime
          });
        });
      });
      
      req.on('error', reject);
      req.setTimeout(10000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
    });
  }

  getDirSize(dirPath) {
    let totalSize = 0;
    let fileCount = 0;
    
    const traverse = (currentPath) => {
      const stats = fs.statSync(currentPath);
      
      if (stats.isDirectory()) {
        const files = fs.readdirSync(currentPath);
        files.forEach(file => {
          traverse(path.join(currentPath, file));
        });
      } else {
        totalSize += stats.size;
        fileCount++;
      }
    };
    
    traverse(dirPath);
    return { size: totalSize, files: fileCount };
  }
}

// Run the health check
if (require.main === module) {
  const checker = new DeploymentHealthChecker();
  checker.runAllChecks().catch(console.error);
}

module.exports = DeploymentHealthChecker;