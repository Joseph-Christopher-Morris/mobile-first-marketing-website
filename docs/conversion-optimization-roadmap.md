# Conversion Optimization Roadmap

**Based on:** Google Ads & Microsoft Clarity Insights  
**Last Updated:** November 23, 2025

## Current Status

### ✅ Completed (Phase 1)
- UK English normalisation across all pages
- Mobile-first CTA improvements
- Above-fold value propositions
- Local trust indicators (Nantwich, Cheshire East)
- GA4 and Microsoft Clarity integration
- Accessibility improvements (WCAG 2.1)
- Sticky CTA implementation

### 📊 Performance Metrics Baseline
- **Average Session Duration:** 7-30 seconds (Google Ads traffic)
- **Bounce Rate:** High on Contact page (2-second exits)
- **Device Split:** Desktop majority, mobile needs improvement
- **Geographic Focus:** Cheshire East (Crewe, Nantwich, Sandbach, Congleton)

---

## Phase 2: Lead Magnets & Value Offers

### Objective
Capture visitor information before they leave, especially for short sessions.

### Implementation Tasks

#### 2.1 Free Website Audit Offer
**Priority:** High  
**Timeline:** Week 1

- [ ] Create "Free Website Audit" landing page
- [ ] Design audit checklist (10-point assessment)
- [ ] Build form with GA4 tracking
- [ ] Add exit-intent popup for homepage
- [ ] Create automated email response with audit template

**Files to Create:**
- `src/app/free-audit/page.tsx`
- `src/components/AuditForm.tsx`
- `src/components/ExitIntentPopup.tsx`

**Copy Examples:**
- "Get Your Free 10-Point Website Audit"
- "See How Your Site Performs Against Cheshire Competitors"
- "Instant PDF Report - No Obligation"

#### 2.2 Google Ads Performance Checklist
**Priority:** High  
**Timeline:** Week 1

- [ ] Create downloadable PDF checklist
- [ ] Build gated download page
- [ ] Add CTA to Analytics service page
- [ ] Track downloads in GA4

**Content:**
- 15-point Google Ads audit checklist
- Common mistakes for small businesses
- Cheshire East market insights

#### 2.3 Hosting Migration Guide
**Priority:** Medium  
**Timeline:** Week 2

- [ ] Create "Website Hosting Migration Guide" PDF
- [ ] Add to Hosting service page
- [ ] Include case study snippets
- [ ] Track engagement

---

## Phase 3: Service-Focused Case Studies

### Objective
Build trust and demonstrate results for Cheshire East businesses.

### Implementation Tasks

#### 3.1 Website Design Case Study
**Priority:** High  
**Timeline:** Week 2-3

**Structure:**
- Client: [Anonymised Cheshire business]
- Challenge: Outdated website, poor mobile experience
- Solution: Modern Next.js build, mobile-first design
- Results: 40% increase in enquiries, 60% faster load time

**Files:**
- `src/app/case-studies/website-design-cheshire/page.tsx`
- `src/components/CaseStudyCard.tsx`

#### 3.2 Google Ads Case Study
**Priority:** High  
**Timeline:** Week 3

**Structure:**
- Client: Local Cheshire service business
- Challenge: High CPC, low conversion rate
- Solution: Keyword refinement, landing page optimization
- Results: 50% reduction in CPC, 3x conversion rate

#### 3.3 Analytics Implementation Case Study
**Priority:** Medium  
**Timeline:** Week 4

**Structure:**
- Client: Cheshire e-commerce business
- Challenge: No visibility into customer journey
- Solution: GA4 setup, custom dashboards, Clarity integration
- Results: Identified 3 major friction points, 25% increase in checkout completion

---

## Phase 4: A/B Testing Framework

### Objective
Data-driven optimization of hero sections and CTAs.

### Implementation Tasks

#### 4.1 Hero Section Variations
**Priority:** Medium  
**Timeline:** Week 3-4

**Test Variations:**

**Homepage Hero - Variant A (Current):**
```
"Websites, Analytics & Digital Marketing for Cheshire Businesses"
CTA: "Get a Free Website Quote"
```

**Homepage Hero - Variant B:**
```
"Grow Your Cheshire Business Online"
Subheading: "Websites that convert. Analytics that inform. Marketing that works."
CTA: "See Our Cheshire Success Stories"
```

**Homepage Hero - Variant C:**
```
"Website Design & Digital Marketing in Nantwich"
Subheading: "Helping Cheshire East businesses succeed online since [year]"
CTA: "Get Your Free Website Audit"
```

**Implementation:**
- [ ] Set up Google Optimize or similar
- [ ] Create variant components
- [ ] Define success metrics (CTR, scroll depth, time on page)
- [ ] Run for 2 weeks minimum
- [ ] Analyze in GA4

#### 4.2 CTA Copy Testing
**Priority:** Medium  
**Timeline:** Week 4-5

**Test Variations:**

**Website Design Page:**
- A: "Get a Free Website Quote"
- B: "Start Your Website Project"
- C: "See Pricing & Packages"

**Analytics Page:**
- A: "Get a Free Ads and Tracking Audit"
- B: "Book Your Analytics Consultation"
- C: "See How We Track Success"

**Metrics:**
- Click-through rate
- Form completion rate
- Time to conversion

---

## Phase 5: Mobile Experience Enhancement

### Objective
Reduce mobile bounce rate and improve engagement.

### Implementation Tasks

#### 5.1 Mobile-Specific Improvements
**Priority:** High  
**Timeline:** Week 2

- [ ] Reduce hero section height on mobile
- [ ] Implement tap-to-call for phone numbers
- [ ] Add WhatsApp Business integration
- [ ] Optimize form fields for mobile keyboards
- [ ] Test thumb-friendly button sizes

**Files to Update:**
- `src/app/globals.css` (mobile breakpoints)
- `src/components/StickyCTA.tsx` (tap-to-call)
- `src/components/sections/ContactPageClient.tsx`

#### 5.2 Progressive Web App Features
**Priority:** Low  
**Timeline:** Week 6

- [ ] Add service worker
- [ ] Enable offline fallback
- [ ] Add "Add to Home Screen" prompt
- [ ] Implement push notifications (optional)

---

## Phase 6: Advanced Tracking & Analytics

### Objective
Deeper insights into user behavior and conversion paths.

### Implementation Tasks

#### 6.1 Enhanced GA4 Events
**Priority:** High  
**Timeline:** Week 3

**Events to Track:**
- Scroll depth (25%, 50%, 75%, 100%)
- Time on page milestones (10s, 30s, 60s, 120s)
- CTA visibility (when CTA enters viewport)
- Form field interactions
- External link clicks
- PDF downloads
- Video plays (if added)

**Implementation:**
```javascript
// Example: Scroll depth tracking
useEffect(() => {
  const handleScroll = () => {
    const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    
    if (scrollPercent >= 25 && !tracked25) {
      gtag('event', 'scroll_depth', { depth: '25%' });
      setTracked25(true);
    }
    // ... repeat for 50%, 75%, 100%
  };
  
  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, []);
```

#### 6.2 Clarity Session Recording Analysis
**Priority:** High  
**Timeline:** Ongoing

**Weekly Review Checklist:**
- [ ] Review 10 sessions from Google Ads traffic
- [ ] Identify rage clicks and dead clicks
- [ ] Note scroll depth patterns
- [ ] Document friction points
- [ ] Create action items

**Focus Areas:**
- Contact page (2-second exits)
- Service pages (scroll depth)
- Mobile navigation issues
- Form abandonment points

#### 6.3 Conversion Funnel Analysis
**Priority:** Medium  
**Timeline:** Week 4

**Funnels to Track:**

**Website Design Funnel:**
1. Homepage → Website Design page
2. Website Design page → Pricing/Contact
3. Contact form start → Form submission
4. Thank you page

**Google Ads Funnel:**
1. Ad click → Landing page
2. Landing page → Service page
3. Service page → Contact
4. Contact → Conversion

**Implementation:**
- Set up GA4 funnels
- Create Looker Studio dashboard
- Weekly funnel review
- Identify drop-off points

---

## Phase 7: Content Optimization

### Objective
Improve message match and reduce bounce rate.

### Implementation Tasks

#### 7.1 Landing Page Optimization
**Priority:** High  
**Timeline:** Week 2-3

**For Each Service Page:**
- [ ] Add FAQ section (Schema markup)
- [ ] Include local testimonials
- [ ] Add "What to Expect" timeline
- [ ] Include pricing transparency
- [ ] Add trust badges (if applicable)

#### 7.2 Blog Content Strategy
**Priority:** Medium  
**Timeline:** Ongoing

**Content Themes:**
- "Website Design for [Cheshire Town] Businesses"
- "Google Ads Tips for Small Businesses in Cheshire"
- "GA4 Setup Guide for Local Businesses"
- "Mobile Website Optimization Checklist"

**SEO Focus:**
- Cheshire East + service keywords
- Local business + digital marketing
- Town-specific content (Nantwich, Crewe, etc.)

---

## Phase 8: Negative Keyword Refinement

### Objective
Reduce wasted ad spend on DIY-intent searches.

### Implementation Tasks

#### 8.1 Negative Keyword List
**Priority:** High  
**Timeline:** Week 1

**Add to Google Ads:**
- "free"
- "how to make"
- "DIY"
- "tutorial"
- "course"
- "learn"
- "template"
- "builder" (e.g., "website builder")

#### 8.2 Search Term Analysis
**Priority:** High  
**Timeline:** Weekly

- [ ] Review search terms report
- [ ] Identify irrelevant queries
- [ ] Add to negative keyword list
- [ ] Adjust match types if needed

---

## Success Metrics & KPIs

### Primary Metrics
- **Conversion Rate:** Target 3-5% (from current baseline)
- **Average Session Duration:** Target 60+ seconds
- **Bounce Rate:** Target <50% for service pages
- **Form Completion Rate:** Target 40%+

### Secondary Metrics
- **Mobile Bounce Rate:** Target <60%
- **CTA Click-Through Rate:** Target 10%+
- **Scroll Depth:** Target 50%+ reach fold 2
- **Time to First Interaction:** Target <5 seconds

### GA4 Custom Reports
1. **Conversion Path Report**
   - Source/Medium → Landing Page → Conversion
   
2. **Device Performance Report**
   - Device → Bounce Rate → Conversion Rate
   
3. **Geographic Performance Report**
   - City → Sessions → Conversions
   
4. **CTA Performance Report**
   - CTA Text → Clicks → Conversions

---

## Tools & Resources

### Analytics & Tracking
- **GA4:** G-QJXSCJ0L43
- **Microsoft Clarity:** [Project ID]
- **Google Ads:** [Account ID]
- **Looker Studio:** Dashboard templates

### Testing Tools
- **Google Optimize:** A/B testing
- **Hotjar:** Alternative to Clarity
- **PageSpeed Insights:** Performance monitoring
- **Lighthouse CI:** Automated audits

### Development Tools
- **Next.js:** Framework
- **Tailwind CSS:** Styling
- **Playwright:** E2E testing
- **Vercel Analytics:** (Optional) Performance insights

---

## Monthly Review Checklist

### Week 1
- [ ] Review GA4 conversion data
- [ ] Analyze Clarity session recordings
- [ ] Check Google Ads performance
- [ ] Update negative keywords

### Week 2
- [ ] Review A/B test results
- [ ] Analyze scroll depth data
- [ ] Check mobile performance
- [ ] Review form abandonment

### Week 3
- [ ] Content performance review
- [ ] Case study engagement analysis
- [ ] Lead magnet conversion rates
- [ ] CTA performance comparison

### Week 4
- [ ] Monthly report generation
- [ ] Stakeholder presentation
- [ ] Next month planning
- [ ] Budget allocation review

---

## Quick Wins (Implement First)

1. **Exit-Intent Popup** (2 hours)
   - Free audit offer
   - Target homepage and service pages
   - A/B test copy

2. **Tap-to-Call on Mobile** (1 hour)
   - Add to header and sticky CTA
   - Track clicks in GA4

3. **FAQ Schema Markup** (3 hours)
   - Add to all service pages
   - Improve SERP appearance

4. **Scroll Depth Tracking** (2 hours)
   - Implement GA4 events
   - Analyze engagement

5. **Negative Keywords** (1 hour)
   - Add DIY-intent terms
   - Reduce wasted spend

---

## Notes

- All implementations follow S3 + CloudFront deployment architecture
- UK English maintained throughout
- WCAG 2.1 accessibility compliance required
- Mobile-first approach for all new features
- GA4 tracking required for all new CTAs and forms
