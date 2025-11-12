# GA4 Event Tracking for Contextual CTAs

## Overview
This guide shows how to add GA4 event tracking to the new contextual sticky CTAs so you can measure their performance per page and compare click rates.

---

## Implementation

### Option 1: Add to StickyConversionBar Component (Recommended)

Update `src/components/StickyConversionBar.tsx` to include GA4 tracking:

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function StickyConversionBar() {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();

  // ... existing useEffect for scroll ...

  // Get contextual CTA text based on current page
  const getCTAText = () => {
    // ... existing logic ...
  };

  // Get contextual message based on current page
  const getMessage = () => {
    // ... existing logic ...
  };

  // Track CTA click with GA4
  const trackCTAClick = (ctaType: 'phone' | 'contact') => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'sticky_cta_click', {
        cta_type: ctaType,
        cta_text: getCTAText(),
        page_path: pathname,
        event_category: 'engagement',
        event_label: `${ctaType}_${pathname}`,
      });
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 bg-brand-black border-t-2 border-brand-pink shadow-2xl transform transition-transform duration-300"
      role="complementary"
      aria-label="Contact options"
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-white text-sm sm:text-base font-medium text-center sm:text-left">
          {getMessage()}
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <a
            href="tel:+447123456789"
            onClick={() => trackCTAClick('phone')}
            className="inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-semibold bg-white text-brand-black hover:bg-gray-100 transition-colors shadow-md min-h-[48px] min-w-[48px] w-full sm:w-auto"
            aria-label="Call Joe to discuss your project"
          >
            {/* ... existing SVG ... */}
            Call Joe
          </a>
          
          <Link
            href="/contact"
            onClick={() => trackCTAClick('contact')}
            className="inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-semibold bg-brand-pink text-white hover:bg-brand-pink2 transition-colors shadow-md min-h-[48px] min-w-[48px] w-full sm:w-auto"
            aria-label={getCTAText()}
          >
            {/* ... existing SVG ... */}
            {getCTAText()}
          </Link>
        </div>
      </div>
    </div>
  );
}
```

---

## GA4 Event Structure

### Event Name
`sticky_cta_click`

### Event Parameters
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `cta_type` | string | Type of CTA clicked | "phone" or "contact" |
| `cta_text` | string | Text displayed on button | "Book Your Shoot" |
| `page_path` | string | Current page path | "/services/photography" |
| `event_category` | string | Event category | "engagement" |
| `event_label` | string | Combined label | "contact_/services/photography" |

---

## GA4 Reports to Create

### 1. CTA Performance by Page
**Report Type:** Exploration > Free Form

**Dimensions:**
- Page path
- Event label
- CTA text

**Metrics:**
- Event count
- Conversions
- Conversion rate

**Filters:**
- Event name = "sticky_cta_click"

### 2. CTA Type Comparison
**Report Type:** Exploration > Free Form

**Dimensions:**
- CTA type (phone vs contact)
- Page path

**Metrics:**
- Event count
- Unique users
- Engagement rate

### 3. Contextual CTA Effectiveness
**Report Type:** Exploration > Funnel

**Steps:**
1. Page view
2. Sticky CTA click
3. Contact form submission or phone call

**Breakdown by:**
- Page path
- CTA text

---

## Custom Dimensions (Optional)

If you want more detailed tracking, create these custom dimensions in GA4:

### User-scoped
- `user_persona` — "SME Owner" or "Tradesperson" (based on behavior)

### Event-scoped
- `cta_context` — The contextual message shown
- `scroll_depth` — How far user scrolled before clicking

---

## Testing the Implementation

### 1. Local Testing
```bash
# Start dev server
npm run dev

# Open browser console
# Navigate to different pages
# Click sticky CTAs
# Check console for gtag events
```

### 2. GA4 DebugView
1. Install GA Debugger Chrome extension
2. Enable debug mode
3. Navigate site and click CTAs
4. Check DebugView in GA4 for events

### 3. Production Verification
1. Deploy changes
2. Wait 24-48 hours for data
3. Check GA4 Events report
4. Verify `sticky_cta_click` events appear

---

## Expected Results

### Baseline (Before Update)
- Generic CTA clicks: ~12-14% of visitors
- Conversion rate: 11-13%

### Target (After Update)
- Contextual CTA clicks: ~16-19% of visitors (+4-5%)
- Conversion rate: 14-16% (+3%)

### By Page Type
| Page | Expected CTR | Reasoning |
|------|--------------|-----------|
| Photography | 18-22% | High intent, specific CTA |
| Hosting | 16-20% | Problem-aware visitors |
| Pricing | 14-18% | Comparison shoppers |
| Blog | 12-16% | Educational, lower intent |
| Homepage | 14-17% | Mixed intent |

---

## Optimization Tips

### If CTR is Low (<12%)
- Make CTA more prominent
- Adjust scroll trigger (show earlier)
- Test different messaging

### If CTR is High but Conversions Low
- Check contact form usability
- Verify phone number is correct
- Test form field requirements

### If Specific Pages Underperform
- Review page content relevance
- Test different CTA text for that page
- Check page load speed

---

## A/B Testing Ideas

### Test 1: CTA Timing
- **Variant A:** Show after 300px scroll (current)
- **Variant B:** Show after 500px scroll
- **Variant C:** Show after 10 seconds on page

### Test 2: CTA Messaging
- **Variant A:** Contextual (current)
- **Variant B:** Generic "Get Started"
- **Variant C:** Urgency-based "Limited Availability"

### Test 3: CTA Design
- **Variant A:** Bottom bar (current)
- **Variant B:** Floating button (bottom right)
- **Variant C:** Slide-in panel

---

## Dashboard Setup

### Quick Dashboard in GA4

1. Go to GA4 > Reports > Library
2. Create new report
3. Add these cards:

**Card 1: Total CTA Clicks**
- Metric: Event count
- Filter: Event name = sticky_cta_click

**Card 2: CTA Click Rate**
- Metric: Event count / Sessions
- Filter: Event name = sticky_cta_click

**Card 3: Top Performing Pages**
- Dimension: Page path
- Metric: Event count
- Filter: Event name = sticky_cta_click
- Sort: Descending

**Card 4: CTA Type Split**
- Dimension: CTA type
- Metric: Event count
- Visualization: Pie chart

---

## Troubleshooting

### Events Not Showing in GA4
1. Check GA4 measurement ID is correct
2. Verify gtag is loaded (check Network tab)
3. Wait 24-48 hours for data processing
4. Use DebugView for real-time testing

### Duplicate Events
1. Check for multiple gtag calls
2. Verify onClick handlers aren't duplicated
3. Use event deduplication in GA4 settings

### Missing Parameters
1. Check parameter names match exactly
2. Verify pathname is available
3. Test in different browsers

---

## Summary

Adding GA4 tracking to contextual CTAs gives you:

✅ **Visibility** — See which pages drive most engagement  
✅ **Optimization** — Identify underperforming CTAs  
✅ **Proof** — Measure impact of contextual messaging  
✅ **Insights** — Understand user behavior by page type  

**Next Step:** Implement tracking, wait 2 weeks, analyze results, optimize based on data.
