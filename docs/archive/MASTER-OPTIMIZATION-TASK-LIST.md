# Master Optimization Task List - Vivid Media Cheshire
## 100/100 Google Ads & SEO Performance Plan

**Target Metrics:**
- LCP < 1.8s (mobile & desktop)
- CLS < 0.1
- INP < 200ms
- 100/100 Lighthouse scores

---

## Phase 1: Critical Performance & Tracking (Week 1)
**Priority: URGENT - Impacts all metrics and tracking**

### Task 1.1: Microsoft Clarity Integration ⚡
**Effort:** 15 min | **Impact:** HIGH
- [ ] Add Clarity script to `src/app/layout.tsx` in `<head>`
- [ ] Test real-time session recording
- [ ] Verify heatmap data collection
- [ ] Document in GA4-CLARITY-INTEGRATION-COMPLETE.md

**Files:** `src/app/layout.tsx`

### Task 1.2: GA4 Event Tracking Setup ⚡
**Effort:** 30 min | **Impact:** HIGH
- [ ] Implement `form_submit` event on all contact forms
- [ ] Add `cta_click` tracking to sticky CTA + hero buttons
- [ ] Track `phone_click` on all `tel:` links
- [ ] Add `consultation_booking` success event
- [ ] Test all events in GA4 DebugView

**Files:** `src/components/StickyCTA.tsx`, `src/components/sections/TrackedContactForm.tsx`, `src/components/sections/GeneralContactForm.tsx`

### Task 1.3: Performance Budget Setup ⚡
**Effort:** 20 min | **Impact:** HIGH
- [ ] Create `budgets.json` with resource and timing budgets
- [ ] Add `scripts/check-lighthouse.mjs` CI gate script
- [ ] Update `package.json` with `lh:check` script
- [ ] Test locally with sample Lighthouse report

**Files:** `budgets.json`, `scripts/check-lighthouse.mjs`, `package.json`

---

## Phase 2: Layout & UX Fixes (Week 1)
**Priority: HIGH - Visible issues affecting CLS and user experience**

### Task 2.1: Header/Hero Spacing Fix 🎨
**Effort:** 15 min | **Impact:** MEDIUM
- [ ] Adjust `src/app/page.tsx` hero section padding
- [ ] Change to `pt-[4rem] md:pt-[5rem] lg:pt-[6rem]`
- [ ] Test at 1280px, 1440px, 1920px widths
- [ ] Verify no overlap between header and hero

**Files:** `src/app/page.tsx`

### Task 2.2: Mobile Hero Optimization 📱
**Effort:** 20 min | **Impact:** MEDIUM
- [ ] Reduce hero height to 75vh on mobile
- [ ] Merge duplicate CTAs into single sticky CTA
- [ ] Test scroll depth and CTA visibility
- [ ] Verify CLS < 0.1 on mobile

**Files:** `src/app/page.tsx`, `src/components/StickyCTA.tsx`

### Task 2.3: Sticky CTA Per-Page Copy 🎯
**Effort:** 30 min | **Impact:** MEDIUM
- [ ] Home: "Let's Grow Your Business"
- [ ] Design: "Start Your Website Project"
- [ ] Hosting: "Move My Site Securely"
- [ ] Ads: "Launch My Campaign"
- [ ] Analytics: "Get My Tracking Fixed"
- [ ] Test all pages for correct CTA text

**Files:** `src/components/StickyCTA.tsx`, all service pages

---

## Phase 3: Copy & Content Updates (Week 1-2)
**Priority: MEDIUM - SEO and conversion optimization**

### Task 3.1: Global Copy Tone Update ✍️
**Effort:** 45 min | **Impact:** MEDIUM
- [ ] Replace all `$` with `£` across site
- [ ] Remove "Published photographer available"
- [ ] Add "Free consultation included"
- [ ] Update brand line on homepage
- [ ] Review for em dashes and replace with natural punctuation

**Files:** All page files, component files

### Task 3.2: Website Design Page Enhancement 🎨
**Effort:** 15 min | **Impact:** LOW
- [ ] Add conversion optimization paragraph
- [ ] Emphasize layout → navigation → speed → CTA hierarchy
- [ ] Test readability and flow

**Files:** `src/app/services/website-design/page.tsx`

### Task 3.3: Website Hosting Page Update 🔒
**Effort:** 15 min | **Impact:** LOW
- [ ] Replace tagline with new version
- [ ] Add "Free consultation included"
- [ ] Update migration messaging

**Files:** `src/app/services/hosting/page.tsx`

### Task 3.4: About Page Certification Update 📜
**Effort:** 20 min | **Impact:** LOW
- [ ] Update Adobe Analytics paragraph
- [ ] Add Microsoft Clarity mention
- [ ] Expand certification details (Adobe Target, AEM)
- [ ] Update photography licensing copy

**Files:** `src/app/about/page.tsx`

---

## Phase 4: SEO & Structured Data (Week 2)
**Priority: MEDIUM - Organic search visibility**

### Task 4.1: Meta Titles & Descriptions 🔍
**Effort:** 30 min | **Impact:** MEDIUM
- [ ] Update all page metadata per specification table
- [ ] Ensure 50-60 char titles, 150-160 char descriptions
- [ ] Include location keywords (Cheshire)
- [ ] Test with SEO preview tool

**Files:** All page.tsx files with metadata exports

### Task 4.2: JSON-LD Structured Data 📊
**Effort:** 30 min | **Impact:** MEDIUM
- [ ] Create LocalBusiness schema component
- [ ] Add name, address (Cheshire, UK)
- [ ] Set opening hours (Mon-Fri 09:00-18:00, Sat 10:00-14:00, Sun 10:00-16:00)
- [ ] Add priceRange: "££"
- [ ] Include sameAs social links
- [ ] Test with Google Rich Results Test

**Files:** `src/components/seo/StructuredData.tsx`, `src/app/layout.tsx`

### Task 4.3: Internal Linking Structure 🔗
**Effort:** 20 min | **Impact:** LOW
- [ ] Add contextual links per specification table
- [ ] Test all internal navigation flows
- [ ] Verify anchor text relevance

**Files:** Multiple page files

---

## Phase 5: Image & Asset Optimization (Week 2)
**Priority: HIGH - Direct LCP impact**

### Task 5.1: Hero Image Optimization 🖼️
**Effort:** 30 min | **Impact:** HIGH
- [ ] Ensure all hero images ≤ 120KB WebP
- [ ] Add `priority` attribute to hero images
- [ ] Set explicit `width` and `height`
- [ ] Add proper `sizes` attribute
- [ ] Preload hero fonts
- [ ] Test LCP improvement

**Files:** `src/app/page.tsx`, all service pages with hero images

### Task 5.2: Font Loading Strategy 🔤
**Effort:** 20 min | **Impact:** MEDIUM
- [ ] Preconnect to fonts.gstatic.com
- [ ] Preload only hero font weights
- [ ] Use `font-display: optional` or preload
- [ ] Test for font swap CLS

**Files:** `src/app/layout.tsx`, `tailwind.config.js`

### Task 5.3: Lazy Loading Implementation 🚀
**Effort:** 30 min | **Impact:** MEDIUM
- [ ] Lazy-load all blog images
- [ ] Lazy-load service page illustrations
- [ ] Defer non-critical scripts (Clarity, GA4)
- [ ] Test loading sequence

**Files:** Blog components, service page components

---

## Phase 6: Testing Infrastructure (Week 2-3)
**Priority: HIGH - Automated quality gates**

### Task 6.1: Lighthouse CI Workflow 🤖
**Effort:** 45 min | **Impact:** HIGH
- [ ] Create `.github/workflows/lhci.yml`
- [ ] Configure for all core pages
- [ ] Set mobile preset with budgets
- [ ] Add check-lighthouse gate
- [ ] Test workflow on feature branch

**Files:** `.github/workflows/lhci.yml`

### Task 6.2: WebPageTest Integration 🌐
**Effort:** 30 min | **Impact:** MEDIUM
- [ ] Create WebPageTest script for core pages
- [ ] Set location: EU West, Connection: 4G
- [ ] Document pass criteria
- [ ] Schedule weekly runs

**Files:** `docs/webpagetest-procedures.md`

### Task 6.3: Reporting Dashboard 📈
**Effort:** 30 min | **Impact:** LOW
- [ ] Create `reports/summary.md` template
- [ ] Add script to parse Lighthouse JSON
- [ ] Generate per-page performance cards
- [ ] Automate weekly reports

**Files:** `scripts/generate-performance-report.js`

---

## Phase 7: Google Ads Optimization (Week 3)
**Priority: MEDIUM - Paid traffic conversion**

### Task 7.1: Keyword Mapping 🎯
**Effort:** 20 min | **Impact:** MEDIUM
- [ ] Verify primary keywords per page
- [ ] Add keyword-rich headings
- [ ] Ensure keyword density 1-2%
- [ ] Test with SEO tools

**Files:** All service pages

### Task 7.2: Ad Copy Alignment 📢
**Effort:** 30 min | **Impact:** MEDIUM
- [ ] Create ad copy examples per specification
- [ ] Ensure landing page message match
- [ ] Add negative keywords list
- [ ] Document in ads strategy guide

**Files:** `docs/google-ads-strategy.md`

### Task 7.3: Conversion Tracking 📊
**Effort:** 20 min | **Impact:** HIGH
- [ ] Verify GA4 events fire correctly
- [ ] Test form submission tracking
- [ ] Validate phone click tracking
- [ ] Check consultation booking events

**Files:** GA4 configuration, event tracking components

---

## Phase 8: Accessibility & Standards (Week 3)
**Priority: MEDIUM - Compliance and UX**

### Task 8.1: Semantic HTML Audit ♿
**Effort:** 30 min | **Impact:** MEDIUM
- [ ] Verify h1 → h3 hierarchy on all pages
- [ ] Check ARIA labels on interactive elements
- [ ] Test with screen reader
- [ ] Fix any violations

**Files:** All component and page files

### Task 8.2: Color Contrast Validation 🎨
**Effort:** 20 min | **Impact:** MEDIUM
- [ ] Test all text/background combinations
- [ ] Ensure ≥ 4.5:1 contrast ratio
- [ ] Fix any failing combinations
- [ ] Document color palette

**Files:** `src/app/globals.css`, Tailwind config

### Task 8.3: Interactive Element Sizing 👆
**Effort:** 15 min | **Impact:** LOW
- [ ] Verify all buttons ≥ 44×44px
- [ ] Check touch target spacing
- [ ] Test on mobile devices
- [ ] Add focus states where missing

**Files:** Button components, CTA components

---

## Phase 9: Deployment & Validation (Week 3-4)
**Priority: CRITICAL - Go-live readiness**

### Task 9.1: Pre-Deployment Checklist ✅
**Effort:** 30 min | **Impact:** CRITICAL
- [ ] Run full Lighthouse audit (all pages)
- [ ] Verify LCP < 1.8s, CLS < 0.1
- [ ] Test all GA4 events
- [ ] Check Clarity recording
- [ ] Validate structured data
- [ ] Test all forms
- [ ] Review copy changes

**Files:** All files

### Task 9.2: Staged Deployment 🚀
**Effort:** 45 min | **Impact:** CRITICAL
- [ ] Build production bundle
- [ ] Deploy to S3 + CloudFront
- [ ] Invalidate cache
- [ ] Monitor CloudWatch
- [ ] Test live site
- [ ] Verify analytics tracking

**Files:** Deployment scripts

### Task 9.3: Post-Deployment Monitoring 📊
**Effort:** Ongoing | **Impact:** HIGH
- [ ] Monitor Core Web Vitals in GA4
- [ ] Check Clarity session recordings
- [ ] Review conversion rates
- [ ] Track form submissions
- [ ] Monitor page load times
- [ ] Weekly Lighthouse audits

**Files:** Monitoring dashboards

---

## Quick Wins (Can be done anytime)
**Effort: < 15 min each**

- [ ] Add preconnect to fonts.gstatic.com
- [ ] Set explicit image dimensions
- [ ] Add alt text with location context
- [ ] Update business hours in footer
- [ ] Add "Cheshire" to page titles
- [ ] Replace $ with £ globally
- [ ] Add "Free consultation" mentions

---

## Success Metrics

### Performance
- ✅ LCP < 1.8s on all pages
- ✅ CLS < 0.1 on all pages
- ✅ INP < 200ms
- ✅ Lighthouse 100/100 mobile
- ✅ Lighthouse 100/100 desktop

### Tracking
- ✅ GA4 events firing correctly
- ✅ Clarity recording sessions
- ✅ Form submissions tracked
- ✅ Phone clicks tracked
- ✅ CTA clicks tracked

### SEO
- ✅ All meta titles optimized
- ✅ All meta descriptions optimized
- ✅ JSON-LD structured data live
- ✅ Internal linking complete
- ✅ Keyword mapping verified

### Conversion
- ✅ Sticky CTA on all pages
- ✅ Per-page CTA copy
- ✅ Clear value propositions
- ✅ Local Cheshire messaging
- ✅ Free consultation mentions

---

## Next Steps

**Start with Phase 1 (Critical Performance & Tracking)** - These tasks have the highest impact and enable measurement of all other improvements.

Would you like me to begin with:
1. Task 1.1 - Microsoft Clarity Integration
2. Task 1.2 - GA4 Event Tracking Setup
3. Task 1.3 - Performance Budget Setup

Or would you prefer to tackle a different phase first?
