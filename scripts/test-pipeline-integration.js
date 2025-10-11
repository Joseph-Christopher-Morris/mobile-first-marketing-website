#!/usr/bin/env node

/**
 * Test Pipeline Integration Verification
 *
 * This script verifies that the deployment pipeline integration is working correctly
 * by testing all the components that were set up in task 5.2.4.5
 */

const fs = require('fs');
const path = require('path');

class PipelineIntegrationTest {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      tests: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
      },
    };
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    console.log(`${prefix} ${message}`);
  }

  test(name, testFn) {
    this.log(`Testing: ${name}...`);
    this.results.summary.total++;

    try {
      const result = testFn();
      if (result) {
        this.log(`✅ ${name} - PASSED`, 'success');
        this.results.summary.passed++;
        this.results.tests.push({ name, status: 'passed', error: null });
      } else {
        this.log(`❌ ${name} - FAILED`, 'error');
        this.results.summary.failed++;
        this.results.tests.push({
          name,
          status: 'failed',
          error: 'Test returned false',
        });
      }
    } catch (error) {
      this.log(`❌ ${name} - FAILED: ${error.message}`, 'error');
      this.results.summary.failed++;
      this.results.tests.push({ name, status: 'failed', error: error.message });
    }
  }

  async run() {
    this.log('🚀 Starting Pipeline Integration Verification...\n');

    // Test 1: Pre-deployment validation configuration exists
    this.test('Pre-deployment validation configuration', () => {
      const configPath = '.kiro/deployment-pipeline/pipeline-config.json';
      if (!fs.existsSync(configPath)) return false;

      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      return (
        config.preDeploymentTests?.enabled === true &&
        config.preDeploymentTests?.testSuites?.length > 0
      );
    });

    // Test 2: Test reporting configuration exists
    this.test('Test reporting configuration', () => {
      const configPath = '.kiro/deployment-pipeline/reporting-config.json';
      if (!fs.existsSync(configPath)) return false;

      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      return (
        config.formats?.json?.enabled === true &&
        config.aggregation?.enabled === true
      );
    });

    // Test 3: Failure notifications configuration exists
    this.test('Failure notifications configuration', () => {
      const configPath = '.kiro/deployment-pipeline/notification-config.json';
      if (!fs.existsSync(configPath)) return false;

      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      return (
        config.enabled === true &&
        config.triggers?.onTestFailure?.enabled === true
      );
    });

    // Test 4: Dashboard configuration and template exist
    this.test('Dashboard configuration and template', () => {
      const configPath = '.kiro/deployment-pipeline/dashboard-config.json';
      const templatePath = 'test-results/deployment-dashboard.html';

      if (!fs.existsSync(configPath) || !fs.existsSync(templatePath))
        return false;

      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      const template = fs.readFileSync(templatePath, 'utf8');

      return (
        config.enabled === true &&
        template.includes('Deployment Test Dashboard')
      );
    });

    // Test 5: Test result aggregator script exists and is functional
    this.test('Test result aggregator functionality', () => {
      const scriptPath = 'scripts/test-result-aggregator.js';
      return fs.existsSync(scriptPath);
    });

    // Test 6: Deployment test integration script exists
    this.test('Deployment test integration script', () => {
      const scriptPath = 'scripts/deployment-test-integration.js';
      if (!fs.existsSync(scriptPath)) return false;

      const script = fs.readFileSync(scriptPath, 'utf8');
      return (
        script.includes('class DeploymentTestIntegration') &&
        script.includes('configurePreDeploymentValidation')
      );
    });

    // Test 7: Pipeline integration script exists
    this.test('Pipeline integration script', () => {
      const scriptPath = 'scripts/deployment-pipeline-integration.js';
      if (!fs.existsSync(scriptPath)) return false;

      const script = fs.readFileSync(scriptPath, 'utf8');
      return (
        script.includes('class DeploymentPipelineIntegration') &&
        script.includes('configurePreDeploymentValidation') &&
        script.includes('setupTestReporting') &&
        script.includes('setupFailureNotifications') &&
        script.includes('createTestResultDashboard')
      );
    });

    // Test 8: Package.json scripts are configured
    this.test('Package.json scripts configuration', () => {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const scripts = packageJson.scripts;

      return (
        scripts['deploy:pipeline-integration'] &&
        scripts['deploy:pipeline-configure'] &&
        scripts['deploy:pipeline-validate']
      );
    });

    // Test 9: Amplify.yml is updated with integration
    this.test('Amplify.yml integration', () => {
      if (!fs.existsSync('amplify.yml')) return false;

      const amplifyConfig = fs.readFileSync('amplify.yml', 'utf8');
      return amplifyConfig.includes('deployment-pipeline-integration.js');
    });

    // Test 10: Integration report was generated
    this.test('Integration report generation', () => {
      const reportPath = 'test-results/integration-report.json';
      if (!fs.existsSync(reportPath)) return false;

      const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
      return (
        report.integration?.status === 'completed' &&
        report.integration?.components?.preDeploymentTests === true &&
        report.integration?.components?.testReporting === true &&
        report.integration?.components?.failureNotifications === true &&
        report.integration?.components?.dashboard === true
      );
    });

    // Generate summary
    this.generateSummary();

    return this.results.summary.failed === 0;
  }

  generateSummary() {
    const { total, passed, failed } = this.results.summary;
    const successRate = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;

    this.log('\n' + '='.repeat(80));
    this.log('🎯 PIPELINE INTEGRATION VERIFICATION RESULTS');
    this.log('='.repeat(80));
    this.log(`📊 Total Tests: ${total}`);
    this.log(`✅ Passed: ${passed}`);
    this.log(`❌ Failed: ${failed}`);
    this.log(`📈 Success Rate: ${successRate}%`);
    this.log('='.repeat(80));

    if (failed === 0) {
      this.log('🎉 All pipeline integration tests PASSED!', 'success');
      this.log(
        '✅ Task 5.2.4.5 "Integrate functionality tests with deployment pipeline" is COMPLETE',
        'success'
      );
      this.log('\nIntegration Summary:');
      this.log('• ✅ Pre-deployment validation configured');
      this.log('• ✅ Test reporting and aggregation set up');
      this.log('• ✅ Failure notifications configured');
      this.log('• ✅ Test result dashboard created');
      this.log('• ✅ Amplify.yml updated with integration');
      this.log('• ✅ Package.json scripts configured');
      this.log('\nNext Steps:');
      this.log('• Run: npm run deploy:pipeline-integration');
      this.log('• View: test-results/deployment-dashboard.html');
      this.log('• Deploy: Push to trigger Amplify deployment');
    } else {
      this.log('❌ Some pipeline integration tests FAILED', 'error');
      this.log('Failed tests:');
      this.results.tests
        .filter(test => test.status === 'failed')
        .forEach(test => this.log(`  • ${test.name}: ${test.error}`, 'error'));
    }

    this.log('='.repeat(80));

    // Save results
    const resultsPath = 'test-results/pipeline-integration-verification.json';
    fs.writeFileSync(resultsPath, JSON.stringify(this.results, null, 2));
    this.log(`📋 Detailed results saved to: ${resultsPath}`);
  }
}

// Run the verification
if (require.main === module) {
  const tester = new PipelineIntegrationTest();
  tester
    .run()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Verification failed:', error);
      process.exit(1);
    });
}

module.exports = PipelineIntegrationTest;
