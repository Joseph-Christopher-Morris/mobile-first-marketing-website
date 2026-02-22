# Implementation Plan

- [x] 1. Write bug condition exploration test
  - **Property 1: Fault Condition** - Blog Hero Images Return 404 for Incorrect Extensions
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: Scope the property to the three concrete failing blog posts (Parts 3, 4, 5) with incorrect .jpg extensions
  - Test that hero images for Parts 3, 4, 5 return 404 errors when requested with .jpg extension (current incorrect paths)
  - Test that the same images return 200 status codes when requested with .webp extension (confirming files exist)
  - The test assertions should match the Expected Behavior Properties from design: images should load with 200 status codes or display fallback
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists)
  - Document counterexamples found:
    - `/images/blog/240804-Model_Car_Collection-46 (1).jpg` returns 404
    - `/images/blog/240620-Model_Car_Collection-96 (1).jpg` returns 404
    - `/images/blog/240708-Model_Car_Collection-21 (1).jpg` returns 404
    - Same paths with .webp extension return 200
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 2.1, 2.2_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Non-Buggy Blog Images Continue to Load Correctly
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-target blog posts (Marketing series, Stock Photography series, Data Analysis series, eBay Parts 1 & 2)
  - Write property-based tests capturing observed behavior patterns:
    - Blog posts with correct hero image paths continue to display those images
    - Hero images continue to use priority={true} and loading="eager"
    - Content images continue to use loading="lazy" and fetchpriority="low"
    - Blog thumbnail resolver logic continues to work for index pages
    - Non-blog images (service pages, other hero images) continue to load from existing paths
  - Property-based testing generates many test cases for stronger guarantees
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 3. Fix for blog hero image 404 errors

  - [x] 3.1 Fix hero image extensions in blog post files
    - Update `src/content/blog/ebay-repeat-buyers-part-4.ts`: Change `image: '/images/blog/240804-Model_Car_Collection-46 (1).jpg'` to `image: '/images/blog/240804-Model_Car_Collection-46 (1).webp'`
    - Update `src/content/blog/ebay-business-side-part-5.ts`: Change `image: '/images/blog/240620-Model_Car_Collection-96 (1).jpg'` to `image: '/images/blog/240620-Model_Car_Collection-96 (1).webp'`
    - Update `src/content/blog/ebay-model-car-sales-timing-bundles.ts`: Change `image: '/images/blog/240708-Model_Car_Collection-21 (1).jpg'` to `image: '/images/blog/240708-Model_Car_Collection-21 (1).webp'`
    - _Bug_Condition: isBugCondition(input) where input.imageType == 'hero' AND input.extension != input.actualExtension_
    - _Expected_Behavior: httpStatus(heroImagePath) == 200 for all blog posts_
    - _Preservation: Blog posts with correct image paths continue to display without modification_
    - _Requirements: 2.1, 2.2, 3.1_

  - [x] 3.2 Add fallback handler to blog page component
    - Modify `src/app/blog/[slug]/page.tsx` to add onError handler to Next.js Image component
    - Fallback to `/images/blog/default.webp` if hero image fails to load
    - Ensure fallback does not interfere with correctly loading images
    - _Bug_Condition: isBugCondition(input) where NOT fileExists(input.path)_
    - _Expected_Behavior: displaysFallback(contentImage) when primary image fails_
    - _Preservation: Hero images continue to use priority={true} and loading="eager"_
    - _Requirements: 2.3, 3.2_

  - [x] 3.3 Add fallback handler to content processor
    - Modify `src/lib/content-processor.ts` function `processContentForHeroEnforcement`
    - Inject `onerror="this.src='/images/blog/default.webp'"` attribute to all content `<img>` tags
    - Ensure existing lazy loading attributes are preserved
    - _Bug_Condition: isBugCondition(input) where input.imageType == 'content' AND NOT fileExists(input.path)_
    - _Expected_Behavior: displaysFallback(contentImage) when content image fails_
    - _Preservation: Content images continue to use loading="lazy" and fetchpriority="low"_
    - _Requirements: 2.3, 3.3_

  - [x] 3.4 Create default fallback image
    - Create `public/images/blog/default.webp` as a professional placeholder image
    - Use Vivid Media logo or generic blog placeholder design
    - Ensure image dimensions are appropriate for blog hero images (e.g., 1200x630)
    - Optimize for web delivery (small file size)
    - _Bug_Condition: isBugCondition(input) where NOT fileExists(input.path)_
    - _Expected_Behavior: Fallback image displays when primary image fails_
    - _Preservation: Non-blog images continue to load from existing paths_
    - _Requirements: 2.3, 3.4_

  - [x] 3.5 Create build-time validation script
    - Create `scripts/validate-blog-images.js` to check all blog post image references
    - Extract image paths from `post.image` properties in all blog post files
    - Extract image paths from `<img>` tags in blog post content
    - Verify all referenced files exist in `/public/images/blog/`
    - Report missing images and extension mismatches
    - Add script to `package.json` for manual execution
    - _Bug_Condition: isBugCondition(input) where NOT fileExists(input.path) OR input.extension != input.actualExtension_
    - _Expected_Behavior: Build process identifies broken image references before deployment_
    - _Preservation: Validation does not modify existing blog posts_
    - _Requirements: 2.4, 2.5, 3.5_

  - [x] 3.6 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Blog Hero Images Load Successfully with Correct Extensions
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - Verify hero images for Parts 3, 4, 5 now return 200 status codes
    - Verify fallback image displays when non-existent image is referenced
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 3.7 Verify preservation tests still pass
    - **Property 2: Preservation** - Non-Buggy Blog Images Continue to Load Correctly
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all non-target blog posts continue to display images correctly
    - Confirm hero image priority loading is preserved
    - Confirm content image lazy loading is preserved
    - Confirm blog thumbnail resolution is preserved

- [x] 4. Checkpoint - Ensure all tests pass
  - Run all exploration tests and verify they pass
  - Run all preservation tests and verify they pass
  - Run build-time validation script and verify no broken images reported
  - Test blog posts in local development environment
  - Verify fallback images display correctly when primary images fail
  - Ask the user if questions arise or if deployment to S3 + CloudFront is needed
