# Production Deployment Instructions

## Infrastructure Summary

- **Environment**: Production
- **S3 Bucket**: mobile-marketing-site-prod-1760376557954-w49slb
- **CloudFront Distribution**: E17G92EIZ7VTUY
- **CloudFront Domain**: d3vfzayzqyr2yg.cloudfront.net
- **Custom Domain**: Not configured
- **SSL Certificate**: Not configured
- **Region**: us-east-1

## Next Steps

### 1. Wait for CloudFront Distribution Deployment
The CloudFront distribution is currently deploying. This process takes 15-20 minutes.

Check status with:
```bash
aws cloudfront get-distribution --id E17G92EIZ7VTUY --query 'Distribution.Status'
```

### 2. Complete SSL Certificate Validation (if applicable)
SSL certificate not configured. Set CUSTOM_DOMAIN environment variable to enable.

### 3. Deploy Your Application
Once CloudFront is deployed, run the deployment script:

```bash
# Load production environment
source config/production.env

# Deploy to production
npm run build
node scripts/deploy.js --env=production
```

### 4. Configure DNS (if using custom domain)
Configure your custom domain in environment variables first.

### 5. Validate Production Deployment
Run production readiness validation:

```bash
node scripts/production-readiness-validator.js --env=production
```

## Security Notes

- ✅ S3 bucket is private with no public access
- ✅ CloudFront uses Origin Access Control (OAC)
- ✅ HTTPS redirect is enforced
- ✅ Security headers are configured
- ✅ TLS 1.2+ is required
- ✅ Compression is enabled

## Monitoring and Maintenance

- Monitor CloudFront metrics in AWS Console
- Set up CloudWatch alarms for error rates
- Review access logs regularly
- Update SSL certificates before expiration

## Rollback Procedure

If issues occur, rollback using:

```bash
node scripts/rollback.js --env=production --version=previous
```

## IndexNow Integration

The deployment pipeline automatically submits URLs to IndexNow for instant search engine notification.

### Setup Required

Configure GitHub Secrets for IndexNow integration:
- See `docs/indexnow-github-secrets-setup.md` for complete setup instructions
- Required secret: `INDEXNOW_API_KEY`

### Verification

After deployment, verify IndexNow submissions:
```bash
node scripts/validate-indexnow-key.js
cat logs/indexnow-submissions.json
```

## Support

For issues or questions, refer to:
- docs/s3-cloudfront-deployment-runbook.md
- docs/s3-cloudfront-troubleshooting-guide.md
- docs/indexnow-github-secrets-setup.md
