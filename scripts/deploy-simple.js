#!/usr/bin/env node

/**
 * Simple S3 Deployment Script
 * 
 * Quick deployment to S3 without CloudFront complexity
 */

const { execSync } = require('child_process');
const fs = require('fs');

// Configuration - CHANGE THIS TO YOUR UNIQUE BUCKET NAME
const BUCKET_NAME = 'your-site-name-' + Math.random().toString(36).substring(7);
const REGION = 'us-east-1';

function log(message) {
  console.log(`🚀 ${message}`);
}

function runCommand(command) {
  try {
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`❌ Command failed: ${command}`);
    return false;
  }
}

function main() {
  log('Starting simple S3 deployment...');
  
  // Check if build exists
  if (!fs.existsSync('out')) {
    console.error('❌ Build directory "out" not found. Run "npm run build" first.');
    process.exit(1);
  }
  
  // Create bucket
  log(`Creating bucket: ${BUCKET_NAME}`);
  runCommand(`aws s3 mb s3://${BUCKET_NAME} --region ${REGION}`);
  
  // Upload files
  log('Uploading files...');
  runCommand(`aws s3 sync out/ s3://${BUCKET_NAME} --delete`);
  
  // Configure for static hosting
  log('Configuring static website hosting...');
  runCommand(`aws s3 website s3://${BUCKET_NAME} --index-document index.html --error-document index.html`);
  
  // Make public
  const policy = {
    "Version": "2012-10-17",
    "Statement": [{
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": `arn:aws:s3:::${BUCKET_NAME}/*`
    }]
  };
  
  fs.writeFileSync('policy.json', JSON.stringify(policy));
  runCommand(`aws s3api put-bucket-policy --bucket ${BUCKET_NAME} --policy file://policy.json`);
  fs.unlinkSync('policy.json');
  
  const url = `http://${BUCKET_NAME}.s3-website-${REGION}.amazonaws.com`;
  
  log('✅ Deployment complete!');
  log(`🌐 Your site is live at: ${url}`);
  log(`📝 Bucket name: ${BUCKET_NAME}`);
}

main();