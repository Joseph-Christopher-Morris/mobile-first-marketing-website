#!/usr/bin/env node

/**
 * Deployment Test Integration Script
 * 
 * This script integrates functionality tests with the deployment pipeline by:
 * 1. Configuring test execution in pre-deployment validation
 * 2. Setting up test reporting and failure notifications
 * 3. Creating test result dashboard and monitoring
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class DeploymentTestIntegration {
  constructor(options = {}) {
    this.verbose = options.verbose || false;
    this.outputDir = options.outputDir || './test-results';
    this.reportDir = path.join(this.outputDir, 'deployment-tests');
    this.configDir = './.kiro/deployment-tests';
    this.results = {
      timestamp: new Date().toISOString(),
      testSuites: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        duration: 0
      },
      notifications: [],
      dashboard: null
    };
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    
    if (this.verbose || level === 'error' || level === 'success') {
      console.log(`${prefix} ${message}`);
    }
  }

  async initializeDirectories() {
    this.log('Initializing test integration directories...');
    
    // Create necessary directories
    const dirs = [this.outputDir, this.reportDir, this.configDir];
    
    for (const dir of dirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        this.log(`Created directory: ${dir}`);
      }
    }
  }

  async configurePreDeploymentValidation() {
    this.log('Configuring pre-deployment validation tests...');
    
    // Create pre-deployment test configuration
    const preDeploymentConfig = {
      enabled: true,
      testSuites: [
        {
          name: 'Core Functionality Tests',
          script: 'npm run test:core-functionality',
          timeout: 120000,
          required: true,
          failFast: true
        },
        {
          name: 'Site Functionality Tests',
          script: 'npm run test:functionality',
          timeout: 300000,
          required: true,
          failFast: false
        },
        {
          name: 'Accessibility Tests',
          script: 'npx playwright test e2e/accessibility.spec.ts',
          timeout: 180000,
          required: true,
          failFast: false
        },
        {
          name: 'Performance Tests',
          script: 'npx playwright test e2e/performance.spec.ts',
          timeout: 240000,
          required: true,
          failFast: false
        },
        {
          name: 'Critical User Journey Tests',
          script: 'npx playwright test e2e/critical-user-journeys.spec.ts',
          timeout: 180000,
          required: true,
          failFast: false
        },
        {
          name: 'Unit Tests',
          script: 'npm run test -- --run',
          timeout: 60000,
          required: false,
          failFast: false
        }
      ],
      notifications: {
        onFailure: true,
        onSuccess: false,
        channels: ['console', 'file', 'dashboard']
      },
      reporting: {
        generateHtml: true,
        generateJson: true,
        includeScreenshots: true,
        includeLogs: true
      }
    };

    const configPath = path.join(this.configDir, 'pre-deployment-config.json');
    fs.writeFileSync(configPath, JSON.stringify(preDeploymentConfig, null, 2));
    this.log(`Pre-deployment configuration saved to: ${configPath}`);

    return preDeploymentConfig;
  }

  async executeTestSuite(testSuite) {
    this.log(`Executing test suite: ${testSuite.name}`);
    const startTime = Date.now();
    
    const suiteResult = {
      name: testSuite.name,
      script: testSuite.script,
      status: 'running',
      startTime: new Date().toISOString(),
      endTime: null,
      duration: 0,
      output: '',
      error: null,
      required: testSuite.required,
      screenshots: [],
      logs: []
    };

    try {
      // Execute the test command
      const output = execSync(testSuite.script, {
        encoding: 'utf8',
        timeout: testSuite.timeout,
        stdio: this.verbose ? 'inherit' : 'pipe',
        env: {
          ...process.env,
          CI: 'true',
          PLAYWRIGHT_REPORTER: 'json',
          TEST_RESULTS_DIR: this.reportDir
        }
      });

      suiteResult.status = 'passed';
      suiteResult.output = output;
      this.results.summary.passed++;
      this.log(`✅ ${testSuite.name} - PASSED`, 'success');

    } catch (error) {
      suiteResult.status = 'failed';
      suiteResult.error = error.message;
      suiteResult.output = error.stdout || '';
      this.results.summary.failed++;
      this.log(`❌ ${testSuite.name} - FAILED: ${error.message}`, 'error');

      // If this is a required test and failFast is enabled, throw error
      if (testSuite.required && testSuite.failFast) {
        throw new Error(`Required test suite failed: ${testSuite.name}`);
      }
    } finally {
      const endTime = Date.now();
      suiteResult.endTime = new Date().toISOString();
      suiteResult.duration = endTime - startTime;
      this.results.summary.duration += suiteResult.duration;
      this.results.summary.total++;
    }

    // Collect screenshots and logs if available
    await this.collectTestArtifacts(suiteResult);

    this.results.testSuites.push(suiteResult);
    return suiteResult;
  }

  async collectTestArtifacts(suiteResult) {
    // Collect Playwright screenshots
    const screenshotDir = path.join('test-results');
    if (fs.existsSync(screenshotDir)) {
      try {
        const screenshots = fs.readdirSync(screenshotDir, { recursive: true })
          .filter(file => file.endsWith('.png'))
          .map(file => path.join(screenshotDir, file));
        
        suiteResult.screenshots = screenshots.slice(0, 10); // Limit to 10 screenshots
      } catch (error) {
        this.log(`Warning: Could not collect screenshots: ${error.message}`, 'warning');
      }
    }

    // Collect test logs
    const logFiles = [
      path.join(this.reportDir, `${suiteResult.name.toLowerCase().replace(/\s+/g, '-')}.log`),
      path.join('playwright-report', 'index.html')
    ];

    for (const logFile of logFiles) {
      if (fs.existsSync(logFile)) {
        suiteResult.logs.push(logFile);
      }
    }
  }

  async runAllTests() {
    this.log('Starting deployment test integration...');
    
    // Load configuration
    const configPath = path.join(this.configDir, 'pre-deployment-config.json');
    if (!fs.existsSync(configPath)) {
      throw new Error('Pre-deployment configuration not found. Run configure first.');
    }

    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    
    if (!config.enabled) {
      this.log('Pre-deployment tests are disabled');
      return this.results;
    }

    const startTime = Date.now();

    // Execute each test suite
    for (const testSuite of config.testSuites) {
      try {
        await this.executeTestSuite(testSuite);
      } catch (error) {
        if (testSuite.failFast) {
          this.log('Stopping test execution due to critical failure', 'error');
          break;
        }
      }
    }

    this.results.summary.duration = Date.now() - startTime;

    // Generate notifications
    await this.generateNotifications(config.notifications);

    // Generate reports
    await this.generateReports(config.reporting);

    // Update dashboard
    await this.updateDashboard();

    return this.results;
  }

  async generateNotifications(notificationConfig) {
    this.log('Generating test notifications...');

    const { total, passed, failed, skipped } = this.results.summary;
    const hasFailures = failed > 0;
    const shouldNotify = (hasFailures && notificationConfig.onFailure) || 
                        (!hasFailures && notificationConfig.onSuccess);

    if (!shouldNotify) {
      return;
    }

    const notification = {
      timestamp: new Date().toISOString(),
      type: hasFailures ? 'failure' : 'success',
      summary: {
        total,
        passed,
        failed,
        skipped,
        duration: this.results.summary.duration
      },
      message: hasFailures 
        ? `❌ Deployment tests FAILED: ${failed}/${total} test suites failed`
        : `✅ Deployment tests PASSED: ${passed}/${total} test suites passed`,
      details: this.results.testSuites
        .filter(suite => suite.status === 'failed')
        .map(suite => ({
          name: suite.name,
          error: suite.error,
          required: suite.required
        }))
    };

    // Console notification
    if (notificationConfig.channels.includes('console')) {
      console.log('\n' + '='.repeat(80));
      console.log('🚨 DEPLOYMENT TEST NOTIFICATION');
      console.log('='.repeat(80));
      console.log(notification.message);
      console.log(`Duration: ${(notification.summary.duration / 1000).toFixed(1)}s`);
      
      if (notification.details.length > 0) {
        console.log('\nFailed Tests:');
        notification.details.forEach(detail => {
          console.log(`  • ${detail.name}${detail.required ? ' (REQUIRED)' : ''}`);
          console.log(`    Error: ${detail.error}`);
        });
      }
      console.log('='.repeat(80));
    }

    // File notification
    if (notificationConfig.channels.includes('file')) {
      const notificationFile = path.join(this.reportDir, 'notifications.json');
      let notifications = [];
      
      if (fs.existsSync(notificationFile)) {
        try {
          notifications = JSON.parse(fs.readFileSync(notificationFile, 'utf8'));
        } catch (error) {
          notifications = [];
        }
      }
      
      notifications.push(notification);
      
      // Keep only last 50 notifications
      if (notifications.length > 50) {
        notifications = notifications.slice(-50);
      }
      
      fs.writeFileSync(notificationFile, JSON.stringify(notifications, null, 2));
      this.log(`Notification saved to: ${notificationFile}`);
    }

    this.results.notifications.push(notification);
  }

  async generateReports(reportingConfig) {
    this.log('Generating test reports...');

    // Generate JSON report
    if (reportingConfig.generateJson) {
      const jsonReportPath = path.join(this.reportDir, 'deployment-test-results.json');
      fs.writeFileSync(jsonReportPath, JSON.stringify(this.results, null, 2));
      this.log(`JSON report generated: ${jsonReportPath}`);
    }

    // Generate HTML report
    if (reportingConfig.generateHtml) {
      const htmlReport = this.generateHtmlReport(reportingConfig);
      const htmlReportPath = path.join(this.reportDir, 'deployment-test-results.html');
      fs.writeFileSync(htmlReportPath, htmlReport);
      this.log(`HTML report generated: ${htmlReportPath}`);
    }

    // Generate summary report for CI/CD
    const summaryReport = this.generateSummaryReport();
    const summaryPath = path.join(this.reportDir, 'test-summary.txt');
    fs.writeFileSync(summaryPath, summaryReport);
    this.log(`Summary report generated: ${summaryPath}`);
  }

  generateHtmlReport(config) {
    const { total, passed, failed, skipped, duration } = this.results.summary;
    const successRate = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;
    const hasFailures = failed > 0;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Deployment Test Results</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: ${hasFailures ? '#dc2626' : '#059669'}; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { padding: 20px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .metric { background: #f8fafc; padding: 20px; border-radius: 8px; text-align: center; }
        .metric-value { font-size: 2em; font-weight: bold; margin-bottom: 5px; }
        .passed { color: #059669; }
        .failed { color: #dc2626; }
        .skipped { color: #d97706; }
        .test-suite { border: 1px solid #e5e7eb; border-radius: 6px; margin-bottom: 15px; overflow: hidden; }
        .suite-header { padding: 15px; background: #f9fafb; font-weight: 600; cursor: pointer; }
        .suite-header.passed { border-left: 4px solid #059669; }
        .suite-header.failed { border-left: 4px solid #dc2626; }
        .suite-header.skipped { border-left: 4px solid #d97706; }
        .suite-details { padding: 15px; display: none; background: white; }
        .suite-details.show { display: block; }
        .timestamp { color: #6b7280; font-size: 0.9em; }
        .error-message { background: #fef2f2; border: 1px solid #fecaca; border-radius: 4px; padding: 10px; margin: 10px 0; color: #991b1b; }
        .output { background: #f3f4f6; border-radius: 4px; padding: 10px; margin: 10px 0; font-family: monospace; font-size: 0.9em; max-height: 200px; overflow-y: auto; }
        .screenshots { margin: 10px 0; }
        .screenshot { max-width: 200px; margin: 5px; border-radius: 4px; }
        .required-badge { background: #dc2626; color: white; padding: 2px 6px; border-radius: 3px; font-size: 0.8em; margin-left: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${hasFailures ? '❌' : '✅'} Deployment Test Results</h1>
            <p class="timestamp">Generated: ${this.results.timestamp}</p>
            <p>Duration: ${(duration / 1000).toFixed(1)} seconds</p>
        </div>
        
        <div class="content">
            <div class="summary">
                <div class="metric">
                    <div class="metric-value">${total}</div>
                    <div>Total Suites</div>
                </div>
                <div class="metric">
                    <div class="metric-value passed">${passed}</div>
                    <div>Passed</div>
                </div>
                <div class="metric">
                    <div class="metric-value failed">${failed}</div>
                    <div>Failed</div>
                </div>
                <div class="metric">
                    <div class="metric-value skipped">${skipped}</div>
                    <div>Skipped</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${successRate}%</div>
                    <div>Success Rate</div>
                </div>
            </div>
            
            <div class="test-suites">
                <h2>Test Suite Results</h2>
                ${this.results.testSuites.map((suite, index) => `
                    <div class="test-suite">
                        <div class="suite-header ${suite.status}" onclick="toggleDetails(${index})">
                            ${suite.status === 'passed' ? '✅' : suite.status === 'skipped' ? '⊘' : '❌'} 
                            ${suite.name}
                            ${suite.required ? '<span class="required-badge">REQUIRED</span>' : ''}
                            <span style="float: right;">${(suite.duration / 1000).toFixed(1)}s</span>
                        </div>
                        <div class="suite-details" id="details-${index}">
                            <p><strong>Script:</strong> <code>${suite.script}</code></p>
                            <p><strong>Started:</strong> ${suite.startTime}</p>
                            <p><strong>Duration:</strong> ${(suite.duration / 1000).toFixed(1)} seconds</p>
                            
                            ${suite.error ? `
                                <div class="error-message">
                                    <strong>Error:</strong> ${suite.error}
                                </div>
                            ` : ''}
                            
                            ${suite.output ? `
                                <details>
                                    <summary>Output</summary>
                                    <div class="output">${suite.output.substring(0, 2000)}${suite.output.length > 2000 ? '...' : ''}</div>
                                </details>
                            ` : ''}
                            
                            ${suite.screenshots.length > 0 ? `
                                <div class="screenshots">
                                    <strong>Screenshots:</strong><br>
                                    ${suite.screenshots.slice(0, 3).map(screenshot => 
                                        `<img src="${screenshot}" alt="Test screenshot" class="screenshot">`
                                    ).join('')}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    </div>
    
    <script>
        function toggleDetails(index) {
            const details = document.getElementById('details-' + index);
            details.classList.toggle('show');
        }
        
        // Auto-expand failed tests
        ${this.results.testSuites.map((suite, index) => 
            suite.status === 'failed' ? `toggleDetails(${index});` : ''
        ).join('')}
    </script>
</body>
</html>`;
  }

  generateSummaryReport() {
    const { total, passed, failed, skipped, duration } = this.results.summary;
    const successRate = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;
    
    let summary = `DEPLOYMENT TEST SUMMARY\n`;
    summary += `========================\n`;
    summary += `Timestamp: ${this.results.timestamp}\n`;
    summary += `Duration: ${(duration / 1000).toFixed(1)} seconds\n`;
    summary += `Total Test Suites: ${total}\n`;
    summary += `Passed: ${passed}\n`;
    summary += `Failed: ${failed}\n`;
    summary += `Skipped: ${skipped}\n`;
    summary += `Success Rate: ${successRate}%\n`;
    summary += `Status: ${failed > 0 ? 'FAILED' : 'PASSED'}\n\n`;

    if (failed > 0) {
      summary += `FAILED TEST SUITES:\n`;
      summary += `-------------------\n`;
      this.results.testSuites
        .filter(suite => suite.status === 'failed')
        .forEach(suite => {
          summary += `• ${suite.name}${suite.required ? ' (REQUIRED)' : ''}\n`;
          summary += `  Error: ${suite.error}\n`;
          summary += `  Duration: ${(suite.duration / 1000).toFixed(1)}s\n\n`;
        });
    }

    return summary;
  }

  async updateDashboard() {
    this.log('Updating test dashboard...');

    const dashboardData = {
      lastUpdate: new Date().toISOString(),
      currentRun: this.results,
      history: await this.loadTestHistory(),
      trends: this.calculateTrends()
    };

    // Save dashboard data
    const dashboardPath = path.join(this.reportDir, 'dashboard-data.json');
    fs.writeFileSync(dashboardPath, JSON.stringify(dashboardData, null, 2));

    // Generate dashboard HTML
    const dashboardHtml = this.generateDashboardHtml(dashboardData);
    const dashboardHtmlPath = path.join(this.reportDir, 'dashboard.html');
    fs.writeFileSync(dashboardHtmlPath, dashboardHtml);

    this.results.dashboard = {
      dataPath: dashboardPath,
      htmlPath: dashboardHtmlPath,
      url: `file://${path.resolve(dashboardHtmlPath)}`
    };

    this.log(`Dashboard updated: ${dashboardHtmlPath}`);
  }

  async loadTestHistory() {
    const historyFile = path.join(this.reportDir, 'test-history.json');
    let history = [];

    if (fs.existsSync(historyFile)) {
      try {
        history = JSON.parse(fs.readFileSync(historyFile, 'utf8'));
      } catch (error) {
        this.log(`Warning: Could not load test history: ${error.message}`, 'warning');
      }
    }

    // Add current run to history
    history.push({
      timestamp: this.results.timestamp,
      summary: this.results.summary,
      testSuites: this.results.testSuites.map(suite => ({
        name: suite.name,
        status: suite.status,
        duration: suite.duration,
        required: suite.required
      }))
    });

    // Keep only last 50 runs
    if (history.length > 50) {
      history = history.slice(-50);
    }

    // Save updated history
    fs.writeFileSync(historyFile, JSON.stringify(history, null, 2));

    return history;
  }

  calculateTrends() {
    // This would calculate trends from historical data
    // For now, return basic trend data
    return {
      successRate: {
        current: this.results.summary.total > 0 ? 
          ((this.results.summary.passed / this.results.summary.total) * 100).toFixed(1) : 0,
        trend: 'stable' // Could be 'improving', 'declining', 'stable'
      },
      averageDuration: {
        current: (this.results.summary.duration / 1000).toFixed(1),
        trend: 'stable'
      },
      failureRate: {
        current: this.results.summary.total > 0 ? 
          ((this.results.summary.failed / this.results.summary.total) * 100).toFixed(1) : 0,
        trend: 'stable'
      }
    };
  }

  generateDashboardHtml(dashboardData) {
    const { currentRun, trends } = dashboardData;
    const { total, passed, failed, skipped, duration } = currentRun.summary;
    const successRate = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Deployment Test Dashboard</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .dashboard { max-width: 1400px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px; margin-bottom: 20px; }
        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .metric-card { background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .metric-value { font-size: 2.5em; font-weight: bold; margin-bottom: 10px; }
        .metric-label { color: #6b7280; font-size: 0.9em; text-transform: uppercase; letter-spacing: 0.5px; }
        .trend { font-size: 0.8em; margin-top: 5px; }
        .trend.stable { color: #6b7280; }
        .trend.improving { color: #059669; }
        .trend.declining { color: #dc2626; }
        .passed { color: #059669; }
        .failed { color: #dc2626; }
        .skipped { color: #d97706; }
        .test-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .test-panel { background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden; }
        .panel-header { background: #f8fafc; padding: 20px; border-bottom: 1px solid #e5e7eb; font-weight: 600; }
        .panel-content { padding: 20px; max-height: 400px; overflow-y: auto; }
        .test-item { padding: 10px; border-bottom: 1px solid #f3f4f6; display: flex; justify-content: space-between; align-items: center; }
        .test-item:last-child { border-bottom: none; }
        .test-status { padding: 4px 8px; border-radius: 4px; font-size: 0.8em; font-weight: 500; }
        .status-passed { background: #d1fae5; color: #065f46; }
        .status-failed { background: #fee2e2; color: #991b1b; }
        .status-skipped { background: #fef3c7; color: #92400e; }
        .refresh-info { text-align: center; margin-top: 20px; color: #6b7280; font-size: 0.9em; }
        .auto-refresh { animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
    </style>
    <script>
        // Auto-refresh every 30 seconds
        setTimeout(() => location.reload(), 30000);
    </script>
</head>
<body>
    <div class="dashboard">
        <div class="header">
            <h1>🚀 Deployment Test Dashboard</h1>
            <p>Real-time monitoring of deployment test pipeline</p>
            <p style="opacity: 0.8;">Last updated: ${dashboardData.lastUpdate}</p>
        </div>

        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-value">${total}</div>
                <div class="metric-label">Total Test Suites</div>
                <div class="trend stable">Current run</div>
            </div>
            <div class="metric-card">
                <div class="metric-value passed">${passed}</div>
                <div class="metric-label">Passed</div>
                <div class="trend ${trends.successRate.trend}">${trends.successRate.current}% success rate</div>
            </div>
            <div class="metric-card">
                <div class="metric-value failed">${failed}</div>
                <div class="metric-label">Failed</div>
                <div class="trend ${trends.failureRate.trend}">${trends.failureRate.current}% failure rate</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${(duration / 1000).toFixed(1)}s</div>
                <div class="metric-label">Duration</div>
                <div class="trend ${trends.averageDuration.trend}">Average: ${trends.averageDuration.current}s</div>
            </div>
        </div>

        <div class="test-grid">
            <div class="test-panel">
                <div class="panel-header">Current Test Results</div>
                <div class="panel-content">
                    ${currentRun.testSuites.map(suite => `
                        <div class="test-item">
                            <div>
                                <div style="font-weight: 500;">${suite.name}</div>
                                <div style="font-size: 0.8em; color: #6b7280;">${(suite.duration / 1000).toFixed(1)}s</div>
                            </div>
                            <div class="test-status status-${suite.status}">
                                ${suite.status.toUpperCase()}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="test-panel">
                <div class="panel-header">Recent Activity</div>
                <div class="panel-content">
                    ${dashboardData.history.slice(-10).reverse().map(run => `
                        <div class="test-item">
                            <div>
                                <div style="font-weight: 500;">${new Date(run.timestamp).toLocaleString()}</div>
                                <div style="font-size: 0.8em; color: #6b7280;">
                                    ${run.summary.passed}/${run.summary.total} passed
                                </div>
                            </div>
                            <div class="test-status status-${run.summary.failed > 0 ? 'failed' : 'passed'}">
                                ${run.summary.failed > 0 ? 'FAILED' : 'PASSED'}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>

        <div class="refresh-info auto-refresh">
            Dashboard auto-refreshes every 30 seconds
        </div>
    </div>
</body>
</html>`;
  }

  async run() {
    try {
      await this.initializeDirectories();
      await this.configurePreDeploymentValidation();
      const results = await this.runAllTests();
      
      const { total, passed, failed } = results.summary;
      
      this.log('\n' + '='.repeat(80));
      this.log('🎯 DEPLOYMENT TEST INTEGRATION COMPLETE');
      this.log('='.repeat(80));
      this.log(`Total Test Suites: ${total}`);
      this.log(`Passed: ${passed}`);
      this.log(`Failed: ${failed}`);
      this.log(`Duration: ${(results.summary.duration / 1000).toFixed(1)}s`);
      
      if (results.dashboard) {
        this.log(`Dashboard: ${results.dashboard.htmlPath}`);
      }
      
      this.log('='.repeat(80));

      return results;
    } catch (error) {
      this.log(`Fatal error: ${error.message}`, 'error');
      throw error;
    }
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];
  
  const options = {
    verbose: args.includes('--verbose') || args.includes('-v'),
    outputDir: args.find(arg => arg.startsWith('--output='))?.split('=')[1]
  };

  const integration = new DeploymentTestIntegration(options);

  switch (command) {
    case 'configure':
      integration.initializeDirectories()
        .then(() => integration.configurePreDeploymentValidation())
        .then(() => console.log('✅ Deployment test integration configured'))
        .catch(error => {
          console.error('❌ Configuration failed:', error.message);
          process.exit(1);
        });
      break;

    case 'run':
      integration.run()
        .then(results => {
          const { summary } = results;
          console.log(`\n✅ Test integration completed: ${summary.passed}/${summary.total} passed`);
          process.exit(summary.failed > 0 ? 1 : 0);
        })
        .catch(error => {
          console.error('❌ Test integration failed:', error.message);
          process.exit(1);
        });
      break;

    case 'dashboard':
      integration.initializeDirectories()
        .then(() => integration.updateDashboard())
        .then(() => console.log('✅ Dashboard updated'))
        .catch(error => {
          console.error('❌ Dashboard update failed:', error.message);
          process.exit(1);
        });
      break; process.exit(1);
        });
      break;

    case 'run':
    case 'test':
      integration.run()
        .then(results => {
          process.exit(results.summary.failed > 0 ? 1 : 0);
        })
        .catch(error => {
          console.error('❌ Test integration failed:', error.message);
          process.exit(1);
        });
      break;

    case 'dashboard':
      integration.initializeDirectories()
        .then(() => integration.updateDashboard())
        .then(() => console.log('✅ Dashboard updated'))
        .catch(error => {
          console.error('❌ Dashboard update failed:', error.message);
          process.exit(1);
        });
      break;

    default:
      console.log('Deployment Test Integration');
      console.log('');
      console.log('Usage:');
      console.log('  node deployment-test-integration.js configure  - Set up test integration');
      console.log('  node deployment-test-integration.js run        - Run all deployment tests');
      console.log('  node deployment-test-integration.js dashboard  - Update dashboard only');
      console.log('');
      console.log('Options:');
      console.log('  --verbose, -v                                  - Verbose output');
      console.log('  --output=<dir>                                 - Output directory');
      break;
  }
}

module.exports = DeploymentTestIntegration;