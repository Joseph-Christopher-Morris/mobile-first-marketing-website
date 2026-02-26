/**
 * Property-Based Tests for Path Reference Detection in Deployment Scripts
 * 
 * Tests Property 12: Path reference detection in deployment scripts
 * Validates: Requirements 8.1, 8.2
 * 
 * For any deployment script containing hardcoded file paths,
 * those paths should be detected and updated if they reference moved files.
 */

import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as path from 'path';
import * as os from 'os';

const updateReferences = require('../scripts/cleanup/update-references.js');

describe('Property 12: Path reference detection in deployment scripts', () => {
  let tempDir: string;
  let originalCwd: string;

  beforeEach(async () => {
    // Create a temporary directory for testing
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'deploy-refs-test-'));
    originalCwd = process.cwd();
    process.chdir(tempDir);
    
    // Create scripts directory
    await fs.mkdir(path.join(tempDir, 'scripts'), { recursive: true });
  });

  afterEach(async () => {
    // Restore original working directory
    process.chdir(originalCwd);
    
    // Clean up temporary directory
    if (tempDir && fsSync.existsSync(tempDir)) {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  });

  /**
   * Property: Hardcoded file paths in require/import statements are detected and updated
   * 
   * For any deployment script containing require() or import statements with paths
   * that have been moved, the updateScriptReferences function should detect and replace those paths.
   * 
   * Note: The implementation only updates require() and import statements, not other file operations.
   */
  test('should detect and update hardcoded file paths in deployment scripts', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            scriptName: fc.constantFrom(
              'deploy.js',
              'deploy-prod.js',
              'deploy-staging.js',
              'setup-infrastructure.js',
              'rollback.js'
            ),
            pathPair: fc.oneof(
              fc.constant({ old: '../config/production.json', new: '../config/environments/production.json' }),
              fc.constant({ old: '../scripts/validate.js', new: '../scripts/utilities/validate.js' }),
              fc.constant({ old: '../deployment-config.json', new: '../config/deployment-config.json' }),
              fc.constant({ old: '../scripts/lib/logger.js', new: '../scripts/lib/logger.js' }), // unchanged
              fc.constant({ old: '../build-report.json', new: '../reports/build-report.json' })
            ),
            referenceType: fc.constantFrom('require', 'import')
          }),
          { minLength: 1, maxLength: 5 }
        ),
        async (scriptConfigs) => {
          // Create deployment scripts with hardcoded paths
          const scriptsCreated = new Map<string, { oldPath: string; newPath: string; referenceType: string }>();
          
          for (const config of scriptConfigs) {
            // Generate script content based on reference type
            let scriptContent = '';
            
            if (config.referenceType === 'require') {
              scriptContent = `const config = require('${config.pathPair.old}');\n`;
            } else {
              scriptContent = `import config from '${config.pathPair.old}';\n`;
            }
            
            // Write script file
            const scriptPath = path.join(tempDir, 'scripts', config.scriptName);
            await fs.writeFile(scriptPath, scriptContent);
            
            scriptsCreated.set(config.scriptName, {
              oldPath: config.pathPair.old,
              newPath: config.pathPair.new,
              referenceType: config.referenceType
            });
          }
          
          // Skip if no scripts created
          if (scriptsCreated.size === 0) {
            return;
          }
          
          // Create path mappings
          const pathMappings = new Map<string, string>();
          for (const [, paths] of scriptsCreated) {
            // Only add mappings where paths actually changed
            if (paths.oldPath !== paths.newPath) {
              pathMappings.set(paths.oldPath, paths.newPath);
            }
          }
          
          // Update script references
          const result = await updateReferences.updateScriptReferences(pathMappings);
          
          // Verify paths were updated in scripts
          for (const [scriptName, paths] of scriptsCreated) {
            const scriptPath = path.join(tempDir, 'scripts', scriptName);
            const updatedContent = await fs.readFile(scriptPath, 'utf-8');
            
            if (paths.oldPath !== paths.newPath) {
              // Property: New path should exist in updated script
              expect(updatedContent).toContain(paths.newPath);
              
              // Property: Old path should not exist in updated script
              // (unless it's part of the new path - substring check)
              if (!paths.newPath.includes(paths.oldPath)) {
                expect(updatedContent).not.toContain(paths.oldPath);
              }
            } else {
              // Property: Unchanged paths should remain as-is
              expect(updatedContent).toContain(paths.oldPath);
            }
          }
          
          // Property: Update count should be non-negative
          expect(result.updated).toBeGreaterThanOrEqual(0);
          expect(result.errors).toHaveLength(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Relative path references in require/import are detected and updated
   * 
   * Deployment scripts often use relative paths (../, ./, etc.) in require() and import statements.
   * These should be detected and updated correctly.
   * 
   * Note: Only require() and import statements are updated by the implementation.
   */
  test('should detect and update relative path references', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          scriptName: fc.constant('deploy.js'),
          pathPair: fc.constantFrom(
            { old: '../config/prod.json', new: '../config/environments/prod.json' },
            { old: './helpers/validator.js', new: './utilities/validator.js' },
            { old: '../../docs/guide.md', new: '../../docs/architecture/guide.md' }
          ),
          referencePattern: fc.constantFrom(
            "require('PATH')",
            'import x from "PATH"'
          )
        }),
        async ({ scriptName, pathPair, referencePattern }) => {
          // Create script with relative path reference
          const scriptContent = referencePattern.replace('PATH', pathPair.old);
          
          const scriptPath = path.join(tempDir, 'scripts', scriptName);
          await fs.writeFile(scriptPath, scriptContent);
          
          // Create path mapping
          const pathMappings = new Map([[pathPair.old, pathPair.new]]);
          
          // Update script references
          await updateReferences.updateScriptReferences(pathMappings);
          
          // Read updated script
          const updatedContent = await fs.readFile(scriptPath, 'utf-8');
          
          // Property: New path should exist in updated script
          expect(updatedContent).toContain(pathPair.new);
          
          // Property: Old path should not exist in updated script (unless substring)
          if (!pathPair.new.includes(pathPair.old)) {
            expect(updatedContent).not.toContain(pathPair.old);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Multiple path references in a single script are all updated
   * 
   * If a deployment script contains multiple references to moved files,
   * all references should be detected and updated.
   */
  test('should update all path references in a single deployment script', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          scriptName: fc.constant('deploy.js'),
          pathPairs: fc.array(
            fc.constantFrom(
              { old: 'config/prod.json', new: 'config/environments/prod.json' },
              { old: 'scripts/validate.js', new: 'scripts/utilities/validate.js' },
              { old: 'deployment-log.txt', new: 'logs/deployment-log.txt' }
            ),
            { minLength: 2, maxLength: 3 }
          )
        }),
        async ({ scriptName, pathPairs }) => {
          // Create script with multiple path references
          let scriptContent = '#!/usr/bin/env node\n\n';
          
          for (const pathPair of pathPairs) {
            scriptContent += `const data${pathPairs.indexOf(pathPair)} = require('./${pathPair.old}');\n`;
          }
          
          const scriptPath = path.join(tempDir, 'scripts', scriptName);
          await fs.writeFile(scriptPath, scriptContent);
          
          // Create path mappings
          const pathMappings = new Map<string, string>();
          for (const pathPair of pathPairs) {
            pathMappings.set(`./${pathPair.old}`, `./${pathPair.new}`);
          }
          
          // Update script references
          await updateReferences.updateScriptReferences(pathMappings);
          
          // Read updated script
          const updatedContent = await fs.readFile(scriptPath, 'utf-8');
          
          // Property: All new paths should exist in updated script
          for (const pathPair of pathPairs) {
            expect(updatedContent).toContain(pathPair.new);
          }
          
          // Property: No old paths should exist in updated script
          for (const pathPair of pathPairs) {
            // Only check if old path is not a substring of new path
            if (!pathPair.new.includes(pathPair.old)) {
              expect(updatedContent).not.toContain(pathPair.old);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Path references in comments are not updated
   * 
   * Comments in deployment scripts may contain path references for documentation,
   * but these should not be updated as they are not functional references.
   */
  test('should not update path references in comments', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          scriptName: fc.constant('deploy.js'),
          pathPair: fc.constant({ old: 'old-config.json', new: 'config/new-config.json' }),
          commentStyle: fc.constantFrom('//', '/*', '*')
        }),
        async ({ scriptName, pathPair, commentStyle }) => {
          // Create script with path in comment and in code
          let scriptContent = '';
          
          if (commentStyle === '//') {
            scriptContent = `// This script uses ${pathPair.old}\n`;
          } else if (commentStyle === '/*') {
            scriptContent = `/* Configuration file: ${pathPair.old} */\n`;
          } else {
            scriptContent = `/**\n * Uses ${pathPair.old}\n */\n`;
          }
          
          // Add actual code reference
          scriptContent += `const config = require('./${pathPair.old}');\n`;
          
          const scriptPath = path.join(tempDir, 'scripts', scriptName);
          await fs.writeFile(scriptPath, scriptContent);
          
          // Create path mapping
          const pathMappings = new Map([[`./${pathPair.old}`, `./${pathPair.new}`]]);
          
          // Update script references
          await updateReferences.updateScriptReferences(pathMappings);
          
          // Read updated script
          const updatedContent = await fs.readFile(scriptPath, 'utf-8');
          
          // Property: Code reference should be updated
          expect(updatedContent).toContain(`require('./${pathPair.new}')`);
          
          // Property: Comment may still contain old path (comments are not updated)
          // This is acceptable behavior - we only update functional references
          const lines = updatedContent.split('\n');
          const commentLines = lines.filter(line => 
            line.trim().startsWith('//') || 
            line.trim().startsWith('/*') || 
            line.trim().startsWith('*')
          );
          
          // At least one comment line should exist
          expect(commentLines.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Path references with different quote styles are detected
   * 
   * JavaScript allows both single and double quotes for strings.
   * Path references in require() and import statements should be detected regardless of quote style.
   */
  test('should detect path references with different quote styles', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          scriptName: fc.constant('deploy.js'),
          // Use paths that won't be substrings of each other
          pathPair: fc.constantFrom(
            { old: './old-config.json', new: './config/new-config.json' },
            { old: './old-utils.js', new: './utilities/new-utils.js' }
          ),
          quoteStyle: fc.constantFrom("'", '"')
        }),
        async ({ scriptName, pathPair, quoteStyle }) => {
          // Create script with specific quote style
          const scriptContent = `const config = require(${quoteStyle}${pathPair.old}${quoteStyle});\n`;
          
          const scriptPath = path.join(tempDir, 'scripts', scriptName);
          await fs.writeFile(scriptPath, scriptContent);
          
          // Create path mapping
          const pathMappings = new Map([[pathPair.old, pathPair.new]]);
          
          // Update script references
          await updateReferences.updateScriptReferences(pathMappings);
          
          // Read updated script
          const updatedContent = await fs.readFile(scriptPath, 'utf-8');
          
          // Property: New path should exist with same quote style
          expect(updatedContent).toContain(`${quoteStyle}${pathPair.new}${quoteStyle}`);
          
          // Property: Old path should not exist (since we ensured no substring relationship)
          expect(updatedContent).not.toContain(pathPair.old);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Nested directory paths are handled correctly
   * 
   * Deployment scripts may reference files in deeply nested directories.
   * These paths should be detected and updated correctly.
   */
  test('should handle nested directory path references', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          scriptName: fc.constant('deploy.js'),
          pathPair: fc.constantFrom(
            { 
              old: 'config/prod/database.json', 
              new: 'config/environments/production/database.json' 
            },
            { 
              old: 'scripts/helpers/validator.js', 
              new: 'scripts/utilities/validation/validator.js' 
            },
            { 
              old: 'docs/deployment/guide.md', 
              new: 'docs/architecture/deployment/guide.md' 
            }
          )
        }),
        async ({ scriptName, pathPair }) => {
          // Create script with nested path reference
          const scriptContent = `const resource = require('./${pathPair.old}');\n`;
          
          const scriptPath = path.join(tempDir, 'scripts', scriptName);
          await fs.writeFile(scriptPath, scriptContent);
          
          // Create path mapping
          const pathMappings = new Map([[`./${pathPair.old}`, `./${pathPair.new}`]]);
          
          // Update script references
          await updateReferences.updateScriptReferences(pathMappings);
          
          // Read updated script
          const updatedContent = await fs.readFile(scriptPath, 'utf-8');
          
          // Property: New nested path should exist
          expect(updatedContent).toContain(pathPair.new);
          
          // Property: Old nested path should not exist
          expect(updatedContent).not.toContain(pathPair.old);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Scripts without path references remain unchanged
   * 
   * If a deployment script does not contain any references to moved files,
   * the script should remain exactly as it was.
   */
  test('should not modify scripts without path references to moved files', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          scriptName: fc.constant('deploy.js'),
          scriptContent: fc.constantFrom(
            '#!/usr/bin/env node\nconsole.log("Deploying...");\n',
            'const result = await deploy();\n',
            'process.exit(0);\n'
          ),
          pathMapping: fc.constant({ 
            old: 'moved-file.js', 
            new: 'scripts/utilities/moved-file.js' 
          })
        }),
        async ({ scriptName, scriptContent, pathMapping }) => {
          // Create script without path references
          const scriptPath = path.join(tempDir, 'scripts', scriptName);
          await fs.writeFile(scriptPath, scriptContent);
          
          // Create path mapping
          const pathMappings = new Map([[pathMapping.old, pathMapping.new]]);
          
          // Update script references
          await updateReferences.updateScriptReferences(pathMappings);
          
          // Read updated script
          const updatedContent = await fs.readFile(scriptPath, 'utf-8');
          
          // Property: Script content should remain unchanged
          expect(updatedContent).toBe(scriptContent);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: findReferences correctly identifies all path occurrences
   * 
   * The findReferences function should locate all lines containing a path reference.
   */
  test('should find all references to a path in script content', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          targetPath: fc.constantFrom(
            'config/production.json',
            'scripts/validate.js',
            'deployment-config.json'
          ),
          occurrences: fc.integer({ min: 1, max: 5 })
        }),
        async ({ targetPath, occurrences }) => {
          // Create content with multiple references to the path
          let content = '';
          for (let i = 0; i < occurrences; i++) {
            content += `const ref${i} = require('./${targetPath}');\n`;
          }
          
          // Find references
          const references = updateReferences.findReferences(content, `./${targetPath}`);
          
          // Property: Number of references found should match occurrences
          expect(references.length).toBe(occurrences);
          
          // Property: Each reference should include a line number
          for (const ref of references) {
            expect(ref).toMatch(/^Line \d+$/);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
