# Build Verification Guide

## Overview

The build verification system ensures that all required images are properly
included in the Next.js build output before deployment. This prevents deployment
of incomplete builds that would result in broken images on the website.

## Components

### 1. Build Verification Script (`scripts/build-verification.js`)

The main verification script that:

- Validates all required images exist in the build output
- Compares source and build image counts
- Generates detailed verification reports
- Provides clear success/failure status

### 2. Integration with Deployment Pipeline

The build verification is automatically integrated into:

- **Local deployment script** (`scripts/deploy.js`)
- **GitHub Actions workflow** (`.github/workflows/s3-cloudfront-deploy.yml`)
- **NPM scripts** for manual testing

### 3. Required Images Configuration

The script validates these critical images based on the requirements:

#### Homepage Service Cards

- `services/photography-hero.webp`
- `services/analytics-hero.webp`
- `services/ad-campaigns-hero.webp`

#### Services Pages

**Photography Service:**

- Hero: `services/250928-hampson-auctions-sunday-11.webp`
- Portfolio: 7 images including `240217-australia-trip-232-1.webp`, etc.

**Analytics Service:**

- Hero: `services/screenshot-2025-09-23-analytics-dashboard.webp`
- Portfolio: 3 images including analytics charts and reports

**Ad Campaigns Service:**

- Hero: `services/ad-campaigns-hero.webp`
- Portfolio: 3 images including campaign performance data

#### Other Pages

- **About page**: `about/A7302858.webp`
- **Blog images**: 3 featured images for blog post previews

## Usage

### Manual Verification

```bash
# Run build verification on existing build
npm run build:verify

# Build and verify in one step
npm run build && npm run build:verify

# Test integration with deployment pipeline
npm run build:verify-integration
```

### Automated Verification

The verification runs automatically during:

1. **Local deployment**:

   ```bash
   node scripts/deploy.js
   ```

2. **GitHub Actions deployment**:
   - Triggered on push to `main` branch
   - Runs after build step, before deployment
   - Fails the workflow if verification fails

### Verification Reports

Each verification run generates a JSON report with:

- Timestamp and summary statistics
- List of successful and failed images
- Detailed error messages for missing images
- Source vs build image counts

Example report location: `build-verification-report-[timestamp].json`

## Error Handling

### Common Issues and Solutions

#### 1. Missing Source Images

**Error**: `Source image does not exist` **Solution**:

- Check if the image file exists in `public/images/`
- Verify the file path matches the expected location
- Ensure file naming follows kebab-case convention

#### 2. Build Exclusion

**Error**: `Image not included in build output` **Solution**:

- Verify Next.js configuration includes the `public/` directory
- Check if the build process completed successfully
- Ensure no build errors occurred during image processing

#### 3. Path Mismatches

**Error**: Multiple images failing verification **Solution**:

- Review the `REQUIRED_IMAGES` configuration in the script
- Update image paths to match actual file locations
- Ensure consistent path formatting (forward slashes)

### Troubleshooting Steps

1. **Check build output**:

   ```bash
   ls -la out/images/
   ```

2. **Compare with source**:

   ```bash
   ls -la public/images/
   ```

3. **Run verification with verbose output**:

   ```bash
   node scripts/build-verification.js
   ```

4. **Check deployment logs**:
   - Review GitHub Actions workflow logs
   - Check local deployment script output

## Configuration

### Adding New Required Images

To add new images to the verification:

1. Edit `scripts/build-verification.js`
2. Update the `REQUIRED_IMAGES` configuration object
3. Add the image path to the appropriate section
4. Test the verification with `npm run build:verify`

### Modifying Verification Logic

The script exports functions for testing and customization:

- `verifyBuildImages()` - Main verification function
- `checkBuildExists()` - Build directory validation
- `getImageFiles()` - Image file discovery
- `flattenRequiredImages()` - Configuration processing

## Integration Points

### Deployment Script Integration

The verification is integrated into `scripts/deploy.js` at the build stage:

```javascript
// Run build verification for images
console.log('🔍 Running build image verification...');
const { verifyBuildImages } = require('./build-verification.js');
const verificationResult = verifyBuildImages();

if (verificationResult.status !== 'success') {
  throw new Error(
    `Build verification failed: ${verificationResult.failedImages.length} images missing`
  );
}
```

### GitHub Actions Integration

The workflow includes an explicit verification step:

```yaml
- name: Verify build image integrity
  run: npm run build:verify
```

This provides clear visibility in the CI/CD pipeline and fails fast if images
are missing.

## Best Practices

### For Developers

1. **Run verification locally** before pushing changes
2. **Update verification config** when adding new images
3. **Check verification reports** for detailed failure information
4. **Test image paths** in development environment

### For Deployment

1. **Always verify before deployment** (automated in pipeline)
2. **Monitor verification reports** for trends
3. **Update required images list** when requirements change
4. **Maintain consistent file naming** conventions

### For Maintenance

1. **Review verification config** regularly
2. **Update image requirements** as features change
3. **Monitor build performance** impact
4. **Archive old verification reports** periodically

## Performance Considerations

- Verification adds ~2-5 seconds to build time
- Report generation is minimal overhead
- File system operations are optimized for speed
- Verification runs only on required images, not all images

## Security Considerations

- No sensitive data in verification reports
- File paths are relative to project root
- No external network requests during verification
- Reports can be safely committed to version control

## Future Enhancements

Potential improvements to consider:

- Image size validation
- Format verification (WebP, JPG, PNG)
- Accessibility attribute checking
- Performance impact measurement
- Integration with image optimization tools
