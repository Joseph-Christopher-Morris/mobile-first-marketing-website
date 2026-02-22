# Ahrefs Broken Images Fix Round 2 - Bugfix Design

## Overview

This bugfix addresses 404 errors reported by Ahrefs for blog hero images on three Model Car Collection series posts (Parts 3, 4, 5). The issue stems from missing images, incorrect file paths, case mismatches, and legacy filenames with spaces or encoded characters. The fix will standardize image paths to `/public/images/blog/{slug}.webp`, add fallback handling for missing images, and validate all image references during the build process. This ensures SEO crawl health and improves user experience on the Next.js static export deployed via S3 + CloudFront.

## Glossary

- **Bug_Condition (C)**: The condition that triggers the bug - when blog posts reference images that don't exist, have incorrect paths, case mismatches, or legacy filenames with spaces/encoded characters
- **Property (P)**: The desired behavior when images are referenced - images should load successfully with 200 status codes, or display fallback images if missing
- **Preservation**: Existing blog posts with correctly functioning images must continue to display those images without modification
- **Hero Image**: The primary image displayed at the top of a blog post, defined in `post.image` property and rendered via Next.js Image component with priority loading
- **Content Image**: Images embedded within the blog post content HTML, rendered as standard `<img>` tags with lazy loading
- **Image Path Standardization**: The convention of using lowercase, hyphenated filenames in `.webp` format stored in `/public/images/blog/`
- **Fallback Image**: A default placeholder image (`/images/blog/default.webp`) displayed when the primary image fails to load
- **Case-Sensitive Infrastructure**: S3 + CloudFront treats file paths as case-sensitive, requiring exact matches between references and actual filenames

## Bug Details

### Fault Condition

The bug manifests when Ahrefs crawls blog post URLs and encounters 404 errors for hero images or content images. The root causes include: (1) hero image paths in `post.image` pointing to files with incorrect extensions (.jpg vs .webp), (2) content images referencing legacy filenames with spaces (e.g., "WhatsApp Image 2025-07-06 at 9.09.08 PM.jpeg"), (3) case mismatches between referenced paths and actual filenames on case-sensitive S3/CloudFront infrastructure, and (4) missing image files that were never uploaded to `/public/images/blog/`.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type BlogPostImageReference
  OUTPUT: boolean
  
  RETURN (input.imageType == 'hero' AND input.path != input.actualFilePath)
         OR (input.imageType == 'content' AND input.filename CONTAINS ' ')
         OR (input.imageType IN ['hero', 'content'] AND input.extension != input.actualExtension)
         OR (input.imageType IN ['hero', 'content'] AND NOT fileExists(input.path))
END FUNCTION
```

### Examples

- **Part 4 Hero Image**: `post.image: '/images/blog/240804-Model_Car_Collection-46 (1).jpg'` but actual file is `240804-Model_Car_Collection-46 (1).webp` → 404 error
- **Part 5 Hero Image**: `post.image: '/images/blog/240620-Model_Car_Collection-96 (1).jpg'` but actual file is `240620-Model_Car_Collection-96 (1).webp` → 404 error
- **Part 3 Hero Image**: `post.image: '/images/blog/240708-Model_Car_Collection-21 (1).jpg'` but actual file is `240708-Model_Car_Collection-21 (1).webp` → 404 error
- **Part 4 Content Image**: `<img src="/images/blog/WhatsApp Image 2025-07-06 at 9.09.08 PM.jpeg">` contains spaces and may have URL encoding issues → potential 404 error
- **Part 4 Content Image**: `<img src="/images/blog/WhatsApp Image 2025-07-04 at 8.44.20 PM (1).jpg">` contains spaces and parentheses → potential 404 error
- **Part 5 Content Image**: `<img src="/images/blog/image (2).jpg">` contains spaces and parentheses → potential 404 error
- **Edge Case**: If a blog post references an image that was deleted from `/public/images/blog/`, it should display the fallback image instead of a broken image icon

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Blog posts with correctly functioning images (matching paths, correct extensions, no spaces) must continue to display those images without modification
- The blog thumbnail resolver logic for blog index pages must continue to use existing resolution logic
- Next.js static export configuration `images: { unoptimized: true }` must remain unchanged
- Non-blog images (hero images on other pages, service images) must continue to load from their existing paths
- Blog posts not in the target list (Parts 3, 4, 5) must render without any changes to their image behavior
- The hero image enforcement logic in `processContentForHeroEnforcement` must continue to add `loading="lazy"` to content images
- The Next.js Image component for hero images must continue to use `priority={true}` and `loading="eager"`

**Scope:**
All blog posts that do NOT have broken image references should be completely unaffected by this fix. This includes:
- Blog posts with correct hero image paths and extensions
- Blog posts with content images using standardized filenames (no spaces, correct case)
- Blog posts in other series (Marketing, Stock Photography, Data Analysis)

## Hypothesized Root Cause

Based on the bug description and code analysis, the most likely issues are:

1. **Extension Mismatch**: The three target blog posts have `post.image` properties pointing to `.jpg` files, but the actual files in `/public/images/blog/` have `.webp` extensions. This causes Next.js Image component to request non-existent files, resulting in 404 errors.

2. **Legacy Filename Convention**: Content images use legacy filenames with spaces (e.g., "WhatsApp Image 2025-07-06 at 9.09.08 PM.jpeg") which may cause URL encoding issues when served through S3 + CloudFront. While these files exist, the spaces and special characters create fragile references.

3. **No Fallback Mechanism**: The current implementation has no error handling for missing images. When an image fails to load, the browser displays a broken image icon instead of a fallback placeholder.

4. **No Build-Time Validation**: There is no validation step during `npm run build` to check that all referenced image paths exist in `/public/images/blog/`. This allows broken references to reach production.

## Correctness Properties

Property 1: Fault Condition - Blog Images Load Successfully

_For any_ blog post image reference where the bug condition holds (incorrect extension, spaces in filename, case mismatch, or missing file), the fixed implementation SHALL either (a) reference the correct file path with proper extension and standardized filename, or (b) display a fallback image (`/images/blog/default.webp`) if the image cannot be found, ensuring Ahrefs receives 200 status codes for all image requests.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**

Property 2: Preservation - Non-Buggy Image Behavior

_For any_ blog post image reference where the bug condition does NOT hold (correct path, no spaces, correct case, file exists), the fixed implementation SHALL produce exactly the same rendering behavior as the original implementation, preserving all existing functionality for correctly configured images.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct:

**File**: `src/content/blog/ebay-repeat-buyers-part-4.ts`

**Property**: `image`

**Specific Changes**:
1. **Hero Image Extension Fix**: Change `image: '/images/blog/240804-Model_Car_Collection-46 (1).jpg'` to `image: '/images/blog/240804-Model_Car_Collection-46 (1).webp'` to match the actual file extension

**File**: `src/content/blog/ebay-business-side-part-5.ts`

**Property**: `image`

**Specific Changes**:
1. **Hero Image Extension Fix**: Change `image: '/images/blog/240620-Model_Car_Collection-96 (1).jpg'` to `image: '/images/blog/240620-Model_Car_Collection-96 (1).webp'` to match the actual file extension

**File**: `src/content/blog/ebay-model-car-sales-timing-bundles.ts`

**Property**: `image`

**Specific Changes**:
1. **Hero Image Extension Fix**: Change `image: '/images/blog/240708-Model_Car_Collection-21 (1).jpg'` to `image: '/images/blog/240708-Model_Car_Collection-21 (1).webp'` to match the actual file extension

**File**: `src/content/blog/ebay-repeat-buyers-part-4.ts`

**Property**: `content`

**Specific Changes**:
1. **Content Image Standardization**: The content currently references images with spaces in filenames. These images exist and work, but should be documented for potential future standardization. No immediate changes required unless 404 errors are confirmed.

**File**: `src/content/blog/ebay-business-side-part-5.ts`

**Property**: `content`

**Specific Changes**:
1. **Content Image Standardization**: The content currently references `image (2).jpg` with spaces. This image exists and works, but should be documented for potential future standardization. No immediate changes required unless 404 errors are confirmed.

**File**: `src/app/blog/[slug]/page.tsx` (NEW)

**Component**: Hero Image Rendering

**Specific Changes**:
1. **Add Fallback Handler**: Add `onError` handler to Next.js Image component to display fallback image if hero image fails to load
2. **Fallback Image Path**: Use `/images/blog/default.webp` as the fallback image

**File**: `src/lib/content-processor.ts` (NEW)

**Function**: `processContentForHeroEnforcement`

**Specific Changes**:
1. **Add Fallback Handler**: Modify the function to inject `onerror="this.src='/images/blog/default.webp'"` attribute to all content `<img>` tags to handle missing images gracefully

**File**: `scripts/validate-blog-images.js` (NEW)

**Purpose**: Build-time validation script

**Specific Changes**:
1. **Create Validation Script**: New script that reads all blog post files, extracts image references (both `post.image` and content `<img>` tags), and verifies that all referenced files exist in `/public/images/blog/`
2. **Integration**: Add to `package.json` scripts and optionally to pre-build checks
3. **Output**: Report missing images and extension mismatches

**File**: `public/images/blog/default.webp` (NEW)

**Purpose**: Fallback placeholder image

**Specific Changes**:
1. **Create Fallback Image**: Create a simple, professional placeholder image (e.g., Vivid Media logo or generic blog placeholder) to display when images fail to load

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bug on unfixed code by attempting to load the broken image URLs, then verify the fix works correctly by confirming 200 status codes and proper fallback behavior while preserving existing functionality for non-buggy images.

### Exploratory Fault Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm or refute the root cause analysis. If we refute, we will need to re-hypothesize.

**Test Plan**: Write tests that attempt to load the hero images for Parts 3, 4, and 5 using the current (incorrect) paths. Run these tests on the UNFIXED code to observe 404 failures and confirm the extension mismatch hypothesis.

**Test Cases**:
1. **Part 4 Hero Image Test**: Attempt to load `/images/blog/240804-Model_Car_Collection-46 (1).jpg` (will fail with 404 on unfixed code)
2. **Part 5 Hero Image Test**: Attempt to load `/images/blog/240620-Model_Car_Collection-96 (1).jpg` (will fail with 404 on unfixed code)
3. **Part 3 Hero Image Test**: Attempt to load `/images/blog/240708-Model_Car_Collection-21 (1).jpg` (will fail with 404 on unfixed code)
4. **Correct Extension Test**: Attempt to load the same images with `.webp` extension to confirm files exist (should succeed on unfixed code)
5. **Content Image Test**: Attempt to load content images with spaces in filenames to verify they work or fail (may succeed if files exist with exact names)

**Expected Counterexamples**:
- Hero images return 404 errors when requested with `.jpg` extension
- The same images return 200 status codes when requested with `.webp` extension
- This confirms the extension mismatch hypothesis

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed implementation produces the expected behavior (200 status codes or fallback images).

**Pseudocode:**
```
FOR ALL blogPost IN [part3, part4, part5] DO
  heroImagePath := blogPost.image
  ASSERT httpStatus(heroImagePath) == 200
  
  FOR ALL contentImage IN extractContentImages(blogPost.content) DO
    ASSERT httpStatus(contentImage) == 200 OR displaysFallback(contentImage)
  END FOR
END FOR
```

**Test Cases**:
1. **Hero Image 200 Status**: After fix, verify that Parts 3, 4, 5 hero images return 200 status codes
2. **Fallback Display Test**: Temporarily reference a non-existent image and verify fallback image displays
3. **Content Image Validation**: Verify all content images in target posts load successfully

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed implementation produces the same result as the original implementation.

**Pseudocode:**
```
FOR ALL blogPost WHERE NOT isBugCondition(blogPost) DO
  ASSERT renderBlogPost_original(blogPost) == renderBlogPost_fixed(blogPost)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain
- It catches edge cases that manual unit tests might miss
- It provides strong guarantees that behavior is unchanged for all non-buggy inputs

**Test Plan**: Observe behavior on UNFIXED code first for non-target blog posts, then write property-based tests capturing that behavior.

**Test Cases**:
1. **Non-Target Blog Posts**: Verify that blog posts in Marketing, Stock Photography, and Data Analysis series continue to display images correctly after fix
2. **Parts 1 and 2**: Verify that eBay series Parts 1 and 2 (not in target list) continue to display images correctly
3. **Hero Image Priority Loading**: Verify that hero images continue to use `priority={true}` and `loading="eager"`
4. **Content Image Lazy Loading**: Verify that content images continue to use `loading="lazy"` and `fetchpriority="low"`
5. **Thumbnail Resolution**: Verify that blog index page thumbnails continue to resolve correctly

### Unit Tests

- Test hero image path correction for Parts 3, 4, 5
- Test fallback image display when image fails to load
- Test that validation script correctly identifies missing images
- Test that validation script correctly identifies extension mismatches
- Test that content processor adds fallback handlers to img tags

### Property-Based Tests

- Generate random blog post configurations and verify that images with correct paths always load successfully
- Generate random image paths (some valid, some invalid) and verify fallback behavior is consistent
- Test that all blog posts (target and non-target) render without errors across many scenarios

### Integration Tests

- Test full blog post rendering for Parts 3, 4, 5 with corrected hero images
- Test Ahrefs crawl simulation to verify 200 status codes for all images
- Test that build process runs validation script and reports issues
- Test that fallback images display correctly in browser when primary images fail
- Test S3 + CloudFront deployment to verify images load correctly in production environment
