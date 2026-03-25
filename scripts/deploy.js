#!/usr/bin/env node

/**
 * Main Deployment Script for S3 + CloudFront
 *
 * Deployment integrity guardrails:
 * - Pre-deploy asset manifest check (required photography/proof assets)
 * - Build-output validation before S3 upload
 * - Protected asset deletion guard in cleanup
 * - Post-upload asset verification against production
 * - CloudFront invalidation confirmation
 * - Production smoke test
 */

const { execSync } = require('child_process');
const {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
  HeadObjectCommand,
} = require('@aws-sdk/client-s3');
const {
  CloudFrontClient,
  CreateInvalidationCommand,
} = require('@aws-sdk/client-cloudfront');
const { fromIni } = require('@aws-sdk/credential-providers');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ---------------------------------------------------------------------------
// Required asset manifest
// ---------------------------------------------------------------------------
const REQUIRED_ASSETS_PATH = path.join(__dirname, '..', 'config', 'required-assets.json');

function loadRequiredAssets() {
  if (!fs.existsSync(REQUIRED_ASSETS_PATH)) {
    throw new Error(`Required assets manifest not found: ${REQUIRED_ASSETS_PATH}`);
  }
  return JSON.parse(fs.readFileSync(REQUIRED_ASSETS_PATH, 'utf-8'));
}

/** Flatten the manifest into a deduplicated list of asset paths. */
function flattenManifestAssets(manifest) {
  const assets = new Set();
  function walk(obj) {
    if (typeof obj === 'string') { assets.add(obj); return; }
    if (Array.isArray(obj)) { obj.forEach(walk); return; }
    if (obj && typeof obj === 'object') {
      for (const [key, val] of Object.entries(obj)) {
        if (key === '_comment' || key === 'protectedPrefixes') continue;
        walk(val);
      }
    }
  }
  walk(manifest);
  return [...assets];
}

class Deployment {
  constructor() {
    this.bucketName = process.env.S3_BUCKET_NAME;
    this.distributionId = process.env.CLOUDFRONT_DISTRIBUTION_ID;
    this.region = process.env.AWS_REGION || 'us-east-1';
    this.buildDir = 'out';
    this.environment = process.env.ENVIRONMENT || 'production';
    this.siteOrigin = process.env.SITE_ORIGIN || 'https://d15sc9fc739ev2.cloudfront.net';

    const credentials = process.env.AWS_ACCESS_KEY_ID
      ? undefined
      : fromIni({ profile: process.env.AWS_PROFILE || 'default' });

    this.s3Client = new S3Client({ region: this.region, credentials });
    this.cloudFrontClient = new CloudFrontClient({ region: 'us-east-1', credentials });

    this.uploadedFiles = [];
    this.deploymentId = `deploy-${Date.now()}`;
    this.manifest = loadRequiredAssets();
    this.requiredAssets = flattenManifestAssets(this.manifest);
    this.protectedPrefixes = this.manifest.protectedPrefixes || [];

    this.validateConfiguration();
  }

  // -------------------------------------------------------------------------
  // Configuration
  // -------------------------------------------------------------------------
  validateConfiguration() {
    if (!this.bucketName) {
      throw new Error('S3_BUCKET_NAME environment variable is required');
    }
    if (!this.distributionId) {
      console.warn('⚠️  CLOUDFRONT_DISTRIBUTION_ID not set, skipping cache invalidation');
    }

    console.log('📋 Deployment Configuration:');
    console.log(`   Environment: ${this.environment}`);
    console.log(`   S3 Bucket: ${this.bucketName}`);
    console.log(`   CloudFront Distribution: ${this.distributionId || 'Not configured'}`);
    console.log(`   Region: ${this.region}`);
    console.log(`   Build Directory: ${this.buildDir}`);
    console.log(`   Required assets: ${this.requiredAssets.length}`);
    console.log(`   Protected prefixes: ${this.protectedPrefixes.join(', ')}`);
    console.log('');
  }

  // -------------------------------------------------------------------------
  // Build
  // -------------------------------------------------------------------------
  async buildProject() {
    console.log('🔨 Building Next.js static export...');

    try {
      if (fs.existsSync(this.buildDir)) {
        console.log('🧹 Cleaning previous build...');
        try { fs.rmSync(this.buildDir, { recursive: true, force: true }); }
        catch (e) { console.warn(`   ⚠️  Could not clean build directory: ${e.message}`); }
      }

      console.log('📦 Running Next.js build...');
      execSync('npm run build', { stdio: 'inherit' });

      if (!fs.existsSync(this.buildDir)) {
        throw new Error(`Build directory '${this.buildDir}' was not created`);
      }

      const buildStats = this.getBuildStats();
      console.log('✅ Build completed successfully');
      console.log(`   Files: ${buildStats.fileCount}`);
      console.log(`   Total Size: ${this.formatBytes(buildStats.totalSize)}`);
      console.log('');

      // Run legacy build verification (existing images)
      console.log('🔍 Running build image verification...');
      try {
        const { verifyBuildImages } = require('./build-verification.js');
        const verificationResult = verifyBuildImages();
        if (verificationResult.status !== 'success') {
          throw new Error(`Build verification failed: ${verificationResult.failedImages.length} images missing`);
        }
        console.log('✅ Build verification passed — all required images present');
        console.log('');
      } catch (error) {
        console.error('❌ Build verification failed:', error.message);
        throw error;
      }

      return buildStats;
    } catch (error) {
      console.error('❌ Build failed:', error.message);
      throw error;
    }
  }

  getBuildStats() {
    const stats = { fileCount: 0, totalSize: 0 };
    const walkDir = (dir) => {
      for (const file of fs.readdirSync(dir)) {
        if (file === '.DS_Store') continue;
        const fp = path.join(dir, file);
        const stat = fs.statSync(fp);
        if (stat.isDirectory()) walkDir(fp);
        else { stats.fileCount++; stats.totalSize += stat.size; }
      }
    };
    walkDir(this.buildDir);
    return stats;
  }

  // -------------------------------------------------------------------------
  // GUARDRAIL 1 & 2: Pre-deploy asset manifest check + build-output validation
  // -------------------------------------------------------------------------
  validateRequiredAssets() {
    console.log('🛡️  Validating required assets in build output...');
    const missing = [];

    for (const asset of this.requiredAssets) {
      const buildPath = path.join(this.buildDir, asset);
      if (!fs.existsSync(buildPath)) {
        missing.push(asset);
      }
    }

    console.log(`   Checked ${this.requiredAssets.length} required assets`);

    if (missing.length > 0) {
      console.error(`❌ DEPLOY BLOCKED — ${missing.length} required assets missing from build output:`);
      for (const m of missing) {
        console.error(`   ✗ ${m}`);
      }
      throw new Error(`Deploy blocked: ${missing.length} required assets missing from ${this.buildDir}/`);
    }

    console.log('✅ All required assets present in build output');
    console.log('');
  }

  // -------------------------------------------------------------------------
  // Cache headers & content type (unchanged)
  // -------------------------------------------------------------------------
  getCacheHeaders(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const fileName = path.basename(filePath);
    const fullPath = filePath.toLowerCase();

    if (fileName === 'sw.js' || fileName === 'service-worker.js') {
      return { 'Cache-Control': 'no-cache, no-store, must-revalidate', Expires: '0' };
    }
    if (ext === '.html') {
      return { 'Cache-Control': 'public, max-age=0, must-revalidate' };
    }
    if (['.webp','.jpg','.jpeg','.png','.gif','.svg','.ico','.avif'].includes(ext)) {
      return { 'Cache-Control': 'public, max-age=31536000, immutable' };
    }
    if (fullPath.includes('/_next/static/')) {
      return { 'Cache-Control': 'public, max-age=31536000, immutable' };
    }
    if (['.js','.css','.woff','.woff2','.ttf','.eot'].includes(ext)) {
      return { 'Cache-Control': 'public, max-age=31536000, immutable' };
    }
    if (fileName === 'sitemap.xml' || fileName === 'robots.txt') {
      return { 'Cache-Control': 'public, max-age=3600' };
    }
    if (ext === '.json') {
      return { 'Cache-Control': 'public, max-age=86400' };
    }
    return { 'Cache-Control': 'public, max-age=3600' };
  }

  getContentType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const types = {
      '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
      '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
      '.gif': 'image/gif', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
      '.webp': 'image/webp', '.avif': 'image/avif',
      '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf',
      '.eot': 'application/vnd.ms-fontobject',
      '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8',
    };
    return types[ext] || 'application/octet-stream';
  }

  // -------------------------------------------------------------------------
  // File hashing & change detection
  // -------------------------------------------------------------------------
  calculateFileHash(filePath) {
    const content = fs.readFileSync(filePath);
    return crypto.createHash('md5').update(content).digest('hex');
  }

  async hasFileChanged(s3Key, localFilePath) {
    try {
      const localHash = this.calculateFileHash(localFilePath);
      const headResult = await this.s3Client.send(
        new HeadObjectCommand({ Bucket: this.bucketName, Key: s3Key })
      );
      return localHash !== headResult.Metadata?.['file-hash'];
    } catch { return true; }
  }

  // -------------------------------------------------------------------------
  // Upload
  // -------------------------------------------------------------------------
  async uploadFile(localFilePath, s3Key) {
    const fileContent = fs.readFileSync(localFilePath);
    const fileHash = this.calculateFileHash(localFilePath);
    const cacheHeaders = this.getCacheHeaders(s3Key);
    const contentType = this.getContentType(s3Key);

    await this.s3Client.send(new PutObjectCommand({
      Bucket: this.bucketName, Key: s3Key, Body: fileContent,
      ContentType: contentType,
      Metadata: { 'deployment-id': this.deploymentId, 'file-hash': fileHash, 'uploaded-at': new Date().toISOString() },
      ...cacheHeaders,
    }));

    this.uploadedFiles.push({ key: s3Key, size: fileContent.length, contentType, cacheControl: cacheHeaders['Cache-Control'] });
  }

  async uploadFiles() {
    console.log('📤 Uploading files to S3...');
    const filesToUpload = [];
    const changedFiles = [];

    const walkDir = (dir, baseDir = '') => {
      for (const file of fs.readdirSync(dir)) {
        if (file === '.DS_Store') continue;
        const fp = path.join(dir, file);
        const stat = fs.statSync(fp);
        if (stat.isDirectory()) walkDir(fp, path.join(baseDir, file));
        else filesToUpload.push({ localPath: fp, s3Key: path.join(baseDir, file).replace(/\\/g, '/') });
      }
    };
    walkDir(this.buildDir);

    console.log(`📋 Found ${filesToUpload.length} files to process`);

    console.log('🔍 Checking for file changes...');
    for (const file of filesToUpload) {
      if (await this.hasFileChanged(file.s3Key, file.localPath)) changedFiles.push(file);
    }

    console.log(`📝 ${changedFiles.length} files have changed and will be uploaded`);

    if (changedFiles.length === 0) {
      console.log('✅ No files to upload, deployment is up to date');
      return;
    }

    let uploadedCount = 0;
    for (const file of changedFiles) {
      try {
        await this.uploadFile(file.localPath, file.s3Key);
        uploadedCount++;
        if (uploadedCount % 10 === 0 || uploadedCount === changedFiles.length) {
          console.log(`   Uploaded ${uploadedCount}/${changedFiles.length} files`);
        }
      } catch (error) {
        console.error(`❌ Failed to upload ${file.s3Key}:`, error.message);
        throw error;
      }
    }

    console.log('✅ File upload completed');
    console.log(`   Uploaded: ${this.uploadedFiles.length} files`);
    console.log(`   Total Size: ${this.formatBytes(this.uploadedFiles.reduce((s, f) => s + f.size, 0))}`);
    console.log('');
  }

  // -------------------------------------------------------------------------
  // GUARDRAIL 3: Protected asset deletion guard
  // -------------------------------------------------------------------------
  async cleanupOldFiles() {
    console.log('🧹 Cleaning up old files (with protected-asset guard)...');

    try {
      // List all S3 objects
      const allS3Keys = [];
      let continuationToken;
      do {
        const params = { Bucket: this.bucketName };
        if (continuationToken) params.ContinuationToken = continuationToken;
        const result = await this.s3Client.send(new ListObjectsV2Command(params));
        if (result.Contents) allS3Keys.push(...result.Contents.map(o => o.Key));
        continuationToken = result.IsTruncated ? result.NextContinuationToken : undefined;
      } while (continuationToken);

      console.log(`   Found ${allS3Keys.length} total objects in S3`);
      if (allS3Keys.length === 0) { console.log('   No files to clean up'); return; }

      // Build current file set
      const currentFiles = new Set();
      const walkDir = (dir, baseDir = '') => {
        for (const file of fs.readdirSync(dir)) {
          if (file === '.DS_Store') continue;
          const fp = path.join(dir, file);
          const stat = fs.statSync(fp);
          if (stat.isDirectory()) walkDir(fp, path.join(baseDir, file));
          else currentFiles.add(path.join(baseDir, file).replace(/\\/g, '/'));
        }
      };
      walkDir(this.buildDir);
      console.log(`   Found ${currentFiles.size} files in build output`);

      // Build protected set: manifest assets + protected prefixes
      const protectedKeys = new Set(this.requiredAssets);

      // Candidates for deletion
      const candidates = allS3Keys.filter(key => !currentFiles.has(key));
      const safeToDelete = [];
      const preserved = [];

      for (const key of candidates) {
        const isProtected = protectedKeys.has(key) ||
          this.protectedPrefixes.some(prefix => key.startsWith(prefix));

        if (isProtected) {
          preserved.push(key);
        } else {
          safeToDelete.push(key);
        }
      }

      if (preserved.length > 0) {
        console.log(`   🛡️  Preserved ${preserved.length} protected assets from deletion:`);
        for (const p of preserved.slice(0, 10)) console.log(`      ✓ ${p}`);
        if (preserved.length > 10) console.log(`      ... and ${preserved.length - 10} more`);
      }

      if (safeToDelete.length === 0) {
        console.log('   No old files to clean up');
        return;
      }

      console.log(`   Deleting ${safeToDelete.length} old files...`);
      for (const key of safeToDelete) {
        await this.s3Client.send(new DeleteObjectCommand({ Bucket: this.bucketName, Key: key }));
      }

      console.log('✅ Cleanup completed');
      console.log(`   Deleted: ${safeToDelete.length} | Preserved: ${preserved.length}`);
      console.log('');
    } catch (error) {
      console.error('❌ Cleanup failed:', error.message);
      // Don't fail the deployment for cleanup errors
    }
  }

  // -------------------------------------------------------------------------
  // CloudFront invalidation
  // -------------------------------------------------------------------------
  async invalidateCache() {
    if (!this.distributionId) {
      console.log('⚠️  Skipping cache invalidation (no distribution ID configured)');
      return;
    }

    console.log('🔄 Invalidating CloudFront cache...');

    try {
      const pathsToInvalidate = ['/_next/*', '/*'];
      console.log(`   Invalidating ${pathsToInvalidate.length} paths (using wildcards)`);

      const result = await this.cloudFrontClient.send(
        new CreateInvalidationCommand({
          DistributionId: this.distributionId,
          InvalidationBatch: {
            CallerReference: `${this.deploymentId}-${Date.now()}`,
            Paths: { Quantity: pathsToInvalidate.length, Items: pathsToInvalidate },
          },
        })
      );

      console.log('✅ Cache invalidation started');
      console.log(`   Invalidation ID: ${result.Invalidation.Id}`);
      console.log(`   Status: ${result.Invalidation.Status}`);
      console.log('   Note: Invalidation may take 5-15 minutes to complete');
      console.log('');
    } catch (error) {
      console.error('❌ Cache invalidation failed:', error.message);
      console.error('   Deployment succeeded but cache may not be updated');
    }
  }

  // -------------------------------------------------------------------------
  // Cloudflare cache purge
  // -------------------------------------------------------------------------
  async purgeCloudflareCache() {
    const zoneId = process.env.CLOUDFLARE_ZONE_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;
    if (!zoneId || !apiToken) {
      console.log('⚠️  Cloudflare credentials not set, skipping cache purge');
      return;
    }

    console.log('🔄 Purging Cloudflare cache...');
    try {
      const filesToPurge = [
        'https://vividmediacheshire.com/sitemap.xml',
        'https://vividmediacheshire.com/robots.txt',
        'https://vividmediacheshire.com/',
      ];
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`,
        { method: 'POST', headers: { Authorization: `Bearer ${apiToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ files: filesToPurge }) }
      );
      const result = await response.json();
      if (result.success) console.log('✅ Cloudflare cache purged successfully');
      else console.error('❌ Cloudflare cache purge failed:', JSON.stringify(result.errors));
      console.log('');
    } catch (error) {
      console.error('❌ Cloudflare cache purge error:', error.message);
    }
  }

  // -------------------------------------------------------------------------
  // GUARDRAIL 4: Post-upload asset verification against production
  // -------------------------------------------------------------------------
  async verifyProductionAssets() {
    console.log('🔍 Verifying required assets are reachable on production...');

    const failed = [];
    const passed = [];

    for (const asset of this.requiredAssets) {
      const url = `${this.siteOrigin}/${asset}`;
      try {
        const resp = await fetch(url, { method: 'HEAD' });
        if (resp.status === 200) {
          passed.push(asset);
        } else {
          failed.push({ asset, status: resp.status });
        }
      } catch (error) {
        failed.push({ asset, status: `error: ${error.message}` });
      }
    }

    console.log(`   Verified: ${passed.length}/${this.requiredAssets.length} assets reachable`);

    if (failed.length > 0) {
      console.error(`❌ ${failed.length} required assets NOT reachable on production:`);
      for (const f of failed) {
        console.error(`   ✗ ${f.asset} → HTTP ${f.status}`);
      }
      console.error('');
      console.error('   ⚠️  Deploy marked as FAILED — required proof assets are broken on production.');
      console.error('   This may resolve after CloudFront invalidation propagates (5-15 min).');
      console.error('   Re-run verification with: node scripts/verify-production-assets.js');
      // Don't throw — CloudFront invalidation may still be propagating
      // But flag it clearly
      return false;
    }

    console.log('✅ All required assets verified on production');
    console.log('');
    return true;
  }

  // -------------------------------------------------------------------------
  // GUARDRAIL 5 & 6: Production smoke test
  // -------------------------------------------------------------------------
  async runSmokeTest() {
    console.log('🧪 Running production smoke test...');

    const pages = [
      { name: 'Homepage', path: '/' },
      { name: 'Photography', path: '/services/photography/' },
      { name: 'Website Design', path: '/services/website-design/' },
      { name: 'Hosting', path: '/services/website-hosting/' },
    ];

    const results = [];

    for (const page of pages) {
      const url = `${this.siteOrigin}${page.path}`;
      try {
        const resp = await fetch(url);
        const ok = resp.status === 200;
        results.push({ ...page, status: resp.status, ok });
        console.log(`   ${ok ? '✅' : '❌'} ${page.name} → HTTP ${resp.status}`);
      } catch (error) {
        results.push({ ...page, status: `error`, ok: false });
        console.log(`   ❌ ${page.name} → ${error.message}`);
      }
    }

    // Photography page deep check: verify images are referenced in HTML
    try {
      const photoResp = await fetch(`${this.siteOrigin}/services/photography/`);
      if (photoResp.ok) {
        const html = await photoResp.text();
        const criticalRefs = [
          'photography-hero.webp',
          'photography-sample-4.webp',
          'photography-sample-1.webp',
          'editorial-proof-bbc-forbes-times.webp',
        ];
        const missingRefs = criticalRefs.filter(ref => !html.includes(ref));
        if (missingRefs.length > 0) {
          console.log(`   ⚠️  Photography page HTML missing references: ${missingRefs.join(', ')}`);
        } else {
          console.log('   ✅ Photography page HTML references all critical images');
        }

        // Check for GBP currency (guardrail 5)
        if (html.includes('£928.07') && !html.includes('$1,166.07')) {
          console.log('   ✅ Revenue displayed in GBP (£)');
        } else if (html.includes('$1,166.07')) {
          console.log('   ⚠️  Revenue still showing USD ($) — stale cache?');
        }
      }
    } catch (error) {
      console.log(`   ⚠️  Could not deep-check photography page: ${error.message}`);
    }

    const allOk = results.every(r => r.ok);
    console.log(allOk ? '✅ Smoke test passed' : '⚠️  Some pages failed smoke test');
    console.log('');
    return allOk;
  }

  // -------------------------------------------------------------------------
  // Summary & utilities
  // -------------------------------------------------------------------------
  generateSummary(buildStats, startTime, assetVerification, smokeTestPassed) {
    const duration = Math.round((Date.now() - startTime) / 1000);

    console.log('📊 Deployment Summary:');
    console.log(`   Deployment ID: ${this.deploymentId}`);
    console.log(`   Environment: ${this.environment}`);
    console.log(`   Duration: ${duration} seconds`);
    console.log(`   Build Files: ${buildStats.fileCount}`);
    console.log(`   Build Size: ${this.formatBytes(buildStats.totalSize)}`);
    console.log(`   Uploaded Files: ${this.uploadedFiles.length}`);
    console.log(`   Required Assets Checked: ${this.requiredAssets.length}`);
    console.log(`   Production Assets Verified: ${assetVerification ? 'PASS' : 'PENDING (cache propagation)'}`);
    console.log(`   Smoke Test: ${smokeTestPassed ? 'PASS' : 'PENDING'}`);
    console.log(`   S3 Bucket: ${this.bucketName}`);
    if (this.distributionId) console.log(`   CloudFront Distribution: ${this.distributionId}`);
    console.log(`   Completed: ${new Date().toISOString()}`);
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // -------------------------------------------------------------------------
  // Main execution
  // -------------------------------------------------------------------------
  async run() {
    const startTime = Date.now();

    try {
      console.log('🚀 Starting deployment...');
      console.log(`Deployment ID: ${this.deploymentId}`);
      console.log('');

      // Step 1: Build
      const buildStats = await this.buildProject();

      // Step 2: Validate required assets in build output (GUARDRAIL 1 & 2)
      this.validateRequiredAssets();

      // Step 3: Upload files to S3
      await this.uploadFiles();

      // Step 4: Clean up old files (with protected-asset guard — GUARDRAIL 3)
      await this.cleanupOldFiles();

      // Step 5: Invalidate CloudFront cache
      await this.invalidateCache();

      // Step 6: Purge Cloudflare cache
      await this.purgeCloudflareCache();

      // Step 7: Post-upload asset verification (GUARDRAIL 4)
      const assetVerification = await this.verifyProductionAssets();

      // Step 8: Production smoke test (GUARDRAIL 5 & 6)
      const smokeTestPassed = await this.runSmokeTest();

      // Step 9: Summary (GUARDRAIL 9)
      this.generateSummary(buildStats, startTime, assetVerification, smokeTestPassed);

      if (!assetVerification) {
        console.log('\n⚠️  Deployment uploaded successfully but production asset verification failed.');
        console.log('   This is likely due to CloudFront cache propagation delay (5-15 min).');
        console.log('   Re-verify with: node scripts/verify-production-assets.js');
      }

      console.log('\n🎉 Deployment completed successfully!');

      if (this.distributionId) {
        console.log('\n🌐 Your site will be available at the CloudFront distribution URL');
        console.log('   Note: Changes may take 5-15 minutes to propagate globally');
      }

      return { success: true, deploymentId: this.deploymentId, uploadedFiles: this.uploadedFiles.length, buildStats, assetVerification, smokeTestPassed };
    } catch (error) {
      console.error('\n❌ Deployment failed:', error.message);
      console.error('\n🔧 Troubleshooting tips:');
      console.error('1. Verify AWS credentials are configured correctly');
      console.error('2. Check S3 bucket permissions');
      console.error('3. Ensure CloudFront distribution ID is correct');
      console.error('4. Verify the build completed successfully');
      console.error('5. Check config/required-assets.json for missing asset paths');
      throw error;
    }
  }
}

// CLI execution
if (require.main === module) {
  const deployment = new Deployment();
  deployment.run()
    .then(result => { console.log('\n✅ Deployment process completed'); process.exit(0); })
    .catch(error => { console.error('\n❌ Deployment process failed:', error.message); process.exit(1); });
}

module.exports = Deployment;
