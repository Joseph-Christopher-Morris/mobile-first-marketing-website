# Requirements Document

## Introduction

This feature enables the CloudFront distribution (E2IBMHQ3GCW6ZK) to serve content via the custom domain vividmediacheshire.com instead of the default CloudFront domain d15sc9fc739ev2.cloudfront.net. This is required to fix IndexNow API submission failures caused by domain mismatch between the host domain and key location URL.

## Glossary

- **CloudFront_Distribution**: The AWS CloudFront CDN distribution (ID: E2IBMHQ3GCW6ZK) that serves the static website content
- **Custom_Domain**: The domain name vividmediacheshire.com that will be configured as an alternate domain name (CNAME) for the CloudFront distribution
- **ACM_Certificate**: AWS Certificate Manager SSL/TLS certificate required for HTTPS traffic on the custom domain
- **DNS_Provider**: The domain registrar or DNS hosting service managing vividmediacheshire.com DNS records
- **CNAME_Record**: DNS record type that maps the custom domain to the CloudFront distribution domain
- **IndexNow_Service**: The search engine indexing notification service that requires matching host and keyLocation domains
- **Key_Location_URL**: The URL where the IndexNow API key file is hosted, must match the submission host domain

## Requirements

### Requirement 1: SSL/TLS Certificate Provisioning

**User Story:** As a site administrator, I want an SSL/TLS certificate for vividmediacheshire.com, so that the custom domain can serve HTTPS traffic through CloudFront.

#### Acceptance Criteria

1. THE ACM_Certificate SHALL be requested in the us-east-1 region
2. WHEN the certificate is requested, THE ACM_Certificate SHALL include vividmediacheshire.com as the primary domain
3. WHEN the certificate is requested, THE ACM_Certificate SHALL include www.vividmediacheshire.com as a subject alternative name
4. THE ACM_Certificate SHALL use DNS validation method
5. WHEN DNS validation records are created, THE DNS_Provider SHALL have the required CNAME records added
6. WHEN validation is complete, THE ACM_Certificate SHALL have status "Issued"

### Requirement 2: CloudFront Distribution Configuration

**User Story:** As a site administrator, I want CloudFront to accept requests for vividmediacheshire.com, so that users can access the site via the custom domain.

#### Acceptance Criteria

1. THE CloudFront_Distribution SHALL include vividmediacheshire.com as an alternate domain name (CNAME)
2. THE CloudFront_Distribution SHALL include www.vividmediacheshire.com as an alternate domain name (CNAME)
3. WHEN the alternate domain names are configured, THE CloudFront_Distribution SHALL associate the ACM_Certificate
4. THE CloudFront_Distribution SHALL maintain existing security settings including OAC (E3OSELXP6A7ZL6)
5. THE CloudFront_Distribution SHALL maintain existing cache behaviors and origin settings
6. WHEN configuration changes are applied, THE CloudFront_Distribution SHALL complete deployment within 15 minutes

### Requirement 3: DNS Configuration

**User Story:** As a site administrator, I want DNS records pointing to CloudFront, so that domain requests route to the correct distribution.

#### Acceptance Criteria

1. THE DNS_Provider SHALL have an A record or CNAME record for vividmediacheshire.com pointing to d15sc9fc739ev2.cloudfront.net
2. THE DNS_Provider SHALL have a CNAME record for www.vividmediacheshire.com pointing to d15sc9fc739ev2.cloudfront.net
3. WHEN DNS records are queried, THE DNS_Provider SHALL return the CloudFront distribution domain within 300 seconds (TTL)
4. THE DNS_Provider SHALL maintain existing DNS records for other services

### Requirement 4: Custom Domain Verification

**User Story:** As a site administrator, I want to verify the custom domain is working correctly, so that I can confirm the configuration is complete.

#### Acceptance Criteria

1. WHEN an HTTPS request is made to https://vividmediacheshire.com, THE CloudFront_Distribution SHALL return HTTP status 200
2. WHEN an HTTPS request is made to https://www.vividmediacheshire.com, THE CloudFront_Distribution SHALL return HTTP status 200
3. WHEN an HTTPS request is made to the custom domain, THE CloudFront_Distribution SHALL serve the same content as d15sc9fc739ev2.cloudfront.net
4. WHEN an HTTPS request is made to the custom domain, THE ACM_Certificate SHALL be valid and trusted
5. WHEN the IndexNow key file is requested at https://vividmediacheshire.com/{key}.txt, THE CloudFront_Distribution SHALL return HTTP status 200
6. THE CloudFront_Distribution SHALL respond to custom domain requests within 500ms for cached content

### Requirement 5: IndexNow Integration Update

**User Story:** As a site administrator, I want IndexNow submissions to use the custom domain, so that API submissions succeed without domain mismatch errors.

#### Acceptance Criteria

1. WHEN IndexNow submissions are made, THE IndexNow_Service SHALL use vividmediacheshire.com as the host domain
2. WHEN IndexNow submissions are made, THE Key_Location_URL SHALL use https://vividmediacheshire.com/{key}.txt
3. WHEN IndexNow API validates the key, THE IndexNow_Service SHALL successfully retrieve the key file from the custom domain
4. WHEN IndexNow submissions are made with matching domains, THE IndexNow_Service SHALL return HTTP status 200 or 202
5. THE IndexNow_Service SHALL not return HTTP status 422 (domain mismatch error)

### Requirement 6: Deployment Automation

**User Story:** As a developer, I want automated scripts for custom domain setup, so that the configuration can be applied consistently and documented.

#### Acceptance Criteria

1. THE setup script SHALL request the ACM certificate with DNS validation
2. THE setup script SHALL output DNS validation records for manual configuration
3. THE setup script SHALL wait for certificate validation before proceeding
4. THE setup script SHALL update the CloudFront distribution with alternate domain names and certificate ARN
5. THE setup script SHALL output required DNS records for domain routing
6. WHEN the setup script completes, THE setup script SHALL verify the custom domain is accessible
7. IF any step fails, THEN THE setup script SHALL provide clear error messages and rollback instructions

### Requirement 7: Documentation

**User Story:** As a team member, I want comprehensive documentation for custom domain setup, so that the process can be repeated or troubleshot.

#### Acceptance Criteria

1. THE documentation SHALL include step-by-step instructions for certificate request and validation
2. THE documentation SHALL include DNS record configuration examples
3. THE documentation SHALL include CloudFront configuration changes
4. THE documentation SHALL include verification steps and expected results
5. THE documentation SHALL include troubleshooting guidance for common issues
6. THE documentation SHALL include rollback procedures if custom domain needs to be removed
