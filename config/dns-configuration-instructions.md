# DNS Configuration Instructions

## CloudFront Domain (Ready to Use)

Your site is now accessible at: https://d15sc9fc739ev2.cloudfront.net

## Custom Domain Configuration

To configure a custom domain:

1. Set the CUSTOM_DOMAIN environment variable
2. Run the SSL certificate setup script
3. Update DNS records as instructed
4. Redeploy the CloudFront distribution

## DNS Propagation

- DNS changes may take 5-60 minutes to propagate globally
- Use online DNS checkers to verify propagation
- Test from different locations and networks

## Verification

After DNS configuration, verify your setup:

1. Test primary domain: https://your-domain.com
2. Test www subdomain: https://www.your-domain.com
3. Verify SSL certificate is valid
4. Test SPA routing with a non-existent page

## Troubleshooting

- If DNS doesn't resolve, check CNAME record configuration
- If SSL errors occur, verify certificate validation is complete
- If pages don't load, check CloudFront distribution status
- For SPA routing issues, verify CloudFront error pages are configured
