# Implementation Plan: SCRAM Website Overhaul

## Overview

Transform the Vivid Media Cheshire Next.js static site from feature-led to problem-led messaging using the SCRAM methodology. Implementation follows the mandated priority order: Homepage → Website Design → Services Overview → CTA System → Blog CTA → Remaining Service Pages → Metadata. Shared SCRAM components are created first so page rewrites can consume them immediately.

## Tasks

- [x] 1. Create shared SCRAM components
  - [x] 1.1 Create `ProblemHero` component at `src/components/scram/ProblemHero.tsx`
    - Implement the `ProblemHeroProps` interface (heading, subline, ctaLabel, ctaHref, proofText, imageSrc, imageAlt)
    - Render problem-led heading, subline with local reference, CTA button (44x44px min tap target), optional proof element, optional image
    - Mobile-first layout: problem statement + CTA visible without scrolling
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 21.1, 21.2, 30.1, 30.2_

  - [x] 1.2 Create `CTABlock` component at `src/components/scram/CTABlock.tsx`
    - Implement the `CTABlockProps` interface (heading, body, primaryLabel, primaryHref, secondaryLabel, secondaryHref, variant, reassurance)
    - Render heading, body, two contact options (call + email minimum), reassurance line
    - All buttons must have `min-w-[44px] min-h-[44px]` or equivalent for 44x44px tap target
    - Three visual variants: `above-fold`, `mid-page`, `end-of-page` controlling background and spacing
    - _Requirements: 5.1, 5.2, 12.1, 12.2, 12.3, 26.1, 26.3, 30.2_

  - [x] 1.3 Create `ProblemMirror` component at `src/components/scram/ProblemMirror.tsx`
    - Implement the `ProblemMirrorProps` interface (statement, followUp)
    - Render styled quote-like block with left border accent and italic styling
    - Render nothing if statement is empty/missing
    - _Requirements: 8.1, 8.3_

  - [x] 1.4 Create `ObjectionHandler` component at `src/components/scram/ObjectionHandler.tsx`
    - Implement the `ObjectionHandlerProps` interface (heading, objections array of {question, answer})
    - Render objection Q&A pairs in active voice
    - _Requirements: 23.1, 23.2, 23.3, 23.4_

  - [x] 1.5 Create `WhyWebsitesFail` component at `src/components/scram/WhyWebsitesFail.tsx`
    - Implement the `WhyWebsitesFailProps` interface (heading, showSolutionCTA, solutionCtaHeading)
    - Cover slow performance, poor structure, unclear messaging
    - Use real business language, not technical jargon
    - When `showSolutionCTA` is true, lead directly into solution offering
    - _Requirements: 27.1, 27.2, 27.3, 27.4_

  - [x] 1.6 Create `SpeedToEnquiries` component at `src/components/scram/SpeedToEnquiries.tsx`
    - Implement the `SpeedToEnquiriesProps` interface (heading, body)
    - Connect faster load times to increased enquiries as a business outcome
    - _Requirements: 22.1, 22.3, 22.4_

  - [x] 1.7 Create `NumberedSteps` component at `src/components/scram/NumberedSteps.tsx`
    - Implement the `NumberedStepsProps` interface (heading, steps array of {number, title, description})
    - Left-aligned numbered steps, no circle-based UI elements, no centred step indicators
    - _Requirements: 4.1, 4.2_

  - [x] 1.8 Create `BlogPostCTA` component at `src/components/scram/BlogPostCTA.tsx`
    - Implement the `BlogPostCTAProps` interface (problemReminder, solutionStatement)
    - Always render link to `/services/website-design/`
    - Include default constants for problem reminder and solution statement
    - _Requirements: 25.1, 25.2_

  - [x] 1.9 Create `ServiceEntryGuide` component at `src/components/scram/ServiceEntryGuide.tsx`
    - No props — static content mapping visitor problems to services
    - Three paths: "Not getting enquiries?" → Website Design, "Site too slow?" → Hosting, "Ads not working?" → Ad Campaigns
    - _Requirements: 28.1, 28.2, 28.3_

  - [x] 1.10 Create `AntiAgencyBlock` component at `src/components/scram/AntiAgencyBlock.tsx`
    - No props — static content comparing direct service delivery with agency structure
    - Highlight direct communication, no account managers, practical implementation
    - Professional tone, no negative language about agencies
    - _Requirements: 24.1, 24.2, 24.3_


  - [x] 1.11 Write property tests for SCRAM CTA components
    - **Property 4: Every CTA offers at least two contact options including email**
    - **Property 6: All CTA buttons meet minimum tap target size**
    - **Validates: Requirements 5.2, 12.1, 12.2, 26.3, 30.2**
    - Test file: `tests/scram-cta-properties.test.ts`

- [x] 2. Checkpoint — Verify shared components
  - Ensure all SCRAM components build without errors (`npm run build`)
  - Ensure all tests pass (`vitest --run`)
  - Ask the user if questions arise.

- [x] 3. Rewrite Homepage (`src/app/page.tsx`)
  - [x] 3.1 Replace `HeroWithCharts` with `ProblemHero` on homepage
    - Problem-led heading communicating "Not getting enquiries from your website?"
    - Subline referencing Nantwich / South Cheshire
    - `proofText` MUST be provided (above-the-fold proof element, Req 21)
    - CTA within above-the-fold area
    - Mobile-first: problem + proof + CTA in first viewport
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 7.2, 21.1, 21.2, 21.3, 21.4, 30.1_

  - [x] 3.2 Add Homepage SCRAM sections
    - Add `WhyWebsitesFail` section with `showSolutionCTA={true}` (Req 27.1)
    - Add `SpeedToEnquiries` section connecting speed to enquiry outcomes (Req 22.3)
    - Add `NumberedSteps` for "How It Works" replacing circle-based indicators (Req 4.1)
    - Add `ObjectionHandler` with three objection-response pairs (Req 23.1, 23.2)
    - Add `ServiceEntryGuide` "Start here" guidance section (Req 28)
    - Add `AntiAgencyBlock` positioning section (Req 24)
    - Add at least one `ProblemMirror` statement (Req 8.1)
    - Add pricing range statement "Most projects fall between £500 and £1,200" (Req 10.1)
    - Add location-specific H2 heading referencing South Cheshire (Req 18.2)
    - _Requirements: 4.1, 8.1, 10.1, 18.2, 22.3, 23.1, 23.2, 24.1, 27.1, 28.1_

  - [x] 3.3 Add three `CTABlock` positions on Homepage
    - Above-fold CTA (variant `above-fold`)
    - Mid-page CTA (variant `mid-page`)
    - End-of-page CTA before footer (variant `end-of-page`)
    - Each CTA heading must be distinct from the other two
    - Include "I reply the same day" reassurance on at least one CTA
    - Pricing range before a primary CTA on the homepage (Req 10.4)
    - _Requirements: 5.1, 5.3, 5.4, 11.2, 26.1, 26.2_

  - [x] 3.4 Ensure Homepage copy uses active voice, local references, no absolute claims
    - Replace all feature-first language with problem-led language
    - Use active voice throughout (no passive constructions)
    - Replace generic "Cheshire" with "South Cheshire", "Nantwich", "Crewe"
    - Include "Based in Nantwich, working with South Cheshire businesses"
    - Include "tested in real business environments" positioning
    - No absolute claims (no "guaranteed results", "100% success rate")
    - _Requirements: 6.1, 6.2, 6.3, 7.1, 7.2, 13.1, 29.2_

  - [x] 3.5 Write property tests for Homepage
    - **Property 23: Homepage hero contains above-the-fold proof element**
    - **Property 22: Pricing range displayed on homepage**
    - **Property 24: Speed-to-enquiries connection on homepage**
    - **Property 25: Objection handling on homepage**
    - **Validates: Requirements 10.1, 21.1, 21.2, 22.3, 23.1**
    - Test file: `tests/scram-homepage.test.ts`


- [x] 4. Rewrite Website Design Service Page (`src/app/services/website-design/page.tsx`)
  - [x] 4.1 Replace hero with `ProblemHero` using problem-led heading
    - Problem-led heading about not getting enquiries
    - Local reference in subline
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 4.2 Add Website Design SCRAM sections
    - Add `WhyWebsitesFail` section (Req 27.2)
    - Add `SpeedToEnquiries` section connecting speed to enquiry outcomes (Req 22.4)
    - Add `ObjectionHandler` with three objection-response pairs (Req 23.1)
    - Add `ProblemMirror` statement relevant to website design (Req 8.3)
    - Add "Who this is for" and "Who this is NOT for" statements (Req 10.2, 10.3)
    - Add micro-proof elements — ROI figures with context, real project references (Req 13.3)
    - Add "You deal directly with me" and "I reply the same day" reassurance (Req 11.1, 11.2)
    - Add location-specific H2 heading (Req 18.1)
    - Add cross-links to related services: hosting, ads, analytics (Req 17.2)
    - _Requirements: 8.3, 10.2, 10.3, 11.1, 11.2, 13.3, 17.2, 18.1, 22.4, 23.1, 27.2_

  - [x] 4.3 Add three `CTABlock` positions on Website Design page
    - Above-fold, mid-page, end-of-page with distinct headings
    - Include reassurance messaging
    - _Requirements: 5.1, 5.3, 5.4, 26.1, 26.2_

  - [x] 4.4 Ensure Website Design page copy compliance
    - Active voice throughout, no passive constructions
    - Problem-led language, no feature-first copy
    - No absolute claims
    - Case studies use context → action → realistic expectation format (Req 9.1, 9.2)
    - _Requirements: 6.2, 6.3, 9.1, 9.2, 29.1, 29.2_

  - [x] 4.5 Write property tests for Website Design page
    - **Property 1: Every service page leads with a problem statement**
    - **Property 24: Speed-to-enquiries connection on website design page**
    - **Property 25: Objection handling on website design page**
    - **Property 26: WhyWebsitesFail section leads into solution**
    - **Validates: Requirements 2.1, 2.2, 22.4, 23.1, 27.3**
    - Test file: `tests/scram-service-pages.test.ts`

- [x] 5. Rewrite Services Overview Page (`src/app/services/page.tsx`)
  - [x] 5.1 Rewrite Services Overview header and layout
    - Problem-led header replacing feature-led heading
    - Website Design listed first in service listings (Req 3.1)
    - Update `ServiceCard` descriptions to problem-led copy
    - Add `ServiceEntryGuide` section (Req 28)
    - Add pricing range statement (Req 10.1)
    - Add location-specific H2 heading (Req 18.1)
    - _Requirements: 2.3, 3.1, 3.2, 3.3, 3.4, 10.1, 18.1, 28.1_

  - [x] 5.2 Add three `CTABlock` positions on Services Overview
    - Above-fold, mid-page, end-of-page with distinct headings
    - _Requirements: 5.1, 26.1, 26.2_

  - [x] 5.3 Write property tests for Services Overview
    - **Property 20: Website Design is the primary service in all listings**
    - **Property 22: Pricing range displayed on services overview**
    - **Validates: Requirements 3.1, 10.1**
    - Test file: `tests/scram-service-pages.test.ts`

- [x] 6. Checkpoint — Verify priority pages
  - Ensure Homepage, Website Design, and Services Overview build without errors
  - Ensure all tests pass (`vitest --run`)
  - Ask the user if questions arise.


- [x] 7. Update CTA system — global components
  - [x] 7.1 Update `StickyCTA` component at `src/components/StickyCTA.tsx`
    - Replace "Ready to grow your business?" with problem-led copy
    - Ensure 44x44px minimum tap target on CTA buttons
    - _Requirements: 6.1, 30.2_

  - [x] 7.2 Update `ServiceCard` component at `src/components/services/ServiceCard.tsx`
    - Update service descriptions to problem-led copy
    - Hosting: "Fix a slow or expensive website" (Req 3.2)
    - Ads: amplifier service positioning (Req 3.3)
    - Analytics: clarity service positioning (Req 3.3)
    - Photography: supporting service positioning (Req 3.4)
    - _Requirements: 3.2, 3.3, 3.4, 6.1_

- [x] 8. Implement Blog CTA system
  - [x] 8.1 Add `BlogPostCTA` to blog post template at `src/app/blog/[slug]/page.tsx`
    - Add `BlogPostCTA` as mandatory element at end of every blog post
    - Include problem reminder, solution statement, link to `/services/website-design/`
    - Ensure every blog post includes at least one internal link to Website Design
    - _Requirements: 16.1, 25.1, 25.2, 25.3_

  - [x] 8.2 Write property tests for Blog CTA
    - **Property 16: Every blog post links to Website Design service page**
    - **Property 17: Blog post end CTA contains required elements**
    - **Validates: Requirements 16.1, 17.1, 25.1, 25.2**
    - Test file: `tests/scram-blog-properties.test.ts`

- [x] 9. Rewrite Hosting Service Page (`src/app/services/hosting/page.tsx`)
  - [x] 9.1 Rewrite Hosting page with SCRAM methodology
    - Replace hero with `ProblemHero` — "Fix a slow or expensive website" positioning (Req 3.2)
    - Add `ProblemMirror` relevant to hosting frustrations (Req 8.3)
    - Add "You deal directly with me" and "I reply the same day" reassurance (Req 11.1, 11.2)
    - Add location-specific H2 heading, e.g. "Why Nantwich and Crewe businesses struggle with slow websites" (Req 14.3, 18.1)
    - Add micro-proof element (Req 13.3)
    - Add cross-link to Website Design service (Req 17.2)
    - Three `CTABlock` positions with distinct headings (Req 26.1, 26.2)
    - Active voice, no absolute claims, problem-led copy
    - _Requirements: 2.1, 2.2, 3.2, 8.3, 11.1, 11.2, 13.3, 14.3, 17.2, 18.1, 26.1, 26.2, 29.2_

- [x] 10. Rewrite Ad Campaigns Service Page (`src/app/services/ad-campaigns/page.tsx`)
  - [x] 10.1 Rewrite Ad Campaigns page with SCRAM methodology
    - Replace hero with `ProblemHero` — "Ads not bringing in leads?" positioning
    - Add `ProblemMirror` relevant to ads frustrations (Req 8.3)
    - Add "You deal directly with me" and "I reply the same day" reassurance (Req 11.1, 11.2)
    - Add location-specific H2 heading (Req 18.1)
    - Add micro-proof element (Req 13.3)
    - Add cross-links to Website Design and Analytics (Req 17.2)
    - Three `CTABlock` positions with distinct headings (Req 26.1, 26.2)
    - Active voice, no absolute claims, problem-led copy
    - _Requirements: 2.1, 2.2, 3.3, 8.3, 11.1, 11.2, 13.3, 17.2, 18.1, 26.1, 26.2, 29.2_

- [x] 11. Rewrite Analytics Service Page (`src/app/services/analytics/page.tsx`)
  - [x] 11.1 Rewrite Analytics page with SCRAM methodology
    - Replace hero with `ProblemHero` — "Not sure what's working?" positioning
    - Add `ProblemMirror` relevant to analytics frustrations (Req 8.3)
    - Add "You deal directly with me" and "I reply the same day" reassurance (Req 11.1, 11.2)
    - Add location-specific H2 heading (Req 18.1)
    - Add micro-proof element (Req 13.3)
    - Add cross-links to Website Design and Ads (Req 17.2)
    - Three `CTABlock` positions with distinct headings (Req 26.1, 26.2)
    - Active voice, no absolute claims, problem-led copy
    - _Requirements: 2.1, 2.2, 3.3, 8.3, 11.1, 11.2, 13.3, 17.2, 18.1, 26.1, 26.2, 29.2_

- [x] 12. Rewrite Photography Service Page (`src/app/services/photography/page.tsx`)
  - [x] 12.1 Rewrite Photography page with SCRAM methodology preserving content guidelines
    - MUST use `photography-hero.webp` as hero image (Req 19.1)
    - MUST only display approved statistics: "3,500+ licensed images" and "90+ countries" (Req 19.2)
    - MUST use narrative copy, no statistics blocks or metric grids (Req 19.3)
    - MUST NOT reintroduce legacy metric grids (3+, 50+, 100+) (Req 19.4)
    - Add problem-led framing via `ProblemHero`
    - Add `ProblemMirror` relevant to photography (Req 8.3)
    - Add local references (Req 7.1)
    - Three `CTABlock` positions with distinct headings (Req 26.1, 26.2)
    - Active voice, no absolute claims
    - _Requirements: 2.1, 7.1, 8.3, 19.1, 19.2, 19.3, 19.4, 26.1, 26.2, 29.2_

  - [x] 12.2 Write property test for Photography page content guidelines
    - **Property 19: Photography page content guidelines**
    - **Validates: Requirements 19.1, 19.2, 19.4**
    - Test file: `tests/scram-photography-properties.test.ts`


- [x] 13. Checkpoint — Verify all service pages
  - Ensure Hosting, Ad Campaigns, Analytics, and Photography pages build without errors
  - Ensure all tests pass (`vitest --run`)
  - Ask the user if questions arise.

- [x] 14. Rewrite remaining pages with SCRAM methodology
  - [x] 14.1 Rewrite About page (`src/app/about/page.tsx`)
    - Add local credibility signals — Nantwich, NYCC work (Req 14.1)
    - Add "Tested in real business environments" positioning (Req 13.1)
    - Add problem-led framing
    - Three `CTABlock` positions with distinct headings
    - Local references throughout
    - Active voice, no absolute claims
    - _Requirements: 7.1, 13.1, 14.1, 26.1, 26.2, 29.2_

  - [x] 14.2 Rewrite Contact page (`src/app/contact/page.tsx`)
    - Three `CTABlock` positions with low-friction contact options (Req 12.3)
    - Add "I reply the same day" reassurance (Req 11.2)
    - Local references
    - Active voice, no absolute claims
    - _Requirements: 7.1, 11.2, 12.3, 26.1, 26.2, 29.2_

  - [x] 14.3 Rewrite Pricing page (`src/app/pricing/page.tsx`)
    - Pricing range with "who this is for" / "who this is NOT for" (Req 10.2, 10.3)
    - Problem-led framing
    - Three `CTABlock` positions with distinct headings
    - Active voice, no absolute claims
    - _Requirements: 10.2, 10.3, 26.1, 26.2, 29.2_

  - [x] 14.4 Rewrite Free Audit page (`src/app/free-audit/page.tsx`)
    - Problem-led framing
    - Three `CTABlock` positions with distinct headings
    - Local references
    - Active voice, no absolute claims
    - _Requirements: 7.1, 26.1, 26.2, 29.2_

- [x] 15. Write cross-cutting property tests for content rules
  - [x] 15.1 Write property tests for content compliance across all pages
    - **Property 2: No feature-first headings remain on any page**
    - **Property 7: Every page contains at least one specific local reference**
    - **Property 9: No absolute guarantee language on any page**
    - **Validates: Requirements 2.3, 6.1, 7.1, 29.2**
    - Test file: `tests/scram-content-properties.test.ts`

  - [x] 15.2 Write property tests for service page rules
    - **Property 1: Every service page leads with a problem statement**
    - **Property 8: Problem mirrors appear on homepage and every service page**
    - **Property 10: Service pages with pricing include audience fit statements**
    - **Property 11: Personal service reassurance on every service page**
    - **Property 12: Micro-proof elements on every service page**
    - **Property 13: Location-specific H2 headings on every service page**
    - **Property 18: Cross-links between related service pages**
    - **Property 20: Website Design is the primary service in all listings**
    - **Validates: Requirements 2.1, 2.2, 8.1, 8.3, 10.2, 10.3, 11.1, 11.2, 13.3, 14.3, 17.2, 18.1, 3.1**
    - Test file: `tests/scram-service-properties.test.ts`

  - [x] 15.3 Write property tests for CTA system across all pages
    - **Property 3: Every page has CTAs in three positions**
    - **Property 5: CTA wording varies across positions on each page**
    - **Validates: Requirements 5.1, 26.1, 26.2**
    - Test file: `tests/scram-cta-properties.test.ts`

  - [x] 15.4 Write property test for step indicators
    - **Property 21: No circle-based step indicators on any page**
    - **Validates: Requirements 4.1, 4.2**
    - Test file: `tests/scram-page-properties.test.ts`

  - [x] 15.5 Write property test for case study context
    - **Property 27: Case studies include context and limitations**
    - **Validates: Requirements 9.2, 29.3**
    - Test file: `tests/scram-page-properties.test.ts`

- [x] 16. Checkpoint — Verify all pages complete
  - Ensure all page rewrites build without errors (`npm run build`)
  - Ensure all tests pass (`vitest --run`)
  - Ask the user if questions arise.

- [x] 17. Update metadata across all pages
  - [x] 17.1 Update all `buildSEO()` calls to pain + location + outcome pattern
    - Rewrite all page metadata to follow: problem/pain + location + outcome
    - Replace Homepage meta description (currently feature-led) with problem-led description (Req 15.4)
    - Replace all feature-led titles with outcome-led titles (Req 20.1, 20.2)
    - Include "South Cheshire", "Nantwich", or "Crewe" in every meta description (Req 15.2)
    - Ensure all meta descriptions are between 140 and 160 characters (Req 15.5)
    - Files to update: `src/app/page.tsx`, `src/app/services/page.tsx`, `src/app/services/website-design/page.tsx`, `src/app/services/hosting/page.tsx`, `src/app/services/ad-campaigns/page.tsx`, `src/app/services/analytics/page.tsx`, `src/app/services/photography/page.tsx`, `src/app/about/page.tsx`, `src/app/contact/page.tsx`, `src/app/pricing/page.tsx`, `src/app/free-audit/page.tsx`, `src/app/blog/page.tsx`
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 20.1, 20.2, 20.3_

  - [x] 17.2 Write property tests for metadata
    - **Property 14: Meta descriptions follow pain + location + outcome structure**
    - **Property 15: Meta description length within bounds**
    - **Validates: Requirements 15.1, 15.2, 15.5, 15.6, 20.3**
    - Test file: `tests/scram-meta-properties.test.ts`

- [x] 18. Final build validation and checkpoint
  - Run `npm run build` to verify Next.js static export succeeds with all changes
  - Run `vitest --run` to verify all unit and property tests pass
  - Verify no TypeScript compilation errors
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation after each major phase
- Property tests validate universal correctness properties from the design document
- Photography page has strict content guidelines that must be preserved (Req 19)
- All CTA buttons must meet 44x44px minimum tap target (Req 30.2)
- Meta descriptions must be 140-160 characters (Req 15.5)
- No absolute claims anywhere on the site (Req 29.2)
- Active voice throughout all copy (Req 6.2)
- Deployment uses S3 + CloudFront via `scripts/deploy.js` — not AWS Amplify
