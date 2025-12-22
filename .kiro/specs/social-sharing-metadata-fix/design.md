# Social Sharing Metadata Fix - Design Document

## Overview

This design implements a comprehensive solution for fixing social media link previews by ensuring each page serves appropriate Open Graph and Twitter Card metadata. The solution addresses the current issue where all shared links display homepage metadata instead of page-specific content, significantly improving social media engagement and professional appearance.

The design leverages Next.js metadata API, dynamic content processing, and integrates seamlessly with the existing S3 + CloudFront deployment architecture.

## Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Social Media  │    │   CloudFront     │    │   Next.js App   │
│   Crawlers      │───▶│   Distribution   │───▶│   (Static)      │
│                 │    │   E2IBMHQ3GCW6ZK │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                        │
                                │                        ▼
                                │               ┌─────────────────┐
                                │               │   Metadata      │
                                │               │   Generation    │
                                │               │   System        │
                                │               └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌──────────────────┐    ┌─────────────────┐
                       │   Cache          │    │   Content       │
                       │   Invalidation   │    │   Management    │
                       │   System         │    │   System        │
                       └──────────────────┘    └─────────────────┘
```

### Component Integration

The solution integrates with existing systems:
- **Next.js Static Export**: Generates metadata at build time
- **CloudFront Distribution**: Serves metadata with proper caching
- **Content Management**: Processes blog articles and page content
- **Deployment Pipeline**: Handles cache invalidation automatically

## Components and Interfaces

### 1. Metadata Generation Engine

**Purpose**: Dynamically generates Open Graph and Twitter Card metadata for all page types.

**Key Functions**:
- `generatePageMetadata(pageType, content)`: Creates metadata objects
- `extractBlogMetadata(articleData)`: Processes blog article data
- `validateImageRequirements(imageUrl)`: Ensures image compliance
- `generateFallbackMetadata(pageType)`: Provides default metadata

**Interface**:
```typescript
interface MetadataGenerator {
  generateMetadata(params: {
    pageType: 'blog' | 'service' | 'homepage' | 'general';
    content: PageContent;
    slug?: string;
  }): Promise<Metadata>;
}

interface Metadata {
  title: string;
  description: string;
  openGraph: OpenGraphData;
  twitter: TwitterCardData;
}
```

### 2. Content Processing System

**Purpose**: Extracts and processes content from various sources (blog articles, service pages, static content).

**Key Functions**:
- `processBlogContent(slug)`: Extracts blog article metadata
- `processServiceContent(serviceName)`: Generates service page metadata  
- `validateContentRequirements(content)`: Ensures content meets requirements
- `generateImageUrl(imagePath)`: Creates properly formatted image URLs

**Interface**:
```typescript
interface ContentProcessor {
  getBlogMetadata(slug: string): Promise<BlogMetadata>;
  getServiceMetadata(service: string): Promise<ServiceMetadata>;
  getPageMetadata(path: string): Promise<PageMetadata>;
}
```

### 3. Image Management System

**Purpose**: Ensures all social sharing images meet platform requirements and are properly accessible.

**Key Functions**:
- `validateImageDimensions(imageUrl)`: Checks 1200×630 minimum size
- `generateFallbackImage(pageType)`: Creates default branded images
- `optimizeImageForSharing(imagePath)`: Ensures proper format and size
- `getPublicImageUrl(imagePath)`: Generates CloudFront-accessible URLs

**Requirements**:
- Minimum 1200 × 630 pixels
- 1.91:1 aspect ratio
- JPG or PNG format
- Publicly accessible via CloudFront

### 4. Cache Management System

**Purpose**: Handles CloudFront cache invalidation when metadata changes.

**Key Functions**:
- `invalidatePageCache(pagePath)`: Invalidates specific page
- `invalidateBlogCache()`: Invalidates all blog paths
- `invalidateServiceCache()`: Invalidates service page paths
- `batchInvalidation(paths)`: Handles multiple path invalidation

**Integration**: Uses existing CloudFront Distribution ID (E2IBMHQ3GCW6ZK)

## Data Models

### Page Metadata Model
```typescript
interface PageMetadata {
  title: string;
  description: string;
  image: string;
  url: string;
  type: 'website' | 'article';
  siteName: string;
}
```

### Blog Article Model
```typescript
interface BlogArticle {
  slug: string;
  title: string;
  description: string;
  heroImage: string;
  publishedDate: string;
  author?: string;
  tags?: string[];
}
```

### Service Page Model
```typescript
interface ServicePage {
  name: string;
  title: string;
  description: string;
  image: string;
  features?: string[];
}
```

### Open Graph Data Model
```typescript
interface OpenGraphData {
  type: 'website' | 'article';
  title: string;
  description: string;
  url: string;
  image: string;
  siteName: string;
}
```

### Twitter Card Data Model
```typescript
interface TwitterCardData {
  card: 'summary_large_image';
  title: string;
  description: string;
  image: string;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

<function_calls>
<invoke name="prework">
<parameter name="featureName">social-sharing-metadata-fix

### Property Reflection

After reviewing all testable properties from the prework analysis, I identified several areas where properties can be consolidated to eliminate redundancy:

**Consolidation Areas:**
- Properties 1.1-1.4 (platform-specific sharing) can be combined into a single comprehensive property about blog article metadata consistency
- Properties 3.1-3.2 (OG and Twitter tags) can be combined into a single property about complete metadata presence
- Properties 4.1-4.4 (image requirements) can be combined into a single comprehensive image validation property
- Properties 5.1-5.3 (cache invalidation) can be combined into a single property about cache management

**Retained Properties:**
- Unique properties that provide distinct validation value are maintained separately
- Properties testing different aspects (metadata generation vs. cache invalidation vs. image validation) remain separate
- Example-based properties for specific testing scenarios are kept as examples

Property 1: Blog article metadata consistency
*For any* blog article, the generated metadata (title, description, image) should match the article's source content across all social media platforms
**Validates: Requirements 1.1, 1.2, 1.3, 1.4**

Property 2: Page metadata uniqueness  
*For any* two different pages, their generated metadata should be unique and page-specific, never falling back to homepage content
**Validates: Requirements 2.2, 2.3**

Property 3: Service page metadata specificity
*For any* service page, the generated metadata should be service-specific and relevant to that particular service
**Validates: Requirements 2.1, 3.4**

Property 4: Complete metadata presence
*For any* rendered page, both Open Graph tags (og:type, og:title, og:description, og:url, og:image) and Twitter Card tags (twitter:card, twitter:title, twitter:description, twitter:image) should be present and complete
**Validates: Requirements 3.1, 3.2**

Property 5: Dynamic metadata generation
*For any* blog article, the metadata should be generated dynamically from the article's frontmatter or data source, not from static templates
**Validates: Requirements 3.3**

Property 6: Image requirements compliance
*For any* image used for social sharing, it should meet all platform requirements: minimum 1200×630 pixels, 1.91:1 aspect ratio, JPG/PNG format, and be publicly accessible
**Validates: Requirements 4.1, 4.2, 4.3, 4.4**

Property 7: Fallback image consistency
*For any* page without a specific image, the system should use a default branded image that meets all platform requirements
**Validates: Requirements 2.4, 4.5**

Property 8: Cache invalidation correctness
*For any* metadata update, the appropriate CloudFront cache paths should be invalidated using the correct distribution ID
**Validates: Requirements 3.5, 5.1, 5.2, 5.3**

Property 9: Crawler accessibility
*For any* social crawler request, the system should serve fresh, correct metadata without authentication barriers or cache delays
**Validates: Requirements 2.5, 5.4**

Property 10: Build integrity preservation
*For any* implementation change, no console errors or build errors should be introduced to the existing system
**Validates: Requirements 6.5**

## Error Handling

### Metadata Generation Errors
- **Missing Content**: Fallback to default branded metadata
- **Invalid Images**: Use default branded image that meets requirements
- **Content Processing Failures**: Log error and serve minimal valid metadata
- **Dynamic Generation Failures**: Fallback to static metadata templates

### Image Processing Errors
- **Image Not Found**: Use default branded fallback image
- **Invalid Dimensions**: Resize or use fallback image
- **Format Issues**: Convert to supported format or use fallback
- **Accessibility Issues**: Ensure fallback images are publicly accessible

### Cache Invalidation Errors
- **CloudFront API Failures**: Retry with exponential backoff
- **Invalid Distribution ID**: Log error and continue deployment
- **Network Issues**: Queue invalidation for retry
- **Batch Invalidation Limits**: Split into smaller batches

### Social Platform Integration Errors
- **Validation Tool Failures**: Provide manual testing instructions
- **Platform API Changes**: Update validation endpoints
- **Crawler Access Issues**: Ensure proper robots.txt configuration
- **Rate Limiting**: Implement appropriate delays in testing

## Testing Strategy

### Dual Testing Approach

The testing strategy combines unit testing and property-based testing to ensure comprehensive coverage:

**Unit Tests**: Verify specific examples, edge cases, and error conditions
**Property Tests**: Verify universal properties that should hold across all inputs

Together they provide comprehensive coverage: unit tests catch concrete bugs, property tests verify general correctness.

### Unit Testing Requirements

Unit tests will cover:
- Specific metadata generation examples for known blog articles
- Service page metadata generation for existing services
- Error handling scenarios with invalid inputs
- Cache invalidation with specific page paths
- Image validation with known image files
- Integration points between metadata generation and Next.js

### Property-Based Testing Requirements

Property-based testing will use **fast-check** library for JavaScript/TypeScript and run a minimum of 100 iterations per test.

Each property-based test will be tagged with comments explicitly referencing the correctness property in the design document using this format: **Feature: social-sharing-metadata-fix, Property {number}: {property_text}**

Property-based tests will cover:
- Metadata generation consistency across random blog articles
- Image validation across various image specifications  
- Cache invalidation behavior with random page paths
- Metadata uniqueness across different page types
- Fallback behavior with missing or invalid content

### Testing Platform Integration

**Social Media Validation Tools**:
- LinkedIn Post Inspector for LinkedIn sharing validation
- Facebook Sharing Debugger for Facebook preview testing
- X (Twitter) Card Validator for Twitter card validation
- WhatsApp manual testing by sending links

**Automated Testing**:
- Metadata presence validation in rendered HTML
- Image accessibility and format validation
- Cache invalidation API testing
- Build process integration testing

### Performance Testing

- Metadata generation performance benchmarks
- Image processing performance validation
- Cache invalidation timing verification
- Social crawler response time testing

The testing strategy ensures that all correctness properties are validated through both automated property-based tests and manual social platform validation, providing confidence that the social sharing fix works correctly across all supported platforms and scenarios.