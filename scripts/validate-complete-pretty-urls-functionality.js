#!/usr/bin/env node

/**
 * Comprehensive Pretty URLs Functionality and Performance Validation
 * 
 * This script validates:
 * - All URL patterns work correctly in production
 * - Cache invalidation completed successfully
 * - No regression in existing functionality
 * - Performance impact assessment
 */

const https = require('https');
const { CloudFrontClient, GetInvalidationCommand, ListInvalidationsCommand } = require('@aws-sdk/client-cloudfront');

class CompletePrettyURLsValidator {
    constructor() {
        this.distributionId = process.env.CLOUDFRONT_DISTRIBUTION_ID || 'E2IBMHQ3GCW6ZK';
        this.domain = process.env.CLOUDFRONT_DOMAIN || 'd15sc9fc739ev2.cloudfront.net';
        this.baseUrl = `https://${this.domain}`;
        this.cloudfront = new CloudFrontClient({ region: 'us-east-1' });
        
        this.results = {
            urlTests: [],
            cacheValidation: null,
            performanceTests: [],
            regressionTests: [],
            summary: {
                totalTests: 0,
                passed: 0,
                failed: 0,
                warnings: 0
            }
        };
    }

    async validateComplete() {
        console.log('🔍 Starting Complete Pretty URLs Functionality Validation...\n');
        
        try {
            // Test all URL patterns
            await this.testAllURLPatterns();
            
            // Verify cache invalidation
            await this.verifyCacheInvalidation();
            
            // Test performance impact
            await this.testPerformanceImpact();
            
            // Check for regressions
            await this.checkExistingFunctionality();
            
            // Generate comprehensive report
            await this.generateValidationReport();
            
            return this.results;
            
        } catch (error) {
            console.error('❌ Validation failed:', error.message);
            throw error;
        }
    }

    async testAllURLPatterns() {
        console.log('📋 Testing All URL Patterns...');
        
        const urlTestCases = [
            // Root URL tests
            {
                url: '/',
                description: 'Root URL serves index.html',
                expectedStatus: 200,
                expectedContentType: 'text/html',
                shouldContain: ['<html', '<head', '<body'],
                requirement: '1.1'
            },
            
            // Directory URL tests
            {
                url: '/privacy-policy/',
                description: 'Directory URL with trailing slash',
                expectedStatus: 200,
                expectedContentType: 'text/html',
                shouldContain: ['Privacy Policy', '<html'],
                requirement: '2.1'
            },
            {
                url: '/about/',
                description: 'About directory URL',
                expectedStatus: 200,
                expectedContentType: 'text/html',
                shouldContain: ['<html', '<head'],
                requirement: '2.1'
            },
            {
                url: '/contact/',
                description: 'Contact directory URL',
                expectedStatus: 200,
                expectedContentType: 'text/html',
                shouldContain: ['<html', '<head'],
                requirement: '2.1'
            },
            
            // Extensionless URL tests
            {
                url: '/privacy-policy',
                description: 'Extensionless URL (no trailing slash)',
                expectedStatus: 200,
                expectedContentType: 'text/html',
                shouldContain: ['Privacy Policy', '<html'],
                requirement: '2.2'
            },
            {
                url: '/about',
                description: 'About extensionless URL',
                expectedStatus: 200,
                expectedContentType: 'text/html',
                shouldContain: ['<html', '<head'],
                requirement: '2.2'
            },
            
            // Explicit file path tests (backward compatibility)
            {
                url: '/privacy-policy/index.html',
                description: 'Explicit file path (backward compatibility)',
                expectedStatus: 200,
                expectedContentType: 'text/html',
                shouldContain: ['Privacy Policy', '<html'],
                requirement: '6.1'
            },
            {
                url: '/index.html',
                description: 'Root index.html explicit path',
                expectedStatus: 200,
                expectedContentType: 'text/html',
                shouldContain: ['<html', '<head', '<body'],
                requirement: '6.1'
            },
            
            // Static asset tests (should not be affected)
            {
                url: '/favicon.ico',
                description: 'Static asset (favicon)',
                expectedStatus: 200,
                expectedContentType: 'image/x-icon',
                requirement: '6.2'
            },
            
            // Service pages
            {
                url: '/services/',
                description: 'Services directory URL',
                expectedStatus: 200,
                expectedContentType: 'text/html',
                shouldContain: ['<html', 'services'],
                requirement: '2.1'
            },
            {
                url: '/services/photography/',
                description: 'Photography service page',
                expectedStatus: 200,
                expectedContentType: 'text/html',
                shouldContain: ['<html', 'photography'],
                requirement: '2.1'
            },
            
            // Blog tests
            {
                url: '/blog/',
                description: 'Blog directory URL',
                expectedStatus: 200,
                expectedContentType: 'text/html',
                shouldContain: ['<html', 'blog'],
                requirement: '2.1'
            }
        ];

        for (const testCase of urlTestCases) {
            const result = await this.testURL(testCase);
            this.results.urlTests.push(result);
            this.updateSummary(result);
        }
        
        console.log(`✅ URL Pattern Tests Complete: ${this.results.urlTests.filter(t => t.passed).length}/${this.results.urlTests.length} passed\n`);
    }

    async testURL(testCase) {
        const startTime = Date.now();
        
        try {
            const response = await this.makeRequest(testCase.url);
            const responseTime = Date.now() - startTime;
            
            const result = {
                ...testCase,
                passed: true,
                responseTime,
                actualStatus: response.statusCode,
                actualContentType: response.headers['content-type'],
                responseSize: response.body ? response.body.length : 0,
                errors: [],
                warnings: []
            };

            // Validate status code
            if (response.statusCode !== testCase.expectedStatus) {
                result.passed = false;
                result.errors.push(`Expected status ${testCase.expectedStatus}, got ${response.statusCode}`);
            }

            // Validate content type
            if (testCase.expectedContentType && !response.headers['content-type']?.includes(testCase.expectedContentType)) {
                result.passed = false;
                result.errors.push(`Expected content-type to contain ${testCase.expectedContentType}, got ${response.headers['content-type']}`);
            }

            // Validate content
            if (testCase.shouldContain && response.body) {
                for (const content of testCase.shouldContain) {
                    if (!response.body.includes(content)) {
                        result.passed = false;
                        result.errors.push(`Expected content to contain "${content}"`);
                    }
                }
            }

            // Performance warnings
            if (responseTime > 2000) {
                result.warnings.push(`Slow response time: ${responseTime}ms`);
            }

            console.log(`${result.passed ? '✅' : '❌'} ${testCase.description}: ${response.statusCode} (${responseTime}ms)`);
            
            return result;
            
        } catch (error) {
            console.log(`❌ ${testCase.description}: ${error.message}`);
            
            return {
                ...testCase,
                passed: false,
                responseTime: Date.now() - startTime,
                errors: [error.message],
                warnings: []
            };
        }
    }

    async makeRequest(path) {
        return new Promise((resolve, reject) => {
            const url = `${this.baseUrl}${path}`;
            
            const options = {
                method: 'GET',
                headers: {
                    'User-Agent': 'Pretty-URLs-Validator/1.0',
                    'Accept': '*/*'
                },
                timeout: 10000
            };

            const req = https.request(url, options, (res) => {
                let body = '';
                
                res.on('data', (chunk) => {
                    body += chunk;
                });
                
                res.on('end', () => {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        body: body
                    });
                });
            });

            req.on('error', (error) => {
                reject(error);
            });

            req.on('timeout', () => {
                req.destroy();
                reject(new Error('Request timeout'));
            });

            req.end();
        });
    }

    async verifyCacheInvalidation() {
        console.log('🔄 Verifying Cache Invalidation Status...');
        
        try {
            const command = new ListInvalidationsCommand({
                DistributionId: this.distributionId,
                MaxItems: 10
            });
            
            const response = await this.cloudfront.send(command);
            const invalidations = response.InvalidationList?.Items || [];
            
            // Find recent invalidations (within last hour)
            const recentInvalidations = invalidations.filter(inv => {
                const createTime = new Date(inv.CreateTime);
                const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
                return createTime > oneHourAgo;
            });

            this.results.cacheValidation = {
                totalInvalidations: invalidations.length,
                recentInvalidations: recentInvalidations.length,
                completedInvalidations: recentInvalidations.filter(inv => inv.Status === 'Completed').length,
                inProgressInvalidations: recentInvalidations.filter(inv => inv.Status === 'InProgress').length,
                details: recentInvalidations.map(inv => ({
                    id: inv.Id,
                    status: inv.Status,
                    createTime: inv.CreateTime,
                    paths: inv.InvalidationBatch?.Paths?.Items || []
                }))
            };

            if (recentInvalidations.length === 0) {
                console.log('⚠️  No recent cache invalidations found');
                this.results.summary.warnings++;
            } else {
                const completed = this.results.cacheValidation.completedInvalidations;
                const inProgress = this.results.cacheValidation.inProgressInvalidations;
                console.log(`✅ Cache invalidation status: ${completed} completed, ${inProgress} in progress`);
                this.results.summary.passed++;
            }
            
        } catch (error) {
            console.error('❌ Failed to verify cache invalidation:', error.message);
            this.results.cacheValidation = { error: error.message };
            this.results.summary.failed++;
        }
        
        console.log('');
    }

    async testPerformanceImpact() {
        console.log('⚡ Testing Performance Impact...');
        
        const performanceTests = [
            { url: '/', description: 'Root page performance' },
            { url: '/privacy-policy/', description: 'Directory URL performance' },
            { url: '/about', description: 'Extensionless URL performance' },
            { url: '/services/photography/', description: 'Nested directory performance' }
        ];

        for (const test of performanceTests) {
            const measurements = [];
            
            // Run multiple requests to get average
            for (let i = 0; i < 5; i++) {
                const startTime = Date.now();
                try {
                    await this.makeRequest(test.url);
                    measurements.push(Date.now() - startTime);
                } catch (error) {
                    console.log(`⚠️  Performance test failed for ${test.url}: ${error.message}`);
                }
            }

            if (measurements.length > 0) {
                const avgTime = measurements.reduce((a, b) => a + b, 0) / measurements.length;
                const minTime = Math.min(...measurements);
                const maxTime = Math.max(...measurements);
                
                const result = {
                    ...test,
                    averageTime: Math.round(avgTime),
                    minTime,
                    maxTime,
                    measurements,
                    passed: avgTime < 3000 // Performance threshold
                };
                
                this.results.performanceTests.push(result);
                this.updateSummary(result);
                
                console.log(`${result.passed ? '✅' : '⚠️ '} ${test.description}: avg ${result.averageTime}ms (${minTime}-${maxTime}ms)`);
            }
        }
        
        console.log('');
    }

    async checkExistingFunctionality() {
        console.log('🔍 Checking for Regressions in Existing Functionality...');
        
        const regressionTests = [
            {
                url: '/robots.txt',
                description: 'Robots.txt accessibility',
                expectedStatus: 200,
                expectedContentType: 'text/plain'
            },
            {
                url: '/sitemap.xml',
                description: 'Sitemap accessibility',
                expectedStatus: 200,
                expectedContentType: 'application/xml'
            },
            {
                url: '/nonexistent-page',
                description: 'Non-existent page handling',
                expectedStatus: 200, // Should serve index.html for SPA routing
                expectedContentType: 'text/html'
            }
        ];

        for (const test of regressionTests) {
            const result = await this.testURL(test);
            this.results.regressionTests.push(result);
            this.updateSummary(result);
        }
        
        console.log('');
    }

    updateSummary(result) {
        this.results.summary.totalTests++;
        if (result.passed) {
            this.results.summary.passed++;
        } else {
            this.results.summary.failed++;
        }
        if (result.warnings && result.warnings.length > 0) {
            this.results.summary.warnings += result.warnings.length;
        }
    }

    async generateValidationReport() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const reportFile = `complete-pretty-urls-validation-${timestamp}.json`;
        const summaryFile = `complete-pretty-urls-validation-${timestamp}.md`;
        
        // Save detailed JSON report
        const fs = require('fs').promises;
        await fs.writeFile(reportFile, JSON.stringify(this.results, null, 2));
        
        // Generate markdown summary
        const summary = this.generateMarkdownSummary();
        await fs.writeFile(summaryFile, summary);
        
        console.log('📊 Validation Complete!');
        console.log(`📄 Detailed report: ${reportFile}`);
        console.log(`📋 Summary report: ${summaryFile}`);
        console.log('');
        console.log('='.repeat(60));
        console.log('VALIDATION SUMMARY');
        console.log('='.repeat(60));
        console.log(`Total Tests: ${this.results.summary.totalTests}`);
        console.log(`✅ Passed: ${this.results.summary.passed}`);
        console.log(`❌ Failed: ${this.results.summary.failed}`);
        console.log(`⚠️  Warnings: ${this.results.summary.warnings}`);
        console.log('');
        
        if (this.results.summary.failed > 0) {
            console.log('❌ VALIDATION FAILED - Issues found that need attention');
            this.printFailedTests();
        } else if (this.results.summary.warnings > 0) {
            console.log('⚠️  VALIDATION PASSED WITH WARNINGS - Review recommended');
        } else {
            console.log('✅ ALL VALIDATIONS PASSED - Pretty URLs working correctly');
        }
    }

    printFailedTests() {
        console.log('\nFailed Tests:');
        console.log('-'.repeat(40));
        
        [...this.results.urlTests, ...this.results.performanceTests, ...this.results.regressionTests]
            .filter(test => !test.passed)
            .forEach(test => {
                console.log(`❌ ${test.description}`);
                test.errors?.forEach(error => console.log(`   • ${error}`));
            });
    }

    generateMarkdownSummary() {
        const timestamp = new Date().toISOString();
        
        return `# Complete Pretty URLs Validation Report

**Generated:** ${timestamp}
**Distribution:** ${this.distributionId}
**Domain:** ${this.domain}

## Summary

- **Total Tests:** ${this.results.summary.totalTests}
- **Passed:** ${this.results.summary.passed}
- **Failed:** ${this.results.summary.failed}
- **Warnings:** ${this.results.summary.warnings}

## URL Pattern Tests

${this.results.urlTests.map(test => 
    `- ${test.passed ? '✅' : '❌'} **${test.description}** (${test.responseTime}ms)
  - URL: \`${test.url}\`
  - Status: ${test.actualStatus}
  - Requirement: ${test.requirement}
  ${test.errors?.length ? `  - Errors: ${test.errors.join(', ')}` : ''}
  ${test.warnings?.length ? `  - Warnings: ${test.warnings.join(', ')}` : ''}`
).join('\n\n')}

## Cache Invalidation Status

${this.results.cacheValidation?.error ? 
    `❌ **Error:** ${this.results.cacheValidation.error}` :
    `✅ **Recent Invalidations:** ${this.results.cacheValidation?.recentInvalidations || 0}
- Completed: ${this.results.cacheValidation?.completedInvalidations || 0}
- In Progress: ${this.results.cacheValidation?.inProgressInvalidations || 0}`}

## Performance Tests

${this.results.performanceTests.map(test =>
    `- ${test.passed ? '✅' : '⚠️'} **${test.description}**
  - Average: ${test.averageTime}ms
  - Range: ${test.minTime}-${test.maxTime}ms`
).join('\n')}

## Regression Tests

${this.results.regressionTests.map(test =>
    `- ${test.passed ? '✅' : '❌'} **${test.description}**
  - Status: ${test.actualStatus}
  ${test.errors?.length ? `  - Errors: ${test.errors.join(', ')}` : ''}`
).join('\n')}

## Recommendations

${this.results.summary.failed > 0 ? 
    '❌ **Action Required:** Failed tests indicate issues that need immediate attention.' :
    this.results.summary.warnings > 0 ?
        '⚠️ **Review Recommended:** Some warnings detected, review for optimization opportunities.' :
        '✅ **All Good:** Pretty URLs are working correctly with no issues detected.'}
`;
    }
}

// Main execution
async function main() {
    try {
        const validator = new CompletePrettyURLsValidator();
        const results = await validator.validateComplete();
        
        // Exit with appropriate code
        process.exit(results.summary.failed > 0 ? 1 : 0);
        
    } catch (error) {
        console.error('💥 Validation script failed:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { CompletePrettyURLsValidator };