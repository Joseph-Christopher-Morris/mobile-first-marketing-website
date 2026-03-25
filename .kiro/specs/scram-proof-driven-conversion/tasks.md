# Implementation Plan: SCRAM Proof-Driven Conversion

## Overview

Transform the Vivid Media Cheshire site into a proof-driven enquiry system. Create shared proof data constants in `src/lib/`, then build 6 new proof/decision components in `src/components/scram/`, restructure the homepage to a 10-section proof-driven flow, update all 8 pages with unified CTAs and proof placement, and enforce copy rules, attribution rules, and weight/feel rules site-wide. Existing SCRAM components (CTABlock, ProblemHero, WhyWebsitesFail, etc.) are reused where their structure supports the flow — prefer prop-driven updates over rewrites. Implementation follows commercial priority order: homepage first, then photography, website-design, hosting, pricing, about, contact, services.

## Tasks

- [x] 1. Create shared proof data constants and new proof block components
  - [x] 1.1 Create `src/lib/proof-data.ts` shared constants file
    - Define and export `SPEED_PROOF`, `NYCC_PROOF`, `THEFEEDGROUP_PROOF`, `STOCK_PROOF`, `AHREFS_PROOF` constant objects with all approved figure sets
    - `AHREFS_PROOF` must contain: healthScoreBefore=71, healthScoreAfter=91, period="February 2026 to March 2026", fixes summary array, and approved copy snippets (very short / short / medium variants)
    - Define and export `STANDARD_CTA` and `PHOTOGRAPHY_CTA` constant objects
    - THEFEEDGROUP must use one approved final figure set only — no alternate rounded values
    - All proof components and pages must import from this file rather than duplicating data in component internals
    - _Requirements: 4.1, 4.2, 5.2, 5.3, 5.4, 7.2, 7.6, 7.7, 9.1, 20.1, 20.2, 20.3_

  - [x] 1.2 Create `src/components/scram/SpeedProofBlock.tsx`
    - Accept `variant` prop ('full' | 'compact') and required `sourceAttribution` string prop
    - Import speed data from `src/lib/proof-data.ts`
    - Render before/after metrics: 14+ seconds → under 2 seconds load time, 56 → 99 performance score
    - Render outcome connection text linking speed to people staying and enquiry chance
    - `sourceAttribution` is required and must be visibly rendered in both `full` and `compact` variants
    - Full variant: larger visual with chart-style before/after bars; compact variant: inline before/after with smaller footprint
    - Compact variant must not visually duplicate the homepage full proof block — reuse same data with shorter footprint
    - _Requirements: 4.1, 4.2, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10, 14.2_

  - [x] 1.3 Create `src/components/scram/NYCCProofBlock.tsx`
    - Accept optional `heading` prop
    - Import NYCC data from `src/lib/proof-data.ts`
    - Render metrics in priority order: 8 hours/year admin time saved, clearer booking structure and fewer confused enquiries, social growth (270 followers, 66 posts, 475 reactions in 90 days)
    - Include optional client quote/praise line — must not visually outrank the operational proof metrics above it
    - Attribute to NYCC project
    - Answer: what changed, by how much, why it matters
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

  - [x] 1.4 Create `src/components/scram/TheFeedGroupProofBlock.tsx`
    - Accept optional `heading` prop
    - Import THEFEEDGROUP data from `src/lib/proof-data.ts`
    - Render: 40 clicks, 1.25K impressions, ~3.14% CTR, ~£3.58 average CPC
    - Render message: traffic does not fix a weak website; the page has to match what people search for
    - Attribute to THEFEEDGROUP Google Ads campaign
    - Must use one approved final figure set only — no alternate rounded values in props, copy, or schema
    - _Requirements: 7.1, 7.2, 7.3, 7.5, 7.6, 7.7_

  - [x] 1.5 Create `src/components/scram/StockPhotographyProofBlock.tsx`
    - Accept `variant` prop ('homepage' | 'photography')
    - Import stock data from `src/lib/proof-data.ts`
    - Render revenue growth: $2.36 to $1,166.07
    - Include one revenue trend chart or image placeholder
    - Include one or two top-selling image examples
    - Render a short interpretation line conveying that Joe learns from repeated demand rather than guesswork (not a fixed string — the interpretation should communicate the concept naturally)
    - Homepage variant: visually smaller, lower hierarchy; photography variant: heading "Proof that I know what people repeatedly need" with more image examples
    - _Requirements: 9.1, 9.2, 9.3, 9.5, 9.6, 9.7, 9.8, 16.9, 16.10, 16.11_

  - [x] 1.6 Create `src/components/scram/AuthorityProofBlock.tsx`
    - Accept `publications` array prop with name, imageSrc, imageAlt, caption per item
    - Render named publications with proof images displayed visibly (not behind expandable sections or load-more buttons)
    - Frame as "images used in real media, commercial, and editorial contexts"
    - Each item shows publication name, image, and caption describing context
    - Unsupported publication names (those without matching visible portfolio/proof content) must not be rendered
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6_

  - [x] 1.7 Create `src/components/scram/ThisIsForYouIf.tsx`
    - Accept `conditions` string array and optional `heading` prop
    - Render heading "This is for you if" (or override) with check-marked condition list
    - Use stronger decision language than existing "Who this is for" sections
    - _Requirements: 14.5_

  - [x] 1.8 Create `src/components/scram/TechnicalProofItem.tsx`
    - Lightweight support-proof component — NOT a full proof block
    - Accept props: `heading` string, `metric` string, `description` string
    - Render: short heading, one metric line, one sentence explaining why it matters
    - Designed for inline use on about, website-design, and compact trust sections
    - Import data from `src/lib/proof-data.ts` AHREFS_PROOF constant
    - Must stay visually subordinate to primary proof blocks (speed, NYCC, THEFEEDGROUP)
    - _Requirements: Ahrefs integration — support proof positioning_

- [x] 2. Checkpoint — Verify all new components and shared constants build
  - Run `npm run build` to confirm all new components and `src/lib/proof-data.ts` compile without errors
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. Restructure homepage to 10-section proof-driven flow
  - [x] 3.1 Reorder `src/app/page.tsx` to the 10-section layout
    - Section 1: `ProblemHero` — modify props so hero communicates that a website may look fine but fail to generate enquiries, visitors leave when slow/unclear/hard to use, and Joe improves websites by reducing friction. Sole CTA: "Send me your website". Remove any "Book a free call", "Get started", "Request a review" labels. Prefer prop-driven update over rewrite.
    - Section 2: `CTABlock` — above-fold CTA with "Send me your website" primary and "Email me directly" secondary, placed before "why websites fail"
    - Section 3: `WhyWebsitesFail` — reuse as-is (existing structure supports the flow)
    - Section 4: `SpeedProofBlock` variant="full" with source attribution — replaces `SpeedToEnquiries` on homepage. SpeedToEnquiries is retained only if needed elsewhere, not used on homepage.
    - Section 5: `NYCCProofBlock` — replaces `ProblemMirror`
    - Section 6: Two-service card grid (website redesign + hosting only) with link to full Services page — replaces 5-card grid
    - Section 7: `TheFeedGroupProofBlock` — replaces `NumberedSteps`
    - Section 8: `CTABlock` — final CTA with "what happens next" body text
    - Section 9: `StockPhotographyProofBlock` variant="homepage" — intentionally placed after final CTA as supporting authority content, must not interrupt the main conversion path
    - Section 10: Blog/supporting content — move to end
    - Optional: Add a single-line Ahrefs micro-proof (max 20-30 words) in a compact proof strip or trust section — e.g. "Ahrefs Health Score improved from 71 to 91 after technical SEO and crawl fixes." Do NOT create a large standalone section for this.
    - _Requirements: 1.1–1.8, 2.1–2.5, 3.1–3.7, 4.1–4.10, 5.1–5.6, 6.1–6.7, 7.1–7.7, 8.1–8.5, 9.1–9.9, 11.1–11.3, 21.1–21.9_

  - [x] 3.2 Remove deprecated homepage sections
    - Remove: `ProblemMirror`, `NumberedSteps`, `ObjectionHandler`, any intermediate CTA block that duplicates the same action without adding new information or proof context, pricing range + location H2, `ServiceEntryGuide`, `AntiAgencyBlock`, `TestimonialsCarousel`, Pricing Teaser, Contact Form
    - Ensure no Vivid Auto flyer data (£13,563.92 / £546 / 2,380% ROI) appears on homepage
    - _Requirements: 7.4, 20.4, 21.4, 21.5, 21.6_

  - [x] 3.3 Trim homepage FAQ section and align schema
    - Keep only: redesign, hosting, speed, enquiry clarity questions
    - Remove: Google Ads, areas covered, timelines questions
    - Move Google Ads FAQ content to ad-campaigns service page
    - Update `buildFAQPage` schema to derive from the same trimmed visible FAQ content — schema must match visible FAQ to avoid structured data mismatch
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

  - [x] 3.4 Verify homepage service scope and stock proof hierarchy
    - Confirm only website redesign and hosting appear as service cards on homepage
    - Confirm stock photography proof block is visually subordinate to speed and NYCC proof blocks
    - Confirm stock photography proof does not interrupt the conversion path (placed after final CTA)
    - _Requirements: 6.1, 6.3, 9.4, 9.6, 9.7, 9.8_

  - [x] 3.5 Write property tests for homepage structure (Properties 8, 11, 12, 13)
    - **Property 8: Proof hierarchy ordering** — where multiple proof blocks appear on the same page, their order follows the Proof Hierarchy unless a page-specific design requirement intentionally lowers a supporting proof block (e.g. stock photography on homepage)
    - **Validates: Requirements 20.7**
    - **Property 11: Proof block spacing** — consecutive proof-heavy sections are either separated by a non-proof section or clearly differentiated by visual hierarchy, spacing, and narrative role
    - **Validates: Requirements 24.1**
    - **Property 12: CTA spacing** — pages avoid clustered CTA pressure; no two adjacent sections both function primarily as CTA sections unless one serves a distinct transitional role
    - **Validates: Requirements 24.2**
    - **Property 13: At least one proof element before final CTA** — for major pages modified in this pass, at least one proof element appears before the end-of-page CTA block
    - **Validates: Requirements 25.8**

- [x] 4. Checkpoint — Homepage complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Update photography page with authority proof and stock proof
  - [x] 5.1 Add `AuthorityProofBlock` to `src/app/services/photography/page.tsx`
    - Pass publications array with BBC, Financial Times, Business Insider, CNN, AutoTrader, The Times — only those supported by visible portfolio images on the page
    - Unsupported publication names must not be rendered
    - Ensure all portfolio images load correctly with proof captions describing publication/commercial context
    - Remove hidden or expandable media proof — display all required proof images visibly on the page
    - Gallery may still use a grid layout that keeps the page light and scannable
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6_

  - [x] 5.2 Add `StockPhotographyProofBlock` variant="photography" to photography page
    - Include heading "Proof that I know what people repeatedly need"
    - Show revenue growth $2.36 to $1,166.07 with revenue growth visual and top-selling image examples
    - _Requirements: 16.9, 16.10, 16.11_

  - [x] 5.3 Update photography page CTA system
    - Replace "Call Joe" / "Discuss your shoot" with "Book your photoshoot" (primary) and "View portfolio" (secondary)
    - Remove competing CTA actions: "Call Joe", "Discuss your shoot", "Get in touch" as primary actions
    - Keep gallery but reframe captions for editorial/commercial presentation
    - _Requirements: 12.4, 16.7, 16.8, 16.12_

  - [x] 5.4 Write property test for publication proof support (Property 6)
    - **Property 6: Publication proof requires visible support** — for each publication name in authority proof, there exists visible supporting proof on the same page linking that publication name to a portfolio image, caption, or authority proof item. Unsupported publication names must not be rendered.
    - **Validates: Requirements 16.3**

- [x] 6. Update website design page with speed proof and ThisIsForYouIf
  - [x] 6.1 Add `SpeedProofBlock` variant="compact" to `src/app/services/website-design/page.tsx`
    - Pass appropriate source attribution text (visibly rendered)
    - Compact variant must not visually duplicate the homepage full proof block — reuse same data with shorter footprint
    - _Requirements: 14.2_

  - [x] 6.2 Replace "Who this is for" section with `ThisIsForYouIf` component
    - Conditions: "your website gets visits but no enquiries", "people ask basic questions instead of using the site", "your site looks fine but does not move people to act"
    - _Requirements: 14.5_

  - [x] 6.3 Strengthen proof section with named examples and verify CTA system
    - Verify CTA uses "Send me your website" + "Email me directly"
    - Ensure page follows SCRAM Conversion Flow: Recognition, Explanation, Proof, Action
    - Add `TechnicalProofItem` with Ahrefs data as one supporting technical proof item — sits below speed proof in hierarchy, must not dominate the section
    - _Requirements: 14.1, 14.3, 14.4, 14.6, 25.2_

  - [x] 6.4 Write property test for speed proof attribution (Property 5)
    - **Property 5: Speed proof source attribution** — for any page displaying speed proof data (load time or performance score metrics), visible source attribution text is present identifying whether the data comes from Joe's own website or a client project
    - **Validates: Requirements 4.7, 20.1**

- [x] 7. Rewrite hosting page with outcome-led blocks
  - [x] 7.1 Rewrite `src/app/services/hosting/page.tsx` hero and structure
    - Hero must use the framing: "Your website is slow. People leave." (this is a requirement, not an assumption about existing state)
    - Delete current "Core Pitch" / "What I tested and what worked" section entirely
    - Replace current case study blocks with three outcome-led blocks: "People stop leaving before the page loads", "Your website becomes easier to trust", "You do not have to manage the technical side"
    - _Requirements: 15.1, 15.2, 15.3_

  - [x] 7.2 Simplify hosting page process and proof sections
    - Keep performance before/after screenshots but simplify intro copy
    - Replace current FAQ-style "How It Works" with clean 3-column grid: 3 steps, short copy, no circles, no floating badges
    - Connect speed improvement to enquiry generation throughout
    - Verify CTA uses "Send me your website" + "Email me directly"
    - _Requirements: 15.4, 15.5, 15.6, 15.7_

  - [x] 7.3 Enforce hosting canonical route `/services/website-hosting/`
    - Ensure all internal links, CTA links, metadata canonical tags, breadcrumb schema, sitemap entries, and page references in shared components use `/services/website-hosting/` consistently
    - No alternate hosting route should remain in production
    - _Requirements: 25.3 (Hosting_Page glossary definition)_

- [x] 8. Checkpoint — Photography, website design, and hosting pages complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Update pricing, about, contact, and services pages
  - [x] 9.1 Update `src/app/pricing/page.tsx` CTA and visual priority
    - Keep hero: "Most websites do not need a small tweak. They need fixing."
    - Replace all CTA labels: "Call Joe" → "Send me your website", "Email me your project" → "Email me directly" across above-fold, mid-page, and end-of-page CTAs
    - Visually prioritise website redesign and hosting sections (move first, add emphasis)
    - Keep "Who this is for / not for" section
    - Optional: Add a brief Ahrefs trust line in a reassurance or trust section — e.g. "This is not guesswork. I have improved my own site's crawl health and technical SEO in real conditions." Do NOT create a dedicated Ahrefs block.
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5_

  - [x] 9.2 Update `src/app/about/page.tsx` CTA and copy
    - Replace CTA: "Call Joe" → "Send me your website", keep "Email me directly"
    - Tighten ProblemMirror: more grounded, less broad
    - Trim "Real work, not theory" section: remove generic/broad messaging, keep concrete proof
    - About page proof may appear as inline proof elements rather than formal Proof_Blocks if more natural
    - Add `TechnicalProofItem` with Ahrefs data as one proof item in the real-work / technical-credibility section — sits alongside speed improvements and campaign learnings, must not become a long technical paragraph
    - _Requirements: 18.1, 18.2, 18.3, 18.4, 25.6_

  - [x] 9.3 Update `src/app/contact/page.tsx` CTA and copy
    - Keep title: "Send me your website. I will tell you what is not working."
    - If a CTA block is retained above the form, its primary action should scroll to the form anchor on the same page. If no such block is retained, the page title and form serve as primary action without redundant CTA routing.
    - Replace CTAs: "Call Joe" / "Call Joe now" → "Send me your website" + "Email me directly" across all CTA blocks
    - Tighten support copy to: "Send the URL and tell me what feels wrong."
    - Keep phone number in contact details sidebar (not as major CTA)
    - Contact page proof may appear as inline proof elements rather than formal Proof_Blocks if more natural
    - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5, 25.7_

  - [x] 9.4 Update `src/app/services/page.tsx` copy and CTA deduplication
    - Shorten support copy to reduce duplication between hero and CTA
    - Review CTA deduplication: avoid repeating same ask without new value
    - Replace end-of-page CTA primary label "Get in touch" with "Send me your website"
    - Keep all five service cards with problem-led descriptions
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7, 13.8_

- [x] 10. Enforce site-wide CTA, copy, attribution, and asset rules
  - [x] 10.1 Audit and fix CTA labels across all pages
    - Verify every non-photography page uses "Send me your website" primary and "Email me directly" secondary
    - Verify photography page uses "Book your photoshoot" primary and "View portfolio" secondary
    - Remove all instances of "Book a free call", "Get started", "Request a review", "Check availability", "Call Joe" as CTA labels (except phone in contact details/footer/schema)
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8_

  - [x] 10.2 Audit and fix copy rules across all modified pages
    - Verify short sentences, first person ("I" not "we"), no em dashes, no filler/buzzwords in all new/modified copy
    - Check reassurance phrase limits: "I reply the same day", "based in Nantwich and Crewe", "you deal directly with me" each max once per page
    - Check "I fix that" style phrasing max once per page
    - _Requirements: 22.1, 22.2, 22.3, 22.4, 22.5, 23.1, 23.2, 23.3, 23.4, 23.5, 23.6, 24.3_

  - [x] 10.3 Audit proof attribution across all pages
    - Verify speed proof attributed to correct source (Joe's own site or client project) with visible attribution
    - Verify NYCC data attributed to NYCC project only; quote/praise does not visually outrank operational proof
    - Verify THEFEEDGROUP data attributed to THEFEEDGROUP Google Ads campaign only, using one approved figure set with no alternate rounded values
    - Verify Flyer ROI data does NOT appear outside flyer/offline campaign context
    - Verify stock photography data used as behaviour/consistency proof only, not central commercial claim
    - Verify Ahrefs proof (71→91) is attributed to Joe's own website, presented as technical SEO and crawl-health proof, written in short plain language, and appears as supporting proof only — never as main homepage proof or heavy standalone section
    - Verify Ahrefs proof does not displace stronger proof (speed, NYCC, THEFEEDGROUP) on any page
    - _Requirements: 20.1, 20.2, 20.3, 20.4, 20.5, 20.6, 20.7_

  - [x] 10.4 Verify asset paths and proof data sourcing
    - Confirm all new proof components use verified existing asset paths (images, charts)
    - Confirm all proof data is imported from `src/lib/proof-data.ts` shared constants, not duplicated in component internals
    - Extend deployment validator (`scripts/deployment-validator.js`) to check that all referenced image paths exist in build output
    - _Requirements: Design error handling section — asset path verification_

  - [x] 10.5 Write property tests for site-wide CTA rules (Properties 1, 2, 3, 4)
    - **Property 1: Primary CTA consistency** — for any non-photography page, primary CTA label is "Send me your website" linking to `/contact/`
    - **Validates: Requirements 12.1, 14.3, 15.6**
    - **Property 2: Secondary CTA consistency** — for any page, secondary CTA is "Email me directly" (except photography: "View portfolio")
    - **Validates: Requirements 12.2**
    - **Property 3: No deprecated CTA labels** — no page contains "Book a free call", "Get started", "Request a review", "Check availability", "Call Joe" as CTA labels
    - **Validates: Requirements 12.3, 12.8**
    - **Property 4: CTA block action consistency** — pages with multiple CTA blocks use same primary and secondary labels
    - **Validates: Requirements 12.5, 12.6**

  - [x] 10.6 Write property tests for copy, attribution, and proof rules (Properties 7, 9, 10)
    - **Property 7: Flyer ROI context restriction** — flyer campaign data does not appear outside flyer/offline campaign context on any page
    - **Validates: Requirements 20.4**
    - **Property 9: Copy rules — no "we" and no em dashes** — new/modified text contains no first-person "we" and no em dash characters
    - **Validates: Requirements 22.2, 22.3**
    - **Property 10: Reassurance and phrase repetition limits** — each tracked phrase appears at most once per page
    - **Validates: Requirements 23.1, 23.2, 23.3, 24.3**

  - [x] 10.7 Write unit tests for homepage service scope, stock proof hierarchy, and proof attribution correctness
    - Test that homepage service cards include only website redesign and hosting
    - Test that stock photography proof block is rendered in a visually lower hierarchy than primary homepage proof blocks
    - Test proof attribution correctness for homepage and photography page contexts
    - _Requirements: 6.1, 6.3, 9.6, 9.7, 20.1, 20.2, 20.3_

- [x] 11. Final checkpoint — Full build and validation
  - Run `npm run build` to confirm static export succeeds with all changes
  - Ensure all tests pass, ask the user if questions arise.
  - Verify site feels lighter not heavier: no excessive stacked proof, no clustered CTAs, no repeated phrasing patterns
  - Verify no duplicate intermediate CTA blocks remain on any page
  - Verify hosting canonical route `/services/website-hosting/` used consistently across all links, metadata, schema, breadcrumbs, sitemap
  - Verify FAQ schema derived from same trimmed visible FAQ content
  - _Requirements: 24.4, 24.5, 24.6, 24.7, 24.8, 25.1–25.8, 26.1–26.8_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation after major milestones
- Property tests validate universal correctness properties from the design document
- All 13 correctness properties are covered across tasks 3.5, 5.4, 6.4, 10.5, 10.6, and 10.7
- Implementation follows Requirement 26 priority order: homepage → photography → website-design → hosting → pricing → about → contact → services
- The hosting page file stays at `src/app/services/hosting/page.tsx` but all links, metadata, schema, breadcrumbs, and sitemap must use canonical route `/services/website-hosting/`
- SpeedToEnquiries component is retained only if needed elsewhere — not used on homepage in this pass
- Existing SCRAM components (CTABlock, ProblemHero, WhyWebsitesFail, etc.) are reused where their structure supports the flow — prefer prop-driven updates over rewrites
- Proof data lives in `src/lib/proof-data.ts` shared constants — components import from there, not from internal hardcoded values
- THEFEEDGROUP must use one approved final figure set only across all props, copy, and schema — no alternate rounded values
- StockPhotographyProofBlock interpretation is a concept ("Joe learns from repeated demand rather than guesswork") not a fixed string
- NYCC quote/praise must not visually outrank operational proof
- Contact page CTA above form should scroll to form anchor if retained; otherwise page title and form serve as primary action
- Ahrefs proof (71→91 health score) is SUPPORT proof only — sits below speed/NYCC/THEFEEDGROUP in hierarchy, must not dominate pages, must stay commercial/human/light
- TechnicalProofItem is a lightweight component for Ahrefs and similar support-proof items — not a full proof block
- Ahrefs full version only allowed on dedicated proof/blog/case study pages
