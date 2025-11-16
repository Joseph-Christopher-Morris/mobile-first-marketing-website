# Google Ads Launch Readiness Audit
**Date:** November 12, 2025  
**Status:** Pre-Launch Optimization

## 1. Conversion Tracking ✅ COMPLETE

### Active Conversions
| Conversion | Source | Optimization | Status |
|------------|--------|--------------|--------|
| Clicks to Call | Google-hosted | Primary | ✅ Active |
| Contact Form | Website | Primary | ✅ Active |

### Implementation Status
✅ **Website Conversion Tag**
```javascript
gtag('event', 'conversion', {
  'send_to': 'AW-17708257497/AtMkCIiD1r4bENmh-vtB'
});
```

✅ **Thank You Page Trigger**
- Path: `/thank-you`
- Duplicate guard: `sessionStorage` prevents multiple fires
- GA4 + Ads events validated in Tag Assistant
- Consent mode grants `analytics_storage` and `ad_storage`

✅ **Phone Click Tracking**
- Implemented in `src/lib/trackPhone.ts`
- Active on Sticky CTA (main conversion point)
- Fires same conversion event as form submissions

✅ **Tag Assistant Validation**
- GA4 Page View ✓
- Conversion Event (AW-17708257497/AtMkCIiD1r4bENmh-vtB) ✓
- No duplicate hits ✓
- Status in Ads: "Recording conversions"

## 2. Core Web Vitals & Performance Targets

### Current Targets
| Metric | Target | Current | Status | Priority |
|--------|--------|---------|--------|----------|
| LCP | < 1.8s | TBD | 🔍 Needs Testing | HIGH |
| CLS | < 0.1 | TBD | 🔍 Needs Testing | HIGH |
| TTFB | < 0.5s | TBD | 🔍 Needs Testing | MEDIUM |
| Mobile Speed | 90-100 | TBD | 🔍 Needs Testing | HIGH |
| Desktop Speed | 95-100 | TBD | 🔍 Needs Testing | MEDIUM |

### Required Actions
1. ⚠️ Run PageSpeed Insights on production URLs
2. ⚠️ Optimize hero image delivery (target <150KB WebP)
3. ⚠️ Ensure hero H1 and CTA render within 1s
4. ✅ CloudFront caching active
5. ⚠️ Verify lazy-load implementation
6. ⚠️ Check critical CSS inlining

## 3. Landing Page Experience

### Relevance ⚠️ NEEDS REVIEW
| Area | Requirement | Current Status | Action Needed |
|------|-------------|----------------|---------------|
| Hero Headline | Match Ad copy keywords | 🔍 Needs Review | Sync with Ad copy |
| Title Tags | Include service keywords | 🔍 Needs Review | Verify alignment |
| H1 Tags | Match primary keyword | 🔍 Needs Review | Audit all pages |

### Transparency ✅ COMPLETE
- ✅ Contact info visible (address, phone, business hours)
- ✅ Footer has complete business information
- ✅ /contact page has detailed information

### Navigation ✅ COMPLETE
- ✅ Top nav minimal and visible
- ✅ Easy access to pricing/contact/services
- ✅ Mobile menu functional

### Conversion Flow ⚠️ NEEDS OPTIMIZATION
- ⚠️ Reduce hero text scroll depth for mobile
- ✅ Simple forms implemented
- ✅ Short scroll to CTA

### Trust Signals ⚠️ NEEDS ENHANCEMENT
- ⚠️ Add "Trusted by Cheshire businesses" to hero
- ⚠️ Add "Featured in Business Insider & Daily Mail" to hero
- ✅ Press logos present
- ✅ Testimonials present

### Speed Feedback ⚠️ NEEDS TESTING
- ⚠️ LCP image must load within 1.8s on 4G
- ⚠️ Compress hero image to <150KB WebP
- ✅ CloudFront CDN active

## 4. Smart Bidding Readiness

### Configuration ✅ COMPLETE
- ✅ Both conversions set as Primary
- ✅ Conversion tracking active
- ⚠️ Need to set bidding strategy (Maximize Conversions or Target CPA)
- ⚠️ Enable enhanced CPC (ECPC) for manual tests

### Volume Requirements ⚠️ MONITOR
- ⚠️ Target: 15+ conversions/month per campaign
- ⚠️ Learning phase: 7-14 days before major edits
- ⚠️ Backup plan: Add secondary goal (page visit >30s) if volume low

## 5. SEO & Landing Page Optimization

### Page Elements ⚠️ NEEDS AUDIT
| Element | Action | Status |
|---------|--------|--------|
| `<title>` | Begin with service keyword + brand | 🔍 Needs Review |
| `<meta description>` | Persuasive, action-driven | 🔍 Needs Review |
| `<h1>` | Match primary keyword | 🔍 Needs Review |
| `<h2>` | Include supporting keywords | 🔍 Needs Review |
| Schema | Add LocalBusiness structured data | ✅ Present |
| Alt text | Keyword-related phrases | 🔍 Needs Review |

### Recommended Meta Description Template
```
"Fast, affordable websites and Google Ads management for Cheshire businesses. Get a free consultation today."
```

## 6. Mobile & Desktop UX

### Mobile ⚠️ NEEDS OPTIMIZATION
- ⚠️ Reduce hero scroll depth (tighten intro paragraph)
- ⚠️ CTA visible without scroll
- ✅ StickyCTA.tsx has per-page relevancy
- ✅ Mobile menu functional

### Desktop ⚠️ NEEDS VERIFICATION
- ⚠️ Verify no HeroWithCards header overlap
- ⚠️ Check whitespace between hero copy and CTA
- ⚠️ Verify viewport height logic (min-h-[85vh])

## 7. Analytics & Insights ✅ COMPLETE

- ✅ GA4 events: `form_start`, `form_submit`, `cta_form_input`, `phone_click`, `lead_form_submit`
- ✅ Google Ads conversion imports confirmed
- ✅ Microsoft Clarity recording installed
- ⚠️ Optional: Enable Enhanced Conversions after consistent tracking

## 8. Final QA Checklist

### Pre-Launch Validation
| Category | Check | Status |
|----------|-------|--------|
| **Conversion** | Tag Assistant shows 1x event on /thank-you | ✅ Ready |
| **Phone** | Calls from ad and site recorded | ✅ Ready |
| **Consent** | Both analytics & ad_storage granted | ✅ Ready |
| **Speed** | LCP <1.8s, CLS <0.1 | ⚠️ Needs Testing |
| **Relevance** | H1 & Ad headline match | ⚠️ Needs Review |
| **CTA** | Above fold on mobile | ⚠️ Needs Verification |
| **Tracking** | GA4 and Ads firing correctly | ✅ Ready |
| **Hosting** | CloudFront cache active | ✅ Ready |
| **UX** | No layout shift or overlap | ⚠️ Needs Testing |

## Priority Action Items

### HIGH PRIORITY (Before Launch)
1. **Run PageSpeed Insights** on all landing pages
2. **Optimize hero images** to <150KB WebP
3. **Verify LCP < 1.8s** on mobile
4. **Audit H1 tags** to match Ad copy keywords
5. **Test mobile hero** - ensure CTA visible without scroll
6. **Add trust signals** to hero section

### MEDIUM PRIORITY (Week 1)
1. Review and optimize meta descriptions
2. Verify alt text on all images
3. Test desktop layout for overlaps
4. Monitor conversion volume
5. Set up Enhanced Conversions

### LOW PRIORITY (Week 2+)
1. A/B test hero copy variations
2. Monitor Smart Bidding learning phase
3. Optimize based on Clarity heatmaps
4. Refine keyword targeting

## Testing URLs

**Production:**
- Home: https://vividmediacheshire.com/
- Services: https://vividmediacheshire.com/services
- Contact: https://vividmediacheshire.com/contact
- Thank You: https://vividmediacheshire.com/thank-you

**PageSpeed Insights:**
- https://pagespeed.web.dev/

**Tag Assistant:**
- https://tagassistant.google.com/

## Next Steps

1. **Deploy current conversion tracking** (if not already done)
2. **Run performance audit** using script below
3. **Review and optimize** based on audit results
4. **Final QA** before campaign launch
5. **Monitor** for 7-14 days during learning phase

---

**Status Summary:**
- ✅ Conversion Tracking: COMPLETE
- ⚠️ Performance: NEEDS TESTING
- ⚠️ Landing Pages: NEEDS OPTIMIZATION
- ✅ Analytics: COMPLETE
- ⚠️ UX: NEEDS VERIFICATION
