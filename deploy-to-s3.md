# Deploy to AWS S3 + CloudFront

## Why This Approach?
After 30+ failed Amplify deployments, it's clear that Amplify's Next.js auto-detection cannot be bypassed. S3 + CloudFront is actually the better solution for static sites.

## Benefits
- **No framework detection issues** - Pure static hosting
- **Better performance** - Direct CDN serving
- **Lower cost** - No compute charges
- **Simpler configuration** - No build complexity

## Steps

### 1. Build Locally
```bash
npm run build
```

### 2. Create S3 Bucket
```bash
aws s3 mb s3://your-site-name-unique-bucket
```

### 3. Upload Static Files
```bash
aws s3 sync out/ s3://your-site-name-unique-bucket --delete
```

### 4. Configure S3 for Static Hosting
```bash
aws s3 website s3://your-site-name-unique-bucket --index-document index.html --error-document index.html
```

### 5. Create CloudFront Distribution
- Origin: Your S3 bucket
- Default root object: index.html
- Error pages: 404 -> /index.html (for SPA routing)

## Automation
You can automate this with GitHub Actions for continuous deployment.