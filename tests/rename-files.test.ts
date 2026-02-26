/**
 * Unit Tests for File Renamer
 * 
 * Tests specific examples and edge cases for:
 * - Date extraction from various formats
 * - Fallback to file modification timestamp
 * - Filename generation with date prefixes
 * - Edge cases (multiple dates, no dates, special characters)
 * 
 * Validates Requirements: 3.1-3.6
 */

import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const renameFiles = require('../scripts/cleanup/rename-files.js');

describe('File Renamer - Unit Tests', () => {
  
  describe('extractDate - Specific Format Tests', () => {
    
    test('should extract date from FEB-22-2026 format', () => {
      const date = renameFiles.extractDate('DEPLOYMENT-FEB-22-2026.md');
      expect(date).toBeInstanceOf(Date);
      expect(date?.getFullYear()).toBe(2026);
      expect(date?.getMonth()).toBe(1); // February (0-indexed)
      expect(date?.getDate()).toBe(22);
    });
    
    test('should extract date from NOV-11-2025 format', () => {
      const date = renameFiles.extractDate('SUMMARY-NOV-11-2025.md');
      expect(date).toBeInstanceOf(Date);
      expect(date?.getFullYear()).toBe(2025);
      expect(date?.getMonth()).toBe(10); // November (0-indexed)
      expect(date?.getDate()).toBe(11);
    });
    
    test('should extract date from DEC-18-2025 format', () => {
      const date = renameFiles.extractDate('REPORT-DEC-18-2025.md');
      expect(date).toBeInstanceOf(Date);
      expect(date?.getFullYear()).toBe(2025);
      expect(date?.getMonth()).toBe(11); // December (0-indexed)
      expect(date?.getDate()).toBe(18);
    });
    
    test('should extract date from JAN-1-2025 format (single digit day)', () => {
      const date = renameFiles.extractDate('AUDIT-JAN-1-2025.md');
      expect(date).toBeInstanceOf(Date);
      expect(date?.getFullYear()).toBe(2025);
      expect(date?.getMonth()).toBe(0); // January (0-indexed)
      expect(date?.getDate()).toBe(1);
    });
    
    test('should extract date from ISO format (2025-10-15)', () => {
      const date = renameFiles.extractDate('report-2025-10-15.md');
      expect(date).toBeInstanceOf(Date);
      expect(date?.getFullYear()).toBe(2025);
      expect(date?.getMonth()).toBe(9); // October (0-indexed)
      expect(date?.getDate()).toBe(15);
    });
    
    test('should extract date from ISO format (2026-02-22)', () => {
      const date = renameFiles.extractDate('deployment-2026-02-22.md');
      expect(date).toBeInstanceOf(Date);
      expect(date?.getFullYear()).toBe(2026);
      expect(date?.getMonth()).toBe(1); // February (0-indexed)
      expect(date?.getDate()).toBe(22);
    });
    
    test('should extract date from compact format (20251014)', () => {
      const date = renameFiles.extractDate('summary-20251014.md');
      expect(date).toBeInstanceOf(Date);
      expect(date?.getFullYear()).toBe(2025);
      expect(date?.getMonth()).toBe(9); // October (0-indexed)
      expect(date?.getDate()).toBe(14);
    });
    
    test('should extract date from compact format (20260222)', () => {
      const date = renameFiles.extractDate('audit-20260222.md');
      expect(date).toBeInstanceOf(Date);
      expect(date?.getFullYear()).toBe(2026);
      expect(date?.getMonth()).toBe(1); // February (0-indexed)
      expect(date?.getDate()).toBe(22);
    });
    
    test('should extract date from Unix timestamp (1760532969283)', () => {
      const date = renameFiles.extractDate('file-1760532969283.md');
      expect(date).toBeInstanceOf(Date);
      // Timestamp 1760532969283 is approximately 2025-10-15
      expect(date?.getFullYear()).toBeGreaterThanOrEqual(2025);
      expect(date?.getFullYear()).toBeLessThanOrEqual(2026);
    });
    
    test('should handle case-insensitive month abbreviations', () => {
      const dateLower = renameFiles.extractDate('file-feb-22-2026.md');
      const dateUpper = renameFiles.extractDate('file-FEB-22-2026.md');
      const dateMixed = renameFiles.extractDate('file-Feb-22-2026.md');
      
      expect(dateLower).toBeInstanceOf(Date);
      expect(dateUpper).toBeInstanceOf(Date);
      expect(dateMixed).toBeInstanceOf(Date);
      
      expect(dateLower?.getMonth()).toBe(1);
      expect(dateUpper?.getMonth()).toBe(1);
      expect(dateMixed?.getMonth()).toBe(1);
    });
    
    test('should return null for files with no date', () => {
      const date = renameFiles.extractDate('README.md');
      expect(date).toBeNull();
    });
    
    test('should return null for files with invalid date patterns', () => {
      const date = renameFiles.extractDate('file-XYZ-99-9999.md');
      expect(date).toBeNull();
    });
    
    test('should return null for files with out-of-range dates', () => {
      // Year 1999 is before 2000 threshold
      const date = renameFiles.extractDate('file-19991231.md');
      expect(date).toBeNull();
    });
    
    test('should return null for files with invalid compact dates', () => {
      // Month 13 is invalid
      const date = renameFiles.extractDate('file-20251301.md');
      expect(date).toBeNull();
    });
  });
  
  describe('extractDate - Edge Cases with Multiple Dates', () => {
    
    test('should extract first valid date when multiple dates present', () => {
      // File has both month-day-year and ISO format
      const date = renameFiles.extractDate('DEPLOYMENT-FEB-22-2026-summary-2025-10-15.md');
      expect(date).toBeInstanceOf(Date);
      // Should extract FEB-22-2026 (first pattern match)
      expect(date?.getFullYear()).toBe(2026);
      expect(date?.getMonth()).toBe(1);
      expect(date?.getDate()).toBe(22);
    });
    
    test('should extract date based on pattern priority', () => {
      // The implementation checks patterns in order, so FEB-22-2026 pattern is checked first
      const date = renameFiles.extractDate('report-2025-10-15-FEB-22-2026.md');
      expect(date).toBeInstanceOf(Date);
      // Should extract FEB-22-2026 (first pattern in the list that matches)
      expect(date?.getFullYear()).toBe(2026);
      expect(date?.getMonth()).toBe(1);
      expect(date?.getDate()).toBe(22);
    });
    
    test('should handle file with date in middle of name', () => {
      const date = renameFiles.extractDate('deployment-summary-FEB-22-2026-final.md');
      expect(date).toBeInstanceOf(Date);
      expect(date?.getFullYear()).toBe(2026);
      expect(date?.getMonth()).toBe(1);
      expect(date?.getDate()).toBe(22);
    });
    
    test('should handle file with date at end of name', () => {
      const date = renameFiles.extractDate('deployment-summary-FEB-22-2026.md');
      expect(date).toBeInstanceOf(Date);
      expect(date?.getFullYear()).toBe(2026);
      expect(date?.getMonth()).toBe(1);
      expect(date?.getDate()).toBe(22);
    });
  });
  
  describe('formatDate - Date Formatting', () => {
    
    test('should format date as YYYY-MM-DD', () => {
      const date = new Date(2026, 1, 22); // February 22, 2026
      const formatted = renameFiles.formatDate(date);
      expect(formatted).toBe('2026-02-22');
    });
    
    test('should pad single-digit months', () => {
      const date = new Date(2025, 0, 15); // January 15, 2025
      const formatted = renameFiles.formatDate(date);
      expect(formatted).toBe('2025-01-15');
    });
    
    test('should pad single-digit days', () => {
      const date = new Date(2025, 9, 5); // October 5, 2025
      const formatted = renameFiles.formatDate(date);
      expect(formatted).toBe('2025-10-05');
    });
    
    test('should pad both single-digit month and day', () => {
      const date = new Date(2025, 0, 5); // January 5, 2025
      const formatted = renameFiles.formatDate(date);
      expect(formatted).toBe('2025-01-05');
    });
    
    test('should handle leap year dates', () => {
      const date = new Date(2024, 1, 29); // February 29, 2024 (leap year)
      const formatted = renameFiles.formatDate(date);
      expect(formatted).toBe('2024-02-29');
    });
    
    test('should handle end of year dates', () => {
      const date = new Date(2025, 11, 31); // December 31, 2025
      const formatted = renameFiles.formatDate(date);
      expect(formatted).toBe('2025-12-31');
    });
    
    test('should handle start of year dates', () => {
      const date = new Date(2026, 0, 1); // January 1, 2026
      const formatted = renameFiles.formatDate(date);
      expect(formatted).toBe('2026-01-01');
    });
  });
  
  describe('generateNewFilename - Filename Generation', () => {
    
    test('should create filename with YYYY-MM-DD prefix', () => {
      const date = new Date(2026, 1, 22);
      const newName = renameFiles.generateNewFilename('DEPLOYMENT-FEB-22-2026.md', date);
      expect(newName).toMatch(/^2026-02-22-/);
    });
    
    test('should preserve file extension', () => {
      const date = new Date(2026, 1, 22);
      const newName = renameFiles.generateNewFilename('report.md', date);
      expect(newName).toMatch(/\.md$/);
    });
    
    test('should preserve .txt extension', () => {
      const date = new Date(2026, 1, 22);
      const newName = renameFiles.generateNewFilename('notes.txt', date);
      expect(newName).toMatch(/\.txt$/);
    });
    
    test('should preserve .js extension', () => {
      const date = new Date(2026, 1, 22);
      const newName = renameFiles.generateNewFilename('script.js', date);
      expect(newName).toMatch(/\.js$/);
    });
    
    test('should remove existing FEB-22-2026 date pattern', () => {
      const date = new Date(2026, 1, 22);
      const newName = renameFiles.generateNewFilename('DEPLOYMENT-FEB-22-2026-summary.md', date);
      expect(newName).not.toContain('FEB-22-2026');
      expect(newName).toMatch(/^2026-02-22-/);
    });
    
    test('should remove existing ISO date pattern', () => {
      const date = new Date(2026, 1, 22);
      const newName = renameFiles.generateNewFilename('report-2025-10-15-summary.md', date);
      expect(newName).not.toContain('2025-10-15');
      expect(newName).toMatch(/^2026-02-22-/);
    });
    
    test('should remove existing compact date pattern', () => {
      const date = new Date(2026, 1, 22);
      const newName = renameFiles.generateNewFilename('summary-20251014-report.md', date);
      expect(newName).not.toContain('20251014');
      expect(newName).toMatch(/^2026-02-22-/);
    });
    
    test('should remove existing timestamp pattern', () => {
      const date = new Date(2026, 1, 22);
      const newName = renameFiles.generateNewFilename('file-1760532969283-data.md', date);
      expect(newName).not.toContain('1760532969283');
      expect(newName).toMatch(/^2026-02-22-/);
    });
    
    test('should clean up multiple dashes', () => {
      const date = new Date(2026, 1, 22);
      const newName = renameFiles.generateNewFilename('report---summary.md', date);
      expect(newName).not.toMatch(/--/);
    });
    
    test('should remove leading dashes', () => {
      const date = new Date(2026, 1, 22);
      const newName = renameFiles.generateNewFilename('---report.md', date);
      expect(newName).toMatch(/^2026-02-22-report\.md$/);
    });
    
    test('should remove trailing dashes', () => {
      const date = new Date(2026, 1, 22);
      const newName = renameFiles.generateNewFilename('report---.md', date);
      expect(newName).toMatch(/^2026-02-22-report\.md$/);
    });
    
    test('should handle files with multiple extensions', () => {
      const date = new Date(2026, 1, 22);
      const newName = renameFiles.generateNewFilename('archive.tar.gz', date);
      // Should preserve only the last extension
      expect(newName).toMatch(/\.gz$/);
    });
    
    test('should handle files with no extension', () => {
      const date = new Date(2026, 1, 22);
      const newName = renameFiles.generateNewFilename('README', date);
      expect(newName).toMatch(/^2026-02-22-README$/);
    });
    
    test('should use generic name for empty basename', () => {
      const date = new Date(2026, 1, 22);
      // File with only date pattern, nothing else
      const newName = renameFiles.generateNewFilename('FEB-22-2026.md', date);
      expect(newName).toMatch(/^2026-02-22-document\.md$/);
    });
    
    test('should handle complex filenames with multiple patterns', () => {
      const date = new Date(2026, 1, 22);
      const newName = renameFiles.generateNewFilename('DEPLOYMENT-FEB-22-2026-summary-2025-10-15-final.md', date);
      expect(newName).toMatch(/^2026-02-22-/);
      expect(newName).not.toContain('FEB-22-2026');
      expect(newName).not.toContain('2025-10-15');
      expect(newName).toContain('summary');
      expect(newName).toContain('final');
    });
    
    test('should handle filenames with special characters', () => {
      const date = new Date(2026, 1, 22);
      const newName = renameFiles.generateNewFilename('report_summary-FEB-22-2026.md', date);
      expect(newName).toMatch(/^2026-02-22-/);
      expect(newName).toContain('report_summary');
    });
    
    test('should handle filenames with numbers', () => {
      const date = new Date(2026, 1, 22);
      const newName = renameFiles.generateNewFilename('report-v2-summary.md', date);
      expect(newName).toMatch(/^2026-02-22-/);
      expect(newName).toContain('v2');
    });
  });
  
  describe('getFileModificationDate - Fallback to File Timestamp', () => {
    let tempDir: string;
    let tempFile: string;
    
    beforeEach(() => {
      // Create a temporary directory and file for testing
      tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rename-test-'));
      tempFile = path.join(tempDir, 'test-file.md');
      fs.writeFileSync(tempFile, 'test content');
    });
    
    afterEach(() => {
      // Clean up temporary files
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }
      if (fs.existsSync(tempDir)) {
        fs.rmdirSync(tempDir);
      }
    });
    
    test('should return Date object for existing file', () => {
      const date = renameFiles.getFileModificationDate(tempFile);
      expect(date).toBeInstanceOf(Date);
    });
    
    test('should return recent date for newly created file', () => {
      const date = renameFiles.getFileModificationDate(tempFile);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      // Should be within last minute
      expect(diffMs).toBeLessThan(60000);
    });
    
    test('should return valid date that can be formatted', () => {
      const date = renameFiles.getFileModificationDate(tempFile);
      const formatted = renameFiles.formatDate(date);
      expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
    
    test('should throw error for non-existent file', () => {
      const nonExistentFile = path.join(tempDir, 'does-not-exist.md');
      expect(() => {
        renameFiles.getFileModificationDate(nonExistentFile);
      }).toThrow();
    });
  });
  
  describe('Edge Cases - Files with No Dates', () => {
    
    test('should return null for README.md', () => {
      const date = renameFiles.extractDate('README.md');
      expect(date).toBeNull();
    });
    
    test('should return null for package.json', () => {
      const date = renameFiles.extractDate('package.json');
      expect(date).toBeNull();
    });
    
    test('should return null for .gitignore', () => {
      const date = renameFiles.extractDate('.gitignore');
      expect(date).toBeNull();
    });
    
    test('should return null for files with only text', () => {
      const date = renameFiles.extractDate('deployment-summary.md');
      expect(date).toBeNull();
    });
    
    test('should return null for files with numbers that are not dates', () => {
      const date = renameFiles.extractDate('version-2-release.md');
      expect(date).toBeNull();
    });
  });
  
  describe('Edge Cases - Various Input Combinations', () => {
    
    test('should handle uppercase file extensions', () => {
      const date = new Date(2026, 1, 22);
      const newName = renameFiles.generateNewFilename('REPORT.MD', date);
      expect(newName).toMatch(/\.MD$/);
    });
    
    test('should handle mixed case filenames', () => {
      const date = new Date(2026, 1, 22);
      const newName = renameFiles.generateNewFilename('DeploymentSummary.md', date);
      expect(newName).toMatch(/^2026-02-22-/);
      expect(newName).toContain('DeploymentSummary');
    });
    
    test('should handle very long filenames', () => {
      const date = new Date(2026, 1, 22);
      const longName = 'this-is-a-very-long-filename-with-many-words-and-dashes-FEB-22-2026.md';
      const newName = renameFiles.generateNewFilename(longName, date);
      expect(newName).toMatch(/^2026-02-22-/);
      expect(newName.length).toBeGreaterThan(20);
    });
    
    test('should handle filenames with dots in basename', () => {
      const date = new Date(2026, 1, 22);
      const newName = renameFiles.generateNewFilename('report.v2.final.md', date);
      expect(newName).toMatch(/^2026-02-22-/);
      // Should only preserve last extension
      expect(newName).toMatch(/\.md$/);
    });
    
    test('should handle all month abbreviations', () => {
      const months = [
        { abbr: 'JAN', month: 0 },
        { abbr: 'FEB', month: 1 },
        { abbr: 'MAR', month: 2 },
        { abbr: 'APR', month: 3 },
        { abbr: 'MAY', month: 4 },
        { abbr: 'JUN', month: 5 },
        { abbr: 'JUL', month: 6 },
        { abbr: 'AUG', month: 7 },
        { abbr: 'SEP', month: 8 },
        { abbr: 'OCT', month: 9 },
        { abbr: 'NOV', month: 10 },
        { abbr: 'DEC', month: 11 }
      ];
      
      for (const { abbr, month } of months) {
        const date = renameFiles.extractDate(`file-${abbr}-15-2025.md`);
        expect(date).toBeInstanceOf(Date);
        expect(date?.getMonth()).toBe(month);
      }
    });
  });
});
