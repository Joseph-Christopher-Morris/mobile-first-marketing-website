const fs = require('fs');
const path = require('path');

console.log('🚀 AWS Amplify Environment Variable Configuration');
console.log('================================================\n');

// Load .env.example
const envPath = path.join(process.cwd(), '.env.example');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env.example not found');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
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

// Set production values
envVars.set('NODE_ENV', 'production');
envVars.set('NEXT_TELEMETRY_DISABLED', '1');
envVars.set('NEXT_PUBLIC_SITE_URL', '$AMPLIFY_APP_URL');

console.log('📋 Environment Variables for AWS Amplify Console:');
console.log('=================================================\n');

// Core variables first
const coreVars = [
  'NEXT_PUBLIC_SITE_URL',
  'NEXT_PUBLIC_SITE_NAME',
  'NEXT_PUBLIC_SITE_DESCRIPTION',
  'CONTACT_EMAIL',
  'NODE_ENV',
  'NEXT_TELEMETRY_DISABLED',
];

console.log('# Core Configuration');
coreVars.forEach(key => {
  if (envVars.has(key)) {
    console.log(`${key}=${envVars.get(key)}`);
  }
});

console.log('\n# Analytics (Optional)');
const analyticsVars = ['NEXT_PUBLIC_GA_ID', 'NEXT_PUBLIC_GTM_ID'];
analyticsVars.forEach(key => {
  if (envVars.has(key)) {
    console.log(`${key}=${envVars.get(key)}`);
  }
});

console.log('\n# Social Media (Optional)');
const socialVars = [
  'NEXT_PUBLIC_FACEBOOK_URL',
  'NEXT_PUBLIC_TWITTER_URL',
  'NEXT_PUBLIC_LINKEDIN_URL',
  'NEXT_PUBLIC_INSTAGRAM_URL',
];
socialVars.forEach(key => {
  if (envVars.has(key)) {
    console.log(`${key}=${envVars.get(key)}`);
  }
});

console.log('\n📖 Setup Instructions:');
console.log('1. Copy the variables above');
console.log('2. Go to AWS Amplify Console > Your App > Environment variables');
console.log('3. Add each variable as key-value pairs');
console.log('4. Save and redeploy\n');

console.log('✅ Configuration ready for AWS Amplify!');
