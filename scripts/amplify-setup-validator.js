#!/usr/bin/env node

/**
 * AWS Amplify Setup Validator
 *
 * This script validates that the AWS Amplify configuration is properly set up
 * and all required components are in place for successful deployment.
 */

const fs = require('fs');
const path = require('path');

class AmplifySetupValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.success = [];
  }

  /**
   * Validate amplify.yml configuration file
   */
  validateAmplifyYml() {
    console.log('🔍 Validating amplify.yml configuration...');

    const amplifyYmlPath = path.join(process.cwd(), 'amplify.yml');

    if (!fs.existsSync(amplifyYmlPath)) {
      this.errors.push('amplify.yml file not found');
      return;
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

      requiredSections.forEach(section => {
        if (!amplifyConfig.includes(section)) {
          this.errors.push(
            `Missing required section in amplify.yml: ${section}`
          );
        }
      });

      // Check for required commands
      const requiredCommands = [
        'npm ci',
        'npm run build',
        'npm run env:validate',
        'npm run content:validate-structure',
      ];

      requiredCommands.forEach(command => {
        if (!amplifyConfig.includes(command)) {
          this.warnings.push(
            `Recommended command not found in amplify.yml: ${command}`
          );
        }
      });

      // Check for security headers
      if (amplifyConfig.includes('customHeaders:')) {
        this.success.push('Custom security headers configured');
      } else {
        this.warnings.push('Custom security headers not configured');
      }

      // Check for caching configuration
      if (amplifyConfig.includes('Cache-Control')) {
        this.success.push('Caching headers configured');
      } else {
        this.warnings.push('Caching headers not configured');
      }

      this.success.push('amplify.yml file structure is valid');
    } catch (error) {
      this.errors.push(`Error reading amplify.yml: ${error.message}`);
    }
  }

  /**
   * Validate package.json scripts
   */
  validatePackageScripts() {
    console.log('🔍 Validating package.json scripts...');

    const packageJsonPath = path.join(process.cwd(), 'package.json');

    if (!fs.existsSync(packageJsonPath)) {
      this.errors.push('package.json file not found');
      return;
    }

    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const scripts = packageJson.scripts || {};

      // Required scripts for Amplify build
      const requiredScripts = [
        'build',
        'env:validate',
        'content:validate-structure',
        'content:validate',
        'type-check',
        'test',
        'build:optimize',
        'cache:optimize',
        'cache:invalidate',
        'deploy:monitor',
      ];

      requiredScripts.forEach(script => {
        if (scripts[script]) {
          this.success.push(`Script '${script}' is configured`);
        } else {
          this.errors.push(
            `Required script '${script}' not found in package.json`
          );
        }
      });
    } catch (error) {
      this.errors.push(`Error reading package.json: ${error.message}`);
    }
  }

  /**
   * Validate required script files exist
   */
  validateScriptFiles() {
    console.log('🔍 Validating script files...');

    const requiredScripts = [
      'scripts/validate-env.js',
      'scripts/validate-structure.js',
      'scripts/validate-content.js',
      'scripts/build-optimization.js',
      'scripts/cache-optimization.js',
      'scripts/cache-invalidation.js',
      'scripts/deployment-monitor.js',
    ];

    requiredScripts.forEach(scriptPath => {
      if (fs.existsSync(path.join(process.cwd(), scriptPath))) {
        this.success.push(`Script file exists: ${scriptPath}`);
      } else {
        this.errors.push(`Required script file not found: ${scriptPath}`);
      }
    });
  }

  /**
   * Validate Next.js configuration
   */
  validateNextConfig() {
    console.log('🔍 Validating Next.js configuration...');

    const nextConfigPath = path.join(process.cwd(), 'next.config.js');

    if (!fs.existsSync(nextConfigPath)) {
      this.errors.push('next.config.js file not found');
      return;
    }

    try {
      const nextConfig = fs.readFileSync(nextConfigPath, 'utf8');

      // Check for static export configuration
      if (nextConfig.includes('output:') && nextConfig.includes('export')) {
        this.success.push('Next.js configured for static export');
      } else {
        this.errors.push(
          'Next.js not configured for static export (required for Amplify)'
        );
      }

      // Check for image optimization
      if (nextConfig.includes('images:')) {
        this.success.push('Image optimization configured');
      } else {
        this.warnings.push('Image optimization not configured');
      }
    } catch (error) {
      this.errors.push(`Error reading next.config.js: ${error.message}`);
    }
  }

  /**
   * Validate environment configuration
   */
  validateEnvironmentSetup() {
    console.log('🔍 Validating environment configuration...');

    // Check for .env.example
    if (fs.existsSync('.env.example')) {
      this.success.push('.env.example file exists');
    } else {
      this.warnings.push('.env.example file not found');
    }

    // Check for environment documentation
    if (fs.existsSync('docs/environment-configuration.md')) {
      this.success.push('Environment configuration documentation exists');
    } else {
      this.warnings.push('Environment configuration documentation not found');
    }
  }

  /**
   * Generate setup checklist
   */
  generateSetupChecklist() {
    console.log('\n📋 AWS Amplify Setup Checklist:');
    console.log('================================');

    const checklist = [
      '□ Create AWS Amplify application',
      '□ Connect GitHub repository',
      '□ Verify amplify.yml is detected',
      '□ Configure environment variables',
      '□ Set up custom domain (optional)',
      '□ Test initial deployment',
      '□ Verify security headers',
      '□ Test caching configuration',
      '□ Set up monitoring and alerts',
    ];

    checklist.forEach(item => console.log(item));
  }

  /**
   * Run all validations
   */
  async validate() {
    console.log('🚀 Starting AWS Amplify Setup Validation...\n');

    this.validateAmplifyYml();
    this.validatePackageScripts();
    this.validateScriptFiles();
    this.validateNextConfig();
    this.validateEnvironmentSetup();

    // Display results
    console.log('\n📊 Validation Results:');
    console.log('======================');

    if (this.success.length > 0) {
      console.log('\n✅ Success:');
      this.success.forEach(msg => console.log(`  ✓ ${msg}`));
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      this.warnings.forEach(msg => console.log(`  ⚠ ${msg}`));
    }

    if (this.errors.length > 0) {
      console.log('\n❌ Errors:');
      this.errors.forEach(msg => console.log(`  ✗ ${msg}`));
    }

    this.generateSetupChecklist();

    // Exit with appropriate code
    if (this.errors.length > 0) {
      console.log(
        '\n❌ Validation failed. Please fix the errors above before proceeding with Amplify setup.'
      );
      process.exit(1);
    } else {
      console.log(
        '\n✅ Validation passed! Your project is ready for AWS Amplify deployment.'
      );
      console.log('\nNext steps:');
      console.log('1. Follow the setup guide in docs/amplify-setup-guide.md');
      console.log(
        '2. Configure environment variables using the guide in docs/environment-configuration.md'
      );
      console.log('3. Test your deployment');
      process.exit(0);
    }
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new AmplifySetupValidator();
  validator.validate().catch(error => {
    console.error('❌ Validation failed:', error.message);
    process.exit(1);
  });
}

module.exports = AmplifySetupValidator;
