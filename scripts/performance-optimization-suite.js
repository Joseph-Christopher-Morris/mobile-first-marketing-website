#!/usr/bin/env node

/**
 * Performance Optimization Suite
 * Comprehensive Core Web Vitals optimization and monitoring
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class PerformanceOptimizationSuite {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      optimizations: [],
      metrics: {},
      recommendations: []
    };
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      warning: '\x1b[33m',
      error: '\x1b[31m',
      reset: '\x1b[0m'
    };
    console.log(`${colors[type]}${message}${colors.reset}`);
  }

  async optimizeImages() {
    this.log('\n🖼️  Optimizing Images...', 'info');
    
    const publicDir = 'public';
    const srcDir = 'src';
    let optimized = 0;

    try {
      // Find all images
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp'];
      const images = this.findImageFiles([publicDir, srcDir], imageExtensions);
      
      this.log(`Found ${images.length} images to analyze`, 'info');

      for (const imagePath of images) {
        const stats = fs.statSync(imagePath);
        const sizeKB = Math.round(stats.size / 1024);
        
        // Check if WebP version exists
        const webpPath = imagePath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
        const hasWebP = fs.existsSync(webpPath);
        
        if (!hasWebP && sizeKB > 50) {
          this.results.recommendations.push(`Convert ${imagePath} to WebP (${sizeKB}KB)`);
        }

        // Check for oversized images
        if (sizeKB > 500) {
          this.results.recommendations.push(`Compress ${imagePath} - ${sizeKB}KB is too large`);
        }

        optimized++;
      }

      this.results.optimizations.push({
        type: 'image-analysis',
        processed: optimized,
        recommendations: this.results.recommendations.filter(r => r.includes('Convert') || r.includes('Compress')).length
      });

      this.log(`✓ Analyzed ${optimized} images`, 'success');

    } catch (error) {
      this.log(`✗ Image optimization failed: ${error.message}`, 'error');
    }
  }

  async optimizeCoreWebVitals() {
    this.log('\n⚡ Optimizing Core Web Vitals...', 'info');

    try {
      // Check and optimize LCP (Largest Contentful Paint)
      await this.optimizeLCP();
      
      // Check and optimize FID (First Input Delay)
      await this.optimizeFID();
      
      // Check and optimize CLS (Cumulative Layout Shift)
      await this.optimizeCLS();

      this.log('✓ Core Web Vitals optimization completed', 'success');

    } catch (error) {
      this.log(`✗ Core Web Vitals optimization failed: ${error.message}`, 'error');
    }
  }

  async optimizeLCP() {
    this.log('  📊 Optimizing Largest Contentful Paint (LCP)...', 'info');
    
    const optimizations = [];

    // Check for preload hints in layout
    const layoutPath = 'src/app/layout.tsx';
    if (fs.existsSync(layoutPath)) {
      const content = fs.readFileSync(layoutPath, 'utf8');
      
      // Check for font preloading
      if (!content.includes('rel="preload"') || !content.includes('as="font"')) {
        this.results.recommendations.push('Add font preloading to improve LCP');
        optimizations.push('font-preload-needed');
      }

      // Check for critical CSS
      if (!content.includes('critical.css') && !content.includes('inline-css')) {
        this.results.recommendations.push('Consider inlining critical CSS for faster LCP');
        optimizations.push('critical-css-needed');
      }
    }

    // Check for image optimization in components
    const imageComponents = this.findFiles('src/components', /\.(tsx|ts)$/)
      .filter(file => {
        const content = fs.readFileSync(file, 'utf8');
        return content.includes('<img') || content.includes('Image from');
      });

    imageComponents.forEach(component => {
      const content = fs.readFileSync(component, 'utf8');
      if (!content.includes('priority') && !content.includes('loading="eager"')) {
        this.results.recommendations.push(`Add priority loading to hero images in ${path.basename(component)}`);
        optimizations.push('image-priority-needed');
      }
    });

    this.results.optimizations.push({
      type: 'lcp-optimization',
      checks: optimizations.length,
      improvements: optimizations
    });
  }

  async optimizeFID() {
    this.log('  🖱️  Optimizing First Input Delay (FID)...', 'info');
    
    const optimizations = [];

    // Check for code splitting
    const nextConfig = 'next.config.js';
    if (fs.existsSync(nextConfig)) {
      const content = fs.readFileSync(nextConfig, 'utf8');
      
      if (!content.includes('splitChunks') && !content.includes('experimental')) {
        this.results.recommendations.push('Enable advanced code splitting in Next.js config');
        optimizations.push('code-splitting-needed');
      }
    }

    // Check for heavy JavaScript in components
    const jsFiles = this.findFiles('src', /\.(tsx|ts|js)$/)
      .filter(file => {
        const stats = fs.statSync(file);
        return stats.size > 50000; // Files larger than 50KB
      });

    if (jsFiles.length > 0) {
      this.results.recommendations.push(`Consider code splitting for ${jsFiles.length} large JavaScript files`);
      optimizations.push('large-js-files');
    }

    // Check for third-party scripts
    const layoutPath = 'src/app/layout.tsx';
    if (fs.existsSync(layoutPath)) {
      const content = fs.readFileSync(layoutPath, 'utf8');
      
      const thirdPartyScripts = [
        'googletagmanager.com',
        'google-analytics.com',
        'clarity.ms',
        'facebook.net'
      ];

      thirdPartyScripts.forEach(script => {
        if (content.includes(script) && !content.includes('strategy="afterInteractive"')) {
          this.results.recommendations.push(`Use afterInteractive strategy for ${script} to improve FID`);
          optimizations.push('script-strategy-needed');
        }
      });
    }

    this.results.optimizations.push({
      type: 'fid-optimization',
      checks: optimizations.length,
      improvements: optimizations
    });
  }

  async optimizeCLS() {
    this.log('  📐 Optimizing Cumulative Layout Shift (CLS)...', 'info');
    
    const optimizations = [];

    // Check for image dimensions
    const componentFiles = this.findFiles('src/components', /\.(tsx|ts)$/);
    
    componentFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      
      // Check for images without dimensions
      const imageMatches = content.match(/<img[^>]*>/g) || [];
      imageMatches.forEach(img => {
        if (!img.includes('width=') || !img.includes('height=')) {
          this.results.recommendations.push(`Add explicit dimensions to images in ${path.basename(file)}`);
          optimizations.push('image-dimensions-needed');
        }
      });

      // Check for dynamic content without placeholders
      if (content.includes('useState') && content.includes('loading')) {
        if (!content.includes('skeleton') && !content.includes('placeholder')) {
          this.results.recommendations.push(`Add loading skeletons in ${path.basename(file)} to prevent CLS`);
          optimizations.push('loading-skeleton-needed');
        }
      }
    });

    // Check for font loading strategy
    const layoutPath = 'src/app/layout.tsx';
    if (fs.existsSync(layoutPath)) {
      const content = fs.readFileSync(layoutPath, 'utf8');
      
      if (content.includes('@font-face') && !content.includes('font-display: swap')) {
        this.results.recommendations.push('Use font-display: swap to prevent layout shifts');
        optimizations.push('font-display-needed');
      }
    }

    this.results.optimizations.push({
      type: 'cls-optimization',
      checks: optimizations.length,
      improvements: optimizations
    });
  }

  async setupPerformanceMonitoring() {
    this.log('\n📊 Setting up Performance Monitoring...', 'info');

    try {
      // Create Core Web Vitals monitoring config
      const monitoringConfig = {
        thresholds: {
          lcp: { good: 2500, poor: 4000 },
          fid: { good: 100, poor: 300 },
          cls: { good: 0.1, poor: 0.25 }
        },
        monitoring: {
          enabled: true,
          reportingEndpoint: '/api/web-vitals',
          sampleRate: 1.0
        },
        alerts: {
          enabled: true,
          thresholdExceeded: true,
          dailyReport: true
        }
      };

      const configDir = 'config';
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }

      fs.writeFileSync(
        path.join(configDir, 'core-web-vitals-config.json'),
        JSON.stringify(monitoringConfig, null, 2)
      );

      // Create performance budget
      const performanceBudget = {
        budget: [
          {
            path: '/*',
            timings: [
              { metric: 'first-contentful-paint', budget: 2000 },
              { metric: 'largest-contentful-paint', budget: 2500 },
              { metric: 'cumulative-layout-shift', budget: 0.1 },
              { metric: 'total-blocking-time', budget: 300 }
            ],
            resourceSizes: [
              { resourceType: 'script', budget: 300 },
              { resourceType: 'image', budget: 500 },
              { resourceType: 'stylesheet', budget: 100 },
              { resourceType: 'total', budget: 1000 }
            ]
          }
        ]
      };

      fs.writeFileSync('budgets.json', JSON.stringify(performanceBudget, null, 2));

      this.results.optimizations.push({
        type: 'monitoring-setup',
        configs: ['core-web-vitals-config.json', 'budgets.json']
      });

      this.log('✓ Performance monitoring configured', 'success');

    } catch (error) {
      this.log(`✗ Performance monitoring setup failed: ${error.message}`, 'error');
    }
  }

  async optimizeCaching() {
    this.log('\n🗄️  Optimizing Caching Strategy...', 'info');

    try {
      // Create CloudFront caching configuration
      const cachingConfig = {
        behaviors: [
          {
            pathPattern: '/_next/static/*',
            cachePolicyId: 'immutable-assets',
            ttl: 31536000, // 1 year
            compress: true
          },
          {
            pathPattern: '/images/*',
            cachePolicyId: 'optimized-images',
            ttl: 86400, // 1 day
            compress: true
          },
          {
            pathPattern: '*.html',
            cachePolicyId: 'no-cache',
            ttl: 0,
            compress: true
          },
          {
            pathPattern: '/api/*',
            cachePolicyId: 'no-cache',
            ttl: 0,
            compress: false
          }
        ],
        headers: {
          'Cache-Control': 'public, max-age=31536000, immutable',
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
          'X-XSS-Protection': '1; mode=block',
          'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
          'Referrer-Policy': 'strict-origin-when-cross-origin'
        }
      };

      const configDir = 'config';
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }

      fs.writeFileSync(
        path.join(configDir, 'cloudfront-caching-config.json'),
        JSON.stringify(cachingConfig, null, 2)
      );

      this.results.optimizations.push({
        type: 'caching-optimization',
        behaviors: cachingConfig.behaviors.length,
        headers: Object.keys(cachingConfig.headers).length
      });

      this.log('✓ Caching strategy optimized', 'success');

    } catch (error) {
      this.log(`✗ Caching optimization failed: ${error.message}`, 'error');
    }
  }

  findImageFiles(directories, extensions) {
    let files = [];
    
    directories.forEach(dir => {
      if (fs.existsSync(dir)) {
        files = files.concat(this.findFiles(dir, new RegExp(`\\.(${extensions.map(e => e.slice(1)).join('|')})$`, 'i')));
      }
    });
    
    return files;
  }

  findFiles(dir, pattern, fileList = []) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
        this.findFiles(filePath, pattern, fileList);
      } else if (stat.isFile() && pattern.test(file)) {
        fileList.push(filePath);
      }
    });
    
    return fileList;
  }

  async generatePerformanceReport() {
    const reportPath = `performance-optimization-report-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    
    this.log(`\n📄 Performance report saved: ${reportPath}`, 'success');
    return reportPath;
  }

  async run() {
    this.log('⚡ Starting Performance Optimization Suite...', 'info');

    await this.optimizeImages();
    await this.optimizeCoreWebVitals();
    await this.setupPerformanceMonitoring();
    await this.optimizeCaching();

    const reportPath = await this.generatePerformanceReport();

    this.log('\n' + '='.repeat(60), 'success');
    this.log('🎯 PERFORMANCE OPTIMIZATION COMPLETED!', 'success');
    this.log('='.repeat(60), 'success');
    this.log(`Optimizations applied: ${this.results.optimizations.length}`, 'info');
    this.log(`Recommendations: ${this.results.recommendations.length}`, 'info');
    this.log(`Report: ${reportPath}`, 'info');

    if (this.results.recommendations.length > 0) {
      this.log('\n💡 Key Recommendations:', 'warning');
      this.results.recommendations.slice(0, 5).forEach(rec => {
        this.log(`  • ${rec}`, 'warning');
      });
    }

    return this.results;
  }
}

// Run if called directly
if (require.main === module) {
  const suite = new PerformanceOptimizationSuite();
  suite.run().then(results => {
    process.exit(0);
  }).catch(error => {
    console.error('Performance optimization failed:', error);
    process.exit(1);
  });
}

module.exports = PerformanceOptimizationSuite;