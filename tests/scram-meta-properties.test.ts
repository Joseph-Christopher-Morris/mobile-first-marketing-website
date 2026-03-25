import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Property-Based Tests for SCRAM Metadata Compliance
 *
 * Feature: scram-website-overhaul
 *
 * Properties tested:
 * - Property 14: Meta descriptions follow pain + location + outcome structure
 * - Property 15: Meta description length within bounds
 *
 * **Validates: Requirements 15.1, 15.2, 15.5, 15.6, 20.3**
 *
 * These tests read the actual page source files and extract metadata
 * to verify compliance with the SCRAM pain + location + outcome pattern.
 */

// All pages that must have compliant metadata
const PAGE_FILES = [
  'src/app/page.tsx',
  'src/app/services/page.tsx',
  'src/app/services/website-design/page.tsx',
  'src/app/services/hosting/page.tsx',
  'src/app/services/ad-campaigns/page.tsx',
  'src/app/services/analytics/page.tsx',
  'src/app/services/photography/page.tsx',
  'src/app/about/page.tsx',
  'src/app/contact/page.tsx',
  'src/app/pricing/page.tsx',
  'src/app/free-audit/page.tsx',
  'src/app/blog/page.tsx',
];

// Location terms that must appear in every meta description
const LOCATION_TERMS = ['South Cheshire', 'Nantwich', 'Crewe'];

// Known feature-led description patterns that should have been replaced
const FEATURE_LED_PATTERNS = [
  /fast\s+websites,\s*google\s+ads\s+that\s+generate/i,
  /secure\s+cloud\s+hosting\s+with\s+\d+%\s+faster/i,
  /professional\s+digital\s+marketing/i,
  /transform\s+your\s+online\s+presence/i,
  /expert\s+digital\s+marketing/i,
  /SEO-ready\s+websites\s+on\s+secure\s+cloud/i,
  /real\s+case\s+studies\s+on\s+SEO,\s*Google\s+Ads/i,
];

/**
 * Extract the description string from a page source file.
 * Handles both buildSEO({ description: "..." }) and
 * generateSocialMetadata({ content: { description: "..." } }) patterns.
 */
function extractDescription(content: string): string | null {
  // Match description in buildSEO or generateSocialMetadata content block
  // Pattern: description: "..." or description: '...'
  const match = content.match(
    /description:\s*['"`]([\s\S]*?)['"`]\s*[,\n}]/
  );
  if (match) {
    return match[1].replace(/\s+/g, ' ').trim();
  }
  return null;
}

/**
 * Extract the title/intent string from a page source file.
 */
function extractTitle(content: string): string | null {
  // Try intent (buildSEO pattern)
  const intentMatch = content.match(/intent:\s*["'`]([^"'`]+)["'`]/);
  if (intentMatch) return intentMatch[1].trim();

  // Try title in content block (generateSocialMetadata pattern)
  const titleMatch = content.match(/title:\s*['"`]([^'"`]+)['"`]/);
  if (titleMatch) return titleMatch[1].trim();

  return null;
}

// Read all page source files and extract metadata
const pageMetadata: { file: string; description: string; title: string }[] = PAGE_FILES
  .map((file) => {
    const content = fs.readFileSync(path.resolve(process.cwd(), file), 'utf-8');
    const description = extractDescription(content);
    const title = extractTitle(content);
    return { file, description: description || '', title: title || '' };
  })
  .filter(({ description }) => description.length > 0);


describe('Feature: scram-website-overhaul - Metadata Property Tests', () => {
  // --- Property 14: Meta descriptions follow pain + location + outcome structure ---

  describe('Property 14: Meta descriptions follow pain + location + outcome structure', () => {
    it('every meta description contains at least one location reference', () => {
      // Feature: scram-website-overhaul, Property 14: Meta descriptions follow pain + location + outcome structure
      // **Validates: Requirements 15.1, 15.2**

      const metaArb = fc.constantFrom(...pageMetadata);

      fc.assert(
        fc.property(metaArb, ({ file, description }) => {
          const hasLocation = LOCATION_TERMS.some((term) =>
            description.includes(term)
          );
          expect(
            hasLocation,
            `Meta description in ${file} lacks location reference (South Cheshire/Nantwich/Crewe): "${description}"`
          ).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('no meta description matches known feature-led patterns', () => {
      // Feature: scram-website-overhaul, Property 14: Meta descriptions follow pain + location + outcome structure
      // **Validates: Requirements 15.3, 20.3**

      const metaArb = fc.constantFrom(...pageMetadata);

      fc.assert(
        fc.property(metaArb, ({ file, description }) => {
          for (const pattern of FEATURE_LED_PATTERNS) {
            const match = description.match(pattern);
            expect(
              match,
              `Feature-led meta description pattern "${pattern}" found in ${file}: "${description}"`
            ).toBeNull();
          }
        }),
        { numRuns: 100 }
      );
    });

    it('every page title uses problem-led or outcome-led language, not feature-led', () => {
      // Feature: scram-website-overhaul, Property 14: Meta descriptions follow pain + location + outcome structure
      // **Validates: Requirements 20.1, 20.2, 20.3**

      const FEATURE_LED_TITLE_PATTERNS = [
        /^Websites,\s*Ads/i,
        /^Digital\s+Marketing/i,
        /^Website\s+Hosting/i,
        /^Strategic\s+Ad/i,
        /^Data\s+Analytics/i,
        /^Cloud\s+Website/i,
        /^Editorial\s+&\s+Commercial/i,
        /^Website\s+Design$/i,
      ];

      const metaArb = fc.constantFrom(...pageMetadata);

      fc.assert(
        fc.property(metaArb, ({ file, title }) => {
          for (const pattern of FEATURE_LED_TITLE_PATTERNS) {
            const match = title.match(pattern);
            expect(
              match,
              `Feature-led title pattern "${pattern}" found in ${file}: "${title}"`
            ).toBeNull();
          }
        }),
        { numRuns: 100 }
      );
    });
  });

  // --- Property 15: Meta description length within bounds ---

  describe('Property 15: Meta description length within bounds', () => {
    it('every meta description is between 140 and 160 characters', () => {
      // Feature: scram-website-overhaul, Property 15: Meta description length within bounds
      // **Validates: Requirements 15.5, 15.6**

      const metaArb = fc.constantFrom(...pageMetadata);

      fc.assert(
        fc.property(metaArb, ({ file, description }) => {
          expect(
            description.length,
            `Meta description in ${file} is ${description.length} chars (must be 140-160): "${description}"`
          ).toBeGreaterThanOrEqual(140);
          expect(
            description.length,
            `Meta description in ${file} is ${description.length} chars (must be 140-160): "${description}"`
          ).toBeLessThanOrEqual(160);
        }),
        { numRuns: 100 }
      );
    });
  });
});
