# GitHub Actions Export Fix - Complete

## Summary

Fixed GitHub Actions workflows to remove `npm run export` calls. Next.js 15 App Router automatically exports during `next build` when configured for static export.

## Changes Made

### 1. ✅ Deploy Workflow (`.github/workflows/s3-cloudfront-deploy.yml`)
**Status**: Already correct - no changes needed
- Uses `npm run build` only
- Correctly uploads `out` directory artifact
- No export script call present

### 2. ✅ Lighthouse CI Workflow (`.github/workflows/lhci.yml`)
**Status**: Fixed
- **Before**: `npm run build && npm run export`
- **After**: `npm run build`
- Step renamed to: "Build (static export happens in build)"

### 3. ✅ Lighthouse Configuration (`lighthouserc.js`)
**Status**: Already correct - no changes needed
- `staticDistDir: './out'` properly configured
- Points to correct output directory

### 4. ✅ Package.json
**Status**: Already correct - no changes needed
- No `export` script exists
- Only has `build` script which handles static export

## How Next.js 15 Static Export Works

With `output: 'export'` in `next.config.js`, the build process:
1. `npm run build` → Runs `next build`
2. Next.js automatically exports to `/out` directory
3. No separate export step needed

## Testing

To verify the fix works:

```bash
# Local test
npm run build
# Should create /out directory with static files

# Test Lighthouse locally
npm install -g @lhci/cli
lhci autorun
```

## Deployment

The workflows will now:
1. Build once with `npm run build`
2. Static export happens automatically
3. Lighthouse reads from `/out` directory
4. Deploy workflow uploads `/out` to S3

## Files Modified

- `.github/workflows/lhci.yml` - Removed `npm run export` call

## Files Verified (No Changes Needed)

- `.github/workflows/s3-cloudfront-deploy.yml` - Already correct
- `lighthouserc.js` - Already points to `./out`
- `package.json` - No export script exists

---

**Status**: ✅ Ready to commit and push
