#!/usr/bin/env node

/**
 * Visual Polish Deployment Script - November 11, 2025
 * 
 * Deploys the following changes:
 * - Text-only PressStrip component (no images)
 * - Simplified hero sections (home + photography)
 * - Pink background pricing section
 * 
 * Usage: node scripts/deploy-visual-polish-nov-11.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration from steering rules
const S3_BUCKET = process.env.S3_BUCKET_NAME || 'mobile-marketing-site-prod-1759705011281-tyzuo9';
const CLOUDFRONT_DIST = process.env.CLOUDFRONT_DISTRIBUTION_ID || 'E2IBMHQ3GCW6ZK';
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function execCommand(command, description) {
  log(`\n${description}...`, 'cyan');
  try {
    execSync(command, { stdio: 'inherit' });
    log(`✓ ${description} complete`, 'green');
    return true;
  } catch (error) {
    log(`✗ ${description} failed`, 'red');
    throw error;
  }
}

function validateEnvironment() {
  log('\n=== Environment Validation ===', 'bright');
  
  const required = [
    { name: 'S3_BUCKET_NAME', value: S3_BUCKET },
    { name: 'CLOUDFRONT_DISTRIBUTION_ID', value: CLOUDFRONT_DIST },
    { name: 'AWS_REGION', value: AWS_REGION },
  ];

  let allValid = true;
  required.forEach(({ name, value }) => {
    if (value) {
      log(`✓ ${name}: ${value}`, 'green');
    } else {
      log(`✗ ${name}: NOT SET`, 'red');
      allValid = false;
    }
  });

  if (!allValid) {
    log('\n⚠ Missing required environment variables', 'red');
    log('Set them in your environment or .env file', 'yellow');
    process.exit(1);
  }

  log('\n✓ Environment validation passed', 'green');
}

function validateChanges() {
  log('\n=== Validating Changes ===', 'bright');
  
  const filesToCheck = [
    'src/components/credibility/PressStrip.tsx',
    'src/components/HeroWithCharts.tsx',
    'src/app/services/photography/page.tsx',
    'src/app/page.tsx',
  ];

  let allExist = true;
  filesToCheck.forEach(file => {
    const exists = fs.existsSync(file);
    if (exists) {
      log(`✓ ${file}`, 'green');
    } else {
      log(`✗ ${file} not found`, 'red');
      allExist = false;
    }
  });

  if (!allExist) {
    log('\n⚠ Some files are missing', 'red');
    process.exit(1);
  }

  log('\n✓ All modified files present', 'green');
}

function cleanBuild() {
  log('\n=== Cleaning Previous Build ===', 'bright');
  
  const outDir = path.join(process.cwd(), 'out');
  if (fs.existsSync(outDir)) {
    log('Removing existing out/ directory...', 'yellow');
    fs.rmSync(outDir, { recursive: true, force: true });
    log('✓ Clean complete', 'green');
  } else {
    log('No previous build found', 'yellow');
  }
}

function buildSite() {
  log('\n=== Building Site ===', 'bright');
  execCommand('npm run build', 'Next.js static export');
  
  // Verify build output
  const outDir = path.join(process.cwd(), 'out');
  if (!fs.existsSync(outDir)) {
    log('✗ Build output directory not found', 'red');
    process.exit(1);
  }
  
  const indexPath = path.join(outDir, 'index.html');
  if (!fs.existsSync(indexPath)) {
    log('✗ index.html not found in build output', 'red');
    process.exit(1);
  }
  
  log('✓ Build output validated', 'green');
}

function deployToS3() {
  log('\n=== Deploying to S3 ===', 'bright');
  
  const syncCommand = `aws s3 sync out/ s3://${S3_BUCKET}/ --delete --region ${AWS_REGION}`;
  execCommand(syncCommand, 'S3 sync');
}

function invalidateCloudFront() {
  log('\n=== Invalidating CloudFront Cache ===', 'bright');
  
  // Invalidate all paths to ensure fresh content
  const invalidationPaths = [
    '/*',
  ];
  
  const pathsString = invalidationPaths.join(' ');
  const invalidateCommand = `aws cloudfront create-invalidation --distribution-id ${CLOUDFRONT_DIST} --paths ${pathsString}`;
  
  try {
    const output = execSync(invalidateCommand, { encoding: 'utf-8' });
    const invalidation = JSON.parse(output);
    const invalidationId = invalidation.Invalidation.Id;
    
    log(`✓ Invalidation created: ${invalidationId}`, 'green');
    log(`\nMonitor status with:`, 'cyan');
    log(`aws cloudfront get-invalidation --distribution-id ${CLOUDFRONT_DIST} --id ${invalidationId}`, 'yellow');
    
    return invalidationId;
  } catch (error) {
    log('✗ CloudFront invalidation failed', 'red');
    throw error;
  }
}

function createDeploymentSummary(invalidationId) {
  log('\n=== Creating Deployment Summary ===', 'bright');
  
  const timestamp = new Date().toISOString();
  const summary = {
    deployment: {
      timestamp,
      type: 'Visual Polish Updates',
      version: 'Nov 11, 2025',
    },
    changes: [
      'Text-only PressStrip component (removed image dependencies)',
      'Simplified home hero (removed variant prop)',
      'Simplified photography hero (removed variant prop)',
      'Pink background on pricing section (bg-pink-50)',
    ],
    infrastructure: {
      s3Bucket: S3_BUCKET,
      cloudFrontDistribution: CLOUDFRONT_DIST,
      region: AWS_REGION,
      invalidationId,
    },
    urls: {
      cloudFront: `https://d15sc9fc739ev2.cloudfront.net`,
      s3Console: `https://s3.console.aws.amazon.com/s3/buckets/${S3_BUCKET}`,
      cloudFrontConsole: `https://console.aws.amazon.com/cloudfront/v3/home#/distributions/${CLOUDFRONT_DIST}`,
    },
    verification: {
      steps: [
        'Check home page hero - text-only press strip',
        'Check photography page hero - text-only press strip',
        'Check pricing section - pink background',
        'Verify mobile responsiveness',
        'Test all CTA buttons',
      ],
    },
  };
  
  const summaryPath = 'DEPLOYMENT-SUMMARY-VISUAL-POLISH-NOV-11.json';
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  log(`✓ Summary saved to ${summaryPath}`, 'green');
  
  return summary;
}

function displayNextSteps(summary) {
  log('\n=== Deployment Complete ===', 'bright');
  log('\n🎉 Visual polish updates deployed successfully!', 'green');
  
  log('\n📋 Next Steps:', 'cyan');
  log('1. Wait 2-3 minutes for CloudFront invalidation to complete', 'yellow');
  log('2. Visit: https://d15sc9fc739ev2.cloudfront.net', 'yellow');
  log('3. Verify changes:', 'yellow');
  log('   - Home page: Text-only press strip in hero', 'yellow');
  log('   - Photography page: Text-only press strip in hero', 'yellow');
  log('   - Home page: Pink background on pricing section', 'yellow');
  log('4. Test on mobile devices', 'yellow');
  log('5. Check browser console for any errors', 'yellow');
  
  log('\n📊 Monitoring:', 'cyan');
  log(`CloudFront Console: ${summary.urls.cloudFrontConsole}`, 'blue');
  log(`S3 Console: ${summary.urls.s3Console}`, 'blue');
  
  log('\n🔄 Rollback (if needed):', 'cyan');
  log('node scripts/rollback.js list', 'yellow');
  log('node scripts/rollback.js rollback <backup-id>', 'yellow');
}

async function main() {
  try {
    log('\n╔════════════════════════════════════════════════════════╗', 'bright');
    log('║   Visual Polish Deployment - November 11, 2025        ║', 'bright');
    log('╚════════════════════════════════════════════════════════╝', 'bright');
    
    validateEnvironment();
    validateChanges();
    cleanBuild();
    buildSite();
    deployToS3();
    const invalidationId = invalidateCloudFront();
    const summary = createDeploymentSummary(invalidationId);
    displayNextSteps(summary);
    
    log('\n✅ Deployment pipeline completed successfully!', 'green');
    process.exit(0);
    
  } catch (error) {
    log('\n❌ Deployment failed', 'red');
    log(error.message, 'red');
    process.exit(1);
  }
}

main();
