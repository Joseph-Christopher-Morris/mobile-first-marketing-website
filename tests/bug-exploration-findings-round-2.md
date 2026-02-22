# Bug Exploration Findings - Ahrefs Broken Images Fix Round 2

## Test Execution Date
2026-02-22

## Bug Confirmation Status
✅ **BUG CONFIRMED** - Test failed as expected, proving the bug exists

## Root Cause Analysis

### Initial Hypothesis (from Design Document)
The design document hypothesized that:
- Blog post metadata references `.jpg` files (incorrect)
- Actual files in `/public/images/blog/` are `.webp` (correct)
- The fix would be to change metadata from `.jpg` to `.webp`

### Actual Root Cause (Discovered)
The investigation revealed the **opposite** is true:
- Blog post metadata (`image` property) correctly references `.jpg` files
- Actual files in `/public/images/blog/` ARE `.jpg` files (not `.webp`)
- Blog post content HTML incorrectly references `.webp` files that DO NOT exist
- The `.jpg` files exist and are accessible via CloudFront with proper URL encoding

### Evidence

#### File System Verification
```bash
$ ls -la "public/images/blog/" | grep -E "(240804-Model_Car_Collection-46|240620-Model_Car_Collection-96|240708-Model_Car_Collection-21)"
-rw-rw-rw-@  1 joemorris  staff    46734 Jul  5  2025 240620-Model_Car_Collection-96 (1).jpg
-rw-rw-rw-@  1 joemorris  staff    44597 Jul  5  2025 240708-Model_Car_Collection-21 (1).jpg
-rw-rw-rw-@  1 joemorris  staff    47529 Jul  5  2025 240804-Model_Car_Collection-46 (1).jpg
```

#### CloudFront Verification
```bash
# .jpg files return 200 (with proper URL encoding)
$ curl -I "https://d15sc9fc739ev2.cloudfront.net/images/blog/240804-Model_Car_Collection-46%20(1).jpg"
HTTP/2 200 
content-type: image/jpeg
content-length: 47529
```

#### Code Analysis
**Part 4 (ebay-repeat-buyers-part-4.ts):**
- Metadata: `image: '/images/blog/240804-Model_Car_Collection-46 (1).jpg'` ✅ CORRECT
- Content HTML: `<img src="/images/blog/240804-Model_Car_Collection-46 (1).webp"` ❌ WRONG

**Part 5 (ebay-business-side-part-5.ts):**
- Metadata: `image: '/images/blog/240620-Model_Car_Collection-96 (1).jpg'` ✅ CORRECT
- Content HTML: No hero image in content (different issue)

**Part 3 (ebay-model-car-sales-timing-bundles.ts):**
- Metadata: `image: '/images/blog/240708-Model_Car_Collection-21 (1).jpg'` ✅ CORRECT
- Content HTML: No hero image in content (different issue)

## Counterexamples Documented

### Test Results

#### Test 1: Content References Non-Existent .webp Files (FAILED ✅)
```
=== BUG CONFIRMED: Content References Non-Existent .webp Files ===
Part 4: /images/blog/240804-Model_Car_Collection-46 (1).webp returned 404 (expected 200)
  Note: Content HTML references this .webp file
Part 5: /images/blog/240620-Model_Car_Collection-96 (1).webp returned 404 (expected 200)
  Note: Content HTML references this .webp file
Part 3: /images/blog/240708-Model_Car_Collection-21 (1).webp returned 404 (expected 200)
  Note: Content HTML references this .webp file
```

**Status:** ✅ Test FAILED as expected - confirms bug exists

#### Test 2: Actual .jpg Files Exist (PASSED ✅)
```
=== VERIFICATION: Actual .jpg Files Exist ===
Part 4: /images/blog/240804-Model_Car_Collection-46 (1).jpg returned 200
  Actual file: 240804-Model_Car_Collection-46 (1).jpg
Part 5: /images/blog/240620-Model_Car_Collection-96 (1).jpg returned 200
  Actual file: 240620-Model_Car_Collection-96 (1).jpg
Part 3: /images/blog/240708-Model_Car_Collection-21 (1).jpg returned 200
  Actual file: 240708-Model_Car_Collection-21 (1).jpg
```

**Status:** ✅ Test PASSED - confirms actual files exist as .jpg

#### Test 3: Property-Based Extension Mismatch Detection (PASSED ✅)
- Verified hero metadata references `.jpg` (correct)
- Verified content HTML references `.webp` (incorrect)
- Verified actual files are `.jpg`
- Verified base filenames match (only extension differs)

**Status:** ✅ Test PASSED - confirms the bug pattern

## Impact on Fix Implementation

### Design Document Needs Update
The fix implementation section in the design document is **INCORRECT** and needs to be revised:

**Current (Incorrect) Fix:**
- Change metadata from `.jpg` to `.webp`

**Correct Fix:**
- Change content HTML from `.webp` to `.jpg` (for Part 4 only)
- Parts 3 and 5 don't have hero images in content HTML, so no content fix needed
- Metadata is already correct and should NOT be changed

### Specific Changes Required

**File:** `src/content/blog/ebay-repeat-buyers-part-4.ts`

**Line 9 (Content HTML):**
```typescript
// CURRENT (WRONG):
<img src="/images/blog/240804-Model_Car_Collection-46 (1).webp" alt="..." loading="lazy" />

// SHOULD BE (CORRECT):
<img src="/images/blog/240804-Model_Car_Collection-46 (1).jpg" alt="..." loading="lazy" />
```

**Line 95 (Metadata):**
```typescript
// CURRENT (CORRECT - DO NOT CHANGE):
image: '/images/blog/240804-Model_Car_Collection-46 (1).jpg',
```

## Ahrefs Impact

The Ahrefs 404 errors are likely coming from:
1. The content HTML `<img>` tag referencing non-existent `.webp` files
2. Ahrefs crawling the blog post content and finding broken image references

The hero images themselves (from metadata) are working correctly and should not cause Ahrefs errors.

## Next Steps

1. ✅ Bug exploration test written and executed
2. ✅ Counterexamples documented
3. ⏭️ Update design document with correct root cause
4. ⏭️ Implement fix (change content HTML from .webp to .jpg)
5. ⏭️ Re-run test to verify fix works (test should pass after fix)

## Test File Location
`tests/blog-hero-images-bug-exploration.test.ts`

## Property-Based Testing Framework
- Framework: Vitest + fast-check
- Test runs: 10 iterations for property-based tests
- Network timeout: 30 seconds for HTTP requests
- CloudFront URL: https://d15sc9fc739ev2.cloudfront.net
