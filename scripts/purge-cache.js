#!/usr/bin/env node

/**
 * Purge CloudFront Cache
 * Forces immediate cache invalidation for the about page and all content
 */

const { spawn } = require('child_process');

// Configuration
const DISTRIBUTION_ID =
  process.env.CLOUDFRONT_DISTRIBUTION_ID || 'E2IBMHQ3GCW6ZK';
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';

console.log('🔄 Purging CloudFront Cache');
console.log(`📡 Distribution ID: ${DISTRIBUTION_ID}`);
console.log(`🌍 Region: ${AWS_REGION}`);

/**
 * Execute AWS CLI command
 */
function executeAWSCommand(command, args) {
  return new Promise((resolve, reject) => {
    console.log(`🚀 Executing: aws ${command} ${args.join(' ')}`);

    const childProcess = spawn('aws', [command, ...args], {
      stdio: 'pipe',
      env: {
        ...process.env,
        AWS_DEFAULT_REGION: AWS_REGION,
      },
    });

    let stdout = '';
    let stderr = '';

    childProcess.stdout.on('data', data => {
      stdout += data.toString();
    });

    childProcess.stderr.on('data', data => {
      stderr += data.toString();
    });

    childProcess.on('close', code => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(new Error(`AWS CLI failed with code ${code}: ${stderr}`));
      }
    });

    childProcess.on('error', error => {
      reject(new Error(`Failed to execute AWS CLI: ${error.message}`));
    });
  });
}

/**
 * Create cache invalidation
 */
async function purgeCache() {
  try {
    // Create invalidation for all paths
    const callerReference = `purge-cache-${Date.now()}`;
    const invalidationBatch = JSON.stringify({
      Paths: {
        Quantity: 1,
        Items: ['/*'],
      },
      CallerReference: callerReference,
    });

    console.log('🧹 Creating cache invalidation for all paths (/*) ...');

    const result = await executeAWSCommand('cloudfront', [
      'create-invalidation',
      '--distribution-id',
      DISTRIBUTION_ID,
      '--invalidation-batch',
      invalidationBatch,
    ]);

    const invalidation = JSON.parse(result);

    console.log('✅ Cache invalidation created successfully!');
    console.log(`📋 Invalidation ID: ${invalidation.Invalidation.Id}`);
    console.log(`📊 Status: ${invalidation.Invalidation.Status}`);
    console.log(`🕒 Created: ${invalidation.Invalidation.CreateTime}`);
    console.log(
      `📁 Paths: ${invalidation.Invalidation.InvalidationBatch.Paths.Items.join(', ')}`
    );

    console.log(
      '\n⏱️  Cache purge typically takes 5-15 minutes to complete globally'
    );
    console.log('🌐 Your updated about page should be visible shortly at:');
    console.log('   https://d15sc9fc739ev2.cloudfront.net/about');
    console.log('\n💡 You can also try:');
    console.log('   - Hard refresh (Ctrl+F5 or Cmd+Shift+R)');
    console.log('   - Open in incognito/private browsing mode');
    console.log('   - Clear browser cache');
  } catch (error) {
    console.error('❌ Error purging cache:', error.message);

    if (error.message.includes('aws: command not found')) {
      console.log(
        '💡 AWS CLI not found. Please install AWS CLI or use alternative method.'
      );
      console.log(
        '   Alternative: Use AWS Console to create invalidation manually'
      );
      console.log(`   Distribution ID: ${DISTRIBUTION_ID}`);
      console.log('   Path to invalidate: /*');
    } else if (error.message.includes('credentials')) {
      console.log(
        '💡 AWS credentials not configured. Please run: aws configure'
      );
    } else {
      console.log('💡 Please check your AWS configuration and permissions.');
    }

    process.exit(1);
  }
}

// Run the cache purge
purgeCache();
