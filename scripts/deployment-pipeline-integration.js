#!/usr/bin/env node

/**
 * Deployment Pipeline Integration Script
 *
 * This script integrates functionality tests with the deployment pipeline by:
 * 1. Configuring test execution in pre-deployment validation
 * 2. Setting up test reporting and failure notifications
 * 3. Creating test result dashboard and monitoring
 *
 * This is the main integration point for task 5.2.4.5
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class DeploymentPipelineIntegration {
  constructor(options = {}) {
    this.verbose = options.verbose || false;
    this.outputDir = options.outputDir || './test-results';
    this.configDir = './.kiro/deployment-pipeline';
    this.results = {
      timestamp: new Date().toISOString(),
      pipeline: {
        configured: false,
        testSuites: [],
        notifications: [],
        dashboard: null,
      },
      integration: {
        preDeploymentTests: false,
        testReporting: false,
        failureNotifications: false,
        dashboard: false,
      },
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
    this.log('Initializing deployment pipeline integration directories...');

    const dirs = [
      this.outputDir,
      this.configDir,
      path.join(this.configDir, 'configs'),
    ];

    for (const dir of dirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        this.log(`Created directory: ${dir}`);
      }
    }
  }

  async configurePreDeploymentValidation() {
    this.log('Configuring pre-deployment validation tests...');

    // Create comprehensive test configuration for deployment pipeline
    const pipelineConfig = {
      version: '1.0.0',
      enabled: true,
      description: 'Deployment pipeline test integration configuration',
      preDeploymentTests: {
        enabled: true,
        failFast: true,
        timeout: 1800000, // 30 minutes total
        testSuites: [
          {
            id: 'core-functionality',
            name: 'Core Functionality Tests',
            description: 'Essential site functionality validation',
            script: 'npm run test:core-functionality',
            timeout: 120000,
            required: true,
            failFast: true,
            retries: 1,
            outputFile: 'core-functionality-results.json',
          },
          {
            id: 'site-functionality',
            name: 'Site Functionality Tests',
            description: 'Comprehensive site functionality validation',
            script: 'npm run test:functionality',
            timeout: 300000,
            required: true,
            failFast: false,
            retries: 1,
            outputFile: 'site-functionality-results.json',
          },
          {
            id: 'accessibility',
            name: 'Accessibility Compliance Tests',
            description: 'WCAG 2.1 AA compliance validation',
            script:
              'npx playwright test e2e/accessibility.spec.ts --reporter=json',
            timeout: 180000,
            required: true,
            failFast: false,
            retries: 2,
            outputFile: 'accessibility-results.json',
          },
          {
            id: 'performance',
            name: 'Performance Tests',
            description: 'Core Web Vitals and performance validation',
            script:
              'npx playwright test e2e/performance.spec.ts --reporter=json',
            timeout: 240000,
            required: true,
            failFast: false,
            retries: 2,
            outputFile: 'performance-results.json',
          },
          {
            id: 'critical-journeys',
            name: 'Critical User Journey Tests',
            description: 'End-to-end user journey validation',
            script:
              'npx playwright test e2e/critical-user-journeys.spec.ts --reporter=json',
            timeout: 180000,
            required: true,
            failFast: false,
            retries: 2,
            outputFile: 'critical-journeys-results.json',
          },
          {
            id: 'unit-tests',
            name: 'Unit Tests',
            description: 'Component and utility unit tests',
            script: 'npm run test -- --run --reporter=json',
            timeout: 60000,
            required: false,
            failFast: false,
            retries: 1,
            outputFile: 'unit-test-results.json',
          },
        ],
      },
      reporting: {
        enabled: true,
        formats: ['json', 'html', 'junit'],
        aggregation: {
          enabled: true,
          script: 'node scripts/test-result-aggregator.js',
        },
        artifacts: {
          screenshots: true,
          logs: true,
          videos: false,
          traces: false,
        },
      },
      notifications: {
        enabled: true,
        channels: ['console', 'file', 'dashboard'],
        onSuccess: false,
        onFailure: true,
        onCriticalFailure: true,
        templates: {
          success: '✅ All deployment tests passed - Ready for deployment',
          failure:
            '❌ Deployment tests failed - {{failedCount}}/{{totalCount}} test suites failed',
          criticalFailure:
            '🚨 Critical deployment tests failed - Deployment blocked',
        },
      },
      dashboard: {
        enabled: true,
        autoRefresh: true,
        refreshInterval: 30000,
        historyLimit: 50,
        metrics: ['success-rate', 'duration', 'failure-rate', 'trends'],
      },
    };

    const configPath = path.join(this.configDir, 'pipeline-config.json');
    fs.writeFileSync(configPath, JSON.stringify(pipelineConfig, null, 2));
    this.log(`Pipeline configuration saved to: ${configPath}`);

    this.results.pipeline.configured = true;
    this.results.integration.preDeploymentTests = true;

    return pipelineConfig;
  }

  async setupTestReporting() {
    this.log('Setting up test reporting integration...');

    // Create test reporting configuration
    const reportingConfig = {
      version: '1.0.0',
      outputDirectory: this.outputDir,
      formats: {
        json: {
          enabled: true,
          filename: 'deployment-test-results.json',
          includeDetails: true,
        },
        html: {
          enabled: true,
          filename: 'deployment-test-results.html',
          template: 'comprehensive',
          includeScreenshots: true,
        },
        junit: {
          enabled: true,
          filename: 'deployment-test-results.xml',
          suiteName: 'Deployment Tests',
        },
      },
      aggregation: {
        enabled: true,
        sources: [
          'vitest-results.json',
          'playwright-results.json',
          'accessibility-results.json',
          'performance-results.json',
          'functionality-results.json',
        ],
        outputFile: 'aggregated-test-results.json',
      },
      retention: {
        maxReports: 50,
        maxAge: '30d',
      },
    };

    const reportingConfigPath = path.join(
      this.configDir,
      'reporting-config.json'
    );
    fs.writeFileSync(
      reportingConfigPath,
      JSON.stringify(reportingConfig, null, 2)
    );
    this.log(`Reporting configuration saved to: ${reportingConfigPath}`);

    this.results.integration.testReporting = true;
    return reportingConfig;
  }

  async setupFailureNotifications() {
    this.log('Setting up failure notifications...');

    // Create notification configuration
    const notificationConfig = {
      version: '1.0.0',
      enabled: true,
      channels: {
        console: {
          enabled: true,
          level: 'all',
          format: 'detailed',
        },
        file: {
          enabled: true,
          outputFile: path.join(this.outputDir, 'notifications.log'),
          format: 'json',
          maxSize: '10MB',
          maxFiles: 5,
        },
        dashboard: {
          enabled: true,
          realTime: true,
          persistent: true,
        },
      },
      triggers: {
        onTestFailure: {
          enabled: true,
          severity: 'warning',
          includeDetails: true,
        },
        onCriticalFailure: {
          enabled: true,
          severity: 'critical',
          includeDetails: true,
          blockDeployment: true,
        },
        onTestSuccess: {
          enabled: false,
          severity: 'info',
        },
      },
      templates: {
        testFailure: {
          title: 'Deployment Test Failure',
          message:
            'Test suite "{{suiteName}}" failed with {{errorCount}} errors',
          includeStackTrace: true,
          includeLogs: true,
        },
        criticalFailure: {
          title: 'Critical Deployment Test Failure',
          message:
            'Critical test suite "{{suiteName}}" failed - Deployment blocked',
          includeStackTrace: true,
          includeLogs: true,
          includeScreenshots: true,
        },
      },
    };

    const notificationConfigPath = path.join(
      this.configDir,
      'notification-config.json'
    );
    fs.writeFileSync(
      notificationConfigPath,
      JSON.stringify(notificationConfig, null, 2)
    );
    this.log(`Notification configuration saved to: ${notificationConfigPath}`);

    this.results.integration.failureNotifications = true;
    return notificationConfig;
  }

  async createTestResultDashboard() {
    this.log('Creating test result dashboard...');

    // Create dashboard configuration
    const dashboardConfig = {
      version: '1.0.0',
      enabled: true,
      title: 'Deployment Test Dashboard',
      description: 'Real-time monitoring of deployment test pipeline',
      layout: {
        sections: [
          {
            id: 'overview',
            title: 'Test Overview',
            type: 'metrics',
            metrics: [
              'total-tests',
              'passed-tests',
              'failed-tests',
              'success-rate',
            ],
          },
          {
            id: 'current-run',
            title: 'Current Test Run',
            type: 'test-results',
            showDetails: true,
            expandFailures: true,
          },
          {
            id: 'history',
            title: 'Test History',
            type: 'timeline',
            limit: 20,
          },
          {
            id: 'trends',
            title: 'Trends',
            type: 'charts',
            metrics: ['success-rate', 'duration', 'failure-rate'],
          },
        ],
      },
      refresh: {
        enabled: true,
        interval: 30000,
        autoRefresh: true,
      },
      export: {
        enabled: true,
        formats: ['html', 'pdf', 'json'],
      },
    };

    const dashboardConfigPath = path.join(
      this.configDir,
      'dashboard-config.json'
    );
    fs.writeFileSync(
      dashboardConfigPath,
      JSON.stringify(dashboardConfig, null, 2)
    );
    this.log(`Dashboard configuration saved to: ${dashboardConfigPath}`);

    // Create initial dashboard HTML
    const dashboardHtml = this.generateDashboardTemplate();
    const dashboardPath = path.join(
      this.outputDir,
      'deployment-dashboard.html'
    );
    fs.writeFileSync(dashboardPath, dashboardHtml);
    this.log(`Dashboard template created: ${dashboardPath}`);

    this.results.integration.dashboard = true;
    this.results.pipeline.dashboard = {
      configPath: dashboardConfigPath,
      htmlPath: dashboardPath,
      url: `file://${path.resolve(dashboardPath)}`,
    };

    return dashboardConfig;
  }

  generateDashboardTemplate() {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Deployment Test Dashboard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            background: #f5f7fa; 
            color: #2d3748; 
            line-height: 1.6;
        }
        .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 2rem; 
            text-align: center; 
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .header h1 { font-size: 2.5rem; margin-bottom: 0.5rem; }
        .header p { opacity: 0.9; font-size: 1.1rem; }
        .container { max-width: 1400px; margin: 0 auto; padding: 2rem; }
        .metrics-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
            gap: 1.5rem; 
            margin-bottom: 2rem; 
        }
        .metric-card { 
            background: white; 
            padding: 2rem; 
            border-radius: 12px; 
            box-shadow: 0 4px 6px rgba(0,0,0,0.05); 
            text-align: center;
            transition: transform 0.2s ease;
        }
        .metric-card:hover { transform: translateY(-2px); }
        .metric-value { 
            font-size: 3rem; 
            font-weight: bold; 
            margin-bottom: 0.5rem; 
        }
        .metric-label { 
            color: #718096; 
            font-size: 0.9rem; 
            text-transform: uppercase; 
            letter-spacing: 0.5px; 
        }
        .status-indicator { 
            display: inline-block; 
            width: 12px; 
            height: 12px; 
            border-radius: 50%; 
            margin-right: 8px; 
        }
        .status-running { background: #f6ad55; animation: pulse 2s infinite; }
        .status-passed { background: #48bb78; }
        .status-failed { background: #f56565; }
        .status-pending { background: #a0aec0; }
        .section { 
            background: white; 
            border-radius: 12px; 
            box-shadow: 0 4px 6px rgba(0,0,0,0.05); 
            margin-bottom: 2rem; 
            overflow: hidden;
        }
        .section-header { 
            background: #f7fafc; 
            padding: 1.5rem; 
            border-bottom: 1px solid #e2e8f0; 
            font-weight: 600; 
            font-size: 1.1rem;
        }
        .section-content { padding: 1.5rem; }
        .test-item { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            padding: 1rem; 
            border-bottom: 1px solid #f1f5f9; 
        }
        .test-item:last-child { border-bottom: none; }
        .test-name { font-weight: 500; }
        .test-duration { color: #718096; font-size: 0.9rem; }
        .loading { text-align: center; padding: 3rem; color: #718096; }
        .auto-refresh { 
            position: fixed; 
            top: 20px; 
            right: 20px; 
            background: rgba(0,0,0,0.8); 
            color: white; 
            padding: 8px 16px; 
            border-radius: 20px; 
            font-size: 0.8rem;
        }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .passed { color: #48bb78; }
        .failed { color: #f56565; }
        .pending { color: #a0aec0; }
        .running { color: #f6ad55; }
    </style>
    <script>
        let dashboardData = null;
        let refreshInterval = null;

        async function loadDashboardData() {
            try {
                const response = await fetch('./deployment-test-results.json');
                if (response.ok) {
                    dashboardData = await response.json();
                    updateDashboard();
                } else {
                    showLoading('Waiting for test results...');
                }
            } catch (error) {
                showLoading('Loading test data...');
            }
        }

        function updateDashboard() {
            if (!dashboardData) return;

            updateMetrics();
            updateTestResults();
            updateLastUpdated();
        }

        function updateMetrics() {
            const summary = dashboardData.summary || {};
            
            document.getElementById('total-tests').textContent = summary.totalTests || 0;
            document.getElementById('passed-tests').textContent = summary.passedTests || 0;
            document.getElementById('failed-tests').textContent = summary.failedTests || 0;
            
            const successRate = summary.totalTests > 0 ? 
                ((summary.passedTests / summary.totalTests) * 100).toFixed(1) : 0;
            document.getElementById('success-rate').textContent = successRate + '%';
        }

        function updateTestResults() {
            const testSuites = dashboardData.testSuites || [];
            const container = document.getElementById('test-results');
            
            if (testSuites.length === 0) {
                container.innerHTML = '<div class="loading">No test results available</div>';
                return;
            }

            container.innerHTML = testSuites.map(suite => \`
                <div class="test-item">
                    <div>
                        <div class="test-name">
                            <span class="status-indicator status-\${suite.status}"></span>
                            \${suite.name}
                        </div>
                        <div class="test-duration">\${(suite.duration / 1000).toFixed(1)}s</div>
                    </div>
                    <div class="test-status \${suite.status}">
                        \${suite.status.toUpperCase()}
                    </div>
                </div>
            \`).join('');
        }

        function updateLastUpdated() {
            const timestamp = dashboardData.timestamp || new Date().toISOString();
            document.getElementById('last-updated').textContent = 
                'Last updated: ' + new Date(timestamp).toLocaleString();
        }

        function showLoading(message) {
            document.getElementById('test-results').innerHTML = 
                \`<div class="loading">\${message}</div>\`;
        }

        function startAutoRefresh() {
            refreshInterval = setInterval(loadDashboardData, 30000);
        }

        function stopAutoRefresh() {
            if (refreshInterval) {
                clearInterval(refreshInterval);
                refreshInterval = null;
            }
        }

        // Initialize dashboard
        document.addEventListener('DOMContentLoaded', function() {
            loadDashboardData();
            startAutoRefresh();
        });

        // Cleanup on page unload
        window.addEventListener('beforeunload', stopAutoRefresh);
    </script>
</head>
<body>
    <div class="auto-refresh">Auto-refresh: 30s</div>
    
    <div class="header">
        <h1>🚀 Deployment Test Dashboard</h1>
        <p>Real-time monitoring of deployment test pipeline</p>
        <p id="last-updated">Loading...</p>
    </div>

    <div class="container">
        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-value" id="total-tests">-</div>
                <div class="metric-label">Total Tests</div>
            </div>
            <div class="metric-card">
                <div class="metric-value passed" id="passed-tests">-</div>
                <div class="metric-label">Passed</div>
            </div>
            <div class="metric-card">
                <div class="metric-value failed" id="failed-tests">-</div>
                <div class="metric-label">Failed</div>
            </div>
            <div class="metric-card">
                <div class="metric-value" id="success-rate">-</div>
                <div class="metric-label">Success Rate</div>
            </div>
        </div>

        <div class="section">
            <div class="section-header">Current Test Results</div>
            <div class="section-content" id="test-results">
                <div class="loading">Loading test results...</div>
            </div>
        </div>
    </div>
</body>
</html>`;
  }

  async updateAmplifyConfiguration() {
    this.log('Updating Amplify configuration for test integration...');

    const amplifyConfigPath = 'amplify.yml';

    if (!fs.existsSync(amplifyConfigPath)) {
      this.log(
        'amplify.yml not found - creating basic configuration',
        'warning'
      );
      return;
    }

    // Read current amplify.yml
    let amplifyConfig = fs.readFileSync(amplifyConfigPath, 'utf8');

    // Check if deployment test integration is already configured
    if (amplifyConfig.includes('deployment-pipeline-integration.js')) {
      this.log('Amplify configuration already includes test integration');
      return;
    }

    // Add test integration to preBuild phase
    const testIntegrationCommand =
      '        - node scripts/deployment-pipeline-integration.js run';

    if (amplifyConfig.includes('preBuild:')) {
      // Insert after existing preBuild commands
      amplifyConfig = amplifyConfig.replace(
        /(\s+preBuild:\s*\n\s+commands:\s*\n(?:\s+-.*\n)*)/,
        `$1${testIntegrationCommand}\n`
      );
    } else {
      this.log('Could not find preBuild section in amplify.yml', 'warning');
    }

    // Write updated configuration
    fs.writeFileSync(amplifyConfigPath, amplifyConfig);
    this.log('Updated amplify.yml with test integration');
  }

  async validateIntegration() {
    this.log('Validating deployment pipeline integration...');

    const validations = [
      {
        name: 'Configuration files exist',
        check: () => {
          const configFiles = [
            path.join(this.configDir, 'pipeline-config.json'),
            path.join(this.configDir, 'reporting-config.json'),
            path.join(this.configDir, 'notification-config.json'),
            path.join(this.configDir, 'dashboard-config.json'),
          ];
          return configFiles.every(file => fs.existsSync(file));
        },
      },
      {
        name: 'Output directories exist',
        check: () => fs.existsSync(this.outputDir),
      },
      {
        name: 'Test scripts are available',
        check: () => {
          const packageJson = JSON.parse(
            fs.readFileSync('package.json', 'utf8')
          );
          const requiredScripts = [
            'test:core-functionality',
            'test:functionality',
            'test:e2e:accessibility',
            'test:e2e:performance',
            'test:e2e:critical',
          ];
          return requiredScripts.some(script => packageJson.scripts[script]);
        },
      },
      {
        name: 'Dashboard template exists',
        check: () =>
          fs.existsSync(path.join(this.outputDir, 'deployment-dashboard.html')),
      },
    ];

    let allValid = true;
    for (const validation of validations) {
      const isValid = validation.check();
      if (isValid) {
        this.log(`✅ ${validation.name}`, 'success');
      } else {
        this.log(`❌ ${validation.name}`, 'error');
        allValid = false;
      }
    }

    return allValid;
  }

  async generateIntegrationReport() {
    this.log('Generating integration report...');

    const report = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      integration: {
        status: 'completed',
        components: {
          preDeploymentTests: this.results.integration.preDeploymentTests,
          testReporting: this.results.integration.testReporting,
          failureNotifications: this.results.integration.failureNotifications,
          dashboard: this.results.integration.dashboard,
        },
        configuration: {
          pipelineConfig: path.join(this.configDir, 'pipeline-config.json'),
          reportingConfig: path.join(this.configDir, 'reporting-config.json'),
          notificationConfig: path.join(
            this.configDir,
            'notification-config.json'
          ),
          dashboardConfig: path.join(this.configDir, 'dashboard-config.json'),
        },
        outputs: {
          dashboard: this.results.pipeline.dashboard?.htmlPath,
          configDirectory: this.configDir,
          outputDirectory: this.outputDir,
        },
      },
      usage: {
        runTests: 'node scripts/deployment-pipeline-integration.js run',
        viewDashboard: `Open ${this.results.pipeline.dashboard?.htmlPath}`,
        configureTests:
          'node scripts/deployment-pipeline-integration.js configure',
      },
      nextSteps: [
        'Run deployment tests: npm run deploy:test-integration',
        'View dashboard: Open deployment-dashboard.html',
        'Configure Amplify: Update amplify.yml with test integration',
        'Test deployment: Run full deployment simulation',
      ],
    };

    const reportPath = path.join(this.outputDir, 'integration-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    this.log(`Integration report saved to: ${reportPath}`);

    return report;
  }

  async run() {
    try {
      this.log('🚀 Starting deployment pipeline integration...\n');

      // Initialize directories
      await this.initializeDirectories();

      // Configure pre-deployment validation
      await this.configurePreDeploymentValidation();

      // Set up test reporting
      await this.setupTestReporting();

      // Set up failure notifications
      await this.setupFailureNotifications();

      // Create test result dashboard
      await this.createTestResultDashboard();

      // Update Amplify configuration
      await this.updateAmplifyConfiguration();

      // Validate integration
      const isValid = await this.validateIntegration();

      // Generate integration report
      const report = await this.generateIntegrationReport();

      this.log('\n' + '='.repeat(80));
      this.log('🎯 DEPLOYMENT PIPELINE INTEGRATION COMPLETE');
      this.log('='.repeat(80));
      this.log(
        `✅ Pre-deployment tests: ${this.results.integration.preDeploymentTests ? 'Configured' : 'Failed'}`
      );
      this.log(
        `✅ Test reporting: ${this.results.integration.testReporting ? 'Configured' : 'Failed'}`
      );
      this.log(
        `✅ Failure notifications: ${this.results.integration.failureNotifications ? 'Configured' : 'Failed'}`
      );
      this.log(
        `✅ Dashboard: ${this.results.integration.dashboard ? 'Created' : 'Failed'}`
      );
      this.log(`✅ Validation: ${isValid ? 'Passed' : 'Failed'}`);

      if (this.results.pipeline.dashboard) {
        this.log(`📊 Dashboard: ${this.results.pipeline.dashboard.htmlPath}`);
      }

      this.log(
        `📋 Report: ${path.join(this.outputDir, 'integration-report.json')}`
      );
      this.log('='.repeat(80));

      if (!isValid) {
        throw new Error('Integration validation failed');
      }

      return report;
    } catch (error) {
      this.log(`❌ Integration failed: ${error.message}`, 'error');
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
    outputDir: args.find(arg => arg.startsWith('--output='))?.split('=')[1],
  };

  const integration = new DeploymentPipelineIntegration(options);

  switch (command) {
    case 'run':
    case 'integrate':
      integration
        .run()
        .then(report => {
          console.log(
            '\n✅ Deployment pipeline integration completed successfully'
          );
          console.log(`📊 Dashboard: ${report.outputs?.dashboard}`);
          console.log(
            `📋 Report: ${path.join(integration.outputDir, 'integration-report.json')}`
          );
          process.exit(0);
        })
        .catch(error => {
          console.error('❌ Integration failed:', error.message);
          process.exit(1);
        });
      break;

    case 'configure':
      integration
        .initializeDirectories()
        .then(() => integration.configurePreDeploymentValidation())
        .then(() => console.log('✅ Configuration completed'))
        .catch(error => {
          console.error('❌ Configuration failed:', error.message);
          process.exit(1);
        });
      break;

    case 'validate':
      integration
        .validateIntegration()
        .then(isValid => {
          console.log(
            isValid ? '✅ Validation passed' : '❌ Validation failed'
          );
          process.exit(isValid ? 0 : 1);
        })
        .catch(error => {
          console.error('❌ Validation error:', error.message);
          process.exit(1);
        });
      break;

    default:
      console.log('Deployment Pipeline Integration');
      console.log('');
      console.log('Usage:');
      console.log(
        '  node deployment-pipeline-integration.js run        - Complete integration setup'
      );
      console.log(
        '  node deployment-pipeline-integration.js configure  - Configure test pipeline'
      );
      console.log(
        '  node deployment-pipeline-integration.js validate   - Validate integration'
      );
      console.log('');
      console.log('Options:');
      console.log(
        '  --verbose, -v                                      - Verbose output'
      );
      console.log(
        '  --output=<dir>                                     - Output directory'
      );
      break;
  }
}

module.exports = DeploymentPipelineIntegration;
