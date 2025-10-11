#!/usr/bin/env node

/**
 * Test Core Web Vitals Monitoring Implementation
 * Validates the monitoring system and ensures it meets requirements
 */

const CoreWebVitalsMonitor = require('./core-web-vitals-monitor');
const fs = require('fs').promises;
const path = require('path');

class CoreWebVitalsTest {
  constructor() {
    this.testResults = [];
  }

  async testMonitoringSystem() {
    console.log('🧪 Testing Core Web Vitals Monitoring System');
    console.log('');

    // Test 1: Verify monitoring targets
    await this.testTargets();
    
    // Test 2: Test configuration loading
    await this.testConfiguration();
    
    // Test 3: Run sample monitoring
    await this.testSampleMonitoring();
    
    // Test 4: Validate output format
    await this.testOutputFormat();
    
    // Generate test report
    await this.generateTestReport();
    
    const passed = this.testResults.every(test => test.passed);
    
    console.log('\n📊 Test Summary:');
    console.log(`Total Tests: ${this.testResults.length}`);
    console.log(`Passed: ${this.testResults.filter(t => t.passed).length}`);
    console.log(`Failed: ${this.testResults.filter(t => !t.passed).length}`);
    console.log(`Overall: ${passed ? '✅ PASSED' : '❌ FAILED'}`);
    
    return passed;
  }

  async testTargets() {
    console.log('🎯 Testing Performance Targets');
    
    try {
      const monitor = new CoreWebVitalsMonitor();
      const targets = monitor.targets;
      
      // Verify LCP target
      const lcpTest = {
        name: 'LCP Target Validation',
        expected: 2500,
        actual: targets.lcp,
        passed: targets.lcp === 2500
      };
      
      // Verify FID target
      const fidTest = {
        name: 'FID Target Validation',
        expected: 100,
        actual: targets.fid,
        passed: targets.fid === 100
      };
      
      // Verify CLS target
      const clsTest = {
        name: 'CLS Target Validation',
        expected: 0.1,
        actual: targets.cls,
        passed: targets.cls === 0.1
      };
      
      this.testResults.push(lcpTest, fidTest, clsTest);
      
      console.log(`   LCP Target: ${lcpTest.passed ? '✅' : '❌'} ${lcpTest.actual}ms (expected: ${lcpTest.expected}ms)`);
      console.log(`   FID Target: ${fidTest.passed ? '✅' : '❌'} ${fidTest.actual}ms (expected: ${fidTest.expected}ms)`);
      console.log(`   CLS Target: ${clsTest.passed ? '✅' : '❌'} ${clsTest.actual} (expected: ${clsTest.expected})`);
      
    } catch (error) {
      console.error(`   ❌ Error testing targets: ${error.message}`);
      this.testResults.push({
        name: 'Target Configuration Test',
        passed: false,
        error: error.message
      });
    }
    
    console.log('');
  }

  async testConfiguration() {
    console.log('⚙️ Testing Configuration');
    
    try {
      // Check if config file exists
      const configPath = path.join(process.cwd(), 'config', 'core-web-vitals-config.json');
      const configExists = await fs.access(configPath).then(() => true).catch(() => false);
      
      const configTest = {
        name: 'Configuration File Exists',
        passed: configExists,
        details: configExists ? 'Config file found' : 'Config file missing'
      };
      
      this.testResults.push(configTest);
      console.log(`   Config File: ${configTest.passed ? '✅' : '❌'} ${configTest.details}`);
      
      if (configExists) {
        const configContent = await fs.readFile(configPath, 'utf8');
        const config = JSON.parse(configContent);
        
        // Validate config structure
        const structureTest = {
          name: 'Configuration Structure',
          passed: config.targets && config.testUrls && config.monitoring,
          details: 'Required sections present'
        };
        
        this.testResults.push(structureTest);
        console.log(`   Config Structure: ${structureTest.passed ? '✅' : '❌'} ${structureTest.details}`);
      }
      
    } catch (error) {
      console.error(`   ❌ Error testing configuration: ${error.message}`);
      this.testResults.push({
        name: 'Configuration Test',
        passed: false,
        error: error.message
      });
    }
    
    console.log('');
  }

  async testSampleMonitoring() {
    console.log('🔍 Testing Sample Monitoring (Single Page)');
    
    try {
      // Test with a single page to avoid long test times
      const monitor = new CoreWebVitalsMonitor();
      
      // Override test URLs for faster testing
      monitor.testUrls = [
        { name: 'Home', url: 'https://d15sc9fc739ev2.cloudfront.net/' }
      ];
      
      console.log('   Running sample monitoring...');
      const result = await monitor.runMonitoring();
      
      const monitoringTest = {
        name: 'Sample Monitoring Execution',
        passed: result && result.results && result.results.length > 0,
        details: `Monitored ${result?.results?.length || 0} pages`
      };
      
      this.testResults.push(monitoringTest);
      console.log(`   Monitoring: ${monitoringTest.passed ? '✅' : '❌'} ${monitoringTest.details}`);
      
      // Test metrics capture
      if (result && result.results.length > 0) {
        const firstResult = result.results[0];
        const metricsTest = {
          name: 'Metrics Capture',
          passed: firstResult.metrics && (firstResult.metrics.lcp || firstResult.metrics.fid || firstResult.metrics.cls),
          details: `Captured: ${Object.keys(firstResult.metrics || {}).join(', ')}`
        };
        
        this.testResults.push(metricsTest);
        console.log(`   Metrics: ${metricsTest.passed ? '✅' : '❌'} ${metricsTest.details}`);
      }
      
    } catch (error) {
      console.error(`   ❌ Error in sample monitoring: ${error.message}`);
      this.testResults.push({
        name: 'Sample Monitoring Test',
        passed: false,
        error: error.message
      });
    }
    
    console.log('');
  }

  async testOutputFormat() {
    console.log('📄 Testing Output Format');
    
    try {
      // Check for recent monitoring files
      const files = await fs.readdir(process.cwd());
      const recentFiles = files.filter(file => 
        file.startsWith('core-web-vitals-monitoring-') && file.endsWith('.json')
      );
      
      const outputTest = {
        name: 'Output File Generation',
        passed: recentFiles.length > 0,
        details: `Found ${recentFiles.length} monitoring files`
      };
      
      this.testResults.push(outputTest);
      console.log(`   Output Files: ${outputTest.passed ? '✅' : '❌'} ${outputTest.details}`);
      
      // Check summary files
      const summaryFiles = files.filter(file => 
        file.startsWith('core-web-vitals-summary-') && file.endsWith('.md')
      );
      
      const summaryTest = {
        name: 'Summary File Generation',
        passed: summaryFiles.length > 0,
        details: `Found ${summaryFiles.length} summary files`
      };
      
      this.testResults.push(summaryTest);
      console.log(`   Summary Files: ${summaryTest.passed ? '✅' : '❌'} ${summaryTest.details}`);
      
    } catch (error) {
      console.error(`   ❌ Error testing output format: ${error.message}`);
      this.testResults.push({
        name: 'Output Format Test',
        passed: false,
        error: error.message
      });
    }
    
    console.log('');
  }

  async generateTestReport() {
    const timestamp = new Date().toISOString();
    const report = {
      timestamp,
      testSuite: 'Core Web Vitals Monitoring',
      totalTests: this.testResults.length,
      passed: this.testResults.filter(t => t.passed).length,
      failed: this.testResults.filter(t => !t.passed).length,
      results: this.testResults
    };
    
    const reportFile = `core-web-vitals-test-report-${timestamp.replace(/[:.]/g, '-')}.json`;
    await fs.writeFile(reportFile, JSON.stringify(report, null, 2));
    
    console.log(`📋 Test report saved to: ${reportFile}`);
  }
}

// CLI execution
if (require.main === module) {
  const tester = new CoreWebVitalsTest();
  
  tester.testMonitoringSystem()
    .then(passed => {
      if (!passed) {
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('❌ Test execution failed:', error);
      process.exit(1);
    });
}

module.exports = CoreWebVitalsTest;