#!/usr/bin/env node

/**
 * Vivid Auto SCRAM Rebuild - Deployment Logger and Version Tracker
 * 
 * This script provides comprehensive deployment logging and version tracking
 * for the Vivid Auto Photography website rebuild project.
 * 
 * Features:
 * - Track deployment versions and metadata
 * - Log critical file version IDs
 * - Create deployment snapshots
 * - Generate operational runbooks
 * - Monitor deployment health
 */

const {
  S3Client,
  ListObjectVersionsCommand,
  PutObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
} = require('@aws-sdk/client-s3');
const {
  CloudFrontClient,
  GetDistributionCommand,
} = require('@aws-sdk/client-cloudfront');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');

class VividAutoDeploymentLogger {
  constructor() {
    // Vivid Auto SCRAM Infrastructure Configuration
    this.config = {
      bucket: process.env.S3_BUCKET_NAME || 'mobile-marketing-site-prod-1759705011281-tyzuo9',
      distributionId: process.env.CLOUDFRONT_DISTRIBUTION_ID || 'E2IBMHQ3GCW6ZK',
      region: process.env.AWS_REGION || 'us-east-1',
      domain: 'd15sc9fc739ev2.cloudfront.net',
      environment: process.env.ENVIRONMENT || 'production'
    };

    // Critical files for Vivid Auto website
    this.criticalFiles = [
      'index.html',
      'services/index.html',
      'blog/index.html',
      'contact/index.html',
      'services/photography/index.html',
      'services/analytics/index.html',
      'services/ad-campaigns/index.html',
      'privacy-policy/index.html',
      'sitemap.xml',
      'robots.txt'
    ];

    // Portfolio images that need tracking
    this.portfolioImages = [
      'images/services/250928-hampson-auctions-sunday-11.webp',
      'images/services/240217-australia-trip-232-1.webp',
      'images/services/240219-australia-trip-148.webp',
      'images/services/240619-london-19.webp',
      'images/services/240619-london-26-1.webp',
      'images/services/240619-london-64.webp',
      'images/services/250125-liverpool-40.webp'
    ];

    this.s3Client = new S3Client({ region: this.config.region });
    this.cloudFrontClient = new CloudFrontClient({ region: 'us-east-1' });

    this.logPrefix = 'deployment-logs/';
    this.versionPrefix = 'version-tracking/';
  }

  /**
   * Create a comprehensive deployment log entry
   */
  async logDeployment(deploymentType = 'manual', metadata = {}) {
    console.log('📝 Creating deployment log entry...');

    const timestamp = new Date().toISOString();
    const deploymentId = `deploy-${timestamp.replace(/[:.]/g, '-')}`;

    try {
      // Capture current state
      const deploymentLog = {
        id: deploymentId,
        timestamp: timestamp,
        type: deploymentType,
        environment: this.config.environment,
        infrastructure: {
          bucket: this.config.bucket,
          distributionId: this.config.distributionId,
          region: this.config.region,
          domain: this.config.domain
        },
        git: await this.captureGitState(),
        versions: await this.captureFileVersions(),
        portfolioImages: await this.captureImageVersions(),
        buildInfo: await this.captureBuildInfo(),
        metadata: metadata,
        health: await this.performHealthCheck(),
        integrity: await this.calculateDeploymentIntegrity()
      };

      // Save deployment log
      const logKey = `${this.logPrefix}${deploymentId}.json`;
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.config.bucket,
          Key: logKey,
          Body: JSON.stringify(deploymentLog, null, 2),
          ContentType: 'application/json',
          Metadata: {
            'deployment-id': deploymentId,
            'deployment-type': deploymentType,
            'environment': this.config.environment,
            'timestamp': timestamp
          }
        })
      );

      // Update latest deployment pointer
      await this.updateLatestDeploymentPointer(deploymentLog);

      // Create version tracking snapshot
      await this.createVersionSnapshot(deploymentLog);

      console.log('✅ Deployment logged successfully');
      console.log(`   Deployment ID: ${deploymentId}`);
      console.log(`   Log Key: ${logKey}`);
      console.log(`   Critical Files: ${Object.keys(deploymentLog.versions).length}`);
      console.log(`   Portfolio Images: ${Object.keys(deploymentLog.portfolioImages).length}`);

      return deploymentLog;
    } catch (error) {
      console.error('❌ Failed to log deployment:', error.message);
      throw error;
    }
  }

  /**
   * Capture current Git state
   */
  async captureGitState() {
    try {
      const gitState = {
        branch: this.execGitCommand('git rev-parse --abbrev-ref HEAD'),
        commit: this.execGitCommand('git rev-parse HEAD'),
        shortCommit: this.execGitCommand('git rev-parse --short HEAD'),
        message: this.execGitCommand('git log -1 --pretty=%B'),
        author: this.execGitCommand('git log -1 --pretty=%an'),
        email: this.execGitCommand('git log -1 --pretty=%ae'),
        date: this.execGitCommand('git log -1 --pretty=%ai'),
        status: this.execGitCommand('git status --porcelain'),
        tags: this.execGitCommand('git tag --points-at HEAD'),
        remoteUrl: this.execGitCommand('git config --get remote.origin.url')
      };

      return gitState;
    } catch (error) {
      console.warn('⚠️  Could not capture complete Git state:', error.message);
      return { error: error.message };
    }
  }

  /**
   * Execute Git command safely
   */
  execGitCommand(command) {
    try {
      return execSync(command, { encoding: 'utf8' }).trim();
    } catch (error) {
      return null;
    }
  }

  /**
   * Capture version IDs for all critical files
   */
  async captureFileVersions() {
    console.log('📋 Capturing file versions...');
    
    const versions = {};
    
    for (const file of this.criticalFiles) {
      try {
        const result = await this.s3Client.send(
          new ListObjectVersionsCommand({
            Bucket: this.config.bucket,
            Prefix: file,
            MaxKeys: 1
          })
        );

        if (result.Versions && result.Versions.length > 0) {
          const latestVersion = result.Versions.find(v => v.IsLatest) || result.Versions[0];
          versions[file] = {
            versionId: latestVersion.VersionId,
            lastModified: latestVersion.LastModified,
            etag: latestVersion.ETag,
            size: latestVersion.Size,
            storageClass: latestVersion.StorageClass
          };
        }
      } catch (error) {
        console.warn(`⚠️  Could not get version for ${file}:`, error.message);
        versions[file] = { error: error.message };
      }
    }

    return versions;
  }

  /**
   * Capture version IDs for portfolio images
   */
  async captureImageVersions() {
    console.log('🖼️  Capturing image versions...');
    
    const imageVersions = {};
    
    for (const image of this.portfolioImages) {
      try {
        const result = await this.s3Client.send(
          new ListObjectVersionsCommand({
            Bucket: this.config.bucket,
            Prefix: image,
            MaxKeys: 1
          })
        );

        if (result.Versions && result.Versions.length > 0) {
          const latestVersion = result.Versions.find(v => v.IsLatest) || result.Versions[0];
          imageVersions[image] = {
            versionId: latestVersion.VersionId,
            lastModified: latestVersion.LastModified,
            etag: latestVersion.ETag,
            size: latestVersion.Size
          };
        }
      } catch (error) {
        console.warn(`⚠️  Could not get version for ${image}:`, error.message);
        imageVersions[image] = { error: error.message };
      }
    }

    return imageVersions;
  }

  /**
   * Capture build information
   */
  async captureBuildInfo() {
    const buildInfo = {
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch
    };

    try {
      // Try to read package.json
      if (fs.existsSync('package.json')) {
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        buildInfo.packageVersion = packageJson.version;
        buildInfo.dependencies = {
          next: packageJson.dependencies?.next,
          react: packageJson.dependencies?.react,
          tailwindcss: packageJson.devDependencies?.tailwindcss
        };
      }

      // Try to read build output info
      if (fs.existsSync('out')) {
        const outStats = fs.statSync('out');
        buildInfo.buildOutput = {
          created: outStats.birthtime,
          modified: outStats.mtime,
          size: this.getDirectorySize('out')
        };
      }

      // Capture Next.js build info if available
      if (fs.existsSync('.next/build-manifest.json')) {
        const buildManifest = JSON.parse(fs.readFileSync('.next/build-manifest.json', 'utf8'));
        buildInfo.nextjs = {
          buildId: buildManifest.devFiles ? 'development' : 'production',
          pages: Object.keys(buildManifest.pages || {}).length
        };
      }

    } catch (error) {
      buildInfo.error = error.message;
    }

    return buildInfo;
  }

  /**
   * Get directory size recursively
   */
  getDirectorySize(dirPath) {
    let totalSize = 0;
    
    try {
      const files = fs.readdirSync(dirPath);
      
      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);
        
        if (stats.isDirectory()) {
          totalSize += this.getDirectorySize(filePath);
        } else {
          totalSize += stats.size;
        }
      }
    } catch (error) {
      // Ignore errors for inaccessible directories
    }
    
    return totalSize;
  }

  /**
   * Perform basic health check
   */
  async performHealthCheck() {
    console.log('🔍 Performing health check...');
    
    const healthCheck = {
      timestamp: new Date().toISOString(),
      checks: {}
    };

    // Check S3 bucket accessibility
    try {
      await this.s3Client.send(
        new HeadObjectCommand({
          Bucket: this.config.bucket,
          Key: 'index.html'
        })
      );
      healthCheck.checks.s3Access = { status: 'pass', message: 'S3 bucket accessible' };
    } catch (error) {
      healthCheck.checks.s3Access = { status: 'fail', message: error.message };
    }

    // Check CloudFront distribution
    try {
      const result = await this.cloudFrontClient.send(
        new GetDistributionCommand({
          Id: this.config.distributionId
        })
      );
      healthCheck.checks.cloudfront = { 
        status: 'pass', 
        message: `Distribution status: ${result.Distribution.Status}`,
        enabled: result.Distribution.DistributionConfig.Enabled
      };
    } catch (error) {
      healthCheck.checks.cloudfront = { status: 'fail', message: error.message };
    }

    // Check critical files exist
    let criticalFilesCount = 0;
    for (const file of this.criticalFiles.slice(0, 5)) { // Check first 5 to avoid rate limits
      try {
        await this.s3Client.send(
          new HeadObjectCommand({
            Bucket: this.config.bucket,
            Key: file
          })
        );
        criticalFilesCount++;
      } catch (error) {
        // File doesn't exist or not accessible
      }
    }

    healthCheck.checks.criticalFiles = {
      status: criticalFilesCount > 0 ? 'pass' : 'fail',
      message: `${criticalFilesCount}/5 critical files accessible`
    };

    return healthCheck;
  }

  /**
   * Calculate deployment integrity hash
   */
  async calculateDeploymentIntegrity() {
    try {
      const integrityData = {
        bucket: this.config.bucket,
        distributionId: this.config.distributionId,
        timestamp: new Date().toISOString(),
        criticalFiles: this.criticalFiles.sort(),
        portfolioImages: this.portfolioImages.sort()
      };

      const integrityString = JSON.stringify(integrityData);
      return crypto.createHash('sha256').update(integrityString).digest('hex');
    } catch (error) {
      return null;
    }
  }

  /**
   * Update latest deployment pointer
   */
  async updateLatestDeploymentPointer(deploymentLog) {
    const pointerKey = 'deployment-logs/latest.json';
    
    const pointer = {
      latestDeployment: deploymentLog.id,
      timestamp: deploymentLog.timestamp,
      type: deploymentLog.type,
      environment: deploymentLog.environment,
      git: {
        commit: deploymentLog.git?.commit,
        shortCommit: deploymentLog.git?.shortCommit,
        branch: deploymentLog.git?.branch
      }
    };

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.config.bucket,
        Key: pointerKey,
        Body: JSON.stringify(pointer, null, 2),
        ContentType: 'application/json'
      })
    );
  }

  /**
   * Create version tracking snapshot
   */
  async createVersionSnapshot(deploymentLog) {
    const snapshotKey = `${this.versionPrefix}${deploymentLog.id}-versions.json`;
    
    const snapshot = {
      deploymentId: deploymentLog.id,
      timestamp: deploymentLog.timestamp,
      environment: deploymentLog.environment,
      versions: deploymentLog.versions,
      portfolioImages: deploymentLog.portfolioImages,
      git: deploymentLog.git,
      integrity: deploymentLog.integrity
    };

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.config.bucket,
        Key: snapshotKey,
        Body: JSON.stringify(snapshot, null, 2),
        ContentType: 'application/json',
        Metadata: {
          'snapshot-type': 'version-tracking',
          'deployment-id': deploymentLog.id,
          'environment': deploymentLog.environment
        }
      })
    );

    console.log(`📸 Version snapshot created: ${snapshotKey}`);
  }

  /**
   * Get deployment history
   */
  async getDeploymentHistory(limit = 10) {
    console.log('📚 Retrieving deployment history...');
    
    try {
      const result = await this.s3Client.send(
        new ListObjectVersionsCommand({
          Bucket: this.config.bucket,
          Prefix: this.logPrefix,
          MaxKeys: limit * 2 // Get more to filter JSON files
        })
      );

      if (!result.Versions) {
        return [];
      }

      // Filter for JSON log files and sort by date
      const logFiles = result.Versions
        .filter(obj => obj.Key.endsWith('.json') && obj.Key !== `${this.logPrefix}latest.json`)
        .sort((a, b) => new Date(b.LastModified) - new Date(a.LastModified))
        .slice(0, limit);

      const deployments = [];

      for (const logFile of logFiles) {
        try {
          const logResult = await this.s3Client.send(
            new GetObjectCommand({
              Bucket: this.config.bucket,
              Key: logFile.Key
            })
          );

          const logContent = await logResult.Body.transformToString();
          const deployment = JSON.parse(logContent);
          deployments.push(deployment);
        } catch (error) {
          console.warn(`⚠️  Could not read log file ${logFile.Key}:`, error.message);
        }
      }

      return deployments;
    } catch (error) {
      console.error('❌ Failed to retrieve deployment history:', error.message);
      return [];
    }
  }

  /**
   * Generate operational runbook
   */
  async generateOperationalRunbook() {
    console.log('📖 Generating operational runbook...');

    const deployments = await this.getDeploymentHistory(5);
    const latestDeployment = deployments[0];

    const runbook = {
      title: 'Vivid Auto SCRAM Rebuild - Operational Runbook',
      generated: new Date().toISOString(),
      environment: this.config.environment,
      infrastructure: this.config,
      
      currentDeployment: latestDeployment ? {
        id: latestDeployment.id,
        timestamp: latestDeployment.timestamp,
        type: latestDeployment.type,
        git: latestDeployment.git,
        health: latestDeployment.health
      } : null,

      criticalFileVersions: latestDeployment?.versions || {},
      
      rollbackProcedures: {
        emergencyRollback: {
          description: 'Rollback all critical files to previous versions',
          command: 'powershell -ExecutionPolicy Bypass -File scripts/vivid-auto-rollback.ps1 -Action emergency',
          estimatedTime: '5-10 minutes'
        },
        selectiveRollback: {
          description: 'Rollback specific file to target version',
          command: 'powershell -ExecutionPolicy Bypass -File scripts/vivid-auto-rollback.ps1 -Action rollback -File "index.html" -VersionId "VERSION_ID"',
          estimatedTime: '2-5 minutes'
        }
      },

      verificationProcedures: {
        healthCheck: {
          description: 'Verify website deployment and content',
          command: 'powershell -ExecutionPolicy Bypass -File scripts/vivid-auto-rollback.ps1 -Action verify',
          estimatedTime: '1-2 minutes'
        },
        manualChecks: [
          'Visit https://d15sc9fc739ev2.cloudfront.net/ - verify home page loads',
          'Check services page - verify all 7 portfolio images load',
          'Test contact form - verify all fields present and functional',
          'Verify blog page - confirm Flyers ROI article is visible',
          'Check brand compliance - no gradients or prohibited colors'
        ]
      },

      troubleshooting: {
        commonIssues: [
          {
            issue: 'Website not loading',
            solution: 'Check CloudFront distribution status and S3 bucket accessibility'
          },
          {
            issue: 'Images not loading (404 errors)',
            solution: 'Verify image file names match kebab-case format and exist in S3'
          },
          {
            issue: 'Brand colors incorrect',
            solution: 'Check for prohibited CSS classes (gradients, indigo, purple, yellow)'
          },
          {
            issue: 'Contact form not working',
            solution: 'Verify form structure matches original specification'
          }
        ]
      },

      contacts: {
        primarySupport: 'Development Team',
        escalation: 'Technical Lead',
        documentation: 'docs/vivid-auto-rollback-procedures.md'
      },

      recentDeployments: deployments.slice(0, 3).map(d => ({
        id: d.id,
        timestamp: d.timestamp,
        type: d.type,
        git: d.git?.shortCommit,
        status: d.health?.checks ? 'healthy' : 'unknown'
      }))
    };

    // Save runbook to S3
    const runbookKey = 'operational-runbook.json';
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.config.bucket,
        Key: runbookKey,
        Body: JSON.stringify(runbook, null, 2),
        ContentType: 'application/json',
        Metadata: {
          'document-type': 'operational-runbook',
          'generated': new Date().toISOString(),
          'environment': this.config.environment
        }
      })
    );

    // Also save as markdown for easy reading
    const markdownRunbook = this.convertRunbookToMarkdown(runbook);
    const markdownKey = 'operational-runbook.md';
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.config.bucket,
        Key: markdownKey,
        Body: markdownRunbook,
        ContentType: 'text/markdown'
      })
    );

    console.log('✅ Operational runbook generated');
    console.log(`   JSON: ${runbookKey}`);
    console.log(`   Markdown: ${markdownKey}`);

    return runbook;
  }

  /**
   * Convert runbook to markdown format
   */
  convertRunbookToMarkdown(runbook) {
    let markdown = `# ${runbook.title}\n\n`;
    markdown += `**Generated:** ${new Date(runbook.generated).toLocaleString()}\n`;
    markdown += `**Environment:** ${runbook.environment}\n\n`;

    // Infrastructure
    markdown += `## Infrastructure\n\n`;
    markdown += `- **S3 Bucket:** ${runbook.infrastructure.bucket}\n`;
    markdown += `- **CloudFront Distribution:** ${runbook.infrastructure.distributionId}\n`;
    markdown += `- **Domain:** ${runbook.infrastructure.domain}\n`;
    markdown += `- **Region:** ${runbook.infrastructure.region}\n\n`;

    // Current Deployment
    if (runbook.currentDeployment) {
      markdown += `## Current Deployment\n\n`;
      markdown += `- **ID:** ${runbook.currentDeployment.id}\n`;
      markdown += `- **Timestamp:** ${new Date(runbook.currentDeployment.timestamp).toLocaleString()}\n`;
      markdown += `- **Type:** ${runbook.currentDeployment.type}\n`;
      if (runbook.currentDeployment.git?.shortCommit) {
        markdown += `- **Git Commit:** ${runbook.currentDeployment.git.shortCommit}\n`;
      }
      markdown += `\n`;
    }

    // Critical File Versions
    markdown += `## Critical File Versions\n\n`;
    for (const [file, version] of Object.entries(runbook.criticalFileVersions)) {
      if (version.versionId) {
        markdown += `- **${file}:** ${version.versionId.substring(0, 8)}... (${new Date(version.lastModified).toLocaleString()})\n`;
      }
    }
    markdown += `\n`;

    // Rollback Procedures
    markdown += `## Rollback Procedures\n\n`;
    markdown += `### Emergency Rollback\n`;
    markdown += `${runbook.rollbackProcedures.emergencyRollback.description}\n\n`;
    markdown += `\`\`\`powershell\n${runbook.rollbackProcedures.emergencyRollback.command}\n\`\`\`\n\n`;
    markdown += `**Estimated Time:** ${runbook.rollbackProcedures.emergencyRollback.estimatedTime}\n\n`;

    markdown += `### Selective Rollback\n`;
    markdown += `${runbook.rollbackProcedures.selectiveRollback.description}\n\n`;
    markdown += `\`\`\`powershell\n${runbook.rollbackProcedures.selectiveRollback.command}\n\`\`\`\n\n`;
    markdown += `**Estimated Time:** ${runbook.rollbackProcedures.selectiveRollback.estimatedTime}\n\n`;

    // Verification
    markdown += `## Verification Procedures\n\n`;
    markdown += `### Automated Health Check\n`;
    markdown += `\`\`\`powershell\n${runbook.verificationProcedures.healthCheck.command}\n\`\`\`\n\n`;

    markdown += `### Manual Verification Checklist\n\n`;
    for (const check of runbook.verificationProcedures.manualChecks) {
      markdown += `- [ ] ${check}\n`;
    }
    markdown += `\n`;

    // Troubleshooting
    markdown += `## Troubleshooting\n\n`;
    for (const item of runbook.troubleshooting.commonIssues) {
      markdown += `### ${item.issue}\n`;
      markdown += `**Solution:** ${item.solution}\n\n`;
    }

    // Recent Deployments
    markdown += `## Recent Deployments\n\n`;
    for (const deployment of runbook.recentDeployments) {
      markdown += `- **${deployment.id}** (${new Date(deployment.timestamp).toLocaleString()}) - ${deployment.type}`;
      if (deployment.git) {
        markdown += ` - ${deployment.git}`;
      }
      markdown += `\n`;
    }

    return markdown;
  }

  /**
   * Format bytes to human readable format
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// CLI Interface
async function main() {
  const logger = new VividAutoDeploymentLogger();
  const command = process.argv[2];
  const arg = process.argv[3];

  try {
    switch (command) {
      case 'log':
        const deploymentType = arg || 'manual';
        const metadata = {
          triggeredBy: process.env.USER || 'unknown',
          buildNumber: process.env.BUILD_NUMBER || null,
          ciSystem: process.env.CI ? 'automated' : 'manual'
        };
        await logger.logDeployment(deploymentType, metadata);
        break;

      case 'history':
        const limit = parseInt(arg) || 10;
        const deployments = await logger.getDeploymentHistory(limit);
        
        console.log(`\n📚 Deployment History (${deployments.length} entries):`);
        console.log('='.repeat(80));
        
        for (const deployment of deployments) {
          console.log(`ID: ${deployment.id}`);
          console.log(`Date: ${new Date(deployment.timestamp).toLocaleString()}`);
          console.log(`Type: ${deployment.type}`);
          if (deployment.git?.shortCommit) {
            console.log(`Git: ${deployment.git.shortCommit} - ${deployment.git.message}`);
          }
          console.log(`Files: ${Object.keys(deployment.versions || {}).length}`);
          console.log('-'.repeat(60));
        }
        break;

      case 'runbook':
        await logger.generateOperationalRunbook();
        break;

      case 'health':
        const healthCheck = await logger.performHealthCheck();
        console.log('\n🔍 Health Check Results:');
        console.log('='.repeat(40));
        
        for (const [check, result] of Object.entries(healthCheck.checks)) {
          const status = result.status === 'pass' ? '✅' : '❌';
          console.log(`${status} ${check}: ${result.message}`);
        }
        break;

      case 'versions':
        const versions = await logger.captureFileVersions();
        console.log('\n📋 Current File Versions:');
        console.log('='.repeat(60));
        
        for (const [file, version] of Object.entries(versions)) {
          if (version.versionId) {
            console.log(`${file}: ${version.versionId.substring(0, 8)}... (${new Date(version.lastModified).toLocaleString()})`);
          } else {
            console.log(`${file}: Error - ${version.error}`);
          }
        }
        break;

      default:
        console.log(`
📝 Vivid Auto SCRAM Deployment Logger

Usage:
  node vivid-auto-deployment-logger.js <command> [options]

Commands:
  log [type]       Create deployment log entry (type: manual, auto, rollback)
  history [limit]  Show deployment history (default: 10 entries)
  runbook         Generate operational runbook
  health          Perform health check
  versions        Show current file versions

Examples:
  node vivid-auto-deployment-logger.js log manual
  node vivid-auto-deployment-logger.js history 5
  node vivid-auto-deployment-logger.js runbook
  node vivid-auto-deployment-logger.js health
  node vivid-auto-deployment-logger.js versions

Environment Variables:
  S3_BUCKET_NAME              - S3 bucket name (default: mobile-marketing-site-prod-1759705011281-tyzuo9)
  CLOUDFRONT_DISTRIBUTION_ID  - CloudFront distribution ID (default: E2IBMHQ3GCW6ZK)
  AWS_REGION                  - AWS region (default: us-east-1)
  ENVIRONMENT                 - Environment name (default: production)
        `);
        break;
    }
  } catch (error) {
    console.error('❌ Operation failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = VividAutoDeploymentLogger;