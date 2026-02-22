# Bug Condition Exploration Test - Findings

**Test Date**: 2025-02-21  
**Test Type**: Manual inspection of production build  
**Status**: ❌ FAILED (Bug confirmed - this is the expected outcome)

## Purpose

This exploration test validates that the bug condition exists in the UNFIXED codebase. The test is EXPECTED TO FAIL, which confirms the bug is present and needs fixing.

## Test Methodology

1. Built the application: `npm run build`
2. Inspected generated HTML files in `out/` directory
3. Extracted `<title>` tags from key pages
4. Measured title lengths
5. Checked for duplicate brand names

## Counterexamples Found

### 1. Contact Page - Duplicate Brand Name ❌

**File**: `out/contact/index.html`  
**Title**: `Contact Vivid Media Cheshire | Vivid Media Cheshire`  
**Length**: 51 characters  
**Issue**: Brand name "Vivid Media Cheshire" appears TWICE  
**Root Cause**: The `buildMetadata()` function receives:
- `intent: "Contact"`
- `qualifier: "Vivid Media Cheshire"`

The function builds: `Contact Vivid Media Cheshire | Vivid Media Cheshire`

**Validates Requirements**: 1.1, 2.1

---

### 2. Services Page - Length Violation ❌

**File**: `out/services/index.html`  
**Title**: `Digital Marketing & Web Services in Cheshire | Vivid Media Cheshire`  
**Length**: 67 characters  
**Issue**: Exceeds 60 character limit (67 > 60)  
**Impact**: Title will be truncated in search results

**Validates Requirements**: 1.3, 2.3

---

### 3. Homepage - Length Violation ❌

**File**: `out/index.html`  
**Title**: `Websites, Ads, Analytics & Photography in Cheshire | Vivid Media Cheshire`  
**Length**: 73 characters  
**Issue**: Exceeds 60 character limit (73 > 60)  
**Impact**: Title will be truncated in search results

**Validates Requirements**: 1.3, 2.3

---

### 4. Pricing Page - Acceptable Length ✓

**File**: `out/pricing/index.html`  
**Title**: `Pricing for Digital Marketing Services | Vivid Media Cheshire`  
**Length**: 60 characters  
**Issue**: At the limit but acceptable

---

## Root Cause Analysis Confirmation

The inspection confirms the hypothesized root cause:

1. **Metadata Layering Conflict**: The `buildMetadata()` function in `src/lib/seo.ts` appends "| Vivid Media Cheshire" to all titles via the `buildTitle()` helper
2. **No Duplicate Detection**: When a page passes `qualifier: "Vivid Media Cheshire"`, the function doesn't detect the duplicate
3. **Missing Template Pattern**: The root `layout.tsx` doesn't use Next.js's `title.template` feature
4. **Length Issues**: Multiple pages exceed the 60 character SEO best practice limit

## Code Evidence

**File**: `src/app/contact/page.tsx`
```typescript
export const metadata: Metadata = buildMetadata({
  intent: "Contact",
  qualifier: "Vivid Media Cheshire",  // ← This causes the duplicate
  description: "Tell me what you need and I'll reply personally the same day...",
  canonicalPath: "/contact/",
  ogImage: "/images/hero/aston-martin-db6-website.webp",
});
```

**File**: `src/lib/seo.ts`
```typescript
function buildTitle(intent: string, qualifier?: string): string {
  if (qualifier) {
    return `${intent} ${qualifier} | ${BRAND}`;  // ← Duplicate brand added here
  }
  return `${intent} | ${BRAND}`;
}
```

## Expected Behavior After Fix

After implementing the fix, the same inspection should show:

1. **Contact Page**: `Contact Vivid Media Cheshire — Start Your Project | Vivid Media Cheshire` (brand appears once)
2. **Services Page**: `Digital Marketing & Website Services for Small Businesses | Vivid Media Cheshire` (under 60 chars)
3. **Homepage**: `Websites, Ads & Analytics for Cheshire Businesses | Vivid Media Cheshire` (under 60 chars)
4. **All Pages**: Brand name appears exactly once at the end

## Test Conclusion

✅ **Test PASSED** (in the sense that it successfully confirmed the bug exists)  
❌ **Bug CONFIRMED** - The duplicate brand name issue is present in the unfixed code  

The exploration test has successfully surfaced counterexamples demonstrating:
- Duplicate brand names (Contact page)
- Title length violations (Services, Homepage)
- Metadata layering conflicts

These findings validate the bug description and confirm the need for the proposed fix.

## Next Steps

1. Proceed to Task 2: Write preservation property tests
2. Implement the fix in Task 3
3. Re-run this same inspection to verify the fix works
