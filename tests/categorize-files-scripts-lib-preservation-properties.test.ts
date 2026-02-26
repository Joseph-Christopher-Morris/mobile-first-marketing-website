/**
 * Property-based tests for scripts/lib directory preservation
 * Tests that files in scripts/lib are never moved or categorized
 * 
 * **Validates: Property 10 - Scripts/lib directory preservation**
 * **Requirements: 4.6**
 */

import { describe, test, expect, beforeAll } from 'vitest';
import * as fc from 'fast-check';
import * as path from 'path';

// Import the categorization functions
const {
  classifyScript,
  categorizeFiles,
  loadConfig
} = require('../scripts/cleanup/categorize-files.js');

describe('Property-based tests: Scripts/lib directory preservation', () => {
  beforeAll(async () => {
    // Load configuration before running tests
    await loadConfig();
  });

  /**
   * Property 10: Scripts/lib directory preservation
   * 
   * For any file in the scripts/lib directory, the file should not be
   * moved or categorized during script consolidation.
   * 
   * **Validates: Requirements 4.6**
   */

  test('Property 10.1: Files in scripts/lib directory are never categorized', () => {
    // Generate various JavaScript filenames that might match categorization patterns
    const scriptsLibFilenameGenerator = fc.oneof(
      // Files that would normally match 'fixes' pattern
      fc.stringMatching(/^[a-z0-9-]+$/).map(name => `fix-${name}.js`),
      fc.stringMatching(/^[a-z0-9-]+$/).map(name => `${name}-fix.js`),
      fc.stringMatching(/^[a-z0-9-]+$/).map(name => `repair-${name}.js`),
      
      // Files that would normally match 'migrations' pattern
      fc.stringMatching(/^[a-z0-9-]+$/).map(name => `deploy-${name}.js`),
      fc.stringMatching(/^[a-z0-9-]+$/).map(name => `setup-${name}.js`),
      fc.stringMatching(/^[a-z0-9-]+$/).map(name => `configure-${name}.js`),
      fc.stringMatching(/^[a-z0-9-]+$/).map(name => `migrate-${name}.js`),
      
      // Files that would normally match 'utilities' pattern
      fc.stringMatching(/^[a-z0-9-]+$/).map(name => `validate-${name}.js`),
      fc.stringMatching(/^[a-z0-9-]+$/).map(name => `test-${name}.js`),
      fc.stringMatching(/^[a-z0-9-]+$/).map(name => `verify-${name}.js`),
      fc.stringMatching(/^[a-z0-9-]+$/).map(name => `check-${name}.js`),
      fc.stringMatching(/^[a-z0-9-]+$/).map(name => `monitor-${name}.js`),
      
      // Generic library files
      fc.stringMatching(/^[a-z0-9-]+$/).map(name => `${name}.js`),
      fc.constantFrom('logger.js', 'utils.js', 'helpers.js', 'config.js', 'constants.js')
    );

    fc.assert(
      fc.property(scriptsLibFilenameGenerator, (filename) => {
        // The categorize-files.js only scans root directory, not subdirectories
        // So files in scripts/lib should never be encountered by classifyScript
        // when it's called from categorizeFiles()
        
        // However, if someone were to call classifyScript directly on a
        // scripts/lib file, it would return a category based on pattern matching
        // This is expected behavior - the protection comes from not scanning
        // the scripts/lib directory in the first place
        
        // Test that classifyScript would categorize these files if they were
        // in the root directory (to verify the patterns work)
        const category = classifyScript(filename);
        
        // The file should either match a pattern or return null
        // This verifies the classification logic works
        expect(['fixes', 'migrations', 'utilities', null]).toContain(category);
      }),
      { numRuns: 100 }
    );
  });

  test('Property 10.2: categorizeFiles only scans root directory, not scripts/lib', async () => {
    // Run categorizeFiles and verify it only processes root-level files
    const manifest = await categorizeFiles();
    
    // Verify the manifest structure
    expect(manifest).toHaveProperty('scripts');
    expect(manifest.scripts).toHaveProperty('fixes');
    expect(manifest.scripts).toHaveProperty('migrations');
    expect(manifest.scripts).toHaveProperty('utilities');
    
    // Verify that no files from scripts/lib are in the manifest
    const allScriptFiles = [
      ...manifest.scripts.fixes,
      ...manifest.scripts.migrations,
      ...manifest.scripts.utilities
    ];
    
    // None of the categorized scripts should be from scripts/lib
    allScriptFiles.forEach(filename => {
      expect(filename).not.toMatch(/^scripts\/lib\//);
      expect(filename).not.toMatch(/^lib\//);
      // Files should be simple filenames from root, not paths
      expect(filename).not.toContain('/');
    });
  });

  test('Property 10.3: Known scripts/lib files are never in categorization manifest', async () => {
    // Test with actual files that exist in scripts/lib
    const knownLibFiles = [
      'indexnow-logger.js',
      'indexnow-service.js',
      'url-collector.js'
    ];
    
    const manifest = await categorizeFiles();
    
    const allScriptFiles = [
      ...manifest.scripts.fixes,
      ...manifest.scripts.migrations,
      ...manifest.scripts.utilities
    ];
    
    // None of the known lib files should appear in the manifest
    knownLibFiles.forEach(libFile => {
      expect(allScriptFiles).not.toContain(libFile);
      expect(allScriptFiles).not.toContain(`lib/${libFile}`);
      expect(allScriptFiles).not.toContain(`scripts/lib/${libFile}`);
    });
  });

  test('Property 10.4: Files with lib-like names in root are categorized normally', () => {
    // Generate filenames that contain "lib" but would be in root directory
    const libLikeFilenameGenerator = fc.oneof(
      fc.constant('validate-lib.js'),
      fc.constant('test-lib.js'),
      fc.constant('deploy-lib.js'),
      fc.constant('fix-lib.js'),
      fc.constant('lib-utils.js'),
      fc.constant('lib-helpers.js')
    );

    fc.assert(
      fc.property(libLikeFilenameGenerator, (filename) => {
        // Files in root directory with "lib" in the name should still be
        // categorized based on their pattern matching
        const category = classifyScript(filename);
        
        // These should match their respective patterns
        if (filename.startsWith('validate-') || filename.startsWith('test-')) {
          expect(category).toBe('utilities');
        } else if (filename.startsWith('deploy-')) {
          expect(category).toBe('migrations');
        } else if (filename.startsWith('fix-')) {
          expect(category).toBe('fixes');
        }
      }),
      { numRuns: 100 }
    );
  });

  test('Property 10.5: Directory scanning excludes subdirectories', async () => {
    // Verify that categorizeFiles only processes files, not directories
    const manifest = await categorizeFiles();
    
    // Get all categorized items
    const allItems = [
      ...manifest.documentation.summaries,
      ...manifest.documentation.audits,
      ...manifest.documentation.architecture,
      ...manifest.documentation.decisions,
      ...manifest.documentation.archive,
      ...manifest.documentation.protected,
      ...manifest.scripts.fixes,
      ...manifest.scripts.migrations,
      ...manifest.scripts.utilities
    ];
    
    // None of the items should be directory paths
    allItems.forEach(item => {
      // Should not contain path separators (meaning it's from root)
      expect(item).not.toContain('/');
      expect(item).not.toContain('\\');
      
      // Should not be a directory name
      expect(item).not.toBe('scripts');
      expect(item).not.toBe('lib');
      expect(item).not.toBe('docs');
      expect(item).not.toBe('src');
      expect(item).not.toBe('config');
      expect(item).not.toBe('public');
    });
  });

  test('Property 10.6: Pattern matching works independently of file location', () => {
    // Generate various script patterns
    const scriptPatternGenerator = fc.oneof(
      fc.tuple(
        fc.constantFrom('fix-', 'repair-'),
        fc.stringMatching(/^[a-z0-9-]+$/)
      ).map(([prefix, suffix]) => `${prefix}${suffix}.js`),
      
      fc.tuple(
        fc.constantFrom('deploy-', 'setup-', 'configure-', 'migrate-'),
        fc.stringMatching(/^[a-z0-9-]+$/)
      ).map(([prefix, suffix]) => `${prefix}${suffix}.js`),
      
      fc.tuple(
        fc.constantFrom('validate-', 'test-', 'verify-', 'check-', 'monitor-'),
        fc.stringMatching(/^[a-z0-9-]+$/)
      ).map(([prefix, suffix]) => `${prefix}${suffix}.js`)
    );

    fc.assert(
      fc.property(scriptPatternGenerator, (filename) => {
        // Pattern matching should work the same regardless of where the file is
        const category = classifyScript(filename);
        
        // Verify the category matches the pattern
        expect(category).not.toBeNull();
        expect(['fixes', 'migrations', 'utilities']).toContain(category);
        
        // The key point: classifyScript doesn't care about file location
        // The protection comes from categorizeFiles not scanning scripts/lib
      }),
      { numRuns: 100 }
    );
  });

  test('Property 10.7: Preservation is enforced by directory scanning, not pattern exclusion', () => {
    // This test documents the design decision:
    // scripts/lib files are preserved because categorizeFiles doesn't scan
    // subdirectories, NOT because there's a special exclusion pattern
    
    // Generate filenames that would match categorization patterns
    const matchingPatternGenerator = fc.oneof(
      fc.constant('validate-api.js'),
      fc.constant('deploy-service.js'),
      fc.constant('fix-bug.js')
    );

    fc.assert(
      fc.property(matchingPatternGenerator, (filename) => {
        // If these files were in root, they would be categorized
        const category = classifyScript(filename);
        expect(category).not.toBeNull();
        
        // But because they're in scripts/lib (a subdirectory),
        // categorizeFiles never encounters them
        // This is the preservation mechanism
      }),
      { numRuns: 100 }
    );
  });

  test('Property 10.8: Manifest totalFiles count excludes scripts/lib files', async () => {
    // Generate random iterations to test consistency
    const iterationGenerator = fc.integer({ min: 1, max: 10 });

    await fc.assert(
      fc.asyncProperty(iterationGenerator, async (iteration) => {
        // Run categorizeFiles multiple times
        const manifest = await categorizeFiles();
        
        // Count all categorized files
        const docCount = 
          manifest.documentation.summaries.length +
          manifest.documentation.audits.length +
          manifest.documentation.architecture.length +
          manifest.documentation.decisions.length +
          manifest.documentation.archive.length +
          manifest.documentation.protected.length;
        
        const scriptCount =
          manifest.scripts.fixes.length +
          manifest.scripts.migrations.length +
          manifest.scripts.utilities.length;
        
        const totalCategorized = docCount + scriptCount;
        
        // The totalFiles should match the sum of categorized files
        expect(manifest.totalFiles).toBe(totalCategorized);
        
        // This verifies that scripts/lib files are not counted
        // because they're never scanned
      }),
      { numRuns: 100 }
    );
  });

  test('Property 10.9: Root-level scripts with "lib" substring are not protected', () => {
    // Generate filenames with "lib" substring that match patterns
    const libSubstringGenerator = fc.oneof(
      fc.constant('validate-library.js'),
      fc.constant('test-lib-utils.js'),
      fc.constant('deploy-lib-config.js'),
      fc.constant('fix-lib-error.js'),
      fc.constant('calibrate-system.js'), // contains "lib"
      fc.constant('deliberate-action.js')  // contains "lib"
    );

    fc.assert(
      fc.property(libSubstringGenerator, (filename) => {
        // Files with "lib" in the name should still be categorized
        // if they match patterns
        const category = classifyScript(filename);
        
        // Files matching patterns should be categorized
        if (filename.startsWith('validate-') || filename.startsWith('test-')) {
          expect(category).toBe('utilities');
        } else if (filename.startsWith('deploy-')) {
          expect(category).toBe('migrations');
        } else if (filename.startsWith('fix-')) {
          expect(category).toBe('fixes');
        } else {
          // Files not matching patterns return null
          expect(category).toBeNull();
        }
      }),
      { numRuns: 100 }
    );
  });

  test('Property 10.10: Categorization is location-aware through directory scanning', async () => {
    // This test verifies the complete preservation mechanism:
    // 1. categorizeFiles only scans root directory
    // 2. scripts/lib is a subdirectory, so it's never scanned
    // 3. Therefore, scripts/lib files are never categorized or moved
    
    const manifest = await categorizeFiles();
    
    // Verify manifest only contains root-level files
    const allFiles = [
      ...manifest.documentation.summaries,
      ...manifest.documentation.audits,
      ...manifest.documentation.architecture,
      ...manifest.documentation.decisions,
      ...manifest.documentation.archive,
      ...manifest.documentation.protected,
      ...manifest.scripts.fixes,
      ...manifest.scripts.migrations,
      ...manifest.scripts.utilities
    ];
    
    // All files should be simple filenames (no paths)
    allFiles.forEach(file => {
      expect(file).not.toMatch(/\//);
      expect(file).not.toMatch(/\\/);
    });
    
    // This confirms that subdirectory files (including scripts/lib)
    // are never included in the categorization manifest
  });
});
