#!/usr/bin/env node

/**
 * Node Version Consistency Validator
 * 
 * This script validates Node.js version consistency across:
 * 1. Local environment
 * 2. package.json engines field
 * 3. GitHub Actions workflow
 * 4. Lockfile compatibility
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Try to load js-yaml, fall back to simple parser if not available
let yaml;
try {
    yaml = require('js-yaml');
} catch (error) {
    // Simple YAML parser for basic workflow files
    yaml = {
        load: (content) => {
            const lines = content.split('\n');
            const result = {};
            let currentJob = null;
            let currentSteps = null;
            
            for (const line of lines) {
                if (line.includes('jobs:')) {
                    result.jobs = {};
                } else if (line.match(/^\s+\w+:/) && result.jobs) {
                    const jobName = line.trim().replace(':', '');
                    result.jobs[jobName] = { steps: [] };
                    currentJob = result.jobs[jobName];
                    currentSteps = currentJob.steps;
                } else if (line.includes('- uses:') && line.includes('setup-node')) {
                    const step = { uses: 'setup-node', with: {} };
                    currentSteps?.push(step);
                } else if (line.includes('node-version:') && currentSteps) {
                    const version = line.split(':')[1]?.trim().replace(/['"]/g, '');
                    const lastStep = currentSteps[currentSteps.length - 1];
                    if (lastStep && lastStep.uses === 'setup-node') {
                        lastStep.with = { 'node-version': version };
                    }
                }
            }
            return result;
        }
    };
}

class NodeVersionConsistencyValidator {
    constructor() {
        this.targetNodeVersion = '22.19.0';
        this.targetNpmVersion = '10.8.0';
        this.results = {
            local: null,
            packageJson: null,
            workflow: null,
            lockfile: null,
            dependencies: null
        };
    }

    async run() {
        console.log('🔍 Node.js Version Consistency Validation');
        console.log('=' .repeat(50));

        try {
            await this.checkLocalEnvironment();
            await this.checkPackageJson();
            await this.checkWorkflowConfiguration();
            await this.checkLockfileConsistency();
            await this.checkDependencyCompatibility();
            
            this.generateReport();
            
            if (this.hasErrors()) {
                console.log('\n❌ Node Version Consistency Validation FAILED');
                process.exit(1);
            } else {
                console.log('\n✅ Node Version Consistency Validation PASSED');
            }
            
        } catch (error) {
            console.error('\n💥 Validation Error:', error.message);
            process.exit(1);
        }
    }

    async checkLocalEnvironment() {
        console.log('\n📍 Checking Local Environment...');
        
        try {
            // Check Node.js version
            const nodeVersion = process.version.replace('v', '');
            this.results.local = {
                nodeVersion,
                npmVersion: null,
                compatible: this.isVersionCompatible(nodeVersion, this.targetNodeVersion)
            };

            console.log(`Current Node.js: ${nodeVersion}`);
            
            // Check npm version
            try {
                const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
                this.results.local.npmVersion = npmVersion;
                console.log(`Current npm: ${npmVersion}`);
            } catch (error) {
                console.warn('⚠️  Could not determine npm version');
            }

            if (this.results.local.compatible) {
                console.log('✅ Local Node.js version is compatible');
            } else {
                console.log(`❌ Local Node.js version ${nodeVersion} is not compatible with target ${this.targetNodeVersion}`);
            }

        } catch (error) {
            throw new Error(`Failed to check local environment: ${error.message}`);
        }
    }

    async checkPackageJson() {
        console.log('\n📦 Checking package.json...');
        
        try {
            const packagePath = path.join(process.cwd(), 'package.json');
            if (!fs.existsSync(packagePath)) {
                throw new Error('package.json not found');
            }

            const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
            
            this.results.packageJson = {
                hasEngines: !!packageJson.engines,
                nodeRequirement: packageJson.engines?.node || null,
                npmRequirement: packageJson.engines?.npm || null,
                valid: false
            };

            if (!packageJson.engines) {
                console.log('❌ No engines field found in package.json');
                return;
            }

            console.log(`Engines field found:`);
            console.log(`  Node: ${packageJson.engines.node || 'not specified'}`);
            console.log(`  npm: ${packageJson.engines.npm || 'not specified'}`);

            // Validate Node requirement
            const nodeReq = packageJson.engines.node;
            if (!nodeReq) {
                console.log('❌ Node.js version not specified in engines field');
            } else if (nodeReq.includes('>=22.19.0') || nodeReq.includes('^22.19.0')) {
                console.log('✅ Node.js requirement is compatible');
                this.results.packageJson.valid = true;
            } else {
                console.log(`❌ Node.js requirement "${nodeReq}" may not be compatible with ${this.targetNodeVersion}`);
            }

            // Validate npm requirement
            const npmReq = packageJson.engines.npm;
            if (npmReq && (npmReq.includes('>=10.8.0') || npmReq.includes('^10.8.0'))) {
                console.log('✅ npm requirement is compatible');
            } else if (npmReq) {
                console.log(`⚠️  npm requirement "${npmReq}" may need verification`);
            }

        } catch (error) {
            throw new Error(`Failed to check package.json: ${error.message}`);
        }
    }

    async checkWorkflowConfiguration() {
        console.log('\n⚙️  Checking GitHub Actions Workflow...');
        
        try {
            const workflowPath = path.join(process.cwd(), '.github/workflows/quality-check.yml');
            if (!fs.existsSync(workflowPath)) {
                console.log('❌ GitHub Actions workflow file not found');
                this.results.workflow = { exists: false };
                return;
            }

            const workflowContent = fs.readFileSync(workflowPath, 'utf8');
            const workflow = yaml.load(workflowContent);

            this.results.workflow = {
                exists: true,
                nodeVersion: null,
                valid: false
            };

            // Look for Node.js version in setup-node action
            const jobs = workflow.jobs || {};
            let foundNodeVersion = null;

            for (const [jobName, job] of Object.entries(jobs)) {
                const steps = job.steps || [];
                for (const step of steps) {
                    if (step.uses && step.uses.includes('setup-node')) {
                        const nodeVersion = step.with?.['node-version'];
                        if (nodeVersion) {
                            foundNodeVersion = nodeVersion;
                            break;
                        }
                    }
                }
                if (foundNodeVersion) break;
            }

            if (foundNodeVersion) {
                this.results.workflow.nodeVersion = foundNodeVersion;
                console.log(`Found Node.js version in workflow: ${foundNodeVersion}`);
                
                if (foundNodeVersion === this.targetNodeVersion || foundNodeVersion === '22.19.0') {
                    console.log('✅ Workflow Node.js version is correct');
                    this.results.workflow.valid = true;
                } else {
                    console.log(`❌ Workflow Node.js version "${foundNodeVersion}" does not match target "${this.targetNodeVersion}"`);
                }
            } else {
                console.log('❌ No Node.js version found in workflow');
            }

        } catch (error) {
            console.error(`Failed to check workflow: ${error.message}`);
            this.results.workflow = { exists: false, error: error.message };
        }
    }

    async checkLockfileConsistency() {
        console.log('\n🔒 Checking Lockfile Consistency...');
        
        try {
            const lockfilePath = path.join(process.cwd(), 'package-lock.json');
            if (!fs.existsSync(lockfilePath)) {
                console.log('❌ package-lock.json not found');
                this.results.lockfile = { exists: false };
                return;
            }

            this.results.lockfile = {
                exists: true,
                consistent: false,
                error: null
            };

            // Test npm ci to check lockfile consistency
            console.log('Testing lockfile consistency with npm ci...');
            
            try {
                // Run npm ci in a way that doesn't modify files
                execSync('npm ci --dry-run', { 
                    stdio: 'pipe',
                    timeout: 30000 
                });
                
                console.log('✅ Lockfile is consistent');
                this.results.lockfile.consistent = true;
                
            } catch (error) {
                console.log('❌ Lockfile consistency check failed');
                this.results.lockfile.error = error.message;
                
                // Try to get more specific error information
                if (error.message.includes('package-lock.json')) {
                    console.log('💡 Suggestion: Run "npm install" to fix lockfile inconsistencies');
                }
            }

        } catch (error) {
            console.error(`Failed to check lockfile: ${error.message}`);
            this.results.lockfile = { exists: false, error: error.message };
        }
    }

    async checkDependencyCompatibility() {
        console.log('\n🔗 Checking Dependency Compatibility...');
        
        try {
            const packagePath = path.join(process.cwd(), 'package.json');
            const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
            
            const criticalDeps = {
                'lighthouse': '13',
                'vite': '7.1.7',
                '@types/node': '22'
            };

            this.results.dependencies = {
                compatible: true,
                issues: []
            };

            console.log('Checking critical dependencies:');
            
            const allDeps = {
                ...packageJson.dependencies,
                ...packageJson.devDependencies
            };

            for (const [depName, expectedVersion] of Object.entries(criticalDeps)) {
                const installedVersion = allDeps[depName];
                
                if (installedVersion) {
                    console.log(`  ${depName}: ${installedVersion}`);
                    
                    // Basic version compatibility check
                    if (depName === 'lighthouse' && !installedVersion.includes('13')) {
                        this.results.dependencies.issues.push(`${depName} version may not be compatible with Node 22.19.0`);
                        this.results.dependencies.compatible = false;
                    }
                } else {
                    console.log(`  ${depName}: not installed`);
                }
            }

            if (this.results.dependencies.compatible) {
                console.log('✅ Critical dependencies appear compatible');
            } else {
                console.log('❌ Some dependency compatibility issues found');
                this.results.dependencies.issues.forEach(issue => {
                    console.log(`  - ${issue}`);
                });
            }

        } catch (error) {
            console.error(`Failed to check dependencies: ${error.message}`);
            this.results.dependencies = { compatible: false, error: error.message };
        }
    }

    isVersionCompatible(current, target) {
        // Simple version comparison - checks if major version matches
        const currentMajor = current.split('.')[0];
        const targetMajor = target.split('.')[0];
        return currentMajor === targetMajor;
    }

    hasErrors() {
        return (
            (this.results.local && !this.results.local.compatible) ||
            (this.results.packageJson && !this.results.packageJson.valid) ||
            (this.results.workflow && !this.results.workflow.valid) ||
            (this.results.lockfile && !this.results.lockfile.consistent) ||
            (this.results.dependencies && !this.results.dependencies.compatible)
        );
    }

    generateReport() {
        console.log('\n📊 Consistency Report');
        console.log('=' .repeat(30));
        
        // Local Environment
        console.log('\n🖥️  Local Environment:');
        if (this.results.local) {
            console.log(`  Node.js: ${this.results.local.nodeVersion} ${this.results.local.compatible ? '✅' : '❌'}`);
            console.log(`  npm: ${this.results.local.npmVersion || 'unknown'}`);
        }

        // Package.json
        console.log('\n📦 package.json:');
        if (this.results.packageJson) {
            console.log(`  Engines field: ${this.results.packageJson.hasEngines ? '✅' : '❌'}`);
            console.log(`  Node requirement: ${this.results.packageJson.nodeRequirement || 'not set'}`);
            console.log(`  Valid: ${this.results.packageJson.valid ? '✅' : '❌'}`);
        }

        // Workflow
        console.log('\n⚙️  GitHub Actions:');
        if (this.results.workflow) {
            console.log(`  Workflow exists: ${this.results.workflow.exists ? '✅' : '❌'}`);
            if (this.results.workflow.exists) {
                console.log(`  Node version: ${this.results.workflow.nodeVersion || 'not found'}`);
                console.log(`  Valid: ${this.results.workflow.valid ? '✅' : '❌'}`);
            }
        }

        // Lockfile
        console.log('\n🔒 Lockfile:');
        if (this.results.lockfile) {
            console.log(`  Exists: ${this.results.lockfile.exists ? '✅' : '❌'}`);
            if (this.results.lockfile.exists) {
                console.log(`  Consistent: ${this.results.lockfile.consistent ? '✅' : '❌'}`);
            }
        }

        // Dependencies
        console.log('\n🔗 Dependencies:');
        if (this.results.dependencies) {
            console.log(`  Compatible: ${this.results.dependencies.compatible ? '✅' : '❌'}`);
            if (this.results.dependencies.issues && this.results.dependencies.issues.length > 0) {
                console.log('  Issues:');
                this.results.dependencies.issues.forEach(issue => {
                    console.log(`    - ${issue}`);
                });
            }
        }

        // Recommendations
        console.log('\n💡 Recommendations:');
        if (!this.results.local?.compatible) {
            console.log('  - Upgrade local Node.js to 22.19.0 or later');
        }
        if (!this.results.packageJson?.valid) {
            console.log('  - Update package.json engines field to specify Node >=22.19.0');
        }
        if (!this.results.workflow?.valid) {
            console.log('  - Update GitHub Actions workflow to use Node 22.19.0');
        }
        if (!this.results.lockfile?.consistent) {
            console.log('  - Run "npm install" to fix lockfile inconsistencies');
        }
        if (!this.results.dependencies?.compatible) {
            console.log('  - Review and update incompatible dependencies');
        }
    }
}



// Run the validator if called directly
if (require.main === module) {
    const validator = new NodeVersionConsistencyValidator();
    validator.run().catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}

module.exports = NodeVersionConsistencyValidator;