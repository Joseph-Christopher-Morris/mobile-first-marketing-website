#!/usr/bin/env node

/**
 * Deployment Status Dashboard
 *
 * Provides a comprehensive view of deployment status, health metrics,
 * and operational information for the S3 + CloudFront deployment.
 *
 * Requirements: 5.1, 6.4
 */

const AWS = require('aws-sdk');
const fs = require('fs').promises;
const path = require('path');

class DeploymentStatusDashboard {
  constructor() {
    this.cloudfront = new AWS.CloudFront();
    this.s3 = new AWS.S3();
    this.cloudwatch = new AWS.CloudWatch();
    this.configPath = path.join(
      __dirname,
      '..',
      'config',
      'deployment-config.json'
    );
  }

  async loadConfig() {
    try {
      const configData = await fs.readFile(this.configPath, 'utf8');
      return JSON.parse(configData);
    } catch (error) {
      console.error('Error loading deployment config:', error.message);
      return null;
    }
  }

  async getS3BucketStatus(bucketName) {
    try {
      // Check bucket existence and configuration
      const bucketLocation = await this.s3
        .getBucketLocation({ Bucket: bucketName })
        .promise();
      const bucketVersioning = await this.s3
        .getBucketVersioning({ Bucket: bucketName })
        .promise();
      const bucketEncryption = await this.s3
        .getBucketEncryption({ Bucket: bucketName })
        .promise();

      // Get bucket size and object count
      const objects = await this.s3
        .listObjectsV2({ Bucket: bucketName })
        .promise();

      return {
        status: 'healthy',
        region: bucketLocation.LocationConstraint || 'us-east-1',
        versioning: bucketVersioning.Status || 'Disabled',
        encryption: bucketEncryption.ServerSideEncryptionConfiguration
          ? 'Enabled'
          : 'Disabled',
        objectCount: objects.KeyCount,
        lastModified:
          objects.Contents.length > 0
            ? Math.max(
                ...objects.Contents.map(obj =>
                  new Date(obj.LastModified).getTime()
                )
              )
            : null,
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
      };
    }
  }

  async getCloudFrontStatus(distributionId) {
    try {
      const distribution = await this.cloudfront
        .getDistribution({ Id: distributionId })
        .promise();
      const config = distribution.Distribution;

      return {
        status: config.Status,
        domainName: config.DomainName,
        enabled: config.DistributionConfig.Enabled,
        priceClass: config.DistributionConfig.PriceClass,
        lastModified: config.LastModifiedTime,
        origins: config.DistributionConfig.Origins.Items.map(origin => ({
          id: origin.Id,
          domainName: origin.DomainName,
          originAccessControl:
            origin.S3OriginConfig?.OriginAccessIdentity || 'OAC',
        })),
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
      };
    }
  }

  async getDeploymentMetrics(distributionId, bucketName) {
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - 24 * 60 * 60 * 1000); // Last 24 hours

    try {
      // CloudFront metrics
      const cfMetrics = await this.cloudwatch
        .getMetricStatistics({
          Namespace: 'AWS/CloudFront',
          MetricName: 'Requests',
          Dimensions: [{ Name: 'DistributionId', Value: distributionId }],
          StartTime: startTime,
          EndTime: endTime,
          Period: 3600,
          Statistics: ['Sum'],
        })
        .promise();

      // S3 metrics
      const s3Metrics = await this.cloudwatch
        .getMetricStatistics({
          Namespace: 'AWS/S3',
          MetricName: 'NumberOfObjects',
          Dimensions: [
            { Name: 'BucketName', Value: bucketName },
            { Name: 'StorageType', Value: 'AllStorageTypes' },
          ],
          StartTime: startTime,
          EndTime: endTime,
          Period: 86400,
          Statistics: ['Average'],
        })
        .promise();

      return {
        cloudfront: {
          requests24h: cfMetrics.Datapoints.reduce(
            (sum, point) => sum + point.Sum,
            0
          ),
          datapoints: cfMetrics.Datapoints.length,
        },
        s3: {
          objectCount:
            s3Metrics.Datapoints.length > 0
              ? s3Metrics.Datapoints[s3Metrics.Datapoints.length - 1].Average
              : 0,
        },
      };
    } catch (error) {
      return {
        error: error.message,
      };
    }
  }

  async getRecentDeployments() {
    try {
      const deploymentsPath = path.join(
        __dirname,
        '..',
        'logs',
        'deployments.json'
      );
      const deploymentsData = await fs.readFile(deploymentsPath, 'utf8');
      const deployments = JSON.parse(deploymentsData);

      return deployments
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 10);
    } catch (error) {
      return [];
    }
  }

  formatUptime(timestamp) {
    const now = new Date();
    const deployTime = new Date(timestamp);
    const diffMs = now - deployTime;

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }

  async generateDashboard() {
    console.log('🚀 S3 + CloudFront Deployment Status Dashboard');
    console.log('='.repeat(60));

    const config = await this.loadConfig();
    if (!config) {
      console.log('❌ Unable to load deployment configuration');
      return;
    }

    // S3 Status
    console.log('\n📦 S3 Bucket Status');
    console.log('-'.repeat(30));
    const s3Status = await this.getS3BucketStatus(config.bucketName);
    if (s3Status.status === 'healthy') {
      console.log(`✅ Bucket: ${config.bucketName}`);
      console.log(`   Region: ${s3Status.region}`);
      console.log(`   Versioning: ${s3Status.versioning}`);
      console.log(`   Encryption: ${s3Status.encryption}`);
      console.log(`   Objects: ${s3Status.objectCount}`);
      if (s3Status.lastModified) {
        console.log(
          `   Last Updated: ${new Date(s3Status.lastModified).toLocaleString()}`
        );
      }
    } else {
      console.log(`❌ Bucket Error: ${s3Status.error}`);
    }

    // CloudFront Status
    console.log('\n🌐 CloudFront Distribution Status');
    console.log('-'.repeat(35));
    const cfStatus = await this.getCloudFrontStatus(config.distributionId);
    if (cfStatus.status !== 'error') {
      console.log(`✅ Distribution: ${config.distributionId}`);
      console.log(`   Status: ${cfStatus.status}`);
      console.log(`   Domain: ${cfStatus.domainName}`);
      console.log(`   Enabled: ${cfStatus.enabled ? 'Yes' : 'No'}`);
      console.log(`   Price Class: ${cfStatus.priceClass}`);
      console.log(
        `   Last Modified: ${cfStatus.lastModified.toLocaleString()}`
      );
      console.log(`   Origins: ${cfStatus.origins.length}`);
    } else {
      console.log(`❌ CloudFront Error: ${cfStatus.error}`);
    }

    // Metrics
    console.log('\n📊 Performance Metrics (24h)');
    console.log('-'.repeat(30));
    const metrics = await this.getDeploymentMetrics(
      config.distributionId,
      config.bucketName
    );
    if (!metrics.error) {
      console.log(
        `   CloudFront Requests: ${metrics.cloudfront.requests24h.toLocaleString()}`
      );
      console.log(`   S3 Objects: ${metrics.s3.objectCount}`);
    } else {
      console.log(`❌ Metrics Error: ${metrics.error}`);
    }

    // Recent Deployments
    console.log('\n🔄 Recent Deployments');
    console.log('-'.repeat(25));
    const deployments = await this.getRecentDeployments();
    if (deployments.length > 0) {
      deployments.slice(0, 5).forEach(deployment => {
        const status = deployment.status === 'success' ? '✅' : '❌';
        const uptime = this.formatUptime(deployment.timestamp);
        console.log(
          `   ${status} ${deployment.version || 'Unknown'} - ${uptime} ago`
        );
      });
    } else {
      console.log('   No deployment history found');
    }

    // Health Summary
    console.log('\n🏥 Health Summary');
    console.log('-'.repeat(20));
    const healthScore = this.calculateHealthScore(s3Status, cfStatus, metrics);
    console.log(`   Overall Health: ${healthScore.score}/100`);
    console.log(`   Status: ${healthScore.status}`);

    if (healthScore.issues.length > 0) {
      console.log('\n⚠️  Issues Detected:');
      healthScore.issues.forEach(issue => {
        console.log(`   • ${issue}`);
      });
    }

    console.log('\n' + '='.repeat(60));
    console.log(`Dashboard generated at: ${new Date().toLocaleString()}`);
  }

  calculateHealthScore(s3Status, cfStatus, metrics) {
    let score = 100;
    const issues = [];

    // S3 health checks
    if (s3Status.status !== 'healthy') {
      score -= 30;
      issues.push('S3 bucket is not accessible');
    }
    if (s3Status.versioning !== 'Enabled') {
      score -= 10;
      issues.push('S3 versioning is not enabled');
    }
    if (s3Status.encryption !== 'Enabled') {
      score -= 10;
      issues.push('S3 encryption is not enabled');
    }

    // CloudFront health checks
    if (cfStatus.status === 'error') {
      score -= 40;
      issues.push('CloudFront distribution is not accessible');
    } else if (cfStatus.status !== 'Deployed') {
      score -= 20;
      issues.push('CloudFront distribution is not fully deployed');
    }
    if (!cfStatus.enabled) {
      score -= 20;
      issues.push('CloudFront distribution is disabled');
    }

    // Metrics health checks
    if (metrics.error) {
      score -= 10;
      issues.push('Unable to retrieve performance metrics');
    }

    const status =
      score >= 90
        ? '🟢 Excellent'
        : score >= 70
          ? '🟡 Good'
          : score >= 50
            ? '🟠 Fair'
            : '🔴 Poor';

    return { score, status, issues };
  }
}

// CLI execution
if (require.main === module) {
  const dashboard = new DeploymentStatusDashboard();
  dashboard.generateDashboard().catch(console.error);
}

module.exports = DeploymentStatusDashboard;
