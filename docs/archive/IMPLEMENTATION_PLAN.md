# Site Update Implementation Plan

## Overview

Comprehensive site update including content updates, UI/UX fixes, and deployment
with proper cache rules.

## Objectives Checklist

### 1. Content Updates ✅

- [x] Update Photography portfolio (6 specific images)
- [x] Update Analytics portfolio (3 specific images)
- [x] Update Ad Campaigns portfolio (3 specific images)
- [x] Remove "View Full Portfolio" CTAs
- [x] Add proper alt text for all images

### 2. Lazy Loading Policy ⏳

- [ ] Implement eager loading for above-the-fold images
- [ ] Keep lazy loading for below-the-fold images
- [ ] Add fallback for non-IntersectionObserver browsers

### 3. Navigation - Hamburger Icon ⏳

- [ ] Hide hamburger on ≥1024px viewport
- [ ] Ensure desktop nav alignment
- [ ] Maintain mobile functionality

### 4. Button Styling ⏳

- [ ] Fix "Learn More" button colors (neutral)
- [ ] Keep primary CTA pink with white text

### 5. "Explore Our Other Services" Images ⏳

- [ ] Ensure images render as real img elements
- [ ] Fix asset paths and casing
- [ ] Add proper alt text and dimensions

### 6. Asset Hygiene ⏳

- [ ] Verify file paths and casing
- [ ] Set correct MIME types
- [ ] Implement proper caching strategy

### 7. Build & Deploy ⏳

- [ ] Build with TypeScript
- [ ] Upload to S3 with correct headers
- [ ] Create CloudFront invalidation
- [ ] Verify deployment

### 8. QA Testing ⏳

- [ ] Test all pages for above-the-fold loading
- [ ] Verify navigation on desktop/mobile
- [ ] Check button styling
- [ ] Validate image loading
- [ ] Run Lighthouse checks

## Implementation Order

1. **Content Updates** - Update portfolio images and remove CTAs
2. **Component Fixes** - Fix navigation, buttons, and image loading
3. **Asset Management** - Organize and verify image assets
4. **Build & Deploy** - Deploy with proper cache headers
5. **QA & Validation** - Comprehensive testing

## Files to Modify

### Content Files

- `content/services/photography.md`
- `content/services/analytics.md`
- `content/services/ad-campaigns.md`

### Component Files

- `src/components/sections/ServiceContent.tsx`
- `src/components/sections/ServiceNavigation.tsx`
- `src/components/layout/Header.tsx`
- `src/components/ui/Button.tsx`
- `src/components/ui/OptimizedImage.tsx`

### Asset Files

- Portfolio images in `public/images/services/`
- Verify image paths and casing

### Build/Deploy Files

- `scripts/deploy.js`
- CloudFront invalidation scripts

## Success Criteria

- All portfolio sections show only specified images
- No "View Full Portfolio" buttons remain
- Above-the-fold images load immediately
- Desktop navigation shows without hamburger
- Secondary buttons are neutral colored
- All service cards show images consistently
- Proper cache headers and MIME types
- All QA checks pass

## Rollback Plan

- Keep previous build in dated S3 folder
- Maintain last commit hash
- Ready to re-sync and invalidate if issues arise
