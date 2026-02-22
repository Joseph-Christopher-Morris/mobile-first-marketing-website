# IndexNow GitHub Secrets Configuration Guide

## Overview

This guide explains how to configure GitHub Secrets for the IndexNow integration, which enables automatic notification of search engines (Bing, Yandex, Seznam.cz, Naver) when website content is published or updated.

## Prerequisites

- GitHub repository with admin access
- Node.js 22.19.0 installed locally
- AWS credentials configured (for deployment pipeline)

## Step 1: Generate IndexNow API Key

The IndexNow API key is a unique identifier that authenticates your submissions to search engines.

### Generate the Key

Run the key generation script from your project root:

```bash
node scripts/generate-indexnow-key.js
```

**Expected Output:**
```
✓ Generated IndexNow API key: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
✓ API key file created: public/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6.txt
✓ Key file will be deployed with your site and accessible via HTTPS

Next steps:
1. Add INDEXNOW_API_KEY to GitHub Secrets
2. Commit and push the public/*.txt file
3. Deploy your site
```

### What This Does

- Generates a cryptographically secure 32-character hexadecimal key
- Creates a text file in `/public/{api-key}.txt` containing only the key value
- The file will be deployed to CloudFront and publicly accessible (required by IndexNow protocol)

### Important Notes

- **Save the API key value** - you'll need it for GitHub Secrets configuration
- **Commit the key file** - the `/public/{api-key}.txt` file must be in your repository
- **Public accessibility is required** - IndexNow verifies your key by fetching it via HTTPS

## Step 2: Add GitHub Secret

GitHub Secrets securely store sensitive values used in your deployment pipeline.

### Add INDEXNOW_API_KEY Secret

1. **Navigate to Repository Settings**
   - Go to your GitHub repository
   - Click **Settings** (top navigation)
   - Click **Secrets and variables** → **Actions** (left sidebar)

2. **Create New Secret**
   - Click **New repository secret**
   - Name: `INDEXNOW_API_KEY`
   - Value: Paste the API key generated in Step 1 (e.g., `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`)
   - Click **Add secret**

### Verify Secret Configuration

After adding the secret, you should see:

```
INDEXNOW_API_KEY
Updated X minutes ago
```

## Step 3: Environment Variables in Deployment Pipeline

The GitHub Actions workflow automatically uses the following environment variables:

### Required Variables

| Variable | Source | Description |
|----------|--------|-------------|
| `INDEXNOW_API_KEY` | GitHub Secret | Your IndexNow API key (configured in Step 2) |
| `SITE_DOMAIN` | Hardcoded in workflow | Site domain: `vividmediacheshire.com` |
| `CLOUDFRONT_DOMAIN` | Hardcoded in workflow | CloudFront domain: `d15sc9fc739ev2.cloudfront.net` |

### Workflow Configuration

The IndexNow submission step in `.github/workflows/s3-cloudfront-deploy.yml`:

```yaml
- name: Submit to IndexNow
  run: node scripts/submit-indexnow.js --all
  env:
    INDEXNOW_API_KEY: ${{ secrets.INDEXNOW_API_KEY }}
    SITE_DOMAIN: vividmediacheshire.com
    CLOUDFRONT_DOMAIN: d15sc9fc739ev2.cloudfront.net
  continue-on-error: true
```

### How It Works

1. **Automatic Execution**: Runs after CloudFront invalidation during deployment
2. **Non-Blocking**: Uses `continue-on-error: true` so deployment succeeds even if IndexNow fails
3. **Secure**: API key is never exposed in logs or console output
4. **Logging**: Results are logged to `logs/indexnow-submissions.json`

## Step 4: Verify Configuration

### Local Verification (Optional)

Test the configuration locally before deployment:

```bash
# Set environment variable
export INDEXNOW_API_KEY="your-api-key-here"

# Dry run (validates without submitting)
node scripts/submit-indexnow.js --all --dry-run
```

**Expected Output:**
```
✓ API key validated
✓ Collected 25 URLs from sitemap
✓ All URLs validated successfully

URLs to be submitted:
  - https://d15sc9fc739ev2.cloudfront.net/
  - https://d15sc9fc739ev2.cloudfront.net/services/
  - https://d15sc9fc739ev2.cloudfront.net/blog/
  ...

Dry run complete. No URLs were submitted.
```

### Post-Deployment Verification

After your first deployment with IndexNow configured:

1. **Check Deployment Logs**
   - Go to **Actions** tab in GitHub
   - Click on the latest deployment workflow
   - Expand the "Submit to IndexNow" step
   - Verify successful submission

2. **Verify API Key File Accessibility**
   ```bash
   node scripts/validate-indexnow-key.js
   ```

   **Expected Output:**
   ```
   ✓ API key file accessible via HTTPS
   ✓ Content-Type: text/plain; charset=utf-8
   ✓ Key value matches expected format
   ✓ Configuration is valid
   ```

3. **Check Submission Logs**
   ```bash
   cat logs/indexnow-submissions.json
   ```

   **Example Log Entry:**
   ```json
   {"timestamp":"2026-02-22T10:30:00.000Z","urlCount":25,"success":true,"statusCode":200,"duration":1234}
   ```

## Security Best Practices

### API Key Security

- ✅ **Store in GitHub Secrets** - Never commit API keys to code
- ✅ **Redacted in Logs** - API key values are automatically redacted from all log output
- ✅ **Public Key File** - The `/public/{api-key}.txt` file is intentionally public (required by IndexNow)
- ✅ **HTTPS Only** - Key file is served via CloudFront with HTTPS enforcement

### Access Control

- **GitHub Secrets Access**: Only repository admins can view/edit secrets
- **Workflow Permissions**: Uses OIDC with IAM roles (no long-term AWS credentials)
- **Least Privilege**: Deployment pipeline has minimal required permissions

### Credential Rotation

If you need to rotate your API key:

1. Generate a new key: `node scripts/generate-indexnow-key.js`
2. Update GitHub Secret with new value
3. Commit and push the new key file
4. Deploy to production

## Troubleshooting

### Secret Not Found Error

**Error Message:**
```
Error: INDEXNOW_API_KEY environment variable not set
```

**Solution:**
- Verify the secret name is exactly `INDEXNOW_API_KEY` (case-sensitive)
- Check that the secret is added to the correct repository
- Ensure the workflow has access to repository secrets

### API Key Validation Failed

**Error Message:**
```
Error: Invalid API key format
```

**Solution:**
- API key must be 8-128 characters
- API key must contain only hexadecimal characters (0-9, a-f)
- Regenerate key if format is invalid

### Key File Not Accessible

**Error Message:**
```
Error: API key file not accessible via HTTPS
```

**Solution:**
- Ensure the key file is committed to `/public/{api-key}.txt`
- Verify the file was included in the build output (`out/` directory)
- Check CloudFront distribution is deployed and active
- Wait 15-20 minutes for CloudFront cache propagation

### Rate Limit Errors

**Error Message:**
```
HTTP 429: Rate limit exceeded
```

**Solution:**
- IndexNow has rate limits per domain
- Wait before retrying (automatic retry not implemented)
- Use manual script for ad-hoc submissions: `node scripts/submit-indexnow.js --all`

## Manual Submission

For testing or ad-hoc URL submissions outside the deployment pipeline:

### Submit All Site URLs

```bash
export INDEXNOW_API_KEY="your-api-key-here"
node scripts/submit-indexnow.js --all
```

### Submit Specific URLs from File

```bash
# Create a file with URLs (one per line)
echo "https://d15sc9fc739ev2.cloudfront.net/new-page/" > urls.txt

# Submit
export INDEXNOW_API_KEY="your-api-key-here"
node scripts/submit-indexnow.js --file urls.txt
```

### Dry Run (Validate Without Submitting)

```bash
export INDEXNOW_API_KEY="your-api-key-here"
node scripts/submit-indexnow.js --all --dry-run
```

## Monitoring and Maintenance

### Check Submission History

View recent submissions:

```bash
tail -n 10 logs/indexnow-submissions.json | jq
```

### Monitor Success Rate

The logging service automatically tracks:
- Total submissions
- Successful submissions
- Failed submissions
- Success rate percentage
- Last successful submission timestamp

**Warning Threshold**: If success rate falls below 90% over the last 10 submissions, a warning is logged.

### Log File Rotation

- Log files automatically rotate when they exceed 10MB
- Rotated files are named: `indexnow-submissions-{timestamp}.json`
- Old log files can be archived or deleted as needed

## Additional Resources

- **IndexNow Protocol**: https://www.indexnow.org/
- **Supported Search Engines**: Bing, Yandex, Seznam.cz, Naver
- **API Documentation**: https://www.indexnow.org/documentation
- **GitHub Actions Secrets**: https://docs.github.com/en/actions/security-guides/encrypted-secrets

## Support

For issues or questions:
- Review deployment logs in GitHub Actions
- Check `logs/indexnow-submissions.json` for submission history
- Run validation script: `node scripts/validate-indexnow-key.js`
- Refer to IndexNow API documentation for protocol details
