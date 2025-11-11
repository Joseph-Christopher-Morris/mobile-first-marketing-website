# Requirements Document

## Introduction

This specification implements the final SCRAM (S3/CloudFront Deploy) pipeline for the Next.js 14 Vivid Auto Photography website. The project delivers a reliable, repeatable static export pipeline that builds to /out, uploads with differentiated cache headers, runs targeted CloudFront invalidations, supports S3 versioning rollback, and enforces brand/content rules. Key content changes include removing newsletter text while preserving components, ensuring Privacy Policy is in sitemap but not navigation menus, and implementing comprehensive quality gates.

## Requirements

### Requirement 1: Deterministic Static Build Configuration

**User Story:** As a developer, I want a static build that always emits to /out with images unoptimized, so S3/CloudFront can serve everything without SSR.

#### Acceptance Criteria

1. WHEN next.config.js is configured THEN the system SHALL set output: 'export' and images.unoptimized: true
2. WHEN package.json is updated THEN the system SHALL include "build:static": "next build && next export" script
3. WHEN npm run build:static executes THEN the system SHALL produce /out directory with all static files
4. WHEN build process runs THEN the system SHALL generate static HTML, CSS, JS, and assets only
5. WHEN images are processed THEN the system SHALL disable Next.js image optimization for static compatibility

### Requirement 2: Brand and Design Guardrails with Automated Scanning

**User Story:** As a brand owner, I want automated gates that fail the build if non-brand colors or gradients appear.

#### Acceptance Criteria

1. WHEN Tailwind config is updated THEN the system SHALL include brand.pink #ff2d7a, brand.pink2 #d81b60, brand.black #0b0b0b, brand.white #ffffff
2. WHEN CI build runs THEN the system SHALL scan CSS for from-*, via-*, bg-gradient-*, -indigo-, -purple-, -yellow- patterns
3. WHEN prohibited patterns are found THEN the system SHALL fail the build with error message
4. WHEN brand colors are used THEN the system SHALL only allow approved palette colors
5. WHEN gradients exist THEN the system SHALL be detected and rejected by automated scanning

### Requirement 3: Content Fixes and Newsletter Text Removal

**User Story:** As the content manager, I want consistent content behavior with newsletter text removed but component preserved.

#### Acceptance Criteria

1. WHEN blog layout renders THEN the system SHALL NOT display the literal text "👉 Join the Newsletter"
2. WHEN blog posts are displayed THEN the system SHALL include newsletter component after article content
3. WHEN Privacy Policy is built THEN the system SHALL generate /privacy-policy/ from PrivacyPolicy.md
4. WHEN navigation menus render THEN the system SHALL omit Privacy Policy links
5. WHEN sitemap.xml is generated THEN the system SHALL include Privacy Policy URL
6. WHEN robots.txt is accessed THEN the system SHALL reference CloudFront sitemap URL

### Requirement 4: Asset Delivery with Differentiated Caching

**User Story:** As a visitor, I want fast loads with correct TTLs for different content types.

#### Acceptance Criteria

1. WHEN HTML files are uploaded THEN the system SHALL apply Cache-Control: public, max-age=600
2. WHEN static assets are uploaded THEN the system SHALL apply Cache-Control: public, max-age=31536000, immutable for .css,.js,.webp,.png,.jpg,.svg,.woff2,.ico,.json,.xml files
3. WHEN hero images are rendered THEN the system SHALL NOT apply lazy loading to above-the-fold imagery
4. WHEN S3 sync occurs THEN the system SHALL use separate commands for HTML vs assets with different cache headers
5. WHEN content types are set THEN the system SHALL ensure proper MIME types for SVG, XML, JSON, and webmanifest files

### Requirement 5: Targeted CloudFront Invalidations

**User Story:** As an operator, I want minimal, correct invalidations after each deploy.

#### Acceptance Criteria

1. WHEN deployment completes THEN the system SHALL invalidate paths: /, /index.html, /services/*, /blog*, /images/*, /sitemap.xml, /_next/*
2. WHEN invalidation runs THEN the system SHALL use distribution ID E2IBMHQ3GCW6ZK
3. WHEN invalidation is optional THEN the system SHALL allow workflow input to skip invalidation
4. WHEN invalidation completes THEN the system SHALL verify successful cache clearing
5. WHEN paths are specified THEN the system SHALL target only necessary paths to minimize costs

### Requirement 6: S3 Versioning Rollback Procedures

**User Story:** As an operator, I need one-command rollbacks with documented procedures.

#### Acceptance Criteria

1. WHEN rollback is needed THEN the system SHALL provide aws s3api list-object-versions command
2. WHEN version restoration occurs THEN the system SHALL use aws s3api copy-object with --metadata-directive REPLACE
3. WHEN rollback completes THEN the system SHALL preserve original cache headers
4. WHEN post-rollback actions run THEN the system SHALL include documented invalidation steps
5. WHEN rollback procedures are accessed THEN the system SHALL provide clear runbook in docs/operations/rollback.md

### Requirement 7: GitHub Actions Workflow Implementation

**User Story:** As a developer, I want automated deployment via GitHub Actions with proper security and build validation.

#### Acceptance Criteria

1. WHEN workflow triggers THEN the system SHALL run on workflow_dispatch with environment and invalidate inputs
2. WHEN build process runs THEN the system SHALL execute preflight brand/color scan before building
3. WHEN AWS credentials are configured THEN the system SHALL use OIDC role assumption with AWS_ROLE_ARN secret
4. WHEN S3 sync occurs THEN the system SHALL upload HTML and assets separately with different cache policies
5. WHEN workflow completes THEN the system SHALL upload build artifacts with 7-day retention
6. WHEN sitemap generation runs THEN the system SHALL ensure Privacy Policy URL is included

### Requirement 8: Logo and Mobile Responsive Fixes

**User Story:** As a mobile user, I want the logo to display correctly without squashing on small screens.

#### Acceptance Criteria

1. WHEN header renders THEN the system SHALL use padding instead of fixed height
2. WHEN logo image displays THEN the system SHALL set height: 44px, width: auto, object-fit: contain
3. WHEN screen width is ≤400px THEN the system SHALL reduce logo height to 38px
4. WHEN logo loads THEN the system SHALL maintain aspect ratio without distortion
5. WHEN mobile navigation renders THEN the system SHALL ensure proper responsive behavior

### Requirement 9: Quality Gates and Performance Validation

**User Story:** As a stakeholder, I want releases to meet quality bars with automated validation.

#### Acceptance Criteria

1. WHEN Lighthouse audits run THEN the system SHALL achieve ≥ 90 scores on Home, Services page, and Blog post for performance, accessibility, SEO, and best practices
2. WHEN image validation occurs THEN the system SHALL ensure no 404s for gallery/hero images
3. WHEN accessibility check runs THEN the system SHALL verify alt text present for all images
4. WHEN link validation occurs THEN the system SHALL ensure accessible link labels throughout site
5. WHEN build artifacts are validated THEN the system SHALL confirm /out directory contains all required files

### Requirement 10: Security and Infrastructure Compliance

**User Story:** As a security administrator, I want deployment to follow security best practices with proper access controls.

#### Acceptance Criteria

1. WHEN AWS access is configured THEN the system SHALL use OIDC role assumption instead of long-lived keys
2. WHEN S3 bucket access occurs THEN the system SHALL use bucket mobile-marketing-site-prod-1759705011281-tyzuo9
3. WHEN CloudFront distribution is accessed THEN the system SHALL use distribution ID E2IBMHQ3GCW6ZK
4. WHEN secrets are managed THEN the system SHALL store AWS_ROLE_ARN in GitHub Secrets
5. WHEN deployment runs THEN the system SHALL maintain audit trail and observability

### Requirement 11: Content Validation and Restoration

**User Story:** As a content manager, I want to ensure all content changes are properly implemented and validated.

#### Acceptance Criteria

1. WHEN blog posts render THEN the system SHALL display restored original content without AI modifications
2. WHEN newsletter component displays THEN the system SHALL show component without "👉 Join the Newsletter" text
3. WHEN Privacy Policy page loads THEN the system SHALL be accessible at /privacy-policy/ URL
4. WHEN navigation menus render THEN the system SHALL exclude Privacy Policy from menu items
5. WHEN sitemap validation occurs THEN the system SHALL include Privacy Policy URL in sitemap.xml

### Requirement 12: Deployment Validation and Monitoring

**User Story:** As an operations team member, I want comprehensive validation that deployment completed successfully.

#### Acceptance Criteria

1. WHEN deployment completes THEN the system SHALL verify all files uploaded successfully to S3
2. WHEN cache headers are applied THEN the system SHALL validate correct Cache-Control headers on different file types
3. WHEN CloudFront invalidation runs THEN the system SHALL confirm invalidation completed successfully
4. WHEN site functionality is tested THEN the system SHALL verify core user journeys work correctly
5. WHEN rollback procedures are tested THEN the system SHALL validate rollback process in sandbox environment