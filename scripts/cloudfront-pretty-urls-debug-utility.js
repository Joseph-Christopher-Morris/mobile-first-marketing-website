#!/usr/bin/env node

/**
 * CloudFront Pretty URLs Debug Utility
 * 
 * Advanced debugging and diagnostic tools for CloudFront Function URL rewriting
 * Provides URL pattern testing, function execution tracing, and performance profiling
 * 
 * Requirements: 8.2, 8.5
 */

const https = require('https');
const { performance } = require('perf_hooks');
const fs = require('fs').promises;
const path = require('path');

class CloudFrontPrettyURLsDebugger {
    constructor(options = {}) {
        this.domain = options.domain || 'https://d15sc9fc739ev2.cloudfront.net';
        this.distributionId = options.distributionId || 'E2IBMHQ3GCW6ZK';
        this.functionName = options.functionName || 'pretty-urls-rewriter';
        this.verbose = options.verbose || false;
        this.logFile = options.logFile || 'cloudfront-debug.log';
        
        // Test patterns for URL validation
        this.testPatterns = [
            // Root URL tests
            { url: '/', expected: '/index.html', description: 'Root URL serves index.html' },
            
            // Directory URL tests
            { url: '/privacy-policy/', expected: '/privacy-policy/index.html', description: 'Directory URL with trailing slash' },
            { url: '/about/', expected: '/about/index.html', description: 'About directory URL' },
            { url: '/services/', expected: '/services/index.html', description: 'Services directory URL' },
            { url: '/blog/', expected: '/blog/index.html', description: 'Blog directory URL' },
            
            // Extensionless URL tests
            { url: '/privacy-policy', expected: '/privacy-policy/index.html', description: 'Extensionless URL rewriting' },
            { url: '/about', expected: '/about/index.html', description: 'About extensionless URL' },
            { url: '/services', expected: '/services/index.html', description: 'Services extensionless URL' },
            { url: '/contact', expected: '/contact/index.html', description: 'Contact extensionless URL' },
            
            // Static asset tests (should not be rewritten)
            { url: '/favicon.ico', expected: '/favicon.ico', description: 'Favicon should not be rewritten' },
            { url: '/robots.txt', expected: '/robots.txt', description: 'Robots.txt should not be rewritten' },
            { url: '/sitemap.xml', expected: '/sitemap.xml', description: 'Sitemap should not be rewritten' },
            { url: '/images/logo.png', expected: '/images/logo.png', description: 'Image files should not be rewritten' },
            { url: '/styles/main.css', expected: '/styles/main.css', description: 'CSS files should not be rewritten' },
            { url: '/scripts/app.js', expected: '/scripts/app.js', description: 'JS files should not be rewritten' },
            
            // Edge cases
            { url: '/nested/path/', expected: '/nested/path/index.html', description: 'Nested directory path' },
            { url: '/nested/path', expected: '/nested/path/index.html', description: 'Nested extensionless path' },
            { url: '/path/with/query?param=value', expected: '/path/with/query/index.html', description: 'Path with query parameters' },
            { url: '/path/with/fragment#section', expected: '/path/with/fragment/index.html', description: 'Path with fragment' },
            
            // Error cases
            { url: '/nonexistent/', expected: '/nonexistent/index.html', description: 'Non-existent directory (should still rewrite)' },
            { url: '/404-test', expected: '/404-test/index.html', description: 'Non-existent extensionless path' }
        ];
        
        this.performanceMetrics = {
            urlTests: [],
            functionExecutions: [],
            responseTimeStats: {}
        };
    }

    /**
     * Main debug utility entry point
     */
    async runDebugSuite(options = {}) {
        console.log('🔍 CloudFront Pretty URLs Debug Suite');
        console.log('=====================================\n');
        
        const results = {
            urlPatternTests: null,
            functionTracing: null,
            performanceProfiling: null,
            timestamp: new Date().toISOString()
        };
        
        try {
            // 1. URL Pattern Testing
            if (options.skipUrlTests !== true) {
                console.log('📋 Running URL Pattern Tests...');
                results.urlPatternTests = await this.runUrlPatternTests();
                console.log('');
            }
            
            // 2. Function Execution Tracing
            if (options.skipTracing !== true) {
                console.log('🔬 Running Function Execution Tracing...');
                results.functionTracing = await this.runFunctionTracing();
                console.log('');
            }
            
            // 3. Performance Profiling
            if (options.skipProfiling !== true) {
                console.log('⚡ Running Performance Profiling...');
                results.performanceProfiling = await this.runPerformanceProfiling();
                console.log('');
            }
            
            // Generate comprehensive report
            await this.generateDebugReport(results);
            
            console.log('✅ Debug suite completed successfully');
            return results;
            
        } catch (error) {
            console.error('❌ Debug suite failed:', error.message);
            if (this.verbose) {
                console.error(error.stack);
            }
            throw error;
        }
    }

    /**
     * Test URL patterns against expected CloudFront Function behavior
     */
    async runUrlPatternTests() {
        console.log('  Testing URL rewriting patterns...');
        
        const results = {
            passed: 0,
            failed: 0,
            total: this.testPatterns.length,
            details: []
        };
        
        for (const test of this.testPatterns) {
            const startTime = performance.now();
            
            try {
                // Simulate CloudFront Function logic locally
                const rewrittenUrl = this.simulateCloudFrontFunction(test.url);
                const endTime = performance.now();
                
                const passed = rewrittenUrl === test.expected;
                const testResult = {
                    url: test.url,
                    expected: test.expected,
                    actual: rewrittenUrl,
                    passed,
                    description: test.description,
                    executionTime: endTime - startTime
                };
                
                results.details.push(testResult);
                
                if (passed) {
                    results.passed++;
                    if (this.verbose) {
                        console.log(`    ✅ ${test.description}: ${test.url} → ${rewrittenUrl}`);
                    }
                } else {
                    results.failed++;
                    console.log(`    ❌ ${test.description}: ${test.url}`);
                    console.log(`       Expected: ${test.expected}`);
                    console.log(`       Actual:   ${rewrittenUrl}`);
                }
                
                // Store performance metrics
                this.performanceMetrics.urlTests.push({
                    url: test.url,
                    executionTime: endTime - startTime,
                    timestamp: new Date().toISOString()
                });
                
            } catch (error) {
                results.failed++;
                console.log(`    ❌ ${test.description}: Error - ${error.message}`);
                
                results.details.push({
                    url: test.url,
                    expected: test.expected,
                    actual: null,
                    passed: false,
                    description: test.description,
                    error: error.message
                });
            }
        }
        
        console.log(`  Results: ${results.passed}/${results.total} tests passed`);
        
        if (results.failed > 0) {
            console.log(`  ⚠️  ${results.failed} tests failed - check details above`);
        }
        
        return results;
    }

    /**
     * Simulate CloudFront Function URL rewriting logic locally
     */
    simulateCloudFrontFunction(uri) {
        // Replicate the exact CloudFront Function logic
        try {
            // Skip rewriting for files with extensions (except directories)
            if (uri.includes('.') && !uri.endsWith('/')) {
                return uri;
            }
            
            // Append index.html to directory paths
            if (uri.endsWith('/')) {
                return uri + 'index.html';
            }
            
            // Convert extensionless paths to directory + index.html
            if (!uri.includes('.')) {
                return uri + '/index.html';
            }
            
            return uri;
            
        } catch (error) {
            console.error('Function simulation error:', error);
            return uri; // Return original URI on error
        }
    }

    /**
     * Test actual CloudFront Function execution with tracing
     */
    async runFunctionTracing() {
        console.log('  Tracing CloudFront Function execution...');
        
        const traceResults = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            averageResponseTime: 0,
            traces: []
        };
        
        // Test a subset of URLs against the actual CloudFront distribution
        const testUrls = [
            '/',
            '/privacy-policy/',
            '/about',
            '/services/',
            '/contact',
            '/favicon.ico'
        ];
        
        const responseTimeSum = [];
        
        for (const testUrl of testUrls) {
            const fullUrl = `${this.domain}${testUrl}`;
            const startTime = performance.now();
            
            try {
                const response = await this.makeHttpRequest(fullUrl);
                const endTime = performance.now();
                const responseTime = endTime - startTime;
                
                responseTimeSum.push(responseTime);
                traceResults.totalRequests++;
                
                const trace = {
                    url: testUrl,
                    fullUrl,
                    statusCode: response.statusCode,
                    responseTime,
                    headers: response.headers,
                    timestamp: new Date().toISOString(),
                    success: response.statusCode >= 200 && response.statusCode < 400
                };
                
                if (trace.success) {
                    traceResults.successfulRequests++;
                    if (this.verbose) {
                        console.log(`    ✅ ${testUrl}: ${response.statusCode} (${responseTime.toFixed(2)}ms)`);
                    }
                } else {
                    traceResults.failedRequests++;
                    console.log(`    ❌ ${testUrl}: ${response.statusCode} (${responseTime.toFixed(2)}ms)`);
                }
                
                traceResults.traces.push(trace);
                
                // Store function execution metrics
                this.performanceMetrics.functionExecutions.push({
                    url: testUrl,
                    responseTime,
                    statusCode: response.statusCode,
                    timestamp: new Date().toISOString()
                });
                
            } catch (error) {
                traceResults.totalRequests++;
                traceResults.failedRequests++;
                
                console.log(`    ❌ ${testUrl}: Request failed - ${error.message}`);
                
                traceResults.traces.push({
                    url: testUrl,
                    fullUrl,
                    error: error.message,
                    timestamp: new Date().toISOString(),
                    success: false
                });
            }
        }
        
        // Calculate average response time
        if (responseTimeSum.length > 0) {
            traceResults.averageResponseTime = responseTimeSum.reduce((a, b) => a + b, 0) / responseTimeSum.length;
        }
        
        console.log(`  Traced ${traceResults.totalRequests} requests`);
        console.log(`  Success rate: ${traceResults.successfulRequests}/${traceResults.totalRequests}`);
        console.log(`  Average response time: ${traceResults.averageResponseTime.toFixed(2)}ms`);
        
        return traceResults;
    }

    /**
     * Profile performance characteristics of URL rewriting
     */
    async runPerformanceProfiling() {
        console.log('  Profiling performance characteristics...');
        
        const profilingResults = {
            localSimulationBenchmark: null,
            realWorldPerformance: null,
            performanceComparison: null,
            recommendations: []
        };
        
        // 1. Benchmark local function simulation
        profilingResults.localSimulationBenchmark = await this.benchmarkLocalSimulation();
        
        // 2. Measure real-world CloudFront performance
        profilingResults.realWorldPerformance = await this.measureRealWorldPerformance();
        
        // 3. Compare and analyze
        profilingResults.performanceComparison = this.analyzePerformanceData();
        
        // 4. Generate recommendations
        profilingResults.recommendations = this.generatePerformanceRecommendations();
        
        console.log('  Performance profiling completed');
        
        return profilingResults;
    }

    /**
     * Benchmark local CloudFront Function simulation
     */
    async benchmarkLocalSimulation() {
        const iterations = 10000;
        const testUrls = ['/', '/about', '/services/', '/contact', '/favicon.ico'];
        
        console.log(`    Benchmarking local simulation (${iterations} iterations)...`);
        
        const results = {
            totalIterations: iterations * testUrls.length,
            totalTime: 0,
            averageTime: 0,
            minTime: Infinity,
            maxTime: 0,
            urlResults: {}
        };
        
        const startTime = performance.now();
        
        for (let i = 0; i < iterations; i++) {
            for (const url of testUrls) {
                const iterationStart = performance.now();
                this.simulateCloudFrontFunction(url);
                const iterationEnd = performance.now();
                
                const executionTime = iterationEnd - iterationStart;
                
                if (!results.urlResults[url]) {
                    results.urlResults[url] = {
                        iterations: 0,
                        totalTime: 0,
                        averageTime: 0,
                        minTime: Infinity,
                        maxTime: 0
                    };
                }
                
                const urlResult = results.urlResults[url];
                urlResult.iterations++;
                urlResult.totalTime += executionTime;
                urlResult.minTime = Math.min(urlResult.minTime, executionTime);
                urlResult.maxTime = Math.max(urlResult.maxTime, executionTime);
            }
        }
        
        const endTime = performance.now();
        results.totalTime = endTime - startTime;
        results.averageTime = results.totalTime / results.totalIterations;
        
        // Calculate per-URL averages
        for (const url in results.urlResults) {
            const urlResult = results.urlResults[url];
            urlResult.averageTime = urlResult.totalTime / urlResult.iterations;
            
            results.minTime = Math.min(results.minTime, urlResult.minTime);
            results.maxTime = Math.max(results.maxTime, urlResult.maxTime);
        }
        
        console.log(`    Local simulation: ${results.averageTime.toFixed(4)}ms average`);
        
        return results;
    }

    /**
     * Measure real-world CloudFront performance
     */
    async measureRealWorldPerformance() {
        const testUrls = ['/', '/about', '/services/', '/contact'];
        const iterations = 5; // Fewer iterations for real requests
        
        console.log(`    Measuring real-world performance (${iterations} iterations)...`);
        
        const results = {
            totalRequests: 0,
            successfulRequests: 0,
            averageResponseTime: 0,
            urlResults: {}
        };
        
        const allResponseTimes = [];
        
        for (let i = 0; i < iterations; i++) {
            for (const url of testUrls) {
                const fullUrl = `${this.domain}${url}`;
                
                try {
                    const startTime = performance.now();
                    const response = await this.makeHttpRequest(fullUrl);
                    const endTime = performance.now();
                    
                    const responseTime = endTime - startTime;
                    allResponseTimes.push(responseTime);
                    
                    results.totalRequests++;
                    if (response.statusCode >= 200 && response.statusCode < 400) {
                        results.successfulRequests++;
                    }
                    
                    if (!results.urlResults[url]) {
                        results.urlResults[url] = {
                            requests: 0,
                            successfulRequests: 0,
                            totalResponseTime: 0,
                            averageResponseTime: 0,
                            responseTimes: []
                        };
                    }
                    
                    const urlResult = results.urlResults[url];
                    urlResult.requests++;
                    urlResult.totalResponseTime += responseTime;
                    urlResult.responseTimes.push(responseTime);
                    
                    if (response.statusCode >= 200 && response.statusCode < 400) {
                        urlResult.successfulRequests++;
                    }
                    
                } catch (error) {
                    results.totalRequests++;
                    console.log(`    Warning: Request to ${url} failed: ${error.message}`);
                }
            }
        }
        
        // Calculate averages
        if (allResponseTimes.length > 0) {
            results.averageResponseTime = allResponseTimes.reduce((a, b) => a + b, 0) / allResponseTimes.length;
        }
        
        for (const url in results.urlResults) {
            const urlResult = results.urlResults[url];
            if (urlResult.requests > 0) {
                urlResult.averageResponseTime = urlResult.totalResponseTime / urlResult.requests;
            }
        }
        
        console.log(`    Real-world performance: ${results.averageResponseTime.toFixed(2)}ms average`);
        
        return results;
    }

    /**
     * Analyze performance data and identify patterns
     */
    analyzePerformanceData() {
        const analysis = {
            functionOverhead: 0,
            cacheEffectiveness: 'unknown',
            performanceImpact: 'minimal',
            bottlenecks: [],
            insights: []
        };
        
        // Analyze collected metrics
        if (this.performanceMetrics.urlTests.length > 0) {
            const avgLocalTime = this.performanceMetrics.urlTests.reduce((sum, test) => sum + test.executionTime, 0) / this.performanceMetrics.urlTests.length;
            analysis.insights.push(`Average local function execution: ${avgLocalTime.toFixed(4)}ms`);
        }
        
        if (this.performanceMetrics.functionExecutions.length > 0) {
            const avgResponseTime = this.performanceMetrics.functionExecutions.reduce((sum, exec) => sum + exec.responseTime, 0) / this.performanceMetrics.functionExecutions.length;
            analysis.insights.push(`Average real-world response time: ${avgResponseTime.toFixed(2)}ms`);
            
            // Identify potential bottlenecks
            const slowRequests = this.performanceMetrics.functionExecutions.filter(exec => exec.responseTime > 1000);
            if (slowRequests.length > 0) {
                analysis.bottlenecks.push(`${slowRequests.length} requests took over 1 second`);
            }
        }
        
        return analysis;
    }

    /**
     * Generate performance optimization recommendations
     */
    generatePerformanceRecommendations() {
        const recommendations = [];
        
        // Analyze performance metrics and generate recommendations
        if (this.performanceMetrics.functionExecutions.length > 0) {
            const avgResponseTime = this.performanceMetrics.functionExecutions.reduce((sum, exec) => sum + exec.responseTime, 0) / this.performanceMetrics.functionExecutions.length;
            
            if (avgResponseTime > 500) {
                recommendations.push({
                    type: 'performance',
                    priority: 'high',
                    issue: 'High average response time',
                    recommendation: 'Consider optimizing CloudFront cache behaviors and TTL settings'
                });
            }
            
            if (avgResponseTime < 100) {
                recommendations.push({
                    type: 'performance',
                    priority: 'info',
                    issue: 'Excellent response times',
                    recommendation: 'Current configuration is performing well'
                });
            }
        }
        
        // Function-specific recommendations
        recommendations.push({
            type: 'optimization',
            priority: 'medium',
            issue: 'Function efficiency',
            recommendation: 'Monitor CloudWatch metrics for function execution time and error rates'
        });
        
        recommendations.push({
            type: 'monitoring',
            priority: 'medium',
            issue: 'Performance tracking',
            recommendation: 'Set up automated performance monitoring with alerting for regression detection'
        });
        
        return recommendations;
    }

    /**
     * Make HTTP request with timeout and error handling
     */
    makeHttpRequest(url, timeout = 10000) {
        return new Promise((resolve, reject) => {
            const request = https.get(url, {
                timeout: timeout,
                headers: {
                    'User-Agent': 'CloudFront-Debug-Utility/1.0'
                }
            }, (response) => {
                resolve({
                    statusCode: response.statusCode,
                    headers: response.headers,
                    url: url
                });
            });
            
            request.on('timeout', () => {
                request.destroy();
                reject(new Error(`Request timeout after ${timeout}ms`));
            });
            
            request.on('error', (error) => {
                reject(error);
            });
        });
    }

    /**
     * Generate comprehensive debug report
     */
    async generateDebugReport(results) {
        const reportPath = `cloudfront-debug-report-${Date.now()}.json`;
        const summaryPath = `cloudfront-debug-summary-${Date.now()}.md`;
        
        // Generate JSON report
        const report = {
            metadata: {
                timestamp: results.timestamp,
                domain: this.domain,
                distributionId: this.distributionId,
                functionName: this.functionName
            },
            results,
            performanceMetrics: this.performanceMetrics
        };
        
        await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
        
        // Generate Markdown summary
        const summary = this.generateMarkdownSummary(results);
        await fs.writeFile(summaryPath, summary);
        
        console.log(`📊 Debug report saved: ${reportPath}`);
        console.log(`📋 Summary report saved: ${summaryPath}`);
        
        return { reportPath, summaryPath };
    }

    /**
     * Generate Markdown summary report
     */
    generateMarkdownSummary(results) {
        let summary = `# CloudFront Pretty URLs Debug Report\n\n`;
        summary += `**Generated:** ${results.timestamp}\n`;
        summary += `**Domain:** ${this.domain}\n`;
        summary += `**Distribution:** ${this.distributionId}\n\n`;
        
        // URL Pattern Tests Summary
        if (results.urlPatternTests) {
            const tests = results.urlPatternTests;
            summary += `## URL Pattern Tests\n\n`;
            summary += `- **Total Tests:** ${tests.total}\n`;
            summary += `- **Passed:** ${tests.passed}\n`;
            summary += `- **Failed:** ${tests.failed}\n`;
            summary += `- **Success Rate:** ${((tests.passed / tests.total) * 100).toFixed(1)}%\n\n`;
            
            if (tests.failed > 0) {
                summary += `### Failed Tests\n\n`;
                tests.details.filter(test => !test.passed).forEach(test => {
                    summary += `- **${test.description}**\n`;
                    summary += `  - URL: \`${test.url}\`\n`;
                    summary += `  - Expected: \`${test.expected}\`\n`;
                    summary += `  - Actual: \`${test.actual || 'Error'}\`\n\n`;
                });
            }
        }
        
        // Function Tracing Summary
        if (results.functionTracing) {
            const tracing = results.functionTracing;
            summary += `## Function Execution Tracing\n\n`;
            summary += `- **Total Requests:** ${tracing.totalRequests}\n`;
            summary += `- **Successful:** ${tracing.successfulRequests}\n`;
            summary += `- **Failed:** ${tracing.failedRequests}\n`;
            summary += `- **Average Response Time:** ${tracing.averageResponseTime.toFixed(2)}ms\n\n`;
        }
        
        // Performance Profiling Summary
        if (results.performanceProfiling) {
            const profiling = results.performanceProfiling;
            summary += `## Performance Profiling\n\n`;
            
            if (profiling.recommendations && profiling.recommendations.length > 0) {
                summary += `### Recommendations\n\n`;
                profiling.recommendations.forEach(rec => {
                    summary += `- **${rec.type.toUpperCase()}** (${rec.priority}): ${rec.recommendation}\n`;
                });
                summary += `\n`;
            }
        }
        
        summary += `## Next Steps\n\n`;
        summary += `1. Review failed tests and fix any URL rewriting issues\n`;
        summary += `2. Monitor performance metrics in CloudWatch\n`;
        summary += `3. Set up automated monitoring for regression detection\n`;
        summary += `4. Consider implementing performance optimizations if needed\n`;
        
        return summary;
    }
}

// CLI interface
if (require.main === module) {
    const args = process.argv.slice(2);
    const options = {};
    
    // Parse command line arguments
    for (let i = 0; i < args.length; i++) {
        switch (args[i]) {
            case '--domain':
                options.domain = args[++i];
                break;
            case '--distribution-id':
                options.distributionId = args[++i];
                break;
            case '--function-name':
                options.functionName = args[++i];
                break;
            case '--verbose':
                options.verbose = true;
                break;
            case '--skip-url-tests':
                options.skipUrlTests = true;
                break;
            case '--skip-tracing':
                options.skipTracing = true;
                break;
            case '--skip-profiling':
                options.skipProfiling = true;
                break;
            case '--help':
                console.log(`
CloudFront Pretty URLs Debug Utility

Usage: node cloudfront-pretty-urls-debug-utility.js [options]

Options:
  --domain <url>           CloudFront domain (default: https://d15sc9fc739ev2.cloudfront.net)
  --distribution-id <id>   CloudFront distribution ID (default: E2IBMHQ3GCW6ZK)
  --function-name <name>   CloudFront function name (default: pretty-urls-rewriter)
  --verbose               Enable verbose output
  --skip-url-tests        Skip URL pattern testing
  --skip-tracing          Skip function execution tracing
  --skip-profiling        Skip performance profiling
  --help                  Show this help message

Examples:
  node cloudfront-pretty-urls-debug-utility.js
  node cloudfront-pretty-urls-debug-utility.js --verbose
  node cloudfront-pretty-urls-debug-utility.js --skip-profiling
                `);
                process.exit(0);
                break;
        }
    }
    
    // Run debug suite
    const debugger = new CloudFrontPrettyURLsDebugger(options);
    
    debugger.runDebugSuite(options)
        .then(results => {
            console.log('\n🎉 Debug suite completed successfully!');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n💥 Debug suite failed:', error.message);
            process.exit(1);
        });
}

module.exports = CloudFrontPrettyURLsDebugger;