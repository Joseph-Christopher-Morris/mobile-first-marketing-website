# Implementation Plan

- [x] 1. Next.js Configuration and Build Setup





  - Update next.config.js with output: 'export' and images.unoptimized: true
  - Add build:static script to package.json: "npm run build && npm run export"
  - Configure TypeScript to ignore errors during CI build (strict mode on)
  - Make analyzer optional and remove console logs in production
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 2. Brand Color System Enforcement





  - Update tailwind.config.js extend.colors.brand with exact hex values: pink #ff2d7a, pink2 #d81b60, black #0b0b0b, white #ffffff
  - Remove all instances of from-indigo-*, via-purple-*, bg-gradient-*, bg-yellow-*, text-yellow-* from all components
  - Replace gradient backgrounds with flat white or black sections
  - Update all hover states to use bg-brand-pink2
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 3. Home Page Hero Section Exact Rollback





- [x] 3.1 Restore hero background and overlay


  - Set hero background image to /images/hero/aston-martin-db6-website.webp
  - Apply bg-black/45 overlay
  - Configure responsive spacing py-28 md:py-40
  - _Requirements: 3.1, 3.2, 3.6, 3.7_

- [x] 3.2 Implement exact hero content and buttons


  - Add exact headline with specified line breaks
  - Include exact paragraph copy from brief
  - Create "Get Started" button (bg-brand-pink hover:bg-brand-pink2) linking to /contact/
  - Create "View Services" button (pink outline) linking to /services/
  - _Requirements: 3.3, 3.4, 3.5_

- [x] 4. Services/Photography Gallery Image Management





- [x] 4.1 Rename service images to kebab-case


  - Rename 250928-Hampson_Auctions_Sunday-11.webp to 250928-hampson-auctions-sunday-11.webp
  - Rename 240217-Australia_Trip-232 (1).webp to 240217-australia-trip-232-1.webp
  - Rename 240219-Australia_Trip-148.webp to 240219-australia-trip-148.webp
  - Rename 240619-London-19.webp to 240619-london-19.webp
  - Rename 240619-London-26 (1).webp to 240619-london-26-1.webp
  - Rename 240619-London-64.webp to 240619-london-64.webp
  - Rename 250125-Liverpool-40.webp to 250125-liverpool-40.webp
  - _Requirements: 4.1, 4.2_

- [x] 4.2 Update portfolio array with exact specifications


  - Update portfolio array with exact 7 images using new kebab-case names
  - Add descriptive alt text with location information as specified in brief
  - Ensure all image references point to renamed files
  - _Requirements: 4.3, 4.5_

- [x] 5. Contact Page Form Rollback





- [x] 5.1 Restore original contact form structure


  - Implement fields in exact order: Full Name (required, text), Email Address (required, email), Phone (optional, tel), Service Interest (select), Message (required, textarea)
  - Add accessible <label htmlFor> elements for all fields
  - Configure "Send Message" submit button with bg-brand-pink hover:bg-brand-pink2 text-white styling
  - _Requirements: 5.1, 5.2, 5.4_

- [x] 5.2 Implement form validation and responsive design


  - Add descriptive error text for form validation
  - Ensure proper responsive layout for mobile devices
  - Test form functionality and accessibility
  - _Requirements: 5.3, 5.5_

- [x] 6. Blog Content Restoration and Flyers ROI Addition





- [x] 6.1 Restore original blog post content


  - Revert all /content/blog/*.md|mdx files to original pre-AI text
  - Ensure proper front-matter metadata for all existing posts
  - Validate content integrity and authenticity
  - _Requirements: 6.1, 6.6_

- [x] 6.2 Create Flyers ROI article


  - Create blog post with exact title: "How I Turned £546 into £13.5K With Flyers: Year-by-Year ROI Breakdown (2021–2025)"
  - Set slug: "flyers-roi-breakdown", date: "2025-08-12"
  - Add complete front-matter with description, tags, coverImage, alt, location, readingTime
  - Set cover image: /images/hero/whatsapp-image-2025-07-11-flyers-roi.webp
  - _Requirements: 6.2, 6.3_

- [x] 6.3 Update blog listing and navigation


  - Configure blog index to sort posts by date descending with no item count cap
  - Replace generic "Read More" with accessible labels: aria-label="Read the article: {post.title}"
  - Set button text to "Read Article"
  - _Requirements: 6.4, 6.5_

- [x] 7. Performance, SEO, and Accessibility Implementation





- [x] 7.1 Implement optimized image components


  - Use <Image> component with fill or explicit width/height and sizes prop for all images
  - Ensure proper image optimization and loading performance
  - Add comprehensive alt text for all hero and portfolio images
  - _Requirements: 7.1, 7.5_

- [x] 7.2 Enhance accessibility and SEO elements


  - Replace generic "Learn More" text with contextual labels (keeping screenshot-shown text)
  - Ensure pink/white/black color combinations pass WCAG AA contrast standards
  - Create robots.txt with User-agent: *, Allow: /, Sitemap: https://d15sc9fc739ev2.cloudfront.net/sitemap.xml
  - Add proper meta tags with descriptions and titles for all pages
  - _Requirements: 7.2, 7.3, 7.4, 7.5_

- [x] 8. Caching and Headers Configuration





- [x] 8.1 Configure S3 metadata for differentiated caching


  - Set up HTML files with Cache-Control: public, max-age=600
  - Configure static assets with Cache-Control: public, max-age=31536000, immutable
  - Implement differentiated upload strategy for HTML vs assets
  - _Requirements: 8.1, 8.2, 8.4_

- [x] 8.2 Implement CloudFront invalidation strategy


  - Configure invalidation for paths: /, /index.html, /services/*, /blog*, /images/*, /sitemap.xml, /_next/*
  - Verify proper cache headers are applied after deployment
  - Test cache behavior for different file types
  - _Requirements: 8.3, 8.5_

- [x] 9. Deployment Commands and Infrastructure





- [x] 9.1 Create deployment scripts and commands


  - Implement npm ci && npm run build:static workflow
  - Create PowerShell commands for S3 sync with differentiated caching
  - Configure aws s3 sync for HTML files with short cache headers
  - Configure aws s3 sync for assets with long cache headers
  - _Requirements: 9.1, 9.2, 9.3, 9.5_

- [x] 9.2 Implement CloudFront invalidation commands


  - Create aws cloudfront create-invalidation command with distribution ID E2IBMHQ3GCW6ZK
  - Configure invalidation for all specified paths
  - Verify invalidation completes successfully
  - _Requirements: 9.4_

- [x] 10. Rollback and Version Management





- [x] 10.1 Document rollback procedures


  - Create aws s3api list-object-versions command for version listing
  - Document aws s3api copy-object command for version restoration
  - Include proper metadata and cache-control in rollback commands
  - Create step-by-step rollback documentation
  - _Requirements: 10.1, 10.2, 10.4_

- [x] 10.2 Implement version tracking and logging


  - Set up deployment logs and version tracking
  - Document version IDs for critical files like index.html
  - Create operational runbook for rollback procedures
  - _Requirements: 10.3, 10.5_

- [x] 11. Acceptance Criteria Validation and Testing





- [x] 11.1 Brand and UI validation


  - Verify no gradients, blue, purple, or yellow colors exist
  - Confirm only brand palette colors are used throughout
  - Validate home hero matches copy, layout, spacing, and button styles exactly
  - _Requirements: 11.1, 11.2_

- [x] 11.2 Content and functionality validation


  - Verify contact form fields, order, and labels match pre-AI version
  - Confirm blog originals are restored and Flyers ROI article is visible
  - Test services/photography page shows all 7 images with no 404 errors
  - _Requirements: 11.3, 11.4_

- [x] 11.3 Performance and SEO validation


  - Run Lighthouse audits targeting ≥ 90 scores on Home, Services, and Blog post
  - Verify robots.txt and sitemap are accessible
  - Confirm alt text for all hero/portfolio images and descriptive link labels
  - _Requirements: 11.5, 11.6_

- [x] 11.4 Deployment and infrastructure validation


  - Confirm deployment to S3/CloudFront with correct caching and invalidations
  - Verify static export only (no server features)
  - Test documented rollback process
  - Validate all acceptance criteria are met
  - _Requirements: 11.7_