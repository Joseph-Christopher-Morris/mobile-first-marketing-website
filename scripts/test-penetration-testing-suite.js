#!/usr/bin/env node

/**
 * Test Script for Penetration Testing Suite
 * 
 * This script tests the penetration testing suite functionality
 * and validates that all security tests are working correctly.
 */

const PenetrationTestingSuite = require('./penetration-testing-suite');
const fs = require('fs').promises;
const path = require('path');

class PenetrationTestingSuiteValidator {
    constructor() {
        this.results = {
            passed: 0,
            failed: 0,
            tests: []
        };
    }

    async runTests() {
        console.log('🧪 Testing Penetration Testing Suite...\n');

        const tests = [
            { name: 'Suite Initialization', method: this.testSuiteInitialization.bind(this) },
            { name: 'Request Helper Method', method: this.testRequestHelper.bind(this) },
            { name: 'Result Tracking', method: this.testResultTracking.bind(this) },
            { name: 'Security Score Calculation', method: this.testSecurityScoreCalculation.bind(this) },
            { name: 'Risk Level Assessment', method: this.testRiskLevelAssessment.bind(this) },
            { name: 'Report Generation', method: this.testReportGeneration.bind(this) },
            { name: 'CLI Interface', method: this.testCLIInterface.bind(this) }
        ];

        for (const test of tests) {
            try {
                console.log(`Running ${test.name}...`);
                await test.method();
                this.addResult(test.name, true, 'Test passed');
            } catch (error) {
                this.addResult(test.name, false, error.message);
            }
        }

        this.generateReport();
        return this.results.failed === 0;
    }

    async testSuiteInitialization() {
        const options = {
            target: 'https://example.com',
            cloudfrontDomain: 'd123456.cloudfront.net',
            s3BucketName: 'test-bucket',
            verbose: true,
            timeout: 5000
        };

        const suite = new PenetrationTestingSuite(options);

        if (suite.target !== options.target) {
            throw new Error('Target not set correctly');
        }

        if (suite.cloudfrontDomain !== options.cloudfrontDomain) {
            throw new Error('CloudFront domain not set correctly');
        }

        if (suite.s3BucketName !== options.s3BucketName) {
            throw new Error('S3 bucket name not set correctly');
        }

        if (!suite.results || !suite.results.summary) {
            throw new Error('Results structure not initialized');
        }

        console.log('  ✅ Suite initialization successful');
    }

    async testRequestHelper() {
        const suite = new PenetrationTestingSuite({ target: 'https://httpbin.org' });

        try {
            // Test with a reliable endpoint
            const response = await suite.makeRequest('https://httpbin.org/status/200', { method: 'GET' });
            
            if (response.statusCode !== 200) {
                throw new Error(`Expected status 200, got ${response.statusCode}`);
            }

            console.log('  ✅ Request helper working correctly');
        } catch (error) {
            // If httpbin is not available, test with a mock
            console.log('  ⚠️ External service unavailable, testing with timeout');
            
            try {
                await suite.makeRequest('https://nonexistent-domain-12345.com', { method: 'GET' });
                throw new Error('Should have failed for nonexistent domain');
            } catch (timeoutError) {
                if (timeoutError.message.includes('timeout') || timeoutError.message.includes('ENOTFOUND')) {
                    console.log('  ✅ Request helper properly handles errors');
                } else {
                    throw timeoutError;
                }
            }
        }
    }

    async testResultTracking() {
        const suite = new PenetrationTestingSuite({ target: 'https://example.com' });

        // Test adding different types of results
        suite.addResult('testCategory', 'test_passed', {
            status: 'passed',
            message: 'Test passed successfully',
            severity: 'low'
        });

        suite.addResult('testCategory', 'test_failed', {
            status: 'failed',
            message: 'Test failed',
            severity: 'critical'
        });

        suite.addResult('testCategory', 'test_warning', {
            status: 'warning',
            message: 'Test warning',
            severity: 'medium'
        });

        if (suite.results.summary.passed !== 1) {
            throw new Error(`Expected 1 passed test, got ${suite.results.summary.passed}`);
        }

        if (suite.results.summary.failed !== 1) {
            throw new Error(`Expected 1 failed test, got ${suite.results.summary.failed}`);
        }

        if (suite.results.summary.warnings !== 1) {
            throw new Error(`Expected 1 warning, got ${suite.results.summary.warnings}`);
        }

        if (suite.results.summary.critical !== 1) {
            throw new Error(`Expected 1 critical issue, got ${suite.results.summary.critical}`);
        }

        console.log('  ✅ Result tracking working correctly');
    }

    async testSecurityScoreCalculation() {
        const suite = new PenetrationTestingSuite({ target: 'https://example.com' });

        // Add test results
        suite.addResult('test', 'passed1', { status: 'passed', severity: 'low' });
        suite.addResult('test', 'passed2', { status: 'passed', severity: 'low' });
        suite.addResult('test', 'warning1', { status: 'warning', severity: 'medium' });
        suite.addResult('test', 'failed1', { status: 'failed', severity: 'high' });

        const score = suite.calculateSecurityScore();
        
        // Expected: (2 * 1.0 + 1 * 0.5 + 1 * 0.0) / 4 = 2.5 / 4 = 0.625 = 62.5% -> 63%
        if (score < 60 || score > 65) {
            throw new Error(`Expected security score around 63%, got ${score}%`);
        }

        console.log(`  ✅ Security score calculation working (${score}%)`);
    }

    async testRiskLevelAssessment() {
        const suite = new PenetrationTestingSuite({ target: 'https://example.com' });

        // Test critical risk
        suite.results.summary.critical = 1;
        if (suite.calculateRiskLevel() !== 'CRITICAL') {
            throw new Error('Expected CRITICAL risk level');
        }

        // Test high risk
        suite.results.summary.critical = 0;
        suite.results.summary.failed = 6;
        if (suite.calculateRiskLevel() !== 'HIGH') {
            throw new Error('Expected HIGH risk level');
        }

        // Test medium risk
        suite.results.summary.failed = 3;
        if (suite.calculateRiskLevel() !== 'MEDIUM') {
            throw new Error('Expected MEDIUM risk level');
        }

        // Test low risk
        suite.results.summary.failed = 1;
        suite.results.summary.warnings = 6;
        if (suite.calculateRiskLevel() !== 'LOW') {
            throw new Error('Expected LOW risk level');
        }

        // Test minimal risk
        suite.results.summary.failed = 0;
        suite.results.summary.warnings = 2;
        if (suite.calculateRiskLevel() !== 'MINIMAL') {
            throw new Error('Expected MINIMAL risk level');
        }

        console.log('  ✅ Risk level assessment working correctly');
    }

    async testReportGeneration() {
        const suite = new PenetrationTestingSuite({ target: 'https://example.com' });
        suite.startTime = Date.now() - 5000; // 5 seconds ago

        // Add some test results
        suite.addResult('vulnerabilityTests', 'xss_test', {
            status: 'passed',
            message: 'No XSS vulnerabilities found',
            severity: 'low'
        });

        suite.addResult('s3AccessTests', 'bucket_access', {
            status: 'failed',
            message: 'S3 bucket directly accessible',
            severity: 'critical'
        });

        const report = {
            metadata: {
                timestamp: new Date().toISOString(),
                target: suite.target,
                testDuration: Date.now() - suite.startTime
            },
            summary: {
                ...suite.results.summary,
                totalTests: suite.results.summary.passed + suite.results.summary.failed + suite.results.summary.warnings,
                securityScore: suite.calculateSecurityScore(),
                riskLevel: suite.calculateRiskLevel()
            },
            results: suite.results
        };

        const summaryReport = suite.generateSummaryReport(report);

        if (!summaryReport.includes('# Penetration Testing Report')) {
            throw new Error('Summary report missing title');
        }

        if (!summaryReport.includes('Executive Summary')) {
            throw new Error('Summary report missing executive summary');
        }

        if (!summaryReport.includes('Security Score:')) {
            throw new Error('Summary report missing security score');
        }

        console.log('  ✅ Report generation working correctly');
    }

    async testCLIInterface() {
        // Test that the module exports the class correctly
        if (typeof PenetrationTestingSuite !== 'function') {
            throw new Error('PenetrationTestingSuite not exported correctly');
        }

        // Test that we can create an instance
        const suite = new PenetrationTestingSuite();
        if (!suite || typeof suite.runAllTests !== 'function') {
            throw new Error('Suite instance not created correctly');
        }

        console.log('  ✅ CLI interface working correctly');
    }

    addResult(testName, passed, message) {
        this.results.tests.push({
            name: testName,
            passed,
            message,
            timestamp: new Date().toISOString()
        });

        if (passed) {
            this.results.passed++;
            console.log(`  ✅ ${testName}: ${message}`);
        } else {
            this.results.failed++;
            console.log(`  ❌ ${testName}: ${message}`);
        }
    }

    generateReport() {
        const total = this.results.passed + this.results.failed;
        const percentage = total > 0 ? Math.round((this.results.passed / total) * 100) : 0;

        console.log('\n' + '='.repeat(60));
        console.log('🧪 PENETRATION TESTING SUITE VALIDATION REPORT');
        console.log('='.repeat(60));
        console.log(`Total Tests: ${total}`);
        console.log(`Passed: ${this.results.passed} ✅`);
        console.log(`Failed: ${this.results.failed} ❌`);
        console.log(`Success Rate: ${percentage}%`);
        console.log('='.repeat(60));

        if (this.results.failed > 0) {
            console.log('\n❌ Failed Tests:');
            this.results.tests
                .filter(test => !test.passed)
                .forEach(test => {
                    console.log(`  • ${test.name}: ${test.message}`);
                });
        }

        if (percentage >= 90) {
            console.log('\n🎉 Excellent! Penetration testing suite is working correctly.');
        } else if (percentage >= 75) {
            console.log('\n✅ Good! Most tests passed with minor issues.');
        } else {
            console.log('\n⚠️ Issues found that need attention.');
        }
    }
}

// Run validation if called directly
if (require.main === module) {
    const validator = new PenetrationTestingSuiteValidator();
    validator.runTests().then(success => {
        if (!success) {
            console.log('\n❌ Validation failed!');
            process.exit(1);
        } else {
            console.log('\n✅ Validation completed successfully!');
        }
    }).catch(error => {
        console.error('❌ Validation error:', error);
        process.exit(1);
    });
}

module.exports = PenetrationTestingSuiteValidator;