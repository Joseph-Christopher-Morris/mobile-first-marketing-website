# Blog Image Debug Design

## Overview

This design outlines a systematic approach to debug and permanently fix the blog image loading issue. The problem appears to be related to either image path resolution, deployment pipeline, or component rendering logic.

## Architecture

### Current System Components
- **Blog Post Data**: TypeScript files in `src/content/blog/`
- **Image Assets**: WebP files in `public/images/services/`
- **Rendering Component**: `BlogPreview.tsx` using `OptimizedImage.tsx`
- **Build Pipeline**: Next.js static export to `out/` directory
- **Deployment**: S3 + CloudFront via custom deployment script

### Problem Analysis
The image path `/images/services/analytics-hero.webp` should resolve to the correct file, but something in the chain is failing.

## Components and Interfaces

### 1. Image Path Resolution
```typescript
// Current path in blog post
image: '/images/services/analytics-hero.webp'

// Expected file location
public/images/services/analytics-hero.webp

// Build output location
out/images/services/analytics-hero.webp

// Final URL
https://d15sc9fc739ev2.cloudfront.net/images/services/analytics-hero.webp
```

### 2. Component Chain
```
BlogPost Data → BlogPreview Component → OptimizedImage Component → Next.js Image → Browser
```

### 3. Debugging Points
- **Direct URL Test**: Verify image accessibility via direct browser access
- **Network Analysis**: Check HTTP status codes and response headers
- **Component Debugging**: Add logging to trace image path through components
- **Build Verification**: Confirm image exists in build output
- **Deployment Validation**: Ensure image uploads to S3 correctly

## Data Models

### Image Debug Information
```typescript
interface ImageDebugInfo {
  imagePath: string;
  fileExists: boolean;
  buildIncluded: boolean;
  s3Uploaded: boolean;
  httpStatus: number;
  errorMessage?: string;
}
```

### Debug Test Results
```typescript
interface DebugTestResult {
  testName: string;
  passed: boolean;
  details: string;
  timestamp: Date;
}
```

## Error Handling

### Potential Failure Points
1. **File Missing**: Image file doesn't exist in source
2. **Build Exclusion**: Image not included in Next.js build output
3. **Upload Failure**: Image not uploaded to S3 during deployment
4. **Path Resolution**: Incorrect path resolution in component
5. **Cache Issues**: CloudFront serving stale/missing content
6. **MIME Type**: Incorrect content-type headers for WebP files

### Error Detection Strategy
1. **Systematic Testing**: Test each component in isolation
2. **Logging**: Add comprehensive logging at each stage
3. **Fallback Mechanisms**: Implement graceful degradation
4. **Validation**: Verify each step of the pipeline

## Testing Strategy

### Phase 1: Direct Access Testing
- Test direct image URL in browser
- Check HTTP response status and headers
- Verify image renders correctly when accessed directly

### Phase 2: Component Analysis
- Add debug logging to BlogPreview component
- Trace image path through OptimizedImage component
- Test with simplified image paths

### Phase 3: Build Pipeline Validation
- Verify image exists in Next.js build output
- Check deployment script includes images
- Validate S3 upload process

### Phase 4: Alternative Solutions
- Test with different image formats (JPG vs WebP)
- Try absolute vs relative paths
- Implement fallback image mechanism

## Implementation Plan

### Debugging Tools
1. **Browser Developer Tools**: Network tab, Console tab, Elements inspection
2. **Direct URL Testing**: Manual browser access to image URLs
3. **Component Logging**: Temporary console.log statements
4. **Build Verification**: File system checks of build output
5. **Deployment Validation**: S3 bucket inspection

### Solution Approaches
1. **Quick Fix**: Use known working image path
2. **Path Simplification**: Move image to root directory with simple name
3. **Component Enhancement**: Improve error handling in OptimizedImage
4. **Pipeline Fix**: Ensure proper image handling in deployment

### Rollback Strategy
- Keep current working blog posts unchanged
- Test solutions on single blog post first
- Document working configuration for future reference
- Maintain backup images ready for immediate use

## Success Criteria

### Technical Validation
- Image loads successfully on homepage blog preview
- No console errors related to image loading
- Consistent behavior across Chrome, Firefox, Safari
- Image displays within 2 seconds of page load

### User Experience
- Visual content enhances blog post preview
- No broken image placeholders or error messages
- Responsive image sizing works correctly
- Accessibility alt text displays appropriately

## Risk Mitigation

### High-Risk Areas
- CloudFront caching preventing updates from being visible
- Browser caching interfering with testing
- WebP format compatibility issues
- S3 permissions or CORS configuration

### Mitigation Strategies
- Use cache invalidation during testing
- Test in incognito/private browsing mode
- Provide JPG fallback for WebP images
- Verify S3 bucket policies allow image access