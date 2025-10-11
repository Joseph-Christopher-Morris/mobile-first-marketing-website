#!/usr/bin/env node

/**
 * Navigation Breakpoint Validation Script
 * 
 * Validates that the Header component properly handles responsive navigation:
 * - Desktop (≥768px): Shows navigation links, hides hamburger
 * - Mobile (<768px): Shows hamburger, hides navigation links
 */

const fs = require('fs');
const path = require('path');

class NavigationValidator {
  constructor() {
    this.headerPath = 'src/components/layout/Header.tsx';
    this.validationResults = {
      hamburgerHidden: false,
      desktopNavVisible: false,
      desktopCTAVisible: false,
      correctBreakpoint: false,
      accessibilityAttributes: false,
      overallStatus: 'FAILED'
    };
  }

  /**
   * Validate Header component implementation
   */
  validateHeaderComponent() {
    console.log('🔍 Validating Header component navigation implementation...\n');

    if (!fs.existsSync(this.headerPath)) {
      throw new Error(`Header component not found at ${this.headerPath}`);
    }

    const headerContent = fs.readFileSync(this.headerPath, 'utf8');

    // Test 1: Hamburger button hidden on desktop (md:hidden)
    console.log('📱 Test 1: Hamburger button hidden on desktop');
    const hamburgerHiddenRegex = /className=['"][^'"]*md:hidden[^'"]*['"][^>]*aria-label=['"]Toggle mobile menu['"]|aria-label=['"]Toggle mobile menu['"][^>]*className=['"][^'"]*md:hidden[^'"]*['"]/;
    this.validationResults.hamburgerHidden = hamburgerHiddenRegex.test(headerContent);
    console.log(`   ${this.validationResults.hamburgerHidden ? '✅' : '❌'} Hamburger button has md:hidden class`);

    // Test 2: Desktop navigation visible (hidden md:flex)
    console.log('\n🖥️  Test 2: Desktop navigation visible');
    const desktopNavRegex = /className=['"][^'"]*hidden md:flex[^'"]*['"][^>]*role=['"]navigation['"]|role=['"]navigation['"][^>]*className=['"][^'"]*hidden md:flex[^'"]*['"]/;
    this.validationResults.desktopNavVisible = desktopNavRegex.test(headerContent);
    console.log(`   ${this.validationResults.desktopNavVisible ? '✅' : '❌'} Desktop navigation has hidden md:flex classes`);

    // Test 3: Desktop CTA button visible (hidden md:flex)
    console.log('\n🎯 Test 3: Desktop CTA button visible');
    const desktopCTARegex = /{\/\* Desktop CTA Button \*\/}[\s\S]*?<div className=['"][^'"]*hidden md:flex[^'"]*['"][\s\S]*?Get Started/;
    this.validationResults.desktopCTAVisible = desktopCTARegex.test(headerContent);
    console.log(`   ${this.validationResults.desktopCTAVisible ? '✅' : '❌'} Desktop CTA button has hidden md:flex classes`);

    // Test 4: Correct breakpoint (md = 768px)
    console.log('\n📏 Test 4: Correct breakpoint usage');
    const correctBreakpointRegex = /md:hidden|hidden md:flex/g;
    const breakpointMatches = headerContent.match(correctBreakpointRegex);
    this.validationResults.correctBreakpoint = breakpointMatches && breakpointMatches.length >= 2;
    console.log(`   ${this.validationResults.correctBreakpoint ? '✅' : '❌'} Uses md breakpoint (768px) consistently`);

    // Test 5: Accessibility attributes
    console.log('\n♿ Test 5: Accessibility attributes');
    const accessibilityRegex = /aria-label=['"]Toggle mobile menu['"][\s\S]*?aria-expanded=\{isMobileMenuOpen\}/;
    this.validationResults.accessibilityAttributes = accessibilityRegex.test(headerContent);
    console.log(`   ${this.validationResults.accessibilityAttributes ? '✅' : '❌'} Proper accessibility attributes present`);

    // Overall validation
    const allTestsPassed = Object.values(this.validationResults).slice(0, -1).every(result => result === true);
    this.validationResults.overallStatus = allTestsPassed ? 'PASSED' : 'FAILED';

    return this.validationResults;
  }

  /**
   * Generate validation report
   */
  generateReport() {
    const timestamp = new Date().toISOString();
    const report = {
      timestamp,
      testSuite: 'Navigation Breakpoint Validation',
      component: 'Header.tsx',
      requirements: ['6.1', '6.2', '6.4', '6.5', '6.6'],
      results: this.validationResults,
      summary: {
        totalTests: 5,
        passedTests: Object.values(this.validationResults).slice(0, -1).filter(r => r === true).length,
        failedTests: Object.values(this.validationResults).slice(0, -1).filter(r => r === false).length,
        overallStatus: this.validationResults.overallStatus
      },
      recommendations: this.generateRecommendations()
    };

    // Save report
    const reportPath = `navigation-breakpoint-validation-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    return report;
  }

  /**
   * Generate recommendations based on test results
   */
  generateRecommendations() {
    const recommendations = [];

    if (!this.validationResults.hamburgerHidden) {
      recommendations.push('Add md:hidden class to hamburger button to hide on desktop');
    }

    if (!this.validationResults.desktopNavVisible) {
      recommendations.push('Add hidden md:flex classes to desktop navigation');
    }

    if (!this.validationResults.desktopCTAVisible) {
      recommendations.push('Add hidden md:flex classes to desktop CTA button');
    }

    if (!this.validationResults.correctBreakpoint) {
      recommendations.push('Ensure consistent use of md breakpoint (768px) for responsive behavior');
    }

    if (!this.validationResults.accessibilityAttributes) {
      recommendations.push('Add proper aria-label and aria-expanded attributes to hamburger button');
    }

    if (recommendations.length === 0) {
      recommendations.push('All navigation breakpoint requirements are properly implemented');
    }

    return recommendations;
  }

  /**
   * Print validation summary
   */
  printSummary(report) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 NAVIGATION BREAKPOINT VALIDATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`Status: ${report.summary.overallStatus === 'PASSED' ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Tests: ${report.summary.passedTests}/${report.summary.totalTests} passed`);
    console.log(`Component: ${report.component}`);
    console.log(`Requirements: ${report.requirements.join(', ')}`);
    
    console.log('\n📋 Test Results:');
    console.log(`   Hamburger Hidden on Desktop: ${this.validationResults.hamburgerHidden ? '✅' : '❌'}`);
    console.log(`   Desktop Navigation Visible: ${this.validationResults.desktopNavVisible ? '✅' : '❌'}`);
    console.log(`   Desktop CTA Visible: ${this.validationResults.desktopCTAVisible ? '✅' : '❌'}`);
    console.log(`   Correct Breakpoint Usage: ${this.validationResults.correctBreakpoint ? '✅' : '❌'}`);
    console.log(`   Accessibility Attributes: ${this.validationResults.accessibilityAttributes ? '✅' : '❌'}`);

    console.log('\n💡 Recommendations:');
    report.recommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. ${rec}`);
    });

    console.log(`\n📄 Report saved: navigation-breakpoint-validation-${Date.now()}.json`);
    console.log('='.repeat(60));
  }

  /**
   * Run complete validation
   */
  async run() {
    try {
      console.log('🚀 Starting Navigation Breakpoint Validation...\n');

      // Validate Header component
      this.validateHeaderComponent();

      // Generate and save report
      const report = this.generateReport();

      // Print summary
      this.printSummary(report);

      return {
        success: report.summary.overallStatus === 'PASSED',
        report
      };

    } catch (error) {
      console.error('❌ Validation failed:', error.message);
      throw error;
    }
  }
}

// CLI execution
if (require.main === module) {
  const validator = new NavigationValidator();
  
  validator.run()
    .then((result) => {
      console.log(`\n${result.success ? '✅' : '❌'} Navigation validation ${result.success ? 'completed successfully' : 'failed'}`);
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error('\n❌ Navigation validation failed:', error.message);
      process.exit(1);
    });
}

module.exports = NavigationValidator;