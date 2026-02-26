/**
 * Checkpoint Task 9 - Validation Tests
 * 
 * Validates that the three core components work correctly:
 * 1. scripts/cleanup/rename-files.js - File renaming with date standardization
 * 2. scripts/cleanup/update-references.js - Path reference updates
 * 3. scripts/cleanup/validate-build.js - Build validation
 */

import { describe, test, expect } from 'vitest';

// Import the components
const renameFiles = require('../scripts/cleanup/rename-files.js');
const updateReferences = require('../scripts/cleanup/update-references.js');
const validateBuild = require('../scripts/cleanup/validate-build.js');

describe('Checkpoint Task 9 - Component Validation', () => {
  
  describe('1. File Renamer (rename-files.js)', () => {
    
    test('extractDate should extract date from FEB-22-2026 format', () => {
      const date = renameFiles.extractDate('DEPLOYMENT-FEB-22-2026.md');
      expect(date).toBeInstanceOf(Date);
      expect(date?.getFullYear()).toBe(2026);
      expect(date?.getMonth()).toBe(1); // February (0-indexed)
      expect(date?.getDate()).toBe(22);
    });
    
    test('extractDate should extract date from ISO format (2025-10-15)', () => {
      const date = renameFiles.extractDate('report-2025-10-15.md');
      expect(date).toBeInstanceOf(Date);
      expect(date?.getFullYear()).toBe(2025);
      expect(date?.getMonth()).toBe(9); // October (0-indexed)
      expect(date?.getDate()).toBe(15);
    });
    
    test('extractDate should extract date from compact format (20251014)', () => {
      const date = renameFiles.extractDate('summary-20251014.md');
      expect(date).toBeInstanceOf(Date);
      expect(date?.getFullYear()).toBe(2025);
      expect(date?.getMonth()).toBe(9); // October (0-indexed)
      expect(date?.getDate()).toBe(14);
    });
    
    test('extractDate should return null for files with no date', () => {
      const date = renameFiles.extractDate('README.md');
      expect(date).toBeNull();
    });
    
    test('formatDate should format date as YYYY-MM-DD', () => {
      const date = new Date(2026, 1, 22); // February 22, 2026
      const formatted = renameFiles.formatDate(date);
      expect(formatted).toBe('2026-02-22');
    });
    
    test('formatDate should pad single-digit months and days', () => {
      const date = new Date(2025, 0, 5); // January 5, 2025
      const formatted = renameFiles.formatDate(date);
      expect(formatted).toBe('2025-01-05');
    });
    
    test('generateNewFilename should create YYYY-MM-DD prefix', () => {
      const date = new Date(2026, 1, 22);
      const newName = renameFiles.generateNewFilename('DEPLOYMENT-FEB-22-2026.md', date);
      expect(newName).toMatch(/^2026-02-22-/);
    });
    
    test('generateNewFilename should preserve file extension', () => {
      const date = new Date(2026, 1, 22);
      const newName = renameFiles.generateNewFilename('report.md', date);
      expect(newName).toMatch(/\.md$/);
    });
    
    test('generateNewFilename should remove existing date patterns', () => {
      const date = new Date(2026, 1, 22);
      const newName = renameFiles.generateNewFilename('DEPLOYMENT-FEB-22-2026-summary.md', date);
      // Should not contain the old date format
      expect(newName).not.toContain('FEB-22-2026');
      // Should start with new date format
      expect(newName).toMatch(/^2026-02-22-/);
    });
    
    test('generateNewFilename should handle files with multiple extensions', () => {
      const date = new Date(2026, 1, 22);
      const newName = renameFiles.generateNewFilename('archive.tar.gz', date);
      expect(newName).toMatch(/\.gz$/);
    });
    
    test('generateNewFilename should clean up multiple dashes', () => {
      const date = new Date(2026, 1, 22);
      const newName = renameFiles.generateNewFilename('report---summary.md', date);
      // Should not have multiple consecutive dashes
      expect(newName).not.toMatch(/--/);
    });
  });
  
  describe('2. Path Reference Updater (update-references.js)', () => {
    
    test('findReferences should locate path references in content', () => {
      const content = `
        const deploy = require('./scripts/deploy.js');
        // Another reference to scripts/deploy.js
        import { validate } from './scripts/deploy.js';
      `;
      const references = updateReferences.findReferences(content, 'scripts/deploy.js');
      expect(references.length).toBeGreaterThan(0);
    });
    
    test('findReferences should return line numbers', () => {
      const content = `Line 1
Line 2 with scripts/deploy.js
Line 3`;
      const references = updateReferences.findReferences(content, 'scripts/deploy.js');
      expect(references).toContain('Line 2');
    });
    
    test('findReferences should handle multiple references', () => {
      const content = `
        require('scripts/old.js');
        import from 'scripts/old.js';
        const path = 'scripts/old.js';
      `;
      const references = updateReferences.findReferences(content, 'scripts/old.js');
      expect(references.length).toBe(3);
    });
    
    test('generatePathMappings should create mappings from move report', () => {
      const moveReport = {
        documentation: {
          moved: [
            { source: 'old-doc.md', destination: 'docs/summaries/new-doc.md' }
          ]
        },
        scripts: {
          moved: [
            { source: 'old-script.js', destination: 'scripts/utilities/new-script.js' }
          ]
        }
      };
      
      const mappings = updateReferences.generatePathMappings(moveReport);
      expect(mappings.size).toBe(2);
      expect(mappings.get('old-doc.md')).toBe('docs/summaries/new-doc.md');
      expect(mappings.get('old-script.js')).toBe('scripts/utilities/new-script.js');
    });
    
    test('generatePathMappings should handle empty move report', () => {
      const moveReport = {
        documentation: { moved: [] },
        scripts: { moved: [] }
      };
      
      const mappings = updateReferences.generatePathMappings(moveReport);
      expect(mappings.size).toBe(0);
    });
  });
  
  describe('3. Build Validator (validate-build.js)', () => {
    
    test('analyzeBreakage should detect module not found errors', () => {
      const buildError = `
        Error: Cannot find module './scripts/missing.js'
        at Function.Module._resolveFilename
      `;
      
      const suspected = validateBuild.analyzeBreakage(buildError);
      expect(suspected).toContain('./scripts/missing.js');
    });
    
    test('analyzeBreakage should detect file not found errors', () => {
      const buildError = `
        ENOENT: no such file or directory, open '/path/to/missing-file.js'
      `;
      
      const suspected = validateBuild.analyzeBreakage(buildError);
      expect(suspected.length).toBeGreaterThan(0);
    });
    
    test('analyzeBreakage should detect import errors', () => {
      const buildError = `
        Error: Unable to resolve './components/missing.tsx'
      `;
      
      const suspected = validateBuild.analyzeBreakage(buildError);
      expect(suspected).toContain('./components/missing.tsx');
    });
    
    test('analyzeBreakage should filter out node_modules paths', () => {
      const buildError = `
        Error at node_modules/some-package/index.js
        Error at scripts/my-script.js
      `;
      
      const suspected = validateBuild.analyzeBreakage(buildError);
      // Should include project file but not node_modules
      expect(suspected.some(f => f.includes('scripts/my-script.js'))).toBe(true);
      expect(suspected.some(f => f.includes('node_modules'))).toBe(false);
    });
    
    test('analyzeBreakage should remove duplicate paths', () => {
      const buildError = `
        Error: Cannot find module './scripts/missing.js'
        Error: Cannot find module './scripts/missing.js'
        Error: Cannot find module './scripts/missing.js'
      `;
      
      const suspected = validateBuild.analyzeBreakage(buildError);
      // Should only have one entry for the duplicate path
      const missingJsCount = suspected.filter(f => f === './scripts/missing.js').length;
      expect(missingJsCount).toBe(1);
    });
    
    test('analyzeBreakage should return empty array for no errors', () => {
      const buildError = '';
      const suspected = validateBuild.analyzeBreakage(buildError);
      expect(suspected).toEqual([]);
    });
    
    test('generateReport should include success status', () => {
      const result = {
        success: true,
        buildOutput: 'Build completed',
        outputDirectoryValid: true,
        missingFiles: [],
        suspectedBreakage: [],
        recommendations: ['Build validation successful']
      };
      
      const report = validateBuild.generateReport(result);
      expect(report).toContain('✓ PASSED');
    });
    
    test('generateReport should include failure status', () => {
      const result = {
        success: false,
        buildOutput: 'Build failed',
        outputDirectoryValid: false,
        missingFiles: ['index.html'],
        suspectedBreakage: ['./scripts/broken.js'],
        recommendations: ['Fix broken references']
      };
      
      const report = validateBuild.generateReport(result);
      expect(report).toContain('✗ FAILED');
      expect(report).toContain('Missing Files:');
      expect(report).toContain('Suspected Broken References:');
    });
  });
  
  describe('Integration - All Components Working Together', () => {
    
    test('All three components should export required functions', () => {
      // Rename files component
      expect(typeof renameFiles.extractDate).toBe('function');
      expect(typeof renameFiles.formatDate).toBe('function');
      expect(typeof renameFiles.generateNewFilename).toBe('function');
      expect(typeof renameFiles.renameFiles).toBe('function');
      
      // Update references component
      expect(typeof updateReferences.findReferences).toBe('function');
      expect(typeof updateReferences.generatePathMappings).toBe('function');
      expect(typeof updateReferences.updateAllReferences).toBe('function');
      
      // Validate build component
      expect(typeof validateBuild.analyzeBreakage).toBe('function');
      expect(typeof validateBuild.generateReport).toBe('function');
      expect(typeof validateBuild.validateBuild).toBe('function');
    });
    
    test('Date extraction and formatting should work end-to-end', () => {
      // Extract date from filename
      const filename = 'DEPLOYMENT-FEB-22-2026-summary.md';
      const extractedDate = renameFiles.extractDate(filename);
      
      expect(extractedDate).toBeInstanceOf(Date);
      
      // Format the date
      const formatted = renameFiles.formatDate(extractedDate!);
      expect(formatted).toBe('2026-02-22');
      
      // Generate new filename
      const newFilename = renameFiles.generateNewFilename(filename, extractedDate!);
      expect(newFilename).toMatch(/^2026-02-22-/);
      expect(newFilename).toMatch(/\.md$/);
    });
    
    test('Path mapping and reference finding should work together', () => {
      // Create a move report
      const moveReport = {
        scripts: {
          moved: [
            { source: 'deploy.js', destination: 'scripts/migrations/deploy.js' }
          ]
        }
      };
      
      // Generate path mappings
      const mappings = updateReferences.generatePathMappings(moveReport);
      expect(mappings.size).toBe(1);
      
      // Find references in content
      const content = 'const deploy = require("./deploy.js");';
      const references = updateReferences.findReferences(content, 'deploy.js');
      expect(references.length).toBeGreaterThan(0);
    });
  });
});
