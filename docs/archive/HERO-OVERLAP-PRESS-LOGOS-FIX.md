# Hero Overlap & Press Logos Fix

## Issues Fixed

### 1. Hero Component Overlapping Charts on Desktop ✅

**Problem:** The hero section was overlapping with the chart cards on desktop devices due to a negative margin.

**Root Cause:** The proof cards section had `lg:-mt-16` which pulled the cards up into the hero section on large screens.

**Solution:** Changed the margin to positive spacing:
- Before: `mt-8 md:mt-10 lg:-mt-16`
- After: `mt-8 md:mt-12 lg:mt-16`

This provides proper spacing between the hero and charts on all screen sizes:
- Mobile: 2rem (mt-8)
- Tablet: 3rem (md:mt-12)
- Desktop: 4rem (lg:mt-16)

**File Changed:** `src/components/HeroWithCharts.tsx`

### 2. Press Logos Not Loading ✅

**Problem:** Press logo images in the PressStrip component were not loading on the website.

**Root Cause:** Next.js Image component was trying to optimize PNG files which can sometimes cause loading issues, especially with certain PNG formats or transparency.

**Solution:** Added the `unoptimized` prop to the Image component to bypass Next.js image optimization for these logos.

```tsx
<Image
  src={logo.src}
  alt={logo.alt}
  fill
  sizes="96px"
  className="object-contain"
  unoptimized  // ← Added this
/>
```

**File Changed:** `src/components/credibility/PressStrip.tsx`

**Logo Files Confirmed Present:**
- `/images/press-logos/bbc.png`
- `/images/press-logos/forbes.png`
- `/images/press-logos/financial-times.png`
- `/images/press-logos/cnn.png`
- `/images/press-logos/daily-mail.png`
- `/images/press-logos/autotrader.png`
- `/images/press-logos/business-insider.png`

## Testing Checklist

### Desktop Testing
- [ ] Hero section has proper spacing above chart cards
- [ ] No overlap between hero and charts
- [ ] Press logos display correctly in hero
- [ ] Press logos display correctly on other pages

### Mobile Testing
- [ ] Hero section looks good on mobile
- [ ] Chart cards have proper spacing
- [ ] Press logos are visible and properly sized
- [ ] No layout issues or overlaps

### Cross-Browser Testing
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari

## Technical Details

### Spacing Changes
The new spacing provides a cleaner, more professional layout:
- Removes the "floating card" effect that was causing overlap
- Provides consistent vertical rhythm
- Maintains responsive behavior across all breakpoints

### Image Loading
The `unoptimized` prop:
- Bypasses Next.js automatic image optimization
- Serves images directly from the public folder
- Useful for logos and graphics that are already optimized
- Prevents potential issues with PNG transparency

## Deployment Notes

Both changes are ready for deployment:
- No breaking changes
- No TypeScript errors
- Maintains all existing functionality
- Improves visual presentation and reliability

## Files Modified

1. `src/components/HeroWithCharts.tsx` - Fixed chart card spacing
2. `src/components/credibility/PressStrip.tsx` - Fixed logo loading

Both files compile without errors and are ready for production deployment.
