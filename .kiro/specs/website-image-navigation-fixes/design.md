# Website Image and Navigation Fixes Design

## Overview

This design addresses comprehensive image loading issues across the website and
removes the hamburger navigation icon from desktop views. The solution involves
fixing image paths, ensuring proper deployment pipeline handling, correcting
MIME types, and modifying the Header component for improved desktop navigation.

## Architecture

### Current System Analysis

**Image Handling Components:**

- `OptimizedImage.tsx`: Advanced image component with error handling, retry
  logic, and fallbacks
- `BlogPreview.tsx`: Uses OptimizedImage for blog post featured images
- `ServiceHero.tsx`: Uses OptimizedImage for service page hero images
- `ServiceContent.tsx`: Handles service page portfolio images

**Navigation Components:**

- `Header.tsx`: Contains desktop navigation and mobile hamburger menu
- `MobileMenu.tsx`: Overlay menu for mobile devices

**Build & Deployment Pipeline:**

- Next.js static export to `out/` directory
- Custom deployment script uploads to S3
- CloudFront serves content with caching

### Problem Analysis

**Image Issues:**

1. **Missing Image Files**: Some specified images may not exist in the correct
   directories
2. **Incorrect Paths**: Image references may not match actual file locations
3. **MIME Type Issues**: WebP files may not have correct Content-Type headers
4. **Build Pipeline**: Images may not be properly included in build output
5. **Deployment Pipeline**: Images may not upload correctly to S3

**Navigation Issues:**

1. **Desktop Hamburger**: Mobile hamburger menu button shows on desktop (should
   be hidden on lg+ breakpoints)
2. **Responsive Breakpoints**: Current implementation uses `lg:hidden` but
   should use different breakpoint

## Components and Interfaces

### 1. Image Path Mapping System

```typescript
interface ImageMapping {
  page: string;
  section: string;
  expectedPath: string;
  actualPath: string;
  exists: boolean;
}

// Homepage Service Cards
const homepageServiceImages: ImageMapping[] = [
  {
    page: 'homepage',
    section: 'services-photography',
    expectedPath: '/images/services/photography-hero.webp',
    actualPath: '/images/services/photography-hero.webp',
    exists: false, // To be verified
  },
  {
    page: 'homepage',
    section: 'services-analytics',
    expectedPath: '/images/services/Screenshot 2025-09-23 201649.webp',
    actualPath: '/images/services/screenshot-2025-09-23-201649.webp', // Normalized
    exists: false, // To be verified
  },
];
```

### 2. Service Page Image Configuration

```typescript
interface ServicePageImages {
  slug: string;
  heroImage: string;
  portfolioImages: string[];
}

const servicePageConfig: ServicePageImages[] = [
  {
    slug: 'photography',
    heroImage: '/images/services/250928-Hampson_Auctions_Sunday-11.webp',
    portfolioImages: [
      '/images/services/240217-Australia_Trip-232 (1).webp',
      '/images/services/240219-Australia_Trip-148.webp',
      '/images/services/240619-London-19.webp',
      '/images/services/240619-London-26 (1).webp',
      '/images/services/240619-London-64.webp',
      '/images/services/250125-Liverpool-40.webp',
    ],
  },
];
```

### 3. Navigation Responsive Configuration

```typescript
interface NavigationConfig {
  desktopBreakpoint: string; // 'md' instead of 'lg'
  showHamburgerOn: string; // 'md:hidden' instead of 'lg:hidden'
  showDesktopNavOn: string; // 'hidden md:flex' instead of 'hidden lg:flex'
}
```

## Data Models

### Image Verification Result

```typescript
interface ImageVerificationResult {
  imagePath: string;
  fileExists: boolean;
  buildIncluded: boolean;
  s3Uploaded: boolean;
  cloudFrontAccessible: boolean;
  mimeType: string;
  httpStatus: number;
  errorMessage?: string;
}
```

### Deployment Validation Report

```typescript
interface DeploymentValidationReport {
  timestamp: Date;
  totalImages: number;
  successfulImages: number;
  failedImages: ImageVerificationResult[];
  cacheInvalidated: boolean;
  deploymentStatus: 'success' | 'partial' | 'failed';
}
```

## Error Handling

### Image Loading Error Scenarios

1. **File Not Found (404)**
   - **Detection**: HTTP 404 response from CloudFront
   - **Resolution**: Verify file exists in source, check build inclusion, verify
     S3 upload
   - **Fallback**: Use OptimizedImage's built-in fallback mechanism

2. **Incorrect MIME Type**
   - **Detection**: Browser fails to render WebP with wrong Content-Type
   - **Resolution**: Configure S3 deployment script to set correct MIME types
   - **Fallback**: Provide JPG alternatives for WebP files

3. **Build Exclusion**
   - **Detection**: File missing from `out/` directory after build
   - **Resolution**: Verify Next.js configuration includes all image directories
   - **Fallback**: Manual file copying in build script

4. **Cache Issues**
   - **Detection**: Old/missing images served despite successful upload
   - **Resolution**: Implement comprehensive CloudFront invalidation
   - **Fallback**: Cache-busting query parameters

### Navigation Error Scenarios

1. **Responsive Breakpoint Issues**
   - **Detection**: Hamburger shows on desktop or navigation missing on mobile
   - **Resolution**: Adjust Tailwind breakpoint classes
   - **Fallback**: CSS media queries as backup

## Testing Strategy

### Phase 1: Image Inventory and Verification

**File System Audit:**

```bash
# Verify all specified images exist in public/images/
find public/images -name "*.webp" -type f
find public/images -name "*Screenshot*" -type f
find public/images -name "*Hampson*" -type f
```

**Path Normalization:**

- Convert spaces to hyphens in filenames
- Ensure consistent case (lowercase preferred)
- URL-encode special characters if needed

### Phase 2: Build Pipeline Testing

**Build Output Verification:**

```bash
npm run build
find out/images -name "*.webp" -type f | wc -l
```

**Deployment Script Testing:**

```bash
# Test deployment script with dry-run
node scripts/deploy.js --dry-run
```

### Phase 3: Component Integration Testing

**OptimizedImage Component:**

- Test with correct image paths
- Test error handling with broken paths
- Test fallback mechanisms
- Test loading states and retry logic

**Service Pages:**

- Verify hero images load correctly
- Test portfolio image galleries
- Validate responsive behavior

### Phase 4: Navigation Testing

**Responsive Behavior:**

- Test hamburger visibility at different breakpoints
- Verify desktop navigation remains functional
- Test mobile menu functionality
- Validate accessibility attributes

## Implementation Plan

### Image Fixes Implementation

1. **File System Organization**
   - Audit existing images in `public/images/`
   - Rename files with spaces/special characters to kebab-case
   - Organize images into appropriate subdirectories
   - Update all image references in components

2. **Component Updates**
   - Update service data files with correct image paths
   - Verify BlogPreview component image references
   - Update ServiceHero and ServiceContent components
   - Test OptimizedImage error handling

3. **Build Pipeline Enhancement**
   - Verify Next.js configuration includes all image directories
   - Test build output includes all required images
   - Add build verification script

4. **Deployment Pipeline Enhancement**
   - Update deployment script MIME type handling
   - Implement comprehensive CloudFront invalidation
   - Add post-deployment image verification
   - Create deployment validation report

### Navigation Fixes Implementation

1. **Header Component Updates**
   - Change hamburger button from `lg:hidden` to `md:hidden`
   - Update desktop navigation from `hidden lg:flex` to `hidden md:flex`
   - Test responsive behavior at different breakpoints
   - Maintain accessibility attributes

2. **Responsive Testing**
   - Test at 768px (md breakpoint)
   - Test at 1024px (lg breakpoint)
   - Verify mobile menu functionality
   - Validate desktop navigation visibility

## Success Criteria

### Technical Validation

**Image Loading:**

- All specified images load successfully on their respective pages
- No "Loading image..." placeholders remain visible
- Direct image URLs return 200 status codes
- Images have correct Content-Type headers (image/webp)

**Navigation:**

- Desktop (≥768px): Full navigation visible, no hamburger icon
- Mobile (<768px): Hamburger menu functional, desktop nav hidden
- All navigation links remain accessible and functional

**Performance:**

- Images load within 2 seconds on 3G connection
- Proper caching headers implemented (long-term for images, short-term for HTML)
- CloudFront serves optimized content

### User Experience Validation

**Visual Quality:**

- Hero images display correctly on all service pages
- Portfolio images load in proper galleries
- Blog post images enhance content preview
- No broken image placeholders visible

**Navigation Usability:**

- Desktop users see clean, professional navigation bar
- Mobile users have intuitive hamburger menu access
- Navigation remains consistent across all pages
- Accessibility standards maintained

## Risk Mitigation

### High-Risk Areas

1. **WebP Browser Compatibility**
   - **Risk**: Older browsers may not support WebP format
   - **Mitigation**: Implement JPG fallbacks in OptimizedImage component
   - **Detection**: Monitor browser error logs

2. **CloudFront Caching**
   - **Risk**: Cache may prevent updated images from appearing
   - **Mitigation**: Implement comprehensive invalidation strategy
   - **Detection**: Post-deployment verification checks

3. **Mobile Navigation Breakage**
   - **Risk**: Changing breakpoints may break mobile navigation
   - **Mitigation**: Thorough testing at all breakpoints
   - **Detection**: Automated responsive testing

### Rollback Strategy

**Image Issues:**

- Keep backup of original image references
- Maintain fallback images ready for immediate deployment
- Document working image paths for quick restoration

**Navigation Issues:**

- Maintain current Header component as backup
- Test navigation changes in isolated branch
- Quick revert capability for responsive breakpoints

## Deployment Strategy

### Pre-Deployment Checklist

1. **Image Verification:**
   - [ ] All specified images exist in correct directories
   - [ ] Image paths updated in all components
   - [ ] Build output includes all images
   - [ ] MIME types configured correctly

2. **Navigation Testing:**
   - [ ] Desktop navigation works without hamburger
   - [ ] Mobile navigation remains functional
   - [ ] Responsive breakpoints tested
   - [ ] Accessibility maintained

3. **Integration Testing:**
   - [ ] All pages load correctly
   - [ ] No console errors
   - [ ] Performance benchmarks met
   - [ ] Cross-browser compatibility verified

### Post-Deployment Validation

1. **Automated Checks:**
   - Run image accessibility validation script
   - Verify CloudFront cache invalidation
   - Check all direct image URLs return 200
   - Validate MIME types served correctly

2. **Manual Verification:**
   - Test each page on desktop and mobile
   - Verify navigation behavior at different screen sizes
   - Check image loading performance
   - Validate user experience flows

This comprehensive design ensures all image loading issues are resolved and
navigation is optimized for desktop users while maintaining mobile
functionality.
