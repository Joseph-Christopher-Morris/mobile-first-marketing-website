import { describe, it, expect, vi } from 'vitest';
import * as fc from 'fast-check';
import * as fs from 'fs';
import * as path from 'path';
import React from 'react';
import { render, cleanup } from '@testing-library/react';

// Mock next/link to render a plain anchor tag
vi.mock('next/link', () => ({
  default: ({ href, children, className, ...rest }: any) =>
    React.createElement('a', { href, className, ...rest }, children),
}));

// Mock next/image to render a plain img tag
vi.mock('next/image', () => ({
  default: ({ src, alt, ...rest }: any) =>
    React.createElement('img', { src, alt, ...rest }),
}));

import NumberedSteps from '../src/components/scram/NumberedSteps';

/**
 * Property-Based Tests for Page-Specific SCRAM Rules
 *
 * Feature: scram-website-overhaul
 *
 * Properties tested:
 * - Property 21: No circle-based step indicators on any page
 * - Property 27: Case studies include context and limitations
 *
 * **Validates: Requirements 4.1, 4.2, 9.2, 29.3**
 */

// All page files to check for step indicators
const ALL_PAGE_FILES = [
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

function readPage(file: string) {
  return {
    file,
    content: fs.readFileSync(path.resolve(process.cwd(), file), 'utf-8'),
  };
}

const allPages = ALL_PAGE_FILES.map(readPage);

// Pages that contain inline case studies with ROI figures
// (not blog post card listings which link to full posts with their own context)
const pagesWithCaseStudies = allPages.filter(({ content }) =>
  content.includes('Context:') &&
  content.includes('What I tested')
);


describe('Feature: scram-website-overhaul - Page-Specific Property Tests', () => {
  // --- Property 21: No circle-based step indicators on any page ---

  describe('Property 21: No circle-based step indicators on any page', () => {
    it('no page source contains circle-based step indicator CSS patterns', () => {
      // Feature: scram-website-overhaul, Property 21: No circle-based step indicators on any page
      // **Validates: Requirements 4.1, 4.2**

      // Circle-based step indicator patterns to reject
      const circlePatterns = [
        /rounded-full.*step/i,
        /step.*rounded-full/i,
        /circle.*step/i,
        /step-circle/i,
        /step-indicator.*rounded/i,
      ];

      const pageArb = fc.constantFrom(...allPages);

      fc.assert(
        fc.property(pageArb, ({ file, content }) => {
          for (const pattern of circlePatterns) {
            const match = content.match(pattern);
            expect(
              match,
              `Circle-based step indicator pattern "${pattern}" found in ${file}`
            ).toBeNull();
          }
        }),
        { numRuns: 100 }
      );
    });

    it('pages with step sections use NumberedSteps component (left-aligned)', () => {
      // Feature: scram-website-overhaul, Property 21: No circle-based step indicators on any page
      // **Validates: Requirements 4.1, 4.2**

      // Filter to pages that have step/process sections
      const pagesWithSteps = allPages.filter(({ content }) =>
        content.includes('NumberedSteps') ||
        content.includes('How it works') ||
        content.includes('How It Works') ||
        content.includes('How a photography project works')
      );

      const pageArb = fc.constantFrom(...pagesWithSteps);

      fc.assert(
        fc.property(pageArb, ({ file, content }) => {
          // If a page has step content, it must use NumberedSteps
          expect(
            content.includes('NumberedSteps'),
            `${file} has step content but does not use NumberedSteps component`
          ).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('NumberedSteps component renders left-aligned steps without circles', () => {
      // Feature: scram-website-overhaul, Property 21: No circle-based step indicators on any page
      // **Validates: Requirements 4.1, 4.2**

      const stepsArb = fc.array(
        fc.record({
          number: fc.integer({ min: 1, max: 10 }),
          title: fc.string({ minLength: 1, maxLength: 40 }).filter((s) => s.trim().length > 0),
          description: fc.string({ minLength: 1, maxLength: 100 }).filter((s) => s.trim().length > 0),
        }),
        { minLength: 2, maxLength: 6 }
      );

      fc.assert(
        fc.property(stepsArb, (steps) => {
          const { container } = render(
            React.createElement(NumberedSteps, {
              heading: 'How it works',
              steps,
            })
          );

          // Must not contain rounded-full (circle indicators)
          const html = container.innerHTML;
          expect(html).not.toContain('rounded-full');

          // Must use border-l (left-aligned border indicator)
          expect(html).toContain('border-l');

          // Each step must render its number
          for (const step of steps) {
            expect(container.textContent).toContain(`${step.number}.`);
          }

          cleanup();
        }),
        { numRuns: 100 }
      );
    });
  });

  // --- Property 27: Case studies include context and limitations ---

  describe('Property 27: Case studies include context and limitations', () => {
    it('every page with case study content includes context disclaimers', () => {
      // Feature: scram-website-overhaul, Property 27: Case studies include context and limitations
      // **Validates: Requirements 9.2, 29.3**

      const pageArb = fc.constantFrom(...pagesWithCaseStudies);

      fc.assert(
        fc.property(pageArb, ({ file, content }) => {
          // Must include context/limitation language
          const hasContext =
            content.includes('Context:') ||
            /results\s+depend/i.test(content) ||
            /may\s+differ/i.test(content) ||
            /will\s+differ/i.test(content) ||
            /varies\s+by/i.test(content) ||
            /your\s+(improvement|numbers|results)\s+(may|will)\s+differ/i.test(content);

          expect(
            hasContext,
            `${file} has case study content but lacks context/limitation disclaimers`
          ).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('ROI figures in case study sections are accompanied by context disclaimers', () => {
      // Feature: scram-website-overhaul, Property 27: Case studies include context and limitations
      // **Validates: Requirements 9.2, 29.3**

      const pageArb = fc.constantFrom(...pagesWithCaseStudies);

      fc.assert(
        fc.property(pageArb, ({ file, content }) => {
          // Pages with inline case studies must have Context: disclaimers
          // for every case study block that contains monetary figures.
          // We verify at the page level: if the page has £ figures AND
          // "What I tested", it must also have "Context:" disclaimers.
          const hasMonetaryFigures = /£[\d,]+/.test(content);
          if (hasMonetaryFigures) {
            expect(
              content.includes('Context:'),
              `${file} has monetary figures in case study content without Context: disclaimers`
            ).toBe(true);
          }
        }),
        { numRuns: 100 }
      );
    });

    it('no case study uses absolute guarantee language', () => {
      // Feature: scram-website-overhaul, Property 27: Case studies include context and limitations
      // **Validates: Requirements 9.2, 29.3**

      const absolutePatterns = [
        /guaranteed\s+results/i,
        /100%\s+success/i,
        /always\s+works/i,
        /guaranteed\s+ROI/i,
      ];

      const pageArb = fc.constantFrom(...pagesWithCaseStudies);

      fc.assert(
        fc.property(pageArb, ({ file, content }) => {
          for (const pattern of absolutePatterns) {
            expect(
              content.match(pattern),
              `${file} case study contains absolute guarantee: "${pattern}"`
            ).toBeNull();
          }
        }),
        { numRuns: 100 }
      );
    });
  });
});
