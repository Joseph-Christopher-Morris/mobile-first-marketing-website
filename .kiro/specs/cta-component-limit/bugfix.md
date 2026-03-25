# Bugfix Requirements Document

## Introduction

Every page on the site currently contains 2–3 standalone `CTABlock` components (above-fold, mid-page, end-of-page). The client requirement is a maximum of one standalone CTA component per page. Multiple CTA blocks repeat the same ask in different wording, diluting the call-to-action and cluttering the page. Specific standalone blocks such as "Know what you need? Tell me." / "Describe your project. I send a clear price the same day." must be removed entirely or folded into the single approved CTA as supporting copy.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN the homepage is rendered THEN the system displays 2 standalone CTABlock components (above-fold variant and end-of-page variant) that repeat the same contact ask in different wording

1.2 WHEN a service page (website-design, hosting, ad-campaigns, analytics, photography) is rendered THEN the system displays 3 standalone CTABlock components (above-fold, mid-page, end-of-page) that repeat the same contact ask in different wording

1.3 WHEN the services index page is rendered THEN the system displays 2 standalone CTABlock components (mid-page and end-of-page) that repeat the same contact ask in different wording

1.4 WHEN the pricing page is rendered THEN the system displays 3 standalone CTABlock components including one with the heading "Know what you need? Tell me." and body "Describe your project. I send a clear price the same day." which should be removed or folded into the single approved CTA

1.5 WHEN the about page is rendered THEN the system displays 3 standalone CTABlock components (above-fold, mid-page, end-of-page) that repeat the same contact ask in different wording

1.6 WHEN the contact page is rendered THEN the system displays multiple standalone CTABlock components that repeat the same contact ask in different wording

1.7 WHEN the free-audit page is rendered THEN the system displays 3 standalone CTABlock components (above-fold, mid-page, end-of-page) that repeat the same contact ask in different wording

1.8 WHEN the existing property tests run THEN the tests in `scram-cta-properties.test.ts` require every page to have CTABlock components in all three positions (above-fold, mid-page, end-of-page), enforcing the now-unwanted multi-CTA pattern

1.9 WHEN the existing property tests run THEN the tests in `scram-proof-conversion-properties.test.ts` expect exactly 2 CTABlock instances on the homepage and check CTA spacing between them, enforcing the now-unwanted multi-CTA pattern

### Expected Behavior (Correct)

2.1 WHEN the homepage is rendered THEN the system SHALL display a maximum of 1 standalone CTABlock component, which may include one primary CTA action, one secondary CTA action, and a reassurance line

2.2 WHEN a service page (website-design, hosting, ad-campaigns, analytics, photography) is rendered THEN the system SHALL display a maximum of 1 standalone CTABlock component per page

2.3 WHEN the services index page is rendered THEN the system SHALL display a maximum of 1 standalone CTABlock component

2.4 WHEN the pricing page is rendered THEN the system SHALL display a maximum of 1 standalone CTABlock component and SHALL NOT include the standalone block "Know what you need? Tell me." / "Describe your project. I send a clear price the same day." — if this messaging is useful, it SHALL be folded into the single approved CTA as supporting copy

2.5 WHEN the about page is rendered THEN the system SHALL display a maximum of 1 standalone CTABlock component

2.6 WHEN the contact page is rendered THEN the system SHALL display a maximum of 1 standalone CTABlock component

2.7 WHEN the free-audit page is rendered THEN the system SHALL display a maximum of 1 standalone CTABlock component

2.8 WHEN the property tests run THEN the tests SHALL validate that each page contains a maximum of 1 standalone CTABlock component instead of requiring 3 positions

2.9 WHEN the property tests run THEN the homepage-specific tests SHALL validate that the homepage contains exactly 1 CTABlock instance instead of expecting 2

### Unchanged Behavior (Regression Prevention)

3.1 WHEN any page is rendered THEN the system SHALL CONTINUE TO include the ProblemHero component with its embedded CTA button, as this is part of the hero section and not a standalone CTA component

3.2 WHEN the single retained CTABlock is rendered THEN the system SHALL CONTINUE TO offer one primary CTA action and one secondary CTA action within that component

3.3 WHEN the single retained CTABlock is rendered THEN the system SHALL CONTINUE TO use the shared CTA constants from `src/lib/proof-data.ts` (STANDARD_CTA for most pages, PHOTOGRAPHY_CTA for the photography page)

3.4 WHEN inline text links or contact details appear in page content (e.g. service cards, proof blocks, FAQ sections) THEN the system SHALL CONTINUE TO display them, as these are not standalone CTA components

3.5 WHEN the CTABlock component itself is rendered THEN the system SHALL CONTINUE TO meet minimum tap target sizes (44×44px) and offer both a primary link and a secondary email link

3.6 WHEN the site is built THEN the system SHALL CONTINUE TO produce a valid Next.js static export deployable via S3 + CloudFront
