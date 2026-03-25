# Vivid Media Cheshire — SCRAM Copy Elimination and Structured Data Specification

## Introduction

This specification covers two related concerns for the Vivid Media Cheshire website.

First, a targeted copy elimination pass. This removes remaining generic, AI-sounding, and feature-led language and replaces it with the direct, short-sentence voice defined in the SCRAM Copy Elimination rules. The previous SCRAM overhaul in March 2026 restructured every page around problem-led messaging and added CTA blocks, problem mirrors, and objection handlers. That structural work is complete. This pass focuses on the copy itself.

Second, this specification covers the implementation of structured data using JSON-LD across all public pages. The structured data layer must reflect the same pain-point language used in the visible copy. Schema descriptions must sound like the site reads. For example:
- fixing websites that feel like hard work
- making it obvious what to do next
- helping South Cheshire businesses get more enquiries

The schema layer must never say one thing while the visible page says another.

The site is a Next.js static export deployed via S3 and CloudFront.

---

## Glossary

- **Website**: The Vivid Media Cheshire Next.js static site deployed via S3 and CloudFront
- **Page**: Any route under `src/app/` including the homepage, about, contact, pricing, free-audit, blog, privacy-policy, and all service pages
- **Service_Page**: Any page under `src/app/services/` including website-design, website-hosting, ad-campaigns, analytics, and photography
- **SCRAM_Component**: Any shared React component under `src/components/scram/` including ProblemHero, CTABlock, WhyWebsitesFail, SpeedToEnquiries, ProblemMirror, ObjectionHandler, ServiceEntryGuide, AntiAgencyBlock, NumberedSteps, and BlogPostCTA
- **Generic_Copy**: Any sentence that uses vague benefit statements, buzzwords, filler phrases, or feature-led language as defined in this specification
- **Direct_Copy**: Short sentences. One idea per line. Each sentence describes a real problem, explains what happens because of it, or shows what changes after fixing it
- **Voice_Rules**: First person only, short sentences, no em dashes, no buzzwords, no vague claims, direct and practical tone
- **Copy_Transformation**: The act of replacing Generic_Copy with Direct_Copy following the SCRAM transformation rules
- **Photography_Page**: The photography service page at `src/app/services/photography/page.tsx`
- **Core_Language**: The repeatable phrases used consistently across pages, including:
  - Your website feels like hard work
  - It is not obvious what to do next
  - People leave
  - I fix that
  - I remove the friction
  - I make it obvious what to do next
- **Consistency_Check**: A four-question validation applied to every page before deployment
- **Structured_Data**: Machine-readable metadata embedded in page HTML using JSON-LD
- **JSON_LD**: JavaScript Object Notation for Linked Data, embedded in `<script type="application/ld+json">` tags
- **Schema_Type**: A specific vocabulary type from schema.org, such as LocalBusiness, Service, FAQPage
- **Pain_Point_Language**: Copy that describes real problems visitors and business owners experience, matching the visible page copy
- **GEO_Fields**: Schema fields that matter most for Generative Engine Optimisation and rich understanding:
  - description
  - serviceType
  - areaServed
  - audience
  - provider
  - offers
  - knowsAbout
  - contactPoint
  - openingHoursSpecification
  - sameAs
  - mainEntity
  - mainEntityOfPage
- **Site_Wide_Baseline**: The default schema set for commercial and informational public pages:
  - Organization
  - LocalBusiness
  - WebPage
  - BreadcrumbList
- **Schema_Integrity**: The rule that structured data descriptions must match visible page copy and must not contain fake reviews, invisible FAQ content, unsupported ratings, exaggerated results, or claims not present on the page
- **Canonical_Hosting_Route**: The single approved hosting route used everywhere on the site. This specification standardises on `/services/website-hosting/`
- **Canonical_Contact_Details**: The one approved email address, phone number, and business contact details used consistently across copy, components, metadata, and schema

---

## Requirements

### Requirement 1: Eliminate Generic Benefit Statements from All Pages

**User Story:** As a site visitor, I want every sentence to describe something real, so that I trust the person behind the site instead of feeling like I am reading a template.

#### Acceptance Criteria

1. THE Website SHALL contain zero instances of the following generic phrases across all Pages:
   - help businesses grow
   - improve your online presence
   - solutions tailored to your needs
   - high-quality services
   - designed to help
   - enhance your ability
   - comprehensive
   - leverage
   - streamline
2. WHEN a Page contains a vague benefit statement that does not describe a specific problem, consequence, or outcome, THE Copy_Transformation SHALL replace the statement with Direct_Copy
3. THE Website SHALL contain zero instances of "professional" unless it is followed by a specific qualifier, proof point, or context visible on the page
4. THE Website SHALL contain zero sentences that use the word "solutions"

---

### Requirement 2: Replace Feature-Led Copy with Outcome-Led Copy

**User Story:** As a business owner reading the site, I want to see what changes for me, not a list of features, so that I understand the value immediately.

#### Acceptance Criteria

1. WHEN a Page contains a sentence that lists a feature without stating the outcome, THE Copy_Transformation SHALL rewrite the sentence to state the outcome first
2. THE Website SHALL replace all instances of feature lists such as "Mobile-first, responsive design" or "SEO-ready for local search" with outcome statements that explain what the feature does for the visitor
3. WHEN a Service_Page describes a service offering, THE Service_Page SHALL lead each description with the problem it solves, not the feature it provides
4. THE Website SHALL replace the pattern "I design fast websites that turn visitors into leads" with Direct_Copy that describes the real problem and the real change

---

### Requirement 3: Remove Filler Phrases from All Copy

**User Story:** As a visitor scanning the page, I want every word to earn its place, so that I get the point quickly without wading through padding.

#### Acceptance Criteria

1. THE Website SHALL contain zero instances of the following filler phrases:
   - no jargon
   - no fuss
   - plain English
   - no obligation
   - no pressure
   - no sales pitch
   - whichever you prefer
   - clear next steps
2. WHEN a sentence contains a filler phrase that adds no specific information, THE Copy_Transformation SHALL remove the filler phrase or replace the entire sentence with a shorter Direct_Copy alternative
3. THE Website SHALL contain zero sentences that begin with "That's" as a conversational filler
4. THE Website SHALL contain zero instances of "actually" used as emphasis filler

---

### Requirement 4: Enforce Short Sentence Structure

**User Story:** As a visitor reading on mobile, I want short sentences with one idea per line, so that I can scan the page quickly and understand the message.

#### Acceptance Criteria

1. THE Website SHALL break all sentences longer than 20 words into two or more shorter sentences, each containing one idea
2. THE Website SHALL break all paragraphs longer than three sentences into shorter blocks with line breaks between ideas
3. WHEN a SCRAM_Component contains default copy with sentences longer than 20 words, THE SCRAM_Component SHALL be updated with shorter Direct_Copy
4. THE Website SHALL use line breaks to separate distinct ideas rather than joining them with commas or conjunctions

---

### Requirement 5: Enforce Voice Rules Across All Copy

**User Story:** As a visitor, I want the site to sound like one real person talking to me, so that I feel like I am dealing with a human, not a brand.

#### Acceptance Criteria

1. THE Website SHALL use "I" exclusively and contain zero instances of "we" in any copy across all Pages
2. THE Website SHALL contain zero em dashes across all Pages
3. THE Website SHALL contain zero buzzwords including:
   - bespoke
   - cutting-edge
   - innovative
   - seamless
   - robust
   - scalable
   - holistic
   - synergy
   - optimize
   - empower
4. WHEN a Page contains a vague claim that cannot be verified by reading the page, THE Copy_Transformation SHALL replace the claim with a specific, verifiable statement
5. THE Website SHALL use direct, practical tone throughout. Sentences state facts, describe problems, or show outcomes

---

### Requirement 6: Apply Core Language System Consistently

**User Story:** As a visitor navigating between pages, I want to hear the same core message repeated in different contexts, so that the site feels coherent and the message sticks.

#### Acceptance Criteria

1. THE Homepage SHALL include at least two phrases from the Core_Language system
2. THE Website_Design Service_Page SHALL include at least two phrases from the Core_Language system
3. WHEN a Service_Page describes the core problem, THE Service_Page SHALL use Core_Language phrasing rather than inventing new variations of the same idea
4. THE Website SHALL use "I remove the friction" or "I make it obvious what to do next" on at least three Pages
5. THE Website SHALL not repeat any single Core_Language phrase more than two times on the same page unless required in a CTA or FAQ context

---

### Requirement 7: Transform CTA Copy from Generic to Direct

**User Story:** As a visitor ready to take action, I want the CTA to tell me exactly what happens next in plain terms, so that I click without hesitation.

#### Acceptance Criteria

1. THE Website SHALL replace all generic CTA headings such as "Ready to get more enquiries?" or "Let's fix your website" with direct statements that describe what happens when the visitor takes action
2. WHEN a CTABlock contains body copy with filler phrases, THE CTABlock SHALL be updated with Direct_Copy that states a fact or outcome
3. THE Website SHALL replace "Book a free call" CTA labels with more direct alternatives that reduce friction, such as:
   - Send me your website
   - Tell me what is not working
4. THE Contact Page SHALL use the CTA pattern:
   - Send me your website.
   - I will tell you what is not working.

---

### Requirement 8: Transform SCRAM Component Default Copy

**User Story:** As the site owner, I want the shared components to use the same direct voice as the rest of the site, so that no section sounds different from the pages around it.

#### Acceptance Criteria

1. WHEN the WhyWebsitesFail SCRAM_Component contains default copy, THE WhyWebsitesFail component SHALL be rewritten using short sentences following Voice_Rules
2. WHEN the SpeedToEnquiries SCRAM_Component contains default body copy longer than 20 words per sentence, THE SpeedToEnquiries component SHALL be rewritten with shorter Direct_Copy
3. WHEN the ServiceEntryGuide SCRAM_Component contains solution descriptions, THE ServiceEntryGuide component SHALL rewrite each description using the problem, consequence, outcome pattern in short sentences
4. THE ProblemMirror followUp text on every Page SHALL be rewritten to use short sentences with one idea per line, removing filler phrases

---

### Requirement 9: Transform Page-Specific Copy

**User Story:** As a visitor on any page, I want the copy to follow the SCRAM page-specific rules, so that each page does its job without generic filler.

#### Acceptance Criteria

1. WHEN the Homepage displays copy, THE Homepage SHALL open with immediate recognition:
   - Your website looks fine.
   - But it feels like hard work.
2. WHEN the About Page displays copy, THE About Page SHALL build trust through specific real work examples such as NYCC, BBC News, and Business Insider, without generic "tested in real business environments" framing
3. WHEN the Services Page displays copy, THE Services Page SHALL guide the visitor's decision with "Pick the problem that sounds like yours" and each service SHALL start with a problem and end with an outcome
4. WHEN the Contact Page displays copy, THE Contact Page SHALL reduce hesitation with the pattern:
   - Send me your website.
   - I will tell you what is not working.
5. WHEN the Pricing Page displays copy, THE Pricing Page SHALL remove uncertainty with real price anchors and direct statements, with no filler reassurance
6. WHEN the Website_Design Service_Page displays copy, THE Website_Design Service_Page SHALL use:
   - Your website is not broken.
   - It feels like hard work.
7. WHEN the Hosting Service_Page displays copy, THE Hosting Service_Page SHALL reframe around:
   - Your website is slow.
   - People leave.
8. WHEN Blog Pages display copy, THE Blog Pages SHALL connect to a real problem, link to services, and end with a direct CTA

---

### Requirement 10: Eliminate Repetitive Reassurance Patterns

**User Story:** As a visitor, I want reassurance to feel natural and earned, not repeated so often it sounds scripted.

#### Acceptance Criteria

1. THE Website SHALL limit "I reply the same day" to a maximum of one occurrence per Page
2. THE Website SHALL limit "Based in Nantwich, working with South Cheshire businesses" to a maximum of one occurrence per Page
3. THE Website SHALL limit "You deal directly with me" to a maximum of one occurrence per Page
4. WHEN a reassurance phrase appears more than once on a single Page, THE Copy_Transformation SHALL remove the duplicate and keep only the most impactful placement

---

### Requirement 11: Consistency Check Before Deployment

**User Story:** As the site owner, I want every page validated against the SCRAM rules before it goes live, so that no generic copy slips through.

#### Acceptance Criteria

1. WHEN a Page is ready for deployment, THE Consistency_Check SHALL verify the page passes all four questions:
   - Does this sound like a real conversation?
   - Does this describe a real problem?
   - Is this shorter than it was before?
   - Would a business owner understand this instantly?
2. THE Website SHALL pass the Consistency_Check on every Page before deployment via S3 and CloudFront
3. IF a Page fails any Consistency_Check question, THEN THE Page SHALL be revised until all four questions pass

---

### Requirement 12: Photography Page Content Preservation

**User Story:** As the site owner, I want the photography page to keep its approved content guidelines during the copy elimination pass, so that no legacy content is reintroduced.

#### Acceptance Criteria

1. THE Photography_Page SHALL continue to use `photography-hero.webp` as the hero image
2. THE Photography_Page SHALL only display the approved statistics:
   - 3,500+ licensed images
   - 90+ countries
3. THE Photography_Page SHALL use narrative copy instead of statistics blocks or metric grids
4. THE Photography_Page SHALL not reintroduce legacy metric grids such as 3+, 50+, or 100+
5. WHEN the Photography_Page copy is transformed, THE Copy_Transformation SHALL apply Voice_Rules and short sentence structure while preserving the approved statistics and narrative style

---

### Requirement 13: Replace Technical Language with Plain Outcomes

**User Story:** As a business owner who is not technical, I want to understand what everything means without needing to know web development terms.

#### Acceptance Criteria

1. THE Website SHALL replace "SEO optimisation" with a plain outcome statement describing what the visitor gains
2. THE Website SHALL replace "Lighthouse mobile performance" references with plain language describing the speed improvement a visitor experiences
3. THE Website SHALL replace "secure cloud infrastructure" with a plain description of what the visitor gets
4. WHEN a Page contains technical terms that a non-technical business owner would not understand, THE Copy_Transformation SHALL replace the term with a plain outcome description

---

### Requirement 14: Canonical Hosting Route Consistency

**User Story:** As a visitor and search engine, I want the hosting service to exist on one canonical route only, so that links, metadata, breadcrumbs, and sitemap references stay consistent.

#### Acceptance Criteria

1. THE Website SHALL use `/services/website-hosting/` as the Canonical_Hosting_Route
2. THE Website SHALL contain zero internal links to alternative hosting service routes
3. THE Website metadata, breadcrumb schema, canonical tags, CTAs, sitemap, and service cards SHALL all use the Canonical_Hosting_Route

---

### Requirement 15: Canonical Contact Details Consistency

**User Story:** As a visitor and search engine, I want one consistent set of contact details across the site, so that trust and contact accuracy are not undermined.

#### Acceptance Criteria

1. THE Website SHALL use one canonical email address across visible copy, CTA components, metadata, Contact page, and JSON-LD contactPoint fields
2. THE Website SHALL use one canonical phone number format across visible copy and structured data
3. THE Canonical_Contact_Details SHALL be defined once in a shared configuration source and reused site-wide where practical

---

### Requirement 16: Site-Wide Structured Data Baseline

**User Story:** As a search engine or AI system crawling the site, I want consistent baseline structured data on every public page, so that I understand the business identity, location, and page hierarchy regardless of which page I land on.

#### Acceptance Criteria

1. THE Website SHALL include the Site_Wide_Baseline on all commercial and informational public Pages unless a page-specific requirement explicitly narrows the schema set
2. THE LocalBusiness JSON_LD SHALL include:
   - name set to "Vivid Media Cheshire"
   - areaServed covering Nantwich, Crewe, and South Cheshire
   - a description using Pain_Point_Language
3. THE Organization JSON_LD SHALL include:
   - founder or employee set to "Joe Morris"
   - knowsAbout covering website redesign, CRO, content strategy, Google Ads, analytics, and photography
   - sameAs linking only to real public social profiles
4. THE BreadcrumbList JSON_LD SHALL reflect the actual URL hierarchy of each Page
5. THE LocalBusiness description field SHALL use Pain_Point_Language and SHALL NOT use generic phrases such as "digital services" or "online presence enhancement"

---

### Requirement 17: Schema Integrity and Accuracy Rules

**User Story:** As the site owner, I want the structured data to be honest and match what visitors actually see on the page, so that search engines trust the site and no penalties are triggered.

#### Acceptance Criteria

1. THE Website SHALL NOT include Review or AggregateRating Schema_Types unless real, verifiable reviews are visible on the page
2. THE Website SHALL NOT include FAQPage Schema_Types unless FAQ content is visible on the page
3. THE Website SHALL NOT include Offer or AggregateOffer Schema_Types unless pricing information is visible on the page
4. WHEN a JSON_LD description field is set, THE description SHALL use the same Pain_Point_Language as the visible copy on that Page
5. THE Website SHALL NOT include claims, results, or credentials in Structured_Data that are not present in the visible page copy
6. THE Website SHALL NOT include SpeakableSpecification Schema_Types unless concise summary blocks are visible on the page
7. Structured_Data SHALL only be added after the visible page copy has been updated to the final approved language for that page

---

### Requirement 18: Homepage Structured Data

**User Story:** As a search engine crawling the homepage, I want rich structured data describing the business, its location, and its core value proposition, so that the homepage appears correctly in local search and rich results.

#### Acceptance Criteria

1. THE Homepage SHALL include LocalBusiness, WebPage, Organization, and BreadcrumbList JSON_LD as defined in the Site_Wide_Baseline
2. WHEN FAQ content is visible on the Homepage, THE Homepage SHALL include FAQPage JSON_LD
3. WHEN voice-style summary blocks are visible on the Homepage, THE Homepage SHALL include SpeakableSpecification JSON_LD
4. THE Homepage JSON_LD description fields SHALL emphasise:
   - South Cheshire website redesign
   - conversion-focused website improvements
   - mobile-first clarity
   - helping businesses get more enquiries
5. THE Homepage LocalBusiness JSON_LD SHALL include contactPoint and openingHoursSpecification fields

---

### Requirement 19: About Page Structured Data

**User Story:** As a search engine crawling the about page, I want structured data describing Joe Morris as a real person with specific credentials and accountability, so that the about page supports trust signals in search results.

#### Acceptance Criteria

1. THE About Page SHALL include AboutPage, Person, LocalBusiness, and BreadcrumbList JSON_LD
2. THE Person JSON_LD SHALL include worksFor, jobTitle, and knowsAbout fields
3. THE Person JSON_LD SHALL include award or hasCredential fields only when the corresponding credentials are named in the visible page copy
4. THE Person JSON_LD SHALL include sameAs only for real public profiles that exist and are linked from the page
5. THE About Page JSON_LD SHALL reinforce:
   - direct accountability
   - no account manager layer
   - real operational improvement work
   using Pain_Point_Language

---

### Requirement 20: Services Overview Page Structured Data

**User Story:** As a search engine crawling the services overview, I want structured data listing all services with problem-first descriptions, so that each service is understood in terms of the problem it solves.

#### Acceptance Criteria

1. THE Services Page SHALL include CollectionPage, ItemList, LocalBusiness, and BreadcrumbList JSON_LD
2. THE ItemList JSON_LD SHALL contain nested Service items for:
   - Website redesign
   - Slow website fixes and hosting migration
   - Google Ads management
   - Analytics and clarity
   - Photography services
3. WHEN describing each Service ListItem, THE JSON_LD description SHALL state the problem first
4. THE Services Page JSON_LD SHALL NOT describe services using generic language such as "comprehensive digital solutions" or "performance optimisation"

---

### Requirement 21: Website Design Page Structured Data

**User Story:** As a search engine crawling the website design page, I want the richest service schema on the site describing the redesign service with pain-point language, so that this page has the strongest structured data signal for local website design searches.

#### Acceptance Criteria

1. THE Website_Design Service_Page SHALL include Service, WebPage, and BreadcrumbList JSON_LD
2. WHEN FAQ content is visible on the Website_Design Service_Page, THE Website_Design Service_Page SHALL include FAQPage JSON_LD with questions such as:
   - Why is my website not getting enquiries?
   - Do I need a full rebuild or just improvements?
   - How much does a small business website cost?
   - Will this help on mobile?
3. THE Service JSON_LD SHALL include:
   - serviceType set to "Website Redesign" or "Conversion-Focused Website Design"
   - areaServed covering Nantwich, Crewe, and South Cheshire
   - provider set to Vivid Media Cheshire
4. THE Service JSON_LD SHALL include audience describing trades, local services, and SMEs
5. THE Service JSON_LD SHALL include Offer or AggregateOffer only when pricing is visible on the page
6. THE Service JSON_LD description SHALL use Pain_Point_Language

---

### Requirement 22: Hosting Page Structured Data

**User Story:** As a search engine crawling the hosting page, I want structured data describing the speed and hosting migration service with pain-point framing, so that the page ranks for searches about slow websites and hosting problems.

#### Acceptance Criteria

1. THE Hosting Service_Page SHALL include Service and BreadcrumbList JSON_LD
2. WHEN FAQ content is visible on the Hosting Service_Page, THE Hosting Service_Page SHALL include FAQPage JSON_LD with questions such as:
   - Why is my website so slow?
   - Will faster hosting help enquiries?
   - Can you migrate my current site?
   - Will my website go offline during migration?
3. THE Service JSON_LD SHALL include:
   - serviceType set to "Website Speed Improvement and Hosting Migration"
   - audience describing small businesses with slow or expensive sites
4. THE Service JSON_LD description SHALL use Pain_Point_Language

---

### Requirement 23: Ad Campaigns Page Structured Data

**User Story:** As a search engine crawling the ad campaigns page, I want structured data describing the Google Ads management service with honest pain-point language, so that the page ranks for searches about ads not working.

#### Acceptance Criteria

1. THE Ad Campaigns Service_Page SHALL include Service and BreadcrumbList JSON_LD
2. WHEN FAQ content is visible on the Ad Campaigns Service_Page, THE Ad Campaigns Service_Page SHALL include FAQPage JSON_LD
3. THE Service JSON_LD SHALL include serviceType set to "Google Ads Campaign Management" and audience describing South Cheshire trades and local services
4. THE Service JSON_LD description SHALL use Pain_Point_Language
5. WHEN specific outcome numbers are mentioned in Structured_Data, THE JSON_LD SHALL keep the numbers contextual and accurate, matching what is stated on the visible page

---

### Requirement 24: Analytics Page Structured Data

**User Story:** As a search engine crawling the analytics page, I want structured data describing the analytics and tracking service with clarity-focused pain-point language, so that the page ranks for searches about marketing confusion and tracking problems.

#### Acceptance Criteria

1. THE Analytics Service_Page SHALL include Service and BreadcrumbList JSON_LD
2. WHEN FAQ content is visible on the Analytics Service_Page, THE Analytics Service_Page SHALL include FAQPage JSON_LD
3. THE Service JSON_LD SHALL include serviceType set to:
   - Website and Marketing Analytics Setup
   - or Conversion Tracking and Reporting
4. THE Service JSON_LD description SHALL use Pain_Point_Language

---

### Requirement 25: Photography Page Structured Data

**User Story:** As a search engine crawling the photography page, I want structured data describing the photography service with trust-focused pain-point language and portfolio markup, so that the page supports image search and visual trust signals.

#### Acceptance Criteria

1. THE Photography_Page SHALL include Service and BreadcrumbList JSON_LD
2. THE Photography_Page SHALL include ImageGallery or ItemList JSON_LD for portfolio entries visible on the page
3. WHEN selected portfolio items are displayed, THE Photography_Page SHALL include CreativeWork JSON_LD for those items
4. THE Service JSON_LD description SHALL use Pain_Point_Language
5. THE Photography_Page JSON_LD SHALL describe the service as commercial and editorial photography, visuals that build trust, and imagery supporting websites and campaigns

---

### Requirement 26: Pricing Page Structured Data

**User Story:** As a search engine crawling the pricing page, I want the strongest commercial support schema with offer catalog and price specifications, so that the page ranks for cost-related searches and reduces visitor uncertainty.

#### Acceptance Criteria

1. THE Pricing Page SHALL include WebPage and BreadcrumbList JSON_LD
2. WHEN pricing information is visible on the Pricing Page, THE Pricing Page SHALL include PriceSpecification and OfferCatalog JSON_LD
3. THE OfferCatalog JSON_LD SHALL list offers only for items visibly listed on the page
4. WHEN FAQ content is visible on the Pricing Page, THE Pricing Page SHALL include FAQPage JSON_LD
5. THE Pricing Page JSON_LD description SHALL use Pain_Point_Language

---

### Requirement 27: Contact Page Structured Data

**User Story:** As a search engine crawling the contact page, I want structured data with contact details and opening hours, so that the business appears correctly in local search and contact-related queries.

#### Acceptance Criteria

1. THE Contact Page SHALL include ContactPage, LocalBusiness, and BreadcrumbList JSON_LD
2. THE LocalBusiness JSON_LD SHALL include:
   - telephone
   - email
   - openingHoursSpecification
   - areaServed
   - contactPoint
3. THE Contact Page JSON_LD description SHALL use Pain_Point_Language:
   - not sure where to start
   - wants a direct answer
   - wants low-friction contact

---

### Requirement 28: Free Audit Page Structured Data

**User Story:** As a search engine crawling the free audit page, I want structured data framing the audit as a diagnostic service, so that the page ranks for searches about website reviews and marketing audits.

#### Acceptance Criteria

1. THE Free Audit Page SHALL include Service, WebPage, and BreadcrumbList JSON_LD
2. WHEN FAQ content is visible on the Free Audit Page, THE Free Audit Page SHALL include FAQPage JSON_LD
3. THE Service JSON_LD SHALL describe the service as:
   - Website Review
   - Website and Marketing Audit
   - or Conversion Review
4. THE Service JSON_LD description SHALL use Pain_Point_Language

---

### Requirement 29: Blog Index Page Structured Data

**User Story:** As a search engine crawling the blog index, I want structured data describing the blog as a collection of practical, results-focused content, so that the blog is understood as a source of real lessons rather than generic content marketing.

#### Acceptance Criteria

1. THE Blog Index Page SHALL include Blog, CollectionPage, BreadcrumbList, and ItemList JSON_LD
2. THE Blog Index JSON_LD description SHALL position the blog around enquiry generation, marketing clarity, and practical examples using Pain_Point_Language
3. THE Blog Index JSON_LD SHALL NOT describe the blog as a content hub or use generic content marketing language

---

### Requirement 30: Individual Blog Post Structured Data

**User Story:** As a search engine crawling an individual blog post, I want structured data describing the post with appropriate schema richness based on content type, so that high-value posts get richer search result treatment.

#### Acceptance Criteria

1. THE Website SHALL include BlogPosting and BreadcrumbList JSON_LD on every individual blog post page
2. WHEN a blog post contains step-by-step instructions, THE blog post SHALL include HowTo JSON_LD
3. WHEN a blog post contains visible FAQ content, THE blog post SHALL include FAQPage JSON_LD
4. WHEN a blog post contains concise summary blocks suitable for voice results, THE blog post SHALL include SpeakableSpecification JSON_LD
5. THE BlogPosting JSON_LD description SHALL use Pain_Point_Language relevant to the post topic

---

### Requirement 31: Privacy Policy Page Structured Data

**User Story:** As a search engine crawling the privacy policy, I want minimal structured data identifying the page type, so that the page is correctly classified without unnecessary schema.

#### Acceptance Criteria

1. THE Privacy Policy Page SHALL include WebPage and BreadcrumbList JSON_LD
2. THE WebPage JSON_LD SHALL identify the page as a privacy policy page

---

### Requirement 32: Structured Data Implementation Priority

**User Story:** As the site owner, I want structured data implemented in priority order based on commercial impact, so that the highest-value pages get schema first.

#### Acceptance Criteria

1. THE Website SHALL implement Homepage structured data as the first priority
2. THE Website SHALL implement Website Design page structured data as the second priority
3. THE Website SHALL implement Pricing page structured data as the third priority
4. THE Website SHALL implement Free Audit page structured data as the fourth priority
5. THE Website SHALL implement Blog post structured data as the fifth priority
6. THE Website SHALL populate GEO_Fields on all applicable Schema_Types

---

## Final Rule

This website is not about design.
It is about making it easy for people to contact your business.
