/**
 * Property-based tests for file extension preservation during rename
 * Tests universal properties using fast-check
 * 
 * **Validates: Property 9 - File extension preservation during rename**
 * **Requirements: 3.5**
 */

import { describe, test, expect } from 'vitest';
import * as fc from 'fast-check';

// Import the filename generation function
const { generateNewFilename } = require('../scripts/cleanup/rename-files.js');

describe('Property-based tests: File extension preservation during rename', () => {
  /**
   * Property 9: File extension preservation during rename
   * 
   * For any file being renamed, the file extension should be preserved
   * exactly as it was in the original filename.
   */

  test('Property 9.1: Common file extensions are preserved exactly', () => {
    // Generate filenames with common extensions
    const commonExtensions = ['.md', '.js', '.ts', '.json', '.txt', '.html', '.css', '.yml', '.yaml'];
    
    const filenameGen = fc.record({
      basename: fc.stringMatching(/^[a-zA-Z0-9-]+$/),
      extension: fc.constantFrom(...commonExtensions),
      year: fc.integer({ min: 2000, max: 2100 }),
      month: fc.integer({ min: 1, max: 12 }),
      day: fc.integer({ min: 1, max: 28 })
    }).map(({ basename, extension, year, month, day }) => {
      const filename = `${basename}${extension}`;
      const date = new Date(year, month - 1, day);
      return { filename, extension, date };
    });

    fc.assert(
      fc.property(filenameGen, ({ filename, extension, date }) => {
        const newFilename = generateNewFilename(filename, date);
        
        // Extension should be preserved exactly
        expect(newFilename.endsWith(extension)).toBe(true);
        
        // Extract extension from new filename
        const newExtension = newFilename.substring(newFilename.lastIndexOf('.'));
        expect(newExtension).toBe(extension);
      }),
      { numRuns: 100 }
    );
  });

  test('Property 9.2: Multi-part extensions are preserved exactly', () => {
    // Generate filenames with multi-part extensions like .test.ts, .config.js
    const multiPartExtensions = ['.test.ts', '.test.js', '.spec.ts', '.spec.js', '.config.js', '.config.json', '.d.ts'];
    
    const filenameGen = fc.record({
      basename: fc.stringMatching(/^[a-zA-Z0-9-]+$/),
      extension: fc.constantFrom(...multiPartExtensions),
      year: fc.integer({ min: 2000, max: 2100 }),
      month: fc.integer({ min: 1, max: 12 }),
      day: fc.integer({ min: 1, max: 28 })
    }).map(({ basename, extension, year, month, day }) => {
      const filename = `${basename}${extension}`;
      const date = new Date(year, month - 1, day);
      return { filename, extension, date };
    });

    fc.assert(
      fc.property(filenameGen, ({ filename, extension, date }) => {
        const newFilename = generateNewFilename(filename, date);
        
        // Extension should be preserved exactly
        expect(newFilename.endsWith(extension)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  test('Property 9.3: Case-sensitive extensions are preserved exactly', () => {
    // Generate filenames with various case combinations in extensions
    const caseSensitiveExtensions = ['.MD', '.Md', '.JS', '.Js', '.TS', '.Ts', '.JSON', '.Json', '.TXT', '.Txt'];
    
    const filenameGen = fc.record({
      basename: fc.stringMatching(/^[a-zA-Z0-9-]+$/),
      extension: fc.constantFrom(...caseSensitiveExtensions),
      year: fc.integer({ min: 2000, max: 2100 }),
      month: fc.integer({ min: 1, max: 12 }),
      day: fc.integer({ min: 1, max: 28 })
    }).map(({ basename, extension, year, month, day }) => {
      const filename = `${basename}${extension}`;
      const date = new Date(year, month - 1, day);
      return { filename, extension, date };
    });

    fc.assert(
      fc.property(filenameGen, ({ filename, extension, date }) => {
        const newFilename = generateNewFilename(filename, date);
        
        // Extension should be preserved with exact case
        expect(newFilename.endsWith(extension)).toBe(true);
        
        // Extract extension from new filename
        const newExtension = newFilename.substring(newFilename.lastIndexOf('.'));
        expect(newExtension).toBe(extension);
      }),
      { numRuns: 100 }
    );
  });

  test('Property 9.4: Unusual but valid extensions are preserved exactly', () => {
    // Generate filenames with unusual but valid extensions
    const unusualExtensions = ['.backup', '.old', '.tmp', '.bak', '.orig', '.swp', '.log', '.xml', '.svg', '.webp'];
    
    const filenameGen = fc.record({
      basename: fc.stringMatching(/^[a-zA-Z0-9-]+$/),
      extension: fc.constantFrom(...unusualExtensions),
      year: fc.integer({ min: 2000, max: 2100 }),
      month: fc.integer({ min: 1, max: 12 }),
      day: fc.integer({ min: 1, max: 28 })
    }).map(({ basename, extension, year, month, day }) => {
      const filename = `${basename}${extension}`;
      const date = new Date(year, month - 1, day);
      return { filename, extension, date };
    });

    fc.assert(
      fc.property(filenameGen, ({ filename, extension, date }) => {
        const newFilename = generateNewFilename(filename, date);
        
        // Extension should be preserved exactly
        expect(newFilename.endsWith(extension)).toBe(true);
        
        // Extract extension from new filename
        const newExtension = newFilename.substring(newFilename.lastIndexOf('.'));
        expect(newExtension).toBe(extension);
      }),
      { numRuns: 100 }
    );
  });

  test('Property 9.5: Files with no extension remain without extension', () => {
    // Generate filenames without extensions
    const filenameGen = fc.record({
      basename: fc.stringMatching(/^[a-zA-Z0-9-]+$/),
      year: fc.integer({ min: 2000, max: 2100 }),
      month: fc.integer({ min: 1, max: 12 }),
      day: fc.integer({ min: 1, max: 28 })
    }).map(({ basename, year, month, day }) => {
      const filename = basename; // No extension
      const date = new Date(year, month - 1, day);
      return { filename, date };
    });

    fc.assert(
      fc.property(filenameGen, ({ filename, date }) => {
        const newFilename = generateNewFilename(filename, date);
        
        // New filename should not have an extension (no dot after the basename)
        // The new filename format is YYYY-MM-DD-basename
        // If original had no extension, new one shouldn't either
        const lastDotIndex = newFilename.lastIndexOf('.');
        
        // If there's no dot, or the dot is part of the date (YYYY-MM-DD), that's correct
        if (lastDotIndex === -1) {
          // No extension, which is correct
          expect(true).toBe(true);
        } else {
          // Check if the dot is part of the date format or a real extension
          // Date format is YYYY-MM-DD at the start, so dots would be at positions 4 and 7
          // If the last dot is beyond position 10 (YYYY-MM-DD-), it might be an extension
          // But since original had no extension, this shouldn't happen
          const afterDate = newFilename.substring(10); // Skip "YYYY-MM-DD"
          expect(afterDate.includes('.')).toBe(false);
        }
      }),
      { numRuns: 100 }
    );
  });

  test('Property 9.6: Extensions with numbers are preserved exactly', () => {
    // Generate filenames with extensions containing numbers
    const numericExtensions = ['.mp3', '.mp4', '.h264', '.x265', '.3gp', '.7z'];
    
    const filenameGen = fc.record({
      basename: fc.stringMatching(/^[a-zA-Z0-9-]+$/),
      extension: fc.constantFrom(...numericExtensions),
      year: fc.integer({ min: 2000, max: 2100 }),
      month: fc.integer({ min: 1, max: 12 }),
      day: fc.integer({ min: 1, max: 28 })
    }).map(({ basename, extension, year, month, day }) => {
      const filename = `${basename}${extension}`;
      const date = new Date(year, month - 1, day);
      return { filename, extension, date };
    });

    fc.assert(
      fc.property(filenameGen, ({ filename, extension, date }) => {
        const newFilename = generateNewFilename(filename, date);
        
        // Extension should be preserved exactly
        expect(newFilename.endsWith(extension)).toBe(true);
        
        // Extract extension from new filename
        const newExtension = newFilename.substring(newFilename.lastIndexOf('.'));
        expect(newExtension).toBe(extension);
      }),
      { numRuns: 100 }
    );
  });

  test('Property 9.7: Long extensions are preserved exactly', () => {
    // Generate filenames with longer extensions
    const longExtensions = ['.markdown', '.javascript', '.typescript', '.properties', '.configuration'];
    
    const filenameGen = fc.record({
      basename: fc.stringMatching(/^[a-zA-Z0-9-]+$/),
      extension: fc.constantFrom(...longExtensions),
      year: fc.integer({ min: 2000, max: 2100 }),
      month: fc.integer({ min: 1, max: 12 }),
      day: fc.integer({ min: 1, max: 28 })
    }).map(({ basename, extension, year, month, day }) => {
      const filename = `${basename}${extension}`;
      const date = new Date(year, month - 1, day);
      return { filename, extension, date };
    });

    fc.assert(
      fc.property(filenameGen, ({ filename, extension, date }) => {
        const newFilename = generateNewFilename(filename, date);
        
        // Extension should be preserved exactly
        expect(newFilename.endsWith(extension)).toBe(true);
        
        // Extract extension from new filename
        const newExtension = newFilename.substring(newFilename.lastIndexOf('.'));
        expect(newExtension).toBe(extension);
      }),
      { numRuns: 100 }
    );
  });

  test('Property 9.8: Extensions are preserved when filename contains dates', () => {
    // Generate filenames that already contain dates in various formats
    const extensions = ['.md', '.js', '.ts', '.json', '.txt'];
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    
    const filenameGen = fc.record({
      basename: fc.stringMatching(/^[a-zA-Z0-9-]+$/),
      extension: fc.constantFrom(...extensions),
      dateMonth: fc.constantFrom(...monthNames),
      dateDay: fc.integer({ min: 1, max: 28 }),
      dateYear: fc.integer({ min: 2000, max: 2100 }),
      newYear: fc.integer({ min: 2000, max: 2100 }),
      newMonth: fc.integer({ min: 1, max: 12 }),
      newDay: fc.integer({ min: 1, max: 28 })
    }).map(({ basename, extension, dateMonth, dateDay, dateYear, newYear, newMonth, newDay }) => {
      // Create filename with embedded date
      const filename = `${basename}-${dateMonth}-${dateDay}-${dateYear}${extension}`;
      const date = new Date(newYear, newMonth - 1, newDay);
      return { filename, extension, date };
    });

    fc.assert(
      fc.property(filenameGen, ({ filename, extension, date }) => {
        const newFilename = generateNewFilename(filename, date);
        
        // Extension should be preserved exactly even when filename contains dates
        expect(newFilename.endsWith(extension)).toBe(true);
        
        // Extract extension from new filename
        const newExtension = newFilename.substring(newFilename.lastIndexOf('.'));
        expect(newExtension).toBe(extension);
      }),
      { numRuns: 100 }
    );
  });
});
