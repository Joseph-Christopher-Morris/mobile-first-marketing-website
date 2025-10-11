# Requirements Document

## Introduction

This specification addresses the comprehensive restoration of the Vivid Auto Photography website to its original brand standards and content integrity. The project involves rolling back AI-modified content, fixing broken image references, enforcing brand color consistency, and ensuring optimal performance across all pages. The website serves as a data-driven automotive photography and analytics platform targeting commercial clients in the Nantwich, Cheshire area.

## Requirements

### Requirement 1: Brand Color Palette Enforcement

**User Story:** As a brand manager, I want all website elements to strictly adhere to the approved color palette, so that brand consistency is maintained across all touchpoints.

#### Acceptance Criteria

1. WHEN the website is loaded THEN the system SHALL display only approved brand colors: White (#ffffff), Hot Pink (#ff2d7a), Dark Hot Pink (#d81b60), Black (#0b0b0b), and Grey (#969696)
2. WHEN any page is inspected THEN the system SHALL NOT contain any blue, purple, or yellow color references in CSS classes or inline styles
3. WHEN gradient backgrounds are present THEN the system SHALL replace them with flat white or black sections
4. WHEN Tailwind configuration is reviewed THEN the system SHALL contain only the approved brand colors in the extend.colors.brand object
5. WHEN hover states are activated THEN the system SHALL use only Dark Hot Pink (#d81b60) for interactive elements

### Requirement 2: Home Page Hero Section Restoration

**User Story:** As a website visitor, I want to see the original compelling hero section with proper imagery and messaging, so that I understand the value proposition immediately.

#### Acceptance Criteria

1. WHEN the home page loads THEN the system SHALL display the hero image "/images/hero/aston-martin-db6-website.webp"
2. WHEN the hero section is viewed THEN the system SHALL show the headline "More than Photography. Data-Driven Vivid Auto Photography that Delivers!"
3. WHEN the hero content is displayed THEN the system SHALL include the original paragraph about helping businesses in Nantwich & Cheshire
4. WHEN the hero buttons are rendered THEN the system SHALL show "Get Started" linking to /contact/ and "View Services" linking to /services/
5. WHEN the hero section is loaded THEN the system SHALL use proper responsive spacing (py-28 md:py-40)
6. WHEN the hero image fails to load THEN the system SHALL display appropriate alt text for accessibility

### Requirement 3: Photography Services Page Image Fixes

**User Story:** As a potential client viewing the photography services, I want to see all portfolio images loading correctly, so that I can evaluate the quality of work.

#### Acceptance Criteria

1. WHEN the photography services page loads THEN the system SHALL display the hero image without 404 errors
2. WHEN the "Our Work in Action" gallery is viewed THEN the system SHALL show all 7 portfolio images without broken links
3. WHEN image files are accessed THEN the system SHALL use kebab-case naming convention (no spaces or parentheses)
4. WHEN portfolio images are displayed THEN the system SHALL include descriptive alt text with location and subject information
5. WHEN the Network tab is inspected THEN the system SHALL show no 404 errors for image resources
6. WHEN images are renamed THEN the system SHALL update all corresponding references in the codebase

### Requirement 4: Contact Form Restoration

**User Story:** As a potential client, I want to use the original contact form with all necessary fields, so that I can easily inquire about services.

#### Acceptance Criteria

1. WHEN the contact page loads THEN the system SHALL display the original form fields: Full Name, Email Address, Phone (optional), Service Interest (dropdown), and Message
2. WHEN form elements are rendered THEN the system SHALL use accessible labels with proper htmlFor attributes
3. WHEN the submit button is displayed THEN the system SHALL show "Send Message" with brand-consistent styling
4. WHEN form validation occurs THEN the system SHALL provide client-side validation for required fields
5. WHEN the form is viewed on mobile THEN the system SHALL maintain proper responsive layout
6. WHEN form styling is applied THEN the system SHALL use brand colors (bg-brand-pink hover:bg-brand-pink2 text-white)

### Requirement 5: Blog Content Restoration

**User Story:** As a content manager, I want all blog posts restored to their original text and the missing ROI article reinstated, so that authentic content is preserved.

#### Acceptance Criteria

1. WHEN blog posts are accessed THEN the system SHALL display original text content (pre-AI modifications)
2. WHEN the blog listing is viewed THEN the system SHALL include the "How I Turned £546 into £13.5K With Flyers" article
3. WHEN the Flyers ROI article is accessed THEN the system SHALL display proper front-matter with title, slug, date, and metadata
4. WHEN blog posts are listed THEN the system SHALL sort them by date in descending order
5. WHEN blog links are rendered THEN the system SHALL use descriptive aria-labels instead of generic "Read More"
6. WHEN the blog page loads THEN the system SHALL display all posts without artificial limits
7. WHEN the Flyers ROI cover image is displayed THEN the system SHALL load "/images/hero/whatsapp-image-2025-07-11-flyers-roi.webp"

### Requirement 6: Performance and Accessibility Optimization

**User Story:** As a website user, I want fast loading times and accessible content, so that I have an optimal browsing experience regardless of my device or abilities.

#### Acceptance Criteria

1. WHEN images are loaded THEN the system SHALL use next/image component with proper sizes prop and dimensions
2. WHEN static assets are served THEN the system SHALL include Cache-Control headers with max-age=31536000 for images
3. WHEN HTML content is served THEN the system SHALL include Cache-Control headers with max-age=600
4. WHEN the robots.txt is accessed THEN the system SHALL allow all crawlers and include sitemap reference
5. WHEN links are rendered THEN the system SHALL include descriptive text instead of generic labels
6. WHEN Lighthouse audits are run THEN the system SHALL achieve 90+ scores across all categories
7. WHEN images are optimized THEN the system SHALL use appropriate formats and compression

### Requirement 7: SEO and Technical Implementation

**User Story:** As a business owner, I want proper SEO implementation and technical standards, so that the website performs well in search results and maintains high quality.

#### Acceptance Criteria

1. WHEN the robots.txt file is created THEN the system SHALL allow all user agents and reference the sitemap
2. WHEN meta tags are implemented THEN the system SHALL include proper descriptions and titles for all pages
3. WHEN images are served THEN the system SHALL include appropriate alt attributes for accessibility
4. WHEN the website structure is analyzed THEN the system SHALL follow semantic HTML practices
5. WHEN deployment occurs THEN the system SHALL invalidate CloudFront cache for updated paths
6. WHEN S3 metadata is configured THEN the system SHALL include proper cache control headers for different file types

### Requirement 8: Deployment and Infrastructure Compliance

**User Story:** As a system administrator, I want the deployment to follow established AWS S3 + CloudFront standards, so that security and performance requirements are met.

#### Acceptance Criteria

1. WHEN deployment occurs THEN the system SHALL use the existing S3 + CloudFront infrastructure
2. WHEN cache invalidation is performed THEN the system SHALL target specific paths: /*, /app*, /services/*, /blog*, /images/*
3. WHEN static assets are uploaded THEN the system SHALL apply appropriate S3 metadata for caching
4. WHEN the deployment completes THEN the system SHALL verify all critical images and pages load correctly
5. WHEN security headers are configured THEN the system SHALL maintain existing CloudFront security settings
6. WHEN the build process runs THEN the system SHALL generate a static export compatible with S3 hosting