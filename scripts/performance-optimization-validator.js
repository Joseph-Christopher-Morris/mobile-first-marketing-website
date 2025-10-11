#!/usr/bin/env node

/**
 * Performance Optimization Validator
 * 
 * This script validates comprehensive performance optimizations:
 * 1. Validates image optimization and sizes prop usage
 * 2. Checks caching headers configuration
 * 3. Validates Next.js image optimization settings
 * 4. Ensures proper compression settings
 * 
 * Requirements addressed:
 * - 6.1: Ensure next/image usage with proper sizes prop
 * - 6.2: Configure S3 metadata with Cache-Control headers
 * - 6.3: Optimize image formats and compression
 */

const fs = require('fs');
const path = require('path');

class PerformanceOptimizationValidator {
  constructor() {
    this.results = {
      imageOptimization: { passed: 0, failed: 0, issues: [] },
      cachingHeaders: { passed: 0, failed: 0, issues: [] },
      nextjsConfig: { passed: 0, failed: 0, issues: [] },
      compression: { passed: 0, failed: 0, issues: [] }
    };
  }

  /**
   * Validate Next.js image usage with proper sizes prop
   */
  validateImageOptimization() {
    console.log('🖼️  Validating image optimization...');
    
    const srcDir = path.join(process.cwd(), 'src');
    const imageUsagePattern = /import\s+Image\s+from\s+['"]next\/image['"]|<Image\s+[^>]*>/g;
    const sizesPattern = /sizes\s*=\s*['"][^'"]*['"]/g;
    const priorityPattern = /priority\s*(?:=\s*(?:true|{true}))?/g;
    
    this.walkDirectory(srcDir, (filePath) => {
      if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
      
      const content = fs.readFileSync(filePath, 'utf8');
      const imageUsages = content.match(imageUsagePattern) || [];
      
      imageUsages.forEach(usage => {
        if (usage.includes('<Image')) {
          const hasSizes = sizesPattern.test(usage);
          const hasPriority = priorityPattern.test(usage);
          const isHeroImage = usage.includes('priority') || filePath.includes('page.tsx');
          
          if (!hasSizes && !usage.includes('fill')) {
            this.results.imageOptimization.failed++;
            this.results.imageOptimization.issues.push({
              file: filePath,
              issue: 'Image component missing sizes prop',
              usage: usage.substring(0, 100) + '...'
            });
          } else {
            this.results.imageOptimization.passed++;
          }
          
          if (isHeroImage && !hasPriority) {
            this.results.imageOptimization.issues.push({
              file: filePath,
              issue: 'Hero image should have priority prop',
              usage: usage.substring(0, 100) + '...'
            });
          }
        }
      });
    });
    
    console.log(`   ✅ Passed: ${this.results.imageOptimization.passed} images`);
    console.log(`   ❌ Failed: ${this.results.imageOptimization.failed} images`);
  }

  /**
   * Validate caching headers configuration
   */
  validateCachingHeaders() {
    console.log('🗄️  Validating caching headers configuration...');
    
    const deployScript = path.join(process.cwd(), 'scripts', 'deploy.js');
    
    if (!fs.existsSync(deployScript)) {
      this.results.cachingHeaders.failed++;
      this.results.cachingHeaders.issues.push({
        file: deployScript,
        issue: 'Deploy script not found'
      });
      return;
    }
    
    const content = fs.readFileSync(deployScript, 'utf8');
    
    // Check for image caching (1 year = 31536000 seconds)
    const imageCachePattern = /max-age=31536000.*immutable/;
    if (imageCachePattern.test(content)) {
      this.results.cachingHeaders.passed++;
      console.log('   ✅ Image caching: 1 year with immutable');
    } else {
      this.results.cachingHeaders.failed++;
      this.results.cachingHeaders.issues.push({
        file: deployScript,
        issue: 'Images should have max-age=31536000 with immutable flag'
      });
    }
    
    // Check for HTML caching (5-10 minutes)
    const htmlCachePattern = /max-age=(?:300|600)/;
    if (htmlCachePattern.test(content)) {
      this.results.cachingHeaders.passed++;
      console.log('   ✅ HTML caching: Short cache (5-10 minutes)');
    } else {
      this.results.cachingHeaders.failed++;
      this.results.cachingHeaders.issues.push({
        file: deployScript,
        issue: 'HTML files should have max-age=300-600 (5-10 minutes)'
      });
    }
    
    // Check for static asset caching
    const staticCacheCheck1 = content.includes('/_next/static/');
    const staticCacheCheck2 = content.includes('max-age=31536000, immutable');
    if (staticCacheCheck1 && staticCacheCheck2) {
      this.results.cachingHeaders.passed++;
      console.log('   ✅ Static assets: Long cache (1 year)');
    } else {
      this.results.cachingHeaders.failed++;
      this.results.cachingHeaders.issues.push({
        file: deployScript,
        issue: 'Static assets should have max-age=31536000'
      });
    }
  }

  /**
   * Validate Next.js configuration
   */
  validateNextjsConfig() {
    console.log('⚙️  Validating Next.js configuration...');
    
    const configFile = path.join(process.cwd(), 'next.config.js');
    
    if (!fs.existsSync(configFile)) {
      this.results.nextjsConfig.failed++;
      this.results.nextjsConfig.issues.push({
        file: configFile,
        issue: 'Next.js config file not found'
      });
      return;
    }
    
    const content = fs.readFileSync(configFile, 'utf8');
    
    // Check for image optimization settings
    if (content.includes('unoptimized: true')) {
      this.results.nextjsConfig.passed++;
      console.log('   ✅ Images: Unoptimized for static export');
    } else {
      this.results.nextjsConfig.failed++;
      this.results.nextjsConfig.issues.push({
        file: configFile,
        issue: 'Images should be unoptimized for static export'
      });
    }
    
    // Check for modern image formats
    if (content.includes('image/webp') && content.includes('image/avif')) {
      this.results.nextjsConfig.passed++;
      console.log('   ✅ Image formats: WebP and AVIF enabled');
    } else {
      this.results.nextjsConfig.failed++;
      this.results.nextjsConfig.issues.push({
        file: configFile,
        issue: 'Should enable WebP and AVIF formats'
      });
    }
    
    // Check for compression
    if (content.includes('compress: true')) {
      this.results.nextjsConfig.passed++;
      console.log('   ✅ Compression: Enabled');
    } else {
      this.results.nextjsConfig.failed++;
      this.results.nextjsConfig.issues.push({
        file: configFile,
        issue: 'Compression should be enabled'
      });
    }
    
    // Check for cache TTL
    if (content.includes('minimumCacheTTL: 31536000')) {
      this.results.nextjsConfig.passed++;
      console.log('   ✅ Cache TTL: 1 year for images');
    } else {
      this.results.nextjsConfig.failed++;
      this.results.nextjsConfig.issues.push({
        file: configFile,
        issue: 'Should set minimumCacheTTL to 31536000 (1 year)'
      });
    }
  }

  /**
   * Validate compression settings
   */
  validateCompression() {
    console.log('🗜️  Validating compression settings...');
    
    // Check if images are in optimal formats
    const publicDir = path.join(process.cwd(), 'public', 'images');
    let webpCount = 0;
    let jpegCount = 0;
    let pngCount = 0;
    
    if (fs.existsSync(publicDir)) {
      this.walkDirectory(publicDir, (filePath) => {
        const ext = path.extname(filePath).toLowerCase();
        if (ext === '.webp') webpCount++;
        else if (ext === '.jpg' || ext === '.jpeg') jpegCount++;
        else if (ext === '.png') pngCount++;
      });
      
      const totalImages = webpCount + jpegCount + pngCount;
      const webpPercentage = totalImages > 0 ? (webpCount / totalImages) * 100 : 0;
      
      if (webpPercentage >= 80) {
        this.results.compression.passed++;
        console.log(`   ✅ Image formats: ${webpPercentage.toFixed(1)}% WebP`);
      } else {
        this.results.compression.failed++;
        this.results.compression.issues.push({
          file: publicDir,
          issue: `Only ${webpPercentage.toFixed(1)}% images are WebP (should be 80%+)`
        });
      }
      
      console.log(`   📊 Image breakdown: ${webpCount} WebP, ${jpegCount} JPEG, ${pngCount} PNG`);
    }
    
    // Check for build optimization
    const packageJson = path.join(process.cwd(), 'package.json');
    if (fs.existsSync(packageJson)) {
      const content = fs.readFileSync(packageJson, 'utf8');
      const pkg = JSON.parse(content);
      
      if (pkg.scripts && pkg.scripts.build && pkg.scripts.build.includes('next build')) {
        this.results.compression.passed++;
        console.log('   ✅ Build script: Next.js optimization enabled');
      } else {
        this.results.compression.failed++;
        this.results.compression.issues.push({
          file: packageJson,
          issue: 'Build script should use Next.js optimization'
        });
      }
    }
  }

  /**
   * Walk directory recursively
   */
  walkDirectory(dir, callback) {
    if (!fs.existsSync(dir)) return;
    
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        this.walkDirectory(filePath, callback);
      } else {
        callback(filePath);
      }
    }
  }

  /**
   * Generate performance recommendations
   */
  generateRecommendations() {
    const recommendations = [];
    
    // Image optimization recommendations
    if (this.results.imageOptimization.failed > 0) {
      recommendations.push({
        category: 'Image Optimization',
        priority: 'High',
        action: 'Add sizes prop to all Image components without fill prop',
        impact: 'Improves LCP and reduces bandwidth usage'
      });
    }
    
    // Caching recommendations
    if (this.results.cachingHeaders.failed > 0) {
      recommendations.push({
        category: 'Caching Headers',
        priority: 'High',
        action: 'Configure proper Cache-Control headers in deployment script',
        impact: 'Reduces server load and improves page load times'
      });
    }
    
    // Compression recommendations
    if (this.results.compression.failed > 0) {
      recommendations.push({
        category: 'Image Compression',
        priority: 'Medium',
        action: 'Convert more images to WebP format for better compression',
        impact: 'Reduces image file sizes by 25-35%'
      });
    }
    
    return recommendations;
  }

  /**
   * Generate detailed report
   */
  generateReport() {
    const totalPassed = Object.values(this.results).reduce((sum, category) => sum + category.passed, 0);
    const totalFailed = Object.values(this.results).reduce((sum, category) => sum + category.failed, 0);
    const totalIssues = Object.values(this.results).reduce((sum, category) => sum + category.issues.length, 0);
    
    const report = {
      summary: {
        totalChecks: totalPassed + totalFailed,
        passed: totalPassed,
        failed: totalFailed,
        score: totalPassed + totalFailed > 0 ? Math.round((totalPassed / (totalPassed + totalFailed)) * 100) : 0,
        issues: totalIssues
      },
      categories: this.results,
      recommendations: this.generateRecommendations(),
      timestamp: new Date().toISOString()
    };
    
    return report;
  }

  /**
   * Run all validations
   */
  async run() {
    console.log('🚀 Starting performance optimization validation...\n');
    
    this.validateImageOptimization();
    console.log('');
    
    this.validateCachingHeaders();
    console.log('');
    
    this.validateNextjsConfig();
    console.log('');
    
    this.validateCompression();
    console.log('');
    
    const report = this.generateReport();
    
    // Save report
    const reportPath = path.join(process.cwd(), 'performance-optimization-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Display summary
    console.log('📊 Performance Optimization Summary:');
    console.log(`   Overall Score: ${report.summary.score}%`);
    console.log(`   Checks Passed: ${report.summary.passed}/${report.summary.totalChecks}`);
    console.log(`   Issues Found: ${report.summary.issues}`);
    
    if (report.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      report.recommendations.forEach((rec, index) => {
        console.log(`   ${index + 1}. [${rec.priority}] ${rec.category}: ${rec.action}`);
        console.log(`      Impact: ${rec.impact}`);
      });
    }
    
    if (report.summary.issues > 0) {
      console.log('\n❌ Issues Found:');
      Object.entries(this.results).forEach(([category, result]) => {
        if (result.issues.length > 0) {
          console.log(`\n   ${category}:`);
          result.issues.forEach(issue => {
            console.log(`     • ${issue.issue}`);
            if (issue.file) console.log(`       File: ${issue.file}`);
            if (issue.usage) console.log(`       Usage: ${issue.usage}`);
          });
        }
      });
    }
    
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
    
    return report;
  }
}

// CLI execution
if (require.main === module) {
  const validator = new PerformanceOptimizationValidator();
  
  validator.run()
    .then(report => {
      if (report.summary.score >= 90) {
        console.log('\n✅ Performance optimization validation passed!');
        process.exit(0);
      } else {
        console.log('\n⚠️  Performance optimization needs improvement');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('\n❌ Validation failed:', error.message);
      process.exit(1);
    });
}

module.exports = PerformanceOptimizationValidator;