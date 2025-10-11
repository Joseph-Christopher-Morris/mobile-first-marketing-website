# SSL Certificate and Custom Domain Setup Guide

This guide covers the complete setup of SSL certificates and custom domain configuration for your S3 + CloudFront deployment.

## Overview

The SSL and custom domain setup process includes:

1. **SSL Certificate Management**: Request and validate SSL certificates through AWS Certificate Manager (ACM)
2. **Custom Domain Configuration**: Configure CloudFront to use your custom domain with HTTPS redirect
3. **DNS Configuration**: Set up DNS records to point your domain to CloudFront
4. **Automatic Renewal**: Enable automatic SSL certificate renewal

## Prerequisites

### Required Environment Variables

```bash
# Required
export CLOUDFRONT_DISTRIBUTION_ID="E1234567890ABC"
export CUSTOM_DOMAIN="example.com"  # or "www.example.com"

# Optional
export ENVIRONMENT="production"
export AWS_REGION="us-east-1"
```

### AWS Permissions Required

Your AWS credentials need the following permissions:

#### ACM (Certificate Manager)
- `acm:RequestCertificate`
- `acm:DescribeCertificate`
- `acm:ListCertificates`
- `acm:GetCertificate`

#### CloudFront
- `cloudfront:GetDistribution`
- `cloudfront:UpdateDistribution`
- `cloudfront:GetDistributionConfig`

#### Route 53 (for automatic DNS validation)
- `route53:ListHostedZones`
- `route53:ChangeResourceRecordSets`
- `route53:GetChange`
- `route53:ListResourceRecordSets`

## Setup Methods

### Method 1: Complete Automated Setup

Run the complete setup script that handles both SSL certificate and custom domain configuration:

```bash
# Set environment variables
export CLOUDFRONT_DISTRIBUTION_ID="your-distribution-id"
export CUSTOM_DOMAIN="your-domain.com"

# Run complete setup
node scripts/setup-ssl-and-domain.js
```

### Method 2: Step-by-Step Setup

#### Step 1: SSL Certificate Setup

```bash
# Set required environment variables
export CLOUDFRONT_DISTRIBUTION_ID="your-distribution-id"
export CUSTOM_DOMAIN="your-domain.com"

# Run SSL certificate setup
node scripts/setup-ssl-certificate.js
```

#### Step 2: Custom Domain Configuration

```bash
# Set SSL certificate ARN (from step 1 output)
export SSL_CERTIFICATE_ARN="arn:aws:acm:us-east-1:123456789012:certificate/12345678-1234-1234-1234-123456789012"

# Run custom domain setup
node scripts/setup-custom-domain.js
```

## DNS Validation Methods

### Automatic DNS Validation (Route 53)

If your domain is hosted in Route 53, the script will automatically:

1. Create DNS validation records
2. Wait for DNS propagation
3. Complete certificate validation
4. Configure custom domain DNS records

### Manual DNS Validation

If your domain is hosted elsewhere, you'll need to manually add DNS records:

#### SSL Certificate Validation Records

The script will output DNS records like:

```
Domain: example.com
Type: CNAME
Name: _acme-challenge.example.com
Value: _12345678-abcd-1234-efgh-123456789012.acme-validations.aws.
```

#### Custom Domain DNS Records

After SSL validation, configure these DNS records:

```
# For apex domain (example.com)
Type: A
Name: example.com
Value: ALIAS to d1234567890abc.cloudfront.net

# For www subdomain (www.example.com)
Type: CNAME
Name: www.example.com
Value: d1234567890abc.cloudfront.net
```

## Domain Configuration Options

### Apex Domain (example.com)

```bash
export CUSTOM_DOMAIN="example.com"
```

This will configure:
- `example.com` (primary)
- `www.example.com` (redirect to primary)

### WWW Subdomain (www.example.com)

```bash
export CUSTOM_DOMAIN="www.example.com"
```

This will configure:
- `www.example.com` (primary)
- `example.com` (redirect to primary)

## Security Features

### HTTPS Redirect

All HTTP requests are automatically redirected to HTTPS:

```
HTTP/1.1 301 Moved Permanently
Location: https://example.com/
```

### SSL/TLS Configuration

- **Certificate Source**: AWS Certificate Manager (ACM)
- **SSL Support Method**: SNI Only (Server Name Indication)
- **Minimum TLS Version**: TLSv1.2_2021
- **Automatic Renewal**: Enabled

### Security Headers

The following security headers are automatically configured:

- `Strict-Transport-Security`
- `X-Content-Type-Options`
- `X-Frame-Options`
- `X-XSS-Protection`
- `Referrer-Policy`

## Testing Your Setup

### Test HTTPS Access

```bash
# Test primary domain
curl -I https://example.com

# Expected response
HTTP/2 200
server: CloudFront
```

### Test HTTP to HTTPS Redirect

```bash
# Test HTTP redirect
curl -I http://example.com

# Expected response
HTTP/1.1 301 Moved Permanently
Location: https://example.com/
```

### Test SSL Certificate

```bash
# Check SSL certificate details
openssl s_client -connect example.com:443 -servername example.com

# Or use online tools
# https://www.ssllabs.com/ssltest/
```

### Test DNS Resolution

```bash
# Check DNS resolution
nslookup example.com
dig example.com

# Should resolve to CloudFront distribution
```

## Configuration Files

After successful setup, the following configuration files are created:

### `config/ssl-certificate.json`
Contains SSL certificate configuration and validation details.

### `config/custom-domain.json`
Contains custom domain and DNS configuration details.

### `config/ssl-domain-complete.json`
Contains complete setup summary and configuration.

### `config/production.env`
Environment variables for production deployment.

## Troubleshooting

### Common Issues

#### 1. Certificate Validation Timeout

**Problem**: DNS validation takes too long or fails.

**Solution**:
- Verify DNS records are correctly configured
- Check DNS propagation with online tools
- Wait up to 48 hours for DNS propagation
- Ensure no conflicting DNS records exist

#### 2. CloudFront Distribution Update Fails

**Problem**: Cannot update CloudFront distribution with custom domain.

**Solution**:
- Verify SSL certificate is in `ISSUED` status
- Check CloudFront distribution is in `Deployed` status
- Ensure no conflicting aliases exist on other distributions
- Verify AWS permissions for CloudFront operations

#### 3. DNS Records Not Created Automatically

**Problem**: Route 53 automatic configuration fails.

**Solution**:
- Verify Route 53 hosted zone exists for your domain
- Check AWS permissions for Route 53 operations
- Manually configure DNS records as shown in script output
- Ensure domain matches hosted zone exactly

#### 4. HTTPS Access Fails

**Problem**: Custom domain doesn't respond or shows certificate errors.

**Solution**:
- Wait for CloudFront distribution deployment (15-20 minutes)
- Verify DNS records point to correct CloudFront distribution
- Check SSL certificate covers your domain
- Clear browser cache and try incognito mode

### Debug Commands

```bash
# Check certificate status
aws acm describe-certificate --certificate-arn "your-cert-arn" --region us-east-1

# Check CloudFront distribution
aws cloudfront get-distribution --id "your-distribution-id"

# Check DNS resolution
nslookup example.com
dig example.com

# Test HTTP response
curl -v https://example.com
```

## Cost Considerations

### SSL Certificates
- **ACM Certificates**: Free for use with AWS services
- **Automatic Renewal**: No additional cost

### CloudFront
- **Custom Domain**: No additional cost for aliases
- **HTTPS Requests**: Same pricing as HTTP requests
- **Data Transfer**: Standard CloudFront pricing applies

### Route 53 (if used)
- **Hosted Zone**: $0.50 per month
- **DNS Queries**: $0.40 per million queries

## Security Best Practices

1. **Use Strong TLS**: Minimum TLSv1.2_2021 is configured
2. **Enable HSTS**: Strict-Transport-Security header is set
3. **Certificate Transparency**: Enabled for all certificates
4. **Regular Monitoring**: Set up CloudWatch alarms for certificate expiration
5. **Access Logging**: Enable CloudFront access logs for security monitoring

## Maintenance

### Certificate Renewal

ACM certificates automatically renew before expiration. Monitor renewal status:

```bash
# Check certificate expiration
aws acm describe-certificate --certificate-arn "your-cert-arn" --region us-east-1
```

### DNS Changes

If you need to change DNS providers:

1. Update DNS records at new provider
2. Wait for DNS propagation
3. Test domain resolution
4. Update Route 53 configuration if needed

### Domain Changes

To change or add domains:

1. Request new certificate with additional domains
2. Update CloudFront distribution aliases
3. Configure DNS records for new domains
4. Test all domain variants

## Support

For issues with this setup:

1. Check the troubleshooting section above
2. Review AWS CloudFormation/CloudFront documentation
3. Check AWS service health dashboard
4. Contact AWS support for service-specific issues

## Related Documentation

- [AWS Certificate Manager User Guide](https://docs.aws.amazon.com/acm/)
- [CloudFront Developer Guide](https://docs.aws.amazon.com/cloudfront/)
- [Route 53 Developer Guide](https://docs.aws.amazon.com/route53/)
- [S3 + CloudFront Deployment Guide](./s3-infrastructure-setup.md)