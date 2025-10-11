#!/usr/bin/env node

/**
 * CloudWatch Monitoring Setup Script
 * Creates CloudWatch dashboard, alarms, and budget alerts for S3/CloudFront deployment
 */

const { 
  CloudWatchClient, 
  PutDashboardCommand, 
  PutMetricAlarmCommand,
  ListDashboardsCommand 
} = require('@aws-sdk/client-cloudwatch');
const { 
  BudgetsClient, 
  CreateBudgetCommand,
  CreateSubscriberCommand 
} = require('@aws-sdk/client-budgets');
const fs = require('fs').promises;
const path = require('path');

class CloudWatchMonitoringSetup {
  constructor() {
    this.cloudwatch = new CloudWatchClient({ region: process.env.AWS_REGION || 'us-east-1' });
    this.budgets = new BudgetsClient({ region: 'us-east-1' }); // Budgets API only available in us-east-1
    this.config = null;
  }

  async loadConfig() {
    try {
      const configPath = path.join(__dirname, '..', 'config', 'monitoring-config.json');
      const configData = await fs.readFile(configPath, 'utf8');
      this.config = JSON.parse(configData);
      console.log('✅ Loaded monitoring configuration');
    } catch (error) {
      console.error('❌ Failed to load monitoring config:', error.message);
      throw error;
    }
  }

  async createCloudWatchDashboard() {
    const { bucketName, distributionId, environment } = this.config;
    
    const dashboardBody = {
      widgets: [
        {
          type: "metric",
          x: 0, y: 0, width: 12, height: 6,
          properties: {
            metrics: [
              ["AWS/CloudFront", "Requests", "DistributionId", distributionId],
              [".", "BytesDownloaded", ".", "."],
              [".", "4xxErrorRate", ".", "."],
              [".", "5xxErrorRate", ".", "."]
            ],
            period: 300,
            stat: "Sum",
            region: "us-east-1",
            title: "CloudFront Distribution Metrics",
            view: "timeSeries"
          }
        },
        {
          type: "metric",
          x: 12, y: 0, width: 12, height: 6,
          properties: {
            metrics: [
              ["AWS/S3", "BucketSizeBytes", "BucketName", bucketName, "StorageType", "StandardStorage"],
              [".", "NumberOfObjects", ".", ".", ".", "AllStorageTypes"]
            ],
            period: 86400,
            stat: "Average",
            region: process.env.AWS_REGION || 'us-east-1',
            title: "S3 Bucket Storage Metrics",
            view: "timeSeries"
          }
        },
        {
          type: "metric",
          x: 0, y: 6, width: 8, height: 6,
          properties: {
            metrics: [
              ["AWS/CloudFront", "CacheHitRate", "DistributionId", distributionId]
            ],
            period: 300,
            stat: "Average",
            region: "us-east-1",
            title: "CloudFront Cache Hit Rate",
            view: "timeSeries",
            yAxis: { left: { min: 0, max: 100 } }
          }
        },
        {
          type: "metric",
          x: 8, y: 6, width: 8, height: 6,
          properties: {
            metrics: [
              ["AWS/CloudFront", "OriginLatency", "DistributionId", distributionId]
            ],
            period: 300,
            stat: "Average",
            region: "us-east-1",
            title: "Origin Response Time",
            view: "timeSeries"
          }
        },
        {
          type: "log",
          x: 16, y: 6, width: 8, height: 6,
          properties: {
            query: `SOURCE '/aws/cloudfront/distribution/${distributionId}'\n| fields @timestamp, @message\n| filter @message like /ERROR/\n| sort @timestamp desc\n| limit 20`,
            region: "us-east-1",
            title: "Recent CloudFront Errors",
            view: "table"
          }
        }
      ]
    };

    const dashboardName = `${environment}-s3-cloudfront-monitoring`;
    
    try {
      const command = new PutDashboardCommand({
        DashboardName: dashboardName,
        DashboardBody: JSON.stringify(dashboardBody)
      });
      
      await this.cloudwatch.send(command);
      console.log(`✅ Created CloudWatch dashboard: ${dashboardName}`);
      
      return dashboardName;
    } catch (error) {
      console.error('❌ Failed to create CloudWatch dashboard:', error.message);
      throw error;
    }
  }

  async createCloudWatchAlarms() {
    const { distributionId, environment, alerting } = this.config;
    const alarms = [];

    // High error rate alarm
    const errorRateAlarm = {
      AlarmName: `${environment}-cloudfront-high-error-rate`,
      AlarmDescription: 'CloudFront 4xx/5xx error rate is too high',
      MetricName: '4xxErrorRate',
      Namespace: 'AWS/CloudFront',
      Statistic: 'Average',
      Dimensions: [{ Name: 'DistributionId', Value: distributionId }],
      Period: 300,
      EvaluationPeriods: 2,
      Threshold: alerting.errorRateThreshold || 5,
      ComparisonOperator: 'GreaterThanThreshold',
      AlarmActions: alerting.snsTopicArn ? [alerting.snsTopicArn] : [],
      TreatMissingData: 'notBreaching'
    };

    // Low cache hit rate alarm
    const cacheHitAlarm = {
      AlarmName: `${environment}-cloudfront-low-cache-hit-rate`,
      AlarmDescription: 'CloudFront cache hit rate is too low',
      MetricName: 'CacheHitRate',
      Namespace: 'AWS/CloudFront',
      Statistic: 'Average',
      Dimensions: [{ Name: 'DistributionId', Value: distributionId }],
      Period: 900,
      EvaluationPeriods: 3,
      Threshold: alerting.cacheHitRateThreshold || 80,
      ComparisonOperator: 'LessThanThreshold',
      AlarmActions: alerting.snsTopicArn ? [alerting.snsTopicArn] : [],
      TreatMissingData: 'notBreaching'
    };

    // High origin latency alarm
    const latencyAlarm = {
      AlarmName: `${environment}-cloudfront-high-origin-latency`,
      AlarmDescription: 'CloudFront origin latency is too high',
      MetricName: 'OriginLatency',
      Namespace: 'AWS/CloudFront',
      Statistic: 'Average',
      Dimensions: [{ Name: 'DistributionId', Value: distributionId }],
      Period: 300,
      EvaluationPeriods: 2,
      Threshold: alerting.latencyThreshold || 5000,
      ComparisonOperator: 'GreaterThanThreshold',
      AlarmActions: alerting.snsTopicArn ? [alerting.snsTopicArn] : [],
      TreatMissingData: 'notBreaching'
    };

    const alarmsToCreate = [errorRateAlarm, cacheHitAlarm, latencyAlarm];

    for (const alarm of alarmsToCreate) {
      try {
        const command = new PutMetricAlarmCommand(alarm);
        await this.cloudwatch.send(command);
        console.log(`✅ Created alarm: ${alarm.AlarmName}`);
        alarms.push(alarm.AlarmName);
      } catch (error) {
        console.error(`❌ Failed to create alarm ${alarm.AlarmName}:`, error.message);
        throw error;
      }
    }

    return alarms;
  }

  async createBudgetAlert() {
    const { environment, budget } = this.config;
    
    if (!budget || !budget.monthlyLimit) {
      console.log('⚠️ No budget configuration found, skipping budget alert creation');
      return null;
    }

    const budgetName = `${environment}-s3-cloudfront-budget`;
    
    const budgetDefinition = {
      BudgetName: budgetName,
      BudgetType: 'COST',
      TimeUnit: 'MONTHLY',
      BudgetLimit: {
        Amount: budget.monthlyLimit.toString(),
        Unit: 'USD'
      },
      CostFilters: {
        Service: ['Amazon Simple Storage Service', 'Amazon CloudFront']
      },
      TimePeriod: {
        Start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        End: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
      }
    };

    const subscribers = [];
    if (budget.alertEmail) {
      subscribers.push({
        SubscriptionType: 'EMAIL',
        Address: budget.alertEmail
      });
    }

    try {
      const createBudgetCommand = new CreateBudgetCommand({
        AccountId: process.env.AWS_ACCOUNT_ID,
        Budget: budgetDefinition,
        NotificationsWithSubscribers: subscribers.length > 0 ? [{
          Notification: {
            NotificationType: 'ACTUAL',
            ComparisonOperator: 'GREATER_THAN',
            Threshold: 80,
            ThresholdType: 'PERCENTAGE'
          },
          Subscribers: subscribers
        }] : []
      });

      await this.budgets.send(createBudgetCommand);
      console.log(`✅ Created budget alert: ${budgetName}`);
      
      return budgetName;
    } catch (error) {
      if (error.name === 'DuplicateRecordException') {
        console.log(`⚠️ Budget ${budgetName} already exists`);
        return budgetName;
      }
      console.error('❌ Failed to create budget alert:', error.message);
      throw error;
    }
  }

  async validateSetup() {
    try {
      // Check if dashboard exists
      const listCommand = new ListDashboardsCommand({});
      const dashboards = await this.cloudwatch.send(listCommand);
      
      const dashboardName = `${this.config.environment}-s3-cloudfront-monitoring`;
      const dashboardExists = dashboards.DashboardEntries?.some(
        dashboard => dashboard.DashboardName === dashboardName
      );

      if (dashboardExists) {
        console.log('✅ CloudWatch dashboard validation passed');
      } else {
        console.log('⚠️ CloudWatch dashboard not found');
      }

      return {
        dashboardExists,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Validation failed:', error.message);
      return { error: error.message };
    }
  }

  async run() {
    try {
      console.log('🚀 Setting up CloudWatch monitoring and dashboards...');
      
      await this.loadConfig();
      
      const dashboardName = await this.createCloudWatchDashboard();
      const alarms = await this.createCloudWatchAlarms();
      const budget = await this.createBudgetAlert();
      
      const validation = await this.validateSetup();
      
      const results = {
        success: true,
        dashboard: dashboardName,
        alarms,
        budget,
        validation,
        timestamp: new Date().toISOString()
      };

      console.log('\n✅ CloudWatch monitoring setup completed successfully!');
      console.log(`Dashboard: ${dashboardName}`);
      console.log(`Alarms created: ${alarms.length}`);
      if (budget) console.log(`Budget alert: ${budget}`);
      
      return results;
    } catch (error) {
      console.error('\n❌ CloudWatch monitoring setup failed:', error.message);
      throw error;
    }
  }
}

// Run if called directly
if (require.main === module) {
  const setup = new CloudWatchMonitoringSetup();
  setup.run()
    .then(results => {
      console.log('\nSetup completed:', JSON.stringify(results, null, 2));
      process.exit(0);
    })
    .catch(error => {
      console.error('Setup failed:', error);
      process.exit(1);
    });
}

module.exports = CloudWatchMonitoringSetup;