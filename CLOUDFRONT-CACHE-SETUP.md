# CloudFront Cache Configuration for LCP Optimization

## Problem
Lighthouse reports 604 KiB of assets with no cache lifetime, causing slower repeat visits.

## Solution
Configure CloudFront cache behaviors to cache static assets for 1 year.

## Manual Steps (AWS Console)

1. Go to CloudFront Console: https://console.aws.amazon.com/cloudfront
2. Select distribution: E2IBMHQ3GCW6ZK
3. Go to "Behaviors" tab
4. Click "Create behavior"

### Behavior 1: Images
- Path pattern: *.webp
- Cache policy: CachingOptimized (658327ea-f89d-4fab-a63d-7e88639e58f6)
- Compress objects: Yes
- Priority: 0

### Behavior 2: Fonts
- Path pattern: *.woff2
- Cache policy: CachingOptimized
- Compress objects: Yes
- Priority: 1

### Behavior 3: JavaScript
- Path pattern: *.js
- Cache policy: CachingOptimized
- Compress objects: Yes
- Priority: 2

### Behavior 4: CSS
- Path pattern: *.css
- Cache policy: CachingOptimized
- Compress objects: Yes
- Priority: 3

## Automated Script
Run: node scripts/configure-cloudfront-cache.js

## Expected Results
- All static assets cached for 1 year
- Repeat visits load instantly
- LCP improvement: 0.5-0.8s faster
