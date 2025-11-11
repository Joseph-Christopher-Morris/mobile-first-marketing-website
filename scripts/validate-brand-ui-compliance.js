#!/usr/bin/env node

/**
 * Brand and UI Validation Script
 * Validates compliance with brand standards and UI specifications
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class BrandUIValidator {
  constructor() {
    this.results = {
      colorCompliance: { passed: false, issues: [] },
      gradientCheck: { passed: false, issues: [] },
      heroValidation: { passed: false, issues: [] },
      brandPaletteUsage: { passed: false, issues: [] }
    };
    this.srcDir = path.join(process.cwd(), 'src');
    this.publicDir = path.join(process.cwd(), 'public');
  }

  // Validate no prohibited colors exist
  validateColorCompliance() {
    console.log('🎨 Validating color compliance...');
    
    const prohibitedPatterns = [
      /from-indigo-/g,
      /via-purple-/g,
      /bg-gradient-/g,
      /bg-yellow-/g,
      /text-yellow-/g,
      /indigo-\d+/g,
      /purple-\d+/g,
      /yellow-\d+/g,
      /blue-\d+/g
    ];

    const files = this.getAllSourceFiles();
    const issues = [];

    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      prohibitedPatterns.forEach(pattern => {
        const matches = content.match(pattern);
        if (matches) {
          matches.forEach(match => {
            issues.push({
              file: path.relative(process.cwd(), file),
              issue: `Prohibited color class: ${match}`,
              line: this.getLineNumber(content, match)
            });
          });
        }
      });
    });

    this.results.colorCompliance = {
      passed: issues.length === 0,
      issues
    };

    if (issues.length === 0) {
      console.log('✅ No prohibited colors found');
    } else {
      console.log(`❌ Found ${issues.length} prohibited color usage(s)`);
      issues.forEach(issue => {
        console.log(`   ${issue.file}:${issue.line} - ${issue.issue}`);
      });
    }
  }

  // Validate no gradients exist
  validateGradientCheck() {
    console.log('🌈 Checking for gradients...');
    
    const files = this.getAllSourceFiles();
    const issues = [];

    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      
      // More specific gradient patterns to avoid false positives
      const gradientPatterns = [
        /\bbg-gradient-\w+/g,
        /\bfrom-\w+-\d+/g,
        /\bvia-\w+-\d+/g,
        /\bto-\w+-\d+/g,
        /linear-gradient\(/g,
        /radial-gradient\(/g
      ];

      gradientPatterns.forEach(pattern => {
        const matches = content.match(pattern);
        if (matches) {
          matches.forEach(match => {
            // Skip if it's part of a comment
            const lines = content.split('\n');
            const lineIndex = lines.findIndex(line => line.includes(match));
            if (lineIndex !== -1) {
              const line = lines[lineIndex].trim();
              if (!line.startsWith('//') && !line.startsWith('*') && !line.includes('/*')) {
                issues.push({
                  file: path.relative(process.cwd(), file),
                  issue: `Gradient usage detected: ${match}`,
                  line: lineIndex + 1
                });
              }
            }
          });
        }
      });
    });

    this.results.gradientCheck = {
      passed: issues.length === 0,
      issues
    };

    if (issues.length === 0) {
      console.log('✅ No gradients found');
    } else {
      console.log(`❌ Found ${issues.length} gradient usage(s)`);
      issues.forEach(issue => {
        console.log(`   ${issue.file}:${issue.line} - ${issue.issue}`);
      });
    }
  }

  // Validate brand palette usage
  validateBrandPaletteUsage() {
    console.log('🎯 Validating brand palette usage...');
    
    const approvedColors = [
      'brand-pink',
      'brand-pink2', 
      'brand-black',
      'brand-white',
      'brand-grey',
      'white',
      'black',
      'transparent',
      'current'
    ];

    const files = this.getAllSourceFiles();
    const issues = [];
    const colorPattern = /(?:bg-|text-|border-|from-|via-|to-)([a-z]+(?:-\d+)?)/g;

    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      let match;
      
      while ((match = colorPattern.exec(content)) !== null) {
        const colorClass = match[1];
        
        // Skip if it's an approved color
        if (!approvedColors.some(approved => colorClass.includes(approved))) {
          // Check if it's a prohibited color
          if (['indigo', 'purple', 'yellow', 'blue', 'red', 'green'].some(prohibited => 
            colorClass.includes(prohibited))) {
            issues.push({
              file: path.relative(process.cwd(), file),
              issue: `Non-brand color usage: ${match[0]}`,
              line: this.getLineNumber(content, match[0])
            });
          }
        }
      }
    });

    this.results.brandPaletteUsage = {
      passed: issues.length === 0,
      issues
    };

    if (issues.length === 0) {
      console.log('✅ Only brand palette colors found');
    } else {
      console.log(`❌ Found ${issues.length} non-brand color usage(s)`);
      issues.forEach(issue => {
        console.log(`   ${issue.file}:${issue.line} - ${issue.issue}`);
      });
    }
  }

  // Validate home hero section
  validateHeroSection() {
    console.log('🏠 Validating home hero section...');
    
    const heroFile = path.join(this.srcDir, 'app', 'page.tsx');
    const issues = [];

    if (!fs.existsSync(heroFile)) {
      issues.push({ issue: 'Home page file not found', file: 'src/app/page.tsx' });
    } else {
      const content = fs.readFileSync(heroFile, 'utf8');
      
      // Check for required hero elements
      const requiredElements = [
        { pattern: /aston-martin-db6-website\.webp/, name: 'Hero background image' },
        { pattern: /bg-black\/45/, name: 'Hero overlay (bg-black/45)' },
        { pattern: /py-28\s+md:py-40/, name: 'Hero spacing (py-28 md:py-40)' },
        { pattern: /Get Started/, name: 'Get Started button' },
        { pattern: /View Services/, name: 'View Services button' },
        { pattern: /bg-brand-pink/, name: 'Brand pink button styling' },
        { pattern: /hover:bg-brand-pink2/, name: 'Brand pink2 hover state' },
        { pattern: /\/contact\//, name: 'Contact link' },
        { pattern: /\/services\//, name: 'Services link' }
      ];

      requiredElements.forEach(element => {
        if (!element.pattern.test(content)) {
          issues.push({
            file: 'src/app/page.tsx',
            issue: `Missing or incorrect: ${element.name}`,
            line: 'N/A'
          });
        }
      });

      // Check for prohibited elements
      const prohibitedElements = [
        { pattern: /bg-gradient/, name: 'Gradient backgrounds' },
        { pattern: /from-|via-|to-/, name: 'Gradient color classes' }
      ];

      prohibitedElements.forEach(element => {
        if (element.pattern.test(content)) {
          issues.push({
            file: 'src/app/page.tsx',
            issue: `Prohibited element found: ${element.name}`,
            line: this.getLineNumber(content, element.pattern.source)
          });
        }
      });
    }

    this.results.heroValidation = {
      passed: issues.length === 0,
      issues
    };

    if (issues.length === 0) {
      console.log('✅ Hero section validation passed');
    } else {
      console.log(`❌ Found ${issues.length} hero section issue(s)`);
      issues.forEach(issue => {
        console.log(`   ${issue.file}:${issue.line} - ${issue.issue}`);
      });
    }
  }

  // Get all source files for scanning
  getAllSourceFiles() {
    const files = [];
    const extensions = ['.tsx', '.ts', '.jsx', '.js', '.css'];
    
    const scanDirectory = (dir) => {
      if (!fs.existsSync(dir)) return;
      
      const items = fs.readdirSync(dir);
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          scanDirectory(fullPath);
        } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
          files.push(fullPath);
        }
      });
    };

    scanDirectory(this.srcDir);
    
    // Also check config files
    const configFiles = [
      'tailwind.config.js',
      'tailwind.brand.config.js',
      'next.config.js'
    ];
    
    configFiles.forEach(file => {
      const fullPath = path.join(process.cwd(), file);
      if (fs.existsSync(fullPath)) {
        files.push(fullPath);
      }
    });

    return files;
  }

  // Get line number for a match in content
  getLineNumber(content, searchText) {
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(searchText)) {
        return i + 1;
      }
    }
    return 'N/A';
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
    const reportPath = `brand-ui-validation-report-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // Generate summary
    const summaryPath = `brand-ui-validation-summary-${Date.now()}.md`;
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
    return `# Brand and UI Validation Summary

**Generated:** ${report.timestamp}
**Overall Status:** ${report.overallStatus}
**Checks Passed:** ${report.summary.passed}/${report.summary.totalChecks}

## Validation Results

### ✅ Color Compliance
- **Status:** ${report.results.colorCompliance.passed ? 'PASSED' : 'FAILED'}
- **Issues:** ${report.results.colorCompliance.issues.length}

### ✅ Gradient Check  
- **Status:** ${report.results.gradientCheck.passed ? 'PASSED' : 'FAILED'}
- **Issues:** ${report.results.gradientCheck.issues.length}

### ✅ Brand Palette Usage
- **Status:** ${report.results.brandPaletteUsage.passed ? 'PASSED' : 'FAILED'}  
- **Issues:** ${report.results.brandPaletteUsage.issues.length}

### ✅ Hero Section Validation
- **Status:** ${report.results.heroValidation.passed ? 'PASSED' : 'FAILED'}
- **Issues:** ${report.results.heroValidation.issues.length}

## Issues Found

${Object.entries(report.results).map(([key, result]) => {
  if (result.issues.length === 0) return '';
  return `### ${key}\n${result.issues.map(issue => 
    `- **${issue.file}:${issue.line}** - ${issue.issue}`
  ).join('\n')}`;
}).filter(Boolean).join('\n\n')}

## Requirements Validation

- **Requirement 11.1:** ${report.results.colorCompliance.passed && report.results.gradientCheck.passed ? '✅ PASSED' : '❌ FAILED'} - No gradients, blue, purple, or yellow colors
- **Requirement 11.2:** ${report.results.heroValidation.passed && report.results.brandPaletteUsage.passed ? '✅ PASSED' : '❌ FAILED'} - Brand palette usage and hero section compliance
`;
  }

  // Run all validations
  async runAllValidations() {
    console.log('🚀 Starting Brand and UI Validation...\n');
    
    this.validateColorCompliance();
    this.validateGradientCheck();
    this.validateBrandPaletteUsage();
    this.validateHeroSection();
    
    return this.generateReport();
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new BrandUIValidator();
  validator.runAllValidations()
    .then(report => {
      process.exit(report.overallStatus === 'PASSED' ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Validation failed:', error);
      process.exit(1);
    });
}

module.exports = BrandUIValidator;