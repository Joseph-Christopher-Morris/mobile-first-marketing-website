# Implementation Plan

- [x] 1. Static Export Configuration and Build Setup





  - Update next.config.js with output: 'export', images.unoptimized: true, and trailingSlash: true
  - Add "build:static": "next build && next export" script to package.json
  - Verify build process generates /out directory with all static files
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 2. Brand Compliance System Implementation





- [x] 2.1 Configure Tailwind brand colors


  - Update tailwind.config.js extend.colors.brand with exact hex values: pink #ff2d7a, pink2 #d81b60, black #0b0b0b, white #ffffff
  - Remove any existing gradient or prohibited color classes from components
  - _Requirements: 2.1, 2.4_

- [x] 2.2 Implement automated brand scanning


  - Create preflight validation script that scans for prohibited patterns: from-*, via-*, bg-gradient-*, -indigo-, -purple-, -yellow-
  - Configure script to fail build when prohibited patterns are detected
  - _Requirements: 2.2, 2.3, 2.5_

- [x] 3. Content Changes Implementation





- [x] 3.1 Remove newsletter text from blog layout


  - Update blog layout component to remove literal text "👉 Join the Newsletter"
  - Preserve newsletter component functionality after article content
  - _Requirements: 3.1, 3.2_

- [x] 3.2 Implement Privacy Policy page handling


  - Ensure Privacy Policy builds to /privacy-policy/ from PrivacyPolicy.md source
  - Remove Privacy Policy links from navigation menu components
  - Configure sitemap.xml generation to include Privacy Policy URL
  - Update robots.txt to reference CloudFront sitemap URL
  - _Requirements: 3.3, 3.4, 3.5, 3.6_

- [x] 4. Logo Responsive Design Fixes





  - Update header component CSS to use padding instead of fixed height
  - Implement logo styling: height: 44px, width: auto, object-fit: contain
  - Add mobile breakpoint styling for ≤400px screens with height: 38px
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 5. GitHub Actions Workflow Implementation





- [x] 5.1 Create workflow file structure


  - Create .github/workflows/s3-cloudfront-deploy.yml with workflow_dispatch trigger
  - Configure environment and invalidate input parameters
  - Set up proper permissions for OIDC (id-token: write, contents: read)
  - _Requirements: 7.1, 7.5_

- [x] 5.2 Implement build job with brand validation

  - Add Node.js setup and npm ci installation steps
  - Implement preflight brand/color scan that fails on prohibited patterns
  - Configure static build execution (npm run build && npm run export)
  - Add build artifact upload with 7-day retention
  - _Requirements: 7.2, 7.5_

- [x] 5.3 Implement deploy job with AWS configuration

  - Configure AWS credentials using OIDC role assumption with AWS_ROLE_ARN secret
  - Download build artifacts from build job
  - _Requirements: 7.3, 10.4_

- [x] 5.4 Implement differentiated S3 sync commands

  - Create HTML sync command with Cache-Control: public, max-age=600 for *.html, sitemap.xml, robots.txt
  - Create asset sync command with Cache-Control: public, max-age=31536000, immutable for all other files
  - Add MIME type fixes for SVG, XML, JSON, and webmanifest files
  - _Requirements: 7.4, 4.1, 4.2, 4.5_

- [x] 5.5 Implement CloudFront invalidation

  - Add conditional CloudFront invalidation based on workflow input
  - Configure invalidation paths: /, /index.html, /services/*, /blog*, /images/*, /sitemap.xml, /_next/*
  - Use distribution ID E2IBMHQ3GCW6ZK
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 5.6 Add sitemap Privacy Policy integration

  - Implement sitemap generation step that ensures Privacy Policy URL is included
  - Verify sitemap.xml contains https://d15sc9fc739ev2.cloudfront.net/privacy-policy/
  - _Requirements: 7.6_

- [x] 6. Rollback Procedures Documentation





- [x] 6.1 Create rollback runbook

  - Document aws s3api list-object-versions command for version listing
  - Document aws s3api copy-object command with --metadata-directive REPLACE for version restoration
  - Include proper cache headers preservation in rollback commands
  - Create docs/operations/rollback.md with step-by-step procedures
  - _Requirements: 6.1, 6.2, 6.3, 6.5_

- [x] 6.2 Test rollback procedures


  - Create test rollback scenario using sandbox object (e.g., /test/index.html)
  - Validate rollback process maintains proper cache headers
  - Document post-rollback invalidation steps
  - _Requirements: 6.4_

- [x] 7. Quality Gates Implementation




- [x] 7.1 Implement image validation


  - Ensure no lazy loading on hero/above-the-fold images
  - Verify all gallery and hero images have proper alt text
  - Add validation that no 404 errors occur for image requests
  - _Requirements: 4.3, 9.2, 9.3_

- [x] 7.2 Add accessibility validation


  - Ensure all images have descriptive alt text
  - Verify accessible link labels throughout the site
  - Validate color contrast meets WCAG AA standards
  - _Requirements: 9.3, 9.4_

- [x] 7.3 Implement Lighthouse validation






  - Add Lighthouse CI validation for Home, Services page, and Blog post
  - Target ≥ 90 scores for performance, accessibility, SEO, and best practices
  - Configure validation to run after deployment
  - _Requirements: 9.1_

- [x] 8. Content Validation and Testing





- [x] 8.1 Validate blog content restoration


  - Verify blog posts display original content without AI modifications
  - Confirm newsletter component renders without prohibited text
  - Test blog layout functionality and responsive behavior
  - _Requirements: 11.1, 11.2_

- [x] 8.2 Validate Privacy Policy implementation


  - Test Privacy Policy page accessibility at /privacy-policy/ URL
  - Verify Privacy Policy is excluded from navigation menus
  - Confirm Privacy Policy URL appears in sitemap.xml
  - _Requirements: 11.3, 11.4, 11.5_

- [x] 9. Deployment Validation and Monitoring




- [x] 9.1 Implement deployment verification


  - Add validation that all files upload successfully to S3
  - Verify correct Cache-Control headers are applied to different file types
  - Confirm CloudFront invalidation completes successfully
  - _Requirements: 12.1, 12.2, 12.3_

- [x] 9.2 Add core functionality testing


  - Verify core user journeys work correctly after deployment
  - Test site functionality across different pages and components
  - Validate build artifacts contain all required files
  - _Requirements: 12.4, 9.5_

- [x] 9.3 Test rollback procedures in production









  - Validate rollback process works in actual production environment
  - Confirm rollback maintains site functionality
  - Document any production-specific rollback considerations
  - _Requirements: 12.5_

- [x] 10. Security and Infrastructure Validation





- [x] 10.1 Validate AWS security configuration


  - Confirm OIDC role assumption works correctly
  - Verify access to S3 bucket mobile-marketing-site-prod-1759705011281-tyzuo9
  - Test CloudFront distribution E2IBMHQ3GCW6ZK access
  - Validate AWS_ROLE_ARN secret configuration
  - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [x] 10.2 Implement audit trail and observability


  - Add deployment logging and monitoring
  - Configure build artifact retention and versioning
  - Implement deployment status tracking
  - _Requirements: 10.5_