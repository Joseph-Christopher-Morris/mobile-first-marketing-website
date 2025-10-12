#!/usr/bin/env node

/**
 * CI Integration Test Runner
 * 
 * Runs comprehensive CI validation tests including workflow validation,
 * Git workflow consistency, and performance benchmarks in sequence.
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 */

const fs = require('fs');
const path = require('path');

// Import test suites
const CIValidationTestSuite = require('./ci-validation-test-suite');
const WorkflowValidationTests = require('./test-workflow-validation');
const GitWorkflowConsistencyTests = require('./test-git-workflow-consistency');
const BuildPerformanceBenchmarks = require('./test-build-performance-benchmarks');

class CIIntegrationTestRunner {
  constructor() {
    this.results = {
      suites: {},
      summary: {
        totalSuites: 0,
        passedSuites: 0,
        failedSuites: 0,
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        warnings: 0
      },
      startTime: Date.now(),
      endTime: null
    };
    
    this.testSuites = [
      {
        name: 'Workflow Validation',
        class: WorkflowValidationTests,
        description: 'Validates GitHub Actions workflow configuration'
      },
      {
        name: 'Git Workflow Consistency',
        class: GitWorkflowConsistencyTests,
        description: 'Tests Git configuration and workflow consistency'
      },
      {
        name: 'Build Performance Benchmarks',
        class: BuildPerformanceBenchmarks,
        description: 'Measures build process performance metrics'
      }
    ];
  }

  /**
   * Run all CI integration tests
   */
  async runAllTests() {
    console.log('🚀 Starting CI Integration Test Suite');
    console.log('=' .repeat(60));
    console.log(`Running ${this.testSuites.length} test suites...`);
    console.log('');

    let overallSuccess = true;

    for (const suite of this.testSuites) {
      try {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`🧪 Running: ${suite.name}`);
        console.log(`📝 ${suite.description}`);
        console.log(`${'='.repeat(60)}`);

        const suiteResult = await this.runTestSuite(suite);
        this.results.suites[suite.name] = suiteResult;
        
        if (suiteResult.success) {
          this.results.summary.passedSuites++;
          console.log(`\n✅ ${suite.name} completed successfully`);
        } else {
          this.results.summary.failedSuites++;
          overallSuccess = false;
          console.log(`\n❌ ${suite.name} failed`);
        }

      } catch (error) {
        console.error(`\n💥 ${suite.name} crashed: ${error.message}`);
        this.results.suites[suite.name] = {
          success: false,
          error: error.message,
          crashed: true
        };
        this.results.summary.failedSuites++;
        overallSuccess = false;
      }

      this.results.summary.totalSuites++;
    }

    this.results.endTime = Date.now();
    this.generateFinalReport(overallSuccess);
  }

  /**
   * Run individual test suite
   */
  async runTestSuite(suite) {
    const startTime = Date.now();
    
    try {
      // Create instance of test suite
      const testInstance = new suite.class();
      
      // Capture console output
      const originalLog = console.log;
      const originalError = console.error;
      const logs = [];
      
      console.log = (...args) => {
        logs.push(['log', ...args]);
        originalLog(...args);
      };
      
      console.error = (...args) => {
        logs.push(['error', ...args]);
        originalError(...args);
      };

      let result;
      
      try {
        // Run the test suite based on its type
        if (suite.class === WorkflowValidationTests) {
          testInstance.runTests();
          result = testInstance.results;
        } else if (suite.class === GitWorkflowConsistencyTests) {
          testInstance.runTests();
          result = testInstance.results;
        } else if (suite.class === BuildPerformanceBenchmarks) {
          testInstance.runBenchmarks();
          result = testInstance.results;
        } else {
          throw new Error(`Unknown test suite type: ${suite.name}`);
        }
        
        // Restore console
        console.log = originalLog;
        console.error = originalError;
        
        return {
          success: result.failed === 0,
          duration: Date.now() - startTime,
          tests: result.tests || [],
          passed: result.passed || 0,
          failed: result.failed || 0,
          warnings: result.warnings || [],
          details: result,
          logs: logs
        };
        
      } catch (error) {
        // Restore console
        console.log = originalLog;
        console.error = originalError;
        
        // Check if this is an expected exit (process.exit called)
        if (error.message.includes('process.exit') || error.code === 1) {
          // Test suite called process.exit, check if it was success or failure
          const hasFailures = logs.some(log => 
            log.some(arg => typeof arg === 'string' && arg.includes('❌'))
          );
          
          return {
            success: !hasFailures,
            duration: Date.now() - startTime,
            tests: [],
            passed: hasFailures ? 0 : 1,
            failed: hasFailures ? 1 : 0,
            warnings: [],
            details: { exitCalled: true },
            logs: logs
          };
        }
        
        throw error;
      }
      
    } catch (error) {
      return {
        success: false,
        duration: Date.now() - startTime,
        error: error.message,
        tests: [],
        passed: 0,
        failed: 1,
        warnings: [],
        logs: []
      };
    }
  }

  /**
   * Generate final integration test report
   */
  generateFinalReport(overallSuccess) {
    const totalDuration = this.results.endTime - this.results.startTime;
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 CI Integration Test Results');
    console.log('='.repeat(60));

    // Calculate totals
    Object.values(this.results.suites).forEach(suite => {
      if (suite.tests) {
        this.results.summary.totalTests += suite.tests.length;
      }
      this.results.summary.passedTests += suite.passed || 0;
      this.results.summary.failedTests += suite.failed || 0;
      this.results.summary.warnings += (suite.warnings || []).length;
    });

    // Overall summary
    console.log(`\n📈 Overall Summary:`);
    console.log(`  Test Suites: ${this.results.summary.totalSuites}`);
    console.log(`  Passed Suites: ${this.results.summary.passedSuites}`);
    console.log(`  Failed Suites: ${this.results.summary.failedSuites}`);
    console.log(`  Total Tests: ${this.results.summary.totalTests}`);
    console.log(`  Passed Tests: ${this.results.summary.passedTests}`);
    console.log(`  Failed Tests: ${this.results.summary.failedTests}`);
    console.log(`  Warnings: ${this.results.summary.warnings}`);
    console.log(`  Total Duration: ${this.formatTime(totalDuration)}`);

    // Suite-by-suite breakdown
    console.log(`\n📋 Suite Breakdown:`);
    Object.entries(this.results.suites).forEach(([suiteName, suite]) => {
      const status = suite.success ? '✅' : '❌';
      const duration = suite.duration ? this.formatTime(suite.duration) : 'N/A';
      console.log(`  ${status} ${suiteName}: ${suite.passed || 0}/${(suite.passed || 0) + (suite.failed || 0)} tests (${duration})`);
      
      if (suite.warnings && suite.warnings.length > 0) {
        console.log(`    ⚠️  ${suite.warnings.length} warnings`);
      }
      
      if (suite.error) {
        console.log(`    💥 Error: ${suite.error}`);
      }
    });

    // Performance insights
    const perfSuite = this.results.suites['Build Performance Benchmarks'];
    if (perfSuite && perfSuite.details && perfSuite.details.benchmarks) {
      console.log(`\n⚡ Performance Insights:`);
      const benchmarks = perfSuite.details.benchmarks;
      
      if (benchmarks.dependencyInstall) {
        console.log(`  📦 Dependency Install: ${benchmarks.dependencyInstall.timeFormatted}`);
      }
      
      if (benchmarks.build) {
        console.log(`  🏗️  Build Process: ${benchmarks.build.timeFormatted}`);
      }
      
      if (benchmarks.nodeVersionCheck) {
        console.log(`  🔍 Node Version: ${benchmarks.nodeVersionCheck.version}`);
      }
      
      if (benchmarks.buildOutput) {
        console.log(`  📁 Build Output: ${benchmarks.buildOutput.totalFiles} files`);
      }
    }

    // Warnings summary
    if (this.results.summary.warnings > 0) {
      console.log(`\n⚠️  All Warnings:`);
      Object.entries(this.results.suites).forEach(([suiteName, suite]) => {
        if (suite.warnings && suite.warnings.length > 0) {
          console.log(`  ${suiteName}:`);
          suite.warnings.forEach(warning => {
            console.log(`    - ${warning}`);
          });
        }
      });
    }

    // Save comprehensive report
    const reportPath = `ci-integration-test-report-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`\n📄 Comprehensive report saved: ${reportPath}`);

    // Generate summary report
    this.generateSummaryReport();

    // Final status
    if (overallSuccess) {
      console.log('\n🎉 All CI integration tests passed successfully!');
      console.log('✅ Your CI pipeline is ready for production use.');
    } else {
      console.log('\n❌ Some CI integration tests failed.');
      console.log('🔧 Please review and fix the issues above before proceeding.');
      process.exit(1);
    }
  }

  /**
   * Generate a concise summary report
   */
  generateSummaryReport() {
    const summary = {
      timestamp: new Date().toISOString(),
      status: this.results.summary.failedSuites === 0 ? 'PASS' : 'FAIL',
      duration: this.formatTime(this.results.endTime - this.results.startTime),
      suites: {
        total: this.results.summary.totalSuites,
        passed: this.results.summary.passedSuites,
        failed: this.results.summary.failedSuites
      },
      tests: {
        total: this.results.summary.totalTests,
        passed: this.results.summary.passedTests,
        failed: this.results.summary.failedTests
      },
      warnings: this.results.summary.warnings,
      recommendations: this.generateRecommendations()
    };

    const summaryPath = `ci-integration-summary-${Date.now()}.json`;
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    
    // Also create a markdown summary
    const markdownSummary = this.generateMarkdownSummary(summary);
    const markdownPath = `ci-integration-summary-${Date.now()}.md`;
    fs.writeFileSync(markdownPath, markdownSummary);
    
    console.log(`📋 Summary report saved: ${summaryPath}`);
    console.log(`📝 Markdown summary saved: ${markdownPath}`);
  }

  /**
   * Generate recommendations based on test results
   */
  generateRecommendations() {
    const recommendations = [];
    
    // Check for performance issues
    const perfSuite = this.results.suites['Build Performance Benchmarks'];
    if (perfSuite && perfSuite.warnings && perfSuite.warnings.length > 0) {
      recommendations.push({
        category: 'Performance',
        priority: 'Medium',
        message: 'Consider optimizing build performance - some processes exceeded recommended thresholds'
      });
    }

    // Check for Git workflow issues
    const gitSuite = this.results.suites['Git Workflow Consistency'];
    if (gitSuite && gitSuite.failed > 0) {
      recommendations.push({
        category: 'Git Workflow',
        priority: 'High',
        message: 'Fix Git workflow configuration issues to ensure consistent development experience'
      });
    }

    // Check for workflow configuration issues
    const workflowSuite = this.results.suites['Workflow Validation'];
    if (workflowSuite && workflowSuite.failed > 0) {
      recommendations.push({
        category: 'CI Configuration',
        priority: 'High',
        message: 'Update GitHub Actions workflow configuration to meet requirements'
      });
    }

    // General recommendations
    if (this.results.summary.warnings > 0) {
      recommendations.push({
        category: 'General',
        priority: 'Low',
        message: 'Review and address warnings to improve CI pipeline robustness'
      });
    }

    return recommendations;
  }

  /**
   * Generate markdown summary
   */
  generateMarkdownSummary(summary) {
    return `# CI Integration Test Summary

## Overall Status: ${summary.status}

**Timestamp:** ${summary.timestamp}  
**Duration:** ${summary.duration}

## Results

### Test Suites
- **Total:** ${summary.suites.total}
- **Passed:** ${summary.suites.passed}
- **Failed:** ${summary.suites.failed}

### Individual Tests
- **Total:** ${summary.tests.total}
- **Passed:** ${summary.tests.passed}
- **Failed:** ${summary.tests.failed}

### Warnings
- **Total:** ${summary.warnings}

## Recommendations

${summary.recommendations.length > 0 
  ? summary.recommendations.map(rec => 
      `### ${rec.category} (${rec.priority} Priority)\n${rec.message}`
    ).join('\n\n')
  : 'No specific recommendations at this time.'
}

## Next Steps

${summary.status === 'PASS' 
  ? '✅ All tests passed! Your CI pipeline is ready for production use.'
  : '❌ Some tests failed. Please review the detailed report and fix the issues before proceeding.'
}
`;
  }

  /**
   * Format time duration
   */
  formatTime(milliseconds) {
    if (milliseconds < 1000) {
      return `${milliseconds}ms`;
    } else if (milliseconds < 60000) {
      return `${(milliseconds / 1000).toFixed(1)}s`;
    } else {
      const minutes = Math.floor(milliseconds / 60000);
      const seconds = ((milliseconds % 60000) / 1000).toFixed(1);
      return `${minutes}m ${seconds}s`;
    }
  }
}

// Run integration tests if called directly
if (require.main === module) {
  const runner = new CIIntegrationTestRunner();
  runner.runAllTests().catch(error => {
    console.error('Integration test runner failed:', error);
    process.exit(1);
  });
}

module.exports = CIIntegrationTestRunner;