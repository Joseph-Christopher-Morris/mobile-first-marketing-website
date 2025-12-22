# Requirements Document

## Introduction

This feature addresses the critical issue where individual pages and blog articles from vividmediacheshire.com share incorrectly on social media platforms (LinkedIn, Facebook, X/Twitter, WhatsApp, iMessage, Slack). Currently, shared links fall back to homepage preview content instead of displaying the specific article or page's title, description, and image, which reduces click-through rates, perceived professionalism, and content ROI.

## Glossary

- **Open Graph (OG) Tags**: HTML meta tags that control how URLs are displayed when shared on social media platforms
- **Twitter Cards**: Twitter-specific meta tags for controlling link previews on X (formerly Twitter)
- **Social Crawlers**: Automated systems used by social platforms to extract preview information from shared URLs
- **CloudFront Distribution**: The CDN service (E2IBMHQ3GCW6ZK) serving the website content
- **Link Preview**: The visual representation of a shared URL showing title, description, and image
- **Metadata**: Information about web pages stored in HTML head tags
- **Cache Invalidation**: Process of clearing cached content to ensure updated metadata is served

## Requirements

### Requirement 1

**User Story:** As a content creator, I want individual blog articles to display their specific title, description, and image when shared on social media, so that each article gets proper representation and higher engagement.

#### Acceptance Criteria

1. WHEN a blog article URL is shared on LinkedIn, THEN the system SHALL display the article's specific title, description, and hero image
2. WHEN a blog article URL is shared on Facebook, THEN the system SHALL display the article's specific title, description, and hero image  
3. WHEN a blog article URL is shared on X (Twitter), THEN the system SHALL display the article's specific title, description, and hero image as a large image card
4. WHEN a blog article URL is shared on WhatsApp or messaging platforms, THEN the system SHALL display the article's specific title, description, and hero image
5. WHEN the homepage URL is shared, THEN the system SHALL display only the homepage-specific metadata and not reuse it for other pages

### Requirement 2

**User Story:** As a website visitor, I want service pages and internal pages to show their specific content when shared, so that the shared links accurately represent what I'm sharing.

#### Acceptance Criteria

1. WHEN a service page URL is shared on social platforms, THEN the system SHALL display the service-specific title, description, and relevant image
2. WHEN an internal page URL is shared, THEN the system SHALL display page-specific metadata and not fall back to homepage content
3. WHEN multiple different pages are shared, THEN the system SHALL ensure each displays unique, page-appropriate metadata
4. WHEN a page has no specific image defined, THEN the system SHALL use a default branded image rather than homepage image
5. WHEN social crawlers access any page, THEN the system SHALL serve the correct metadata without authentication barriers

### Requirement 3

**User Story:** As a developer, I want all pages to include proper Open Graph and Twitter Card metadata, so that social sharing works consistently across all platforms.

#### Acceptance Criteria

1. WHEN any page is rendered, THEN the system SHALL include complete Open Graph tags (og:type, og:title, og:description, og:url, og:image)
2. WHEN any page is rendered, THEN the system SHALL include Twitter Card tags (twitter:card, twitter:title, twitter:description, twitter:image)
3. WHEN blog articles are rendered, THEN the system SHALL generate metadata dynamically from article frontmatter or data source
4. WHEN service pages are rendered, THEN the system SHALL include service-specific metadata
5. WHEN metadata is updated, THEN the system SHALL ensure CloudFront cache invalidation occurs for affected pages

### Requirement 4

**User Story:** As a content manager, I want images used in social sharing to meet platform requirements, so that shared content displays properly across all social media platforms.

#### Acceptance Criteria

1. WHEN an image is used for social sharing, THEN the system SHALL ensure the image is minimum 1200 × 630 pixels
2. WHEN an image is used for social sharing, THEN the system SHALL ensure the image maintains 1.91:1 aspect ratio
3. WHEN an image is used for social sharing, THEN the system SHALL serve images in JPG or PNG format
4. WHEN an image is used for social sharing, THEN the system SHALL ensure images are publicly accessible without authentication
5. WHEN no specific image is available, THEN the system SHALL use a default branded image that meets all platform requirements

### Requirement 5

**User Story:** As a website administrator, I want the social sharing fix to work with the existing CloudFront deployment, so that metadata changes are properly cached and invalidated.

#### Acceptance Criteria

1. WHEN metadata is updated on any page, THEN the system SHALL invalidate the CloudFront cache for that specific page path
2. WHEN blog metadata is updated, THEN the system SHALL invalidate the /blog/* path pattern in CloudFront
3. WHEN service page metadata is updated, THEN the system SHALL invalidate the /services/* path pattern in CloudFront
4. WHEN social crawlers request pages, THEN the system SHALL serve fresh metadata without cache-related delays
5. WHEN cache invalidation occurs, THEN the system SHALL use the existing CloudFront Distribution ID (E2IBMHQ3GCW6ZK)

### Requirement 6

**User Story:** As a quality assurance tester, I want to validate that social sharing works correctly, so that I can confirm the fix is working before deployment.

#### Acceptance Criteria

1. WHEN testing social sharing, THEN the system SHALL provide validation using LinkedIn Post Inspector
2. WHEN testing social sharing, THEN the system SHALL provide validation using Facebook Sharing Debugger  
3. WHEN testing social sharing, THEN the system SHALL provide validation using X (Twitter) Card Validator
4. WHEN testing social sharing, THEN the system SHALL allow testing via WhatsApp by sending links
5. WHEN validation is complete, THEN the system SHALL ensure no console errors or build errors are introduced