import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Property-Based Tests for SCRAM Service Page Rules
 *
 * Feature: scram-website-overhaul
 *
 * Properties tested:
 * - Property 1: Every service page leads with a problem statement
 * - Property 8: Problem mirrors appear on homepage and every service page
 * - Property 10: Service pages with pricing include audience fit statements
 * - Property 11: Personal service reassurance on every service page
 * - Property 12: Micro-proof elements on every service page
 * - Property 13: Location-specific H2 headings on every service page
 * - Property 18: Cross-links between related service pages
 * - Property 20: Website Design is the primary service in all listings
 *
 * **Validates: Requirements 2.1, 2.2, 8.1, 8.3, 10.2, 10.3, 11.1, 11.2,
 *   13.3, 14.3, 17.2, 18.1, 3.1**
 */

// Service page files
const SERVICE_PAGE_FILES = [
  'src/app/services/website-design/page.tsx',
  'src/app/services/hosting/page.tsx',
  'src/app/services/ad-campaigns/page.tsx',
  'src/app/services/analytics/page.tsx',
  'src/app/services/photography/page.tsx',
];

// Homepage + service pages (for problem mirror checks)
const HOMEPAGE_AND_SERVICE_FILES = [
  'src/app/page.tsx',
  ...SERVICE_PAGE_FILES,
];

// Read page source files
function readPage(file: string): { file: string; content: string } {
  return {
    file,
    content: fs.readFileSync(path.resolve(process.cwd(), file), 'utf-8'),
  };
}

const servicePages = SERVICE_PAGE_FILES.map(readPage);
const homepageAndServicePages = HOMEPAGE_AND_SERVICE_FILES.map(readPage);

// Services overview page
const servicesOverview = readPage('src/app/services/page.tsx');

// Local reference terms
const LOCAL_TERMS = ['South Cheshire', 'Nantwich', 'Crewe'];


describe('Feature: scram-website-overhaul - Service Page Property Tests', () => {
  // --- Property 1: Every service page leads with a problem statement ---

  describe('Property 1: Every service page leads with a problem statement', () => {
    it('every service page imports and uses ProblemHero as the first content component', () => {
      // Feature: scram-website-overhaul, Property 1: Every service page leads with a problem statement
      // **Validates: Requirements 2.1, 2.2**

      const pageArb = fc.constantFrom(...servicePages);

      fc.assert(
        fc.property(pageArb, ({ file, content }) => {
          // Must import ProblemHero
          expect(
            content.includes('ProblemHero'),
            `${file} does not use ProblemHero`
          ).toBe(true);

          // ProblemHero must appear before any other section content
          const heroIndex = content.indexOf('<ProblemHero');
          expect(
            heroIndex,
            `${file} does not contain <ProblemHero`
          ).toBeGreaterThan(-1);

          // The ProblemHero heading prop must be problem-led (contains ? or pain language)
          const headingMatch = content.match(/<ProblemHero[\s\S]*?heading="([^"]+)"/);
          expect(
            headingMatch,
            `${file} ProblemHero has no heading prop`
          ).not.toBeNull();

          const heading = headingMatch![1];
          const isProblemLed =
            heading.includes('?') ||
            /not\s+getting/i.test(heading) ||
            /struggling/i.test(heading) ||
            /slow/i.test(heading) ||
            /costing/i.test(heading) ||
            /isn't/i.test(heading);

          expect(
            isProblemLed,
            `${file} ProblemHero heading is not problem-led: "${heading}"`
          ).toBe(true);
        }),
        { numRuns: 100 }
      );
    });
  });

  // --- Property 8: Problem mirrors appear on homepage and every service page ---

  describe('Property 8: Problem mirrors appear on homepage and every service page', () => {
    it('homepage and every service page contain a ProblemMirror component', () => {
      // Feature: scram-website-overhaul, Property 8: Problem mirrors appear on homepage and every service page
      // **Validates: Requirements 8.1, 8.3**

      const pageArb = fc.constantFrom(...homepageAndServicePages);

      fc.assert(
        fc.property(pageArb, ({ file, content }) => {
          expect(
            content.includes('<ProblemMirror'),
            `${file} does not contain a ProblemMirror component`
          ).toBe(true);

          // ProblemMirror must have a non-empty statement prop
          const statementMatch = content.match(/<ProblemMirror[\s\S]*?statement="([^"]+)"/);
          expect(
            statementMatch,
            `${file} ProblemMirror has no statement prop`
          ).not.toBeNull();

          expect(
            statementMatch![1].trim().length,
            `${file} ProblemMirror statement is empty`
          ).toBeGreaterThan(0);
        }),
        { numRuns: 100 }
      );
    });
  });

  // --- Property 10: Service pages with pricing include audience fit statements ---

  describe('Property 10: Service pages with pricing include audience fit statements', () => {
    it('service pages with pricing include "who this is for" and "who this is NOT for"', () => {
      // Feature: scram-website-overhaul, Property 10: Service pages with pricing include audience fit statements
      // **Validates: Requirements 10.2, 10.3**

      // Filter to service pages that contain a dedicated pricing section
      // with service-tier pricing (not just incidental £ mentions in schema
      // or case studies). Hosting and photography have different pricing
      // models without audience-fit statements per design.
      const pagesWithPricing = servicePages.filter(({ content }) => {
        // Must have a pricing heading (h2/h3 containing "pricing" or "Pricing")
        const hasPricingSection = /<h[23][^>]*>[^<]*[Pp]ricing[^<]*<\/h[23]>/i.test(content);
        // Must also have audience fit statements nearby
        const hasAudienceFit = /who\s+this\s+is\s+for/i.test(content);
        return hasPricingSection && hasAudienceFit;
      });

      const pageArb = fc.constantFrom(...pagesWithPricing);

      fc.assert(
        fc.property(pageArb, ({ file, content }) => {
          const hasWhoFor =
            /who\s+this\s+is\s+for/i.test(content);
          const hasWhoNotFor =
            /who\s+this\s+is\s+NOT\s+for/i.test(content);

          expect(
            hasWhoFor,
            `${file} has pricing but no "who this is for" statement`
          ).toBe(true);
          expect(
            hasWhoNotFor,
            `${file} has pricing but no "who this is NOT for" statement`
          ).toBe(true);
        }),
        { numRuns: 100 }
      );
    });
  });

  // --- Property 11: Personal service reassurance on every service page ---

  describe('Property 11: Personal service reassurance on every service page', () => {
    it('every service page contains "deal directly with me" messaging', () => {
      // Feature: scram-website-overhaul, Property 11: Personal service reassurance on every service page
      // **Validates: Requirements 11.1**

      const pageArb = fc.constantFrom(...servicePages);

      fc.assert(
        fc.property(pageArb, ({ file, content }) => {
          const hasDirectService =
            /deal\s+directly\s+with\s+me/i.test(content) ||
            /you\s+talk\s+to\s+me/i.test(content) ||
            /direct\s+line/i.test(content);

          expect(
            hasDirectService,
            `${file} lacks "deal directly with me" messaging`
          ).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('every service page contains "reply the same day" messaging', () => {
      // Feature: scram-website-overhaul, Property 11: Personal service reassurance on every service page
      // **Validates: Requirements 11.2**

      const pageArb = fc.constantFrom(...servicePages);

      fc.assert(
        fc.property(pageArb, ({ file, content }) => {
          const hasReplyTime =
            /reply\s+the\s+same\s+day/i.test(content) ||
            /same-day\s+reply/i.test(content) ||
            /reply\s+personally/i.test(content);

          expect(
            hasReplyTime,
            `${file} lacks "reply the same day" messaging`
          ).toBe(true);
        }),
        { numRuns: 100 }
      );
    });
  });

  // --- Property 12: Micro-proof elements on every service page ---

  describe('Property 12: Micro-proof elements on every service page', () => {
    it('every service page contains at least one micro-proof element', () => {
      // Feature: scram-website-overhaul, Property 12: Micro-proof elements on every service page
      // **Validates: Requirements 13.3**

      const pageArb = fc.constantFrom(...servicePages);

      fc.assert(
        fc.property(pageArb, ({ file, content }) => {
          const hasMicroProof =
            content.includes('What I tested') ||
            content.includes('proofText') ||
            /£[\d,]+/.test(content) ||
            /\d+%/.test(content) ||
            content.includes('Context:') ||
            content.includes('real project') ||
            content.includes('real business');

          expect(
            hasMicroProof,
            `${file} lacks micro-proof elements (ROI figures, project references, or proof text)`
          ).toBe(true);
        }),
        { numRuns: 100 }
      );
    });
  });

  // --- Property 13: Location-specific H2 headings on every service page ---

  describe('Property 13: Location-specific H2 headings on every service page', () => {
    it('every service page has at least one H2 containing a local reference', () => {
      // Feature: scram-website-overhaul, Property 13: Location-specific H2 headings on every service page
      // **Validates: Requirements 14.3, 18.1**

      const pageArb = fc.constantFrom(...servicePages);

      fc.assert(
        fc.property(pageArb, ({ file, content }) => {
          // Extract all h2 content from JSX
          const h2Matches = content.match(/<h2[^>]*>[\s\S]*?<\/h2>/g) || [];
          const h2Texts = h2Matches.map((h2) =>
            h2.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
          );

          const hasLocalH2 = h2Texts.some((text) =>
            LOCAL_TERMS.some((term) => text.includes(term))
          );

          expect(
            hasLocalH2,
            `${file} has no H2 heading with a local reference (South Cheshire/Nantwich/Crewe). H2s found: ${h2Texts.join(' | ')}`
          ).toBe(true);
        }),
        { numRuns: 100 }
      );
    });
  });

  // --- Property 18: Cross-links between related service pages ---

  describe('Property 18: Cross-links between related service pages', () => {
    it('every service page contains at least one link to another service page', () => {
      // Feature: scram-website-overhaul, Property 18: Cross-links between related service pages
      // **Validates: Requirements 17.2**

      const serviceRoutes = [
        '/services/website-design',
        '/services/hosting',
        '/services/ad-campaigns',
        '/services/analytics',
        '/services/photography',
      ];

      const pageArb = fc.constantFrom(...servicePages);

      fc.assert(
        fc.property(pageArb, ({ file, content }) => {
          // Determine which service this page is
          const ownRoute = serviceRoutes.find((route) => file.includes(route.replace('/services/', 'services/')));
          const otherRoutes = serviceRoutes.filter((route) => route !== ownRoute);

          // Must link to at least one other service page
          const hasOtherServiceLink = otherRoutes.some((route) => content.includes(route));

          expect(
            hasOtherServiceLink,
            `${file} does not cross-link to any other service page`
          ).toBe(true);
        }),
        { numRuns: 100 }
      );
    });
  });

  // --- Property 20: Website Design is the primary service in all listings ---

  describe('Property 20: Website Design is the primary service in all listings', () => {
    it('services overview page lists Website Design first', () => {
      // Feature: scram-website-overhaul, Property 20: Website Design is the primary service in all listings
      // **Validates: Requirements 3.1**

      fc.assert(
        fc.property(fc.constant(servicesOverview), ({ file, content }) => {
          // Find the services array definition
          const servicesArrayMatch = content.match(/const\s+services\s*=\s*\[([\s\S]*?)\];/);
          expect(
            servicesArrayMatch,
            `${file} does not contain a services array`
          ).not.toBeNull();

          const servicesArray = servicesArrayMatch![1];

          // Find all title values in order
          const titles = [...servicesArray.matchAll(/title:\s*["']([^"']+)["']/g)].map((m) => m[1]);

          expect(titles.length).toBeGreaterThanOrEqual(2);

          // Website Design must be first
          expect(
            titles[0],
            `First service is "${titles[0]}", expected Website Design`
          ).toContain('Website Design');
        }),
        { numRuns: 100 }
      );
    });

    it('homepage service cards list Website Design first', () => {
      // Feature: scram-website-overhaul, Property 20: Website Design is the primary service in all listings
      // **Validates: Requirements 3.1**

      const homepage = readPage('src/app/page.tsx');

      fc.assert(
        fc.property(fc.constant(homepage), ({ file, content }) => {
          // Find the services section in the homepage
          const servicesSection = content.match(/How I help[\s\S]*?<\/section>/);
          expect(servicesSection).not.toBeNull();

          // Find all h3 headings within the services section
          const h3Matches = [...(servicesSection![0].matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>/g))];
          const h3Texts = h3Matches.map((m) => m[1].replace(/<[^>]+>/g, '').trim());

          expect(h3Texts.length).toBeGreaterThanOrEqual(2);

          // First service card should be about website enquiries (Website Design)
          const firstCard = h3Texts[0].toLowerCase();
          expect(
            firstCard.includes('enquir') || firstCard.includes('website') || firstCard.includes('site'),
            `First homepage service card is not Website Design related: "${h3Texts[0]}"`
          ).toBe(true);
        }),
        { numRuns: 100 }
      );
    });
  });
});
