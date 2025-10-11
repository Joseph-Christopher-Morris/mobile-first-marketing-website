# Design Document

## Overview

The Vivid Auto Photography brand restoration project requires a systematic approach to rollback AI modifications, fix broken image references, enforce brand consistency, and optimize performance. The design follows a phased approach that prioritizes critical visual elements first, then content restoration, and finally performance optimization.

The solution leverages the existing Next.js + TypeScript + Tailwind CSS architecture with AWS S3 + CloudFront deployment, ensuring minimal disruption to the current infrastructure while achieving comprehensive brand restoration.

## Architecture

### Current Technology Stack
- **Frontend**: Next.js 14 with App Router and TypeScript
- **Styling**: Tailwind CSS with custom brand configuration
- **Content**: Markdown/MDX files for blog content
- **Images**: Static assets in `/public/images/` directory
- **Deployment**: AWS S3 static hosting with CloudFront CDN
- **Build Process**: Next.js static export (`npm run build`)

### Brand Color System Architecture
The brand color system will be centralized through Tailwind CSS configuration, ensuring consistent application across all components:

```typescript
// tailwind.config.js
extend: {
  colors: {
    brand: {
      pink: '#ff2d7a',      // Primary brand color
      pink2: '#d81b60',     // Hover/active states
      black: '#0b0b0b',     // Text and navigation
      white: '#ffffff',     // Backgrounds and contrast
      grey: '#969696'       // Secondary text
    }
  }
}
```

### Image Management Architecture
Images will follow a structured naming convention and organization:
- **Hero Images**: `/public/images/hero/` - Main page headers and featured content
- **Service Images**: `/public/images/services/` - Portfolio and service-related imagery
- **Blog Images**: `/public/images/blog/` - Article cover images and content
- **Naming Convention**: kebab-case with descriptive names (no spaces or special characters)

## Components and Interfaces

### Brand Color Enforcement Component
A utility system to ensure only approved colors are used throughout the application:

```typescript
// Brand color validation utility
export const brandColors = {
  primary: 'bg-brand-pink hover:bg-brand-pink2',
  secondary: 'border-brand-pink text-brand-pink hover:bg-pink-50',
  text: 'text-brand-black',
  background: 'bg-brand-white'
} as const;

// Component prop interface for consistent styling
interface BrandStyledProps {
  variant: 'primary' | 'secondary' | 'text' | 'background';
  className?: string;
}
```

### Image Optimization Component
Enhanced image component that ensures proper loading and performance:

```typescript
// OptimizedImage component interface
interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  sizes?: string;
}

// Implementation ensures next/image usage with proper optimization
export const OptimizedImage: React.FC<OptimizedImageProps>
```

### Content Management Interface
Structured approach to blog content restoration:

```typescript
// Blog post metadata interface
interface BlogPost {
  title: string;
  slug: string;
  date: string;
  description: string;
  tags: string[];
  coverImage: string;
  alt: string;
  location: string;
  readingTime: string;
  content: string;
}

// Content validation interface
interface ContentValidation {
  hasOriginalText: boolean;
  hasProperMetadata: boolean;
  hasValidImages: boolean;
  isAccessible: boolean;
}
```

### Form Component Architecture
Restored contact form with proper validation and accessibility:

```typescript
// Contact form field interface
interface ContactFormField {
  name: string;
  type: 'text' | 'email' | 'tel' | 'select' | 'textarea';
  label: string;
  required: boolean;
  options?: string[]; // For select fields
  validation?: (value: string) => string | null;
}

// Form state management interface
interface ContactFormState {
  fields: Record<string, string>;
  errors: Record<string, string>;
  isSubmitting: boolean;
  isValid: boolean;
}
```

### Testimonials Carousel Component
Home page exclusive testimonial display with accessibility and brand compliance:

```typescript
// Testimonial data interface
interface Testimonial {
  id: string;
  author: string;
  content: string;
  role?: string;
  company?: string;
}

// Carousel state interface
interface CarouselState {
  currentSlide: number;
  isAutoPlaying: boolean;
  isPaused: boolean;
  prefersReducedMotion: boolean;
}

// Carousel component props
interface TestimonialsCarouselProps {
  testimonials: Testimonial[];
  autoAdvanceInterval?: number;
  className?: string;
}
```

## Data Models

### Page Content Model
Structured approach to page content management:

```typescript
// Page content structure
interface PageContent {
  hero: {
    image: string;
    alt: string;
    headline: string;
    description: string;
    buttons: Array<{
      text: string;
      href: string;
      variant: 'primary' | 'secondary';
    }>;
  };
  sections: Array<{
    id: string;
    type: 'gallery' | 'text' | 'form' | 'testimonial';
    content: any;
  }>;
}
```

### Image Asset Model
Comprehensive image management structure:

```typescript
// Image asset metadata
interface ImageAsset {
  originalPath: string;
  optimizedPath: string;
  alt: string;
  width: number;
  height: number;
  format: 'webp' | 'jpg' | 'png';
  size: number;
  lastModified: Date;
}

// Image validation model
interface ImageValidation {
  exists: boolean;
  isOptimized: boolean;
  hasAltText: boolean;
  followsNamingConvention: boolean;
}
```

### Blog Content Model
Structured blog content management:

```typescript
// Blog content structure
interface BlogContent {
  metadata: BlogPost;
  content: string;
  images: ImageAsset[];
  validation: ContentValidation;
}
```

## Error Handling

### Image Loading Error Handling
Comprehensive error handling for image assets:

1. **404 Detection**: Implement checks for broken image links during build and runtime
2. **Fallback Images**: Provide placeholder images for missing assets
3. **Graceful Degradation**: Ensure page functionality when images fail to load
4. **Error Reporting**: Log image loading failures for monitoring

### Content Validation Error Handling
Systematic approach to content integrity:

1. **Metadata Validation**: Ensure all required front-matter fields are present
2. **Content Integrity**: Verify original text content is restored
3. **Link Validation**: Check all internal and external links
4. **Accessibility Validation**: Ensure proper alt text and semantic structure

### Build Process Error Handling
Robust build validation:

1. **Pre-build Validation**: Check for missing images and invalid content
2. **Build Failure Recovery**: Provide clear error messages and resolution steps
3. **Post-build Verification**: Validate generated static files
4. **Deployment Validation**: Ensure successful S3 upload and CloudFront invalidation

## Testing Strategy

### Visual Regression Testing
Ensure brand consistency across all pages:

1. **Color Validation**: Automated checks for non-brand colors
2. **Layout Verification**: Ensure proper spacing and responsive behavior
3. **Image Loading**: Verify all images load correctly across devices
4. **Cross-browser Testing**: Validate appearance in major browsers

### Content Integrity Testing
Verify content restoration accuracy:

1. **Text Comparison**: Compare restored content against original versions
2. **Metadata Validation**: Ensure proper blog post front-matter
3. **Link Testing**: Verify all internal and external links work
4. **SEO Validation**: Check meta tags, titles, and structured data

### Performance Testing
Maintain high performance standards:

1. **Lighthouse Audits**: Target 90+ scores across all categories
2. **Core Web Vitals**: Monitor LCP, FID, and CLS metrics
3. **Image Optimization**: Verify proper compression and formats
4. **Caching Validation**: Ensure proper cache headers and CDN behavior

### Accessibility Testing
Ensure inclusive design:

1. **Screen Reader Testing**: Verify proper semantic structure
2. **Keyboard Navigation**: Ensure all interactive elements are accessible
3. **Color Contrast**: Validate sufficient contrast ratios
4. **Form Accessibility**: Check proper labels and error handling

### Deployment Testing
Validate infrastructure compliance:

1. **S3 Upload Verification**: Ensure all files upload correctly
2. **CloudFront Invalidation**: Verify cache clearing works properly
3. **Security Headers**: Check proper security configuration
4. **SSL/TLS Validation**: Ensure HTTPS works correctly

## Implementation Phases

### Phase 1: Brand Color Enforcement
- Update Tailwind configuration with approved colors only
- Remove all non-brand color references from components
- Replace gradient backgrounds with flat colors
- Validate color consistency across all pages

### Phase 2: Image Asset Restoration
- Rename image files to follow kebab-case convention
- Update all image references in components and content
- Implement proper next/image usage with optimization
- Add comprehensive alt text for accessibility

### Phase 3: Content Restoration
- Restore original blog post content
- Reinstate missing Flyers ROI article
- Update contact form to original field structure
- Restore home page hero section content

### Phase 4: Performance Optimization
- Implement proper caching headers
- Optimize image formats and compression
- Add robots.txt and sitemap
- Enhance accessibility features

### Phase 5: Testimonials Integration
- Create testimonials carousel component for home page only
- Import existing Lee and Scott testimonial content
- Implement accessible carousel with keyboard navigation
- Ensure brand color compliance and responsive design

### Phase 6: Deployment and Validation
- Deploy to S3 with proper metadata
- Invalidate CloudFront cache
- Run comprehensive testing suite
- Validate all requirements are met