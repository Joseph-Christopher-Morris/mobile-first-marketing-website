# Requirements Document

## Introduction

This specification addresses the complete rebuild of the Vivid Auto Photography website to match provided mobile screenshots and brief, removing all "work in progress" elements. The project involves restoring brand integrity, fixing content and layout issues, correcting image paths, and redeploying as a static export to S3 + CloudFront infrastructure. The website serves automotive photography and analytics clients in Nantwich, Cheshire with a focus on data-driven results.

## Requirements

### Requirement 1: Next.js Configuration and Build Setup

**User Story:** As a developer, I want the Next.js application configured for static export with proper image handling, so that it can be deployed to S3 + CloudFront without server dependencies.

#### Acceptance Criteria

1. WHEN next.config.js is configured THEN the system SHALL set output: 'export' and images.unoptimized: true
2. WHEN package.json scripts are updated THEN the system SHALL include "build:static": "npm run build && npm run export"
3. WHEN the build process runs THEN the system SHALL generate static files in /out directory
4. WHEN TypeScript compilation occurs THEN the system SHALL ignore type/eslint errors during CI build
5. WHEN analyzer is included THEN the system SHALL make it optional and remove console logs in production

### Requirement 2: Brand Color Palette Enforcement

**User Story:** As a brand manager, I want strict adherence to the approved color palette throughout the website, so that brand consistency is maintained across all touchpoints.

#### Acceptance Criteria

1. WHEN Tailwind configuration is updated THEN the system SHALL extend colors with brand.pink #ff2d7a, brand.pink2 #d81b60, brand.black #0b0b0b, brand.white #ffffff
2. WHEN CSS classes are reviewed THEN the system SHALL remove all instances of from-indigo-*, via-purple-*, bg-gradient-*, bg-yellow-*, text-yellow-*
3. WHEN components are rendered THEN the system SHALL use only approved brand colors
4. WHEN hover states are applied THEN the system SHALL use bg-brand-pink2 for interactive elements
5. WHEN gradients are present THEN the system SHALL replace them with flat colors

### Requirement 3: Home Page Hero Section Exact Rollback

**User Story:** As a website visitor, I want to see the exact original hero section with proper imagery, copy, and button styling, so that I understand the value proposition immediately.

#### Acceptance Criteria

1. WHEN the home page loads THEN the system SHALL display hero background image /images/hero/aston-martin-db6-website.webp
2. WHEN the hero overlay is rendered THEN the system SHALL use bg-black/45 opacity
3. WHEN the hero heading is displayed THEN the system SHALL show exact line breaks as specified in the brief
4. WHEN the hero paragraph is shown THEN the system SHALL display the exact copy from the brief
5. WHEN hero buttons are rendered THEN the system SHALL show "Get Started" (bg-brand-pink hover:bg-brand-pink2) linking to /contact/ and "View Services" (pink outline) linking to /services/
6. WHEN hero spacing is applied THEN the system SHALL use py-28 md:py-40
7. WHEN gradients are present THEN the system SHALL remove them completely

### Requirement 4: Services/Photography Gallery Image Management

**User Story:** As a potential client viewing photography services, I want to see all portfolio images loading correctly with proper naming, so that I can evaluate the quality of work.

#### Acceptance Criteria

1. WHEN image files are renamed THEN the system SHALL convert all /public/images/services/ files to kebab-case format
2. WHEN the portfolio array is updated THEN the system SHALL reference the exact 7 images with new kebab-case names
3. WHEN alt text is provided THEN the system SHALL use descriptive text with location information as specified
4. WHEN images are accessed THEN the system SHALL show no 404 errors in Network tab
5. WHEN gallery is displayed THEN the system SHALL show all 7 portfolio images correctly

### Requirement 5: Contact Page Form Rollback

**User Story:** As a potential client, I want to use the original contact form with proper field order and labels, so that I can easily inquire about services.

#### Acceptance Criteria

1. WHEN the contact form is rendered THEN the system SHALL display fields in exact order: Full Name (required, text), Email Address (required, email), Phone (optional, tel), Service Interest (select), Message (required, textarea)
2. WHEN form labels are displayed THEN the system SHALL use accessible <label htmlFor> elements
3. WHEN form validation occurs THEN the system SHALL provide descriptive error text
4. WHEN the submit button is shown THEN the system SHALL display "Send Message" with bg-brand-pink hover:bg-brand-pink2 text-white styling
5. WHEN form is viewed on mobile THEN the system SHALL maintain proper responsive layout

### Requirement 6: Blog Content Restoration and Flyers ROI Addition

**User Story:** As a content manager, I want all blog posts restored to original content plus the missing Flyers ROI article, so that authentic content is preserved and complete.

#### Acceptance Criteria

1. WHEN blog posts are accessed THEN the system SHALL display original text content (pre-AI modifications)
2. WHEN the Flyers ROI article is created THEN the system SHALL include exact front-matter: title "How I Turned £546 into £13.5K With Flyers: Year-by-Year ROI Breakdown (2021–2025)", slug "flyers-roi-breakdown", date "2025-08-12"
3. WHEN the Flyers ROI cover image is set THEN the system SHALL use /images/hero/whatsapp-image-2025-07-11-flyers-roi.webp
4. WHEN blog index is displayed THEN the system SHALL sort posts by date descending with no item count cap
5. WHEN blog links are rendered THEN the system SHALL use accessible labels: aria-label="Read the article: {post.title}" with button text "Read Article"
6. WHEN all blog content is restored THEN the system SHALL maintain original markdown formatting

### Requirement 7: Performance, SEO, and Accessibility Implementation

**User Story:** As a website user, I want fast loading times, proper SEO, and accessible content, so that I have an optimal experience regardless of device or abilities.

#### Acceptance Criteria

1. WHEN images are implemented THEN the system SHALL use <Image> component with fill or explicit width/height and sizes prop
2. WHEN color contrast is checked THEN the system SHALL ensure pink/white/black combinations pass WCAG AA standards
3. WHEN generic "Learn More" text exists THEN the system SHALL replace with contextual labels (keeping screenshot-shown text)
4. WHEN robots.txt is created THEN the system SHALL allow all user agents and include sitemap reference to https://d15sc9fc739ev2.cloudfront.net/sitemap.xml
5. WHEN meta tags are implemented THEN the system SHALL include proper descriptions and titles for all pages

### Requirement 8: Caching and Headers Configuration

**User Story:** As a system administrator, I want proper caching headers configured for optimal performance, so that static assets load efficiently and HTML stays fresh.

#### Acceptance Criteria

1. WHEN HTML files are uploaded to S3 THEN the system SHALL apply Cache-Control: public, max-age=600
2. WHEN static assets are uploaded THEN the system SHALL apply Cache-Control: public, max-age=31536000, immutable for images/css/js/fonts
3. WHEN CloudFront invalidation occurs THEN the system SHALL target paths: /, /index.html, /services/*, /blog*, /images/*, /sitemap.xml, /_next/*
4. WHEN S3 metadata is configured THEN the system SHALL differentiate between HTML and asset caching policies
5. WHEN deployment completes THEN the system SHALL verify proper cache headers are applied

### Requirement 9: Deployment Commands and Infrastructure

**User Story:** As a developer, I want clear deployment commands that work with the existing S3 + CloudFront infrastructure, so that deployments are reliable and repeatable.

#### Acceptance Criteria

1. WHEN static build is created THEN the system SHALL run npm ci && npm run build:static to generate /out directory
2. WHEN HTML files are synced THEN the system SHALL use aws s3 sync with --exclude "*" --include "*.html" and short cache headers
3. WHEN assets are synced THEN the system SHALL use aws s3 sync --exclude "*.html" with long cache headers
4. WHEN CloudFront invalidation runs THEN the system SHALL use distribution ID E2IBMHQ3GCW6ZK with specified paths
5. WHEN deployment uses PowerShell THEN the system SHALL provide working PowerShell command examples

### Requirement 10: Rollback and Version Management

**User Story:** As a system administrator, I want documented rollback procedures with S3 versioning, so that I can quickly recover from deployment issues.

#### Acceptance Criteria

1. WHEN S3 versions are listed THEN the system SHALL use aws s3api list-object-versions with proper query formatting
2. WHEN rollback is performed THEN the system SHALL use aws s3api copy-object with specific version ID and proper metadata
3. WHEN rollback completes THEN the system SHALL invalidate CloudFront cache for affected paths
4. WHEN rollback procedures are documented THEN the system SHALL provide clear step-by-step instructions
5. WHEN version management is implemented THEN the system SHALL maintain deployment logs and version tracking

### Requirement 11: Acceptance Criteria Validation

**User Story:** As a project stakeholder, I want clear go/no-go criteria that validate the rebuild meets all specifications, so that quality standards are maintained.

#### Acceptance Criteria

1. WHEN brand/UI is validated THEN the system SHALL show no gradients, no blue/purple/yellow colors, only brand palette usage
2. WHEN home hero is checked THEN the system SHALL match copy, layout, spacing, and button styles exactly
3. WHEN content is verified THEN the system SHALL show contact form fields/order/labels match pre-AI version and blog originals are restored with Flyers ROI visible
4. WHEN services/photography is tested THEN the system SHALL display all 7 images with no 404 errors in Network tab
5. WHEN performance is measured THEN the system SHALL achieve Lighthouse ≥ 90 (Performance/Accessibility/Best Practices/SEO) on Home, Services, and a Blog post
6. WHEN SEO is validated THEN the system SHALL have accessible robots.txt, sitemap, and alt text for all hero/portfolio images with descriptive link labels
7. WHEN delivery is confirmed THEN the system SHALL be deployed to S3/CloudFront with correct caching, invalidations, static export only, and documented rollback process