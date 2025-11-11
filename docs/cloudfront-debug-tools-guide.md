# CloudFront Debug Tools Guide

## Overview

This guide covers the advanced debugging and diagnostic tools for CloudFront Function URL rewriting. These tools provide comprehensive analysis, performance profiling, and troubleshooting capabilities for the pretty URLs implementation.

## Available Tools

### 1. URL Pattern Debug Utility
**File:** `scripts/cloudfront-pretty-urls-debug-utility.js`

Comprehensive URL pattern testing and validation tool that simulates CloudFront Function behavior locally and tests against the live distribution.

**Features:**
- Local CloudFront Function simulation
- Live URL pattern testing
- Performance measurement
- Cache effectiveness analysis
- Comprehensive reporting

**Usage:**
```bash
# Basic usage
node scripts/cloudfront-pretty-urls-debug-utility.js

# With custom domain
node scripts/cloudfront-pretty-urls-debug-utility.js --domain https://your-domain.com

# Verbose output
node scripts/cloudfront-pretty-urls-debug-utility.js --verbose

# Skip specific tests
node scripts/cloudfront-pretty-urls-debug-utility.js --skip-profiling
```

**Test Patterns:**
- Root URL (`/` → `/index.html`)
- Directory URLs (`/privacy-policy/` → `/privacy-policy/index.html`)
- Extensionless URLs (`/about` → `/about/index.html`)
- Static assets (should not be rewritten)
- Edge cases and error conditions

### 2. Function Execution Tracer
**File:** `scripts/cloudfront-function-execution-tracer.js`

Advanced tracing tool for CloudFront Function execution, analyzing CloudWatch metrics and function performance.

**Features:**
- Function configuration analysis
- CloudWatch metrics collection
- Execution pattern analysis
- Error detection and categorization
- Performance profiling

**Usage:**
```bash
# Basic tracing
node scripts/cloudfront-function-execution-tracer.js

# Custom time range
node scripts/cloudfront-function-execution-tracer.js --time-range 6h

# Specific function
node scripts/cloudfront-function-execution-tracer.js --function-name my-function

# Verbose output
node scripts/cloudfront-function-execution-tracer.js --verbose
```

**Metrics Analyzed:**
- Function invocations
- Error rates
- Execution patterns
- Geographic distribution
- Performance trends

### 3. Performance Profiler
**File:** `scripts/cloudfront-function-performance-profiler.js`

Comprehensive performance testing and optimization tool for CloudFront Functions.

**Features:**
- Baseline performance measurement
- Load testing with concurrent requests
- Stress testing under high load
- Endurance testing for sustained performance
- Bottleneck identification
- Optimization recommendations

**Usage:**
```bash
# Full performance profiling
node scripts/cloudfront-function-performance-profiler.js

# Skip intensive tests
node scripts/cloudfront-function-performance-profiler.js --skip-stress --skip-endurance

# Verbose output
node scripts/cloudfront-function-performance-profiler.js --verbose
```

**Test Types:**
- **Baseline:** Single request measurements
- **Load Test:** 100 requests, 10 concurrent
- **Stress Test:** 500 requests, 50 concurrent
- **Endurance Test:** 1000 requests over extended period

### 4. Comprehensive Test Suite
**File:** `scripts/test-cloudfront-debug-tools.js`

Integration test suite that validates all debug tools and their interactions.

**Features:**
- Tests all debug tools
- Integration testing
- Cross-tool data consistency validation
- Report generation testing
- Error handling validation

**Usage:**
```bash
# Full test suite
node scripts/test-cloudfront-debug-tools.js

# Quick test (skip intensive operations)
node scripts/test-cloudfront-debug-tools.js --quick-test

# Verbose output
node scripts/test-cloudfront-debug-tools.js --verbose
```

## Configuration Options

### Common Parameters

All tools support these common configuration options:

| Parameter | Description | Default |
|-----------|-------------|---------|
| `--domain` | CloudFront domain URL | `https://d15sc9fc739ev2.cloudfront.net` |
| `--distribution-id` | CloudFront distribution ID | `E2IBMHQ3GCW6ZK` |
| `--function-name` | CloudFront function name | `pretty-urls-rewriter` |
| `--verbose` | Enable verbose output | `false` |
| `--help` | Show help message | - |

### Tool-Specific Options

#### Debug Utility Options
- `--skip-url-tests`: Skip URL pattern testing
- `--skip-tracing`: Skip function execution tracing
- `--skip-profiling`: Skip performance profiling

#### Function Tracer Options
- `--region`: AWS region (default: `us-east-1`)
- `--time-range`: Analysis time range (e.g., `1h`, `6h`, `1d`)

#### Performance Profiler Options
- `--skip-load`: Skip load testing
- `--skip-stress`: Skip stress testing
- `--skip-endurance`: Skip endurance testing

#### Test Suite Options
- `--quick-test`: Run quick test (skip intensive operations)

## Output and Reports

### Report Types

Each tool generates comprehensive reports in multiple formats:

1. **JSON Reports:** Detailed machine-readable data
2. **Markdown Summaries:** Human-readable analysis and recommendations
3. **Console Output:** Real-time progress and results

### Report Locations

Reports are saved in the project root with timestamps:
- `cloudfront-debug-report-{timestamp}.json`
- `cloudfront-debug-summary-{timestamp}.md`
- `cloudfront-function-trace-report-{timestamp}.json`
- `cloudfront-performance-profile-{timestamp}.json`

### Sample Report Structure

```json
{
  "metadata": {
    "timestamp": "2025-01-14T...",
    "domain": "https://d15sc9fc739ev2.cloudfront.net",
    "functionName": "pretty-urls-rewriter"
  },
  "results": {
    "urlPatternTests": {
      "passed": 12,
      "failed": 0,
      "total": 12,
      "details": [...]
    },
    "functionTracing": {
      "totalRequests": 6,
      "successfulRequests": 6,
      "averageResponseTime": 245.67
    },
    "performanceProfiling": {
      "baseline": {...},
      "loadTesting": {...},
      "recommendations": [...]
    }
  }
}
```

## Troubleshooting

### Common Issues

#### 1. AWS Credentials Not Configured
**Error:** `Unable to locate credentials`
**Solution:** Configure AWS credentials using AWS CLI or environment variables

#### 2. Function Not Found
**Error:** `NoSuchFunctionExists`
**Solution:** Verify function name and ensure it exists in the correct region

#### 3. Network Timeouts
**Error:** `Request timeout after Xms`
**Solution:** Check network connectivity and increase timeout values

#### 4. High Error Rates
**Error:** Multiple failed requests
**Solution:** Check CloudFront distribution status and function configuration

### Debug Steps

1. **Verify Configuration:**
   ```bash
   # Check function exists
   aws cloudfront describe-function --name pretty-urls-rewriter --stage LIVE
   
   # Check distribution status
   aws cloudfront get-distribution --id E2IBMHQ3GCW6ZK
   ```

2. **Test Individual Components:**
   ```bash
   # Test URL patterns only
   node scripts/cloudfront-pretty-urls-debug-utility.js --skip-tracing --skip-profiling
   
   # Test function tracing only
   node scripts/cloudfront-function-execution-tracer.js --time-range 1h
   ```

3. **Run Quick Test:**
   ```bash
   # Quick validation
   node scripts/test-cloudfront-debug-tools.js --quick-test
   ```

## Performance Optimization

### Interpreting Results

#### Response Time Benchmarks
- **Excellent:** < 100ms average
- **Good:** 100-300ms average
- **Fair:** 300-500ms average
- **Poor:** > 500ms average

#### Error Rate Thresholds
- **Acceptable:** < 1% error rate
- **Warning:** 1-5% error rate
- **Critical:** > 5% error rate

#### Throughput Expectations
- **Good:** > 100 req/sec
- **Fair:** 50-100 req/sec
- **Poor:** < 50 req/sec

### Optimization Recommendations

Based on profiling results, common optimizations include:

1. **Function Logic Optimization:**
   - Minimize string operations
   - Use early returns for static assets
   - Optimize URL pattern matching

2. **Cache Configuration:**
   - Separate cache behaviors for different content types
   - Optimize TTL settings
   - Configure appropriate cache keys

3. **Monitoring Setup:**
   - CloudWatch alarms for error rates
   - Performance regression testing
   - Automated monitoring dashboards

## Integration with CI/CD

### Automated Testing

Add debug tools to your CI/CD pipeline:

```yaml
# .github/workflows/cloudfront-debug.yml
name: CloudFront Debug Tests
on:
  push:
    branches: [main]
  schedule:
    - cron: '0 6 * * *'  # Daily at 6 AM

jobs:
  debug-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm install
      - name: Run debug tools
        run: node scripts/test-cloudfront-debug-tools.js --quick-test
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

### Performance Monitoring

Set up regular performance monitoring:

```bash
# Weekly performance profiling
0 2 * * 0 /usr/bin/node /path/to/scripts/cloudfront-function-performance-profiler.js --skip-endurance

# Daily quick checks
0 6 * * * /usr/bin/node /path/to/scripts/cloudfront-pretty-urls-debug-utility.js --skip-profiling
```

## Best Practices

### Regular Monitoring
1. Run debug utility weekly to catch URL pattern issues
2. Use function tracer monthly for performance trends
3. Run performance profiler after any function changes
4. Set up automated alerts for error rate increases

### Development Workflow
1. Test locally with debug utility before deployment
2. Use performance profiler to validate optimizations
3. Run comprehensive test suite before production releases
4. Monitor function execution after deployments

### Maintenance
1. Review generated reports regularly
2. Act on optimization recommendations
3. Update test patterns as site structure changes
4. Keep tools updated with latest CloudFront features

## Support and Troubleshooting

### Getting Help

1. **Check Tool Help:**
   ```bash
   node scripts/cloudfront-pretty-urls-debug-utility.js --help
   ```

2. **Enable Verbose Output:**
   ```bash
   node scripts/[tool-name].js --verbose
   ```

3. **Review Generated Reports:**
   - Check JSON reports for detailed data
   - Review Markdown summaries for recommendations

### Common Solutions

- **AWS Permissions:** Ensure IAM user has CloudFront and CloudWatch read permissions
- **Network Issues:** Check firewall settings and DNS resolution
- **Function Issues:** Verify function is deployed and associated with distribution
- **Performance Issues:** Review CloudWatch metrics and function logs

For additional support, refer to the CloudFront documentation and AWS support resources.