# Design Document

## Overview

This design implements a comprehensive update to the Vivid Media Cheshire website focusing on three key areas:

1. **Clean Press Logos**: Update the PressLogos component to remove CSS filters and display SVG logos cleanly with only opacity hover effects
2. **Centered Services Layout**: Modify the home page services section to use a centered grid layout on desktop
3. **Pricing Visibility**: Add pricing information blocks to all service pages and a pricing teaser on the home page

The design also includes critical deployment safety measures to prevent chunk mismatch errors that have occurred in production.

## Architecture

### Component Structure

```
src/
├── components/
│   └── PressLogos.tsx          # Updated: clean SVGs without filters
├── app/
│   ├── page.tsx                # Updated: centered services + pricing teaser
│   ├── pricing/
│   │   └── page.tsx           # Existing: full pricing page
│   └── services/
│       ├── photography/
│       │   └── page.tsx       # Updated: pricing block + clean press logos
│       ├── hosting/
│       │   └── page.tsx       # Updated: pricing block
│       ├── ad-campaigns/
│       │   └── page.tsx       # Updated: pricing block
│       ├── analytics/
│       │   └── page.tsx       # Updated: pricing block
│       └── page.tsx           # Services index (if exists)
└── components/
    └── layout/
        ├── Header.tsx          # Updated: add pricing nav link
        └── Footer.tsx          # Updated: add pricing footer link
```

### Deployment Architecture

```
Local Development
      ↓
npm run build (complete static export)
      ↓
Full Sync to S3 (including _next/static/**)
      ↓
CloudFront Invalidation (/index.html, /_next/static/*)
      ↓
Production (no chunk errors)
```

## Components and Interfaces

### 1. PressLogos Component (Updated)

**File**: `src/components/PressLogos.tsx`

**Current Implementation** (with filters):
```typescript
className="
  opacity-80 group-hover:opacity-100 transition-all duration-300
  group-hover:brightness-0 group-hover:invert-[35%] group-hover:sepia
  group-hover:saturate-[2000%] group-hover:hue-rotate-[310deg] group-hover:brightness-[1.1]
"
```

**New Implementation** (clean, no filters):
```typescript
export function PressLogos({ className = "" }: PressLogosProps) {
  return (
    <div
      className={`flex flex-wrap justify-center items-center gap-6 mt-4 text-gray-800 ${className}`}
    >
      {pressLogos.map((logo) => (
        <Image
          key={logo.src}
          src={logo.src}
          alt={`${logo.alt} logo`}
          width={110}
          height={32}
          className="h-8 w-auto opacity-80 hover:opacity-100 transition-opacity"
        />
      ))}
    </div>
  );
}
```

**Changes**:
- Remove all CSS filter classes
- Keep only `opacity-80 hover:opacity-100 transition-opacity`
- Use `h-8 w-auto` to maintain aspect ratio (prevents warping)
- Remove `group` wrapper (no longer needed)

### 2. Home Page Services Section (Updated)

**File**: `src/app/page.tsx`

**Current Grid**:
```tsx
<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
```

**New Grid** (centered, 3 columns):
```tsx
<section className="py-16 bg-gray-50">
  <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
    <h2 className="text-3xl font-bold text-gray-900 mb-12">
      My Services
    </h2>
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 justify-items-center">
      {/* service cards */}
    </div>
  </div>
</section>
```

**Service Card Structure**:
```tsx
<div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 max-w-sm text-left hover:shadow-md transition-shadow">
  <h3 className="text-xl font-semibold mb-3">Service name</h3>
  <p className="text-gray-600 mb-4">
    Short description of the service...
  </p>
  <Link
    href="/services/..."
    className="text-pink-600 hover:text-pink-700 font-medium"
  >
    Learn more →
  </Link>
</div>
```

**Layout Behavior**:
- Desktop (≥1024px): 3 cards per row, centered
- Tablet (≥640px): 2 cards per row
- Mobile (<640px): 1 card per row

### 3. Home Page Pricing Teaser (New)

**File**: `src/app/page.tsx`

**Placement**: After services section, before final CTA

**Implementation**:
```tsx
<section className="py-12 bg-gray-50">
  <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
      Simple, transparent pricing
    </h2>
    <p className="text-lg text-gray-600 mb-6">
      Websites from £300, hosting from £15 per month, Google Ads management from £150 per month,
      and event photography from £200 per day.
    </p>
    <Link
      href="/pricing"
      className="inline-flex items-center bg-pink-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-pink-700 transition-colors"
    >
      View full pricing
    </Link>
  </div>
</section>
```

### 4. Service Page Pricing Blocks (New)

**Shared Styling Pattern**:
```tsx
<section className="mb-16">
  <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
    <h2 className="text-2xl font-bold text-gray-900 mb-3">
      [Service] pricing
    </h2>
    <p className="text-gray-700 mb-1">
      <strong>[Service item]:</strong> [price]
    </p>
    {/* Additional pricing items */}
    <p className="text-sm text-gray-500 mt-3">
      Full details are available on the{" "}
      <Link href="/pricing" className="text-pink-600 hover:text-pink-700 underline">
        pricing page
      </Link>.
    </p>
  </div>
</section>
```

#### 4.1 Hosting Page Pricing

**File**: `src/app/services/hosting/page.tsx`

**Content**:
- Website hosting: £15 per month or £120 per year
- Migration: free tailored quote based on your current setup
- Link to /pricing

#### 4.2 Photography Page Pricing

**File**: `src/app/services/photography/page.tsx`

**Content**:
- Event photography: from £200 per day
- Travel: £0.45 per mile
- Link to /pricing

**Styling**: Use `bg-slate-50 border border-slate-200` to match page theme

#### 4.3 Ads/Campaigns Page Pricing

**File**: `src/app/services/ad-campaigns/page.tsx`

**Content**:
- Ads setup: £20 one time
- Ads management: from £150/month
- Link to /pricing

#### 4.4 Analytics Page Pricing

**File**: `src/app/services/analytics/page.tsx`

**Content**:
- GA4 setup: £75 one time
- Dashboard: from £80 one time
- Monthly analytics: from £40/month
- Link to /pricing

#### 4.5 Social/SEO Page Pricing

**File**: `src/app/services/[social-seo-page].tsx` (if exists)

**Content**:
- Social + Maps: from £250/month
- GBP setup: £75 one time
- SEO add-ons: Maps Boost £50, SEO Tune-Up £100, Monthly monitoring £50/month
- Link to /pricing

### 5. Navigation Updates

#### 5.1 Header Navigation

**File**: `src/components/layout/Header.tsx`

**Add Pricing Link**:
```tsx
<Link
  href="/pricing"
  className="text-gray-700 hover:text-pink-600 transition-colors"
>
  Pricing
</Link>
```

#### 5.2 Footer Navigation

**File**: `src/components/layout/Footer.tsx`

**Add to Quick Links**:
```tsx
<Link
  href="/pricing"
  className="text-gray-400 hover:text-white transition-colors"
>
  Pricing
</Link>
```

## Data Models

### Pricing Information

```typescript
interface ServicePricing {
  service: string;
  items: PricingItem[];
  linkText?: string;
}

interface PricingItem {
  name: string;
  price: string;
  description?: string;
}

// Example usage
const hostingPricing: ServicePricing = {
  service: "Hosting",
  items: [
    {
      name: "Website hosting",
      price: "£15 per month or £120 per year",
    },
    {
      name: "Migration",
      price: "free tailored quote",
      description: "based on your current setup",
    },
  ],
  linkText: "Full details are available on the pricing page",
};
```

## Styling Design

### Color Palette

- **Primary Pink**: `#ff2d7a` (brand-pink)
- **Hover Pink**: `#e6296d` (brand-pink2)
- **Gray Backgrounds**: `#f9fafb` (gray-50)
- **Slate Backgrounds**: `#f8fafc` (slate-50)
- **Borders**: `#e5e7eb` (gray-200), `#e2e8f0` (slate-200)
- **Text**: `#111827` (gray-900), `#4b5563` (gray-600)

### Typography

- **Headings**: Font-bold, responsive sizing
  - H1: `text-4xl md:text-5xl lg:text-6xl`
  - H2: `text-3xl md:text-4xl`
  - H3: `text-2xl`
- **Body**: `text-lg` or `text-base`
- **Small**: `text-sm`

### Spacing

- **Section Padding**: `py-12` or `py-16`
- **Card Padding**: `p-6`
- **Gap Between Items**: `gap-6` or `gap-8`
- **Max Width Containers**: `max-w-3xl`, `max-w-5xl`, `max-w-6xl`, `max-w-7xl`

### Responsive Breakpoints

| Breakpoint | Tailwind | Behavior |
|------------|----------|----------|
| Mobile | Default | 1 column, full width |
| Small | `sm:` (640px+) | 2 columns for services |
| Large | `lg:` (1024px+) | 3 columns for services |

## Deployment Strategy

### Critical: Preventing Chunk Mismatch Errors

**Problem**: Production has experienced "Unexpected token '<'" and "ChunkLoadError" due to incomplete deployments.

**Root Cause**: Partial sync of `_next/static/**` files causes Next.js to request chunks that don't exist or are outdated.

**Solution**: Full sync deployment process

#### Deployment Steps

1. **Build Locally**:
```bash
npm run build
```

2. **Sync Complete Export**:
```bash
aws s3 sync ./out s3://<BUCKET_NAME> --delete --acl public-read
```

**Critical Flags**:
- `--delete`: Remove outdated files
- Include ALL subdirectories, especially `_next/static/**`

3. **CloudFront Invalidation**:
```bash
aws cloudfront create-invalidation \
  --distribution-id <DIST_ID> \
  --paths "/index.html" "/_next/static/*"
```

**Critical Paths**:
- `/index.html`: Main page
- `/_next/static/*`: All static chunks

#### Deployment Script Template

```javascript
// scripts/deploy-safe.js
const { execSync } = require('child_process');

const BUCKET = process.env.S3_BUCKET_NAME;
const DIST_ID = process.env.CLOUDFRONT_DISTRIBUTION_ID;

console.log('🔨 Building static export...');
execSync('npm run build', { stdio: 'inherit' });

console.log('📦 Syncing to S3 (full sync with delete)...');
execSync(`aws s3 sync ./out s3://${BUCKET} --delete`, { stdio: 'inherit' });

console.log('🔄 Invalidating CloudFront cache...');
execSync(
  `aws cloudfront create-invalidation --distribution-id ${DIST_ID} --paths "/index.html" "/_next/static/*"`,
  { stdio: 'inherit' }
);

console.log('✅ Deployment complete!');
```

### Pre-Deployment Checklist

- [ ] Run `npm run build` successfully
- [ ] Verify `./out` directory contains all files
- [ ] Check `./out/_next/static/` has chunk files
- [ ] Confirm S3 bucket name and CloudFront distribution ID
- [ ] Test locally before deploying

### Post-Deployment Verification

1. **Check Console**: Open browser console, verify no chunk errors
2. **Test Navigation**: Click through all pages
3. **Verify Images**: Confirm all press logos load
4. **Check Pricing**: Verify pricing blocks display on all service pages
5. **Test Links**: Confirm all pricing links work

## Error Handling

### Missing Images

**Strategy**: All SVG logos already exist in `/public/images/press-logos/`

**Verification**:
```bash
ls -la public/images/press-logos/
```

**Expected Files**:
- autotrader-logo.svg
- bbc-logo.svg
- business-insider-logo.svg
- cnn-logo.svg
- daily-mail-logo.svg
- financial-times-logo.svg
- forbes-logo.svg

### Broken Links

**Prevention**:
- All pricing links use `/pricing` (existing page)
- All service links verified to exist

**Testing**:
```bash
# Check for broken links
grep -r "href=\"/pricing\"" src/
grep -r "href=\"/services/" src/
```

### Layout Issues

**Prevention**:
- Use consistent max-width containers
- Test at all breakpoints (375px, 768px, 1024px, 1440px)
- Verify no horizontal scroll

**Testing**:
```javascript
// Browser console
document.body.scrollWidth > window.innerWidth // Should be false
```

## Testing Strategy

### Unit Testing

**Component Tests**:
```typescript
// PressLogos.test.tsx
describe('PressLogos', () => {
  it('renders without CSS filters', () => {
    const { container } = render(<PressLogos />);
    const images = container.querySelectorAll('img');
    images.forEach(img => {
      expect(img.className).not.toContain('brightness');
      expect(img.className).not.toContain('hue-rotate');
      expect(img.className).toContain('opacity-80');
    });
  });

  it('maintains aspect ratio with h-8 w-auto', () => {
    const { container } = render(<PressLogos />);
    const images = container.querySelectorAll('img');
    images.forEach(img => {
      expect(img.className).toContain('h-8');
      expect(img.className).toContain('w-auto');
    });
  });
});
```

### Integration Testing

**Page Tests**:
```typescript
// home-page.spec.ts
describe('Home Page', () => {
  it('displays centered services grid', async () => {
    await page.goto('/');
    const grid = await page.locator('.grid.lg\\:grid-cols-3');
    expect(await grid.count()).toBe(1);
  });

  it('shows pricing teaser section', async () => {
    await page.goto('/');
    const teaser = await page.locator('text=Simple, transparent pricing');
    expect(await teaser.isVisible()).toBe(true);
  });

  it('has pricing link in navigation', async () => {
    await page.goto('/');
    const link = await page.locator('a[href="/pricing"]');
    expect(await link.count()).toBeGreaterThan(0);
  });
});
```

### Visual Regression Testing

**Screenshots**:
```typescript
// visual-regression.spec.ts
test('home page services section', async ({ page }) => {
  await page.goto('/');
  await page.locator('text=My Services').scrollIntoViewIfNeeded();
  await expect(page).toHaveScreenshot('services-section.png');
});

test('press logos without filters', async ({ page }) => {
  await page.goto('/');
  await page.locator('text=As featured in').scrollIntoViewIfNeeded();
  await expect(page).toHaveScreenshot('press-logos.png');
});
```

### Accessibility Testing

**Automated Tests**:
```typescript
// accessibility.spec.ts
test('pricing blocks are accessible', async ({ page }) => {
  await page.goto('/services/hosting');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test('press logos have proper alt text', async ({ page }) => {
  await page.goto('/');
  const logos = await page.locator('img[alt*="logo"]').all();
  for (const logo of logos) {
    const alt = await logo.getAttribute('alt');
    expect(alt).toBeTruthy();
    expect(alt.length).toBeGreaterThan(0);
  }
});
```

### Cross-Browser Testing

**Browsers**:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

**Test Cases**:
- Press logos display correctly (no filters)
- Services grid centers properly
- Pricing blocks render consistently
- Links work on all pages

## Performance Considerations

### Image Optimization

**SVG Logos**:
- Already optimized (2-5KB each)
- No additional processing needed
- Fast loading

**Next.js Image Component**:
- Automatic optimization
- Lazy loading by default
- Responsive sizing

### Layout Shift Prevention

**Strategy**:
- Fixed image dimensions: `width={110} height={32}`
- Consistent spacing with Tailwind classes
- No dynamic content loading

**Expected CLS**: 0 (no layout shift)

### Bundle Size Impact

**Changes**:
- Remove CSS filter classes: -200 bytes
- Add pricing blocks: +2KB (HTML)
- Update navigation: +100 bytes

**Total Impact**: Minimal (~2KB increase)

## Security Considerations

### Content Security Policy

**No Changes Required**:
- All content is static
- No new external resources
- Existing CSP headers sufficient

### XSS Prevention

**Strategy**:
- All content is hardcoded (no user input)
- Next.js Link component sanitizes URLs
- No dangerouslySetInnerHTML usage

## Maintenance and Extensibility

### Updating Pricing

**Process**:
1. Update pricing page: `src/app/pricing/page.tsx`
2. Update service page pricing blocks
3. Update home page pricing teaser
4. Deploy with full sync

**Centralization Opportunity** (future):
```typescript
// lib/pricing.ts
export const PRICING = {
  hosting: {
    monthly: 15,
    annual: 120,
  },
  photography: {
    daily: 200,
    travel: 0.45,
  },
  // ... other services
};
```

### Adding New Services

**Process**:
1. Create service page in `src/app/services/[service]/page.tsx`
2. Add pricing block using shared pattern
3. Add service card to home page
4. Update navigation if needed

## Design Decisions and Rationale

### Why Remove CSS Filters?

**Reasons**:
- **Clarity**: Logos are immediately recognizable without color distortion
- **Performance**: Fewer CSS calculations
- **Simplicity**: Easier to maintain
- **Brand Consistency**: Logos appear as intended by their owners

### Why Center Services Grid?

**Reasons**:
- **Visual Balance**: Centered layout looks more professional
- **Flexibility**: Works better with 3-5 services
- **Consistency**: Matches other centered sections on the site
- **Responsive**: Adapts naturally to different screen sizes

### Why Add Pricing Blocks?

**Reasons**:
- **Transparency**: Visitors can see costs before contacting
- **Conversion**: Clear pricing reduces friction
- **SEO**: Pricing content helps with search rankings
- **User Experience**: Saves time for both visitor and business

### Why Full Sync Deployment?

**Reasons**:
- **Reliability**: Prevents chunk mismatch errors
- **Consistency**: Ensures all files are in sync
- **Safety**: `--delete` flag removes outdated files
- **Best Practice**: Recommended by Next.js for static exports

## Rollback Plan

### If Issues Occur

1. **Identify Problem**: Check browser console for errors
2. **Revert Changes**: Use git to revert to previous commit
3. **Rebuild**: Run `npm run build`
4. **Redeploy**: Use full sync deployment process
5. **Verify**: Test in production

### Rollback Script

```bash
# Revert to previous commit
git revert HEAD

# Rebuild
npm run build

# Redeploy
node scripts/deploy-safe.js

# Verify
curl -I https://d15sc9fc739ev2.cloudfront.net/
```

## Implementation Order

1. **Update PressLogos Component** (remove filters)
2. **Update Home Page** (centered services + pricing teaser)
3. **Add Pricing Blocks** (all service pages)
4. **Update Navigation** (header + footer)
5. **Test Locally** (all pages, all breakpoints)
6. **Deploy** (full sync with invalidation)
7. **Verify** (production testing)

This order ensures:
- Component changes are tested first
- Page updates build on component changes
- Navigation updates are last (least risky)
- Deployment is final step after all testing
