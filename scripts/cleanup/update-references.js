#!/usr/bin/env node

/**
 * Path Reference Updater
 * 
 * Updates path references in package.json, GitHub Actions workflows, and scripts
 * after files have been moved during repository cleanup.
 * 
 * Critical paths to validate:
 * - scripts/deploy.js
 * - .github/workflows/*.yml
 * - package.json scripts section
 * 
 * Requirements: 4.7, 8.1-8.5
 */

const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Update all path references across the repository
 * 
 * @param {Map<string, string>} pathMappings - Map of old paths to new paths
 * @returns {Promise<Object>} Update result with statistics
 */
async function updateAllReferences(pathMappings) {
  console.log('\n=== Updating Path References ===\n');
  console.log(`Processing ${pathMappings.size} path mappings...\n`);
  
  const result = {
    success: true,
    packageJson: { updated: 0, errors: [] },
    workflows: { updated: 0, errors: [] },
    scripts: { updated: 0, errors: [] },
    totalUpdated: 0,
    errors: []
  };
  
  try {
    // Update package.json scripts
    console.log('Updating package.json...');
    result.packageJson = await updatePackageJson(pathMappings);
    result.totalUpdated += result.packageJson.updated;
    
    // Update GitHub Actions workflows
    console.log('\nUpdating GitHub Actions workflows...');
    result.workflows = await updateGitHubWorkflows(pathMappings);
    result.totalUpdated += result.workflows.updated;
    
    // Update script references (require/import statements)
    console.log('\nUpdating script references...');
    result.scripts = await updateScriptReferences(pathMappings);
    result.totalUpdated += result.scripts.updated;
    
    // Check if any errors occurred
    if (result.packageJson.errors.length > 0 || 
        result.workflows.errors.length > 0 || 
        result.scripts.errors.length > 0) {
      result.success = false;
      result.errors = [
        ...result.packageJson.errors,
        ...result.workflows.errors,
        ...result.scripts.errors
      ];
    }
    
  } catch (error) {
    console.error('Error during reference updates:', error);
    result.success = false;
    result.errors.push(error.message);
  }
  
  return result;
}

/**
 * Update path references in package.json scripts section
 * 
 * @param {Map<string, string>} pathMappings - Map of old paths to new paths
 * @returns {Promise<Object>} Result with update count and errors
 */
async function updatePackageJson(pathMappings) {
  const result = {
    updated: 0,
    errors: []
  };
  
  try {
    const packageJsonPath = path.resolve(process.cwd(), 'package.json');
    
    // Check if package.json exists
    if (!fsSync.existsSync(packageJsonPath)) {
      result.errors.push('package.json not found');
      return result;
    }
    
    // Read package.json
    const content = await fs.readFile(packageJsonPath, 'utf-8');
    let packageJson = JSON.parse(content);
    
    // Track if any changes were made
    let modified = false;
    
    // Update scripts section
    if (packageJson.scripts) {
      for (const [scriptName, scriptCommand] of Object.entries(packageJson.scripts)) {
        let updatedCommand = scriptCommand;
        
        // Check each path mapping
        for (const [oldPath, newPath] of pathMappings) {
          // Look for the old path in the script command
          if (updatedCommand.includes(oldPath)) {
            updatedCommand = updatedCommand.replace(
              new RegExp(oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
              newPath
            );
            modified = true;
            result.updated++;
            console.log(`  ✓ Updated script "${scriptName}": ${oldPath} → ${newPath}`);
          }
        }
        
        // Update the script if it was modified
        if (updatedCommand !== scriptCommand) {
          packageJson.scripts[scriptName] = updatedCommand;
        }
      }
    }
    
    // Write back to package.json if modified
    if (modified) {
      await fs.writeFile(
        packageJsonPath,
        JSON.stringify(packageJson, null, 2) + '\n',
        'utf-8'
      );
      console.log(`  ✓ package.json updated with ${result.updated} reference(s)`);
    } else {
      console.log('  No updates needed in package.json');
    }
    
  } catch (error) {
    console.error(`  ✗ Error updating package.json: ${error.message}`);
    result.errors.push(`package.json: ${error.message}`);
  }
  
  return result;
}

/**
 * Update path references in GitHub Actions workflow files
 * 
 * @param {Map<string, string>} pathMappings - Map of old paths to new paths
 * @returns {Promise<Object>} Result with update count and errors
 */
async function updateGitHubWorkflows(pathMappings) {
  const result = {
    updated: 0,
    errors: []
  };
  
  try {
    const workflowsDir = path.resolve(process.cwd(), '.github/workflows');
    
    // Check if workflows directory exists
    if (!fsSync.existsSync(workflowsDir)) {
      console.log('  No .github/workflows directory found');
      return result;
    }
    
    // Read all workflow files
    const files = await fs.readdir(workflowsDir);
    const ymlFiles = files.filter(f => f.endsWith('.yml') || f.endsWith('.yaml'));
    
    if (ymlFiles.length === 0) {
      console.log('  No workflow files found');
      return result;
    }
    
    // Process each workflow file
    for (const file of ymlFiles) {
      const filePath = path.join(workflowsDir, file);
      
      try {
        let content = await fs.readFile(filePath, 'utf-8');
        let modified = false;
        let fileUpdateCount = 0;
        
        // Check each path mapping
        for (const [oldPath, newPath] of pathMappings) {
          // Find all references to the old path
          const references = findReferences(content, oldPath);
          
          if (references.length > 0) {
            // Replace all occurrences
            content = content.replace(
              new RegExp(oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
              newPath
            );
            modified = true;
            fileUpdateCount += references.length;
            result.updated += references.length;
            
            console.log(`  ✓ Updated ${file}: ${oldPath} → ${newPath} (${references.length} reference(s))`);
          }
        }
        
        // Write back to file if modified
        if (modified) {
          await fs.writeFile(filePath, content, 'utf-8');
        }
        
      } catch (error) {
        console.error(`  ✗ Error updating ${file}: ${error.message}`);
        result.errors.push(`${file}: ${error.message}`);
      }
    }
    
    if (result.updated === 0) {
      console.log('  No updates needed in workflow files');
    }
    
  } catch (error) {
    console.error(`  ✗ Error processing workflows: ${error.message}`);
    result.errors.push(`workflows: ${error.message}`);
  }
  
  return result;
}

/**
 * Update path references in script files (require/import statements)
 * 
 * @param {Map<string, string>} pathMappings - Map of old paths to new paths
 * @returns {Promise<Object>} Result with update count and errors
 */
async function updateScriptReferences(pathMappings) {
  const result = {
    updated: 0,
    errors: []
  };
  
  try {
    const scriptsDir = path.resolve(process.cwd(), 'scripts');
    
    // Check if scripts directory exists
    if (!fsSync.existsSync(scriptsDir)) {
      console.log('  No scripts directory found');
      return result;
    }
    
    // Get all JavaScript files in scripts directory (recursively)
    const scriptFiles = await getJavaScriptFiles(scriptsDir);
    
    if (scriptFiles.length === 0) {
      console.log('  No script files found');
      return result;
    }
    
    // Process each script file
    for (const filePath of scriptFiles) {
      try {
        let content = await fs.readFile(filePath, 'utf-8');
        let modified = false;
        let fileUpdateCount = 0;
        
        // Check each path mapping
        for (const [oldPath, newPath] of pathMappings) {
          // Look for require() and import statements
          // Patterns to match:
          // - require('path')
          // - require("path")
          // - import ... from 'path'
          // - import ... from "path"
          
          const patterns = [
            new RegExp(`require\\(['"]${oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]\\)`, 'g'),
            new RegExp(`from ['"]${oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'g')
          ];
          
          for (const pattern of patterns) {
            if (pattern.test(content)) {
              content = content.replace(pattern, (match) => {
                return match.replace(oldPath, newPath);
              });
              modified = true;
              fileUpdateCount++;
            }
          }
        }
        
        // Write back to file if modified
        if (modified) {
          await fs.writeFile(filePath, content, 'utf-8');
          result.updated += fileUpdateCount;
          
          const relativePath = path.relative(process.cwd(), filePath);
          console.log(`  ✓ Updated ${relativePath} (${fileUpdateCount} reference(s))`);
        }
        
      } catch (error) {
        const relativePath = path.relative(process.cwd(), filePath);
        console.error(`  ✗ Error updating ${relativePath}: ${error.message}`);
        result.errors.push(`${relativePath}: ${error.message}`);
      }
    }
    
    if (result.updated === 0) {
      console.log('  No updates needed in script files');
    }
    
  } catch (error) {
    console.error(`  ✗ Error processing scripts: ${error.message}`);
    result.errors.push(`scripts: ${error.message}`);
  }
  
  return result;
}

/**
 * Find all references to a path in file content
 * Returns line numbers where references are found
 * 
 * @param {string} content - File content to search
 * @param {string} oldPath - Path to search for
 * @returns {string[]} Array of line numbers with references
 */
function findReferences(content, oldPath) {
  const lines = content.split('\n');
  const references = [];
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(oldPath)) {
      references.push(`Line ${i + 1}`);
    }
  }
  
  return references;
}

/**
 * Recursively get all JavaScript files in a directory
 * 
 * @param {string} dir - Directory to search
 * @returns {Promise<string[]>} Array of file paths
 */
async function getJavaScriptFiles(dir) {
  const files = [];
  
  async function scan(currentDir) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        // Skip node_modules and hidden directories
        if (entry.name !== 'node_modules' && !entry.name.startsWith('.')) {
          await scan(fullPath);
        }
      } else if (entry.isFile() && entry.name.endsWith('.js')) {
        files.push(fullPath);
      }
    }
  }
  
  await scan(dir);
  return files;
}

/**
 * Generate path mappings from move report
 * 
 * @param {Object} moveReport - Move report from git-move-files.js
 * @returns {Map<string, string>} Map of old paths to new paths
 */
function generatePathMappings(moveReport) {
  const mappings = new Map();
  
  // Process documentation moves
  if (moveReport.documentation && moveReport.documentation.moved) {
    for (const move of moveReport.documentation.moved) {
      mappings.set(move.source, move.destination);
    }
  }
  
  // Process script moves
  if (moveReport.scripts && moveReport.scripts.moved) {
    for (const move of moveReport.scripts.moved) {
      mappings.set(move.source, move.destination);
    }
  }
  
  return mappings;
}

/**
 * Main execution function
 */
async function main() {
  try {
    console.log('Repository Cleanup - Path Reference Updater');
    console.log('==========================================');
    
    // Read move report
    const moveReportPath = path.join(__dirname, 'move-report.json');
    
    if (!fsSync.existsSync(moveReportPath)) {
      console.error(`Error: Move report not found at ${moveReportPath}`);
      console.error('Please run git-move-files.js first to generate the move report.');
      process.exit(1);
    }
    
    const moveReportContent = await fs.readFile(moveReportPath, 'utf-8');
    const moveReport = JSON.parse(moveReportContent);
    
    console.log(`Move report timestamp: ${moveReport.timestamp}`);
    
    // Generate path mappings from move report
    const pathMappings = generatePathMappings(moveReport);
    
    if (pathMappings.size === 0) {
      console.log('\nNo path mappings found. Nothing to update.');
      process.exit(0);
    }
    
    // Update all references
    const result = await updateAllReferences(pathMappings);
    
    // Print summary
    console.log('\n=== Update Summary ===');
    console.log(`package.json: ${result.packageJson.updated} reference(s) updated`);
    console.log(`Workflows: ${result.workflows.updated} reference(s) updated`);
    console.log(`Scripts: ${result.scripts.updated} reference(s) updated`);
    console.log(`Total: ${result.totalUpdated} reference(s) updated`);
    
    if (result.errors.length > 0) {
      console.log('\n=== Errors ===');
      for (const error of result.errors) {
        console.error(`  ✗ ${error}`);
      }
    }
    
    console.log(`\nSuccess: ${result.success ? 'Yes' : 'No'}`);
    
    // Save update report
    const report = {
      timestamp: new Date().toISOString(),
      pathMappings: Array.from(pathMappings.entries()).map(([old, newPath]) => ({
        oldPath: old,
        newPath
      })),
      result
    };
    
    const reportPath = path.join(__dirname, 'update-references-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    console.log(`\nUpdate report saved to: ${reportPath}`);
    
    // Exit with appropriate code
    process.exit(result.success ? 0 : 1);
    
  } catch (error) {
    console.error('\nFatal error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Export functions for testing
module.exports = {
  updateAllReferences,
  updatePackageJson,
  updateGitHubWorkflows,
  updateScriptReferences,
  findReferences,
  generatePathMappings,
  getJavaScriptFiles
};

// Run main if executed directly
if (require.main === module) {
  main();
}
