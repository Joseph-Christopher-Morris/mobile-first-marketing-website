 # Implementation Plan

- [x] 1. Brand Color System Enforcement





  - Update tailwind.config.js to include only approved brand colors in extend.colors.brand object
  - Remove all instances of blue, purple, yellow, and gradient classes from components
  - Replace gradient backgrounds with flat white or black sections
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 2. Image Asset Management and Fixes





- [x] 2.1 Rename photography service images to kebab-case convention


  - Rename files in /public/images/services/ to remove spaces and parentheses
  - Update image references in photography services page component
  - _Requirements: 3.3, 3.6_

- [x] 2.2 Implement optimized image components


  - Update all image usage to use next/image with proper sizes and dimensions
  - Add comprehensive alt text with location and subject information
  - Ensure hero images load with priority flag
  - _Requirements: 3.1, 3.4, 6.1_

- [x] 2.3 Verify image loading and fix broken references


  - Test all image paths for 404 errors
  - Ensure hero images display correctly on all pages
  - Validate portfolio gallery shows all 7 images
  - _Requirements: 3.1, 3.2, 3.5_

- [x] 3. Home Page Hero Section Restoration





- [x] 3.1 Restore original hero content and structure


  - Implement exact headline: "More than Photography. Data-Driven Vivid Auto Photography that Delivers!"
  - Add original paragraph about Nantwich & Cheshire services
  - Configure hero image: /images/hero/aston-martin-db6-website.webp
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 3.2 Implement hero buttons with brand styling


  - Create "Get Started" button linking to /contact/ with primary brand styling
  - Create "View Services" button linking to /services/ with secondary styling
  - Ensure responsive spacing (py-28 md:py-40)
  - _Requirements: 2.4, 2.5_

- [x] 4. Contact Form Restoration





- [x] 4.1 Restore original contact form fields and structure


  - Implement fields: Full Name, Email Address, Phone (optional), Service Interest dropdown, Message textarea
  - Add "Send Message" submit button with brand styling
  - Ensure proper htmlFor attributes and accessible labels
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 4.2 Implement form validation and responsive design


  - Add client-side validation for required fields
  - Ensure mobile responsive layout
  - Apply brand color styling (bg-brand-pink hover:bg-brand-pink2 text-white)
  - _Requirements: 4.4, 4.5, 4.6_

- [x] 5. Blog Content Restoration





- [x] 5.1 Restore original blog post content


  - Revert all blog .md/.mdx files to pre-AI versions with original text
  - Ensure proper front-matter metadata for all posts
  - Validate blog content integrity and authenticity
  - _Requirements: 5.1, 5.7_

- [x] 5.2 Reinstate Flyers ROI article


  - Create "How I Turned £546 into £13.5K With Flyers" blog post
  - Add proper front-matter with title, slug, date, description, tags
  - Set cover image: /images/hero/whatsapp-image-2025-07-11-flyers-roi.webp
  - _Requirements: 5.2, 5.3_

- [x] 5.3 Update blog listing and navigation


  - Sort blog posts by date in descending order
  - Remove artificial post limits to display all posts
  - Replace generic "Read More" with descriptive aria-labels
  - _Requirements: 5.4, 5.5, 5.6_

- [-] 6. Testimonials Carousel Implementation





- [x] 6.1 Create testimonials carousel component for home page




  - Build TestimonialsCarousel component with Lee and Scott testimonials
  - Import existing testimonial content without modification
  - Implement text-only display (no images or avatars)
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [x] 6.2 Implement carousel functionality and accessibility





  - Add prev/next buttons and dot indicators with keyboard navigation
  - Implement auto-advance with 7-second intervals
  - Respect prefers-reduced-motion and pause on focus/hover
  - _Requirements: 9.6, 9.7, 9.8_

- [x] 6.3 Apply brand styling and responsive design





  - Use only approved brand colors (white, black, hot pink)
  - Ensure responsive behavior across all breakpoints
  - Wrap in semantic section with proper ARIA labels
  - _Requirements: 9.5, 9.9, 9.12_

- [x] 7. SEO and Technical Implementation





- [x] 7.1 Create robots.txt and improve SEO elements


  - Create robots.txt allowing all crawlers with sitemap reference
  - Update meta tags with proper descriptions and titles
  - Ensure semantic HTML structure throughout
  - _Requirements: 7.1, 7.2, 7.4_

- [x] 7.2 Enhance accessibility and link descriptions


  - Replace all generic link text with descriptive labels
  - Ensure proper alt attributes for all images
  - Validate semantic HTML and ARIA compliance
  - _Requirements: 6.5, 7.3_

- [-] 8. Performance Optimization





- [x] 8.1 Implement caching headers and optimization




  - Configure S3 metadata with Cache-Control headers (images: max-age=31536000, HTML: max-age=600)
  - Optimize image formats and compression
  - Ensure next/image usage with proper sizes prop
  - _Requirements: 6.1, 6.2, 6.3_

- [x] 8.2 Run Lighthouse performance audits





  - Execute Lighthouse audits on all major pages (home, services, blog, contact)
  - Target 90+ scores for Performance, Accessibility, Best Practices, SEO
  - Generate comprehensive performance reports with recommendations
  - _Requirements: 6.6_

- [x] 8.3 Monitor Core Web Vitals metrics





  - Measure Largest Contentful Paint (LCP) - target < 2.5 seconds
  - Measure First Input Delay (FID) - target < 100 milliseconds  
  - Measure Cumulative Layout Shift (CLS) - target < 0.1
  - _Requirements: 6.6_

- [x] 8.4 Validate testimonials component performance





  - Ensure testimonials carousel doesn't impact Core Web Vitals
  - Test auto-advance functionality performance impact
  - Verify smooth animations and transitions
  - _Requirements: 9.10_

- [x] 8.5 Create performance monitoring dashboard





  - Set up automated performance tracking
  - Configure alerts for performance regressions
  - Document performance baseline and targets
  - _Requirements: 6.6_

- [x] 9. Deployment and Infrastructure Compliance





- [x] 9.1 Deploy with proper S3 and CloudFront configuration


  - Upload static files to S3 with appropriate metadata
  - Maintain existing S3 + CloudFront infrastructure
  - Apply proper cache control headers for different file types
  - _Requirements: 8.1, 8.3_


- [x] 9.2 Perform cache invalidation and validation

  - Invalidate CloudFront cache for paths: /*, /app*, /services/*, /blog*, /images/*
  - Verify all critical images and pages load correctly post-deployment
  - Maintain existing security headers and SSL configuration
  - _Requirements: 8.2, 8.4, 8.5_

- [x] 9.3 Run comprehensive testing suite






  - Execute cross-browser testing for visual consistency
  - Validate accessibility compliance across all pages
  - Test responsive behavior on multiple devices
  - _Requirements: 8.6_

- [x] 10. Final Validation and Quality Assurance





- [x] 10.1 Verify all requirements compliance


  - Confirm brand color enforcement across all pages
  - Validate all images load correctly without 404 errors
  - Test contact form functionality and validation
  - _Requirements: 1.1-1.5, 3.1-3.6, 4.1-4.6_

- [x] 10.2 Confirm content restoration and testimonials


  - Verify blog content matches original text
  - Confirm Flyers ROI article is visible and accessible
  - Test testimonials carousel functionality and accessibility
  - _Requirements: 5.1-5.6, 9.1-9.12_

- [x] 10.3 Performance and deployment validation


  - Confirm Lighthouse scores meet 90+ target across categories
  - Validate proper caching and CDN behavior
  - Ensure SEO elements and robots.txt are properly configured
  - _Requirements: 6.1-6.6, 7.1-7.4, 8.1-8.6_