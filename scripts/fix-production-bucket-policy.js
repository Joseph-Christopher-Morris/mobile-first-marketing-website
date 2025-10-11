#!/usr/bin/env node

/**
 * Fix Production S3 Bucket Policy
 * 
 * This script fixes the overly restrictive S3 bucket policy to allow
 * deployment while maintaining security.
 */

const { S3Client, PutBucketPolicyCommand } = require('@aws-sdk/client-s3');
const { STSClient, GetCallerIdentityCommand } = require('@aws-sdk/client-sts');
const fs = require('fs');
const path = require('path');

async function fixBucketPolicy() {
  // Load production environment variables
  const envPath = path.join(process.cwd(), 'config', 'production.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value && !key.startsWith('#')) {
        process.env[key.trim()] = value.trim();
      }
    });
  }

  const bucketName = process.env.S3_BUCKET_NAME;
  const distributionId = process.env.CLOUDFRONT_DISTRIBUTION_ID;
  const accountId = process.env.AWS_ACCOUNT_ID;
  const region = process.env.AWS_REGION || 'us-east-1';

  if (!bucketName || !distributionId || !accountId) {
    console.error('Missing required environment variables');
    process.exit(1);
  }

  const s3Client = new S3Client({ region });
  const stsClient = new STSClient({ region });

  try {
    console.log('🔒 Fixing S3 bucket policy...');
    
    // Get current user identity
    const identity = await stsClient.send(new GetCallerIdentityCommand({}));
    const userArn = identity.Arn;
    
    console.log(`User ARN: ${userArn}`);
    console.log(`Account ID: ${accountId}`);
    console.log(`Bucket: ${bucketName}`);
    console.log(`Distribution: ${distributionId}`);

    // Create a more permissive bucket policy
    const bucketPolicy = {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'AllowCloudFrontServicePrincipal',
          Effect: 'Allow',
          Principal: {
            Service: 'cloudfront.amazonaws.com'
          },
          Action: 's3:GetObject',
          Resource: `arn:aws:s3:::${bucketName}/*`,
          Condition: {
            StringEquals: {
              'AWS:SourceArn': `arn:aws:cloudfront::${accountId}:distribution/${distributionId}`
            }
          }
        },
        {
          Sid: 'AllowOwnerFullAccess',
          Effect: 'Allow',
          Principal: {
            AWS: `arn:aws:iam::${accountId}:root`
          },
          Action: 's3:*',
          Resource: [
            `arn:aws:s3:::${bucketName}`,
            `arn:aws:s3:::${bucketName}/*`
          ]
        },
        {
          Sid: 'AllowUserDeploymentAccess',
          Effect: 'Allow',
          Principal: {
            AWS: userArn
          },
          Action: [
            's3:PutObject',
            's3:PutObjectAcl',
            's3:GetObject',
            's3:DeleteObject',
            's3:ListBucket'
          ],
          Resource: [
            `arn:aws:s3:::${bucketName}`,
            `arn:aws:s3:::${bucketName}/*`
          ]
        }
      ]
    };

    await s3Client.send(new PutBucketPolicyCommand({
      Bucket: bucketName,
      Policy: JSON.stringify(bucketPolicy, null, 2)
    }));

    console.log('✅ S3 bucket policy updated successfully');
    console.log('✅ Deployment should now work');
    
  } catch (error) {
    console.error('❌ Failed to fix bucket policy:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  fixBucketPolicy();
}

module.exports = fixBucketPolicy;