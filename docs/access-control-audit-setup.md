# Access Control and Audit Logging Setup Guide

This guide covers the implementation of comprehensive access control and audit
logging for the S3/CloudFront deployment infrastructure.

## Overview

The access control and audit logging system implements:

- **Least Privilege IAM Policies**: Minimal permissions for deployment and
  monitoring operations
- **S3 Bucket Policies**: CloudFront-only access with direct access denial
- **Comprehensive Audit Logging**: S3 access logs, CloudTrail API auditing, and
  CloudWatch log aggregation

## Security Architecture

### Access Control Model

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   GitHub Actions │    │   CloudFront     │    │   End Users     │
│   (Deployment)   │    │   Distribution   │    │                 │
└─────────┬───────┘    └────────┬─────────┘    └─────────────────┘
          │                     │
          │ IAM Role            │ OAC
          │ (Least Privilege)   │ (Origin Access Control)
          │                     │
          ▼                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Private S3 Bucket                           │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │  Bucket Policy  │  │  Access Logging │  │  Event Notif.   │ │
│  │  (CF-only)      │  │  (Audit Trail)  │  │  (Security)     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
          │                     │                     │
          ▼                     ▼                     ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CloudTrail    │    │  S3 Access Logs │    │  CloudWatch     │
│   (API Audit)   │    │  (Request Logs) │    │  (Log Groups)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## IAM Policies

### Deployment Policy

The deployment policy provides minimal permissions for CI/CD operations:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "S3BucketListAccess",
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket",
        "s3:GetBucketLocation",
        "s3:GetBucketVersioning"
      ],
      "Resource": "arn:aws:s3:::bucket-name"
    },
    {
      "Sid": "S3ObjectAccess",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:PutObjectAcl"
      ],
      "Resource": "arn:aws:s3:::bucket-name/*",
      "Condition": {
        "StringEquals": {
          "s3:x-amz-server-side-encryption": "AES256"
        }
      }
    },
    {
      "Sid": "CloudFrontInvalidationAccess",
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation",
        "cloudfront:GetInvalidation",
        "cloudfront:ListInvalidations"
      ],
      "Resource": "arn:aws:cloudfront::account-id:distribution/distribution-id"
    }
  ]
}
```

### Monitoring Policy

The monitoring policy provides read-only access for audit and monitoring:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "CloudWatchMetricsAccess",
      "Effect": "Allow",
      "Action": [
        "cloudwatch:GetMetricStatistics",
        "cloudwatch:ListMetrics",
        "cloudwatch:GetMetricData"
      ],
      "Resource": "*",
      "Condition": {
        "StringLike": {
          "cloudwatch:namespace": ["AWS/S3", "AWS/CloudFront"]
        }
      }
    },
    {
      "Sid": "CloudTrailReadAccess",
      "Effect": "Allow",
      "Action": ["cloudtrail:LookupEvents", "cloudtrail:GetTrailStatus"],
      "Resource": "*"
    }
  ]
}
```

## S3 Bucket Policy

The S3 bucket policy enforces CloudFront-only access:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::bucket-name/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::account-id:distribution/distribution-id"
        }
      }
    },
    {
      "Sid": "DenyDirectPublicAccess",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:*",
      "Resource": ["arn:aws:s3:::bucket-name", "arn:aws:s3:::bucket-name/*"],
      "Condition": {
        "StringNotEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::account-id:distribution/distribution-id"
        },
        "Bool": {
          "aws:ViaAWSService": "false"
        }
      }
    },
    {
      "Sid": "AllowSSLRequestsOnly",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:*",
      "Resource": ["arn:aws:s3:::bucket-name", "arn:aws:s3:::bucket-name/*"],
      "Condition": {
        "Bool": {
          "aws:SecureTransport": "false"
        }
      }
    }
  ]
}
```

## Audit Logging Components

### 1. S3 Access Logging

- **Purpose**: Log all requests to the S3 bucket
- **Target Bucket**: `{bucket-name}-access-logs`
- **Log Format**: Standard S3 access log format
- **Retention**: 90 days (configurable)

### 2. CloudTrail API Auditing

- **Purpose**: Log all API calls related to S3 and CloudFront
- **Trail Name**: `{environment}-s3-cloudfront-audit-trail`
- **Data Events**: Enabled for S3 objects and buckets
- **Management Events**: Enabled for CloudFront operations

### 3. CloudWatch Log Groups

The following log groups are created for centralized logging:

- `/aws/s3/{bucket-name}/access-logs` (90 days retention)
- `/aws/cloudfront/distribution/{distribution-id}` (30 days retention)
- `/aws/deployment/{environment}/audit` (365 days retention)
- `/aws/security/{environment}/access-control` (365 days retention)

## Setup Instructions

### 1. Run Access Control Setup

```bash
# Set environment variables
export AWS_REGION=us-east-1
export ENVIRONMENT=production

# Run the setup script
node scripts/setup-access-control-audit.js
```

### 2. Validate Configuration

```bash
# Run validation script
node scripts/validate-access-control-audit.js
```

### 3. Monitor Setup

```bash
# Check CloudTrail status
aws cloudtrail get-trail-status --name production-s3-cloudfront-audit-trail

# Check S3 access logging
aws s3api get-bucket-logging --bucket your-bucket-name

# List CloudWatch log groups
aws logs describe-log-groups --log-group-name-prefix "/aws/s3/"
```

## Security Features

### Access Control

- ✅ **CloudFront-only Access**: S3 bucket only accessible via CloudFront
- ✅ **SSL/TLS Only**: All requests must use HTTPS
- ✅ **Public Access Blocked**: All public access settings disabled
- ✅ **Least Privilege IAM**: Minimal permissions for all operations

### Audit Logging

- ✅ **Request Logging**: All S3 requests logged with details
- ✅ **API Auditing**: All AWS API calls tracked via CloudTrail
- ✅ **Centralized Logs**: All logs aggregated in CloudWatch
- ✅ **Log Retention**: Appropriate retention periods for compliance

### Monitoring

- ✅ **Real-time Alerts**: CloudWatch alarms for security events
- ✅ **Access Patterns**: Analysis of access logs for anomalies
- ✅ **Cost Monitoring**: Track costs and usage patterns
- ✅ **Performance Metrics**: Monitor response times and error rates

## Validation Checklist

Use this checklist to verify proper setup:

### IAM Policies

- [ ] Deployment policy created with least privilege
- [ ] Monitoring policy created for audit access
- [ ] Policies attached to appropriate roles
- [ ] No overly permissive policies

### S3 Security

- [ ] Bucket policy allows CloudFront-only access
- [ ] Public access block enabled on bucket
- [ ] SSL-only access enforced
- [ ] Access logging enabled

### Audit Logging

- [ ] CloudTrail created and logging enabled
- [ ] S3 data events configured in CloudTrail
- [ ] CloudWatch log groups created
- [ ] Log retention policies set

### Access Control Testing

- [ ] Direct S3 access properly denied
- [ ] CloudFront access working correctly
- [ ] HTTPS redirect functioning
- [ ] Error pages configured

## Troubleshooting

### Common Issues

1. **Direct S3 Access Still Works**
   - Check bucket policy is applied correctly
   - Verify public access block settings
   - Ensure CloudFront OAC is configured

2. **CloudTrail Not Logging S3 Events**
   - Verify event selectors include S3 data events
   - Check CloudTrail is enabled and logging
   - Confirm S3 bucket ARN in event selectors

3. **Missing Log Groups**
   - Run the setup script again
   - Check CloudWatch Logs permissions
   - Verify log group names match configuration

4. **IAM Permission Errors**
   - Review IAM policy statements
   - Check resource ARNs are correct
   - Verify conditions are not too restrictive

### Validation Commands

```bash
# Test direct S3 access (should fail)
curl -I https://your-bucket-name.s3.amazonaws.com/index.html

# Test CloudFront access (should work)
curl -I https://your-cloudfront-domain.cloudfront.net/

# Check CloudTrail events
aws cloudtrail lookup-events --lookup-attributes AttributeKey=ResourceName,AttributeValue=your-bucket-name

# Analyze access logs
aws s3 cp s3://your-bucket-name-logs/access-logs/ . --recursive
```

## Compliance and Best Practices

### Security Standards

- **AWS Well-Architected Framework**: Security pillar compliance
- **OWASP**: Web application security best practices
- **NIST**: Cybersecurity framework alignment
- **SOC 2**: Audit logging and access control requirements

### Best Practices

1. **Regular Audits**: Review access logs and CloudTrail events monthly
2. **Policy Reviews**: Audit IAM policies quarterly
3. **Access Monitoring**: Set up alerts for unusual access patterns
4. **Incident Response**: Document procedures for security incidents
5. **Backup Verification**: Test log backup and recovery procedures

## Maintenance

### Regular Tasks

- **Weekly**: Review CloudWatch alarms and metrics
- **Monthly**: Analyze access logs for patterns and anomalies
- **Quarterly**: Review and update IAM policies
- **Annually**: Conduct comprehensive security audit

### Log Management

- **Rotation**: Logs automatically rotated based on retention policies
- **Archival**: Old logs moved to cheaper storage classes
- **Analysis**: Regular analysis for security insights
- **Alerting**: Automated alerts for suspicious activities

## Cost Optimization

### Storage Costs

- S3 access logs: ~$0.023 per GB stored
- CloudTrail logs: ~$2.00 per 100,000 events
- CloudWatch Logs: ~$0.50 per GB ingested

### Optimization Strategies

1. **Log Filtering**: Only log necessary events
2. **Retention Policies**: Set appropriate retention periods
3. **Storage Classes**: Use cheaper storage for archived logs
4. **Compression**: Enable log compression where possible

## Support and Resources

### Documentation

- [AWS S3 Security Best Practices](https://docs.aws.amazon.com/s3/latest/userguide/security-best-practices.html)
- [CloudFront Security](https://docs.aws.amazon.com/cloudfront/latest/developerguide/security.html)
- [CloudTrail User Guide](https://docs.aws.amazon.com/cloudtrail/latest/userguide/)
- [IAM Best Practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)

### Scripts and Tools

- `scripts/setup-access-control-audit.js` - Main setup script
- `scripts/validate-access-control-audit.js` - Validation script
- `scripts/analyze-logs.js` - Log analysis tool (created by logging setup)
- `scripts/setup-logging-audit.js` - Comprehensive logging setup

### Getting Help

For issues with access control and audit logging:

1. Check the troubleshooting section above
2. Review AWS CloudTrail and CloudWatch logs
3. Run the validation script for detailed diagnostics
4. Consult AWS documentation for specific services
