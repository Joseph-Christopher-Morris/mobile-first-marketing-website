#!/usr/bin/env node

/**
 * CI Fixes Validation Script
 * 
 * This script provides a comprehensive validation of all CI fixes including:
 * 1. Node version consistency checks
 * 2. GitHub Actions workflow validation
 * 3. Lockfile integrity verification
 * 4. Build process testing
 * 5. Git workflow validation
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class CIFixesValidator {
    constructor() {
        this.results = {
            nodeVersion: { passed: false, details: [] },
            workflow: { passed: false, details: [] },
            lockfile: { passed: false, details: [] },
            build: { passed: false, details: [] },
            git: { passed: false, details: [] }
        };
        this.overallPassed = false;
    }

    async run() {
        console.log('🔧 CI Fixes Comprehensive Validation');
        console.log('=' .repeat(50));
        console.log('This script validates all aspects of the CI fixes implementation.');
        console.log('');

        try {
            await this.validateNodeVersionConsistency();
            await this.validateWorkflowConfiguration();
            await this.validateLockfileIntegrity();
            await this.validateBuildProcess();
            await this.validateGitWorkflow();
            
            this.generateFinalReport();
            
            if (this.overallPassed) {
                console.log('\n🎉 All CI Fixes Validation PASSED!');
                console.log('Your CI pipeline should now work correctly.');
                process.exit(0);
            } else {
                console.log('\n❌ CI Fixes Validation FAILED');
                console.log('Please review the issues above and run the validation again.');
                process.exit(1);
            }
            
        } catch (error) {
            console.error('\n💥 Validation Error:', error.message);
            console.log('\nFor troubleshooting help, see: docs/ci-fixes-troubleshooting-guide.md');
            process.exit(1);
        }
    }

    async validateNodeVersionConsistency() {
        console.log('\n1️⃣  Validating Node.js Version Consistency...');
        
        try {
            // Check if the consistency validator exists and run it
            const validatorPath = path.join(__dirname, 'check-node-version-consistency.js');
            if (fs.existsSync(validatorPath)) {
                try {
                    execSync(`node "${validatorPath}"`, { stdio: 'pipe' });
                    this.results.nodeVersion.passed = true;
                    this.results.nodeVersion.details.push('✅ Node version consistency check passed');
                } catch (error) {
                    this.results.nodeVersion.details.push('❌ Node version consistency issues found');
                    this.results.nodeVersion.details.push(`   Error: ${error.message.split('\n')[0]}`);
                }
            } else {
                // Manual checks if validator doesn't exist
                await this.manualNodeVersionCheck();
            }
        } catch (error) {
            this.results.nodeVersion.details.push(`❌ Node version validation failed: ${error.message}`);
        }

        this.logResults('Node Version Consistency', this.results.nodeVersion);
    }

    async manualNodeVersionCheck() {
        // Check local Node version
        const nodeVersion = process.version.replace('v', '');
        const majorVersion = parseInt(nodeVersion.split('.')[0]);
        
        if (majorVersion >= 22) {
            this.results.nodeVersion.details.push(`✅ Local Node.js ${nodeVersion} is compatible`);
        } else {
            this.results.nodeVersion.details.push(`❌ Local Node.js ${nodeVersion} should be upgraded to 22.x`);
        }

        // Check package.json engines
        try {
            const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
            if (packageJson.engines?.node) {
                if (packageJson.engines.node.includes('22')) {
                    this.results.nodeVersion.details.push('✅ package.json engines field specifies Node 22.x');
                    this.results.nodeVersion.passed = true;
                } else {
                    this.results.nodeVersion.details.push(`❌ package.json engines field needs Node 22.x: ${packageJson.engines.node}`);
                }
            } else {
                this.results.nodeVersion.details.push('❌ package.json missing engines field');
            }
        } catch (error) {
            this.results.nodeVersion.details.push('❌ Could not read package.json');
        }
    }

    async validateWorkflowConfiguration() {
        console.log('\n2️⃣  Validating GitHub Actions Workflow...');
        
        try {
            const workflowPath = '.github/workflows/quality-check.yml';
            
            if (!fs.existsSync(workflowPath)) {
                this.results.workflow.details.push('❌ GitHub Actions workflow file not found');
                this.logResults('Workflow Configuration', this.results.workflow);
                return;
            }

            const workflowContent = fs.readFileSync(workflowPath, 'utf8');
            
            // Check for Node 22.19.0
            if (workflowContent.includes('22.19.0')) {
                this.results.workflow.details.push('✅ Workflow uses Node.js 22.19.0');
                this.results.workflow.passed = true;
            } else if (workflowContent.includes('setup-node')) {
                this.results.workflow.details.push('❌ Workflow setup-node found but not using 22.19.0');
            } else {
                this.results.workflow.details.push('❌ No Node.js setup found in workflow');
            }

            // Check for npm caching
            if (workflowContent.includes('cache:') && workflowContent.includes('npm')) {
                this.results.workflow.details.push('✅ npm caching is configured');
            } else {
                this.results.workflow.details.push('⚠️  npm caching not configured (recommended)');
            }

            // Check for environment variables
            if (workflowContent.includes('CI: true') || workflowContent.includes('NEXT_TELEMETRY_DISABLED')) {
                this.results.workflow.details.push('✅ Environment variables configured');
            } else {
                this.results.workflow.details.push('⚠️  Environment variables not configured (recommended)');
            }

        } catch (error) {
            this.results.workflow.details.push(`❌ Workflow validation failed: ${error.message}`);
        }

        this.logResults('Workflow Configuration', this.results.workflow);
    }

    async validateLockfileIntegrity() {
        console.log('\n3️⃣  Validating Lockfile Integrity...');
        
        try {
            // Check if lockfile exists
            if (!fs.existsSync('package-lock.json')) {
                this.results.lockfile.details.push('❌ package-lock.json not found');
                this.logResults('Lockfile Integrity', this.results.lockfile);
                return;
            }

            this.results.lockfile.details.push('✅ package-lock.json exists');

            // Test npm ci
            try {
                execSync('npm ci --dry-run', { 
                    stdio: 'pipe',
                    timeout: 30000 
                });
                this.results.lockfile.details.push('✅ Lockfile integrity check passed');
                this.results.lockfile.passed = true;
            } catch (error) {
                this.results.lockfile.details.push('❌ Lockfile integrity check failed');
                this.results.lockfile.details.push('   💡 Run "npm install" to fix lockfile issues');
                
                if (error.message.includes('@types/node')) {
                    this.results.lockfile.details.push('   💡 @types/node version mismatch detected');
                }
            }

        } catch (error) {
            this.results.lockfile.details.push(`❌ Lockfile validation failed: ${error.message}`);
        }

        this.logResults('Lockfile Integrity', this.results.lockfile);
    }

    async validateBuildProcess() {
        console.log('\n4️⃣  Validating Build Process...');
        
        try {
            // Check if build script exists
            const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
            
            if (!packageJson.scripts?.build) {
                this.results.build.details.push('❌ No build script found in package.json');
                this.logResults('Build Process', this.results.build);
                return;
            }

            this.results.build.details.push('✅ Build script found in package.json');

            // Test build process
            console.log('   Running build test (this may take a moment)...');
            
            try {
                execSync('npm run build', { 
                    stdio: 'pipe',
                    timeout: 120000,  // 2 minutes timeout
                    env: { 
                        ...process.env, 
                        CI: 'true',
                        NEXT_TELEMETRY_DISABLED: '1'
                    }
                });
                
                this.results.build.details.push('✅ Build process completed successfully');
                this.results.build.passed = true;
                
                // Check if build output exists
                if (fs.existsSync('out') || fs.existsSync('.next') || fs.existsSync('dist')) {
                    this.results.build.details.push('✅ Build output directory created');
                }
                
            } catch (error) {
                this.results.build.details.push('❌ Build process failed');
                
                // Try to provide helpful error information
                const errorMsg = error.message.toLowerCase();
                if (errorMsg.includes('node') && errorMsg.includes('version')) {
                    this.results.build.details.push('   💡 Node version compatibility issue detected');
                } else if (errorMsg.includes('lighthouse')) {
                    this.results.build.details.push('   💡 Lighthouse dependency issue detected');
                } else if (errorMsg.includes('vite')) {
                    this.results.build.details.push('   💡 Vite dependency issue detected');
                }
            }

        } catch (error) {
            this.results.build.details.push(`❌ Build validation failed: ${error.message}`);
        }

        this.logResults('Build Process', this.results.build);
    }

    async validateGitWorkflow() {
        console.log('\n5️⃣  Validating Git Workflow...');
        
        try {
            // Check Git configuration
            try {
                const autocrlf = execSync('git config core.autocrlf', { encoding: 'utf8' }).trim();
                if (autocrlf === 'true') {
                    this.results.git.details.push('✅ Git CRLF normalization configured');
                } else {
                    this.results.git.details.push('⚠️  Git CRLF normalization not configured (recommended for Windows)');
                }
            } catch (error) {
                this.results.git.details.push('⚠️  Could not check Git CRLF configuration');
            }

            // Check .gitignore
            if (fs.existsSync('.gitignore')) {
                const gitignoreContent = fs.readFileSync('.gitignore', 'utf8');
                
                const importantPatterns = [
                    'node_modules/',
                    '.next/',
                    'out/',
                    '.env.local'
                ];
                
                let patternsFound = 0;
                importantPatterns.forEach(pattern => {
                    if (gitignoreContent.includes(pattern)) {
                        patternsFound++;
                    }
                });
                
                if (patternsFound >= 3) {
                    this.results.git.details.push('✅ .gitignore has essential patterns');
                    this.results.git.passed = true;
                } else {
                    this.results.git.details.push('⚠️  .gitignore may be missing some essential patterns');
                }
            } else {
                this.results.git.details.push('❌ .gitignore file not found');
            }

            // Check working directory status
            try {
                const status = execSync('git status --porcelain', { encoding: 'utf8' });
                if (status.trim()) {
                    this.results.git.details.push('⚠️  Working directory has uncommitted changes');
                } else {
                    this.results.git.details.push('✅ Working directory is clean');
                }
            } catch (error) {
                this.results.git.details.push('⚠️  Could not check Git status');
            }

        } catch (error) {
            this.results.git.details.push(`❌ Git workflow validation failed: ${error.message}`);
        }

        this.logResults('Git Workflow', this.results.git);
    }

    logResults(section, result) {
        console.log(`\n   ${section}:`);
        result.details.forEach(detail => {
            console.log(`   ${detail}`);
        });
    }

    generateFinalReport() {
        console.log('\n📊 Final Validation Report');
        console.log('=' .repeat(50));
        
        const sections = [
            { name: 'Node Version Consistency', result: this.results.nodeVersion },
            { name: 'Workflow Configuration', result: this.results.workflow },
            { name: 'Lockfile Integrity', result: this.results.lockfile },
            { name: 'Build Process', result: this.results.build },
            { name: 'Git Workflow', result: this.results.git }
        ];

        let passedCount = 0;
        
        sections.forEach(section => {
            const status = section.result.passed ? '✅ PASSED' : '❌ FAILED';
            console.log(`${section.name}: ${status}`);
            if (section.result.passed) passedCount++;
        });

        console.log('\n' + '=' .repeat(50));
        console.log(`Overall: ${passedCount}/${sections.length} sections passed`);
        
        this.overallPassed = passedCount === sections.length;

        if (!this.overallPassed) {
            console.log('\n🔧 Next Steps:');
            
            if (!this.results.nodeVersion.passed) {
                console.log('1. Fix Node.js version consistency issues');
                console.log('   - Update package.json engines field');
                console.log('   - Update GitHub Actions workflow');
                console.log('   - Upgrade local Node.js if needed');
            }
            
            if (!this.results.workflow.passed) {
                console.log('2. Fix GitHub Actions workflow configuration');
                console.log('   - Ensure Node.js 22.19.0 is specified');
                console.log('   - Add npm caching and environment variables');
            }
            
            if (!this.results.lockfile.passed) {
                console.log('3. Fix lockfile integrity issues');
                console.log('   - Run: npm install');
                console.log('   - Commit updated package-lock.json');
            }
            
            if (!this.results.build.passed) {
                console.log('4. Fix build process issues');
                console.log('   - Check dependency compatibility');
                console.log('   - Verify Node.js version requirements');
            }
            
            if (!this.results.git.passed) {
                console.log('5. Fix Git workflow configuration');
                console.log('   - Configure CRLF normalization');
                console.log('   - Update .gitignore patterns');
            }

            console.log('\n📚 For detailed troubleshooting, see:');
            console.log('   docs/ci-fixes-troubleshooting-guide.md');
        } else {
            console.log('\n🎯 Recommended Next Steps:');
            console.log('1. Test the CI workflow with a test commit:');
            console.log('   node scripts/test-commit-workflow.js');
            console.log('');
            console.log('2. Monitor the first few CI runs to ensure stability');
            console.log('');
            console.log('3. Update team documentation with new Node.js requirements');
        }
    }
}

// Run the validator if called directly
if (require.main === module) {
    const validator = new CIFixesValidator();
    validator.run().catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}

module.exports = CIFixesValidator;