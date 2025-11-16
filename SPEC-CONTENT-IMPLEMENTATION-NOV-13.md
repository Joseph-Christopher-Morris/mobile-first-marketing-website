# Spec Content Implementation - November 13, 2025

## Overview
Implementing comprehensive website copy updates from three spec documents:
1. MASTER-WEBSITE-COPY-KIRO (1).md - All page content
2. MESSAGE 3 — SYSTEM COMPONENTS + SEO + CTA FRAMEWORK.md - CTAs, SEO, footer
3. PAGE 6 — ANALYTICS & INSIGHTS.md - Analytics page content

## Implementation Plan

### Phase 1: Infrastructure Components
- [x] Update StickyCTA component with new page-specific mapping
- [x] Update Footer component with new business hours and copy
- [ ] Update SEO metadata for all pages

### Phase 2: Page Content Updates
- [ ] Home page (src/app/page.tsx)
- [ ] Services overview (src/app/services/page.tsx)
- [ ] Website Design (src/app/services/website-design/page.tsx)
- [ ] Website Hosting (src/app/services/hosting/page.tsx)
- [ ] Ad Campaigns (src/app/services/ad-campaigns/page.tsx)
- [ ] Analytics (src/app/services/analytics/page.tsx)
- [ ] Photography (src/app/services/photography/page.tsx)
- [ ] About (src/app/about/page.tsx)
- [ ] Contact (src/app/contact/page.tsx)
- [ ] Thank You (src/app/thank-you/page.tsx)

### Phase 3: Deployment
- [ ] Build and validate
- [ ] Deploy to S3 + CloudFront
- [ ] Invalidate cache
- [ ] Post-deployment verification

## Key Changes

### Sticky CTA Mapping (New)
- Home: "Call for a Free Ad Plan"
- Services: "Call to Discuss Your Project"
- Website Design: "Call to Start Your Website Plan"
- Hosting: "Call About Website Speed Improvements"
- Ad Campaigns: "Call for a Google Ads Strategy"
- Analytics: "Call About Tracking Setup"
- Photography: "Call to Arrange a Photoshoot"
- About: "Call to Work Together"
- Contact: "Call Now"
- Thank You: "Call If Your Enquiry Is Urgent"

### Footer Updates
- New business hours format
- Updated company description
- Maintained existing links and structure

### SEO Updates
All pages get new titles and meta descriptions optimized for:
- Google Ads Quality Score
- Local search (Cheshire)
- Clear benefit-driven messaging
- Under 150 characters

## Status
🟡 In Progress - Starting implementation

## Next Steps
1. Update StickyCTA component
2. Update Footer component
3. Update all page content systematically
4. Deploy using S3 + CloudFront
