# SCRAM Copy Elimination and Structured Data: Tasks

## Phase 1: Shared Infrastructure

### Task 1: Create `src/config/canonical.ts` and migrate `src/config/site.ts`
- [x] Create `src/config/canonical.ts` with the full CANONICAL object as defined in the design (business identity, contact details, routes, social profiles, opening hours, knowsAbout)
- [x] Verify geo coordinates (53.0679, -2.5211) are correct for the business before freezing
- [x] Rewrite `src/config/site.ts` to re-export from `canonical.ts` (no independent values)
- [x] Update `src/config/metadata.config.ts` to import business identity from `canonical.ts` instead of duplicating it
- [x] Verify all routes in `canonical.ts` end with `/`
- [x] Verify email is `joe@vividmediacheshire.com` and phone is `+447586378502`
- [x] Run `npm run build` to confirm no import breakage

**Reqs:** 14, 15, 16

### Task 2: Fix canonical email and hosting route across all files
- [x] Replace all `joe@vividmediacheshire.co.uk` mailto references with `joe@vividmediacheshire.com` across all page files and components
- [x] Replace all `/services/hosting/` internal links, canonical paths, metadata paths, breadcrumbs, and sitemap references with `/services/website-hosting/`
- [x] Replace `hello@vividautophoto.com` in `src/components/sections/ContactPageClient.tsx` with canonical email
- [x] Verify zero instances of `.co.uk` email remain in any `.tsx` file
- [x] Verify zero instances of `/services/hosting/` remain in any non-test, non-migration file
- [x] Run `npm run build` to confirm no breakage

**Reqs:** 14, 15

### Task 3: Create `src/lib/schema-generator.ts` with all builder functions
- [x] Create `src/lib/schema-generator.ts` with pure builder functions: `buildLocalBusiness`, `buildOrganization`, `buildWebPage`, `buildBreadcrumbList`, `buildService`, `buildFAQPage`, `buildOfferCatalog`, `buildPriceSpecification`, `buildPerson`, `buildAboutPage`, `buildContactPage`, `buildCollectionPage`, `buildItemList`, `buildBlogPosting`, `buildBlog`, `buildImageGallery`, `buildCreativeWork`, `buildHowTo`, `buildSpeakableSpecification`
- [x] All builders import from `CANONICAL` in `canonical.ts`, no hardcoded business data
- [x] All builders throw on empty description, missing required fields, or invalid input
- [x] `buildFAQPage` requires non-empty questions array
- [x] `buildOfferCatalog` requires non-empty offers array
- [x] `buildSpeakableSpecification` requires non-empty CSS selectors
- [x] No builder produces Review, AggregateRating, or AggregateOffer unless explicitly called with verified data
- [x] All description parameters are required strings with minimum length validation

**Reqs:** 16, 17

### Task 4: Create `src/components/JsonLd.tsx`
- [x] Create `src/components/JsonLd.tsx` as a stateless component accepting a `schemas` array and rendering `<script type="application/ld+json">` tags
- [x] Component renders at build time during static export
- [x] Verify component works with multiple schema objects passed as array

**Reqs:** 16, 17

### Task 5: Schema builder unit tests
- [x] Write unit tests for every builder function verifying output shape, required fields, and `@context`/`@type` values
- [x] Write unit tests verifying builders throw on empty description, missing required fields
- [x] Write unit tests verifying no builder output contains banned generic phrases ("digital services", "online presence enhancement", "comprehensive solutions", "performance optimisation")
- [x] Write unit tests for `canonical.ts` exports: all routes end with `/`, email format valid, phone format consistent
- [x] All tests pass with `npx vitest run`

**Reqs:** 17

### Task 6: Property-based copy test suite
- [x] Create property-based tests using fast-check + vitest for all 16 correctness properties defined in the design
- [x] Tests extract visible text content only, stripping HTML tags and script blocks before applying copy rules
- [x] Tests ignore: code comments, import paths, CSS class names, JSON-LD keys, test fixtures, image alt attributes
- [x] Tests initially target pages that have completed their copy pass (enable per page as copy is done)
- [x] Verify test suite runs and passes on current codebase for properties that are already satisfied

**Reqs:** 1, 3, 4, 5, 6, 7, 10, 12, 14, 15

---

## Phase 2 + 3: Copy Pass then Schema Pass (Priority Order)

### Task 7: Transform SCRAM component default copy
- [x] Audit all shared SCRAM components in `src/components/scram/` for generic copy, filler phrases, buzzwords, and sentences over 26 words
- [x] Rewrite WhyWebsitesFail component default copy using short sentences following voice rules
- [x] Rewrite SpeedToEnquiries component body copy to sentences under 26 words
- [x] Rewrite ServiceEntryGuide solution descriptions using problem, consequence, outcome pattern
- [x] Rewrite ProblemMirror followUp text to short sentences, one idea per line, no filler phrases
- [x] Verify all components use "I" not "we", contain no em dashes, no buzzwords
- [x] Run `npm run build` to confirm no breakage

**Reqs:** 4, 5, 8

### Task 8: Homepage copy pass
- [x] Homepage opens with "Your website looks fine." / "But it feels like hard work."
- [x] Include at least two Core_Language phrases
- [x] No single Core_Language phrase appears more than twice
- [x] Remove all generic benefit statements, filler phrases, and buzzwords
- [x] All sentences under 26 words (target 20)
- [x] "I" not "we" throughout
- [x] No em dashes
- [x] Reassurance phrases appear at most once each
- [x] CTA copy is direct, no generic headings like "Ready to get more enquiries?"
- [x] Enable homepage property-based tests and verify they pass

**Reqs:** 1, 2, 3, 4, 5, 6, 7, 9.1, 10, 11

### Task 9: Homepage schema
- [x] Add `<JsonLd>` to homepage with: LocalBusiness, WebPage, Organization, BreadcrumbList
- [x] Add FAQPage schema only if FAQ content is visible on the page
- [x] Add SpeakableSpecification only if concise summary blocks are visible
- [x] LocalBusiness includes contactPoint and openingHoursSpecification
- [x] Description fields emphasise South Cheshire website redesign, conversion-focused improvements, mobile-first clarity, helping businesses get more enquiries
- [x] All descriptions use pain-point language, no generic phrases
- [x] Remove any existing inline schema from homepage
- [x] Run `npm run build` to confirm valid schema

**Reqs:** 17, 18

### Task 10: Website Design page copy pass
- [x] Page uses "Your website is not broken." / "It feels like hard work."
- [x] Include at least two Core_Language phrases
- [x] Remove all generic benefit statements, feature-led copy, filler phrases, buzzwords
- [x] Replace feature lists with outcome statements
- [x] All sentences under 26 words
- [x] "I" not "we", no em dashes
- [x] Reassurance phrases at most once each
- [x] CTA copy is direct
- [x] Enable Website Design property-based tests

**Reqs:** 1, 2, 3, 4, 5, 6, 7, 9.6, 10

### Task 11: Website Design page schema
- [x] Add `<JsonLd>` with: Service, WebPage, BreadcrumbList
- [x] Add FAQPage only if FAQ content visible (questions: Why is my website not getting enquiries? Do I need a full rebuild or just improvements? How much does a small business website cost? Will this help on mobile?)
- [x] Service includes serviceType "Website Redesign" or "Conversion-Focused Website Design", areaServed, provider, audience (trades, local services, SMEs)
- [x] Add Offer/AggregateOffer only if pricing visible on page
- [x] All descriptions use pain-point language
- [x] Remove any existing inline schema
- [x] Run `npm run build`

**Reqs:** 17, 21

### Task 12: Pricing page copy pass
- [x] Remove uncertainty with real price anchors and direct statements
- [x] No filler reassurance
- [x] Include "Most websites do not need a small tweak. They need fixing." or equivalent direct statement
- [x] Remove all generic benefit statements, filler phrases, buzzwords
- [x] All sentences under 26 words
- [x] "I" not "we", no em dashes
- [x] CTA copy is direct
- [x] Enable Pricing property-based tests

**Reqs:** 1, 2, 3, 4, 5, 7, 9.5, 10

### Task 13: Pricing page schema
- [x] Add `<JsonLd>` with: WebPage, BreadcrumbList
- [x] Add PriceSpecification and OfferCatalog only if pricing information is visible
- [x] OfferCatalog lists only items visibly listed on the page
- [x] Add FAQPage only if FAQ content visible
- [x] All descriptions use pain-point language
- [x] Remove any existing inline schema
- [x] Run `npm run build`

**Reqs:** 17, 26

### Task 14: Free Audit page copy pass
- [x] Remove all generic benefit statements, filler phrases, buzzwords
- [x] All sentences under 26 words
- [x] "I" not "we", no em dashes
- [x] CTA copy is direct
- [x] Enable Free Audit property-based tests

**Reqs:** 1, 2, 3, 4, 5, 7, 10

### Task 15: Free Audit page schema
- [x] Add `<JsonLd>` with: Service, WebPage, BreadcrumbList
- [x] Service describes the service as Website Review / Website and Marketing Audit / Conversion Review
- [x] Add FAQPage only if FAQ content visible
- [x] All descriptions use pain-point language
- [x] Remove any existing inline schema
- [x] Run `npm run build`

**Reqs:** 17, 28

### Task 16: Blog template CTA and blog copy pass
- [x] Blog post layout template automatically appends a CTA block at the end of every post
- [x] Individual posts may override CTA text but cannot remove the block
- [x] Blog posts connect to a real problem, link to services, end with direct CTA
- [x] Remove generic benefit statements, filler phrases, buzzwords from blog index and post template
- [x] All sentences under 26 words
- [x] "I" not "we", no em dashes

**Reqs:** 1, 3, 4, 5, 9.8

### Task 17: Blog schema (index + post template)
- [x] Blog index: add `<JsonLd>` with Blog, CollectionPage, BreadcrumbList, ItemList
- [x] Blog index description uses pain-point language, not "content hub" or generic content marketing language
- [x] Blog post template: add BlogPosting, BreadcrumbList
- [x] Blog post template: add HowTo if step-by-step content present
- [x] Blog post template: add FAQPage if FAQ content visible
- [x] Blog post template: add SpeakableSpecification if concise summary blocks visible
- [x] BlogPosting descriptions use pain-point language
- [x] Remove any existing inline schema from blog pages
- [x] Run `npm run build`

**Reqs:** 17, 29, 30

---

## Phase 2 + 3: Remaining Pages

### Task 18: About page copy pass and schema
- [x] Copy: build trust through specific real work examples (NYCC, BBC News, Business Insider), no generic "tested in real business environments"
- [x] Copy: remove all generic benefit statements, filler phrases, buzzwords
- [x] Copy: all sentences under 26 words, "I" not "we", no em dashes
- [x] Schema: add `<JsonLd>` with AboutPage, Person, LocalBusiness, BreadcrumbList
- [x] Person includes worksFor, jobTitle, knowsAbout
- [x] Person includes award/hasCredential only when credentials named in visible copy
- [x] Person includes sameAs only for real public profiles linked from the page
- [x] Descriptions reinforce direct accountability, no account manager layer, real operational improvement work
- [x] Remove any existing inline schema
- [x] Run `npm run build`

**Reqs:** 1, 3, 4, 5, 9.2, 17, 19

### Task 19: Services overview page copy pass and schema
- [x] Copy: guide visitor decision with "Pick the problem that sounds like yours"
- [x] Copy: each service starts with a problem and ends with an outcome
- [x] Copy: remove all generic benefit statements, filler phrases, buzzwords
- [x] Copy: all sentences under 26 words, "I" not "we", no em dashes
- [x] Schema: add `<JsonLd>` with CollectionPage, ItemList, LocalBusiness, BreadcrumbList
- [x] ItemList contains nested Service items for: website redesign, slow website fixes and hosting migration, Google Ads management, analytics and clarity, photography services
- [x] Each Service description states the problem first, no generic language
- [x] Remove any existing inline schema
- [x] Run `npm run build`

**Reqs:** 1, 2, 3, 4, 5, 9.3, 17, 20

### Task 20: Contact page copy pass and schema
- [x] Copy: reduce hesitation with "Send me your website." / "I will tell you what is not working."
- [x] Copy: remove all generic benefit statements, filler phrases, buzzwords
- [x] Copy: all sentences under 26 words, "I" not "we", no em dashes
- [x] Schema: add `<JsonLd>` with ContactPage, LocalBusiness, BreadcrumbList
- [x] LocalBusiness includes telephone, email, openingHoursSpecification, areaServed, contactPoint
- [x] Description uses pain-point language: not sure where to start, wants a direct answer, wants low-friction contact
- [x] Remove any existing inline schema
- [x] Run `npm run build`

**Reqs:** 1, 3, 4, 5, 7, 9.4, 17, 27

### Task 21: Website Hosting page copy pass and schema
- [x] Copy: reframe around "Your website is slow." / "People leave."
- [x] Copy: remove infrastructure language, technical explanations
- [x] Copy: all sentences under 26 words, "I" not "we", no em dashes
- [x] Schema: add `<JsonLd>` with Service, BreadcrumbList
- [x] Add FAQPage if FAQ visible (Why is my website so slow? Will faster hosting help enquiries? Can you migrate my current site? Will my website go offline during migration?)
- [x] Service includes serviceType "Website Speed Improvement and Hosting Migration", audience describing small businesses with slow or expensive sites
- [x] All descriptions use pain-point language
- [x] Remove any existing inline schema
- [x] Run `npm run build`

**Reqs:** 1, 2, 3, 4, 5, 9.7, 13, 17, 22

### Task 22: Ad Campaigns page copy pass and schema
- [x] Copy: remove all generic benefit statements, filler phrases, buzzwords, technical language
- [x] Copy: all sentences under 26 words, "I" not "we", no em dashes
- [x] Schema: add `<JsonLd>` with Service, BreadcrumbList
- [x] Add FAQPage if FAQ content visible
- [x] Service includes serviceType "Google Ads Campaign Management", audience describing South Cheshire trades and local services
- [x] Outcome numbers in schema match what is stated on the visible page
- [x] All descriptions use pain-point language
- [x] Remove any existing inline schema
- [x] Run `npm run build`

**Reqs:** 1, 2, 3, 4, 5, 13, 17, 23

### Task 23: Analytics page copy pass and schema
- [x] Copy: remove all generic benefit statements, filler phrases, buzzwords, technical language
- [x] Copy: all sentences under 26 words, "I" not "we", no em dashes
- [x] Schema: add `<JsonLd>` with Service, BreadcrumbList
- [x] Add FAQPage if FAQ content visible
- [x] Service includes serviceType "Website and Marketing Analytics Setup" or "Conversion Tracking and Reporting"
- [x] All descriptions use pain-point language
- [x] Remove any existing inline schema
- [x] Run `npm run build`

**Reqs:** 1, 2, 3, 4, 5, 13, 17, 24

### Task 24: Photography page copy pass and schema
- [x] Copy: apply voice rules and short sentence structure while preserving approved statistics ("3,500+ licensed images", "90+ countries")
- [x] Copy: use narrative copy, no statistics blocks or metric grids
- [x] Copy: do not reintroduce legacy metric grids (3+, 50+, 100+)
- [x] Copy: hero image remains `photography-hero.webp`
- [x] Copy: all sentences under 26 words, "I" not "we", no em dashes
- [x] Schema: add `<JsonLd>` with Service, BreadcrumbList, ItemList for visible portfolio entries
- [x] Assess whether portfolio data supports CreativeWork per item; add only if maintainable
- [x] Service description uses pain-point language: commercial and editorial photography, visuals that build trust, imagery supporting websites and campaigns
- [x] Remove any existing inline schema
- [x] Run `npm run build`

**Reqs:** 1, 3, 4, 5, 12, 17, 25

### Task 25: Privacy Policy page schema
- [x] Add `<JsonLd>` with WebPage, BreadcrumbList
- [x] WebPage identifies the page as a privacy policy page
- [x] Remove any existing inline schema
- [x] Run `npm run build`

**Reqs:** 17, 31

---

## Phase 4: Cleanup and Validation

### Task 26: Remove global layout.tsx schema and delete site.ts
- [x] Remove the global LocalBusiness schema from `src/app/layout.tsx`
- [x] Verify no page relies on the global schema (each page now has its own)
- [x] Update all remaining consumers of `src/config/site.ts` to import from `src/config/canonical.ts`
- [x] Delete `src/config/site.ts`
- [x] Remove any deprecated schema components in `src/components/seo/` that are no longer used
- [x] Run `npm run build` to confirm no breakage

**Reqs:** 16, 17

### Task 27: Final build validation and deployment
- [x] Run full property-based test suite: `npx vitest run`
- [x] Run `npm run build` and verify zero build errors
- [x] Verify all pages contain expected JSON-LD script tags in build output
- [x] Verify zero instances of `/services/hosting/` in non-test files
- [x] Verify zero instances of `.co.uk` email in any `.tsx` file
- [x] Verify zero instances of banned generic phrases in visible copy
- [x] Deploy via `scripts/deploy.js` to S3 + CloudFront
- [x] Verify CloudFront cache invalidation completes

**Reqs:** 11, 14, 15, 32
