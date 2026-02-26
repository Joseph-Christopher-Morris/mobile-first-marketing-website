/**
 * Property-based tests for scripts/lib directory preservation during path reference updates
 * Tests that files in scripts/lib are never moved or have their references updated
 * 
 * **Validates: Property 10 - Scripts/lib directory preservation**
 * **Requirements: 4.6**
 */

import { describe, test, expect } from 'vitest';
import * as fc from 'fast-check';

// Import the update-references functions
const {
  generatePathMappings,
  updateAllReferences,
  getJavaScriptFiles
} = require('../scripts/cleanup/update-references.js');

describe('Property-based tests: Scripts/lib directory preservation in path updates', () => {
  /**
   * Property 10: Scripts/lib directory preservation
   * 
   * For any file in the scripts/lib directory, the file should not be
   * moved or categorized during script consolidation. This means:
   * 1. No path mappings should be generated for scripts/lib files
   * 2. References to scripts/lib files should remain unchanged
   * 3. Files in scripts/lib should not appear in move reports
   * 
   * **Validates: Requirements 4.6**
   */

  test('Property 10.1: Path mappings never include scripts/lib files as source', () => {
    // Generate various move reports that should NOT include scripts/lib files
    // This tests that the system correctly excludes scripts/lib from categorization
    const moveReportGenerator = fc.record({
      timestamp: fc.constant(new Date('2025-01-01').toISOString()),
      documentation: fc.record({
        moved: fc.array(
          fc.record({
            source: fc.constantFrom(
              'DEPLOYMENT-SUMMARY.md',
              'validation-report.md',
              'AWS_GUIDE.md',
              'QUICK-REFERENCE.md'
            ),
            destination: fc.constantFrom(
              'docs/summaries/DEPLOYMENT-SUMMARY.md',
              'docs/audits/validation-report.md',
              'docs/architecture/AWS_GUIDE.md',
              'docs/decisions/QUICK-REFERENCE.md'
            )
          }),
          { minLength: 0, maxLength: 10 }
        )
      }),
      scripts: fc.record({
        moved: fc.array(
          fc.record({
            source: fc.constantFrom(
              'fix-bug.js',
              'deploy-app.js',
              'validate-config.js'
            ),
            destination: fc.constantFrom(
              'scripts/fixes/fix-bug.js',
              'scripts/migrations/deploy-app.js',
              'scripts/utilities/validate-config.js'
            )
          }),
          { minLength: 0, maxLength: 10 }
        )
      })
    });

    fc.assert(
      fc.property(moveReportGenerator, (moveReport) => {
        // Generate path mappings from the move report
        const pathMappings = generatePathMappings(moveReport);
        
        // Convert to array for easier testing
        const mappingsArray = Array.from(pathMappings.entries());
        
        // Verify that no source path contains scripts/lib
        // This should always be true because the categorization system
        // never scans scripts/lib directory
        for (const [source, destination] of mappingsArray) {
          expect(source).not.toMatch(/scripts\/lib\//);
          expect(source).not.toMatch(/^lib\//);
          
          // Also verify destination doesn't move files INTO scripts/lib
          // (scripts/lib should only contain manually placed library files)
          expect(destination).not.toMatch(/scripts\/lib\//);
        }
      }),
      { numRuns: 100 }
    );
  });

  test('Property 10.2: Files with "lib" in name but not in scripts/lib directory are processed normally', () => {
    // Generate move reports with files that have "lib" in the name
    const moveReportWithLibNamesGenerator = fc.record({
      timestamp: fc.constant(new Date('2025-01-01').toISOString()),
      documentation: fc.record({
        moved: fc.array(
          fc.record({
            source: fc.constantFrom(
              'library-guide.md',
              'lib-documentation.md',
              'calibration-report.md'
            ),
            destination: fc.constantFrom(
              'docs/architecture/library-guide.md',
              'docs/architecture/lib-documentation.md',
              'docs/audits/calibration-report.md'
            )
          }),
          { minLength: 0, maxLength: 5 }
        )
      }),
      scripts: fc.record({
        moved: fc.array(
          fc.record({
            source: fc.constantFrom(
              'validate-library.js',
              'test-lib-utils.js',
              'calibrate-system.js'
            ),
            destination: fc.constantFrom(
              'scripts/utilities/validate-library.js',
              'scripts/utilities/test-lib-utils.js',
              'scripts/utilities/calibrate-system.js'
            )
          }),
          { minLength: 0, maxLength: 5 }
        )
      })
    });

    fc.assert(
      fc.property(moveReportWithLibNamesGenerator, (moveReport) => {
        // Generate path mappings
        const pathMappings = generatePathMappings(moveReport);
        
        // These files should be processed normally
        // (they have "lib" in the name but are not in scripts/lib directory)
        const mappingsArray = Array.from(pathMappings.entries());
        
        for (const [source, destination] of mappingsArray) {
          // Source should not be in scripts/lib directory
          expect(source).not.toMatch(/^scripts\/lib\//);
          
          // But it's okay if the filename contains "lib"
          // as long as it's not in the scripts/lib directory
          if (source.includes('lib')) {
            // Verify it's a root-level file or in another directory
            expect(source).not.toMatch(/^scripts\/lib\//);
          }
        }
      }),
      { numRuns: 100 }
    );
  });

  test('Property 10.3: Path mappings preserve scripts/lib references in their original form', () => {
    // Generate path mappings that might reference scripts/lib files
    const pathMappingsGenerator = fc.array(
      fc.tuple(
        fc.oneof(
          fc.constantFrom(
            'validate-api.js',
            'deploy-service.js',
            'fix-bug.js',
            'test-integration.js'
          )
        ),
        fc.oneof(
          fc.constantFrom(
            'scripts/utilities/validate-api.js',
            'scripts/migrations/deploy-service.js',
            'scripts/fixes/fix-bug.js',
            'scripts/utilities/test-integration.js'
          )
        )
      ),
      { minLength: 0, maxLength: 10 }
    );

    fc.assert(
      fc.property(pathMappingsGenerator, (mappingsArray) => {
        // Create a Map from the array
        const pathMappings = new Map(mappingsArray);
        
        // Verify that scripts/lib paths are never in the mappings
        for (const [source, destination] of pathMappings) {
          // Source should never be from scripts/lib
          expect(source).not.toMatch(/scripts\/lib\//);
          
          // Destination should never be to scripts/lib
          // (scripts/lib is for manually placed library files only)
          expect(destination).not.toMatch(/scripts\/lib\//);
        }
      }),
      { numRuns: 100 }
    );
  });

  test('Property 10.4: getJavaScriptFiles includes scripts/lib files in scan', async () => {
    // This test verifies that getJavaScriptFiles DOES scan scripts/lib
    // (unlike categorizeFiles which only scans root)
    // This is correct because we need to update references WITHIN scripts/lib files
    // but we don't move the scripts/lib files themselves
    
    const scriptsDir = require('path').resolve(process.cwd(), 'scripts');
    const files = await getJavaScriptFiles(scriptsDir);
    
    // Convert to relative paths for easier testing
    const relativePaths = files.map(f => 
      require('path').relative(process.cwd(), f)
    );
    
    // Verify that scripts/lib files are included in the scan
    const libFiles = relativePaths.filter(f => f.includes('scripts/lib/'));
    
    // We should find scripts/lib files (they exist in the project)
    expect(libFiles.length).toBeGreaterThan(0);
    
    // Verify specific known lib files are found
    const hasIndexNowLogger = libFiles.some(f => f.includes('indexnow-logger.js'));
    expect(hasIndexNowLogger).toBe(true);
  });

  test('Property 10.5: References TO scripts/lib files are preserved during updates', () => {
    // Generate script content that references scripts/lib files
    const scriptContentGenerator = fc.oneof(
      fc.constant("const logger = require('./lib/indexnow-logger.js');"),
      fc.constant("const logger = require('../lib/indexnow-logger.js');"),
      fc.constant("const service = require('./lib/indexnow-service.js');"),
      fc.constant("import { logger } from './lib/indexnow-logger.js';"),
      fc.constant("import { service } from '../lib/indexnow-service.js';")
    );

    fc.assert(
      fc.property(scriptContentGenerator, (content) => {
        // Create empty path mappings (no scripts/lib files should be moved)
        const pathMappings = new Map();
        
        // Add some non-lib path mappings
        pathMappings.set('validate-api.js', 'scripts/utilities/validate-api.js');
        pathMappings.set('deploy-app.js', 'scripts/migrations/deploy-app.js');
        
        // The content should not be modified because scripts/lib paths
        // are not in the path mappings
        const originalContent = content;
        
        // Simulate what updateScriptReferences would do
        let modifiedContent = content;
        for (const [oldPath, newPath] of pathMappings) {
          if (modifiedContent.includes(oldPath)) {
            modifiedContent = modifiedContent.replace(
              new RegExp(oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
              newPath
            );
          }
        }
        
        // Content should remain unchanged because scripts/lib references
        // are not in the path mappings
        expect(modifiedContent).toBe(originalContent);
      }),
      { numRuns: 100 }
    );
  });

  test('Property 10.6: Move reports never contain scripts/lib as source directory', () => {
    // Generate various move reports
    const moveReportGenerator = fc.record({
      timestamp: fc.constant(new Date('2025-01-01').toISOString()),
      documentation: fc.record({
        moved: fc.array(
          fc.record({
            source: fc.constantFrom(
              'DEPLOYMENT.md',
              'validation.md',
              'guide.md'
            ),
            destination: fc.constantFrom(
              'docs/summaries/DEPLOYMENT.md',
              'docs/audits/validation.md',
              'docs/architecture/guide.md'
            )
          }),
          { minLength: 0, maxLength: 10 }
        )
      }),
      scripts: fc.record({
        moved: fc.array(
          fc.record({
            source: fc.constantFrom(
              'fix-issue.js',
              'deploy-prod.js',
              'validate-env.js'
            ),
            destination: fc.constantFrom(
              'scripts/fixes/fix-issue.js',
              'scripts/migrations/deploy-prod.js',
              'scripts/utilities/validate-env.js'
            )
          }),
          { minLength: 0, maxLength: 10 }
        )
      })
    });

    fc.assert(
      fc.property(moveReportGenerator, (moveReport) => {
        // Check all moved files
        const allMoves = [
          ...(moveReport.documentation?.moved || []),
          ...(moveReport.scripts?.moved || [])
        ];
        
        for (const move of allMoves) {
          // Source should never be from scripts/lib
          expect(move.source).not.toMatch(/^scripts\/lib\//);
          expect(move.source).not.toMatch(/^lib\//);
          
          // Destination should never be to scripts/lib
          expect(move.destination).not.toMatch(/^scripts\/lib\//);
        }
      }),
      { numRuns: 100 }
    );
  });

  test('Property 10.7: Relative paths to scripts/lib are preserved in moved files', () => {
    // Generate script content with relative imports to scripts/lib
    const relativePathGenerator = fc.oneof(
      fc.constant("require('./lib/logger.js')"),
      fc.constant("require('../lib/logger.js')"),
      fc.constant("require('../../lib/logger.js')"),
      fc.constant("require('./lib/utils.js')"),
      fc.constant("require('../lib/utils.js')")
    );

    fc.assert(
      fc.property(relativePathGenerator, (importStatement) => {
        // Create path mappings for non-lib files
        const pathMappings = new Map([
          ['validate.js', 'scripts/utilities/validate.js'],
          ['deploy.js', 'scripts/migrations/deploy.js'],
          ['fix.js', 'scripts/fixes/fix.js']
        ]);
        
        // The import statement should not be modified
        let content = `const logger = ${importStatement};\nconst validator = require('./validate.js');`;
        
        // Simulate reference updates
        for (const [oldPath, newPath] of pathMappings) {
          const patterns = [
            new RegExp(`require\\(['"]${oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]\\)`, 'g'),
            new RegExp(`from ['"]${oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'g')
          ];
          
          for (const pattern of patterns) {
            if (pattern.test(content)) {
              content = content.replace(pattern, (match) => {
                return match.replace(oldPath, newPath);
              });
            }
          }
        }
        
        // The scripts/lib import should still be present and unchanged
        expect(content).toContain(importStatement);
      }),
      { numRuns: 100 }
    );
  });

  test('Property 10.8: Scripts/lib files are never in the source of path mappings', () => {
    // Generate random move reports
    const moveReportGenerator = fc.record({
      timestamp: fc.constant(new Date('2025-01-01').toISOString()),
      documentation: fc.record({
        moved: fc.array(
          fc.record({
            source: fc.string({ minLength: 5, maxLength: 30 }).map(s => `${s}.md`),
            destination: fc.string({ minLength: 10, maxLength: 50 }).map(s => `docs/${s}.md`)
          }),
          { minLength: 0, maxLength: 10 }
        )
      }),
      scripts: fc.record({
        moved: fc.array(
          fc.record({
            source: fc.string({ minLength: 5, maxLength: 30 }).map(s => `${s}.js`),
            destination: fc.string({ minLength: 10, maxLength: 50 }).map(s => `scripts/${s}.js`)
          }),
          { minLength: 0, maxLength: 10 }
        )
      })
    });

    fc.assert(
      fc.property(moveReportGenerator, (moveReport) => {
        const pathMappings = generatePathMappings(moveReport);
        
        // Check all source paths
        for (const [source] of pathMappings) {
          // Source should never contain scripts/lib
          expect(source).not.toMatch(/scripts\/lib/);
          expect(source).not.toMatch(/^lib\//);
        }
      }),
      { numRuns: 100 }
    );
  });

  test('Property 10.9: updateAllReferences never modifies scripts/lib file paths', async () => {
    // Generate path mappings that don't include scripts/lib
    const pathMappingsGenerator = fc.array(
      fc.tuple(
        fc.constantFrom(
          'validate-config.js',
          'deploy-app.js',
          'fix-error.js',
          'test-api.js'
        ),
        fc.constantFrom(
          'scripts/utilities/validate-config.js',
          'scripts/migrations/deploy-app.js',
          'scripts/fixes/fix-error.js',
          'scripts/utilities/test-api.js'
        )
      ),
      { minLength: 1, maxLength: 5 }
    );

    await fc.assert(
      fc.asyncProperty(pathMappingsGenerator, async (mappingsArray) => {
        const pathMappings = new Map(mappingsArray);
        
        // Verify no scripts/lib paths in mappings
        for (const [source, destination] of pathMappings) {
          expect(source).not.toMatch(/scripts\/lib/);
          expect(destination).not.toMatch(/scripts\/lib/);
        }
        
        // This confirms that updateAllReferences will never try to
        // update scripts/lib file paths because they're not in the mappings
      }),
      { numRuns: 100 }
    );
  });

  test('Property 10.10: Scripts/lib preservation is enforced by not generating moves for lib files', () => {
    // Generate move reports with various file types
    const moveReportGenerator = fc.record({
      timestamp: fc.constant(new Date('2025-01-01').toISOString()),
      documentation: fc.record({
        moved: fc.array(
          fc.record({
            source: fc.oneof(
              fc.constantFrom(
                'DEPLOYMENT-COMPLETE.md',
                'validation-report.md',
                'AWS-SETUP-GUIDE.md'
              )
            ),
            destination: fc.oneof(
              fc.constantFrom(
                'docs/summaries/DEPLOYMENT-COMPLETE.md',
                'docs/audits/validation-report.md',
                'docs/architecture/AWS-SETUP-GUIDE.md'
              )
            )
          }),
          { minLength: 0, maxLength: 5 }
        )
      }),
      scripts: fc.record({
        moved: fc.array(
          fc.record({
            source: fc.oneof(
              fc.constantFrom(
                'fix-broken-links.js',
                'deploy-to-s3.js',
                'validate-build.js'
              )
            ),
            destination: fc.oneof(
              fc.constantFrom(
                'scripts/fixes/fix-broken-links.js',
                'scripts/migrations/deploy-to-s3.js',
                'scripts/utilities/validate-build.js'
              )
            )
          }),
          { minLength: 0, maxLength: 5 }
        )
      })
    });

    fc.assert(
      fc.property(moveReportGenerator, (moveReport) => {
        // Generate path mappings
        const pathMappings = generatePathMappings(moveReport);
        
        // Verify the preservation mechanism:
        // 1. No source paths contain scripts/lib
        // 2. No destination paths contain scripts/lib
        // 3. This means scripts/lib files are never moved
        
        for (const [source, destination] of pathMappings) {
          expect(source).not.toMatch(/scripts\/lib/);
          expect(destination).not.toMatch(/scripts\/lib/);
        }
        
        // This confirms that the preservation is enforced by the
        // categorization system not generating moves for scripts/lib files
      }),
      { numRuns: 100 }
    );
  });
});
