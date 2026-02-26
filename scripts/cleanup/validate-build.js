#!/usr/bin/env node

/**
 * Build Validator for Repository Cleanup
 * 
 * Validates that the build process still works after cleanup operations.
 * Executes npm run build, checks output directory, and analyzes any breakage.
 * 
 * Requirements: 7.1-7.5
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Validates build process after cleanup
 * 
 * @returns {BuildValidationResult} Comprehensive validation result
 */
async function validateBuild() {
  console.log('Starting build validation...');
  
  const result = {
    success: false,
    buildOutput: '',
    outputDirectoryValid: false,
    missingFiles: [],
    suspectedBreakage: [],
    recommendations: []
  };
  
  try {
    // Step 1: Run the build
    console.log('Running npm run build...');
    const buildResult = runBuild();
    result.buildOutput = buildResult.output;
    
    if (!buildResult.success) {
      result.success = false;
      result.recommendations.push('Build failed - review build output for errors');
      
      // Analyze the error to identify potential causes
      if (buildResult.error) {
        const suspectedFiles = analyzeBreakage(buildResult.error);
        result.suspectedBreakage = suspectedFiles;
        
        if (suspectedFiles.length > 0) {
          result.recommendations.push(
            `Check these files for broken path references: ${suspectedFiles.join(', ')}`
          );
        }
      }
      
      return result;
    }
    
    // Step 2: Validate output directory
    console.log('Validating output directory...');
    const outputValidation = validateOutputDirectory();
    result.outputDirectoryValid = outputValidation.valid;
    result.missingFiles = outputValidation.missingFiles;
    
    if (!outputValidation.valid) {
      result.success = false;
      result.recommendations.push('Output directory validation failed');
      
      if (outputValidation.missingFiles.length > 0) {
        result.recommendations.push(
          `Missing expected files: ${outputValidation.missingFiles.join(', ')}`
        );
      }
      
      return result;
    }
    
    // Step 3: All validations passed
    result.success = true;
    result.recommendations.push('Build validation successful - all checks passed');
    console.log('✓ Build validation completed successfully');
    
    return result;
    
  } catch (error) {
    result.success = false;
    result.buildOutput = error.message;
    result.recommendations.push(`Unexpected error during validation: ${error.message}`);
    
    return result;
  }
}

/**
 * Executes npm run build
 * 
 * @returns {{ success: boolean, output: string, error: string | null }}
 */
function runBuild() {
  try {
    console.log('Executing: npm run build');
    
    const output = execSync('npm run build', {
      encoding: 'utf-8',
      stdio: 'pipe',
      maxBuffer: 10 * 1024 * 1024 // 10MB buffer for large build outputs
    });
    
    return {
      success: true,
      output: output,
      error: null
    };
    
  } catch (error) {
    // Build failed - capture error details
    return {
      success: false,
      output: error.stdout ? error.stdout.toString() : '',
      error: error.stderr ? error.stderr.toString() : error.message
    };
  }
}

/**
 * Validates output directory exists and contains expected files
 * 
 * @returns {{ valid: boolean, missingFiles: string[] }}
 */
function validateOutputDirectory() {
  const outputDir = path.join(process.cwd(), 'out');
  const missingFiles = [];
  
  // Check if output directory exists
  if (!fs.existsSync(outputDir)) {
    return {
      valid: false,
      missingFiles: ['out/ directory not found']
    };
  }
  
  // Expected files/directories in a Next.js static export
  const expectedPaths = [
    'index.html',           // Homepage
    '_next',                // Next.js assets directory
    '404.html'              // 404 page
  ];
  
  // Check for expected files
  for (const expectedPath of expectedPaths) {
    const fullPath = path.join(outputDir, expectedPath);
    if (!fs.existsSync(fullPath)) {
      missingFiles.push(expectedPath);
    }
  }
  
  // Additional validation: check if _next directory has content
  const nextDir = path.join(outputDir, '_next');
  if (fs.existsSync(nextDir)) {
    const nextDirContents = fs.readdirSync(nextDir);
    if (nextDirContents.length === 0) {
      missingFiles.push('_next/ directory is empty');
    }
  }
  
  return {
    valid: missingFiles.length === 0,
    missingFiles
  };
}

/**
 * Analyzes build error to identify suspected broken files
 * 
 * @param {string} buildError - Error output from build process
 * @returns {string[]} Array of suspected file paths
 */
function analyzeBreakage(buildError) {
  const suspectedFiles = [];
  
  if (!buildError) {
    return suspectedFiles;
  }
  
  // Pattern 1: Module not found errors
  const moduleNotFoundPattern = /Cannot find module ['"]([^'"]+)['"]/g;
  let match;
  while ((match = moduleNotFoundPattern.exec(buildError)) !== null) {
    suspectedFiles.push(match[1]);
  }
  
  // Pattern 2: File not found errors
  const fileNotFoundPattern = /ENOENT: no such file or directory[,\s]+(?:open|scandir|stat) ['"]([^'"]+)['"]/g;
  while ((match = fileNotFoundPattern.exec(buildError)) !== null) {
    suspectedFiles.push(match[1]);
  }
  
  // Pattern 3: Import/require errors with file paths
  const importErrorPattern = /Error: (?:Cannot find|Unable to resolve) ['"]([^'"]+)['"]/g;
  while ((match = importErrorPattern.exec(buildError)) !== null) {
    suspectedFiles.push(match[1]);
  }
  
  // Pattern 4: TypeScript/JavaScript file references
  const fileReferencePattern = /(?:at|in|from) ([^\s]+\.(?:js|ts|jsx|tsx|mjs|cjs))/g;
  while ((match = fileReferencePattern.exec(buildError)) !== null) {
    const filePath = match[1];
    // Only include if it looks like a project file (not node_modules)
    if (!filePath.includes('node_modules')) {
      suspectedFiles.push(filePath);
    }
  }
  
  // Pattern 5: Script path errors (for moved scripts)
  const scriptPathPattern = /scripts\/([^\s'"]+)/g;
  while ((match = scriptPathPattern.exec(buildError)) !== null) {
    suspectedFiles.push(`scripts/${match[1]}`);
  }
  
  // Remove duplicates and return
  return [...new Set(suspectedFiles)];
}

/**
 * Generates a formatted report of validation results
 * 
 * @param {BuildValidationResult} result - Validation result
 * @returns {string} Formatted report
 */
function generateReport(result) {
  const lines = [];
  
  lines.push('='.repeat(60));
  lines.push('BUILD VALIDATION REPORT');
  lines.push('='.repeat(60));
  lines.push('');
  
  lines.push(`Status: ${result.success ? '✓ PASSED' : '✗ FAILED'}`);
  lines.push(`Output Directory Valid: ${result.outputDirectoryValid ? 'Yes' : 'No'}`);
  lines.push('');
  
  if (result.missingFiles.length > 0) {
    lines.push('Missing Files:');
    result.missingFiles.forEach(file => {
      lines.push(`  - ${file}`);
    });
    lines.push('');
  }
  
  if (result.suspectedBreakage.length > 0) {
    lines.push('Suspected Broken References:');
    result.suspectedBreakage.forEach(file => {
      lines.push(`  - ${file}`);
    });
    lines.push('');
  }
  
  if (result.recommendations.length > 0) {
    lines.push('Recommendations:');
    result.recommendations.forEach(rec => {
      lines.push(`  - ${rec}`);
    });
    lines.push('');
  }
  
  if (!result.success && result.buildOutput) {
    lines.push('Build Output (last 50 lines):');
    lines.push('-'.repeat(60));
    const outputLines = result.buildOutput.split('\n');
    const lastLines = outputLines.slice(-50);
    lines.push(lastLines.join('\n'));
    lines.push('-'.repeat(60));
  }
  
  lines.push('');
  lines.push('='.repeat(60));
  
  return lines.join('\n');
}

// CLI execution
if (require.main === module) {
  (async () => {
    try {
      const result = await validateBuild();
      
      // Generate and display report
      const report = generateReport(result);
      console.log('\n' + report);
      
      // Exit with appropriate code
      process.exit(result.success ? 0 : 1);
      
    } catch (error) {
      console.error('Fatal error during build validation:', error);
      process.exit(1);
    }
  })();
}

// Export functions for testing
module.exports = {
  validateBuild,
  runBuild,
  validateOutputDirectory,
  analyzeBreakage,
  generateReport
};
