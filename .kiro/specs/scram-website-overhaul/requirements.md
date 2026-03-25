# Requirements Document

## Introduction

This specification covers a comprehensive website overhaul following the SCRAM methodology (Structure, Copy, Reassurance, Authority, Meta). The overhaul repositions the entire site around a single core problem — "Not getting enquiries from your website?" — replacing feature-led language with problem-led messaging, localising content to South Cheshire/Nantwich/Crewe, adding reassurance and authority signals on every page, and rewriting all metadata for search intent alignment. The site is a Next.js static export deployed via S3 + CloudFront.

## Glossary

- **Website**: The Vivid Media Cheshire Next.js static site deployed via S3 + CloudFront
- **Homepage**: The root page at `src/app/page.tsx`
- **Service_Page**: Any page under `src/app/services/` including website-design, hosting, ad-campaigns, analytics, and photography
- **Hosting_Page**: The hosting service page at `src/app/services/hosting/page.tsx`
- **Photography_Page**: The photography service page at `src/app/services/photography/page.tsx`
- **About_Page**: The about page at `src/app/about/page.tsx`
- **Blog_Post**: Any individual blog article rendered under `src/app/blog/[slug]/`
- **CTA_Block**: A call-to-action UI element offering a clear next step (book a call, email, or message)
- **Hero_Section**: The above-the-fold content area at the top of each page
- **Problem_Mirror**: Copy that reflects what the visitor is likely thinking (e.g. "My website looks fine but no one contacts me")
- **Decision_Path**: A clear answer to "What do I do next?" via CTA_Blocks on every page
- **Meta_Description**: The HTML meta description tag used by search engines in results pages
- **SCRAM**: Structure, Copy, Reassurance, Authority, Meta — the methodology guiding this overhaul
- **Visitor**: A person browsing the Website
- **Enquiry**: A form submission, phone call, or email initiated by a Visitor
- **Positioning_Stack**: The core messaging framework: Problem (not getting enquiries) → Cause (slow site, unclear messaging, poor structure) → Solution (fix websites to generate enquiries) → Support (ads, analytics, hosting)
- **Case_Study**: A real-world project example presented on the Website showing context, action, and outcome
- **Proof_Element**: A credibility signal such as an ROI stat with context, a real project reference, or "Tested in real businesses" positioning
- **Guidance_Section**: A "Start here" or "What you need" section that maps Visitor problems to specific Service_Pages

## Non-Negotiables

The following principles MUST NOT be compromised during implementation:

1. The Website MUST remain problem-led, not feature-led
2. The core message "Not getting enquiries from your website?" MUST be visible within the first viewport on key pages
3. Website Design MUST remain the primary service focus across the entire site
4. All copy MUST use active voice (no passive phrasing)
5. Every page MUST clearly answer "What do I do next?"
6. Local positioning (South Cheshire, Nantwich, Crewe) MUST be consistently applied
7. All CTAs MUST be simple and low friction (no unnecessary barriers)

## Implementation Order

To maximise impact, the following order MUST be followed:

1. Homepage
2. Website Design Service Page
3. Services Overview Page
4. CTA System (global components)
5. Blog CTA implementation
6. Remaining service pages
7. Metadata updates across all pages

No lower-priority page should be implemented before higher-priority pages are complete.

## Requirements

### Requirement 1: Problem-Led Homepage Hero

**User Story:** As a local business owner visiting the site, I want to immediately see that this person understands my problem (not getting enquiries), so that I feel confident exploring further.

#### Acceptance Criteria

1. WHEN a Visitor loads the Homepage, THE Hero_Section SHALL display a problem-led heading that communicates the core problem of not receiving enquiries from a website
2. WHEN a Visitor loads the Homepage, THE Hero_Section SHALL display a subline referencing the local area (Nantwich, South Cheshire)
3. THE Homepage Hero_Section SHALL present a clear next-step CTA_Block within the above-the-fold area
4. THE Homepage Hero_Section SHALL replace the current feature-led heading ("Websites, Ads & Analytics - Cheshire") with problem-led copy aligned to the Positioning_Stack

### Requirement 2: Problem-Led Structure on Every Page

**User Story:** As a visitor browsing any page, I want the page to lead with the problem it solves, so that I understand the value before seeing features.

#### Acceptance Criteria

1. THE Website SHALL structure every Service_Page using a problem → solution → next step flow
2. WHEN a Visitor views any Service_Page, THE Service_Page SHALL lead with a problem statement before presenting features or technical details
3. THE Website SHALL replace all feature-first headings across Service_Pages with problem-led headings aligned to the Positioning_Stack

### Requirement 3: Simplified Service Architecture

**User Story:** As a visitor, I want a clear hierarchy of services so that I understand what the primary offering is and how supporting services relate.

#### Acceptance Criteria

1. THE Website SHALL position Website Design as the primary service across all navigation and service listings
2. THE Website SHALL position the Hosting_Page as "Fix a slow or expensive website" rather than "Website Hosting"
3. THE Website SHALL position Google Ads as an amplifier service and Analytics as a clarity service, secondary to Website Design
4. THE Website SHALL position Photography as a supporting service

### Requirement 4: Simplified UI — Remove Unnecessary Complexity

**User Story:** As a visitor, I want clean, scannable page layouts so that I can quickly understand the content without visual clutter.

#### Acceptance Criteria

1. WHEN the Homepage displays a "How It Works" section, THE Homepage SHALL use left-aligned numbered steps instead of circle-based UI elements
2. THE Website SHALL use simple, left-aligned layouts for process steps across all pages

### Requirement 4.1: Remove Circle-Based Step Indicators

**User Story:** As a visitor, I want process steps presented as simple numbered text so that I can scan them quickly without decorative distractions.

#### Acceptance Criteria

1. THE Homepage SHALL remove all circle-based step indicator UI elements from the "How It Works" section
2. THE Homepage SHALL replace circle-based step indicators with left-aligned numbered text steps
3. THE Website SHALL avoid using circle-based step indicators on any page

### Requirement 5: Decision Path on Every Page

**User Story:** As a visitor on any page, I want to know what to do next, so that I can take action without searching for contact options.

#### Acceptance Criteria

1. THE Website SHALL display at least one CTA_Block on every page answering "What do I do next?"
2. THE CTA_Block SHALL offer at least two contact options: book a call and email directly
3. WHEN a Visitor scrolls to the bottom of any page, THE Website SHALL display a CTA_Block before the footer
4. THE Website SHALL display at least one CTA_Block visible without scrolling on every page

### Requirement 6: Replace Feature-First Copy with Problem-Led Language

**User Story:** As a visitor, I want copy that speaks to my situation, so that I feel understood rather than sold to.

#### Acceptance Criteria

1. THE Website SHALL replace all instances of feature-first language (e.g. "Fast websites, analytics, ads") with problem-led language (e.g. "Not getting enquiries? Here's how I fix it")
2. THE Website SHALL use active voice throughout all headings and body copy (e.g. "I design fast websites that bring in enquiries" not "Websites are designed to…")

### Requirement 7: Localise All Copy to South Cheshire

**User Story:** As a South Cheshire business owner, I want to see my area mentioned specifically, so that I know this service is relevant to me.

#### Acceptance Criteria

1. THE Website SHALL replace generic "Cheshire" references with specific local references including "South Cheshire", "Nantwich", and "Crewe" across all pages
2. THE Homepage SHALL include "Based in Nantwich, working with South Cheshire businesses" in the Hero_Section
3. WHEN a Service_Page displays location references, THE Service_Page SHALL use specific town names rather than county-level references

### Requirement 8: Problem Mirroring in Copy

**User Story:** As a visitor who is frustrated with my current website, I want to see my exact thoughts reflected in the copy, so that I trust this person understands my situation.

#### Acceptance Criteria

1. THE Website SHALL include Problem_Mirror statements on the Homepage and each Service_Page
2. THE Problem_Mirror statements SHALL reflect common visitor frustrations including: "My website looks fine but no one contacts me", "I've tried ads and nothing worked", and "My site is slow"
3. WHEN a Service_Page addresses a specific problem, THE Service_Page SHALL include at least one Problem_Mirror statement relevant to that service

### Requirement 9: Reframe Case Studies

**User Story:** As a visitor evaluating the service, I want case studies that show context, action, and realistic expectations, so that I can judge whether this approach would work for me.

#### Acceptance Criteria

1. THE Website SHALL structure all Case_Study content using a context → action → realistic expectation format
2. WHEN a Case_Study includes ROI figures, THE Website SHALL present ROI with context explaining the conditions and limitations
3. THE Website SHALL avoid presenting Case_Study results as guaranteed outcomes

### Requirement 10: Pricing Transparency and Reassurance

**User Story:** As a visitor considering hiring someone, I want to know roughly what it costs before I make contact, so that I don't waste time if it's outside my budget.

#### Acceptance Criteria

1. THE Website SHALL display a pricing range statement ("Most projects fall between £500 and £1,200") on the Homepage and Services overview page
2. WHEN a Service_Page displays pricing, THE Service_Page SHALL include a "who this is for" statement (e.g. "Best for trades and local businesses that need more enquiries")
3. WHEN a Service_Page displays pricing, THE Service_Page SHALL include a "who this is NOT for" statement (e.g. "Not suitable for large enterprise websites or businesses looking for agency-scale teams")
4. THE Website SHALL display a pricing range statement before a primary CTA_Block on at least one key page (Homepage or Services overview)

### Requirement 11: Personal Service Reassurance

**User Story:** As a visitor wary of impersonal agencies, I want reassurance that I'll deal with a real person, so that I feel confident making contact.

#### Acceptance Criteria

1. THE Website SHALL include "You deal directly with me" messaging on every Service_Page
2. THE Website SHALL include "I reply the same day" messaging on every page that contains a CTA_Block
3. THE Website SHALL present all reassurance messaging in first person active voice

### Requirement 12: Low-Friction Contact Options

**User Story:** As a visitor who prefers email over phone calls, I want multiple easy ways to get in touch, so that I can choose the method I'm most comfortable with.

#### Acceptance Criteria

1. THE Website SHALL offer an email contact option on every page alongside any existing phone or form options
2. THE CTA_Block SHALL include a simple message option that does not require filling in a full form
3. WHEN a Visitor interacts with a CTA_Block contact form, THE CTA_Block SHALL require only email and message fields as mandatory inputs

### Requirement 13: Authority Positioning — Tested, Not Theoretical

**User Story:** As a visitor, I want to see that this person's approach is based on real experience, so that I trust the recommendations.

#### Acceptance Criteria

1. THE Website SHALL include "tested in real business environments" positioning language on the Homepage and About_Page
2. THE Website SHALL surface real-world work examples with the framing "What I tested and what actually worked"
3. THE Website SHALL include Proof_Elements (ROI figures with context, campaign learnings, workflow improvements) on every Service_Page

### Requirement 14: Local Credibility Signals

**User Story:** As a South Cheshire business owner, I want to see evidence of local work, so that I trust this person knows my market.

#### Acceptance Criteria

1. THE Website SHALL mention specific local references (Nantwich, Crewe, NYCC work) as credibility signals on the Homepage and About_Page
2. WHEN a Service_Page includes testimonials or Case_Studies, THE Service_Page SHALL include local business names and locations where available
3. THE Website SHALL include location-specific headings where relevant (e.g. "Why South Cheshire businesses struggle with slow websites")

### Requirement 15: Rewrite All Meta Descriptions

**User Story:** As a search engine user, I want meta descriptions that match my search intent, so that I click through to the right page.

#### Acceptance Criteria

1. THE Website SHALL rewrite all Meta_Descriptions to follow a pain + location + outcome structure
2. WHEN a page has a Meta_Description, THE Meta_Description SHALL include a specific South Cheshire or Nantwich location reference
3. THE Website SHALL replace all feature-led Meta_Descriptions with intent-aligned descriptions that reference the problem the page solves
4. THE Homepage Meta_Description SHALL replace "Fast websites, Google Ads that generate enquiries, and clear analytics reporting for Cheshire small businesses" with a problem-led description
5. THE Website SHALL ensure all Meta_Descriptions are between 140 and 160 characters in length

### Requirement 16: Blog Strategy Alignment

**User Story:** As a visitor reading a blog post, I want each post to solve a problem and link to a relevant service, so that I can take the next step if I need help.

#### Acceptance Criteria

1. THE Website SHALL ensure every Blog_Post includes at least one internal link to the Website Design Service_Page
2. WHEN a Blog_Post addresses a topic related to a specific service, THE Blog_Post SHALL include a contextual link to that Service_Page
3. THE Website SHALL structure Blog_Posts around solving a specific problem rather than showcasing features

### Requirement 17: Internal Linking Strategy

**User Story:** As a search engine crawler, I want clear internal linking between related content, so that I can understand the site's topic hierarchy.

#### Acceptance Criteria

1. THE Website SHALL include cross-links between related Service_Pages (e.g. Hosting_Page links to Website Design, Ads links to Analytics)
2. WHEN a Service_Page references a capability covered by another Service_Page, THE Service_Page SHALL link to that related Service_Page

### Requirement 18: Location Signals in Headings

**User Story:** As a search engine, I want location-specific headings so that I can rank the page for local search queries.

#### Acceptance Criteria

1. THE Website SHALL include location-specific terms (South Cheshire, Nantwich, Crewe) in at least one H2 heading on every Service_Page
2. THE Homepage SHALL include a location-specific H2 heading referencing South Cheshire
3. WHEN a Service_Page targets local search intent, THE Service_Page SHALL use location + problem headings (e.g. "Why South Cheshire businesses struggle with slow websites")

### Requirement 19: Photography Page Content Guidelines

**User Story:** As the site owner, I want the photography page to follow established content guidelines, so that the page reflects my preferred narrative style.

#### Acceptance Criteria

1. THE Photography_Page SHALL use "photography-hero.webp" as the hero image
2. THE Photography_Page SHALL only display the approved statistics: "3,500+ licensed images" and "90+ countries"
3. THE Photography_Page SHALL use narrative copy instead of statistics blocks or metric grids
4. THE Photography_Page SHALL avoid reintroducing legacy metric grids (3+, 50+, 100+)

### Requirement 20: Metadata Intent Alignment

**User Story:** As a search engine user, I want page titles and descriptions that match what I'm searching for, so that I find the right page quickly.

#### Acceptance Criteria

1. THE Website SHALL align all page titles with search intent by leading with the problem or outcome rather than the feature
2. WHEN a page title currently describes a feature (e.g. "Website Hosting & Migration"), THE Website SHALL rewrite the title to describe the outcome (e.g. "Fix a Slow or Expensive Website")
3. THE Website SHALL ensure all page metadata (title + description) follows the pattern: problem/pain + location + outcome

### Requirement 21: Above-the-Fold Proof

**User Story:** As a visitor landing on the site, I want immediate proof that this person gets results, so that I trust them quickly.

#### Acceptance Criteria

1. WHEN a Visitor loads the Homepage, THE Hero_Section SHALL include a Proof_Element within the first viewport
2. THE Hero_Section Proof_Element SHALL use one or more of the following: an ROI stat with context, a real project reference, or "Tested in real businesses" positioning
3. THE Hero_Section Proof_Element SHALL avoid exaggerated or unverifiable claims
4. THE Homepage SHALL display the Proof_Element above the fold

### Requirement 22: Speed to Enquiries Connection

**User Story:** As a visitor, I want to understand why speed matters, so that I see the business impact.

#### Acceptance Criteria

1. THE Homepage SHALL include copy that directly links website speed to enquiry generation
2. THE Website Design Service_Page SHALL include copy that directly links website speed to enquiry generation
3. WHEN the Website references site speed, THE Website SHALL connect faster load time to increased enquiries rather than presenting speed as a purely technical feature

### Requirement 23: Objection Handling Blocks

**User Story:** As a hesitant visitor, I want my concerns addressed before I reach out, so that I feel confident taking the next step.

#### Acceptance Criteria

1. THE Website SHALL include objection-handling sections on the Homepage and Website Design Service_Page
2. THE objection-handling sections SHALL address the following concerns: "Will this work for my business?", "Is this worth the cost?", and "I've tried marketing before and it didn't work"
3. THE objection-handling sections SHALL use active voice and be grounded in real experience rather than generic reassurance

### Requirement 24: Anti-Agency Positioning

**User Story:** As a small business owner, I want to understand why this is better than hiring an agency, so that I can make an informed decision.

#### Acceptance Criteria

1. THE Website SHALL include a positioning section comparing direct service delivery with agency structure
2. THE positioning section SHALL highlight direct communication, no account managers, and practical implementation as differentiators
3. THE positioning section SHALL maintain a professional tone without negative language about agencies

### Requirement 25: Mandatory Blog CTA Pattern

**User Story:** As a blog reader, I want a clear next step if I need help, so that I can easily move from reading to action.

#### Acceptance Criteria

1. THE Website SHALL display a CTA_Block at the end of every Blog_Post
2. WHEN a Blog_Post displays an end CTA_Block, THE CTA_Block SHALL include a problem reminder, a solution statement, and a link to the Website Design Service_Page at /services/website-design/
3. THE Website SHALL prevent publication of any Blog_Post that does not include an end CTA_Block

### Requirement 26: Scroll-Based CTA Reinforcement

**User Story:** As a visitor scrolling a page, I want multiple chances to take action, so that I can convert when I am ready.

#### Acceptance Criteria

1. THE Website SHALL include CTA_Blocks in three positions on every page: above the fold, mid-page, and end of page
2. THE Website SHALL vary CTA wording across the three positions on each page to avoid repetition
3. THE Website SHALL ensure all CTA_Blocks are clearly visible and tappable on mobile viewports with a minimum 44x44px tap target

### Requirement 27: Why Websites Fail Section

**User Story:** As a visitor, I want to understand why my current site is not working, so that I see the need for a solution.

#### Acceptance Criteria

1. THE Homepage SHALL include a section explaining why websites fail, covering slow performance, poor structure, and unclear messaging
2. THE Website Design Service_Page SHALL include a section explaining why websites fail, covering slow performance, poor structure, and unclear messaging
3. WHEN a "Why Websites Fail" section is displayed, THE section SHALL lead directly into the solution offering
4. THE "Why Websites Fail" section SHALL use language that reflects real business frustrations rather than technical jargon

### Requirement 28: Service Entry Clarity

**User Story:** As a visitor, I want to know which service I actually need, so that I can find the right solution without confusion.

#### Acceptance Criteria

1. THE Website SHALL include a Guidance_Section on the Homepage or Services overview page
2. THE Guidance_Section SHALL direct Visitors based on their problem: not getting enquiries leads to Website Design, slow site leads to performance fixes, and ads not working leads to the Ads service
3. THE Guidance_Section SHALL map Visitor problems to specific Service_Pages to reduce service confusion

### Requirement 29: Trust Through Realism

**User Story:** As a visitor, I want honest expectations rather than inflated promises, so that I can trust the service provider.

#### Acceptance Criteria

1. THE Website SHALL include realistic outcome ranges rather than absolute claims
2. THE Website SHALL avoid absolute claims (e.g. "guaranteed results", "100% success rate") across all pages
3. WHEN a Case_Study is displayed, THE Case_Study SHALL include context, limitations, and realistic expectations
4. THE Website SHALL use the flyer ROI explanation as a model for presenting results with appropriate context

### Requirement 30: Mobile-First Conversion Priority

**User Story:** As a mobile visitor, I want to quickly understand the offer and take action, so that I can convert without excessive scrolling.

#### Acceptance Criteria

1. WHEN a Visitor views the Homepage on a mobile device, THE Homepage SHALL display the problem statement, a Proof_Element, and a CTA_Block within the first viewport
2. THE Website SHALL ensure all CTA buttons have a minimum 44x44px tap target on mobile viewports
3. THE Website SHALL avoid placing large text blocks before the first CTA_Block on mobile viewports


## Definition of Done

A page is considered complete ONLY when:

1. It leads with a clear problem statement (Requirements 1, 2)
2. It includes at least one Problem_Mirror (Requirement 8)
3. It contains CTA_Blocks in three positions: above the fold, mid-page, and end of page (Requirements 5, 26)
4. It includes reassurance elements: pricing context, personal service messaging, or Proof_Elements (Requirements 10, 11, 13)
5. It uses active voice throughout all headings and body copy (Requirement 6)
6. It includes specific local references (South Cheshire, Nantwich, or Crewe) (Requirements 7, 18)
7. Metadata is updated with pain + location + outcome structure, 140-160 characters (Requirements 15, 20)
8. All CTA buttons meet the 44x44px minimum tap target on mobile (Requirement 30)
