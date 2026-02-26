/**
 * Property-based tests for date formatting standardization
 * Tests universal properties using fast-check
 * 
 * **Validates: Property 7 - Date formatting standardization**
 * **Requirements: 3.2**
 */

import { describe, test, expect } from 'vitest';
import * as fc from 'fast-check';

// Import the date formatting function
const { formatDate } = require('../scripts/cleanup/rename-files.js');

describe('Property-based tests: Date formatting standardization', () => {
  /**
   * Property 7: Date formatting standardization
   * 
   * For any extracted or fallback date, the formatted date should follow
   * YYYY-MM-DD format.
   * 
   * Format specification:
   * - YYYY: 4-digit year
   * - MM: 2-digit month (01-12) with leading zero
   * - DD: 2-digit day (01-31) with leading zero
   * - Separator: hyphen (-)
   */

  test('Property 7.1: All dates are formatted as YYYY-MM-DD', () => {
    // Generate random valid dates
    const dateGen = fc.record({
      year: fc.integer({ min: 2000, max: 2100 }),
      month: fc.integer({ min: 0, max: 11 }), // JavaScript months are 0-indexed
      day: fc.integer({ min: 1, max: 28 }) // Use 28 to avoid invalid dates
    }).map(({ year, month, day }) => new Date(year, month, day));

    fc.assert(
      fc.property(dateGen, (date) => {
        const formatted = formatDate(date);
        
        // Check format matches YYYY-MM-DD pattern
        expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        
        // Verify components
        const [year, month, day] = formatted.split('-');
        
        // Year should be 4 digits
        expect(year).toHaveLength(4);
        expect(parseInt(year)).toBe(date.getFullYear());
        
        // Month should be 2 digits with leading zero
        expect(month).toHaveLength(2);
        expect(parseInt(month)).toBe(date.getMonth() + 1);
        
        // Day should be 2 digits with leading zero
        expect(day).toHaveLength(2);
        expect(parseInt(day)).toBe(date.getDate());
      }),
      { numRuns: 100 }
    );
  });

  test('Property 7.2: Single-digit months are zero-padded', () => {
    // Generate dates with single-digit months (January through September)
    const singleDigitMonthGen = fc.record({
      year: fc.integer({ min: 2000, max: 2100 }),
      month: fc.integer({ min: 0, max: 8 }), // 0-8 = January-September
      day: fc.integer({ min: 1, max: 28 })
    }).map(({ year, month, day }) => new Date(year, month, day));

    fc.assert(
      fc.property(singleDigitMonthGen, (date) => {
        const formatted = formatDate(date);
        const [, month] = formatted.split('-');
        
        // Month should always be 2 digits
        expect(month).toHaveLength(2);
        
        // For months 1-9, first digit should be '0'
        if (date.getMonth() < 9) {
          expect(month[0]).toBe('0');
        }
        
        // Verify the numeric value is correct
        expect(parseInt(month)).toBe(date.getMonth() + 1);
      }),
      { numRuns: 100 }
    );
  });

  test('Property 7.3: Single-digit days are zero-padded', () => {
    // Generate dates with single-digit days (1-9)
    const singleDigitDayGen = fc.record({
      year: fc.integer({ min: 2000, max: 2100 }),
      month: fc.integer({ min: 0, max: 11 }),
      day: fc.integer({ min: 1, max: 9 })
    }).map(({ year, month, day }) => new Date(year, month, day));

    fc.assert(
      fc.property(singleDigitDayGen, (date) => {
        const formatted = formatDate(date);
        const [, , day] = formatted.split('-');
        
        // Day should always be 2 digits
        expect(day).toHaveLength(2);
        
        // For days 1-9, first digit should be '0'
        expect(day[0]).toBe('0');
        
        // Verify the numeric value is correct
        expect(parseInt(day)).toBe(date.getDate());
      }),
      { numRuns: 100 }
    );
  });

  test('Property 7.4: Double-digit months are not zero-padded', () => {
    // Generate dates with double-digit months (October through December)
    const doubleDigitMonthGen = fc.record({
      year: fc.integer({ min: 2000, max: 2100 }),
      month: fc.integer({ min: 9, max: 11 }), // 9-11 = October-December
      day: fc.integer({ min: 1, max: 28 })
    }).map(({ year, month, day }) => new Date(year, month, day));

    fc.assert(
      fc.property(doubleDigitMonthGen, (date) => {
        const formatted = formatDate(date);
        const [, month] = formatted.split('-');
        
        // Month should be 2 digits
        expect(month).toHaveLength(2);
        
        // For months 10-12, first digit should not be '0'
        expect(month[0]).not.toBe('0');
        
        // Verify the numeric value is correct
        expect(parseInt(month)).toBe(date.getMonth() + 1);
      }),
      { numRuns: 100 }
    );
  });

  test('Property 7.5: Double-digit days are not zero-padded', () => {
    // Generate dates with double-digit days (10-28)
    const doubleDigitDayGen = fc.record({
      year: fc.integer({ min: 2000, max: 2100 }),
      month: fc.integer({ min: 0, max: 11 }),
      day: fc.integer({ min: 10, max: 28 })
    }).map(({ year, month, day }) => new Date(year, month, day));

    fc.assert(
      fc.property(doubleDigitDayGen, (date) => {
        const formatted = formatDate(date);
        const [, , day] = formatted.split('-');
        
        // Day should be 2 digits
        expect(day).toHaveLength(2);
        
        // For days 10+, first digit should not be '0'
        expect(day[0]).not.toBe('0');
        
        // Verify the numeric value is correct
        expect(parseInt(day)).toBe(date.getDate());
      }),
      { numRuns: 100 }
    );
  });

  test('Property 7.6: Format is consistent across different years', () => {
    // Generate dates across a wide range of years
    const wideYearRangeGen = fc.record({
      year: fc.integer({ min: 1900, max: 2200 }),
      month: fc.integer({ min: 0, max: 11 }),
      day: fc.integer({ min: 1, max: 28 })
    }).map(({ year, month, day }) => new Date(year, month, day));

    fc.assert(
      fc.property(wideYearRangeGen, (date) => {
        const formatted = formatDate(date);
        
        // Always matches YYYY-MM-DD pattern regardless of year
        expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        
        // Verify year is always 4 digits
        const [year] = formatted.split('-');
        expect(year).toHaveLength(4);
        expect(parseInt(year)).toBe(date.getFullYear());
      }),
      { numRuns: 100 }
    );
  });

  test('Property 7.7: Format uses hyphens as separators', () => {
    // Generate random dates
    const dateGen = fc.record({
      year: fc.integer({ min: 2000, max: 2100 }),
      month: fc.integer({ min: 0, max: 11 }),
      day: fc.integer({ min: 1, max: 28 })
    }).map(({ year, month, day }) => new Date(year, month, day));

    fc.assert(
      fc.property(dateGen, (date) => {
        const formatted = formatDate(date);
        
        // Should contain exactly 2 hyphens
        const hyphens = formatted.match(/-/g);
        expect(hyphens).not.toBeNull();
        expect(hyphens?.length).toBe(2);
        
        // Hyphens should be at positions 4 and 7
        expect(formatted[4]).toBe('-');
        expect(formatted[7]).toBe('-');
      }),
      { numRuns: 100 }
    );
  });

  test('Property 7.8: Format is exactly 10 characters long', () => {
    // Generate random dates
    const dateGen = fc.record({
      year: fc.integer({ min: 2000, max: 2100 }),
      month: fc.integer({ min: 0, max: 11 }),
      day: fc.integer({ min: 1, max: 28 })
    }).map(({ year, month, day }) => new Date(year, month, day));

    fc.assert(
      fc.property(dateGen, (date) => {
        const formatted = formatDate(date);
        
        // YYYY-MM-DD is always exactly 10 characters
        expect(formatted).toHaveLength(10);
      }),
      { numRuns: 100 }
    );
  });

  test('Property 7.9: Format is idempotent (formatting twice produces same result)', () => {
    // Generate random dates
    const dateGen = fc.record({
      year: fc.integer({ min: 2000, max: 2100 }),
      month: fc.integer({ min: 0, max: 11 }),
      day: fc.integer({ min: 1, max: 28 })
    }).map(({ year, month, day }) => new Date(year, month, day));

    fc.assert(
      fc.property(dateGen, (date) => {
        const formatted1 = formatDate(date);
        
        // Parse the formatted date and format again
        const [year, month, day] = formatted1.split('-').map(Number);
        const reparsedDate = new Date(year, month - 1, day);
        const formatted2 = formatDate(reparsedDate);
        
        // Should produce the same result
        expect(formatted1).toBe(formatted2);
      }),
      { numRuns: 100 }
    );
  });

  test('Property 7.10: Format handles edge case dates correctly', () => {
    // Generate edge case dates (first and last day of months)
    const edgeCaseDateGen = fc.record({
      year: fc.integer({ min: 2000, max: 2100 }),
      month: fc.integer({ min: 0, max: 11 }),
      isFirstDay: fc.boolean()
    }).map(({ year, month, isFirstDay }) => {
      const day = isFirstDay ? 1 : 28; // Use 28 as safe last day
      return new Date(year, month, day);
    });

    fc.assert(
      fc.property(edgeCaseDateGen, (date) => {
        const formatted = formatDate(date);
        
        // Should still match YYYY-MM-DD pattern
        expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        
        // Verify components are correct
        const [year, month, day] = formatted.split('-').map(Number);
        expect(year).toBe(date.getFullYear());
        expect(month).toBe(date.getMonth() + 1);
        expect(day).toBe(date.getDate());
      }),
      { numRuns: 100 }
    );
  });
});
