/**
 * Unit tests for git move executor
 * Tests the structure, interfaces, and error handling logic
 * 
 * Validates Requirements: 2.1
 * 
 * Note: These tests focus on the module's interface and structure.
 * Integration tests with actual git operations should be performed separately.
 */

import { describe, test, expect } from 'vitest';

// Import the functions to test
const {
  moveFiles,
  gitMove,
  validateMove
} = require('../scripts/cleanup/git-move-files.js');

describe('Git Move Executor', () => {
  describe('Module exports', () => {
    test('exports moveFiles function', () => {
      expect(typeof moveFiles).toBe('function');
    });

    test('exports gitMove function', () => {
      expect(typeof gitMove).toBe('function');
    });

    test('exports validateMove function', () => {
      expect(typeof validateMove).toBe('function');
    });
  });

  describe('gitMove - error handling', () => {
    test('returns an object with success and error properties', () => {
      // Test with non-existent file to get predictable error response
      const result = gitMove('nonexistent-test-file-12345.md', 'docs/summaries/nonexistent-test-file-12345.md');
      
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('error');
      expect(typeof result.success).toBe('boolean');
    });

    test('returns error when source file does not exist', () => {
      const result = gitMove('nonexistent-file-xyz.md', 'docs/summaries/nonexistent-file-xyz.md');
      
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
      expect(typeof result.error).toBe('string');
    });

    test('returns error message for missing source file', () => {
      const result = gitMove('missing-source.md', 'docs/summaries/missing-source.md');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Source file not found');
    });

    test('handles file paths with special characters in error messages', () => {
      const result = gitMove('file-with_special.chars.md', 'docs/summaries/file-with_special.chars.md');
      
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('error');
    });
  });

  describe('validateMove', () => {
    test('returns a boolean value', () => {
      const result = validateMove('source.md', 'docs/summaries/source.md');
      
      expect(typeof result).toBe('boolean');
    });

    test('returns false when source file does not exist', () => {
      const result = validateMove('nonexistent-source.md', 'docs/summaries/nonexistent-source.md');
      
      expect(result).toBe(false);
    });

    test('returns false when destination file does not exist', () => {
      const result = validateMove('nonexistent-source.md', 'nonexistent-destination.md');
      
      expect(result).toBe(false);
    });
  });

  describe('moveFiles - basic functionality', () => {
    test('returns an object with required properties', async () => {
      const manifest = {
        documentation: {
          summaries: []
        }
      };
      
      const result = await moveFiles(manifest, 'documentation');
      
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('moved');
      expect(result).toHaveProperty('failed');
      expect(result).toHaveProperty('totalMoved');
      expect(result).toHaveProperty('totalFailed');
    });

    test('returns arrays for moved and failed properties', async () => {
      const manifest = {
        documentation: {
          summaries: []
        }
      };
      
      const result = await moveFiles(manifest, 'documentation');
      
      expect(Array.isArray(result.moved)).toBe(true);
      expect(Array.isArray(result.failed)).toBe(true);
    });

    test('returns error when category not found in manifest', async () => {
      const manifest = {
        documentation: {
          summaries: []
        }
      };
      
      const result = await moveFiles(manifest, 'invalid-category');
      
      expect(result.success).toBe(false);
    });

    test('handles empty file lists', async () => {
      const manifest = {
        documentation: {
          summaries: [],
          audits: []
        }
      };
      
      const result = await moveFiles(manifest, 'documentation');
      
      expect(result.totalMoved).toBe(0);
      expect(result.totalFailed).toBe(0);
    });

    test('skips protected files category', async () => {
      const manifest = {
        documentation: {
          summaries: [],
          protected: ['aws-security-standards.md', 'deployment-standards.md']
        }
      };
      
      const result = await moveFiles(manifest, 'documentation');
      
      // Protected files should not be moved
      expect(result.totalMoved).toBe(0);
      expect(result.totalFailed).toBe(0);
    });

    test('reports failed moves for non-existent files', async () => {
      const manifest = {
        documentation: {
          summaries: ['nonexistent-file-12345.md']
        }
      };
      
      const result = await moveFiles(manifest, 'documentation');
      
      expect(result.success).toBe(false);
      expect(result.totalFailed).toBe(1);
      expect(result.failed).toHaveLength(1);
      expect(result.failed[0]).toHaveProperty('source');
      expect(result.failed[0]).toHaveProperty('error');
    });

    test('includes source in failed entries', async () => {
      const manifest = {
        documentation: {
          summaries: ['missing-test-file.md']
        }
      };
      
      const result = await moveFiles(manifest, 'documentation');
      
      expect(result.failed[0].source).toBe('missing-test-file.md');
      expect(typeof result.failed[0].error).toBe('string');
    });

    test('handles scripts category', async () => {
      const manifest = {
        scripts: {
          fixes: [],
          migrations: [],
          utilities: []
        }
      };
      
      const result = await moveFiles(manifest, 'scripts');
      
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('totalMoved');
      expect(result).toHaveProperty('totalFailed');
    });

    test('processes multiple subcategories', async () => {
      const manifest = {
        documentation: {
          summaries: [],
          audits: [],
          architecture: [],
          decisions: []
        }
      };
      
      const result = await moveFiles(manifest, 'documentation');
      
      expect(result.success).toBe(true);
      expect(result.totalMoved).toBe(0);
      expect(result.totalFailed).toBe(0);
    });
  });

  describe('Error handling', () => {
    test('gitMove handles missing source gracefully', () => {
      const result = gitMove('does-not-exist.md', 'destination.md');
      
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });

    test('moveFiles handles invalid manifest structure', async () => {
      const manifest = {};
      
      const result = await moveFiles(manifest, 'documentation');
      
      expect(result.success).toBe(false);
    });

    test('moveFiles handles null/undefined category', async () => {
      const manifest = {
        documentation: {
          summaries: []
        }
      };
      
      const result = await moveFiles(manifest, null);
      
      expect(result.success).toBe(false);
    });
  });

  describe('Result structure validation', () => {
    test('moveFiles result has correct structure for empty manifest', async () => {
      const manifest = {
        documentation: {
          summaries: []
        }
      };
      
      const result = await moveFiles(manifest, 'documentation');
      
      expect(typeof result.success).toBe('boolean');
      expect(typeof result.totalMoved).toBe('number');
      expect(typeof result.totalFailed).toBe('number');
      expect(Array.isArray(result.moved)).toBe(true);
      expect(Array.isArray(result.failed)).toBe(true);
    });

    test('gitMove result structure is consistent', () => {
      const result = gitMove('test.md', 'dest.md');
      
      expect(typeof result.success).toBe('boolean');
      expect(result.error === null || typeof result.error === 'string').toBe(true);
    });

    test('validateMove returns boolean', () => {
      const result = validateMove('source.md', 'dest.md');
      
      expect(typeof result).toBe('boolean');
    });
  });
});
