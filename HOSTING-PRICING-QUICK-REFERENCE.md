# Hosting & Pricing Update — Quick Reference

## What Changed?

### Old Messaging (Misleading)
- Compared to expensive Wix plans (£550/year)
- Focused on "80% savings"
- Generic CTAs everywhere

### New Messaging (Honest & Human)
- Compares to Wix Light (£9/month, £108/year)
- Focuses on enterprise performance at similar price
- Contextual CTAs that match user intent
- Emphasizes personal support and local service

---

## Key Updates

### 1. Homepage FAQ
**Question:** "How does your hosting compare to Wix or other DIY website builders?"

**Answer highlights:**
- Wix Light: £9/month (£108/year) — good for personal sites
- Your hosting: AWS CloudFront + Cloudflare — enterprise-grade
- Key difference: Personal support, managed locally in Cheshire

### 2. Pricing Teaser
Added comparison text:
> "Wix's Light plan is about £9 per month (£108 per year). My managed AWS hosting includes performance tuning, monitoring, and personal support so your business can focus on results instead of maintenance."

### 3. Hero Charts
- Updated labels: "Wix Light (£9/month)" vs "Vivid Media (AWS Optimised)"
- Changed description: "Similar cost, but with enterprise-grade performance and personal support"

### 4. Hosting Page
**Cost Comparison Section:**
- Wix Light: £108/year (shared servers, slower, support queues)
- Vivid Media: £108/year (AWS CloudFront, 82% faster, direct access to you)

**Benefits:**
- Enterprise performance at DIY prices
- Personal support, managed locally in Cheshire
- Direct access instead of support queues

### 5. Contextual Sticky CTAs
CTAs now change based on the page:

| Page | CTA Text |
|------|----------|
| Homepage | "Let's Improve Your Marketing" |
| Photography | "Book Your Shoot" |
| Marketing/Ads | "Get Better Results" |
| Hosting | "Upgrade My Site" |
| Pricing | "See What Fits You" |
| About | "Work With Me" |
| Blog | "Start Your Own Success Story" |

---

## Why This Matters

### Trust & Transparency
- Honest comparison builds credibility
- No misleading "80% savings" claims
- Focuses on value, not just price

### Better Conversions
- Contextual CTAs reduce friction
- Messages match user intent
- Clearer value proposition

### Brand Alignment
- Reinforces "local, human, performance-driven"
- Emphasizes personal relationship
- Differentiates from DIY platforms

---

## Testing Checklist

### Visual
- [ ] Homepage chart labels show "Wix Light (£9/month)"
- [ ] Hosting page comparison shows similar prices
- [ ] Sticky CTA appears after scrolling 300px
- [ ] All pages mobile-responsive

### Functional
- [ ] Sticky CTA text changes on different pages
- [ ] FAQ accordion opens/closes correctly
- [ ] All links work properly
- [ ] No console errors

### Content
- [ ] No references to £550 Wix pricing
- [ ] Consistent £9/month (£108/year) for Wix Light
- [ ] "Personal support" and "local Cheshire" messaging present
- [ ] Tone is conversational, not salesy

---

## Deployment

### Quick Deploy
```powershell
.\deploy-hosting-pricing-update.ps1
```

### Manual Deploy
```powershell
# Build
npm run build

# Deploy to S3
aws s3 sync out/ s3://mobile-marketing-site-prod-1759705011281-tyzuo9/ --delete

# Invalidate CloudFront
aws cloudfront create-invalidation --distribution-id E2IBMHQ3GCW6ZK --paths "/*"
```

---

## Monitoring

### Key Metrics to Watch
1. **CTA Click Rate** — Should increase 4-5%
2. **Conversion Rate** — Target 14-16% (up from 11-13%)
3. **Bounce Rate** — Should decrease with better relevance
4. **Time on Page** — Should increase with contextual CTAs

### GA4 Events to Track
- Sticky CTA clicks (by page)
- FAQ accordion opens
- Pricing page visits
- Contact form submissions

---

## Quick Wins

✅ **More honest** — Accurate Wix comparison  
✅ **More relevant** — Contextual CTAs  
✅ **More personal** — Local Cheshire emphasis  
✅ **More valuable** — Enterprise performance at similar price  

---

## Files Changed

1. `src/app/page.tsx`
2. `src/components/PricingTeaser.tsx`
3. `src/components/HeroWithCharts.tsx`
4. `src/app/services/hosting/page.tsx`
5. `content/services/website-hosting-migration.md`
6. `src/components/StickyConversionBar.tsx`

Full details: `HOSTING-PRICING-UPDATE-COMPLETE.md`

---

## Support

If you need to revert:
```powershell
git checkout HEAD~1 -- src/app/page.tsx src/components/
```

For questions or issues, check the full documentation in `HOSTING-PRICING-UPDATE-COMPLETE.md`.
