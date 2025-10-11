# GitHub Actions AWS Setup Guide

This guide explains how to configure AWS credentials and security for the GitHub Actions deployment pipeline using OIDC (OpenID Connect) authentication.

## Overview

The deployment pipeline uses AWS IAM roles with OIDC authentication instead of long-term access keys for enhanced security. This follows AWS security best practices and eliminates the need to store sensitive credentials.

## Prerequisites

- AWS CLI installed and configured with administrative access
- GitHub repository with Actions enabled
- AWS account with permissions to create IAM roles and policies

## Step 1: Create IAM Policy for Deployment

Create a minimal permissions policy for the deployment pipeline:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "S3BucketAccess",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket",
        "s3:GetBucketLocation",
        "s3:PutObjectAcl"
      ],
      "Resource": [
        "arn:aws:s3:::mobile-marketing-site-*",
        "arn:aws:s3:::mobile-marketing-site-*/*"
      ]
    },
    {
      "Sid": "CloudFrontAccess",
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation",
        "cloudfront:GetInvalidation",
        "cloudfront:ListInvalidations",
        "cloudfront:GetDistribution",
        "cloudfront:GetDistributionConfig"
      ],
      "Resource": "*"
    },
    {
      "Sid": "CloudWatchLogs",
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "logs:DescribeLogGroups",
        "logs:DescribeLogStreams"
      ],
      "Resource": "arn:aws:logs:*:*:log-group:/aws/github-actions/*"
    }
  ]
}
```

## Step 2: Create OIDC Identity Provider

1. Go to AWS IAM Console → Identity providers
2. Click "Add provider"
3. Select "OpenID Connect"
4. Provider URL: `https://token.actions.githubusercontent.com`
5. Audience: `sts.amazonaws.com`
6. Click "Add provider"

## Step 3: Create IAM Role for GitHub Actions

Create an IAM role that can be assumed by GitHub Actions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::ACCOUNT-ID:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:YOUR-GITHUB-USERNAME/YOUR-REPO-NAME:ref:refs/heads/main"
        }
      }
    }
  ]
}
```

Replace:
- `ACCOUNT-ID` with your AWS account ID
- `YOUR-GITHUB-USERNAME` with your GitHub username
- `YOUR-REPO-NAME` with your repository name

## Step 4: Configure GitHub Secrets

Add the following secrets to your GitHub repository (Settings → Secrets and variables → Actions):

### Required Secrets

1. **AWS_ROLE_ARN**
   - Value: `arn:aws:iam::ACCOUNT-ID:role/GitHubActionsDeploymentRole`
   - Description: ARN of the IAM role created in Step 3

2. **SITE_URL**
   - Value: Your CloudFront distribution URL (e.g., `https://d1234567890.cloudfront.net`)
   - Description: URL for post-deployment validation

### Optional Secrets (for staging environment)

3. **STAGING_SITE_URL**
   - Value: Your staging CloudFront distribution URL
   - Description: URL for staging environment validation

## Step 5: Verify Setup

Run the setup verification script to ensure everything is configured correctly:

```bash
node scripts/github-actions-setup-validator.js
```

## Security Best Practices

### Principle of Least Privilege
- The IAM policy grants only the minimum permissions required
- Access is restricted to specific S3 buckets and CloudFront distributions
- Role can only be assumed from the main branch of your repository

### Credential Security
- No long-term access keys are stored in GitHub Secrets
- OIDC tokens are short-lived and automatically rotated
- All API calls are logged in CloudTrail for auditing

### Branch Protection
- The trust policy restricts access to the main branch only
- Consider adding branch protection rules to prevent unauthorized deployments

## Troubleshooting

### Common Issues

1. **Role assumption fails**
   - Verify the OIDC provider is correctly configured
   - Check that the trust policy matches your repository exactly
   - Ensure the GitHub Actions workflow has the correct permissions

2. **S3 access denied**
   - Verify the S3 bucket names match the policy
   - Check that the bucket exists and is in the correct region
   - Ensure the role has the deployment policy attached

3. **CloudFront invalidation fails**
   - Verify the distribution ID is correct
   - Check that the role has CloudFront permissions
   - Ensure the distribution is in a deployable state

### Debug Commands

```bash
# Test AWS credentials in GitHub Actions
aws sts get-caller-identity

# Verify S3 access
aws s3 ls s3://your-bucket-name

# Check CloudFront distributions
aws cloudfront list-distributions --query 'DistributionList.Items[].{Id:Id,DomainName:DomainName,Status:Status}'
```

## Monitoring and Alerting

The deployment pipeline includes built-in monitoring:

- CloudWatch logs for all deployment activities
- Post-deployment health checks
- Security header validation
- Performance budget validation
- Automatic rollback on critical failures

## Next Steps

After completing this setup:

1. Test the deployment pipeline with a small change
2. Monitor the first few deployments closely
3. Set up additional monitoring and alerting as needed
4. Document any environment-specific configurations
5. Train team members on the new deployment process