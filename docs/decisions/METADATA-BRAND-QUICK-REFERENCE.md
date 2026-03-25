# Metadata & Brand Alignment — Quick Reference

## ✅ Approved Brand Name
**Use:** Vivid Media Cheshire  
**Never use:** Vivid Auto Photography

## ✅ Blog Author Attribution
**Use:** Joe — Digital Marketing & Analytics

## ✅ Approved Categories (3 only)
1. Case Studies
2. Insights
3. Guides

## ✅ Approved Tags (13 only)
- case-study
- analytics
- conversion-optimisation
- seo
- google-ads
- ecommerce
- offline-marketing
- paid-ads
- content-strategy
- website-performance
- ebay
- small-business
- local-marketing

## 📝 Blog Metadata Format

### Title
Format: `<Outcome or Insight> | Case Study`

Example: `How I Made £13.5K with a 2,380% ROI | Case Study`

### Description
- Length: 140-160 characters
- Format: Method + Outcome
- Example: "Discover how a single flyer and a camera turned into high-paying freelance gigs, even in the age of Google Ads. Real results from £546 in print costs."

### Open Graph Title
- Benefit-led, not brand-led
- Example: `How I Made £13.5K with a 2,380% ROI | Mobile-First Vivid Media Cheshire`

## 🔧 Validation Commands

```bash
# Run full QA validation
node scripts/validate-metadata-brand-qa.js

# Check for legacy brand references
grep -r "Vivid Auto Photography" src/

# Update metadata (if needed)
node scripts/update-metadata-tags-brand.js

# Fix invalid tags
node scripts/fix-invalid-tags.js
```

## 📊 Current Status

- ✅ Brand references: 0 legacy found
- ✅ Author attribution: 100% correct
- ✅ Categories: 100% approved
- ✅ Tags: 100% approved
- ✅ Metadata: Consistent across all posts

## 🚫 Common Mistakes to Avoid

1. **Don't** use "Vivid Auto Photography"
2. **Don't** create new tags — use approved list only
3. **Don't** use categories outside the approved 3
4. **Don't** forget author attribution on new posts
5. **Don't** use brand-led Open Graph titles

## ✨ Best Practices

1. **Always** use "Vivid Media Cheshire" for brand
2. **Always** include author: "Joe — Digital Marketing & Analytics"
3. **Always** choose from approved categories
4. **Always** use existing tags (reuse > create new)
5. **Always** make Open Graph titles benefit-led
6. **Always** keep descriptions 140-160 chars

## 📁 Key Files

- `src/config/canonical.ts` — Site-wide brand config (single source of truth)
- `src/content/blog/*.ts` — Blog post metadata
- `scripts/validate-metadata-brand-qa.js` — QA validation
- `scripts/update-metadata-tags-brand.js` — Bulk updates
- `scripts/fix-invalid-tags.js` — Tag cleanup

---

**Last Updated:** December 17, 2025  
**Status:** All checks passing ✅
