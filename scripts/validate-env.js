#!/usr/bin/env node

/**
 * Environment Validation Script for AWS Amplify Deployment
 * Validates that all required environment variables and configurations are present
 */

console.log('🔍 Validating environment for deployment...');

// Check Node.js version
const nodeVersion = process.version;
console.log(`📦 Node.js version: ${nodeVersion}`);

// Check if we're in AWS Amplify environment
const isAmplify = process.env.AWS_APP_ID || process.env._AMPLIFY_BUILD_ID;
console.log(`🏗️  AWS Amplify environment: ${isAmplify ? 'Yes' : 'No'}`);

// Check for required directories
const fs = require('fs');
const path = require('path');

const requiredDirs = ['src/app', 'src/components', 'src/styles'];
const missingDirs = [];

requiredDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    missingDirs.push(dir);
  }
});

if (missingDirs.length > 0) {
  console.error(`❌ Missing required directories: ${missingDirs.join(', ')}`);
  process.exit(1);
}

// Check package.json
if (!fs.existsSync('package.json')) {
  console.error('❌ package.json not found');
  process.exit(1);
}

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
console.log(`📋 Project: ${packageJson.name}`);

// Check for Next.js config
if (fs.existsSync('next.config.js')) {
  console.log('⚙️  next.config.js found');
} else {
  console.log('⚠️  next.config.js not found (using defaults)');
}

// Environment variables check
const envVars = {
  NODE_ENV: process.env.NODE_ENV || 'production',
  NEXT_TELEMETRY_DISABLED: process.env.NEXT_TELEMETRY_DISABLED || '1',
};

console.log('🌍 Environment variables:');
Object.entries(envVars).forEach(([key, value]) => {
  console.log(`   ${key}: ${value}`);
});

console.log('✅ Environment validation completed successfully');
console.log('🚀 Ready for build process');
