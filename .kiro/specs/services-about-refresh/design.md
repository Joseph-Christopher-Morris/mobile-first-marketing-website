# Design Document

## Overview

This design implements a comprehensive refresh of the Services ecosystem and About page following the SCRAM methodology. The solution maintains the existing S3 + CloudFront architecture while delivering enhanced content presentation, visual proof elements, and mobile-first responsive design.

## Architecture

### Page Structure
```
/services (main hub)
├── /services/website-hosting-migration
├── /services/photography  
├── /services/data-analytics
└── /services/strategic-ad-campaigns

/about (standalone)
```

### Asset Management
- **Source**: `public/images/services/` and `public/images/about/`
- **Build**: Next.js static export includes assets in `out/` directory
- **Deployment**: Assets uploaded to S3 with proper MIME types
- **Delivery**: CloudFront serves assets with appropriate caching headers

### Infrastructure Constraints
- **S3 Bucket**: `mobile-marketing-site-prod-1759705011281-tyzuo9` (private)
- **CloudFront**: `E2IBMHQ3GCW6ZK` (public access via OAC only)
- **Region**: `us-east-1`
- **Security**: No public S3 access, CloudFront-only delivery

## Components and Interfaces

### 1. Services Hub Page (`/services`)

**Layout Structure:**
```tsx
<PageLayout>
  <HeroSection>
    <h1>Website Design, Development & Digital Marketing in Nantwich and Cheshire</h1>
    <IntroText />
  </HeroSection>
  
  <ServicesGrid>
    <ServiceCard service="hosting" />
    <ServiceCard service="photography" />
    <ServiceCard service="analytics" />
    <ServiceCard service="campaigns" />
  </ServicesGrid>
  
  <CTASection href="/contact" />
</PageLayout>
```

**ServiceCard Component:**
```tsx
interface ServiceCardProps {
  title: string;
  description: string;
  href: string;
  thumbnail: string;
  alt: string;
}
```

**Responsive Grid:**
- Mobile: `grid-cols-1`
- Tablet: `grid-cols-2` 
- Desktop: `grid-cols-2` (2x2 layout)

### 2. Website Hosting Migration Page

**Key Visual Elements:**
- **Savings Proof**: Pink cloud image (`hosting-migration-card.png`)
- **Performance Proof**: PageSpeed screenshot (`Screenshot 2025-10-21 134238.png`)

**Layout Pattern:**
```tsx
<HeroSection>
  <ContentColumn>
    <h1>Website Hosting & Migration</h1>
    <ServiceDescription />
  </ContentColumn>
  <ProofColumn>
    <SavingsImage />
  </ProofColumn>
</HeroSection>

<ProofSection>
  <PageSpeedScreenshot />
</ProofSection>
```

**File Handling Strategy:**
- Rename files with spaces locally before build
- Update import paths to use kebab-case names
- Maintain original files in public directory structure

### 3. Photography Page

**Gallery Component Design:**
```tsx
interface PhotographyImage {
  src: string;
  alt: string;
  type: 'local' | 'clipping' | 'editorial';
  caption?: string;
}

const PhotographyGallery: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {images.map((image, index) => (
        <GalleryCard key={index} image={image} />
      ))}
    </div>
  );
};
```

**Image Categories:**
- **Local Work**: Nantwich market photography (`240427-_Nantwich_Stock_Photography-*.jpg`)
- **Editorial Proof**: Published screenshots (`WhatsApp Image 2025-10-31 at 10.20.09 AM.png`)
- **Campaign Work**: Various client photography samples

**Responsive Behavior:**
- Mobile: Single column, full-width cards
- Tablet: Two columns with consistent aspect ratios
- Desktop: Three columns with hover effects

### 4. Data Analytics Page

**Content Structure:**
```tsx
<ServiceHero>
  <h1>Data Analytics & Insights</h1>
  <ExpertiseStatement />
</ServiceHero>

<ResultsSection>
  <ResultsList>
    <ResultItem>55% increase in page views</ResultItem>
    <ResultItem>189% boost in engagement</ResultItem>
    {/* Additional results */}
  </ResultsList>
</ResultsSection>

<OptionalDashboard>
  {dashboardImage && <DashboardScreenshot />}
</OptionalDashboard>
```

### 5. Strategic Ad Campaigns Page

**Outcome Cards Design:**
```tsx
const OutcomeCard: React.FC<{metric: string, value: string, description: string}> = ({
  metric, value, description
}) => (
  <div className="bg-white rounded-lg border p-6">
    <div className="text-2xl font-bold text-pink-600">{value}</div>
    <div className="text-lg font-semibold">{metric}</div>
    <div className="text-gray-600">{description}</div>
  </div>
);
```

**Key Metrics Display:**
- ROI Achievement
- Revenue Generated (£13.5k from £546)
- Conversion Rate (85% CR)
- Lead Generation (4 NYCC leads)

### 6. About Page

**Layout Design:**
```tsx
<AboutHero>
  <ContentColumn>
    <h1>About Joe</h1>
    <PersonalStatement />
    <CurationLine />
  </ContentColumn>
  <PortraitColumn>
    <ProfessionalPortrait />
  </PortraitColumn>
</AboutHero>

<WorkContextSection>
  <WorkImage src="car-shoot" />
  <WorkImage src="desk-work" />
  <WorkImage src="collaboration" />
</WorkContextSection>
```

**Image Strategy:**
- **Primary Portrait**: High-quality professional headshot
- **Context Images**: Work environment and collaboration shots
- **Alt Text**: Descriptive but GDPR-compliant for any group photos

## Data Models

### Service Configuration
```typescript
interface ServiceConfig {
  slug: string;
  title: string;
  description: string;
  thumbnail: {
    src: string;
    alt: string;
  };
  hero: {
    title: string;
    content: string;
  };
  proofElements?: ProofElement[];
  cta: {
    text: string;
    href: string;
  };
}

interface ProofElement {
  type: 'image' | 'metric' | 'testimonial';
  src?: string;
  alt?: string;
  value?: string;
  description?: string;
}
```

### Image Asset Management
```typescript
interface ImageAsset {
  originalPath: string;
  buildPath: string;
  s3Key: string;
  mimeType: string;
  optimized: boolean;
}
```

## Error Handling

### Image Loading Failures
- **Fallback Strategy**: Graceful degradation with placeholder or text-only content
- **Monitoring**: CloudWatch metrics for 404 errors on image requests
- **Recovery**: Automatic retry with exponential backoff

### Build-Time Validation
- **Asset Verification**: Ensure all referenced images exist in public directory
- **Path Validation**: Check for spaces in filenames and suggest renames
- **Size Optimization**: Warn about oversized images that could impact performance

### Deployment Failures
- **Rollback Strategy**: Maintain previous version for quick recovery
- **Cache Invalidation**: Ensure CloudFront cache is properly cleared
- **Health Checks**: Validate all pages load correctly post-deployment

## Testing Strategy

### Visual Regression Testing
- **Screenshot Comparison**: Before/after deployment comparisons
- **Cross-Browser**: Chrome, Firefox, Safari, Edge testing
- **Device Testing**: Mobile, tablet, desktop viewport validation

### Performance Testing
- **Core Web Vitals**: LCP, FID, CLS measurements
- **Image Loading**: Lazy loading effectiveness
- **Cache Efficiency**: CloudFront cache hit rates

### Accessibility Testing
- **Alt Text Validation**: Ensure all images have descriptive alt attributes
- **Keyboard Navigation**: Tab order and focus management
- **Screen Reader**: NVDA/JAWS compatibility testing

### Content Validation
- **Link Checking**: Verify all internal and external links
- **CTA Functionality**: Ensure all call-to-action buttons work
- **Mobile Usability**: Touch target sizes and readability

## Implementation Phases

### Phase 1: Asset Preparation
1. Audit existing image assets in `public/images/`
2. Rename files with spaces to kebab-case
3. Optimize images for web delivery
4. Create responsive image variants if needed

### Phase 2: Component Development
1. Build reusable ServiceCard component
2. Create PhotographyGallery with responsive grid
3. Develop ProofElement components for hosting page
4. Build OutcomeCard for campaigns page

### Phase 3: Page Implementation
1. Update main services hub page
2. Implement four service subpages
3. Refresh about page with new content and images
4. Ensure consistent styling and navigation

### Phase 4: Testing and Deployment
1. Run comprehensive test suite
2. Validate responsive behavior
3. Deploy to S3 with CloudFront invalidation
4. Monitor performance and error rates

## Security Considerations

### Asset Security
- **Private S3**: Maintain bucket privacy with OAC-only access
- **CloudFront**: Serve all assets through CDN with security headers
- **HTTPS**: Enforce SSL/TLS for all asset delivery

### Content Security
- **Image Validation**: Scan uploaded images for malicious content
- **Alt Text**: Ensure no sensitive information in image descriptions
- **GDPR Compliance**: Respect privacy in group photos and descriptions

### Infrastructure Security
- **No Public Access**: Maintain S3 bucket as private
- **OAC Configuration**: Preserve existing Origin Access Control settings
- **Cache Security**: Appropriate cache headers for different content types