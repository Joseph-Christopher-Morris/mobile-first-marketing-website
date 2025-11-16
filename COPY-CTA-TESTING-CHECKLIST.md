# Website Copy & CTA Optimization - Testing Checklist

## Pre-Deployment Testing

### Local Build Test
- [ ] Run `npm run build` successfully
- [ ] No TypeScript errors
- [ ] No build warnings
- [ ] All pages generate correctly in `/out` folder

### Component Testing
- [ ] StickyCTA component renders on all pages
- [ ] Hero component displays without overlap
- [ ] Mobile text sizes are readable
- [ ] All links work correctly

## Post-Deployment Testing

### 1. Sticky CTA Verification

Test on each page by scrolling down past 300px:

#### Home Page
- [ ] URL: https://d15sc9fc739ev2.cloudfront.net
- [ ] CTA Text: "Let's Grow Your Business"
- [ ] Click scrolls to contact form
- [ ] GA4 event fires: `sticky_cta_click`

#### Services Overview
- [ ] URL: https://d15sc9fc739ev2.cloudfront.net/services
- [ ] CTA Text: "Explore How I Can Help"
- [ ] Click scrolls to contact form
- [ ] GA4 event fires

#### Website Hosting
- [ ] URL: https://d15sc9fc739ev2.cloudfront.net/services/hosting
- [ ] CTA Text: "Move My Website"
- [ ] Click scrolls to contact form
- [ ] GA4 event fires

#### Website Design
- [ ] URL: https://d15sc9fc739ev2.cloudfront.net/services/website-design
- [ ] CTA Text: "Design My New Website"
- [ ] Click scrolls to contact form
- [ ] GA4 event fires

#### Photography
- [ ] URL: https://d15sc9fc739ev2.cloudfront.net/services/photography
- [ ] CTA Text: "Book Your Shoot"
- [ ] Click scrolls to contact form
- [ ] GA4 event fires

#### Ad Campaigns
- [ ] URL: https://d15sc9fc739ev2.cloudfront.net/services/ad-campaigns
- [ ] CTA Text: "Launch My Campaign"
- [ ] Click scrolls to contact form
- [ ] GA4 event fires

#### Analytics
- [ ] URL: https://d15sc9fc739ev2.cloudfront.net/services/analytics
- [ ] CTA Text: "Review My Data"
- [ ] Click scrolls to contact form
- [ ] GA4 event fires

#### About
- [ ] URL: https://d15sc9fc739ev2.cloudfront.net/about
- [ ] CTA Text: "Work With Joe"
- [ ] Click scrolls to contact form
- [ ] GA4 event fires

#### Blog
- [ ] URL: https://d15sc9fc739ev2.cloudfront.net/blog
- [ ] CTA Text: "Learn From My Case Studies"
- [ ] Click scrolls to contact form
- [ ] GA4 event fires

#### Contact
- [ ] URL: https://d15sc9fc739ev2.cloudfront.net/contact
- [ ] Sticky CTA hidden (should not appear)
- [ ] Form displays correctly

### 2. Hero Section Testing

#### Desktop (1920x1080)
- [ ] Home page hero title doesn't overlap header
- [ ] Text is readable and properly sized
- [ ] Press strip displays correctly
- [ ] CTA buttons are visible and clickable
- [ ] Hero image loads properly

#### Tablet (768x1024)
- [ ] Hero title doesn't overlap header
- [ ] Text sizes are appropriate
- [ ] Layout adjusts correctly
- [ ] CTAs remain accessible

#### Mobile (375x667)
- [ ] Hero title is readable without zoom
- [ ] Text sizes reduced appropriately
- [ ] No horizontal scroll
- [ ] CTAs are thumb-friendly (min 44px)
- [ ] Hero image loads and displays well

### 3. Copy Verification

#### Home Page
- [ ] Hero: "I help Cheshire businesses get more leads..."
- [ ] Service cards condensed to 2 lines
- [ ] Contact form: "I reply personally the same day during business hours..."
- [ ] All paragraphs under 80 words
- [ ] No em dashes or jargon

#### About Page
- [ ] Hero: "I help Cheshire businesses get more leads..."
- [ ] Second paragraph: "Based in Nantwich..."
- [ ] Personal, relational tone
- [ ] Local focus maintained

#### Blog Page
- [ ] Title: "My Case Studies" (not "My Blog")
- [ ] Subtitle: "Real results from my projects..."
- [ ] Reduced text sizes
- [ ] Helpful, credible tone

#### Service Pages
- [ ] Each has unique value proposition
- [ ] Local keywords present (Cheshire, Nantwich)
- [ ] Outcome-focused language
- [ ] Clear, direct tone

### 4. Mobile Optimization

Test on actual mobile device (iPhone/Android):

- [ ] Scroll depth reduced by 25-35%
- [ ] Text readable without pinch-zoom
- [ ] Service cards fit on screen
- [ ] CTAs are easily tappable
- [ ] Forms work correctly
- [ ] No layout shifts (CLS)
- [ ] Fast load times (< 3 seconds)

### 5. Form Testing

#### Contact Form
- [ ] Form displays correctly
- [ ] All fields are accessible
- [ ] Validation works
- [ ] Submit button functions
- [ ] Success message appears
- [ ] Email notification received
- [ ] Business hours displayed

#### Service Inquiry Forms
- [ ] Hosting form works
- [ ] Design form works
- [ ] Photography form works
- [ ] All forms submit successfully

### 6. GA4 Tracking

Open GA4 Real-time Report and test:

- [ ] `sticky_cta_click` event fires
- [ ] `cta_call_click` event fires
- [ ] `cta_form_click` event fires
- [ ] Page views tracked correctly
- [ ] Event parameters captured:
  - `cta_text`
  - `page_path`
  - `page_type`

### 7. Cross-Browser Testing

#### Chrome (Desktop)
- [ ] All pages load correctly
- [ ] CTAs function properly
- [ ] No console errors
- [ ] Forms submit successfully

#### Firefox (Desktop)
- [ ] All pages load correctly
- [ ] CTAs function properly
- [ ] No console errors
- [ ] Forms submit successfully

#### Safari (Desktop)
- [ ] All pages load correctly
- [ ] CTAs function properly
- [ ] No console errors
- [ ] Forms submit successfully

#### Mobile Safari (iOS)
- [ ] All pages load correctly
- [ ] CTAs function properly
- [ ] Touch interactions work
- [ ] Forms submit successfully

#### Chrome Mobile (Android)
- [ ] All pages load correctly
- [ ] CTAs function properly
- [ ] Touch interactions work
- [ ] Forms submit successfully

### 8. Performance Testing

Use Google Lighthouse or PageSpeed Insights:

- [ ] Performance score > 90
- [ ] Accessibility score > 95
- [ ] Best Practices score > 90
- [ ] SEO score > 95
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1

### 9. SEO Verification

#### Home Page
- [ ] Title tag includes "Cheshire"
- [ ] Meta description compelling
- [ ] H1 includes target keyword
- [ ] First 100 words include keyword

#### Service Pages
- [ ] Each has unique title tag
- [ ] Target keyword in H1
- [ ] Keyword in first 100 words
- [ ] Keyword in one H2
- [ ] Meta descriptions unique

### 10. Accessibility Testing

- [ ] All CTAs have proper aria-labels
- [ ] Color contrast meets WCAG AA
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Focus indicators visible
- [ ] Alt text on all images

## Issue Tracking

### Critical Issues (Block Deployment)
- [ ] None found

### High Priority (Fix ASAP)
- [ ] None found

### Medium Priority (Fix Soon)
- [ ] None found

### Low Priority (Nice to Have)
- [ ] None found

## Sign-Off

- [ ] All critical tests passed
- [ ] No blocking issues found
- [ ] GA4 tracking verified
- [ ] Mobile experience optimized
- [ ] Ready for production deployment

**Tested By**: _________________  
**Date**: _________________  
**Time**: _________________  

**Approved By**: _________________  
**Date**: _________________  

---

## Quick Test Commands

```powershell
# Build and test locally
npm run build
npm run dev

# Deploy to production
.\deploy-copy-cta-optimization.ps1

# Verify deployment
node scripts/post-deployment-verification.js

# Check GA4 events
# Open: https://analytics.google.com/analytics/web/#/p123456789/realtime
```

## Rollback Procedure

If critical issues found:

```powershell
# Immediate rollback
.\revert-to-nov-10.ps1

# Verify rollback
# Check website: https://d15sc9fc739ev2.cloudfront.net
```

---

**Testing Complete!** ✅
