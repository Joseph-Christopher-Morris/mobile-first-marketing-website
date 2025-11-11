# SCRAM November 2025 - Implementation Tasks

## Phase 1: Content Updates (Quick Wins)

### Task 1.1: Analytics Page - Currency Update
**File:** `src/app/services/analytics/page.tsx`
**Action:** Replace all `$` with `£` in ROI Optimisation section
**Priority:** High
**Estimated Time:** 5 minutes

### Task 1.2: Ad Campaigns Page - Copy Updates
**File:** `src/app/services/ad-campaigns/page.tsx`
**Actions:**
- Change "Our Work in Action" → "My Work in Action"
- Replace "85% conversion rate" metric with "Increased bookings on the NYCC venue pages by 35%"
**Priority:** High
**Estimated Time:** 10 minutes

### Task 1.3: About Page - Credentials Update
**File:** `src/app/about/page.tsx`
**Actions:**
- Replace "Daily Mail" with "BBC News"
- Update description to "Editorial photography licensed by a nationally trusted media outlet"
**Priority:** High
**Estimated Time:** 10 minutes

### Task 1.4: Website Hosting Page - Content Cleanup
**File:** `src/app/services/website-hosting/page.tsx`
**Actions:**
- Remove "Published photographer available." copy
- Verify hero image is hosting-migration-card.webp
**Priority:** Medium
**Estimated Time:** 10 minutes

### Task 1.5: Website Design Page - Testimonial Removal
**File:** `src/app/services/website-design/page.tsx`
**Action:** Remove specific testimonial
**Priority:** Medium
**Estimated Time:** 5 minutes

## Phase 2: Form Enhancements

### Task 2.1: Add Mobile Phone Fields
**Files:**
- `src/app/services/website-hosting/page.tsx`
- `src/app/services/website-design/page.tsx`
- `src/app/services/ad-campaigns/page.tsx`
**Action:** Add UK mobile phone number input field to all service forms
**Priority:** High
**Estimated Time:** 30 minutes

### Task 2.2: About Page Form Dropdown
**File:** `src/app/about/page.tsx` or form component
**Action:** Add "Website Design & Development" option to dropdown
**Priority:** Medium
**Estimated Time:** 10 minutes

## Phase 3: Footer Updates

### Task 3.1: Footer Services List
**File:** `src/components/layout/Footer.tsx`
**Actions:**
- Add "Website Design & Development" to Services list
- Verify all service links are consistent
**Priority:** Medium
**Estimated Time:** 10 minutes

## Phase 4: SEO & Accessibility

### Task 4.1: Privacy Policy Link Text
**Files:** Site-wide search for privacy policy links
**Action:** Update link text to "Read our Privacy Policy"
**Priority:** Medium
**Estimated Time:** 15 minutes

### Task 4.2: Alt Text Validation
**Action:** Audit and validate alt text for hero and trust images
**Priority:** Medium
**Estimated Time:** 20 minutes

### Task 4.3: Heading Structure Audit
**Action:** Verify H1-H3 hierarchy on all pages
**Priority:** Low
**Estimated Time:** 15 minutes

## Phase 5: Performance Optimization

### Task 5.1: Image Optimization
**Actions:**
- Compress hero images
- Add width/height attributes to trust badges
- Verify image formats (WebP)
**Priority:** High
**Estimated Time:** 30 minutes

### Task 5.2: Font Preconnect
**File:** `src/app/layout.tsx`
**Action:** Add preconnect for Google Fonts and analytics
**Priority:** Medium
**Estimated Time:** 5 minutes

### Task 5.3: Cache Headers
**Action:** Verify CloudFront cache configuration
**Priority:** Medium
**Estimated Time:** 10 minutes

## Phase 6: Testing & Validation

### Task 6.1: Form Testing
**Action:** Test all updated forms with Formspree
**Priority:** High
**Estimated Time:** 20 minutes

### Task 6.2: Performance Testing
**Action:** Run Lighthouse audits on all updated pages
**Priority:** High
**Estimated Time:** 30 minutes

### Task 6.3: Cross-Device Testing
**Action:** Test on Android + iPhone
**Priority:** High
**Estimated Time:** 20 minutes

## Deployment Strategy

1. **Batch 1:** Content updates (Tasks 1.1-1.5) - Deploy together
2. **Batch 2:** Form enhancements (Tasks 2.1-2.2) - Deploy together
3. **Batch 3:** Footer + SEO (Tasks 3.1, 4.1-4.3) - Deploy together
4. **Batch 4:** Performance (Tasks 5.1-5.3) - Deploy separately
5. **Final:** Full testing and validation

## Total Estimated Time
- Phase 1: 40 minutes
- Phase 2: 40 minutes
- Phase 3: 10 minutes
- Phase 4: 50 minutes
- Phase 5: 45 minutes
- Phase 6: 70 minutes
**Total: ~4 hours**
