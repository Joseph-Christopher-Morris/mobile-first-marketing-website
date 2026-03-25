import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Property-Based Tests for CTA Simplification — Property 2: Preservation
 *
 * Feature: cta-simplification
 *
 * These tests capture the baseline state of non-CTA content across all pages.
 * They MUST PASS on current (unfixed) code — confirming the baseline to preserve.
 *
 * Property 2a: ProblemHero present on every page that currently has it
 * Property 2b: Proof blocks remain present and preserve narrative order
 * Property 2c: Retained CTABlock references correct CTA constants
 * Property 2d: Non-CTA content sections (service cards, FAQ, blog) remain present
 * Property 2e: Homepage maintains proof-before-final-CTA ordering
 * Property 2f: Homepage displays only redesign and hosting as service cards
 * Property 2g: Services page displays all five services
 *
 * **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5**
 */

// All 11 page files
const ALL_PAGE_FILES = [
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

// Observed baseline: pages that currently have ProblemHero
const PAGES_WITH_PROBLEM_HERO = [
  'src/app/page.tsx',
  'src/app/services/page.tsx',
  'src/app/services/website-design/page.tsx',
  'src/app/services/hosting/page.tsx',
  'src/app/services/ad-campaigns/page.tsx',
  'src/app/services/analytics/page.tsx',
  'src/app/services/photography/page.tsx',
  'src/app/about/page.tsx',
] as const;

// Observed baseline: proof blocks per page and their narrative order
const PROOF_BLOCKS_BY_PAGE: Record<string, string[]> = {
  'src/app/page.tsx': [
    'SpeedProofBlock',
    'NYCCProofBlock',
    'TheFeedGroupProofBlock',
    'StockPhotographyProofBlock',
  ],
  'src/app/services/website-design/page.tsx': ['SpeedProofBlock'],
  'src/app/services/hosting/page.tsx': ['SpeedProofBlock'],
  'src/app/services/photography/page.tsx': [
    'AuthorityProofBlock',
    'StockPhotographyProofBlock',
  ],
};

// Read all page sources once
const pageContents = new Map(
  ALL_PAGE_FILES.map((file) => [
    file,
    fs.readFileSync(path.resolve(process.cwd(), file), 'utf-8'),
  ])
);

function getContent(file: string): string {
  return pageContents.get(file) ?? '';
}


describe('Feature: cta-simplification — Property 2: Preservation', () => {
  /**
   * Property 2a: ProblemHero present on every page that currently has it
   * **Validates: Requirements 5.1**
   */
  describe('Property 2a: ProblemHero present on pages that have it', () => {
    it('every page that currently has ProblemHero still contains it', () => {
      const heroPageArb = fc.constantFrom(...PAGES_WITH_PROBLEM_HERO);

      fc.assert(
        fc.property(heroPageArb, (file) => {
          const content = getContent(file);
          expect(
            content,
            `${file} should contain <ProblemHero`
          ).toContain('<ProblemHero');
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 2b: Proof blocks remain present on intended pages
   * and preserve intended narrative order relative to surrounding content
   * **Validates: Requirements 5.2**
   */
  describe('Property 2b: Proof blocks present and in narrative order', () => {
    const pagesWithProof = Object.keys(PROOF_BLOCKS_BY_PAGE);

    it('each proof block is present on its intended page', () => {
      const proofPageArb = fc.constantFrom(...pagesWithProof);

      fc.assert(
        fc.property(proofPageArb, (file) => {
          const content = getContent(file);
          const expectedBlocks = PROOF_BLOCKS_BY_PAGE[file];

          for (const block of expectedBlocks) {
            expect(
              content,
              `${file} should contain <${block}`
            ).toContain(`<${block}`);
          }
        }),
        { numRuns: 100 }
      );
    });

    it('proof blocks appear in the expected narrative order', () => {
      const proofPageArb = fc.constantFrom(...pagesWithProof);

      fc.assert(
        fc.property(proofPageArb, (file) => {
          const content = getContent(file);
          const expectedBlocks = PROOF_BLOCKS_BY_PAGE[file];

          // Verify ordering: each block appears after the previous one
          let lastIndex = -1;
          for (const block of expectedBlocks) {
            const idx = content.indexOf(`<${block}`);
            expect(
              idx,
              `${file}: <${block} not found`
            ).toBeGreaterThan(-1);
            expect(
              idx,
              `${file}: <${block} should appear after previous proof block in narrative order`
            ).toBeGreaterThan(lastIndex);
            lastIndex = idx;
          }
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 2c: Retained CTABlock references correct CTA constants
   * Non-photography pages reference STANDARD_CTA, photography references PHOTOGRAPHY_CTA
   * **Validates: Requirements 5.2**
   */
  describe('Property 2c: Retained end-of-page CTABlock references correct CTA constants', () => {
    it('each page with a CTABlock references the correct CTA constant', () => {
      const pageArb = fc.constantFrom(...ALL_PAGE_FILES);

      fc.assert(
        fc.property(pageArb, (file) => {
          const content = getContent(file);
          const hasCTABlock = content.includes('<CTABlock');
          if (!hasCTABlock) return; // 0 CTABlocks is valid

          const isPhotography = file === PHOTOGRAPHY_PAGE;
          const expectedConstant = isPhotography ? 'PHOTOGRAPHY_CTA' : 'STANDARD_CTA';

          // The page must import and reference the correct CTA constant
          // Check for either constant reference or literal label values
          if (isPhotography) {
            const hasRef =
              content.includes('PHOTOGRAPHY_CTA.primaryLabel') ||
              content.includes('PHOTOGRAPHY_CTA.primaryHref') ||
              content.includes('"Book your photoshoot"') ||
              content.includes("'Book your photoshoot'");
            expect(
              hasRef,
              `${file} should reference ${expectedConstant}`
            ).toBe(true);
          } else {
            const hasRef =
              content.includes('STANDARD_CTA.primaryLabel') ||
              content.includes('STANDARD_CTA.primaryHref') ||
              content.includes('"Send me your website"') ||
              content.includes("'Send me your website'");
            expect(
              hasRef,
              `${file} should reference ${expectedConstant}`
            ).toBe(true);
          }
        }),
        { numRuns: 100 }
      );
    });
  });


  /**
   * Property 2d: Non-CTA content sections remain present
   * Service cards, FAQ sections, blog sections, inline links
   * **Validates: Requirements 5.3**
   */
  describe('Property 2d: Non-CTA content sections remain present', () => {
    // Observed baseline: pages with FAQ sections
    const PAGES_WITH_FAQ: Array<{ file: string; marker: string }> = [
      { file: 'src/app/page.tsx', marker: '<FAQAccordion' },
      { file: 'src/app/services/page.tsx', marker: 'Common questions' },
      { file: 'src/app/services/hosting/page.tsx', marker: 'Common questions about slow websites' },
      { file: 'src/app/services/ad-campaigns/page.tsx', marker: 'Common questions about Google Ads' },
      { file: 'src/app/services/analytics/page.tsx', marker: 'Common questions about analytics' },
      { file: 'src/app/services/photography/page.tsx', marker: 'Common Questions' },
      { file: 'src/app/contact/page.tsx', marker: 'Questions Nantwich and Crewe businesses ask' },
    ];

    it('FAQ sections remain on pages that have them', () => {
      const faqPageArb = fc.constantFrom(...PAGES_WITH_FAQ);

      fc.assert(
        fc.property(faqPageArb, ({ file, marker }) => {
          const content = getContent(file);
          expect(
            content,
            `${file} should contain FAQ section with marker "${marker}"`
          ).toContain(marker);
        }),
        { numRuns: 100 }
      );
    });

    it('homepage blog section remains present', () => {
      const homepage = getContent('src/app/page.tsx');
      expect(homepage).toContain('What I tested and what actually worked');
      expect(homepage).toContain('View All Posts');
      expect(homepage).toContain("href='/blog'");
    });

    it('inline links to services remain on pages that have them', () => {
      // Homepage links to services
      const homepage = getContent('src/app/page.tsx');
      expect(homepage).toContain("href='/services/website-design'");
      expect(homepage).toContain("href='/services/website-hosting'");
      expect(homepage).toContain("href='/services/'");

      // Services page links to individual services (via ServiceCard href props)
      const services = getContent('src/app/services/page.tsx');
      expect(services).toContain('/services/website-design');
      expect(services).toContain('/services/website-hosting');
      expect(services).toContain('/services/ad-campaigns');
      expect(services).toContain('/services/analytics');
      expect(services).toContain('/services/photography');
    });
  });

  /**
   * Property 2e: Homepage maintains proof-before-final-CTA ordering
   * The main proof blocks (Speed, NYCC, TheFeedGroup) appear before the end-of-page CTABlock.
   * StockPhotographyProofBlock uses a "homepage" variant that appears after the final CTA
   * as a supporting proof strip — this is the intended current structure.
   * **Validates: Requirements 5.4**
   */
  describe('Property 2e: Homepage proof-before-final-CTA ordering', () => {
    it('main proof blocks appear before the end-of-page CTABlock', () => {
      const homepage = getContent('src/app/page.tsx');

      // Find the end-of-page CTA by looking for variant="end-of-page"
      const endOfPageCTAIndex = homepage.indexOf('variant="end-of-page"');
      expect(endOfPageCTAIndex, 'Homepage should have an end-of-page CTA').toBeGreaterThan(-1);

      // Main proof blocks that must appear before the end-of-page CTA
      const mainProofBlocks = ['SpeedProofBlock', 'NYCCProofBlock', 'TheFeedGroupProofBlock'];
      for (const block of mainProofBlocks) {
        const blockIndex = homepage.indexOf(`<${block}`);
        expect(
          blockIndex,
          `Homepage: <${block} should exist`
        ).toBeGreaterThan(-1);
        expect(
          blockIndex,
          `Homepage: <${block} should appear before the end-of-page CTA`
        ).toBeLessThan(endOfPageCTAIndex);
      }
    });

    it('StockPhotographyProofBlock homepage variant is present', () => {
      const homepage = getContent('src/app/page.tsx');
      expect(homepage).toContain('<StockPhotographyProofBlock');
      expect(homepage).toContain('variant="homepage"');
    });
  });

  /**
   * Property 2f: Homepage displays only redesign and hosting as service cards
   * **Validates: Requirements 5.4**
   */
  describe('Property 2f: Homepage displays only redesign and hosting service cards', () => {
    it('homepage has website design and hosting service cards', () => {
      const homepage = getContent('src/app/page.tsx');

      // Website Design card
      expect(homepage).toContain('Your website feels like hard work');
      expect(homepage).toContain("href='/services/website-design'");

      // Hosting card
      expect(homepage).toContain('Slow site costing you customers?');
      expect(homepage).toContain("href='/services/website-hosting'");
    });

    it('homepage does not have ad-campaigns, analytics, or photography as service cards', () => {
      const homepage = getContent('src/app/page.tsx');

      // The two-service card grid section should only have 2 cards
      // Check that the grid section doesn't contain links to other services as cards
      const serviceGridSection = homepage.slice(
        homepage.indexOf('Pick the problem that sounds like yours'),
        homepage.indexOf('View all services →')
      );

      // Only redesign and hosting links in the card grid
      expect(serviceGridSection).toContain("href='/services/website-design'");
      expect(serviceGridSection).toContain("href='/services/website-hosting'");
      expect(serviceGridSection).not.toContain("href='/services/ad-campaigns'");
      expect(serviceGridSection).not.toContain("href='/services/analytics'");
      expect(serviceGridSection).not.toContain("href='/services/photography'");
    });
  });

  /**
   * Property 2g: Services page displays all five services
   * **Validates: Requirements 5.5**
   */
  describe('Property 2g: Services page displays all five services', () => {
    it('services page contains all five service cards', () => {
      const services = getContent('src/app/services/page.tsx');

      const expectedServices = [
        'Website Redesign',
        'Slow Website Fixes and Hosting Migration',
        'Google Ads Management',
        'Analytics and Clarity',
        'Photography Services',
      ];

      for (const service of expectedServices) {
        expect(
          services,
          `Services page should contain "${service}"`
        ).toContain(service);
      }
    });

    it('services page links to all five service pages', () => {
      const services = getContent('src/app/services/page.tsx');

      const expectedLinks = [
        '/services/website-design',
        '/services/website-hosting',
        '/services/ad-campaigns',
        '/services/analytics',
        '/services/photography',
      ];

      for (const link of expectedLinks) {
        expect(
          services,
          `Services page should link to "${link}"`
        ).toContain(link);
      }
    });
  });
});
