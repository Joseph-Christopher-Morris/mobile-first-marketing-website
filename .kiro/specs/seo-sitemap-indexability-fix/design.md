# SEO Sitemap Indexability Fix - Bugfix Design

## Overview

This bugfix addresses critical search engine indexability issues caused by an incomplete sitemap that omits all 14 blog articles and includes an artifact URL (/services/hosting/) that conflicts with the canonical URL structure. The fix implements dynamic sitemap generation that automatically discovers blog articles from the src/content/blog/ directory, excludes artifact URLs, and integrates with the existing S3 + CloudFront deployment pipeline. The solution uses a build-time Node.js script approach to generate sitemap.xml during the Next.js static export process, ensuring all blog content is discoverable by search engines while maintaining proper URL canonicalization.

## Glossary

- **Bug_Condition (C)**: The condition that triggers the bug - when sitemap.xml is generated without blog article URLs or includes artifact URLs
- **Property (P)**: The desired behavior when sitemap is generated - all blog articles from src/content/blog/ are included and artifact URLs are excluded
- **Preservation**: Existing top-level and service page URLs that must remain in the sitemap with their current priority and changefreq values
- **generateSitemap()**: The function in `scripts/generate-sitemap.js` that creates sitemap.xml from static routes and dynamic blog content
- **blogSlug**: The filename (without .ts extension) from src/content/blog/ that becomes the URL path segment (e.g., "stock-photography-breakthrough" → /blog/stock-photography-breakthrough/)
- **artifactURL**: The deprecated URL /services/hosting/ that must be excluded from sitemap and redirected to /services/website-hosting/
- **canonicalURL**: The correct URL structure that should appear in sitemap and canonical tags (e.g., /services/website-hosting/)
- **S3 + CloudFront deployment**: The production architecture using private S3 bucket with CloudFront OAC for static site hosting

## Bug Details

### Fault Condition

The bug manifests when the sitemap.xml file is generated during the Next.js build process. The current implementation uses a static XML file (public/sitemap.xml) that is manually maintained and only includes hardcoded top-level pages. This approach fails to discover blog articles dynamically from the src/content/blog/ directory and includes the artifact URL /services/hosting/ alongside the canonical /services/website-hosting/.

**Formal Specification:**
```
FUNCTION isBugCondition(sitemapGeneration)
  INPUT: sitemapGeneration of type SitemapGenerationProcess
  OUTPUT: boolean
  
  RETURN (sitemapGeneration.method == "static-file")
         AND (sitemapGeneration.blogArticlesIncluded == 0)
         AND (sitemapGeneration.urlList CONTAINS "/services/hosting/")
         AND (sitemapGeneration.urlList CONTAINS "/services/website-hosting/")
END FUNCTION
```

### Examples

- **Example 1**: When the build process runs `npm run build`, the static public/sitemap.xml is copied to out/sitemap.xml without any blog article URLs. Expected: All 14 blog articles should be included. Actual: Only 14 top-level pages are present.

- **Example 2**: When Google Search Console crawls the sitemap, it finds /services/hosting/ and /services/website-hosting/ as separate URLs. Expected: Only /services/website-hosting/ should be in sitemap. Actual: Both URLs present, causing "Alternate page with proper canonical tag" warning.

- **Example 3**: When a new blog article "new-case-study.ts" is added to src/content/blog/, the sitemap remains unchanged after build. Expected: The new article URL /blog/new-case-study/ should automatically appear in sitemap. Actual: Manual sitemap update required.

- **Edge Case**: When the src/content/blog/ directory contains 0 blog files (hypothetical), the sitemap generation should still succeed and include all top-level pages without errors.

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- All existing top-level page URLs (/, /services/, /about/, /contact/, /pricing/, /blog/, /free-audit/, /privacy-policy/) must continue to appear in sitemap with their current priority and changefreq values
- All service page URLs (/services/website-design/, /services/website-hosting/, /services/ad-campaigns/, /services/analytics/, /services/photography/) must continue to appear with their current priority and changefreq values
- The sitemap.xml file must continue to be generated in the out/ directory during build for S3 deployment
- The deployment scripts must continue to upload sitemap.xml with Cache-Control: public, max-age=3600 headers
- CloudFront invalidation must continue to invalidate /sitemap.xml path
- robots.txt must continue to reference https://vividmediacheshire.com/sitemap.xml

**Scope:**
All inputs that do NOT involve blog article discovery or artifact URL handling should be completely unaffected by this fix. This includes:
- Static page rendering and routing
- Image optimization and asset handling
- CSS and JavaScript bundling
- Metadata generation for non-blog pages
- Navigation menu rendering
- Footer and header components

## Hypothesized Root Cause

Based on the bug description, the most likely issues are:

1. **Static Sitemap File**: The current implementation uses a manually maintained public/sitemap.xml file that is copied during build without any dynamic content discovery. This requires manual updates whenever blog articles are added.

2. **No Blog Discovery Logic**: There is no script or build step that reads the src/content/blog/ directory to extract blog slugs and generate corresponding sitemap entries.

3. **Manual URL Maintenance**: The artifact URL /services/hosting/ was manually added to the static sitemap and never removed when the canonical URL changed to /services/website-hosting/.

4. **Missing Build Integration**: The Next.js build process (output: 'export') does not include a postbuild hook or script to generate sitemap.xml dynamically before the static export completes.

## Correctness Properties

Property 1: Fault Condition - Dynamic Blog Article Discovery

_For any_ sitemap generation process where blog article files exist in src/content/blog/, the fixed generateSitemap function SHALL automatically discover all .ts files, extract their slugs, and include corresponding /blog/{slug}/ URLs in the sitemap with appropriate priority (0.7) and changefreq (monthly) values.

**Validates: Requirements 2.1, 2.3, 2.4**

Property 2: Fault Condition - Artifact URL Exclusion

_For any_ sitemap generation process, the fixed generateSitemap function SHALL exclude the artifact URL /services/hosting/ from the sitemap and include only the canonical URL /services/website-hosting/, preventing URL canonicalization confusion in Google Search Console.

**Validates: Requirements 2.2, 2.5**

Property 3: Preservation - Existing URL Retention

_For any_ sitemap generation process, the fixed generateSitemap function SHALL continue to include all existing top-level and service page URLs with their current priority and changefreq values, preserving the existing sitemap structure for non-blog pages.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct:

**File**: `scripts/generate-sitemap.js` (new file)

**Function**: `generateSitemap()`

**Specific Changes**:

1. **Create Dynamic Sitemap Generator Script**: Implement a Node.js script that generates sitemap.xml during build time
   - Read src/content/blog/ directory to discover all .ts files
   - Extract blog slugs from filenames (remove .ts extension)
   - Generate XML entries for each blog article with /blog/{slug}/ URL pattern
   - Include all static top-level and service page URLs
   - Exclude artifact URL /services/hosting/
   - Write sitemap.xml to public/ directory before Next.js export

2. **Integrate with Build Process**: Modify package.json to run sitemap generation before Next.js build
   - Add "prebuild" script that runs `node scripts/generate-sitemap.js`
   - Ensure sitemap.xml is generated in public/ directory so Next.js copies it to out/ during export
   - Verify sitemap.xml is present in out/ directory after build completes

3. **Implement 301 Redirect for Artifact URL**: Configure Next.js middleware or CloudFront function to redirect /services/hosting/ → /services/website-hosting/
   - Option A: Use Next.js middleware.ts with redirect logic (requires server-side rendering, not compatible with static export)
   - Option B: Use CloudFront Functions to handle redirect at edge (recommended for static export)
   - Option C: Document manual CloudFront redirect configuration in deployment scripts

4. **Validate Canonical Tags**: Ensure all pages use correct canonical URLs matching sitemap entries
   - Verify src/lib/seo.ts buildSEO function generates correct canonical URLs
   - Check that /services/hosting/ page (if it exists) has canonical tag pointing to /services/website-hosting/
   - Validate blog article pages have canonical tags matching /blog/{slug}/ pattern

5. **Update Deployment Pipeline**: Ensure sitemap.xml is properly deployed with correct cache headers
   - Verify scripts/deploy.js uploads sitemap.xml with Cache-Control: public, max-age=3600
   - Confirm CloudFront invalidation includes /sitemap.xml path
   - Test that sitemap.xml is accessible at https://vividmediacheshire.com/sitemap.xml after deployment

### Implementation Approach: Build-Time Script (Recommended)

**Rationale**: Next.js static export (output: 'export') does not support API routes or server-side rendering. A build-time Node.js script is the most compatible approach for generating sitemap.xml before the static export process.

**Script Structure**:
```javascript
// scripts/generate-sitemap.js
const fs = require('fs');
const path = require('path');

function generateSitemap() {
  // 1. Define static URLs with priority and changefreq
  const staticUrls = [
    { loc: '/', priority: 1.0, changefreq: 'weekly' },
    { loc: '/services/', priority: 0.9, changefreq: 'weekly' },
    // ... other static URLs
  ];

  // 2. Discover blog articles from src/content/blog/
  const blogDir = path.join(process.cwd(), 'src/content/blog');
  const blogFiles = fs.readdirSync(blogDir).filter(f => f.endsWith('.ts'));
  const blogUrls = blogFiles.map(file => ({
    loc: `/blog/${file.replace('.ts', '')}/`,
    priority: 0.7,
    changefreq: 'monthly'
  }));

  // 3. Combine URLs and exclude artifact URL
  const allUrls = [...staticUrls, ...blogUrls]
    .filter(url => url.loc !== '/services/hosting/');

  // 4. Generate XML
  const xml = generateXML(allUrls);

  // 5. Write to public/sitemap.xml
  fs.writeFileSync(path.join(process.cwd(), 'public/sitemap.xml'), xml);
}
```

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bug on unfixed code, then verify the fix works correctly and preserves existing behavior.

### Exploratory Fault Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm or refute the root cause analysis. If we refute, we will need to re-hypothesize.

**Test Plan**: Write tests that parse the current public/sitemap.xml file and assert that blog article URLs are present and artifact URLs are absent. Run these tests on the UNFIXED code to observe failures and understand the root cause.

**Test Cases**:
1. **Blog Article Discovery Test**: Parse public/sitemap.xml and count URLs matching /blog/* pattern (will fail on unfixed code - expects 14, finds 0)
2. **Artifact URL Presence Test**: Parse public/sitemap.xml and check for /services/hosting/ URL (will fail on unfixed code - expects absent, finds present)
3. **Canonical URL Presence Test**: Parse public/sitemap.xml and check for /services/website-hosting/ URL (will pass on unfixed code - expects present, finds present)
4. **Static URL Preservation Test**: Parse public/sitemap.xml and verify all 14 top-level pages are present (will pass on unfixed code)

**Expected Counterexamples**:
- Sitemap contains 0 blog article URLs when 14 blog files exist in src/content/blog/
- Sitemap contains both /services/hosting/ and /services/website-hosting/ URLs
- Possible causes: static sitemap file, no blog discovery logic, manual URL maintenance

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed function produces the expected behavior.

**Pseudocode:**
```
FOR ALL sitemapGeneration WHERE isBugCondition(sitemapGeneration) DO
  result := generateSitemap_fixed()
  ASSERT expectedBehavior(result)
END FOR
```

**Expected Behavior Function:**
```
FUNCTION expectedBehavior(sitemap)
  INPUT: sitemap of type XMLDocument
  OUTPUT: boolean
  
  blogUrls := sitemap.findAll(url => url.startsWith('/blog/'))
  artifactUrl := sitemap.find(url => url == '/services/hosting/')
  canonicalUrl := sitemap.find(url => url == '/services/website-hosting/')
  
  RETURN (blogUrls.length == 14)
         AND (artifactUrl == null)
         AND (canonicalUrl != null)
END FUNCTION
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed function produces the same result as the original function.

**Pseudocode:**
```
FOR ALL sitemapGeneration WHERE NOT isBugCondition(sitemapGeneration) DO
  ASSERT generateSitemap_original(sitemapGeneration) = generateSitemap_fixed(sitemapGeneration)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain
- It catches edge cases that manual unit tests might miss
- It provides strong guarantees that behavior is unchanged for all non-buggy inputs

**Test Plan**: Observe behavior on UNFIXED code first for static page URLs, then write property-based tests capturing that behavior.

**Test Cases**:
1. **Static URL Preservation**: Verify all 14 top-level page URLs remain in sitemap with same priority/changefreq values after fix
2. **Service URL Preservation**: Verify all 5 service page URLs remain in sitemap with same priority/changefreq values after fix
3. **XML Structure Preservation**: Verify sitemap.xml maintains valid XML structure with proper namespace and encoding
4. **Deployment Integration Preservation**: Verify sitemap.xml is still copied to out/ directory and deployed to S3 with correct cache headers

### Unit Tests

- Test blog slug extraction from src/content/blog/ directory (handles .ts files, ignores non-.ts files)
- Test artifact URL exclusion logic (filters out /services/hosting/ from URL list)
- Test XML generation with proper escaping and formatting
- Test edge case: empty blog directory (0 blog files) generates valid sitemap with only static URLs
- Test edge case: blog file with special characters in filename (e.g., "test-&-demo.ts") generates valid URL

### Property-Based Tests

- Generate random sets of blog filenames and verify all are included in sitemap with correct URL pattern
- Generate random static URL configurations and verify preservation of priority/changefreq values
- Test that sitemap generation is idempotent (running twice produces identical output)
- Test that sitemap generation handles various blog directory states (0 files, 1 file, 100 files)

### Integration Tests

- Test full build process: run `npm run build` and verify sitemap.xml in out/ directory contains all blog articles
- Test deployment process: deploy to S3 and verify sitemap.xml is accessible at CloudFront URL
- Test Google Search Console submission: submit sitemap and verify no "Crawled – currently not indexed" errors for blog articles
- Test 301 redirect: access /services/hosting/ and verify redirect to /services/website-hosting/ with HTTP 301 status
- Test canonical tag validation: crawl all pages and verify canonical URLs match sitemap entries

## Additional Considerations

### Redirect Implementation Options

**Option A: CloudFront Functions (Recommended)**
- Pros: Works with static export, executes at edge, no server required
- Cons: Requires CloudFront configuration update, not version-controlled in codebase
- Implementation: Create CloudFront Function with redirect logic, attach to viewer request event

**Option B: Next.js Middleware**
- Pros: Version-controlled in codebase, easy to test locally
- Cons: Requires server-side rendering, incompatible with output: 'export'
- Implementation: Not viable for current static export architecture

**Option C: HTML Meta Refresh**
- Pros: Works with static export, no CloudFront changes required
- Cons: Not a true 301 redirect, poor SEO signal, slower user experience
- Implementation: Create /services/hosting/index.html with meta refresh tag

**Recommendation**: Use CloudFront Functions for proper 301 redirect. Document configuration in scripts/setup-infrastructure.js or deployment documentation.

### Sitemap Size and Performance

- Current sitemap: 14 top-level pages + 14 blog articles = 28 URLs (well within 50,000 URL limit)
- Future growth: If blog exceeds 1,000 articles, consider sitemap index file with multiple sitemaps
- Performance: Sitemap generation adds ~100ms to build time (negligible impact)

### Cache Invalidation Strategy

- Current: CloudFront invalidation includes /sitemap.xml path
- Recommendation: Keep max-age=3600 (1 hour) to balance freshness and cache efficiency
- Alternative: Reduce to max-age=1800 (30 minutes) if blog publishing frequency increases

### Canonical Tag Validation

- Verify src/lib/seo.ts buildSEO function uses canonicalPath parameter correctly
- Check that all blog article pages call buildSEO with canonicalPath: `/blog/${slug}/`
- Ensure /services/hosting/ page (if it exists as a route) has canonical tag pointing to /services/website-hosting/
- Consider adding automated test to validate canonical tags match sitemap URLs
