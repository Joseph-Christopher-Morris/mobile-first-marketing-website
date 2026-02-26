# 🇬🇧 UK English Quick Reference Guide

**Last Updated:** 23 November 2025  
**Status:** ✅ Fully Implemented

---

## Quick Spelling Reference

### Always Use UK English

| ❌ US English | ✅ UK English |
|--------------|--------------|
| optimize | optimise |
| optimized | optimised |
| optimizing | optimising |
| optimization | optimisation |
| analyze | analyse |
| analyzed | analysed |
| analyzing | analysing |
| customize | customise |
| customized | customised |
| customizing | customising |
| customization | customisation |
| personalize | personalise |
| personalized | personalised |
| color | colour |
| behavior | behaviour |
| center (noun) | centre |
| favorite | favourite |
| organize | organise |
| organized | organised |
| organizing | organising |
| license (noun) | licence |
| defense | defence |
| inquiry | enquiry |
| inquiries | enquiries |

---

## Common Phrases

| ❌ US English | ✅ UK English |
|--------------|--------------|
| speed optimization | speed optimisation |
| performance optimization | performance optimisation |
| ROI Optimization | ROI Optimisation |
| mobile-optimized | mobile-optimised |
| Mobile-Optimized Delivery | Mobile-Optimised Delivery |
| No tech stress | No technical stress |
| Mobile first | Mobile-first |
| Performance focused | Performance-focused |
| SEO Ready | SEO-ready |

---

## Important Exceptions

### CSS Classes (DO NOT CHANGE)
These are Tailwind CSS utility classes and must remain as-is:
- `text-center`
- `justify-center`
- `items-center`
- `place-center`
- `content-center`

### Code/Technical Terms (DO NOT CHANGE)
- Import statements
- Function names
- Variable names
- File paths
- Module names

---

## When Editing Content

### ✅ DO Change
- User-facing text content
- Marketing copy
- Service descriptions
- Blog posts
- Meta descriptions
- Button labels
- Form labels
- Error messages

### ❌ DON'T Change
- CSS class names
- JavaScript code
- TypeScript types
- Import paths
- Configuration files
- Environment variables

---

## Automated Script

Use the normalisation script for bulk updates:

```bash
node scripts/apply-uk-english-normalisation.js
```

**What it does:**
- Scans all `.tsx`, `.ts`, and `.md` files
- Applies UK English rules intelligently
- Preserves CSS classes and code syntax
- Generates detailed change report

**Files processed:**
- `src/app/**/*.tsx`
- `src/components/**/*.tsx`
- `src/content/**/*.ts`
- `content/**/*.md`

---

## Manual Editing Guidelines

When writing new content:

1. **Always use UK English spellings** from the reference table above
2. **Use hyphens** for compound adjectives (mobile-first, performance-focused)
3. **Be consistent** with existing content
4. **Check your work** by searching for US variants before committing

---

## Verification Commands

### Search for US English spellings:
```bash
# Search in source files
grep -r "optimize\|analyze\|customize" src/

# Search in specific file types
grep -r "optimization" src/**/*.tsx
```

### Run the normalisation script:
```bash
node scripts/apply-uk-english-normalisation.js
```

---

## Deployment Process

After making UK English changes:

```bash
# 1. Build the site
npm run build

# 2. Deploy to production (S3 + CloudFront)
S3_BUCKET_NAME="mobile-marketing-site-prod-1760376557954-w49slb"
CLOUDFRONT_DISTRIBUTION_ID="E17G92EIZ7VTUY"
AWS_REGION="us-east-1"
node scripts/deploy.js

# 3. Invalidate cache if needed
aws cloudfront create-invalidation --distribution-id E17G92EIZ7VTUY --paths "/*"
```

---

## Why UK English?

### Brand Consistency
- Vivid Media Cheshire is a UK-based business
- Serving Cheshire East and local UK market
- Professional presentation for UK audience

### SEO Benefits
- Matches local search terms
- Aligns with UK user expectations
- Improves local relevance signals

### Credibility
- Shows attention to detail
- Demonstrates local market understanding
- Builds trust with UK customers

---

## Common Mistakes to Avoid

### ❌ Don't Do This
```tsx
// Wrong: Changing CSS classes
className="text-centre"  // ❌ Will break styling

// Wrong: Changing code
const optimiseFunction = () => {}  // ❌ Inconsistent with codebase
```

### ✅ Do This Instead
```tsx
// Correct: Only change content strings
<p>We optimise your website for speed</p>  // ✅ Content only

// Correct: Keep CSS classes as-is
className="text-center"  // ✅ Tailwind utility class
```

---

## Resources

### Documentation
- **Full Specification:** `docs/specs/🇬🇧 UK English Normalisation – Regex Rules for Kiro.txt`
- **Deployment Guide:** `UK-ENGLISH-NORMALISATION-DEPLOYMENT-NOV-23-2025.md`
- **Script:** `scripts/apply-uk-english-normalisation.js`

### Reports
- Latest: `uk-english-normalisation-report-2025-11-23T19-20-07-290Z.json`
- Previous: `uk-english-normalisation-report-2025-11-13T22-08-00-574Z.json`

---

## Quick Checklist

Before committing content changes:

- [ ] Used UK English spellings (optimise, analyse, centre, colour)
- [ ] Hyphenated compound adjectives (mobile-first, SEO-ready)
- [ ] Preserved CSS class names (text-center, etc.)
- [ ] Kept code syntax unchanged
- [ ] Ran build to verify no errors
- [ ] Checked for consistency with existing content

---

**Remember:** When in doubt, use UK English. It's the standard for all Vivid Media Cheshire content.

---

*Last deployment: 23 November 2025 | Status: ✅ Live*
