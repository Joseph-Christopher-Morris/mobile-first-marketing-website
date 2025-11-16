# Hosting Page Pricing Normalisation Complete

**Date**: November 15, 2025  
**Status**: ✅ Complete - Ready for Deployment

## Summary

Successfully implemented pricing normalisation across the hosting page to establish clear, consistent pricing: **£15 per month or £120 per year when paid annually**.

## Changes Implemented

### 1. Hero Section
- Updated hero copy to include both monthly and annual pricing upfront
- Changed from generic "From £120 per year" to explicit "£15 per month or £120 per year when paid annually"
- Maintained all existing layout and styling

### 2. Website Hosting Package Card
- Updated pricing display to show "£15 per month" as primary price
- Added "or £120 per year when paid annually" as secondary option
- Changed tagline to "One clear price for hosting, backups and support"
- Kept all includes and CTA unchanged

### 3. Website Hosting Pricing Section
- Updated hosting bullet from "From £120 per year" to "£15 per month or £120 per year when paid annually"
- Maintained all other pricing section content

### 4. Real Performance Example
- Changed "From £120 per year" to "£120 per year" in case study
- This is appropriate as it's a specific example, not the pricing model

### 5. FAQ Section - Complete Refresh
Replaced old FAQs with new, more practical questions:

**New FAQs Added:**
1. How much does hosting cost?
2. Will this help my Google Ads or SEO?
3. Do I need to understand hosting or servers?
4. What happens if something goes wrong with my site?
5. Can you host a site that is already built?
6. Will my website be faster?
7. Is there any downtime during migration?

**Removed FAQs:**
- Will this improve my Google ranking? (merged into new Google Ads/SEO question)
- What makes your hosting different? (redundant)
- Will my site be faster after migration? (consolidated)
- Is migration complicated? (consolidated)
- Can I scale my site later? (not pricing-related)

## Files Modified

1. `src/app/services/hosting/page.tsx` - Main hosting page content
2. `src/components/SimplifiedServiceCard.tsx` - Hosting package card component

## Compliance

✅ No layout changes  
✅ No component structure changes  
✅ No Tailwind class modifications  
✅ Content and text only  
✅ No em dashes (standard hyphens only)  
✅ No references to £108 per year  
✅ Consistent £15/month and £120/year pricing throughout

## Next Steps

1. Build the site: `npm run build`
2. Deploy using standard S3 + CloudFront deployment
3. Invalidate CloudFront cache for hosting page
4. Verify pricing consistency across all sections

## Deployment Command

```powershell
# Standard deployment
node scripts/deploy.js
```

## Testing Checklist

- [ ] Hero section shows both monthly and annual pricing
- [ ] Hosting package card displays £15/month primary, £120/year secondary
- [ ] Pricing section bullet shows both options
- [ ] Case study shows £120/year (not "From")
- [ ] All 7 new FAQ questions display correctly
- [ ] No old pricing values (£108) remain
- [ ] No em dashes present

## Notes

- This update makes hosting pricing transparent and flexible for different cash flow needs
- The FAQ refresh addresses more practical customer concerns
- Pricing is now consistent with photography page approach (ready for that spec next)
- All changes are content-only, maintaining existing design and functionality
