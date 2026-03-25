# Requirements Document

## Introduction

This specification covers the third SCRAM evolution pass for the Vivid Media Cheshire website. The previous two passes (scram-website-overhaul and scram-copy-elimination) restructured every page around problem-led messaging, added CTA blocks, problem mirrors, objection handlers, eliminated generic copy, and implemented structured data.

This pass turns the site into a proof-driven enquiry system. The homepage currently gives equal visual weight to five services and lacks concrete proof blocks. This pass narrows the homepage to website redesign and hosting only, adds before/after speed proof, NYCC operational proof, THEFEEDGROUP campaign proof, compact stock photography proof, simplifies the CTA system to one dominant action, restores authority proof on the photography page, enforces proof attribution rules site-wide, and extends CTA and copy improvements to the pricing, about, and contact pages.

The site must feel lighter, not heavier, after changes. It must feel more human, not more AI-generated. Proof blocks are placed where they fit rather than stacked on every page.

The site is a Next.js static export deployed via S3 and CloudFront.

---

## Glossary

- **Website**: The Vivid Media Cheshire Next.js static site deployed via S3 and CloudFront
- **Homepage**: The root page at `src/app/page.tsx`
- **Photography_Page**: The photography service page at `src/app/services/photography/page.tsx`
- **Website_Design_Page**: The website design service page at `src/app/services/website-design/page.tsx`
- **Hosting_Page**: The hosting service page at the canonical route `/services/website-hosting/`, implemented in the matching TSX file and used consistently across links, metadata, schema, and navigation. Kiro must use one canonical route only across internal links, CTA links, metadata canonical tags, breadcrumb schema, sitemap entries, and page references in shared components. No alternate hosting route should remain in production.
- **Services_Page**: The services overview page at `src/app/services/page.tsx`
- **Pricing_Page**: The pricing page at `src/app/pricing/page.tsx`
- **About_Page**: The about page at `src/app/about/page.tsx`
- **Contact_Page**: The contact page at `src/app/contact/page.tsx`
- **CTA_System**: The site-wide call-to-action pattern consisting of one primary action and one secondary action
- **Primary_CTA**: "Send me your website" linking to `/contact/`
- **Secondary_CTA**: "Email me directly" linking to mailto:joe@vividmediacheshire.com
- **Speed_Proof_Block**: A before/after proof section showing load time improvement from 14+ seconds to under 2 seconds and performance score from 56 to 99
- **NYCC_Proof_Block**: An operational proof section showing reduced admin time by 8 hours per year, clearer booking and information structure, fewer confused enquiries, and social growth of 270 followers, 66 posts, 475 reactions in 90 days
- **THEFEEDGROUP_Proof_Block**: A campaign proof section showing 40 clicks, 1.25K impressions, approximately 3.14% CTR, and average CPC of approximately £3.58 from Google Ads data
- **Flyer_ROI_Proof**: The Vivid Auto flyer campaign result of £13,563.92 revenue, £546 cost, 2,380% ROI, approved ONLY in flyer or offline campaign context
- **Stock_Photography_Proof**: The stock photography earnings proof of $2.36 to $1,166.07 revenue growth, used as behaviour and consistency proof showing what people repeatedly need, not as a central commercial claim
- **Stock_Photography_Proof_Block**: A compact homepage section showing stock photography revenue growth from $2.36 to $1,166.07, one revenue trend chart or image, one or two top-selling image examples, and the interpretation: "I do not guess what people click on. I have built this by learning what people repeatedly need."
- **Authority_Proof**: Named publications and brands where photography has been published including BBC, Financial Times, Business Insider, CNN, AutoTrader, and The Times. Any additional publication name may only be used if visibly supported on the page.
- **Proof_Attribution**: The rule that every proof data point must be attributed to the correct source and context, and must not be used outside its approved context
- **Proof_Hierarchy**: The site-wide ordering of proof importance: 1. speed before/after, 2. NYCC clarity and time, 3. THEFEEDGROUP traffic and landing, 4. photography publication, 5. stock photography demand
- **SCRAM_Conversion_Flow**: The page-level pattern of Recognition, Explanation, Proof, Action that every major page must follow
- **Proof_Block**: A visible section on a page that answers three questions: what changed, by how much, and why it matters
- **Homepage_Services_Scope**: Only website redesign and website hosting appear as service cards on the Homepage
- **Services_Page_Scope**: All five services appear on the Services_Page as the segmentation layer
- **Weight_Rule**: The principle that the site must feel lighter not heavier after changes, avoiding stacked proof blocks, clustered CTAs, repeated phrasing patterns, and generic dramatic language

---

## Requirements

### Requirement 1: Homepage Hero — Immediate Recognition and Single CTA

**User Story:** As a local business owner landing on the homepage, I want to immediately recognise my problem and see one clear action to take, so that I know this person understands my situation and I know what to do next.

#### Acceptance Criteria

1. WHEN a Visitor loads the Homepage, THE Hero_Section SHALL communicate that a website may look fine but still fail to generate enquiries
2. WHEN a Visitor loads the Homepage, THE Hero_Section SHALL communicate that visitors leave when a site is slow, unclear, or hard to use
3. THE Homepage Hero_Section SHALL display "Send me your website" as the sole Primary_CTA
4. THE Homepage Hero_Section SHALL NOT display "Book a free call", "Get started", "Request a review", or any alternative primary action
5. THE Homepage Hero_Section SHALL communicate that Joe improves websites by reducing friction so more people enquire
6. THE Hero_Section MAY split its messaging between the heading, the subline, and one short support sentence
7. THE Hero_Section SHALL NOT attempt to explain every website failure mode in one paragraph
8. THE Hero_Section must remain brief, readable, and visually strong

---

### Requirement 2: Homepage Above-Fold CTA Block

**User Story:** As a visitor who has read the hero, I want a clear CTA block immediately below the hero and above the fold, so that I can take action before scrolling into proof sections.

#### Acceptance Criteria

1. THE Homepage SHALL display one CTA_Block immediately below the hero and before the first proof section
2. THE above-fold CTA_Block SHALL display "Send me your website" as the Primary_CTA
3. THE above-fold CTA_Block SHALL display "Email me directly" as the Secondary_CTA
4. THE above-fold CTA_Block SHALL appear before the "why websites fail" explanation section
5. THE above-fold CTA_Block SHALL NOT display "Book a free call", "Get started", "Request a review", "Check availability", or "Call about photography"

---

### Requirement 3: Homepage Core Problem Explanation — Why Websites Fail

**User Story:** As a visitor, I want a clear explanation of why websites fail in plain language, so that I understand the root cause before seeing the solution.

#### Acceptance Criteria

1. THE Homepage SHALL include a "why websites fail" section as the third section after the above-fold CTA block
2. THE Homepage problem explanation section SHALL cover the strongest 3 to 4 causes of enquiry failure in plain language
3. These causes MUST include: structure, clarity, and speed
4. Other causes MAY appear only if they do not overload the section
5. The section must remain compact and easy to scan
6. THE problem explanation section SHALL use language that describes what a visitor experiences rather than technical jargon
7. THE problem explanation section SHALL appear BEFORE the Speed_Proof_Block in the page order

---

### Requirement 4: Homepage Speed Proof — Performance Chart

**User Story:** As a visitor, I want to see concrete before/after speed evidence on the homepage, so that I believe this person can actually improve my website.

#### Acceptance Criteria

1. THE Homepage SHALL display a Speed_Proof_Block showing load time improvement from 14+ seconds to under 2 seconds
2. THE Homepage SHALL display a Speed_Proof_Block showing performance score improvement from 56 to 99
3. THE Speed_Proof_Block SHALL appear as the fourth section on the Homepage, after the "why websites fail" explanation
4. THE Speed_Proof_Block SHALL connect speed improvement to outcomes: more people staying on the page, seeing the offer, and a higher chance of enquiry
5. THE Speed_Proof_Block SHALL NOT present speed as a purely technical metric without connecting it to enquiry generation
6. THE Website SHALL clearly identify whether the Speed_Proof_Block data comes from Joe's own website or a client project
7. The source context must be visible wherever the proof is used
8. THE Speed_Proof_Block SHALL remain visually compact and commercially relevant
9. THE Speed_Proof_Block must not read like a technical audit report
10. The emphasis must stay on what changed, how much it changed, and why that matters for enquiries

---

### Requirement 5: Homepage NYCC Proof Block

**User Story:** As a visitor, I want to see proof of real operational improvement from a named client, so that I trust this person delivers measurable results.

#### Acceptance Criteria

1. THE Homepage SHALL display an NYCC_Proof_Block as the fifth section, after the Speed_Proof_Block
2. THE NYCC_Proof_Block SHALL show reduced admin time by 8 hours per year
3. THE NYCC_Proof_Block SHALL show clearer booking and information structure and fewer confused enquiries
4. THE NYCC_Proof_Block SHALL show social growth support proof: 270 followers, 66 posts, 475 reactions in 90 days
5. THE NYCC_Proof_Block SHALL prioritise proof in this order: reduced admin time first, clearer information second, social growth third, quote or praise fourth
6. THE NYCC_Proof_Block SHALL answer the three Proof_Block questions: what changed, by how much, and why it matters

---

### Requirement 6: Homepage Services Scope — Redesign and Hosting Only

**User Story:** As a visitor on the homepage, I want to see only the two core services so that I understand the primary offering without being overwhelmed by breadth.

#### Acceptance Criteria

1. THE Homepage services section SHALL display only two service cards: website redesign and website hosting
2. THE Homepage services section SHALL appear as the sixth section, after the NYCC_Proof_Block
3. THE Homepage services section SHALL NOT display photography, Google Ads, or analytics as equal service cards
4. THE website redesign card SHALL frame the service as fixing structure, making action obvious, and improving enquiry flow
5. THE website hosting card SHALL frame the service as removing delays, making the site faster, reducing friction, and keeping people on the page
6. THE Homepage services section SHALL replace the current five-card grid with a two-card layout
7. THE Homepage services section SHALL include a link to the full Services_Page for visitors who need broader service options

---

### Requirement 7: Homepage THEFEEDGROUP Campaign Learning Block

**User Story:** As a visitor, I want to see real campaign data that demonstrates the relationship between traffic and website quality, so that I understand why fixing the website matters before spending on ads.

#### Acceptance Criteria

1. THE Homepage SHALL display a THEFEEDGROUP_Proof_Block as the seventh section, after the services section
2. THE THEFEEDGROUP_Proof_Block SHALL show: 40 clicks, 1.25K or 1.27K impressions, approximately 3.14% or 3.19% CTR, and average CPC of approximately £3.58
3. THE THEFEEDGROUP_Proof_Block SHALL communicate the message that traffic does not fix a weak website and that the page has to match what people search for
4. THE Homepage SHALL NOT use the Vivid Auto flyer campaign result in the THEFEEDGROUP_Proof_Block or any non-flyer context on the Homepage
5. THE THEFEEDGROUP_Proof_Block SHALL attribute the data to THEFEEDGROUP Google Ads campaign
6. THE THEFEEDGROUP_Proof_Block SHALL use one approved final figure set consistently across all visible copy, design labels, supporting text, and schema
7. THE THEFEEDGROUP_Proof_Block SHALL NOT mix alternative rounded values on the same page

---

### Requirement 8: Homepage Final CTA Block

**User Story:** As a visitor who has scrolled through the homepage proof, I want a clear final action with an explanation of what happens next, so that I feel confident taking the step.

#### Acceptance Criteria

1. THE Homepage final CTA section SHALL appear as the eighth section, after the THEFEEDGROUP_Proof_Block
2. THE Homepage final CTA section SHALL display "Send me your website" as the Primary_CTA
3. THE Homepage final CTA section SHALL display "Email me directly" as the only Secondary_CTA
4. THE Homepage final CTA section SHALL explain what happens after the visitor takes action
5. THE Homepage final CTA section SHALL NOT display "Book a free call", "Get started", "Request a review", "Check availability", or "Call about photography"

---

### Requirement 9: Homepage Stock Photography Proof — Compact Section

**User Story:** As a visitor, I want to see compact proof that this person understands what people repeatedly need, so that I trust the depth of experience behind the work.

#### Acceptance Criteria

1. THE Homepage SHALL display a Stock_Photography_Proof_Block showing revenue growth from $2.36 to $1,166.07
2. THE Stock_Photography_Proof_Block SHALL include one revenue trend chart or image
3. THE Stock_Photography_Proof_Block SHALL include one or two top-selling image examples
4. THE Stock_Photography_Proof_Block SHALL be placed below the main conversion proof sections, not above them
5. THE Stock_Photography_Proof_Block SHALL include the interpretation: "I do not guess what people click on. I have built this by learning what people repeatedly need."
6. THE Stock_Photography_Proof_Block SHALL NOT be given equal visual weight to the Speed_Proof_Block or NYCC_Proof_Block
7. THE Stock_Photography_Proof_Block SHALL be visually smaller and lower in hierarchy than the Speed_Proof_Block and the NYCC_Proof_Block
8. THE Stock_Photography_Proof_Block SHALL be treated as supporting authority proof, not primary homepage conversion proof
9. THE Stock_Photography_Proof_Block must not receive equal visual emphasis to the main proof blocks

---

### Requirement 10: Homepage FAQ Trimming

**User Story:** As a visitor on the homepage, I want FAQs that are focused on the homepage topics only, so that I am not distracted by questions about services covered on other pages.

#### Acceptance Criteria

1. THE Homepage FAQ section SHALL cover only: redesign, hosting, speed, and enquiry clarity
2. THE Homepage FAQ section SHALL NOT include detailed Google Ads questions on the Homepage
3. WHEN Google Ads FAQ content is removed from the Homepage, THE Website SHALL move broader Google Ads detail to the appropriate service page
4. THE Homepage FAQ section SHALL remove questions about areas served, general timelines, and other topics not directly related to redesign, hosting, speed, or enquiry clarity

---

### Requirement 11: Homepage Blog and Supporting Content

**User Story:** As a visitor who has scrolled past the main conversion sections, I want to see blog or supporting content lower on the page, so that I can explore further without it competing with the proof-driven flow.

#### Acceptance Criteria

1. THE Homepage SHALL place blog or supporting content sections below the final CTA block
2. THE Homepage blog section SHALL NOT appear above or between proof blocks
3. THE Homepage blog section SHALL serve as supplementary content that does not compete with the SCRAM_Conversion_Flow

---

### Requirement 12: Site-Wide CTA System Simplification

**User Story:** As a visitor on any page, I want one consistent primary action across the site, so that I always know what to do next without choosing between competing options.

#### Acceptance Criteria

1. THE Website SHALL use "Send me your website" as the Primary_CTA on every page except the Photography_Page
2. THE Website SHALL use "Email me directly" as the Secondary_CTA on every page
3. THE Website SHALL remove "Book a free call", "Get started", "Request a review", "Check availability", and "Call Joe" as primary CTA labels from all pages except where a page-specific override is defined
4. THE Photography_Page SHALL use "Book your photoshoot" as the Primary_CTA and "View portfolio" as the Secondary_CTA
5. WHEN a page displays multiple CTA_Blocks, THE page SHALL point every CTA_Block to the same dominant action
6. THE Website SHALL reduce secondary CTA noise by limiting each page to one Primary_CTA and one Secondary_CTA, not multiple competing actions
7. Phone contact MAY remain in contact details, footer areas, metadata, and structured data
8. Phone contact SHALL NOT compete as a major CTA on pages where the approved CTA system is Primary_CTA and Secondary_CTA

---

### Requirement 13: Services Page — Full Five-Service Segmentation Layer

**User Story:** As a visitor who wants to explore all available services, I want a dedicated page showing all five services with problem-led cards, so that I can find the right service for my specific problem.

#### Acceptance Criteria

1. THE Services_Page SHALL display all five services: website redesign, website hosting, Google Ads, analytics, and photography
2. THE Services_Page SHALL use problem-led card descriptions for each service
3. THE Services_Page SHALL act as the segmentation layer where visitors choose based on their problem
4. THE Services_Page SHALL maintain the current problem-led card format with each card starting from a problem statement
5. THE Services_Page hero SHALL keep "Your website is not bringing in work" and "Pick the problem that sounds like yours"
6. THE Services_Page SHALL shorten support copy to reduce duplication between hero and CTA
7. THE Services_Page SHALL avoid duplicated CTA pressure where the hero already points clearly to the primary action and the next section repeats the same ask without adding new value
8. THE Services_Page MAY keep one CTA in the hero and one CTA_Block below only if each has a distinct role in the page flow

---

### Requirement 14: Website Design Page — Primary Commercial Page Strengthening

**User Story:** As a visitor considering a website redesign, I want the strongest proof and clearest conversion path on this page, so that I feel confident this is the right person to fix my website.

#### Acceptance Criteria

1. THE Website_Design_Page SHALL include friction framing that describes why the current website feels like hard work
2. THE Website_Design_Page SHALL include the same speed proof data as the Homepage, but MAY use a shorter or adapted visual treatment
3. THE Website_Design_Page SHALL use the unified CTA_System with "Send me your website" as the Primary_CTA
4. THE Website_Design_Page SHALL include proof of real work with named examples
5. THE Website_Design_Page SHALL include a "this is for you if" section with stronger decision language covering: your website gets visits but no enquiries, people ask basic questions instead of using the site, and your site looks fine but does not move people to act
6. THE Website_Design_Page SHALL follow the SCRAM_Conversion_Flow: Recognition, Explanation, Proof, Action

---

### Requirement 15: Hosting Page — Problem-Led Speed Focus with Full Rewrite

**User Story:** As a visitor with a slow website, I want the hosting page to explain why speed matters for enquiries and show me a simple process, so that I understand the value and take action.

#### Acceptance Criteria

1. THE Hosting_Page hero SHALL use the framing: "Your website is slow. People leave."
2. THE Hosting_Page SHALL delete the current "Core Pitch" section entirely as it is too dense and abstract
3. THE Hosting_Page SHALL replace the current "Hosting Highlights" section (Instant Speed Boost, No Tech Stress, Scalable and Modular, SEO and Analytics Ready) with three outcome-led blocks: "People stop leaving before the page loads", "Your website becomes easier to trust", and "You do not have to manage the technical side"
4. THE Hosting_Page SHALL keep performance before/after screenshots but simplify the introductory copy
5. THE Hosting_Page SHALL display a simplified 3-step "How It Works" grid using short copy, no circles, no floating badges, presented as a 3-column clean grid
6. THE Hosting_Page SHALL use the unified CTA_System with "Send me your website" as the Primary_CTA
7. THE Hosting_Page SHALL connect speed improvement directly to enquiry generation

---

### Requirement 16: Photography Page — Authority Proof and Stock Proof

**User Story:** As a visitor considering photography services, I want to see proof that this photographer has been published in major media and understands what people need, so that I trust the quality before booking.

#### Acceptance Criteria

1. THE Photography_Page SHALL reinstate visible authority proof using only publications that are clearly supported by visible content or portfolio evidence on the page
2. Named publications may include BBC, Financial Times, Business Insider, CNN, AutoTrader, The Times
3. Any additional publication name SHALL only appear if it is visibly supported on the page
4. THE Photography_Page SHALL frame authority proof as images used in real media, commercial, and editorial contexts by trusted brands and publications
5. THE Photography_Page SHALL ensure all portfolio images load correctly with specific proof captions describing the publication or commercial context
6. THE Photography_Page SHALL display media proof visibly, not hidden behind expandable sections or load-more buttons
7. THE Photography_Page SHALL use "Book your photoshoot" as the Primary_CTA and "View portfolio" as the Secondary_CTA
8. THE Photography_Page SHALL remove competing CTA actions such as "Call Joe", "Discuss your shoot", or "Get in touch" as primary actions
9. THE Photography_Page SHALL add a compact stock photography proof section with the heading "Proof that I know what people repeatedly need"
10. THE Photography_Page stock proof section SHALL show revenue growth from $2.36 to $1,166.07 with a revenue growth visual
11. THE Photography_Page stock proof section SHALL include top-selling image examples
12. THE Photography_Page SHALL keep the gallery but make it feel more editorial and commercial in presentation

---

### Requirement 17: Pricing Page — CTA Simplification and Visual Priority

**User Story:** As a visitor considering pricing, I want the pricing page to prioritise the core services visually and present one clear action, so that I am not overwhelmed by options or competing CTAs.

#### Acceptance Criteria

1. THE Pricing_Page SHALL keep the framing: "Most websites do not need a small tweak. They need fixing."
2. THE Pricing_Page SHALL prioritise website redesign and hosting visually over other services
3. THE Pricing_Page SHALL reduce secondary CTA noise by replacing "Call Joe" and "Email me your project" with "Send me your website" as the Primary_CTA and "Email me directly" as the Secondary_CTA
4. THE Pricing_Page SHALL keep the "Who this is for / not for" section
5. THE Pricing_Page SHALL NOT display "Call Joe" as a major CTA action

---

### Requirement 18: About Page — CTA and Copy Tightening

**User Story:** As a visitor learning about Joe, I want the about page to feel grounded and direct with one clear action, so that I trust the person and know what to do next.

#### Acceptance Criteria

1. THE About_Page SHALL replace the current CTA pair of "Call Joe" and "Email me directly" with "Send me your website" as the Primary_CTA and "Email me directly" as the Secondary_CTA
2. THE About_Page SHALL tighten the ProblemMirror section to be more grounded and less broad
3. THE About_Page SHALL keep the "Real work, not theory" messaging but trim broad or generic messaging
4. THE About_Page SHALL NOT display "Call Joe" as a major CTA action

---

### Requirement 19: Contact Page — CTA Clarity and Copy Tightening

**User Story:** As a visitor ready to get in touch, I want the contact page to present one clear action without dilution, so that I know exactly what to do.

#### Acceptance Criteria

1. THE Contact_Page SHALL keep the title: "Send me your website. I will tell you what is not working."
2. THE Contact_Page SHALL remove CTA dilution by keeping "Send me your website" as the Primary_CTA and "Email me directly" as the Secondary_CTA
3. THE Contact_Page SHALL NOT display "Call Joe" as a major CTA action alongside "Send me your website"
4. THE Contact_Page SHALL keep the phone number in contact details but not present it as a major CTA
5. THE Contact_Page SHALL tighten support copy to: "Send the URL and tell me what feels wrong."

---

### Requirement 20: Proof Attribution Rules — Site-Wide

**User Story:** As a visitor, I want every proof point on the site to be correctly attributed to its source, so that I trust the data and the person presenting it.

#### Acceptance Criteria

1. THE Website SHALL clearly identify whether Speed_Proof_Block data comes from Joe's own website or a client project
2. THE Website SHALL attribute NYCC_Proof_Block data exclusively to the NYCC project
3. THE Website SHALL attribute THEFEEDGROUP_Proof_Block data exclusively to the THEFEEDGROUP Google Ads campaign
4. THE Website SHALL use Flyer_ROI_Proof data ONLY in flyer or offline campaign contexts and SHALL NOT attribute flyer results to Google Ads or website redesign
5. THE Website SHALL use Stock_Photography_Proof data ONLY as behaviour and consistency proof supporting authority, not as a central commercial claim
6. IF a Proof_Block is displayed on any page, THEN THE Proof_Block SHALL answer: what changed, by how much, and why it matters
7. THE Website SHALL follow the Proof_Hierarchy when placing proof on pages: speed before/after first, NYCC clarity and time second, THEFEEDGROUP traffic and landing third, photography publication fourth, stock photography demand fifth

---

### Requirement 21: Homepage Visual Hierarchy and Section Order

**User Story:** As a visitor scrolling the homepage, I want the sections to follow a logical proof-driven flow, so that each section builds on the last and leads me toward action.

#### Acceptance Criteria

1. THE Homepage SHALL follow this section order: (1) hero with problem recognition, (2) one CTA block below the hero, (3) why websites fail explanation, (4) performance proof chart, (5) NYCC operational proof, (6) two homepage services only, (7) THEFEEDGROUP campaign learning block, (8) final CTA, (9) stock photography proof, (10) blog or supporting content lower down
2. THE Homepage SHALL place the above-fold CTA block BEFORE the "why websites fail" section
3. THE Homepage SHALL place the problem explanation BEFORE the speed proof
4. THE Homepage SHALL NOT place services before proof blocks
5. THE Homepage SHALL NOT place campaign proof before operational proof
6. THE Homepage SHALL prioritise proof visibility over service breadth
7. THE Stock_Photography_Proof_Block SHALL be placed below the main conversion proof sections on the Homepage, not above them
8. THE Homepage SHALL follow the specified section order unless a minor layout adjustment is required to preserve readability, proof hierarchy, mobile usability, or spacing rhythm
9. Any adjustment must preserve the same overall proof-led conversion flow

---

### Requirement 22: Copy Rules Enforcement

**User Story:** As a visitor, I want every sentence on the site to be short, direct, and real, so that I trust the person behind it.

#### Acceptance Criteria

1. THE Website SHALL use short sentences with one idea per line across all new and modified copy in this pass
2. THE Website SHALL use "I" exclusively and SHALL NOT use "we" in any new or modified copy
3. THE Website SHALL NOT use em dashes in any new or modified copy
4. THE Website SHALL NOT use filler phrases, generic benefit statements, or buzzwords in any new or modified copy
5. THE Website SHALL use practical, direct, grounded language that describes real problems and real outcomes

---

### Requirement 23: Repetition Control

**User Story:** As a visitor, I want reassurance to feel natural and not scripted, so that repeated phrases do not undermine trust.

#### Acceptance Criteria

1. THE Website SHALL limit "I reply the same day" to a maximum of one occurrence per page
2. THE Website SHALL limit "based in Nantwich and Crewe" to a maximum of one occurrence per page
3. THE Website SHALL limit "you deal directly with me" to a maximum of one occurrence per page
4. WHEN a reassurance phrase appears more than once on a single page, THE Website SHALL remove the duplicate and keep only the most impactful placement
5. WHEN implementing restored proof, CTA, or authority sections, THE Website SHALL re-check reassurance duplication across the page
6. No restored section may reintroduce repeated reassurance lines beyond the maximum allowed

---

### Requirement 24: Weight and Feel Rules — Site Must Not Feel Heavy

**User Story:** As a visitor, I want the site to feel light, human, and easy to read, so that I stay engaged rather than feeling overwhelmed by stacked proof or repeated patterns.

#### Acceptance Criteria

1. THE Website SHALL NOT use excessive stacked proof blocks that make the page feel heavy. A service section, explanatory section, or CTA section counts as a non-proof spacer between proof-heavy areas.
2. THE Website SHALL NOT place more than two CTA actions within a short scrolling distance
3. THE Website SHALL NOT repeat "I fix that" style phrasing more than once per page
4. THE Website SHALL NOT use generic dramatic phrasing across new or modified copy
5. THE Website SHALL NOT use multiple components that perform the same job on a single page
6. THE Website SHALL feel lighter after this pass, not heavier
7. THE Website SHALL feel more human after this pass, not more AI-generated
8. THE Website SHALL NOT stack all proof on every page but SHALL place proof where it fits according to the Proof_Hierarchy

---

### Requirement 25: SCRAM Conversion Flow on Every Major Page

**User Story:** As a visitor on any major page, I want the page to follow a consistent flow from recognition through proof to action, so that I am guided toward enquiring.

#### Acceptance Criteria

1. THE Homepage SHALL follow the SCRAM_Conversion_Flow: Recognition, Explanation, Proof, Action
2. THE Website_Design_Page SHALL follow the SCRAM_Conversion_Flow: Recognition, Explanation, Proof, Action
3. THE Hosting_Page SHALL follow the SCRAM_Conversion_Flow: Recognition, Explanation, Proof, Action
4. THE Photography_Page SHALL follow the SCRAM_Conversion_Flow: Recognition, Explanation, Proof, Action
5. THE Pricing_Page SHALL follow the SCRAM_Conversion_Flow where applicable
6. THE About_Page SHALL follow the SCRAM_Conversion_Flow where applicable. On About_Page, proof may appear as a Proof_Block or a proof element integrated into the page copy. A formal Proof_Block is not required on About_Page if the same function is achieved more naturally through concise in-line proof.
7. THE Contact_Page SHALL follow the SCRAM_Conversion_Flow where applicable. On Contact_Page, proof may appear as a Proof_Block or a proof element integrated into the page copy. A formal Proof_Block is not required on Contact_Page if the same function is achieved more naturally through concise in-line proof.
8. WHEN a major page is modified in this pass, THE page SHALL include at least one proof element or Proof_Block before the final CTA, appropriate to the page type

---

### Requirement 26: Implementation Priority Order

**User Story:** As the site owner, I want changes implemented in order of commercial impact, so that the highest-value pages are completed first.

#### Acceptance Criteria

1. THE Website SHALL implement Homepage changes as the first priority, including section reorder, above-fold CTA, speed proof chart, NYCC proof, services scope, THEFEEDGROUP proof, stock photography proof, FAQ trimming, final CTA, and blog placement
2. THE Website SHALL implement Photography_Page changes as the second priority, including authority proof restoration, stock proof section, portfolio fixes, and CTA simplification
3. THE Website SHALL implement Website_Design_Page changes as the third priority, including proof strengthening, "this is for you if" section, homepage alignment, and unified CTA
4. THE Website SHALL implement Hosting_Page changes as the fourth priority, including hero rewrite, Core Pitch deletion, outcome-led blocks, simplified How It Works, and friction removal
5. THE Website SHALL implement Pricing_Page changes as the fifth priority, including visual priority for redesign and hosting, CTA simplification, and "who this is for" retention
6. THE Website SHALL implement About_Page changes as the sixth priority, including CTA replacement, ProblemMirror tightening, and copy trimming
7. THE Website SHALL implement Contact_Page changes as the seventh priority, including CTA clarification, phone number demotion, and support copy tightening
8. THE Website SHALL implement Services_Page changes as the eighth priority, including support copy shortening and CTA deduplication

---

## Definition of Done

A page modified in this pass is considered complete ONLY when:

1. The page follows the SCRAM_Conversion_Flow: Recognition, Explanation, Proof, Action
2. The page contains at least one proof element or Proof_Block, appropriate to the page type, that answers: what changed, by how much, and why it matters (where applicable to the page type)
3. All proof data is correctly attributed to its source with no misattribution
4. The CTA_System uses the correct Primary_CTA and Secondary_CTA for that page
5. No competing or deprecated CTA labels appear on the page (no "Call Joe", "Book a free call", "Get started", "Request a review", "Check availability"), except for approved Photography_Page CTA overrides and non-primary phone details in contact details, footer, metadata, or schema
6. Copy follows the rules: short sentences, first person, no em dashes, no filler, no buzzwords
7. Reassurance phrases appear no more than once per page
8. The Flyer_ROI_Proof does not appear outside flyer or offline campaign contexts
9. The Homepage displays only website redesign and hosting as service cards
10. The Services_Page displays all five services as the segmentation layer
11. The Homepage follows the specified section order: hero, CTA block below hero, why websites fail, speed proof, NYCC proof, services, THEFEEDGROUP proof, final CTA, stock photography proof, blog/supporting content
12. The site feels lighter not heavier after changes, with no excessive stacked proof blocks, no clustered CTA pressure, and no repeated phrasing patterns that make the page feel scripted
13. The Pricing_Page, About_Page, and Contact_Page use "Send me your website" and "Email me directly" as the CTA pair, with no "Call Joe" as a major CTA
14. Proof is placed according to the Proof_Hierarchy and distributed where it fits rather than stacked on every page
