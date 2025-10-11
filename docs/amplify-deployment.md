# AWS Amplify Deployment Configuration

This document outlines the AWS Amplify deployment configuration for the
mobile-first marketing website.

## Overview

The website is configured for deployment on AWS Amplify with the following
features:

- Static site generation using Next.js
- Branch-based deployments (main, staging, feature branches)
- Comprehensive caching strategies
- Security headers and CSP
- Performance optimization
- Environment-specific configurations

## Build Configuration

### amplify.yml Structure

The `amplify.yml` file defines the build process with three phases:

1. **preBuild**: Dependency installation, content validation, type checking
2. **build**: Next.js build and testing
3. **postBuild**: Final optimizations and verification

### Build Phases

#### preBuild Phase

- Install dependencies with `npm ci` for faster, reliable builds
- Validate content structure and integrity
- Run TypeScript type checking
- Set environment variables for the build

#### Build Phase

- Build Next.js application with static export
- Run test suite to ensure build quality
- Generate optimized static files

#### postBuild Phase

- Verify build output
- Optional asset optimization
- Build completion logging

## Environment Variables

### Required Environment Variables

Configure these in AWS Amplify Console > App Settings > Environment Variables:

#### Site Configuration

- `NEXT_PUBLIC_SITE_URL`: Your domain URL (e.g., https://yourdomain.com)
- `NEXT_PUBLIC_SITE_NAME`: Site name for SEO and branding
- `NEXT_PUBLIC_SITE_DESCRIPTION`: Site description for meta tags

#### Analytics

- `NEXT_PUBLIC_GA_ID`: Google Analytics 4 measurement ID
- `NEXT_PUBLIC_GTM_ID`: Google Tag Manager container ID (optional)
- `NEXT_PUBLIC_FACEBOOK_PIXEL_ID`: Facebook Pixel ID (optional)

#### Contact Form

- `CONTACT_EMAIL`: Email address for form submissions
- `SMTP_HOST`: SMTP server hostname
- `SMTP_PORT`: SMTP server port (usually 587)
- `SMTP_USER`: SMTP username
- `SMTP_PASS`: SMTP password (use Amplify secrets)

#### Social Media

- `NEXT_PUBLIC_FACEBOOK_URL`: Facebook page URL
- `NEXT_PUBLIC_TWITTER_URL`: Twitter profile URL
- `NEXT_PUBLIC_LINKEDIN_URL`: LinkedIn company page URL
- `NEXT_PUBLIC_INSTAGRAM_URL`: Instagram profile URL

### Environment-Specific Variables

#### Production Branch (main)

- `NODE_ENV=production`
- `NEXT_PUBLIC_ENABLE_ANALYTICS=true`
- `CONTENT_VALIDATION_STRICT=true`

#### Staging Branch (develop/staging)

- `NODE_ENV=production`
- `NEXT_PUBLIC_ENABLE_ANALYTICS=false`
- `NEXT_PUBLIC_DEBUG_MODE=true`
- `CONTENT_VALIDATION_STRICT=false`

## Caching Strategy

### Static Assets (1 year cache)

- JavaScript, CSS, images, fonts
- `Cache-Control: public, max-age=31536000, immutable`

### HTML Files (1 hour cache)

- All HTML pages
- `Cache-Control: public, max-age=3600, must-revalidate`

### API Routes (No cache)

- Contact form submissions
- `Cache-Control: no-cache, no-store, must-revalidate`

### Special Files

- Service Worker: No cache
- Manifest: 24 hour cache

## Security Headers

### Content Security Policy (CSP)

Configured to allow:

- Self-hosted resources
- Google Analytics and Tag Manager
- Google Fonts
- Inline styles (for critical CSS)

### Security Headers Applied

- `Strict-Transport-Security`: Force HTTPS
- `X-Frame-Options`: Prevent clickjacking
- `X-Content-Type-Options`: Prevent MIME sniffing
- `X-XSS-Protection`: XSS protection
- `Referrer-Policy`: Control referrer information
- `Permissions-Policy`: Restrict browser features

## Redirects and Rewrites

### Redirects (301 - Permanent)

- Old HTML files to new clean URLs
- www to non-www (if configured)
- HTTP to HTTPS

### Rewrites

- Handle trailing slashes consistently
- SPA-style routing for client-side navigation

## Branch Configuration

### Main Branch (Production)

- Domain: Your production domain
- Environment: Production variables
- Analytics: Enabled
- Caching: Full optimization
- Security: Strict CSP and headers

### Staging Branch

- Domain: Auto-generated Amplify URL
- Environment: Staging variables
- Analytics: Disabled
- Caching: Enabled but less aggressive
- Security: Relaxed for testing

### Feature Branches

- Domain: Auto-generated preview URLs
- Environment: Development variables
- Analytics: Disabled
- Caching: Minimal
- Security: Development-friendly

## Performance Optimization

### Build Optimization

- Node.js memory limit increased to 4GB
- Next.js telemetry disabled
- Bundle analysis available via ANALYZE=true

### Asset Optimization

- Image optimization with WebP/AVIF formats
- Font preloading and optimization
- CSS minification and purging
- JavaScript code splitting

### Caching Strategy

- Long-term caching for static assets
- Appropriate cache headers for different content types
- CDN optimization through CloudFront

## Monitoring and Alerts

### Build Monitoring

- Build success/failure notifications
- Build time tracking
- Deploy preview generation

### Performance Monitoring

- Core Web Vitals tracking
- Real User Monitoring (RUM)
- Error tracking and reporting

## Deployment Process

### Automatic Deployments

1. Code pushed to configured branch
2. Amplify detects changes via webhook
3. Build process starts automatically
4. Tests run during build
5. Static files deployed to CDN
6. Cache invalidation triggered
7. Deployment notifications sent

### Manual Deployments

1. Access Amplify Console
2. Select app and branch
3. Click "Redeploy this version"
4. Monitor build progress
5. Verify deployment success

## Troubleshooting

### Common Build Issues

- **Node memory errors**: Increase NODE_OPTIONS memory limit
- **Content validation failures**: Check Markdown file structure
- **Type errors**: Run `npm run type-check` locally
- **Test failures**: Run `npm test` locally to debug

### Performance Issues

- **Slow builds**: Check cache configuration and dependencies
- **Large bundle size**: Use ANALYZE=true to identify large modules
- **Poor Core Web Vitals**: Review image optimization and code splitting

### Security Issues

- **CSP violations**: Update Content-Security-Policy header
- **Mixed content**: Ensure all resources use HTTPS
- **Header conflicts**: Check custom header configuration

## Best Practices

### Environment Management

- Use Amplify Console for sensitive environment variables
- Keep .env files in version control for documentation
- Use different configurations for different branches

### Performance

- Optimize images before committing
- Use dynamic imports for large components
- Implement proper caching strategies
- Monitor Core Web Vitals regularly

### Security

- Regularly update dependencies
- Review and update CSP policies
- Use HTTPS for all external resources
- Implement proper rate limiting

### Content Management

- Validate content structure before deployment
- Use consistent frontmatter schemas
- Optimize images for web delivery
- Implement proper SEO metadata

## Support and Resources

- [AWS Amplify Documentation](https://docs.amplify.aws/)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Core Web Vitals](https://web.dev/vitals/)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
