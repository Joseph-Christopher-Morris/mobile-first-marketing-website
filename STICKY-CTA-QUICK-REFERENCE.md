# Sticky CTA Quick Reference Guide

## What Changed

### Sticky CTA Bar
- **Location:** Bottom of screen (mobile & desktop)
- **Trigger:** Appears after scrolling 300px
- **Animation:** Slides up smoothly in 0.45s
- **Design:** Black background, white text, two buttons

### Button Configuration

#### Button 1: Call Joe
- **Color:** White background, black text
- **Icon:** Phone icon
- **Action:** Opens phone dialer (tel:+447586378502)
- **Tracking:** `cta_call_click` event

#### Button 2: Page-Specific CTA
- **Color:** Pink (#FF2B6A) background, white text
- **Icon:** Changes per page (calendar, file, chart, etc.)
- **Action:** Scrolls to contact form
- **Tracking:** `cta_form_click` event

### CTA Text by Page

```
Home → "Book Your Consultation"
Hosting → "Get Hosting Quote"
Website Design → "Build My Website"
Photography → "Book Your Shoot"
Analytics → "View My Data Options"
Ad Campaigns → "Start My Campaign"
Pricing → "See Pricing Options"
Blog → "Read Case Studies"
About → "Work With Me"
Contact → "Send Message"
```

## Pricing Page Changes

### Headlines
- Main: "Simple, transparent pricing. No hidden fees."
- Sub: "Every package includes personal support and fast turnaround."

### Key Pricing
- **Hosting:** £15/month or £120/year
- **Website Design:** From £300
- **Google Ads:** From £150/month
- **Photography:** From £150/project

### Personal Touch
"I personally reply to all enquiries between 8am and 6pm."

## Brand Terms Replaced

| Old | New |
|-----|-----|
| AWS S3 + CloudFront | secure cloud hosting with global delivery |
| AWS CloudFront | secure cloud infrastructure |
| AWS | secure cloud |
| CloudFront | global content delivery network |
| Cloudflare | protective caching and security layer |

## Testing the Changes

1. **Visit any page** on the site
2. **Scroll down** 300px - sticky bar should slide up
3. **Click "Call Joe"** - should open phone dialer
4. **Click page CTA** - should scroll to contact form
5. **Check pricing page** - new headlines and descriptions
6. **Search for "AWS"** - should find generic terms instead

## GA4 Events to Monitor

```javascript
// Call button clicked
cta_call_click {
  page_path: "/services/hosting",
  page_type: "hosting",
  cta_text: "Call Joe"
}

// Form CTA clicked
cta_form_click {
  page_path: "/services/hosting",
  page_type: "hosting",
  cta_text: "Get Hosting Quote"
}
```

## Files Modified

### Core Components
- `src/components/StickyCTA.tsx` - Complete redesign

### Pages Updated
- `src/app/pricing/page.tsx` - New pricing transparency
- 13 files with brand term replacements

## Rollback Instructions

If needed, revert to previous deployment:

```bash
# Use rollback script
node scripts/rollback.js list
node scripts/rollback.js rollback <backup-id>
```

## Support

- **Deployment ID:** deploy-1762897774602
- **CloudFront Distribution:** E2IBMHQ3GCW6ZK
- **Invalidation ID:** I8T1TE095TZBR57L01ZDO2FS8P

---

**Quick Tip:** The sticky CTA is designed to increase conversions by keeping the call-to-action always visible. Monitor GA4 events to track effectiveness.
