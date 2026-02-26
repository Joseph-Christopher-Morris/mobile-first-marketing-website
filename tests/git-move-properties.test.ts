import * as fc from 'fast-check';
import * as fs from 'fs/promises';
import * as path from 'path';
import { execSync } from 'child_process';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as os from 'os';

/**
 * Property-Based Tests for Git Move Operations
 * 
 * These tests validate that file moves preserve git history using git mv command.
 * 
 * Property 1: Git history preservation for file moves
 * Validates: Requirements 2.1
 */

describe('Property 1: Git history preservation for file moves', () => {
  let testRepoDir: string;
  let originalCwd: string;
  
  beforeEach(async () => {
    // Save original working directory
    originalCwd = process.cwd();
    
    // Create a unique temporary git repository for each test
    testRepoDir = await fs.mkdtemp(path.join(os.tmpdir(), 'git-test-'));
    
    // Initialize git repo
    execSync('git init', { cwd: testRepoDir });
    execSync('git config user.email "test@example.com"', { cwd: testRepoDir });
    execSync('git config user.name "Test User"', { cwd: testRepoDir });
  });
  
  afterEach(async () => {
    // Restore original working directory
    process.chdir(originalCwd);
    
    // Clean up test repository
    await fs.rm(testRepoDir, { recursive: true, force: true }).catch(() => {});
  }, 30000);

  it('should preserve git history when moving files with git mv', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate arbitrary filenames and content (avoid filenames starting with -)
        fc.record({
          filename: fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9_-]*\.(md|js|txt)$/),
          content: fc.string({ minLength: 10, maxLength: 100 }).filter(s => s.trim().length > 0),
          destinationDir: fc.constantFrom('docs', 'scripts', 'archive')
        }),
        async ({ filename, content, destinationDir }) => {
          // Create a fresh test repo for this iteration
          const iterationRepoDir = await fs.mkdtemp(path.join(os.tmpdir(), 'git-iter-'));
          
          try {
            // Initialize git repo
            execSync('git init', { cwd: iterationRepoDir });
            execSync('git config user.email "test@example.com"', { cwd: iterationRepoDir });
            execSync('git config user.name "Test User"', { cwd: iterationRepoDir });
            
            // Setup: Create file with initial content
            const sourcePath = path.join(iterationRepoDir, filename);
            await fs.writeFile(sourcePath, content, 'utf-8');
            
            // Commit the file
            execSync(`git add "${filename}"`, { cwd: iterationRepoDir });
            execSync(`git commit -m "Add ${filename}"`, { cwd: iterationRepoDir });
            
            // Get initial commit hash
            const initialCommit = execSync('git rev-parse HEAD', { cwd: iterationRepoDir })
              .toString()
              .trim();
            
            // Create destination directory
            const destDir = path.join(iterationRepoDir, destinationDir);
            await fs.mkdir(destDir, { recursive: true });
            
            // Execute: Move file using git mv
            const destPath = path.join(destinationDir, filename);
            execSync(`git mv "${filename}" "${destPath}"`, { cwd: iterationRepoDir });
            execSync(`git commit -m "Move ${filename} to ${destinationDir}"`, { cwd: iterationRepoDir });
            
            // Verify: File history is preserved and accessible via git log --follow
            const gitLogOutput = execSync(
              `git log --follow --oneline "${destPath}"`,
              { cwd: iterationRepoDir }
            ).toString();
            
            // Property assertions
            // 1. Git log should show at least 2 commits (initial + move)
            const commitLines = gitLogOutput.trim().split('\n');
            expect(commitLines.length).toBeGreaterThanOrEqual(2);
            
            // 2. Initial commit should be in the history
            expect(gitLogOutput).toContain(initialCommit.substring(0, 7));
            
            // 3. File should exist at new location
            const fileExists = await fs.access(path.join(iterationRepoDir, destPath))
              .then(() => true)
              .catch(() => false);
            expect(fileExists).toBe(true);
            
            // 4. File should not exist at old location
            const oldFileExists = await fs.access(sourcePath)
              .then(() => true)
              .catch(() => false);
            expect(oldFileExists).toBe(false);
            
            // 5. Content should be preserved
            const movedContent = await fs.readFile(
              path.join(iterationRepoDir, destPath),
              'utf-8'
            );
            expect(movedContent).toBe(content);
          } finally {
            // Cleanup iteration repo
            await fs.rm(iterationRepoDir, { recursive: true, force: true }).catch(() => {});
          }
        }
      ),
      { numRuns: 100 } // Run 100+ iterations as specified
    );
  }, 60000); // 60 second timeout for property test

  it('should preserve multi-commit history when moving files', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          filename: fc.stringMatching(/^test[a-z0-9]+\.md$/),
          edits: fc.array(fc.string({ minLength: 5, maxLength: 50 }), { minLength: 2, maxLength: 3 }),
          destinationDir: fc.constantFrom('docs', 'scripts')
        }),
        async ({ filename, edits, destinationDir }) => {
          // Setup: Create file and make multiple commits
          const sourcePath = path.join(testRepoDir, filename);
          const destDirPath = path.join(testRepoDir, destinationDir);
          const destPath = path.join(destinationDir, filename);
          const destFullPath = path.join(testRepoDir, destPath);
          
          // Clean up any existing files from previous iterations
          try {
            if (await fs.access(sourcePath).then(() => true).catch(() => false)) {
              execSync(`git rm -f "${filename}"`, { cwd: testRepoDir });
            }
            if (await fs.access(destFullPath).then(() => true).catch(() => false)) {
              execSync(`git rm -f "${destPath}"`, { cwd: testRepoDir });
            }
            // Commit cleanup if there were changes
            try {
              execSync('git commit -m "Cleanup test files"', { cwd: testRepoDir });
            } catch {
              // No changes to commit
            }
          } catch {
            // Files don't exist, continue
          }
          
          // Initial commit
          await fs.writeFile(sourcePath, edits[0], 'utf-8');
          execSync(`git add "${filename}"`, { cwd: testRepoDir });
          execSync(`git commit -m "Initial ${filename}"`, { cwd: testRepoDir });
          
          const commitHashes: string[] = [
            execSync('git rev-parse HEAD', { cwd: testRepoDir }).toString().trim()
          ];
          
          // Make additional edits and commits
          for (let i = 1; i < edits.length; i++) {
            await fs.appendFile(sourcePath, `\n${edits[i]}`, 'utf-8');
            execSync(`git add "${filename}"`, { cwd: testRepoDir });
            execSync(`git commit -m "Edit ${filename} - version ${i + 1}"`, { cwd: testRepoDir });
            commitHashes.push(
              execSync('git rev-parse HEAD', { cwd: testRepoDir }).toString().trim()
            );
          }
          
          // Create destination directory structure
          await fs.mkdir(destDirPath, { recursive: true });
          
          // Execute: Move file using git mv
          execSync(`git mv "${filename}" "${destPath}"`, { cwd: testRepoDir });
          execSync(`git commit -m "Move ${filename}"`, { cwd: testRepoDir });
          
          // Verify: All commits are preserved in history
          const gitLogOutput = execSync(
            `git log --follow --oneline "${destPath}"`,
            { cwd: testRepoDir }
          ).toString();
          
          // Property assertions
          // 1. All original commits should be in the history
          for (const commitHash of commitHashes) {
            expect(gitLogOutput).toContain(commitHash.substring(0, 7));
          }
          
          // 2. Total commits should be at least edits.length + 1 (move commit)
          const commitLines = gitLogOutput.trim().split('\n');
          expect(commitLines.length).toBeGreaterThanOrEqual(edits.length + 1);
          
          // 3. Git log --follow should work (no errors)
          expect(() => {
            execSync(`git log --follow "${destPath}"`, { cwd: testRepoDir });
          }).not.toThrow();
        }
      ),
      { numRuns: 100 }
    );
  }, 60000); // 60 second timeout

  it('should verify git mv is used instead of regular mv', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          filename: fc.stringMatching(/^doc[0-9]+\.md$/),
          content: fc.lorem({ maxCount: 3 }).filter(s => s.trim().length > 0),
          destFolder: fc.constantFrom('docs', 'scripts')
        }),
        async ({ filename, content, destFolder }) => {
          // Create a fresh test repo for this iteration
          const iterationRepoDir = await fs.mkdtemp(path.join(os.tmpdir(), 'git-iter-'));
          
          try {
            // Initialize git repo
            execSync('git init', { cwd: iterationRepoDir });
            execSync('git config user.email "test@example.com"', { cwd: iterationRepoDir });
            execSync('git config user.name "Test User"', { cwd: iterationRepoDir });
            
            // Setup
            const sourcePath = path.join(iterationRepoDir, filename);
            await fs.writeFile(sourcePath, content, 'utf-8');
            execSync(`git add "${filename}"`, { cwd: iterationRepoDir });
            execSync(`git commit -m "Add ${filename}"`, { cwd: iterationRepoDir });
            
            // Create destination
            const destDir = path.join(iterationRepoDir, destFolder);
            await fs.mkdir(destDir, { recursive: true });
            const destPath = path.join(destFolder, filename);
            
            // Execute git mv
            execSync(`git mv "${filename}" "${destPath}"`, { cwd: iterationRepoDir });
            
            // Verify: Git status should show rename, not delete + add
            const gitStatus = execSync('git status --short', { cwd: iterationRepoDir })
              .toString();
            
            // Property assertion: Git should recognize this as a rename (R)
            expect(gitStatus).toMatch(/^R/m); // R indicates rename in git status
            
            // Commit the move
            execSync(`git commit -m "Move ${filename}"`, { cwd: iterationRepoDir });
            
            // Verify: Git log should show the move preserved history
            const gitLog = execSync(
              `git log --follow --name-status "${destPath}"`,
              { cwd: iterationRepoDir }
            ).toString();
            
            // Should contain both the new path and original path in history
            expect(gitLog).toContain(destPath);
            expect(gitLog).toContain(filename);
          } finally {
            // Cleanup iteration repo
            await fs.rm(iterationRepoDir, { recursive: true, force: true }).catch(() => {});
          }
        }
      ),
      { numRuns: 100 }
    );
  }, 60000); // 60 second timeout
});
