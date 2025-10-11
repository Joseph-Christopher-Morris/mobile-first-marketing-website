#!/usr/bin/env node

/**
 * AWS Amplify Build Configuration Validator
 *
 * This script validates that all build settings and configurations
 * are properly set up for AWS Amplify deployment.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class AmplifyBuildValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.success = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${type.toUpperCase()}]`;

    switch (type) {
      case 'error':
        console.error(`${prefix} ❌ ${message}`);
        this.errors.push(message);
        break;
      case 'warning':
        console.warn(`${prefix} ⚠️  ${message}`);
        this.warnings.push(message);
        break;
      case 'success':
        console.log(`${prefix} ✅ ${message}`);
        this.success.push(message);
        break;
      default:
        console.log(`${prefix} ℹ️  ${message}`);
    }
  }

  validateAmplifyYml() {
    this.log('Validating amplify.yml configuration...');

    const amplifyYmlPath = path.join(process.cwd(), 'amplify.yml');

    if (!fs.existsSync(amplifyYmlPath)) {
      this.log('amplify.yml file not found', 'error');
      return false;
    }

    try {
      const amplifyConfig = fs.readFileSync(amplifyYmlPath, 'utf8');

      // Check for required sections
      const requiredSections = [
        'version: 1',
        'frontend:',
        'phases:',
        'preBuild:',
        'build:',
        'postBuild:',
        'artifacts:',
        'baseDirectory: out',
      ];

      for (const section of requiredSections) {
        if (!amplifyConfig.includes(section)) {
          this.log(
            `Missing required section in amplify.yml: ${section}`,
            'error'
          );
        } else {
          this.log(`Found required section: ${section}`, 'success');
        }
      }

      // Check for security headers
      if (amplifyConfig.includes('customHeaders:')) {
        this.log('Custom security headers configured', 'success');
      } else {
        this.log('Custom security headers not configured', 'warning');
      }

      // Check for caching configuration
      if (amplifyConfig.includes('Cache-Control')) {
        this.log('Caching headers configured', 'success');
      } else {
        this.log('Caching headers not configured', 'warning');
      }

      // Check for redirects
      if (amplifyConfig.includes('redirects:')) {
        this.log('URL redirects configured', 'success');
      } else {
        this.log('URL redirects not configured', 'warning');
      }

      return true;
    } catch (error) {
      this.log(`Error reading amplify.yml: ${error.message}`, 'error');
      return false;
    }
  }

  validatePackageScripts() {
    this.log('Validating package.json scripts...');

    const packageJsonPath = path.join(process.cwd(), 'package.json');

    if (!fs.existsSync(packageJsonPath)) {
      this.log('package.json file not found', 'error');
      return false;
    }

    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const scripts = packageJson.scripts || {};

      // Scripts referenced in amplify.yml
      const requiredScripts = [
        'build:optimize',
        'env:validate',
        'content:validate-structure',
        'content:validate',
        'type-check',
        'build',
        'test',
        'cache:optimize',
        'cache:invalidate',
        'deploy:monitor',
      ];

      for (const script of requiredScripts) {
        if (scripts[script]) {
          this.log(`Found required script: ${script}`, 'success');
        } else {
          this.log(`Missing required script: ${script}`, 'error');
        }
      }

      return true;
    } catch (error) {
      this.log(`Error reading package.json: ${error.message}`, 'error');
      return false;
    }
  }

  validateBuildScripts() {
    this.log('Validating build scripts exist...');

    const scriptsDir = path.join(process.cwd(), 'scripts');

    if (!fs.existsSync(scriptsDir)) {
      this.log('Scripts directory not found', 'error');
      return false;
    }

    const requiredScripts = [
      'build-optimization.js',
      'validate-env.js',
      'validate-structure.js',
      'validate-content.js',
      'cache-optimization.js',
      'cache-invalidation.js',
      'deployment-monitor.js',
    ];

    for (const script of requiredScripts) {
      const scriptPath = path.join(scriptsDir, script);
      if (fs.existsSync(scriptPath)) {
        this.log(`Found build script: ${script}`, 'success');
      } else {
        this.log(`Missing build script: ${script}`, 'error');
      }
    }

    return true;
  }

  validateNextConfig() {
    this.log('Validating Next.js configuration...');

    const nextConfigPath = path.join(process.cwd(), 'next.config.js');

    if (!fs.existsSync(nextConfigPath)) {
      this.log('next.config.js file not found', 'error');
      return false;
    }

    try {
      const nextConfig = fs.readFileSync(nextConfigPath, 'utf8');

      // Check for static export configuration
      if (nextConfig.includes('output:') && nextConfig.includes('export')) {
        this.log('Static export configuration found', 'success');
      } else {
        this.log('Static export configuration not found', 'warning');
      }

      // Check for image optimization
      if (nextConfig.includes('images:')) {
        this.log('Image optimization configuration found', 'success');
      } else {
        this.log('Image optimization configuration not found', 'warning');
      }

      return true;
    } catch (error) {
      this.log(`Error reading next.config.js: ${error.message}`, 'error');
      return false;
    }
  }

  validateEnvironmentSetup() {
    this.log('Validating environment setup...');

    // Check for environment example file
    const envExamplePath = path.join(process.cwd(), '.env.example');
    if (fs.existsSync(envExamplePath)) {
      this.log('Environment example file found', 'success');
    } else {
      this.log('Environment example file not found', 'warning');
    }

    // Check for local environment file
    const envLocalPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envLocalPath)) {
      this.log('Local environment file found', 'success');
    } else {
      this.log(
        'Local environment file not found (expected for production)',
        'info'
      );
    }

    return true;
  }

  validateGitConfiguration() {
    this.log('Validating Git configuration...');

    try {
      // Check if we're in a git repository
      execSync('git rev-parse --git-dir', { stdio: 'pipe' });
      this.log('Git repository detected', 'success');

      // Check for main branch
      try {
        const branches = execSync('git branch -r', {
          encoding: 'utf8',
          stdio: 'pipe',
        });
        if (branches.includes('origin/main')) {
          this.log('Main branch found', 'success');
        } else if (branches.includes('origin/master')) {
          this.log(
            'Master branch found (consider renaming to main)',
            'warning'
          );
        } else {
          this.log('No main/master branch found', 'warning');
        }
      } catch (error) {
        this.log('Could not check remote branches', 'warning');
      }

      return true;
    } catch (error) {
      this.log(
        'Not a Git repository or Git not available (this is OK for build validation)',
        'warning'
      );
      return true;
    }
  }

  validateWebhookConfiguration() {
    this.log('Validating webhook configuration readiness...');

    // Check if GitHub Actions or other CI/CD files exist
    const githubDir = path.join(process.cwd(), '.github');
    if (fs.existsSync(githubDir)) {
      this.log('GitHub configuration directory found', 'success');

      const workflowsDir = path.join(githubDir, 'workflows');
      if (fs.existsSync(workflowsDir)) {
        this.log('GitHub Actions workflows directory found', 'success');
      }
    }

    // Amplify will handle webhooks automatically when connected
    this.log(
      'Webhook configuration will be handled by Amplify during setup',
      'info'
    );

    return true;
  }

  generateReport() {
    this.log('\n=== AMPLIFY BUILD VALIDATION REPORT ===');

    if (this.success.length > 0) {
      this.log(`\n✅ SUCCESSFUL VALIDATIONS (${this.success.length}):`);
      this.success.forEach(item => console.log(`   • ${item}`));
    }

    if (this.warnings.length > 0) {
      this.log(`\n⚠️  WARNINGS (${this.warnings.length}):`);
      this.warnings.forEach(item => console.log(`   • ${item}`));
    }

    if (this.errors.length > 0) {
      this.log(`\n❌ ERRORS (${this.errors.length}):`);
      this.errors.forEach(item => console.log(`   • ${item}`));
    }

    const isValid = this.errors.length === 0;

    this.log(`\n=== VALIDATION ${isValid ? 'PASSED' : 'FAILED'} ===`);

    if (isValid) {
      this.log(
        '✅ Your project is ready for AWS Amplify deployment!',
        'success'
      );
      this.log('Next steps:', 'info');
      this.log('1. Connect your GitHub repository to AWS Amplify', 'info');
      this.log('2. Configure environment variables in Amplify console', 'info');
      this.log('3. Trigger your first deployment', 'info');
    } else {
      this.log(
        '❌ Please fix the errors above before deploying to AWS Amplify',
        'error'
      );
    }

    return isValid;
  }

  async run() {
    this.log('Starting AWS Amplify build configuration validation...\n');

    const validations = [
      () => this.validateAmplifyYml(),
      () => this.validatePackageScripts(),
      () => this.validateBuildScripts(),
      () => this.validateNextConfig(),
      () => this.validateEnvironmentSetup(),
      () => this.validateGitConfiguration(),
      () => this.validateWebhookConfiguration(),
    ];

    for (const validation of validations) {
      try {
        await validation();
      } catch (error) {
        this.log(`Validation error: ${error.message}`, 'error');
      }
      this.log(''); // Add spacing between validations
    }

    return this.generateReport();
  }
}

// Run the validator if this script is executed directly
if (require.main === module) {
  const validator = new AmplifyBuildValidator();
  validator
    .run()
    .then(isValid => {
      process.exit(isValid ? 0 : 1);
    })
    .catch(error => {
      console.error('Validation failed:', error);
      process.exit(1);
    });
}

module.exports = AmplifyBuildValidator;
