# Website Image and Navigation Fixes Implementation Plan

- [x] 1. Image File System Audit and Organization
  - Audit all existing images in public/images/ directory structure
  - Identify missing images specified in requirements
  - Rename files with spaces or special characters to kebab-case format
  - Organize images into correct subdirectories (services/, hero/, about/)
  - _Requirements: 4.2, 4.3_

- [x] 2. Homepage Service Card Image Implementation
  - [x] 2.1 Update Photography Services card image path
    - Verify photography-hero.webp exists in public/images/services/
    - Update service data configuration with correct path
    - Test image loading in homepage services section
    - _Requirements: 1.1_

  - [x] 2.2 Update Data Analytics & Insights card image path
    - Locate and rename Screenshot 2025-09-23 201649.webp to kebab-case
    - Update service data configuration with normalized path
    - Test image loading in homepage services section
    - _Requirements: 1.1_

  - [x] 2.3 Update Strategic Ad Campaigns card image path
    - Verify ad-campaigns-hero.webp exists in public/images/services/
    - Update service data configuration with correct path
    - Test image loading in homepage services section
    - _Requirements: 1.1_

- [x] 3. Homepage Blog Preview Image Implementation
  - [x] 3.1 Update "What I Learned From My Paid Ads Campaign" blog image
    - Verify google-ads-analytics-dashboard.webp exists in public/images/hero/
    - Update blog post data with correct image path
    - Test image loading in BlogPreview component
    - _Requirements: 1.2_

  - [x] 3.2 Update "How I Turned £546 into £13.5K With Flyers" blog image
    - Locate and rename WhatsApp Image file to kebab-case format
    - Update blog post data with normalized path
    - Test image loading in BlogPreview component
    - _Requirements: 1.2_

  - [x] 3.3 Update "Stock Photography Lessons" blog image
    - Verify 240619-London-19.webp exists in public/images/hero/
    - Update blog post data with correct image path
    - Test image loading in BlogPreview component
    - _Requirements: 1.2_

- [x] 4. Photography Services Page Image Implementation
  - [x] 4.1 Implement photography services hero image
    - Verify 250928-Hampson_Auctions_Sunday-11.webp exists in
      public/images/services/
    - Update photography service data with hero image path
    - Test ServiceHero component image loading
    - _Requirements: 2.1_

  - [x] 4.2 Implement photography portfolio images
    - Verify all 6 portfolio images exist in public/images/services/
    - Update photography service data with portfolio image paths
    - Test ServiceContent component gallery image loading
    - _Requirements: 2.2_

- [x] 5. Data Analytics Services Page Image Implementation
  - [x] 5.1 Implement analytics services hero image
    - Verify Screenshot 2025-09-23 201649.webp exists and rename if needed
    - Update analytics service data with hero image path
    - Test ServiceHero component image loading
    - _Requirements: 2.3_

  - [x] 5.2 Implement analytics portfolio images
    - Verify Screenshot 2025-08-12 124550.webp exists in public/images/services/
    - Verify Stock_Photography_SAMIRA.webp exists in public/images/hero/
    - Verify output (5).webp exists and rename to kebab-case
    - Update analytics service data with portfolio image paths
    - _Requirements: 2.4_

- [x] 6. Strategic Ad Campaigns Services Page Image Implementation
  - [x] 6.1 Implement ad campaigns services hero image
    - Verify ad-campaigns-hero.webp exists in public/images/services/
    - Update ad campaigns service data with hero image path
    - Test ServiceHero component image loading
    - _Requirements: 2.5_

  - [x] 6.2 Implement ad campaigns portfolio images
    - Verify accessible_top8_campaigns Source.webp exists and rename to
      kebab-case
    - Verify Top 3 Mediums by Conversion Rate.webp exists and rename to
      kebab-case
    - Verify Screenshot 2025-08-12 124550.webp exists in public/images/services/
    - Update ad campaigns service data with portfolio image paths
    - _Requirements: 2.6_

- [x] 7. About Page Image Implementation
  - Verify A7302858.webp exists in public/images/about/
  - Update about page component with hero image path
  - Test about page hero image loading
  - _Requirements: 3.1_

- [x] 8. Blog Page Service Cards Image Implementation
  - Verify blog page uses same service card images as homepage
  - Update blog page component to reference correct service image paths
  - Test service card image loading on blog page
  - _Requirements: 3.2_

- [x] 9. Desktop Navigation Hamburger Removal (CRITICAL - ADDENDUM)
  - [x] 9.1 Implement conditional rendering for hamburger at md breakpoint
    - Modify Header component to NOT render hamburger trigger at ≥ md breakpoint
      (768px)
    - Ensure hamburger doesn't take space or overlay elements on desktop
    - Verify no absolute/fixed positioning creates floating layers over desktop
      UI
    - _Requirements: 6.1, 6.4_

  - [x] 9.2 Update desktop navigation visibility logic
    - Ensure desktop navigation always visible at ≥ md breakpoint
    - Scope mobile menu logic to < md breakpoint only
    - Verify floating quick-action buttons use unique class and z-index < header
    - _Requirements: 6.2, 6.5_

  - [x] 9.3 Implement accessibility tab order fixes
    - Configure tab order to skip mobile-menu controls at ≥ md breakpoint
    - Test keyboard navigation never encounters hidden mobile button on desktop
    - Verify accessibility attributes maintained across breakpoints
    - _Requirements: 6.6_

  - [x] 9.4 Validate navigation behavior across specific viewport widths
    - Test at 768px, 1024px, 1280px: no hamburger present, desktop links visible
    - Test at 375px, 414px: hamburger present and functional
    - Verify keyboard tabbing behavior at each breakpoint
    - _Requirements: 6.7, 6.8_

- [x] 10. Build Pipeline Image Verification
  - [x] 10.1 Verify Next.js build includes all images
    - Run build process and check out/ directory contains all images
    - Verify image directory structure matches public/ structure
    - Test that all image file types are included in build
    - _Requirements: 5.1_

  - [x] 10.2 Create build verification script
    - Write script to validate all required images exist in build output
    - Implement automated check for missing images
    - Add build verification to deployment pipeline
    - _Requirements: 5.1_

- [x] 11. Deployment Pipeline MIME Type Configuration
  - [x] 11.1 Update deployment script for WebP MIME types
    - Configure S3 upload to set Content-Type: image/webp for .webp files
    - Verify deployment script handles all image file extensions
    - Test MIME type configuration in deployment process
    - _Requirements: 4.1, 5.2_

  - [x] 11.2 Implement CloudFront cache invalidation for images
    - Update deployment script to invalidate /images/\* paths
    - Verify cache invalidation completes successfully
    - Test that updated images are served immediately after deployment
    - _Requirements: 5.4_

- [x] 12. Post-Deployment Image Validation
  - [x] 12.1 Create image accessibility validation script
    - Write script to test direct access to all image URLs
    - Verify HTTP 200 responses for all required images
    - Check correct Content-Type headers are served
    - Generate validation report with success/failure status
    - _Requirements: 5.5, 7.2_

  - [x] 12.2 Implement automated image loading verification
    - Create test suite to verify images load on each page
    - Test image loading performance and error handling
    - Validate no "Loading image..." placeholders remain
    - Generate comprehensive image loading report
    - _Requirements: 7.1, 7.5_

- [x] 13. Cross-Browser and Performance Testing
  - [x] 13.1 Test image loading across major browsers
    - Test WebP support and fallback mechanisms in Chrome, Firefox, Safari, Edge
    - Verify image loading performance on different connection speeds
    - Test responsive image behavior on various screen sizes
    - _Requirements: 1.4, 2.2, 2.4, 2.6_

  - [x] 13.2 Validate navigation behavior across devices
    - Test desktop navigation on different screen sizes
    - Verify mobile hamburger menu functionality on touch devices
    - Test keyboard navigation and accessibility features
    - _Requirements: 6.3, 6.4_

- [x] 14. Performance Optimization and Monitoring
  - [x] 14.1 Implement image loading performance monitoring
    - Add performance metrics for image loading times
    - Monitor Core Web Vitals impact of image changes
    - Set up alerts for image loading failures
    - _Requirements: 4.4_

  - [x] 14.2 Optimize caching strategy
    - Configure long-term caching for images (max-age=31536000)
    - Configure short-term caching for HTML pages (max-age=300)
    - Test cache behavior and invalidation effectiveness
    - _Requirements: 4.4, 4.5_
