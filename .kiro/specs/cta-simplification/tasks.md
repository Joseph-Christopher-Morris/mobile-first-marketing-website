# Implementation Plan: CTA Simplification & Page Polish

## Overview

Reduce every page to at most one standalone CTABlock (the final one in page order) using the approved CTA pair. Work is primarily subtractive — removing excess CTABlock JSX from 11 page files — plus pricing messaging fold, contact page contextual decision, hero CTA wording review, photography page amendments, and test updates. Implementation uses observation-first methodology: write tests that confirm CTA Overuse Condition exists, capture baseline preservation, then apply changes and validate.

## Tasks

- [x] 1. Write CTA Overuse Condition observation test
  - [x] 1.1 Create CTA Overuse Condition property test
    - **Property 1: Page Simplification Rule** — Every page has at most one standalone CTABlock
    - **CRITICAL**: This test MUST FAIL on current code — failure confirms CTA Overuse Condition exists
    - **DO NOT attempt to fix the test or the code when it fails**
    - Test file: `tests/cta-simplification-properties.test.ts`
    - Use `fc.constantFrom` over all 11 page files in `src/app/**/page.tsx`
    - For each page: read source, count `<CTABlock` occurrences, assert `count <= 1`
    - For each page: if CTABlock exists, assert it is the final standalone CTA in page order
    - For each page: validate CTA labels — non-photography pages reference `STANDARD_CTA`, photography references `PHOTOGRAPHY_CTA`
    - **Count-based assertions alone are NOT sufficient** — must validate CTA label constants
    - Run test on current (unfixed) code
    - **EXPECTED OUTCOME**: Test FAILS for all 11 pages (homepage has 2, most service pages have 3, etc.) — confirms CTA Overuse Condition
    - Document counterexamples showing current CTABlock counts per page
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 7.1, 7.2, 7.4_

- [x] 2. Write preservation tests (BEFORE implementing changes)
  - [x] 2.1 Create preservation property tests capturing baseline
    - **Property 2: Preservation** — Non-CTA content and build integrity
    - **IMPORTANT**: Follow observation-first methodology — observe behavior on current code, then write tests
    - Test file: `tests/cta-simplification-preservation.test.ts`
    - **Observe on current code first:**
      - Which pages have `<ProblemHero` — record presence
      - Which pages have proof blocks (SpeedProofBlock, NYCCProofBlock, TheFeedGroupProofBlock, AuthorityProofBlock, StockPhotographyProofBlock) — record presence and narrative order
      - Retained end-of-page CTABlock references correct CTA constants
      - Service cards, FAQ sections, blog sections, inline links present
    - **Write property-based tests:**
      - Property 2a: ProblemHero present on every page that currently has it (use `fc.constantFrom`)
      - Property 2b: Proof blocks remain present on intended pages and preserve intended narrative order relative to surrounding content
      - Property 2c: Retained CTABlock references `STANDARD_CTA` (or `PHOTOGRAPHY_CTA` for photography)
      - Property 2d: Non-CTA content sections (service cards, FAQ, blog) remain present
      - Property 2e: Homepage maintains proof-before-final-CTA ordering
      - Property 2f: Homepage displays only redesign and hosting as service cards
      - Property 2g: Services page displays all five services
    - All preservation tests MUST PASS on current code
    - **EXPECTED OUTCOME**: Tests PASS — confirms baseline behavior to preserve
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 3. Checkpoint — Baseline tests established
  - Ensure CTA Overuse Condition test from task 1 FAILS (confirms overuse exists)
  - Ensure preservation tests from task 2 PASS (confirms baseline captured)
  - Ensure all tests pass, ask the user if questions arise.


- [x] 4. Remove excess CTABlocks from all 11 pages
  - [x] 4.1 Remove above-fold CTABlock from homepage (`src/app/page.tsx`)
    - Remove the above-fold CTABlock (Section 2)
    - Keep the end-of-page CTABlock (Section 8) using `STANDARD_CTA`
    - Update section numbering comments to reflect new structure
    - Verify ProblemHero, proof blocks, WhyWebsitesFail, service cards, blog section unchanged
    - _Requirements: 2.1, 5.1, 5.4_

  - [x] 4.2 Remove mid-page CTABlock from services index (`src/app/services/page.tsx`)
    - Remove the mid-page CTABlock
    - Keep the end-of-page CTABlock using `STANDARD_CTA`
    - Verify ProblemHero, all five service cards unchanged
    - _Requirements: 2.2, 5.1, 5.5_

  - [x] 4.3 Remove above-fold and mid-page CTABlocks from website-design page (`src/app/services/website-design/page.tsx`)
    - Remove above-fold and mid-page CTABlock instances (2 removals)
    - Keep end-of-page CTABlock using `STANDARD_CTA`
    - Update section comments
    - _Requirements: 2.3, 5.1, 5.2_

  - [x] 4.4 Remove above-fold CTABlock from hosting page (`src/app/services/hosting/page.tsx`)
    - Remove above-fold CTABlock
    - Keep end-of-page CTABlock using `STANDARD_CTA`
    - _Requirements: 2.3, 5.1, 5.2_

  - [x] 4.5 Remove above-fold and mid-page CTABlocks from ad-campaigns page (`src/app/services/ad-campaigns/page.tsx`)
    - Remove above-fold and mid-page CTABlock instances (2 removals)
    - Keep end-of-page CTABlock using `STANDARD_CTA`
    - _Requirements: 2.3, 5.1, 5.2_

  - [x] 4.6 Remove above-fold and mid-page CTABlocks from analytics page (`src/app/services/analytics/page.tsx`)
    - Remove above-fold and mid-page CTABlock instances (2 removals)
    - Keep end-of-page CTABlock using `STANDARD_CTA`
    - _Requirements: 2.3, 5.1, 5.2_

  - [x] 4.7 Remove above-fold and mid-page CTABlocks from about page (`src/app/about/page.tsx`)
    - Remove above-fold and mid-page CTABlock instances (2 removals)
    - Keep end-of-page CTABlock using `STANDARD_CTA`
    - _Requirements: 2.6, 5.1_

  - [x] 4.8 Remove above-fold and mid-page CTABlocks from free-audit page (`src/app/free-audit/page.tsx`)
    - Remove above-fold and mid-page CTABlock instances (2 removals)
    - Keep end-of-page CTABlock using `STANDARD_CTA`
    - _Requirements: 2.7, 5.1_

- [x] 5. Handle pricing page messaging fold (`src/app/pricing/page.tsx`)
  - Remove above-fold CTABlock ("Know what you need? Tell me." / "Describe your project. I send a clear price the same day.")
  - Remove mid-page CTABlock
  - Keep end-of-page CTABlock using `STANDARD_CTA`
  - Fold "I send a clear price the same day" messaging into the retained CTA body or a nearby supporting sentence
  - Do NOT create a second CTABlock — messaging must be embedded, not standalone
  - Verify ProblemHero, pricing content, FAQ section unchanged
  - _Requirements: 2.4, 2.5, 5.1, 5.2_

- [x] 6. Handle contact page contextual decision (`src/app/contact/page.tsx`)
  - Remove above-fold and mid-page CTABlocks
  - Evaluate whether the contact form already serves as the primary action
  - If form is the primary action: CTABlock MAY be removed entirely (0 CTABlocks valid)
  - If CTABlock is retained: must use `STANDARD_CTA`
  - At most one CTABlock shall remain
  - Verify contact form, contact details, inline links unchanged
  - _Requirements: 3.1, 3.2, 3.3, 5.1_

- [x] 7. Review hero CTA wording for duplication
  - [x] 7.1 Review homepage hero CTA wording (`src/app/page.tsx`)
    - Check ProblemHero CTA button wording against retained CTABlock wording
    - If wording duplicates too closely, adjust hero wording to reduce repeated CTA pressure
    - Keep quick access to the primary action
    - _Requirements: 4.1, 4.4_

  - [x] 7.2 Review services index hero CTA wording (`src/app/services/page.tsx`)
    - Check ProblemHero CTA button wording against retained CTABlock wording
    - Adjust if duplication detected
    - _Requirements: 4.2, 4.4_

  - [x] 7.3 Review website-design hero CTA wording (`src/app/services/website-design/page.tsx`)
    - Check ProblemHero CTA button wording against retained CTABlock wording
    - Adjust if duplication detected
    - _Requirements: 4.3, 4.4_


- [x] 8. Photography page amendments (`src/app/services/photography/page.tsx`)
  - [x] 8.1 Remove above-fold and mid-page CTABlocks from photography page
    - Remove above-fold and mid-page CTABlock instances (2 removals)
    - Keep end-of-page CTABlock using `PHOTOGRAPHY_CTA` constants
    - _Requirements: 2.3, 1.5_

  - [x] 8.2 Verify hero image uses `photography-hero.webp`
    - Confirm ProblemHero `imageSrc` references `photography-hero.webp`
    - Do not inadvertently change this during CTA removal
    - _Requirements: 5.1 (Photography Amendment 1)_

  - [x] 8.3 Verify publication proof images in AuthorityProofBlock
    - Confirm all 4 publication proof images are present and correctly ordered:
      1. `editorial-proof-bbc-forbes-times.webp` — BBC
      2. `5eb6fc44-e1a5-460d-8dea-923fd303f59d.webp` — Financial Times
      3. `photography-sample-3.webp` — CNN
      4. `photography-sample-4.webp` — The Times
    - Verify no images dropped or reordered during CTA removal
    - _Requirements: 5.2 (Photography Amendment 2)_

  - [x] 8.4 Verify portrait-safe layout for `photography-sample-4.webp`
    - Confirm `photography-sample-4.webp` (best-selling portrait Audi image) is lead image in stock proof section
    - Ensure portrait-safe container (tall aspect ratio preserved)
    - Apply `object-contain` (not `object-cover`) where aspect ratio matters
    - Image must never be cropped, warped, or stretched
    - _Requirements: 5.2 (Photography Amendments 3, Image Integrity Constraint)_

  - [x] 8.5 Verify caption mapping — Singtel caption to correct image
    - Confirm "Consistent demand from buyers in different industries" caption maps to `photography-sample-1.webp` (Singtel Store Sydney), NOT `photography-sample-4.webp`
    - Confirm `photography-sample-4.webp` is correctly mapped to The Times in AuthorityProofBlock
    - _Requirements: 5.2 (Photography Amendments 4, 5)_

  - [x] 8.6 Verify stock proof section hierarchy and narrative flow
    - Stock proof section should lead with best-selling image (`photography-sample-4.webp`)
    - Revenue proof and image proof should feel connected — flow from "these images sell" to "here's the evidence"
    - _Requirements: 5.2 (Photography Amendments 6, 7)_

  - [x] 8.7 Validate photography image assets exist
    - Verify all referenced image files exist in `public/images/services/photography/`
    - Flag any missing assets before proceeding
    - Verify all images use `object-contain` where aspect ratio matters, intrinsic sizing or portrait-safe containers for portrait images
    - _Requirements: 5.2 (Photography Amendments 8, 9, Image Integrity Constraint)_

- [x] 9. Checkpoint — All page changes complete
  - Verify every page has ≤1 CTABlock
  - Verify pricing "same day" messaging is folded, not standalone
  - Verify contact page has ≤1 CTABlock (contextual decision applied)
  - Verify photography page amendments 1–9 satisfied
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Update existing property tests to enforce new single-CTA pattern
  - [x] 10.1 Update `tests/scram-cta-properties.test.ts`
    - Property 3 ("Every page has CTAs in three positions"): Replace with assertion that each page has exactly 1 CTABlock, and it is the final standalone CTA in page order
    - Property 5 ("CTA wording varies across positions"): Replace with assertion that the retained CTABlock uses the correct CTA pair — `STANDARD_CTA` for non-photography, `PHOTOGRAPHY_CTA` for photography
    - **Count-based assertions alone are NOT sufficient** — must validate CTA label constants
    - Update `CTA_PAGE_FILES` array if needed
    - _Requirements: 7.1, 7.2, 7.4_

  - [x] 10.2 Update `tests/scram-proof-conversion-properties.test.ts`
    - Property 12 ("CTA spacing"): Change `expect(ctaMatches.length).toBe(2)` to `expect(ctaMatches.length).toBe(1)`. Remove "separated by non-CTA content" assertion (only 1 CTA, no spacing check needed)
    - `HOMEPAGE_SECTIONS` array: Remove `{ name: 'Above-fold CTA', type: 'cta', marker: '/* Section 2: Above-fold CTA */' }` entry
    - Update section markers/numbering if homepage section comments changed
    - Property 13 ("At least one proof element before final CTA"): Verify proof blocks appear before the single end-of-page CTA — update section references if needed
    - _Requirements: 7.1, 7.3_

- [x] 11. Re-run all tests — validate CTA Overuse Condition resolved
  - [x] 11.1 Verify CTA Overuse Condition test now passes
    - **Property 1: Page Simplification Rule**
    - Re-run the SAME test from task 1.1 (`tests/cta-simplification-properties.test.ts`) — do NOT write a new test
    - **EXPECTED OUTCOME**: Test PASSES — every page now has ≤1 CTABlock with correct labels
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 11.2 Verify preservation tests still pass
    - **Property 2: Preservation**
    - Re-run the SAME tests from task 2.1 (`tests/cta-simplification-preservation.test.ts`) — do NOT write new tests
    - **EXPECTED OUTCOME**: Tests PASS — ProblemHero, proof blocks, service cards, FAQs, narrative order all preserved
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [x] 11.3 Verify updated existing property tests pass
    - Run `tests/scram-cta-properties.test.ts` — should enforce single-CTA with label validation
    - Run `tests/scram-proof-conversion-properties.test.ts` — should expect 1 CTABlock on homepage
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 12. Final checkpoint — Full test suite and build validation
  - Run full test suite: `npx vitest --run`
  - Run `npm run build` — must succeed with valid Next.js static export
  - Verify deployment via S3 + CloudFront remains unchanged (no new files, no config changes)
  - Confirm: every page ≤1 CTABlock, CTA labels correct, no duplicated CTA pressure, proof structure intact, pages feel cleaner
  - Ensure all tests pass, ask the user if questions arise.
  - _Requirements: 8.1, 8.2, 8.3_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate both the Page Simplification Rule (≤1 CTA) and label correctness (STANDARD vs PHOTOGRAPHY)
- Photography page amendments are grouped in task 8 for focused attention
- Implementation order follows design doc: observe → preserve baseline → remove → fold/adjust → test → validate
