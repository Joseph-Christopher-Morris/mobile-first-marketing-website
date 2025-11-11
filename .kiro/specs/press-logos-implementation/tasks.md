# Implementation Plan

- [x] 1. Create PressLogos Component





  - Create `src/components/PressLogos.tsx` with all seven press logos
  - Implement Next.js Image component for each logo with proper dimensions (110×32)
  - Add proper alt text and aria-labels for accessibility
  - Apply Tailwind CSS classes for monochrome display with 80% opacity
  - Implement hover effects with brand-pink tint using CSS filters
  - Add 300ms transition duration for smooth animations
  - Ensure flexbox layout with gap-6 spacing and center alignment
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 2. Integrate PressLogos into Home Page





  - Import PressLogos component in `src/app/page.tsx`
  - Add press logos section immediately after HeroWithCharts component
  - Include "As featured in:" label text with proper styling
  - Apply white background and py-10 padding to section
  - Set max-width container (max-w-6xl) with center alignment
  - Add responsive padding (px-4 sm:px-6 lg:px-8)
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 3. Integrate PressLogos into Photography Page





  - Import PressLogos component in `src/app/services/photography/page.tsx`
  - Replace existing text line of press names with PressLogos component
  - Add "As featured in:" label with brand-grey/70 styling
  - Apply mb-5 spacing to press logos container
  - Ensure all surrounding hero layout elements remain intact
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 4. Verify Responsive Design





  - Test component at mobile breakpoint (≤640px) for proper wrapping
  - Test component at tablet breakpoint (≥768px) for single-row alignment
  - Test component at desktop breakpoint (≥1024px) for centered layout
  - Verify no horizontal scroll occurs at any breakpoint
  - Confirm consistent logo height across all breakpoints
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 5. Verify Accessibility Compliance





  - Confirm all logos have descriptive alt text
  - Verify aria-label attributes on logo containers
  - Test keyboard navigation without layout disruption
  - Check color contrast in all states meets WCAG 2.1 Level AA
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 6. Run Lighthouse Performance Audit





  - Execute Lighthouse audit on home page
  - Execute Lighthouse audit on photography page
  - Verify Performance score ≥ 95
  - Verify Accessibility score ≥ 95
  - Confirm no layout shift (CLS = 0)
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 7. Deploy and Verify Production






  - Build static export with `npm run build`
  - Deploy to S3 bucket using deployment script
  - Invalidate CloudFront cache for affected paths
  - Verify logos load on `/` route with 200 OK responses
  - Verify logos load on `/services/photography` route with 200 OK responses
  - Test hover effects on major browsers (Chrome, Firefox, Safari, Edge)
  - Confirm no 404 errors in browser console
  - Verify visual consistency matches design specifications
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
