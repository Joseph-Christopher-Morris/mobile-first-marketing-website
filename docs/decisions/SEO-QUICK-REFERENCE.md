# SEO Quick Reference Guide

## Adding New Pages

Always use the `buildMetadata()` helper:

```typescript
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: "Your Page Title",
  description: "Your description (120-155 chars)",
  path: "/your-page/",
  imagePath: "/images/og-image.webp", // optional
  noindex: false, // optional
});
```

## Common Patterns

### Service Page
```typescript
export const metadata = buildMetadata({
  title: "Service Name",
  description: "What this service does and who it's for (120-155 chars)",
  path: "/services/service-name/",
  imagePath: "/images/services/service-hero.webp",
});
```

### Blog Post
```typescript
export const metadata = buildMetadata({
  title: "Blog Post Title",
  description: "Brief summary of the post content (120-155 chars)",
  path: "/blog/post-slug/",
  imagePath: "/images/blog/post-image.webp",
});
```

### Utility Page (No Index)
```typescript
export const metadata = buildMetadata({
  title: "Thank You",
  description: "Confirmation message",
  path: "/thank-you/",
  noindex: true,  // Don't index utility pages
});
```

## Validation Commands

### Check Titles (No Duplication)
```bash
grep -o '<title>.*</title>' out/your-page/index.html
```

### Check Canonical URLs
```bash
grep 'rel="canonical"' out/your-page/index.html
```

### Check Robots Directive
```bash
grep 'name="robots"' out/your-page/index.html
```

### Check OG Metadata
```bash
grep 'property="og:' out/your-page/index.html
```

## Deployment

### Full Deployment (with build)
```bash
export S3_BUCKET_NAME="mobile-marketing-site-prod-1759705011281-tyzuo9"
export CLOUDFRONT_DISTRIBUTION_ID="E2IBMHQ3GCW6ZK"
export AWS_REGION="us-east-1"
node scripts/deploy.js
```

### Quick Deployment (skip build)
```bash
# After running npm run build
node scripts/deploy-skip-build.js
```

## Best Practices

### Title Guidelines
- Keep under 60 characters
- Don't include brand (helper adds it)
- Be descriptive and unique
- Include primary keyword

### Description Guidelines
- 120-155 characters optimal
- Include call-to-action
- Mention location (Cheshire)
- Be compelling for clicks

### Path Guidelines
- Always use trailing slash: `/page/`
- Use lowercase
- Use hyphens, not underscores
- Keep short and descriptive

### Image Guidelines
- Use absolute paths: `/images/file.webp`
- Optimize for 1200x630px (OG standard)
- Use WebP format
- Keep under 200KB

## Common Mistakes to Avoid

❌ **Don't manually add brand to title**
```typescript
title: "Page Title | Vivid Media Cheshire"  // Wrong!
```

✅ **Let helper add brand**
```typescript
title: "Page Title"  // Correct!
```

❌ **Don't forget trailing slash**
```typescript
path: "/services"  // Wrong!
```

✅ **Always include trailing slash**
```typescript
path: "/services/"  // Correct!
```

❌ **Don't use relative image paths**
```typescript
imagePath: "images/hero.webp"  // Wrong!
```

✅ **Use absolute paths**
```typescript
imagePath: "/images/hero.webp"  // Correct!
```

## Troubleshooting

### Title Appears Twice
- Check if you're using `buildMetadata()`
- Verify you're not manually adding brand
- Ensure helper returns `absolute` title

### Canonical URL Missing Trailing Slash
- Check path parameter includes `/`
- Verify Next.js config has `trailingSlash: true`

### OG Image Not Showing
- Verify image path is absolute
- Check image exists in `public/` directory
- Ensure image is under 8MB

### Page Getting Indexed When It Shouldn't
- Set `noindex: true` in metadata
- Check robots meta tag in HTML
- Verify in Google Search Console

## Post-Deployment Checks

After deploying, verify:

1. **Titles** - No duplication, under 60 chars
2. **Descriptions** - 120-155 chars, compelling
3. **Canonical URLs** - Correct domain, trailing slash
4. **OG Metadata** - Images load, URLs correct
5. **Robots** - Utility pages noindexed
6. **Images** - All load correctly
7. **Links** - No 404s

## Resources

- SEO Helper: `src/lib/seo.ts`
- Deployment Script: `scripts/deploy-skip-build.js`
- Full Documentation: `LEVEL-2-KIRO-SEO-PATCH-COMPLETE-FEB-21-2026.md`
- Security Standards: `.kiro/steering/aws-security-standards.md`
