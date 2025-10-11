# S3 Infrastructure Setup Guide

This guide covers setting up the AWS S3 infrastructure for secure static website
hosting as part of the migration from AWS Amplify to S3 + CloudFront.

## Overview

The S3 infrastructure setup creates a private S3 bucket with the following
security configurations:

- **Private bucket** with all public access blocked
- **Versioning enabled** for rollback capabilities
- **AES256 encryption** for data at rest
- **Restrictive bucket policy** allowing CloudFront access only

## Prerequisites

### AWS Credentials

Ensure you have AWS credentials configured with the following permissions:

- `s3:CreateBucket`
- `s3:PutBucketVersioning`
- `s3:PutBucketEncryption`
- `s3:PutBucketPublicAccessBlock`
- `s3:PutBucketPolicy`
- `s3:HeadBucket`
- `s3:GetBucket*` (for validation)

### Environment Variables

Set the following environment variables:

```bash
export AWS_REGION="us-east-1"
export S3_BUCKET_NAME="your-bucket-name"
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key"
```

## Installation

Install the required AWS SDK dependencies:

```bash
npm install
```

## Usage

### 1. Setup S3 Infrastructure

Run the setup script to create and configure the S3 bucket:

```bash
npm run s3:setup
```

Or run directly:

```bash
node scripts/setup-s3-infrastructure.js
```

### 2. Validate Configuration

Verify the S3 infrastructure is properly configured:

```bash
npm run s3:validate
```

Or run the validation script directly:

```bash
node scripts/validate-s3-infrastructure.js
```

## Configuration

### Environment-Specific Settings

The configuration supports multiple environments. Edit
`config/s3-infrastructure.json` to customize:

```json
{
  "environments": {
    "development": {
      "bucketName": "mobile-marketing-site-dev",
      "region": "us-east-1"
    },
    "production": {
      "bucketName": "mobile-marketing-site-prod",
      "region": "us-east-1"
    }
  }
}
```

### Security Settings

All security settings are enforced by default:

- **Public Access**: Completely blocked
- **Versioning**: Enabled for rollback capability
- **Encryption**: AES256 server-side encryption
- **Bucket Policy**: Restricts access to CloudFront only

## Security Features

### 1. Private Bucket Configuration

- All public access is blocked at the bucket level
- No direct public access to S3 objects
- Access only through CloudFront distribution

### 2. Encryption at Rest

- AES256 server-side encryption enabled
- Bucket key enabled for cost optimization
- All objects encrypted automatically

### 3. Versioning

- Object versioning enabled for rollback capabilities
- Previous versions maintained for disaster recovery
- Lifecycle policies can be added for cost management

### 4. Restrictive Bucket Policy

- Denies direct public access to objects
- Will be updated to allow CloudFront Origin Access Control
- Follows principle of least privilege

## Troubleshooting

### Common Issues

#### 1. Credentials Not Found

```
Error: CredentialsProviderError
```

**Solution**: Ensure AWS credentials are properly configured:

- Set environment variables: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
- Or configure AWS CLI: `aws configure`
- Or use IAM roles if running on AWS infrastructure

#### 2. Insufficient Permissions

```
Error: AccessDenied
```

**Solution**: Ensure your AWS user/role has the required S3 permissions listed
above.

#### 3. Bucket Already Exists

```
Error: BucketAlreadyOwnedByYou
```

**Solution**: This is normal. The script will update the existing bucket
configuration.

#### 4. Region Mismatch

```
Error: IllegalLocationConstraintException
```

**Solution**: Ensure the `AWS_REGION` environment variable matches your intended
region.

### Validation Failures

If validation fails, check:

1. **Bucket exists**: Verify the bucket was created successfully
2. **Public access blocked**: Ensure all public access settings are enabled
3. **Versioning enabled**: Check versioning status in AWS Console
4. **Encryption enabled**: Verify AES256 encryption is configured
5. **Bucket policy**: Ensure restrictive policy is in place

## Next Steps

After successful S3 infrastructure setup:

1. **Configure CloudFront distribution** (Task 2)
2. **Update bucket policy** to allow CloudFront Origin Access Control
3. **Set up deployment automation** (Task 3)
4. **Configure CI/CD pipeline** (Task 4)

## Security Compliance

This setup follows AWS security best practices:

- ✅ No public S3 access (AWS Security Standard)
- ✅ Encryption at rest enabled
- ✅ Versioning for data protection
- ✅ Restrictive access policies
- ✅ Audit trail through CloudTrail (when enabled)

## Cost Considerations

- **S3 Standard storage** for active website files
- **Versioning** may increase storage costs
- **Encryption** has minimal cost impact
- **Data transfer** costs apply for CloudFront origin requests

Consider implementing lifecycle policies to manage costs for versioned objects.
