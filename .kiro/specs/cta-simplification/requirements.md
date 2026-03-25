# Requirements Document — CTA Simplification & Page Polish

## Introduction

The marketing website currently renders 2–3 standalone `CTABlock` components per page (above-fold, mid-page, end-of-page), repeating the same contact ask in different wording.

This creates CTA overuse that:
- dilutes the primary action
- adds visual and cognitive noise
- weakens conversion clarity

The CTA Simplification feature enforces a single clear CTA per page, while preserving:
- proof-driven structure
- page clarity
- conversion intent

No page should feel stripped. Pages should feel **cleaner, more focused, and easier to act on**.

---

## Glossary

- **Page_Simplification_Rule**
    A page SHALL render **at most one standalone CTABlock component**.

- **CTA_Overuse_Condition**
    A page renders more than one standalone CTABlock.

- **CTABlock**
    Standalone CTA component at
    `src/components/scram/CTABlock.tsx`

- **STANDARD_CTA**
  primaryLabel: "Send me your website"
  secondaryLabel: "Email me directly"

- **PHOTOGRAPHY_CTA**
  primaryLabel: "Book your photoshoot"
  secondaryLabel: "View portfolio"

- **ProblemHero**
  Hero section with embedded CTA button (NOT a standalone CTABlock)

- **Proof_Block**
  Any of:
  - SpeedProofBlock
  - NYCCProofBlock
  - TheFeedGroupProofBlock
  - AuthorityProofBlock
  - StockPhotographyProofBlock

- **Approved_CTA_Pair**
  STANDARD_CTA or PHOTOGRAPHY_CTA depending on page

- **Affected_Pages**
  All 11 pages in `src/app/**/page.tsx`

---

# Requirements

---

## Requirement 1: Enforce single CTA per page

### User Story
As a visitor, I want one clear action per page so I know what to do next without confusion.

### Acceptance Criteria

1. A page SHALL render **at most one standalone CTABlock**.
2. IF a CTABlock exists, it SHALL be:
  - the **final standalone CTA component in page order**
3. The retained CTABlock SHALL use the **Approved_CTA_Pair**.
4. Non-photography pages SHALL use `STANDARD_CTA`.
5. Photography page SHALL use `PHOTOGRAPHY_CTA`.

---

## Requirement 2: Remove excess CTAs without breaking flow

### User Story
As a site owner, I want redundant CTAs removed without weakening the page.

### Acceptance Criteria

1. Homepage:
  - SHALL contain exactly 1 CTABlock (end-of-page)
  - SHALL remove above-fold CTABlock

2. Services index:
  - SHALL remove mid-page CTABlock
  - SHALL retain one final CTABlock

3. Service pages:
  - SHALL remove above-fold and mid-page CTABlocks
  - SHALL retain one final CTABlock

4. Pricing page:
  - SHALL remove:
    - "Know what you need? Tell me." CTA
    - mid-page CTABlock
  - SHALL retain one final CTABlock

5. Pricing page messaging:
  - SHALL preserve:
    "I send a clear price the same day"
  - SHALL embed it into:
    - CTA body OR nearby supporting sentence
  - SHALL NOT create a second CTA block

6. About page:
  - SHALL remove above-fold and mid-page CTABlocks
  - SHALL retain one final CTABlock

7. Free audit page:
  - SHALL remove above-fold and mid-page CTABlocks
  - SHALL retain one final CTABlock

---

## Requirement 3: Contact page uses contextual judgement

### User Story
As a visitor, I don't want duplicate CTAs when the form is already the action.

### Acceptance Criteria

1. Contact page SHALL render **at most one CTABlock**.
2. IF the contact form clearly serves as the primary action:
  - CTABlock MAY be removed entirely
3. Contact page SHALL NOT create redundant CTA duplication.

---

## Requirement 4: Prevent CTA wording duplication

### User Story
As a visitor, I don't want repeated pressure with identical wording.

### Acceptance Criteria

1. Homepage hero CTA SHALL NOT closely duplicate final CTABlock wording.
2. Services page hero CTA SHALL NOT closely duplicate final CTABlock wording.
3. Website design page hero CTA SHALL NOT closely duplicate final CTABlock wording.
4. Pages SHALL still provide quick access to the primary action.

---

## Requirement 5: Preserve page structure and proof

### User Story
As a visitor, I want all proof and explanation to remain intact.

### Acceptance Criteria

1. ProblemHero SHALL remain on all pages where it exists.
2. All Proof_Blocks SHALL:
  - remain present
  - preserve intended narrative order
3. Pages SHALL retain:
  - service cards
  - FAQs
  - blog sections
  - inline links
4. Homepage SHALL:
  - maintain proof-before-final-CTA ordering
  - show only redesign + hosting services
5. Services page SHALL:
  - retain all five services

---

## Requirement 6: Preserve CTABlock component behaviour

### User Story
As a visitor, I want the CTA to remain usable and accessible.

### Acceptance Criteria

1. CTABlock SHALL keep:
  - primary + secondary actions
2. CTABlock SHALL maintain accessibility:
  - minimum 44×44px tap targets
3. CTABlock implementation SHALL NOT be modified

---

## Requirement 7: Enforce via property tests

### User Story
As a developer, I want CTA overuse prevented permanently.

### Acceptance Criteria

1. Property tests SHALL enforce:
  - ≤1 CTABlock per page
2. Tests SHALL validate:
  - correct CTA pair usage (STANDARD vs PHOTOGRAPHY)
3. Homepage tests SHALL enforce:
  - exactly 1 CTABlock
  - proof-before-CTA ordering
4. Count-only validation SHALL NOT be sufficient without label validation

---

## Requirement 8: Maintain build and deployment integrity

### User Story
As a developer, I want no deployment issues.

### Acceptance Criteria

1. `npm run build` SHALL succeed
2. Static export SHALL remain valid
3. Deployment via S3 + CloudFront SHALL remain unchanged

---

# Non-Functional Requirements

1. Pages SHALL feel:
  - lighter
  - clearer
  - less repetitive

2. Pages SHALL NOT:
  - feel stripped
  - lose proof
  - lose narrative flow

3. CTA simplification SHALL:
  - increase clarity
  - not reduce trust

---

# Definition of Done

The feature is complete when:

- Every page has **≤1 CTABlock**
- CTA labels are consistent and correct
- No duplicated CTA pressure exists
- Proof structure remains intact
- Pages feel cleaner and more focused
- All tests pass
- Build succeeds
- Deployment works without changes
