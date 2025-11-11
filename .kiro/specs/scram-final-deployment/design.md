# Design Document

## Overview

The SCRAM Final Deployment design implements a comprehensive static export pipeline for the Next.js 14 Vivid Auto Photography website. The solution focuses on reliability, repeatability, and strict quality gates while maintaining the existing S3 + CloudFront infrastructure. The design emphasizes automated brand compliance checking, differentiated caching strategies, targeted invalidations, and robust rollback procedures.

## Architecture

### Static Export Pipeline Architecture

The build system is designed around Next.js static export capabilities:

```javascript
// next.config.js configuration
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true // Required for S3/CloudFront static serving
  },
  trailingSlash: true, // Ensures clean URLs work with S3
  distDir: 'out' // Explicit output directory
}
```

### GitHub Actions Workflow Architecture

The deployment pipeline follows a secure, validated approach:

```yaml
# Workflow structure
name: S3 CloudFront Deployment
on:
  workflow_dispatch:
    inputs:
      environment: [prod]
      invalidate: [true, false]

# Security: OIDC role assumption
permissions:
  id-token: write
  contents: read

# Build → Deploy → Validate flow
jobs:
  build: # Static export with brand validation
  deploy: # S3 sync with differentiated caching
```

### Brand Compliance Scanning System

Automated detection of prohibited design elements:

```bash
# Brand/color scanning implementation
grep -RInE "from-|via-|bg-gradient-|indigo-|purple-|yellow-" src apps
# Exit code 1 if matches found, failing the build
```

### Differentiated Caching Strategy

Two-tier caching approach for optimal performance:

```bash
# HTML files: Short cache for content updates
Cache-Control: public, max-age=600

# Static assets: Long cache with immutable flag
Cache-Control: public, max-age=31536000, immutable
```

## Components and Interfaces

### Static Build Configuration Interface

```typescript
interface BuildConfiguration {
  outputDirectory: '/out';
  staticExport: true;
  imageOptimization: false;
  buildCommand: 'npm run build:static';
  validation: {
    brandCompliance: boolean;
    outputVerification: boolean;
  };
}
```

### Content Management Interface

```typescript
interface ContentChanges {
  blogLayout: {
    newsletterText: 'removed'; // "👉 Join the Newsletter"
    newsletterComponent: 'preserved';
  };
  privacyPolicy: {
    url: '/privacy-policy/';
    navigation: 'excluded';
    sitemap: 'included';
  };
  robots: {
    sitemapUrl: 'https://d15sc9fc739ev2.cloudfront.net/sitemap.xml';
  };
}
```

### Deployment Pipeline Interface

```typescript
interface DeploymentPipeline {
  s3Bucket: 'mobile-marketing-site-prod-1759705011281-tyzuo9';
  cloudfrontDistribution: 'E2IBMHQ3GCW6ZK';
  region: 'us-east-1';
  
  syncStrategy: {
    html: {
      pattern: '*.html';
      cacheControl: 'public, max-age=600';
      contentType: 'text/html; charset=utf-8';
    };
    assets: {
      excludePattern: '*.html';
      cacheControl: 'public, max-age=31536000, immutable';
      autoContentType: true;
    };
  };
  
  invalidation: {
    paths: ['/', '/index.html', '/services/*', '/blog*', '/images/*', '/sitemap.xml', '/_next/*'];
    optional: boolean;
  };
}
```

### Logo Responsive Design Interface

```css
/* Logo responsive implementation */
.site-logo img {
  height: 44px;
  width: auto;
  object-fit: contain;
}

@media (max-width: 400px) {
  .site-logo img {
    height: 38px;
  }
}
```

## Data Models

### Brand Compliance Model

```typescript
interface BrandCompliance {
  approvedColors: {
    'brand-pink': '#ff2d7a';
    'brand-pink2': '#d81b60';
    'brand-black': '#0b0b0b';
    'brand-white': '#ffffff';
  };
  
  prohibitedPatterns: {
    gradients: /from-|via-|bg-gradient-/;
    colors: /indigo-|purple-|yellow-/;
  };
  
  scanDirectories: ['src', 'apps'];
  failOnMatch: true;
}
```

### S3 Sync Configuration Model

```typescript
interface S3SyncConfig {
  htmlSync: {
    command: 'aws s3 sync out s3://$S3_BUCKET';
    include: ['*.html', 'sitemap.xml', 'robots.txt'];
    exclude: ['*'];
    cacheControl: 'public, max-age=600';
    contentType: 'text/html; charset=utf-8';
    delete: true;
  };
  
  assetSync: {
    command: 'aws s3 sync out s3://$S3_BUCKET';
    exclude: ['*.html', 'sitemap.xml', 'robots.txt'];
    cacheControl: 'public, max-age=31536000, immutable';
    delete: true;
  };
  
  mimeTypeFixes: {
    svg: 'image/svg+xml';
    xml: 'application/xml';
    webmanifest: 'application/manifest+json';
    txt: 'text/plain';
  };
}
```

### Rollback Procedures Model

```typescript
interface RollbackProcedures {
  listVersions: {
    command: 'aws s3api list-object-versions';
    bucket: string;
    prefix: 'index.html';
  };
  
  restoreVersion: {
    command: 'aws s3api copy-object';
    copySource: '$S3_BUCKET/index.html?versionId=VERSION_ID';
    bucket: string;
    key: 'index.html';
    metadataDirective: 'REPLACE';
    cacheControl: 'public, max-age=600';
    contentType: 'text/html; charset=utf-8';
  };
  
  postRollbackInvalidation: {
    command: 'aws cloudfront create-invalidation';
    distributionId: 'E2IBMHQ3GCW6ZK';
    paths: ['/', '/index.html'];
  };
}
```

## Error Handling

### Build Validation Error Handling

1. **Brand Compliance Failures**: Clear error messages identifying prohibited patterns with file locations
2. **Static Export Failures**: Validation that /out directory exists and contains expected files
3. **Content Validation**: Ensure Privacy Policy builds correctly and sitemap includes required URLs
4. **Image Optimization**: Verify unoptimized images work correctly with S3/CloudFront

### Deployment Error Handling

1. **AWS Authentication**: Clear error messages for OIDC role assumption failures
2. **S3 Upload Validation**: Verify all files upload successfully with correct metadata
3. **Cache Header Validation**: Confirm proper Cache-Control headers are applied
4. **CloudFront Invalidation**: Ensure invalidation completes successfully or provide clear failure reasons

### Content Integration Error Handling

1. **Newsletter Component**: Ensure component renders without prohibited text
2. **Privacy Policy Integration**: Validate page builds and sitemap inclusion
3. **Navigation Exclusion**: Confirm Privacy Policy doesn't appear in menus
4. **Logo Responsive**: Verify logo displays correctly across breakpoints

## Testing Strategy

### Automated Brand Compliance Testing

```bash
# Pre-build validation
- Scan for prohibited color classes
- Detect gradient usage
- Validate only approved brand colors used
- Fail build on violations
```

### Content Validation Testing

```typescript
// Content change validation
- Verify newsletter text removal
- Confirm newsletter component preservation
- Validate Privacy Policy URL accessibility
- Check sitemap.xml includes Privacy Policy
- Ensure navigation excludes Privacy Policy
```

### Deployment Pipeline Testing

```bash
# Infrastructure validation
- Verify S3 bucket access
- Confirm CloudFront distribution access
- Test OIDC role assumption
- Validate cache header application
- Confirm invalidation completion
```

### Quality Gates Testing

```typescript
// Performance and accessibility validation
- Lighthouse scores ≥ 90 (Performance, A11y, SEO, Best Practices)
- No 404 errors for images
- Alt text present for all images
- Accessible link labels throughout
- Core Web Vitals within thresholds
```

## Implementation Approach

### Phase 1: Build Configuration and Brand Compliance

1. Update next.config.js for static export
2. Implement brand color scanning in GitHub Actions
3. Configure build:static script
4. Add preflight validation steps

### Phase 2: Content Changes and Privacy Policy

1. Remove newsletter text from blog layout
2. Preserve newsletter component functionality
3. Implement Privacy Policy page generation
4. Configure sitemap inclusion and navigation exclusion

### Phase 3: Deployment Pipeline Implementation

1. Create GitHub Actions workflow with OIDC
2. Implement differentiated S3 sync commands
3. Configure CloudFront invalidation strategy
4. Add deployment validation steps

### Phase 4: Logo Fixes and Quality Gates

1. Implement responsive logo CSS
2. Add Lighthouse validation
3. Configure accessibility checks
4. Implement comprehensive testing suite

### Phase 5: Rollback Procedures and Documentation

1. Document S3 versioning rollback procedures
2. Create operational runbook
3. Test rollback process in sandbox
4. Validate complete deployment pipeline

This design ensures a robust, secure, and maintainable deployment pipeline that meets all SCRAM requirements while maintaining high quality standards and operational excellence.