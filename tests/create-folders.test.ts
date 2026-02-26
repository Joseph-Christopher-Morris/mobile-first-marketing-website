/**
 * Unit tests for folder structure creator
 * Tests folder creation, validation, and error handling
 * 
 * Validates: Requirements 1.1-1.8
 */

import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs/promises';
import * as path from 'path';

// Import the folder creation functions
const {
  createFolderStructure,
  getFolderStructure
} = require('../scripts/cleanup/create-folders.js');

describe('Folder Structure Creator', () => {
  const testBaseDir = path.join(process.cwd(), 'test-temp-folders');
  const originalCwd = process.cwd();

  beforeEach(async () => {
    // Create a temporary test directory
    await fs.mkdir(testBaseDir, { recursive: true });
    process.chdir(testBaseDir);
  });

  afterEach(async () => {
    // Clean up: return to original directory and remove test directory
    process.chdir(originalCwd);
    try {
      await fs.rm(testBaseDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('getFolderStructure', () => {
    test('returns correct documentation folder structure', () => {
      const structure = getFolderStructure();
      
      expect(structure.docs).toBeDefined();
      expect(structure.docs).toEqual([
        'summaries',
        'audits',
        'architecture',
        'decisions',
        'archive'
      ]);
    });

    test('returns correct scripts folder structure', () => {
      const structure = getFolderStructure();
      
      expect(structure.scripts).toBeDefined();
      expect(structure.scripts).toEqual([
        'fixes',
        'migrations',
        'utilities'
      ]);
    });

    test('returns object with docs and scripts properties', () => {
      const structure = getFolderStructure();
      
      expect(structure).toHaveProperty('docs');
      expect(structure).toHaveProperty('scripts');
      expect(Object.keys(structure)).toHaveLength(2);
    });
  });

  describe('createFolderStructure', () => {
    test('creates all required documentation folders', async () => {
      const result = await createFolderStructure();
      
      expect(result.success).toBe(true);
      
      // Verify all documentation folders exist
      const docFolders = ['summaries', 'audits', 'architecture', 'decisions', 'archive'];
      for (const folder of docFolders) {
        const folderPath = path.join('docs', folder);
        const stats = await fs.stat(folderPath);
        expect(stats.isDirectory()).toBe(true);
      }
    });

    test('creates all required script folders', async () => {
      const result = await createFolderStructure();
      
      expect(result.success).toBe(true);
      
      // Verify all script folders exist
      const scriptFolders = ['fixes', 'migrations', 'utilities'];
      for (const folder of scriptFolders) {
        const folderPath = path.join('scripts', folder);
        const stats = await fs.stat(folderPath);
        expect(stats.isDirectory()).toBe(true);
      }
    });

    test('returns success true when all folders created', async () => {
      const result = await createFolderStructure();
      
      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('returns list of created folders', async () => {
      const result = await createFolderStructure();
      
      expect(result.foldersCreated).toBeDefined();
      expect(result.foldersCreated.length).toBeGreaterThan(0);
      
      // Should include base directories
      expect(result.foldersCreated).toContain('docs');
      expect(result.foldersCreated).toContain('scripts');
      
      // Should include subdirectories
      expect(result.foldersCreated).toContain('docs/summaries');
      expect(result.foldersCreated).toContain('scripts/fixes');
    });

    test('handles existing folders gracefully', async () => {
      // Create folders first time
      const result1 = await createFolderStructure();
      expect(result1.success).toBe(true);
      
      // Create folders second time (should not fail)
      const result2 = await createFolderStructure();
      expect(result2.success).toBe(true);
      expect(result2.errors).toHaveLength(0);
    });

    test('validates all folders after creation', async () => {
      const result = await createFolderStructure();
      
      expect(result.success).toBe(true);
      
      // All expected folders should be validated
      const structure = getFolderStructure();
      const expectedFolders = [
        ...structure.docs.map(d => path.join('docs', d)),
        ...structure.scripts.map(s => path.join('scripts', s))
      ];
      
      for (const folder of expectedFolders) {
        const stats = await fs.stat(folder);
        expect(stats.isDirectory()).toBe(true);
      }
    });
  });

  describe('Error handling', () => {
    test('reports errors when folder creation fails', async () => {
      // Create a file with the same name as a folder we want to create
      await fs.writeFile('docs', 'this is a file, not a directory');
      
      const result = await createFolderStructure();
      
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('includes error details in result', async () => {
      // Create a file blocking folder creation
      await fs.writeFile('docs', 'blocking file');
      
      const result = await createFolderStructure();
      
      expect(result.errors).toBeDefined();
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('docs');
    });

    test('continues creating other folders after one fails', async () => {
      // Create a file blocking docs folder
      await fs.writeFile('docs', 'blocking file');
      
      const result = await createFolderStructure();
      
      // Scripts folder should still be created
      const scriptsExists = await fs.stat('scripts').then(s => s.isDirectory()).catch(() => false);
      expect(scriptsExists).toBe(true);
    });
  });

  describe('Folder validation', () => {
    test('detects when a path exists but is not a directory', async () => {
      // Create base docs directory
      await fs.mkdir('docs', { recursive: true });
      
      // Create a file instead of a directory
      await fs.writeFile(path.join('docs', 'summaries'), 'this is a file');
      
      const result = await createFolderStructure();
      
      expect(result.success).toBe(false);
      expect(result.errors.some(e => e.includes('not a directory'))).toBe(true);
    });

    test('validates all expected folders exist', async () => {
      const result = await createFolderStructure();
      
      expect(result.success).toBe(true);
      
      // Check that validation ran for all folders
      const structure = getFolderStructure();
      const totalExpectedFolders = structure.docs.length + structure.scripts.length;
      
      // All folders should exist
      const allFolders = [
        ...structure.docs.map(d => path.join('docs', d)),
        ...structure.scripts.map(s => path.join('scripts', s))
      ];
      
      for (const folder of allFolders) {
        const exists = await fs.stat(folder).then(() => true).catch(() => false);
        expect(exists).toBe(true);
      }
    });
  });

  describe('Requirements validation', () => {
    test('creates docs/summaries directory (Requirement 1.1)', async () => {
      const result = await createFolderStructure();
      
      expect(result.success).toBe(true);
      const stats = await fs.stat('docs/summaries');
      expect(stats.isDirectory()).toBe(true);
    });

    test('creates docs/audits directory (Requirement 1.2)', async () => {
      const result = await createFolderStructure();
      
      expect(result.success).toBe(true);
      const stats = await fs.stat('docs/audits');
      expect(stats.isDirectory()).toBe(true);
    });

    test('creates docs/architecture directory (Requirement 1.3)', async () => {
      const result = await createFolderStructure();
      
      expect(result.success).toBe(true);
      const stats = await fs.stat('docs/architecture');
      expect(stats.isDirectory()).toBe(true);
    });

    test('creates docs/decisions directory (Requirement 1.4)', async () => {
      const result = await createFolderStructure();
      
      expect(result.success).toBe(true);
      const stats = await fs.stat('docs/decisions');
      expect(stats.isDirectory()).toBe(true);
    });

    test('creates docs/archive directory (Requirement 1.5)', async () => {
      const result = await createFolderStructure();
      
      expect(result.success).toBe(true);
      const stats = await fs.stat('docs/archive');
      expect(stats.isDirectory()).toBe(true);
    });

    test('creates scripts/fixes directory (Requirement 1.6)', async () => {
      const result = await createFolderStructure();
      
      expect(result.success).toBe(true);
      const stats = await fs.stat('scripts/fixes');
      expect(stats.isDirectory()).toBe(true);
    });

    test('creates scripts/migrations directory (Requirement 1.7)', async () => {
      const result = await createFolderStructure();
      
      expect(result.success).toBe(true);
      const stats = await fs.stat('scripts/migrations');
      expect(stats.isDirectory()).toBe(true);
    });

    test('creates scripts/utilities directory (Requirement 1.8)', async () => {
      const result = await createFolderStructure();
      
      expect(result.success).toBe(true);
      const stats = await fs.stat('scripts/utilities');
      expect(stats.isDirectory()).toBe(true);
    });
  });
});
