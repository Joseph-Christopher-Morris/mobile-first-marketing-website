#!/usr/bin/env node

/**
 * Test Image Performance Monitoring System
 * Validates that all monitoring components are working correctly
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class MonitoringSystemTest {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      tests: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        warnings: 0,
      },
    };
  }

  /**
   * Run test for a specific component
   */
  runTest(testName, testFunction) {
    console.log(`🧪 Testing: ${testName}`);

    try {
      const result = testFunction();
      this.results.tests.push({
        name: testName,
        status: 'PASSED',
        result,
        timestamp: new Date().toISOString(),
      });
      this.results.summary.passed++;
      console.log(`  ✅ ${testName} - PASSED`);
      return true;
    } catch (error) {
      this.results.tests.push({
        name: testName,
        status: 'FAILED',
        error: error.message,
        timestamp: new Date().toISOString(),
      });
      this.results.summary.failed++;
      console.log(`  ❌ ${testName} - FAILED: ${error.message}`);
      return false;
    }
  }

  /**
   * Test configuration files exist
   */
  testConfigurationFiles() {
    const requiredConfigs = [
      'config/image-performance-monitoring-config.json',
      'config/performance-alerts-config.json',
      'config/core-web-vitals-alerts-config.json',
    ];

    const missingConfigs = requiredConfigs.filter(
      config => !fs.existsSync(config)
    );

    if (missingConfigs.length > 0) {
      throw new Error(
        `Missing configuration files: ${missingConfigs.join(', ')}`
      );
    }

    return {
      configFiles: requiredConfigs.length,
      allPresent: true,
    };
  }

  /**
   * Test monitoring scripts exist
   */
  testMonitoringScripts() {
    const requiredScripts = [
      'scripts/image-performance-monitor.js',
      'scripts/core-web-vitals-image-monitor.js',
      'scripts/integrated-image-performance-monitor.js',
      'scripts/setup-image-performance-alerts.js',
    ];

    const missingScripts = requiredScripts.filter(
      script => !fs.existsSync(script)
    );

    if (missingScripts.length > 0) {
      throw new Error(
        `Missing monitoring scripts: ${missingScripts.join(', ')}`
      );
    }

    return {
      scriptFiles: requiredScripts.length,
      allPresent: true,
    };
  }

  /**
   * Test image performance monitoring
   */
  testImagePerformanceMonitoring() {
    try {
      // Run with timeout to prevent hanging
      const output = execSync('node scripts/image-performance-monitor.js', {
        encoding: 'utf8',
        timeout: 60000, // 1 minute timeout
        stdio: 'pipe',
      });

      // Check if monitoring completed successfully
      const hasResults = output.includes('MONITORING RESULTS SUMMARY');
      const hasMetrics = output.includes('Success Rate:');

      if (!hasResults || !hasMetrics) {
        throw new Error('Monitoring output missing expected results');
      }

      return {
        completed: true,
        hasResults: true,
        outputLength: output.length,
      };
    } catch (error) {
      if (error.status === 1) {
        // Exit code 1 is expected when there are alerts
        return {
          completed: true,
          hasAlerts: true,
          alertsDetected: true,
        };
      }
      throw error;
    }
  }

  /**
   * Test Core Web Vitals monitoring
   */
  testCoreWebVitalsMonitoring() {
    try {
      const output = execSync('node scripts/core-web-vitals-image-monitor.js', {
        encoding: 'utf8',
        timeout: 30000, // 30 seconds timeout
        stdio: 'pipe',
      });

      const hasResults = output.includes('CORE WEB VITALS MONITORING SUMMARY');
      const hasMetrics = output.includes('Average Performance Score:');

      if (!hasResults || !hasMetrics) {
        throw new Error(
          'Core Web Vitals monitoring output missing expected results'
        );
      }

      return {
        completed: true,
        hasResults: true,
        outputLength: output.length,
      };
    } catch (error) {
      if (error.status === 1) {
        // Exit code 1 is expected when there are performance issues
        return {
          completed: true,
          hasPerformanceIssues: true,
          issuesDetected: true,
        };
      }
      throw error;
    }
  }

  /**
   * Test configuration loading
   */
  testConfigurationLoading() {
    const configPath = 'config/image-performance-monitoring-config.json';
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

    const requiredSections = [
      'monitoring',
      'thresholds',
      'alerts',
      'criticalImages',
    ];
    const missingSections = requiredSections.filter(
      section => !config[section]
    );

    if (missingSections.length > 0) {
      throw new Error(
        `Missing configuration sections: ${missingSections.join(', ')}`
      );
    }

    return {
      configValid: true,
      sections: requiredSections.length,
      criticalImages: config.criticalImages.length,
    };
  }

  /**
   * Test report generation
   */
  testReportGeneration() {
    // Check for recent monitoring reports
    const files = fs.readdirSync('.');
    const recentReports = files.filter(
      file =>
        file.includes('image-performance-monitoring-') &&
        file.endsWith('.json') &&
        this.isRecentFile(file)
    );

    if (recentReports.length === 0) {
      throw new Error('No recent monitoring reports found');
    }

    // Validate report structure
    const reportPath = recentReports[0];
    const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

    const requiredFields = [
      'timestamp',
      'imageMetrics',
      'coreWebVitals',
      'summary',
    ];
    const missingFields = requiredFields.filter(field => !report[field]);

    if (missingFields.length > 0) {
      throw new Error(
        `Report missing required fields: ${missingFields.join(', ')}`
      );
    }

    return {
      reportsFound: recentReports.length,
      reportValid: true,
      reportSize: fs.statSync(reportPath).size,
    };
  }

  /**
   * Check if file was created recently (within last hour)
   */
  isRecentFile(filename) {
    try {
      const stats = fs.statSync(filename);
      const now = new Date();
      const fileTime = stats.mtime;
      const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      return fileTime > hourAgo;
    } catch (error) {
      return false;
    }
  }

  /**
   * Test alert system functionality
   */
  testAlertSystem() {
    const alertsConfigPath = 'config/performance-alerts-config.json';

    if (!fs.existsSync(alertsConfigPath)) {
      throw new Error('Alerts configuration file not found');
    }

    const alertsConfig = JSON.parse(fs.readFileSync(alertsConfigPath, 'utf8'));

    if (!alertsConfig.alertRules || alertsConfig.alertRules.length === 0) {
      throw new Error('No alert rules configured');
    }

    return {
      alertsConfigured: true,
      alertRules: alertsConfig.alertRules.length,
      escalationPolicies: alertsConfig.escalationPolicies
        ? alertsConfig.escalationPolicies.levels.length
        : 0,
    };
  }

  /**
   * Run all monitoring system tests
   */
  async runAllTests() {
    console.log('🚀 Starting Image Performance Monitoring System Tests');
    console.log('='.repeat(60));

    this.results.summary.total = 7; // Total number of tests

    // Run individual tests
    this.runTest('Configuration Files', () => this.testConfigurationFiles());
    this.runTest('Monitoring Scripts', () => this.testMonitoringScripts());
    this.runTest('Configuration Loading', () =>
      this.testConfigurationLoading()
    );
    this.runTest('Image Performance Monitoring', () =>
      this.testImagePerformanceMonitoring()
    );
    this.runTest('Core Web Vitals Monitoring', () =>
      this.testCoreWebVitalsMonitoring()
    );
    this.runTest('Report Generation', () => this.testReportGeneration());
    this.runTest('Alert System', () => this.testAlertSystem());

    // Generate test summary
    this.generateTestSummary();

    return this.results;
  }

  /**
   * Generate and display test summary
   */
  generateTestSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 MONITORING SYSTEM TEST SUMMARY');
    console.log('='.repeat(60));

    console.log(`Total Tests: ${this.results.summary.total}`);
    console.log(`Passed: ${this.results.summary.passed}`);
    console.log(`Failed: ${this.results.summary.failed}`);
    console.log(
      `Success Rate: ${Math.round((this.results.summary.passed / this.results.summary.total) * 100)}%`
    );

    if (this.results.summary.failed > 0) {
      console.log('\n❌ FAILED TESTS:');
      this.results.tests
        .filter(test => test.status === 'FAILED')
        .forEach(test => {
          console.log(`  - ${test.name}: ${test.error}`);
        });
    }

    if (this.results.summary.passed === this.results.summary.total) {
      console.log(
        '\n🎉 All tests passed! Image performance monitoring system is fully operational.'
      );
    } else {
      console.log('\n⚠️  Some tests failed. Please review the issues above.');
    }

    // Save test results
    const resultsPath = `monitoring-system-test-results-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    fs.writeFileSync(resultsPath, JSON.stringify(this.results, null, 2));
    console.log(`\n📄 Test results saved: ${resultsPath}`);
  }
}

// CLI execution
if (require.main === module) {
  const tester = new MonitoringSystemTest();

  tester
    .runAllTests()
    .then(results => {
      const exitCode = results.summary.failed > 0 ? 1 : 0;
      process.exit(exitCode);
    })
    .catch(error => {
      console.error('❌ Test execution failed:', error);
      process.exit(1);
    });
}

module.exports = MonitoringSystemTest;
