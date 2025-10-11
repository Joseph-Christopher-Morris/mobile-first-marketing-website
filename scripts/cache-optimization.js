#!/usr/bin/env node

/**
 * Cache Optimization Script
 * Configures optimal caching strategies for different content types
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class CacheOptimizer {
  constructor() {
    this.outputDir = path.join(process.cwd(), 'out');
    this.cacheConfig = {
      // Static assets - Long-term caching (1 year)
      staticAssets: {
        pattern:
          /\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|webp|avif)$/,
        maxAge: 31536000, // 1 year
        immutable: true,
        compress: true,
      },

      // HTML files - Short-term caching (1 hour)
      htmlFiles: {
        pattern: /\.html$/,
        maxAge: 3600, // 1 hour
        mustRevalidate: true,
        compress: true,
      },

      // API routes - No caching
      apiRoutes: {
        pattern: /^\/api\//,
        maxAge: 0,
        noCache: true,
        noStore: true,
      },

      // Service worker - No caching
      serviceWorker: {
        pattern: /^\/sw\.js$/,
        maxAge: 0,
        noCache: true,
        noStore: true,
      },

      // Manifest - Medium-term caching (1 day)
      manifest: {
        pattern: /\/manifest\.json$/,
        maxAge: 86400, // 1 day
        compress: true,
      },
    };
  }

  async optimizeCache() {
    console.log('🚀 Starting cache optimization...');

    try {
      // Generate file hashes for cache busting
      await this.generateFileHashes();

      // Create cache configuration
      await this.createCacheHeaders();

      // Generate cache manifest
      await this.generateCacheManifest();

      // Create CDN configuration
      await this.createCDNConfig();

      console.log('✅ Cache optimization completed');
    } catch (error) {
      console.error('❌ Cache optimization failed:', error.message);
      throw error;
    }
  }

  async generateFileHashes() {
    console.log('🔍 Generating file hashes for cache busting...');

    if (!fs.existsSync(this.outputDir)) {
      console.log('⚠️  Output directory not found, skipping hash generation');
      return;
    }

    const hashes = {};
    const files = this.getAllFiles(this.outputDir);

    files.forEach(file => {
      const relativePath = path.relative(this.outputDir, file);
      const content = fs.readFileSync(file);
      const hash = crypto
        .createHash('md5')
        .update(content)
        .digest('hex')
        .substring(0, 8);
      hashes[relativePath] = hash;
    });

    // Write hashes to file
    const hashesPath = path.join(this.outputDir, 'file-hashes.json');
    fs.writeFileSync(hashesPath, JSON.stringify(hashes, null, 2));

    console.log(`📝 Generated hashes for ${Object.keys(hashes).length} files`);
  }

  getAllFiles(dir) {
    const files = [];

    function traverse(currentDir) {
      const items = fs.readdirSync(currentDir);

      items.forEach(item => {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          traverse(fullPath);
        } else {
          files.push(fullPath);
        }
      });
    }

    traverse(dir);
    return files;
  }

  async createCacheHeaders() {
    console.log('📋 Creating cache header configuration...');

    const headerConfig = {
      version: '1.0',
      generated: new Date().toISOString(),
      rules: [],
    };

    // Add cache rules for each content type
    Object.entries(this.cacheConfig).forEach(([name, config]) => {
      const rule = {
        name,
        pattern: config.pattern.toString(),
        headers: this.generateCacheHeaders(config),
      };

      headerConfig.rules.push(rule);
    });

    // Write configuration
    const configPath = path.join(process.cwd(), 'cache-headers.json');
    fs.writeFileSync(configPath, JSON.stringify(headerConfig, null, 2));

    console.log('✅ Cache header configuration created');
  }

  generateCacheHeaders(config) {
    const headers = {};

    if (config.noCache && config.noStore) {
      headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
      headers['Pragma'] = 'no-cache';
      headers['Expires'] = '0';
    } else if (config.maxAge > 0) {
      let cacheControl = `public, max-age=${config.maxAge}`;

      if (config.immutable) {
        cacheControl += ', immutable';
      }

      if (config.mustRevalidate) {
        cacheControl += ', must-revalidate';
      }

      headers['Cache-Control'] = cacheControl;
    }

    if (config.compress) {
      headers['Vary'] = 'Accept-Encoding';
    }

    return headers;
  }

  async generateCacheManifest() {
    console.log('📄 Generating cache manifest...');

    if (!fs.existsSync(this.outputDir)) {
      console.log(
        '⚠️  Output directory not found, skipping manifest generation'
      );
      return;
    }

    const manifest = {
      version: '1.0',
      generated: new Date().toISOString(),
      files: {},
      totalSize: 0,
      fileCount: 0,
    };

    const files = this.getAllFiles(this.outputDir);

    files.forEach(file => {
      const relativePath = path.relative(this.outputDir, file);
      const stat = fs.statSync(file);
      const ext = path.extname(file).toLowerCase();

      // Determine cache strategy
      let strategy = 'default';
      if (this.cacheConfig.staticAssets.pattern.test(ext)) {
        strategy = 'long-term';
      } else if (this.cacheConfig.htmlFiles.pattern.test(ext)) {
        strategy = 'short-term';
      }

      manifest.files[relativePath] = {
        size: stat.size,
        modified: stat.mtime.toISOString(),
        strategy,
        contentType: this.getContentType(ext),
      };

      manifest.totalSize += stat.size;
      manifest.fileCount++;
    });

    // Write manifest
    const manifestPath = path.join(this.outputDir, 'cache-manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

    console.log(
      `📊 Cache manifest generated: ${manifest.fileCount} files, ${(manifest.totalSize / 1024 / 1024).toFixed(2)} MB`
    );
  }

  getContentType(ext) {
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
      '.webp': 'image/webp',
      '.avif': 'image/avif',
      '.woff': 'font/woff',
      '.woff2': 'font/woff2',
      '.ttf': 'font/ttf',
      '.eot': 'application/vnd.ms-fontobject',
    };

    return contentTypes[ext] || 'application/octet-stream';
  }

  async createCDNConfig() {
    console.log('🌐 Creating CDN configuration...');

    const cdnConfig = {
      version: '1.0',
      generated: new Date().toISOString(),
      cloudfront: {
        behaviors: [
          {
            pathPattern:
              '*.{js,css,png,jpg,jpeg,gif,ico,svg,woff,woff2,ttf,eot,webp,avif}',
            cachePolicyId: 'static-assets',
            compress: true,
            viewerProtocolPolicy: 'redirect-to-https',
            allowedMethods: ['GET', 'HEAD'],
            cachedMethods: ['GET', 'HEAD'],
            ttl: {
              min: 31536000, // 1 year
              default: 31536000,
              max: 31536000,
            },
          },
          {
            pathPattern: '*.html',
            cachePolicyId: 'html-pages',
            compress: true,
            viewerProtocolPolicy: 'redirect-to-https',
            allowedMethods: ['GET', 'HEAD'],
            cachedMethods: ['GET', 'HEAD'],
            ttl: {
              min: 0,
              default: 3600, // 1 hour
              max: 86400, // 1 day
            },
          },
          {
            pathPattern: '/api/*',
            cachePolicyId: 'no-cache',
            compress: false,
            viewerProtocolPolicy: 'redirect-to-https',
            allowedMethods: [
              'GET',
              'HEAD',
              'OPTIONS',
              'PUT',
              'POST',
              'PATCH',
              'DELETE',
            ],
            cachedMethods: ['GET', 'HEAD'],
            ttl: {
              min: 0,
              default: 0,
              max: 0,
            },
          },
        ],
        originRequestPolicy: {
          name: 'amplify-cors-s3-origin',
          headers: ['CloudFront-Viewer-Country', 'CloudFront-Is-Mobile-Viewer'],
          queryStrings: 'all',
          cookies: 'none',
        },
        responseHeadersPolicy: {
          securityHeaders: {
            strictTransportSecurity: {
              accessControlMaxAgeSec: 31536000,
              includeSubdomains: true,
              preload: true,
            },
            contentTypeOptions: {
              override: true,
            },
            frameOptions: {
              frameOption: 'DENY',
              override: true,
            },
            xssProtection: {
              modeBlock: true,
              protection: true,
              override: true,
            },
            referrerPolicy: {
              referrerPolicy: 'strict-origin-when-cross-origin',
              override: true,
            },
          },
          customHeaders: [
            {
              header: 'Permissions-Policy',
              value: 'camera=(), microphone=(), geolocation=()',
              override: true,
            },
          ],
        },
      },
      optimization: {
        compression: {
          enabled: true,
          types: [
            'text/html',
            'text/css',
            'application/javascript',
            'application/json',
            'image/svg+xml',
          ],
          level: 6,
        },
        minification: {
          html: true,
          css: true,
          js: true,
        },
        imageOptimization: {
          webp: true,
          avif: true,
          quality: 85,
          progressive: true,
        },
      },
    };

    // Write CDN configuration
    const configPath = path.join(process.cwd(), 'cdn-config.json');
    fs.writeFileSync(configPath, JSON.stringify(cdnConfig, null, 2));

    console.log('✅ CDN configuration created');
  }

  async invalidateCache(paths = ['/*']) {
    console.log('🔄 Cache invalidation configuration...');

    const invalidationConfig = {
      timestamp: new Date().toISOString(),
      paths,
      reason: 'Deployment update',
      distributionId: process.env.CLOUDFRONT_DISTRIBUTION_ID || 'auto-detect',
    };

    // Write invalidation configuration
    const configPath = path.join(process.cwd(), 'cache-invalidation.json');
    fs.writeFileSync(configPath, JSON.stringify(invalidationConfig, null, 2));

    console.log(`📝 Cache invalidation configured for ${paths.length} paths`);
  }

  generatePerformanceReport() {
    console.log('📊 Generating performance report...');

    if (!fs.existsSync(this.outputDir)) {
      console.log(
        '⚠️  Output directory not found, skipping performance report'
      );
      return;
    }

    const report = {
      timestamp: new Date().toISOString(),
      caching: {
        strategies: Object.keys(this.cacheConfig).length,
        optimizedFiles: 0,
        totalSize: 0,
      },
      compression: {
        enabled: true,
        estimatedSavings: '60-80%',
      },
      cdn: {
        enabled: true,
        globalDistribution: true,
        edgeLocations: '200+',
      },
    };

    // Calculate file statistics
    const files = this.getAllFiles(this.outputDir);
    files.forEach(file => {
      const stat = fs.statSync(file);
      report.caching.totalSize += stat.size;
      report.caching.optimizedFiles++;
    });

    // Write performance report
    const reportPath = path.join(process.cwd(), 'performance-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log(
      `📈 Performance report generated: ${report.caching.optimizedFiles} files optimized`
    );
    return report;
  }
}

async function main() {
  const optimizer = new CacheOptimizer();

  try {
    console.log('🚀 Starting CDN and cache optimization...');

    await optimizer.optimizeCache();
    await optimizer.invalidateCache();
    const report = optimizer.generatePerformanceReport();

    console.log('✅ CDN and cache optimization completed');
    return report;
  } catch (error) {
    console.error('❌ CDN and cache optimization failed:', error.message);
    process.exit(1);
  }
}

// Run optimization if called directly
if (require.main === module) {
  main();
}

module.exports = CacheOptimizer;
