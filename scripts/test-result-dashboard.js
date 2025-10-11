#!/usr/bin/env node

/**
 * Test Result Dashboard and Monitoring System
 * 
 * This script creates a comprehensive dashboard for monitoring test results
 * across all test types: unit tests, e2e tests, performance tests, accessibility tests
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class TestResultDashboard {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        success_rate: 0
      },
      categories: {
        unit: { status: 'pending', results: null, duration: 0 },
        e2e: { status: 'pending', results: null, duration: 0 },
        performance: { status: 'pending', results: null, duration: 0 },
        accessibility: { status: 'pending', results: null, duration: 0 },
        functionality: { status: 'pending', results: null, duration: 0 }
      },
      alerts: [],
      recommendations: []
    };
    
    this.dashboardDir = '.kiro/test-results';
    this.ensureDashboardDirectory();
  }

  ensureDashboardDirectory() {
    if (!fs.existsSync(this.dashboardDir)) {
      fs.mkdirSync(this.dashboardDir, { recursive: true });
    }
  }

  async runAllTests() {
    console.log('🚀 Starting comprehensive test suite...\n');
    
    // Run unit tests
    await this.runUnitTests();
    
    // Run e2e tests
    await this.runE2ETests();
    
    // Run performance tests
    await this.runPerformanceTests();
    
    // Run accessibility tests
    await this.runAccessibilityTests();
    
    // Run functionality tests
    await this.runFunctionalityTests();
    
    // Calculate summary
    this.calculateSummary();
    
    // Generate alerts and recommendations
    this.generateAlertsAndRecommendations();
    
    // Save results
    this.saveResults();
    
    // Generate HTML dashboard
    this.generateHTMLDashboard();
    
    // Display summary
    this.displaySummary();
  }

  async runUnitTests() {
    console.log('📋 Running unit tests...');
    const startTime = Date.now();
    
    try {
      const output = execSync('npm run test', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      this.results.categories.unit = {
        status: 'passed',
        results: this.parseVitestOutput(output),
        duration: Date.now() - startTime,
        output: output
      };
      
      console.log('✅ Unit tests completed successfully');
    } catch (error) {
      this.results.categories.unit = {
        status: 'failed',
        results: this.parseVitestOutput(error.stdout || error.message),
        duration: Date.now() - startTime,
        output: error.stdout || error.message,
        error: error.message
      };
      
      console.log('❌ Unit tests failed');
    }
  }

  async runE2ETests() {
    console.log('🎭 Running end-to-end tests...');
    const startTime = Date.now();
    
    try {
      const output = execSync('npx playwright test --reporter=json', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      this.results.categories.e2e = {
        status: 'passed',
        results: this.parsePlaywrightOutput(output),
        duration: Date.now() - startTime,
        output: output
      };
      
      console.log('✅ E2E tests completed successfully');
    } catch (error) {
      this.results.categories.e2e = {
        status: 'failed',
        results: this.parsePlaywrightOutput(error.stdout || error.message),
        duration: Date.now() - startTime,
        output: error.stdout || error.message,
        error: error.message
      };
      
      console.log('❌ E2E tests failed');
    }
  }

  async runPerformanceTests() {
    console.log('⚡ Running performance tests...');
    const startTime = Date.now();
    
    try {
      const output = execSync('npm run performance:validate', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      this.results.categories.performance = {
        status: 'passed',
        results: this.parsePerformanceOutput(output),
        duration: Date.now() - startTime,
        output: output
      };
      
      console.log('✅ Performance tests completed successfully');
    } catch (error) {
      this.results.categories.performance = {
        status: 'failed',
        results: this.parsePerformanceOutput(error.stdout || error.message),
        duration: Date.now() - startTime,
        output: error.stdout || error.message,
        error: error.message
      };
      
      console.log('❌ Performance tests failed');
    }
  }

  async runAccessibilityTests() {
    console.log('♿ Running accessibility tests...');
    const startTime = Date.now();
    
    try {
      const output = execSync('npm run test:accessibility', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      this.results.categories.accessibility = {
        status: 'passed',
        results: this.parseAccessibilityOutput(output),
        duration: Date.now() - startTime,
        output: output
      };
      
      console.log('✅ Accessibility tests completed successfully');
    } catch (error) {
      this.results.categories.accessibility = {
        status: 'failed',
        results: this.parseAccessibilityOutput(error.stdout || error.message),
        duration: Date.now() - startTime,
        output: error.stdout || error.message,
        error: error.message
      };
      
      console.log('❌ Accessibility tests failed');
    }
  }

  async runFunctionalityTests() {
    console.log('🔧 Running functionality tests...');
    const startTime = Date.now();
    
    try {
      const output = execSync('npm run test:core-functionality', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      this.results.categories.functionality = {
        status: 'passed',
        results: this.parseFunctionalityOutput(output),
        duration: Date.now() - startTime,
        output: output
      };
      
      console.log('✅ Functionality tests completed successfully');
    } catch (error) {
      this.results.categories.functionality = {
        status: 'failed',
        results: this.parseFunctionalityOutput(error.stdout || error.message),
        duration: Date.now() - startTime,
        output: error.stdout || error.message,
        error: error.message
      };
      
      console.log('❌ Functionality tests failed');
    }
  }

  parseVitestOutput(output) {
    const lines = output.split('\n');
    let passed = 0, failed = 0, skipped = 0;
    
    lines.forEach(line => {
      if (line.includes('✓') || line.includes('PASS')) passed++;
      if (line.includes('✗') || line.includes('FAIL')) failed++;
      if (line.includes('SKIP')) skipped++;
    });
    
    return { passed, failed, skipped, total: passed + failed + skipped };
  }

  parsePlaywrightOutput(output) {
    try {
      const jsonOutput = JSON.parse(output);
      const stats = jsonOutput.stats || {};
      return {
        passed: stats.expected || 0,
        failed: stats.unexpected || 0,
        skipped: stats.skipped || 0,
        total: (stats.expected || 0) + (stats.unexpected || 0) + (stats.skipped || 0)
      };
    } catch {
      return this.parseGenericOutput(output);
    }
  }

  parsePerformanceOutput(output) {
    return this.parseGenericOutput(output);
  }

  parseAccessibilityOutput(output) {
    return this.parseGenericOutput(output);
  }

  parseFunctionalityOutput(output) {
    return this.parseGenericOutput(output);
  }

  parseGenericOutput(output) {
    const lines = output.split('\n');
    let passed = 0, failed = 0, skipped = 0;
    
    lines.forEach(line => {
      if (line.includes('✅') || line.includes('PASS') || line.includes('SUCCESS')) passed++;
      if (line.includes('❌') || line.includes('FAIL') || line.includes('ERROR')) failed++;
      if (line.includes('⚠️') || line.includes('SKIP') || line.includes('WARNING')) skipped++;
    });
    
    return { passed, failed, skipped, total: passed + failed + skipped };
  }

  calculateSummary() {
    let totalPassed = 0, totalFailed = 0, totalSkipped = 0, totalTests = 0;
    
    Object.values(this.results.categories).forEach(category => {
      if (category.results) {
        totalPassed += category.results.passed || 0;
        totalFailed += category.results.failed || 0;
        totalSkipped += category.results.skipped || 0;
        totalTests += category.results.total || 0;
      }
    });
    
    this.results.summary = {
      total: totalTests,
      passed: totalPassed,
      failed: totalFailed,
      skipped: totalSkipped,
      success_rate: totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 0
    };
  }

  generateAlertsAndRecommendations() {
    const { summary, categories } = this.results;
    
    // Generate alerts for failed tests
    Object.entries(categories).forEach(([category, data]) => {
      if (data.status === 'failed') {
        this.results.alerts.push({
          type: 'error',
          category: category,
          message: `${category.toUpperCase()} tests failed`,
          details: data.error || 'Check test output for details'
        });
      }
    });
    
    // Generate recommendations based on success rate
    if (summary.success_rate < 80) {
      this.results.recommendations.push({
        type: 'critical',
        message: 'Test success rate is below 80%',
        action: 'Review and fix failing tests before deployment'
      });
    } else if (summary.success_rate < 95) {
      this.results.recommendations.push({
        type: 'warning',
        message: 'Test success rate could be improved',
        action: 'Consider addressing failing tests for better reliability'
      });
    }
    
    // Check for long-running tests
    Object.entries(categories).forEach(([category, data]) => {
      if (data.duration > 60000) { // 1 minute
        this.results.recommendations.push({
          type: 'performance',
          message: `${category.toUpperCase()} tests are taking too long`,
          action: 'Consider optimizing test performance'
        });
      }
    });
  }

  saveResults() {
    const resultsFile = path.join(this.dashboardDir, 'latest-results.json');
    const historyFile = path.join(this.dashboardDir, 'test-history.json');
    
    // Save latest results
    fs.writeFileSync(resultsFile, JSON.stringify(this.results, null, 2));
    
    // Update history
    let history = [];
    if (fs.existsSync(historyFile)) {
      try {
        history = JSON.parse(fs.readFileSync(historyFile, 'utf8'));
      } catch (error) {
        console.warn('Could not read test history:', error.message);
      }
    }
    
    history.push({
      timestamp: this.results.timestamp,
      summary: this.results.summary,
      duration: Object.values(this.results.categories).reduce((sum, cat) => sum + cat.duration, 0)
    });
    
    // Keep only last 50 results
    if (history.length > 50) {
      history = history.slice(-50);
    }
    
    fs.writeFileSync(historyFile, JSON.stringify(history, null, 2));
  }

  generateHTMLDashboard() {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Results Dashboard</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 20px; }
        .metric { background: white; padding: 20px; border-radius: 8px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .metric-value { font-size: 2em; font-weight: bold; margin-bottom: 5px; }
        .metric-label { color: #666; font-size: 0.9em; }
        .success { color: #22c55e; }
        .error { color: #ef4444; }
        .warning { color: #f59e0b; }
        .categories { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 20px; }
        .category { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .category-header { display: flex; justify-content: between; align-items: center; margin-bottom: 15px; }
        .category-title { font-size: 1.2em; font-weight: bold; }
        .status-badge { padding: 4px 8px; border-radius: 4px; font-size: 0.8em; font-weight: bold; }
        .status-passed { background: #dcfce7; color: #166534; }
        .status-failed { background: #fecaca; color: #991b1b; }
        .status-pending { background: #fef3c7; color: #92400e; }
        .alerts { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .alert { padding: 10px; margin-bottom: 10px; border-radius: 4px; border-left: 4px solid; }
        .alert-error { background: #fef2f2; border-color: #ef4444; }
        .alert-warning { background: #fffbeb; border-color: #f59e0b; }
        .recommendations { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .timestamp { color: #666; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Test Results Dashboard</h1>
            <p class="timestamp">Last updated: ${new Date(this.results.timestamp).toLocaleString()}</p>
        </div>
        
        <div class="summary">
            <div class="metric">
                <div class="metric-value ${this.results.summary.success_rate >= 95 ? 'success' : this.results.summary.success_rate >= 80 ? 'warning' : 'error'}">
                    ${this.results.summary.success_rate}%
                </div>
                <div class="metric-label">Success Rate</div>
            </div>
            <div class="metric">
                <div class="metric-value">${this.results.summary.total}</div>
                <div class="metric-label">Total Tests</div>
            </div>
            <div class="metric">
                <div class="metric-value success">${this.results.summary.passed}</div>
                <div class="metric-label">Passed</div>
            </div>
            <div class="metric">
                <div class="metric-value error">${this.results.summary.failed}</div>
                <div class="metric-label">Failed</div>
            </div>
            <div class="metric">
                <div class="metric-value warning">${this.results.summary.skipped}</div>
                <div class="metric-label">Skipped</div>
            </div>
        </div>
        
        <div class="categories">
            ${Object.entries(this.results.categories).map(([name, data]) => `
                <div class="category">
                    <div class="category-header">
                        <div class="category-title">${name.toUpperCase()}</div>
                        <div class="status-badge status-${data.status}">${data.status.toUpperCase()}</div>
                    </div>
                    ${data.results ? `
                        <div>Total: ${data.results.total}</div>
                        <div>Passed: <span class="success">${data.results.passed}</span></div>
                        <div>Failed: <span class="error">${data.results.failed}</span></div>
                        <div>Skipped: <span class="warning">${data.results.skipped}</span></div>
                        <div>Duration: ${Math.round(data.duration / 1000)}s</div>
                    ` : '<div>No results available</div>'}
                </div>
            `).join('')}
        </div>
        
        ${this.results.alerts.length > 0 ? `
            <div class="alerts">
                <h2>Alerts</h2>
                ${this.results.alerts.map(alert => `
                    <div class="alert alert-${alert.type}">
                        <strong>${alert.message}</strong><br>
                        ${alert.details}
                    </div>
                `).join('')}
            </div>
        ` : ''}
        
        ${this.results.recommendations.length > 0 ? `
            <div class="recommendations">
                <h2>Recommendations</h2>
                ${this.results.recommendations.map(rec => `
                    <div class="alert alert-${rec.type === 'critical' ? 'error' : 'warning'}">
                        <strong>${rec.message}</strong><br>
                        ${rec.action}
                    </div>
                `).join('')}
            </div>
        ` : ''}
    </div>
</body>
</html>
    `;
    
    const dashboardFile = path.join(this.dashboardDir, 'dashboard.html');
    fs.writeFileSync(dashboardFile, html);
    
    console.log(`\n📊 HTML dashboard generated: ${dashboardFile}`);
  }

  displaySummary() {
    const { summary, alerts, recommendations } = this.results;
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST RESULTS SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${summary.total}`);
    console.log(`Passed: ${summary.passed} ✅`);
    console.log(`Failed: ${summary.failed} ❌`);
    console.log(`Skipped: ${summary.skipped} ⚠️`);
    console.log(`Success Rate: ${summary.success_rate}% ${summary.success_rate >= 95 ? '🎉' : summary.success_rate >= 80 ? '⚠️' : '🚨'}`);
    
    if (alerts.length > 0) {
      console.log('\n🚨 ALERTS:');
      alerts.forEach(alert => {
        console.log(`  • ${alert.message}: ${alert.details}`);
      });
    }
    
    if (recommendations.length > 0) {
      console.log('\n💡 RECOMMENDATIONS:');
      recommendations.forEach(rec => {
        console.log(`  • ${rec.message}: ${rec.action}`);
      });
    }
    
    console.log('\n📁 Results saved to:', this.dashboardDir);
    console.log('='.repeat(60));
  }

  // Static method to view existing results
  static viewResults() {
    const dashboardDir = '.kiro/test-results';
    const resultsFile = path.join(dashboardDir, 'latest-results.json');
    
    if (!fs.existsSync(resultsFile)) {
      console.log('❌ No test results found. Run tests first.');
      return;
    }
    
    try {
      const results = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));
      const dashboard = new TestResultDashboard();
      dashboard.results = results;
      dashboard.displaySummary();
    } catch (error) {
      console.error('❌ Error reading test results:', error.message);
    }
  }

  // Static method to start monitoring
  static startMonitoring(interval = 300000) { // 5 minutes default
    console.log(`🔄 Starting test monitoring (interval: ${interval / 1000}s)`);
    
    const runTests = async () => {
      console.log('\n⏰ Scheduled test run starting...');
      const dashboard = new TestResultDashboard();
      await dashboard.runAllTests();
    };
    
    // Run immediately
    runTests();
    
    // Schedule recurring runs
    setInterval(runTests, interval);
  }
}

// CLI interface
if (require.main === module) {
  const command = process.argv[2];
  
  switch (command) {
    case 'run':
      const dashboard = new TestResultDashboard();
      dashboard.runAllTests().catch(console.error);
      break;
      
    case 'view':
      TestResultDashboard.viewResults();
      break;
      
    case 'monitor':
      const interval = parseInt(process.argv[3]) || 300000;
      TestResultDashboard.startMonitoring(interval);
      break;
      
    case 'html':
      const dashboardFile = path.join('.kiro/test-results', 'dashboard.html');
      if (fs.existsSync(dashboardFile)) {
        console.log(`📊 Dashboard available at: file://${path.resolve(dashboardFile)}`);
      } else {
        console.log('❌ No dashboard found. Run tests first.');
      }
      break;
      
    default:
      console.log(`
📊 Test Result Dashboard and Monitoring System

Usage:
  node scripts/test-result-dashboard.js run      - Run all tests and generate dashboard
  node scripts/test-result-dashboard.js view     - View latest test results
  node scripts/test-result-dashboard.js monitor  - Start continuous monitoring
  node scripts/test-result-dashboard.js html     - Show HTML dashboard path

Examples:
  npm run test:dashboard                         - Run all tests
  npm run test:dashboard:view                    - View results
  npm run test:dashboard:monitor                 - Start monitoring
      `);
  }
}

module.exports = TestResultDashboard;