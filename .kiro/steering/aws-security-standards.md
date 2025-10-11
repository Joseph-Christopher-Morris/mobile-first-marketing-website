---
inclusion: always
---

# AWS Security Standards

## S3 Security Requirements

### No Public S3 Access

- **NEVER** make S3 buckets publicly accessible
- **ALWAYS** use CloudFront Origin Access Control (OAC) for web content
- **BLOCK** all public access at the bucket level
- **ROUTE** all traffic through CloudFront distributions only
- **MANDATORY**: Use S3 + CloudFront architecture (not AWS Amplify)

### Current Production Configuration

- **S3 Bucket**: Private with public access blocked
- **Access Method**: CloudFront OAC only (ID: E3OSELXP6A7ZL6)
- **Distribution**: E2IBMHQ3GCW6ZK with security headers enabled
- **Encryption**: AES256 server-side encryption enabled

### Access Control

- Use IAM roles with minimal required permissions
- Implement bucket policies that restrict access to CloudFront only
- Enable S3 server access logging for audit trails
- Use AWS CloudTrail for API call monitoring

## CloudFront Security Requirements

### Origin Access Control (OAC)

- Use OAC instead of deprecated Origin Access Identity (OAI)
- Configure CloudFront to be the only way to access S3 content
- Implement proper cache behaviors for different content types

### Security Headers

- Enable security headers in CloudFront responses:
  - `Strict-Transport-Security`
  - `X-Content-Type-Options`
  - `X-Frame-Options`
  - `X-XSS-Protection`
  - `Referrer-Policy`

## Deployment Security

### Credentials Management

- Use IAM roles for GitHub Actions (no long-term access keys)
- Implement least privilege access for deployment pipelines
- Rotate credentials regularly
- Store sensitive values in GitHub Secrets
- **Project Requirement**: All deployments must use S3 + CloudFront scripts
- **Prohibited**: Direct AWS Amplify access or configuration

### Infrastructure as Code

- Define all AWS resources in code (CloudFormation/CDK)
- Version control all infrastructure changes
- Implement proper review processes for infrastructure changes
- Use AWS Config for compliance monitoring

## Monitoring and Alerting

### Security Monitoring

- Enable AWS CloudTrail in all regions
- Set up CloudWatch alarms for suspicious activities
- Monitor S3 access patterns and unusual requests
- Implement cost monitoring to detect abuse

### Incident Response

- Document incident response procedures
- Maintain contact information for security issues
- Implement automated responses for common security events
- Regular security reviews and penetration testing
