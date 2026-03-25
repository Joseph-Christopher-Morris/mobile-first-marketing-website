# Design Document — CTA Simplification & Page Polish

## Overview

Every page currently renders 2–3 standalone `CTABlock` components that repeat the same contact ask. This feature reduces each page to at most one standalone CTABlock — the final one in page order — using the approved CTA pair for that page. No new components are introduced. The CTABlock component itself is unchanged. The work is purely subtractive (removing JSX) plus two test file updates.

---

## Glossary

- **Page_Simplification_Rule**: At most one standalone CTABlock per page
- **CTA_Overuse_Condition**: A page renders more than one standalone CTABlock
- **Approved_CTA_Pair**: STANDARD_CTA for non-photography pages, PHOTOGRAPHY_CTA for photography
- **CTABlock**: `src/components/scram/CTABlock.tsx` — unchanged by this feature
- **STANDARD_CTA / PHOTOGRAPHY_CTA**: Constants in `src/lib/proof-data.ts` — unchanged
- **ProblemHero**: Hero section with embedded CTA button — not a standalone CTABlock, not touched

---

## Current State

| Page | File | CTABlocks | Variants Present |
|------|------|-----------|-----------------|
| Homepage | `src/app/page.tsx` | 2 | above-fold, end-of-page |
| Services index | `src/app/services/page.tsx` | 2 | mid-page, end-of-page |
| Website Design | `src/app/services/website-design/page.tsx` | 3 | above-fold, mid-page, end-of-page |
| Hosting | `src/app/services/hosting/page.tsx` | 2 | above-fold, end-of-page |
| Ad Campaigns | `src/app/services/ad-campaigns/page.tsx` | 3 | above-fold, mid-page, end-of-page |
| Analytics | `src/app/services/analytics/page.tsx` | 3 | above-fold, mid-page, end-of-page |
| Photography | `src/app/services/photography/page.tsx` | 3 | above-fold, mid-page, end-of-page |
| Pricing | `src/app/pricing/page.tsx` | 3 | above-fold, mid-page, end-of-page |
| About | `src/app/about/page.tsx` | 3 | above-fold, mid-page, end-of-page |
| Contact | `src/app/contact/page.tsx` | 3 | above-fold, mid-page, end-of-page |
| Free Audit | `src/app/free-audit/page.tsx` | 3 | above-fold, mid-page, end-of-page |

**Total CTABlocks to remove: ~18 instances across 11 pages.**

---

## Target State

Every page retains at most one standalone CTABlock — the final one in page order — using the approved CTA pair. All other CTABlock instances are deleted from the JSX.

| Page | Retained CTABlock | CTA Pair | Special Handling |
|------|-------------------|----------|-----------------|
| Homepage | end-of-page (Section 8) | STANDARD_CTA | Review hero wording for duplication |
| Services index | end-of-page | STANDARD_CTA | Review hero wording for duplication |
| Website Design | end-of-page | STANDARD_CTA | Review hero wording for duplication |
| Hosting | end-of-page | STANDARD_CTA | — |
| Ad Campaigns | end-of-page | STANDARD_CTA | — |
| Analytics | end-of-page | STANDARD_CTA | — |
| Photography | end-of-page | PHOTOGRAPHY_CTA | — |
| Pricing | end-of-page | STANDARD_CTA | Fold "same day" messaging into retained CTA body |
| About | end-of-page | STANDARD_CTA | — |
| Contact | ≤1 (contextual) | STANDARD_CTA | If form serves as primary action, CTABlock may be removed |
| Free Audit | end-of-page | STANDARD_CTA | — |

---

## Scope

### In Scope

- Delete above-fold and mid-page CTABlock JSX from 11 page files
- Update section comments/numbering where CTAs are removed
- Fold pricing "same day" messaging into retained CTA body or nearby sentence
- Review hero CTA wording on homepage, services index, website-design for duplication
- Contact page: contextual decision on whether to keep or remove the final CTABlock
- Update `tests/scram-cta-properties.test.ts` to enforce single-CTA pattern with label validation
- Update `tests/scram-proof-conversion-properties.test.ts` to expect 1 CTABlock on homepage

### Out of Scope

- CTABlock component implementation (`src/components/scram/CTABlock.tsx`) — no changes
- CTA constants in `src/lib/proof-data.ts` — no changes
- ProblemHero component or its embedded CTA button — not touched
- Proof block components — not touched
- Any new components or new files (purely subtractive work)

---

## Changes Required

### Page Files (11 files)

Each page file requires deletion of above-fold and/or mid-page CTABlock JSX blocks. The retained end-of-page CTABlock must use the approved CTA pair constants.

**Standard pattern** (9 pages): Delete non-final CTABlock JSX blocks, update section comments.

**Pricing page** (`src/app/pricing/page.tsx`): Delete above-fold CTABlock ("Know what you need? Tell me." / "Describe your project. I send a clear price the same day.") and mid-page CTABlock. Fold "I send a clear price the same day" into the retained end-of-page CTA body or a short supporting sentence nearby. Do not create a second CTABlock.

**Contact page** (`src/app/contact/page.tsx`): Delete above-fold and mid-page CTABlocks. Evaluate whether the contact form already serves as the primary action. If so, the end-of-page CTABlock may also be removed. At most one CTABlock shall remain.

**Homepage, Services index, Website Design**: After removing excess CTABlocks, review whether the ProblemHero CTA button wording duplicates the retained standalone CTABlock too closely. Adjust hero wording if needed to reduce repeated CTA pressure while keeping quick access to the action.

### Test Files (2 files)

**`tests/scram-cta-properties.test.ts`**:
- Property 3 ("Every page has CTAs in three positions"): Replace with assertion that each page has exactly 1 CTABlock, and it is the final standalone CTA in page order
- Property 5 ("CTA wording varies across positions"): Replace with assertion that the retained CTABlock uses the correct CTA pair (STANDARD_CTA for non-photography, PHOTOGRAPHY_CTA for photography) — count-based assertions alone are not sufficient, must validate labels
- Update `CTA_PAGE_FILES` array if needed

**`tests/scram-proof-conversion-properties.test.ts`**:
- Property 12 ("CTA spacing"): Update `expect(ctaMatches.length).toBe(2)` to `expect(ctaMatches.length).toBe(1)`. Remove the "separated by non-CTA content" assertion (only 1 CTA, no spacing check needed)
- `HOMEPAGE_SECTIONS` array: Remove the `{ name: 'Above-fold CTA', type: 'cta', marker: '/* Section 2: Above-fold CTA */' }` entry
- Property 13 ("At least one proof element before final CTA"): Should continue to work — verify proof blocks appear before the single end-of-page CTA

---

## Correctness Properties

### Property 1: Page Simplification Rule

_For any_ page source file in `src/app/**/page.tsx`:
- The page SHALL contain at most one `<CTABlock` component instance
- IF a CTABlock exists, it SHALL be the final standalone CTA component in page order
- The retained CTABlock SHALL use the Approved_CTA_Pair for that page

```
FUNCTION satisfiesSimplificationRule(page)
  INPUT: page of type PageSource
  OUTPUT: boolean

  ctaBlockCount := countOccurrences(page.jsxContent, '<CTABlock')
  IF ctaBlockCount > 1 THEN RETURN false

  IF ctaBlockCount == 1 THEN
    IF page is photography THEN
      RETURN page references PHOTOGRAPHY_CTA
    ELSE
      RETURN page references STANDARD_CTA
    END IF
  END IF

  RETURN true  // 0 CTABlocks is valid (contact page case)
END FUNCTION
```

**Validates: Requirements 1.1–1.5, 2.1–2.7, 3.1–3.3**

### Property 2: Preservation — Non-CTA Content Unchanged

_For any_ page where CTABlock instances are removed:
- ProblemHero SHALL remain present on every page that previously used it
- Each Proof_Block SHALL remain present on the intended page and preserve its intended narrative order relative to surrounding content
- Service cards, FAQ sections, blog sections, and inline links SHALL remain present
- Homepage SHALL maintain proof-before-final-CTA ordering
- Homepage SHALL display only redesign and hosting as service cards
- Services page SHALL display all five services

```
FUNCTION preservesContent(page, originalPage)
  INPUT: page (modified), originalPage (before changes)
  OUTPUT: boolean

  IF originalPage contains '<ProblemHero' THEN
    ASSERT page contains '<ProblemHero'

  FOR EACH proofBlock IN [SpeedProofBlock, NYCCProofBlock, TheFeedGroupProofBlock, AuthorityProofBlock, StockPhotographyProofBlock]
    IF originalPage contains proofBlock THEN
      ASSERT page contains proofBlock
      ASSERT narrativeOrder(page, proofBlock) == narrativeOrder(originalPage, proofBlock)

  ASSERT nonCTAContent(page) == nonCTAContent(originalPage)
  RETURN true
END FUNCTION
```

**Validates: Requirements 5.1–5.5**

### Property 3: CTA Pair Validation

_For any_ page with a retained CTABlock:
- Non-photography pages SHALL reference STANDARD_CTA constants
- Photography page SHALL reference PHOTOGRAPHY_CTA constants
- Validation SHALL check label values, not just count

```
FUNCTION usesCorrectCTAPair(page)
  INPUT: page of type PageSource
  OUTPUT: boolean

  IF page is photography THEN
    RETURN page references PHOTOGRAPHY_CTA.primaryLabel AND PHOTOGRAPHY_CTA.secondaryLabel
  ELSE
    RETURN page references STANDARD_CTA.primaryLabel AND STANDARD_CTA.secondaryLabel
  END IF
END FUNCTION
```

**Validates: Requirements 1.3–1.5, 7.2, 7.4**

### Property 4: Test Enforcement

_For any_ property test file that previously enforced the multi-CTA pattern:
- Updated tests SHALL validate ≤1 CTABlock per page
- Updated tests SHALL validate correct CTA pair usage with label validation
- Homepage tests SHALL validate proof-before-CTA ordering

**Validates: Requirements 7.1–7.4**

---

## Guardrails

### Guardrail 4: CTA Isolation

The final CTABlock must feel like a decision point, not part of a cluster.

1. The final CTABlock SHALL be visually separated from preceding content
2. No section directly before the CTA SHALL act as a CTA in disguise or repeat the same instruction

### Guardrail 5: Service Section Breathing Space

Service sections must reset the page visually.

1. Service sections SHALL appear between proof clusters, acting as a narrative pause
2. Service sections SHALL NOT be surrounded only by proof blocks

### Guardrail 6: Photography Page Authority Balance

Authority proof must feel credible, not overwhelming.

1. AuthorityProofBlock SHALL be followed by gallery content or narrative explanation
2. Authority proof SHALL NOT stack directly with another high-weight proof block

### Guardrail 7: Visual Weight Differentiation

Not all sections should look equally important.

1. High-weight sections SHALL use stronger headings and more space
2. Supporting sections SHALL use smaller headings or reduced spacing
3. The page SHALL NOT present 4+ sections with identical visual weight consecutively

### Guardrail 8: Avoid Repetition Patterns

Repeated structures reduce perceived quality.

1. The page SHALL NOT repeat the same structural pattern more than twice consecutively

---

## Testing Strategy

### Phase 1: Baseline Observation (before changes)

Write property-based tests that observe current page state:
- Count CTABlock instances per page (expect >1 on unfixed code — confirms CTA Overuse Condition)
- Record ProblemHero presence, proof block presence and order, service cards, FAQs, inline links
- All preservation tests must PASS on unfixed code

### Phase 2: CTA Removal Validation (after changes)

Re-run the same tests:
- CTABlock count test should now PASS (≤1 per page)
- Preservation tests should still PASS (no regressions)

### Property-Based Tests

Test file: `tests/cta-simplification-properties.test.ts`

- Use `fc.constantFrom` over all 11 page files
- For each page: assert `countOccurrences(source, '<CTABlock') <= 1`
- For each page: assert retained CTABlock is final in page order
- For each page: assert retained CTABlock uses correct CTA pair (label validation)
- For each page: assert ProblemHero, proof blocks, service cards, FAQs preserved

Test file: `tests/cta-simplification-preservation.test.ts`

- Observe baseline on unfixed code first
- Property 2a: ProblemHero present where expected
- Property 2b: Proof blocks present and in narrative order
- Property 2c: Retained CTABlock references correct CTA constants
- Property 2d: Non-CTA content sections remain
- Property 2e: `npm run build` succeeds

### Updated Existing Tests

- `tests/scram-cta-properties.test.ts`: Property 3 → single CTA; Property 5 → label validation
- `tests/scram-proof-conversion-properties.test.ts`: Property 12 → 1 CTABlock; HOMEPAGE_SECTIONS updated

### Checkpoint Validations

- Homepage preserves proof-before-final-CTA ordering
- Homepage displays only redesign and hosting as service cards
- Services page displays all five services
- `npm run build` succeeds
- Full test suite passes

---

## Implementation Order

1. Write CTA Overuse Condition test (expect FAIL on current code — confirms overuse exists)
2. Write preservation tests (expect PASS on current code — captures baseline)
3. Remove excess CTABlocks from all 11 pages, update section comments
4. Handle pricing page messaging fold
5. Handle contact page contextual decision
6. Review hero CTA wording on homepage, services, website-design
7. Update existing property tests to enforce new pattern
8. Re-run all tests — CTA test should now PASS, preservation tests should still PASS
9. Checkpoint: full test suite + build validation


---

## Photography Page Amendment — Asset Loading, Image Mapping & Image Integrity

This section covers photography-specific corrections that must be applied during CTA simplification work on `src/app/services/photography/page.tsx`.

### Amendment 1: Hero Image

The ProblemHero `imageSrc` must use `photography-hero.webp`. Currently correct in source. During CTA removal, do not inadvertently change this. Verify after edits.

### Amendment 2: Publication Proof Images

The AuthorityProofBlock must reference these four image files:
1. `editorial-proof-bbc-forbes-times.webp` — BBC
2. `5eb6fc44-e1a5-460d-8dea-923fd303f59d.webp` — Financial Times
3. `photography-sample-3.webp` — CNN
4. `photography-sample-4.webp` — The Times

All four must remain present after CTA removal. Verify no images are dropped or reordered.

### Amendment 3: Best-Selling Image Layout

`photography-sample-4.webp` is the best-selling portrait Audi image. It must:
- Be the lead image in the stock proof section (StockPhotographyProofBlock or equivalent display)
- Use a portrait-safe container (tall aspect ratio preserved)
- Never be cropped, warped, or stretched

### Amendment 4: Correct Publication Mapping for Portrait Audi Image

`photography-sample-4.webp` is correctly mapped to The Times in the AuthorityProofBlock. Verify this mapping is preserved during edits.

### Amendment 5: Correct Stock Proof Caption Mapping

The caption "Consistent demand from buyers in different industries" belongs to `photography-sample-1.webp` (Singtel Store Sydney image), NOT to `photography-sample-4.webp`. If the StockPhotographyProofBlock or gallery references this caption, ensure it maps to the correct image.

### Amendment 6: Stock Proof Section Content Hierarchy

The stock proof section should lead with the best-selling image (`photography-sample-4.webp`) and present revenue proof and image proof in a connected narrative, not as isolated blocks.

### Amendment 7: Revenue Proof and Image Proof Connection

Revenue proof (licensing income, buyer demand) and image proof (the actual images) should feel connected. The stock proof section should flow from "these images sell" to "here's the evidence."

### Amendment 8: Asset Validation

During implementation, verify that all referenced image files exist in `public/images/services/photography/`. Missing assets must be flagged before deployment.

### Amendment 9: Definition of Done — Photography Page

The photography page task is complete when:
- Hero uses `photography-hero.webp`
- All 4 publication proof images are present and correctly mapped
- `photography-sample-4.webp` uses portrait-safe layout
- Caption mapping is correct (Singtel caption → `photography-sample-1.webp`)
- Stock proof section leads with best-selling image
- No images are cropped, warped, or stretched

### Image Integrity Constraint

All photography page images must:
- Preserve original aspect ratios
- Use `object-contain` (not `object-cover`) where aspect ratio matters
- Use intrinsic sizing or portrait-safe containers for portrait images
- Never be cropped, warped, or stretched to fit a container
