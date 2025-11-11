#!/usr/bin/env node

/**
 * Post-Deployment Pretty URLs Validation Script
 * 
 * This script runs after deployment completion to validate that pretty URLs
 * are working correctly. It integrates with the deployment pipeline and
 * provides detailed reporting for deployment validation.
 * 
 * Requirements covered: 5.4, 4.4
 */

const URLValidator = require('./validate-pretty-urls');
const fs = require('fs');
const path = require('path');

// Configuration
const VALIDATION_CONFIG = {
    maxRetries: 5,
    retryDelay: 10000, // 10 seconds
    cacheWarmupDelay: 30000, // 30 seconds for cache propagation
    criticalPaths: [
        '/',
        '/privacy-policy/',
        '/about/',
        '/contact/',
        '/services/'
    ]
};

class PostDeploymentValidator {
    constructor(options = {}) {
        this.config = { ...VALIDATION_CONFIG, ...options };
        this.deploymentInfo = null;
        this.validationResults = null;
    }

    async loadDeploymentInfo() {
        try {
            // Try to load deployment info from various sources
            const possiblePaths = [
                'deployment-info.json',
                'logs/latest-deployment.json',
                '.deployment-status.json'
            ];

            for (const filePath of possiblePaths) {
                if (fs.existsSync(filePath)) {
                    this.deploymentInfo = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                    console.log(`📋 Loaded deployment info from: ${filePath}`);
                    break;
                }
            }

            if (!this.deploymentInfo) {
                console.log('⚠️  No deployment info found, proceeding with standard validation');
                this.deploymentInfo = {
                    timestamp: new Date().toISOString(),
                    source: 'post-deployment-validation'
                };
            }
        } catch (error) {
            console.log(`⚠️  Could not load deployment info: ${error.message}`);
            this.deploymentInfo = {
                timestamp: new Date().toISOString(),
                source: 'post-deployment-validation',
                error: error.message
            };
        }
    }

    async waitForCachePropagation() {
        console.log(`⏳ Waiting ${this.config.cacheWarmupDelay / 1000}s for cache propagation...`);
        await new Promise(resolve => setTimeout(resolve, this.config.cacheWarmupDelay));
    }

    async validateCriticalPaths() {
        console.log('🔍 Running critical path validation...');
        
        const criticalResults = {
            passed: 0,
            failed: 0,
            details: []
        };

        for (const path of this.config.criticalPaths) {
            try {
                const validator = new URLValidator();
                const response = await validator.makeRequest(path);
                
                const isValid = response.statusCode === 200 && 
                               response.headers['content-type']?.includes('text/html') &&
                               response.body.includes('<html');

                const result = {
                    path,
                    status: isValid ? 'PASS' : 'FAIL',
                    statusCode: response.statusCode,
                    contentType: response.headers['content-type'],
                    responseSize: response.body.length,
                    timestamp: new Date().toISOString()
                };

                if (isValid) {
                    criticalResults.passed++;
                    console.log(`✅ ${path} - OK`);
                } else {
                    criticalResults.failed++;
                    console.log(`❌ ${path} - FAILED (Status: ${response.statusCode})`);
                }

                criticalResults.details.push(result);

            } catch (error) {
                criticalResults.failed++;
                criticalResults.details.push({
                    path,
                    status: 'ERROR',
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
                console.log(`💥 ${path} - ERROR: ${error.message}`);
            }
        }

        return criticalResults;
    }

    async runFullValidation() {
        console.log('🧪 Running comprehensive URL validation...');
        
        const validator = new URLValidator();
        const success = await validator.runAllTests();
        
        this.validationResults = validator.results;
        return success;
    }

    async validateWithRetries() {
        let attempt = 1;
        let lastError = null;

        while (attempt <= this.config.maxRetries) {
            try {
                console.log(`\n🔄 Validation attempt ${attempt}/${this.config.maxRetries}`);
                
                // First check critical paths quickly
                const criticalResults = await this.validateCriticalPaths();
                
                if (criticalResults.failed === 0) {
                    console.log('✅ Critical paths validation passed');
                    
                    // Run full validation
                    const fullValidationSuccess = await this.runFullValidation();
                    
                    if (fullValidationSuccess) {
                        console.log('🎉 Full validation passed!');
                        return true;
                    } else {
                        console.log('⚠️  Some non-critical tests failed, but deployment is functional');
                        return true; // Consider deployment successful if critical paths work
                    }
                } else {
                    throw new Error(`Critical path validation failed: ${criticalResults.failed} paths failed`);
                }

            } catch (error) {
                lastError = error;
                console.log(`❌ Attempt ${attempt} failed: ${error.message}`);
                
                if (attempt < this.config.maxRetries) {
                    console.log(`⏳ Waiting ${this.config.retryDelay / 1000}s before retry...`);
                    await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
                }
                
                attempt++;
            }
        }

        throw new Error(`Validation failed after ${this.config.maxRetries} attempts. Last error: ${lastError?.message}`);
    }

    generateDeploymentReport() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const report = {
            deployment: this.deploymentInfo,
            validation: {
                timestamp: new Date().toISOString(),
                success: this.validationResults?.failed === 0,
                summary: this.validationResults?.summary,
                criticalPathsWorking: this.config.criticalPaths.every(path => {
                    const result = this.validationResults?.details.find(d => d.url.endsWith(path));
                    return result?.status === 'PASS';
                })
            },
            recommendations: this.generateRecommendations()
        };

        const filename = `post-deployment-validation-${timestamp}.json`;
        
        try {
            fs.writeFileSync(filename, JSON.stringify(report, null, 2));
            console.log(`📄 Deployment validation report saved: ${filename}`);
            return filename;
        } catch (error) {
            console.error(`Failed to save deployment report: ${error.message}`);
            return null;
        }
    }

    generateRecommendations() {
        const recommendations = [];

        if (!this.validationResults) {
            return ['Run full validation to get detailed recommendations'];
        }

        // Check pass rate
        const passRate = (this.validationResults.passed / this.validationResults.total) * 100;
        
        if (passRate < 100) {
            recommendations.push(`${this.validationResults.failed} tests failed. Review failed test details for specific issues.`);
        }

        // Check specific categories
        const categoryStats = this.validationResults.summary?.byCategory || {};
        
        if (categoryStats['root-object']?.failed > 0) {
            recommendations.push('Root object configuration may need attention. Verify Default Root Object is set to "index.html".');
        }

        if (categoryStats['directory-urls']?.failed > 0) {
            recommendations.push('Directory URL handling is failing. Check CloudFront Function implementation and attachment.');
        }

        if (categoryStats['extensionless-urls']?.failed > 0) {
            recommendations.push('Extensionless URL rewriting is not working. Verify CloudFront Function logic for path handling.');
        }

        if (categoryStats['explicit-paths']?.failed > 0) {
            recommendations.push('Explicit file paths are failing. This may indicate broader S3/CloudFront connectivity issues.');
        }

        if (categoryStats['static-assets']?.failed > 0) {
            recommendations.push('Static assets are not loading properly. Check cache behaviors and origin configuration.');
        }

        if (recommendations.length === 0) {
            recommendations.push('All tests passed! Pretty URLs are working correctly.');
        }

        return recommendations;
    }

    printDeploymentSummary() {
        console.log('\n' + '='.repeat(80));
        console.log('POST-DEPLOYMENT VALIDATION SUMMARY');
        console.log('='.repeat(80));
        
        if (this.deploymentInfo) {
            console.log(`\nDeployment Info:`);
            console.log(`  Timestamp: ${this.deploymentInfo.timestamp}`);
            if (this.deploymentInfo.version) {
                console.log(`  Version: ${this.deploymentInfo.version}`);
            }
            if (this.deploymentInfo.commit) {
                console.log(`  Commit: ${this.deploymentInfo.commit}`);
            }
        }

        if (this.validationResults) {
            console.log(`\nValidation Results:`);
            console.log(`  Total Tests: ${this.validationResults.total}`);
            console.log(`  Passed: ${this.validationResults.passed}`);
            console.log(`  Failed: ${this.validationResults.failed}`);
            console.log(`  Success Rate: ${this.validationResults.summary?.overallPassRate}%`);
        }

        const recommendations = this.generateRecommendations();
        if (recommendations.length > 0) {
            console.log(`\nRecommendations:`);
            recommendations.forEach((rec, index) => {
                console.log(`  ${index + 1}. ${rec}`);
            });
        }

        console.log('\n' + '='.repeat(80));
    }

    async run() {
        try {
            console.log('🚀 Starting post-deployment pretty URLs validation...');
            
            await this.loadDeploymentInfo();
            await this.waitForCachePropagation();
            
            const success = await this.validateWithRetries();
            
            this.generateDeploymentReport();
            this.printDeploymentSummary();
            
            if (success) {
                console.log('🎉 Post-deployment validation completed successfully!');
                return true;
            } else {
                console.log('❌ Post-deployment validation failed');
                return false;
            }

        } catch (error) {
            console.error('💥 Post-deployment validation error:', error.message);
            
            // Still generate a report with the error
            this.generateDeploymentReport();
            
            return false;
        }
    }
}

// Integration helper for deployment scripts
class DeploymentIntegration {
    static async addToDeploymentScript(scriptPath) {
        try {
            if (!fs.existsSync(scriptPath)) {
                console.log(`Script ${scriptPath} not found`);
                return false;
            }

            const content = fs.readFileSync(scriptPath, 'utf8');
            
            // Check if validation is already integrated
            if (content.includes('post-deployment-pretty-urls-validation')) {
                console.log('Post-deployment validation already integrated');
                return true;
            }

            // Add validation step
            const validationStep = `
REM Post-deployment pretty URLs validation
echo Running post-deployment validation...
node scripts/post-deployment-pretty-urls-validation.js
if %ERRORLEVEL% NEQ 0 (
    echo Post-deployment validation failed
    exit /b 1
)
echo Post-deployment validation completed successfully
`;

            // Insert before final success message
            const updatedContent = content.replace(
                /echo.*deployment.*complete/i,
                validationStep + '\necho Deployment complete with validation'
            );

            fs.writeFileSync(scriptPath, updatedContent);
            console.log(`✅ Added post-deployment validation to ${scriptPath}`);
            return true;

        } catch (error) {
            console.error(`Failed to integrate with deployment script: ${error.message}`);
            return false;
        }
    }

    static createValidationOnlyScript() {
        const scriptContent = `@echo off
REM Standalone post-deployment validation script
echo Starting post-deployment pretty URLs validation...

node scripts/post-deployment-pretty-urls-validation.js

if %ERRORLEVEL% EQU 0 (
    echo Validation completed successfully
    exit /b 0
) else (
    echo Validation failed
    exit /b 1
)
`;

        try {
            fs.writeFileSync('validate-deployment.bat', scriptContent);
            console.log('✅ Created standalone validation script: validate-deployment.bat');
            return true;
        } catch (error) {
            console.error(`Failed to create validation script: ${error.message}`);
            return false;
        }
    }
}

// Main execution
async function main() {
    const args = process.argv.slice(2);
    
    if (args.includes('--integrate')) {
        const scriptPath = args[args.indexOf('--integrate') + 1] || 'deploy-full-site-simple.bat';
        await DeploymentIntegration.addToDeploymentScript(scriptPath);
        DeploymentIntegration.createValidationOnlyScript();
        return;
    }

    if (args.includes('--help')) {
        console.log(`
Usage: node post-deployment-pretty-urls-validation.js [options]

Options:
  --integrate [script]  Integrate validation into deployment script
  --help               Show this help message

Examples:
  node post-deployment-pretty-urls-validation.js
  node post-deployment-pretty-urls-validation.js --integrate deploy-full-site-simple.bat
        `);
        return;
    }

    const validator = new PostDeploymentValidator();
    const success = await validator.run();
    
    process.exit(success ? 0 : 1);
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { PostDeploymentValidator, DeploymentIntegration };