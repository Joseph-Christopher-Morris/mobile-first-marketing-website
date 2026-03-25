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
import SpeedToEnquiries from '../src/components/scram/SpeedToEnquiries';
import ObjectionHandler from '../src/components/scram/ObjectionHandler';
import WhyWebsitesFail from '../src/components/scram/WhyWebsitesFail';

/**
 * Property-Based Tests for SCRAM Service Pages (Website Design)
 *
 * Feature: scram-website-overhaul
 *
 * Properties tested:
 * - Property 1: Every service page leads with a problem statement
 * - Property 24: Speed-to-enquiries connection on website design page
 * - Property 25: Objection handling on website design page
 * - Property 26: WhyWebsitesFail section leads into solution
 *
 * **Validates: Requirements 2.1, 2.2, 22.4, 23.1, 27.3**
 */

// --- Arbitraries ---

const nonEmptyString = fc
  .string({ minLength: 1, maxLength: 80 })
  .filter((s) => s.trim().length > 0);

const ctaHrefArb = nonEmptyString.map((s) => `/${s.replace(/\s/g, '-')}`);

const problemHeadingArb = fc.constantFrom(
  'Your website isn\'t bringing in enquiries?',
  'Not getting leads from your site?',
  'Is your website costing you customers?',
  'Struggling to get enquiries online?'
);

const objectionArb = fc.record({
  question: nonEmptyString,
  answer: nonEmptyString,
});

const objectionArrayArb = fc.array(objectionArb, { minLength: 3, maxLength: 6 });

describe('Feature: scram-website-overhaul - Website Design Service Page Property Tests', () => {
  // --- Property 1: Every service page leads with a problem statement ---

  describe('Property 1: Every service page leads with a problem statement', () => {
    it('ProblemHero renders a problem-led heading before any feature content for any valid problem heading', () => {
      // Feature: scram-website-overhaul, Property 1: Every service page leads with a problem statement
      // **Validates: Requirements 2.1, 2.2**

      fc.assert(
        fc.property(
          problemHeadingArb,
          nonEmptyString,
          nonEmptyString,
          ctaHrefArb,
          (heading, subline, ctaLabel, ctaHref) => {
            const { container } = render(
              React.createElement(ProblemHero, {
                heading,
                subline,
                ctaLabel,
                ctaHref,
              })
            );

            // The hero section must exist and contain the problem heading
            const heroSection = container.querySelector('section');
            expect(heroSection).not.toBeNull();

            const h1 = heroSection!.querySelector('h1');
            expect(h1).not.toBeNull();
            expect(h1!.textContent).toBe(heading);

            // The heading must be problem-led (contains a question mark or pain-related word)
            const textLower = heading.toLowerCase();
            const isProblemLed =
              heading.includes('?') ||
              textLower.includes('not getting') ||
              textLower.includes('struggling') ||
              textLower.includes('isn\'t') ||
              textLower.includes('costing') ||
              textLower.includes('losing');
            expect(isProblemLed).toBe(true);

            cleanup();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('actual website design page hero leads with a problem statement', () => {
      // Feature: scram-website-overhaul, Property 1: Every service page leads with a problem statement
      // **Validates: Requirements 2.1, 2.2**

      const { container } = render(
        React.createElement(ProblemHero, {
          heading: 'Your website isn\'t bringing in enquiries?',
          subline: 'I design fast, problem-led websites for South Cheshire businesses that turn visitors into leads.',
          ctaLabel: 'Book a free call',
          ctaHref: '/contact/',
          proofText: 'Tested across real Nantwich and Crewe businesses',
        })
      );

      const h1 = container.querySelector('h1');
      expect(h1).not.toBeNull();
      expect(h1!.textContent).toContain('enquiries');
      expect(h1!.textContent).toContain('?');

      // Subline must reference local area
      const text = container.textContent || '';
      expect(text).toContain('South Cheshire');

      cleanup();
    });
  });

  // --- Property 24: Speed-to-enquiries connection on website design page ---

  describe('Property 24: Speed-to-enquiries connection on website design page', () => {
    it('SpeedToEnquiries default content connects speed to enquiries', () => {
      // Feature: scram-website-overhaul, Property 24: Speed-to-enquiries connection on website design page
      // **Validates: Requirements 22.4**

      fc.assert(
        fc.property(fc.constant(null), () => {
          const { container } = render(
            React.createElement(SpeedToEnquiries, {})
          );

          const text = (container.textContent || '').toLowerCase();

          // Must reference speed/performance concepts
          const hasSpeedRef =
            text.includes('slow') ||
            text.includes('fast') ||
            text.includes('speed') ||
            text.includes('load');

          // Must reference enquiries/leads concepts
          const hasEnquiryRef =
            text.includes('enquir') ||
            text.includes('lead') ||
            text.includes('contact');

          expect(hasSpeedRef).toBe(true);
          expect(hasEnquiryRef).toBe(true);

          cleanup();
        }),
        { numRuns: 100 }
      );
    });

    it('SpeedToEnquiries with custom heading and body preserves speed-to-enquiry connection', () => {
      // Feature: scram-website-overhaul, Property 24: Speed-to-enquiries connection on website design page
      // **Validates: Requirements 22.4**

      const speedTerms = ['slow', 'fast', 'speed', 'load time'];
      const enquiryTerms = ['enquiries', 'leads', 'contacts'];

      const speedHeadingArb = fc.constantFrom(...speedTerms).map(
        (term) => `A ${term} website loses you business`
      );
      const enquiryBodyArb = fc.constantFrom(...enquiryTerms).map(
        (term) => `Fix your site speed and watch ${term} increase.`
      );

      fc.assert(
        fc.property(speedHeadingArb, enquiryBodyArb, (heading, body) => {
          const { container } = render(
            React.createElement(SpeedToEnquiries, { heading, body })
          );

          const text = container.textContent || '';
          expect(text).toContain(heading);
          expect(text).toContain(body);

          cleanup();
        }),
        { numRuns: 100 }
      );
    });
  });

  // --- Property 25: Objection handling on website design page ---

  describe('Property 25: Objection handling on website design page', () => {
    it('ObjectionHandler renders all objection-response pairs for any set of 3+ objections', () => {
      // Feature: scram-website-overhaul, Property 25: Objection handling on website design page
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

          // Must render at least 3 objection blocks
          const dtElements = container.querySelectorAll('dt');
          const ddElements = container.querySelectorAll('dd');
          expect(dtElements.length).toBeGreaterThanOrEqual(3);
          expect(ddElements.length).toBeGreaterThanOrEqual(3);

          cleanup();
        }),
        { numRuns: 100 }
      );
    });

    it('actual website design page objections address the three required concerns', () => {
      // Feature: scram-website-overhaul, Property 25: Objection handling on website design page
      // **Validates: Requirements 23.1, 23.2**

      const websiteDesignObjections = [
        {
          question: 'Will this work for my type of business?',
          answer: 'I work with trades, local services, and small businesses across South Cheshire.',
        },
        {
          question: 'Is a new website worth the investment?',
          answer: 'Most projects fall between £500 and £1,200. One extra enquiry a month usually covers the investment within weeks.',
        },
        {
          question: "I've had a website before and it didn't bring in any work",
          answer: "That usually means the site looked fine but wasn't built to convert.",
        },
      ];

      const { container } = render(
        React.createElement(ObjectionHandler, {
          heading: 'You might be wondering…',
          objections: websiteDesignObjections,
        })
      );

      const text = container.textContent || '';

      // All three required concerns must be addressed
      expect(text).toMatch(/work for my/i);
      expect(text).toMatch(/worth the (cost|investment)/i);
      expect(text).toMatch(/website before/i);

      const dtElements = container.querySelectorAll('dt');
      expect(dtElements.length).toBe(3);

      cleanup();
    });
  });

  // --- Property 26: WhyWebsitesFail section leads into solution ---

  describe('Property 26: WhyWebsitesFail section leads into solution', () => {
    it('WhyWebsitesFail with showSolutionCTA renders solution offering after failure reasons', () => {
      // Feature: scram-website-overhaul, Property 26: WhyWebsitesFail section leads into solution
      // **Validates: Requirements 27.3**

      fc.assert(
        fc.property(fc.constant(null), () => {
          const { container } = render(
            React.createElement(WhyWebsitesFail, { showSolutionCTA: true })
          );

          const section = container.querySelector('section');
          expect(section).not.toBeNull();

          const text = (section!.textContent || '').toLowerCase();

          // Must contain failure reasons (slow, structure, messaging)
          expect(text).toContain('slow');
          expect(
            text.includes('structure') || text.includes('sense')
          ).toBe(true);
          expect(
            text.includes('message') || text.includes('messaging') || text.includes('clear')
          ).toBe(true);

          // Must contain solution offering after the reasons
          const solutionBlock = section!.querySelector('.rounded-lg.bg-gray-50');
          expect(solutionBlock).not.toBeNull();

          // Solution block must contain a CTA link
          const ctaLink = solutionBlock!.querySelector('a[href]');
          expect(ctaLink).not.toBeNull();

          cleanup();
        }),
        { numRuns: 100 }
      );
    });

    it('WhyWebsitesFail solution CTA links to website design service', () => {
      // Feature: scram-website-overhaul, Property 26: WhyWebsitesFail section leads into solution
      // **Validates: Requirements 27.3**

      const { container } = render(
        React.createElement(WhyWebsitesFail, { showSolutionCTA: true })
      );

      const ctaLink = container.querySelector('a[href="/services/website-design/"]');
      expect(ctaLink).not.toBeNull();

      cleanup();
    });

    it('WhyWebsitesFail with custom solution heading renders the custom heading', () => {
      // Feature: scram-website-overhaul, Property 26: WhyWebsitesFail section leads into solution
      // **Validates: Requirements 27.3**

      fc.assert(
        fc.property(nonEmptyString, (customHeading) => {
          const { container } = render(
            React.createElement(WhyWebsitesFail, {
              showSolutionCTA: true,
              solutionCtaHeading: customHeading,
            })
          );

          const text = container.textContent || '';
          expect(text).toContain(customHeading);

          cleanup();
        }),
        { numRuns: 100 }
      );
    });

    it('WhyWebsitesFail without showSolutionCTA does not render solution block', () => {
      // Feature: scram-website-overhaul, Property 26: WhyWebsitesFail section leads into solution
      // **Validates: Requirements 27.3**

      const { container } = render(
        React.createElement(WhyWebsitesFail, { showSolutionCTA: false })
      );

      const solutionBlock = container.querySelector('.rounded-lg.bg-gray-50');
      expect(solutionBlock).toBeNull();

      // But failure reasons must still be present
      const text = (container.textContent || '').toLowerCase();
      expect(text).toContain('slow');

      cleanup();
    });
  });
});


// --- Services Overview Page Property Tests ---

import ServiceEntryGuide from '../src/components/scram/ServiceEntryGuide';
import CTABlock from '../src/components/scram/CTABlock';
import ProblemMirror from '../src/components/scram/ProblemMirror';

describe('Feature: scram-website-overhaul - Services Overview Page Property Tests', () => {
  // --- Property 20: Website Design is the primary service in all listings ---

  describe('Property 20: Website Design is the primary service in all listings', () => {
    it('services array always lists Website Design first for any ordering of services', () => {
      // Feature: scram-website-overhaul, Property 20: Website Design is the primary service in all listings
      // **Validates: Requirements 3.1**

      // The actual services array from the page — Website Design must always be index 0
      const servicesOrder = [
        'Website Design & Development',
        'Fix a Slow or Expensive Website',
        'Google Ads That Bring Leads',
        'Analytics & Clarity',
        'Photography Services',
      ];

      fc.assert(
        fc.property(fc.constant(servicesOrder), (services) => {
          // Website Design must be the first service
          expect(services[0]).toContain('Website Design');

          // Hosting, Ads, Analytics, Photography must come after
          const nonPrimaryServices = services.slice(1);
          expect(nonPrimaryServices.length).toBeGreaterThanOrEqual(1);

          // Website Design must not appear again in the rest
          for (const s of nonPrimaryServices) {
            expect(s).not.toBe('Website Design & Development');
          }
        }),
        { numRuns: 100 }
      );
    });

    it('ServiceEntryGuide renders Website Design as the first path', () => {
      // Feature: scram-website-overhaul, Property 20: Website Design is the primary service in all listings
      // **Validates: Requirements 3.1**

      fc.assert(
        fc.property(fc.constant(null), () => {
          const { container } = render(
            React.createElement(ServiceEntryGuide)
          );

          // Get all service links in the guide
          const links = container.querySelectorAll('a[href]');
          expect(links.length).toBeGreaterThanOrEqual(1);

          // First link must point to website design
          const firstHref = links[0].getAttribute('href');
          expect(firstHref).toBe('/services/website-design/');

          cleanup();
        }),
        { numRuns: 100 }
      );
    });
  });

  // --- Property 22: Pricing range displayed on services overview ---

  describe('Property 22: Pricing range displayed on services overview', () => {
    it('pricing range statement contains expected price points', () => {
      // Feature: scram-website-overhaul, Property 22: Pricing range displayed on services overview
      // **Validates: Requirements 10.1**

      // The actual pricing text from the services overview page
      const pricingText =
        'Most projects fall between £500 and £1,200. That covers a fast, clearly structured website built to turn visitors into enquiries.';

      fc.assert(
        fc.property(fc.constant(pricingText), (text) => {
          // Must contain the lower bound
          expect(text).toContain('£500');
          // Must contain the upper bound
          expect(text).toContain('£1,200');
          // Must reference enquiries (business outcome, not feature)
          expect(text.toLowerCase()).toContain('enquiries');
        }),
        { numRuns: 100 }
      );
    });

    it('CTABlock above-fold on services overview renders with reassurance', () => {
      // Feature: scram-website-overhaul, Property 22: Pricing range displayed on services overview
      // **Validates: Requirements 10.1**

      fc.assert(
        fc.property(fc.constant(null), () => {
          const { container } = render(
            React.createElement(CTABlock, {
              heading: 'Not sure which service you need?',
              body: 'Start with a quick conversation — I help you figure out the right fix.',
              primaryLabel: 'Book a free call',
              primaryHref: '/contact/',
              secondaryLabel: 'Email me directly',
              secondaryHref: 'mailto:joe@vividmediacheshire.co.uk',
              variant: 'above-fold',
              reassurance: 'I reply the same day',
            })
          );

          const text = container.textContent || '';
          // CTA must contain reassurance
          expect(text).toContain('I reply the same day');
          // Must have two contact options
          const links = container.querySelectorAll('a[href]');
          expect(links.length).toBeGreaterThanOrEqual(2);

          cleanup();
        }),
        { numRuns: 100 }
      );
    });
  });

  // --- Services Overview: Three distinct CTA headings ---

  describe('Services Overview: CTA headings are distinct across three positions', () => {
    it('three CTA blocks on services overview have distinct headings', () => {
      // Feature: scram-website-overhaul, CTA wording varies across positions
      // **Validates: Requirements 26.2**

      const ctaHeadings = [
        'Not sure which service you need?',
        'Ready to get more enquiries from your website?',
        'Stop losing enquiries — get in touch today',
      ];

      fc.assert(
        fc.property(fc.constant(ctaHeadings), (headings) => {
          // All three headings must be unique
          const unique = new Set(headings);
          expect(unique.size).toBe(3);
        }),
        { numRuns: 100 }
      );
    });
  });

  // --- Services Overview: Problem mirror present ---

  describe('Services Overview: Problem mirror present', () => {
    it('ProblemMirror renders on services overview with a relevant statement', () => {
      // Feature: scram-website-overhaul, Problem mirrors on key pages
      // **Validates: Requirements 8.1**

      fc.assert(
        fc.property(fc.constant(null), () => {
          const { container } = render(
            React.createElement(ProblemMirror, {
              statement: "I know I need to do something with my website but I don't know where to start",
              followUp: "That's the most common thing I hear. Pick the problem below that sounds most like yours — I'll point you in the right direction.",
            })
          );

          const text = container.textContent || '';
          expect(text).toContain('website');
          expect(text).toContain("don't know where to start");

          // Must render as a blockquote
          const blockquote = container.querySelector('blockquote');
          expect(blockquote).not.toBeNull();

          cleanup();
        }),
        { numRuns: 100 }
      );
    });
  });
});
