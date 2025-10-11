# Core Web Vitals Monitoring Guide

## Overview

This guide covers the Core Web Vitals monitoring system implemented for the Vivid Auto Photography website. The system measures and tracks the three key performance metrics that Google uses to evaluate user experience.

## Core Web Vitals Metrics

### 1. Largest Contentful Paint (LCP)
- **Target:** < 2.5 seconds
- **Measures:** Loading performance
- **Description:** Time until the largest content element is rendered

### 2. First Input Delay (FID)
- **Target:** < 100 milliseconds
- **Measures:** Interactivity
- **Description:** Time from first user interaction to browser response

### 3. Cumulative Layout Shift (CLS)
- **Target:** < 0.1
- **Measures:** Visual stability
- **Description:** Amount of unexpected layout shift during page load

## Monitoring System Components

### Core Monitor (`scripts/core-web-vitals-monitor.js`)
The main monitoring script that:
- Measures Core Web Vitals for all key pages
- Generates detailed performance reports
- Provides pass/fail status against targets
- Saves results in JSON and Markdown formats

### Dashboard (`scripts/core-web-vitals-dashboard.js`)
Advanced monitoring dashboard that:
- Provides ongoing monitoring capabilities
- Generates HTML dashboard with visualizations
- Tracks performance trends over time
- Sends alerts when thresholds are exceeded

### Test Suite (`scripts/test-core-web-vitals-monitoring.js`)
Validation system that:
- Tests monitoring system functionality
- Validates configuration and targets
- Ensures proper metric capture
- Generates test reports

### Configuration (`config/core-web-vitals-config.json`)
Centralized configuration for:
- Performance targets and thresholds
- Test URLs and priorities
- Monitoring frequency and alerting
- Reporting preferences

## Usage

### Basic Monitoring
```bash
# Run one-time monitoring
npm run performance:vitals

# Test monitoring system
npm run performance:vitals:test

# Generate dashboard
npm run performance:vitals:dashboard
```

### Continuous Monitoring
```bash
# Start continuous monitoring (1-hour intervals)
npm run performance:vitals:continuous

# Custom interval (30 minutes)
node scripts/core-web-vitals-dashboard.js --continuous --interval=1800000
```

### Integration with Performance Validation
```bash
# Run complete performance validation
npm run performance:validate
```

## Output Files

### Monitoring Results
- **Format:** `core-web-vitals-monitoring-YYYY-MM-DDTHH-MM-SS-sssZ.json`
- **Content:** Detailed metrics for each page tested
- **Usage:** Historical analysis and debugging

### Summary Reports
- **Format:** `core-web-vitals-summary-YYYY-MM-DDTHH-MM-SS-sssZ.md`
- **Content:** Human-readable performance summary
- **Usage:** Quick status overview and recommendations

### Dashboard Files
- **JSON:** `core-web-vitals-dashboard.json` - Dashboard data
- **HTML:** `core-web-vitals-dashboard.html` - Visual dashboard
- **Usage:** Real-time monitoring and trend analysis

### Alert Files
- **Format:** `core-web-vitals-alerts-YYYY-MM-DDTHH-MM-SS-sssZ.json`
- **Content:** Performance alerts and threshold violations
- **Usage:** Issue tracking and notification

## Performance Targets and Thresholds

### Current Targets (Requirements 6.6)
```json
{
  "lcp": 2500,  // 2.5 seconds
  "fid": 100,   // 100 milliseconds
  "cls": 0.1    // 0.1 score
}
```

### Alert Thresholds
```json
{
  "lcp": 3000,  // Alert if > 3 seconds
  "fid": 150,   // Alert if > 150ms
  "cls": 0.15   // Alert if > 0.15
}
```

## Monitored Pages

1. **Home** (`/`) - High priority
2. **Services** (`/services/`) - High priority
3. **Photography Services** (`/services/photography/`) - High priority
4. **Blog** (`/blog/`) - Medium priority
5. **Contact** (`/contact/`) - Medium priority

## Interpreting Results

### Status Indicators
- ✅ **PASSED:** All metrics meet targets
- ❌ **FAILED:** One or more metrics exceed targets

### Metric Ratings
- **Good:** Meets target thresholds
- **Needs Improvement:** Between target and alert threshold
- **Poor:** Exceeds alert threshold

### Common Issues and Solutions

#### LCP (Largest Contentful Paint) Issues
- **Cause:** Large images, slow server response, render-blocking resources
- **Solutions:**
  - Optimize hero images with proper compression
  - Use `priority` flag for above-the-fold images
  - Implement proper caching headers
  - Optimize critical rendering path

#### FID (First Input Delay) Issues
- **Cause:** Heavy JavaScript execution, long tasks
- **Solutions:**
  - Break up long JavaScript tasks
  - Defer non-critical JavaScript
  - Optimize third-party scripts
  - Use code splitting

#### CLS (Cumulative Layout Shift) Issues
- **Cause:** Images without dimensions, dynamic content insertion
- **Solutions:**
  - Set explicit width/height for images
  - Reserve space for dynamic content
  - Use CSS transforms instead of layout-changing properties
  - Avoid inserting content above existing content

## Automation and CI/CD Integration

### GitHub Actions Integration
The monitoring can be integrated into CI/CD pipelines:

```yaml
- name: Run Core Web Vitals Monitoring
  run: npm run performance:vitals
  
- name: Upload Performance Reports
  uses: actions/upload-artifact@v3
  with:
    name: core-web-vitals-reports
    path: |
      core-web-vitals-*.json
      core-web-vitals-*.md
```

### Deployment Validation
Include in deployment scripts:

```bash
# After deployment
npm run performance:vitals

# Check exit code for pass/fail
if [ $? -eq 0 ]; then
  echo "✅ Core Web Vitals validation passed"
else
  echo "❌ Core Web Vitals validation failed"
  exit 1
fi
```

## Troubleshooting

### Common Issues

#### Puppeteer Installation
```bash
# If Puppeteer fails to install
npm install puppeteer --save-dev

# For Windows environments
npm config set puppeteer_download_host=https://npm.taobao.org/mirrors
```

#### Metric Capture Issues
- Ensure pages load completely before measurement
- Check for JavaScript errors in browser console
- Verify network connectivity to test URLs
- Increase timeout values for slow connections

#### Dashboard Generation
- Ensure write permissions in project directory
- Check for sufficient disk space
- Verify JSON file integrity

### Debug Mode
Enable verbose logging:

```bash
DEBUG=true npm run performance:vitals
```

## Best Practices

### Monitoring Frequency
- **Development:** After each significant change
- **Staging:** Before each deployment
- **Production:** Daily or after deployments

### Performance Budget
- Set up alerts for performance regressions
- Monitor trends over time, not just absolute values
- Consider different device types and network conditions

### Team Integration
- Share dashboard URL with team members
- Include performance metrics in code reviews
- Set up automated alerts for critical issues

## Related Documentation

- [Performance Optimization Guide](./performance-optimization-guide.md)
- [Lighthouse Audit Guide](./lighthouse-audit-guide.md)
- [Image Optimization Guide](./image-optimization-guide.md)
- [Caching Strategy Guide](./caching-strategy-guide.md)

## Support

For issues with the Core Web Vitals monitoring system:

1. Check the troubleshooting section above
2. Review recent monitoring logs
3. Validate configuration files
4. Test with a single page first
5. Check browser console for JavaScript errors

## Changelog

### Version 1.0.0 (2025-10-11)
- Initial implementation of Core Web Vitals monitoring
- Support for LCP, FID, and CLS measurement
- Dashboard and alerting system
- Integration with existing performance validation
- Comprehensive documentation and testing