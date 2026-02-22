# IndexNow Integration Guide

## Overview

This guide provides comprehensive documentation for the IndexNow integration, which enables instant notification of search engines (Bing, Yandex, Seznam.cz, Naver) when website content is published or updated. The integration automatically submits URLs during deployment and provides manual submission tools for ad-hoc updates.

**Key Features:**
- Automatic submission during GitHub Actions deployment
- Manual submission script for testing and ad-hoc updates
- Comprehensive logging and statistics tracking
- API key validation and monitoring tools
- Secure configuration via GitHub Secrets

## Table of Contents

1. [Quick Start](#quick-start)
2. [Setup Instructions](#setup-instructions)
3. [Manual Submission Usage](#manual-submission-usage)
4. [Monitoring and Statistics](#monitoring-and-statistics)
5. [Troubleshooting](#troubleshooting)
6. [Error Codes and Resolution](#error-codes-and-resolution)
7. [API Reference](#api-reference)
8. [Security Considerations](#security-considerations)

---

## Quick Start

### Prerequisites

- Node.js 22.19.0 or higher
- GitHub repository with admin access (for GitHub Secrets)
- AWS credentials configured (for deployment pipeline)

### Initial Setup (5 minutes)

1. **Generate API Key**
   ```bash
   node scripts/generate-indexnow-key.js
   ```

2. **Add to GitHub Secrets**
   - Go to repository Settings → Secrets and variables → Actions
   - Create new secret: `INDEXNOW_API_KEY`
   - Paste the generated key value

3. **Commit and Deploy**
   ```bash
   git add public/*.txt
   git commit -m "Add IndexNow API key"
   git push origin main
   ```

4. **Verify Configuration**
   ```bash
   node scripts/validate-indexnow-key.js
   ```

That's it! IndexNow will now automatically submit URLs on every deployment.

---

## Setup Instructions

### Step 1: Generate IndexNow API Key

The IndexNow API key is a unique identifier that authenticates your submissions to search engines.

#### Generate the Key

Run the key generation script from your project root:

```bash
node scripts/generate-indexnow-key.js
```

#### Expected Output

```
✓ Generated IndexNow API key: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
✓ API key file created: public/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6.txt
✓ Key file will be deployed with your site and accessible via HTTPS

Next steps:
1. Add INDEXNOW_API_KEY to GitHub Secrets
2. Commit and push the public/*.txt file
3. Deploy your site
```

#### What This Does

- Generates a cryptographically secure 32-character hexadecimal key using Node.js `crypto.randomBytes()`
- Creates a text file at `/public/{api-key}.txt` containing only the key value
- The file will be deployed to CloudFront and publicly accessible (required by IndexNow protocol)

#### Important Notes

- **Save the API key value** - you'll need it for GitHub Secrets configuration
- **Commit the key file** - the `/public/{api-key}.txt` file must be in your repository
- **Public accessibility is required** - IndexNow verifies your key by fetching it via HTTPS

### Step 2: Configure GitHub Secrets

GitHub Secrets securely store sensitive values used in your deployment pipeline.

#### Add INDEXNOW_API_KEY Secret

1. **Navigate to Repository Settings**
   - Go to your GitHub repository
   - Click **Settings** (top navigation)
   - Click **Secrets and variables** → **Actions** (left sidebar)

2. **Create New Secret**
   - Click **New repository secret**
   - Name: `INDEXNOW_API_KEY` (case-sensitive)
   - Value: Paste the API key generated in Step 1
   - Click **Add secret**

#### Verify Secret Configuration

After adding the secret, you should see:

```
INDEXNOW_API_KEY
Updated X minutes ago
```

### Step 3: Commit and Deploy

Commit the API key file to your repository:

```bash
# Add the key file
git add public/*.txt

# Commit
git commit -m "Add IndexNow API key for search engine notifications"

# Push to trigger deployment
git push origin main
```

The GitHub Actions workflow will automatically:
1. Build the Next.js site
2. Deploy to S3
3. Invalidate CloudFront cache
4. Submit all URLs to IndexNow

### Step 4: Verify Configuration

After deployment completes, verify the configuration:

```bash
node scripts/validate-indexnow-key.js
```

#### Expected Output

```
=== IndexNow API Key Validation Results ===

1. Key File Existence
   ✓ PASS: Key file found at /path/to/public/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6.txt
   ✓ API Key: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6

2. API Key Format
   ✓ PASS: Key format is valid (32 characters, hexadecimal)

3. HTTPS Accessibility
   ✓ PASS: Key file accessible via HTTPS
   ✓ URL: https://d15sc9fc739ev2.cloudfront.net/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6.txt
   ✓ Status Code: 200

4. Content-Type Header
   ✓ PASS: Content-Type is correct
   ✓ Header: text/plain; charset=utf-8

5. File Content Verification
   ✓ PASS: File content matches expected key format

=== Overall Result ===

✓ SUCCESS: All validation checks passed!
✓ IndexNow API key is properly configured and accessible.
```

---

## Manual Submission Usage

The manual submission script allows you to submit URLs to IndexNow outside of the deployment pipeline, useful for testing, ad-hoc updates, or resubmitting specific pages.

### Basic Usage

#### Submit All Site URLs

```bash
export INDEXNOW_API_KEY="your-api-key-here"
node scripts/submit-indexnow.js --all
```

#### Submit URLs from File

```bash
# Create a file with URLs (one per line)
cat > urls.txt << EOF
https://d15sc9fc739ev2.cloudfront.net/new-page/
https://d15sc9fc739ev2.cloudfront.net/updated-page/
https://d15sc9fc739ev2.cloudfront.net/blog/new-post/
EOF

# Submit
export INDEXNOW_API_KEY="your-api-key-here"
node scripts/submit-indexnow.js --file urls.txt
```

#### Dry Run (Validate Without Submitting)

```bash
export INDEXNOW_API_KEY="your-api-key-here"
node scripts/submit-indexnow.js --all --dry-run
```

### Command-Line Options

| Option | Description | Example |
|--------|-------------|---------|
| `--file <path>` | Submit URLs from a newline-separated text file | `--file urls.txt` |
| `--all` | Submit all indexable URLs from the site | `--all` |
| `--dry-run` | Validate URLs without submitting to the API | `--dry-run` |
| `--help` | Display help message | `--help` |

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `INDEXNOW_API_KEY` | Yes* | - | Your IndexNow API key |
| `SITE_DOMAIN` | No | `vividmediacheshire.com` | Site domain |
| `CLOUDFRONT_DOMAIN` | No | `d15sc9fc739ev2.cloudfront.net` | CloudFront domain |

*Not required for `--dry-run` mode

### Example Commands

#### Test Configuration (Dry Run)

```bash
export INDEXNOW_API_KEY="a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
node scripts/submit-indexnow.js --all --dry-run
```

**Expected Output:**
```
IndexNow Submission Script
==========================

Domain: vividmediacheshire.com
CloudFront: d15sc9fc739ev2.cloudfront.net
Mode: DRY RUN (validation only)

Collecting all indexable URLs from site...
✓ Collected 25 URLs from sitemap

URLs to submit:
---------------
  1. https://d15sc9fc739ev2.cloudfront.net/
  2. https://d15sc9fc739ev2.cloudfront.net/services/
  3. https://d15sc9fc739ev2.cloudfront.net/blog/
  ... and 22 more

✓ DRY RUN: URLs validated successfully
✓ Total URLs: 25

No submission made (dry-run mode)
```

#### Submit Specific Pages

```bash
# Create URL list
echo "https://d15sc9fc739ev2.cloudfront.net/services/photography/" > updated-pages.txt
echo "https://d15sc9fc739ev2.cloudfront.net/blog/exploring-istock-data-deepmeta/" >> updated-pages.txt

# Submit
export INDEXNOW_API_KEY="a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
node scripts/submit-indexnow.js --file updated-pages.txt
```

**Expected Output:**
```
IndexNow Submission Script
==========================

Domain: vividmediacheshire.com
CloudFront: d15sc9fc739ev2.cloudfront.net
Mode: LIVE SUBMISSION

Reading URLs from file: updated-pages.txt
✓ Read 2 URLs from file

URLs to submit:
---------------
  1. https://d15sc9fc739ev2.cloudfront.net/services/photography/
  2. https://d15sc9fc739ev2.cloudfront.net/blog/exploring-istock-data-deepmeta/

Submitting to IndexNow API...

=== Submission Results ===

✓ Status: SUCCESS
✓ HTTP Status Code: 200
✓ URLs Submitted: 2
✓ Duration: 1234ms
```

### Exit Codes

| Code | Meaning | Description |
|------|---------|-------------|
| `0` | Success | All URLs submitted successfully |
| `1` | Failure | Validation error, API error, or missing configuration |

---

## Monitoring and Statistics

### Submission Logs

All IndexNow submissions are logged to `logs/indexnow-submissions.json` in JSON Lines format (one JSON object per line).

#### View Recent Submissions

```bash
# View last 10 submissions
tail -n 10 logs/indexnow-submissions.json

# Pretty print with jq
tail -n 10 logs/indexnow-submissions.json | jq
```

#### Log Entry Format

```json
{
  "timestamp": "2026-02-22T10:30:00.000Z",
  "deploymentId": "deploy-1708596600000",
  "urlCount": 25,
  "success": true,
  "statusCode": 200,
  "duration": 1234
}
```

#### Log Fields

| Field | Type | Description |
|-------|------|-------------|
| `timestamp` | string | ISO 8601 timestamp with milliseconds |
| `deploymentId` | string | Optional deployment identifier |
| `urlCount` | number | Number of URLs submitted |
| `success` | boolean | Whether submission was successful |
| `statusCode` | number | HTTP response status code |
| `error` | string | Error message (only present on failure) |
| `duration` | number | Request duration in milliseconds |

### Statistics Tracking

The logging service automatically tracks:
- Total submissions
- Successful submissions
- Failed submissions
- Success rate percentage
- Last successful submission timestamp
- Average URL count per submission

#### Success Rate Monitoring

The system automatically monitors success rates and logs warnings when the success rate falls below 90% over the last 10 submissions.

**Warning Example:**
```
WARNING: IndexNow success rate (85.0%) has fallen below 90% over the last 10 submissions
```

### Log File Rotation

Log files automatically rotate when they exceed 10MB:
- Current log: `logs/indexnow-submissions.json`
- Rotated logs: `logs/indexnow-submissions-{timestamp}.json`

Example:
```
logs/
├── indexnow-submissions.json (current)
├── indexnow-submissions-1708596600000.json (rotated)
└── indexnow-submissions-1708510200000.json (rotated)
```

### Deployment Logs

View IndexNow submission results in GitHub Actions:

1. Go to **Actions** tab in GitHub
2. Click on the latest deployment workflow
3. Expand the "Submit to IndexNow" step
4. Review submission output and results

---

## Troubleshooting

### Common Issues and Solutions

#### Issue: API Key Not Found

**Error Message:**
```
Error: INDEXNOW_API_KEY environment variable not set
```

**Solution:**
1. Verify the environment variable is set:
   ```bash
   echo $INDEXNOW_API_KEY
   ```
2. For GitHub Actions, verify the secret exists:
   - Go to Settings → Secrets and variables → Actions
   - Confirm `INDEXNOW_API_KEY` is listed
3. Ensure the secret name is exactly `INDEXNOW_API_KEY` (case-sensitive)

#### Issue: Invalid API Key Format

**Error Message:**
```
Error: Invalid API key format
```

**Solution:**
- API key must be 8-128 characters
- API key must contain only hexadecimal characters (0-9, a-f)
- Regenerate key if format is invalid:
  ```bash
  node scripts/generate-indexnow-key.js
  ```

#### Issue: Key File Not Accessible

**Error Message:**
```
Error: API key file not accessible via HTTPS
```

**Solution:**
1. Verify the key file is committed to `/public/{api-key}.txt`
2. Check the file was included in the build output:
   ```bash
   ls -la out/*.txt
   ```
3. Verify CloudFront distribution is deployed and active
4. Wait 15-20 minutes for CloudFront cache propagation
5. Test accessibility manually:
   ```bash
   curl https://d15sc9fc739ev2.cloudfront.net/{api-key}.txt
   ```

#### Issue: Rate Limit Exceeded

**Error Message:**
```
HTTP 429: Rate limit exceeded
```

**Solution:**
- IndexNow has rate limits per domain
- Wait before retrying (automatic retry not implemented)
- Rate limits are typically generous (thousands of URLs per day)
- For frequent updates, batch URLs together in fewer submissions

#### Issue: No URLs Collected

**Error Message:**
```
Error: No URLs to submit
```

**Solution:**
1. Verify sitemap.xml exists in build output:
   ```bash
   ls -la out/sitemap.xml
   ```
2. Check sitemap contains valid URLs:
   ```bash
   cat out/sitemap.xml
   ```
3. Ensure URLs match the configured domain
4. Verify URLs are not excluded (e.g., `/thank-you/` pages)

#### Issue: Deployment Continues Despite IndexNow Failure

**Behavior:**
Deployment completes successfully even when IndexNow submission fails.

**Explanation:**
This is intentional! The GitHub Actions workflow uses `continue-on-error: true` for the IndexNow step, ensuring that search engine notification failures don't block deployments.

**Solution:**
- Check deployment logs for IndexNow errors
- Review `logs/indexnow-submissions.json` for failure details
- Use manual submission script to retry:
  ```bash
  export INDEXNOW_API_KEY="your-api-key"
  node scripts/submit-indexnow.js --all
  ```

---

## Error Codes and Resolution

### HTTP Status Codes

| Code | Meaning | Description | Resolution |
|------|---------|-------------|------------|
| `200` | OK | URLs successfully submitted | No action needed |
| `202` | Accepted | URLs accepted for processing | No action needed (treated as success) |
| `400` | Bad Request | Invalid request format | Check URL format and payload structure |
| `403` | Forbidden | Invalid API key | Verify API key is correct and file is accessible |
| `422` | Unprocessable Entity | Invalid URLs in submission | Check URL format, domain, and protocol |
| `429` | Too Many Requests | Rate limit exceeded | Wait before retrying, reduce submission frequency |
| `500` | Internal Server Error | IndexNow service error | Retry later, check IndexNow status |

### Detailed Error Resolution

#### 400 Bad Request

**Cause:** Invalid request format or missing required fields

**Resolution:**
1. Verify the request payload includes all required fields:
   - `host`: Domain name (e.g., `vividmediacheshire.com`)
   - `key`: API key value
   - `keyLocation`: Full HTTPS URL to key file
   - `urlList`: Array of URLs
2. Check URL format (must be absolute HTTPS URLs)
3. Ensure JSON payload is properly formatted

#### 403 Forbidden

**Cause:** API key validation failed

**Resolution:**
1. Verify API key file is accessible:
   ```bash
   node scripts/validate-indexnow-key.js
   ```
2. Check that key file content matches the key value
3. Ensure key file is served with correct Content-Type:
   ```bash
   curl -I https://d15sc9fc739ev2.cloudfront.net/{api-key}.txt
   ```
4. Wait for CloudFront cache propagation (15-20 minutes after deployment)

#### 422 Unprocessable Entity

**Cause:** Invalid URLs in the submission

**Resolution:**
1. Verify all URLs use HTTPS protocol
2. Check URLs match the configured domain
3. Ensure URLs include trailing slashes (if required by site)
4. Remove any malformed or invalid URLs
5. Test with dry-run mode:
   ```bash
   node scripts/submit-indexnow.js --all --dry-run
   ```

#### 429 Too Many Requests

**Cause:** Rate limit exceeded

**Resolution:**
1. Wait before retrying (no automatic retry implemented)
2. Reduce submission frequency
3. Batch multiple updates into fewer submissions
4. Check if multiple deployments are running simultaneously
5. Review submission logs to identify patterns:
   ```bash
   grep "429" logs/indexnow-submissions.json
   ```

#### 500 Internal Server Error

**Cause:** IndexNow service experiencing issues

**Resolution:**
1. Retry the submission after a few minutes
2. Check IndexNow service status at https://www.indexnow.org/
3. If persistent, wait for service recovery
4. Monitor submission logs for success rate trends

### Network Errors

#### Connection Timeout

**Error Message:**
```
Error: Request timeout after 30 seconds
```

**Resolution:**
1. Check internet connectivity
2. Verify DNS resolution for `api.indexnow.org`
3. Check firewall rules allow HTTPS outbound connections
4. Retry the submission

#### DNS Resolution Failure

**Error Message:**
```
Error: getaddrinfo ENOTFOUND api.indexnow.org
```

**Resolution:**
1. Verify DNS configuration
2. Test DNS resolution:
   ```bash
   nslookup api.indexnow.org
   ```
3. Check network connectivity
4. Retry after network issues are resolved

---

## API Reference

### IndexNow API Endpoint

**URL:** `https://api.indexnow.org/indexnow`

**Method:** `POST`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "host": "vividmediacheshire.com",
  "key": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
  "keyLocation": "https://d15sc9fc739ev2.cloudfront.net/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6.txt",
  "urlList": [
    "https://d15sc9fc739ev2.cloudfront.net/",
    "https://d15sc9fc739ev2.cloudfront.net/services/",
    "https://d15sc9fc739ev2.cloudfront.net/blog/"
  ]
}
```

**Field Specifications:**

| Field | Type | Required | Description | Constraints |
|-------|------|----------|-------------|-------------|
| `host` | string | Yes | Domain name without protocol | Must match URL domain |
| `key` | string | Yes | API key value | 8-128 hex characters |
| `keyLocation` | string | Yes | Full HTTPS URL to key file | Must be accessible |
| `urlList` | array | Yes | URLs to submit | Max 10,000 per request |

### URL Requirements

- **Protocol:** Must use HTTPS
- **Domain:** Must match the `host` field
- **Format:** Absolute URLs (e.g., `https://domain.com/path/`)
- **Trailing Slash:** Consistent with site's canonical URL strategy
- **Limit:** Maximum 10,000 URLs per submission

### Excluded URLs

The following URLs are automatically excluded from submissions:

- URLs with `noindex` meta tags
- Conversion pages: `/thank-you/`
- URLs not matching the configured domain
- Duplicate URLs (automatically deduplicated)

---

## Security Considerations

### API Key Security

#### Storage

- ✅ **GitHub Secrets:** API key stored securely in GitHub Secrets
- ✅ **Environment Variables:** Accessed via environment variables (never hardcoded)
- ✅ **Log Redaction:** API keys automatically redacted from all log output
- ✅ **Public Key File:** The `/public/{api-key}.txt` file is intentionally public (required by IndexNow protocol)

#### Access Control

- **GitHub Secrets Access:** Only repository admins can view/edit secrets
- **Workflow Permissions:** Uses OIDC with IAM roles (no long-term AWS credentials)
- **Least Privilege:** Deployment pipeline has minimal required permissions

#### Best Practices

1. **Never commit API keys to code**
   ```bash
   # Bad
   const API_KEY = "a1b2c3d4e5f6g7h8";
   
   # Good
   const API_KEY = process.env.INDEXNOW_API_KEY;
   ```

2. **Use environment variables**
   ```bash
   export INDEXNOW_API_KEY="your-api-key"
   node scripts/submit-indexnow.js --all
   ```

3. **Rotate keys if compromised**
   ```bash
   # Generate new key
   node scripts/generate-indexnow-key.js
   
   # Update GitHub Secret
   # Commit and deploy new key file
   ```

### Credential Rotation

If you need to rotate your API key:

1. **Generate New Key**
   ```bash
   node scripts/generate-indexnow-key.js
   ```

2. **Update GitHub Secret**
   - Go to Settings → Secrets and variables → Actions
   - Edit `INDEXNOW_API_KEY`
   - Paste new key value

3. **Commit and Deploy**
   ```bash
   git add public/*.txt
   git commit -m "Rotate IndexNow API key"
   git push origin main
   ```

4. **Verify New Configuration**
   ```bash
   node scripts/validate-indexnow-key.js
   ```

### HTTPS Enforcement

- All API requests use HTTPS
- API key file served via CloudFront with HTTPS enforcement
- No plain HTTP communication

### Monitoring and Auditing

- All submissions logged with timestamps
- Success/failure tracking for audit trails
- Deployment logs available in GitHub Actions
- Log files stored in `logs/` directory (excluded from repository)

---

## Additional Resources

### Official Documentation

- **IndexNow Protocol:** https://www.indexnow.org/
- **API Documentation:** https://www.indexnow.org/documentation
- **Supported Search Engines:** Bing, Yandex, Seznam.cz, Naver

### Related Documentation

- **GitHub Secrets Setup:** [docs/indexnow-github-secrets-setup.md](./indexnow-github-secrets-setup.md)
- **GitHub Actions Secrets:** https://docs.github.com/en/actions/security-guides/encrypted-secrets
- **AWS S3 + CloudFront Deployment:** [AWS_S3_DEPLOYMENT_GUIDE.md](../AWS_S3_DEPLOYMENT_GUIDE.md)

### Project Scripts

| Script | Purpose | Documentation |
|--------|---------|---------------|
| `scripts/generate-indexnow-key.js` | Generate API key | [Setup Instructions](#step-1-generate-indexnow-api-key) |
| `scripts/submit-indexnow.js` | Manual submission | [Manual Submission Usage](#manual-submission-usage) |
| `scripts/validate-indexnow-key.js` | Validate configuration | [Step 4: Verify Configuration](#step-4-verify-configuration) |
| `scripts/lib/url-collector.js` | Collect URLs from sitemap | Internal module |
| `scripts/lib/indexnow-service.js` | Submit to IndexNow API | Internal module |
| `scripts/lib/indexnow-logger.js` | Logging and statistics | Internal module |

### Support and Troubleshooting

For issues or questions:

1. **Review deployment logs** in GitHub Actions
2. **Check submission logs** at `logs/indexnow-submissions.json`
3. **Run validation script** to verify configuration
4. **Consult troubleshooting section** in this guide
5. **Refer to IndexNow documentation** for protocol details

---

## Appendix: Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                     GitHub Actions Pipeline                      │
│  ┌────────────┐   ┌──────────────┐   ┌────────────────────┐   │
│  │   Build    │──▶│  Deploy to   │──▶│ CloudFront         │   │
│  │  Next.js   │   │  S3 Bucket   │   │ Invalidation       │   │
│  └────────────┘   └──────────────┘   └────────────────────┘   │
│                                              │                   │
│                                              ▼                   │
│                                    ┌────────────────────┐       │
│                                    │ IndexNow           │       │
│                                    │ Submission         │       │
│                                    └────────────────────┘       │
└─────────────────────────────────────────────────────────────────┘
                                              │
                                              ▼
                                    ┌────────────────────┐
                                    │  IndexNow API      │
                                    │  (api.indexnow.org)│
                                    └────────────────────┘
                                              │
                        ┌─────────────────────┼─────────────────────┐
                        ▼                     ▼                     ▼
                  ┌──────────┐         ┌──────────┐         ┌──────────┐
                  │   Bing   │         │  Yandex  │         │  Naver   │
                  └──────────┘         └──────────┘         └──────────┘
```

### Data Flow

1. **Deployment Trigger:** GitHub Actions workflow initiates deployment
2. **Build & Deploy:** Next.js static site is built and deployed to S3
3. **Cache Invalidation:** CloudFront cache is invalidated for updated content
4. **URL Collection:** System identifies all indexable URLs from sitemap
5. **IndexNow Submission:** URLs are submitted to IndexNow API endpoint
6. **Search Engine Notification:** IndexNow distributes notifications to participating search engines
7. **Logging:** Submission results are logged for monitoring and debugging

### Configuration Files

| File | Purpose |
|------|---------|
| `.github/workflows/s3-cloudfront-deploy.yml` | GitHub Actions deployment workflow |
| `public/{api-key}.txt` | IndexNow API key file (publicly accessible) |
| `logs/indexnow-submissions.json` | Submission logs (JSON Lines format) |
| `out/sitemap.xml` | Site sitemap (source for URL collection) |

---

**Last Updated:** February 22, 2026  
**Version:** 1.0.0  
**Maintained By:** Vivid Media Cheshire Development Team
