#!/usr/bin/env node

/**
 * Git Move Executor
 * 
 * Executes git mv commands to preserve file history during repository cleanup.
 * Reads categorization manifest and moves files to their designated locations.
 * 
 * Requirements: 2.1
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Move files using git mv commands from categorization manifest
 * 
 * @param {Object} manifest - Categorization manifest with file mappings
 * @param {string} category - Category to process: 'documentation' | 'scripts'
 * @returns {MoveResult} Result object with success status and details
 */
async function moveFiles(manifest, category) {
  console.log(`\n=== Moving ${category} files ===\n`);
  
  const result = {
    success: true,
    moved: [],
    failed: [],
    totalMoved: 0,
    totalFailed: 0
  };
  
  if (!manifest[category]) {
    console.error(`Error: Category '${category}' not found in manifest`);
    result.success = false;
    return result;
  }
  
  const categoryData = manifest[category];
  
  // Process each subcategory
  for (const [subcategory, files] of Object.entries(categoryData)) {
    // Skip protected files - they should not be moved
    if (subcategory === 'protected') {
      console.log(`Skipping ${files.length} protected files`);
      continue;
    }
    
    console.log(`\nProcessing ${subcategory}: ${files.length} files`);
    
    // Determine destination directory
    const destinationDir = category === 'documentation' 
      ? path.join('docs', subcategory)
      : path.join('scripts', subcategory);
    
    // Ensure destination directory exists
    if (!fs.existsSync(destinationDir)) {
      console.log(`Creating directory: ${destinationDir}`);
      fs.mkdirSync(destinationDir, { recursive: true });
    }
    
    // Move each file
    for (const file of files) {
      const source = file;
      const destination = path.join(destinationDir, path.basename(file));
      
      const moveResult = gitMove(source, destination);
      
      if (moveResult.success) {
        // Validate the move was successful
        if (validateMove(source, destination)) {
          result.moved.push({ source, destination });
          result.totalMoved++;
          console.log(`✓ Moved: ${source} → ${destination}`);
        } else {
          result.failed.push({ 
            source, 
            error: 'Move validation failed - file not found at destination' 
          });
          result.totalFailed++;
          result.success = false;
          console.error(`✗ Validation failed: ${source}`);
        }
      } else {
        result.failed.push({ source, error: moveResult.error });
        result.totalFailed++;
        result.success = false;
        console.error(`✗ Failed: ${source} - ${moveResult.error}`);
      }
    }
  }
  
  // Print summary
  console.log(`\n=== Move Summary for ${category} ===`);
  console.log(`Total moved: ${result.totalMoved}`);
  console.log(`Total failed: ${result.totalFailed}`);
  console.log(`Success: ${result.success ? 'Yes' : 'No'}`);
  
  return result;
}

/**
 * Execute git mv command for a single file
 * 
 * @param {string} source - Source file path
 * @param {string} destination - Destination file path
 * @returns {Object} Result with success status and error message if failed
 */
function gitMove(source, destination) {
  try {
    // Check if source file exists
    if (!fs.existsSync(source)) {
      return {
        success: false,
        error: `Source file not found: ${source}`
      };
    }
    
    // Check if destination already exists
    if (fs.existsSync(destination)) {
      return {
        success: false,
        error: `Destination already exists: ${destination}`
      };
    }
    
    // Execute git mv command
    execSync(`git mv "${source}" "${destination}"`, {
      stdio: 'pipe',
      encoding: 'utf-8'
    });
    
    return {
      success: true,
      error: null
    };
  } catch (error) {
    // Parse error message for common issues
    let errorMessage = error.message;
    
    if (errorMessage.includes('fatal: not a git repository')) {
      errorMessage = 'Not a git repository';
    } else if (errorMessage.includes('fatal: bad source')) {
      errorMessage = 'Source file not found or not tracked by git';
    } else if (errorMessage.includes('destination exists')) {
      errorMessage = 'Destination file already exists';
    } else if (errorMessage.includes('Permission denied')) {
      errorMessage = 'Permission denied - file may be locked';
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Validate that a file was moved successfully
 * 
 * @param {string} source - Original source path
 * @param {string} destination - Expected destination path
 * @returns {boolean} True if file exists at destination and not at source
 */
function validateMove(source, destination) {
  // File should exist at destination
  const existsAtDestination = fs.existsSync(destination);
  
  // File should NOT exist at source (it was moved, not copied)
  const notAtSource = !fs.existsSync(source);
  
  return existsAtDestination && notAtSource;
}

/**
 * Main execution function
 */
async function main() {
  try {
    // Read categorization manifest
    const manifestPath = path.join(__dirname, 'categorization-manifest.json');
    
    if (!fs.existsSync(manifestPath)) {
      console.error(`Error: Categorization manifest not found at ${manifestPath}`);
      console.error('Please run categorize-files.js first to generate the manifest.');
      process.exit(1);
    }
    
    const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
    const manifest = JSON.parse(manifestContent);
    
    console.log('Repository Cleanup - Git Move Executor');
    console.log('======================================');
    console.log(`Manifest timestamp: ${manifest.timestamp}`);
    console.log(`Total files to process: ${manifest.totalFiles}`);
    
    // Move documentation files
    const docResult = await moveFiles(manifest, 'documentation');
    
    // Move script files
    const scriptResult = await moveFiles(manifest, 'scripts');
    
    // Generate overall summary
    console.log('\n=== Overall Summary ===');
    console.log(`Documentation files moved: ${docResult.totalMoved}`);
    console.log(`Documentation files failed: ${docResult.totalFailed}`);
    console.log(`Script files moved: ${scriptResult.totalMoved}`);
    console.log(`Script files failed: ${scriptResult.totalFailed}`);
    console.log(`Total moved: ${docResult.totalMoved + scriptResult.totalMoved}`);
    console.log(`Total failed: ${docResult.totalFailed + scriptResult.totalFailed}`);
    
    const overallSuccess = docResult.success && scriptResult.success;
    console.log(`\nOverall success: ${overallSuccess ? 'Yes' : 'No'}`);
    
    // Save move report
    const report = {
      timestamp: new Date().toISOString(),
      documentation: docResult,
      scripts: scriptResult,
      overallSuccess
    };
    
    const reportPath = path.join(__dirname, 'move-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\nMove report saved to: ${reportPath}`);
    
    // Exit with appropriate code
    process.exit(overallSuccess ? 0 : 1);
    
  } catch (error) {
    console.error('\nFatal error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Export functions for testing
module.exports = {
  moveFiles,
  gitMove,
  validateMove
};

// Run main if executed directly
if (require.main === module) {
  main();
}
