#!/usr/bin/env node

/**
 * CI Validation Suite Runner
 * 
 * This script runs the complete suite of CI validation procedures:
 * 1. Node version consistency validation
 * 2. CI fixes comprehensive validation
 * 3. Optional test commit workflow (with user confirmation)
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

class CIValidationSuite {
    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    async run() {
        console.log('🧪 CI Validation Suite');
        console.log('=' .repeat(40));
        console.log('This suite will run all CI validation procedures to ensure');
        console.log('your GitHub Actions workflow is properly configured.\n');

        try {
            await this.runNodeVersionCheck();
            await this.runCIFixesValidation();
            await this.askForTestCommit();
            
            console.log('\n🎉 CI Validation Suite Complete!');
            console.log('\nYour CI pipeline should now be working correctly.');
            console.log('Monitor your next few commits to ensure everything is stable.');
            
        } catch (error) {
            console.error('\n❌ CI Validation Suite Failed:', error.message);
            console.log('\nFor troubleshooting help, see: docs/ci-fixes-troubleshooting-guide.md');
            process.exit(1);
        } finally {
            this.rl.close();
        }
    }

    async runNodeVersionCheck() {
        console.log('\n1️⃣  Running Node Version Consistency Check...');
        console.log('-' .repeat(50));
        
        const scriptPath = path.join(__dirname, 'check-node-version-consistency.js');
        
        if (!fs.existsSync(scriptPath)) {
            console.log('⚠️  Node version consistency script not found, skipping...');
            return;
        }

        try {
            const output = execSync(`node "${scriptPath}"`, { 
                encoding: 'utf8',
                stdio: 'pipe'
            });
            
            console.log(output);
            console.log('✅ Node version consistency check completed');
            
        } catch (error) {
            console.log('❌ Node version consistency issues found:');
            console.log(error.stdout || error.message);
            
            const shouldContinue = await this.askQuestion(
                '\nDo you want to continue with the validation suite despite these issues? (y/N): '
            );
            
            if (!shouldContinue.toLowerCase().startsWith('y')) {
                throw new Error('Node version consistency issues must be resolved first');
            }
        }
    }

    async runCIFixesValidation() {
        console.log('\n2️⃣  Running Comprehensive CI Fixes Validation...');
        console.log('-' .repeat(50));
        
        const scriptPath = path.join(__dirname, 'validate-ci-fixes.js');
        
        if (!fs.existsSync(scriptPath)) {
            console.log('⚠️  CI fixes validation script not found, skipping...');
            return;
        }

        try {
            const output = execSync(`node "${scriptPath}"`, { 
                encoding: 'utf8',
                stdio: 'pipe'
            });
            
            console.log(output);
            console.log('✅ CI fixes validation completed successfully');
            
        } catch (error) {
            console.log('❌ CI fixes validation found issues:');
            console.log(error.stdout || error.message);
            
            const shouldContinue = await this.askQuestion(
                '\nDo you want to continue despite these validation failures? (y/N): '
            );
            
            if (!shouldContinue.toLowerCase().startsWith('y')) {
                throw new Error('CI fixes validation issues must be resolved first');
            }
        }
    }

    async askForTestCommit() {
        console.log('\n3️⃣  Test Commit Workflow (Optional)');
        console.log('-' .repeat(50));
        console.log('The test commit workflow will:');
        console.log('- Create a test branch');
        console.log('- Make a test commit');
        console.log('- Push to GitHub to trigger CI');
        console.log('- Monitor the workflow execution');
        console.log('- Clean up the test branch');
        console.log('');
        console.log('⚠️  This will create a temporary branch and push to your repository.');
        
        const shouldRunTest = await this.askQuestion(
            'Do you want to run the test commit workflow? (y/N): '
        );
        
        if (!shouldRunTest.toLowerCase().startsWith('y')) {
            console.log('Skipping test commit workflow.');
            console.log('\n💡 You can run it later with: node scripts/test-commit-workflow.js');
            return;
        }

        await this.runTestCommitWorkflow();
    }

    async runTestCommitWorkflow() {
        console.log('\n🚀 Running Test Commit Workflow...');
        
        const scriptPath = path.join(__dirname, 'test-commit-workflow.js');
        
        if (!fs.existsSync(scriptPath)) {
            console.log('❌ Test commit workflow script not found');
            return;
        }

        try {
            // Check if working directory is clean
            const status = execSync('git status --porcelain', { encoding: 'utf8' });
            if (status.trim()) {
                console.log('⚠️  Working directory has uncommitted changes.');
                const shouldContinue = await this.askQuestion(
                    'Continue with test commit workflow anyway? (y/N): '
                );
                
                if (!shouldContinue.toLowerCase().startsWith('y')) {
                    console.log('Test commit workflow cancelled.');
                    return;
                }
            }

            const output = execSync(`node "${scriptPath}"`, { 
                encoding: 'utf8',
                stdio: 'pipe'
            });
            
            console.log(output);
            console.log('✅ Test commit workflow completed');
            
        } catch (error) {
            console.log('❌ Test commit workflow failed:');
            console.log(error.stdout || error.message);
            
            console.log('\n💡 This might be due to:');
            console.log('- Git authentication issues');
            console.log('- GitHub CLI not installed');
            console.log('- Network connectivity problems');
            console.log('- Repository permissions');
            console.log('\nYou can manually verify the CI workflow by making a regular commit.');
        }
    }

    askQuestion(question) {
        return new Promise((resolve) => {
            this.rl.question(question, (answer) => {
                resolve(answer);
            });
        });
    }

    static showUsage() {
        console.log('CI Validation Suite Usage:');
        console.log('');
        console.log('  node scripts/run-ci-validation-suite.js');
        console.log('');
        console.log('This will run:');
        console.log('  1. Node version consistency check');
        console.log('  2. Comprehensive CI fixes validation');
        console.log('  3. Optional test commit workflow');
        console.log('');
        console.log('Individual scripts can also be run separately:');
        console.log('  node scripts/check-node-version-consistency.js');
        console.log('  node scripts/validate-ci-fixes.js');
        console.log('  node scripts/test-commit-workflow.js');
        console.log('');
        console.log('For troubleshooting help:');
        console.log('  See docs/ci-fixes-troubleshooting-guide.md');
    }
}

// Handle command line arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
    CIValidationSuite.showUsage();
    process.exit(0);
}

// Run the validation suite if called directly
if (require.main === module) {
    const suite = new CIValidationSuite();
    suite.run().catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}

module.exports = CIValidationSuite;