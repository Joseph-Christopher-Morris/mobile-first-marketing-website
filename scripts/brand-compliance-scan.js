#!/usr/bin/env node

/**
 * Brand Compliance Scanner
 * 
 * Scans for prohibited color patterns and gradients in the codebase
 * Fails the build if any prohibited patterns are detected
 * 
 * Prohibited patterns:
 * - from-* (gradient start)
 * - via-* (gradient middle)
 * - bg-gradient-* (gradient backgrounds)
 * - *-indigo-* (indigo color variants)
 * - *-purple-* (purple color variants)
 * - *-yellow-* (yellow color variants)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const SCAN_DIRECTORIES = ['src', 'apps'];
const PROHIBITED_PATTERNS = [
  'from-',
  'via-',
  'bg-gradient-',
  '-indigo-',
  '-purple-',
  '-yellow-'
];

// File extensions to scan
const SCAN_EXTENSIONS = ['.js', '.ts', '.jsx', '.tsx', '.css', '.scss', '.html'];

class BrandComplianceScanner {
  constructor() {
    this.violations = [];
    this.scannedFiles = 0;
  }

  /**
   * Main scan function
   */
  async scan() {
    console.log('🔍 Starting brand compliance scan...');
    console.log(`📁 Scanning directories: ${SCAN_DIRECTORIES.join(', ')}`);
    console.log(`🚫 Prohibited patterns: ${PROHIBITED_PATTERNS.join(', ')}`);
    console.log('');

    for (const directory of SCAN_DIRECTORIES) {
      if (fs.existsSync(directory)) {
        await this.scanDirectory(directory);
      } else {
        console.log(`⚠️  Directory ${directory} not found, skipping...`);
      }
    }

    this.reportResults();
    return this.violations.length === 0;
  }

  /**
   * Recursively scan a directory
   */
  async scanDirectory(dirPath) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        // Skip node_modules and other common directories
        if (!['node_modules', '.git', '.next', 'out', 'dist', 'build'].includes(entry.name)) {
          await this.scanDirectory(fullPath);
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (SCAN_EXTENSIONS.includes(ext)) {
          await this.scanFile(fullPath);
        }
      }
    }
  }

  /**
   * Scan a single file for prohibited patterns
   */
  async scanFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      
      this.scannedFiles++;

      lines.forEach((line, lineNumber) => {
        PROHIBITED_PATTERNS.forEach(pattern => {
          if (line.includes(pattern)) {
            // Additional validation to avoid false positives
            if (this.isValidViolation(line, pattern)) {
              this.violations.push({
                file: filePath,
                line: lineNumber + 1,
                pattern: pattern,
                content: line.trim(),
                context: this.getContext(lines, lineNumber)
              });
            }
          }
        });
      });
    } catch (error) {
      console.error(`❌ Error scanning file ${filePath}:`, error.message);
    }
  }

  /**
   * Validate if a pattern match is a real violation
   * Helps avoid false positives in comments, strings, etc.
   */
  isValidViolation(line, pattern) {
    const trimmedLine = line.trim();
    
    // Skip comments
    if (trimmedLine.startsWith('//') || trimmedLine.startsWith('/*') || trimmedLine.startsWith('*')) {
      return false;
    }

    // Skip if it's in a string that's clearly not CSS class
    if (pattern.startsWith('-') && !this.looksLikeCssClass(line, pattern)) {
      return false;
    }

    return true;
  }

  /**
   * Check if the pattern appears to be in a CSS class context
   */
  looksLikeCssClass(line, pattern) {
    // Look for common CSS class patterns
    const cssClassPatterns = [
      /className\s*=\s*["'`][^"'`]*/.test(line),
      /class\s*=\s*["'`][^"'`]*/.test(line),
      /\s+[a-z-]+\s*:\s*/.test(line), // CSS property
      /@apply\s+/.test(line) // Tailwind @apply
    ];

    return cssClassPatterns.some(Boolean);
  }

  /**
   * Get context lines around a violation
   */
  getContext(lines, lineNumber, contextSize = 2) {
    const start = Math.max(0, lineNumber - contextSize);
    const end = Math.min(lines.length, lineNumber + contextSize + 1);
    
    return lines.slice(start, end).map((line, index) => ({
      number: start + index + 1,
      content: line,
      isViolation: start + index === lineNumber
    }));
  }

  /**
   * Report scan results
   */
  reportResults() {
    console.log(`📊 Scan complete: ${this.scannedFiles} files scanned`);
    console.log('');

    if (this.violations.length === 0) {
      console.log('✅ Brand compliance check passed!');
      console.log('   No prohibited color patterns or gradients found.');
      return;
    }

    console.log(`❌ Brand compliance violations found: ${this.violations.length}`);
    console.log('');

    // Group violations by pattern
    const violationsByPattern = {};
    this.violations.forEach(violation => {
      if (!violationsByPattern[violation.pattern]) {
        violationsByPattern[violation.pattern] = [];
      }
      violationsByPattern[violation.pattern].push(violation);
    });

    // Report each pattern group
    Object.entries(violationsByPattern).forEach(([pattern, violations]) => {
      console.log(`🚫 Pattern: "${pattern}" (${violations.length} violations)`);
      
      violations.forEach((violation, index) => {
        console.log(`   ${index + 1}. ${violation.file}:${violation.line}`);
        console.log(`      Content: ${violation.content}`);
        
        if (violation.context) {
          console.log('      Context:');
          violation.context.forEach(ctx => {
            const marker = ctx.isViolation ? '  >>>  ' : '       ';
            console.log(`${marker}${ctx.number}: ${ctx.content}`);
          });
        }
        console.log('');
      });
    });

    console.log('🔧 To fix these violations:');
    console.log('   1. Replace gradient classes with solid brand colors');
    console.log('   2. Use only approved brand colors: brand-pink, brand-pink2, brand-black, brand-white');
    console.log('   3. Remove any indigo, purple, or yellow color variants');
    console.log('');
    console.log('📖 Approved brand colors:');
    console.log('   - brand-pink: #ff2d7a');
    console.log('   - brand-pink2: #d81b60');
    console.log('   - brand-black: #0b0b0b');
    console.log('   - brand-white: #ffffff');
  }
}

/**
 * CLI execution
 */
async function main() {
  const scanner = new BrandComplianceScanner();
  
  try {
    const passed = await scanner.scan();
    
    if (!passed) {
      console.log('');
      console.log('💥 Build failed due to brand compliance violations!');
      process.exit(1);
    }
    
    console.log('');
    console.log('🎉 Brand compliance check passed! Build can continue.');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Brand compliance scan failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = BrandComplianceScanner;