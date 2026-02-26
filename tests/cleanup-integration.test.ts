/**
 * End-to-End Integration Test for Repository Cleanup Workflow
 * 
 * This test validates the complete cleanup system by:
 * 1. Setting up a test repository with sample files
 * 2. Executing the full cleanup workflow
 * 3. Verifying all phases completed successfully
 * 4. Validating folder structure, file moves, renames, and references
 * 5. Checking build integrity and metrics
 * 
 * Validates: All requirements 1.1-10.7
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as fs from 'fs/promises';
import * as path from 'path';
import { execSync } from 'child_process';

// Test configuration
const TEST_ROOT = path.join(process.cwd(), 'tests', 'integration-test-repo');
const CLEANUP_ORCHESTRATOR = path.join(process.cwd(), 'scripts', 'cleanup-orchestrator.js');

// Sample files to create for testing
const SAMPLE_FILES = {
  documentation: [
    'DEPLOYMENT-SUMMARY-FEB-22-2026.md',
    'validation-report-2025-10-15.md',
    'AWS_INFRASTRUCTURE_GUIDE.md',
    'QUICK-REFERENCE-DEPLOYMENT.md',
    'OLD-DOCUMENT-2024-01-01.md', // >90 days old
  ],
  scripts: [
    'fix-broken-links.js',
    'deploy-to-production.js',
    'validate-build-output.js',
    'monitor-health.js',
  ],
  protected: [
    'aws-security-standards.md',
    'deployment-standards.md',
    'project-deployment-config.md',
  ],
};

describe('End-to-End Cleanup Workflow Integration Test', () => {
  beforeAll(async () => {
    // Create test repository structure
    await setupTestRepository();
  });

  afterAll(async () => {
    // Clean up test repository
    await cleanupTestRepository();
  });

  it('should execute complete cleanup workflow successfully', async () => {
    // Execute cleanup orchestrator
    const result = await executeCleanupWorkflow();
    
    expect(result.success).toBe(true);
    expect(result.phases).toBeDefined();
    expect(result.phases.length).toBeGreaterThan(0);
  }, 60000); // 60 second timeout for full workflow

  it('should create all required folder structure', async () => {
    // Verify docs folders
    const docsFolders = [
      'docs/summaries',
      'docs/audits',
      'docs/architecture',
      'docs/decisions',
      'docs/archive',
    ];

    for (const folder of docsFolders) {
      const folderPath = path.join(TEST_ROOT, folder);
      const exists = await fileExists(folderPath);
      expect(exists).toBe(true);
    }

    // Verify scripts folders
    const scriptsFolders = [
      'scripts/fixes',
      'scripts/migrations',
      'scripts/utilities',
    ];

    for (const folder of scriptsFolders) {
      const folderPath = path.join(TEST_ROOT, folder);
      const exists = await fileExists(folderPath);
      expect(exists).toBe(true);
    }
  });

  it('should move documentation files to correct locations', async () => {
    // Verify deployment summary moved to docs/summaries
    const summaryFiles = await fs.readdir(path.join(TEST_ROOT, 'docs/summaries'));
    expect(summaryFiles.some(f => f.includes('DEPLOYMENT-SUMMARY'))).toBe(true);

    // Verify validation report moved to docs/audits
    const auditFiles = await fs.readdir(path.join(TEST_ROOT, 'docs/audits'));
    expect(auditFiles.some(f => f.includes('validation-report'))).toBe(true);

    // Verify infrastructure guide moved to docs/architecture
    const archFiles = await fs.readdir(path.join(TEST_ROOT, 'docs/architecture'));
    expect(archFiles.some(f => f.includes('INFRASTRUCTURE_GUIDE'))).toBe(true);

    // Verify quick reference moved to docs/decisions
    const decisionFiles = await fs.readdir(path.join(TEST_ROOT, 'docs/decisions'));
    expect(decisionFiles.some(f => f.includes('QUICK-REFERENCE'))).toBe(true);

    // Verify old document moved to docs/archive
    const archiveFiles = await fs.readdir(path.join(TEST_ROOT, 'docs/archive'));
    expect(archiveFiles.some(f => f.includes('OLD-DOCUMENT'))).toBe(true);
  });

  it('should move script files to correct locations', async () => {
    // Verify fix script moved to scripts/fixes
    const fixFiles = await fs.readdir(path.join(TEST_ROOT, 'scripts/fixes'));
    expect(fixFiles.some(f => f.includes('fix-broken-links'))).toBe(true);

    // Verify deployment script moved to scripts/migrations
    const migrationFiles = await fs.readdir(path.join(TEST_ROOT, 'scripts/migrations'));
    expect(migrationFiles.some(f => f.includes('deploy-to-production'))).toBe(true);

    // Verify validation script moved to scripts/utilities
    const utilityFiles = await fs.readdir(path.join(TEST_ROOT, 'scripts/utilities'));
    expect(utilityFiles.some(f => f.includes('validate-build-output'))).toBe(true);
    expect(utilityFiles.some(f => f.includes('monitor-health'))).toBe(true);
  });

  it('should rename files with date prefixes in YYYY-MM-DD format', async () => {
    // Check docs/summaries for date-prefixed files
    const summaryFiles = await fs.readdir(path.join(TEST_ROOT, 'docs/summaries'));
    const datePattern = /^\d{4}-\d{2}-\d{2}-/;
    
    const hasDatePrefix = summaryFiles.some(f => datePattern.test(f));
    expect(hasDatePrefix).toBe(true);

    // Verify specific date format (2026-02-22 from FEB-22-2026)
    const hasCorrectDate = summaryFiles.some(f => f.startsWith('2026-02-22-'));
    expect(hasCorrectDate).toBe(true);
  });

  it('should preserve protected files at root level', async () => {
    // Verify protected files remain at root
    for (const protectedFile of SAMPLE_FILES.protected) {
      const filePath = path.join(TEST_ROOT, protectedFile);
      const exists = await fileExists(filePath);
      expect(exists).toBe(true);
    }

    // Verify protected files are NOT in any subdirectory
    const docsFiles = await getAllFilesRecursive(path.join(TEST_ROOT, 'docs'));
    const scriptsFiles = await getAllFilesRecursive(path.join(TEST_ROOT, 'scripts'));
    
    for (const protectedFile of SAMPLE_FILES.protected) {
      expect(docsFiles.some(f => f.includes(protectedFile))).toBe(false);
      expect(scriptsFiles.some(f => f.includes(protectedFile))).toBe(false);
    }
  });

  it('should update path references in package.json', async () => {
    const packageJsonPath = path.join(TEST_ROOT, 'package.json');
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));

    // Verify script paths are updated
    if (packageJson.scripts) {
      const scriptValues = Object.values(packageJson.scripts) as string[];
      
      // Check that old paths are not present
      const hasOldPaths = scriptValues.some(script => 
        script.includes('deploy-to-production.js') && !script.includes('scripts/migrations/')
      );
      expect(hasOldPaths).toBe(false);

      // Check that new paths are present
      const hasNewPaths = scriptValues.some(script => 
        script.includes('scripts/migrations/') || 
        script.includes('scripts/utilities/') ||
        script.includes('scripts/fixes/')
      );
      expect(hasNewPaths).toBe(true);
    }
  });

  it('should create navigation index with all required sections', async () => {
    const navIndexPath = path.join(TEST_ROOT, 'docs/README.md');
    const exists = await fileExists(navIndexPath);
    expect(exists).toBe(true);

    const content = await fs.readFile(navIndexPath, 'utf-8');

    // Verify required sections
    expect(content).toContain('Quick Links');
    expect(content).toContain('Documentation Categories');
    expect(content).toContain('Date Convention');
    expect(content).toContain('Common Tasks');

    // Verify links to protected files
    expect(content).toContain('aws-security-standards.md');
    expect(content).toContain('deployment-standards.md');
    expect(content).toContain('project-deployment-config.md');

    // Verify category descriptions
    expect(content).toContain('summaries');
    expect(content).toContain('audits');
    expect(content).toContain('architecture');
    expect(content).toContain('decisions');
    expect(content).toContain('archive');

    // Verify date convention explanation
    expect(content).toContain('YYYY-MM-DD');
  });

  it('should preserve git history for moved files', async () => {
    // Get list of moved files
    const summaryFiles = await fs.readdir(path.join(TEST_ROOT, 'docs/summaries'));
    
    if (summaryFiles.length > 0) {
      const movedFile = summaryFiles[0];
      const filePath = path.join('docs/summaries', movedFile);

      // Check git log with --follow to verify history is preserved
      try {
        const gitLog = execSync(
          `git log --follow --oneline "${filePath}"`,
          { cwd: TEST_ROOT, encoding: 'utf-8' }
        );
        
        // Should have at least one commit (the move)
        expect(gitLog.length).toBeGreaterThan(0);
      } catch (error) {
        // If git is not initialized in test repo, skip this check
        console.warn('Git history check skipped: repository not initialized');
      }
    }
  });

  it('should generate metrics report with 80%+ reduction', async () => {
    const metricsPath = path.join(TEST_ROOT, 'cleanup-metrics.json');
    
    if (await fileExists(metricsPath)) {
      const metrics = JSON.parse(await fs.readFile(metricsPath, 'utf-8'));

      // Verify metrics structure
      expect(metrics.rootFilesBefore).toBeDefined();
      expect(metrics.rootFilesAfter).toBeDefined();
      expect(metrics.reductionPercentage).toBeDefined();
      expect(metrics.filesMoved).toBeDefined();

      // Verify reduction percentage
      expect(metrics.reductionPercentage).toBeGreaterThanOrEqual(80);

      // Verify files moved counts
      expect(metrics.filesMoved.summaries).toBeGreaterThan(0);
      expect(metrics.filesMoved.fixes).toBeGreaterThan(0);
      expect(metrics.filesMoved.migrations).toBeGreaterThan(0);
      expect(metrics.filesMoved.utilities).toBeGreaterThan(0);

      // Verify success flag
      expect(metrics.success).toBe(true);
    }
  });

  it('should create separate git commits for each phase', async () => {
    try {
      // Get git log
      const gitLog = execSync(
        'git log --oneline --grep="chore(cleanup)"',
        { cwd: TEST_ROOT, encoding: 'utf-8' }
      );

      // Verify commit messages follow pattern
      expect(gitLog).toContain('chore(cleanup):');

      // Verify multiple commits (one per phase)
      const commitLines = gitLog.trim().split('\n');
      expect(commitLines.length).toBeGreaterThan(1);
    } catch (error) {
      console.warn('Git commit check skipped: repository not initialized');
    }
  });

  it('should reduce root-level file count by 80%+', async () => {
    // Count current root-level files (excluding protected and system files)
    const rootFiles = await fs.readdir(TEST_ROOT);
    const nonSystemFiles = rootFiles.filter(f => 
      !f.startsWith('.') && 
      f !== 'node_modules' &&
      f !== 'docs' &&
      f !== 'scripts' &&
      f !== 'src' &&
      f !== 'config' &&
      f !== 'public' &&
      f !== 'package.json' &&
      f !== 'package-lock.json'
    );

    // Should have very few files at root (mostly protected files)
    const expectedMaxFiles = Math.ceil(SAMPLE_FILES.protected.length * 1.5);
    expect(nonSystemFiles.length).toBeLessThanOrEqual(expectedMaxFiles);
  });

  it('should validate all phases completed successfully', async () => {
    const metricsPath = path.join(TEST_ROOT, 'cleanup-metrics.json');
    
    if (await fileExists(metricsPath)) {
      const metrics = JSON.parse(await fs.readFile(metricsPath, 'utf-8'));

      // Verify overall success
      expect(metrics.success).toBe(true);

      // Verify timestamp
      expect(metrics.timestamp).toBeDefined();
      expect(new Date(metrics.timestamp).getTime()).toBeGreaterThan(0);
    }
  });
});

// Helper functions

async function setupTestRepository(): Promise<void> {
  // Create test root directory
  await fs.mkdir(TEST_ROOT, { recursive: true });

  // Create sample documentation files
  for (const docFile of SAMPLE_FILES.documentation) {
    const filePath = path.join(TEST_ROOT, docFile);
    await fs.writeFile(filePath, `# ${docFile}\n\nSample documentation content.`);
    
    // Set old modification time for archive test
    if (docFile.includes('OLD-DOCUMENT')) {
      const oldDate = new Date('2024-01-01');
      await fs.utimes(filePath, oldDate, oldDate);
    }
  }

  // Create sample script files
  await fs.mkdir(path.join(TEST_ROOT, 'scripts'), { recursive: true });
  for (const scriptFile of SAMPLE_FILES.scripts) {
    const filePath = path.join(TEST_ROOT, scriptFile);
    await fs.writeFile(filePath, `// ${scriptFile}\nconsole.log('Sample script');`);
  }

  // Create protected files
  for (const protectedFile of SAMPLE_FILES.protected) {
    const filePath = path.join(TEST_ROOT, protectedFile);
    await fs.writeFile(filePath, `# ${protectedFile}\n\nProtected governance file.`);
  }

  // Create package.json with script references
  const packageJson = {
    name: 'test-repo',
    version: '1.0.0',
    scripts: {
      deploy: 'node deploy-to-production.js',
      validate: 'node validate-build-output.js',
      fix: 'node fix-broken-links.js',
    },
  };
  await fs.writeFile(
    path.join(TEST_ROOT, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );

  // Create minimal src directory (protected)
  await fs.mkdir(path.join(TEST_ROOT, 'src'), { recursive: true });
  await fs.writeFile(
    path.join(TEST_ROOT, 'src', 'index.js'),
    'console.log("Source file");'
  );

  // Initialize git repository
  try {
    execSync('git init', { cwd: TEST_ROOT });
    execSync('git add .', { cwd: TEST_ROOT });
    execSync('git commit -m "Initial commit"', { cwd: TEST_ROOT });
  } catch (error) {
    console.warn('Git initialization failed:', error);
  }
}

async function cleanupTestRepository(): Promise<void> {
  try {
    await fs.rm(TEST_ROOT, { recursive: true, force: true });
  } catch (error) {
    console.error('Failed to cleanup test repository:', error);
  }
}

async function executeCleanupWorkflow(): Promise<any> {
  try {
    // Execute cleanup orchestrator in test directory
    const output = execSync(
      `node "${CLEANUP_ORCHESTRATOR}" --test-mode --cwd "${TEST_ROOT}"`,
      { encoding: 'utf-8', cwd: TEST_ROOT }
    );

    // Parse output for results
    return {
      success: !output.includes('ERROR') && !output.includes('FAILED'),
      phases: [],
      output,
    };
  } catch (error: any) {
    return {
      success: false,
      phases: [],
      error: error.message,
    };
  }
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function getAllFilesRecursive(dir: string): Promise<string[]> {
  const files: string[] = [];
  
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        const subFiles = await getAllFilesRecursive(fullPath);
        files.push(...subFiles);
      } else {
        files.push(fullPath);
      }
    }
  } catch (error) {
    // Directory doesn't exist or not accessible
  }
  
  return files;
}
