/**
 * Property-Based Tests for Path Reference Updates in package.json
 * 
 * Tests Property 11: Path reference updates in package.json
 * Validates: Requirements 4.7, 8.5
 * 
 * For any script path reference in package.json that points to a moved script,
 * the reference should be updated to the new path location.
 */

import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as path from 'path';
import * as os from 'os';

const updateReferences = require('../scripts/cleanup/update-references.js');

describe('Property 11: Path reference updates in package.json', () => {
  let tempDir: string;
  let originalCwd: string;

  beforeEach(async () => {
    // Create a temporary directory for testing
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'update-refs-test-'));
    originalCwd = process.cwd();
    process.chdir(tempDir);
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
   * Property: Script path references in package.json are updated correctly
   * 
   * For any script command containing a path that has been moved,
   * the updatePackageJson function should replace the old path with the new path.
   */
  test('should update script path references to new locations', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random script names with unique names to avoid conflicts
        fc.array(
          fc.record({
            name: fc.stringMatching(/^[a-z][a-z0-9:-]*$/),
            pathPair: fc.oneof(
              fc.constant({ old: 'scripts/deploy.js', new: 'scripts/migrations/deploy.js' }),
              fc.constant({ old: 'scripts/validate.js', new: 'scripts/utilities/validate.js' }),
              fc.constant({ old: 'scripts/test-runner.js', new: 'scripts/utilities/test-runner.js' }),
              fc.constant({ old: 'validate-content.js', new: 'scripts/utilities/validate-content.js' }),
              fc.constant({ old: 'check-build.js', new: 'scripts/utilities/check-build.js' })
            )
          }),
          { minLength: 1, maxLength: 10 }
        ),
        async (scriptConfigs) => {
          // Create package.json with scripts referencing old paths
          const packageJson = {
            name: 'test-package',
            version: '1.0.0',
            scripts: {} as Record<string, string>
          };

          // Build scripts section with old paths, ensuring unique script names
          const uniqueScripts = new Map<string, { oldPath: string; newPath: string }>();
          for (const config of scriptConfigs) {
            // Use the first occurrence of each script name
            if (!uniqueScripts.has(config.name)) {
              uniqueScripts.set(config.name, {
                oldPath: config.pathPair.old,
                newPath: config.pathPair.new
              });
              packageJson.scripts[config.name] = `node ${config.pathPair.old}`;
            }
          }

          // Skip if no unique scripts
          if (uniqueScripts.size === 0) {
            return;
          }

          // Write package.json
          await fs.writeFile(
            path.join(tempDir, 'package.json'),
            JSON.stringify(packageJson, null, 2) + '\n'
          );

          // Create path mappings from unique scripts
          const pathMappings = new Map<string, string>();
          for (const [, paths] of uniqueScripts) {
            pathMappings.set(paths.oldPath, paths.newPath);
          }

          // Update package.json
          const result = await updateReferences.updatePackageJson(pathMappings);

          // Read updated package.json
          const updatedContent = await fs.readFile(
            path.join(tempDir, 'package.json'),
            'utf-8'
          );
          const updatedPackageJson = JSON.parse(updatedContent);

          // Verify all old paths were replaced with new paths
          for (const [scriptName, paths] of uniqueScripts) {
            const scriptCommand = updatedPackageJson.scripts[scriptName];
            
            // Property: New path should exist in the updated command
            expect(scriptCommand).toContain(paths.newPath);
            
            // Property: Old path should not exist as a standalone reference
            // (it may appear as part of the new path, which is acceptable)
            // Check that the command doesn't reference the old path directly
            const expectedCommand = `node ${paths.newPath}`;
            expect(scriptCommand).toBe(expectedCommand);
          }

          // Property: Update count should match number of scripts updated
          expect(result.updated).toBeGreaterThan(0);
          expect(result.errors).toHaveLength(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Multiple references to the same path are all updated
   * 
   * If a script command contains multiple references to the same old path,
   * all occurrences should be replaced with the new path.
   */
  test('should update all occurrences of a path in a single script command', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          scriptName: fc.stringMatching(/^[a-z][a-z0-9:-]*$/),
          // Use paths that won't be substrings of each other
          pathPair: fc.constantFrom(
            { old: 'scripts/old-helper.js', new: 'scripts/lib/new-helper.js' },
            { old: 'scripts/old-utils.js', new: 'scripts/utilities/new-utils.js' },
            { old: 'old-validate.js', new: 'scripts/utilities/new-validate.js' }
          ),
          occurrences: fc.integer({ min: 2, max: 5 })
        }),
        async ({ scriptName, pathPair, occurrences }) => {
          // Create a script command with multiple references to the same path
          const commandParts = [];
          for (let i = 0; i < occurrences; i++) {
            commandParts.push(`node ${pathPair.old}`);
          }
          const scriptCommand = commandParts.join(' && ');

          // Create package.json
          const packageJson = {
            name: 'test-package',
            version: '1.0.0',
            scripts: {
              [scriptName]: scriptCommand
            }
          };

          await fs.writeFile(
            path.join(tempDir, 'package.json'),
            JSON.stringify(packageJson, null, 2) + '\n'
          );

          // Create path mapping
          const pathMappings = new Map([[pathPair.old, pathPair.new]]);

          // Update package.json
          await updateReferences.updatePackageJson(pathMappings);

          // Read updated package.json
          const updatedContent = await fs.readFile(
            path.join(tempDir, 'package.json'),
            'utf-8'
          );
          const updatedPackageJson = JSON.parse(updatedContent);
          const updatedCommand = updatedPackageJson.scripts[scriptName];

          // Property: Old path should not appear anywhere in the updated command
          expect(updatedCommand).not.toContain(pathPair.old);

          // Property: New path should appear the same number of times as old path did
          const newPathCount = (updatedCommand.match(new RegExp(pathPair.new.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
          expect(newPathCount).toBe(occurrences);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Scripts without matching paths remain unchanged
   * 
   * If a script command does not contain any of the old paths in the mappings,
   * the script command should remain exactly as it was.
   */
  test('should not modify scripts that do not reference moved paths', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          unchangedScripts: fc.array(
            fc.record({
              name: fc.stringMatching(/^[a-z][a-z0-9:-]*$/),
              command: fc.constantFrom(
                'next build',
                'next dev',
                'vitest --run',
                'npm run lint',
                'echo "test"'
              )
            }),
            { minLength: 1, maxLength: 5 }
          ),
          pathMapping: fc.record({
            oldPath: fc.constant('scripts/moved.js'),
            newPath: fc.constant('scripts/utilities/moved.js')
          })
        }),
        async ({ unchangedScripts, pathMapping }) => {
          // Create package.json with scripts that don't reference the moved path
          const packageJson = {
            name: 'test-package',
            version: '1.0.0',
            scripts: {} as Record<string, string>
          };

          for (const script of unchangedScripts) {
            packageJson.scripts[script.name] = script.command;
          }

          const originalScripts = { ...packageJson.scripts };

          await fs.writeFile(
            path.join(tempDir, 'package.json'),
            JSON.stringify(packageJson, null, 2) + '\n'
          );

          // Create path mapping
          const pathMappings = new Map([[pathMapping.oldPath, pathMapping.newPath]]);

          // Update package.json
          await updateReferences.updatePackageJson(pathMappings);

          // Read updated package.json
          const updatedContent = await fs.readFile(
            path.join(tempDir, 'package.json'),
            'utf-8'
          );
          const updatedPackageJson = JSON.parse(updatedContent);

          // Property: Scripts without matching paths should remain unchanged
          for (const script of unchangedScripts) {
            expect(updatedPackageJson.scripts[script.name]).toBe(originalScripts[script.name]);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Path updates preserve script command structure
   * 
   * When updating paths, the rest of the script command structure
   * (flags, arguments, operators) should remain intact.
   */
  test('should preserve script command structure when updating paths', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          scriptName: fc.stringMatching(/^[a-z][a-z0-9:-]*$/),
          oldPath: fc.constant('scripts/deploy.js'),
          newPath: fc.constant('scripts/migrations/deploy.js'),
          prefix: fc.constantFrom('node', 'NODE_ENV=production node', 'npm run'),
          suffix: fc.constantFrom('', ' --verbose', ' --production', ' && echo "Done"')
        }),
        async ({ scriptName, oldPath, newPath, prefix, suffix }) => {
          // Create script command with prefix and suffix
          const originalCommand = `${prefix} ${oldPath}${suffix}`;

          const packageJson = {
            name: 'test-package',
            version: '1.0.0',
            scripts: {
              [scriptName]: originalCommand
            }
          };

          await fs.writeFile(
            path.join(tempDir, 'package.json'),
            JSON.stringify(packageJson, null, 2) + '\n'
          );

          // Create path mapping
          const pathMappings = new Map([[oldPath, newPath]]);

          // Update package.json
          await updateReferences.updatePackageJson(pathMappings);

          // Read updated package.json
          const updatedContent = await fs.readFile(
            path.join(tempDir, 'package.json'),
            'utf-8'
          );
          const updatedPackageJson = JSON.parse(updatedContent);
          const updatedCommand = updatedPackageJson.scripts[scriptName];

          // Property: Updated command should have the expected structure
          const expectedCommand = `${prefix} ${newPath}${suffix}`;
          expect(updatedCommand).toBe(expectedCommand);

          // Property: Prefix should be preserved
          expect(updatedCommand.startsWith(prefix)).toBe(true);

          // Property: Suffix should be preserved
          if (suffix) {
            expect(updatedCommand.endsWith(suffix)).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: JSON formatting is preserved
   * 
   * After updating paths, the package.json file should remain valid JSON
   * with proper formatting (2-space indentation, trailing newline).
   */
  test('should preserve JSON formatting after updates', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            name: fc.stringMatching(/^[a-z][a-z0-9:-]*$/),
            oldPath: fc.constant('old-script.js'),
            newPath: fc.constant('scripts/utilities/new-script.js')
          }),
          { minLength: 1, maxLength: 5 }
        ),
        async (scriptConfigs) => {
          // Create package.json
          const packageJson = {
            name: 'test-package',
            version: '1.0.0',
            scripts: {} as Record<string, string>
          };

          for (const config of scriptConfigs) {
            packageJson.scripts[config.name] = `node ${config.oldPath}`;
          }

          await fs.writeFile(
            path.join(tempDir, 'package.json'),
            JSON.stringify(packageJson, null, 2) + '\n'
          );

          // Create path mappings
          const pathMappings = new Map<string, string>();
          for (const config of scriptConfigs) {
            pathMappings.set(config.oldPath, config.newPath);
          }

          // Update package.json
          await updateReferences.updatePackageJson(pathMappings);

          // Read updated file
          const updatedContent = await fs.readFile(
            path.join(tempDir, 'package.json'),
            'utf-8'
          );

          // Property: File should be valid JSON
          expect(() => JSON.parse(updatedContent)).not.toThrow();

          // Property: File should end with newline
          expect(updatedContent.endsWith('\n')).toBe(true);

          // Property: File should use 2-space indentation
          const lines = updatedContent.split('\n');
          const indentedLines = lines.filter(line => line.startsWith('  '));
          if (indentedLines.length > 0) {
            // Check that indented lines use multiples of 2 spaces
            for (const line of indentedLines) {
              const leadingSpaces = line.match(/^ */)?.[0].length || 0;
              expect(leadingSpaces % 2).toBe(0);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Empty path mappings result in no changes
   * 
   * If the path mappings are empty, no updates should be made to package.json.
   */
  test('should not modify package.json when path mappings are empty', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            name: fc.stringMatching(/^[a-z][a-z0-9:-]*$/),
            command: fc.constantFrom(
              'node scripts/deploy.js',
              'npm run build',
              'vitest --run'
            )
          }),
          { minLength: 1, maxLength: 5 }
        ),
        async (scripts) => {
          // Create package.json
          const packageJson = {
            name: 'test-package',
            version: '1.0.0',
            scripts: {} as Record<string, string>
          };

          for (const script of scripts) {
            packageJson.scripts[script.name] = script.command;
          }

          const originalContent = JSON.stringify(packageJson, null, 2) + '\n';

          await fs.writeFile(
            path.join(tempDir, 'package.json'),
            originalContent
          );

          // Create empty path mappings
          const pathMappings = new Map<string, string>();

          // Update package.json
          const result = await updateReferences.updatePackageJson(pathMappings);

          // Read updated file
          const updatedContent = await fs.readFile(
            path.join(tempDir, 'package.json'),
            'utf-8'
          );

          // Property: Content should remain unchanged
          expect(updatedContent).toBe(originalContent);

          // Property: No updates should be reported
          expect(result.updated).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});
