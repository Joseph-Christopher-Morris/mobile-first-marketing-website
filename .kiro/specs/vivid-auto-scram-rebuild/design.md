# Design Document

## Overview

The Vivid Auto Photography SCRAM rebuild follows a systematic approach to restore the website to match provided mobile screenshots and brief specifications. The design leverages the existing Next.js 14 + TypeScript + Tailwind CSS architecture with AWS S3 + CloudFront deployment, ensuring complete brand restoration, content integrity, and optimal performance.

The solution prioritizes exact specification compliance, removing all "work in progress" elements while maintaining the established infrastructure and deployment patterns.

## Architecture

### Technology Stack
- **Frontend Framework**: Next.js 14 with App Router and TypeScript
- **Styling System**: Tailwind CSS with strict brand color configuration
- **Content Management**: Markdown/MDX files with front-matter metadata
- **Image Handling**: Next.js Image component with static optimization
- **Build Process**: Static export (`next export`) generating `/out` directory
- **Deployment Target**: AWS S3 + CloudFront (existing infrastructure)
- **Cache Strategy**: Differentiated caching for HTML (600s) vs assets (1 year)

### Build Configuration Architecture
The build system will be configured for static export compatibility:

```javascript
// next.config.js
module.exports = {
  output: 'export',
  images: {
    unoptimized: true // Required for static export
  },
  // Optional analyzer, remove console in production
}
```

### Brand Color System Design
Centralized color management through Tailwind configuration:

```javascript
// tailwind.config.js - extend section
extend: {
  colors: {
    brand: {
      pink: '#ff2d7a',    // Primary brand color
      pink2: '#d81b60',   // Hover/active states  
      black: '#0b0b0b',   // Text and navigation
      white: '#ffffff',   // Backgrounds
      grey: '#969696'     // Secondary text (if needed)
    }
  }
}
```

### Image Asset Management Design
Structured approach to image organization and naming:

- **Naming Convention**: kebab-case format (no spaces, parentheses, or special characters)
- **Directory Structure**: Maintain existing `/public/images/` hierarchy
- **Optimization**: Use Next.js Image component with explicit dimensions and sizes
- **Alt Text Strategy**: Descriptive text including location and subject details

## Components and Interfaces

### Static Export Configuration
Build process designed for S3 compatibility:

```typescript
// Package.json scripts interface
interface BuildScripts {
  dev: "next dev";
  build: "next build";
  export: "next export";
  "build:static": "npm run build && npm run export";
}

// Build output structure
interface StaticBuild {
  outputDir: "/out";
  htmlFiles: string[];
  staticAssets: string[];
  cacheStrategy: "differentiated";
}
```

### Brand Color Enforcement System
Utility system ensuring only approved colors:

```typescript
// Brand color validation
interface BrandColors {
  primary: 'bg-brand-pink hover:bg-brand-pink2';
  secondary: 'border-brand-pink text-brand-pink';
  text: 'text-brand-black';
  background: 'bg-brand-white';
}

// Prohibited color detection
interface ProhibitedPatterns {
  gradients: RegExp; // /from-|via-|bg-gradient-/
  colors: RegExp;    // /indigo-|purple-|yellow-/
}
```

### Home Page Hero Component Design
Exact specification compliance for hero section:

```typescript
// Hero section structure
interface HeroSection {
  backgroundImage: "/images/hero/aston-martin-db6-website.webp";
  overlay: "bg-black/45";
  spacing: "py-28 md:py-40";
  content: {
    headline: string; // Exact line breaks as specified
    paragraph: string; // Exact copy from brief
    buttons: [
      {
        text: "Get Started";
        href: "/contact/";
        style: "bg-brand-pink hover:bg-brand-pink2";
      },
      {
        text: "View Services";
        href: "/services/";
        style: "border-brand-pink text-brand-pink"; // Pink outline
      }
    ];
  };
}
```

### Image Gallery Component Design
Portfolio gallery with proper image management:

```typescript
// Portfolio image structure
interface PortfolioImage {
  src: string; // Kebab-case filename
  alt: string; // Descriptive with location
}

// Gallery data structure
const portfolioImages: PortfolioImage[] = [
  {
    src: "/images/services/240217-australia-trip-232-1.webp",
    alt: "People at bar, with Sydney Opera House in the background — Sydney, Australia"
  },
  // ... 6 more images with exact specifications
];
```

### Contact Form Component Design
Original form structure restoration:

```typescript
// Form field configuration
interface ContactFormField {
  name: string;
  type: 'text' | 'email' | 'tel' | 'select' | 'textarea';
  label: string;
  required: boolean;
  order: number;
}

// Form fields in exact order
const formFields: ContactFormField[] = [
  { name: 'fullName', type: 'text', label: 'Full Name', required: true, order: 1 },
  { name: 'email', type: 'email', label: 'Email Address', required: true, order: 2 },
  { name: 'phone', type: 'tel', label: 'Phone', required: false, order: 3 },
  { name: 'serviceInterest', type: 'select', label: 'Service Interest', required: false, order: 4 },
  { name: 'message', type: 'textarea', label: 'Message', required: true, order: 5 }
];
```

### Blog Content Management Design
Content restoration and Flyers ROI integration:

```typescript
// Blog post metadata structure
interface BlogPostMetadata {
  title: string;
  slug: string;
  date: string; // ISO format
  description: string;
  tags: string[];
  coverImage: string;
  alt: string;
  location: string;
  readingTime: string;
}

// Flyers ROI article specification
const flyersROIPost: BlogPostMetadata = {
  title: "How I Turned £546 into £13.5K With Flyers: Year-by-Year ROI Breakdown (2021–2025)",
  slug: "flyers-roi-breakdown",
  date: "2025-08-12",
  description: "A detailed breakdown of how strategic flyer campaigns generated exceptional ROI over four years.",
  tags: ["Case Studies", "Local Marketing", "ROI"],
  coverImage: "/images/hero/whatsapp-image-2025-07-11-flyers-roi.webp",
  alt: "Marketing flyers ROI graph from Nantwich campaign (2021–2025)",
  location: "Nantwich, Cheshire",
  readingTime: "5 min read"
};
```

## Data Models

### Deployment Configuration Model
S3 + CloudFront deployment structure:

```typescript
// Deployment configuration
interface DeploymentConfig {
  s3Bucket: "mobile-marketing-site-prod-1759705011281-tyzuo9";
  cloudfrontDistribution: "E2IBMHQ3GCW6ZK";
  region: "us-east-1";
  caching: {
    html: "public, max-age=600";
    assets: "public, max-age=31536000, immutable";
  };
  invalidationPaths: string[];
}

// Cache strategy model
interface CacheStrategy {
  htmlFiles: {
    pattern: "*.html";
    cacheControl: "public, max-age=600";
  };
  staticAssets: {
    pattern: "images|css|js|fonts";
    cacheControl: "public, max-age=31536000, immutable";
  };
}
```

### Image Asset Renaming Model
Systematic approach to image file management:

```typescript
// Image renaming mapping
interface ImageRenaming {
  oldPath: string;
  newPath: string;
  references: string[]; // Files that reference this image
}

// Services gallery renaming specification
const serviceImageRenaming: ImageRenaming[] = [
  {
    oldPath: "250928-Hampson_Auctions_Sunday-11.webp",
    newPath: "250928-hampson-auctions-sunday-11.webp",
    references: ["src/app/services/photography/page.tsx"]
  },
  // ... complete mapping for all 7 images
];
```

### SEO and Accessibility Model
Comprehensive SEO and accessibility structure:

```typescript
// SEO configuration
interface SEOConfig {
  robotsTxt: {
    userAgent: "*";
    allow: "/";
    sitemap: "https://d15sc9fc739ev2.cloudfront.net/sitemap.xml";
  };
  metaTags: {
    title: string;
    description: string;
    openGraph: object;
  };
}

// Accessibility requirements
interface AccessibilityConfig {
  images: {
    altTextRequired: true;
    descriptiveAlt: true;
  };
  links: {
    descriptiveLabels: true;
    ariaLabels: "Read the article: {title}";
  };
  forms: {
    labelAssociation: "htmlFor";
    errorMessages: "descriptive";
  };
}
```

## Error Handling

### Build Process Error Handling
Comprehensive build validation and error recovery:

1. **Pre-build Validation**: Check for missing images, invalid content, and configuration issues
2. **Build Error Recovery**: Provide clear error messages with resolution steps
3. **Static Export Validation**: Ensure all pages generate correctly in `/out` directory
4. **Image Reference Validation**: Verify all image paths resolve correctly

### Deployment Error Handling
Robust deployment validation and rollback procedures:

1. **S3 Upload Validation**: Verify all files upload successfully with correct metadata
2. **CloudFront Invalidation**: Ensure cache clearing completes successfully
3. **Rollback Procedures**: Document version-based rollback using S3 versioning
4. **Health Check Validation**: Verify site functionality post-deployment

### Content Integrity Error Handling
Systematic content validation:

1. **Original Content Verification**: Ensure blog posts match pre-AI versions
2. **Metadata Validation**: Check all front-matter fields are properly formatted
3. **Link Validation**: Verify all internal and external links function correctly
4. **Image Loading Validation**: Ensure no 404 errors in Network tab

## Testing Strategy

### Brand Compliance Testing
Automated validation of brand standards:

1. **Color Validation**: Scan all CSS for prohibited color classes
2. **Gradient Detection**: Identify and flag any gradient usage
3. **Brand Color Usage**: Verify only approved colors are used
4. **Visual Regression**: Compare against provided mobile screenshots

### Content Restoration Testing
Verify content accuracy and completeness:

1. **Text Comparison**: Validate blog content matches original versions
2. **Flyers ROI Validation**: Ensure article is properly integrated
3. **Form Field Testing**: Verify contact form matches original structure
4. **Hero Content Testing**: Confirm exact copy and button styling

### Performance and Accessibility Testing
Comprehensive quality validation:

1. **Lighthouse Audits**: Target 90+ scores across all categories
2. **Core Web Vitals**: Monitor LCP, FID, and CLS metrics
3. **Accessibility Compliance**: Ensure WCAG AA standards
4. **Cross-browser Testing**: Validate across major browsers

### Deployment Testing
Infrastructure and deployment validation:

1. **Static Build Testing**: Verify `/out` directory generation
2. **S3 Upload Testing**: Confirm proper file upload and metadata
3. **Cache Header Testing**: Validate correct cache control headers
4. **CloudFront Testing**: Ensure proper CDN behavior and invalidation

## Implementation Approach

### Phase 1: Configuration and Setup
- Update Next.js configuration for static export
- Configure Tailwind with strict brand colors
- Remove all prohibited color references
- Set up build scripts for static generation

### Phase 2: Content and Layout Restoration
- Restore home page hero section to exact specifications
- Rename and fix all service gallery images
- Restore contact form to original structure
- Restore blog content and add Flyers ROI article

### Phase 3: Performance and SEO Optimization
- Implement proper image optimization with Next.js Image
- Add robots.txt and sitemap configuration
- Enhance accessibility with proper labels and alt text
- Optimize for Core Web Vitals and Lighthouse scores

### Phase 4: Deployment and Validation
- Configure S3 metadata for proper caching
- Implement CloudFront invalidation strategy
- Deploy with differentiated cache headers
- Validate all acceptance criteria and rollback procedures

This design ensures complete compliance with the SCRAM specification while maintaining the existing infrastructure and deployment patterns.