/**
 * Property-based tests for filename renaming pattern compliance
 * Tests universal properties using fast-check
 * 
 * **Validates: Property 8 - Filename renaming pattern compliance**
 * **Requirements: 3.3, 3.4, 3.6**
 */

import { describe, test, expect } from 'vitest';
import * as fc from 'fast-check';

// Import the filename generation function
const { generateNewFilename, extractDate, formatDate } = require('../scripts/cleanup/rename-files.js');

describe('Property-based tests: Filename renaming pattern compliance', () => {
  /**
   * Property 8: Filename renaming pattern compliance
   * 
   * For any file being renamed, the new filename should follow the pattern
   * YYYY-MM-DD-purpose-topic.ext where the date is either extracted from
   * the original filename or derived from file modification timestamp.
   * 
   * Pattern specification:
   * - YYYY-MM-DD: Date prefix in ISO format
   * - purpose-topic: Descriptive name (cleaned from original filename)
   * - .ext: File extension preserved from original
   */

  test('Property 8.1: All renamed files follow YYYY-MM-DD-purpose-topic.ext pattern', () => {
    // Generate random filenames with dates and extensions
    const filenameGen = fc.record({
      year: fc.integer({ min: 2000, max: 2100 }),
      month: fc.integer({ min: 1, max: 12 }),
      day: fc.integer({ min: 1, max: 28 }),
      purpose: fc.stringMatching(/^[a-zA-Z0-9]+$/),
      topic: fc.stringMatching(/^[a-zA-Z0-9]+$/),
      ext: fc.constantFrom('.md', '.txt', '.js', '.json', '.pdf', '.doc')
    }).filter(({ purpose, topic }) => purpose.length > 0 && topic.length > 0)
      .map(({ year, month, day, purpose, topic, ext }) => {
        const monthStr = String(month).padStart(2, '0');
        const dayStr = String(day).padStart(2, '0');
        const oldFilename = `${purpose}-${year}-${monthStr}-${dayStr}-${topic}${ext}`;
        const date = new Date(year, month - 1, day);
        return { oldFilename, date, ext };
      });

    fc.assert(
      fc.property(filenameGen, ({ oldFilename, date, ext }) => {
        const newFilename = generateNewFilename(oldFilename, date);
        
        // Should match YYYY-MM-DD-*.<ext> pattern
        const pattern = /^\d{4}-\d{2}-\d{2}-.+\.\w+$/;
        expect(newFilename).toMatch(pattern);
        
        // Should start with formatted date
        const expectedDatePrefix = formatDate(date);
        expect(newFilename.startsWith(expectedDatePrefix)).toBe(true);
        
        // Should end with the same extension
        expect(newFilename.endsWith(ext)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  test('Property 8.2: Date prefix is always in YYYY-MM-DD format', () => {
    // Generate random filenames and dates
    const filenameWithDateGen = fc.record({
      filename: fc.stringMatching(/^[a-zA-Z0-9-]+$/),
      year: fc.integer({ min: 2000, max: 2100 }),
      month: fc.integer({ min: 0, max: 11 }),
      day: fc.integer({ min: 1, max: 28 }),
      ext: fc.constantFrom('.md', '.txt', '.js', '.json')
    }).filter(({ filename }) => filename.length > 0)
      .map(({ filename, year, month, day, ext }) => {
        const oldFilename = `${filename}${ext}`;
        const date = new Date(year, month, day);
        return { oldFilename, date };
      });

    fc.assert(
      fc.property(filenameWithDateGen, ({ oldFilename, date }) => {
        const newFilename = generateNewFilename(oldFilename, date);
        
        // Extract the date prefix (first 10 characters)
        const datePrefix = newFilename.substring(0, 10);
        
        // Should match YYYY-MM-DD pattern
        expect(datePrefix).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        
        // Should match the formatted date
        expect(datePrefix).toBe(formatDate(date));
      }),
      { numRuns: 100 }
    );
  });

  test('Property 8.3: File extension is preserved exactly', () => {
    // Generate filenames with various extensions
    const filenameWithExtGen = fc.record({
      basename: fc.stringMatching(/^[a-zA-Z0-9-]+$/),
      ext: fc.oneof(
        fc.constantFrom('.md', '.txt', '.js', '.json', '.pdf', '.doc', '.html', '.css'),
        fc.stringMatching(/^\.[a-z]{2,5}$/) // Random extensions
      ),
      year: fc.integer({ min: 2000, max: 2100 }),
      month: fc.integer({ min: 0, max: 11 }),
      day: fc.integer({ min: 1, max: 28 })
    }).filter(({ basename }) => basename.length > 0)
      .map(({ basename, ext, year, month, day }) => {
        const oldFilename = `${basename}${ext}`;
        const date = new Date(year, month, day);
        return { oldFilename, date, ext };
      });

    fc.assert(
      fc.property(filenameWithExtGen, ({ oldFilename, date, ext }) => {
        const newFilename = generateNewFilename(oldFilename, date);
        
        // Extension should be preserved exactly
        expect(newFilename.endsWith(ext)).toBe(true);
        
        // Extract extension from new filename
        const newExt = newFilename.substring(newFilename.lastIndexOf('.'));
        expect(newExt).toBe(ext);
      }),
      { numRuns: 100 }
    );
  });

  test('Property 8.4: Existing date patterns are removed from basename', () => {
    // Generate filenames with embedded dates that should be removed
    const filenameWithEmbeddedDateGen = fc.record({
      prefix: fc.stringMatching(/^[a-zA-Z]+$/),
      embeddedYear: fc.integer({ min: 2000, max: 2100 }),
      embeddedMonth: fc.integer({ min: 1, max: 12 }),
      embeddedDay: fc.integer({ min: 1, max: 28 }),
      suffix: fc.stringMatching(/^[a-zA-Z]+$/),
      actualYear: fc.integer({ min: 2000, max: 2100 }),
      actualMonth: fc.integer({ min: 0, max: 11 }),
      actualDay: fc.integer({ min: 1, max: 28 }),
      ext: fc.constantFrom('.md', '.txt', '.js')
    }).filter(({ prefix, suffix }) => prefix.length > 0 && suffix.length > 0)
      .map(({ prefix, embeddedYear, embeddedMonth, embeddedDay, suffix, actualYear, actualMonth, actualDay, ext }) => {
        const monthStr = String(embeddedMonth).padStart(2, '0');
        const dayStr = String(embeddedDay).padStart(2, '0');
        const embeddedDate = `${embeddedYear}-${monthStr}-${dayStr}`;
        const oldFilename = `${prefix}-${embeddedDate}-${suffix}${ext}`;
        const date = new Date(actualYear, actualMonth, actualDay);
        return { oldFilename, date, embeddedDate };
      });

    fc.assert(
      fc.property(filenameWithEmbeddedDateGen, ({ oldFilename, date, embeddedDate }) => {
        const newFilename = generateNewFilename(oldFilename, date);
        
        // The embedded date should not appear in the basename (after the date prefix)
        const datePrefix = formatDate(date);
        const basename = newFilename.substring(datePrefix.length + 1); // +1 for the hyphen
        
        // The embedded date should be removed from the basename
        expect(basename.includes(embeddedDate)).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  test('Property 8.5: Multiple consecutive hyphens are collapsed to single hyphen', () => {
    // Generate filenames with multiple hyphens
    const filenameWithMultipleHyphensGen = fc.record({
      part1: fc.stringMatching(/^[a-zA-Z0-9]+$/),
      part2: fc.stringMatching(/^[a-zA-Z0-9]+$/),
      hyphens: fc.integer({ min: 2, max: 5 }),
      year: fc.integer({ min: 2000, max: 2100 }),
      month: fc.integer({ min: 0, max: 11 }),
      day: fc.integer({ min: 1, max: 28 }),
      ext: fc.constantFrom('.md', '.txt')
    }).filter(({ part1, part2 }) => part1.length > 0 && part2.length > 0)
      .map(({ part1, part2, hyphens, year, month, day, ext }) => {
        const multipleHyphens = '-'.repeat(hyphens);
        const oldFilename = `${part1}${multipleHyphens}${part2}${ext}`;
        const date = new Date(year, month, day);
        return { oldFilename, date };
      });

    fc.assert(
      fc.property(filenameWithMultipleHyphensGen, ({ oldFilename, date }) => {
        const newFilename = generateNewFilename(oldFilename, date);
        
        // Should not contain multiple consecutive hyphens
        expect(newFilename).not.toMatch(/--+/);
      }),
      { numRuns: 100 }
    );
  });

  test('Property 8.6: Leading and trailing hyphens are removed from basename', () => {
    // Generate filenames with leading/trailing hyphens
    const filenameWithEdgeHyphensGen = fc.record({
      content: fc.stringMatching(/^[a-zA-Z0-9]+$/),
      leadingHyphens: fc.integer({ min: 0, max: 3 }),
      trailingHyphens: fc.integer({ min: 0, max: 3 }),
      year: fc.integer({ min: 2000, max: 2100 }),
      month: fc.integer({ min: 0, max: 11 }),
      day: fc.integer({ min: 1, max: 28 }),
      ext: fc.constantFrom('.md', '.txt')
    }).filter(({ content, leadingHyphens, trailingHyphens }) => 
      content.length > 0 && (leadingHyphens > 0 || trailingHyphens > 0)
    ).map(({ content, leadingHyphens, trailingHyphens, year, month, day, ext }) => {
      const leading = '-'.repeat(leadingHyphens);
      const trailing = '-'.repeat(trailingHyphens);
      const oldFilename = `${leading}${content}${trailing}${ext}`;
      const date = new Date(year, month, day);
      return { oldFilename, date };
    });

    fc.assert(
      fc.property(filenameWithEdgeHyphensGen, ({ oldFilename, date }) => {
        const newFilename = generateNewFilename(oldFilename, date);
        
        // Extract the part after the date prefix
        const datePrefix = formatDate(date);
        const afterDate = newFilename.substring(datePrefix.length);
        
        // Should start with a hyphen (separator) but not multiple hyphens
        expect(afterDate).toMatch(/^-[^-]/);
      }),
      { numRuns: 100 }
    );
  });

  test('Property 8.7: Empty basename after cleaning defaults to "document"', () => {
    // Generate filenames that become empty after date removal
    const emptyBasenameGen = fc.record({
      year: fc.integer({ min: 2000, max: 2100 }),
      month: fc.integer({ min: 1, max: 12 }),
      day: fc.integer({ min: 1, max: 28 }),
      ext: fc.constantFrom('.md', '.txt', '.js')
    }).map(({ year, month, day, ext }) => {
      const monthStr = String(month).padStart(2, '0');
      const dayStr = String(day).padStart(2, '0');
      // Filename that only contains a date
      const oldFilename = `${year}-${monthStr}-${dayStr}${ext}`;
      const date = new Date(year, month - 1, day);
      return { oldFilename, date, ext };
    });

    fc.assert(
      fc.property(emptyBasenameGen, ({ oldFilename, date, ext }) => {
        const newFilename = generateNewFilename(oldFilename, date);
        
        // Should use "document" as default basename
        const datePrefix = formatDate(date);
        const expected = `${datePrefix}-document${ext}`;
        expect(newFilename).toBe(expected);
      }),
      { numRuns: 100 }
    );
  });

  test('Property 8.8: Filenames with extracted dates use the extracted date', () => {
    // Generate filenames with recognizable date patterns
    const filenameWithRecognizableDateGen = fc.record({
      prefix: fc.stringMatching(/^[a-zA-Z]+$/),
      year: fc.integer({ min: 2000, max: 2100 }),
      month: fc.integer({ min: 1, max: 12 }),
      day: fc.integer({ min: 1, max: 28 }),
      suffix: fc.stringMatching(/^[a-zA-Z]+$/),
      ext: fc.constantFrom('.md', '.txt')
    }).filter(({ prefix, suffix }) => prefix.length > 0 && suffix.length > 0)
      .map(({ prefix, year, month, day, suffix, ext }) => {
        const monthStr = String(month).padStart(2, '0');
        const dayStr = String(day).padStart(2, '0');
        const oldFilename = `${prefix}-${year}-${monthStr}-${dayStr}-${suffix}${ext}`;
        return { oldFilename, year, month, day };
      });

    fc.assert(
      fc.property(filenameWithRecognizableDateGen, ({ oldFilename, year, month, day }) => {
        // Extract date from filename
        const extractedDate = extractDate(oldFilename);
        expect(extractedDate).not.toBeNull();
        
        // Generate new filename using extracted date
        const newFilename = generateNewFilename(oldFilename, extractedDate!);
        
        // Should start with the extracted date
        const expectedPrefix = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        expect(newFilename.startsWith(expectedPrefix)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  test('Property 8.9: Pattern compliance is consistent across different date formats', () => {
    // Generate filenames with various date formats
    const mixedDateFormatGen = fc.record({
      dateFormat: fc.constantFrom('iso', 'compact', 'month-day-year'),
      year: fc.integer({ min: 2000, max: 2100 }),
      month: fc.integer({ min: 1, max: 12 }),
      day: fc.integer({ min: 1, max: 28 }),
      content: fc.stringMatching(/^[a-zA-Z]+$/),
      ext: fc.constantFrom('.md', '.txt')
    }).filter(({ content }) => content.length > 0)
      .map(({ dateFormat, year, month, day, content, ext }) => {
        let dateStr;
        const monthStr = String(month).padStart(2, '0');
        const dayStr = String(day).padStart(2, '0');
        
        if (dateFormat === 'iso') {
          dateStr = `${year}-${monthStr}-${dayStr}`;
        } else if (dateFormat === 'compact') {
          dateStr = `${year}${monthStr}${dayStr}`;
        } else {
          const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
          dateStr = `${monthNames[month - 1]}-${day}-${year}`;
        }
        
        const oldFilename = `${content}-${dateStr}${ext}`;
        const date = new Date(year, month - 1, day);
        return { oldFilename, date };
      });

    fc.assert(
      fc.property(mixedDateFormatGen, ({ oldFilename, date }) => {
        const newFilename = generateNewFilename(oldFilename, date);
        
        // All should follow the same pattern regardless of input format
        expect(newFilename).toMatch(/^\d{4}-\d{2}-\d{2}-.+\.\w+$/);
        
        // All should start with the same formatted date
        const expectedDatePrefix = formatDate(date);
        expect(newFilename.startsWith(expectedDatePrefix)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  test('Property 8.10: Renamed filename is always different from original (unless already compliant)', () => {
    // Generate random filenames
    const randomFilenameGen = fc.record({
      content: fc.stringMatching(/^[a-zA-Z0-9-]+$/),
      year: fc.integer({ min: 2000, max: 2100 }),
      month: fc.integer({ min: 0, max: 11 }),
      day: fc.integer({ min: 1, max: 28 }),
      ext: fc.constantFrom('.md', '.txt', '.js')
    }).filter(({ content }) => content.length > 0)
      .map(({ content, year, month, day, ext }) => {
        const oldFilename = `${content}${ext}`;
        const date = new Date(year, month, day);
        return { oldFilename, date };
      });

    fc.assert(
      fc.property(randomFilenameGen, ({ oldFilename, date }) => {
        const newFilename = generateNewFilename(oldFilename, date);
        
        // If the old filename doesn't start with the date prefix, new filename should be different
        const datePrefix = formatDate(date);
        if (!oldFilename.startsWith(datePrefix)) {
          expect(newFilename).not.toBe(oldFilename);
        }
        
        // New filename should always follow the pattern
        expect(newFilename).toMatch(/^\d{4}-\d{2}-\d{2}-.+\.\w+$/);
      }),
      { numRuns: 100 }
    );
  });
});
