#!/usr/bin/env node

/**
 * Production Environment Validation Script for AWS Amplify Deployment
 * Validates all required environment variables for production deployment
 */

console.log('🔍 Validating production environment configuration...\n');

const fs = require('fs');
const path = require('path');

// Load environment variables from .env.production if it exists
function loadEnvFile(filePath) {
  if (fs.existsSync(filePath)) {
    const envContent = fs.readFileSync(filePath, 'utf8');
    const envVars = {};

    envContent.split('\n').forEach(line => {
      line = line.trim();
      if (line && !line.startsWith('#') && line.includes('=')) {
        const [key, ...valueParts] = line.split('=');
        const value = valueParts.join('=').trim();
        if (
          value &&
          !value.startsWith('your-') &&
          !value.includes('XXXXXXXXXX')
        ) {
          envVars[key.trim()] = value;
        }
      }
    });

    return envVars;
  }
  return {};
}

// Load production environment variables
const prodEnvVars = loadEnvFile('.env.production');
console.log(
  `📁 Loaded ${Object.keys(prodEnvVars).length} variables from .env.production\n`
);

// Required environment variables for production
const requiredEnvVars = {
  // Site Configuration (Required)
  NEXT_PUBLIC_SITE_URL: {
    required: true,
    description: 'Production site URL',
    example: 'https://your-domain.com',
  },
  NEXT_PUBLIC_SITE_NAME: {
    required: true,
    description: 'Site name for SEO and branding',
    example: 'Your Marketing Website',
  },
  NEXT_PUBLIC_SITE_DESCRIPTION: {
    required: true,
    description: 'Site description for SEO',
    example: 'Mobile-first marketing website...',
  },

  // Contact Configuration (Required)
  CONTACT_EMAIL: {
    required: true,
    description: 'Email for contact form submissions',
    example: 'contact@your-domain.com',
  },

  // Analytics (Optional but recommended)
  NEXT_PUBLIC_GA_ID: {
    required: false,
    description: 'Google Analytics ID',
    example: 'G-XXXXXXXXXX',
  },
  NEXT_PUBLIC_GTM_ID: {
    required: false,
    description: 'Google Tag Manager ID',
    example: 'GTM-XXXXXXX',
  },

  // Build Configuration
  NODE_ENV: {
    required: true,
    description: 'Node environment',
    example: 'production',
    defaultValue: 'production',
  },
  NEXT_TELEMETRY_DISABLED: {
    required: false,
    description: 'Disable Next.js telemetry',
    example: '1',
    defaultValue: '1',
  },
};

// Optional environment variables
const optionalEnvVars = [
  'NEXT_PUBLIC_FACEBOOK_PIXEL_ID',
  'NEXT_PUBLIC_HOTJAR_ID',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS',
  'NEXT_PUBLIC_FACEBOOK_URL',
  'NEXT_PUBLIC_TWITTER_URL',
  'NEXT_PUBLIC_LINKEDIN_URL',
  'NEXT_PUBLIC_INSTAGRAM_URL',
];

let hasErrors = false;
let hasWarnings = false;

console.log('📋 Required Environment Variables:');
console.log('================================\n');

// Check required variables
Object.entries(requiredEnvVars).forEach(([varName, config]) => {
  const value =
    process.env[varName] || prodEnvVars[varName] || config.defaultValue;

  if (config.required && !value) {
    console.log(`❌ ${varName}: MISSING (Required)`);
    console.log(`   Description: ${config.description}`);
    console.log(`   Example: ${config.example}\n`);
    hasErrors = true;
  } else if (config.required && value) {
    // Validate specific formats
    if (varName === 'NEXT_PUBLIC_SITE_URL' && !value.startsWith('http')) {
      console.log(`⚠️  ${varName}: ${value} (Should start with http/https)`);
      hasWarnings = true;
    } else if (varName === 'CONTACT_EMAIL' && !value.includes('@')) {
      console.log(`⚠️  ${varName}: ${value} (Should be a valid email)`);
      hasWarnings = true;
    } else {
      console.log(`✅ ${varName}: ${value}`);
    }
  } else if (!config.required && value) {
    console.log(`✅ ${varName}: ${value} (Optional)`);
  } else {
    console.log(`⚪ ${varName}: Not set (Optional)`);
  }
});

console.log('\n📋 Optional Environment Variables:');
console.log('=================================\n');

optionalEnvVars.forEach(varName => {
  const value = process.env[varName] || prodEnvVars[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value}`);
  } else {
    console.log(`⚪ ${varName}: Not set`);
  }
});

// AWS Amplify specific checks
console.log('\n🏗️  AWS Amplify Configuration:');
console.log('=============================\n');

const amplifyVars = {
  AWS_APP_ID: process.env.AWS_APP_ID || process.env._AMPLIFY_APP_ID,
  AWS_REGION: process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION,
  AMPLIFY_BRANCH: process.env.AMPLIFY_BRANCH || 'main',
};

Object.entries(amplifyVars).forEach(([key, value]) => {
  if (value) {
    console.log(`✅ ${key}: ${value}`);
  } else {
    console.log(`⚪ ${key}: Will be set by Amplify`);
  }
});

// Check for .env files
console.log('\n📁 Environment Files:');
console.log('====================\n');

const envFiles = ['.env.local', '.env.production', '.env'];
envFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}: Found`);
  } else {
    console.log(`⚪ ${file}: Not found`);
  }
});

// Summary
console.log('\n📊 Validation Summary:');
console.log('=====================\n');

if (hasErrors) {
  console.log('❌ VALIDATION FAILED: Missing required environment variables');
  console.log('   Please set the missing variables before deployment.\n');

  console.log('💡 Quick Setup Guide:');
  console.log('   1. Copy .env.example to .env.production');
  console.log('   2. Update the values in .env.production');
  console.log('   3. Add these variables to AWS Amplify console\n');

  process.exit(1);
} else if (hasWarnings) {
  console.log('⚠️  VALIDATION PASSED WITH WARNINGS');
  console.log('   Please review the warnings above.\n');
} else {
  console.log('✅ VALIDATION PASSED');
  console.log('   All required environment variables are configured.\n');
}

console.log('🚀 Ready for AWS Amplify deployment!');
