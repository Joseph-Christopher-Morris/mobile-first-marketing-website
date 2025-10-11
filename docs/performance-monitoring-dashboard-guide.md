# Performance Monitoring Dashboard Guide

## Overview

The Performance Monitoring Dashboard provides comprehensive automated performance tracking, regression detection, and alerting for the Vivid Auto Photography website. It integrates with existing monitoring infrastructure to deliver actionable insights and maintain optimal website performance.

## Features

### 🎯 Core Web Vitals Monitoring
- **LCP (Largest Contentful Paint)**: Measures loading performance
- **FID (First Input Delay)**: Measures interactivity
- **CLS (Cumulative Layout Shift)**: Measures visual stability

### 📊 Performance Tracking
- Automated performance data collection
- Historical trend analysis
- Baseline calculation and comparison
- Overall performance scoring

### 🚨 Intelligent Alerting
- Threshold-based alerts for performance degradation
- Regression detection with configurable sensitivity
- Alert cooldown periods to prevent spam
- Multiple notification channels (console, file, webhook)

### 📋 Comprehensive Reporting
- Real-time HTML dashboard
- Detailed JSON reports
- Markdown summaries
- Performance recommendations

### ⚡ Optimization Integration
- Integrates with existing performance optimization tools
- CloudFront cache analysis
- Cost optimization alerts
- Automated remediation suggestions

## Installation and Setup

### Prerequisites

Ensure you have the following dependencies installed:
- Node.js 16+
- Existing Core Web Vitals Monitor
- Performance Optimization Monitor
- AWS SDK (for CloudFront metrics)

### Configuration

The dashboard uses `config/performance-monitoring-dashboard-config.json` for configuration:

```json
{
  "monitoring": {
    "enabled": true,
    "interval": 3600000,  // 1 hour in milliseconds
    "continuous": false,
    "autoStart": false
  },
  "thresholds": {
    "performance": {
      "lcp": { "good": 2500, "poor": 4000 },
      "fid": { "good": 100, "poor": 300 },
      "cls": { "good": 0.1, "poor": 0.25 }
    },
    "regression": {
      "lcp": 20,    // % increase threshold
      "fid": 50,    // % increase threshold
      "cls": 100    // % increase threshold
    }
  }
}
```

## Usage

### Basic Usage

Run a single monitoring iteration:
```bash
node scripts/performance-monitoring-dashboard.js
```

### Continuous Monitoring

Run continuous monitoring with 1-hour intervals:
```bash
node scripts/performance-monitoring-dashboard.js --continuous
```

Run continuous monitoring with custom interval (30 minutes):
```bash
node scripts/performance-monitoring-dashboard.js --continuous --interval=1800000
```

### Report Generation Only

Generate reports without running monitoring:
```bash
node scripts/performance-monitoring-dashboard.js --no-report
```

## Dashboard Components

### 1. Performance Metrics Collection

The dashboard collects metrics from multiple sources:

- **Core Web Vitals**: LCP, FID, CLS measurements
- **Optimization Analysis**: Performance grades and recommendations
- **Error Tracking**: Failed measurements and issues
- **Overall Scoring**: Composite performance score

### 2. Baseline Calculation

Establishes performance baselines using:
- Configurable time period (default: 7 days)
- Minimum sample requirements (default: 5 samples)
- Statistical analysis (average, median, 95th percentile)

### 3. Regression Detection

Identifies performance regressions by:
- Comparing current metrics to baseline
- Configurable sensitivity thresholds
- Severity classification (warning, critical)
- Trend analysis over time

### 4. Alert System

Triggers alerts based on:
- **Threshold Violations**: Metrics exceeding configured limits
- **Performance Regressions**: Significant degradation from baseline
- **Error Conditions**: Failed measurements or system issues

Alert features:
- Cooldown periods to prevent alert fatigue
- Multiple severity levels (info, warning, critical)
- Configurable notification channels
- Alert history tracking

### 5. Reporting and Visualization

Generates multiple report formats:

#### HTML Dashboard
Interactive dashboard with:
- Real-time performance metrics
- Visual status indicators
- Trend charts and comparisons
- Recent alerts and recommendations

#### JSON Reports
Machine-readable data for:
- API integration
- Custom analysis tools
- Data export and archiving

#### Markdown Summaries
Human-readable reports for:
- Documentation
- Team communication
- Executive summaries

## Performance Targets

### Core Web Vitals Targets

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| **LCP** | ≤ 2.5s | 2.5s - 4.0s | > 4.0s |
| **FID** | ≤ 100ms | 100ms - 300ms | > 300ms |
| **CLS** | ≤ 0.1 | 0.1 - 0.25 | > 0.25 |

### Overall Performance Scoring

- **Excellent (90-100)**: All metrics in "Good" range
- **Good (70-89)**: Most metrics in "Good" range
- **Needs Improvement (50-69)**: Some metrics in "Poor" range
- **Poor (0-49)**: Multiple metrics in "Poor" range

## Alert Configuration

### Alert Types

1. **Threshold Alerts**: Triggered when metrics exceed configured thresholds
2. **Regression Alerts**: Triggered when performance degrades significantly from baseline
3. **Error Alerts**: Triggered when monitoring fails or encounters errors

### Alert Channels

- **Console**: Real-time alerts in terminal output
- **File**: Persistent logging to `logs/performance-alerts.log`
- **Webhook**: HTTP notifications to external systems (configurable)
- **Email**: SMTP notifications (configurable)

### Alert Cooldown

Prevents alert spam with configurable cooldown periods:
- Default: 30 minutes
- Per-alert-type configuration
- Escalation policies for repeated issues

## Integration with Existing Tools

### Core Web Vitals Monitor
- Leverages existing `core-web-vitals-monitor.js`
- Uses established test URLs and configuration
- Maintains compatibility with current reporting

### Performance Optimization Monitor
- Integrates with `performance-optimization-monitor.js`
- Includes CloudFront cache analysis
- Incorporates cost optimization alerts

### AWS Infrastructure
- CloudWatch metrics integration
- S3 + CloudFront performance data
- Cost analysis and optimization

## File Structure

```
├── scripts/
│   └── performance-monitoring-dashboard.js    # Main dashboard script
├── config/
│   └── performance-monitoring-dashboard-config.json  # Configuration
├── logs/
│   ├── performance-dashboard-data.json        # Historical data
│   ├── performance-alerts.json               # Alert history
│   └── performance-alerts.log                # Alert log file
├── reports/
│   └── performance-dashboard-report.json     # Latest JSON report
├── performance-monitoring-dashboard.html      # HTML dashboard
├── performance-monitoring-dashboard-report.md # Markdown report
└── performance-dashboard-summary.json        # Dashboard summary
```

## Automation and Scheduling

### Cron Job Setup

For automated monitoring, set up a cron job:

```bash
# Run every hour
0 * * * * cd /path/to/project && node scripts/performance-monitoring-dashboard.js

# Run every 30 minutes during business hours
*/30 9-17 * * 1-5 cd /path/to/project && node scripts/performance-monitoring-dashboard.js
```

### GitHub Actions Integration

Add to `.github/workflows/performance-monitoring.yml`:

```yaml
name: Performance Monitoring
on:
  schedule:
    - cron: '0 */2 * * *'  # Every 2 hours
  workflow_dispatch:

jobs:
  monitor:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: node scripts/performance-monitoring-dashboard.js
      - uses: actions/upload-artifact@v3
        with:
          name: performance-reports
          path: |
            performance-monitoring-dashboard.html
            performance-monitoring-dashboard-report.md
```

## Troubleshooting

### Common Issues

1. **Missing Dependencies**
   ```bash
   npm install aws-sdk
   ```

2. **Configuration Errors**
   - Verify `config/performance-monitoring-dashboard-config.json` syntax
   - Check file permissions for logs directory

3. **AWS Credentials**
   ```bash
   export AWS_ACCESS_KEY_ID=your_key
   export AWS_SECRET_ACCESS_KEY=your_secret
   export AWS_REGION=us-east-1
   ```

4. **CloudFront Metrics Access**
   - Ensure IAM permissions for CloudWatch:GetMetricStatistics
   - Verify CloudFront distribution ID is correct

### Debug Mode

Run with verbose logging:
```bash
DEBUG=performance-dashboard node scripts/performance-monitoring-dashboard.js
```

### Log Analysis

Check logs for issues:
```bash
tail -f logs/performance-alerts.log
cat logs/performance-dashboard-data.json | jq '.[-1]'  # Latest metrics
```

## Best Practices

### 1. Baseline Management
- Allow 7-14 days for initial baseline establishment
- Review and adjust thresholds based on actual performance
- Consider seasonal variations in traffic patterns

### 2. Alert Tuning
- Start with conservative thresholds and adjust based on false positives
- Use appropriate cooldown periods for your response time
- Implement escalation policies for critical issues

### 3. Performance Optimization
- Act on recommendations promptly
- Monitor impact of changes on performance metrics
- Document optimization efforts and results

### 4. Regular Review
- Weekly review of performance trends
- Monthly threshold and configuration review
- Quarterly baseline recalibration

## API Reference

### Dashboard Class Methods

```javascript
const dashboard = new PerformanceMonitoringDashboard();

// Initialize dashboard
await dashboard.initialize();

// Run single monitoring iteration
const result = await dashboard.runDashboard({
  continuous: false,
  interval: 3600000,
  generateReport: true
});

// Generate reports only
await dashboard.generateReports();
```

### Configuration Options

See `config/performance-monitoring-dashboard-config.json` for all available options.

## Support and Maintenance

### Regular Maintenance Tasks

1. **Log Rotation**: Logs are automatically rotated, but monitor disk usage
2. **Data Cleanup**: Historical data is kept for 30 days by default
3. **Configuration Updates**: Review and update thresholds quarterly
4. **Dependency Updates**: Keep monitoring tools and dependencies current

### Performance Impact

The dashboard is designed to have minimal performance impact:
- Runs independently of website traffic
- Uses existing monitoring infrastructure
- Configurable intervals to balance monitoring frequency with resource usage

---

For additional support or feature requests, refer to the project documentation or contact the development team.