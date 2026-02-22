# Ahrefs Metadata Fix Bugfix Design

## Overview

This bugfix addresses duplicate brand names in page titles detected by Ahrefs, which has caused the site health score to drop to 71 (target: 85+). The root cause is a metadata layering conflict: the current `buildMetadata()` function in `src/lib/seo.ts` appends "Vivid Media Cheshire" to all titles, while the root `layout.tsx` also includes the brand name in its default metadata. When pages use qualifiers containing the brand name, this creates titles like "Pricing | Vivid Media Cheshire | Vivid Media Cheshire".

The fix implements a centralized `buildSEO()` function that generates clean, SEO-optimized titles without brand duplication, updates the root layout to use a template pattern (brand appended via `%s` template), removes all manual `<title>` tags, rewrites all page metadata to use the new function, adds duplicate detection guards, and creates a verification script to validate titles across all routes.

## Glossary

- **Bug_Condition (C)**: The condition that triggers duplicate brand names in page titles
- **Property (P)**: The desired behavior where brand name appears exactly once at the end of titles
- **Preservation**: Existing OpenGraph, Twitter card, canonical URL, and robots meta functionality that must remain unchanged
- **buildMetadata()**: The current function in `src/lib/seo.ts` that generates metadata with brand appended
- **buildSEO()**: The new centralized function that generates clean metadata without brand duplication
- **Template Pattern**: Next.js metadata template feature using `%s` placeholder for dynamic title injection
- **Fault Condition**: Input where qualifier or intent contains "Vivid Media Cheshire" causing duplication
- **CloudFront Invalidation**: Cache clearing for distribution E2IBMHQ3GCW6ZK to ensure metadata changes are visible

## Bug Details

### Fault Condition

The bug manifests when a page uses `buildMetadata()` with an intent or qualifier parameter, and the root `layout.tsx` also defines default metadata with the brand name. The `buildMetadata()` function appends "Vivid Media Cheshire" to the title, but Next.js metadata inheritance causes the layout's brand-suffixed title to also apply, resulting in duplicate brand names.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type { intent: string, qualifier?: string, description: string, canonicalPath: string }
  OUTPUT: boolean
  
  RETURN (input.intent CONTAINS "Vivid Media Cheshire" OR input.qualifier CONTAINS "Vivid Media Cheshire")
         OR (buildMetadata(input).title CONTAINS "Vivid Media Cheshire" 
             AND layout.metadata.title CONTAINS "Vivid Media Cheshire")
         OR (buildMetadata(input).title.length > 60)
END FUNCTION
```

### Examples

- **Homepage**: Current title "Websites, Ads, Analytics & Photography in Cheshire | Vivid Media Cheshire" (correct length but needs optimization to "Websites, Ads & Analytics for Cheshire Businesses")
- **Services Page**: Current title "Digital Marketing & Web Services in Cheshire | Vivid Media Cheshire" should become "Digital Marketing & Website Services for Small Businesses"
- **Pricing Page**: Current title "Pricing for Digital Marketing Services | Vivid Media Cheshire" should become "Transparent Website & Marketing Pricing for Small Businesses"
- **Contact Page**: Current title "Contact Vivid Media Cheshire | Vivid Media Cheshire" demonstrates the duplication bug - should become "Contact Vivid Media Cheshire — Start Your Project"
- **Edge Case**: Pages with qualifiers containing brand name (e.g., `qualifier: "Vivid Media Cheshire"`) create explicit duplication

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- OpenGraph metadata generation with title, description, images, url, siteName, locale, and type fields must continue to work
- Twitter card metadata with card type, title, description, and images must continue to work
- Canonical URL normalization with trailing slashes and absolute URL building must continue to work
- Robots meta tags (noindex parameter) must continue to work when specified
- S3 + CloudFront deployment architecture must remain unchanged
- Page navigation and metadata display must remain visually and functionally identical

**Scope:**
All inputs that do NOT involve title generation should be completely unaffected by this fix. This includes:
- OpenGraph image URLs and dimensions
- Twitter card configuration
- Canonical URL path normalization
- Robots meta tag logic
- Meta description cleaning and truncation (except for new conversion-focused descriptions)
- Deployment scripts and GitHub Actions workflows

## Hypothesized Root Cause

Based on the bug description and code analysis, the most likely issues are:

1. **Metadata Layering Conflict**: The `buildMetadata()` function explicitly appends "| Vivid Media Cheshire" to all titles via the `buildTitle()` helper function, while the root `layout.tsx` also defines default metadata with brand-suffixed titles. Next.js metadata inheritance causes both to apply in certain contexts.

2. **Missing Template Pattern**: The root layout does not use Next.js's `title.template` feature, which would allow child pages to inject their titles into a template like `%s | Vivid Media Cheshire`, ensuring the brand appears exactly once.

3. **No Duplicate Detection**: The current `buildMetadata()` function has no guard to detect if the brand name is already present in the intent or qualifier parameters, allowing explicit duplication when developers pass qualifiers like "Vivid Media Cheshire".

4. **Inconsistent Title Structure**: Different pages use different title formats (some with qualifiers, some without), making it difficult to maintain consistent SEO structure across the site.

5. **Manual Title Tags**: If any pages contain manual `<title>` tags in their JSX, these would override metadata and create inconsistencies.

## Correctness Properties

Property 1: Fault Condition - Single Brand Name in Titles

_For any_ page metadata generated by the fixed buildSEO() function, the resulting title SHALL contain the brand name "Vivid Media Cheshire" exactly once at the end, following the format "Primary Keyword | Supporting Context" with total length under 60 characters.

**Validates: Requirements 2.1, 2.3**

Property 2: Preservation - OpenGraph and Twitter Metadata

_For any_ page metadata generated by the fixed buildSEO() function, the resulting OpenGraph and Twitter card metadata SHALL contain all the same fields (title, description, images, url, siteName, locale, type, card) as the original buildMetadata() function, preserving social sharing functionality.

**Validates: Requirements 3.2**

Property 3: Preservation - Canonical URL Normalization

_For any_ canonicalPath input to the fixed buildSEO() function, the resulting canonical URL SHALL be normalized with trailing slashes (except root) and built as an absolute URL, exactly as the original buildMetadata() function does.

**Validates: Requirements 3.3**

Property 4: Preservation - Robots Meta Tags

_For any_ input where noindex parameter is set to true, the fixed buildSEO() function SHALL generate robots meta tags with index:false and follow:false, exactly as the original buildMetadata() function does.

**Validates: Requirements 3.4**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct:

**File**: `src/lib/seo.ts`

**Function**: Rename `buildMetadata()` to `buildSEO()` and refactor

**Specific Changes**:
1. **Remove Brand Appending from buildTitle()**: Change `buildTitle()` to return only the intent and qualifier without appending "| Vivid Media Cheshire", since the layout template will handle this
   - Remove the `| ${BRAND}` suffix from both return statements
   - Rename to `buildCleanTitle()` for clarity

2. **Add Duplicate Detection Guard**: Create a new function `detectDuplicateBrand()` that checks if the brand name already appears in the intent or qualifier
   - If detected, log a warning and strip the duplicate
   - Return cleaned intent/qualifier

3. **Implement Title Length Validation**: Add a function `validateTitleLength()` that ensures titles (without brand) are under 45 characters to allow room for "| Vivid Media Cheshire" (15 chars)
   - Throw an error or log a warning if exceeded
   - Suggest truncation

4. **Update Meta Description Logic**: Enhance `cleanDescription()` to enforce 140-155 character range and ensure conversion-focused language
   - Add validation for minimum length (140 chars)
   - Add helper comments about conversion focus

5. **Rename and Export**: Rename `buildMetadata()` to `buildSEO()` and update all exports
   - Keep the same function signature for backward compatibility during migration
   - Add JSDoc comments explaining the new behavior

**File**: `src/app/layout.tsx`

**Metadata Export**: Update root layout metadata

**Specific Changes**:
1. **Implement Template Pattern**: Add `title.template` to the metadata export
   - Set `title.template: '%s | Vivid Media Cheshire'`
   - Set `title.default: 'Websites, Ads & Analytics for Cheshire Businesses'` (for homepage fallback)

2. **Remove Brand from Existing Titles**: Update the hardcoded title and OpenGraph/Twitter titles to remove "| Vivid Media Cheshire" suffix
   - These will be appended via the template

3. **Keep All Other Metadata**: Preserve authors, creator, publisher, formatDetection, metadataBase, alternates, openGraph, twitter, robots, verification, and manifest fields exactly as they are

**Files**: All page files using `buildMetadata()`

**Changes**: Update all imports and function calls

**Specific Changes**:
1. **Update Imports**: Change `import { buildMetadata } from '@/lib/seo'` to `import { buildSEO } from '@/lib/seo'`

2. **Update Function Calls**: Change `buildMetadata({...})` to `buildSEO({...})`

3. **Update Intent/Qualifier Parameters**: Rewrite intent and qualifier values according to the specified title formats:
   - Homepage: `intent: "Websites, Ads & Analytics for Cheshire Businesses"` (no qualifier)
   - Services: `intent: "Digital Marketing & Website Services for Small Businesses"` (no qualifier)
   - Pricing: `intent: "Transparent Website & Marketing Pricing for Small Businesses"` (no qualifier)
   - About: `intent: "About Vivid Media Cheshire — Local Digital Marketing Support"` (no qualifier)
   - Contact: `intent: "Contact Vivid Media Cheshire — Start Your Project"` (no qualifier)
   - Blog: `intent: "Digital Marketing Insights for Small Businesses"` (no qualifier)

4. **Update Meta Descriptions**: Rewrite description parameters to be conversion-focused, 140-155 characters, with locality

**New File**: `scripts/seo-check.js`

**Purpose**: Verification script to scan routes and validate titles

**Specific Changes**:
1. **Route Discovery**: Scan `src/app` directory recursively to find all `page.tsx` files
   - Extract metadata exports from each file
   - Build a list of all routes

2. **Title Validation**: For each route, validate:
   - Brand name appears exactly once
   - Title length is under 60 characters
   - Title follows "Primary Keyword | Supporting Context" format
   - No duplicate titles across routes

3. **Meta Description Validation**: For each route, validate:
   - Description length is between 140-155 characters
   - Description is present and non-empty

4. **Report Generation**: Output a report showing:
   - Total routes scanned
   - Routes with issues (duplicates, length violations, missing descriptions)
   - Routes passing all checks

5. **Exit Code**: Exit with code 1 if any issues found, 0 if all pass (for CI/CD integration)

**File**: `package.json`

**Scripts Section**: Add new npm script

**Specific Changes**:
1. **Add Script**: `"seo:check": "node scripts/seo-check.js"`

**File**: `.github/workflows/s3-cloudfront-deploy.yml`

**Deployment Step**: Ensure CloudFront invalidation

**Specific Changes**:
1. **Verify Invalidation Step**: Confirm that the workflow includes a step to invalidate CloudFront distribution E2IBMHQ3GCW6ZK after S3 upload
   - If missing, add invalidation step with `aws cloudfront create-invalidation --distribution-id E2IBMHQ3GCW6ZK --paths "/*"`

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bug on unfixed code by running Ahrefs crawl or manual inspection, then verify the fix works correctly by validating all titles contain the brand exactly once and preserve existing OpenGraph/Twitter/canonical functionality.

### Exploratory Fault Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm or refute the root cause analysis. If we refute, we will need to re-hypothesize.

**Test Plan**: Manually inspect the current live site or run a local build to examine the generated HTML `<title>` tags and metadata. Use browser DevTools to inspect the `<head>` section of each page. Run Ahrefs crawl to identify duplicate titles. Compare against the expected title formats.

**Test Cases**:
1. **Contact Page Duplication**: Navigate to `/contact` and inspect the title tag (will show "Contact Vivid Media Cheshire | Vivid Media Cheshire" on unfixed code)
2. **Services Page Length**: Navigate to `/services` and measure title length (may exceed 60 characters on unfixed code)
3. **Pricing Page Format**: Navigate to `/pricing` and verify title structure (may not follow "Primary Keyword | Supporting Context" format on unfixed code)
4. **Homepage Optimization**: Navigate to `/` and verify title matches Ahrefs recommendations (may need rewording on unfixed code)

**Expected Counterexamples**:
- Contact page shows duplicate brand name in title
- Multiple pages exceed 60 character title length
- Ahrefs reports duplicate title tags across pages
- Possible causes: metadata layering conflict, missing template pattern, no duplicate detection

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed function produces the expected behavior.

**Pseudocode:**
```
FOR ALL page WHERE page uses buildSEO() DO
  metadata := buildSEO(page.params)
  title := metadata.title
  ASSERT countOccurrences(title, "Vivid Media Cheshire") = 1
  ASSERT title.length <= 60
  ASSERT title matches format "Primary Keyword | Supporting Context"
END FOR
```

**Implementation**: Run `npm run seo:check` script to validate all routes

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed function produces the same result as the original function.

**Pseudocode:**
```
FOR ALL metadata_field WHERE metadata_field NOT IN ["title"] DO
  original := buildMetadata(input)[metadata_field]
  fixed := buildSEO(input)[metadata_field]
  ASSERT original = fixed
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain
- It catches edge cases that manual unit tests might miss
- It provides strong guarantees that behavior is unchanged for all non-title metadata fields

**Test Plan**: Observe behavior on UNFIXED code first for OpenGraph images, Twitter cards, canonical URLs, and robots tags, then write property-based tests capturing that behavior.

**Test Cases**:
1. **OpenGraph Preservation**: Verify that OpenGraph title, description, images, url, siteName, locale, and type fields remain unchanged after fix
2. **Twitter Card Preservation**: Verify that Twitter card, title, description, and images fields remain unchanged after fix
3. **Canonical URL Preservation**: Verify that canonical URL normalization (trailing slashes, absolute URLs) remains unchanged after fix
4. **Robots Meta Preservation**: Verify that noindex parameter still generates correct robots meta tags after fix

### Unit Tests

- Test `buildSEO()` with various intent/qualifier combinations to ensure brand appears exactly once
- Test `detectDuplicateBrand()` with inputs containing "Vivid Media Cheshire" to verify stripping
- Test `validateTitleLength()` with titles of various lengths to verify warnings/errors
- Test `cleanDescription()` with descriptions of various lengths to verify 140-155 character enforcement
- Test template pattern in layout.tsx by inspecting rendered HTML

### Property-Based Tests

- Generate random intent/qualifier combinations and verify brand appears exactly once in resulting titles
- Generate random canonicalPath values and verify URL normalization remains consistent
- Generate random description strings and verify cleaning/truncation behavior is preserved
- Test that all metadata fields except title remain unchanged across many input variations

### Integration Tests

- Build the full Next.js application and inspect generated HTML for all routes
- Run `npm run seo:check` script and verify it passes for all routes
- Deploy to staging environment and run Ahrefs crawl to verify zero duplicate titles
- Test CloudFront cache invalidation by deploying and verifying metadata changes are visible immediately
- Verify social sharing previews (OpenGraph/Twitter) display correctly after fix
