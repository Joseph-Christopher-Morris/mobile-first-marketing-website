# Website Image and Navigation Fixes Requirements

## Introduction

The website currently has missing images across multiple pages (Home, Services,
About, Blog) displaying loading placeholders instead of actual images.
Additionally, the desktop navigation shows a hamburger menu icon that should be
removed for a cleaner user experience. This spec addresses comprehensive image
loading fixes and navigation improvements across the entire website.

## Requirements

### Requirement 1: Homepage Image Display

**User Story:** As a website visitor, I want to see all images on the homepage
load correctly, so that I can visually understand the services and content being
offered.

#### Acceptance Criteria

1. WHEN the homepage loads THEN the "Our Services" section SHALL display correct
   preview images for Photography Services, Data Analytics & Insights, and
   Strategic Ad Campaigns
2. WHEN the homepage loads THEN the "Latest Insights" section SHALL display
   correct preview images for all blog posts
3. WHEN images load THEN they SHALL replace any "Loading image..." placeholders
   or gradient overlays
4. WHEN viewed on mobile and desktop THEN all images SHALL display properly and
   be responsive

### Requirement 2: Services Pages Image Display

**User Story:** As a potential client, I want to see portfolio images and hero
images on service pages, so that I can evaluate the quality and style of work
offered.

#### Acceptance Criteria

1. WHEN visiting /services/photography THEN the hero image SHALL display
   250928-Hampson_Auctions_Sunday-11.webp
2. WHEN viewing Photography Services portfolio THEN all 6 "Our Work in Action"
   images SHALL load correctly
3. WHEN visiting /services/analytics THEN the hero image SHALL display
   Screenshot 2025-09-23 201649.webp
4. WHEN viewing Data Analytics portfolio THEN all 3 "Our Work in Action" images
   SHALL load correctly
5. WHEN visiting /services/ad-campaigns THEN the hero image SHALL display
   ad-campaigns-hero.webp
6. WHEN viewing Strategic Ad Campaigns portfolio THEN all 3 "Our Work in Action"
   images SHALL load correctly

### Requirement 3: About and Blog Pages Image Display

**User Story:** As a website visitor, I want to see images on About and Blog
pages load correctly, so that I can learn more about the business and its
content.

#### Acceptance Criteria

1. WHEN visiting /about THEN the hero image SHALL display A7302858.webp
2. WHEN visiting /blog THEN the "Our Services" section SHALL display the same
   service preview images as the homepage
3. WHEN viewing blog post previews THEN each post SHALL display its associated
   image correctly
4. WHEN images fail to load THEN appropriate fallback mechanisms SHALL be
   displayed

### Requirement 4: Technical Image Implementation (CRITICAL - ADDENDUM)

**User Story:** As a developer, I want all images to be properly configured with
correct paths and MIME types, so that they load reliably across all browsers and
devices.

#### Acceptance Criteria

1. WHEN images are served THEN they SHALL have correct Content-Type: image/webp
   headers (NO .webp served as application/octet-stream)
2. WHEN image paths are referenced THEN they SHALL be root-relative from
   /images/ and S3 key SHALL exactly match path and casing
3. WHEN filenames contain spaces or special characters THEN they SHALL be
   consistently normalized to kebab-case OR properly URL-encoded in all
   references and S3 keys
4. WHEN images are cached THEN they SHALL serve with Cache-Control: public,
   max-age=31536000, immutable
5. WHEN HTML pages are cached THEN they SHALL use Cache-Control: public,
   max-age=300
6. WHEN accessing direct image URLs THEN they SHALL return 200 with
   Content-Type: image/webp for representative set:
   - https://d15sc9fc739ev2.cloudfront.net/images/services/photography-hero.webp
   - https://d15sc9fc739ev2.cloudfront.net/images/services/ad-campaigns-hero.webp
   - https://d15sc9fc739ev2.cloudfront.net/images/hero/google-ads-analytics-dashboard.webp
   - https://d15sc9fc739ev2.cloudfront.net/images/about/A7302858.webp

### Requirement 5: AWS Deployment Configuration (CRITICAL - ADDENDUM)

**User Story:** As a developer, I want the deployment process to handle images
correctly, so that all images are available after deployment.

#### Acceptance Criteria

1. WHEN building the application THEN all images listed in spec SHALL be present
   in static export output before deployment
2. WHEN deploying to S3 THEN all images SHALL be uploaded with correct MIME
   types (Content-Type: image/webp for .webp files)
3. WHEN CloudFront serves content THEN it SHALL serve updated images with
   correct headers
4. WHEN deployment completes THEN CloudFront cache SHALL be invalidated for
   changed paths at minimum: /images/services/_, /images/hero/_,
   /images/about/_, /index.html, /services/_, /about/index.html,
   /blog/index.html
5. WHEN accessing image URLs directly THEN they SHALL return valid 200 response
   with correct Content-Type
6. WHEN build/deploy process runs THEN it SHALL NOT miss copying images into
   exported output
7. WHEN CloudFront cache exists THEN it SHALL NOT serve stale 404s after
   deployment

### Requirement 6: Desktop Navigation Improvement (CRITICAL - ADDENDUM)

**User Story:** As a desktop user, I want to see a clean full navigation menu
without a hamburger icon, so that I can easily access all site sections without
unnecessary UI elements.

#### Acceptance Criteria

1. WHEN viewing at ≥ md breakpoint (768px) THEN the hamburger trigger SHALL NOT
   render (not just hidden - must not take space or overlay any element)
2. WHEN viewing at ≥ md breakpoint THEN the desktop navigation SHALL always be
   visible and functional
3. WHEN viewing at < md breakpoint THEN mobile menu logic SHALL be scoped
   appropriately with hamburger present and functional
4. WHEN hamburger container exists THEN it SHALL have no absolute/fixed
   positioning or floating layer that can overlap desktop UI at ≥ md
5. WHEN any floating quick-action button exists THEN it SHALL use unique class
   and z-index < header so nothing sits atop header on desktop
6. WHEN tabbing at ≥ md breakpoint THEN tab order SHALL skip any mobile-menu
   controls entirely
7. WHEN testing at viewport widths 768px, 1024px, 1280px THEN no hamburger SHALL
   be present, desktop links visible, keyboard tabbing never encounters hidden
   mobile button
8. WHEN testing at 375px/414px THEN hamburger SHALL be present and functional

### Requirement 7: Visual Verification and Quality Assurance (CRITICAL - ADDENDUM)

**User Story:** As a quality assurance tester, I want to verify that all images
load correctly and navigation works properly, so that the website provides a
professional user experience.

#### Acceptance Criteria

1. WHEN testing each page THEN all specified images SHALL load correctly on both
   desktop and mobile
2. WHEN accessing direct image URLs THEN they SHALL return valid 200 responses
   with correct Content-Type: image/webp
3. WHEN viewing hero banners and service cards THEN they SHALL visually display
   the correct images
4. WHEN testing navigation THEN desktop SHALL show full menu and mobile SHALL
   show hamburger menu
5. WHEN images load THEN NO "Loading image..." or gradient placeholders SHALL
   remain visible after network idle
6. WHEN reloading Home, /services, all service sub-pages, /about, /blog THEN no
   "Loading image..." SHALL remain in services or insights cards; all heroes and
   portfolios SHALL display
7. WHEN checking DevTools Network THEN images SHALL show long-cache headers;
   HTML SHALL show short-cache headers
8. WHEN component encounters 404 image THEN it SHALL fallback and log exact
   missing path for diagnostics

### Requirement 8: Current Implementation Issues (CRITICAL - UPDATED)

**User Story:** As a website visitor, I want to see all images loading properly
and clean desktop navigation, so that I have a professional browsing experience.

#### Acceptance Criteria

1. WHEN visiting homepage THEN service preview cards SHALL display actual images
   instead of "Loading image..." placeholders
2. WHEN visiting /services page THEN service cards SHALL display correct
   featured images
3. WHEN visiting service sub-pages (/services/photography, /services/analytics,
   /services/ad-campaigns) THEN hero images and portfolio images SHALL load
   correctly
4. WHEN visiting /about page THEN hero image SHALL display A7302858.webp
   correctly
5. WHEN viewing on desktop (≥768px) THEN hamburger menu button SHALL NOT be
   visible or take up space in DOM
6. WHEN images fail to load THEN OptimizedImage component SHALL show appropriate
   fallback and log exact missing path
7. WHEN accessing direct image URLs THEN they SHALL return 200 with correct
   Content-Type headers

### Requirement 9: Non-Negotiable Acceptance Criteria (BLOCKERS)

**User Story:** As a project stakeholder, I want to ensure critical
functionality works without exception, so that the website meets professional
standards.

#### Acceptance Criteria

1. WHEN any desktop viewport shows hamburger THEN this SHALL be considered a
   failure
2. WHEN any required image doesn't return 200 with image/webp THEN this SHALL be
   considered a failure
3. WHEN any page shows "Loading image..." skeleton after network idle THEN this
   SHALL be considered a failure
4. WHEN service cards show gradient overlays instead of actual images THEN this
   SHALL be considered a failure
