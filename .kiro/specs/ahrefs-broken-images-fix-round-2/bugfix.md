# Bugfix Requirements Document

## Introduction

Ahrefs is reporting broken image errors (404s) on blog posts, specifically on the three Model Car Collection series posts (Parts 3, 4, and 5). The issue stems from blog hero images and internal content images that are either missing, have incorrect paths, case mismatches, or legacy filenames with spaces/encoded characters. This affects SEO crawl health and user experience.

The site uses Next.js static export deployed via S3 + CloudFront, which means all images must exist in `/public/images/blog/` and be referenced correctly without relying on dynamic Next.js image optimization.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN Ahrefs crawls blog post URLs `/blog/ebay-repeat-buyers-part-4/`, `/blog/ebay-business-side-part-5/`, and `/blog/ebay-model-car-sales-timing-bundles/` THEN the system returns 404 errors for hero images

1.2 WHEN blog posts reference internal content images with spaces in filenames (e.g., "WhatsApp Image 2025-07-06 at 9.09.08 PM.jpeg") THEN the system may fail to load these images due to URL encoding issues

1.3 WHEN blog posts reference images with case mismatches (e.g., .PNG vs .png) THEN the system returns 404 errors on case-sensitive S3/CloudFront infrastructure

1.4 WHEN blog posts reference legacy filenames with encoded characters or spaces THEN the system returns 404 errors affecting SEO crawl health

1.5 WHEN an image path is broken or missing THEN the system displays a broken image icon with no fallback mechanism

### Expected Behavior (Correct)

2.1 WHEN Ahrefs crawls blog post URLs `/blog/ebay-repeat-buyers-part-4/`, `/blog/ebay-business-side-part-5/`, and `/blog/ebay-model-car-sales-timing-bundles/` THEN the system SHALL return 200 status codes for all hero images

2.2 WHEN blog posts reference internal content images THEN the system SHALL use standardized filenames following the pattern: lowercase, hyphens instead of spaces, .webp format where possible

2.3 WHEN blog posts reference images THEN the system SHALL use consistent case-sensitive paths that match actual files in `/public/images/blog/`

2.4 WHEN an image path is broken or missing THEN the system SHALL display a fallback image (`/images/blog/default.webp`) using onError handlers

2.5 WHEN the build process runs THEN the system SHALL validate that all referenced image paths exist in `/public/images/blog/`

### Unchanged Behavior (Regression Prevention)

3.1 WHEN blog posts with correctly functioning images are rendered THEN the system SHALL CONTINUE TO display those images without modification

3.2 WHEN the blog thumbnail resolver processes card images THEN the system SHALL CONTINUE TO use the existing resolution logic for blog index pages

3.3 WHEN Next.js static export builds the site THEN the system SHALL CONTINUE TO use `images: { unoptimized: true }` configuration

3.4 WHEN non-blog images (hero images, service images) are referenced THEN the system SHALL CONTINUE TO load those images from their existing paths

3.5 WHEN users navigate to blog posts not in the target list THEN the system SHALL CONTINUE TO render those posts without any changes to their image behavior
