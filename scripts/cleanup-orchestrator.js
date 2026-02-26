#!/usr/bin/env node

/**
 * Cleanup Orchestrator
 * 
 * Coordinates execution of all cleanup phases in sequence:
 * 1. Folder creation
 * 2. File categorization
 * 3. Documentation moves
 * 4. Script consolidation
 * 5. File renaming
 * 6. Path reference updates
 * 7. Navigation index creation
 * 8. Build validation
 * 9. Metrics generation
 * 
 * Each phase creates an atomic git commit for easy rollback.
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

// Import cleanup components
const { createFolderStructure } = require('./cleanup/create-folders');
const { categorizeFiles } = require('./cleanup/categorize-files');
const { moveFiles } = require('./cleanup/git-move-files');
const { renameFiles } = require('./cleanup/rename-files');
const { updateAllReferences } = require('./cleanup/update-references');
const { createNavigationIndex } = require('./cleanup/create-navigation-index');
const { validateBuild } = require('./cleanup/validate-build');
const { generateMetrics } = require('./cleanup/generate-metrics');

/**
 * Validates preconditions before starting cleanup
 * @param {boolean} testMode - Whether running in test mode (more lenient)
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validatePreconditions(testMode = false) {
  const errors = [];
  
  try {
    // Check if we're in a git repository
    execSync('git rev-parse --git-dir', { stdio: 'ignore' });
  } catch (error) {
    if (!testMode) {
      errors.push('Not in a git repository');
    }
  }
  
  // Check for uncommitted changes (skip in test mode)
  if (!testMode) {
    try {
      const status = execSync('git status --porcelain', { encoding: 'utf8' });
      if (status.trim().length > 0) {
        errors.push('Git repository has uncommitted changes. Please commit or stash changes before running cleanup.');
      }
    } catch (error) {
      errors.push('Unable to check git status');
    }
  }
  
  // Check Node.js version
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  if (majorVersion < 18) {
    errors.push(`Node.js version must be 18.x or higher (current: ${nodeVersion})`);
  }
  
  // Check required directories exist (more lenient in test mode)
  const requiredDirs = testMode ? ['scripts'] : ['src', 'scripts'];
  for (const dir of requiredDirs) {
    try {
      require('fs').statSync(dir);
    } catch (error) {
      errors.push(`Required directory not found: ${dir}`);
    }
  }
  
  // Check protected files exist (skip in test mode)
  if (!testMode) {
    const protectedFiles = [
      'aws-security-standards.md',
      'deployment-standards.md',
      'project-deployment-config.md'
    ];
    
    for (const file of protectedFiles) {
      try {
        require('fs').statSync(file);
      } catch (error) {
        errors.push(`Protected file not found: ${file}`);
      }
    }
  }
  
  return { valid: errors.length === 0, errors };
}

/**
 * Creates a git commit with a descriptive message
 * @param {string} message - Commit message
 * @param {string[]} files - Files to commit (empty = all staged)
 * @returns {{ success: boolean, commitHash: string | null, error: string | null }}
 */
function createGitCommit(message, files = []) {
  try {
    // Stage files
    if (files.length > 0) {
      for (const file of files) {
        try {
          execSync(`git add "${file}"`, { stdio: 'ignore' });
        } catch (error) {
          // File might not exist or already staged, continue
        }
      }
    } else {
      // Stage all changes
      execSync('git add -A', { stdio: 'ignore' });
    }
    
    // Check if there's anything to commit
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    if (status.trim().length === 0) {
      return { success: true, commitHash: null, error: 'No changes to commit' };
    }
    
    // Create commit
    execSync(`git commit -m "${message}"`, { stdio: 'ignore' });
    
    // Get commit hash
    const commitHash = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
    
    return { success: true, commitHash, error: null };
  } catch (error) {
    return { success: false, commitHash: null, error: error.message };
  }
}

/**
 * Executes a single cleanup phase with error handling
 * @param {string} phaseName - Name of the phase
 * @param {Function} phaseFunction - Function to execute
 * @param {string} commitMessage - Git commit message
 * @param {boolean} dryRun - Whether to skip git commit
 * @returns {Promise<PhaseResult>}
 */
async function runPhase(phaseName, phaseFunction, commitMessage, dryRun = false) {
  const startTime = Date.now();
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Phase: ${phaseName}`);
  console.log('='.repeat(60));
  
  try {
    // Execute phase function
    const result = await phaseFunction();
    
    const duration = Date.now() - startTime;
    
    if (!result.success) {
      console.error(`❌ Phase failed: ${phaseName}`);
      if (result.errors && result.errors.length > 0) {
        console.error('Errors:', result.errors);
      }
      
      return {
        phase: phaseName,
        success: false,
        duration,
        filesProcessed: result.filesProcessed || 0,
        errors: result.errors || [result.error || 'Unknown error'],
        warnings: result.warnings || [],
        commitHash: null
      };
    }
    
    console.log(`✅ Phase completed: ${phaseName}`);
    console.log(`Duration: ${(duration / 1000).toFixed(2)}s`);
    
    // Create git commit
    let commitHash = null;
    if (!dryRun && commitMessage) {
      console.log(`Creating commit: ${commitMessage}`);
      const commitResult = createGitCommit(commitMessage);
      
      if (commitResult.success) {
        commitHash = commitResult.commitHash;
        if (commitHash) {
          console.log(`✅ Commit created: ${commitHash.substring(0, 7)}`);
        } else {
          console.log(`ℹ️  ${commitResult.error}`);
        }
      } else {
        console.warn(`⚠️  Failed to create commit: ${commitResult.error}`);
      }
    }
    
    return {
      phase: phaseName,
      success: true,
      duration,
      filesProcessed: result.filesProcessed || result.totalMoved || result.totalRenamed || 0,
      errors: [],
      warnings: result.warnings || [],
      commitHash
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    
    console.error(`❌ Phase failed with exception: ${phaseName}`);
    console.error('Error:', error.message);
    
    return {
      phase: phaseName,
      success: false,
      duration,
      filesProcessed: 0,
      errors: [error.message],
      warnings: [],
      commitHash: null
    };
  }
}

/**
 * Rolls back to a specific commit
 * @param {string} commitHash - Commit hash to rollback to
 * @returns {{ success: boolean, error: string | null }}
 */
function rollbackToCommit(commitHash) {
  try {
    console.log(`\n⚠️  Rolling back to commit: ${commitHash}`);
    execSync(`git reset --hard ${commitHash}`, { stdio: 'inherit' });
    console.log('✅ Rollback completed');
    return { success: true, error: null };
  } catch (error) {
    console.error('❌ Rollback failed:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Main cleanup orchestrator function
 * @param {Object} options - Cleanup options
 * @param {boolean} options.dryRun - Run without making git commits
 * @param {boolean} options.skipValidation - Skip build validation
 * @param {boolean} options.skipMetrics - Skip metrics generation
 * @param {boolean} options.testMode - Run in test mode (more lenient validation)
 * @returns {Promise<CleanupResult>}
 */
async function runCleanup(options = {}) {
  const { dryRun = false, skipValidation = false, skipMetrics = false, testMode = false } = options;
  
  console.log('\n' + '='.repeat(60));
  console.log('Repository Cleanup Orchestrator');
  console.log('='.repeat(60));
  
  if (dryRun) {
    console.log('🔍 DRY RUN MODE - No git commits will be created');
  }
  
  if (testMode) {
    console.log('🧪 TEST MODE - Lenient validation enabled');
  }
  
  const startTime = Date.now();
  const phases = [];
  
  // Validate preconditions
  console.log('\n📋 Validating preconditions...');
  const preconditions = validatePreconditions(testMode);
  
  if (!preconditions.valid) {
    console.error('\n❌ Precondition validation failed:');
    preconditions.errors.forEach(error => console.error(`  - ${error}`));
    return {
      success: false,
      phases: [],
      metrics: null,
      duration: Date.now() - startTime,
      error: 'Precondition validation failed'
    };
  }
  
  console.log('✅ All preconditions met');
  
  // Store initial commit for potential rollback
  const initialCommit = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
  console.log(`📌 Initial commit: ${initialCommit.substring(0, 7)}`);
  
  // Capture before state for metrics
  const beforeState = {
    rootFiles: require('fs').readdirSync('.').filter(f => {
      const stat = require('fs').statSync(f);
      return stat.isFile() && !f.startsWith('.');
    }).length,
    timestamp: new Date().toISOString()
  };
  
  try {
    // Phase 1: Create folder structure
    const phase1 = await runPhase(
      'Folder Structure Creation',
      createFolderStructure,
      'chore(cleanup): create organized folder structure',
      dryRun
    );
    phases.push(phase1);
    
    if (!phase1.success) {
      throw new Error('Folder creation failed');
    }
    
    // Phase 2: Categorize files
    let manifest;
    const phase2 = await runPhase(
      'File Categorization',
      async () => {
        manifest = await categorizeFiles();
        return manifest;
      },
      null, // No commit for categorization (planning phase)
      dryRun
    );
    phases.push(phase2);
    
    if (!phase2.success) {
      throw new Error('File categorization failed');
    }
    
    // Phase 3: Move documentation files
    const phase3 = await runPhase(
      'Documentation Organization',
      () => moveFiles(manifest, 'documentation'),
      'chore(cleanup): organize documentation files',
      dryRun
    );
    phases.push(phase3);
    
    if (!phase3.success) {
      throw new Error('Documentation move failed');
    }
    
    // Phase 4: Move script files
    const phase4 = await runPhase(
      'Script Consolidation',
      () => moveFiles(manifest, 'scripts'),
      'chore(cleanup): consolidate scripts by category',
      dryRun
    );
    phases.push(phase4);
    
    if (!phase4.success) {
      throw new Error('Script consolidation failed');
    }
    
    // Phase 5: Rename files with date prefixes
    const phase5 = await runPhase(
      'File Renaming',
      () => renameFiles('docs'),
      'chore(cleanup): standardize file naming with dates',
      dryRun
    );
    phases.push(phase5);
    
    if (!phase5.success) {
      throw new Error('File renaming failed');
    }
    
    // Phase 6: Update path references
    const phase6 = await runPhase(
      'Path Reference Updates',
      () => updateAllReferences(manifest),
      'chore(cleanup): update path references',
      dryRun
    );
    phases.push(phase6);
    
    if (!phase6.success) {
      throw new Error('Path reference update failed');
    }
    
    // Phase 7: Create navigation index
    const phase7 = await runPhase(
      'Navigation Index Creation',
      () => createNavigationIndex(manifest),
      'chore(cleanup): create documentation navigation index',
      dryRun
    );
    phases.push(phase7);
    
    if (!phase7.success) {
      throw new Error('Navigation index creation failed');
    }
    
    // Phase 8: Validate build (optional)
    if (!skipValidation) {
      const phase8 = await runPhase(
        'Build Validation',
        validateBuild,
        null, // No commit for validation
        dryRun
      );
      phases.push(phase8);
      
      if (!phase8.success) {
        console.warn('⚠️  Build validation failed, but continuing...');
      }
    }
    
    // Phase 9: Generate metrics (optional)
    let metrics = null;
    if (!skipMetrics) {
      const afterState = {
        rootFiles: require('fs').readdirSync('.').filter(f => {
          const stat = require('fs').statSync(f);
          return stat.isFile() && !f.startsWith('.');
        }).length,
        timestamp: new Date().toISOString()
      };
      
      const phase9 = await runPhase(
        'Metrics Generation',
        () => generateMetrics(beforeState, afterState),
        null, // No commit for metrics
        dryRun
      );
      phases.push(phase9);
      
      if (phase9.success) {
        // Metrics are returned in the phase result
        metrics = phase9;
      }
    }
    
    const duration = Date.now() - startTime;
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Cleanup completed successfully!');
    console.log('='.repeat(60));
    console.log(`Total duration: ${(duration / 1000).toFixed(2)}s`);
    console.log(`Phases completed: ${phases.filter(p => p.success).length}/${phases.length}`);
    
    return {
      success: true,
      phases,
      metrics,
      duration,
      error: null
    };
    
  } catch (error) {
    console.error('\n' + '='.repeat(60));
    console.error('❌ Cleanup failed:', error.message);
    console.error('='.repeat(60));
    
    // Offer rollback
    if (!dryRun) {
      console.log('\n⚠️  Would you like to rollback changes?');
      console.log(`To rollback manually, run: git reset --hard ${initialCommit}`);
    }
    
    const duration = Date.now() - startTime;
    
    return {
      success: false,
      phases,
      metrics: null,
      duration,
      error: error.message
    };
  }
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {
    dryRun: args.includes('--dry-run'),
    skipValidation: args.includes('--skip-validation'),
    skipMetrics: args.includes('--skip-metrics'),
    testMode: args.includes('--test-mode')
  };
  
  // Handle test mode with custom working directory
  if (options.testMode) {
    const cwdIndex = args.indexOf('--cwd');
    if (cwdIndex !== -1 && args[cwdIndex + 1]) {
      process.chdir(args[cwdIndex + 1]);
      console.log(`Test mode: Working directory set to ${process.cwd()}`);
    }
  }
  
  runCleanup(options)
    .then(result => {
      // In test mode, output JSON result
      if (options.testMode) {
        console.log('\n--- TEST MODE RESULT ---');
        console.log(JSON.stringify(result, null, 2));
      }
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = {
  runCleanup,
  runPhase,
  createGitCommit,
  validatePreconditions,
  rollbackToCommit
};
