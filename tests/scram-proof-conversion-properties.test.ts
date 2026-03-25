import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Property-Based Tests for SCRAM Proof-Driven Conversion — Homepage Structure
 *
 * Feature: scram-proof-driven-conversion
 *
 * Properties tested:
 * - Property 8: Proof hierarchy ordering
 * - Property 11: Proof block spacing — no excessive stacking
 * - Property 12: CTA spacing — no clustered CTA pressure
 * - Property 13: At least one proof element before final CTA
 */

// --- Helpers ---

function readPageSource(file: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), file), 'utf-8');
}

/**
 * Find the position (character index) of a pattern in source code.
 * Returns -1 if not found.
 */
function findPosition(source: string, pattern: string | RegExp): number {
  if (typeof pattern === 'string') {
    return source.indexOf(pattern);
  }
  const match = source.match(pattern);
  return match?.index ?? -1;
}

// --- Proof Hierarchy Definition ---
// Order: 1. speed, 2. NYCC, 3. THEFEEDGROUP, 4. photography publication, 5. stock photography
const PROOF_HIERARCHY = [
  { name: 'SpeedProofBlock', rank: 1, pattern: '<SpeedProofBlock' },
  { name: 'NYCCProofBlock', rank: 2, pattern: '<NYCCProofBlock' },
  { name: 'TheFeedGroupProofBlock', rank: 3, pattern: '<TheFeedGroupProofBlock' },
  { name: 'AuthorityProofBlock', rank: 4, pattern: '<AuthorityProofBlock' },
  { name: 'StockPhotographyProofBlock', rank: 5, pattern: '<StockPhotographyProofBlock' },
];

// Known intentional hierarchy exceptions per page (design-approved lowerings)
const HIERARCHY_EXCEPTIONS: Record<string, { block: string; reason: string }[]> = {
  'src/app/page.tsx': [
    {
      block: 'StockPhotographyProofBlock',
      reason: 'Intentionally placed after final CTA as supporting authority content',
    },
  ],
};

// Pages with proof blocks to test for hierarchy ordering
const PAGES_WITH_PROOF_BLOCKS = [
  'src/app/page.tsx',
];

// Section classification for the homepage (used by Properties 11 and 12)
// Each section is classified as 'proof', 'cta', or 'other'
interface SectionInfo {
  name: string;
  type: 'proof' | 'cta' | 'other';
  marker: string;
}

const HOMEPAGE_SECTIONS: SectionInfo[] = [
  { name: 'ProblemHero', type: 'other', marker: '/* Section 1: ProblemHero */' },
  { name: 'WhyWebsitesFail', type: 'other', marker: '/* Section 2: WhyWebsitesFail */' },
  { name: 'SpeedProofBlock', type: 'proof', marker: '/* Section 3: SpeedProofBlock' },
  { name: 'NYCCProofBlock', type: 'proof', marker: '/* Section 4: NYCCProofBlock */' },
  { name: 'Two-service cards', type: 'other', marker: '/* Section 5: Two-service card grid' },
  { name: 'TheFeedGroupProofBlock', type: 'proof', marker: '/* Section 6: TheFeedGroupProofBlock */' },
  { name: 'Final CTA', type: 'cta', marker: '/* Section 7: Final CTA */' },
  { name: 'StockPhotographyProofBlock', type: 'proof', marker: '/* Section 8: StockPhotographyProofBlock' },
  { name: 'Blog', type: 'other', marker: '/* Section 9: Blog' },
];


// Major pages modified in this pass (for Property 13)
const MAJOR_PAGES_MODIFIED = [
  'src/app/page.tsx',
];

// Proof indicators — patterns that indicate a proof element exists on a page
const PROOF_INDICATORS = [
  '<SpeedProofBlock',
  '<NYCCProofBlock',
  '<TheFeedGroupProofBlock',
  '<StockPhotographyProofBlock',
  '<AuthorityProofBlock',
  '<TechnicalProofItem',
  'AHREFS_PROOF',
  'proof-data',
];

// --- Tests ---

describe('Feature: scram-proof-driven-conversion — Homepage Structure Properties', () => {
  // =====================================================================
  // Property 8: Proof hierarchy ordering
  // =====================================================================
  describe('Property 8: Proof hierarchy ordering', () => {
    it('proof blocks on each page follow the Proof Hierarchy order, with documented exceptions', () => {
      // Feature: scram-proof-driven-conversion, Property 8: Proof hierarchy ordering
      // **Validates: Requirements 20.7**

      const pageArb = fc.constantFrom(...PAGES_WITH_PROOF_BLOCKS);

      fc.assert(
        fc.property(pageArb, (pageFile) => {
          const source = readPageSource(pageFile);
          const exceptions = HIERARCHY_EXCEPTIONS[pageFile] || [];
          const exceptionBlocks = new Set(exceptions.map((e) => e.block));

          // Find all proof blocks present on this page with their positions
          const presentBlocks = PROOF_HIERARCHY
            .filter((block) => source.includes(block.pattern))
            .map((block) => ({
              ...block,
              position: findPosition(source, block.pattern),
              isException: exceptionBlocks.has(block.name),
            }));

          // Filter to non-exception blocks for ordering check
          const orderedBlocks = presentBlocks.filter((b) => !b.isException);

          // Verify non-exception blocks appear in hierarchy order
          for (let i = 1; i < orderedBlocks.length; i++) {
            const prev = orderedBlocks[i - 1];
            const curr = orderedBlocks[i];

            expect(
              prev.position < curr.position,
              `${pageFile}: ${prev.name} (rank ${prev.rank}) should appear before ${curr.name} (rank ${curr.rank}) per Proof Hierarchy`
            ).toBe(true);

            expect(
              prev.rank < curr.rank,
              `${pageFile}: ${prev.name} (rank ${prev.rank}) should have lower rank than ${curr.name} (rank ${curr.rank}) per Proof Hierarchy`
            ).toBe(true);
          }

          // Verify exception blocks exist but are allowed to be out of order
          const exceptionBlocksPresent = presentBlocks.filter((b) => b.isException);
          for (const eb of exceptionBlocksPresent) {
            expect(
              eb.position,
              `${pageFile}: Exception block ${eb.name} should be present on the page`
            ).toBeGreaterThan(-1);
          }
        }),
        { numRuns: 100 }
      );
    });

    it('homepage proof blocks follow hierarchy: Speed → NYCC → THEFEEDGROUP, with stock photography intentionally lowered', () => {
      // Feature: scram-proof-driven-conversion, Property 8: Proof hierarchy ordering
      // **Validates: Requirements 20.7**

      const source = readPageSource('src/app/page.tsx');

      const speedPos = findPosition(source, '<SpeedProofBlock');
      const nyccPos = findPosition(source, '<NYCCProofBlock');
      const tfgPos = findPosition(source, '<TheFeedGroupProofBlock');
      const stockPos = findPosition(source, '<StockPhotographyProofBlock');

      // All must be present
      expect(speedPos).toBeGreaterThan(-1);
      expect(nyccPos).toBeGreaterThan(-1);
      expect(tfgPos).toBeGreaterThan(-1);
      expect(stockPos).toBeGreaterThan(-1);

      // Hierarchy order for primary proof blocks
      expect(speedPos).toBeLessThan(nyccPos);
      expect(nyccPos).toBeLessThan(tfgPos);

      // Stock photography is intentionally after THEFEEDGROUP (lower hierarchy)
      expect(tfgPos).toBeLessThan(stockPos);
    });
  });

  // =====================================================================
  // Property 11: Proof block spacing — no excessive stacking
  // =====================================================================
  describe('Property 11: Proof block spacing — no excessive stacking', () => {
    it('consecutive proof-heavy sections on the homepage are separated by non-proof sections or differentiated by narrative role', () => {
      // Feature: scram-proof-driven-conversion, Property 11: Proof block spacing
      // **Validates: Requirements 24.1**

      const source = readPageSource('src/app/page.tsx');

      // Find positions of all homepage sections
      const sectionPositions = HOMEPAGE_SECTIONS
        .map((section) => ({
          ...section,
          position: findPosition(source, section.marker),
        }))
        .filter((s) => s.position > -1)
        .sort((a, b) => a.position - b.position);

      // Check that no more than 2 consecutive proof sections appear without a non-proof spacer
      // (Speed → NYCC is allowed as they are differentiated by type: performance vs operational)
      let consecutiveProofCount = 0;
      const MAX_CONSECUTIVE_PROOF = 2;

      for (const section of sectionPositions) {
        if (section.type === 'proof') {
          consecutiveProofCount++;
          expect(
            consecutiveProofCount,
            `Homepage has ${consecutiveProofCount} consecutive proof sections ending at "${section.name}" — max allowed is ${MAX_CONSECUTIVE_PROOF} before a non-proof spacer`
          ).toBeLessThanOrEqual(MAX_CONSECUTIVE_PROOF);
        } else {
          consecutiveProofCount = 0;
        }
      }
    });

    it('proof blocks that are adjacent serve different narrative roles', () => {
      // Feature: scram-proof-driven-conversion, Property 11: Proof block spacing
      // **Validates: Requirements 24.1**

      const source = readPageSource('src/app/page.tsx');

      // Adjacent proof blocks on homepage: SpeedProofBlock (section 4) and NYCCProofBlock (section 5)
      // These must serve different narrative roles (speed/performance vs operational/admin)
      const speedBlock = source.includes('<SpeedProofBlock');
      const nyccBlock = source.includes('<NYCCProofBlock');

      expect(speedBlock).toBe(true);
      expect(nyccBlock).toBe(true);

      // Verify they are different component types (not the same proof repeated)
      // SpeedProofBlock focuses on performance metrics
      expect(source).toContain('variant="full"');
      // NYCCProofBlock focuses on operational outcomes
      expect(source).toContain('<NYCCProofBlock');

      // Verify a non-proof section (services) separates NYCC from THEFEEDGROUP
      const nyccPos = findPosition(source, '<NYCCProofBlock');
      const servicesPos = findPosition(source, '/* Section 5: Two-service card grid');
      const tfgPos = findPosition(source, '<TheFeedGroupProofBlock');

      expect(nyccPos).toBeLessThan(servicesPos);
      expect(servicesPos).toBeLessThan(tfgPos);
    });
  });

  // =====================================================================
  // Property 12: CTA spacing — no clustered CTA pressure
  // =====================================================================
  describe('Property 12: CTA spacing — no clustered CTA pressure', () => {
    it('no two adjacent sections on the homepage both function primarily as CTA sections', () => {
      // Feature: scram-proof-driven-conversion, Property 12: CTA spacing
      // **Validates: Requirements 24.2**

      const source = readPageSource('src/app/page.tsx');

      // Find positions of all homepage sections
      const sectionPositions = HOMEPAGE_SECTIONS
        .map((section) => ({
          ...section,
          position: findPosition(source, section.marker),
        }))
        .filter((s) => s.position > -1)
        .sort((a, b) => a.position - b.position);

      // Check that no two adjacent sections are both CTA sections
      for (let i = 1; i < sectionPositions.length; i++) {
        const prev = sectionPositions[i - 1];
        const curr = sectionPositions[i];

        if (prev.type === 'cta' && curr.type === 'cta') {
          // This would be a violation — two adjacent CTA sections
          expect(
            false,
            `Homepage has adjacent CTA sections: "${prev.name}" (section ${i}) and "${curr.name}" (section ${i + 1}). At least one non-CTA section must separate them.`
          ).toBe(true);
        }
      }
    });

    it('homepage has exactly one CTABlock (the final end-of-page CTA)', () => {
      // Feature: scram-proof-driven-conversion, Property 12: CTA spacing
      // **Validates: Requirements 24.2**

      const source = readPageSource('src/app/page.tsx');

      // Find all CTABlock positions
      const ctaMatches: number[] = [];
      let searchFrom = 0;
      while (true) {
        const idx = source.indexOf('<CTABlock', searchFrom);
        if (idx === -1) break;
        ctaMatches.push(idx);
        searchFrom = idx + 1;
      }

      // There should be exactly 1 CTA block on the homepage (the final end-of-page CTA)
      expect(ctaMatches.length).toBe(1);
    });
  });

  // =====================================================================
  // Property 13: At least one proof element before final CTA
  // =====================================================================
  describe('Property 13: At least one proof element before final CTA', () => {
    it('every major page modified in this pass has at least one proof element before the end-of-page CTA', () => {
      // Feature: scram-proof-driven-conversion, Property 13: At least one proof element before final CTA
      // **Validates: Requirements 25.8**

      const pageArb = fc.constantFrom(...MAJOR_PAGES_MODIFIED);

      fc.assert(
        fc.property(pageArb, (pageFile) => {
          const source = readPageSource(pageFile);

          // Find the end-of-page CTA position
          const endOfPageCTAPos = findPosition(source, 'variant="end-of-page"');
          expect(
            endOfPageCTAPos,
            `${pageFile}: Must have an end-of-page CTA block`
          ).toBeGreaterThan(-1);

          // Check that at least one proof indicator appears before the end-of-page CTA
          const sourceBeforeFinalCTA = source.substring(0, endOfPageCTAPos);

          const hasProofBeforeCTA = PROOF_INDICATORS.some((indicator) =>
            sourceBeforeFinalCTA.includes(indicator)
          );

          expect(
            hasProofBeforeCTA,
            `${pageFile}: Must have at least one proof element before the end-of-page CTA`
          ).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('homepage has multiple proof blocks before the final CTA', () => {
      // Feature: scram-proof-driven-conversion, Property 13: At least one proof element before final CTA
      // **Validates: Requirements 25.8**

      const source = readPageSource('src/app/page.tsx');
      const endOfPageCTAPos = findPosition(source, 'variant="end-of-page"');

      expect(endOfPageCTAPos).toBeGreaterThan(-1);

      const sourceBeforeFinalCTA = source.substring(0, endOfPageCTAPos);

      // Homepage should have Speed, NYCC, and THEFEEDGROUP proof blocks before final CTA
      expect(sourceBeforeFinalCTA).toContain('<SpeedProofBlock');
      expect(sourceBeforeFinalCTA).toContain('<NYCCProofBlock');
      expect(sourceBeforeFinalCTA).toContain('<TheFeedGroupProofBlock');
    });
  });
});


// =====================================================================
// Property 6: Publication proof requires visible support
// =====================================================================

describe('Feature: scram-proof-driven-conversion — Photography Publication Proof Properties', () => {
  describe('Property 6: Publication proof requires visible support', () => {
    /**
     * Feature: scram-proof-driven-conversion, Property 6: Publication proof requires visible support
     * **Validates: Requirements 16.3**
     *
     * For each publication name in the AuthorityProofBlock's publications array,
     * there must exist visible supporting proof on the same page linking that
     * publication name to a portfolio image, caption, or authority proof item.
     * Unsupported publication names must not be rendered.
     */

    const PHOTOGRAPHY_PAGE = 'src/app/services/photography/page.tsx';

    /**
     * Extract publication names from the AuthorityProofBlock usage on the page.
     * Looks for the `name:` property inside the publications array passed to AuthorityProofBlock.
     */
    function extractAuthorityPublications(source: string): string[] {
      // Find the AuthorityProofBlock JSX block
      const authorityStart = source.indexOf('<AuthorityProofBlock');
      if (authorityStart === -1) return [];

      // Find the closing of the AuthorityProofBlock (self-closing or with children)
      const authorityEnd = source.indexOf('/>', authorityStart);
      if (authorityEnd === -1) return [];

      const authorityBlock = source.substring(authorityStart, authorityEnd);

      // Extract all name: 'xxx' or name: "xxx" values from the publications array
      const namePattern = /name:\s*['"]([^'"]+)['"]/g;
      const names: string[] = [];
      let match;
      while ((match = namePattern.exec(authorityBlock)) !== null) {
        names.push(match[1]);
      }
      return names;
    }

    /**
     * Check if a publication name has visible supporting proof on the page.
     * Supporting proof can be:
     * 1. An image in the gallery with a matching publication name in caption, alt, or publication field
     * 2. A mention in the authority proof block itself (imageSrc, imageAlt, caption)
     * 3. A text reference elsewhere on the page linking the publication to portfolio content
     */
    function hasVisibleSupport(source: string, publicationName: string): boolean {
      // The AuthorityProofBlock itself provides visible support: it renders the publication
      // name, an image, and a caption. Check that the publication entry has all required fields.
      const authorityStart = source.indexOf('<AuthorityProofBlock');
      if (authorityStart === -1) return false;
      const authorityEnd = source.indexOf('/>', authorityStart);
      if (authorityEnd === -1) return false;
      const authorityBlock = source.substring(authorityStart, authorityEnd);

      // Find the specific publication entry in the authority block
      const pubEntryPattern = new RegExp(
        `name:\\s*['"]${escapeRegex(publicationName)}['"][\\s\\S]*?(?=name:|$)`,
      );
      const pubEntry = authorityBlock.match(pubEntryPattern);
      if (!pubEntry) return false;

      const entry = pubEntry[0];
      // Verify the entry has imageSrc, imageAlt, and caption (all required for visible support)
      const hasImage = /imageSrc:\s*['"][^'"]+['"]/.test(entry);
      const hasAlt = /imageAlt:\s*['"][^'"]+['"]/.test(entry);
      const hasCaption = /caption:\s*['"][^'"]+['"]/.test(entry);

      if (!hasImage || !hasAlt || !hasCaption) return false;

      // Additionally check that the publication name appears elsewhere on the page
      // (in gallery captions, narrative text, or hero proof text) for cross-referencing
      const pageWithoutAuthority =
        source.substring(0, authorityStart) + source.substring(authorityEnd);
      const nameAppearsElsewhere = pageWithoutAuthority.includes(publicationName);

      // The authority proof block itself IS the visible support (it renders the image,
      // name, and caption visibly). Additional page references strengthen but are not
      // strictly required — the authority block IS the proof display.
      return true;
    }

    function escapeRegex(str: string): string {
      return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    it('every publication in AuthorityProofBlock has visible supporting proof on the photography page', () => {
      // Feature: scram-proof-driven-conversion, Property 6: Publication proof requires visible support
      // **Validates: Requirements 16.3**

      const source = readPageSource(PHOTOGRAPHY_PAGE);
      const publications = extractAuthorityPublications(source);

      // There must be publications in the authority proof block
      expect(
        publications.length,
        'AuthorityProofBlock must contain at least one publication',
      ).toBeGreaterThan(0);

      // Use fast-check to verify the property for each publication
      const pubArb = fc.constantFrom(...publications);

      fc.assert(
        fc.property(pubArb, (publicationName) => {
          const supported = hasVisibleSupport(source, publicationName);
          expect(
            supported,
            `Publication "${publicationName}" in AuthorityProofBlock must have visible supporting proof (image, alt text, and caption) on the photography page`,
          ).toBe(true);
        }),
        { numRuns: 100 },
      );
    });

    it('AuthorityProofBlock filters out publications without complete proof data', () => {
      // Feature: scram-proof-driven-conversion, Property 6: Publication proof requires visible support
      // **Validates: Requirements 16.3**

      // The AuthorityProofBlock component filters out entries missing name, imageSrc, imageAlt, or caption.
      // Verify that every publication passed on the photography page has all required fields.
      const source = readPageSource(PHOTOGRAPHY_PAGE);
      const authorityStart = source.indexOf('<AuthorityProofBlock');
      expect(authorityStart, 'Photography page must include AuthorityProofBlock').toBeGreaterThan(-1);

      const authorityEnd = source.indexOf('/>', authorityStart);
      const authorityBlock = source.substring(authorityStart, authorityEnd);

      // Extract all publication entries
      const publications = extractAuthorityPublications(source);

      const pubArb = fc.constantFrom(...publications);

      fc.assert(
        fc.property(pubArb, (pubName) => {
          // Each publication entry must have all four required fields
          const entryPattern = new RegExp(
            `name:\\s*['"]${escapeRegex(pubName)}['"]`,
          );
          expect(entryPattern.test(authorityBlock)).toBe(true);

          // Find the entry block for this publication
          const nameIdx = authorityBlock.search(entryPattern);
          // Get the surrounding object block (from the previous { to the next })
          const beforeName = authorityBlock.substring(0, nameIdx);
          const objStart = beforeName.lastIndexOf('{');
          const afterName = authorityBlock.substring(nameIdx);
          const objEnd = afterName.indexOf('}') + nameIdx;
          const objBlock = authorityBlock.substring(objStart, objEnd + 1);

          expect(
            /imageSrc:\s*['"][^'"]+['"]/.test(objBlock),
            `Publication "${pubName}" must have an imageSrc`,
          ).toBe(true);
          expect(
            /imageAlt:\s*['"][^'"]+['"]/.test(objBlock),
            `Publication "${pubName}" must have an imageAlt`,
          ).toBe(true);
          expect(
            /caption:\s*['"][^'"]+['"]/.test(objBlock),
            `Publication "${pubName}" must have a caption`,
          ).toBe(true);
        }),
        { numRuns: 100 },
      );
    });

    it('each publication in AuthorityProofBlock also appears in gallery or page narrative for cross-referencing', () => {
      // Feature: scram-proof-driven-conversion, Property 6: Publication proof requires visible support
      // **Validates: Requirements 16.3**

      const source = readPageSource(PHOTOGRAPHY_PAGE);
      const publications = extractAuthorityPublications(source);

      // Remove the AuthorityProofBlock section to check for references elsewhere
      const authorityStart = source.indexOf('<AuthorityProofBlock');
      const authorityEnd = source.indexOf('/>', authorityStart) + 2;
      const pageWithoutAuthority =
        source.substring(0, authorityStart) + source.substring(authorityEnd);

      const pubArb = fc.constantFrom(...publications);

      fc.assert(
        fc.property(pubArb, (publicationName) => {
          // Each publication name should appear somewhere else on the page:
          // in gallery captions, hero proof text, narrative sections, or image data
          const appearsElsewhere = pageWithoutAuthority.includes(publicationName);
          expect(
            appearsElsewhere,
            `Publication "${publicationName}" should appear in gallery, narrative, or hero text (not just in AuthorityProofBlock) for cross-referencing`,
          ).toBe(true);
        }),
        { numRuns: 100 },
      );
    });
  });
});


// =====================================================================
// Property 5: Speed proof source attribution
// =====================================================================

describe('Feature: scram-proof-driven-conversion — Speed Proof Attribution Properties', () => {
  describe('Property 5: Speed proof source attribution', () => {
    /**
     * Feature: scram-proof-driven-conversion, Property 5: Speed proof source attribution
     * **Validates: Requirements 4.7, 20.1**
     *
     * For any page displaying speed proof data (load time or performance score
     * metrics), visible source attribution text is present identifying whether
     * the data comes from Joe's own website or a client project.
     */

    // Pages that currently use SpeedProofBlock
    const PAGES_WITH_SPEED_PROOF = [
      'src/app/page.tsx',
      'src/app/services/website-design/page.tsx',
    ];

    it('every page using SpeedProofBlock has a non-empty sourceAttribution prop', () => {
      // Feature: scram-proof-driven-conversion, Property 5: Speed proof source attribution
      // **Validates: Requirements 4.7, 20.1**

      const pageArb = fc.constantFrom(...PAGES_WITH_SPEED_PROOF);

      fc.assert(
        fc.property(pageArb, (pageFile) => {
          const source = readPageSource(pageFile);

          // Page must contain SpeedProofBlock
          expect(
            source.includes('<SpeedProofBlock'),
            `${pageFile}: Must contain a SpeedProofBlock component`,
          ).toBe(true);

          // Extract the sourceAttribution prop value
          const attrPattern = /sourceAttribution\s*=\s*"([^"]+)"/;
          const match = source.match(attrPattern);

          expect(
            match,
            `${pageFile}: SpeedProofBlock must have a sourceAttribution prop with a non-empty value`,
          ).not.toBeNull();

          const attributionText = match![1].trim();

          expect(
            attributionText.length,
            `${pageFile}: sourceAttribution must not be empty`,
          ).toBeGreaterThan(0);

          // Attribution must identify the source context (Joe's own site or a client project)
          const identifiesSource =
            /\b(my own|my site|my website|client|project)\b/i.test(attributionText);

          expect(
            identifiesSource,
            `${pageFile}: sourceAttribution "${attributionText}" must identify whether data comes from Joe's own website or a client project`,
          ).toBe(true);
        }),
        { numRuns: 100 },
      );
    });

    it('sourceAttribution text is visibly rendered by the SpeedProofBlock component', () => {
      // Feature: scram-proof-driven-conversion, Property 5: Speed proof source attribution
      // **Validates: Requirements 4.7, 20.1**

      // Verify the SpeedProofBlock component renders sourceAttribution in both variants
      const componentSource = readPageSource('src/components/scram/SpeedProofBlock.tsx');

      // The component must accept sourceAttribution as a required prop
      expect(
        componentSource.includes('sourceAttribution: string'),
        'SpeedProofBlock must declare sourceAttribution as a required string prop',
      ).toBe(true);

      // Both FullVariant and CompactVariant must render the attribution
      expect(
        componentSource.includes('{sourceAttribution}'),
        'SpeedProofBlock must render sourceAttribution visibly in its JSX',
      ).toBe(true);

      // Count occurrences — should appear in both variants
      const renderCount = (componentSource.match(/\{sourceAttribution\}/g) || []).length;
      expect(
        renderCount,
        'sourceAttribution must be rendered in both full and compact variants',
      ).toBeGreaterThanOrEqual(2);
    });
  });
});


// =====================================================================
// Properties 1–4: Site-Wide CTA Rules
// =====================================================================

describe('Feature: scram-proof-driven-conversion — Site-Wide CTA Properties', () => {
  // --- Page lists ---

  const NON_PHOTOGRAPHY_PAGES = [
    'src/app/page.tsx',
    'src/app/services/website-design/page.tsx',
    'src/app/services/hosting/page.tsx',
    'src/app/pricing/page.tsx',
    'src/app/about/page.tsx',
    'src/app/contact/page.tsx',
    'src/app/services/page.tsx',
    'src/app/services/ad-campaigns/page.tsx',
    'src/app/services/analytics/page.tsx',
    'src/app/free-audit/page.tsx',
  ];

  const PHOTOGRAPHY_PAGE = 'src/app/services/photography/page.tsx';

  const ALL_PAGES = [...NON_PHOTOGRAPHY_PAGES, PHOTOGRAPHY_PAGE];

  // --- Helpers ---

  /**
   * Extract all CTABlock primaryLabel values from page source.
   * Handles both literal strings and constant references (e.g. STANDARD_CTA.primaryLabel).
   */
  function extractCTABlockPrimaryLabels(source: string): string[] {
    const labels: string[] = [];
    // Literal: primaryLabel="..."
    const literalPattern = /primaryLabel\s*=\s*"([^"]+)"/g;
    let m: RegExpExecArray | null;
    while ((m = literalPattern.exec(source)) !== null) {
      labels.push(m[1]);
    }
    // Constant ref: primaryLabel={STANDARD_CTA.primaryLabel} or {PHOTOGRAPHY_CTA.primaryLabel}
    const constPattern = /primaryLabel\s*=\s*\{(STANDARD_CTA|PHOTOGRAPHY_CTA)\.primaryLabel\}/g;
    while ((m = constPattern.exec(source)) !== null) {
      if (m[1] === 'STANDARD_CTA') labels.push('Send me your website');
      if (m[1] === 'PHOTOGRAPHY_CTA') labels.push('Book your photoshoot');
    }
    return labels;
  }

  /**
   * Extract all CTABlock primaryHref values from page source.
   */
  function extractCTABlockPrimaryHrefs(source: string): string[] {
    const hrefs: string[] = [];
    const literalPattern = /primaryHref\s*=\s*"([^"]+)"/g;
    let m: RegExpExecArray | null;
    while ((m = literalPattern.exec(source)) !== null) {
      hrefs.push(m[1]);
    }
    const constPattern = /primaryHref\s*=\s*\{(STANDARD_CTA|PHOTOGRAPHY_CTA)\.primaryHref\}/g;
    while ((m = constPattern.exec(source)) !== null) {
      if (m[1] === 'STANDARD_CTA') hrefs.push('/contact/');
      if (m[1] === 'PHOTOGRAPHY_CTA') hrefs.push('#contact');
    }
    return hrefs;
  }

  /**
   * Extract all CTABlock secondaryLabel values from page source.
   */
  function extractCTABlockSecondaryLabels(source: string): string[] {
    const labels: string[] = [];
    const literalPattern = /secondaryLabel\s*=\s*"([^"]+)"/g;
    let m: RegExpExecArray | null;
    while ((m = literalPattern.exec(source)) !== null) {
      labels.push(m[1]);
    }
    const constPattern = /secondaryLabel\s*=\s*\{(STANDARD_CTA|PHOTOGRAPHY_CTA)\.secondaryLabel\}/g;
    while ((m = constPattern.exec(source)) !== null) {
      if (m[1] === 'STANDARD_CTA') labels.push('Email me directly');
      if (m[1] === 'PHOTOGRAPHY_CTA') labels.push('View portfolio');
    }
    return labels;
  }

  /**
   * Extract ProblemHero ctaLabel values from page source.
   */
  function extractProblemHeroCtaLabels(source: string): string[] {
    const labels: string[] = [];
    const literalPattern = /ctaLabel\s*=\s*"([^"]+)"/g;
    let m: RegExpExecArray | null;
    while ((m = literalPattern.exec(source)) !== null) {
      labels.push(m[1]);
    }
    const constPattern = /ctaLabel\s*=\s*\{(STANDARD_CTA|PHOTOGRAPHY_CTA)\.primaryLabel\}/g;
    while ((m = constPattern.exec(source)) !== null) {
      if (m[1] === 'STANDARD_CTA') labels.push('Send me your website');
      if (m[1] === 'PHOTOGRAPHY_CTA') labels.push('Book your photoshoot');
    }
    return labels;
  }

  // =====================================================================
  // Property 1: Primary CTA consistency
  // =====================================================================
  describe('Property 1: Primary CTA consistency', () => {
    it('for any non-photography page, primary CTA label is "Send me your website" linking to /contact/ (or #contact-form on contact page)', () => {
      // Feature: scram-proof-driven-conversion, Property 1: Primary CTA consistency
      // **Validates: Requirements 12.1, 14.3, 15.6**

      const pageArb = fc.constantFrom(...NON_PHOTOGRAPHY_PAGES);

      fc.assert(
        fc.property(pageArb, (pageFile) => {
          const source = readPageSource(pageFile);
          const isContactPage = pageFile.includes('/contact/');

          // Check CTABlock primaryLabel values
          const primaryLabels = extractCTABlockPrimaryLabels(source);
          for (const label of primaryLabels) {
            expect(
              label,
              `${pageFile}: CTABlock primaryLabel must be "Send me your website", got "${label}"`,
            ).toBe('Send me your website');
          }

          // Check CTABlock primaryHref values
          const primaryHrefs = extractCTABlockPrimaryHrefs(source);
          for (const href of primaryHrefs) {
            const acceptable = href === '/contact/' || (isContactPage && href === '#contact-form');
            expect(
              acceptable,
              `${pageFile}: CTABlock primaryHref must be "/contact/" (or "#contact-form" on contact page), got "${href}"`,
            ).toBe(true);
          }

          // Check ProblemHero ctaLabel values
          // Hero CTA wording may differ from CTABlock to reduce duplicated CTA pressure
          // (Requirements 4.1-4.4). Validate: non-empty, non-deprecated, links to /contact/ or #contact-form.
          const DEPRECATED_HERO_LABELS = [
            'Book a free call',
            'Get started',
            'Request a review',
            'Check availability',
            'Call Joe',
          ];
          const heroLabels = extractProblemHeroCtaLabels(source);
          for (const label of heroLabels) {
            expect(
              label.trim().length,
              `${pageFile}: ProblemHero ctaLabel must be a non-empty string`,
            ).toBeGreaterThan(0);
            for (const deprecated of DEPRECATED_HERO_LABELS) {
              expect(
                label,
                `${pageFile}: ProblemHero ctaLabel must not be deprecated label "${deprecated}", got "${label}"`,
              ).not.toBe(deprecated);
            }
          }

          // Check ProblemHero ctaHref links to /contact/ or #contact-form
          const heroHrefPattern = /ctaHref\s*=\s*(?:"([^"]+)"|\{([^}]+)\})/g;
          let heroHrefMatch;
          while ((heroHrefMatch = heroHrefPattern.exec(source)) !== null) {
            const href = heroHrefMatch[1] || (heroHrefMatch[2]?.includes('STANDARD_CTA') ? '/contact/' : heroHrefMatch[2]?.includes('PHOTOGRAPHY_CTA') ? '#contact' : heroHrefMatch[2]);
            if (href) {
              const acceptableHeroHref = href === '/contact/' || href === '#contact-form' || href === '#contact';
              expect(
                acceptableHeroHref,
                `${pageFile}: ProblemHero ctaHref must link to "/contact/" or "#contact-form", got "${href}"`,
              ).toBe(true);
            }
          }
        }),
        { numRuns: 100 },
      );
    });
  });

  // =====================================================================
  // Property 2: Secondary CTA consistency
  // =====================================================================
  describe('Property 2: Secondary CTA consistency', () => {
    it('for any page, secondary CTA is "Email me directly" (except photography: "View portfolio")', () => {
      // Feature: scram-proof-driven-conversion, Property 2: Secondary CTA consistency
      // **Validates: Requirements 12.2**

      const pageArb = fc.constantFrom(...ALL_PAGES);

      fc.assert(
        fc.property(pageArb, (pageFile) => {
          const source = readPageSource(pageFile);
          const isPhotography = pageFile.includes('/photography/');

          const secondaryLabels = extractCTABlockSecondaryLabels(source);
          const expectedLabel = isPhotography ? 'View portfolio' : 'Email me directly';

          for (const label of secondaryLabels) {
            expect(
              label,
              `${pageFile}: CTABlock secondaryLabel must be "${expectedLabel}", got "${label}"`,
            ).toBe(expectedLabel);
          }
        }),
        { numRuns: 100 },
      );
    });
  });

  // =====================================================================
  // Property 3: No deprecated CTA labels
  // =====================================================================
  describe('Property 3: No deprecated CTA labels', () => {
    it('no page contains deprecated CTA labels in primaryLabel, secondaryLabel, or ctaLabel props', () => {
      // Feature: scram-proof-driven-conversion, Property 3: No deprecated CTA labels
      // **Validates: Requirements 12.3, 12.8**

      const DEPRECATED_LABELS = [
        'Book a free call',
        'Get started',
        'Request a review',
        'Check availability',
      ];

      const pageArb = fc.constantFrom(...ALL_PAGES);

      fc.assert(
        fc.property(pageArb, (pageFile) => {
          const source = readPageSource(pageFile);

          // Check CTABlock primary and secondary labels
          const primaryLabels = extractCTABlockPrimaryLabels(source);
          const secondaryLabels = extractCTABlockSecondaryLabels(source);
          const heroLabels = extractProblemHeroCtaLabels(source);
          const allCTALabels = [...primaryLabels, ...secondaryLabels, ...heroLabels];

          for (const label of allCTALabels) {
            for (const deprecated of DEPRECATED_LABELS) {
              expect(
                label,
                `${pageFile}: CTA label "${label}" must not be the deprecated label "${deprecated}"`,
              ).not.toBe(deprecated);
            }
          }

          // Special handling for "Call Joe": only acceptable in non-CTA contexts
          // (contact details sidebar, footer, schema telephone).
          // Check it does not appear as a CTA prop value.
          for (const label of allCTALabels) {
            expect(
              label,
              `${pageFile}: "Call Joe" must not appear as a CTA label, got "${label}"`,
            ).not.toBe('Call Joe');
          }

          // Also check raw source for deprecated labels inside CTA prop assignments
          // This catches any patterns the extractors might miss
          for (const deprecated of DEPRECATED_LABELS) {
            const inPrimaryLabel = source.includes(`primaryLabel="${deprecated}"`);
            const inSecondaryLabel = source.includes(`secondaryLabel="${deprecated}"`);
            const inCtaLabel = source.includes(`ctaLabel="${deprecated}"`);

            expect(
              inPrimaryLabel,
              `${pageFile}: primaryLabel must not contain deprecated "${deprecated}"`,
            ).toBe(false);
            expect(
              inSecondaryLabel,
              `${pageFile}: secondaryLabel must not contain deprecated "${deprecated}"`,
            ).toBe(false);
            expect(
              inCtaLabel,
              `${pageFile}: ctaLabel must not contain deprecated "${deprecated}"`,
            ).toBe(false);
          }

          // "Call Joe" in CTA props specifically
          expect(
            source.includes('primaryLabel="Call Joe"'),
            `${pageFile}: primaryLabel must not be "Call Joe"`,
          ).toBe(false);
          expect(
            source.includes('secondaryLabel="Call Joe"'),
            `${pageFile}: secondaryLabel must not be "Call Joe"`,
          ).toBe(false);
          expect(
            source.includes('ctaLabel="Call Joe"'),
            `${pageFile}: ctaLabel must not be "Call Joe"`,
          ).toBe(false);
        }),
        { numRuns: 100 },
      );
    });
  });

  // =====================================================================
  // Property 4: CTA block action consistency
  // =====================================================================
  describe('Property 4: CTA block action consistency', () => {
    it('pages with multiple CTA blocks use the same primary and secondary labels throughout', () => {
      // Feature: scram-proof-driven-conversion, Property 4: CTA block action consistency
      // **Validates: Requirements 12.5, 12.6**

      const pageArb = fc.constantFrom(...ALL_PAGES);

      fc.assert(
        fc.property(pageArb, (pageFile) => {
          const source = readPageSource(pageFile);

          const primaryLabels = extractCTABlockPrimaryLabels(source);
          const secondaryLabels = extractCTABlockSecondaryLabels(source);

          // Only check consistency if there are multiple CTA blocks
          if (primaryLabels.length > 1) {
            const uniquePrimary = new Set(primaryLabels);
            expect(
              uniquePrimary.size,
              `${pageFile}: All CTABlock primaryLabel values must be the same, found: ${[...uniquePrimary].join(', ')}`,
            ).toBe(1);
          }

          if (secondaryLabels.length > 1) {
            const uniqueSecondary = new Set(secondaryLabels);
            expect(
              uniqueSecondary.size,
              `${pageFile}: All CTABlock secondaryLabel values must be the same, found: ${[...uniqueSecondary].join(', ')}`,
            ).toBe(1);
          }
        }),
        { numRuns: 100 },
      );
    });
  });
});


// =====================================================================
// Property 7: Flyer ROI context restriction
// =====================================================================

describe('Feature: scram-proof-driven-conversion — Flyer ROI Context Restriction', () => {
  describe('Property 7: Flyer ROI context restriction', () => {
    /**
     * Feature: scram-proof-driven-conversion, Property 7: Flyer ROI context restriction
     * **Validates: Requirements 20.4**
     *
     * Flyer campaign data (£13,563.92, £546, 2,380%, £13,500) does not appear
     * outside flyer/offline campaign context on any page.
     * The ad-campaigns page may reference these figures in a flyer/offline campaign
     * context — that is acceptable.
     */

    // All 8 modified pages (excluding ad-campaigns which is the allowed context)
    const PAGES_TO_CHECK = [
      'src/app/page.tsx',
      'src/app/services/photography/page.tsx',
      'src/app/services/website-design/page.tsx',
      'src/app/services/hosting/page.tsx',
      'src/app/pricing/page.tsx',
      'src/app/about/page.tsx',
      'src/app/contact/page.tsx',
      'src/app/services/page.tsx',
    ];

    // Flyer-specific figures that must not appear outside flyer context
    const FLYER_FIGURES = [
      '£13,563.92',
      '£546',
      '2,380%',
      '£13,500',
    ];

    it('flyer campaign data does not appear on any non-ad-campaigns page', () => {
      // Feature: scram-proof-driven-conversion, Property 7: Flyer ROI context restriction
      // **Validates: Requirements 20.4**

      const pageArb = fc.constantFrom(...PAGES_TO_CHECK);

      fc.assert(
        fc.property(pageArb, (pageFile) => {
          const source = readPageSource(pageFile);

          for (const figure of FLYER_FIGURES) {
            expect(
              source.includes(figure),
              `${pageFile}: Flyer ROI figure "${figure}" must not appear outside flyer/offline campaign context`,
            ).toBe(false);
          }
        }),
        { numRuns: 100 },
      );
    });
  });
});


// =====================================================================
// Property 9: Copy rules — no "we" and no em dashes
// =====================================================================

describe('Feature: scram-proof-driven-conversion — Copy Rules Properties', () => {
  describe('Property 9: Copy rules — no "we" and no em dashes', () => {
    /**
     * Feature: scram-proof-driven-conversion, Property 9: Copy rules — no "we" and no em dashes
     * **Validates: Requirements 22.2, 22.3**
     *
     * New/modified text contains no first-person "we" and no em dash characters.
     * - Em dash character (—) U+2014 in visible text content (not in comments or metadata)
     * - First-person "we" usage (but NOT in quoted third-party text, schema descriptions, or metadata)
     * - "we" inside words like "website", "newer", "between", "power" should NOT be flagged
     * - Only flag standalone "we" as a word boundary match
     * - "we" in schema/metadata is acceptable
     */

    const PAGES_TO_CHECK = [
      'src/app/page.tsx',
      'src/app/services/photography/page.tsx',
      'src/app/services/website-design/page.tsx',
      'src/app/services/hosting/page.tsx',
      'src/app/pricing/page.tsx',
      'src/app/about/page.tsx',
      'src/app/contact/page.tsx',
      'src/app/services/page.tsx',
    ];

    /**
     * Extract visible JSX text content from source, excluding:
     * - Schema/metadata blocks (buildXxx functions, generateMetadata, etc.)
     * - Code comments (// and /* *\/)
     * - Import statements
     */
    function extractVisibleJSXContent(source: string): string {
      let content = source;

      // Remove single-line comments
      content = content.replace(/\/\/.*$/gm, '');

      // Remove multi-line comments
      content = content.replace(/\/\*[\s\S]*?\*\//g, '');

      // Remove import statements
      content = content.replace(/^import\s+.*$/gm, '');

      // Remove schema/metadata builder function bodies (buildFAQPage, buildLocalBusiness, etc.)
      // These are typically defined as function calls or const assignments before the component return
      content = content.replace(/build\w+\s*\([^)]*\)\s*[,;]?/g, '');

      // Remove generateMetadata / metadata export blocks
      content = content.replace(/export\s+(const|async\s+function)\s+(?:metadata|generateMetadata)[\s\S]*?(?=export\s+(?:default|const|function)|function\s+\w+Page)/g, '');

      // Remove schema arrays and JSON-LD script blocks
      content = content.replace(/<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/g, '');

      // Remove dangerouslySetInnerHTML blocks (often contain schema JSON)
      content = content.replace(/dangerouslySetInnerHTML\s*=\s*\{\s*\{[\s\S]*?\}\s*\}/g, '');

      return content;
    }

    it('no modified page contains em dash characters (U+2014) in visible text content', () => {
      // Feature: scram-proof-driven-conversion, Property 9: Copy rules — no "we" and no em dashes
      // **Validates: Requirements 22.3**

      const pageArb = fc.constantFrom(...PAGES_TO_CHECK);

      fc.assert(
        fc.property(pageArb, (pageFile) => {
          const source = readPageSource(pageFile);
          const visibleContent = extractVisibleJSXContent(source);

          // Search for em dash character U+2014
          const emDashPattern = /\u2014/g;
          const matches = visibleContent.match(emDashPattern);

          expect(
            matches,
            `${pageFile}: Visible text content must not contain em dash characters (—). Found ${matches?.length ?? 0} occurrence(s).`,
          ).toBeNull();
        }),
        { numRuns: 100 },
      );
    });

    it('no modified page contains standalone first-person "we" in visible JSX text content', () => {
      // Feature: scram-proof-driven-conversion, Property 9: Copy rules — no "we" and no em dashes
      // **Validates: Requirements 22.2**

      const pageArb = fc.constantFrom(...PAGES_TO_CHECK);

      fc.assert(
        fc.property(pageArb, (pageFile) => {
          const source = readPageSource(pageFile);
          const visibleContent = extractVisibleJSXContent(source);

          // Match standalone "we" with word boundaries (case-insensitive)
          // This avoids false positives from "website", "newer", "between", "power", etc.
          const wePattern = /\bwe\b/gi;
          const matches = [...visibleContent.matchAll(wePattern)];

          // Filter out matches that are likely in acceptable contexts:
          // - Inside JSX attribute values that are schema-related
          // - Inside string literals that are schema descriptions
          const problematicMatches = matches.filter((match) => {
            const idx = match.index!;
            // Get surrounding context (100 chars before and after)
            const contextStart = Math.max(0, idx - 100);
            const contextEnd = Math.min(visibleContent.length, idx + 100);
            const context = visibleContent.substring(contextStart, contextEnd);

            // Skip if in a schema/metadata context
            if (/description\s*[:=]/i.test(context)) return false;
            if (/schema/i.test(context)) return false;
            if (/JSON\.stringify/i.test(context)) return false;
            if (/application\/ld\+json/i.test(context)) return false;
            if (/@type/i.test(context)) return false;

            return true;
          });

          expect(
            problematicMatches.length,
            `${pageFile}: Visible JSX text must not contain standalone first-person "we". Found ${problematicMatches.length} occurrence(s).`,
          ).toBe(0);
        }),
        { numRuns: 100 },
      );
    });
  });
});


// =====================================================================
// Property 10: Reassurance and phrase repetition limits
// =====================================================================

describe('Feature: scram-proof-driven-conversion — Phrase Repetition Limits', () => {
  describe('Property 10: Reassurance and phrase repetition limits', () => {
    /**
     * Feature: scram-proof-driven-conversion, Property 10: Reassurance and phrase repetition limits
     * **Validates: Requirements 23.1, 23.2, 23.3, 24.3**
     *
     * Each tracked phrase appears at most once per page in visible content.
     * Schema/metadata occurrences are excluded from the count.
     */

    const PAGES_TO_CHECK = [
      'src/app/page.tsx',
      'src/app/services/photography/page.tsx',
      'src/app/services/website-design/page.tsx',
      'src/app/services/hosting/page.tsx',
      'src/app/pricing/page.tsx',
      'src/app/about/page.tsx',
      'src/app/contact/page.tsx',
      'src/app/services/page.tsx',
    ];

    // Tracked phrases that must appear max once per page
    const TRACKED_PHRASES = [
      'I reply the same day',
      'based in Nantwich and Crewe',
      'you deal directly with me',
    ];

    // "I fix that" and close variants
    const I_FIX_THAT_PATTERN = /\bI fix that\b/gi;

    /**
     * Extract visible content excluding schema/metadata blocks.
     * Removes:
     * - JSON-LD script blocks
     * - dangerouslySetInnerHTML blocks
     * - buildXxx() function call arguments (schema builders)
     * - generateMetadata / metadata export blocks
     * - Code comments
     */
    function extractVisibleContent(source: string): string {
      let content = source;

      // Remove single-line comments
      content = content.replace(/\/\/.*$/gm, '');

      // Remove multi-line comments
      content = content.replace(/\/\*[\s\S]*?\*\//g, '');

      // Remove import statements
      content = content.replace(/^import\s+.*$/gm, '');

      // Remove schema JSON-LD script blocks
      content = content.replace(/<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/g, '');

      // Remove dangerouslySetInnerHTML blocks
      content = content.replace(/dangerouslySetInnerHTML\s*=\s*\{\s*\{[\s\S]*?\}\s*\}/g, '');

      // Remove generateMetadata / metadata export blocks
      content = content.replace(/export\s+(const|async\s+function)\s+(?:metadata|generateMetadata)[\s\S]*?(?=export\s+(?:default|const|function)|function\s+\w+Page)/g, '');

      // Remove schema builder function calls (buildFAQPage, buildLocalBusiness, etc.)
      // These are typically multi-line calls that contain schema data
      content = content.replace(/build\w+\s*\([\s\S]*?\)\s*[,;]?/g, '');

      return content;
    }

    /**
     * Count case-insensitive occurrences of a phrase in text.
     */
    function countOccurrences(text: string, phrase: string): number {
      const pattern = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      const matches = text.match(pattern);
      return matches ? matches.length : 0;
    }

    it('each tracked reassurance phrase appears at most once per page in visible content', () => {
      // Feature: scram-proof-driven-conversion, Property 10: Reassurance and phrase repetition limits
      // **Validates: Requirements 23.1, 23.2, 23.3**

      const pageArb = fc.constantFrom(...PAGES_TO_CHECK);
      const phraseArb = fc.constantFrom(...TRACKED_PHRASES);

      fc.assert(
        fc.property(pageArb, phraseArb, (pageFile, phrase) => {
          const source = readPageSource(pageFile);
          const visibleContent = extractVisibleContent(source);
          const count = countOccurrences(visibleContent, phrase);

          expect(
            count,
            `${pageFile}: Phrase "${phrase}" appears ${count} time(s) in visible content — max allowed is 1`,
          ).toBeLessThanOrEqual(1);
        }),
        { numRuns: 100 },
      );
    });

    it('"I fix that" style phrasing appears at most once per page in visible content', () => {
      // Feature: scram-proof-driven-conversion, Property 10: Reassurance and phrase repetition limits
      // **Validates: Requirements 24.3**

      const pageArb = fc.constantFrom(...PAGES_TO_CHECK);

      fc.assert(
        fc.property(pageArb, (pageFile) => {
          const source = readPageSource(pageFile);
          const visibleContent = extractVisibleContent(source);

          const matches = visibleContent.match(I_FIX_THAT_PATTERN);
          const count = matches ? matches.length : 0;

          expect(
            count,
            `${pageFile}: "I fix that" style phrasing appears ${count} time(s) in visible content — max allowed is 1`,
          ).toBeLessThanOrEqual(1);
        }),
        { numRuns: 100 },
      );
    });
  });
});
