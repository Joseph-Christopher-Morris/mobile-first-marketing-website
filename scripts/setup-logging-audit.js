#!/usr/bin/env node

/**
 * Logging and Audit Trail Setup Script
 * Configures S3 access logging, CloudTrail, and log aggregation
 */

const { 
  S3Client, 
  PutBucketLoggingCommand,
  CreateBucketCommand,
  PutBucketPolicyCommand,
  GetBucketLoggingCommand,
  HeadBucketCommand
} = require('@aws-sdk/client-s3');
const { 
  CloudTrailClient, 
  CreateTrailCommand,
  StartLoggingCommand,
  GetTrailStatusCommand,
  DescribeTrailsCommand
} = require('@aws-sdk/client-cloudtrail');
const { 
  CloudWatchLogsClient,
  CreateLogGroupCommand,
  CreateLogStreamCommand,
  DescribeLogGroupsCommand
} = require('@aws-sdk/client-cloudwatch-logs');
const fs = require('fs').promises;
const path = require('path');

class LoggingAuditSetup {
  constructor() {
    this.s3 = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });
    this.cloudtrail = new CloudTrailClient({ region: process.env.AWS_REGION || 'us-east-1' });
    this.cloudwatchLogs = new CloudWatchLogsClient({ region: process.env.AWS_REGION || 'us-east-1' });
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

  async createLogsBucket() {
    const { logging } = this.config;
    const logsBucketName = logging.s3AccessLogging.targetBucket || `${this.config.bucketName}-logs`;

    try {
      // Check if bucket exists
      await this.s3.send(new HeadBucketCommand({ Bucket: logsBucketName }));
      console.log(`✅ Logs bucket ${logsBucketName} already exists`);
      return logsBucketName;
    } catch (error) {
      if (error.name !== 'NotFound') {
        throw error;
      }
    }

    try {
      // Create logs bucket
      const createCommand = new CreateBucketCommand({
        Bucket: logsBucketName,
        CreateBucketConfiguration: {
          LocationConstraint: process.env.AWS_REGION !== 'us-east-1' ? process.env.AWS_REGION : undefined
        }
      });
      
      await this.s3.send(createCommand);
      console.log(`✅ Created logs bucket: ${logsBucketName}`);

      // Set bucket policy for S3 access logging
      const bucketPolicy = {
        Version: '2012-10-17',
        Statement: [
          {
            Sid: 'S3ServerAccessLogsPolicy',
            Effect: 'Allow',
            Principal: { Service: 's3.amazonaws.com' },
            Action: 's3:PutObject',
            Resource: `arn:aws:s3:::${logsBucketName}/*`,
            Condition: {
              ArnLike: {
                'aws:SourceArn': `arn:aws:s3:::${this.config.bucketName}`
              }
            }
          },
          {
            Sid: 'S3ServerAccessLogsDelivery',
            Effect: 'Allow',
            Principal: { Service: 's3.amazonaws.com' },
            Action: 's3:PutObjectAcl',
            Resource: `arn:aws:s3:::${logsBucketName}/*`,
            Condition: {
              ArnLike: {
                'aws:SourceArn': `arn:aws:s3:::${this.config.bucketName}`
              }
            }
          }
        ]
      };

      const policyCommand = new PutBucketPolicyCommand({
        Bucket: logsBucketName,
        Policy: JSON.stringify(bucketPolicy)
      });

      await this.s3.send(policyCommand);
      console.log(`✅ Set bucket policy for logs bucket: ${logsBucketName}`);

      return logsBucketName;
    } catch (error) {
      console.error(`❌ Failed to create logs bucket ${logsBucketName}:`, error.message);
      throw error;
    }
  }

  async enableS3AccessLogging() {
    const { bucketName, logging } = this.config;
    
    if (!logging.s3AccessLogging.enabled) {
      console.log('⚠️ S3 access logging is disabled in config');
      return null;
    }

    const logsBucketName = await this.createLogsBucket();
    const targetPrefix = logging.s3AccessLogging.targetPrefix || 'access-logs/';

    try {
      const loggingConfig = {
        LoggingEnabled: {
          TargetBucket: logsBucketName,
          TargetPrefix: targetPrefix
        }
      };

      const command = new PutBucketLoggingCommand({
        Bucket: bucketName,
        BucketLoggingStatus: loggingConfig
      });

      await this.s3.send(command);
      console.log(`✅ Enabled S3 access logging for ${bucketName} -> ${logsBucketName}/${targetPrefix}`);

      return { logsBucketName, targetPrefix };
    } catch (error) {
      console.error('❌ Failed to enable S3 access logging:', error.message);
      throw error;
    }
  }

  async setupCloudTrail() {
    const { logging, environment } = this.config;
    
    if (!logging.cloudTrail.enabled) {
      console.log('⚠️ CloudTrail is disabled in config');
      return null;
    }

    const trailName = `${environment}-s3-cloudfront-trail`;
    const s3BucketName = logging.cloudTrail.s3BucketName || `${this.config.bucketName}-cloudtrail`;

    try {
      // Check if trail already exists
      const describeCommand = new DescribeTrailsCommand({ trailNameList: [trailName] });
      const existingTrails = await this.cloudtrail.send(describeCommand);
      
      if (existingTrails.trailList && existingTrails.trailList.length > 0) {
        console.log(`✅ CloudTrail ${trailName} already exists`);
        return trailName;
      }
    } catch (error) {
      // Trail doesn't exist, continue with creation
    }

    try {
      // Create CloudTrail bucket if it doesn't exist
      try {
        await this.s3.send(new HeadBucketCommand({ Bucket: s3BucketName }));
        console.log(`✅ CloudTrail bucket ${s3BucketName} already exists`);
      } catch (error) {
        if (error.name === 'NotFound') {
          const createBucketCommand = new CreateBucketCommand({
            Bucket: s3BucketName,
            CreateBucketConfiguration: {
              LocationConstraint: process.env.AWS_REGION !== 'us-east-1' ? process.env.AWS_REGION : undefined
            }
          });
          
          await this.s3.send(createBucketCommand);
          console.log(`✅ Created CloudTrail bucket: ${s3BucketName}`);

          // Set bucket policy for CloudTrail
          const bucketPolicy = {
            Version: '2012-10-17',
            Statement: [
              {
                Sid: 'AWSCloudTrailAclCheck',
                Effect: 'Allow',
                Principal: { Service: 'cloudtrail.amazonaws.com' },
                Action: 's3:GetBucketAcl',
                Resource: `arn:aws:s3:::${s3BucketName}`
              },
              {
                Sid: 'AWSCloudTrailWrite',
                Effect: 'Allow',
                Principal: { Service: 'cloudtrail.amazonaws.com' },
                Action: 's3:PutObject',
                Resource: `arn:aws:s3:::${s3BucketName}/*`,
                Condition: {
                  StringEquals: {
                    's3:x-amz-acl': 'bucket-owner-full-control'
                  }
                }
              }
            ]
          };

          const policyCommand = new PutBucketPolicyCommand({
            Bucket: s3BucketName,
            Policy: JSON.stringify(bucketPolicy)
          });

          await this.s3.send(policyCommand);
          console.log(`✅ Set bucket policy for CloudTrail bucket: ${s3BucketName}`);
        } else {
          throw error;
        }
      }

      // Create CloudTrail
      const createTrailCommand = new CreateTrailCommand({
        Name: trailName,
        S3BucketName: s3BucketName,
        S3KeyPrefix: 'cloudtrail-logs/',
        IncludeGlobalServiceEvents: logging.cloudTrail.includeGlobalServices,
        IsMultiRegionTrail: logging.cloudTrail.isMultiRegionTrail,
        EnableLogFileValidation: true
      });

      await this.cloudtrail.send(createTrailCommand);
      console.log(`✅ Created CloudTrail: ${trailName}`);

      // Start logging
      const startLoggingCommand = new StartLoggingCommand({ Name: trailName });
      await this.cloudtrail.send(startLoggingCommand);
      console.log(`✅ Started CloudTrail logging: ${trailName}`);

      return trailName;
    } catch (error) {
      console.error('❌ Failed to setup CloudTrail:', error.message);
      throw error;
    }
  }

  async setupCloudWatchLogGroups() {
    const { environment } = this.config;
    const logGroups = [
      `/aws/s3/${this.config.bucketName}`,
      `/aws/cloudfront/distribution/${this.config.distributionId}`,
      `/aws/deployment/${environment}`
    ];

    const createdGroups = [];

    for (const logGroupName of logGroups) {
      try {
        // Check if log group exists
        const describeCommand = new DescribeLogGroupsCommand({
          logGroupNamePrefix: logGroupName
        });
        const existingGroups = await this.cloudwatchLogs.send(describeCommand);
        
        const groupExists = existingGroups.logGroups?.some(
          group => group.logGroupName === logGroupName
        );

        if (groupExists) {
          console.log(`✅ Log group ${logGroupName} already exists`);
          continue;
        }

        // Create log group
        const createCommand = new CreateLogGroupCommand({
          logGroupName,
          retentionInDays: 30
        });

        await this.cloudwatchLogs.send(createCommand);
        console.log(`✅ Created CloudWatch log group: ${logGroupName}`);
        createdGroups.push(logGroupName);

        // Create initial log stream
        const streamName = `${environment}-${Date.now()}`;
        const createStreamCommand = new CreateLogStreamCommand({
          logGroupName,
          logStreamName: streamName
        });

        await this.cloudwatchLogs.send(createStreamCommand);
        console.log(`✅ Created log stream: ${streamName}`);

      } catch (error) {
        console.error(`❌ Failed to setup log group ${logGroupName}:`, error.message);
        throw error;
      }
    }

    return createdGroups;
  }

  async createLogAnalysisScript() {
    const logAnalysisScript = `#!/usr/bin/env node

/**
 * Log Analysis Script
 * Analyzes S3 access logs and CloudTrail logs for insights
 */

const { S3Client, GetObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const { CloudWatchLogsClient, FilterLogEventsCommand } = require('@aws-sdk/client-cloudwatch-logs');

class LogAnalyzer {
  constructor() {
    this.s3 = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });
    this.cloudwatchLogs = new CloudWatchLogsClient({ region: process.env.AWS_REGION || 'us-east-1' });
  }

  async analyzeS3AccessLogs(bucketName, prefix = 'access-logs/', hours = 24) {
    const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    try {
      const listCommand = new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: prefix,
        StartAfter: prefix + startTime.toISOString().split('T')[0]
      });

      const objects = await this.s3.send(listCommand);
      
      if (!objects.Contents || objects.Contents.length === 0) {
        console.log('No access logs found for the specified time period');
        return { requests: 0, errors: 0, bandwidth: 0 };
      }

      let totalRequests = 0;
      let totalErrors = 0;
      let totalBandwidth = 0;
      const ipAddresses = new Set();
      const userAgents = new Set();

      for (const object of objects.Contents) {
        const getCommand = new GetObjectCommand({
          Bucket: bucketName,
          Key: object.Key
        });

        const response = await this.s3.send(getCommand);
        const logContent = await response.Body.transformToString();
        
        const lines = logContent.split('\\n').filter(line => line.trim());
        
        for (const line of lines) {
          const parts = line.split(' ');
          if (parts.length >= 10) {
            totalRequests++;
            
            const statusCode = parts[8];
            const bytes = parseInt(parts[9]) || 0;
            const ip = parts[4];
            const userAgent = parts.slice(11).join(' ').replace(/"/g, '');
            
            if (statusCode.startsWith('4') || statusCode.startsWith('5')) {
              totalErrors++;
            }
            
            totalBandwidth += bytes;
            ipAddresses.add(ip);
            userAgents.add(userAgent);
          }
        }
      }

      return {
        requests: totalRequests,
        errors: totalErrors,
        errorRate: totalRequests > 0 ? (totalErrors / totalRequests * 100).toFixed(2) : 0,
        bandwidth: totalBandwidth,
        uniqueIPs: ipAddresses.size,
        uniqueUserAgents: userAgents.size,
        period: \`\${hours} hours\`
      };
    } catch (error) {
      console.error('Error analyzing S3 access logs:', error.message);
      throw error;
    }
  }

  async analyzeCloudTrailLogs(logGroupName, hours = 24) {
    const startTime = Date.now() - hours * 60 * 60 * 1000;
    const endTime = Date.now();

    try {
      const filterCommand = new FilterLogEventsCommand({
        logGroupName,
        startTime,
        endTime,
        filterPattern: '{ $.eventSource = "s3.amazonaws.com" || $.eventSource = "cloudfront.amazonaws.com" }'
      });

      const events = await this.cloudwatchLogs.send(filterCommand);
      
      if (!events.events || events.events.length === 0) {
        console.log('No CloudTrail events found for the specified time period');
        return { events: 0, users: 0, actions: {} };
      }

      const users = new Set();
      const actions = {};
      let totalEvents = 0;

      for (const event of events.events) {
        try {
          const eventData = JSON.parse(event.message);
          totalEvents++;
          
          if (eventData.userIdentity && eventData.userIdentity.userName) {
            users.add(eventData.userIdentity.userName);
          }
          
          if (eventData.eventName) {
            actions[eventData.eventName] = (actions[eventData.eventName] || 0) + 1;
          }
        } catch (parseError) {
          // Skip malformed events
        }
      }

      return {
        events: totalEvents,
        users: users.size,
        actions,
        period: \`\${hours} hours\`
      };
    } catch (error) {
      console.error('Error analyzing CloudTrail logs:', error.message);
      throw error;
    }
  }

  async generateReport(config) {
    console.log('🔍 Generating log analysis report...');
    
    const s3Analysis = await this.analyzeS3AccessLogs(
      config.logging.s3AccessLogging.targetBucket,
      config.logging.s3AccessLogging.targetPrefix
    );
    
    const cloudTrailAnalysis = await this.analyzeCloudTrailLogs(
      \`/aws/cloudtrail/\${config.environment}\`
    );

    const report = {
      timestamp: new Date().toISOString(),
      s3AccessLogs: s3Analysis,
      cloudTrailLogs: cloudTrailAnalysis
    };

    console.log('\\n📊 Log Analysis Report');
    console.log('========================');
    console.log(\`S3 Access Logs (\${s3Analysis.period}):\`);
    console.log(\`  Total Requests: \${s3Analysis.requests}\`);
    console.log(\`  Error Rate: \${s3Analysis.errorRate}%\`);
    console.log(\`  Bandwidth: \${(s3Analysis.bandwidth / 1024 / 1024).toFixed(2)} MB\`);
    console.log(\`  Unique IPs: \${s3Analysis.uniqueIPs}\`);
    
    console.log(\`\\nCloudTrail Logs (\${cloudTrailAnalysis.period}):\`);
    console.log(\`  Total Events: \${cloudTrailAnalysis.events}\`);
    console.log(\`  Unique Users: \${cloudTrailAnalysis.users}\`);
    console.log(\`  Top Actions:\`, Object.entries(cloudTrailAnalysis.actions)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([action, count]) => \`\${action}: \${count}\`)
      .join(', ')
    );

    return report;
  }
}

// Run if called directly
if (require.main === module) {
  const fs = require('fs').promises;
  const path = require('path');
  
  async function run() {
    try {
      const configPath = path.join(__dirname, '..', 'config', 'monitoring-config.json');
      const configData = await fs.readFile(configPath, 'utf8');
      const config = JSON.parse(configData);
      
      const analyzer = new LogAnalyzer();
      const report = await analyzer.generateReport(config);
      
      // Save report
      const reportPath = path.join(__dirname, '..', 'logs', \`analysis-report-\${Date.now()}.json\`);
      await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
      console.log(\`\\n📄 Report saved to: \${reportPath}\`);
      
    } catch (error) {
      console.error('Analysis failed:', error.message);
      process.exit(1);
    }
  }
  
  run();
}

module.exports = LogAnalyzer;`;

    const scriptPath = path.join(__dirname, 'analyze-logs.js');
    await fs.writeFile(scriptPath, logAnalysisScript);
    console.log(`✅ Created log analysis script: ${scriptPath}`);
    
    return scriptPath;
  }

  async validateLoggingSetup() {
    const { bucketName, logging } = this.config;
    const validation = {
      s3AccessLogging: false,
      cloudTrail: false,
      logGroups: false,
      timestamp: new Date().toISOString()
    };

    try {
      // Validate S3 access logging
      if (logging.s3AccessLogging.enabled) {
        const loggingCommand = new GetBucketLoggingCommand({ Bucket: bucketName });
        const loggingConfig = await this.s3.send(loggingCommand);
        validation.s3AccessLogging = !!loggingConfig.LoggingEnabled;
      }

      // Validate CloudTrail
      if (logging.cloudTrail.enabled) {
        const trailName = `${this.config.environment}-s3-cloudfront-trail`;
        const statusCommand = new GetTrailStatusCommand({ Name: trailName });
        const trailStatus = await this.cloudtrail.send(statusCommand);
        validation.cloudTrail = trailStatus.IsLogging;
      }

      // Validate log groups
      const describeCommand = new DescribeLogGroupsCommand({});
      const logGroups = await this.cloudwatchLogs.send(describeCommand);
      validation.logGroups = logGroups.logGroups && logGroups.logGroups.length > 0;

      console.log('✅ Logging setup validation completed');
      return validation;
    } catch (error) {
      console.error('❌ Validation failed:', error.message);
      return { ...validation, error: error.message };
    }
  }

  async run() {
    try {
      console.log('🚀 Setting up logging and audit trail...');
      
      await this.loadConfig();
      
      const s3Logging = await this.enableS3AccessLogging();
      const cloudTrail = await this.setupCloudTrail();
      const logGroups = await this.setupCloudWatchLogGroups();
      const analysisScript = await this.createLogAnalysisScript();
      
      const validation = await this.validateLoggingSetup();
      
      const results = {
        success: true,
        s3AccessLogging: s3Logging,
        cloudTrail,
        logGroups,
        analysisScript,
        validation,
        timestamp: new Date().toISOString()
      };

      console.log('\\n✅ Logging and audit trail setup completed successfully!');
      if (s3Logging) console.log(\`S3 Access Logging: \${s3Logging.logsBucketName}/\${s3Logging.targetPrefix}\`);
      if (cloudTrail) console.log(\`CloudTrail: \${cloudTrail}\`);
      console.log(\`Log Groups: \${logGroups.length} created\`);
      console.log(\`Analysis Script: \${analysisScript}\`);
      
      return results;
    } catch (error) {
      console.error('\\n❌ Logging and audit trail setup failed:', error.message);
      throw error;
    }
  }
}

// Run if called directly
if (require.main === module) {
  const setup = new LoggingAuditSetup();
  setup.run()
    .then(results => {
      console.log('\\nSetup completed:', JSON.stringify(results, null, 2));
      process.exit(0);
    })
    .catch(error => {
      console.error('Setup failed:', error);
      process.exit(1);
    });
}

module.exports = LoggingAuditSetup;