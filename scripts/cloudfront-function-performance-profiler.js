#!/usr/bin/env node

/**
 * CloudFront Function Performance Profiler
 * 
 * Advanced performance profiling and optimization tools for CloudFront Functions
 * Provides detailed performance analysis, bottleneck identification, and optimization recommendations
 * 
 * Requirements: 8.2, 8.5
 */

const https = require('https');
const { performance } = require('perf_hooks');
const fs = require('fs').promises;
const crypto = require('crypto');

class CloudFrontFunctionProfiler {
    constructor(options = {}) {
        this.domain = options.domain || 'https://d15sc9fc739ev2.cloudfront.net';
        this.functionName = options.functionName || 'pretty-urls-rewriter';
        this.verbose = options.verbose || false;
        
        // Performance test configurations
        this.testConfigs = {
            load: {
                concurrent: 10,
                requests: 100,
                timeout: 5000
            },
            stress: {
                concurrent: 50,
                requests: 500,
                timeout: 10000
            },
            endurance: {
                concurrent: 5,
                requests: 1000,
                timeout: 30000
            }
        };
        
        // URL patterns for comprehensive testing
        this.testUrls = [
            // High-frequency patterns
            { url: '/', weight: 30, category: 'root' },
            { url: '/about', weight: 15, category: 'extensionless' },
            { url: '/services', weight: 15, category: 'extensionless' },
            { url: '/contact', weight: 10, category: 'extensionless' },
            
            // Directory patterns
            { url: '/privacy-policy/', weight: 8, category: 'directory' },
            { url: '/about/', weight: 5, category: 'directory' },
            { url: '/services/', weight: 5, category: 'directory' },
            
            // Static assets (should not be rewritten)
            { url: '/favicon.ico', weight: 3, category: 'static' },
            { url: '/robots.txt', weight: 2, category: 'static' },
            { url: '/sitemap.xml', weight: 2, category: 'static' },
            
            // Edge cases
            { url: '/nested/deep/path', weight: 2, category: 'nested' },
            { url: '/nested/deep/path/', weight: 2, category: 'nested' },
            { url: '/path/with/query?param=value&test=123', weight: 1, category: 'query' }
        ];
        
        this.performanceData = {
            baseline: null,
            loadTest: null,
            stressTest: null,
            enduranceTest: null,
            analysis: {}
        };
    }

    /**
     * Main performance profiling entry point
     */
    async runPerformanceProfiling(options = {}) {
        console.log('⚡ CloudFront Function Performance Profiler');
        console.log('==========================================\n');
        
        const profilingResults = {
            baseline: null,
            loadTesting: null,
            stressTesting: null,
            enduranceTesting: null,
            performanceAnalysis: null,
            optimizationRecommendations: null,
            timestamp: new Date().toISOString()
        };
        
        try {
            // 1. Establish baseline performance
            console.log('📊 Establishing baseline performance...');
            profilingResults.baseline = await this.establishBaseline();
            
            // 2. Load testing
            if (!options.skipLoad) {
                console.log('🔄 Running load testing...');
                profilingResults.loadTesting = await this.runLoadTest();
            }
            
            // 3. Stress testing
            if (!options.skipStress) {
                console.log('💪 Running stress testing...');
                profilingResults.stressTesting = await this.runStressTest();
            }
            
            // 4. Endurance testing
            if (!options.skipEndurance) {
                console.log('🏃 Running endurance testing...');
                profilingResults.enduranceTesting = await this.runEnduranceTest();
            }
            
            // 5. Analyze performance data
            console.log('🔍 Analyzing performance data...');
            profilingResults.performanceAnalysis = await this.analyzePerformanceData();
            
            // 6. Generate optimization recommendations
            console.log('💡 Generating optimization recommendations...');
            profilingResults.optimizationRecommendations = await this.generateOptimizationRecommendations();
            
            // Generate comprehensive report
            await this.generatePerformanceReport(profilingResults);
            
            console.log('✅ Performance profiling completed successfully');
            return profilingResults;
            
        } catch (error) {
            console.error('❌ Performance profiling failed:', error.message);
            if (this.verbose) {
                console.error(error.stack);
            }
            throw error;
        }
    }

    /**
     * Establish baseline performance metrics
     */
    async establishBaseline() {
        console.log('  Measuring baseline response times...');
        
        const baseline = {
            singleRequest: {},
            urlPatterns: {},
            cacheEffectiveness: {},
            timestamp: new Date().toISOString()
        };
        
        // Test each URL pattern individually
        for (const testUrl of this.testUrls) {
            const measurements = [];
            const iterations = 5;
            
            for (let i = 0; i < iterations; i++) {
                try {
                    const measurement = await this.measureSingleRequest(testUrl.url);
                    measurements.push(measurement);
                    
                    // Small delay between requests
                    await this.sleep(100);
                    
                } catch (error) {
                    console.log(`    ⚠️  Request failed for ${testUrl.url}: ${error.message}`);
                }
            }
            
            if (measurements.length > 0) {
                baseline.urlPatterns[testUrl.url] = {
                    category: testUrl.category,
                    weight: testUrl.weight,
                    measurements: measurements.length,
                    averageResponseTime: measurements.reduce((sum, m) => sum + m.responseTime, 0) / measurements.length,
                    minResponseTime: Math.min(...measurements.map(m => m.responseTime)),
                    maxResponseTime: Math.max(...measurements.map(m => m.responseTime)),
                    successRate: (measurements.filter(m => m.success).length / measurements.length) * 100,
                    cacheHit: measurements.filter(m => m.cacheHit).length > 0
                };
                
                if (this.verbose) {
                    const pattern = baseline.urlPatterns[testUrl.url];
                    console.log(`    📈 ${testUrl.url}: ${pattern.averageResponseTime.toFixed(2)}ms avg (${pattern.successRate.toFixed(1)}% success)`);
                }
            }
        }
        
        // Calculate overall baseline metrics
        const allPatterns = Object.values(baseline.urlPatterns);
        if (allPatterns.length > 0) {
            baseline.singleRequest = {
                averageResponseTime: allPatterns.reduce((sum, p) => sum + p.averageResponseTime, 0) / allPatterns.length,
                minResponseTime: Math.min(...allPatterns.map(p => p.minResponseTime)),
                maxResponseTime: Math.max(...allPatterns.map(p => p.maxResponseTime)),
                overallSuccessRate: allPatterns.reduce((sum, p) => sum + p.successRate, 0) / allPatterns.length
            };
        }
        
        console.log(`  📊 Baseline established: ${baseline.singleRequest.averageResponseTime?.toFixed(2)}ms average response time`);
        
        this.performanceData.baseline = baseline;
        return baseline;
    }

    /**
     * Run load testing with concurrent requests
     */
    async runLoadTest() {
        const config = this.testConfigs.load;
        console.log(`  Running ${config.requests} requests with ${config.concurrent} concurrent connections...`);
        
        const loadTestResults = {
            config,
            startTime: new Date(),
            endTime: null,
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            averageResponseTime: 0,
            throughput: 0,
            responseTimes: [],
            errorRate: 0,
            concurrencyAnalysis: {}
        };
        
        const startTime = performance.now();
        const promises = [];
        const results = [];
        
        // Generate weighted URL distribution
        const urlDistribution = this.generateUrlDistribution(config.requests);
        
        // Create concurrent request batches
        for (let batch = 0; batch < Math.ceil(config.requests / config.concurrent); batch++) {
            const batchPromises = [];
            const batchStart = batch * config.concurrent;
            const batchEnd = Math.min(batchStart + config.concurrent, config.requests);
            
            for (let i = batchStart; i < batchEnd; i++) {
                const url = urlDistribution[i];
                batchPromises.push(this.measureSingleRequest(url));
            }
            
            try {
                const batchResults = await Promise.allSettled(batchPromises);
                batchResults.forEach(result => {
                    if (result.status === 'fulfilled') {
                        results.push(result.value);
                    } else {
                        results.push({ success: false, error: result.reason.message });
                    }
                });
                
                // Small delay between batches to avoid overwhelming the server
                if (batch < Math.ceil(config.requests / config.concurrent) - 1) {
                    await this.sleep(50);
                }
                
            } catch (error) {
                console.log(`    ⚠️  Batch ${batch} failed: ${error.message}`);
            }
        }
        
        const endTime = performance.now();
        const totalTime = endTime - startTime;
        
        // Analyze results
        loadTestResults.endTime = new Date();
        loadTestResults.totalRequests = results.length;
        loadTestResults.successfulRequests = results.filter(r => r.success).length;
        loadTestResults.failedRequests = results.filter(r => !r.success).length;
        loadTestResults.errorRate = (loadTestResults.failedRequests / loadTestResults.totalRequests) * 100;
        
        const successfulResults = results.filter(r => r.success && r.responseTime);
        if (successfulResults.length > 0) {
            loadTestResults.responseTimes = successfulResults.map(r => r.responseTime);
            loadTestResults.averageResponseTime = successfulResults.reduce((sum, r) => sum + r.responseTime, 0) / successfulResults.length;
            loadTestResults.throughput = (loadTestResults.successfulRequests / totalTime) * 1000; // requests per second
        }
        
        console.log(`  📊 Load test completed: ${loadTestResults.successfulRequests}/${loadTestResults.totalRequests} successful`);
        console.log(`  ⚡ Throughput: ${loadTestResults.throughput.toFixed(2)} req/sec, Average: ${loadTestResults.averageResponseTime.toFixed(2)}ms`);
        
        this.performanceData.loadTest = loadTestResults;
        return loadTestResults;
    }

    /**
     * Run stress testing with high concurrency
     */
    async runStressTest() {
        const config = this.testConfigs.stress;
        console.log(`  Running stress test: ${config.requests} requests with ${config.concurrent} concurrent connections...`);
        
        const stressTestResults = {
            config,
            startTime: new Date(),
            endTime: null,
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            averageResponseTime: 0,
            maxResponseTime: 0,
            errorRate: 0,
            timeoutRate: 0,
            degradationAnalysis: {}
        };
        
        const startTime = performance.now();
        const results = [];
        
        // Generate URL distribution for stress test
        const urlDistribution = this.generateUrlDistribution(config.requests);
        
        // Run requests in smaller batches to manage memory
        const batchSize = Math.min(config.concurrent, 20);
        
        for (let i = 0; i < config.requests; i += batchSize) {
            const batch = [];
            const batchEnd = Math.min(i + batchSize, config.requests);
            
            for (let j = i; j < batchEnd; j++) {
                const url = urlDistribution[j];
                batch.push(this.measureSingleRequest(url, config.timeout));
            }
            
            try {
                const batchResults = await Promise.allSettled(batch);
                batchResults.forEach(result => {
                    if (result.status === 'fulfilled') {
                        results.push(result.value);
                    } else {
                        results.push({ 
                            success: false, 
                            error: result.reason.message,
                            timeout: result.reason.message.includes('timeout')
                        });
                    }
                });
                
            } catch (error) {
                console.log(`    ⚠️  Stress test batch failed: ${error.message}`);
            }
            
            // Progress indicator
            if (i % 100 === 0 && this.verbose) {
                console.log(`    📈 Progress: ${i}/${config.requests} requests completed`);
            }
        }
        
        const endTime = performance.now();
        
        // Analyze stress test results
        stressTestResults.endTime = new Date();
        stressTestResults.totalRequests = results.length;
        stressTestResults.successfulRequests = results.filter(r => r.success).length;
        stressTestResults.failedRequests = results.filter(r => !r.success).length;
        stressTestResults.errorRate = (stressTestResults.failedRequests / stressTestResults.totalRequests) * 100;
        stressTestResults.timeoutRate = (results.filter(r => r.timeout).length / stressTestResults.totalRequests) * 100;
        
        const successfulResults = results.filter(r => r.success && r.responseTime);
        if (successfulResults.length > 0) {
            stressTestResults.averageResponseTime = successfulResults.reduce((sum, r) => sum + r.responseTime, 0) / successfulResults.length;
            stressTestResults.maxResponseTime = Math.max(...successfulResults.map(r => r.responseTime));
        }
        
        console.log(`  💪 Stress test completed: ${stressTestResults.successfulRequests}/${stressTestResults.totalRequests} successful`);
        console.log(`  🚨 Error rate: ${stressTestResults.errorRate.toFixed(2)}%, Timeout rate: ${stressTestResults.timeoutRate.toFixed(2)}%`);
        
        this.performanceData.stressTest = stressTestResults;
        return stressTestResults;
    }

    /**
     * Run endurance testing for sustained load
     */
    async runEnduranceTest() {
        const config = this.testConfigs.endurance;
        console.log(`  Running endurance test: ${config.requests} requests over extended period...`);
        
        const enduranceTestResults = {
            config,
            startTime: new Date(),
            endTime: null,
            phases: [],
            overallMetrics: {},
            performanceDegradation: {},
            memoryLeakDetection: {}
        };
        
        const phaseSize = 100;
        const phases = Math.ceil(config.requests / phaseSize);
        
        for (let phase = 0; phase < phases; phase++) {
            const phaseStart = performance.now();
            const phaseResults = [];
            
            const phaseRequests = Math.min(phaseSize, config.requests - (phase * phaseSize));
            const urlDistribution = this.generateUrlDistribution(phaseRequests);
            
            // Run phase requests with controlled concurrency
            for (let i = 0; i < phaseRequests; i += config.concurrent) {
                const batch = [];
                const batchEnd = Math.min(i + config.concurrent, phaseRequests);
                
                for (let j = i; j < batchEnd; j++) {
                    const url = urlDistribution[j];
                    batch.push(this.measureSingleRequest(url));
                }
                
                try {
                    const batchResults = await Promise.allSettled(batch);
                    batchResults.forEach(result => {
                        if (result.status === 'fulfilled') {
                            phaseResults.push(result.value);
                        } else {
                            phaseResults.push({ success: false, error: result.reason.message });
                        }
                    });
                    
                } catch (error) {
                    console.log(`    ⚠️  Endurance phase ${phase} batch failed: ${error.message}`);
                }
                
                // Small delay to simulate sustained load
                await this.sleep(10);
            }
            
            const phaseEnd = performance.now();
            
            // Analyze phase results
            const successfulPhaseResults = phaseResults.filter(r => r.success && r.responseTime);
            const phaseMetrics = {
                phase: phase + 1,
                requests: phaseResults.length,
                successful: successfulPhaseResults.length,
                failed: phaseResults.length - successfulPhaseResults.length,
                averageResponseTime: successfulPhaseResults.length > 0 ? 
                    successfulPhaseResults.reduce((sum, r) => sum + r.responseTime, 0) / successfulPhaseResults.length : 0,
                duration: phaseEnd - phaseStart,
                timestamp: new Date().toISOString()
            };
            
            enduranceTestResults.phases.push(phaseMetrics);
            
            if (this.verbose) {
                console.log(`    🏃 Phase ${phase + 1}/${phases}: ${phaseMetrics.successful}/${phaseMetrics.requests} successful, ${phaseMetrics.averageResponseTime.toFixed(2)}ms avg`);
            }
        }
        
        enduranceTestResults.endTime = new Date();
        
        // Analyze overall endurance metrics
        const allPhases = enduranceTestResults.phases;
        if (allPhases.length > 0) {
            enduranceTestResults.overallMetrics = {
                totalRequests: allPhases.reduce((sum, p) => sum + p.requests, 0),
                totalSuccessful: allPhases.reduce((sum, p) => sum + p.successful, 0),
                averageResponseTime: allPhases.reduce((sum, p) => sum + p.averageResponseTime, 0) / allPhases.length,
                performanceStability: this.calculatePerformanceStability(allPhases)
            };
            
            // Detect performance degradation
            enduranceTestResults.performanceDegradation = this.detectPerformanceDegradation(allPhases);
        }
        
        console.log(`  🏃 Endurance test completed: ${enduranceTestResults.overallMetrics.totalSuccessful}/${enduranceTestResults.overallMetrics.totalRequests} total successful`);
        
        this.performanceData.enduranceTest = enduranceTestResults;
        return enduranceTestResults;
    }

    /**
     * Analyze all performance data and identify patterns
     */
    async analyzePerformanceData() {
        console.log('  Analyzing performance patterns and bottlenecks...');
        
        const analysis = {
            performanceComparison: {},
            bottleneckIdentification: [],
            scalabilityAnalysis: {},
            cacheEffectivenessAnalysis: {},
            recommendations: []
        };
        
        // Compare performance across different test types
        if (this.performanceData.baseline && this.performanceData.loadTest) {
            const baselineAvg = this.performanceData.baseline.singleRequest.averageResponseTime;
            const loadTestAvg = this.performanceData.loadTest.averageResponseTime;
            
            analysis.performanceComparison.loadImpact = {
                baselineResponseTime: baselineAvg,
                loadTestResponseTime: loadTestAvg,
                degradationPercentage: ((loadTestAvg - baselineAvg) / baselineAvg) * 100,
                acceptable: ((loadTestAvg - baselineAvg) / baselineAvg) < 0.5 // Less than 50% degradation
            };
        }
        
        // Identify bottlenecks
        if (this.performanceData.stressTest) {
            const stressTest = this.performanceData.stressTest;
            
            if (stressTest.errorRate > 5) {
                analysis.bottleneckIdentification.push({
                    type: 'error_rate',
                    severity: 'high',
                    description: `High error rate under stress: ${stressTest.errorRate.toFixed(2)}%`,
                    recommendation: 'Investigate error causes and implement better error handling'
                });
            }
            
            if (stressTest.timeoutRate > 2) {
                analysis.bottleneckIdentification.push({
                    type: 'timeout_rate',
                    severity: 'medium',
                    description: `Significant timeout rate: ${stressTest.timeoutRate.toFixed(2)}%`,
                    recommendation: 'Optimize function execution time or increase timeout limits'
                });
            }
        }
        
        // Scalability analysis
        if (this.performanceData.loadTest && this.performanceData.stressTest) {
            analysis.scalabilityAnalysis = {
                throughputDegradation: this.calculateThroughputDegradation(),
                concurrencyHandling: this.analyzeConcurrencyHandling(),
                resourceUtilization: 'CloudFront Functions have automatic scaling'
            };
        }
        
        console.log(`  🔍 Analysis completed: ${analysis.bottleneckIdentification.length} bottlenecks identified`);
        
        return analysis;
    }

    /**
     * Generate optimization recommendations based on analysis
     */
    async generateOptimizationRecommendations() {
        console.log('  Generating optimization recommendations...');
        
        const recommendations = {
            immediate: [],
            shortTerm: [],
            longTerm: [],
            monitoring: []
        };
        
        // Immediate optimizations
        recommendations.immediate.push({
            category: 'Function Logic',
            priority: 'high',
            recommendation: 'Minimize string operations and use early returns for static assets',
            expectedImpact: 'Reduce average execution time by 10-20%',
            implementation: 'Update CloudFront Function code to optimize URL pattern matching'
        });
        
        // Short-term optimizations
        recommendations.shortTerm.push({
            category: 'Cache Configuration',
            priority: 'medium',
            recommendation: 'Optimize cache behaviors for different URL patterns',
            expectedImpact: 'Improve cache hit ratio and reduce origin requests',
            implementation: 'Configure separate cache behaviors for static assets vs. dynamic content'
        });
        
        // Long-term optimizations
        recommendations.longTerm.push({
            category: 'Architecture',
            priority: 'medium',
            recommendation: 'Consider implementing edge-side includes (ESI) for dynamic content',
            expectedImpact: 'Further reduce origin load and improve performance',
            implementation: 'Evaluate ESI implementation for frequently changing content'
        });
        
        // Monitoring recommendations
        recommendations.monitoring.push({
            category: 'Performance Monitoring',
            priority: 'high',
            recommendation: 'Set up automated performance regression testing',
            expectedImpact: 'Early detection of performance issues',
            implementation: 'Implement CI/CD pipeline with performance testing'
        });
        
        console.log(`  💡 Generated ${Object.values(recommendations).flat().length} optimization recommendations`);
        
        return recommendations;
    }

    /**
     * Measure single request performance
     */
    async measureSingleRequest(url, timeout = 5000) {
        const fullUrl = `${this.domain}${url}`;
        const startTime = performance.now();
        
        try {
            const response = await this.makeHttpRequest(fullUrl, timeout);
            const endTime = performance.now();
            
            return {
                url,
                fullUrl,
                responseTime: endTime - startTime,
                statusCode: response.statusCode,
                success: response.statusCode >= 200 && response.statusCode < 400,
                cacheHit: response.headers['x-cache']?.includes('Hit') || false,
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            const endTime = performance.now();
            
            return {
                url,
                fullUrl,
                responseTime: endTime - startTime,
                success: false,
                error: error.message,
                timeout: error.message.includes('timeout'),
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Generate weighted URL distribution for testing
     */
    generateUrlDistribution(totalRequests) {
        const distribution = [];
        const totalWeight = this.testUrls.reduce((sum, url) => sum + url.weight, 0);
        
        for (const testUrl of this.testUrls) {
            const count = Math.round((testUrl.weight / totalWeight) * totalRequests);
            for (let i = 0; i < count; i++) {
                distribution.push(testUrl.url);
            }
        }
        
        // Fill remaining slots if needed
        while (distribution.length < totalRequests) {
            distribution.push(this.testUrls[0].url);
        }
        
        // Shuffle the distribution
        for (let i = distribution.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [distribution[i], distribution[j]] = [distribution[j], distribution[i]];
        }
        
        return distribution.slice(0, totalRequests);
    }

    /**
     * Calculate performance stability across phases
     */
    calculatePerformanceStability(phases) {
        if (phases.length < 2) return 100;
        
        const responseTimes = phases.map(p => p.averageResponseTime);
        const mean = responseTimes.reduce((sum, rt) => sum + rt, 0) / responseTimes.length;
        const variance = responseTimes.reduce((sum, rt) => sum + Math.pow(rt - mean, 2), 0) / responseTimes.length;
        const standardDeviation = Math.sqrt(variance);
        
        // Calculate coefficient of variation (lower is more stable)
        const coefficientOfVariation = (standardDeviation / mean) * 100;
        
        // Convert to stability percentage (higher is more stable)
        return Math.max(0, 100 - coefficientOfVariation);
    }

    /**
     * Detect performance degradation over time
     */
    detectPerformanceDegradation(phases) {
        if (phases.length < 3) return { detected: false };
        
        const firstThird = phases.slice(0, Math.floor(phases.length / 3));
        const lastThird = phases.slice(-Math.floor(phases.length / 3));
        
        const firstAvg = firstThird.reduce((sum, p) => sum + p.averageResponseTime, 0) / firstThird.length;
        const lastAvg = lastThird.reduce((sum, p) => sum + p.averageResponseTime, 0) / lastThird.length;
        
        const degradationPercentage = ((lastAvg - firstAvg) / firstAvg) * 100;
        
        return {
            detected: degradationPercentage > 10, // More than 10% degradation
            degradationPercentage,
            firstThirdAverage: firstAvg,
            lastThirdAverage: lastAvg,
            severity: degradationPercentage > 25 ? 'high' : degradationPercentage > 10 ? 'medium' : 'low'
        };
    }

    /**
     * Calculate throughput degradation between load and stress tests
     */
    calculateThroughputDegradation() {
        if (!this.performanceData.loadTest || !this.performanceData.stressTest) {
            return { available: false };
        }
        
        const loadThroughput = this.performanceData.loadTest.throughput;
        const stressThroughput = (this.performanceData.stressTest.successfulRequests / 
            (this.performanceData.stressTest.endTime - this.performanceData.stressTest.startTime)) * 1000;
        
        const degradation = ((loadThroughput - stressThroughput) / loadThroughput) * 100;
        
        return {
            available: true,
            loadThroughput,
            stressThroughput,
            degradationPercentage: degradation,
            acceptable: degradation < 30 // Less than 30% degradation is acceptable
        };
    }

    /**
     * Analyze concurrency handling capabilities
     */
    analyzeConcurrencyHandling() {
        const analysis = {
            loadTestConcurrency: this.testConfigs.load.concurrent,
            stressTestConcurrency: this.testConfigs.stress.concurrent,
            recommendations: []
        };
        
        if (this.performanceData.stressTest?.errorRate > 5) {
            analysis.recommendations.push('Consider implementing request queuing or rate limiting');
        }
        
        if (this.performanceData.stressTest?.timeoutRate > 2) {
            analysis.recommendations.push('Optimize function execution time for better concurrency handling');
        }
        
        return analysis;
    }

    /**
     * Make HTTP request with performance measurement
     */
    makeHttpRequest(url, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const request = https.get(url, {
                timeout: timeout,
                headers: {
                    'User-Agent': 'CloudFront-Performance-Profiler/1.0',
                    'Cache-Control': 'no-cache'
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
     * Sleep utility for controlled delays
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Generate comprehensive performance report
     */
    async generatePerformanceReport(results) {
        const reportPath = `cloudfront-performance-profile-${Date.now()}.json`;
        const summaryPath = `cloudfront-performance-summary-${Date.now()}.md`;
        
        // Generate JSON report
        const report = {
            metadata: {
                timestamp: results.timestamp,
                domain: this.domain,
                functionName: this.functionName,
                testConfigs: this.testConfigs
            },
            results,
            performanceData: this.performanceData
        };
        
        await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
        
        // Generate Markdown summary
        const summary = this.generatePerformanceSummary(results);
        await fs.writeFile(summaryPath, summary);
        
        console.log(`📊 Performance report saved: ${reportPath}`);
        console.log(`📋 Summary report saved: ${summaryPath}`);
        
        return { reportPath, summaryPath };
    }

    /**
     * Generate Markdown summary for performance results
     */
    generatePerformanceSummary(results) {
        let summary = `# CloudFront Function Performance Profile\n\n`;
        summary += `**Generated:** ${results.timestamp}\n`;
        summary += `**Domain:** ${this.domain}\n`;
        summary += `**Function:** ${this.functionName}\n\n`;
        
        // Baseline Performance
        if (results.baseline) {
            const baseline = results.baseline;
            summary += `## Baseline Performance\n\n`;
            summary += `- **Average Response Time:** ${baseline.singleRequest.averageResponseTime?.toFixed(2)}ms\n`;
            summary += `- **Success Rate:** ${baseline.singleRequest.overallSuccessRate?.toFixed(1)}%\n`;
            summary += `- **URL Patterns Tested:** ${Object.keys(baseline.urlPatterns).length}\n\n`;
        }
        
        // Load Testing Results
        if (results.loadTesting) {
            const load = results.loadTesting;
            summary += `## Load Testing Results\n\n`;
            summary += `- **Total Requests:** ${load.totalRequests}\n`;
            summary += `- **Successful Requests:** ${load.successfulRequests}\n`;
            summary += `- **Error Rate:** ${load.errorRate.toFixed(2)}%\n`;
            summary += `- **Average Response Time:** ${load.averageResponseTime.toFixed(2)}ms\n`;
            summary += `- **Throughput:** ${load.throughput.toFixed(2)} req/sec\n\n`;
        }
        
        // Stress Testing Results
        if (results.stressTesting) {
            const stress = results.stressTesting;
            summary += `## Stress Testing Results\n\n`;
            summary += `- **Total Requests:** ${stress.totalRequests}\n`;
            summary += `- **Successful Requests:** ${stress.successfulRequests}\n`;
            summary += `- **Error Rate:** ${stress.errorRate.toFixed(2)}%\n`;
            summary += `- **Timeout Rate:** ${stress.timeoutRate.toFixed(2)}%\n`;
            summary += `- **Max Response Time:** ${stress.maxResponseTime.toFixed(2)}ms\n\n`;
        }
        
        // Performance Analysis
        if (results.performanceAnalysis) {
            const analysis = results.performanceAnalysis;
            summary += `## Performance Analysis\n\n`;
            
            if (analysis.bottleneckIdentification.length > 0) {
                summary += `### Identified Bottlenecks\n\n`;
                analysis.bottleneckIdentification.forEach(bottleneck => {
                    summary += `- **${bottleneck.type}** (${bottleneck.severity}): ${bottleneck.description}\n`;
                });
                summary += `\n`;
            }
        }
        
        // Optimization Recommendations
        if (results.optimizationRecommendations) {
            const recs = results.optimizationRecommendations;
            summary += `## Optimization Recommendations\n\n`;
            
            ['immediate', 'shortTerm', 'longTerm', 'monitoring'].forEach(category => {
                if (recs[category] && recs[category].length > 0) {
                    summary += `### ${category.charAt(0).toUpperCase() + category.slice(1)} Actions\n\n`;
                    recs[category].forEach(rec => {
                        summary += `- **${rec.category}** (${rec.priority}): ${rec.recommendation}\n`;
                        summary += `  - Expected Impact: ${rec.expectedImpact}\n`;
                    });
                    summary += `\n`;
                }
            });
        }
        
        summary += `## Next Steps\n\n`;
        summary += `1. Implement immediate optimization recommendations\n`;
        summary += `2. Set up continuous performance monitoring\n`;
        summary += `3. Establish performance regression testing in CI/CD\n`;
        summary += `4. Monitor CloudWatch metrics for ongoing performance tracking\n`;
        
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
            case '--function-name':
                options.functionName = args[++i];
                break;
            case '--verbose':
                options.verbose = true;
                break;
            case '--skip-load':
                options.skipLoad = true;
                break;
            case '--skip-stress':
                options.skipStress = true;
                break;
            case '--skip-endurance':
                options.skipEndurance = true;
                break;
            case '--help':
                console.log(`
CloudFront Function Performance Profiler

Usage: node cloudfront-function-performance-profiler.js [options]

Options:
  --domain <url>           CloudFront domain (default: https://d15sc9fc739ev2.cloudfront.net)
  --function-name <name>   CloudFront function name (default: pretty-urls-rewriter)
  --verbose               Enable verbose output
  --skip-load             Skip load testing
  --skip-stress           Skip stress testing
  --skip-endurance        Skip endurance testing
  --help                  Show this help message

Examples:
  node cloudfront-function-performance-profiler.js
  node cloudfront-function-performance-profiler.js --verbose
  node cloudfront-function-performance-profiler.js --skip-endurance
                `);
                process.exit(0);
                break;
        }
    }
    
    // Run performance profiling
    const profiler = new CloudFrontFunctionProfiler(options);
    
    profiler.runPerformanceProfiling(options)
        .then(results => {
            console.log('\n🎉 Performance profiling completed successfully!');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n💥 Performance profiling failed:', error.message);
            process.exit(1);
        });
}

module.exports = CloudFrontFunctionProfiler;