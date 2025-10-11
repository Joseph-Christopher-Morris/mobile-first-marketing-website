#!/usr/bin/env node

/**
 * AWS S3 + CloudFront Deployment Script
 * 
 * This script deploys your Next.js static export to S3 with CloudFront distribution.
 * Much more reliable than fighting Amplify's Next.js detection.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  bucketName: 'mobile-first-marketing-website-static', // Change this to your unique bucket name
  region: 'us-east-1',
  indexDocument: 'index.html',
  errorDocument: 'index.html', // For SPA routing
  buildDir: 'out'
};

function log(message) {
  console.log(`[DEPLOY] ${message}`);
}

function runCommand(command, description) {
  log(description);
  try {
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`Failed: ${description}`);
    console.error(error.message);
    return false;
  }
}

function checkPrerequisites() {
  log('Checking prerequisites...');
  
  // Check if AWS CLI is installed
  try {
    execSync('aws --version', { stdio: 'pipe' });
  } catch (error) {
    console.error('AWS CLI is not installed. Please install it first:');
    console.error('https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html');
    process.exit(1);
  }
  
  // Check if build directory exists
  if (!fs.existsSync(CONFIG.buildDir)) {
    console.error(`Build directory '${CONFIG.buildDir}' not found. Run 'npm run build' first.`);
    process.exit(1);
  }
  
  log('Prerequisites check passed!');
}

function createS3Bucket() {
  log(`Creating S3 bucket: ${CONFIG.bucketName}`);
  
  // Create bucket
  const createBucketCmd = `aws s3 mb s3://${CONFIG.bucketName} --region ${CONFIG.region}`;
  if (!runCommand(createBucketCmd, 'Creating S3 bucket')) {
    log('Bucket might already exist, continuing...');
  }
  
  // Configure bucket for static website hosting
  const websiteCmd = `aws s3 website s3://${CONFIG.bucketName} --index-document ${CONFIG.indexDocument} --error-document ${CONFIG.errorDocument}`;
  runCommand(websiteCmd, 'Configuring bucket for static website hosting');
  
  // Set bucket policy for public read access
  const bucketPolicy = {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Sid": "PublicReadGetObject",
        "Effect": "Allow",
        "Principal": "*",
        "Action": "s3:GetObject",
        "Resource": `arn:aws:s3:::${CONFIG.bucketName}/*`
      }
    ]
  };
  
  const policyFile = 'bucket-policy.json';
  fs.writeFileSync(policyFile, JSON.stringify(bucketPolicy, null, 2));
  
  const policyCmd = `aws s3api put-bucket-policy --bucket ${CONFIG.bucketName} --policy file://${policyFile}`;
  runCommand(policyCmd, 'Setting bucket policy for public access');
  
  // Clean up policy file
  fs.unlinkSync(policyFile);
}

function uploadFiles() {
  log('Uploading files to S3...');
  
  const syncCmd = `aws s3 sync ${CONFIG.buildDir}/ s3://${CONFIG.bucketName} --delete --cache-control "public, max-age=31536000" --exclude "*.html" --exclude "*.json"`;
  runCommand(syncCmd, 'Uploading static assets with long cache');
  
  const htmlCmd = `aws s3 sync ${CONFIG.buildDir}/ s3://${CONFIG.bucketName} --delete --cache-control "public, max-age=0, must-revalidate" --include "*.html" --include "*.json"`;
  runCommand(htmlCmd, 'Uploading HTML files with no cache');
}

function getWebsiteUrl() {
  const websiteUrl = `http://${CONFIG.bucketName}.s3-website-${CONFIG.region}.amazonaws.com`;
  log(`Website URL: ${websiteUrl}`);
  return websiteUrl;
}

function createCloudFrontDistribution() {
  log('Creating CloudFront distribution...');
  
  const distributionConfig = {
    "CallerReference": `${CONFIG.bucketName}-${Date.now()}`,
    "Comment": `CloudFront distribution for ${CONFIG.bucketName}`,
    "DefaultCacheBehavior": {
      "TargetOriginId": CONFIG.bucketName,
      "ViewerProtocolPolicy": "redirect-to-https",
      "TrustedSigners": {
        "Enabled": false,
        "Quantity": 0
      },
      "ForwardedValues": {
        "QueryString": false,
        "Cookies": {
          "Forward": "none"
        }
      },
      "MinTTL": 0,
      "DefaultTTL": 86400,
      "MaxTTL": 31536000
    },
    "Origins": {
      "Quantity": 1,
      "Items": [
        {
          "Id": CONFIG.bucketName,
          "DomainName": `${CONFIG.bucketName}.s3-website-${CONFIG.region}.amazonaws.com`,
          "CustomOriginConfig": {
            "HTTPPort": 80,
            "HTTPSPort": 443,
            "OriginProtocolPolicy": "http-only"
          }
        }
      ]
    },
    "Enabled": true,
    "DefaultRootObject": "index.html",
    "CustomErrorResponses": {
      "Quantity": 1,
      "Items": [
        {
          "ErrorCode": 404,
          "ResponsePagePath": "/index.html",
          "ResponseCode": "200",
          "ErrorCachingMinTTL": 300
        }
      ]
    }
  };
  
  const configFile = 'cloudfront-config.json';
  fs.writeFileSync(configFile, JSON.stringify(distributionConfig, null, 2));
  
  const createCmd = `aws cloudfront create-distribution --distribution-config file://${configFile}`;
  runCommand(createCmd, 'Creating CloudFront distribution');
  
  // Clean up config file
  fs.unlinkSync(configFile);
  
  log('CloudFront distribution created! It may take 15-20 minutes to deploy globally.');
}

function main() {
  log('Starting AWS S3 + CloudFront deployment...');
  
  checkPrerequisites();
  createS3Bucket();
  uploadFiles();
  
  const websiteUrl = getWebsiteUrl();
  
  log('\\n=== Deployment Complete! ===');
  log(`S3 Website URL: ${websiteUrl}`);
  log('\\nOptional: Create CloudFront distribution for HTTPS and global CDN');
  log('Run with --cloudfront flag to create CloudFront distribution automatically');
  
  // Check if CloudFront flag is provided
  if (process.argv.includes('--cloudfront')) {
    createCloudFrontDistribution();
  }
}

if (require.main === module) {
  main();
}

module.exports = { main, CONFIG };