# Requirements Document

## Introduction

This feature implements a consistent display of monochrome SVG press logos (BBC, Forbes, Financial Times, CNN, AutoTrader, Daily Mail, Business Insider) on both the Home page and Photography page. The logos will feature a clean hover effect that aligns with Vivid Media Cheshire's brand style, demonstrating media credibility and social proof.

## Glossary

- **Press Logos Component**: A reusable React component that renders all seven press logos with consistent styling and hover animations
- **Monochrome Display**: Logos rendered in grayscale with reduced opacity (80%) in their default state
- **Brand-Pink Tint**: A subtle pink color effect applied on hover using CSS filters to match Vivid Media Cheshire's brand identity
- **Home Page**: The main landing page at route `/`
- **Photography Page**: The photography services page at route `/services/photography`
- **SVG Assets**: Scalable Vector Graphics files located in `/public/images/press-logos/`

## Requirements

### Requirement 1: Reusable Press Logos Component

**User Story:** As a developer, I want a reusable component for press logos, so that I can maintain consistency across multiple pages without code duplication.

#### Acceptance Criteria

1. THE Press Logos Component SHALL render all seven press logos (BBC, Forbes, Financial Times, CNN, AutoTrader, Daily Mail, Business Insider) in a consistent layout
2. THE Press Logos Component SHALL use Next.js Image component for optimized image loading
3. THE Press Logos Component SHALL include proper alt text and aria-labels for each logo
4. THE Press Logos Component SHALL be exportable and reusable across multiple pages
5. THE Press Logos Component SHALL apply consistent sizing of 110×32 pixels to all logos

### Requirement 2: Visual Styling and Hover Effects

**User Story:** As a visitor, I want to see press logos with subtle animations, so that the page feels interactive and professional.

#### Acceptance Criteria

1. WHEN in default state, THE Press Logos Component SHALL display logos with 80% opacity
2. WHEN a user hovers over a logo, THE Press Logos Component SHALL increase opacity to 100%
3. WHEN a user hovers over a logo, THE Press Logos Component SHALL apply a subtle brand-pink tint using CSS filters
4. WHEN a user hovers over a logo, THE Press Logos Component SHALL scale the logo to 105% of its original size
5. THE Press Logos Component SHALL apply all hover transitions with a 300ms duration

### Requirement 3: Home Page Integration

**User Story:** As a visitor to the home page, I want to see which press outlets have featured Vivid Media Cheshire, so that I can trust their credibility.

#### Acceptance Criteria

1. THE Home Page SHALL display the Press Logos Component immediately after the hero section
2. THE Home Page SHALL include the text "As featured in:" above the press logos
3. THE Home Page SHALL center-align the press logos section within a maximum width of 1200px
4. THE Home Page SHALL apply appropriate vertical padding (py-10) to the press logos section
5. THE Home Page SHALL use a white background for the press logos section

### Requirement 4: Photography Page Integration

**User Story:** As a visitor to the photography page, I want to see press credentials within the hero section, so that I immediately understand the photographer's credibility.

#### Acceptance Criteria

1. THE Photography Page SHALL display the Press Logos Component within the hero text block
2. THE Photography Page SHALL replace the existing text line of press names with the Press Logos Component
3. THE Photography Page SHALL include the text "As featured in:" above the press logos
4. THE Photography Page SHALL maintain all other surrounding hero layout elements
5. THE Photography Page SHALL apply appropriate spacing (mb-5) to the press logos container

### Requirement 5: Responsive Design

**User Story:** As a mobile user, I want press logos to display properly on my device, so that I can view them without horizontal scrolling.

#### Acceptance Criteria

1. WHEN viewport width is 640px or less, THE Press Logos Component SHALL wrap logos onto multiple rows with 24px gap spacing
2. WHEN viewport width is 768px or greater, THE Press Logos Component SHALL align logos in a single row when possible
3. WHEN viewport width is 1024px or greater, THE Press Logos Component SHALL display logos in a centered layout with balanced spacing
4. THE Press Logos Component SHALL NOT cause horizontal scroll at any breakpoint
5. THE Press Logos Component SHALL maintain consistent logo height across all breakpoints

### Requirement 6: Accessibility Compliance

**User Story:** As a user with assistive technology, I want press logos to be properly labeled, so that I can understand what they represent.

#### Acceptance Criteria

1. THE Press Logos Component SHALL include descriptive alt text for each logo image
2. THE Press Logos Component SHALL include aria-label attributes on logo containers
3. THE Press Logos Component SHALL support keyboard navigation without disrupting layout
4. THE Press Logos Component SHALL maintain sufficient color contrast in all states
5. THE Press Logos Component SHALL pass WCAG 2.1 Level AA accessibility standards

### Requirement 7: Performance Optimization

**User Story:** As a visitor, I want the page to load quickly, so that I can access content without delays.

#### Acceptance Criteria

1. THE Press Logos Component SHALL load SVG assets from the `/public/` directory
2. THE Press Logos Component SHALL NOT cause layout shift during page load
3. THE Press Logos Component SHALL NOT block rendering of other page content
4. THE Press Logos Component SHALL NOT generate duplicate imports or console errors
5. THE Press Logos Component SHALL achieve a Lighthouse Performance score of 95 or higher

### Requirement 8: Post-Deployment Verification

**User Story:** As a developer, I want to verify the implementation after deployment, so that I can ensure everything works correctly in production.

#### Acceptance Criteria

1. WHEN deployment is complete, THE system SHALL verify logos load on both `/` and `/services/photography` routes
2. WHEN deployment is complete, THE system SHALL confirm all image paths resolve with 200 OK responses
3. WHEN deployment is complete, THE system SHALL validate hover effects work on major browsers
4. WHEN deployment is complete, THE system SHALL confirm no 404 errors occur for logo assets
5. WHEN deployment is complete, THE system SHALL achieve Lighthouse Accessibility score of 95 or higher
