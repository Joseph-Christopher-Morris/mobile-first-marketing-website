const fs = require('fs');
const path = require('path');

console.log('🔍 AWS Amplify Environment Variable Validator');
console.log('==============================================\n');

// Required environment variables for production
const requiredVars = [
  'NEXT_PUBLIC_SITE_URL',
  'NEXT_PUBLIC_SITE_NAME',
  'CONTACT_EMAIL',
  'NODE_ENV',
];

// Recommended environment variables
const recommendedVars = [
  'NEXT_PUBLIC_GA_ID',
  'NEXT_PUBLIC_GTM_ID',
  'NEXT_PUBLIC_SITE_DESCRIPTION',
];

// Check if .env.example exists
const envExamplePath = path.join(process.cwd(), '.env.example');
if (!fs.existsSync(envExamplePath)) {
  console.log('❌ .env.example file not found');
  process.exit(1);
}

// Load environment variables
const envContent = fs.readFileSync(envExamplePath, 'utf8');
const lines = envContent.split('\n');
const envVars = new Map();

lines.forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
    const [key, ...valueParts] = trimmed.split('=');
    const value = valueParts.join('=');
    if (key && value) {
      envVars.set(key.trim(), value.trim());
    }
  }
});

console.log(`✅ Loaded ${envVars.size} variables from .env.example\n`);

// Validate required variables
console.log('🔍 Validating required variables...');
const missing = [];
const placeholders = [];

requiredVars.forEach(varName => {
  if (!envVars.has(varName)) {
    missing.push(varName);
  } else {
    const value = envVars.get(varName);
    if (
      value.includes('your-domain.com') ||
      value.includes('XXXXXXXXXX') ||
      value.includes('yourcompany') ||
      value.includes('Your Marketing Website')
    ) {
      placeholders.push(`${varName}=${value}`);
    }
  }
});

if (missing.length > 0) {
  console.log('   ❌ Missing required variables:');
  missing.forEach(varName => console.log(`      - ${varName}`));
} else {
  console.log('   ✅ All required variables are present');
}

if (placeholders.length > 0) {
  console.log('   ⚠️  Variables with placeholder values:');
  placeholders.forEach(placeholder => console.log(`      - ${placeholder}`));
} else {
  console.log('   ✅ No placeholder values detected');
}

// Check recommended variables
console.log('\n🔍 Checking recommended variables...');
const missingRecommended = [];

recommendedVars.forEach(varName => {
  if (!envVars.has(varName) || !envVars.get(varName)) {
    missingRecommended.push(varName);
  }
});

if (missingRecommended.length > 0) {
  console.log('   ⚠️  Missing recommended variables:');
  missingRecommended.forEach(varName => console.log(`      - ${varName}`));
} else {
  console.log('   ✅ All recommended variables are configured');
}

// Validate Amplify-specific configuration
console.log('\n🔍 Validating Amplify configuration...');

// Check amplify.yml exists
const amplifyYmlPath = path.join(process.cwd(), 'amplify.yml');
if (fs.existsSync(amplifyYmlPath)) {
  const amplifyContent = fs.readFileSync(amplifyYmlPath, 'utf8');

  if (amplifyContent.includes('export NEXT_PUBLIC_SITE_URL=$AMPLIFY_APP_URL')) {
    console.log('   ✅ Dynamic site URL configuration found in amplify.yml');
  } else {
    console.log('   ⚠️  Dynamic site URL not configured in amplify.yml');
  }

  if (amplifyContent.includes('npm run env:validate')) {
    console.log('   ✅ Environment validation configured in build process');
  } else {
    console.log(
      '   ⚠️  Environment validation not configured in build process'
    );
  }
} else {
  console.log('   ❌ amplify.yml not found');
}

// Summary
console.log('\n📊 Validation Summary:');
console.log('======================');

const totalIssues = missing.length + placeholders.length;
if (totalIssues === 0) {
  console.log('✅ Environment configuration is ready for AWS Amplify!');
  console.log('\nNext steps:');
  console.log('1. Run: npm run amplify:env-generate');
  console.log('2. Copy the generated variables to AWS Amplify Console');
  console.log('3. Deploy your application');
} else {
  console.log(`❌ Found ${totalIssues} issues that need to be resolved:`);
  if (missing.length > 0) {
    console.log(`   - ${missing.length} missing required variables`);
  }
  if (placeholders.length > 0) {
    console.log(
      `   - ${placeholders.length} variables with placeholder values`
    );
  }
  console.log('\nPlease fix these issues before deploying to production.');
}

// Exit with appropriate code
process.exit(totalIssues > 0 ? 1 : 0);
