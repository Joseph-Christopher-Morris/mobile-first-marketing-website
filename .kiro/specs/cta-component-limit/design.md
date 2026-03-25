# CTA Component Limit Bugfix Design

## Overview

Every page on the site renders 2–3 standalone `CTABlock` components (above-fold, mid-page, end-of-page) that repeat the same contact ask in different wording. The client requirement is a maximum of one standalone CTA per page. This fix removes the extra `CTABlock` instances from all 11 affected pages, folds any useful messaging from removed CTAs into the single retained one, and updates the existing property tests that currently enforce the old multi-CTA pattern.

## Glossary

- **Bug_Condition (C)**: A page renders more than one standalone `CTABlock` component
- **Property (P)**: Each page renders exactly one standalone `CTABlock` component (the end-of-page variant), with any useful messaging from removed CTAs folded in
- **Preservation**: ProblemHero embedded CTA buttons, inline links, contact details, CTABlock component internals (tap targets, dual actions), CTA constants from `proof-data.ts`, and valid Next.js static export must all remain unchanged
- **CTABlock**: The reusable CTA component in `src/components/scram/CTABlock.tsx` that accepts `variant`, `heading`, `body`, `primaryLabel`, `primaryHref`, `secondaryLabel`, `secondaryHref`, and `reassurance` props
- **STANDARD_CTA / PHOTOGRAPHY_CTA**: Shared CTA constants in `src/lib/proof-data.ts` providing consistent primary/secondary labels and hrefs across pages
- **ProblemHero**: The hero section component with an embedded CTA button — not a standalone CTA and must not be removed

## Bug Details

### Fault Condition

The bug manifests when any page is rendered and the JSX contains more than one `<CTABlock` component instance. The current pattern places CTABlock in up to three positions (above-fold, mid-page, end-of-page) per page, violating the client's one-CTA-per-page requirement.

**Formal Specification:**
```
FUNCTION isBugCondition(page)
  INPUT: page of type PageSource (a .tsx file in src/app/**/page.tsx)
  OUTPUT: boolean

  ctaBlockCount := countOccurrences(page.jsxContent, '<CTABlock')
  RETURN ctaBlockCount > 1
END FUNCTION
```

### Examples

- **Homepage** (`src/app/page.tsx`): Has 2 CTABlock instances (above-fold at Section 2, end-of-page at Section 8). Expected: 1 (end-of-page only).
- **Pricing page** (`src/app/pricing/page.tsx`): Has 3 CTABlock instances including "Know what you need? Tell me." / "Describe your project. I send a clear price the same day." above-fold CTA. Expected: 1 (end-of-page), with the "same day" messaging folded into the retained CTA.
- **Website Design page** (`src/app/services/website-design/page.tsx`): Has 3 CTABlock instances (above-fold, mid-page, end-of-page). Expected: 1 (end-of-page only).
- **Photography page** (`src/app/services/photography/page.tsx`): Has 3 CTABlock instances using `PHOTOGRAPHY_CTA` constants. Expected: 1 (end-of-page only).
- **Contact page** (`src/app/contact/page.tsx`): Has 3 CTABlock instances. Expected: 1 (end-of-page only).

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- ProblemHero component with its embedded CTA button must continue to render on every page that currently uses it
- The single retained CTABlock must continue to offer one primary CTA action and one secondary CTA action
- The retained CTABlock must continue to use shared CTA constants from `src/lib/proof-data.ts` (STANDARD_CTA for most pages, PHOTOGRAPHY_CTA for photography)
- Inline text links and contact details in service cards, proof blocks, and FAQ sections must remain
- CTABlock component internals (min 44×44px tap targets, primary link + secondary email link) must remain unchanged
- The site must continue to produce a valid Next.js static export deployable via S3 + CloudFront
- All proof blocks (SpeedProofBlock, NYCCProofBlock, TheFeedGroupProofBlock, etc.) must remain in their current positions
- Page section ordering (excluding removed CTAs) must remain unchanged

**Scope:**
All inputs that do NOT involve standalone CTABlock component count are completely unaffected by this fix. This includes:
- The CTABlock component implementation itself (`src/components/scram/CTABlock.tsx`)
- The CTA constants in `src/lib/proof-data.ts`
- ProblemHero CTA buttons
- Inline links and contact details throughout page content
- All proof block components and their positioning
- Blog section, FAQ sections, service card grids

## Hypothesized Root Cause

This is a design-level issue rather than a code defect. The root causes are:

1. **Over-application of the SCRAM CTA pattern**: The original SCRAM website overhaul spec (Property 3) required every page to have CTAs in three positions (above-fold, mid-page, end-of-page). This was enforced by property tests in `scram-cta-properties.test.ts`.

2. **Test-enforced multi-CTA pattern**: The cross-cutting property test "Property 3: Every page has CTAs in three positions" in `tests/scram-cta-properties.test.ts` explicitly asserts that all 11 pages contain CTABlock in all three variant positions, preventing removal.

3. **Homepage-specific CTA count assertion**: The test in `tests/scram-proof-conversion-properties.test.ts` (Property 12) asserts `expect(ctaMatches.length).toBe(2)` for the homepage, enforcing exactly 2 CTABlock instances.

4. **CTA wording uniqueness test**: Property 5 in `scram-cta-properties.test.ts` asserts that each page has at least 3 distinct CTABlock headings, which will fail when pages have only 1.

## Correctness Properties

Property 1: Fault Condition - Maximum One Standalone CTA Per Page

_For any_ page source file in `src/app/**/page.tsx` where the bug condition holds (more than one `<CTABlock` instance), the fixed page SHALL contain exactly one `<CTABlock` component instance with `variant="end-of-page"`.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7**

Property 2: Preservation - Non-CTA Page Content Unchanged

_For any_ page where CTABlock instances are removed, the fixed page SHALL continue to contain all non-CTABlock components (ProblemHero, proof blocks, service cards, FAQ sections, blog sections) in their original order, preserving all existing functionality for non-CTA page elements.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6**

Property 3: Preservation - Retained CTA Uses Shared Constants

_For any_ page with a retained CTABlock, the component SHALL continue to reference `STANDARD_CTA` (or `PHOTOGRAPHY_CTA` for the photography page) for its primary and secondary labels and hrefs.

**Validates: Requirements 3.3**

Property 4: Preservation - Property Tests Enforce New Pattern

_For any_ property test file that previously enforced the multi-CTA pattern, the updated tests SHALL validate that each page contains a maximum of 1 standalone CTABlock component.

**Validates: Requirements 2.8, 2.9**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct:

**Pages (11 files)** — Remove extra CTABlock instances, keep end-of-page only:

1. **`src/app/page.tsx`**: Remove the above-fold CTABlock (Section 2). Keep the end-of-page CTABlock (Section 8). Update section numbering comments.

2. **`src/app/services/page.tsx`**: Remove the mid-page CTABlock. Keep the end-of-page CTABlock.

3. **`src/app/services/website-design/page.tsx`**: Remove above-fold and mid-page CTABlocks. Keep end-of-page CTABlock.

4. **`src/app/services/hosting/page.tsx`**: Remove above-fold CTABlock. Keep end-of-page CTABlock.

5. **`src/app/services/ad-campaigns/page.tsx`**: Remove above-fold and mid-page CTABlocks. Keep end-of-page CTABlock.

6. **`src/app/services/analytics/page.tsx`**: Remove above-fold and mid-page CTABlocks. Keep end-of-page CTABlock.

7. **`src/app/services/photography/page.tsx`**: Remove above-fold and mid-page CTABlocks. Keep end-of-page CTABlock.

8. **`src/app/pricing/page.tsx`**: Remove above-fold CTABlock ("Know what you need? Tell me.") and mid-page CTABlock. Keep end-of-page CTABlock. Fold "I send a clear price the same day" messaging into the retained CTA's body or reassurance line.

9. **`src/app/about/page.tsx`**: Remove above-fold and mid-page CTABlocks. Keep end-of-page CTABlock.

10. **`src/app/contact/page.tsx`**: Remove above-fold and mid-page CTABlocks. Keep end-of-page CTABlock.

11. **`src/app/free-audit/page.tsx`**: Remove above-fold and mid-page CTABlocks. Keep end-of-page CTABlock.

**Test files (2 files)** — Update property tests to enforce new single-CTA pattern:

12. **`tests/scram-cta-properties.test.ts`**:
    - Update Property 3 to assert each page has exactly 1 CTABlock with `variant="end-of-page"` (instead of requiring all three positions)
    - Update Property 5 to assert each page has exactly 1 CTABlock heading (instead of requiring 3 distinct headings)

13. **`tests/scram-proof-conversion-properties.test.ts`**:
    - Update Property 12 CTA spacing test to expect exactly 1 CTABlock on the homepage (instead of 2)
    - Remove or update the "separated by non-CTA content" assertion since there is only 1 CTA
    - Update HOMEPAGE_SECTIONS to remove the "Above-fold CTA" entry
    - Update Property 13 to continue checking proof blocks appear before the single end-of-page CTA

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bug on unfixed code, then verify the fix works correctly and preserves existing behavior.

### Exploratory Fault Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm that each page currently has more than 1 CTABlock instance.

**Test Plan**: Write a test that counts `<CTABlock` occurrences in each page source file. Run on UNFIXED code to observe that all pages fail the single-CTA constraint.

**Test Cases**:
1. **Homepage CTA Count**: Count CTABlock instances in `src/app/page.tsx` — expect 2 on unfixed code (will fail single-CTA assertion)
2. **Service Page CTA Count**: Count CTABlock instances in each service page — expect 3 on unfixed code (will fail)
3. **Pricing Page Special CTA**: Verify "Know what you need? Tell me." CTABlock exists on unfixed code (will fail removal assertion)
4. **All Pages Sweep**: Iterate all 11 pages and assert each has >1 CTABlock (confirms bug condition)

**Expected Counterexamples**:
- Every page returns CTABlock count of 2 or 3, violating the max-1 requirement
- The pricing page contains the specific "Know what you need?" standalone CTA that should not exist

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed pages contain exactly 1 CTABlock.

**Pseudocode:**
```
FOR ALL page IN allPageFiles WHERE isBugCondition(page) DO
  fixedSource := readFile(page)
  ctaCount := countOccurrences(fixedSource, '<CTABlock')
  ASSERT ctaCount == 1
  ASSERT fixedSource CONTAINS 'variant="end-of-page"'
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold (non-CTA page elements), the fixed pages produce the same content.

**Pseudocode:**
```
FOR ALL page IN allPageFiles WHERE NOT isBugCondition(page) DO
  ASSERT page CONTAINS '<ProblemHero' (if originally present)
  ASSERT page CONTAINS proof block components (if originally present)
  ASSERT page CONTAINS inline links and contact details (if originally present)
  ASSERT STANDARD_CTA or PHOTOGRAPHY_CTA referenced in retained CTABlock
  ASSERT buildSucceeds()
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain (all 11 pages)
- It catches edge cases like missing proof blocks or broken section ordering
- It provides strong guarantees that non-CTA behavior is unchanged

**Test Plan**: Observe behavior on UNFIXED code first for ProblemHero presence, proof block ordering, and inline links, then write property-based tests capturing that behavior.

**Test Cases**:
1. **ProblemHero Preservation**: Verify ProblemHero with embedded CTA button remains on all pages that currently have it
2. **Proof Block Preservation**: Verify all proof blocks remain in their original positions on each page
3. **CTA Constants Preservation**: Verify the retained CTABlock still references STANDARD_CTA or PHOTOGRAPHY_CTA
4. **Build Preservation**: Verify `npm run build` produces a valid Next.js static export

### Unit Tests

- Test that each of the 11 page files contains exactly 1 CTABlock instance
- Test that the retained CTABlock uses `variant="end-of-page"` on every page
- Test that the pricing page no longer contains "Know what you need? Tell me." as a standalone CTABlock heading
- Test that folded messaging appears in the retained CTA where applicable

### Property-Based Tests

- Generate random page selections from the 11 affected pages and verify each has exactly 1 CTABlock (fix checking)
- Generate random page selections and verify ProblemHero, proof blocks, and inline links are preserved (preservation checking)
- Generate random CTABlock prop combinations and verify the component still renders dual actions with proper tap targets (component preservation)

### Integration Tests

- Verify `npm run build` completes successfully after all CTA removals
- Verify the updated property tests in `scram-cta-properties.test.ts` pass with the new single-CTA pattern
- Verify the updated property tests in `scram-proof-conversion-properties.test.ts` pass with the new homepage structure
