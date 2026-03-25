# SCRAM Copy Elimination and Structured Data: Design

## Overview

This design covers two workstreams for the Vivid Media Cheshire website:

1. A copy elimination pass removing generic, AI-sounding, and feature-led language from all pages and shared SCRAM components, replacing it with direct, short-sentence copy following the SCRAM voice rules.
2. A structured data layer using JSON-LD across all public pages, with schema descriptions that match the visible pain-point copy.

Both workstreams share a single source of truth for business identity, contact details, and canonical routes. The copy pass runs first on each page. Schema is added second, only after the visible copy is finalised.

The site is a Next.js static export deployed via S3 and CloudFront.

---

## Architecture

### New Modules

Three new modules are introduced:

1. `src/config/canonical.ts` — single source of truth for business identity, contact details, canonical routes, and social profiles
2. `src/lib/schema-generator.ts` — pure functions that build JSON-LD objects for every schema type used on the site
3. `src/components/JsonLd.tsx` — a simple React component that renders one or more JSON-LD script tags into the page head

### Existing Modules

Two existing modules are retained and extended:

- `src/config/metadata.config.ts` — keeps social sharing metadata config (OG, Twitter Card). Will import business identity from `canonical.ts` instead of duplicating it.
- `src/lib/metadata-generator.ts` — keeps OG/Twitter metadata generation. No changes needed for this spec.

### Module to Replace: `src/config/site.ts`

The existing `src/config/site.ts` contains stale data:
- Email: `hello@vividautophoto.com` (wrong domain)
- Phone: `+44 123 456 7890` (placeholder)
- Address: `London, United Kingdom` (wrong location)
- Description: uses generic language ("Professional Vivid Media Cheshire services")

Migration rule: `src/config/site.ts` will be kept temporarily and rewritten to re-export from `canonical.ts`. This avoids breaking existing imports during the transition. Once all consumers are updated to import directly from `canonical.ts`, the file will be deleted. Both files must never define independent values.

---

## Shared Modules

### `src/config/canonical.ts`

Single source of truth for all business identity, contact, and route data.

```typescript
export const CANONICAL = {
  business: {
    name: 'Vivid Media Cheshire',
    founder: 'Joe Morris',
    jobTitle: 'Website Redesign and Conversion Specialist',
    areaServed: ['Nantwich', 'Crewe', 'South Cheshire'],
    address: {
      streetAddress: 'Nantwich',
      addressLocality: 'Nantwich',
      addressRegion: 'Cheshire',
      postalCode: 'CW5',
      addressCountry: 'GB',
    },
    // Verify exact coordinates before freezing into production config
    geo: { latitude: 53.0679, longitude: -2.5211 },
    priceRange: '££',
  },
  contact: {
    email: 'joe@vividmediacheshire.com',
    phone: '+447586378502',
    phoneDisplay: '07586 378502',
  },
  urls: {
    site: 'https://vividmediacheshire.com',
    cloudfront: 'https://d15sc9fc739ev2.cloudfront.net',
  },
  routes: {
    home: '/',
    about: '/about/',
    contact: '/contact/',
    pricing: '/pricing/',
    freeAudit: '/free-audit/',
    blog: '/blog/',
    privacyPolicy: '/privacy-policy/',
    services: '/services/',
    websiteDesign: '/services/website-design/',
    websiteHosting: '/services/website-hosting/',
    adCampaigns: '/services/ad-campaigns/',
    analytics: '/services/analytics/',
    photography: '/services/photography/',
  },
  social: {
    linkedin: 'https://www.linkedin.com/in/joe-morris-07921a1a0/',
    facebook: 'https://www.facebook.com/VividAutoPhotography',
    instagram: 'https://www.instagram.com/vividautophotography/',
    twitter: 'https://twitter.com/vividautophoto',
  },
  openingHours: [
    { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '09:00', closes: '18:00' },
    { days: ['Saturday'], opens: '10:00', closes: '14:00' },
    { days: ['Sunday'], opens: '10:00', closes: '16:00' },
  ],
  knowsAbout: [
    'Website Redesign',
    'Conversion Rate Optimisation',
    'Content Strategy',
    'Google Ads Management',
    'Website and Marketing Analytics',
    'Commercial and Editorial Photography',
  ],
} as const;
```

Covers: Req 14 (canonical hosting route), Req 15 (canonical contact details), Req 16 (business identity for LocalBusiness/Organization).

Note on coordinates: The geo values (53.0679, -2.5211) should be verified once before implementation begins. Once frozen into `canonical.ts` they become load-bearing for all LocalBusiness schema across the site.

Note on email: The codebase currently has two email domains in use:
- `joe@vividmediacheshire.co.uk` in all CTA mailto links across pages
- `joe@vividmediacheshire.com` in form error fallbacks, privacy policy, and contact page body

This design standardises on `joe@vividmediacheshire.com`. All `.co.uk` references will be updated during implementation.

Note on hosting route: The codebase currently references both `/services/hosting/` and `/services/website-hosting/`. All href, canonical paths, metadata paths, breadcrumbs, sitemap generation, and internal links must be updated together. The build must fail if `/services/hosting/` appears anywhere except migration notes or test fixtures.

### `src/lib/schema-generator.ts`

Pure functions that accept data and return plain JSON-LD objects. No side effects, no DOM access, no React dependency. Each function returns a typed object ready for `JSON.stringify`.

Builder functions:

| Function | Returns | Used by |
|---|---|---|
| `buildLocalBusiness()` | LocalBusiness | Homepage, Contact, About, Services overview |
| `buildOrganization()` | Organization | Homepage, About |
| `buildWebPage(page)` | WebPage | All pages |
| `buildBreadcrumbList(crumbs)` | BreadcrumbList | All pages |
| `buildService(service)` | Service | All service pages, Free Audit |
| `buildFAQPage(questions)` | FAQPage | Pages with visible FAQ content only |
| `buildOfferCatalog(offers)` | OfferCatalog | Pricing page (only when pricing visible) |
| `buildPriceSpecification(price)` | PriceSpecification | Pricing page (only when pricing visible) |
| `buildPerson()` | Person | About page |
| `buildAboutPage()` | AboutPage | About page |
| `buildContactPage()` | ContactPage | Contact page |
| `buildCollectionPage()` | CollectionPage | Services overview, Blog index |
| `buildItemList(items)` | ItemList | Services overview, Blog index, Photography |
| `buildBlogPosting(post)` | BlogPosting | Individual blog posts |
| `buildBlog()` | Blog | Blog index |
| `buildImageGallery(images)` | ImageGallery | Photography page |
| `buildCreativeWork(work)` | CreativeWork | Photography page (only if maintained) |
| `buildHowTo(steps)` | HowTo | Blog posts with step-by-step content |
| `buildSpeakableSpecification(selectors)` | SpeakableSpecification | Pages with concise summary blocks |

All builder functions import business identity from `CANONICAL` in `src/config/canonical.ts`. No builder function hardcodes business name, address, contact details, or routes.

All description fields must use pain-point language matching the visible page copy. No builder function may use generic phrases such as "digital services", "online presence enhancement", "comprehensive solutions", or "performance optimisation".

Schema integrity rules enforced by the builders:
- `buildFAQPage` requires a non-empty questions array (Req 17.2)
- `buildOfferCatalog` requires a non-empty offers array (Req 17.3)
- `buildSpeakableSpecification` requires non-empty CSS selectors (Req 17.6)
- No builder produces Review, AggregateRating, or AggregateOffer unless explicitly called with verified data (Req 17.1, 17.3)
- All description parameters are required strings with minimum length validation

Build-time safety: If a builder receives invalid input (empty description, missing required fields), it throws a descriptive error. This causes the Next.js static export to fail, preventing deployment of invalid schema.

### `src/components/JsonLd.tsx`

A simple React component that renders JSON-LD into the page.

```tsx
interface JsonLdProps {
  schemas: Record<string, unknown>[];
}

export function JsonLd({ schemas }: JsonLdProps) {
  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
```

This component is stateless and renders at build time during static export. It replaces the current pattern of inline `<Script>` tags with `dangerouslySetInnerHTML` scattered across pages.

Schema placement rule: Each page renders its own `<JsonLd>` component with page-specific schemas. The global `layout.tsx` LocalBusiness schema will be removed. Only one LocalBusiness object per page unless there is a documented reason for multiple entries. This avoids duplication noise and keeps schema page-scoped.

---

## Page-Level Integration

### Schema Assignment Per Page

Each page imports the builder functions it needs and passes the results to `<JsonLd>`.

| Page | Schema Types | Conditional Schemas | Req |
|---|---|---|---|
| Homepage | LocalBusiness, WebPage, Organization, BreadcrumbList | FAQPage (if FAQ visible), SpeakableSpecification (if summary blocks visible) | 18 |
| About | AboutPage, Person, LocalBusiness, BreadcrumbList | — | 19 |
| Services Overview | CollectionPage, ItemList, LocalBusiness, BreadcrumbList | — | 20 |
| Website Design | Service, WebPage, BreadcrumbList | FAQPage (if FAQ visible), Offer (if pricing visible) | 21 |
| Website Hosting | Service, BreadcrumbList | FAQPage (if FAQ visible) | 22 |
| Ad Campaigns | Service, BreadcrumbList | FAQPage (if FAQ visible) | 23 |
| Analytics | Service, BreadcrumbList | FAQPage (if FAQ visible) | 24 |
| Photography | Service, BreadcrumbList, ItemList | CreativeWork (only if portfolio data maintained) | 25 |
| Pricing | WebPage, BreadcrumbList | PriceSpecification, OfferCatalog (if pricing visible), FAQPage (if FAQ visible) | 26 |
| Contact | ContactPage, LocalBusiness, BreadcrumbList | — | 27 |
| Free Audit | Service, WebPage, BreadcrumbList | FAQPage (if FAQ visible) | 28 |
| Blog Index | Blog, CollectionPage, BreadcrumbList, ItemList | — | 29 |
| Blog Post | BlogPosting, BreadcrumbList | HowTo (if steps), FAQPage (if FAQ), SpeakableSpecification (if summary) | 30 |
| Privacy Policy | WebPage, BreadcrumbList | — | 31 |

Implementation priority follows Req 32: Homepage first, Website Design second, Pricing third, Free Audit fourth, Blog posts fifth, then remaining pages.

### Photography Page Decision

For the photography page schema (Req 25), the default pattern is:
- Service (always)
- BreadcrumbList (always)
- ItemList for visible portfolio entries (always)
- CreativeWork per portfolio item: only if the team commits to maintaining per-item metadata. Otherwise it becomes overhead. The implementation task should assess whether portfolio data is structured enough to support CreativeWork and make a go/no-go decision at that point.

### Copy-First, Schema-Second Sequencing

The contradiction between "structured data only after copy is finalised" (Req 17.7) and the implementation priority order is resolved with this rollout rule:

1. Copy pass runs first on a page
2. Schema is added second on that same page
3. Tests for that page are enabled only once both are complete

This means implementation tasks are ordered as pairs: copy task then schema task for each page, following the priority order in Req 32.

---

## Copy Elimination Rules

### Sentence Length

- Target: 20 words per sentence
- Hard limit: 26 words per sentence
- Sentences exceeding 26 words must be split
- Sentences between 20 and 26 words are acceptable when splitting would create awkward copy, particularly in FAQ answers, pricing clarifications, case study context, and schema descriptions

Covers: Req 4.

### "Professional" Rule

- Ban standalone uses of "professional" when vague (e.g. "professional services", "professional approach")
- Allow "professional" when paired with a concrete noun or outcome visible on the page:
  - "professional photography for auction catalogues" — allowed
  - "professional website redesign for local trades" — allowed
  - "professional services" — banned

Covers: Req 1.3.

### Core Language Spread

- Each Core_Language phrase must appear on at least one key page (Homepage, Website Design, or Services Overview)
- Approved variants of Core_Language phrases may be used on other pages
- No single Core_Language phrase may appear more than two times on the same page unless required in a CTA or FAQ context
- The previous rule requiring "I remove the friction" and "I make it obvious what to do next" on at least three pages each is softened: these phrases should appear naturally where they fit, not be forced onto pages where they feel repetitive

Covers: Req 6.

### Blog CTA Enforcement

- The blog post layout template (`src/app/blog/[slug]/page.tsx` or equivalent) must automatically append a CTA block at the end of every post
- This is stronger than checking each post manually and prevents publication of posts without a CTA regardless of content flow
- Individual posts may override the default CTA text but cannot remove the block

Covers: Req 9.8.

### Copy Implementation Rule

Visible copy in shared SCRAM components (`src/components/scram/`) must be edited before page-level overrides are added. This avoids duplicating near-identical fixes across pages. If a component's default copy is generic, fix the component first, then adjust page-level props where needed.

---

## Schema Integrity Guardrails

### Description Matching

Schema descriptions must paraphrase visible copy, not introduce claims absent from the page. Specifically:
- No schema description may mention offers, reviews, ratings, or guarantees not visibly shown on the page
- No schema description may use language that contradicts or exceeds what the visitor reads
- Schema descriptions should read like a compressed version of the page's opening copy

Covers: Req 17.4, 17.5.

### Conditional Schema Rules

- FAQPage: only when FAQ content is visible on the page (Req 17.2)
- Offer/AggregateOffer: only when pricing is visible on the page (Req 17.3)
- Review/AggregateRating: only when real, verifiable reviews are visible (Req 17.1)
- SpeakableSpecification: only when concise summary blocks are visible (Req 17.6)
- HowTo: only when step-by-step instructions are visible in a blog post

### Schema Implementation Rule

No JSON-LD may be added to a page unless the visible heading, main intro paragraph, and CTA language on that page have already passed copy review. This is enforced by task ordering, not by automated tooling.

---

## Correctness Properties

### Property-Based Tests (fast-check + vitest)

These properties run against the rendered page source or component output.

| # | Property | What it checks | Reqs |
|---|---|---|---|
| 1 | No banned generic phrases | Page source contains zero instances of phrases from Req 1.1 banned list | 1 |
| 2 | No banned filler phrases | Page source contains zero instances of phrases from Req 3.1 banned list | 3 |
| 3 | No banned buzzwords | Page source contains zero instances of buzzwords from Req 5.3 list | 5 |
| 4 | No "we" in copy | Page source contains zero instances of "we" used as first-person pronoun in visible copy | 5.1 |
| 5 | No em dashes | Page source contains zero em dash characters (U+2014) in visible copy | 5.2 |
| 6 | Sentence length | No sentence in visible copy exceeds 26 words (hard limit) | 4 |
| 7 | Reassurance cap | Each reassurance phrase appears at most once per page | 10 |
| 8 | Core language presence | Homepage and Website Design page each contain at least two Core_Language phrases | 6 |
| 9 | Core language repetition cap | No single Core_Language phrase appears more than twice on the same page (outside CTA/FAQ) | 6.5 |
| 10 | CTA copy directness | No CTA contains generic headings from Req 7.1 banned list | 7 |
| 11 | Canonical hosting route | Zero internal links point to `/services/hosting/` (must use `/services/website-hosting/`) | 14 |
| 12 | Canonical email consistency | All mailto links and visible email addresses use the canonical email from `CANONICAL.contact.email` | 15 |
| 13 | Photography stats | Photography page contains only "3,500+ licensed images" and "90+ countries" as statistics, no legacy metric grids | 12 |
| 14 | Photography hero | Photography page hero image is `photography-hero.webp` | 12.1 |
| 15 | Schema builder contracts | Every builder function throws on empty description, missing required fields, or invalid input | 17 |
| 16 | Schema description language | No schema description field contains phrases from the banned generic list | 17.4 |

### Test Stability Rule

Property-based copy tests must ignore:
- Code comments
- Import paths
- CSS class names
- JSON-LD keys (e.g. `@type`, `@context`)
- Test fixtures
- `alt` attributes on images (these follow different conventions)

Tests should extract visible text content only, stripping HTML tags and script blocks before applying copy rules. This prevents noisy false failures from non-copy content.
