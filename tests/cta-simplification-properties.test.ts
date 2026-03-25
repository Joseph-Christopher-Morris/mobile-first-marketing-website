import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Property-Based Tests for CTA Simplification
 *
 * Feature: cta-simplification
 *
 * Property 1: Page Simplification Rule
 * — Every page has at most one standalone CTABlock
 * — If a CTABlock exists, it is the final standalone CTA in page order
 * — Non-photography pages reference STANDARD_CTA labels
 * — Photography page references PHOTOGRAPHY_CTA labels
 *
 * **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 7.1, 7.2, 7.4**
 *
 * EXPECTED: This test FAILS on unfixed code — failure confirms CTA Overuse Condition exists.
 */

// CTA label values from src/lib/proof-data.ts
const STANDARD_CTA_LABELS = {
  primaryLabel: 'Send me your website',
  secondaryLabel: 'Email me directly',
};

const PHOTOGRAPHY_CTA_LABELS = {
  primaryLabel: 'Book your photoshoot',
  secondaryLabel: 'View portfolio',
};

// All 11 affected page files
const CTA_PAGE_FILES = [
  'src/app/page.tsx',
  'src/app/services/page.tsx',
  'src/app/services/website-design/page.tsx',
  'src/app/services/hosting/page.tsx',
  'src/app/services/ad-campaigns/page.tsx',
  'src/app/services/analytics/page.tsx',
  'src/app/services/photography/page.tsx',
  'src/app/pricing/page.tsx',
  'src/app/about/page.tsx',
  'src/app/contact/page.tsx',
  'src/app/free-audit/page.tsx',
] as const;

const PHOTOGRAPHY_PAGE = 'src/app/services/photography/page.tsx';

// Read all page sources once
const pageContents = CTA_PAGE_FILES.map((file) => ({
  file,
  content: fs.readFileSync(path.resolve(process.cwd(), file), 'utf-8'),
}));

/**
 * Count standalone <CTABlock occurrences in source.
 * Matches the JSX opening tag pattern.
 */
function countCTABlocks(source: string): number {
  const matches = source.match(/<CTABlock[\s\n]/g);
  return matches ? matches.length : 0;
}

/**
 * Check if a page source references the expected CTA label constants.
 * Pages may use either the constant reference (e.g. STANDARD_CTA.primaryLabel)
 * or the string literal value (e.g. "Send me your website").
 */
function referencesCorrectCTALabels(
  source: string,
  isPhotography: boolean
): { valid: boolean; details: string } {
  const expected = isPhotography ? PHOTOGRAPHY_CTA_LABELS : STANDARD_CTA_LABELS;
  const constantName = isPhotography ? 'PHOTOGRAPHY_CTA' : 'STANDARD_CTA';

  const hasPrimaryRef =
    source.includes(`${constantName}.primaryLabel`) ||
    source.includes(`primaryLabel="${expected.primaryLabel}"`);

  const hasSecondaryRef =
    source.includes(`${constantName}.secondaryLabel`) ||
    source.includes(`secondaryLabel="${expected.secondaryLabel}"`);

  if (!hasPrimaryRef || !hasSecondaryRef) {
    return {
      valid: false,
      details: `Expected ${constantName} labels (primary: "${expected.primaryLabel}", secondary: "${expected.secondaryLabel}"). Found primary ref: ${hasPrimaryRef}, secondary ref: ${hasSecondaryRef}`,
    };
  }

  return { valid: true, details: 'OK' };
}

/**
 * Find the position of the last <CTABlock in the source.
 * Returns the character index, or -1 if none found.
 */
function lastCTABlockPosition(source: string): number {
  return source.lastIndexOf('<CTABlock');
}

/**
 * Check that the final CTABlock is truly the last one — no other CTABlock appears after it.
 * With at most 1 CTABlock, this is trivially true. With >1, the last one must be end-of-page.
 */
function isFinalCTABlockLast(source: string): boolean {
  const regex = /<CTABlock[\s\n]/g;
  const positions: number[] = [];
  let match;
  while ((match = regex.exec(source)) !== null) {
    positions.push(match.index);
  }
  if (positions.length <= 1) return true;
  // The last CTABlock should be the end-of-page variant
  const lastPos = positions[positions.length - 1];
  const afterLast = source.substring(lastPos, lastPos + 300);
  return afterLast.includes('variant="end-of-page"') || afterLast.includes("variant='end-of-page'");
}

describe('Feature: cta-simplification — Property 1: Page Simplification Rule', () => {
  describe('Property 1a: Every page has at most one standalone CTABlock', () => {
    it('each page contains at most 1 <CTABlock component', () => {
      // **Validates: Requirements 1.1, 1.2**
      const pageArb = fc.constantFrom(...pageContents);

      fc.assert(
        fc.property(pageArb, ({ file, content }) => {
          const count = countCTABlocks(content);
          expect(
            count,
            `${file} has ${count} CTABlock(s), expected at most 1`
          ).toBeLessThanOrEqual(1);
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 1b: If CTABlock exists, it is the final standalone CTA in page order', () => {
    it('the retained CTABlock is the last CTA in the page', () => {
      // **Validates: Requirements 1.2**
      const pageArb = fc.constantFrom(...pageContents);

      fc.assert(
        fc.property(pageArb, ({ file, content }) => {
          const count = countCTABlocks(content);
          if (count === 0) return; // 0 is valid (contact page case)

          expect(
            isFinalCTABlockLast(content),
            `${file}: the last CTABlock is not in end-of-page position`
          ).toBe(true);
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 1c: CTA labels match approved pair — non-photography uses STANDARD_CTA, photography uses PHOTOGRAPHY_CTA', () => {
    it('each page references the correct CTA label constants', () => {
      // **Validates: Requirements 1.3, 1.4, 1.5, 7.2, 7.4**
      const pageArb = fc.constantFrom(...pageContents);

      fc.assert(
        fc.property(pageArb, ({ file, content }) => {
          const count = countCTABlocks(content);
          if (count === 0) return; // 0 CTABlocks — no labels to validate

          const isPhotography = file === PHOTOGRAPHY_PAGE;
          const { valid, details } = referencesCorrectCTALabels(content, isPhotography);

          expect(
            valid,
            `${file}: CTA label validation failed — ${details}`
          ).toBe(true);
        }),
        { numRuns: 100 }
      );
    });
  });
});
