# AWS S3 Deployment Guide

After 31 failed Amplify deployments, it's time to use the right tool for the job: **S3 + CloudFront for static sites**.

## Why S3 + CloudFront is Better

- ✅ **No framework detection issues** - Pure static hosting
- ✅ **Better performance** - Global CDN with edge caching  
- ✅ **Lower cost** - No compute charges, pay only for storage/bandwidth
- ✅ **Simpler configuration** - No complex build processes
- ✅ **More reliable** - No SSR detection problems

## Quick Start (5 minutes)

### 1. Prerequisites
```bash
# Install AWS CLI if not already installed
# Windows: Download from https://aws.amazon.com/cli/
# Mac: brew install awscli
# Linux: sudo apt install awscli

# Configure AWS credentials
aws configure
```

### 2. Build Your Site
```bash
npm run build
```

### 3. Deploy with Simple Script
```bash
node scripts/deploy-simple.js
```

That's it! Your site will be live in minutes.

## Advanced Deployment (with CloudFront)

For production sites with custom domains and HTTPS:

```bash
# Edit the bucket name in scripts/deploy-to-aws-s3.js first
node scripts/deploy-to-aws-s3.js --cloudfront
```

## Manual Deployment Steps

If you prefer manual control:

### 1. Create S3 Bucket
```bash
aws s3 mb s3://your-unique-bucket-name --region us-east-1
```

### 2. Upload Files
```bash
aws s3 sync out/ s3://your-unique-bucket-name --delete
```

### 3. Configure Static Hosting
```bash
aws s3 website s3://your-unique-bucket-name --index-document index.html --error-document index.html
```

### 4. Set Public Access Policy
Create `bucket-policy.json`:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-unique-bucket-name/*"
    }
  ]
}
```

Apply policy:
```bash
aws s3api put-bucket-policy --bucket your-unique-bucket-name --policy file://bucket-policy.json
```

### 5. Access Your Site
Your site will be available at:
`http://your-unique-bucket-name.s3-website-us-east-1.amazonaws.com`

## Adding Custom Domain & HTTPS

1. **Create CloudFront Distribution** (via AWS Console or CLI)
2. **Point to your S3 bucket** as origin
3. **Add your custom domain** in CloudFront settings
4. **Request SSL certificate** via AWS Certificate Manager
5. **Update DNS** to point to CloudFront distribution

## Continuous Deployment

Add this to GitHub Actions (`.github/workflows/deploy.yml`):

```yaml
name: Deploy to S3
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      - run: aws s3 sync out/ s3://your-bucket-name --delete
```

## Cost Comparison

**Amplify**: $5-15/month + build minutes
**S3 + CloudFront**: $1-5/month for most sites

## Next Steps

1. Run the simple deployment script
2. Test your site
3. Set up custom domain if needed
4. Configure GitHub Actions for auto-deployment

This approach will give you a faster, more reliable, and cheaper deployment than fighting with Amplify's Next.js detection.