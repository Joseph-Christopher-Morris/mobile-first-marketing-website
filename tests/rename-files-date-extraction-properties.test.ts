/**
 * Property-based tests for date extraction from filenames
 * Tests universal properties using fast-check
 * 
 * **Validates: Property 6 - Date extraction from filenames**
 * **Requirements: 3.1**
 */

import { describe, test, expect } from 'vitest';
import * as fc from 'fast-check';

// Import the date extraction function
const { extractDate } = require('../scripts/cleanup/rename-files.js');

describe('Property-based tests: Date extraction from filenames', () => {
  /**
   * Property 6: Date extraction from filenames
   * 
   * For any filename containing a date in a recognized format, the date
   * extraction function should correctly parse and return the date.
   * 
   * Supported formats:
   * - FEB-22-2026, NOV-11-2025, DEC-18-2025 (month-day-year)
   * - 2025-10-15 (YYYY-MM-DD)
   * - 20251014 (YYYYMMDD)
   * - 1760532969283 (timestamp)
   */

  test('Property 6.1: Month-day-year format (FEB-22-2026) dates are extracted correctly', () => {
    // Generate random dates in month-day-year format
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    
    const monthDayYearDateGen = fc.record({
      month: fc.constantFrom(...monthNames),
      day: fc.integer({ min: 1, max: 28 }), // Use 28 to avoid invalid dates
      year: fc.integer({ min: 2000, max: 2100 })
    }).map(({ month, day, year }) => {
      const filename = `REPORT-${month}-${day}-${year}.md`;
      const monthIndex = monthNames.indexOf(month);
      const expectedDate = new Date(year, monthIndex, day);
      return { filename, expectedDate };
    });

    fc.assert(
      fc.property(monthDayYearDateGen, ({ filename, expectedDate }) => {
        const extractedDate = extractDate(filename);
        
        expect(extractedDate).not.toBeNull();
        expect(extractedDate?.getFullYear()).toBe(expectedDate.getFullYear());
        expect(extractedDate?.getMonth()).toBe(expectedDate.getMonth());
        expect(extractedDate?.getDate()).toBe(expectedDate.getDate());
      }),
      { numRuns: 100 }
    );
  });

  test('Property 6.2: ISO date format (YYYY-MM-DD) dates are extracted correctly', () => {
    // Generate random dates in ISO format
    const isoDateGen = fc.record({
      year: fc.integer({ min: 2000, max: 2100 }),
      month: fc.integer({ min: 1, max: 12 }),
      day: fc.integer({ min: 1, max: 28 }) // Use 28 to avoid invalid dates
    }).map(({ year, month, day }) => {
      const monthStr = String(month).padStart(2, '0');
      const dayStr = String(day).padStart(2, '0');
      const filename = `report-${year}-${monthStr}-${dayStr}.md`;
      const expectedDate = new Date(year, month - 1, day); // month is 0-indexed in Date
      return { filename, expectedDate };
    });

    fc.assert(
      fc.property(isoDateGen, ({ filename, expectedDate }) => {
        const extractedDate = extractDate(filename);
        
        expect(extractedDate).not.toBeNull();
        expect(extractedDate?.getFullYear()).toBe(expectedDate.getFullYear());
        expect(extractedDate?.getMonth()).toBe(expectedDate.getMonth());
        expect(extractedDate?.getDate()).toBe(expectedDate.getDate());
      }),
      { numRuns: 100 }
    );
  });

  test('Property 6.3: Compact date format (YYYYMMDD) dates are extracted correctly', () => {
    // Generate random dates in compact format
    const compactDateGen = fc.record({
      year: fc.integer({ min: 2000, max: 2100 }),
      month: fc.integer({ min: 1, max: 12 }),
      day: fc.integer({ min: 1, max: 28 }) // Use 28 to avoid invalid dates
    }).map(({ year, month, day }) => {
      const monthStr = String(month).padStart(2, '0');
      const dayStr = String(day).padStart(2, '0');
      const filename = `report-${year}${monthStr}${dayStr}.md`;
      const expectedDate = new Date(year, month - 1, day); // month is 0-indexed in Date
      return { filename, expectedDate };
    });

    fc.assert(
      fc.property(compactDateGen, ({ filename, expectedDate }) => {
        const extractedDate = extractDate(filename);
        
        expect(extractedDate).not.toBeNull();
        expect(extractedDate?.getFullYear()).toBe(expectedDate.getFullYear());
        expect(extractedDate?.getMonth()).toBe(expectedDate.getMonth());
        expect(extractedDate?.getDate()).toBe(expectedDate.getDate());
      }),
      { numRuns: 100 }
    );
  });

  test('Property 6.4: Timestamp format (13-digit milliseconds) dates are extracted correctly', () => {
    // Generate random timestamps - ensure they are 13 digits
    // Timestamps from 2001-09-09 to 2286-11-20 are 13 digits
    const timestampGen = fc.record({
      year: fc.integer({ min: 2001, max: 2100 }),
      month: fc.integer({ min: 0, max: 11 }),
      day: fc.integer({ min: 1, max: 28 }),
      hour: fc.integer({ min: 0, max: 23 }),
      minute: fc.integer({ min: 0, max: 59 }),
      second: fc.integer({ min: 0, max: 59 })
    }).map(({ year, month, day, hour, minute, second }) => {
      const date = new Date(year, month, day, hour, minute, second);
      const timestamp = date.getTime();
      const filename = `report-${timestamp}.md`;
      return { filename, expectedDate: date };
    }).filter(({ filename }) => {
      // Ensure timestamp is exactly 13 digits
      const match = filename.match(/(\d{13})/);
      return match !== null;
    });

    fc.assert(
      fc.property(timestampGen, ({ filename, expectedDate }) => {
        const extractedDate = extractDate(filename);
        
        expect(extractedDate).not.toBeNull();
        expect(extractedDate?.getFullYear()).toBe(expectedDate.getFullYear());
        expect(extractedDate?.getMonth()).toBe(expectedDate.getMonth());
        expect(extractedDate?.getDate()).toBe(expectedDate.getDate());
      }),
      { numRuns: 100 }
    );
  });

  test('Property 6.5: Case-insensitive month names are handled correctly', () => {
    // Test various case combinations for month names
    const monthVariations = fc.record({
      monthBase: fc.constantFrom('JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'),
      caseVariation: fc.constantFrom('upper', 'lower', 'title'),
      day: fc.integer({ min: 1, max: 28 }),
      year: fc.integer({ min: 2000, max: 2100 })
    }).map(({ monthBase, caseVariation, day, year }) => {
      let month = monthBase;
      if (caseVariation === 'lower') {
        month = monthBase.toLowerCase();
      } else if (caseVariation === 'title') {
        month = monthBase.charAt(0) + monthBase.slice(1).toLowerCase();
      }
      
      const filename = `REPORT-${month}-${day}-${year}.md`;
      const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      const monthIndex = monthNames.indexOf(monthBase);
      const expectedDate = new Date(year, monthIndex, day);
      
      return { filename, expectedDate };
    });

    fc.assert(
      fc.property(monthVariations, ({ filename, expectedDate }) => {
        const extractedDate = extractDate(filename);
        
        expect(extractedDate).not.toBeNull();
        expect(extractedDate?.getFullYear()).toBe(expectedDate.getFullYear());
        expect(extractedDate?.getMonth()).toBe(expectedDate.getMonth());
        expect(extractedDate?.getDate()).toBe(expectedDate.getDate());
      }),
      { numRuns: 100 }
    );
  });

  test('Property 6.6: Dates embedded in longer filenames are extracted correctly', () => {
    // Generate filenames with dates embedded in various positions
    const embeddedDateGen = fc.record({
      prefix: fc.stringMatching(/^[a-zA-Z0-9-]*$/),
      year: fc.integer({ min: 2000, max: 2100 }),
      month: fc.integer({ min: 1, max: 12 }),
      day: fc.integer({ min: 1, max: 28 }),
      suffix: fc.stringMatching(/^[a-zA-Z0-9-]*$/)
    }).map(({ prefix, year, month, day, suffix }) => {
      const monthStr = String(month).padStart(2, '0');
      const dayStr = String(day).padStart(2, '0');
      const dateStr = `${year}-${monthStr}-${dayStr}`;
      
      // Build filename with date embedded
      const parts = [prefix, dateStr, suffix].filter(p => p !== '');
      const filename = parts.join('-') + '.md';
      
      const expectedDate = new Date(year, month - 1, day);
      return { filename, expectedDate };
    });

    fc.assert(
      fc.property(embeddedDateGen, ({ filename, expectedDate }) => {
        const extractedDate = extractDate(filename);
        
        expect(extractedDate).not.toBeNull();
        expect(extractedDate?.getFullYear()).toBe(expectedDate.getFullYear());
        expect(extractedDate?.getMonth()).toBe(expectedDate.getMonth());
        expect(extractedDate?.getDate()).toBe(expectedDate.getDate());
      }),
      { numRuns: 100 }
    );
  });

  test('Property 6.7: Files with no recognizable date format return null', () => {
    // Generate filenames without any date patterns
    const noDateFilenameGen = fc.stringMatching(/^[a-zA-Z-]+$/)
      .filter(s => s.length > 0 && s.length < 50)
      .filter(s => !s.match(/\d/)) // No digits at all
      .map(s => s + '.md');

    fc.assert(
      fc.property(noDateFilenameGen, (filename) => {
        const extractedDate = extractDate(filename);
        expect(extractedDate).toBeNull();
      }),
      { numRuns: 100 }
    );
  });

  test('Property 6.8: Invalid dates in recognized formats return null', () => {
    // Generate invalid dates that match the pattern but are not valid dates
    const invalidDateGen = fc.oneof(
      // Invalid month-day-year (invalid month abbreviation)
      fc.record({
        month: fc.constantFrom('XXX', 'ABC', 'ZZZ', 'QQQ', 'WWW'),
        day: fc.integer({ min: 1, max: 31 }),
        year: fc.integer({ min: 2000, max: 2100 })
      }).map(({ month, day, year }) => `REPORT-${month}-${day}-${year}.md`),
      
      // Invalid compact date (year out of range - before 2000)
      fc.record({
        year: fc.integer({ min: 1900, max: 1999 }),
        month: fc.integer({ min: 1, max: 12 }),
        day: fc.integer({ min: 1, max: 28 })
      }).map(({ year, month, day }) => {
        const monthStr = String(month).padStart(2, '0');
        const dayStr = String(day).padStart(2, '0');
        return `report-${year}${monthStr}${dayStr}.md`;
      }),
      
      // Invalid compact date (year out of range - after 2100)
      fc.record({
        year: fc.integer({ min: 2101, max: 2200 }),
        month: fc.integer({ min: 1, max: 12 }),
        day: fc.integer({ min: 1, max: 28 })
      }).map(({ year, month, day }) => {
        const monthStr = String(month).padStart(2, '0');
        const dayStr = String(day).padStart(2, '0');
        return `report-${year}${monthStr}${dayStr}.md`;
      }),
      
      // Invalid timestamp (year out of range)
      fc.integer({ min: 100000000000, max: 946684799999 }) // Before 2000
        .map(timestamp => `report-${timestamp}.md`)
    );

    fc.assert(
      fc.property(invalidDateGen, (filename) => {
        const extractedDate = extractDate(filename);
        expect(extractedDate).toBeNull();
      }),
      { numRuns: 100 }
    );
  });
});
