# CloudFront Functions

This directory contains CloudFront Functions that run at edge locations to modify requests and responses.

## What are CloudFront Functions?

CloudFront Functions are lightweight JavaScript functions that run at CloudFront edge locations. They execute in less than 1 millisecond and are ideal for:

- URL redirects and rewrites
- Request/response header manipulation
- Simple authentication checks
- A/B testing and feature flags

## Active Functions

### redirect-hosting-to-website-hosting.js

**Purpose**: Redirects the artifact URL `/services/hosting/` to the canonical URL `/services/website-hosting/` with HTTP 301 status.

**Event Type**: viewer-request

**Requirements Addressed**:
- 2.2: Exclude artifact URL /services/hosting/ from sitemap
- 2.5: Improve Google Search Console coverage
- 2.6: Redirect artifact URL with HTTP 301 status

**Behavior**:
- Intercepts requests to `/services/hosting` and `/services/hosting/`
- Returns 301 redirect response to `/services/website-hosting/`
- All other requests pass through unchanged

**Testing**:
```bash
# Test redirect
curl -I https://d15sc9fc739ev2.cloudfront.net/services/hosting/

# Expected: HTTP 301 with Location: /services/website-hosting/
```

## Deployment

### Automated Deployment (Recommended)

Use the deployment script to automatically deploy CloudFront Functions:

```bash
export CLOUDFRONT_DISTRIBUTION_ID="E2IBMHQ3GCW6ZK"
export AWS_REGION="us-east-1"

node scripts/deploy-cloudfront-function.js
```

The script will:
1. Create or update the CloudFront Function
2. Publish the function to LIVE stage
3. Associate the function with the CloudFront distribution
4. Configure the function to run on viewer-request events

### Manual Deployment

See detailed instructions in `docs/cloudfront-redirect-setup.md`.

## Development Guidelines

### Syntax Requirements

CloudFront Functions use a restricted JavaScript runtime:

**Allowed**:
- ES5 syntax only
- `var` for variables
- Traditional `function` declarations
- Basic JavaScript operations

**Not Allowed**:
- `const` or `let`
- Arrow functions (`=>`)
- `async`/`await`
- Promises
- Most ES6+ features

### Size Limits

- Maximum function size: 10 KB
- Keep functions small and focused
- Avoid external dependencies

### Testing

Test functions locally before deployment:

```bash
npm test tests/cloudfront-redirect-function.test.ts
```

### Performance

- Functions execute in <1ms
- Minimize computation
- Avoid complex logic
- Use simple string operations

## Function Structure

All CloudFront Functions must follow this structure:

```javascript
function handler(event) {
  var request = event.request;
  
  // Your logic here
  
  // Return modified request or response
  return request;
}
```

### Event Object

The `event` object contains:

```javascript
{
  version: "1.0",
  context: {
    eventType: "viewer-request" // or "viewer-response"
  },
  viewer: {
    ip: "198.51.100.1"
  },
  request: {
    method: "GET",
    uri: "/path",
    querystring: "key=value",
    headers: {},
    cookies: {}
  }
}
```

### Response Object

To return a redirect or custom response:

```javascript
{
  statusCode: 301,
  statusDescription: "Moved Permanently",
  headers: {
    "location": { value: "/new-path" }
  }
}
```

## Monitoring

### CloudWatch Metrics

CloudFront Functions automatically publish metrics to CloudWatch:

- **Invocations**: Number of times function executed
- **Validation Errors**: Syntax or runtime errors
- **Execution Errors**: Function threw an error
- **Compute Utilization**: CPU time used

### Viewing Metrics

1. AWS Console → CloudFront → Functions
2. Select function name
3. Click "Monitoring" tab

### Logs

CloudFront Functions do not generate CloudWatch Logs. Use CloudFront access logs to track function behavior.

## Cost

CloudFront Functions are extremely cost-effective:

- **Pricing**: $0.10 per 1 million invocations
- **Free Tier**: 2 million invocations per month
- **Typical Cost**: ~$0.00 for most sites

## Troubleshooting

### Function Not Executing

**Symptoms**: Function doesn't seem to run

**Solutions**:
1. Verify function is published to LIVE stage (not DEVELOPMENT)
2. Check function is associated with distribution
3. Confirm association is on correct event type (viewer-request)
4. Wait 5-10 minutes for CloudFront propagation

### Syntax Errors

**Symptoms**: Function validation fails

**Solutions**:
1. Use only ES5 syntax (no `const`, `let`, arrow functions)
2. Test function code locally first
3. Check for typos in function structure
4. Verify `handler` function is defined

### Function Errors

**Symptoms**: 500 errors or unexpected behavior

**Solutions**:
1. Check CloudWatch metrics for execution errors
2. Test function with various input scenarios
3. Add defensive checks for edge cases
4. Simplify function logic

## Best Practices

1. **Keep It Simple**: CloudFront Functions should be lightweight
2. **Test Thoroughly**: Test all URL variations and edge cases
3. **Monitor Performance**: Check CloudWatch metrics regularly
4. **Version Control**: Keep function code in Git
5. **Document Changes**: Update this README when adding functions
6. **Security**: Never include secrets or credentials in functions
7. **Idempotent**: Functions should produce same result for same input

## Additional Resources

- [CloudFront Functions Documentation](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/cloudfront-functions.html)
- [JavaScript Runtime Features](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/functions-javascript-runtime-features.html)
- [CloudFront Functions Examples](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/functions-example-code.html)
- [Deployment Guide](../docs/cloudfront-redirect-setup.md)

## Support

For issues with CloudFront Functions:

1. Check function syntax and structure
2. Review CloudWatch metrics for errors
3. Test function locally with unit tests
4. Verify function is published and associated
5. Check CloudFront distribution status
