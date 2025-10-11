# AWS Amplify Configuration Documentation

## Migration Information

- **Migration Date**: 2025-10-05T23:01:04.735Z
- **Reason**: Migration to S3/CloudFront completed successfully
- **New Infrastructure**: S3 + CloudFront deployment

## Original Amplify Configuration

### Configuration Files

- amplify.yml
- amplify-simple.yml
- amplify-minimal.yml
- amplify-static.yml
- .env.production
- .env.local

### Environment Variables

- **NEXT_PUBLIC_SITE_URL**: https://your-production-domain.com
- **NEXT_PUBLIC_SITE_NAME**: Your Marketing Website
- **NEXT_PUBLIC_SITE_DESCRIPTION**: Mobile-first marketing website showcasing
  photography, analytics, and ad campaign services
- **NEXT_PUBLIC_GA_ID**: G-XXXXXXXXXX
- **NEXT_PUBLIC_GTM_ID**: GTM-XXXXXXX
- **CONTACT_EMAIL**: contact@your-production-domain.com
- **SMTP_HOST**: smtp.gmail.com
- **SMTP_PORT**: 587
- **SMTP_USER**: your-smtp-username
- **SMTP_PASS**: your-smtp-password
- **SMTP_SECURE**: true
- **NEXT_PUBLIC_FACEBOOK_URL**: https://facebook.com/yourpage
- **NEXT_PUBLIC_TWITTER_URL**: https://twitter.com/yourhandle
- **NEXT_PUBLIC_LINKEDIN_URL**: https://linkedin.com/company/yourcompany
- **NEXT_PUBLIC_INSTAGRAM_URL**: https://instagram.com/yourhandle
- **AMPLIFY_BRANCH**: main
- **AWS_REGION**: us-east-1
- **NODE_ENV**: production
- **NEXT_TELEMETRY_DISABLED**: 1
- **NODE_OPTIONS**: --max-old-space-size
- **ANALYZE**: false
- **NEXT_PUBLIC_ENABLE_ANALYTICS**: true
- **NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING**: true
- **CONTENT_VALIDATION_STRICT**: true
- **GENERATE_SITEMAP**: true
- **RATE_LIMIT_MAX**: 100
- **RATE_LIMIT_WINDOW**: 900000

### Deployment History

- deployments.json (0.0 KB)
- production-deployment-prod-1759704921107.json (0.6 KB)
- production-deployment-prod-1759704932832.json (2.0 KB)
- production-deployment-prod-1759705020208.json (2.2 KB)
- production-deployment-prod-1759705086993.json (3.1 KB)

## Migration Summary

### Issues with Amplify

- **31 failed deployments** due to Next.js SSR detection issues
- Framework detection problems preventing static site deployment
- Inconsistent build behavior and deployment failures

### New S3/CloudFront Solution

- **Reliable static hosting** without framework detection issues
- **Enhanced security** with private S3 bucket and CloudFront OAC
- **Better performance** with optimized caching strategies
- **Cost optimization** with appropriate cache settings
- **Production-ready** infrastructure with monitoring and alerting

### Migration Benefits

- ✅ Eliminated deployment failures
- ✅ Improved security posture
- ✅ Better performance and caching
- ✅ More predictable costs
- ✅ Enhanced monitoring capabilities

## New Infrastructure Details

### Production Environment

- **S3 Bucket**: mobile-marketing-site-prod-1759705011281-tyzuo9
- **CloudFront Distribution**: E2IBMHQ3GCW6ZK
- **CloudFront Domain**: d15sc9fc739ev2.cloudfront.net
- **Region**: us-east-1

### Key Configuration Files

- `config/production-infrastructure.json` - Complete infrastructure
  configuration
- `config/production.env` - Environment variables for production
- `config/dns-configuration-instructions.md` - DNS setup instructions
- `scripts/production-deployment.js` - Deployment script

## Decommissioning Process

This documentation was created as part of the safe decommissioning of AWS
Amplify resources. All configuration has been preserved for reference and
potential future use.

## Support and Maintenance

For ongoing support with the new S3/CloudFront infrastructure:

- See `docs/s3-cloudfront-deployment-runbook.md`
- See `docs/s3-cloudfront-troubleshooting-guide.md`
- Review production deployment logs in `logs/` directory

---

_Generated on 2025-10-05T23:01:04.735Z_
