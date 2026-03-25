import { describe, it, expect, vi } from 'vitest';
import * as fc from 'fast-check';
import React from 'react';
import { render, cleanup } from '@testing-library/react';

// Mock next/link to render a plain anchor tag
vi.mock('next/link', () => ({
  default: ({ href, children, className, ...rest }: any) =>
    React.createElement('a', { href, className, ...rest }, children),
}));

import CTABlock from '../src/components/scram/CTABlock';

/**
 * Property-Based Tests for SCRAM CTA Components
 *
 * Feature: scram-website-overhaul
 *
 * These property tests verify correctness properties of the CTABlock component
 * across all valid inputs using fast-check.
 *
 * Properties tested:
 * - Property 4: Every CTA offers at least two contact options including email
 * - Property 6: All CTA buttons meet minimum tap target size
 */

// Arbitraries for CTABlock props
const nonEmptyString = fc.string({ minLength: 1, maxLength: 80 }).filter(s => s.trim().length > 0);

const variantArb = fc.constantFrom<'above-fold' | 'mid-page' | 'end-of-page'>(
  'above-fold',
  'mid-page',
  'end-of-page'
);

const emailHrefArb = nonEmptyString.map(s => `mailto:${s.replace(/\s/g, '')}@example.com`);

const ctaBlockPropsArb = fc.record({
  heading: nonEmptyString,
  body: fc.option(nonEmptyString, { nil: undefined }),
  primaryLabel: nonEmptyString,
  primaryHref: nonEmptyString.map(s => `/${s.replace(/\s/g, '-')}`),
  secondaryLabel: nonEmptyString,
  secondaryHref: emailHrefArb,
  variant: variantArb,
  reassurance: fc.option(nonEmptyString, { nil: undefined }),
});

describe('Feature: scram-website-overhaul - CTA Component Property Tests', () => {
  describe('Property 4: Every CTA offers at least two contact options including email', () => {
    it('CTABlock always renders at least two contact options, one being email', () => {
      // Feature: scram-website-overhaul, Property 4: Every CTA offers at least two contact options including email
      // **Validates: Requirements 5.2, 12.1, 12.2**

      fc.assert(
        fc.property(ctaBlockPropsArb, (props) => {
          const { container } = render(React.createElement(CTABlock, props));

          // Collect all clickable CTA elements (links and buttons)
          const links = container.querySelectorAll('a[href]');
          const buttons = container.querySelectorAll('button');
          const totalContactOptions = links.length + buttons.length;

          // Property: at least two contact options
          expect(totalContactOptions).toBeGreaterThanOrEqual(2);

          // Property: at least one option is an email (mailto:) link
          const allHrefs = Array.from(links).map(link => link.getAttribute('href') || '');
          const hasEmailOption = allHrefs.some(href => href.startsWith('mailto:'));
          expect(hasEmailOption).toBe(true);

          cleanup();
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 6: All CTA buttons meet minimum tap target size', () => {
    it('all CTA links/buttons have min-w-[44px] and min-h-[44px] classes', () => {
      // Feature: scram-website-overhaul, Property 6: All CTA buttons meet minimum tap target size
      // **Validates: Requirements 26.3, 30.2**

      fc.assert(
        fc.property(ctaBlockPropsArb, (props) => {
          const { container } = render(React.createElement(CTABlock, props));

          // Get all CTA action elements (the primary and secondary links/buttons)
          const ctaElements = container.querySelectorAll(
            'a.inline-flex, button.inline-flex'
          );

          // There should be at least 2 CTA elements (primary + secondary)
          expect(ctaElements.length).toBeGreaterThanOrEqual(2);

          // Property: every CTA element has minimum tap target classes
          ctaElements.forEach((el) => {
            const classes = el.className;
            expect(classes).toContain('min-w-[44px]');
            expect(classes).toContain('min-h-[44px]');
          });

          cleanup();
        }),
        { numRuns: 100 }
      );
    });
  });
});


// --- Cross-Cutting CTA Property Tests (Updated for CTA Simplification) ---

import * as fs from 'fs';
import * as path from 'path';

/**
 * Cross-Cutting Property Tests for CTA System Across All Pages
 *
 * Feature: cta-simplification
 *
 * Properties tested:
 * - Property 3: Every page has at most 1 CTABlock (0 for contact), and it is the final standalone CTA
 * - Property 5: Retained CTABlock uses correct CTA pair — STANDARD_CTA or PHOTOGRAPHY_CTA
 *
 * **Validates: Requirements 7.1, 7.2, 7.4**
 */

// CTA label constants (must match src/lib/proof-data.ts)
const STANDARD_CTA_LABELS = {
  primaryLabel: 'Send me your website',
  secondaryLabel: 'Email me directly',
};

const PHOTOGRAPHY_CTA_LABELS = {
  primaryLabel: 'Book your photoshoot',
  secondaryLabel: 'View portfolio',
};

// All pages subject to the single-CTA rule
const CTA_PAGE_FILES = [
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

const ctaPageContents = CTA_PAGE_FILES.map((file) => ({
  file,
  content: fs.readFileSync(path.resolve(process.cwd(), file), 'utf-8'),
}));

describe('Feature: cta-simplification - Cross-Cutting CTA Property Tests', () => {
  // --- Property 3: Every page has at most 1 CTABlock, and it is the final standalone CTA ---

  describe('Property 3: Every page has at most one standalone CTABlock', () => {
    it('each page has exactly 1 CTABlock (or 0 for contact), positioned as the final standalone CTA', () => {
      // Feature: cta-simplification, Property 3: Single CTA per page
      // **Validates: Requirements 7.1, 7.2**

      const pageArb = fc.constantFrom(...ctaPageContents);

      fc.assert(
        fc.property(pageArb, ({ file, content }) => {
          const ctaMatches = [...content.matchAll(/<CTABlock/g)];
          const isContactPage = file.includes('contact/page.tsx');

          if (isContactPage) {
            // Contact page: 0 CTABlocks is valid (form is the primary action)
            expect(
              ctaMatches.length,
              `${file} should have 0 or 1 CTABlock, found ${ctaMatches.length}`
            ).toBeLessThanOrEqual(1);
          } else {
            // All other pages: exactly 1 CTABlock
            expect(
              ctaMatches.length,
              `${file} should have exactly 1 CTABlock, found ${ctaMatches.length}`
            ).toBe(1);
          }

          // If a CTABlock exists, verify it is the final standalone CTA in page order
          if (ctaMatches.length === 1) {
            const ctaIndex = ctaMatches[0].index!;
            const contentAfterCta = content.slice(ctaIndex + '<CTABlock'.length);
            // No further CTABlock should appear after this one
            expect(
              contentAfterCta.includes('<CTABlock'),
              `${file} has CTABlock content after the retained CTA — it must be the final standalone CTA`
            ).toBe(false);
          }
        }),
        { numRuns: 100 }
      );
    });
  });

  // --- Property 5: Retained CTABlock uses the correct CTA pair ---

  describe('Property 5: Retained CTABlock uses correct CTA pair labels', () => {
    it('non-photography pages use STANDARD_CTA labels, photography uses PHOTOGRAPHY_CTA labels', () => {
      // Feature: cta-simplification, Property 5: CTA pair label validation
      // **Validates: Requirements 7.2, 7.4**

      // Only test pages that have a CTABlock (exclude contact if it has 0)
      const pagesWithCta = ctaPageContents.filter(({ content }) =>
        content.includes('<CTABlock')
      );

      const pageArb = fc.constantFrom(...pagesWithCta);

      fc.assert(
        fc.property(pageArb, ({ file, content }) => {
          const isPhotography = file.includes('photography/page.tsx');

          const expectedLabels = isPhotography
            ? PHOTOGRAPHY_CTA_LABELS
            : STANDARD_CTA_LABELS;

          // Validate primaryLabel — check both constant reference and inline string
          const hasPrimaryLabel =
            content.includes(`primaryLabel={${isPhotography ? 'PHOTOGRAPHY_CTA' : 'STANDARD_CTA'}.primaryLabel}`) ||
            content.includes(`primaryLabel="${expectedLabels.primaryLabel}"`);

          expect(
            hasPrimaryLabel,
            `${file} CTABlock must use primaryLabel "${expectedLabels.primaryLabel}"`
          ).toBe(true);

          // Validate secondaryLabel — check both constant reference and inline string
          const hasSecondaryLabel =
            content.includes(`secondaryLabel={${isPhotography ? 'PHOTOGRAPHY_CTA' : 'STANDARD_CTA'}.secondaryLabel}`) ||
            content.includes(`secondaryLabel="${expectedLabels.secondaryLabel}"`);

          expect(
            hasSecondaryLabel,
            `${file} CTABlock must use secondaryLabel "${expectedLabels.secondaryLabel}"`
          ).toBe(true);
        }),
        { numRuns: 100 }
      );
    });
  });
});
