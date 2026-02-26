# Mobile Press Logos Spacing Fix - Quick Reference

## Problem
Press logos pill overlapped chart cards on mobile devices.

## Solution
Three CSS changes to `src/components/HeroWithCharts.tsx`:

### 1. Hero Bottom Padding
```tsx
// Before
<div className="relative h-[60vh] min-h-[480px] w-full overflow-hidden rounded-b-3xl">

// After
<div className="relative h-[60vh] min-h-[480px] w-full overflow-hidden rounded-b-3xl pb-16 md:pb-24">
```

### 2. Logos Pill Responsive
```tsx
// Before
<div className="mt-5 rounded-xl bg-white/95 px-6 py-4 shadow-sm">

// After
<div className="mt-5 max-w-full rounded-xl bg-white/95 px-4 sm:px-6 py-4 shadow-sm overflow-x-auto">
```

### 3. Cards Responsive Margin
```tsx
// Before
<div className="mx-auto -mt-10 grid max-w-6xl grid-cols-1 gap-6 px-4 sm:grid-cols-3">

// After
<div className="mx-auto mt-8 md:mt-10 lg:-mt-16 grid max-w-6xl grid-cols-1 gap-6 px-4 sm:grid-cols-3">
```

## Deploy

```powershell
.\deploy-mobile-spacing-fix.ps1
```

## Test Devices

- iPhone SE (375px)
- iPhone 13 (390px)
- Pixel 5 (393px)
- Desktop (1440px+)

## Expected Results

**Mobile:** Clear gap between logos and cards
**Desktop:** Cards overlap hero (preserved effect)

## CloudFront URL

https://d15sc9fc739ev2.cloudfront.net
