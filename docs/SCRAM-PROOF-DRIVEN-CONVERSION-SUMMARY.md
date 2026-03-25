# SCRAM Proof-Driven Conversion — Summary

**Spec:** `.kiro/specs/scram-proof-driven-conversion/`
**Completed:** 21 March 2026
**Deployed:** S3 + CloudFront (deploy-1774133033122)

## What changed

Transformed the Vivid Media Cheshire site from a generic services layout into a proof-driven enquiry system. Every major page now leads with real project data instead of marketing copy.

### Homepage (10-section proof-driven flow)

- Hero communicates the core problem: "Your website looks fine. But visitors leave without getting in touch."
- Proof blocks in hierarchy order: SpeedProofBlock (14s → <2s), NYCCProofBlock (8 hrs/year saved), TheFeedGroupProofBlock (40 clicks, 3.14% CTR)
- Service cards narrowed from 5 to 2 (website redesign + hosting only)
- StockPhotographyProofBlock placed after final CTA as supporting authority
- Ahrefs micro-proof strip (71 → 91 health score) as lightweight trust signal
- FAQ trimmed to 4 questions (redesign, hosting, speed, enquiry clarity)
- Removed: ProblemMirror, NumberedSteps, ObjectionHandler, AntiAgencyBlock, ServiceEntryGuide, TestimonialsCarousel, pricing teaser, contact form

### Photography page

- AuthorityProofBlock with BBC, Financial Times, CNN, The Times, Business Insider, AutoTrader
- StockPhotographyProofBlock variant="photography" with revenue growth ($2.36 → $1,166.07)
- CTA changed to "Book your photoshoot" + "View portfolio"

### Website design page

- SpeedProofBlock variant="compact" with source attribution
- ThisIsForYouIf component replacing generic "Who this is for"
- TechnicalProofItem with Ahrefs data as supporting proof

### Hosting page

- Full rewrite with outcome-led blocks: "People stop leaving", "Easier to trust", "You don't manage the technical side"
- Clean 3-column process grid replacing FAQ-style "How It Works"
- Canonical route enforced: `/services/website-hosting/`

### Pricing, about, contact, services pages

- All CTAs unified: "Send me your website" + "Email me directly"
- "Call Joe" removed as CTA label everywhere
- Copy tightened, ProblemMirror grounded, duplicate CTAs removed
- TechnicalProofItem added to about page

## New components

| Component | Location |
|-----------|----------|
| SpeedProofBlock | `src/components/scram/SpeedProofBlock.tsx` |
| NYCCProofBlock | `src/components/scram/NYCCProofBlock.tsx` |
| TheFeedGroupProofBlock | `src/components/scram/TheFeedGroupProofBlock.tsx` |
| StockPhotographyProofBlock | `src/components/scram/StockPhotographyProofBlock.tsx` |
| AuthorityProofBlock | `src/components/scram/AuthorityProofBlock.tsx` |
| ThisIsForYouIf | `src/components/scram/ThisIsForYouIf.tsx` |
| TechnicalProofItem | `src/components/scram/TechnicalProofItem.tsx` |

## Shared data

All proof figures and CTA labels live in `src/lib/proof-data.ts`. No component duplicates data internally.

## Test coverage

- 13 correctness properties tested via fast-check (property-based)
- 22 unit tests for homepage scope, hierarchy, and attribution
- All 44 spec tests pass

## Rules enforced

- CTA: "Send me your website" / "Email me directly" on all non-photography pages
- Copy: first person ("I"), no "we", no em dashes, no filler
- Reassurance phrases max once per page
- Proof hierarchy: speed > NYCC > THEFEEDGROUP > publication > stock
- Flyer ROI data restricted to ad-campaigns context only
- THEFEEDGROUP uses one approved figure set (no rounded alternates)
- Ahrefs is support proof only, never main homepage proof
