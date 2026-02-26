#!/usr/bin/env node

/**
 * File Categorization System
 * 
 * Scans root directory and classifies files into categories:
 * - Documentation: summaries, audits, architecture, decisions, archive, protected
 * - Scripts: fixes, migrations, utilities
 * 
 * Generates a categorization manifest as JSON for use by git-move-files.js
 */

const fs = require('fs').promises;
const path = require('path');

// Load configuration
const CONFIG_PATH = path.join(__dirname, 'config.json');
let config;

/**
 * Load configuration from config.json
 */
async function loadConfig() {
  const configContent = await fs.readFile(CONFIG_PATH, 'utf-8');
  config = JSON.parse(configContent);
  return config;
}

/**
 * Check if a file is protected (governance files that must remain at root)
 * @param {string} filename - The filename to check
 * @returns {boolean} - True if file is protected
 */
function isProtectedFile(filename) {
  if (!config) {
    throw new Error('Configuration not loaded. Call loadConfig() first.');
  }
  return config.protectedFiles.includes(filename);
}

/**
 * Check if a file is older than the archive threshold (90 days)
 * @param {string} filepath - The full path to the file
 * @returns {boolean} - True if file is older than threshold
 */
async function isOlderThan90Days(filepath) {
  try {
    const stats = await fs.stat(filepath);
    const fileAge = Date.now() - stats.mtime.getTime();
    const daysOld = fileAge / (1000 * 60 * 60 * 24);
    return daysOld > config.archiveThresholdDays;
  } catch (error) {
    console.warn(`Could not get file stats for ${filepath}: ${error.message}`);
    return false;
  }
}

/**
 * Check if a pattern matches a filename (supports wildcards)
 * @param {string} pattern - Pattern with wildcards (e.g., "*DEPLOYMENT*")
 * @param {string} filename - Filename to match against
 * @returns {boolean} - True if pattern matches
 */
function matchesPattern(pattern, filename) {
  // Convert wildcard pattern to regex
  const regexPattern = pattern
    .replace(/\*/g, '.*')
    .replace(/\?/g, '.');
  
  const regex = new RegExp(`^${regexPattern}$`, 'i'); // Case-insensitive
  return regex.test(filename);
}

/**
 * Classify a documentation file into a category
 * @param {string} filename - The filename to classify
 * @returns {string|null} - Category name or null if not documentation
 */
function classifyDocumentation(filename) {
  // Check if protected first
  if (isProtectedFile(filename)) {
    return 'protected';
  }
  
  // Check if it's a markdown file (documentation)
  if (!filename.endsWith('.md')) {
    return null;
  }
  
  const categories = config.categorization.documentation;
  
  // Check categories in priority order (most specific first)
  // This prevents broader patterns from matching before specific ones
  const priorityOrder = ['audits', 'decisions', 'architecture', 'summaries'];
  
  for (const category of priorityOrder) {
    const patterns = categories[category];
    if (!patterns) continue;
    
    for (const pattern of patterns) {
      if (matchesPattern(pattern, filename)) {
        return category;
      }
    }
  }
  
  // If no pattern matches but it's a markdown file, it might be a decision/reference doc
  return null;
}

/**
 * Classify a script file into a category
 * @param {string} filename - The filename to classify
 * @returns {string|null} - Category name or null if not a script
 */
function classifyScript(filename) {
  // Only classify .js files
  if (!filename.endsWith('.js')) {
    return null;
  }
  
  const categories = config.categorization.scripts;
  
  // Check each category's patterns
  for (const [category, patterns] of Object.entries(categories)) {
    for (const pattern of patterns) {
      if (matchesPattern(pattern, filename)) {
        return category;
      }
    }
  }
  
  return null;
}

/**
 * Check if a directory should be protected from scanning
 * @param {string} dirname - Directory name to check
 * @returns {boolean} - True if directory is protected
 */
function isProtectedDirectory(dirname) {
  for (const protectedPattern of config.protectedDirectories) {
    // Handle wildcard patterns like "build-*"
    if (protectedPattern.includes('*')) {
      const regex = new RegExp(`^${protectedPattern.replace(/\*/g, '.*')}$`);
      if (regex.test(dirname)) {
        return true;
      }
    } else if (dirname === protectedPattern) {
      return true;
    }
  }
  return false;
}

/**
 * Scan root directory and categorize all files
 * @returns {Promise<Object>} - Categorization manifest
 */
async function categorizeFiles() {
  // Load configuration
  await loadConfig();
  
  const rootDir = path.resolve(__dirname, '../..');
  const entries = await fs.readdir(rootDir, { withFileTypes: true });
  
  const manifest = {
    documentation: {
      summaries: [],
      audits: [],
      architecture: [],
      decisions: [],
      archive: [],
      protected: []
    },
    scripts: {
      fixes: [],
      migrations: [],
      utilities: []
    },
    timestamp: new Date().toISOString(),
    totalFiles: 0
  };
  
  // Process each entry in root directory
  for (const entry of entries) {
    // Skip directories
    if (entry.isDirectory()) {
      continue;
    }
    
    const filename = entry.name;
    const filepath = path.join(rootDir, filename);
    
    // Skip hidden files and special files
    if (filename.startsWith('.') || filename === 'package.json' || filename === 'package-lock.json') {
      continue;
    }
    
    // Try to classify as documentation
    const docCategory = classifyDocumentation(filename);
    if (docCategory) {
      // Check if file should be archived due to age
      const isOld = await isOlderThan90Days(filepath);
      
      if (docCategory === 'protected') {
        manifest.documentation.protected.push(filename);
        manifest.totalFiles++;
      } else if (isOld) {
        manifest.documentation.archive.push(filename);
        manifest.totalFiles++;
      } else {
        manifest.documentation[docCategory].push(filename);
        manifest.totalFiles++;
      }
      continue;
    }
    
    // Try to classify as script
    const scriptCategory = classifyScript(filename);
    if (scriptCategory) {
      manifest.scripts[scriptCategory].push(filename);
      manifest.totalFiles++;
      continue;
    }
  }
  
  return manifest;
}

/**
 * Save categorization manifest to JSON file
 * @param {Object} manifest - The categorization manifest
 * @param {string} outputPath - Path to save the manifest
 */
async function saveManifest(manifest, outputPath) {
  await fs.writeFile(outputPath, JSON.stringify(manifest, null, 2), 'utf-8');
  console.log(`Categorization manifest saved to: ${outputPath}`);
}

/**
 * Main execution function
 */
async function main() {
  try {
    console.log('Starting file categorization...');
    
    const manifest = await categorizeFiles();
    
    // Print summary
    console.log('\n=== Categorization Summary ===');
    console.log(`Total files categorized: ${manifest.totalFiles}`);
    console.log('\nDocumentation:');
    console.log(`  Summaries: ${manifest.documentation.summaries.length}`);
    console.log(`  Audits: ${manifest.documentation.audits.length}`);
    console.log(`  Architecture: ${manifest.documentation.architecture.length}`);
    console.log(`  Decisions: ${manifest.documentation.decisions.length}`);
    console.log(`  Archive: ${manifest.documentation.archive.length}`);
    console.log(`  Protected: ${manifest.documentation.protected.length}`);
    console.log('\nScripts:');
    console.log(`  Fixes: ${manifest.scripts.fixes.length}`);
    console.log(`  Migrations: ${manifest.scripts.migrations.length}`);
    console.log(`  Utilities: ${manifest.scripts.utilities.length}`);
    
    // Save manifest
    const manifestPath = path.join(__dirname, 'categorization-manifest.json');
    await saveManifest(manifest, manifestPath);
    
    console.log('\nCategorization complete!');
    return manifest;
  } catch (error) {
    console.error('Error during categorization:', error);
    process.exit(1);
  }
}

// Export functions for testing
module.exports = {
  categorizeFiles,
  classifyDocumentation,
  classifyScript,
  isProtectedFile,
  isOlderThan90Days,
  loadConfig,
  saveManifest
};

// Run main if executed directly
if (require.main === module) {
  main();
}
