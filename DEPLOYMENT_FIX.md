# AWS Amplify Deployment Fix

## Issue Identified
The deployment was failing because AWS Amplify was trying to run a `prebuild` script that references missing validation scripts.

## Files Fixed
1. **package.json** - Removed problematic prebuild/postbuild scripts
2. **amplify.yml** - Simplified to remove dependency on validate-env.js script

## What You Need to Do

### 1. Commit These Changes
```bash
git add .
git commit -m "Fix AWS Amplify deployment - remove problematic prebuild scripts"
git push origin main
```

### 2. Expected Result
After pushing these changes, AWS Amplify should:
- ✅ Install dependencies with `npm ci`
- ✅ Run `npm run build` (which is just `next build`)
- ✅ Generate static files in the `out/` directory
- ✅ Deploy successfully

## Current Configuration

### package.json build script:
```json
"build": "next build"
```

### amplify.yml (simplified):
```yaml
preBuild:
  commands:
    - npm ci
build:
  commands:
    - npm run build
    - ls -la out/
```

## Why This Will Work
- No more prebuild script that tries to run missing validation files
- Simple, direct build process
- Next.js config already has `output: 'export'` for static generation
- All problematic dynamic features (blog, API routes) are already disabled

## Next Steps After Successful Deployment
Once this basic deployment works, you can gradually re-enable features:
1. Add back blog functionality (with static-compatible implementation)
2. Replace API contact form with third-party service (Netlify Forms, Formspree, etc.)
3. Add back validation scripts if needed