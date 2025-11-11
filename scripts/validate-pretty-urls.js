#!/usr/bin/env node

/**
 * Comprehensive URL Validation Script for CloudFront Pretty URLs
 * 
 * This script validates that CloudFront pretty URL functionality works correctly
 * by testing various URL patterns and ensuring proper responses.
 * 
 * Requirements covered: 5.1, 5.2, 5.3
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration
const CLOUDFRONT_DOMAIN = 'https://d15sc9fc739ev2.cloudfront.net';
const TEST_TIMEOUT = 30000; // 30 seconds
const RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 2000; // 2 seconds

// Test cases covering all URL patterns
const URL_TEST_CASES = [
    // Requirement 5.1: Root URL serving index.html
    {
        url: '/',
        expectedStatus: 200,
        expectedContentType: 'text/html',
        description: 'Root URL (/) serves index.html automatically',
        requirement: '5.1',
        mustContain: ['<html', '<head', '<body'],
        category: 'root-object'
    },
    
    // Requirement 5.2: Directory URLs serving correct index files
    {
        url: '/privacy-policy/',
        expectedStatus: 200,
        expectedContentType: 'text/html',
        description: 'Directory URL (/privacy-policy/) serves correct index.html',
        requirement: '5.2',
        mustContain: ['<html', 'privacy', 'policy'],
        category: 'directory-urls'
    },
    {
        url: '/about/',
        expectedStatus: 200,
        expectedContentType: 'text/html',
        description: 'Directory URL (/about/) serves correct index.html',
        requirement: '5.2',
        mustContain: ['<html', 'about'],
        category: 'directory-urls'
    },
    {
        url: '/contact/',
        expectedStatus: 200,
        expectedContentType: 'text/html',
        description: 'Directory URL (/contact/) serves correct index.html',
        requirement: '5.2',
        mustContain: ['<html', 'contact'],
        category: 'directory-urls'
    },
    {
        url: '/services/',
        expectedStatus: 200,
        expectedContentType: 'text/html',
        description: 'Directory URL (/services/) serves correct index.html',
        requirement: '5.2',
        mustContain: ['<html', 'services'],
        category: 'directory-urls'
    },
    
    // Extensionless URLs (should append /index.html)
    {
        url: '/privacy-policy',
        expectedStatus: 200,
        expectedContentType: 'text/html',
        description: 'Extensionless URL (/privacy-policy) serves directory index',
        requirement: '5.2',
        mustContain: ['<html', 'privacy', 'policy'],
        category: 'extensionless-urls'
    },
    {
        url: '/about',
        expectedStatus: 200,
        expectedContentType: 'text/html',
        description: 'Extensionless URL (/about) serves directory index',
        requirement: '5.2',
        mustContain: ['<html', 'about'],
        category: 'extensionless-urls'
    },
    {
        url: '/contact',
        expectedStatus: 200,
        expectedContentType: 'text/html',
        description: 'Extensionless URL (/contact) serves directory index',
        requirement: '5.2',
        mustContain: ['<html', 'contact'],
        category: 'extensionless-urls'
    },
    {
        url: '/services',
        expectedStatus: 200,
        expectedContentType: 'text/html',
        description: 'Extensionless URL (/services) serves directory index',
        requirement: '5.2',
        mustContain: ['<html', 'services'],
        category: 'extensionless-urls'
    },
    
    // Requirement 5.3: Explicit file paths continue working
    {
        url: '/privacy-policy/index.html',
        expectedStatus: 200,
        expectedContentType: 'text/html',
        description: 'Explicit file path (/privacy-policy/index.html) continues to work',
        requirement: '5.3',
        mustContain: ['<html', 'privacy', 'policy'],
        category: 'explicit-paths'
    },
    {
        url: '/about/index.html',
        expectedStatus: 200,
        expectedContentType: 'text/html',
        description: 'Explicit file path (/about/index.html) continues to work',
        requirement: '5.3',
        mustContain: ['<html', 'about'],
        category: 'explicit-paths'
    },
    {
        url: '/contact/index.html',
        expectedStatus: 200,
        expectedContentType: 'text/html',
        description: 'Explicit file path (/contact/index.html) continues to work',
        requirement: '5.3',
        mustContain: ['<html', 'contact'],
        category: 'explicit-paths'
    },
    {
        url: '/services/index.html',
        expectedStatus: 200,
        expectedContentType: 'text/html',
        description: 'Explicit file path (/services/index.html) continues to work',
        requirement: '5.3',
        mustContain: ['<html', 'services'],
        category: 'explicit-paths'
    },
    {
        url: '/index.html',
        expectedStatus: 200,
        expectedContentType: 'text/html',
        description: 'Root index.html explicit path continues to work',
        requirement: '5.3',
        mustContain: ['<html', '<head', '<body'],
        category: 'explicit-paths'
    },
    
    // Static assets should not be affected
    {
        url: '/favicon.ico',
        expectedStatus: 200,
        expectedContentType: 'image/x-icon',
        description: 'Static assets (favicon.ico) are not affected by URL rewriting',
        requirement: '5.3',
        category: 'static-assets'
    },
    {
        url: '/robots.txt',
        expectedStatus: 200,
        expectedContentType: 'text/plain',
        description: 'Static assets (robots.txt) are not affected by URL rewriting',
        requirement: '5.3',
        category: 'static-assets'
    },
    {
        url: '/sitemap.xml',
        expectedStatus: 200,
        expectedContentType: 'application/xml',
        description: 'Static assets (sitemap.xml) are not affected by URL rewriting',
        requirement: '5.3',
        category: 'static-assets'
    },
    
    // Query parameters and fragments preservation
    {
        url: '/privacy-policy/?utm_source=test',
        expectedStatus: 200,
        expectedContentType: 'text/html',
        description: 'Query parameters are preserved with directory URLs',
        requirement: '5.2',
        mustContain: ['<html', 'privacy'],
        category: 'query-params'
    },
    {
        url: '/about?section=team',
        expectedStatus: 200,
        expectedContentType: 'text/html',
        description: 'Query parameters are preserved with extensionless URLs',
        requirement: '5.2',
        mustContain: ['<html', 'about'],
        category: 'query-params'
    },
    
    // Error handling for non-existent paths
    {
        url: '/non-existent-page/',
        expectedStatus: 200, // Should fallback to index.html for SPA routing
        expectedContentType: 'text/html',
        description: 'Non-existent directory URLs fallback to SPA routing',
        requirement: '5.2',
        mustContain: ['<html'],
        category: 'error-handling'
    },
    {
        url: '/non-existent-page',
        expectedStatus: 200, // Should fallback to index.html for SPA routing
        expectedContentType: 'text/html',
        description: 'Non-existent extensionless URLs fallback to SPA routing',
        requirement: '5.2',
        mustContain: ['<html'],
        category: 'error-handling'
    }
];

class URLValidator {
    constructor() {
        this.results = {
            passed: 0,
            failed: 0,
            total: 0,
            details: [],
            summary: {},
            timestamp: new Date().toISOString()
        };
    }

    async makeRequest(url, attempt = 1) {
        return new Promise((resolve, reject) => {
            const fullUrl = `${CLOUDFRONT_DOMAIN}${url}`;
            
            const options = {
                method: 'GET',
                timeout: TEST_TIMEOUT,
                headers: {
                    'User-Agent': 'CloudFront-Pretty-URLs-Validator/1.0',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
                }
            };

            const req = https.request(fullUrl, options, (res) => {
                let data = '';
                
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        body: data,
                        url: fullUrl
                    });
                });
            });

            req.on('error', (error) => {
                if (attempt < RETRY_ATTEMPTS) {
                    console.log(`Attempt ${attempt} failed for ${url}, retrying...`);
                    setTimeout(() => {
                        this.makeRequest(url, attempt + 1).then(resolve).catch(reject);
                    }, RETRY_DELAY);
                } else {
                    reject(error);
                }
            });

            req.on('timeout', () => {
                req.destroy();
                if (attempt < RETRY_ATTEMPTS) {
                    console.log(`Timeout on attempt ${attempt} for ${url}, retrying...`);
                    setTimeout(() => {
                        this.makeRequest(url, attempt + 1).then(resolve).catch(reject);
                    }, RETRY_DELAY);
                } else {
                    reject(new Error(`Request timeout after ${RETRY_ATTEMPTS} attempts`));
                }
            });

            req.end();
        });
    }

    validateResponse(testCase, response) {
        const errors = [];
        const warnings = [];

        // Check status code
        if (response.statusCode !== testCase.expectedStatus) {
            errors.push(`Expected status ${testCase.expectedStatus}, got ${response.statusCode}`);
        }

        // Check content type
        const contentType = response.headers['content-type'] || '';
        if (testCase.expectedContentType && !contentType.includes(testCase.expectedContentType)) {
            errors.push(`Expected content-type to contain '${testCase.expectedContentType}', got '${contentType}'`);
        }

        // Check required content
        if (testCase.mustContain) {
            for (const content of testCase.mustContain) {
                if (!response.body.toLowerCase().includes(content.toLowerCase())) {
                    errors.push(`Response body must contain '${content}'`);
                }
            }
        }

        // Check response size (should not be empty for HTML)
        if (testCase.expectedContentType === 'text/html' && response.body.length < 100) {
            warnings.push(`HTML response seems too small (${response.body.length} bytes)`);
        }

        // Check for common error indicators
        if (response.body.includes('AccessDenied') || response.body.includes('NoSuchKey')) {
            errors.push('Response contains AWS error indicators');
        }

        return { errors, warnings };
    }

    async runTest(testCase) {
        console.log(`Testing: ${testCase.description}`);
        
        try {
            const response = await this.makeRequest(testCase.url);
            const validation = this.validateResponse(testCase, response);
            
            const result = {
                url: testCase.url,
                description: testCase.description,
                requirement: testCase.requirement,
                category: testCase.category,
                status: validation.errors.length === 0 ? 'PASS' : 'FAIL',
                statusCode: response.statusCode,
                contentType: response.headers['content-type'] || 'unknown',
                responseSize: response.body.length,
                errors: validation.errors,
                warnings: validation.warnings,
                timestamp: new Date().toISOString()
            };

            if (result.status === 'PASS') {
                this.results.passed++;
                console.log(`✅ PASS: ${testCase.description}`);
            } else {
                this.results.failed++;
                console.log(`❌ FAIL: ${testCase.description}`);
                validation.errors.forEach(error => console.log(`   Error: ${error}`));
            }

            if (validation.warnings.length > 0) {
                validation.warnings.forEach(warning => console.log(`   Warning: ${warning}`));
            }

            this.results.details.push(result);
            return result;

        } catch (error) {
            this.results.failed++;
            const result = {
                url: testCase.url,
                description: testCase.description,
                requirement: testCase.requirement,
                category: testCase.category,
                status: 'ERROR',
                error: error.message,
                timestamp: new Date().toISOString()
            };

            console.log(`💥 ERROR: ${testCase.description} - ${error.message}`);
            this.results.details.push(result);
            return result;
        }
    }

    generateSummary() {
        // Group results by category
        const byCategory = {};
        const byRequirement = {};

        this.results.details.forEach(result => {
            // By category
            if (!byCategory[result.category]) {
                byCategory[result.category] = { passed: 0, failed: 0, total: 0 };
            }
            byCategory[result.category].total++;
            if (result.status === 'PASS') {
                byCategory[result.category].passed++;
            } else {
                byCategory[result.category].failed++;
            }

            // By requirement
            if (!byRequirement[result.requirement]) {
                byRequirement[result.requirement] = { passed: 0, failed: 0, total: 0 };
            }
            byRequirement[result.requirement].total++;
            if (result.status === 'PASS') {
                byRequirement[result.requirement].passed++;
            } else {
                byRequirement[result.requirement].failed++;
            }
        });

        this.results.summary = {
            byCategory,
            byRequirement,
            overallPassRate: ((this.results.passed / this.results.total) * 100).toFixed(2)
        };
    }

    async saveResults() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `pretty-urls-validation-${timestamp}.json`;
        const reportPath = path.join(process.cwd(), filename);

        try {
            fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
            console.log(`\n📄 Detailed results saved to: ${filename}`);
            return filename;
        } catch (error) {
            console.error(`Failed to save results: ${error.message}`);
            return null;
        }
    }

    printSummary() {
        console.log('\n' + '='.repeat(80));
        console.log('PRETTY URLS VALIDATION SUMMARY');
        console.log('='.repeat(80));
        
        console.log(`\nOverall Results:`);
        console.log(`  Total Tests: ${this.results.total}`);
        console.log(`  Passed: ${this.results.passed} (${this.results.summary.overallPassRate}%)`);
        console.log(`  Failed: ${this.results.failed}`);
        
        console.log(`\nResults by Requirement:`);
        Object.entries(this.results.summary.byRequirement).forEach(([req, stats]) => {
            const passRate = ((stats.passed / stats.total) * 100).toFixed(1);
            console.log(`  Requirement ${req}: ${stats.passed}/${stats.total} (${passRate}%)`);
        });
        
        console.log(`\nResults by Category:`);
        Object.entries(this.results.summary.byCategory).forEach(([category, stats]) => {
            const passRate = ((stats.passed / stats.total) * 100).toFixed(1);
            console.log(`  ${category}: ${stats.passed}/${stats.total} (${passRate}%)`);
        });

        if (this.results.failed > 0) {
            console.log(`\nFailed Tests:`);
            this.results.details
                .filter(result => result.status !== 'PASS')
                .forEach(result => {
                    console.log(`  ❌ ${result.description}`);
                    if (result.errors) {
                        result.errors.forEach(error => console.log(`     ${error}`));
                    }
                    if (result.error) {
                        console.log(`     ${result.error}`);
                    }
                });
        }

        console.log('\n' + '='.repeat(80));
    }

    async runAllTests() {
        console.log('Starting CloudFront Pretty URLs Validation...');
        console.log(`Testing against: ${CLOUDFRONT_DOMAIN}`);
        console.log(`Total test cases: ${URL_TEST_CASES.length}\n`);

        this.results.total = URL_TEST_CASES.length;

        // Run tests sequentially to avoid overwhelming the server
        for (const testCase of URL_TEST_CASES) {
            await this.runTest(testCase);
            // Small delay between tests
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        this.generateSummary();
        this.printSummary();
        await this.saveResults();

        return this.results.failed === 0;
    }
}

// Main execution
async function main() {
    const validator = new URLValidator();
    
    try {
        const success = await validator.runAllTests();
        process.exit(success ? 0 : 1);
    } catch (error) {
        console.error('Validation failed with error:', error.message);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = URLValidator;