# Core Functionality Testing Guide

## Overview

The core functionality testing system validates that SCRAM deployments work correctly by testing:

- **Core User Journeys** (Requirement 12.4): Verify user paths work correctly after deployment
- **Site Functionality** (Requirement 12.4): Test functionality across different pages and components  
- **Build Artifacts** (Requirement 9.5): Validate build artifacts contain all required files

## Available Scripts

### Comprehensive Core Functionality Testing

```bash
npm run test:core-functionality
```

Performs complete validation including:
- Build artifacts validation (all required files present)
- Page structure and content validation
- Core user journey testing
- Content functionality validation (newsletter, privacy policy, etc.)
- Generates detailed JSON report

### Quick Functionality Check

```bash
npm run test:functionality:quick
```

Performs essential checks for rapid validation:
- Verifies essential pages exist and have valid structure
- Checks critical assets are present
- Validates key content changes
- Quick report generation

## Testing Process

### 1. Build Artifacts Validation (Requirement 9.5)

Validates that all required files are present in the build output:

```javascript
// Required pages validation
const requiredPages = [
  'index.html',
  'services/index.html',
  'services/photography/index.html',
  'services/ad-campaigns/index.html',
  'services/analytics/index.html',
  'blog/index.html',
  'privacy-policy/index.html',
  'about/index.html',
  'contact/index.html'
];

// Required assets validation
const requiredAssets = [
  'sitemap.xml',
  'robots.txt',
  '_next/static',
  'images'
];
```

**Success Criteria:**
- All required pages present with valid HTML structure
- All required assets present
- Next.js static files generated correctly
- File sizes and content validation

### 2. Page Structure Testing

Validates HTML structure and content across all pages:

```javascript
// HTML structure validation
const hasHtmlTags = content.includes('<html') && content.includes('</html>');
const hasHead = content.includes('<head>') && content.includes('</head>');
const hasBody = content.includes('<body>') && content.includes('</body>');
const hasTitle = content.includes('<title>') && content.includes('</title>');

// SEO and branding validation
const hasVividAuto = content.toLowerCase().includes('vivid auto');
const hasViewport = content.includes('name="viewport"');
const hasDescription = content.includes('name="description"');
```

**Validation Points:**
- Valid HTML5 structure
- Proper head/body sections
- Title tags present
- Vivid Auto branding
- SEO meta tags

### 3. Core User Journeys Testing (Requirement 12.4)

Tests critical user paths through the site:

```javascript
const coreUserJourneys = [
  {
    name: 'Homepage Navigation',
    description: 'User visits homepage and navigates to services',
    steps: ['/', '/services']
  },
  {
    name: 'Service Discovery', 
    description: 'User explores different service offerings',
    steps: ['/services', '/services/photography', '/services/ad-campaigns']
  },
  {
    name: 'Blog Engagement',
    description: 'User reads blog content',
    steps: ['/blog', '/blog/stock-photography-lessons']
  },
  {
    name: 'Contact Journey',
    description: 'User seeks contact information', 
    steps: ['/contact', '/about']
  }
];
```

**Journey Validation:**
- All pages in journey exist
- Navigation elements present
- Links functional
- Content accessible

### 4. Content Functionality Testing

Validates specific content requirements from SCRAM tasks:

```javascript
// Blog newsletter text removal (Task 8.1)
const hasProhibitedText = blogContent.includes('👉 Join the Newsletter');
const hasNewsletterComponent = blogContent.toLowerCase().includes('newsletter');

// Privacy Policy implementation (Task 8.2)  
const privacyExists = fs.existsSync('out/privacy-policy/index.html');
const sitemapIncludesPrivacy = sitemapContent.includes('privacy-policy');
const navExcludesPrivacy = !homeContent.includes('href="/privacy-policy"');

// Logo responsive design (Task 4)
const hasResponsiveLogo = content.includes('height: 44px') || 
                         content.includes('object-fit: contain');
```

**Content Validation:**
- Newsletter text properly removed
- Newsletter component preserved
- Privacy Policy accessible at correct URL
- Privacy Policy in sitemap but not navigation
- Logo responsive design implemented

## Configuration

The testing system uses this configuration:

```javascript
const CONFIG = {
  buildDir: 'out',
  siteUrl: 'https://d15sc9fc739ev2.cloudfront.net',
  requiredPages: [...], // All essential pages
  requiredAssets: [...], // Critical assets
  coreUserJourneys: [...] // User path definitions
};
```

## Error Handling and Reporting

### Common Issues and Solutions

**Missing Build Directory:**
```
❌ Build directory out not found
```
*Solution: Run `npm run build:static` first*

**Missing Pages:**
```
❌ 3 pages missing:
   - services/analytics/index.html
   - blog/post-slug/index.html
   - privacy-policy/index.html
```
*Solution: Check build process and routing configuration*

**Invalid HTML Structure:**
```
❌ services/index.html - Invalid HTML structure
```
*Solution: Check page generation and template issues*

**Broken User Journeys:**
```
❌ Service Discovery - Journey broken
   ❌ /services/analytics - Page not found
```
*Solution: Verify all service pages build correctly*

**Content Issues:**
```
❌ Blog still contains prohibited newsletter text
❌ Navigation menus still contain Privacy Policy links
```
*Solution: Review content changes implementation*

## Report Generation

Both scripts generate detailed reports:

### Comprehensive Test Report

```json
{
  "timestamp": "2025-01-15T10:30:00.000Z",
  "overall": "PASSED",
  "results": {
    "buildArtifacts": {
      "passed": true,
      "details": ["✅ All 9 required pages present", "✅ All 4 required assets present"]
    },
    "pageStructure": {
      "passed": true,
      "details": ["✅ index.html - \"Vivid Auto Photography\" (Branded) (SEO)"]
    },
    "userJourneys": {
      "passed": true,
      "details": [
        {
          "journey": "Homepage Navigation",
          "valid": true,
          "steps": ["✅ / - Navigation available", "✅ /services - Navigation available"]
        }
      ]
    },
    "contentValidation": {
      "passed": true,
      "details": [
        "✅ Blog newsletter text properly removed, component preserved",
        "✅ Privacy Policy page accessible and contains relevant content"
      ]
    }
  },
  "requirements": {
    "12.4": "PASSED",
    "9.5": "PASSED"
  }
}
```

## Integration with Deployment Pipeline

### Post-Deployment Testing

```bash
# After successful build and deployment
npm run build:static
npm run deploy:s3
npm run test:core-functionality
```

### CI/CD Integration

Add to GitHub Actions workflow:

```yaml
- name: Test Core Functionality
  run: npm run test:core-functionality
  
- name: Quick Functionality Check
  run: npm run test:functionality:quick
```

## Testing the Implementation

Validate the testing system itself:

```bash
node scripts/test-core-functionality-implementation.js
```

This validates:
- Script existence and structure
- Requirements coverage
- Build artifacts validation logic
- User journey validation logic
- Package.json integration

## Best Practices

1. **Run After Every Build**: Always test functionality after building
2. **Use Quick Check for Rapid Feedback**: Use quick check during development
3. **Full Testing for Production**: Use comprehensive testing before production deployment
4. **Monitor Reports**: Review generated JSON reports for trends
5. **Fix Issues Immediately**: Address any failed validations before proceeding

## Troubleshooting

### Build Issues

Ensure build completes successfully:

```bash
npm run build:static
ls -la out/
```

### Missing Content

Check specific content requirements:

```bash
# Check blog content
grep -r "Join the Newsletter" out/blog/
# Check privacy policy
ls -la out/privacy-policy/
# Check sitemap
grep "privacy-policy" out/sitemap.xml
```

### Navigation Issues

Validate navigation structure:

```bash
# Check for privacy policy links in navigation
grep -r "privacy-policy" out/index.html
grep -r "privacy-policy" out/services/
```

## Requirements Compliance

This implementation satisfies:

- **Requirement 12.4 (User Journeys)**: ✅ Core user journeys validation implemented
- **Requirement 12.4 (Site Functionality)**: ✅ Page and component functionality testing implemented
- **Requirement 9.5 (Build Artifacts)**: ✅ Build artifacts validation implemented

The core functionality testing system ensures that deployments maintain site functionality and user experience quality standards.