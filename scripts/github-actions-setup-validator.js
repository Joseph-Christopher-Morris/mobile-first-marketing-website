#!/usr/bin/env node

/**
 * GitHub Actions AWS Setup Validator
 *
 * This script validates the AWS IAM role and GitHub Secrets configuration
 * for the S3/CloudFront deployment pipeline.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class GitHubActionsSetupValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.success = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: '📋',
      success: '✅',
      warning: '⚠️',
      error: '❌',
    }[type];

    console.log(`${prefix} [${timestamp}] ${message}`);

    if (type === 'error') this.errors.push(message);
    if (type === 'warning') this.warnings.push(message);
    if (type === 'success') this.success.push(message);
  }

  async validateAWSCredentials() {
    this.log('Validating AWS credentials...', 'info');

    try {
      const identity = execSync('aws sts get-caller-identity --output json', {
        encoding: 'utf8',
        stdio: 'pipe',
      });

      const identityData = JSON.parse(identity);
      this.log(
        `AWS credentials valid - Account: ${identityData.Account}, User: ${identityData.Arn}`,
        'success'
      );

      return identityData;
    } catch (error) {
      this.log('AWS credentials not configured or invalid', 'error');
      this.log('Please run: aws configure', 'info');
      return null;
    }
  }

  async validateOIDCProvider(accountId) {
    this.log('Checking OIDC identity provider...', 'info');

    try {
      const providers = execSync(
        'aws iam list-open-id-connect-providers --output json',
        {
          encoding: 'utf8',
          stdio: 'pipe',
        }
      );

      const providersData = JSON.parse(providers);
      const githubProvider = providersData.OpenIDConnectProviderList.find(
        provider => provider.Arn.includes('token.actions.githubusercontent.com')
      );

      if (githubProvider) {
        this.log('GitHub OIDC provider found', 'success');
        return githubProvider.Arn;
      } else {
        this.log('GitHub OIDC provider not found', 'error');
        this.log(
          'Create OIDC provider: https://token.actions.githubusercontent.com',
          'info'
        );
        return null;
      }
    } catch (error) {
      this.log('Failed to check OIDC providers', 'error');
      return null;
    }
  }

  async validateIAMRole(accountId) {
    this.log('Checking IAM role for GitHub Actions...', 'info');

    const roleName = 'GitHubActionsDeploymentRole';

    try {
      const role = execSync(
        `aws iam get-role --role-name ${roleName} --output json`,
        {
          encoding: 'utf8',
          stdio: 'pipe',
        }
      );

      const roleData = JSON.parse(role);
      this.log(`IAM role '${roleName}' found`, 'success');

      // Check trust policy
      const trustPolicy = roleData.Role.AssumeRolePolicyDocument;
      const decodedPolicy = decodeURIComponent(trustPolicy);

      if (decodedPolicy.includes('token.actions.githubusercontent.com')) {
        this.log('Trust policy includes GitHub OIDC provider', 'success');
      } else {
        this.log('Trust policy missing GitHub OIDC provider', 'warning');
      }

      return roleData.Role.Arn;
    } catch (error) {
      this.log(`IAM role '${roleName}' not found`, 'error');
      this.log('Create the IAM role with GitHub OIDC trust policy', 'info');
      return null;
    }
  }

  async validateRolePolicies(roleName = 'GitHubActionsDeploymentRole') {
    this.log('Checking IAM role policies...', 'info');

    try {
      const policies = execSync(
        `aws iam list-attached-role-policies --role-name ${roleName} --output json`,
        {
          encoding: 'utf8',
          stdio: 'pipe',
        }
      );

      const policiesData = JSON.parse(policies);

      if (policiesData.AttachedPolicies.length > 0) {
        this.log(
          `Found ${policiesData.AttachedPolicies.length} attached policies`,
          'success'
        );

        for (const policy of policiesData.AttachedPolicies) {
          this.log(`- ${policy.PolicyName} (${policy.PolicyArn})`, 'info');
        }
      } else {
        this.log('No policies attached to role', 'warning');
        this.log(
          'Attach deployment policy with S3 and CloudFront permissions',
          'info'
        );
      }

      return policiesData.AttachedPolicies;
    } catch (error) {
      this.log('Failed to check role policies', 'error');
      return [];
    }
  }

  async validateS3Buckets() {
    this.log('Checking S3 buckets...', 'info');

    try {
      const buckets = execSync('aws s3 ls --output text', {
        encoding: 'utf8',
        stdio: 'pipe',
      });

      const bucketLines = buckets.trim().split('\n');
      const mobileSiteBuckets = bucketLines.filter(line =>
        line.includes('mobile-marketing-site')
      );

      if (mobileSiteBuckets.length > 0) {
        this.log(
          `Found ${mobileSiteBuckets.length} mobile marketing site buckets`,
          'success'
        );
        mobileSiteBuckets.forEach(bucket => {
          const bucketName = bucket.split(/\s+/).pop();
          this.log(`- ${bucketName}`, 'info');
        });
      } else {
        this.log('No mobile marketing site buckets found', 'warning');
        this.log('Run: npm run s3:setup', 'info');
      }

      return mobileSiteBuckets;
    } catch (error) {
      this.log('Failed to list S3 buckets', 'error');
      return [];
    }
  }

  async validateCloudFrontDistributions() {
    this.log('Checking CloudFront distributions...', 'info');

    try {
      const distributions = execSync(
        'aws cloudfront list-distributions --output json',
        {
          encoding: 'utf8',
          stdio: 'pipe',
        }
      );

      const distributionsData = JSON.parse(distributions);

      if (distributionsData.DistributionList.Items.length > 0) {
        this.log(
          `Found ${distributionsData.DistributionList.Items.length} CloudFront distributions`,
          'success'
        );

        for (const dist of distributionsData.DistributionList.Items) {
          this.log(
            `- ${dist.Id} (${dist.DomainName}) - Status: ${dist.Status}`,
            'info'
          );
        }
      } else {
        this.log('No CloudFront distributions found', 'warning');
        this.log('Run: npm run infrastructure:setup', 'info');
      }

      return distributionsData.DistributionList.Items;
    } catch (error) {
      this.log('Failed to list CloudFront distributions', 'error');
      return [];
    }
  }

  validateWorkflowFile() {
    this.log('Checking GitHub Actions workflow file...', 'info');

    const workflowPath = '.github/workflows/s3-cloudfront-deploy.yml';

    if (fs.existsSync(workflowPath)) {
      this.log('GitHub Actions workflow file exists', 'success');

      const workflowContent = fs.readFileSync(workflowPath, 'utf8');

      // Check for required elements
      const requiredElements = [
        'role-to-assume',
        'aws-actions/configure-aws-credentials',
        'scripts/deploy.js',
        'permissions:',
      ];

      for (const element of requiredElements) {
        if (workflowContent.includes(element)) {
          this.log(`✓ Workflow includes ${element}`, 'success');
        } else {
          this.log(`✗ Workflow missing ${element}`, 'warning');
        }
      }
    } else {
      this.log('GitHub Actions workflow file not found', 'error');
      this.log(`Expected: ${workflowPath}`, 'info');
    }
  }

  validateDeploymentScripts() {
    this.log('Checking deployment scripts...', 'info');

    const requiredScripts = [
      'scripts/deploy.js',
      'scripts/setup-infrastructure.js',
      'scripts/validate-site-functionality-simple.js',
    ];

    for (const script of requiredScripts) {
      if (fs.existsSync(script)) {
        this.log(`✓ ${script} exists`, 'success');
      } else {
        this.log(`✗ ${script} missing`, 'error');
      }
    }
  }

  generateSetupInstructions(accountId, roleArn) {
    this.log('Generating setup instructions...', 'info');

    const instructions = `
# GitHub Secrets Configuration

Add the following secrets to your GitHub repository:
(Settings → Secrets and variables → Actions)

## Required Secrets

1. **AWS_ROLE_ARN**
   Value: ${roleArn || `arn:aws:iam::${accountId}:role/GitHubActionsDeploymentRole`}

2. **SITE_URL**
   Value: https://your-cloudfront-domain.cloudfront.net
   (Replace with your actual CloudFront distribution URL)

## Optional Secrets

3. **STAGING_SITE_URL**
   Value: https://your-staging-cloudfront-domain.cloudfront.net
   (For staging environment deployments)

## Next Steps

1. Create the IAM role if it doesn't exist
2. Attach the deployment policy to the role
3. Add the secrets to GitHub repository
4. Test the deployment pipeline
5. Monitor the first deployment closely

For detailed setup instructions, see: docs/github-actions-aws-setup.md
`;

    console.log(instructions);
  }

  async run() {
    console.log('🚀 GitHub Actions AWS Setup Validator\n');

    // Validate AWS credentials
    const identity = await this.validateAWSCredentials();
    if (!identity) return this.printSummary();

    const accountId = identity.Account;

    // Validate OIDC provider
    await this.validateOIDCProvider(accountId);

    // Validate IAM role
    const roleArn = await this.validateIAMRole(accountId);

    // Validate role policies
    await this.validateRolePolicies();

    // Validate AWS resources
    await this.validateS3Buckets();
    await this.validateCloudFrontDistributions();

    // Validate local files
    this.validateWorkflowFile();
    this.validateDeploymentScripts();

    // Generate setup instructions
    this.generateSetupInstructions(accountId, roleArn);

    this.printSummary();
  }

  printSummary() {
    console.log('\n📊 Validation Summary');
    console.log('='.repeat(50));

    if (this.success.length > 0) {
      console.log(`\n✅ Success (${this.success.length}):`);
      this.success.forEach(msg => console.log(`  • ${msg}`));
    }

    if (this.warnings.length > 0) {
      console.log(`\n⚠️  Warnings (${this.warnings.length}):`);
      this.warnings.forEach(msg => console.log(`  • ${msg}`));
    }

    if (this.errors.length > 0) {
      console.log(`\n❌ Errors (${this.errors.length}):`);
      this.errors.forEach(msg => console.log(`  • ${msg}`));
    }

    console.log('\n📚 Documentation:');
    console.log('  • Setup Guide: docs/github-actions-aws-setup.md');
    console.log('  • Deployment Guide: AWS_S3_DEPLOYMENT_GUIDE.md');

    if (this.errors.length === 0) {
      console.log('\n🎉 Setup validation completed successfully!');
      process.exit(0);
    } else {
      console.log('\n🔧 Please fix the errors above before proceeding.');
      process.exit(1);
    }
  }
}

// Run the validator
if (require.main === module) {
  const validator = new GitHubActionsSetupValidator();
  validator.run().catch(error => {
    console.error('❌ Validation failed:', error.message);
    process.exit(1);
  });
}

module.exports = GitHubActionsSetupValidator;
