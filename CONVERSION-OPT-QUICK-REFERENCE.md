# Conversion Optimization - Quick Reference

## What Changed

### Homepage
- **Hero:** "Helping Cheshire Businesses Get More Leads, Faster"
- **Promise:** "We'll get back to you the same day (ASAP)"
- **CTAs:** "Call Joe" + "Book Your Consultation"

### Sticky CTAs (All Pages)
- Appears after scrolling 300px
- Left: "Call Joe" (tel: link)
- Right: Contextual CTA (changes per page)

### Hosting Page
- **Hero:** "Fast, Reliable Hosting with Same-Day Support"
- **Key Message:** "£120 per year • 99.9% uptime • Local support"

### Forms
- **Promise:** "We'll get back to you the same day (ASAP)"
- **Tracking:** GA4 events on focus and submit

---

## GA4 Events

1. **cta_call_click** - Call button clicks
2. **cta_form_click** - Form CTA clicks  
3. **cta_form_input** - Form field focus
4. **lead_form_submit** - Form submissions ⭐ CONVERSION

---

## Action Required

⚠️ **Update Phone Number:**
- `src/components/HeroWithCharts.tsx`
- `src/components/DualStickyCTA.tsx`
- Current: `+447123456789` (placeholder)

⚠️ **GA4 Setup:**
- Mark `lead_form_submit` as Conversion
- Set up conversion goals
- Monitor in DebugView

---

## Testing (After 5-15 min)

✅ Click "Call Joe" - phone dialer opens  
✅ Click form CTA - smooth scroll to form  
✅ Sticky CTA appears after scrolling  
✅ GA4 events fire in DebugView  
✅ Forms submit successfully  

---

## Expected Results

**Week 1:**
- CTA clicks: +2-3%
- Form submissions: +10-15%
- Bounce rate: -5-7%

**Week 2-4:**
- Conversion rate: 14-16%
- Engagement time: 1:45+
- More phone calls

---

## Next Phase

**Remaining Pages:**
- Website Design
- Photography
- Analytics
- Ad Campaigns

**Status:** Phase 1 Complete ✅
