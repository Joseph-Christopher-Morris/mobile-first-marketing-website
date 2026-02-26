# Phase 2: Quick Wins Implementation
**Date:** November 23, 2025  
**Status:** Ready for Deployment

## Summary

Implemented Phase 2 Quick Wins from the conversion optimization roadmap. These changes add enhanced tracking, lead generation, and exit-intent functionality to improve conversion rates.

---

## Files Created

### Tracking & Analytics

#### 1. `src/hooks/useScrollDepth.ts`
- Tracks scroll depth at 25%, 50%, 75%, 100% milestones
- Sends GA4 events for engagement analysis
- Throttled for performance
- Passive event listeners

#### 2. `src/hooks/useExitIntent.ts`
- Detects when user's mouse leaves viewport
- Shows popup only once per session
- Tracks exit intent events in GA4
- Provides close handler

#### 3. `src/components/TrackingProvider.tsx`
- Global provider for scroll depth and exit intent
- Wraps application to enable site-wide tracking
- Manages ExitIntentPopup visibility

### Lead Generation

#### 4. `src/components/ExitIntentPopup.tsx`
- Exit-intent popup offering free website audit
- Tracks CTA clicks in GA4
- Accessible with keyboard navigation
- Mobile-responsive design
- Session-based display (shows once)

#### 5. `src/app/free-audit/page.tsx`
- Dedicated landing page for free audit offer
- SEO-optimised metadata
- Clear value proposition
- Trust indicators
- Cheshire-focused messaging

#### 6. `src/components/AuditForm.tsx`
- Lead capture form with validation
- GA4 event tracking on submission
- Google Ads conversion tracking
- Location dropdown for Cheshire towns
- Success/error state handling
- Formspree integration ready

---

## Next Steps to Deploy

### 1. Update Layout (Required)

Add TrackingProvider to `src/app/layout.tsx`:

```typescript
import { TrackingProvider } from '@/components/TrackingProvider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <body>
        <TrackingProvider>
          {/* existing layout content */}
          {children}
        </TrackingProvider>
      </body>
    </html>
  );
}
```

### 2. Configure Form Endpoint

Update `src/components/AuditForm.tsx` line 24:

```typescript
const response = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
```

Replace `YOUR_FORM_ID` with your actual Formspree form ID.

### 3. Add Google Ads Conversion Tracking

Update `src/components/AuditForm.tsx` line 38:

```typescript
window.gtag('event', 'conversion', {
  send_to: 'AW-CONVERSION_ID/CONVERSION_LABEL',
```

Replace with your actual Google Ads conversion ID and label.

### 4. Build and Deploy

```bash
# Build the site
npm run build

# Deploy using your standard process
node scripts/deploy.js
```

### 5. Verify Deployment

After deployment, test:

- [ ] Scroll to 25%, 50%, 75%, 100% - check GA4 Realtime for events
- [ ] Move mouse to top of viewport - exit intent popup should appear
- [ ] Visit `/free-audit` - page loads correctly
- [ ] Submit audit form - check form submission in GA4
- [ ] Check mobile responsiveness of all new components

---

## GA4 Events Added

| Event Name | Trigger | Parameters |
|------------|---------|------------|
| `scroll_depth` | User scrolls to milestone | `depth`, `page_path`, `page_title` |
| `exit_intent_triggered` | Mouse leaves viewport | `page_path` |
| `exit_intent_closed` | User closes popup | `page_path` |
| `exit_intent_cta_click` | User clicks popup CTA | `cta_text`, `page_path` |
| `audit_form_submit` | Form submitted | `form_name`, `business_location` |

---

## Expected Impact

### Immediate Benefits

1. **Better Engagement Tracking**
   - Understand how far users scroll
   - Identify content that's not being seen
   - Optimize page length based on data

2. **Lead Capture**
   - Capture leaving visitors with exit intent
   - Free audit offer reduces friction
   - Cheshire-focused messaging builds trust

3. **Conversion Insights**
   - Track which pages drive audit requests
   - Measure effectiveness of exit intent
   - Identify high-intent visitors

### 30-Day Goals

- 50+ audit form submissions
- 15% reduction in bounce rate
- 20% increase in average session duration
- 100+ exit intent popup views

---

## Monitoring Checklist

### Week 1
- [ ] Check GA4 for scroll depth events
- [ ] Review exit intent trigger rate
- [ ] Monitor audit form submissions
- [ ] Check mobile vs desktop performance

### Week 2
- [ ] Analyze scroll depth by page
- [ ] Review exit intent conversion rate
- [ ] Check audit form completion rate
- [ ] Identify any technical issues

### Week 3
- [ ] Compare pre/post implementation metrics
- [ ] Adjust exit intent timing if needed
- [ ] Review audit form field completion
- [ ] Test A/B variations if needed

### Week 4
- [ ] Generate monthly report
- [ ] Calculate ROI of lead magnet
- [ ] Plan Phase 3 improvements
- [ ] Document learnings

---

## Technical Notes

### Performance Considerations

- Scroll depth tracking is throttled using `requestAnimationFrame`
- Exit intent uses passive event listeners
- Session storage prevents popup spam
- All tracking is non-blocking

### Accessibility

- Exit intent popup has proper ARIA labels
- Keyboard navigation supported
- Focus management on popup open/close
- Form fields have associated labels

### Mobile Optimization

- Exit intent disabled on mobile (no mouse)
- Scroll tracking works on touch devices
- Forms are thumb-friendly
- Popup is responsive

---

## Rollback Plan

If issues arise:

1. Remove `<TrackingProvider>` from layout.tsx
2. Redeploy without new components
3. Original functionality remains intact

---

## Support

For questions or issues:
- Review `docs/conversion-optimization-roadmap.md`
- Check GA4 Realtime reports
- Test in incognito mode to see fresh session behavior

---

## Next Phase

After this deployment stabilizes (1-2 weeks), proceed to:

**Phase 3: Content Optimization**
- Add FAQ sections with Schema markup
- Create case studies
- Implement A/B testing framework

See `docs/conversion-optimization-roadmap.md` for full details.
