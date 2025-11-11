#!/usr/bin/env bash
set -euo pipefail

: "${S3_BUCKET:?Set S3_BUCKET}"
: "${CF_DIST_ID:?Set CF_DIST_ID}"
: "${AWS_REGION:=us-east-1}"

echo "▶ Install deps"
npm ci

echo "▶ Build responsive images"
npx sharp -i ./public/images/hero/aston-martin-db6-website.webp \
  -o ./public/images/hero/aston-martin-db6-website-1280.webp resize 1280
npx sharp -i ./public/images/icons/vivid-auto-photography-logo.webp \
  -o ./public/images/icons/vivid-media-cheshire-logo-116x44.webp resize 116 44

echo "▶ Build & export"
npm run build:static || (npm run build && npm run export)

echo "▶ Sync HTML (short cache)"
aws s3 sync out "s3://$S3_BUCKET" \
  --exclude "*" --include "*.html" --include "sitemap.xml" --include "robots.txt" \
  --metadata-directive REPLACE \
  --cache-control "public, max-age=600" \
  --content-type "text/html; charset=utf-8"

echo "▶ Sync assets (immutable long cache)"
aws s3 sync out "s3://$S3_BUCKET" \
  --exclude "*.html" --exclude "sitemap.xml" --exclude "robots.txt" \
  --metadata-directive REPLACE \
  --cache-control "public, max-age=31536000, immutable" \
  --delete

echo "▶ Invalidate CloudFront"
aws cloudfront create-invalidation \
  --distribution-id "$CF_DIST_ID" \
  --paths "/" "/index.html" "/services/*" "/blog*" "/images/*" "/sitemap.xml" "/_next/*"

echo "✅ Deploy finished"