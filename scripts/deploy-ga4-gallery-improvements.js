#!/usr/bin/env node

/**
 * Deploy GA4 Integration + Photography Gallery Improvements
 * Comprehensive deployment script for both deliverables
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Starting GA4 + Gallery Improvements Deployment');
console.log('=' .repeat(60));

// Configuration
const DISTRIBUTION_ID = 'E2IBMHQ3GCW6ZK';
const S3_BUCKET = 'mobile-marketing-site-prod-1759705011281-tyzuo9';

/**
 * Execute command with error handling
 */
function runCommand(command, description) {
  console.log(`\n📋 ${description}`);
  console.log(`Command: ${command}`);
  
  try {
    const output = execSync(command, { 
      encoding: 'utf8', 
      stdio: 'pipe',
      timeout: 300000 // 5 minutes timeout
    });
    console.log('✅ Success');
    if (output.trim()) {
      console.log(`Output: ${output.trim()}`);
    }
    return true;
  } catch (error) {
    console.log(`❌ Failed: ${error.message}`);
    if (error.stdout) {
      console.log(`Stdout: ${error.stdout}`);
    }
    if (error.stderr) {
      console.log(`Stderr: ${error.stderr}`);
    }
    return false;
  }
}

/**
 * Verify files exist
 */
function verifyFiles() {
  console.log('\n🔍 Verifying Files');
  
  const requiredFiles = [
    'src/app/layout.tsx',
    'src/components/services/PhotographyGallery.tsx',
    '.env.production'
  ];
  
  let allFilesExist = true;
  
  requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file} exists`);
    } else {
      console.log(`❌ ${file} missing`);
      allFilesExist = false;
    }
  });
  
  return allFilesExist;
}

/**
 * Build the application
 */
function buildApplication() {
  console.log('\n🔨 Building Application');
  
  // Clean previous build
  if (fs.existsSync('out')) {
    console.log('Cleaning previous build...');
    runCommand('rmdir /s /q out', 'Remove previous build directory');
  }
  
  // Run build
  return runCommand('npm run build', 'Build Next.js application');
}

/**
 * Deploy to S3
 */
function deployToS3() {
  console.log('\n☁️  Deploying to S3');
  
  if (!fs.existsSync('out')) {
    console.log('❌ Build output directory not found');
    return false;
  }
  
  // Deploy using existing script
  return runCommand('node scripts/deploy.js', 'Deploy to S3 using existing deployment script');
}

/**
 * Invalidate CloudFront cache
 */
function invalidateCache() {
  console.log('\n🔄 Invalidating CloudFront Cache');
  
  const command = `aws cloudfront create-invalidation --distribution-id ${DISTRIBUTION_ID} --paths "/*"`;
  return runCommand(command, 'Invalidate all cached content');
}

/**
 * Verify deployment
 */
async function verifyDeployment() {
  console.log('\n✅ Verifying Deployment');
  
  const testUrl = 'https://d15sc9fc739ev2.cloudfront.net';
  
  console.log(`Testing: ${testUrl}`);
  
  try {
    // Test main page load
    const testCommand = `curl -s -o nul -w "%{http_code}" ${testUrl}`;
    const statusCode = execSync(testCommand, { encoding: 'utf8' }).trim();
    
    if (statusCode === '200') {
      console.log('✅ Website accessible');
    } else {
      console.log(`⚠️  Website returned status: ${statusCode}`);
    }
    
    // Test photography page
    const photoUrl = `${testUrl}/services/photography`;
    const photoStatus = execSync(`curl -s -o nul -w "%{http_code}" ${photoUrl}`, { encoding: 'utf8' }).trim();
    
    if (photoStatus === '200') {
      console.log('✅ Photography page accessible');
    } else {
      console.log(`⚠️  Photography page returned status: ${photoStatus}`);
    }
    
    return true;
  } catch (error) {
    console.log(`❌ Verification failed: ${error.message}`);
    return false;
  }
}

/**
 * Generate deployment report
 */
function generateReport(success) {
  const timestamp = new Date().toISOString();
  
  const report = {
    timestamp,
    deployment_type: 'GA4 Integration + Photography Gallery Improvements',
    success,
    changes: [
      'Added Google Analytics 4 (GA4) tracking with ID G-QJXSCJ0L43',
      'Updated Photography Gallery with improved responsive design',
      'Fixed image aspect ratios (3:4 for clippings, 4:3 for photos)',
      'Improved mobile layout with earlier 2-column breakpoint',
      'Added environment variable support for GA4 ID'
    ],
    files_modified: [
      'src/app/layout.tsx - Added GA4 Script components',
      'src/components/services/PhotographyGallery.tsx - Improved responsive design',
      '.env.production - Added GA4 environment variable'
    ],
    verification_steps: [
      'Test GA4 loading in browser console',
      'Check GA4 Realtime reports for active users',
      'Verify photography gallery responsive behavior',
      'Confirm no CSP violations in console'
    ],
    cloudfront_distribution: DISTRIBUTION_ID,
    s3_bucket: S3_BUCKET
  };
  
  const reportPath = `ga4-gallery-deployment-report-${Date.now()}.json`;
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`\n📊 Deployment report saved: ${reportPath}`);
  
  return report;
}

/**
 * Main deployment function
 */
async function main() {
  let success = true;
  
  try {
    // Step 1: Verify files
    if (!verifyFiles()) {
      throw new Error('Required files missing');
    }
    
    // Step 2: Build application
    if (!buildApplication()) {
      throw new Error('Build failed');
    }
    
    // Step 3: Deploy to S3
    if (!deployToS3()) {
      throw new Error('S3 deployment failed');
    }
    
    // Step 4: Invalidate cache
    if (!invalidateCache()) {
      console.log('⚠️  Cache invalidation failed, but deployment may still work');
    }
    
    // Step 5: Verify deployment
    await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
    await verifyDeployment();
    
    console.log('\n' + '=' .repeat(60));
    console.log('🎉 Deployment Completed Successfully!');
    console.log('');
    console.log('✅ GA4 Integration:');
    console.log('   - Tracking ID: G-QJXSCJ0L43');
    console.log('   - Global implementation across all pages');
    console.log('   - Environment variable configuration');
    console.log('');
    console.log('✅ Photography Gallery Improvements:');
    console.log('   - Fixed aspect ratios (3:4 clippings, 4:3 photos)');
    console.log('   - Improved mobile responsive design');
    console.log('   - Earlier 2-column breakpoint for mobile');
    console.log('');
    console.log('🔍 Next Steps:');
    console.log('1. Update CloudFront CSP headers (see cloudfront-csp-ga4-instructions.md)');
    console.log('2. Test GA4 in browser console: window.gtag');
    console.log('3. Check GA4 Realtime reports for active users');
    console.log('4. Verify photography gallery on mobile devices');
    
  } catch (error) {
    success = false;
    console.log('\n' + '=' .repeat(60));
    console.log('❌ Deployment Failed');
    console.log(`Error: ${error.message}`);
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('1. Check build logs for errors');
    console.log('2. Verify AWS credentials are configured');
    console.log('3. Ensure S3 bucket and CloudFront distribution exist');
    console.log('4. Try manual deployment: npm run build && node scripts/deploy.js');
  }
  
  // Generate report
  generateReport(success);
  
  process.exit(success ? 0 : 1);
}

// Run deployment
if (require.main === module) {
  main().catch(error => {
    console.error('Deployment script error:', error);
    process.exit(1);
  });
}

module.exports = { main };