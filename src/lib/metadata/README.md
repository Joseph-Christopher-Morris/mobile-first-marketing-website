# Social Sharing Metadata Infrastructure

This directory contains the core infrastructure for generating Open Graph and Twitter Card metadata for social sharing across all page types.

## Overview

The metadata generation system ensures that when pages are shared on social media platforms (LinkedIn, Facebook, X/Twitter, WhatsApp, iMessage, Slack), they display the correct title, description, and image specific to that page.

## Key Components

### Types (`src/types/metadata.ts`)
- **PageType**: Supported page types (blog, service, homepage, general)
- **OpenGraphData**: Open Graph metadata structure
- **TwitterCardData**: Twitter Card metadata structure
- **PageMetadata**: Complete page metadata including OG and Twitter data
- **BlogMetadata**: Blog article-specific metadata
- **ServiceMetadata**: Service page-specific metadata
- **ImageRequirements**: Image validation requirements for social platforms

### Configuration (`src/config/metadata.config.ts`)
- **SITE_CONFIG**: Site-wide constants (name, URL, locale, Twitter handle)
- **IMAGE_REQUIREMENTS**: Platform requirements (1200×630px, 1.91:1 ratio)
- **DEFAULT_IMAGES**: Fallback images for each page type
- **DEFAULT_METADATA**: Fallback metadata templates
- **METADATA_CONSTRAINTS**: Length constraints for optimal social sharing
- **CLOUDFRONT_CONFIG**: CloudFront distribution settings
- **CACHE_PATTERNS**: Cache invalidation path patterns
- **VALIDATION_URLS**: Social platform validation tool URLs

### Core Generator (`src/lib/metadata-generator.ts`)
- **generateMetadata()**: Main function to generate Next.js Metadata
- **generatePageMetadata()**: Generates complete page metadata with validation
- **generateOpenGraphData()**: Creates Open Graph metadata
- **generateTwitterCardData()**: Creates Twitter Card metadata
- **generateAbsoluteUrl()**: Converts relative paths to absolute URLs
- **generateImageUrl()**: Generates absolute image URLs
- **getFallbackImage()**: Returns default image for page type
- **getFallbackMetadata()**: Returns default metadata for page type
- **toNextMetadata()**: Converts PageMetadata to Next.js Metadata format

## Usage

### Basic Usage

```typescript
import { generateMetadata } from '@/lib/metadata';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  return generateMetadata({
    pageType: 'blog',
    content: {
      title: 'My Blog Article',
      description: 'This is a comprehensive description of my blog article...',
      image: '/images/blog/my-article.jpg',
      type: 'article',
      publishedDate: '2024-02-21',
      author: 'John Doe',
      tags: ['digital marketing', 'seo'],
    },
    canonicalPath: `/blog/${params.slug}`,
  });
}
```

### Service Page Example

```typescript
import { generateMetadata } from '@/lib/metadata';

export const metadata = generateMetadata({
  pageType: 'service',
  content: {
    title: 'Digital Marketing Services',
    description: 'Professional digital marketing services to transform your online presence...',
    image: '/images/services/digital-marketing.jpg',
  },
  canonicalPath: '/services/digital-marketing',
});
```

### Homepage Example

```typescript
import { generateMetadata } from '@/lib/metadata';

export const metadata = generateMetadata({
  pageType: 'homepage',
  content: {
    title: 'Vivid Media Cheshire',
    description: 'Professional digital marketing, photography, and content creation services...',
    image: '/og-image.jpg',
  },
  canonicalPath: '/',
});
```

## Image Requirements

All social sharing images must meet these requirements:
- **Minimum dimensions**: 1200 × 630 pixels
- **Aspect ratio**: 1.91:1 (1200/630)
- **Formats**: JPG, PNG, or WebP
- **Maximum file size**: 8MB
- **Accessibility**: Must be publicly accessible via CloudFront

## Fallback Behavior

The system provides automatic fallback handling:
1. If content validation fails, uses default metadata for page type
2. If image is missing, uses default image for page type
3. If fatal error occurs, returns minimal valid metadata
4. All errors and warnings are logged to console

## Integration with CloudFront

The metadata system is designed to work seamlessly with the S3 + CloudFront deployment:
- All image URLs are generated as absolute URLs
- Images are served through CloudFront distribution (E2IBMHQ3GCW6ZK)
- Cache invalidation patterns are defined in configuration
- No public S3 access required (CloudFront OAC only)

## Validation

Metadata is validated against platform requirements:
- Title length: 10-60 characters (optimal: 55)
- Description length: 140-160 characters (optimal: 155)
- Open Graph title: 10-95 characters (optimal: 88)
- Open Graph description: 140-200 characters (optimal: 155)

Validation errors and warnings are logged but don't prevent metadata generation.

## Next Steps

This infrastructure provides the foundation for:
1. Content processing system (extracting metadata from blog articles and services)
2. Image management system (validation and optimization)
3. Cache management system (CloudFront invalidation)
4. Integration with Next.js pages (dynamic metadata generation)

## Testing

Property-based tests will validate:
- Metadata consistency across all page types
- Image requirement compliance
- URL generation correctness
- Fallback behavior
- Validation logic

Unit tests will cover:
- Specific metadata generation examples
- Error handling scenarios
- Edge cases and boundary conditions
