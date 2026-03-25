# Vivid Media Cheshire — Project Implementation Guide

> Last updated: 22 March 2026

---

## What This Project Is

A **conversion-focused marketing website** for Vivid Media Cheshire, a digital agency based in Nantwich, Cheshire. The site targets local businesses in Nantwich and Crewe who need website design, hosting, photography, analytics, and ad campaign services.

The site is built with **Next.js 15** (App Router, static export) and deployed to **AWS S3 + CloudFront**. It uses a custom **SCRAM proof-driven conversion system** — real case studies, performance data, and editorial credentials woven into every page to build trust and drive enquiries.

**Live URL:** https://vividmediacheshire.com  
**CloudFront:** https://d15sc9fc739ev2.cloudfront.net  
**Owner:** Joe Morris

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, static export) |
| Language | TypeScript + React 19 |
| Styling | Tailwind CSS 3.4 |
| Testing | Vitest 4, Playwright, Lighthouse CI |
| Hosting | AWS S3 (private) + CloudFront (OAC) |
| CI/CD | GitHub Actions |
| DNS/CDN | Cloudflare → CloudFront |
| Analytics | Google Tag Manager, Microsoft Clarity, Ahrefs Web Analytics |
| SEO | JSON-LD structured data, sitemap generation, IndexNow |
| Node | 22.19.0 |

---

## Site Routes

| Route | Purpose |
|---|---|
| `/` | Homepage — SCRAM proof blocks, blog previews, FAQ |
| `/about/` | About Joe Morris and the business |
| `/contact/` | Contact form (Formspree) |
| `/pricing/` | Service pricing |
| `/free-audit/` | Free website audit form |
| `/blog/` | Blog index |
| `/blog/[slug]/` | Individual blog posts |
| `/privacy-policy/` | Privacy policy |
| `/thank-you/` | Post-conversion tracking page |
| `/services/` | Services overview |
| `/services/website-design/` | Website design service |
| `/services/website-hosting/` | Hosting and migration service |
| `/services/photography/` | Commercial and editorial photography |
| `/services/analytics/` | Website and marketing analytics |
| `/services/ad-campaigns/` | Google Ads management |

---

## Project Structure

```
src/
├── app/                        # Next.js App Router pages
│   ├── page.tsx                # Homepage
│   ├── layout.tsx              # Global layout, analytics, tracking
│   ├── globals.css             # Global styles + gallery CSS
│   ├── not-found.tsx           # 404 page
│   ├── services/               # 5 service pages
│   ├── blog/                   # Blog index + [slug] dynamic routes
│   ├── contact/                # Contact form
│   ├── about/                  # About page
│   ├── pricing/                # Pricing
│   ├── free-audit/             # Free audit form
│   ├── privacy-policy/         # Legal
│   └── thank-you/              # Conversion tracking
│
├── components/
│   ├── scram/                  # 17 SCRAM proof-driven components
│   ├── layout/                 # Header, Footer, MobileMenu
│   ├── sections/               # Reusable page sections
│   ├── services/               # Service-specific components
│   ├── blog/                   # Blog rendering
│   ├── analytics/              # Conversion tracking
│   └── ui/                     # Base UI primitives
│
├── lib/
│   ├── proof-data.ts           # All SCRAM proof constants (single source of truth)
│   ├── schema-generator.ts     # JSON-LD structured data builders
│   ├── metadata-generator.ts   # Social sharing / Open Graph metadata
│   ├── blog-api.ts             # Blog post loading from content/
│   ├── seo.ts                  # SEO utilities
│   ├── social-validation.ts    # Social metadata validation
│   └── image-fallback.ts       # Image fallback handling
│
├── config/
│   ├── canonical.ts            # Business identity, routes, contact, social
│   └── metadata.config.ts      # Image requirements and defaults
│
└── content/
    └── blog/                   # Blog posts as TypeScript modules

scripts/                        # 300+ deployment, validation, monitoring scripts
config/                         # AWS, security, performance, monitoring configs
docs/                           # Extensive operational documentation
tests/                          # Vitest test suite
.github/workflows/              # 4 CI/CD workflows
public/images/                  # Static image assets
```

---

## SCRAM Proof-Driven Conversion System

SCRAM stands for **Speed, Case studies, Real data, Authority, Messaging**. It's the core conversion strategy — every page uses real proof instead of generic marketing copy.

### Proof Components (`src/components/scram/`)

| Component | What It Proves |
|---|---|
| `SpeedProofBlock` | Load time: 14s → <2s. Lighthouse score: 56 → 99. |
| `NYCCProofBlock` | Case study: 8 hours/year admin time saved, social engagement metrics |
| `TheFeedGroupProofBlock` | Google Ads: 40 clicks, 1.25K impressions, 3.14% CTR, £3.58 CPC |
| `StockPhotographyProofBlock` | Stock revenue growth: £1.88 → £928.07 with SVG line chart |
| `AuthorityProofBlock` | Publication credits: BBC, Financial Times, CNN, The Times |
| `ProblemHero` | Problem-solution hero with proof text and hero image |
| `ProblemMirror` | Reflects the visitor's frustration back to them |
| `WhyWebsitesFail` | Common website failure patterns |
| `AntiAgencyBlock` | Differentiator: no agency layers, direct service |
| `ObjectionHandler` | Addresses common objections |
| `CTABlock` | Conversion call-to-action (end-of-page, inline variants) |
| `NumberedSteps` | How-it-works process steps |
| `ThisIsForYouIf` | Audience qualification |
| `ServiceEntryGuide` | Service navigation |
| `SpeedToEnquiries` | Speed → conversion connection |
| `TechnicalProofItem` | Individual technical proof point |
| `BlogPostCTA` | Blog-specific CTA |

### Proof Data Source of Truth

All proof constants live in `src/lib/proof-data.ts`. Components import from here — no hardcoded values in component files.

```typescript
// Key exports:
SPEED_PROOF      // { before: { loadTime: '14+', score: 56 }, after: { loadTime: '<2', score: 99 } }
NYCC_PROOF       // { adminTimeSaved: '8 hours per year', social: { followers: 270, ... } }
THEFEEDGROUP_PROOF // { clicks: 40, impressions: '1.25K', ctr: '3.14%', avgCpc: '£3.58' }
STOCK_PROOF      // { revenueStart: '£1.88', revenueEnd: '£928.07', interpretation: '...' }
AHREFS_PROOF     // { healthScoreBefore: 71, healthScoreAfter: 91, period: 'Feb–Mar 2026' }
STANDARD_CTA     // { primaryLabel: 'Send me your website', primaryHref: '/contact/' }
PHOTOGRAPHY_CTA  // { primaryLabel: 'Book your photoshoot', primaryHref: '#contact' }
```

---

## Photography Page — Key Rules

The photography page (`/services/photography/`) has specific content rules:

| Rule | Detail |
|---|---|
| Hero image | Must be `photography-hero.webp` — never substitute |
| Best-selling image | Must be `photography-sample-4.webp` |
| Supporting image | `photography-sample-1.webp` with Singtel Investor Day 2025 caption |
| Currency | GBP (£) only — never USD ($) |
| Approved stats | "3,500+ licensed images" and "90+ countries" only |
| Prohibited | Legacy metric grids (3+, 50+, 100+) |
| Gallery | 9 images in the Recent Photography grid |
| Proof block | SVG line chart (not CSS bar chart) for revenue growth |

---

## Business Identity

All business data lives in `src/config/canonical.ts`:

| Field | Value |
|---|---|
| Business name | Vivid Media Cheshire |
| Founder | Joe Morris |
| Location | Nantwich, Cheshire, CW5, GB |
| Email | joe@vividmediacheshire.com |
| Phone | 07586 378502 |
| Site URL | https://vividmediacheshire.com |
| Services | Website Redesign, CRO, Content Strategy, Google Ads, Analytics, Photography |

---

## Deployment Architecture

### Infrastructure

| Resource | Value |
|---|---|
| S3 Bucket | `mobile-marketing-site-prod-1759705011281-tyzuo9` |
| CloudFront Distribution | `E2IBMHQ3GCW6ZK` |
| CloudFront Domain | `d15sc9fc739ev2.cloudfront.net` |
| OAC ID | `E3OSELXP6A7ZL6` |
| Region | `us-east-1` |
| DNS | Cloudflare (vividmediacheshire.com) → CloudFront |

### Security

- S3 bucket is **private** — all public access blocked
- Access only through CloudFront OAC (Origin Access Control)
- HTTPS-only via CloudFront
- Security headers: HSTS, X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy
- IAM roles with least privilege
- AWS Amplify is **decommissioned and prohibited**

### Cache Strategy

| Content Type | Cache-Control |
|---|---|
| HTML | `public, max-age=600` (10 min) |
| Images, JS, CSS, fonts | `public, max-age=31536000, immutable` (1 year) |
| Sitemap, robots.txt | `public, max-age=3600` (1 hour) |
| JSON | `public, max-age=86400` (1 day) |

---

## Deployment Process

### Local Deployment

```bash
export S3_BUCKET_NAME="mobile-marketing-site-prod-1759705011281-tyzuo9"
export CLOUDFRONT_DISTRIBUTION_ID="E2IBMHQ3GCW6ZK"
export AWS_REGION="us-east-1"
node scripts/deploy.js
```

### What `deploy.js` Does (9 Steps)

1. **Build** — `npm run build` → static export to `out/`
2. **Build verification** — checks all required images exist in `out/`
3. **Asset manifest validation** — reads `config/required-assets.json`, blocks deploy if any asset missing
4. **Upload** — uploads changed files to S3 with content-type and cache headers
5. **Cleanup** — deletes old S3 objects not in current build, but **protects** assets matching the manifest or protected prefixes
6. **CloudFront invalidation** — `/_next/*` and `/*`
7. **Cloudflare cache purge** — sitemap, robots, homepage (requires `CLOUDFLARE_ZONE_ID` and `CLOUDFLARE_API_TOKEN`)
8. **Production asset verification** — HEAD requests every manifest asset on the live site
9. **Smoke test** — checks homepage, photography, website design, and hosting pages for HTTP 200; deep-checks photography page HTML for correct image refs and GBP currency

### CI/CD Pipeline (GitHub Actions)

**Workflow:** `.github/workflows/s3-cloudfront-deploy.yml`  
**Trigger:** Manual dispatch (workflow_dispatch)

Steps:
1. Checkout + Node 22.19.0 setup
2. `npm ci`
3. Brand/gradient compliance guard
4. `npm run build`
5. Validate required assets in build output
6. Patch sitemap (privacy policy)
7. Upload artifact
8. AWS OIDC credential assumption
9. S3 sync (HTML with short TTL, assets with immutable TTL)
10. MIME type fixes (sitemap, webmanifest, robots)
11. CloudFront invalidation
12. Cloudflare cache purge
13. IndexNow submission
14. Audit logging
15. Post-deploy asset verification (30s propagation delay)

### Other CI Workflows

| Workflow | Purpose |
|---|---|
| `lhci.yml` | Lighthouse CI performance audits |
| `quality-check.yml` | Linting and type checking |
| `content-compliance.yml` | Content validation |

---

## Deployment Guardrails

### Required Asset Manifest (`config/required-assets.json`)

A shared manifest of critical visual assets. Deploy is blocked if any are missing from `out/`.

**Protected categories:**
- Photography hero image
- Authority proof images (BBC, FT, CNN, The Times)
- Stock proof images (best-selling + supporting)
- Gallery images (9 images)
- Homepage stock proof image

**Protected prefixes** (never deleted during cleanup):
- `images/services/photography/`
- `images/hero/`
- `images/brand/`

### Case Sensitivity Warning

S3 keys are case-sensitive. macOS filesystems are case-insensitive. This means a folder named `Photography/` on disk will work locally but fail on S3 if code references `photography/`. The local folder must be lowercase to match code references.

---

## Build & Development

### Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Local dev server (localhost:3000) |
| `npm run build` | Build static export to `out/` |
| `npm run test` | Run Vitest suite (single run) |
| `npm run test:watch` | Vitest watch mode |
| `npm run seo:check` | SEO validation |
| `npm run content:validate` | Content compliance check |
| `npm run validate:images` | Blog image validation |

### Build Configuration (`next.config.js`)

- `output: 'export'` — static HTML export to `out/`
- `trailingSlash: true` — all routes end with `/`
- `images.unoptimized: true` — required for static export
- `compiler.removeConsole: true` in production
- `reactStrictMode: true`
- ESLint and TypeScript errors ignored during build (pragmatic choice for rapid iteration)

---

## SEO Implementation

### Structured Data (JSON-LD)

Built via `src/lib/schema-generator.ts`:
- `LocalBusiness` — business identity, location, opening hours
- `WebPage` — page-level metadata
- `Organization` — company info
- `BreadcrumbList` — navigation breadcrumbs
- `FAQPage` — FAQ sections
- `Service` — individual service descriptions
- `ItemList` — gallery/portfolio items
- `SpeakableSpecification` — voice search optimization

### Metadata Generation

`src/lib/metadata-generator.ts` generates Open Graph and Twitter Card metadata for every page, with proper image paths, titles, and descriptions.

### Sitemap

Generated pre-build by `scripts/generate-sitemap.js`. Patched in CI to include privacy policy if missing.

### IndexNow

Post-deploy submission to search engines via `scripts/submit-indexnow.js`. Notifies Bing, Yandex, and others of updated URLs.

---

## Blog System

- Blog posts are TypeScript modules in `src/content/blog/`
- Each post exports frontmatter (title, date, excerpt, category, tags, readTime) and content
- Dynamic routing via `src/app/blog/[slug]/`
- Categories: Marketing, Stock Photography, eBay, Data Analysis
- Hero images per post, mapped in the homepage component

---

## Analytics & Tracking

| Tool | Purpose |
|---|---|
| Google Analytics 4 (G-QJXSCJ0L43) | Traffic and conversion tracking |
| Google Tag Manager | Tag management |
| Microsoft Clarity | Session recordings and heatmaps |
| Ahrefs Web Analytics | SEO performance |

Implemented via Next.js `Script` components with `afterInteractive` strategy.

---

## Key Scripts

### Deployment

| Script | Purpose |
|---|---|
| `scripts/deploy.js` | Main deployment with all guardrails |
| `scripts/verify-production-assets.js` | Standalone post-deploy verification |
| `scripts/build-verification.js` | Build output image validation |
| `scripts/rollback.js` | Backup listing and rollback |
| `scripts/setup-infrastructure.js` | One-time AWS infrastructure setup |

### SEO & Content

| Script | Purpose |
|---|---|
| `scripts/generate-sitemap.js` | Sitemap generation (runs pre-build) |
| `scripts/submit-indexnow.js` | Search engine notification |
| `scripts/seo-check.js` | SEO validation |
| `scripts/audit-content-compliance.js` | Content compliance audit |
| `scripts/validate-content-requirements.js` | Content requirements check |

### Monitoring & Validation

| Script | Purpose |
|---|---|
| `scripts/deployment-audit-logger.js` | Deployment audit trail |
| `scripts/deployment-monitoring-integration.js` | Monitoring dashboard |
| `scripts/validate-aws-security-configuration.js` | AWS security validation |
| `scripts/validate-blog-images.js` | Blog image validation |

---

## Configuration Files

### Critical Configs

| File | Purpose |
|---|---|
| `config/required-assets.json` | Protected asset manifest for deployment |
| `config/production-infrastructure.json` | AWS infrastructure details |
| `config/cloudfront-s3-config.json` | CloudFront settings |
| `config/security-headers-config.json` | Security header configuration |
| `config/performance-budget.json` | Performance budgets |

### Environment Variables

| Variable | Purpose |
|---|---|
| `S3_BUCKET_NAME` | Target S3 bucket |
| `CLOUDFRONT_DISTRIBUTION_ID` | CloudFront distribution |
| `AWS_REGION` | AWS region (us-east-1) |
| `SITE_ORIGIN` | Production URL for verification |
| `CLOUDFLARE_ZONE_ID` | Cloudflare zone for cache purge |
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token |
| `INDEXNOW_API_KEY` | IndexNow submission key |
| `AWS_ROLE_ARN` | GitHub Actions OIDC role |

---

## Testing

- **Framework:** Vitest 4 with `@testing-library/react`
- **Property-based testing:** fast-check
- **E2E:** Playwright
- **Performance:** Lighthouse CI
- **Accessibility:** axe-core via Playwright

Run tests:
```bash
npm run test          # Single run
npm run test:watch    # Watch mode
npm run test:ui       # Vitest UI
```

---

## Known Constraints & Gotchas

1. **S3 is case-sensitive** — folder names on disk must match code references exactly. macOS hides this because its filesystem is case-insensitive.
2. **No AWS Amplify** — completely decommissioned. All deployment goes through S3 + CloudFront.
3. **Cloudflare caches CloudFront responses** — if CloudFront serves a 404, Cloudflare will cache that 404. Both layers need invalidation.
4. **`cleanupOldFiles()` can delete valid assets** — if the build output is incomplete, cleanup will remove production assets. The protected prefix guard mitigates this.
5. **Static export means no server-side features** — no API routes, no ISR, no middleware. Everything is pre-rendered HTML.
6. **ESLint and TypeScript errors are ignored during build** — `ignoreDuringBuilds: true` and `ignoreBuildErrors: true` in next.config.js.
7. **Image optimization is disabled** — `images.unoptimized: true` because static export can't use Next.js image optimization. Images are served as-is from S3.
8. **Brand compliance** — CI blocks builds containing gradient classes (`from-`, `via-`, `bg-gradient-`) or prohibited colors (`indigo-`, `purple-`, `yellow-`).

---

## Rollback

```bash
# List available backups
node scripts/rollback.js list

# Rollback to specific backup
node scripts/rollback.js rollback <backup-id>

# Emergency rollback
node scripts/rollback.js emergency
```

---

## Quick Reference

```bash
# Development
npm run dev

# Build
npm run build

# Deploy
export S3_BUCKET_NAME="mobile-marketing-site-prod-1759705011281-tyzuo9"
export CLOUDFRONT_DISTRIBUTION_ID="E2IBMHQ3GCW6ZK"
export AWS_REGION="us-east-1"
node scripts/deploy.js

# Verify production
SITE_ORIGIN=https://vividmediacheshire.com node scripts/verify-production-assets.js

# Run tests
npm run test
```
