# Implementation Plan

- [x] 1. Asset preparation and file structure optimization





  - Audit existing image assets in `public/images/services/` and `public/images/about/` directories
  - Rename files with spaces to kebab-case format (e.g., `Screenshot 2025-10-21 134238.png` → `pagespeed-aws-migration-desktop.png`)
  - Verify all required images exist and are properly organized
  - _Requirements: 2.3, 8.1, 8.2, 8.3_

- [x] 2. Create reusable service components





  - [x] 2.1 Build ServiceCard component for services hub


    - Create `src/components/services/ServiceCard.tsx` with props for title, description, thumbnail, and link
    - Implement responsive design with proper hover states and accessibility
    - Add TypeScript interfaces for component props
    - _Requirements: 1.2, 1.3, 9.1_


  - [x] 2.2 Create PhotographyGallery component

    - Build `src/components/services/PhotographyGallery.tsx` with responsive grid layout
    - Implement image loading with Next.js Image component and lazy loading
    - Add proper alt text for all gallery images including editorial screenshots
    - Configure grid breakpoints: 1 col mobile, 2 cols ≥640px, 3 cols ≥1024px
    - _Requirements: 3.1, 3.2, 3.4, 8.4, 9.2_

  - [x] 2.3 Build ProofElement components for hosting page


    - Create `src/components/services/ProofElement.tsx` for savings and performance proof
    - Implement responsive image display with proper sizing
    - Add support for pink cloud savings image and PageSpeed screenshot
    - _Requirements: 2.1, 2.2, 9.4_

  - [x] 2.4 Create OutcomeCard component for campaigns page


    - Build `src/components/services/OutcomeCard.tsx` for ROI metrics display
    - Style cards with consistent branding and responsive layout
    - Add props for metric value, description, and styling variants
    - _Requirements: 5.1, 5.2, 5.5_

- [x] 3. Update main services hub page





  - Modify `src/app/services/page.tsx` with new H1 title and content structure
  - Implement 4-card grid layout linking to all service subpages
  - Add thumbnail images for each service card from local assets
  - Include CTA section directing to /contact page
  - Ensure mobile-first responsive design with proper breakpoints
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 4. Implement website hosting migration page





  - [x] 4.1 Update page content and structure


    - Modify `src/app/services/hosting/page.tsx` with new copy and layout
    - Add hero section with service description and proof elements
    - Implement responsive layout with content and proof columns
    - _Requirements: 2.4, 2.5_

  - [x] 4.2 Add savings and performance proof images


    - Display pink cloud savings image (`hosting-migration-card.png`) in hero section
    - Add PageSpeed Insights screenshot below hero with proper styling
    - Ensure images are responsive and properly sized for all devices
    - Include descriptive alt text for accessibility
    - _Requirements: 2.1, 2.2, 8.4_

- [x] 5. Implement photography service page





  - [x] 5.1 Update page structure and content


    - Modify `src/app/services/photography/page.tsx` with new copy
    - Add hero section with service description
    - Integrate PhotographyGallery component below hero content
    - _Requirements: 3.5_

  - [x] 5.2 Configure gallery with real image assets


    - Set up image array with local Nantwich photography samples
    - Add editorial proof screenshots (BBC, Forbes, The Times) with descriptive alt text
    - Include campaign work samples from existing assets
    - Ensure proper categorization and captions for each image type
    - _Requirements: 3.1, 3.2, 3.3, 8.4_

- [x] 6. Implement data analytics service page





  - Update `src/app/services/analytics/page.tsx` with GA4/Adobe expertise emphasis
  - Add results section with 5 key metrics as formatted bullet points
  - Include optional dashboard screenshot section if assets are available
  - Add CTA section directing to contact page
  - Maintain consistent styling with other service pages
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 7. Implement strategic ad campaigns service page





  - Update `src/app/services/ad-campaigns/page.tsx` with ROI case study content
  - Implement outcome cards layout using OutcomeCard component
  - Display specific metrics (£13.5k from £546, 85% CR, 4 NYCC leads)
  - Add CTA section and ensure consistent page styling
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 8. Update about page with new content and images





  - [x] 8.1 Update page structure and content


    - Modify `src/app/about/page.tsx` with revised copy including curation line
    - Implement two-column hero layout with content and portrait
    - Add work context section below hero
    - _Requirements: 6.4, 6.5_

  - [x] 8.2 Add professional portrait and context images


    - Display professional portrait from `public/images/about/` in hero section
    - Add 2-3 supporting work context images (car shoot, desk work, collaboration)
    - Ensure all images have GDPR-compliant alt text
    - Implement responsive image sizing and layout
    - _Requirements: 6.1, 6.2, 6.3, 8.4_

- [x] 9. Build and deployment preparation





  - [x] 9.1 Validate build process


    - Run `npm run build` to ensure static export works correctly
    - Verify all images are included in build output
    - Check for any build warnings or errors related to image assets
    - _Requirements: 7.5, 8.1_

  - [x] 9.2 Deploy to S3 with CloudFront invalidation


    - Execute deployment using existing `scripts/deploy.js`
    - Set required environment variables for S3 bucket and CloudFront distribution
    - Invalidate CloudFront cache for affected paths (`/services/*`, `/about/*`, `/images/*`)
    - _Requirements: 7.1, 7.2, 7.4_

- [x] 10. Post-deployment validation and monitoring





  - [x] 10.1 Validate page functionality



    - Test all updated pages through CloudFront URL (not localhost)
    - Verify all images load correctly without 403 errors
    - Check responsive layout behavior across device sizes
    - Validate all CTA links direct to contact page
    - _Requirements: 7.3, 9.1, 9.2, 9.3_


  - [x] 10.2 Performance and accessibility testing

    - Run Lighthouse audits on all updated pages
    - Validate Core Web Vitals metrics meet performance targets
    - Test accessibility compliance including alt text and keyboard navigation
    - Verify mobile usability and touch target sizes
    - _Requirements: 8.4, 9.4, 9.5_


  - [x] 10.3 Cross-browser and device testing

    - Test functionality across Chrome, Firefox, Safari, and Edge
    - Validate responsive behavior on mobile, tablet, and desktop viewports
    - Check image loading performance and lazy loading effectiveness
    - Verify consistent styling and layout across browsers
    - _Requirements: 9.1, 9.2, 9.3_