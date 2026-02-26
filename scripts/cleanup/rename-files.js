#!/usr/bin/env node

/**
 * File Renaming System
 * 
 * Renames files with standardized date prefixes following YYYY-MM-DD format.
 * Supports multiple date formats in filenames:
 * - FEB-22-2026, NOV-11-2025 (month abbreviation format)
 * - 2025-10-15 (ISO date format)
 * - 20251014 (compact date format)
 * - 1760532969283 (Unix timestamp)
 * 
 * Falls back to file modification date when no date is found in filename.
 * Uses git mv to preserve file history.
 */

const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Date extraction patterns
const DATE_PATTERNS = [
  {
    // FEB-22-2026, NOV-11-2025, DEC-18-2025
    regex: /(\w{3})-(\d{1,2})-(\d{4})/i,
    extract: (match) => {
      const monthMap = {
        'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'may': 4, 'jun': 5,
        'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11
      };
      const month = monthMap[match[1].toLowerCase()];
      const day = parseInt(match[2], 10);
      const year = parseInt(match[3], 10);
      
      if (month === undefined || isNaN(day) || isNaN(year)) {
        return null;
      }
      
      return new Date(year, month, day);
    }
  },
  {
    // 2025-10-15 (ISO date format)
    regex: /(\d{4})-(\d{2})-(\d{2})/,
    extract: (match) => {
      const year = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1; // 0-indexed
      const day = parseInt(match[3], 10);
      
      if (isNaN(year) || isNaN(month) || isNaN(day)) {
        return null;
      }
      
      return new Date(year, month, day);
    }
  },
  {
    // 20251014 (compact date format)
    regex: /(\d{8})/,
    extract: (match) => {
      const dateStr = match[1];
      const year = parseInt(dateStr.substring(0, 4), 10);
      const month = parseInt(dateStr.substring(4, 6), 10) - 1; // 0-indexed
      const day = parseInt(dateStr.substring(6, 8), 10);
      
      if (isNaN(year) || isNaN(month) || isNaN(day)) {
        return null;
      }
      
      // Validate date is reasonable
      if (year < 2000 || year > 2100 || month < 0 || month > 11 || day < 1 || day > 31) {
        return null;
      }
      
      return new Date(year, month, day);
    }
  },
  {
    // 1760532969283 (Unix timestamp in milliseconds)
    regex: /(\d{13})/,
    extract: (match) => {
      const timestamp = parseInt(match[1], 10);
      
      if (isNaN(timestamp)) {
        return null;
      }
      
      // Validate timestamp is reasonable (between 2000 and 2100)
      const date = new Date(timestamp);
      if (date.getFullYear() < 2000 || date.getFullYear() > 2100) {
        return null;
      }
      
      return date;
    }
  }
];

/**
 * Extract date from filename using various date format patterns
 * @param {string} filename - The filename to extract date from
 * @returns {Date|null} - Extracted date or null if no date found
 */
function extractDate(filename) {
  for (const pattern of DATE_PATTERNS) {
    const match = filename.match(pattern.regex);
    if (match) {
      try {
        const date = pattern.extract(match);
        if (date && !isNaN(date.getTime())) {
          return date;
        }
      } catch (error) {
        // Continue to next pattern if extraction fails
        continue;
      }
    }
  }
  
  return null;
}

/**
 * Format date as YYYY-MM-DD
 * @param {Date} date - The date to format
 * @returns {string} - Formatted date string
 */
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Get file modification date as fallback
 * @param {string} filepath - Full path to the file
 * @returns {Date} - File modification date
 */
function getFileModificationDate(filepath) {
  const stats = fsSync.statSync(filepath);
  return stats.mtime;
}

/**
 * Generate new filename with YYYY-MM-DD prefix
 * Follows pattern: YYYY-MM-DD-purpose-topic.ext
 * @param {string} oldFilename - Original filename
 * @param {Date} date - Date to use for prefix
 * @returns {string} - New filename with date prefix
 */
function generateNewFilename(oldFilename, date) {
  // Extract file extension
  const ext = path.extname(oldFilename);
  const basename = path.basename(oldFilename, ext);
  
  // Format date as YYYY-MM-DD
  const datePrefix = formatDate(date);
  
  // Remove existing date patterns from basename
  let cleanBasename = basename;
  
  // Remove month-day-year patterns (FEB-22-2026)
  cleanBasename = cleanBasename.replace(/\w{3}-\d{1,2}-\d{4}/gi, '');
  
  // Remove ISO date patterns (2025-10-15)
  cleanBasename = cleanBasename.replace(/\d{4}-\d{2}-\d{2}/g, '');
  
  // Remove compact date patterns (20251014)
  cleanBasename = cleanBasename.replace(/\d{8}/g, '');
  
  // Remove timestamp patterns (1760532969283)
  cleanBasename = cleanBasename.replace(/\d{13}/g, '');
  
  // Clean up multiple dashes and leading/trailing dashes
  cleanBasename = cleanBasename
    .replace(/--+/g, '-')  // Replace multiple dashes with single dash
    .replace(/^-+|-+$/g, '');  // Remove leading/trailing dashes
  
  // If basename is empty after cleaning, use a generic name
  if (!cleanBasename) {
    cleanBasename = 'document';
  }
  
  // Construct new filename
  return `${datePrefix}-${cleanBasename}${ext}`;
}

/**
 * Execute git mv command to rename file
 * @param {string} oldPath - Current file path
 * @param {string} newPath - New file path
 * @returns {boolean} - True if rename succeeded
 */
function gitMove(oldPath, newPath) {
  try {
    execSync(`git mv "${oldPath}" "${newPath}"`, { stdio: 'pipe' });
    return true;
  } catch (error) {
    console.error(`Failed to git mv "${oldPath}" to "${newPath}": ${error.message}`);
    return false;
  }
}

/**
 * Rename files in a directory with standardized date prefixes
 * @param {string} directory - Directory to process
 * @returns {Promise<Object>} - Rename result with statistics
 */
async function renameFiles(directory) {
  const result = {
    success: true,
    renamed: [],
    skipped: [],
    failed: [],
    totalRenamed: 0,
    totalSkipped: 0,
    totalFailed: 0
  };
  
  try {
    // Read directory contents
    const entries = await fs.readdir(directory, { withFileTypes: true });
    
    for (const entry of entries) {
      // Skip directories
      if (entry.isDirectory()) {
        continue;
      }
      
      const filename = entry.name;
      const filepath = path.join(directory, filename);
      
      // Skip hidden files
      if (filename.startsWith('.')) {
        result.skipped.push({ filename, reason: 'Hidden file' });
        result.totalSkipped++;
        continue;
      }
      
      // Extract date from filename or use modification date
      let date = extractDate(filename);
      let dateSource = 'filename';
      
      if (!date) {
        date = getFileModificationDate(filepath);
        dateSource = 'modification_time';
      }
      
      // Generate new filename
      const newFilename = generateNewFilename(filename, date);
      
      // Skip if filename is already in correct format
      if (newFilename === filename) {
        result.skipped.push({ filename, reason: 'Already in correct format' });
        result.totalSkipped++;
        continue;
      }
      
      // Check if target filename already exists
      const newFilepath = path.join(directory, newFilename);
      if (fsSync.existsSync(newFilepath)) {
        result.skipped.push({ 
          filename, 
          reason: `Target filename already exists: ${newFilename}` 
        });
        result.totalSkipped++;
        continue;
      }
      
      // Execute git mv
      const success = gitMove(filepath, newFilepath);
      
      if (success) {
        result.renamed.push({
          oldName: filename,
          newName: newFilename,
          date: formatDate(date),
          dateSource
        });
        result.totalRenamed++;
      } else {
        result.failed.push({
          filename,
          error: 'Git mv command failed'
        });
        result.totalFailed++;
        result.success = false;
      }
    }
  } catch (error) {
    console.error(`Error processing directory ${directory}:`, error);
    result.success = false;
    result.failed.push({
      directory,
      error: error.message
    });
  }
  
  return result;
}

/**
 * Main execution function
 */
async function main() {
  try {
    console.log('Starting file renaming with date standardization...\n');
    
    // Get directories to process from command line or use defaults
    const directories = process.argv.slice(2);
    
    if (directories.length === 0) {
      console.log('Usage: node rename-files.js <directory1> [directory2] ...');
      console.log('Example: node rename-files.js docs/summaries docs/audits');
      process.exit(1);
    }
    
    const allResults = [];
    
    for (const dir of directories) {
      const fullPath = path.resolve(dir);
      
      // Check if directory exists
      if (!fsSync.existsSync(fullPath)) {
        console.error(`Directory not found: ${dir}`);
        continue;
      }
      
      console.log(`Processing directory: ${dir}`);
      const result = await renameFiles(fullPath);
      allResults.push({ directory: dir, result });
      
      // Print summary for this directory
      console.log(`  Renamed: ${result.totalRenamed}`);
      console.log(`  Skipped: ${result.totalSkipped}`);
      console.log(`  Failed: ${result.totalFailed}\n`);
    }
    
    // Print overall summary
    console.log('=== Overall Summary ===');
    const totalRenamed = allResults.reduce((sum, r) => sum + r.result.totalRenamed, 0);
    const totalSkipped = allResults.reduce((sum, r) => sum + r.result.totalSkipped, 0);
    const totalFailed = allResults.reduce((sum, r) => sum + r.result.totalFailed, 0);
    
    console.log(`Total renamed: ${totalRenamed}`);
    console.log(`Total skipped: ${totalSkipped}`);
    console.log(`Total failed: ${totalFailed}`);
    
    // Print detailed results if requested
    if (process.argv.includes('--verbose')) {
      console.log('\n=== Detailed Results ===');
      for (const { directory, result } of allResults) {
        console.log(`\nDirectory: ${directory}`);
        
        if (result.renamed.length > 0) {
          console.log('  Renamed files:');
          for (const item of result.renamed) {
            console.log(`    ${item.oldName} -> ${item.newName} (date from ${item.dateSource})`);
          }
        }
        
        if (result.failed.length > 0) {
          console.log('  Failed files:');
          for (const item of result.failed) {
            console.log(`    ${item.filename}: ${item.error}`);
          }
        }
      }
    }
    
    console.log('\nFile renaming complete!');
    
    // Exit with error code if any failures
    const hasFailures = allResults.some(r => !r.result.success);
    process.exit(hasFailures ? 1 : 0);
    
  } catch (error) {
    console.error('Error during file renaming:', error);
    process.exit(1);
  }
}

// Export functions for testing
module.exports = {
  renameFiles,
  extractDate,
  formatDate,
  generateNewFilename,
  getFileModificationDate,
  gitMove
};

// Run main if executed directly
if (require.main === module) {
  main();
}
