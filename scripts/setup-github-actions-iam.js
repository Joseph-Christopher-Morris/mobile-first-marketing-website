#!/usr/bin/env node

/**
 * GitHub Actions IAM Setup Script
 *
 * This script creates the necessary IAM role and policies for GitHub Actions
 * to deploy to S3 and CloudFront using OIDC authentication.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class GitHubActionsIAMSetup {
  constructor(options = {}) {
    this.githubRepo = options.githubRepo || this.detectGitHubRepo();
    this.accountId = null;
    this.roleName = 'GitHubActionsDeploymentRole';
    this.policyName = 'GitHubActionsDeploymentPolicy';
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
  }

  detectGitHubRepo() {
    try {
      const remoteUrl = execSync('git remote get-url origin', {
        encoding: 'utf8',
      }).trim();

      // Parse GitHub repo from various URL formats
      const match = remoteUrl.match(/github\.com[:/]([^/]+)\/([^/.]+)/);
      if (match) {
        return `${match[1]}/${match[2]}`;
      }

      throw new Error('Could not parse GitHub repository');
    } catch (error) {
      this.log('Could not detect GitHub repository automatically', 'warning');
      this.log('Please provide --github-repo owner/repo-name', 'info');
      return null;
    }
  }

  async getAccountId() {
    try {
      const identity = execSync('aws sts get-caller-identity --output json', {
        encoding: 'utf8',
        stdio: 'pipe',
      });

      const identityData = JSON.parse(identity);
      this.accountId = identityData.Account;
      this.log(`AWS Account ID: ${this.accountId}`, 'success');
      return this.accountId;
    } catch (error) {
      this.log('Failed to get AWS account ID', 'error');
      throw error;
    }
  }

  generateDeploymentPolicy() {
    return {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'S3BucketAccess',
          Effect: 'Allow',
          Action: [
            's3:GetObject',
            's3:PutObject',
            's3:DeleteObject',
            's3:ListBucket',
            's3:GetBucketLocation',
            's3:PutObjectAcl',
          ],
          Resource: [
            'arn:aws:s3:::mobile-marketing-site-*',
            'arn:aws:s3:::mobile-marketing-site-*/*',
          ],
        },
        {
          Sid: 'CloudFrontAccess',
          Effect: 'Allow',
          Action: [
            'cloudfront:CreateInvalidation',
            'cloudfront:GetInvalidation',
            'cloudfront:ListInvalidations',
            'cloudfront:GetDistribution',
            'cloudfront:GetDistributionConfig',
          ],
          Resource: '*',
        },
        {
          Sid: 'CloudWatchLogs',
          Effect: 'Allow',
          Action: [
            'logs:CreateLogGroup',
            'logs:CreateLogStream',
            'logs:PutLogEvents',
            'logs:DescribeLogGroups',
            'logs:DescribeLogStreams',
          ],
          Resource: `arn:aws:logs:*:${this.accountId}:log-group:/aws/github-actions/*`,
        },
      ],
    };
  }

  generateTrustPolicy() {
    if (!this.githubRepo) {
      throw new Error('GitHub repository is required for trust policy');
    }

    return {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: {
            Federated: `arn:aws:iam::${this.accountId}:oidc-provider/token.actions.githubusercontent.com`,
          },
          Action: 'sts:AssumeRoleWithWebIdentity',
          Condition: {
            StringEquals: {
              'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
            },
            StringLike: {
              'token.actions.githubusercontent.com:sub': `repo:${this.githubRepo}:ref:refs/heads/main`,
            },
          },
        },
      ],
    };
  }

  async createOIDCProvider() {
    this.log('Creating GitHub OIDC identity provider...', 'info');

    try {
      // Check if provider already exists
      const providers = execSync(
        'aws iam list-open-id-connect-providers --output json',
        {
          encoding: 'utf8',
          stdio: 'pipe',
        }
      );

      const providersData = JSON.parse(providers);
      const existingProvider = providersData.OpenIDConnectProviderList.find(
        provider => provider.Arn.includes('token.actions.githubusercontent.com')
      );

      if (existingProvider) {
        this.log('GitHub OIDC provider already exists', 'success');
        return existingProvider.Arn;
      }

      // Create new provider
      const createCommand = `aws iam create-open-id-connect-provider \
        --url https://token.actions.githubusercontent.com \
        --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1 \
        --client-id-list sts.amazonaws.com \
        --output json`;

      const result = execSync(createCommand, { encoding: 'utf8' });
      const providerData = JSON.parse(result);

      this.log('GitHub OIDC provider created successfully', 'success');
      return providerData.OpenIDConnectProviderArn;
    } catch (error) {
      if (error.message.includes('already exists')) {
        this.log('GitHub OIDC provider already exists', 'success');
        return `arn:aws:iam::${this.accountId}:oidc-provider/token.actions.githubusercontent.com`;
      }
      throw error;
    }
  }

  async createDeploymentPolicy() {
    this.log('Creating deployment policy...', 'info');

    const policy = this.generateDeploymentPolicy();
    const policyDocument = JSON.stringify(policy, null, 2);

    // Write policy to temporary file
    const tempPolicyFile = path.join(__dirname, 'temp-deployment-policy.json');
    fs.writeFileSync(tempPolicyFile, policyDocument);

    try {
      const createCommand = `aws iam create-policy \
        --policy-name ${this.policyName} \
        --policy-document file://${tempPolicyFile} \
        --description "Policy for GitHub Actions S3/CloudFront deployment" \
        --output json`;

      const result = execSync(createCommand, { encoding: 'utf8' });
      const policyData = JSON.parse(result);

      this.log('Deployment policy created successfully', 'success');
      return policyData.Policy.Arn;
    } catch (error) {
      if (error.message.includes('already exists')) {
        this.log('Deployment policy already exists', 'success');
        return `arn:aws:iam::${this.accountId}:policy/${this.policyName}`;
      }
      throw error;
    } finally {
      // Clean up temporary file
      if (fs.existsSync(tempPolicyFile)) {
        fs.unlinkSync(tempPolicyFile);
      }
    }
  }

  async createDeploymentRole() {
    this.log('Creating deployment role...', 'info');

    const trustPolicy = this.generateTrustPolicy();
    const trustPolicyDocument = JSON.stringify(trustPolicy, null, 2);

    // Write trust policy to temporary file
    const tempTrustFile = path.join(__dirname, 'temp-trust-policy.json');
    fs.writeFileSync(tempTrustFile, trustPolicyDocument);

    try {
      const createCommand = `aws iam create-role \
        --role-name ${this.roleName} \
        --assume-role-policy-document file://${tempTrustFile} \
        --description "Role for GitHub Actions S3/CloudFront deployment" \
        --output json`;

      const result = execSync(createCommand, { encoding: 'utf8' });
      const roleData = JSON.parse(result);

      this.log('Deployment role created successfully', 'success');
      return roleData.Role.Arn;
    } catch (error) {
      if (error.message.includes('already exists')) {
        this.log('Deployment role already exists', 'success');
        return `arn:aws:iam::${this.accountId}:role/${this.roleName}`;
      }
      throw error;
    } finally {
      // Clean up temporary file
      if (fs.existsSync(tempTrustFile)) {
        fs.unlinkSync(tempTrustFile);
      }
    }
  }

  async attachPolicyToRole(policyArn, roleArn) {
    this.log('Attaching policy to role...', 'info');

    try {
      const attachCommand = `aws iam attach-role-policy \
        --role-name ${this.roleName} \
        --policy-arn ${policyArn}`;

      execSync(attachCommand, { stdio: 'pipe' });
      this.log('Policy attached to role successfully', 'success');
    } catch (error) {
      if (error.message.includes('already attached')) {
        this.log('Policy already attached to role', 'success');
      } else {
        throw error;
      }
    }
  }

  generateGitHubSecretsInstructions(roleArn) {
    const instructions = `
# GitHub Secrets Configuration

Add the following secrets to your GitHub repository:
(Go to: Settings → Secrets and variables → Actions)

## Required Secrets

1. **AWS_ROLE_ARN**
   Value: ${roleArn}

2. **SITE_URL**
   Value: https://your-cloudfront-domain.cloudfront.net
   (Replace with your actual CloudFront distribution URL)

## Optional Secrets

3. **STAGING_SITE_URL**
   Value: https://your-staging-cloudfront-domain.cloudfront.net
   (For staging environment deployments)

## Verification

After adding the secrets, you can test the setup by:

1. Running the validation script:
   npm run github-actions:validate

2. Triggering a test deployment:
   git push origin main

3. Monitoring the GitHub Actions workflow in your repository

## Security Notes

- The role can only be assumed from the main branch of: ${this.githubRepo}
- All permissions follow the principle of least privilege
- No long-term access keys are used
- All API calls are logged in CloudTrail

For detailed setup instructions, see: docs/github-actions-aws-setup.md
`;

    console.log(instructions);
  }

  async run() {
    console.log('🚀 GitHub Actions IAM Setup\n');

    if (!this.githubRepo) {
      this.log('GitHub repository is required', 'error');
      this.log(
        'Usage: node scripts/setup-github-actions-iam.js --github-repo owner/repo-name',
        'info'
      );
      process.exit(1);
    }

    this.log(
      `Setting up IAM for GitHub repository: ${this.githubRepo}`,
      'info'
    );

    try {
      // Get AWS account ID
      await this.getAccountId();

      // Create OIDC provider
      await this.createOIDCProvider();

      // Create deployment policy
      const policyArn = await this.createDeploymentPolicy();

      // Create deployment role
      const roleArn = await this.createDeploymentRole();

      // Attach policy to role
      await this.attachPolicyToRole(policyArn, roleArn);

      this.log('IAM setup completed successfully!', 'success');

      // Generate GitHub Secrets instructions
      this.generateGitHubSecretsInstructions(roleArn);
    } catch (error) {
      this.log(`Setup failed: ${error.message}`, 'error');
      process.exit(1);
    }
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const options = {};

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--github-repo' && args[i + 1]) {
    options.githubRepo = args[i + 1];
    i++;
  }
}

// Run the setup
if (require.main === module) {
  const setup = new GitHubActionsIAMSetup(options);
  setup.run().catch(error => {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  });
}

module.exports = GitHubActionsIAMSetup;
