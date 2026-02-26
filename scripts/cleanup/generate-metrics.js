#!/usr/bin/env node

/**
 * Metrics Reporter for Repository Cleanup
 * 
 * Generates cleanup success metrics including:
 * - Root file count before/after
 * - Percentage reduction
 * - Files moved to each category
 * - Documentation search time improvement
 * - Success determination (80% threshold)
 * 
 * Requirements: 10.1-10.7
 */

const fs = require('fs').promises;
const path = require('path');

/**
 * Generates comprehensive cleanup metrics
 * 
 * @param {Object} beforeState - Repository state before cleanup
 * @param {Object} afterState - Repository state after cleanup
 * @returns {Promise<CleanupMetrics>} Cleanup metrics report
 */
async function generateMetrics(beforeState, afterState) {
  const rootFilesBefore = beforeState.rootFileCount || await countRootFiles('.');
  const rootFilesAfter = afterState.rootFileCount || await countRootFiles('.');
  
  const reductionPercentage = calculateReduction(rootFilesBefore, rootFilesAfter);
  
  // Count files moved to each category
  const filesMoved = {
    summaries: afterState.filesMoved?.summaries || 0,
    audits: afterState.filesMoved?.audits || 0,
    architecture: afterState.filesMoved?.architecture || 0,
    decisions: afterState.filesMoved?.decisions || 0,
    archive: afterState.filesMoved?.archive || 0,
    fixes: afterState.filesMoved?.fixes || 0,
    migrations: afterState.filesMoved?.migrations || 0,
    utilities: afterState.filesMoved?.utilities || 0,
  };
  
  // Measure search time improvement
  const searchTimeBefore = beforeState.searchTime || await measureSearchTime('deployment');
  const searchTimeAfter = afterState.searchTime || await measureSearchTime('deployment');
  const searchTimeImprovement = calculateReduction(searchTimeBefore, searchTimeAfter);
  
  // Determine success based on 80% search time improvement threshold
  const success = determineSuccess({
    reductionPercentage,
    searchTimeImprovement,
  });
  
  return {
    rootFilesBefore,
    rootFilesAfter,
    reductionPercentage,
    filesMoved,
    searchTimeBefore,
    searchTimeAfter,
    searchTimeImprovement,
    success,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Counts files in the root directory (excluding directories and protected files)
 * 
 * @param {string} directory - Directory path to count files in
 * @returns {Promise<number>} Number of files in root directory
 */
async function countRootFiles(directory) {
  try {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    
    // Protected directories to exclude
    const protectedDirs = [
      'node_modules',
      'out',
      'build-',
      'playwright-report',
      'test-results',
      'temp-build',
      'temp-privacy',
      'src',
      'config',
      'public',
      '.git',
      '.next',
      'docs',
      'scripts',
      'tests',
    ];
    
    // Count only files (not directories) in root
    let count = 0;
    for (const entry of entries) {
      if (entry.isFile()) {
        // Exclude hidden files and package-lock.json
        if (!entry.name.startsWith('.') && entry.name !== 'package-lock.json') {
          count++;
        }
      }
    }
    
    return count;
  } catch (error) {
    console.error(`Error counting root files: ${error.message}`);
    return 0;
  }
}

/**
 * Simulates finding a documentation file by searching through directories
 * Measures time to locate a file matching the search term
 * 
 * @param {string} searchTerm - Term to search for in documentation
 * @returns {Promise<number>} Time in milliseconds to find documentation
 */
async function measureSearchTime(searchTerm) {
  const startTime = Date.now();
  
  try {
    // Simulate searching through root directory first
    const rootEntries = await fs.readdir('.', { withFileTypes: true });
    let found = false;
    
    // Search root files
    for (const entry of rootEntries) {
      if (entry.isFile() && entry.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        found = true;
        break;
      }
    }
    
    // If not found in root, search docs directory (organized structure)
    if (!found) {
      try {
        const docsPath = path.join('.', 'docs');
        const docsDirs = await fs.readdir(docsPath, { withFileTypes: true });
        
        for (const dir of docsDirs) {
          if (dir.isDirectory()) {
            const dirPath = path.join(docsPath, dir.name);
            const files = await fs.readdir(dirPath);
            
            for (const file of files) {
              if (file.toLowerCase().includes(searchTerm.toLowerCase())) {
                found = true;
                break;
              }
            }
            
            if (found) break;
          }
        }
      } catch (error) {
        // docs directory doesn't exist yet (before cleanup)
      }
    }
    
    const endTime = Date.now();
    return endTime - startTime;
  } catch (error) {
    console.error(`Error measuring search time: ${error.message}`);
    // Return a default time if measurement fails
    return 100;
  }
}

/**
 * Calculates percentage reduction between before and after values
 * 
 * @param {number} before - Value before cleanup
 * @param {number} after - Value after cleanup
 * @returns {number} Percentage reduction (0-100)
 */
function calculateReduction(before, after) {
  if (before === 0) return 0;
  
  const reduction = ((before - after) / before) * 100;
  return Math.max(0, Math.round(reduction * 100) / 100); // Round to 2 decimal places
}

/**
 * Determines if cleanup was successful based on metrics
 * Success criteria: 80% or more search time improvement
 * 
 * @param {Object} metrics - Metrics object with reductionPercentage and searchTimeImprovement
 * @returns {boolean} True if cleanup meets success criteria
 */
function determineSuccess(metrics) {
  // Primary success criterion: 80% or more search time improvement
  return metrics.searchTimeImprovement >= 80;
}

/**
 * Formats and displays cleanup metrics report
 * 
 * @param {CleanupMetrics} metrics - Cleanup metrics to display
 */
function displayMetricsReport(metrics) {
  console.log('\n' + '='.repeat(60));
  console.log('REPOSITORY CLEANUP METRICS REPORT');
  console.log('='.repeat(60));
  console.log(`\nTimestamp: ${metrics.timestamp}`);
  console.log(`\n📊 ROOT FILE REDUCTION`);
  console.log(`   Before: ${metrics.rootFilesBefore} files`);
  console.log(`   After:  ${metrics.rootFilesAfter} files`);
  console.log(`   Reduction: ${metrics.reductionPercentage}%`);
  
  console.log(`\n📁 FILES MOVED BY CATEGORY`);
  console.log(`   Documentation:`);
  console.log(`     - Summaries:     ${metrics.filesMoved.summaries}`);
  console.log(`     - Audits:        ${metrics.filesMoved.audits}`);
  console.log(`     - Architecture:  ${metrics.filesMoved.architecture}`);
  console.log(`     - Decisions:     ${metrics.filesMoved.decisions}`);
  console.log(`     - Archive:       ${metrics.filesMoved.archive}`);
  console.log(`   Scripts:`);
  console.log(`     - Fixes:         ${metrics.filesMoved.fixes}`);
  console.log(`     - Migrations:    ${metrics.filesMoved.migrations}`);
  console.log(`     - Utilities:     ${metrics.filesMoved.utilities}`);
  
  const totalMoved = Object.values(metrics.filesMoved).reduce((sum, count) => sum + count, 0);
  console.log(`   Total Moved: ${totalMoved} files`);
  
  console.log(`\n🔍 SEARCH TIME IMPROVEMENT`);
  console.log(`   Before: ${metrics.searchTimeBefore}ms`);
  console.log(`   After:  ${metrics.searchTimeAfter}ms`);
  console.log(`   Improvement: ${metrics.searchTimeImprovement}%`);
  
  console.log(`\n✅ SUCCESS DETERMINATION`);
  console.log(`   Status: ${metrics.success ? '✓ SUCCESSFUL' : '✗ NEEDS IMPROVEMENT'}`);
  console.log(`   Threshold: 80% search time improvement`);
  console.log(`   Achieved: ${metrics.searchTimeImprovement}%`);
  
  if (metrics.success) {
    console.log(`\n🎉 Cleanup completed successfully!`);
    console.log(`   Repository is now more organized and navigable.`);
  } else {
    console.log(`\n⚠️  Cleanup did not meet success criteria.`);
    console.log(`   Consider additional organization or review categorization rules.`);
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
}

/**
 * Saves metrics report to JSON file
 * 
 * @param {CleanupMetrics} metrics - Metrics to save
 * @param {string} outputPath - Path to save metrics file
 */
async function saveMetricsReport(metrics, outputPath = 'cleanup-metrics.json') {
  try {
    await fs.writeFile(outputPath, JSON.stringify(metrics, null, 2), 'utf-8');
    console.log(`✓ Metrics report saved to ${outputPath}`);
  } catch (error) {
    console.error(`Error saving metrics report: ${error.message}`);
  }
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage: node generate-metrics.js [options]

Options:
  --before-count <number>    Root file count before cleanup
  --after-count <number>     Root file count after cleanup
  --before-search <number>   Search time before cleanup (ms)
  --after-search <number>    Search time after cleanup (ms)
  --output <path>            Output path for metrics JSON file
  --help, -h                 Show this help message

Example:
  node generate-metrics.js --before-count 150 --after-count 30
    `);
    process.exit(0);
  }
  
  // Parse command line arguments
  const beforeCount = args.includes('--before-count') 
    ? parseInt(args[args.indexOf('--before-count') + 1]) 
    : null;
  const afterCount = args.includes('--after-count') 
    ? parseInt(args[args.indexOf('--after-count') + 1]) 
    : null;
  const beforeSearch = args.includes('--before-search') 
    ? parseInt(args[args.indexOf('--before-search') + 1]) 
    : null;
  const afterSearch = args.includes('--after-search') 
    ? parseInt(args[args.indexOf('--after-search') + 1]) 
    : null;
  const outputPath = args.includes('--output') 
    ? args[args.indexOf('--output') + 1] 
    : 'cleanup-metrics.json';
  
  // Build state objects
  const beforeState = {
    rootFileCount: beforeCount,
    searchTime: beforeSearch,
  };
  
  const afterState = {
    rootFileCount: afterCount,
    searchTime: afterSearch,
    filesMoved: {
      summaries: 0,
      audits: 0,
      architecture: 0,
      decisions: 0,
      archive: 0,
      fixes: 0,
      migrations: 0,
      utilities: 0,
    },
  };
  
  // Generate and display metrics
  generateMetrics(beforeState, afterState)
    .then(metrics => {
      displayMetricsReport(metrics);
      return saveMetricsReport(metrics, outputPath);
    })
    .catch(error => {
      console.error(`Error generating metrics: ${error.message}`);
      process.exit(1);
    });
}

module.exports = {
  generateMetrics,
  countRootFiles,
  measureSearchTime,
  calculateReduction,
  determineSuccess,
  displayMetricsReport,
  saveMetricsReport,
};
