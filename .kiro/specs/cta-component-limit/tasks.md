# Implementation Plan

- [ ] 1. Write bug condition exploration test
  - **Property 1: Fault Condition** - Maximum One Standalone CTA Per Page
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate every page currently has more than 1 CTABlock
  - **Scoped PBT Approach**: Use `fc.constantFrom` over all 11 page files in `src/app/**/page.tsx`; for each page, count `<CTABlock` occurrences and assert exactly 1 with `variant="end-of-page"`
  - Test file: `tests/cta-component-limit-exploration.test.ts`
  - Read each page source file and count `<CTABlock` occurrences using regex or string matching
  - Assert `ctaBlockCount === 1` for every page (from Fault Condition `isBugCondition`: `countOccurrences(page.jsxContent, '<CTABlock') > 1`)
  - Assert the single retained CTABlock uses `variant="end-of-page"`
  - Assert pricing page does NOT contain standalone "Know what you need? Tell me." CTABlock heading
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS for all 11 pages (homepage shows 2, service pages show 3, etc.) — this proves the bug exists
  - Document counterexamples: e.g. "src/app/page.tsx has 2 CTABlock instances", "src/app/services/website-design/page.tsx has 3 CTABlock instances"
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

- [ ] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Non-CTA Page Content and Build Integrity
  - **IMPORTANT**: Follow observation-first methodology — observe behavior on UNFIXED code first, then write tests
  - Test file: `tests/cta-component-limit-preservation.test.ts`
  - **Observe on unfixed code first:**
    - Observe: every page that has `<ProblemHero` continues to have it (record which pages have ProblemHero)
    - Observe: proof blocks (SpeedProofBlock, NYCCProofBlock, TheFeedGroupProofBlock, AuthorityProofBlock, StockPhotographyProofBlock) are present on their respective pages
    - Observe: retained end-of-page CTABlock references `STANDARD_CTA` or `PHOTOGRAPHY_CTA` constants from `src/lib/proof-data.ts`
    - Observe: inline links, service cards, FAQ sections remain in page content
  - **Write property-based tests capturing observed behavior:**
    - Property 2a: For all 11 pages, ProblemHero component is present if it was present before (use `fc.constantFrom` over page files)
    - Property 2b: For all pages with proof blocks, each proof block component remains in the source at its original relative position
    - Property 2c: For all pages, the retained CTABlock references `STANDARD_CTA` (or `PHOTOGRAPHY_CTA` for photography page) — verify import and usage
    - Property 2d: For all pages, non-CTA content sections (service cards, FAQ, blog) remain present
    - Property 2e: Verify `npm run build` produces a valid Next.js static export (integration check)
  - Verify all preservation tests PASS on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [ ] 3. Remove extra CTABlock instances from all 11 pages

  - [ ] 3.1 Remove above-fold CTABlock from homepage (`src/app/page.tsx`)
    - Remove the above-fold CTABlock at Section 2
    - Keep the end-of-page CTABlock at Section 8
    - Update section numbering comments to reflect new structure
    - _Bug_Condition: isBugCondition(page) where countOccurrences(page, '<CTABlock') > 1_
    - _Expected_Behavior: countOccurrences(fixedPage, '<CTABlock') === 1 AND fixedPage contains variant="end-of-page"_
    - _Preservation: ProblemHero, proof blocks, WhyWebsitesFail, service cards, blog section unchanged_
    - _Requirements: 2.1, 3.1, 3.4_

  - [ ] 3.2 Remove mid-page CTABlock from services index (`src/app/services/page.tsx`)
    - Remove the mid-page CTABlock
    - Keep the end-of-page CTABlock
    - _Bug_Condition: isBugCondition(page) where countOccurrences(page, '<CTABlock') > 1_
    - _Expected_Behavior: countOccurrences(fixedPage, '<CTABlock') === 1_
    - _Preservation: ProblemHero, service cards, all other content unchanged_
    - _Requirements: 2.3, 3.1, 3.4_

  - [ ] 3.3 Remove above-fold and mid-page CTABlocks from website-design page (`src/app/services/website-design/page.tsx`)
    - Remove above-fold and mid-page CTABlock instances
    - Keep end-of-page CTABlock
    - _Bug_Condition: countOccurrences(page, '<CTABlock') === 3_
    - _Expected_Behavior: countOccurrences(fixedPage, '<CTABlock') === 1_
    - _Preservation: ProblemHero, proof blocks, service content unchanged_
    - _Requirements: 2.2, 3.1, 3.3_

  - [ ] 3.4 Remove above-fold CTABlock from hosting page (`src/app/services/hosting/page.tsx`)
    - Remove above-fold CTABlock
    - Keep end-of-page CTABlock
    - _Bug_Condition: countOccurrences(page, '<CTABlock') > 1_
    - _Expected_Behavior: countOccurrences(fixedPage, '<CTABlock') === 1_
    - _Preservation: ProblemHero, proof blocks, hosting content unchanged_
    - _Requirements: 2.2, 3.1, 3.3_

  - [ ] 3.5 Remove above-fold and mid-page CTABlocks from ad-campaigns page (`src/app/services/ad-campaigns/page.tsx`)
    - Remove above-fold and mid-page CTABlock instances
    - Keep end-of-page CTABlock
    - _Bug_Condition: countOccurrences(page, '<CTABlock') === 3_
    - _Expected_Behavior: countOccurrences(fixedPage, '<CTABlock') === 1_
    - _Preservation: ProblemHero, proof blocks, ad-campaigns content unchanged_
    - _Requirements: 2.2, 3.1, 3.3_

  - [ ] 3.6 Remove above-fold and mid-page CTABlocks from analytics page (`src/app/services/analytics/page.tsx`)
    - Remove above-fold and mid-page CTABlock instances
    - Keep end-of-page CTABlock
    - _Bug_Condition: countOccurrences(page, '<CTABlock') === 3_
    - _Expected_Behavior: countOccurrences(fixedPage, '<CTABlock') === 1_
    - _Preservation: ProblemHero, proof blocks, analytics content unchanged_
    - _Requirements: 2.2, 3.1, 3.3_

  - [ ] 3.7 Remove above-fold and mid-page CTABlocks from photography page (`src/app/services/photography/page.tsx`)
    - Remove above-fold and mid-page CTABlock instances
    - Keep end-of-page CTABlock (uses `PHOTOGRAPHY_CTA` constants)
    - _Bug_Condition: countOccurrences(page, '<CTABlock') === 3_
    - _Expected_Behavior: countOccurrences(fixedPage, '<CTABlock') === 1 AND uses PHOTOGRAPHY_CTA_
    - _Preservation: ProblemHero, AuthorityProofBlock, photography content unchanged_
    - _Requirements: 2.2, 3.1, 3.3_

  - [ ] 3.8 Remove extra CTABlocks from pricing page and fold messaging (`src/app/pricing/page.tsx`)
    - Remove above-fold CTABlock ("Know what you need? Tell me." / "Describe your project. I send a clear price the same day.")
    - Remove mid-page CTABlock
    - Keep end-of-page CTABlock
    - Fold "I send a clear price the same day" messaging into the retained CTA's body or reassurance line
    - _Bug_Condition: countOccurrences(page, '<CTABlock') === 3 AND page contains "Know what you need? Tell me." standalone heading_
    - _Expected_Behavior: countOccurrences(fixedPage, '<CTABlock') === 1 AND "same day" messaging folded into retained CTA_
    - _Preservation: ProblemHero, pricing content, FAQ section unchanged_
    - _Requirements: 2.4, 3.1, 3.4_

  - [ ] 3.9 Remove above-fold and mid-page CTABlocks from about page (`src/app/about/page.tsx`)
    - Remove above-fold and mid-page CTABlock instances
    - Keep end-of-page CTABlock
    - _Bug_Condition: countOccurrences(page, '<CTABlock') === 3_
    - _Expected_Behavior: countOccurrences(fixedPage, '<CTABlock') === 1_
    - _Preservation: ProblemHero, about page content unchanged_
    - _Requirements: 2.5, 3.1_

  - [ ] 3.10 Remove above-fold and mid-page CTABlocks from contact page (`src/app/contact/page.tsx`)
    - Remove above-fold and mid-page CTABlock instances
    - Keep end-of-page CTABlock
    - _Bug_Condition: countOccurrences(page, '<CTABlock') > 1_
    - _Expected_Behavior: countOccurrences(fixedPage, '<CTABlock') === 1_
    - _Preservation: ProblemHero, contact form/details, inline links unchanged_
    - _Requirements: 2.6, 3.1, 3.4_

  - [ ] 3.11 Remove above-fold and mid-page CTABlocks from free-audit page (`src/app/free-audit/page.tsx`)
    - Remove above-fold and mid-page CTABlock instances
    - Keep end-of-page CTABlock
    - _Bug_Condition: countOccurrences(page, '<CTABlock') === 3_
    - _Expected_Behavior: countOccurrences(fixedPage, '<CTABlock') === 1_
    - _Preservation: ProblemHero, free-audit content unchanged_
    - _Requirements: 2.7, 3.1_

  - [ ] 3.12 Update property tests to enforce single-CTA pattern (`tests/scram-cta-properties.test.ts`)
    - Update Property 3: Assert each page has exactly 1 CTABlock with `variant="end-of-page"` (instead of requiring above-fold, mid-page, and end-of-page)
    - Update Property 5: Assert each page has exactly 1 CTABlock heading (instead of requiring ≥3 distinct headings)
    - _Expected_Behavior: Property tests validate max 1 CTABlock per page_
    - _Requirements: 2.8_

  - [ ] 3.13 Update homepage property tests (`tests/scram-proof-conversion-properties.test.ts`)
    - Update Property 12 CTA spacing test: expect exactly 1 CTABlock on homepage (change `expect(ctaMatches.length).toBe(2)` to `expect(ctaMatches.length).toBe(1)`)
    - Remove or simplify the "separated by non-CTA content" assertion (only 1 CTA, no spacing check needed)
    - Update `HOMEPAGE_SECTIONS` array: remove the `{ name: 'Above-fold CTA', type: 'cta', marker: '/* Section 2: Above-fold CTA */' }` entry
    - Update section markers/numbering if homepage section comments change
    - Update Property 13: continue checking proof blocks appear before the single end-of-page CTA (should still work, may need section reference updates)
    - _Expected_Behavior: Homepage tests validate 1 CTABlock, proof-before-CTA ordering preserved_
    - _Requirements: 2.9_

  - [ ] 3.14 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Maximum One Standalone CTA Per Page
    - **IMPORTANT**: Re-run the SAME test from task 1 (`tests/cta-component-limit-exploration.test.ts`) - do NOT write a new test
    - The test from task 1 encodes the expected behavior (exactly 1 CTABlock per page)
    - When this test passes, it confirms the expected behavior is satisfied for all 11 pages
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed — every page now has exactly 1 CTABlock)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

  - [ ] 3.15 Verify preservation tests still pass
    - **Property 2: Preservation** - Non-CTA Page Content and Build Integrity
    - **IMPORTANT**: Re-run the SAME tests from task 2 (`tests/cta-component-limit-preservation.test.ts`) - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms ProblemHero, proof blocks, CTA constants, inline links, and build all preserved)
    - Confirm all preservation tests still pass after fix (no regressions)

- [ ] 4. Checkpoint - Ensure all tests pass
  - Run full test suite: `npx vitest --run`
  - Verify exploration test (`tests/cta-component-limit-exploration.test.ts`) passes
  - Verify preservation tests (`tests/cta-component-limit-preservation.test.ts`) pass
  - Verify updated property tests (`tests/scram-cta-properties.test.ts`) pass
  - Verify updated homepage tests (`tests/scram-proof-conversion-properties.test.ts`) pass
  - Verify `npm run build` produces valid Next.js static export
  - Ensure all tests pass, ask the user if questions arise.
