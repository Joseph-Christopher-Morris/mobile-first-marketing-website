# Requirements Document

## Introduction

This feature implements a comprehensive refresh of the Services page, four service subpages, and About page with new copy and local image assets. The implementation follows the SCRAM methodology (Showcase, Conversion, Reuse, Accessibility, Monitor) and maintains the existing S3 + CloudFront architecture without compromising security or infrastructure.

## Glossary

- **SCRAM**: Prioritization methodology (Showcase, Conversion, Reuse, Accessibility, Monitor)
- **CloudFront_Distribution**: AWS CloudFront distribution E2IBMHQ3GCW6ZK serving content
- **S3_Bucket**: Private S3 bucket mobile-marketing-site-prod-1759705011281-tyzuo9
- **OAC**: Origin Access Control for secure CloudFront to S3 access
- **Mobile_First_Design**: Responsive design starting with mobile layouts
- **CTA**: Call-to-action elements directing users to contact page
- **Local_Assets**: Images stored in public/images/ directory structure

## Requirements

### Requirement 1

**User Story:** As a potential client visiting the services page, I want to see a clear overview of all available services with visual proof of quality, so that I can understand the full scope of offerings.

#### Acceptance Criteria

1. WHEN a user visits /services, THE Services_Page SHALL display an H1 title "Website Design, Development & Digital Marketing in Nantwich and Cheshire"
2. THE Services_Page SHALL display a 4-card layout linking to all service subpages
3. THE Services_Page SHALL include thumbnail images for each service card from Local_Assets
4. THE Services_Page SHALL end with a CTA directing users to /contact
5. THE Services_Page SHALL use mobile-first responsive design with proper grid breakpoints

### Requirement 2

**User Story:** As a business owner considering web hosting migration, I want to see concrete proof of cost savings and performance improvements, so that I can make an informed decision.

#### Acceptance Criteria

1. THE Website_Hosting_Migration_Page SHALL display the pink cloud savings image showing "80% cheaper / 82% faster"
2. THE Website_Hosting_Migration_Page SHALL include PageSpeed Insights screenshot proving performance improvements
3. WHEN displaying images with spaces in filenames, THE System SHALL rename files locally before deployment
4. THE Website_Hosting_Migration_Page SHALL include a CTA "Get My Free Website Hosting Quote → /contact"
5. THE Website_Hosting_Migration_Page SHALL use responsive layout with images adapting to screen size

### Requirement 3

**User Story:** As a potential photography client, I want to see real examples of published work and local photography, so that I can assess the photographer's credibility and style.

#### Acceptance Criteria

1. THE Photography_Page SHALL display a responsive gallery component showing real work samples
2. THE Photography_Page SHALL include published editorial screenshots (BBC, Forbes, The Times) with descriptive alt text
3. THE Photography_Page SHALL show local Nantwich market photography samples
4. THE Photography_Page SHALL use grid layout: 1 column mobile, 2 columns ≥640px, 3 columns ≥1024px
5. THE Photography_Page SHALL end with CTA "Book Your Photoshoot → /contact"

### Requirement 4

**User Story:** As a business owner needing analytics insights, I want to understand the level of expertise offered, so that I can determine if the service meets my needs.

#### Acceptance Criteria

1. THE Data_Analytics_Page SHALL emphasize GA4 and Adobe-level expertise
2. THE Data_Analytics_Page SHALL display the 5 key results as bullet points (55% views, 189% engagement, etc.)
3. IF dashboard screenshots are available, THE Data_Analytics_Page SHALL include one image block
4. THE Data_Analytics_Page SHALL include CTA directing to /contact
5. THE Data_Analytics_Page SHALL maintain consistent layout with other service pages

### Requirement 5

**User Story:** As a potential advertising client, I want to see specific ROI case studies and outcomes, so that I can evaluate the effectiveness of the service.

#### Acceptance Criteria

1. THE Strategic_Ad_Campaigns_Page SHALL display ROI case study outcomes using card layout
2. THE Strategic_Ad_Campaigns_Page SHALL show specific metrics (£13.5k from £546, 85% CR, 4 NYCC leads)
3. THE Strategic_Ad_Campaigns_Page SHALL align content with existing ROI case studies
4. THE Strategic_Ad_Campaigns_Page SHALL include CTA directing to /contact
5. THE Strategic_Ad_Campaigns_Page SHALL use consistent styling with other service pages

### Requirement 6

**User Story:** As a potential client, I want to see the person behind the business and their work context, so that I can build trust and understand their expertise.

#### Acceptance Criteria

1. THE About_Page SHALL display a professional portrait from Local_Assets at the top right
2. THE About_Page SHALL include 2-3 supporting images showing work context
3. THE About_Page SHALL use descriptive alt text that respects GDPR and safeguarding requirements
4. THE About_Page SHALL include the revised copy with curation line
5. THE About_Page SHALL maintain responsive design with proper image sizing

### Requirement 7

**User Story:** As a system administrator, I want all deployments to maintain security standards and infrastructure integrity, so that the site remains secure and performant.

#### Acceptance Criteria

1. THE System SHALL maintain private S3_Bucket access with CloudFront_Distribution only
2. THE System SHALL NOT create public S3 bucket access or bypass CloudFront_Distribution
3. THE System SHALL use existing OAC configuration without modification
4. THE System SHALL invalidate CloudFront_Distribution cache for affected paths after deployment
5. THE System SHALL preserve all existing infrastructure settings (bucket, distribution ID, region)

### Requirement 8

**User Story:** As a content manager, I want all images to load properly from the existing file structure, so that content displays correctly without broken links.

#### Acceptance Criteria

1. THE System SHALL use existing Local_Assets paths from public/images/ structure
2. THE System SHALL NOT rename files on S3 that would invalidate existing references
3. WHEN encountering filenames with spaces, THE System SHALL normalize import paths in React components
4. THE System SHALL ensure all images include proper alt text for accessibility
5. THE System SHALL use Next.js Image component with appropriate loading and sizing attributes

### Requirement 9

**User Story:** As a mobile user, I want all pages to display properly on my device, so that I can access content regardless of screen size.

#### Acceptance Criteria

1. THE System SHALL implement mobile-first responsive design for all updated pages
2. THE System SHALL ensure grid layouts collapse to single column on mobile devices
3. THE System SHALL maintain proper touch targets and readable text on mobile
4. THE System SHALL optimize image loading for mobile performance
5. THE System SHALL test responsive behavior across standard breakpoints