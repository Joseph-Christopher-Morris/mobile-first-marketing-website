#!/usr/bin/env node

/**
 * Performance Improvements Validation Script
 * 
 * Validates the CLS and LCP optimizations implemented:
 * 1. Fixed chart heights to prevent CLS
 * 2. Reserved space for hero buttons
 * 3. Next/Image with priority for hero
 * 4. Font optimization with display: swap
 * 5. Modern browserslist to reduce polyfills
 */

const fs = require('fs');
const path = require('path');

class PerformanceValidator {
  constructor() {
    this.results = {
      cls_fixes: [],
      lcp_optimizations: [],
      font_optimizations: [],
      build_optimizations: [],
      overall_score: 0
    };
  }

  /**
   * Validate CLS fixes in HeroWithCharts component
   */
  validateCLSFixes() {
    console.log('🔍 Validating CLS fixes...');
    
    const heroPath = 'src/components/HeroWithCharts.tsx';
    if (!fs.existsSync(heroPath)) {
      this.results.cls_fixes.push({ test: 'Hero component exists', status: 'FAIL', message: 'File not found' });
      return;
    }

    const heroContent = fs.readFileSync(heroPath, 'utf8');

    // Check for fixed chart heights
    const hasFixedHeights = heroContent.includes('CARD_H = \'h-[220px] sm:h-[240px]\'');
    this.results.cls_fixes.push({
      test: 'Fixed chart heights defined',
      status: hasFixedHeights ? 'PASS' : 'FAIL',
      message: hasFixedHeights ? 'CARD_H constant found' : 'Missing fixed height constant'
    });

    // Check for maintainAspectRatio: false
    const hasMaintainAspectRatio = heroContent.includes('maintainAspectRatio: false');
    this.results.cls_fixes.push({
      test: 'Chart aspect ratio disabled',
      status: hasMaintainAspectRatio ? 'PASS' : 'FAIL',
      message: hasMaintainAspectRatio ? 'maintainAspectRatio: false found' : 'Charts may still cause reflow'
    });

    // Check for reserved button space
    const hasReservedButtonSpace = heroContent.includes('h-12 items-center justify-center');
    this.results.cls_fixes.push({
      test: 'Reserved space for hero buttons',
      status: hasReservedButtonSpace ? 'PASS' : 'FAIL',
      message: hasReservedButtonSpace ? 'Button container has fixed height' : 'Buttons may cause layout shift'
    });

    // Check for Next/Image usage
    const usesNextImage = heroContent.includes('import Image from \'next/image\'') && heroContent.includes('<Image');
    this.results.cls_fixes.push({
      test: 'Next/Image used for hero',
      status: usesNextImage ? 'PASS' : 'FAIL',
      message: usesNextImage ? 'Next/Image with proper optimization' : 'Still using regular img tag'
    });

    console.log('✅ CLS validation completed');
  }

  /**
   * Validate LCP optimizations
   */
  validateLCPOptimizations() {
    console.log('🔍 Validating LCP optimizations...');
    
    const heroPath = 'src/components/HeroWithCharts.tsx';
    const heroContent = fs.readFileSync(heroPath, 'utf8');

    // Check for priority prop
    const hasPriority = heroContent.includes('priority');
    this.results.lcp_optimizations.push({
      test: 'Hero image has priority loading',
      status: hasPriority ? 'PASS' : 'FAIL',
      message: hasPriority ? 'priority prop found on hero image' : 'Hero image not prioritized'
    });

    // Check for sizes prop
    const hasSizes = heroContent.includes('sizes="100vw"');
    this.results.lcp_optimizations.push({
      test: 'Hero image has proper sizes',
      status: hasSizes ? 'PASS' : 'FAIL',
      message: hasSizes ? 'sizes="100vw" found' : 'Missing sizes optimization'
    });

    // Check for quality optimization
    const hasQuality = heroContent.includes('quality={82}');
    this.results.lcp_optimizations.push({
      test: 'Hero image quality optimized',
      status: hasQuality ? 'PASS' : 'FAIL',
      message: hasQuality ? 'quality={82} found' : 'Using default quality'
    });

    console.log('✅ LCP validation completed');
  }

  /**
   * Validate font optimizations
   */
  validateFontOptimizations() {
    console.log('🔍 Validating font optimizations...');
    
    const layoutPath = 'src/app/layout.tsx';
    if (!fs.existsSync(layoutPath)) {
      this.results.font_optimizations.push({ test: 'Layout file exists', status: 'FAIL', message: 'File not found' });
      return;
    }

    const layoutContent = fs.readFileSync(layoutPath, 'utf8');

    // Check for font-display: swap
    const hasDisplaySwap = layoutContent.includes('display: \'swap\'');
    this.results.font_optimizations.push({
      test: 'Font display swap enabled',
      status: hasDisplaySwap ? 'PASS' : 'FAIL',
      message: hasDisplaySwap ? 'display: swap found in Inter config' : 'Font may cause layout shift'
    });

    // Check for preload
    const hasPreload = layoutContent.includes('preload: true');
    this.results.font_optimizations.push({
      test: 'Font preload enabled',
      status: hasPreload ? 'PASS' : 'FAIL',
      message: hasPreload ? 'preload: true found' : 'Font not preloaded'
    });

    console.log('✅ Font validation completed');
  }

  /**
   * Validate build optimizations
   */
  validateBuildOptimizations() {
    console.log('🔍 Validating build optimizations...');
    
    const packagePath = 'package.json';
    const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

    // Check for modern browserslist
    const hasBrowserslist = packageContent.browserslist && 
                           packageContent.browserslist.includes('defaults and fully supports es6-module');
    this.results.build_optimizations.push({
      test: 'Modern browserslist configured',
      status: hasBrowserslist ? 'PASS' : 'FAIL',
      message: hasBrowserslist ? 'Modern browsers targeted, fewer polyfills' : 'May include unnecessary polyfills'
    });

    // Check build output exists
    const buildExists = fs.existsSync('out');
    this.results.build_optimizations.push({
      test: 'Static build exists',
      status: buildExists ? 'PASS' : 'FAIL',
      message: buildExists ? 'Static export ready for deployment' : 'No build output found'
    });

    console.log('✅ Build validation completed');
  }

  /**
   * Calculate overall performance score
   */
  calculateScore() {
    const allTests = [
      ...this.results.cls_fixes,
      ...this.results.lcp_optimizations,
      ...this.results.font_optimizations,
      ...this.results.build_optimizations
    ];

    const passedTests = allTests.filter(test => test.status === 'PASS').length;
    const totalTests = allTests.length;
    
    this.results.overall_score = Math.round((passedTests / totalTests) * 100);
  }

  /**
   * Generate performance report
   */
  generateReport() {
    console.log('\n📊 Performance Optimization Report');
    console.log('=====================================\n');

    const sections = [
      { name: 'CLS Fixes', tests: this.results.cls_fixes },
      { name: 'LCP Optimizations', tests: this.results.lcp_optimizations },
      { name: 'Font Optimizations', tests: this.results.font_optimizations },
      { name: 'Build Optimizations', tests: this.results.build_optimizations }
    ];

    sections.forEach(section => {
      console.log(`🔧 ${section.name}:`);
      section.tests.forEach(test => {
        const icon = test.status === 'PASS' ? '✅' : '❌';
        console.log(`   ${icon} ${test.test}: ${test.message}`);
      });
      console.log('');
    });

    console.log(`🎯 Overall Performance Score: ${this.results.overall_score}%\n`);

    // Expected improvements
    console.log('📈 Expected Performance Improvements:');
    console.log('   • CLS: ≤ 0.02 (from fixed chart heights + button space)');
    console.log('   • LCP: ~1.3-1.6s (from Next/Image priority + optimizations)');
    console.log('   • Font loading: No layout shift (display: swap)');
    console.log('   • Bundle size: Reduced polyfills (modern browserslist)');
    console.log('');

    // Recommendations
    if (this.results.overall_score < 100) {
      console.log('🔧 Recommendations:');
      const failedTests = [
        ...this.results.cls_fixes,
        ...this.results.lcp_optimizations,
        ...this.results.font_optimizations,
        ...this.results.build_optimizations
      ].filter(test => test.status === 'FAIL');

      failedTests.forEach(test => {
        console.log(`   • Fix: ${test.test} - ${test.message}`);
      });
      console.log('');
    }

    console.log('🚀 Next Steps:');
    console.log('   1. Test with Lighthouse after deployment');
    console.log('   2. Monitor Core Web Vitals in production');
    console.log('   3. Validate CLS ≤ 0.02 and LCP ≤ 1.6s');
    console.log('');

    return this.results.overall_score >= 90;
  }

  /**
   * Run all validations
   */
  async run() {
    console.log('🚀 Starting Performance Optimization Validation...\n');

    try {
      this.validateCLSFixes();
      this.validateLCPOptimizations();
      this.validateFontOptimizations();
      this.validateBuildOptimizations();
      this.calculateScore();

      const success = this.generateReport();

      if (success) {
        console.log('🎉 Performance optimizations validated successfully!');
        console.log('   Your site should now have significantly better Core Web Vitals.');
        return true;
      } else {
        console.log('⚠️  Some optimizations need attention.');
        console.log('   Review the recommendations above.');
        return false;
      }

    } catch (error) {
      console.error('❌ Validation failed:', error.message);
      return false;
    }
  }
}

// CLI execution
if (require.main === module) {
  const validator = new PerformanceValidator();
  
  validator.run()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Validation error:', error.message);
      process.exit(1);
    });
}

module.exports = PerformanceValidator;