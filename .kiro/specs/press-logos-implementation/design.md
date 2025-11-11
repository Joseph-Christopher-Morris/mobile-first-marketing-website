# Design Document

## Overview

This design implements a reusable Press Logos component that displays seven monochrome SVG press logos (BBC, Forbes, Financial Times, CNN, AutoTrader, Daily Mail, Business Insider) with consistent styling and hover animations. The component will be integrated into both the Home page (after the hero section) and the Photography page (within the hero text block), providing social proof and credibility across key pages.

The design follows Vivid Media Cheshire's existing brand patterns, using the brand-pink color (#ff2d7a) for hover effects and maintaining consistency with the site's Tailwind CSS utility classes.

## Architecture

### Component Structure

```
src/
├── components/
│   └── PressLogos.tsx          # Main reusable component
├── app/
│   ├── page.tsx                # Home page (integration point)
│   └── services/
│       └── photography/
│           └── page.tsx        # Photography page (integration point)
└── public/
    └── images/
        └── press-logos/        # SVG assets (already exist)
            ├── bbc-logo.svg
            ├── forbes-logo.svg
            ├── financial-times-logo.svg
            ├── cnn-logo.svg
            ├── autotrader-logo.svg
            ├── daily-mail-logo.svg
            └── business-insider-logo.svg
```

### Technology Stack

- **React**: Component framework
- **Next.js Image**: Optimized image loading
- **Tailwind CSS**: Utility-first styling
- **TypeScript**: Type safety

## Components and Interfaces

### PressLogos Component

**File**: `src/components/PressLogos.tsx`

**Purpose**: A reusable component that renders all seven press logos with consistent styling and hover animations.

**Interface**:

```typescript
export function PressLogos(): JSX.Element
```

**Props**: None (stateless component)

**Internal Data Structure**:

```typescript
interface PressLogo {
  src: string;      // Path to SVG file
  alt: string;      // Accessible alt text
}

const pressLogos: PressLogo[] = [
  { src: "/images/press-logos/bbc-logo.svg", alt: "BBC News" },
  { src: "/images/press-logos/forbes-logo.svg", alt: "Forbes" },
  { src: "/images/press-logos/financial-times-logo.svg", alt: "Financial Times" },
  { src: "/images/press-logos/cnn-logo.svg", alt: "CNN" },
  { src: "/images/press-logos/autotrader-logo.svg", alt: "AutoTrader" },
  { src: "/images/press-logos/daily-mail-logo.svg", alt: "Daily Mail" },
  { src: "/images/press-logos/business-insider-logo.svg", alt: "Business Insider" }
];
```

**Component Structure**:

```tsx
export function PressLogos() {
  return (
    <div className="flex flex-wrap justify-center items-center gap-6 mt-4 text-gray-800">
      {pressLogos.map((logo) => (
        <div
          key={logo.src}
          className="group transition-transform duration-300 hover:scale-105"
          aria-label={`${logo.alt} feature logo`}
        >
          <Image
            src={logo.src}
            alt={`${logo.alt} logo`}
            width={110}
            height={32}
            className="
              opacity-80 group-hover:opacity-100 transition-all duration-300
              group-hover:brightness-0 group-hover:invert-[35%] group-hover:sepia
              group-hover:saturate-[2000%] group-hover:hue-rotate-[310deg] group-hover:brightness-[1.1]
            "
          />
        </div>
      ))}
    </div>
  );
}
```

### Home Page Integration

**File**: `src/app/page.tsx`

**Integration Point**: Immediately after the `<HeroWithCharts />` component

**Implementation**:

```tsx
import { PressLogos } from "@/components/PressLogos";

// Inside HomePage component, after HeroWithCharts:
<HeroWithCharts
  heroSrc="/images/hero/230422_Chester_Stock_Photography-84.webp"
  wixAnnual={550}
  awsAnnual={108.4}
  breakdown={{ aws: 60, cloudflare: 10, zoho: 38.4 }}
  lcpSeries={[14.2, 7.8, 2.3, 1.8]}
/>

{/* Press Logos Section */}
<section className="bg-white py-10">
  <div className="max-w-6xl mx-auto text-center px-4 sm:px-6 lg:px-8">
    <p className="text-sm uppercase tracking-wide text-gray-500 mb-3">
      As featured in:
    </p>
    <PressLogos />
  </div>
</section>

{/* Services Section continues... */}
```

### Photography Page Integration

**File**: `src/app/services/photography/page.tsx`

**Integration Point**: Inside the hero text block, replacing the existing text line

**Current Code** (lines ~147-150):
```tsx
<p className="text-xl md:text-2xl text-brand-grey mb-8 leading-relaxed">
  Published editorial photographer with work featured in BBC, Forbes, and The Times.
  Specializing in local Nantwich photography and commercial campaigns.
</p>
```

**Updated Code**:
```tsx
import { PressLogos } from "@/components/PressLogos";

// Inside hero section:
<p className="text-xl md:text-2xl text-brand-grey mb-8 leading-relaxed">
  Published editorial photographer with work featured in major publications.
  Specializing in local Nantwich photography and commercial campaigns.
</p>

<div className="mb-5">
  <p className="text-sm uppercase tracking-wide text-brand-grey/70 mb-2">
    As featured in:
  </p>
  <PressLogos />
</div>

{/* CTA buttons continue... */}
```

## Data Models

### Logo Configuration

```typescript
interface PressLogo {
  src: string;      // Relative path from /public/
  alt: string;      // Descriptive text for screen readers
}
```

**Logo Array**:
```typescript
const pressLogos: PressLogo[] = [
  { src: "/images/press-logos/bbc-logo.svg", alt: "BBC News" },
  { src: "/images/press-logos/forbes-logo.svg", alt: "Forbes" },
  { src: "/images/press-logos/financial-times-logo.svg", alt: "Financial Times" },
  { src: "/images/press-logos/cnn-logo.svg", alt: "CNN" },
  { src: "/images/press-logos/autotrader-logo.svg", alt: "AutoTrader" },
  { src: "/images/press-logos/daily-mail-logo.svg", alt: "Daily Mail" },
  { src: "/images/press-logos/business-insider-logo.svg", alt: "Business Insider" }
];
```

## Styling Design

### CSS Classes and Tailwind Utilities

**Container**:
- `flex flex-wrap justify-center items-center gap-6 mt-4 text-gray-800`
  - Flexbox layout with wrapping
  - Center alignment
  - 24px gap between items
  - 16px top margin
  - Gray text color base

**Logo Wrapper**:
- `group transition-transform duration-300 hover:scale-105`
  - Group for child hover effects
  - Transform transition
  - 300ms duration
  - 5% scale increase on hover

**Image Styling**:
- Base state: `opacity-80`
- Hover state: `group-hover:opacity-100`
- Transition: `transition-all duration-300`
- Brand-pink tint filters (on hover):
  - `group-hover:brightness-0` - Convert to black
  - `group-hover:invert-[35%]` - Invert to gray
  - `group-hover:sepia` - Add sepia tone
  - `group-hover:saturate-[2000%]` - Increase saturation
  - `group-hover:hue-rotate-[310deg]` - Rotate to pink
  - `group-hover:brightness-[1.1]` - Brighten slightly

### Responsive Breakpoints

| Breakpoint | Behavior | Tailwind Classes |
|------------|----------|------------------|
| Mobile (≤640px) | Logos wrap onto multiple rows with 24px gap | `flex-wrap gap-6` |
| Tablet (≥768px) | Logos align in single row when possible | `flex-wrap` allows natural flow |
| Desktop (≥1024px) | Centered layout with balanced spacing | `justify-center` |

### Color Scheme

- **Default state**: Monochrome with 80% opacity
- **Hover state**: 100% opacity with brand-pink tint (#ff2d7a)
- **Text labels**: Gray-500 (#6b7280) for "As featured in:"
- **Photography page text**: brand-grey/70 (70% opacity of brand-grey)

## Error Handling

### Missing Images

**Strategy**: Graceful degradation with Next.js Image component

```typescript
// Next.js Image component handles:
// - 404 errors (shows broken image icon)
// - Loading states (shows placeholder)
// - Failed loads (shows alt text)
```

**Fallback Behavior**:
- If SVG fails to load, alt text is displayed
- No JavaScript errors thrown
- Layout remains intact

### Invalid Paths

**Prevention**:
- All paths are hardcoded and verified
- Paths are relative to `/public/` directory
- No dynamic path generation

**Detection**:
- Browser console will show 404 errors
- Visual inspection during QA

### Browser Compatibility

**CSS Filter Support**:
- Modern browsers: Full support for CSS filters
- Legacy browsers: Graceful degradation (no hover effect)
- No JavaScript required for core functionality

**Fallback Strategy**:
```css
/* If filters not supported, simple opacity change still works */
.logo-image {
  opacity: 0.8;
  transition: opacity 300ms;
}

.logo-image:hover {
  opacity: 1.0;
}
```

## Testing Strategy

### Unit Testing

**Component Tests**:
```typescript
// Test file: src/components/__tests__/PressLogos.test.tsx

describe('PressLogos', () => {
  it('renders all seven logos', () => {
    // Verify 7 Image components rendered
  });

  it('includes proper alt text for each logo', () => {
    // Verify accessibility attributes
  });

  it('applies correct image dimensions', () => {
    // Verify width={110} height={32}
  });

  it('includes aria-labels on containers', () => {
    // Verify ARIA attributes
  });
});
```

### Integration Testing

**Home Page Tests**:
```typescript
// Test file: e2e/home-press-logos.spec.ts

describe('Home Page Press Logos', () => {
  it('displays press logos after hero section', () => {
    // Verify section placement
  });

  it('shows "As featured in:" text', () => {
    // Verify label text
  });

  it('centers logos within max-width container', () => {
    // Verify layout
  });
});
```

**Photography Page Tests**:
```typescript
// Test file: e2e/photography-press-logos.spec.ts

describe('Photography Page Press Logos', () => {
  it('displays press logos in hero section', () => {
    // Verify placement within hero
  });

  it('maintains hero layout integrity', () => {
    // Verify no layout disruption
  });
});
```

### Visual Regression Testing

**Approach**:
- Capture screenshots at key breakpoints (375px, 768px, 1024px, 1440px)
- Compare before/after implementation
- Verify hover states

**Tools**:
- Playwright for automated screenshots
- Manual visual inspection

### Accessibility Testing

**Automated Tests**:
```typescript
// Using @axe-core/playwright

describe('Press Logos Accessibility', () => {
  it('passes axe accessibility scan', async () => {
    // Run axe scan on component
  });

  it('supports keyboard navigation', async () => {
    // Test tab navigation
  });

  it('provides proper ARIA labels', async () => {
    // Verify ARIA attributes
  });
});
```

**Manual Tests**:
- Screen reader testing (NVDA, JAWS, VoiceOver)
- Keyboard-only navigation
- Color contrast verification

### Performance Testing

**Metrics to Verify**:
- Lighthouse Performance score ≥ 95
- No layout shift (CLS = 0)
- Fast image loading (LCP impact minimal)
- No render-blocking resources

**Test Approach**:
```bash
# Run Lighthouse CI
npm run lighthouse:ci

# Verify metrics
- Performance: ≥ 95
- Accessibility: ≥ 95
- Best Practices: ≥ 95
- SEO: ≥ 95
```

### Cross-Browser Testing

**Browsers to Test**:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile Safari (iOS)
- Chrome Mobile (Android)

**Test Cases**:
- Logo rendering
- Hover effects
- Responsive layout
- Image loading

### Post-Deployment Verification

**Checklist**:
1. ✅ Logos load on `/` route
2. ✅ Logos load on `/services/photography` route
3. ✅ All image paths return 200 OK
4. ✅ Hover effects work on desktop
5. ✅ Touch interactions work on mobile
6. ✅ No 404 errors in console
7. ✅ No layout shift during load
8. ✅ Lighthouse scores meet targets

**Verification Script**:
```javascript
// scripts/verify-press-logos.js

const urls = [
  'https://d15sc9fc739ev2.cloudfront.net/',
  'https://d15sc9fc739ev2.cloudfront.net/services/photography'
];

const logoUrls = [
  '/images/press-logos/bbc-logo.svg',
  '/images/press-logos/forbes-logo.svg',
  '/images/press-logos/financial-times-logo.svg',
  '/images/press-logos/cnn-logo.svg',
  '/images/press-logos/autotrader-logo.svg',
  '/images/press-logos/daily-mail-logo.svg',
  '/images/press-logos/business-insider-logo.svg'
];

// Verify each logo loads with 200 status
// Verify component renders on both pages
// Generate verification report
```

## Performance Considerations

### Image Optimization

**Next.js Image Component Benefits**:
- Automatic WebP conversion (if browser supports)
- Lazy loading by default
- Responsive image sizing
- Optimized caching headers

**SVG Handling**:
- SVGs served directly (no conversion needed)
- Small file sizes (~2-5KB each)
- Scalable without quality loss
- Fast loading

### Layout Shift Prevention

**Strategy**:
- Fixed dimensions: `width={110} height={32}`
- Container uses flexbox with defined gaps
- No dynamic content loading
- Images load from static `/public/` directory

**Expected CLS**: 0 (no layout shift)

### Bundle Size Impact

**Component Size**:
- PressLogos.tsx: ~1KB (minified)
- No additional dependencies
- Uses existing Next.js Image component
- Minimal CSS (Tailwind utilities)

**Total Impact**: < 2KB JavaScript + ~20KB images (7 SVGs)

### Caching Strategy

**CloudFront Configuration**:
- SVG files: Cache for 1 year (immutable)
- Component code: Cache with versioning
- Cache invalidation on deployment

**Headers**:
```
Cache-Control: public, max-age=31536000, immutable
```

## Security Considerations

### XSS Prevention

**Strategy**:
- All content is static (no user input)
- SVG files are trusted assets
- Next.js Image component sanitizes paths
- No dangerouslySetInnerHTML usage

### Content Security Policy

**Requirements**:
- Allow images from same origin
- No external image sources
- No inline styles (Tailwind classes only)

**CSP Headers** (already configured):
```
img-src 'self' data:;
style-src 'self' 'unsafe-inline';
```

### Asset Integrity

**Verification**:
- SVG files stored in version control
- No external CDN dependencies
- Files served from trusted S3 bucket
- CloudFront OAC ensures secure access

## Deployment Strategy

### Build Process

1. **Component Creation**: Create `src/components/PressLogos.tsx`
2. **Home Page Update**: Add import and section to `src/app/page.tsx`
3. **Photography Page Update**: Add import and section to `src/app/services/photography/page.tsx`
4. **Build**: Run `npm run build` to generate static export
5. **Verify**: Check build output for errors

### Deployment Steps

1. **Local Testing**: Test on `localhost:3000`
2. **Build Verification**: Ensure clean build with no errors
3. **Deploy to S3**: Upload build artifacts to S3 bucket
4. **CloudFront Invalidation**: Invalidate affected paths
5. **Verification**: Test on production URL

### Rollback Plan

**If Issues Occur**:
1. Identify the problem (console errors, visual issues, etc.)
2. Revert changes to affected files
3. Rebuild and redeploy
4. Invalidate CloudFront cache

**Rollback Script**:
```bash
# Revert to previous version
git revert <commit-hash>

# Rebuild
npm run build

# Redeploy
node scripts/deploy.js
```

## Maintenance and Extensibility

### Adding New Logos

**Process**:
1. Add SVG file to `/public/images/press-logos/`
2. Update `pressLogos` array in `PressLogos.tsx`
3. Test locally
4. Deploy

**Example**:
```typescript
const pressLogos = [
  // ... existing logos
  { src: "/images/press-logos/new-publication-logo.svg", alt: "New Publication" }
];
```

### Updating Styles

**Hover Effect Customization**:
```typescript
// Adjust filter values in className:
className="
  opacity-80 group-hover:opacity-100 transition-all duration-300
  group-hover:brightness-0 group-hover:invert-[35%] group-hover:sepia
  group-hover:saturate-[2000%] group-hover:hue-rotate-[310deg] group-hover:brightness-[1.1]
"

// To change hover color, adjust hue-rotate value:
// 310deg = pink
// 0deg = red
// 120deg = green
// 240deg = blue
```

### Reusing Component

**Usage in Other Pages**:
```tsx
import { PressLogos } from "@/components/PressLogos";

// In any page component:
<section>
  <h2>Our Press Coverage</h2>
  <PressLogos />
</section>
```

## Design Decisions and Rationale

### Why SVG Format?

- **Scalability**: Crisp at any size
- **Small file size**: 2-5KB per logo
- **Easy styling**: Can apply CSS filters
- **Accessibility**: Can include title/desc elements

### Why CSS Filters for Hover Effect?

- **No additional assets**: Single SVG file per logo
- **Smooth transitions**: CSS handles animation
- **Brand consistency**: Matches brand-pink color
- **Performance**: GPU-accelerated transforms

### Why Flexbox Layout?

- **Responsive**: Automatically wraps on small screens
- **Centered**: Easy alignment with justify-center
- **Flexible**: Adapts to different logo counts
- **Browser support**: Excellent compatibility

### Why Next.js Image Component?

- **Optimization**: Automatic format conversion
- **Lazy loading**: Improves initial page load
- **Responsive**: Serves appropriate sizes
- **Built-in**: No additional dependencies

### Why Separate Component?

- **Reusability**: Use on multiple pages
- **Maintainability**: Single source of truth
- **Testability**: Isolated unit tests
- **Consistency**: Same styling everywhere
