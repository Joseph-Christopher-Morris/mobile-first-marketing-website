#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load performance budget configuration
const budgetConfig = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../config/performance-budget.json'), 'utf8')
);

/**
 * Performance monitoring script for CI/CD integration
 * Validates build output against performance budgets
 */
class PerformanceMonitor {
  constructor() {
    this.budgets = budgetConfig.budgets;
    this.alerts = budgetConfig.alerts;
    this.results = {
      passed: [],
      failed: [],
      warnings: []
    };
  }

  /**
   * Analyze build output for performance metrics
   */
  analyzeBuildOutput() {
    const buildDir = path.join(__dirname, '../out');
    
    if (!fs.existsSync(buildDir)) {
      console.error('Build directory not found. Run npm run build first.');
      process.exit(1);
    }

    console.log('🔍 Analyzing build output for performance...\n');

    // Check total page sizes
    this.checkPageSizes(buildDir);
    
    // Check image optimization
    this.checkImageOptimization(buildDir);
    
    // Check JavaScript bundle sizes
    this.checkJavaScriptBundles(buildDir);
    
    // Check CSS sizes
    this.checkCSSFiles(buildDir);

    // Generate report
    this.generateReport();
  }

  /**
   * Check page sizes against budget
   */
  checkPageSizes(buildDir) {
    const photographyPagePath = path.join(buildDir, 'services/photography/index.html');
    
    if (fs.existsSync(photographyPagePath)) {
      const stats = fs.statSync(photographyPagePath);
      const pageSize = stats.size;
      const budget = this.budgets['photography-page'].totalPageSize;
      
      if (pageSize <= budget) {
        this.results.passed.push(`✅ Photography page size: ${this.formatBytes(pageSize)} (budget: ${this.formatBytes(budget)})`);
      } else {
        this.results.failed.push(`❌ Photography page size: ${this.formatBytes(pageSize)} exceeds budget: ${this.formatBytes(budget)}`);
      }
    }
  }

  /**
   * Check image optimization
   */
  checkImageOptimization(buildDir) {
    const imagesDir = path.join(buildDir, 'images');
    
    if (!fs.existsSync(imagesDir)) {
      this.results.warnings.push('⚠️  Images directory not found in build output');
      return;
    }

    const imageFiles = this.getAllFiles(imagesDir, ['.webp', '.jpg', '.jpeg', '.png']);
    const budget = this.budgets['gallery-images'];
    
    let totalImageSize = 0;
    let oversizedImages = [];

    imageFiles.forEach(filePath => {
      const stats = fs.statSync(filePath);
      const fileSize = stats.size;
      totalImageSize += fileSize;
      
      if (fileSize > budget.maxImageSize) {
        oversizedImages.push({
          path: path.relative(buildDir, filePath),
          size: fileSize,
          budget: budget.maxImageSize
        });
      }
    });

    // Check total image count
    if (imageFiles.length <= budget.maxImages) {
      this.results.passed.push(`✅ Image count: ${imageFiles.length} (budget: ${budget.maxImages})`);
    } else {
      this.results.failed.push(`❌ Image count: ${imageFiles.length} exceeds budget: ${budget.maxImages}`);
    }

    // Check individual image sizes
    if (oversizedImages.length === 0) {
      this.results.passed.push(`✅ All images within size budget: ${this.formatBytes(budget.maxImageSize)}`);
    } else {
      oversizedImages.forEach(img => {
        this.results.failed.push(`❌ Oversized image: ${img.path} (${this.formatBytes(img.size)} > ${this.formatBytes(img.budget)})`);
      });
    }

    // Check total image size
    const imageBudget = this.budgets['photography-page'].imageSize;
    if (totalImageSize <= imageBudget) {
      this.results.passed.push(`✅ Total image size: ${this.formatBytes(totalImageSize)} (budget: ${this.formatBytes(imageBudget)})`);
    } else {
      this.results.failed.push(`❌ Total image size: ${this.formatBytes(totalImageSize)} exceeds budget: ${this.formatBytes(imageBudget)}`);
    }
  }

  /**
   * Check JavaScript bundle sizes
   */
  checkJavaScriptBundles(buildDir) {
    const jsFiles = this.getAllFiles(buildDir, ['.js']);
    const budget = this.budgets['photography-page'].jsSize;
    
    let totalJSSize = 0;
    
    jsFiles.forEach(filePath => {
      const stats = fs.statSync(filePath);
      totalJSSize += stats.size;
    });

    if (totalJSSize <= budget) {
      this.results.passed.push(`✅ JavaScript size: ${this.formatBytes(totalJSSize)} (budget: ${this.formatBytes(budget)})`);
    } else {
      this.results.failed.push(`❌ JavaScript size: ${this.formatBytes(totalJSSize)} exceeds budget: ${this.formatBytes(budget)}`);
    }
  }

  /**
   * Check CSS file sizes
   */
  checkCSSFiles(buildDir) {
    const cssFiles = this.getAllFiles(buildDir, ['.css']);
    const budget = this.budgets['photography-page'].cssSize;
    
    let totalCSSSize = 0;
    
    cssFiles.forEach(filePath => {
      const stats = fs.statSync(filePath);
      totalCSSSize += stats.size;
    });

    if (totalCSSSize <= budget) {
      this.results.passed.push(`✅ CSS size: ${this.formatBytes(totalCSSSize)} (budget: ${this.formatBytes(budget)})`);
    } else {
      this.results.failed.push(`❌ CSS size: ${this.formatBytes(totalCSSSize)} exceeds budget: ${this.formatBytes(budget)}`);
    }
  }

  /**
   * Get all files with specific extensions recursively
   */
  getAllFiles(dir, extensions) {
    let files = [];
    
    if (!fs.existsSync(dir)) return files;
    
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stats = fs.statSync(fullPath);
      
      if (stats.isDirectory()) {
        files = files.concat(this.getAllFiles(fullPath, extensions));
      } else if (extensions.some(ext => item.toLowerCase().endsWith(ext))) {
        files.push(fullPath);
      }
    });
    
    return files;
  }

  /**
   * Format bytes to human readable format
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Generate performance report
   */
  generateReport() {
    console.log('\n📊 Performance Budget Report\n');
    console.log('='.repeat(50));
    
    // Passed checks
    if (this.results.passed.length > 0) {
      console.log('\n✅ PASSED CHECKS:');
      this.results.passed.forEach(check => console.log(`  ${check}`));
    }
    
    // Warnings
    if (this.results.warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:');
      this.results.warnings.forEach(warning => console.log(`  ${warning}`));
    }
    
    // Failed checks
    if (this.results.failed.length > 0) {
      console.log('\n❌ FAILED CHECKS:');
      this.results.failed.forEach(failure => console.log(`  ${failure}`));
    }
    
    console.log('\n' + '='.repeat(50));
    
    const totalChecks = this.results.passed.length + this.results.failed.length;
    const passRate = totalChecks > 0 ? (this.results.passed.length / totalChecks * 100).toFixed(1) : 0;
    
    console.log(`\n📈 Summary: ${this.results.passed.length}/${totalChecks} checks passed (${passRate}%)`);
    
    // Save report to file
    const reportData = {
      timestamp: new Date().toISOString(),
      summary: {
        total: totalChecks,
        passed: this.results.passed.length,
        failed: this.results.failed.length,
        warnings: this.results.warnings.length,
        passRate: parseFloat(passRate)
      },
      results: this.results
    };
    
    const reportPath = path.join(__dirname, '../reports/performance-budget-report.json');
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
    
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
    
    // Exit with error code if any checks failed
    if (this.results.failed.length > 0) {
      console.log('\n❌ Performance budget checks failed!');
      process.exit(1);
    } else {
      console.log('\n✅ All performance budget checks passed!');
    }
  }
}

// Run performance monitoring
if (require.main === module) {
  const monitor = new PerformanceMonitor();
  monitor.analyzeBuildOutput();
}

module.exports = PerformanceMonitor;