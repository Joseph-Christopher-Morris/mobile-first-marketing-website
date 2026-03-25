# SCRAM Website Overhaul — Summary

**Completed:** 20 March 2026
**Deployed:** Production (S3 + CloudFront)
**Deployment ID:** `deploy-1774037673444`

## What Changed

The entire Vivid Media Cheshire website was rewritten from feature-led messaging to problem-led messaging using the SCRAM methodology (Structure, Copy, Reassurance, Authority, Meta). The core question driving every page is now: **"Not getting enquiries from your website?"**

## Pages Rewritten (11 total)

- Homepage (`src/app/page.tsx`)
- Website Design (`src/app/services/website-design/page.tsx`)
- Services Overview (`src/app/services/page.tsx`)
- Hosting (`src/app/services/hosting/page.tsx`)
- Ad Campaigns (`src/app/services/ad-campaigns/page.tsx`)
- Analytics (`src/app/services/analytics/page.tsx`)
- Photography (`src/app/services/photography/page.tsx`)
- About (`src/app/about/page.tsx`)
- Contact (`src/app/contact/page.tsx`)
- Pricing (`src/app/pricing/page.tsx`)
- Free Audit (`src/app/free-audit/page.tsx`)

## New Shared Components (10)

All located in `src/components/scram/`:

| Component | Purpose |
|---|---|
| `ProblemHero` | Problem-led hero section replacing feature-led heroes |
| `CTABlock` | Reusable CTA with two contact options, three visual variants |
| `ProblemMirror` | Reflects visitor frustrations in styled quote blocks |
| `ObjectionHandler` | Addresses common visitor objections with Q&A pairs |
| `WhyWebsitesFail` | Explains why websites fail, leads into solution |
| `SpeedToEnquiries` | Connects site speed to business enquiry outcomes |
| `NumberedSteps` | Left-aligned numbered steps replacing circle-based UI |
| `BlogPostCTA` | Mandatory end-of-post CTA linking to Website Design |
| `ServiceEntryGuide` | Maps visitor problems to specific services |
| `AntiAgencyBlock` | Positions direct service vs agency structure |

## Updated Existing Components

- `StickyCTA` — problem-led copy replacing "Ready to grow your business?"
- `ServiceCard` — problem-led service descriptions

## Blog CTA System

Every blog post now includes a `BlogPostCTA` at the end, linking to `/services/website-design/` with a problem reminder and solution statement.

## Metadata Overhaul

All page metadata rewritten to follow the **pain + location + outcome** pattern. Every meta description includes a South Cheshire/Nantwich location reference and falls within 140–160 characters.

## Key Content Rules Applied

- Active voice throughout (no passive constructions)
- Local references on every page (South Cheshire, Nantwich, Crewe)
- No absolute claims (no "guaranteed results", "100% success rate")
- Three CTA positions per page (above-fold, mid-page, end-of-page)
- All CTA buttons meet 44×44px minimum tap target
- Problem mirrors on homepage and every service page
- Pricing transparency with "who this is for" / "who this is NOT for"
- Personal service reassurance ("You deal directly with me", "I reply the same day")
- Photography page preserves content guidelines (photography-hero.webp, approved stats only)

## Test Coverage

9 test files, 63 tests — all passing:

| Test File | Tests | Coverage |
|---|---|---|
| `scram-homepage.test.ts` | 7 | Homepage hero, proof, pricing, speed-to-enquiries, objections |
| `scram-service-pages.test.ts` | 16 | Service page structure, problem statements, Website Design primary |
| `scram-service-properties.test.ts` | 10 | Cross-links, local H2s, micro-proof, personal reassurance |
| `scram-content-properties.test.ts` | 6 | No feature-first headings, local references, no absolute claims |
| `scram-cta-properties.test.ts` | 4 | CTA positions, contact options, tap targets, wording variation |
| `scram-meta-properties.test.ts` | 4 | Meta description structure and length |
| `scram-blog-properties.test.ts` | 5 | Blog CTA, Website Design links |
| `scram-page-properties.test.ts` | 6 | No circle step indicators, case study context |
| `scram-photography-properties.test.ts` | 5 | Photography content guidelines |

## Build Stats

- 32 static pages generated
- 405 build files (20.39 MB)
- 76 files changed in deployment
- Zero TypeScript compilation errors
