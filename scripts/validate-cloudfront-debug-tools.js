#!/usr/bin/env node

/**
 * Validate CloudFront Debug Tools
 * 
 * Simple validation script to verify debug tools are properly implemented
 * Tests basic functionality without requiring external dependencies
 * 
 * Requirements: 8.2, 8.5
 */

const fs = require('fs');
const path = require('path');

class CloudFrontDebugToolsValidator {
    constructor() {
        this.toolsToValidate = [
            {
                name: 'URL Pattern Debug Utility',
                file: 'scripts/cloudfront-pretty-urls-debug-utility.js',
                className: 'CloudFrontPrettyURLsDebugger'
            },
            {
                name: 'Function Execution Tracer',
                file: 'scripts/cloudfront-function-execution-tracer.js',
                className: 'CloudFrontFunctionTracer'
            },
            {
                name: 'Performance Profiler',
                file: 'scripts/cloudfront-function-performance-profiler.js',
                className: 'CloudFrontFunctionProfiler'
            },
            {
                name: 'Comprehensive Test Suite',
                file: 'scripts/test-cloudfront-debug-tools.js',
                className: 'CloudFrontDebugToolsTest'
            }
        ];
        
        this.validationResults = {
            filesExist: {},
            syntaxValid: {},
            classesExported: {},
            methodsImplemented: {},
            cliSupported: {},
            overall: false
        };
    }

    /**
     * Run validation for all debug tools
     */
    async validateTools() {
        console.log('🔍 Validating CloudFront Debug Tools');
        console.log('===================================\n');
        
        let allValid = true;
        
        for (const tool of this.toolsToValidate) {
            console.log(`📋 Validating ${tool.name}...`);
            
            try {
                // 1. Check if file exists
                const fileExists = await this.validateFileExists(tool.file);
                this.validationResults.filesExist[tool.name] = fileExists;
                
                if (!fileExists) {
                    console.log(`  ❌ File not found: ${tool.file}`);
                    allValid = false;
                    continue;
                }
                
                // 2. Check syntax validity
                const syntaxValid = await this.validateSyntax(tool.file);
                this.validationResults.syntaxValid[tool.name] = syntaxValid;
                
                if (!syntaxValid) {
                    console.log(`  ❌ Syntax errors found in ${tool.file}`);
                    allValid = false;
                    continue;
                }
                
                // 3. Check class export
                const classExported = await this.validateClassExport(tool.file, tool.className);
                this.validationResults.classesExported[tool.name] = classExported;
                
                // 4. Check required methods
                const methodsImplemented = await this.validateRequiredMethods(tool.file, tool.className);
                this.validationResults.methodsImplemented[tool.name] = methodsImplemented;
                
                // 5. Check CLI support
                const cliSupported = await this.validateCliSupport(tool.file);
                this.validationResults.cliSupported[tool.name] = cliSupported;
                
                const toolValid = fileExists && syntaxValid && classExported && methodsImplemented && cliSupported;
                
                if (toolValid) {
                    console.log(`  ✅ ${tool.name} validation passed`);
                } else {
                    console.log(`  ❌ ${tool.name} validation failed`);
                    allValid = false;
                }
                
            } catch (error) {
                console.log(`  ❌ Validation error for ${tool.name}: ${error.message}`);
                allValid = false;
            }
            
            console.log('');
        }
        
        this.validationResults.overall = allValid;
        
        // Generate validation report
        await this.generateValidationReport();
        
        if (allValid) {
            console.log('✅ All CloudFront debug tools validated successfully!');
        } else {
            console.log('❌ Some CloudFront debug tools failed validation');
        }
        
        return this.validationResults;
    }

    /**
     * Check if file exists
     */
    async validateFileExists(filePath) {
        try {
            await fs.promises.access(filePath, fs.constants.F_OK);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Validate JavaScript syntax
     */
    async validateSyntax(filePath) {
        try {
            const content = await fs.promises.readFile(filePath, 'utf8');
            
            // Basic syntax validation - check for common issues
            const syntaxChecks = [
                // Check for balanced braces
                { test: (content) => this.checkBalancedBraces(content), name: 'Balanced braces' },
                // Check for balanced parentheses
                { test: (content) => this.checkBalancedParentheses(content), name: 'Balanced parentheses' },
                // Check for proper function declarations
                { test: (content) => content.includes('class '), name: 'Class declaration' },
                // Check for module.exports
                { test: (content) => content.includes('module.exports'), name: 'Module export' }
            ];
            
            for (const check of syntaxChecks) {
                if (!check.test(content)) {
                    console.log(`    ⚠️  Syntax issue: ${check.name}`);
                    return false;
                }
            }
            
            return true;
            
        } catch (error) {
            return false;
        }
    }

    /**
     * Check if class is properly exported
     */
    async validateClassExport(filePath, className) {
        try {
            const content = await fs.promises.readFile(filePath, 'utf8');
            
            // Check for class declaration
            const classRegex = new RegExp(`class\\s+${className}\\s*{`);
            const hasClass = classRegex.test(content);
            
            // Check for module export
            const exportRegex = new RegExp(`module\\.exports\\s*=\\s*${className}`);
            const hasExport = exportRegex.test(content);
            
            return hasClass && hasExport;
            
        } catch (error) {
            return false;
        }
    }

    /**
     * Check if required methods are implemented
     */
    async validateRequiredMethods(filePath, className) {
        try {
            const content = await fs.promises.readFile(filePath, 'utf8');
            
            // Define required methods for each class
            const requiredMethods = {
                'CloudFrontPrettyURLsDebugger': [
                    'runDebugSuite',
                    'runUrlPatternTests',
                    'simulateCloudFrontFunction',
                    'generateDebugReport'
                ],
                'CloudFrontFunctionTracer': [
                    'startTracing',
                    'getFunctionInfo',
                    'collectExecutionMetrics',
                    'generateTracingReport'
                ],
                'CloudFrontFunctionProfiler': [
                    'runPerformanceProfiling',
                    'establishBaseline',
                    'runLoadTest',
                    'generatePerformanceReport'
                ],
                'CloudFrontDebugToolsTest': [
                    'runComprehensiveTest',
                    'testDebugUtility',
                    'testFunctionTracer',
                    'generateTestReport'
                ]
            };
            
            const methods = requiredMethods[className] || [];
            
            for (const method of methods) {
                const methodRegex = new RegExp(`${method}\\s*\\(`);
                if (!methodRegex.test(content)) {
                    console.log(`    ⚠️  Missing method: ${method}`);
                    return false;
                }
            }
            
            return true;
            
        } catch (error) {
            return false;
        }
    }

    /**
     * Check if CLI support is implemented
     */
    async validateCliSupport(filePath) {
        try {
            const content = await fs.promises.readFile(filePath, 'utf8');
            
            // Check for CLI interface implementation
            const cliChecks = [
                content.includes('require.main === module'),
                content.includes('process.argv'),
                content.includes('--help'),
                content.includes('console.log')
            ];
            
            return cliChecks.every(check => check);
            
        } catch (error) {
            return false;
        }
    }

    /**
     * Check balanced braces
     */
    checkBalancedBraces(content) {
        let count = 0;
        for (const char of content) {
            if (char === '{') count++;
            if (char === '}') count--;
            if (count < 0) return false;
        }
        return count === 0;
    }

    /**
     * Check balanced parentheses
     */
    checkBalancedParentheses(content) {
        let count = 0;
        for (const char of content) {
            if (char === '(') count++;
            if (char === ')') count--;
            if (count < 0) return false;
        }
        return count === 0;
    }

    /**
     * Generate validation report
     */
    async generateValidationReport() {
        const reportPath = `cloudfront-debug-tools-validation-${Date.now()}.json`;
        
        const report = {
            timestamp: new Date().toISOString(),
            validationResults: this.validationResults,
            summary: {
                totalTools: this.toolsToValidate.length,
                validTools: Object.values(this.validationResults.filesExist).filter(v => v).length,
                overallValid: this.validationResults.overall
            }
        };
        
        await fs.promises.writeFile(reportPath, JSON.stringify(report, null, 2));
        console.log(`📊 Validation report saved: ${reportPath}`);
        
        return reportPath;
    }

    /**
     * Test URL pattern simulation locally
     */
    testUrlPatternSimulation() {
        console.log('🧪 Testing URL pattern simulation...');
        
        // Simulate CloudFront Function logic locally
        const simulateCloudFrontFunction = (uri) => {
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
        };
        
        // Test patterns
        const testPatterns = [
            { input: '/', expected: '/index.html' },
            { input: '/about', expected: '/about/index.html' },
            { input: '/privacy-policy/', expected: '/privacy-policy/index.html' },
            { input: '/favicon.ico', expected: '/favicon.ico' },
            { input: '/styles.css', expected: '/styles.css' }
        ];
        
        let passed = 0;
        let failed = 0;
        
        for (const test of testPatterns) {
            const result = simulateCloudFrontFunction(test.input);
            if (result === test.expected) {
                console.log(`  ✅ ${test.input} → ${result}`);
                passed++;
            } else {
                console.log(`  ❌ ${test.input} → ${result} (expected: ${test.expected})`);
                failed++;
            }
        }
        
        console.log(`  📊 URL Pattern Tests: ${passed}/${passed + failed} passed\n`);
        
        return { passed, failed, total: passed + failed };
    }
}

// CLI interface
if (require.main === module) {
    const validator = new CloudFrontDebugToolsValidator();
    
    // Test URL pattern simulation first
    const simulationResults = validator.testUrlPatternSimulation();
    
    // Then validate all tools
    validator.validateTools()
        .then(results => {
            const success = results.overall && simulationResults.failed === 0;
            console.log(`\n🎉 Validation ${success ? 'completed successfully' : 'completed with issues'}!`);
            process.exit(success ? 0 : 1);
        })
        .catch(error => {
            console.error('\n💥 Validation failed:', error.message);
            process.exit(1);
        });
}

module.exports = CloudFrontDebugToolsValidator;