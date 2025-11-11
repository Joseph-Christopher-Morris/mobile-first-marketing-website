#!/usr/bin/env node

/**
 * Real-time URL Functionality Validation Script
 * 
 * This script validates that CloudFront pretty URLs are working correctly:
 * - Root URL serves index.html automatically
 * - Directory URLs work without index.html
 * - Extensionless URLs redirect properly
 * 
 * Requirements: 1.4, 2.4
 */

const https = require('https');
const http = require('http');

// Configuration
const CLOUDFRONT_DOMAIN = 'd15sc9fc739ev2.cloudfront.net';
const BASE_URL = `https://${CLOUDFRONT_DOMAIN}`;

// Test cases for URL validation
const URL_TEST_CASES = [
    {
        name: 'Root URL serves index.html automatically',
        url: '/',
        expectedStatus: 200,
        expectedContentType: 'text/html',
        shouldContain: ['<html', '<head', '<body'],
        description: 'Root URL (/) should serve index.html automatically',
        requirement: '1.4'
    },
    {
        name: 'Privacy Policy directory URL works without index.html',
        url: '/privacy-policy/',
        expectedStatus: 200,
        expectedContentType: 'text/html',
        shouldContain: ['Privacy Policy', '<html'],
        description: 'Directory URL (/privacy-policy/) should serve index.html from that directory',
        requirement: '2.4'
    },
    {
        name: 'About directory URL works without index.html',
        url: '/about/',
        expectedStatus: 200,
        expectedContentType: 'text/html',
        shouldContain: ['<html', '<head'],
        description: 'Directory URL (/about/) should serve index.html from that directory',
        requirement: '2.4'
    },
    {
        name: 'Contact directory URL works without index.html',
        url: '/contact/',
        expectedStatus: 200,
        expectedContentType: 'text/html',
        shouldContain: ['<html', '<head'],
        description: 'Directory URL (/contact/) should serve index.html from that directory',
        requirement: '2.4'
    },
    {
        name: 'Services directory URL works without index.html',
        url: '/services/',
        expectedStatus: 200,
        expectedContentType: 'text/html',
        shouldContain: ['<html', '<head'],
        description: 'Directory URL (/services/) should serve index.html from that directory',
        requirement: '2.4'
    },
    {
        name: 'Blog directory URL works without index.html',
        url: '/blog/',
        expectedStatus: 200,
        expectedContentType: 'text/html',
        shouldContain: ['<html', '<head'],
        description: 'Directory URL (/blog/) should serve index.html from that directory',
        requirement: '2.4'
    },
    {
        name: 'Extensionless URL redirects properly - privacy-policy',
        url: '/privacy-policy',
        expectedStatus: 200,
        expectedContentType: 'text/html',
        shouldContain: ['Privacy Policy', '<html'],
        description: 'Extensionless URL (/privacy-policy) should serve /privacy-policy/index.html',
        requirement: '2.4'
    },
    {
        name: 'Extensionless URL redirects properly - about',
        url: '/about',
        expectedStatus: 200,
        expectedContentType: 'text/html',
        shouldContain: ['<html', '<head'],
        description: 'Extensionless URL (/about) should serve /about/index.html',
        requirement: '2.4'
    },
    {
        name: 'Extensionless URL redirects properly - contact',
        url: '/contact',
        expectedStatus: 200,
        expectedContentType: 'text/html',
        shouldContain: ['<html', '<head'],
        description: 'Extensionless URL (/contact) should serve /contact/index.html',
        requirement: '2.4'
    },
    {
        name: 'Extensionless URL redirects properly - services',
        url: '/services',
        expectedStatus: 200,
        expectedContentType: 'text/html',
        shouldContain: ['<html', '<head'],
        description: 'Extensionless URL (/services) should serve /services/index.html',
        requirement: '2.4'
    },
    {
        name: 'Extensionless URL redirects properly - blog',
        url: '/blog',
        expectedStatus: 200,
        expectedContentType: 'text/html',
        shouldContain: ['<html', '<head'],
        description: 'Extensionless URL (/blog) should serve /blog/index.html',
        requirement: '2.4'
    },
    {
        name: 'Explicit file paths continue to work',
        url: '/privacy-policy/index.html',
        expectedStatus: 200,
        expectedContentType: 'text/html',
        shouldContain: ['Privacy Policy', '<html'],
        description: 'Explicit file paths should continue to work for backward compatibility',
        requirement: '1.4'
    },
    {
        name: 'Static assets are not affected',
        url: '/favicon.ico',
        expectedStatus: 200,
        expectedContentType: 'image/',
        shouldContain: [],
        description: 'Static assets should not be affected by URL rewriting',
        requirement: '1.4'
    }
];

/**
 * Make HTTP request and return response details
 */
function makeRequest(url) {
    return new Promise((resolve, reject) => {
        const fullUrl = `${BASE_URL}${url}`;
        console.log(`Testing: ${fullUrl}`);
        
        const request = https.get(fullUrl, {
            timeout: 10000,
            headers: {
                'User-Agent': 'CloudFront-Pretty-URLs-Validator/1.0'
            }
        }, (response) => {
            let data = '';
            
            response.on('data', (chunk) => {
                data += chunk;
            });
            
            response.on('end', () => {
                resolve({
                    statusCode: response.statusCode,
                    headers: response.headers,
                    body: data,
                    url: fullUrl
                });
            });
        });
        
        request.on('error', (error) => {
            reject(error);
        });
        
        request.on('timeout', () => {
            request.destroy();
            reject(new Error('Request timeout'));
        });
    });
}

/**
 * Validate a single URL test case
 */
async function validateUrlTestCase(testCase) {
    const result = {
        name: testCase.name,
        url: testCase.url,
        requirement: testCase.requirement,
        passed: false,
        details: [],
        errors: []
    };
    
    try {
        const response = await makeRequest(testCase.url);
        
        // Check status code
        if (response.statusCode === testCase.expectedStatus) {
            result.details.push(`✓ Status code: ${response.statusCode}`);
        } else {
            result.errors.push(`✗ Expected status ${testCase.expectedStatus}, got ${response.statusCode}`);
        }
        
        // Check content type
        const contentType = response.headers['content-type'] || '';
        if (contentType.includes(testCase.expectedContentType)) {
            result.details.push(`✓ Content-Type: ${contentType}`);
        } else {
            result.errors.push(`✗ Expected content-type to contain '${testCase.expectedContentType}', got '${contentType}'`);
        }
        
        // Check content contains expected strings
        if (testCase.shouldContain && testCase.shouldContain.length > 0) {
            for (const expectedContent of testCase.shouldContain) {
                if (response.body.toLowerCase().includes(expectedContent.toLowerCase())) {
                    result.details.push(`✓ Contains: '${expectedContent}'`);
                } else {
                    result.errors.push(`✗ Missing expected content: '${expectedContent}'`);
                }
            }
        }
        
        // Check CloudFront headers
        if (response.headers['x-cache']) {
            result.details.push(`✓ CloudFront cache status: ${response.headers['x-cache']}`);
        }
        
        if (response.headers['x-amz-cf-pop']) {
            result.details.push(`✓ CloudFront POP: ${response.headers['x-amz-cf-pop']}`);
        }
        
        // Test passes if no errors
        result.passed = result.errors.length === 0;
        
    } catch (error) {
        result.errors.push(`✗ Request failed: ${error.message}`);
        result.passed = false;
    }
    
    return result;
}

/**
 * Run all URL validation tests
 */
async function runUrlValidation() {
    console.log('🚀 Starting Real-time URL Functionality Validation');
    console.log(`📍 Testing domain: ${BASE_URL}`);
    console.log(`📅 Test started: ${new Date().toISOString()}\n`);
    
    const results = [];
    let passedTests = 0;
    let totalTests = URL_TEST_CASES.length;
    
    for (const testCase of URL_TEST_CASES) {
        console.log(`\n🔍 ${testCase.name}`);
        console.log(`   Description: ${testCase.description}`);
        console.log(`   Requirement: ${testCase.requirement}`);
        
        const result = await validateUrlTestCase(testCase);
        results.push(result);
        
        if (result.passed) {
            console.log(`   ✅ PASSED`);
            passedTests++;
        } else {
            console.log(`   ❌ FAILED`);
        }
        
        // Show details
        result.details.forEach(detail => console.log(`      ${detail}`));
        result.errors.forEach(error => console.log(`      ${error}`));
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('📊 VALIDATION SUMMARY');
    console.log('='.repeat(80));
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${totalTests - passedTests}`);
    console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    
    if (passedTests === totalTests) {
        console.log('\n🎉 ALL TESTS PASSED! Pretty URLs are working correctly.');
    } else {
        console.log('\n⚠️  SOME TESTS FAILED. Please review the errors above.');
    }
    
    // Detailed results
    console.log('\n📋 DETAILED RESULTS:');
    results.forEach((result, index) => {
        console.log(`\n${index + 1}. ${result.name}`);
        console.log(`   URL: ${BASE_URL}${result.url}`);
        console.log(`   Status: ${result.passed ? '✅ PASSED' : '❌ FAILED'}`);
        console.log(`   Requirement: ${result.requirement}`);
        
        if (result.errors.length > 0) {
            console.log('   Errors:');
            result.errors.forEach(error => console.log(`     - ${error}`));
        }
    });
    
    // Generate JSON report
    const report = {
        timestamp: new Date().toISOString(),
        domain: BASE_URL,
        summary: {
            totalTests,
            passedTests,
            failedTests: totalTests - passedTests,
            successRate: ((passedTests / totalTests) * 100).toFixed(1) + '%'
        },
        results
    };
    
    const reportFilename = `pretty-urls-validation-report-${Date.now()}.json`;
    require('fs').writeFileSync(reportFilename, JSON.stringify(report, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportFilename}`);
    
    return passedTests === totalTests;
}

/**
 * Main execution
 */
async function main() {
    try {
        const success = await runUrlValidation();
        process.exit(success ? 0 : 1);
    } catch (error) {
        console.error('❌ Validation failed with error:', error.message);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { runUrlValidation, validateUrlTestCase };