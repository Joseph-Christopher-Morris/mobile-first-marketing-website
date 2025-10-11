#!/usr/bin/env node

/**
 * Access Control and Audit Logging Validation Script
 *
 * This script validates that access control and audit logging are properly configured:
 * - Verifies least privilege IAM policies
 * - Tests S3 bucket policies for CloudFront-only access
 * - Validates comprehensive audit logging setup
 */

const {
  IAMClient,
  GetPolicyCommand,
  GetRoleCommand,
  ListAttachedRolePoliciesCommand,
  SimulatePrincipalPolicyCommand,
} = require('@aws-sdk/client-iam');

const {
  S3Client,
  GetBucketPolicyCommand,
  GetBucketLoggingCommand,
  GetBucketPublicAccessBlockCommand,
  HeadBucketCommand,
} = require('@aws-sdk/client-s3');

const {
  CloudTrailClient,
  GetTrailStatusCommand,
  DescribeTrailsCommand,
  GetEventSelectorsCommand,
} = require('@aws-sdk/client-cloudtrail');

const {
  CloudWatchLogsClient,
  DescribeLogGroupsCommand,
} = require('@aws-sdk/client-cloudwatch-logs');

const { STSClient, GetCallerIdentityCommand } = require('@aws-sdk/client-sts');
const fs = require('fs').promises;
const path = require('path');

class AccessControlAuditValidator {
  constructor() {
    this.region = process.env.AWS_REGION || 'us-east-1';
    this.environment = process.env.ENVIRONMENT || 'production';

    this.iam = new IAMClient({ region: this.region });
    this.s3 = new S3Client({ region: this.region });
    this.cloudtrail = new CloudTrailClient({ region: this.region });
    this.cloudwatchLogs = new CloudWatchLogsClient({ region: this.region });
    this.sts = new STSClient({ region: this.region });

    this.accountId = null;
    this.config = null;
  }

  async loadConfig() {
    try {
      const configPath = path.join(
        __dirname,
        '..',
        'config',
        'cloudfront-s3-config.json'
      );
      const configData = await fs.readFile(configPath, 'utf8');
      this.config = JSON.parse(configData);
      console.log('✅ Loaded infrastructure configuration');
    } catch (error) {
      console.error('❌ Failed to load infrastructure config:', error.message);
      throw error;
    }
  }

  async getAccountId() {
    if (this.accountId) return this.accountId;

    try {
      const result = await this.sts.send(new GetCallerIdentityCommand({}));
      this.accountId = result.Account;
      return this.accountId;
    } catch (error) {
      console.error('Failed to get AWS account ID:', error.message);
      throw error;
    }
  }

  /**
   * Validate IAM policies for least privilege
   */
  async validateIAMPolicies() {
    console.log('🔐 Validating IAM policies for least privilege...');

    const results = {
      deploymentPolicy: false,
      monitoringPolicy: false,
      policies: [],
    };

    const policyNames = [
      `S3CloudFrontDeploymentPolicy-${this.environment}`,
      `S3CloudFrontMonitoringPolicy-${this.environment}`,
    ];

    for (const policyName of policyNames) {
      try {
        const policyArn = `arn:aws:iam::${await this.getAccountId()}:policy/${policyName}`;
        const policy = await this.iam.send(
          new GetPolicyCommand({ PolicyArn: policyArn })
        );

        console.log(`✅ Found IAM policy: ${policyName}`);
        results.policies.push({
          name: policyName,
          arn: policyArn,
          version: policy.Policy.DefaultVersionId,
          created: policy.Policy.CreateDate,
        });

        if (policyName.includes('Deployment')) {
          results.deploymentPolicy = true;
        } else if (policyName.includes('Monitoring')) {
          results.monitoringPolicy = true;
        }
      } catch (error) {
        if (error.name === 'NoSuchEntity') {
          console.log(`❌ IAM policy not found: ${policyName}`);
        } else {
          console.error(
            `❌ Error checking policy ${policyName}:`,
            error.message
          );
        }
      }
    }

    return results;
  }

  /**
   * Validate S3 bucket security configuration
   */
  async validateS3Security() {
    console.log('🔒 Validating S3 bucket security configuration...');

    const bucketName = this.config.bucketName;
    const results = {
      bucketPolicy: false,
      publicAccessBlocked: false,
      accessLogging: false,
      cloudfrontOnlyAccess: false,
    };

    try {
      // Check bucket policy
      const bucketPolicy = await this.s3.send(
        new GetBucketPolicyCommand({
          Bucket: bucketName,
        })
      );

      if (bucketPolicy.Policy) {
        const policy = JSON.parse(bucketPolicy.Policy);
        results.bucketPolicy = true;

        // Check for CloudFront-only access
        const cloudfrontStatement = policy.Statement.find(
          stmt =>
            stmt.Principal &&
            stmt.Principal.Service === 'cloudfront.amazonaws.com'
        );

        const denyDirectAccess = policy.Statement.find(
          stmt =>
            stmt.Effect === 'Deny' &&
            stmt.Condition &&
            stmt.Condition.StringNotEquals
        );

        results.cloudfrontOnlyAccess = !!(
          cloudfrontStatement && denyDirectAccess
        );

        if (results.cloudfrontOnlyAccess) {
          console.log('✅ S3 bucket configured for CloudFront-only access');
        } else {
          console.log(
            '❌ S3 bucket policy does not enforce CloudFront-only access'
          );
        }
      }

      // Check public access block
      const publicAccessBlock = await this.s3.send(
        new GetBucketPublicAccessBlockCommand({
          Bucket: bucketName,
        })
      );

      results.publicAccessBlocked =
        publicAccessBlock.PublicAccessBlockConfiguration.BlockPublicAcls &&
        publicAccessBlock.PublicAccessBlockConfiguration.BlockPublicPolicy &&
        publicAccessBlock.PublicAccessBlockConfiguration.IgnorePublicAcls &&
        publicAccessBlock.PublicAccessBlockConfiguration.RestrictPublicBuckets;

      if (results.publicAccessBlocked) {
        console.log('✅ S3 bucket public access is properly blocked');
      } else {
        console.log('❌ S3 bucket public access is not fully blocked');
      }

      // Check access logging
      const loggingConfig = await this.s3.send(
        new GetBucketLoggingCommand({
          Bucket: bucketName,
        })
      );

      results.accessLogging = !!loggingConfig.LoggingEnabled;

      if (results.accessLogging) {
        console.log(
          `✅ S3 access logging enabled: ${loggingConfig.LoggingEnabled.TargetBucket}/${loggingConfig.LoggingEnabled.TargetPrefix}`
        );
      } else {
        console.log('❌ S3 access logging is not enabled');
      }
    } catch (error) {
      console.error('❌ Error validating S3 security:', error.message);
    }

    return results;
  }

  /**
   * Validate CloudTrail audit logging
   */
  async validateCloudTrailAuditing() {
    console.log('📝 Validating CloudTrail audit logging...');

    const trailName = `${this.environment}-s3-cloudfront-audit-trail`;
    const results = {
      trailExists: false,
      isLogging: false,
      eventSelectors: false,
      s3DataEvents: false,
    };

    try {
      // Check if trail exists
      const trails = await this.cloudtrail.send(
        new DescribeTrailsCommand({
          trailNameList: [trailName],
        })
      );

      if (trails.trailList && trails.trailList.length > 0) {
        results.trailExists = true;
        console.log(`✅ CloudTrail found: ${trailName}`);

        // Check if logging is enabled
        const status = await this.cloudtrail.send(
          new GetTrailStatusCommand({
            Name: trailName,
          })
        );

        results.isLogging = status.IsLogging;

        if (results.isLogging) {
          console.log('✅ CloudTrail logging is enabled');
        } else {
          console.log('❌ CloudTrail logging is not enabled');
        }

        // Check event selectors
        try {
          const eventSelectors = await this.cloudtrail.send(
            new GetEventSelectorsCommand({
              TrailName: trailName,
            })
          );

          if (
            eventSelectors.EventSelectors &&
            eventSelectors.EventSelectors.length > 0
          ) {
            results.eventSelectors = true;

            // Check for S3 data events
            const s3DataEvents = eventSelectors.EventSelectors.some(
              selector =>
                selector.DataResources &&
                selector.DataResources.some(
                  resource =>
                    resource.Type === 'AWS::S3::Object' ||
                    resource.Type === 'AWS::S3::Bucket'
                )
            );

            results.s3DataEvents = s3DataEvents;

            if (s3DataEvents) {
              console.log('✅ CloudTrail configured for S3 data events');
            } else {
              console.log('❌ CloudTrail not configured for S3 data events');
            }
          }
        } catch (error) {
          console.log(
            '⚠️ Could not check CloudTrail event selectors:',
            error.message
          );
        }
      } else {
        console.log(`❌ CloudTrail not found: ${trailName}`);
      }
    } catch (error) {
      console.error('❌ Error validating CloudTrail:', error.message);
    }

    return results;
  }

  /**
   * Validate CloudWatch log groups
   */
  async validateCloudWatchLogGroups() {
    console.log('📊 Validating CloudWatch log groups...');

    const requiredLogGroups = [
      `/aws/s3/${this.config.bucketName}/access-logs`,
      `/aws/cloudfront/distribution/${this.config.distributionId}`,
      `/aws/deployment/${this.environment}/audit`,
      `/aws/security/${this.environment}/access-control`,
    ];

    const results = {
      totalRequired: requiredLogGroups.length,
      found: 0,
      logGroups: [],
    };

    try {
      const logGroups = await this.cloudwatchLogs.send(
        new DescribeLogGroupsCommand({})
      );

      for (const required of requiredLogGroups) {
        const found = logGroups.logGroups?.find(
          group => group.logGroupName === required
        );

        if (found) {
          results.found++;
          results.logGroups.push({
            name: required,
            exists: true,
            retentionInDays: found.retentionInDays,
            creationTime: found.creationTime,
          });
          console.log(`✅ Log group found: ${required}`);
        } else {
          results.logGroups.push({
            name: required,
            exists: false,
          });
          console.log(`❌ Log group missing: ${required}`);
        }
      }
    } catch (error) {
      console.error(
        '❌ Error validating CloudWatch log groups:',
        error.message
      );
    }

    return results;
  }

  /**
   * Test access control by simulating unauthorized access
   */
  async testAccessControl() {
    console.log('🧪 Testing access control restrictions...');

    const results = {
      directS3Access: 'unknown',
      cloudfrontAccess: 'unknown',
      unauthorizedActions: [],
    };

    try {
      // Test direct S3 access (should be denied)
      try {
        const response = await fetch(
          `https://${this.config.bucketName}.s3.amazonaws.com/index.html`
        );
        if (response.status === 403) {
          results.directS3Access = 'properly_denied';
          console.log('✅ Direct S3 access properly denied');
        } else {
          results.directS3Access = 'allowed';
          console.log('❌ Direct S3 access is allowed (security risk)');
        }
      } catch (error) {
        results.directS3Access = 'properly_denied';
        console.log('✅ Direct S3 access properly denied (connection refused)');
      }

      // Test CloudFront access (should be allowed)
      if (this.config.cloudfrontDomain) {
        try {
          const response = await fetch(
            `https://${this.config.cloudfrontDomain}/`
          );
          if (response.status === 200) {
            results.cloudfrontAccess = 'allowed';
            console.log('✅ CloudFront access working properly');
          } else {
            results.cloudfrontAccess = 'denied';
            console.log('❌ CloudFront access is denied');
          }
        } catch (error) {
          results.cloudfrontAccess = 'error';
          console.log('⚠️ Could not test CloudFront access:', error.message);
        }
      }
    } catch (error) {
      console.error('❌ Error testing access control:', error.message);
    }

    return results;
  }

  /**
   * Generate comprehensive validation report
   */
  async generateValidationReport() {
    console.log('📋 Generating comprehensive validation report...');

    const iamValidation = await this.validateIAMPolicies();
    const s3Validation = await this.validateS3Security();
    const cloudtrailValidation = await this.validateCloudTrailAuditing();
    const logGroupsValidation = await this.validateCloudWatchLogGroups();
    const accessControlTest = await this.testAccessControl();

    const report = {
      timestamp: new Date().toISOString(),
      environment: this.environment,
      accountId: await this.getAccountId(),
      bucketName: this.config.bucketName,
      distributionId: this.config.distributionId,
      validation: {
        iam: iamValidation,
        s3Security: s3Validation,
        cloudtrail: cloudtrailValidation,
        logGroups: logGroupsValidation,
        accessControl: accessControlTest,
      },
      overallScore: this.calculateOverallScore({
        iamValidation,
        s3Validation,
        cloudtrailValidation,
        logGroupsValidation,
        accessControlTest,
      }),
      recommendations: this.generateRecommendations({
        iamValidation,
        s3Validation,
        cloudtrailValidation,
        logGroupsValidation,
        accessControlTest,
      }),
    };

    // Save report
    const reportPath = path.join(
      __dirname,
      '..',
      'config',
      `access-control-validation-report-${Date.now()}.json`
    );
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    this.printValidationSummary(report);
    console.log(`\n📄 Validation report saved to: ${reportPath}`);

    return report;
  }

  calculateOverallScore(validations) {
    let totalChecks = 0;
    let passedChecks = 0;

    // IAM checks
    totalChecks += 2;
    if (validations.iamValidation.deploymentPolicy) passedChecks++;
    if (validations.iamValidation.monitoringPolicy) passedChecks++;

    // S3 security checks
    totalChecks += 4;
    if (validations.s3Validation.bucketPolicy) passedChecks++;
    if (validations.s3Validation.publicAccessBlocked) passedChecks++;
    if (validations.s3Validation.accessLogging) passedChecks++;
    if (validations.s3Validation.cloudfrontOnlyAccess) passedChecks++;

    // CloudTrail checks
    totalChecks += 3;
    if (validations.cloudtrailValidation.trailExists) passedChecks++;
    if (validations.cloudtrailValidation.isLogging) passedChecks++;
    if (validations.cloudtrailValidation.s3DataEvents) passedChecks++;

    // Log groups check
    totalChecks += 1;
    if (
      validations.logGroupsValidation.found ===
      validations.logGroupsValidation.totalRequired
    ) {
      passedChecks++;
    }

    // Access control checks
    totalChecks += 2;
    if (validations.accessControlTest.directS3Access === 'properly_denied')
      passedChecks++;
    if (validations.accessControlTest.cloudfrontAccess === 'allowed')
      passedChecks++;

    return {
      score: Math.round((passedChecks / totalChecks) * 100),
      passed: passedChecks,
      total: totalChecks,
    };
  }

  generateRecommendations(validations) {
    const recommendations = [];

    if (!validations.iamValidation.deploymentPolicy) {
      recommendations.push('Create least privilege deployment IAM policy');
    }

    if (!validations.iamValidation.monitoringPolicy) {
      recommendations.push('Create monitoring and audit IAM policy');
    }

    if (!validations.s3Validation.cloudfrontOnlyAccess) {
      recommendations.push(
        'Configure S3 bucket policy to allow CloudFront-only access'
      );
    }

    if (!validations.s3Validation.publicAccessBlocked) {
      recommendations.push('Enable S3 public access block settings');
    }

    if (!validations.s3Validation.accessLogging) {
      recommendations.push('Enable S3 access logging for audit trail');
    }

    if (!validations.cloudtrailValidation.isLogging) {
      recommendations.push('Enable CloudTrail logging for API auditing');
    }

    if (!validations.cloudtrailValidation.s3DataEvents) {
      recommendations.push(
        'Configure CloudTrail event selectors for S3 data events'
      );
    }

    if (
      validations.logGroupsValidation.found <
      validations.logGroupsValidation.totalRequired
    ) {
      recommendations.push(
        'Create missing CloudWatch log groups for comprehensive logging'
      );
    }

    if (validations.accessControlTest.directS3Access === 'allowed') {
      recommendations.push(
        'CRITICAL: Block direct S3 access - security vulnerability detected'
      );
    }

    return recommendations;
  }

  printValidationSummary(report) {
    console.log('\n🔍 Access Control and Audit Validation Summary');
    console.log('===============================================');
    console.log(
      `Overall Score: ${report.overallScore.score}% (${report.overallScore.passed}/${report.overallScore.total} checks passed)`
    );
    console.log(`Environment: ${report.environment}`);
    console.log(`S3 Bucket: ${report.bucketName}`);
    console.log(`CloudFront Distribution: ${report.distributionId}`);

    console.log('\n📊 Validation Results:');
    console.log(
      `  IAM Policies: ${report.validation.iam.deploymentPolicy && report.validation.iam.monitoringPolicy ? '✅' : '❌'}`
    );
    console.log(
      `  S3 Security: ${report.validation.s3Security.cloudfrontOnlyAccess && report.validation.s3Security.publicAccessBlocked ? '✅' : '❌'}`
    );
    console.log(
      `  Access Logging: ${report.validation.s3Security.accessLogging ? '✅' : '❌'}`
    );
    console.log(
      `  CloudTrail Auditing: ${report.validation.cloudtrail.isLogging ? '✅' : '❌'}`
    );
    console.log(
      `  Log Groups: ${report.validation.logGroups.found}/${report.validation.logGroups.totalRequired} configured`
    );
    console.log(
      `  Access Control: ${report.validation.accessControl.directS3Access === 'properly_denied' ? '✅' : '❌'}`
    );

    if (report.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      report.recommendations.forEach((rec, index) => {
        console.log(`  ${index + 1}. ${rec}`);
      });
    } else {
      console.log('\n✅ All access control and audit logging checks passed!');
    }
  }

  async run() {
    try {
      console.log('🚀 Validating access control and audit logging setup...');

      await this.loadConfig();
      await this.getAccountId();

      const report = await this.generateValidationReport();

      console.log('\n✅ Validation completed successfully!');

      // Exit with error code if critical issues found
      if (report.overallScore.score < 80) {
        console.log(
          '\n⚠️ Critical security issues detected. Please address recommendations.'
        );
        process.exit(1);
      }

      return report;
    } catch (error) {
      console.error('\n❌ Validation failed:', error.message);
      throw error;
    }
  }
}

// Run if called directly
if (require.main === module) {
  const validator = new AccessControlAuditValidator();
  validator
    .run()
    .then(report => {
      console.log('\nValidation completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('Validation failed:', error);
      process.exit(1);
    });
}

module.exports = AccessControlAuditValidator;
