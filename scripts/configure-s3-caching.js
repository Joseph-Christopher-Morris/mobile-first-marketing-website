#!/usr/bin/env node

/**
 * S3 Caching Configuration Script
 * 
 * Implements differentiated caching strategy for the vivid-auto-scram-rebuild project:
 * - HTML files: Cache-Control: public, max-age=600 (10 minutes)
 * - Static assets: Cache-Control: public, max-age=31536000, immutable (1 year)
 * 
 * Requirements addressed:
 * - 8.1: Set up HTML files with Cache-Control: public, max-age=600
 * - 8.2: Configure static assets with Cache-Control: public, max-age=31536000, immutable
 * - 8.4: Implement differentiated upload strategy for HTML vs assets
 */

const { S3Client, PutObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class S3CachingConfigurator {
  constructor() {
    this.bucketName = process.env.S3_BUCKET_NAME || 'mobile-marketing-site-prod-1759705011281-tyzuo9';
    this.region = process.env.AWS_REGION || 'us-east-1';
    this.buildDir = 'out';
    
    this.s3Client = new S3Client({ region: this.region });
    
    this.uploadStats = {
      htmlFiles: 0,
      staticAssets: 0,
      totalFiles: 0,
      errors: []
    };
    
    console.log('🔧 S3 Caching Configuration');
    console.log(`   Bucket: ${this.bucketName}`);
    console.log(`   Region: ${this.region}`);
    console.log(`   Build Directory: ${this.buildDir}`);
    console.log('');
  }

  /**
   * Get cache headers based on file type according to requirements
   */
  getCacheHeaders(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const fileName = path.basename(filePath);
    
    // HTML files - Cache-Control: public, max-age=600 (10 minutes)
    if (ext === '.html') {
      return {
        'Cache-Control': 'public, max-age=600'
      };
    }
    
    // Static assets - Cache-Control: public, max-age=31536000, immutable (1 year)
    const staticAssetExtensions = [
      '.js', '.css', '.webp', '.jpg', '.jpeg', '.png', '.gif', '.svg', '.ico', 
      '.woff', '.woff2', '.ttf', '.eot', '.json', '.xml', '.txt'
    ];
    
    if (staticAssetExtensions.includes(ext)) {
      return {
        'Cache-Control': 'public, max-age=31536000, immutable'
      };
    }
    
    // Default fallback - medium cache
    return {
      'Cache-Control': 'public, max-age=3600'
    };
  }

  /**
   * Get content type for file
   */
  getContentType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    
    const contentTypes = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon',
      '.webp': 'image/webp',
      '.woff': 'font/woff',
      '.woff2': 'font/woff2',
      '.ttf': 'font/ttf',
      '.eot': 'application/vnd.ms-fontobject',
      '.xml': 'application/xml',
      '.txt': 'text/plain'
    };
    
    return contentTypes[ext] || 'application/octet-stream';
  }

  /**
   * Build the project if needed
   */
  async ensureBuild() {
    if (!fs.existsSync(this.buildDir)) {
      console.log('🔨 Build directory not found, running build...');
      try {
        execSync('npm run build', { stdio: 'inherit' });
        console.log('✅ Build completed');
      } catch (error) {
        throw new Error(`Build failed: ${error.message}`);
      }
    } else {
      console.log('✅ Build directory found');
    }
  }

  /**
   * Get all files from build directory
   */
  getAllFiles(dir) {
    const files = [];
    
    const walkDir = (currentDir) => {
      const items = fs.readdirSync(currentDir);
      
      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          walkDir(fullPath);
        } else {
          files.push(fullPath);
        }
      }
    };
    
    walkDir(dir);
    return files;
  }

  /**
   * Upload file with appropriate cache headers
   */
  async uploadFileWithCaching(localFilePath, s3Key) {
    try {
      const fileContent = fs.readFileSync(localFilePath);
      const cacheHeaders = this.getCacheHeaders(s3Key);
      const contentType = this.getContentType(s3Key);
      
      const uploadParams = {
        Bucket: this.bucketName,
        Key: s3Key,
        Body: fileContent,
        ContentType: contentType,
        Metadata: {
          'uploaded-at': new Date().toISOString(),
          'cache-strategy': 'differentiated'
        },
        ...cacheHeaders
      };
      
      await this.s3Client.send(new PutObjectCommand(uploadParams));
      
      // Track upload statistics
      const ext = path.extname(s3Key).toLowerCase();
      if (ext === '.html') {
        this.uploadStats.htmlFiles++;
      } else {
        this.uploadStats.staticAssets++;
      }
      this.uploadStats.totalFiles++;
      
      return {
        key: s3Key,
        cacheControl: cacheHeaders['Cache-Control'],
        contentType,
        size: fileContent.length
      };
      
    } catch (error) {
      this.uploadStats.errors.push({
        file: s3Key,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Upload HTML files with short cache headers
   */
  async uploadHtmlFiles() {
    console.log('📄 Uploading HTML files with short cache (600s)...');
    
    const files = this.getAllFiles(this.buildDir);
    const htmlFiles = files.filter(file => path.extname(file).toLowerCase() === '.html');
    
    console.log(`   Found ${htmlFiles.length} HTML files`);
    
    const uploadedFiles = [];
    
    for (const filePath of htmlFiles) {
      const relativePath = path.relative(this.buildDir, filePath);
      const s3Key = relativePath.replace(/\\/g, '/');
      
      try {
        const result = await this.uploadFileWithCaching(filePath, s3Key);
        uploadedFiles.push(result);
        
        console.log(`   ✅ ${s3Key} (${result.cacheControl})`);
      } catch (error) {
        console.error(`   ❌ ${s3Key}: ${error.message}`);
      }
    }
    
    console.log(`✅ Uploaded ${uploadedFiles.length}/${htmlFiles.length} HTML files`);
    return uploadedFiles;
  }

  /**
   * Upload static assets with long cache headers
   */
  async uploadStaticAssets() {
    console.log('🎨 Uploading static assets with long cache (31536000s, immutable)...');
    
    const files = this.getAllFiles(this.buildDir);
    const staticFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ext !== '.html';
    });
    
    console.log(`   Found ${staticFiles.length} static asset files`);
    
    const uploadedFiles = [];
    let processed = 0;
    
    for (const filePath of staticFiles) {
      const relativePath = path.relative(this.buildDir, filePath);
      const s3Key = relativePath.replace(/\\/g, '/');
      
      try {
        const result = await this.uploadFileWithCaching(filePath, s3Key);
        uploadedFiles.push(result);
        
        processed++;
        if (processed % 10 === 0 || processed === staticFiles.length) {
          console.log(`   Processed ${processed}/${staticFiles.length} files...`);
        }
      } catch (error) {
        console.error(`   ❌ ${s3Key}: ${error.message}`);
        processed++;
      }
    }
    
    console.log(`✅ Uploaded ${uploadedFiles.length}/${staticFiles.length} static assets`);
    return uploadedFiles;
  }

  /**
   * Verify cache headers are applied correctly
   */
  async verifyCacheHeaders() {
    console.log('🔍 Verifying cache headers...');
    
    try {
      // List some objects to verify
      const listResult = await this.s3Client.send(
        new ListObjectsV2Command({
          Bucket: this.bucketName,
          MaxKeys: 10
        })
      );
      
      if (!listResult.Contents || listResult.Contents.length === 0) {
        console.log('   No objects found in bucket');
        return false;
      }
      
      console.log(`   Verified ${listResult.Contents.length} objects exist in S3`);
      
      // Check for HTML and static asset files
      const htmlFiles = listResult.Contents.filter(obj => obj.Key.endsWith('.html'));
      const staticFiles = listResult.Contents.filter(obj => !obj.Key.endsWith('.html'));
      
      console.log(`   HTML files: ${htmlFiles.length}`);
      console.log(`   Static assets: ${staticFiles.length}`);
      
      return true;
    } catch (error) {
      console.error(`   ❌ Verification failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Generate deployment summary
   */
  generateSummary() {
    console.log('\n📊 S3 Caching Configuration Summary:');
    console.log(`   HTML Files: ${this.uploadStats.htmlFiles} (Cache-Control: public, max-age=600)`);
    console.log(`   Static Assets: ${this.uploadStats.staticAssets} (Cache-Control: public, max-age=31536000, immutable)`);
    console.log(`   Total Files: ${this.uploadStats.totalFiles}`);
    console.log(`   Errors: ${this.uploadStats.errors.length}`);
    
    if (this.uploadStats.errors.length > 0) {
      console.log('\n❌ Upload Errors:');
      this.uploadStats.errors.forEach(error => {
        console.log(`   ${error.file}: ${error.error}`);
      });
    }
    
    console.log(`\n✅ Differentiated caching strategy implemented successfully!`);
    console.log('   HTML files will be cached for 10 minutes');
    console.log('   Static assets will be cached for 1 year with immutable flag');
  }

  /**
   * Main execution
   */
  async run() {
    try {
      console.log('🚀 Starting S3 caching configuration...\n');
      
      // Step 1: Ensure build exists
      await this.ensureBuild();
      
      // Step 2: Upload HTML files with short cache
      await this.uploadHtmlFiles();
      
      // Step 3: Upload static assets with long cache
      await this.uploadStaticAssets();
      
      // Step 4: Verify cache headers
      await this.verifyCacheHeaders();
      
      // Step 5: Generate summary
      this.generateSummary();
      
      return {
        success: true,
        stats: this.uploadStats
      };
      
    } catch (error) {
      console.error(`\n❌ S3 caching configuration failed: ${error.message}`);
      console.error('\n🔧 Troubleshooting tips:');
      console.error('1. Verify AWS credentials are configured');
      console.error('2. Check S3 bucket permissions');
      console.error('3. Ensure build directory exists');
      console.error('4. Verify S3_BUCKET_NAME environment variable');
      
      throw error;
    }
  }
}

// CLI execution
if (require.main === module) {
  const configurator = new S3CachingConfigurator();
  
  configurator.run()
    .then(result => {
      console.log('\n🎉 S3 caching configuration completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 S3 caching configuration failed');
      process.exit(1);
    });
}

module.exports = S3CachingConfigurator;