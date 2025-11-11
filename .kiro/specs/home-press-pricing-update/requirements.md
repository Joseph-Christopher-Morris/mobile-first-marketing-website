# Requirements Document

## Introduction

This feature implements a comprehensive update to the Vivid Media Cheshire website, focusing on three key areas: cleaning up press logo implementation to use clean SVG logos without CSS filters, centering the "My Services" cards layout on desktop, and adding transparent pricing visibility across all service pages. The implementation also includes critical deployment safety measures to prevent chunk mismatch errors that have occurred in production.

## Glossary

- **Press Logos Component**: A reusable React component that renders seven press logos (BBC, Forbes, Financial Times, CNN, AutoTrader, Daily Mail, Business Insider) using clean SVG files
- **Clean SVGs**: SVG logo files displayed without CSS filters or color tinting, using only opacity for hover effects
- **Services Cards**: The three service offering cards displayed on the home page (Website Design, Google Ads, Photography)
- **Pricing Visibility**: Clear display of service pricing ("from £X") across all relevant pages
- **Chunk Mismatch Error**: Production error "Unexpected token '<'" or "ChunkLoadError" caused by incomplete deployment of Next.js static assets
- **Full Sync Deployment**: Deployment process that syncs all files including `_next/static/**` to prevent chunk errors
- **Home Page**: The main landing page at route `/`
- **Photography Page**: The photography services page at route `/services/photography`
- **Hosting Page**: The hosting services page at route `/services/hosting`
- **Pricing Page**: The dedicated pricing page at route `/pricing`

## Requirements

### Requirement 1: Deployment Safety and Stability

**User Story:** As a developer, I want all deployments to include complete static assets, so that chunk mismatch errors never occur in production.

#### Acceptance Criteria

1. BEFORE any deployment, THE system SHALL execute `npm run build` to generate a complete static export
2. WHEN deploying to S3, THE system SHALL sync the entire `./out` folder including `_next/static/**` subdirectories
3. WHEN invalidating CloudFront cache, THE system SHALL include paths `/index.html` and `/_next/static/*`
4. THE deployment process SHALL use the `--delete` flag to remove outdated files from S3
5. THE deployment process SHALL prevent partial deployments that could cause chunk mismatches

### Requirement 2: Clean Press Logos Without Filters

**User Story:** As a visitor, I want to see press logos displayed cleanly without color distortion, so that I can recognize the publications immediately.

#### Acceptance Criteria

1. THE Press Logos Component SHALL display SVG logos in their original monochrome form without CSS filters
2. WHEN in default state, THE Press Logos Component SHALL display logos with 80% opacity
3. WHEN a user hovers over a logo, THE Press Logos Component SHALL increase opacity to 100%
4. THE Press Logos Component SHALL NOT apply any CSS filters for color tinting (no brightness, invert, sepia, saturate, or hue-rotate)
5. THE Press Logos Component SHALL maintain aspect ratio using `h-8 w-auto` classes to prevent warping

### Requirement 3: Remove Old PNG/JPG Press Logos

**User Story:** As a developer, I want to remove all old PNG/JPG press logo files, so that the codebase only contains the clean SVG versions.

#### Acceptance Criteria

1. THE system SHALL remove all `<Image>` and `<img>` references to old press logos from `src/app/page.tsx`
2. THE system SHALL remove PNG/JPG press logo files from `/public/images/publications` directory
3. THE system SHALL remove PNG/JPG press logo files from the S3 bucket
4. THE system SHALL ensure no broken image references remain after removal
5. THE system SHALL use only the seven SVG logos from `/public/images/press-logos/`

### Requirement 4: Centered Services Cards Layout

**User Story:** As a visitor on desktop, I want to see the services cards centered and balanced, so that the layout looks professional and organized.

#### Acceptance Criteria

1. THE "My Services" section SHALL use a grid layout with `sm:grid-cols-2 lg:grid-cols-3` classes
2. THE "My Services" section SHALL center cards using `justify-items-center` class
3. WHEN viewport width is ≥1024px, THE system SHALL display three cards per row centered in the container
4. WHEN viewport width is ≥640px and <1024px, THE system SHALL display two cards per row
5. WHEN viewport width is <640px, THE system SHALL display one card per row

### Requirement 5: Pricing Page Navigation

**User Story:** As a visitor, I want to easily find pricing information, so that I can understand service costs before contacting.

#### Acceptance Criteria

1. THE main navigation SHALL include a "Pricing" link with href `/pricing`
2. THE footer quick links SHALL include a "Pricing" link with href `/pricing`
3. THE pricing page SHALL display all service pricing from the latest pricing document
4. THE pricing page SHALL be accessible from both desktop and mobile navigation
5. THE pricing page SHALL use consistent styling with other service pages

### Requirement 6: Hosting Page Pricing Block

**User Story:** As a visitor to the hosting page, I want to see clear pricing information, so that I can understand hosting costs.

#### Acceptance Criteria

1. THE hosting page SHALL display a pricing card showing "£15 per month or £120 per year"
2. THE hosting page pricing card SHALL mention free migration with tailored quote
3. THE hosting page pricing card SHALL include a link to the full pricing page
4. THE hosting page pricing card SHALL use white background with border and rounded corners
5. THE hosting page pricing card SHALL be placed near the existing transparent pricing section

### Requirement 7: Photography Page Pricing Block

**User Story:** As a visitor to the photography page, I want to see clear pricing information, so that I can understand photography service costs.

#### Acceptance Criteria

1. THE photography page SHALL display a pricing card showing "from £200 per day"
2. THE photography page pricing card SHALL show travel costs "£0.45 per mile"
3. THE photography page pricing card SHALL include a link to the full pricing page
4. THE photography page pricing card SHALL use slate-50 background with border and rounded corners
5. THE photography page pricing card SHALL be placed near the "How We Work" or reassurance section

### Requirement 8: Service Pages Pricing Blocks

**User Story:** As a visitor to any service page, I want to see relevant pricing information, so that I can understand costs for that specific service.

#### Acceptance Criteria

1. THE Ads/Campaigns page SHALL display pricing: setup £20, management from £150/month
2. THE Analytics page SHALL display pricing: GA4 setup £75, dashboard from £80, monthly analytics from £40/month
3. THE Social/Local SEO page SHALL display pricing: Social + Maps from £250/month, GBP setup £75, SEO add-ons
4. EACH service page pricing card SHALL include a link to the full pricing page
5. EACH service page pricing card SHALL use consistent styling (white or slate-50 background, border, rounded, p-6)

### Requirement 9: Home Page Pricing Teaser

**User Story:** As a visitor to the home page, I want to see a pricing overview, so that I can quickly understand the cost range for services.

#### Acceptance Criteria

1. THE home page SHALL display a pricing teaser section after the services section
2. THE pricing teaser SHALL show key pricing: websites from £300, hosting from £15/month, ads from £150/month, photography from £200/day
3. THE pricing teaser SHALL include a prominent "View full pricing" button linking to `/pricing`
4. THE pricing teaser SHALL use gray-50 background with centered text layout
5. THE pricing teaser SHALL be responsive and readable on all device sizes

### Requirement 10: Press Logos on Home Page

**User Story:** As a visitor to the home page, I want to see which publications have featured Vivid Media Cheshire, so that I can trust their credibility.

#### Acceptance Criteria

1. THE home page SHALL display the Press Logos Component after the hero section
2. THE home page press logos section SHALL include "As featured in:" label text
3. THE home page press logos section SHALL use white background with py-10 padding
4. THE home page press logos section SHALL center logos within max-w-6xl container
5. THE home page press logos SHALL display all seven SVG logos without filters

### Requirement 11: Press Logos on Photography Page

**User Story:** As a visitor to the photography page, I want to see press credentials in the hero section, so that I immediately understand the photographer's credibility.

#### Acceptance Criteria

1. THE photography page SHALL display the Press Logos Component in the hero text block
2. THE photography page press logos SHALL include "As featured in:" label text
3. THE photography page press logos SHALL use brand-grey/70 styling for the label
4. THE photography page press logos SHALL maintain all surrounding hero layout elements
5. THE photography page press logos SHALL display all seven SVG logos without filters

### Requirement 12: Responsive Design Compliance

**User Story:** As a mobile user, I want all new components to display properly on my device, so that I can view content without issues.

#### Acceptance Criteria

1. WHEN viewport width is <640px, THE services cards SHALL display one per row
2. WHEN viewport width is <640px, THE pricing cards SHALL remain readable with proper padding
3. WHEN viewport width is <640px, THE press logos SHALL wrap onto multiple rows
4. THE system SHALL NOT introduce horizontal scrolling at any breakpoint
5. THE system SHALL maintain consistent spacing and alignment across all breakpoints

### Requirement 13: Accessibility Compliance

**User Story:** As a user with assistive technology, I want all new components to be properly accessible, so that I can navigate and understand the content.

#### Acceptance Criteria

1. THE press logos SHALL include descriptive alt text for each logo
2. THE pricing cards SHALL use semantic HTML with proper heading hierarchy
3. THE pricing links SHALL have clear, descriptive text
4. THE services cards SHALL maintain keyboard navigation support
5. THE system SHALL pass WCAG 2.1 Level AA accessibility standards

### Requirement 14: Post-Deployment Verification

**User Story:** As a developer, I want to verify the implementation after deployment, so that I can ensure everything works correctly in production.

#### Acceptance Criteria

1. WHEN deployment is complete, THE system SHALL verify no PNG/JPG trust logos remain on any page
2. WHEN deployment is complete, THE system SHALL verify SVG press logos display correctly on home and photography pages
3. WHEN deployment is complete, THE system SHALL verify logos are not warped, stretched, or recolored
4. WHEN deployment is complete, THE system SHALL verify pricing information displays on all relevant pages
5. WHEN deployment is complete, THE system SHALL verify no chunk errors appear in the browser console
