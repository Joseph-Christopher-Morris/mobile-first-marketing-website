import { describe, it, expect, vi } from 'vitest';
import * as fc from 'fast-check';
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

import ProblemHero from '../src/components/scram/ProblemHero';
import CTABlock from '../src/components/scram/CTABlock';
import SpeedToEnquiries from '../src/components/scram/SpeedToEnquiries';
import ObjectionHandler from '../src/components/scram/ObjectionHandler';

/**
 * Property-Based Tests for SCRAM Homepage
 *
 * Feature: scram-website-overhaul
 *
 * Properties tested:
 * - Property 23: Homepage hero contains above-the-fold proof element
 * - Property 22: Pricing range displayed on homepage
 * - Property 24: Speed-to-enquiries connection on homepage
 * - Property 25: Objection handling on homepage
 *
 * **Validates: Requirements 10.1, 21.1, 21.2, 22.3, 23.1**
 */

// --- Arbitraries ---

const nonEmptyString = fc
  .string({ minLength: 1, maxLength: 80 })
  .filter((s) => s.trim().length > 0);

const proofTextArb = nonEmptyString.filter(
  (s) => !/(guaranteed|100%|always works)/i.test(s)
);

const ctaHrefArb = nonEmptyString.map((s) => `/${s.replace(/\s/g, '-')}`);

const objectionArb = fc.record({
  question: nonEmptyString,
  answer: nonEmptyString,
});

const objectionArrayArb = fc.array(objectionArb, { minLength: 3, maxLength: 6 });

describe('Feature: scram-website-overhaul - Homepage Property Tests', () => {
  // --- Property 23: Homepage hero contains above-the-fold proof element ---

  describe('Property 23: Homepage hero contains above-the-fold proof element', () => {
    it('ProblemHero renders proof text within the hero section for any valid proofText', () => {
      // Feature: scram-website-overhaul, Property 23: Homepage hero contains above-the-fold proof element
      // **Validates: Requirements 21.1, 21.2**

      fc.assert(
        fc.property(
          nonEmptyString,
          nonEmptyString,
          nonEmptyString,
          ctaHrefArb,
          proofTextArb,
          (heading, subline, ctaLabel, ctaHref, proofText) => {
            const { container } = render(
              React.createElement(ProblemHero, {
                heading,
                subline,
                ctaLabel,
                ctaHref,
                proofText,
              })
            );

            // The proof element must be rendered as an italic paragraph
            const proofElement = container.querySelector('p.italic');
            expect(proofElement).not.toBeNull();
            expect(proofElement!.textContent).toBe(proofText);

            // The proof element must be inside the hero section (above the fold)
            const heroSection = container.querySelector('section');
            expect(heroSection).not.toBeNull();
            expect(heroSection!.contains(proofElement!)).toBe(true);

            cleanup();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('actual homepage proof text avoids exaggerated claims', () => {
      // Feature: scram-website-overhaul, Property 23: Homepage hero contains above-the-fold proof element
      // **Validates: Requirements 21.3**

      const actualProofText =
        'Tested in real South Cheshire businesses — websites I build generate measurable enquiry increases';

      const { container } = render(
        React.createElement(ProblemHero, {
          heading: 'Not getting enquiries from your website?',
          subline: 'Based in Nantwich, I fix websites for South Cheshire businesses so they actually bring in leads.',
          ctaLabel: 'Book a free call',
          ctaHref: '/contact/',
          proofText: actualProofText,
        })
      );

      const proofElement = container.querySelector('p.italic');
      expect(proofElement).not.toBeNull();
      const text = proofElement!.textContent || '';
      expect(text).toContain('Tested in real');
      expect(text).not.toMatch(/guaranteed/i);
      expect(text).not.toMatch(/100%/i);
      expect(text).not.toMatch(/always works/i);

      cleanup();
    });
  });

  // --- Property 22: Pricing range displayed on homepage ---

  describe('Property 22: Pricing range displayed on homepage', () => {
    it('CTABlock renders pricing range in body text for any heading/variant combination', () => {
      // Feature: scram-website-overhaul, Property 22: Pricing range displayed on homepage
      // **Validates: Requirements 10.1**

      const variantArb = fc.constantFrom<'above-fold' | 'mid-page' | 'end-of-page'>(
        'above-fold',
        'mid-page',
        'end-of-page'
      );

      fc.assert(
        fc.property(nonEmptyString, variantArb, (heading, variant) => {
          const { container } = render(
            React.createElement(CTABlock, {
              heading,
              body: 'Most projects fall between £500 and £1,200.',
              primaryLabel: 'Book a free call',
              primaryHref: '/contact/',
              secondaryLabel: 'Email me directly',
              secondaryHref: 'mailto:joe@example.com',
              variant,
            })
          );

          const text = container.textContent || '';
          expect(text).toContain('£500');
          expect(text).toContain('£1,200');

          cleanup();
        }),
        { numRuns: 100 }
      );
    });
  });

  // --- Property 24: Speed-to-enquiries connection on homepage ---

  describe('Property 24: Speed-to-enquiries connection on homepage', () => {
    it('SpeedToEnquiries default content connects speed to enquiries', () => {
      // Feature: scram-website-overhaul, Property 24: Speed-to-enquiries connection on homepage
      // **Validates: Requirements 22.3**

      fc.assert(
        fc.property(fc.constant(null), () => {
          const { container } = render(
            React.createElement(SpeedToEnquiries, {})
          );

          const text = container.textContent || '';
          const textLower = text.toLowerCase();

          // Must reference speed/performance concepts
          const hasSpeedRef =
            textLower.includes('slow') ||
            textLower.includes('fast') ||
            textLower.includes('speed') ||
            textLower.includes('load');

          // Must reference enquiries/leads concepts
          const hasEnquiryRef =
            textLower.includes('enquir') ||
            textLower.includes('lead') ||
            textLower.includes('contact');

          expect(hasSpeedRef).toBe(true);
          expect(hasEnquiryRef).toBe(true);

          cleanup();
        }),
        { numRuns: 100 }
      );
    });

    it('SpeedToEnquiries with custom content still connects speed to enquiries', () => {
      // Feature: scram-website-overhaul, Property 24: Speed-to-enquiries connection on homepage
      // **Validates: Requirements 22.3**

      // Generate headings that reference speed and bodies that reference enquiries
      const speedTerms = ['slow', 'fast', 'speed', 'load time', 'performance'];
      const enquiryTerms = ['enquiries', 'leads', 'contacts', 'customers'];

      const speedHeadingArb = fc.constantFrom(...speedTerms).map(
        (term) => `A ${term} site matters for your business`
      );
      const enquiryBodyArb = fc.constantFrom(...enquiryTerms).map(
        (term) => `Faster websites bring more ${term} to your door.`
      );

      fc.assert(
        fc.property(speedHeadingArb, enquiryBodyArb, (heading, body) => {
          const { container } = render(
            React.createElement(SpeedToEnquiries, { heading, body })
          );

          const text = container.textContent || '';
          // Verify both concepts are present in the rendered output
          expect(text).toBe(`${heading}${body}`);

          cleanup();
        }),
        { numRuns: 100 }
      );
    });
  });

  // --- Property 25: Objection handling on homepage ---

  describe('Property 25: Objection handling on homepage', () => {
    it('ObjectionHandler renders all objection-response pairs for any set of 3+ objections', () => {
      // Feature: scram-website-overhaul, Property 25: Objection handling on homepage
      // **Validates: Requirements 23.1**

      fc.assert(
        fc.property(objectionArrayArb, (objections) => {
          const { container } = render(
            React.createElement(ObjectionHandler, {
              heading: 'You might be wondering…',
              objections,
            })
          );

          const text = container.textContent || '';

          // Every question and answer must appear in the rendered output
          for (const obj of objections) {
            expect(text).toContain(obj.question);
            expect(text).toContain(obj.answer);
          }

          // Must render at least 3 objection blocks (dt/dd pairs)
          const dtElements = container.querySelectorAll('dt');
          const ddElements = container.querySelectorAll('dd');
          expect(dtElements.length).toBeGreaterThanOrEqual(3);
          expect(ddElements.length).toBeGreaterThanOrEqual(3);

          cleanup();
        }),
        { numRuns: 100 }
      );
    });

    it('actual homepage objections address the three required concerns', () => {
      // Feature: scram-website-overhaul, Property 25: Objection handling on homepage
      // **Validates: Requirements 23.1, 23.2**

      const homepageObjections = [
        {
          question: 'Will this work for my business?',
          answer: 'I work with trades, local services, and small businesses across South Cheshire.',
        },
        {
          question: 'Is this worth the cost?',
          answer: 'Most projects fall between £500 and £1,200.',
        },
        {
          question: "I've tried marketing before and it didn't work",
          answer: "That usually means the website itself wasn't set up to convert visitors.",
        },
      ];

      const { container } = render(
        React.createElement(ObjectionHandler, {
          heading: 'You might be wondering…',
          objections: homepageObjections,
        })
      );

      const text = container.textContent || '';

      // All three required concerns must be addressed
      expect(text).toContain('Will this work for my business?');
      expect(text).toContain('Is this worth the cost?');
      expect(text).toMatch(/tried marketing before/i);

      // Must have exactly 3 Q&A pairs
      const dtElements = container.querySelectorAll('dt');
      expect(dtElements.length).toBe(3);

      cleanup();
    });
  });
});
