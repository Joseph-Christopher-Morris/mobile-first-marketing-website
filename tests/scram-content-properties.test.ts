import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Property-Based Tests for SCRAM Content Compliance Across All Pages
 *
 * Feature: scram-website-overhaul
 *
 * Properties tested:
 * - Property 2: No feature-first headings remain on any page
 * - Property 7: Every page contains at least one specific local reference
 * - Property 9: No absolute guarantee language on any page
 *
 * **Validates: Requirements 2.3, 6.1, 7.1, 29.2**
 *
 * These tests read the actual page source files and verify content rules
 * across the entire site using property-based testing with fast-check.
 */

// All page files that must comply with SCRAM content rules
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
];

// Read all page source files once
const pageContents: { file: string; content: string }[] = PAGE_FILES.map((file) => ({
  file,
  content: fs.readFileSync(path.resolve(process.cwd(), file), 'utf-8'),
}));

// Known feature-first heading patterns that should have been replaced
const FEATURE_FIRST_PATTERNS = [
  /Websites,\s*Ads\s*&\s*Analytics/i,
  /Website\s+Hosting\s*&\s*Migration/i,
  /Strategic\s+Ad\s+Campaigns/i,
  /Data\s+Analytics\s*&\s*Insights/i,
  /Fast\s+websites,\s*Google\s+Ads/i,
  /Professional\s+Photography\s+Services/i,
  /Digital\s+Marketing\s+Services/i,
];

// Absolute guarantee phrases that must not appear
const ABSOLUTE_GUARANTEE_PATTERNS = [
  /guaranteed\s+results/i,
  /100%\s+success\s+rate/i,
  /always\s+works/i,
  /guaranteed\s+to\s+work/i,
  /we\s+guarantee/i,
  /guaranteed\s+ROI/i,
  /guaranteed\s+increase/i,
  /never\s+fails/i,
  /guaranteed\s+leads/i,
  /guaranteed\s+enquiries/i,
];

// Local reference terms — at least one must appear on every page
const LOCAL_REFERENCES = [
  'South Cheshire',
  'Nantwich',
  'Crewe',
];


describe('Feature: scram-website-overhaul - Content Compliance Property Tests', () => {
  // --- Property 2: No feature-first headings remain on any page ---

  describe('Property 2: No feature-first headings remain on any page', () => {
    it('no page source contains known feature-first heading patterns', () => {
      // Feature: scram-website-overhaul, Property 2: No feature-first headings remain on any page
      // **Validates: Requirements 2.3, 6.1**

      const pageArb = fc.constantFrom(...pageContents);

      fc.assert(
        fc.property(pageArb, ({ file, content }) => {
          for (const pattern of FEATURE_FIRST_PATTERNS) {
            // Extract all heading content (h1, h2, h3 JSX)
            const headingMatches = content.match(/<h[1-3][^>]*>[\s\S]*?<\/h[1-3]>/g) || [];
            const headingText = headingMatches.join(' ');

            const match = headingText.match(pattern);
            expect(
              match,
              `Feature-first heading "${pattern}" found in ${file}`
            ).toBeNull();
          }
        }),
        { numRuns: 100 }
      );
    });

    it('page headings use problem-led or outcome-led language', () => {
      // Feature: scram-website-overhaul, Property 2: No feature-first headings remain on any page
      // **Validates: Requirements 2.3, 6.1, 20.1, 20.2**

      const pageArb = fc.constantFrom(...pageContents);

      fc.assert(
        fc.property(pageArb, ({ file, content }) => {
          // Extract h1 heading content from JSX
          const h1Matches = content.match(/<h1[^>]*>([\s\S]*?)<\/h1>/g) || [];

          for (const h1 of h1Matches) {
            // Strip JSX tags to get text
            const text = h1.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
            if (!text) continue;

            // H1 should be problem-led (question, pain point, or outcome)
            const isProblemLed =
              text.includes('?') ||
              /not\s+(getting|sure)/i.test(text) ||
              /struggling/i.test(text) ||
              /tired/i.test(text) ||
              /slow/i.test(text) ||
              /costing/i.test(text) ||
              /losing/i.test(text) ||
              /fix/i.test(text) ||
              /enquir/i.test(text) ||
              /cost/i.test(text);

            expect(
              isProblemLed,
              `H1 in ${file} is not problem-led: "${text}"`
            ).toBe(true);
          }
        }),
        { numRuns: 100 }
      );
    });
  });

  // --- Property 7: Every page contains at least one specific local reference ---

  describe('Property 7: Every page contains at least one specific local reference', () => {
    it('every page source contains at least one of South Cheshire, Nantwich, or Crewe', () => {
      // Feature: scram-website-overhaul, Property 7: Every page contains at least one specific local reference
      // **Validates: Requirements 7.1**

      const pageArb = fc.constantFrom(...pageContents);

      fc.assert(
        fc.property(pageArb, ({ file, content }) => {
          const hasLocalRef = LOCAL_REFERENCES.some((ref) => content.includes(ref));
          expect(
            hasLocalRef,
            `No local reference (South Cheshire/Nantwich/Crewe) found in ${file}`
          ).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('every page contains Nantwich as a specific town reference', () => {
      // Feature: scram-website-overhaul, Property 7: Every page contains at least one specific local reference
      // **Validates: Requirements 7.1**

      const pageArb = fc.constantFrom(...pageContents);

      fc.assert(
        fc.property(pageArb, ({ file, content }) => {
          expect(
            content.includes('Nantwich'),
            `No Nantwich reference found in ${file}`
          ).toBe(true);
        }),
        { numRuns: 100 }
      );
    });
  });

  // --- Property 9: No absolute guarantee language on any page ---

  describe('Property 9: No absolute guarantee language on any page', () => {
    it('no page source contains absolute guarantee phrases', () => {
      // Feature: scram-website-overhaul, Property 9: No absolute guarantee language on any page
      // **Validates: Requirements 29.2**

      const pageArb = fc.constantFrom(...pageContents);

      fc.assert(
        fc.property(pageArb, ({ file, content }) => {
          // Extract string literals from JSX (content between > and <, or inside quotes)
          const textContent = content
            .replace(/<[^>]+>/g, ' ')
            .replace(/\{[^}]*\}/g, ' ');

          for (const pattern of ABSOLUTE_GUARANTEE_PATTERNS) {
            const match = textContent.match(pattern);
            expect(
              match,
              `Absolute guarantee language "${pattern}" found in ${file}`
            ).toBeNull();
          }
        }),
        { numRuns: 100 }
      );
    });

    it('case study sections include context disclaimers', () => {
      // Feature: scram-website-overhaul, Property 9: No absolute guarantee language on any page
      // **Validates: Requirements 9.3, 29.1, 29.2**

      // Pages that contain inline case study blocks with ROI/performance figures
      // (not blog post card listings which link to full posts with their own context)
      const pagesWithInlineCaseStudies = pageContents.filter(({ content }) =>
        (content.includes('Context:') || content.includes('micro-proof')) &&
        content.includes('What I tested')
      );

      const pageArb = fc.constantFrom(...pagesWithInlineCaseStudies);

      fc.assert(
        fc.property(pageArb, ({ file, content }) => {
          // If a page has inline case study content, it must include context/disclaimer
          const hasContext =
            content.includes('Context:') ||
            content.includes('Results depend') ||
            content.includes('may differ') ||
            content.includes('will differ') ||
            content.includes('varies by');

          expect(
            hasContext,
            `Case study in ${file} lacks context/disclaimer`
          ).toBe(true);
        }),
        { numRuns: 100 }
      );
    });
  });
});
