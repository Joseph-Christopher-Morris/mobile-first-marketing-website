#!/usr/bin/env node

/**
 * Caching and CDN Configuration Optimizer
 *
 * This script validates and optimizes caching rules and CDN configuration
 * for AWS Amplify deployment with CloudFront.
 */

const fs = require('fs');
const path = require('path');

class CachingCdnOptimizer {
  constructor() {
    this.results = {
      cachingRules: { passed: 0, failed: 0, tests: [] },
      compressionConfig: { passed: 0, failed: 0, tests: [] },
      cdnOptimization: { passed: 0, failed: 0, tests: [] },
      performanceHeaders: { passed: 0, failed: 0, tests: [] },
      overall: { passed: 0, failed: 0 },
    };
    this.cachingConfig = null;
  }

  /**
   * Validate caching rules configuration
   */
  validateCachingRules() {
    console.log('\n📦 Validating Caching Rules Configuration...');

    try {
      const amplifyPath = path.join(process.cwd(), 'amplify.yml');
      const amplifyContent = fs.readFileSync(amplifyPath, 'utf8');

      // Check for custom headers section
      const hasCustomHeaders = amplifyContent.includes('customHeaders:');
      this.addTest(
        'cachingRules',
        'Custom headers section present',
        hasCustomHeaders
      );

      if (!hasCustomHeaders) {
        this.addTest(
          'cachingRules',
          'Caching rules configured',
          false,
          'No custom headers section'
        );
        return;
      }

      // Extract caching patterns
      const cachingPatterns = this.extractCachingPatterns(amplifyContent);
      this.cachingConfig = cachingPatterns;

      this.addTest(
        'cachingRules',
        'Caching patterns found',
        cachingPatterns.length > 0
      );
      console.log(`  📋 Found ${cachingPatterns.length} caching patterns`);

      // Validate static asset caching
      const hasStaticAssetCaching = cachingPatterns.some(pattern =>
        pattern.pattern.includes(
          '*.{js,css,png,jpg,jpeg,gif,ico,svg,woff,woff2,ttf,eot,webp,avif}'
        )
      );
      this.addTest(
        'cachingRules',
        'Static asset caching configured',
        hasStaticAssetCaching
      );

      // Validate HTML caching
      const hasHtmlCaching = cachingPatterns.some(pattern =>
        pattern.pattern.includes('*.html')
      );
      this.addTest('cachingRules', 'HTML caching configured', hasHtmlCaching);

      // Validate long-term caching for static assets
      const hasLongTermCaching = cachingPatterns.some(pattern => {
        if (
          pattern.pattern.includes(
            '*.{js,css,png,jpg,jpeg,gif,ico,svg,woff,woff2,ttf,eot,webp,avif}'
          )
        ) {
          return pattern.headers.some(
            header =>
              header.key === 'Cache-Control' &&
              header.value.includes('max-age=31536000')
          );
        }
        return false;
      });
      this.addTest(
        'cachingRules',
        'Long-term caching for static assets',
        hasLongTermCaching
      );

      // Validate immutable directive for static assets
      const hasImmutableDirective = cachingPatterns.some(pattern => {
        if (
          pattern.pattern.includes(
            '*.{js,css,png,jpg,jpeg,gif,ico,svg,woff,woff2,ttf,eot,webp,avif}'
          )
        ) {
          return pattern.headers.some(
            header =>
              header.key === 'Cache-Control' &&
              header.value.includes('immutable')
          );
        }
        return false;
      });
      this.addTest(
        'cachingRules',
        'Immutable directive for static assets',
        hasImmutableDirective
      );

      // Validate API route no-cache
      const hasApiNoCache = cachingPatterns.some(pattern => {
        if (pattern.pattern.includes('/api/**')) {
          return pattern.headers.some(
            header =>
              header.key === 'Cache-Control' &&
              header.value.includes('no-cache')
          );
        }
        return false;
      });
      this.addTest(
        'cachingRules',
        'API routes no-cache configuration',
        hasApiNoCache
      );
    } catch (error) {
      this.addTest(
        'cachingRules',
        'Caching rules validation',
        false,
        error.message
      );
    }
  }

  /**
   * Extract caching patterns from amplify.yml
   */
  extractCachingPatterns(content) {
    const patterns = [];
    const lines = content.split('\n');
    let currentPattern = null;
    let inCustomHeaders = false;
    let inHeaders = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();

      // Check for customHeaders section
      if (trimmedLine === 'customHeaders:') {
        inCustomHeaders = true;
        continue;
      }

      // If we're in customHeaders and find a pattern
      if (inCustomHeaders && trimmedLine.startsWith('- pattern:')) {
        // Save previous pattern if exists
        if (currentPattern) {
          patterns.push(currentPattern);
        }

        // Start new pattern
        const patternValue = trimmedLine
          .replace('- pattern:', '')
          .trim()
          .replace(/^["']|["']$/g, '');
        currentPattern = {
          pattern: patternValue,
          headers: [],
        };
        inHeaders = false;
        continue;
      }

      // Check for headers section within a pattern
      if (currentPattern && trimmedLine === 'headers:') {
        inHeaders = true;
        continue;
      }

      // Extract header key-value pairs
      if (inHeaders && trimmedLine.startsWith('- key:')) {
        const key = trimmedLine
          .replace('- key:', '')
          .trim()
          .replace(/^["']|["']$/g, '');

        // Look for the value on the next line
        if (i + 1 < lines.length) {
          const nextLine = lines[i + 1].trim();
          if (nextLine.startsWith('value:')) {
            const value = nextLine
              .replace('value:', '')
              .trim()
              .replace(/^["']|["']$/g, '');
            currentPattern.headers.push({ key, value });
            i++; // Skip the value line
          }
        }
        continue;
      }

      // Check if we've left the customHeaders section
      if (
        inCustomHeaders &&
        line.length > 0 &&
        !line.startsWith(' ') &&
        !line.startsWith('#') &&
        trimmedLine !== 'customHeaders:'
      ) {
        // We've reached a new top-level section
        if (currentPattern) {
          patterns.push(currentPattern);
        }
        break;
      }
    }

    // Don't forget the last pattern
    if (currentPattern) {
      patterns.push(currentPattern);
    }

    return patterns;
  }

  /**
   * Validate compression configuration
   */
  validateCompressionConfig() {
    console.log('\n🗜️ Validating Compression Configuration...');

    if (!this.cachingConfig) {
      this.addTest('compressionConfig', 'Caching config available', false);
      return;
    }

    // Check for Vary: Accept-Encoding header
    const hasVaryHeader = this.cachingConfig.some(pattern =>
      pattern.headers.some(
        header =>
          header.key === 'Vary' && header.value.includes('Accept-Encoding')
      )
    );
    this.addTest(
      'compressionConfig',
      'Vary: Accept-Encoding header configured',
      hasVaryHeader
    );

    // Check for compression-friendly cache control
    const hasCompressionFriendlyCache = this.cachingConfig.some(pattern => {
      const hasCacheControl = pattern.headers.some(
        header => header.key === 'Cache-Control'
      );
      const hasVary = pattern.headers.some(header => header.key === 'Vary');
      return hasCacheControl && hasVary;
    });
    this.addTest(
      'compressionConfig',
      'Compression-friendly caching',
      hasCompressionFriendlyCache
    );

    // Validate that text assets have appropriate caching
    const textAssetPatterns = this.cachingConfig.filter(
      pattern =>
        pattern.pattern.includes('*.{js,css}') ||
        pattern.pattern.includes('*.html')
    );

    const hasTextAssetOptimization = textAssetPatterns.length > 0;
    this.addTest(
      'compressionConfig',
      'Text asset compression optimization',
      hasTextAssetOptimization
    );

    if (hasTextAssetOptimization) {
      console.log(
        `  📋 Found ${textAssetPatterns.length} text asset caching patterns`
      );
    }
  }

  /**
   * Validate CDN optimization settings
   */
  validateCdnOptimization() {
    console.log('\n🌐 Validating CDN Optimization...');

    if (!this.cachingConfig) {
      this.addTest('cdnOptimization', 'CDN config available', false);
      return;
    }

    // Check for different cache strategies for different content types
    const hasStaticAssetStrategy = this.cachingConfig.some(pattern =>
      pattern.pattern.includes(
        '*.{js,css,png,jpg,jpeg,gif,ico,svg,woff,woff2,ttf,eot,webp,avif}'
      )
    );
    this.addTest(
      'cdnOptimization',
      'Static asset caching strategy',
      hasStaticAssetStrategy
    );

    const hasHtmlStrategy = this.cachingConfig.some(pattern =>
      pattern.pattern.includes('*.html')
    );
    this.addTest('cdnOptimization', 'HTML caching strategy', hasHtmlStrategy);

    const hasApiStrategy = this.cachingConfig.some(pattern =>
      pattern.pattern.includes('/api/**')
    );
    this.addTest(
      'cdnOptimization',
      'API route caching strategy',
      hasApiStrategy
    );

    // Check for service worker special handling
    const hasServiceWorkerStrategy = this.cachingConfig.some(pattern =>
      pattern.pattern.includes('/sw.js')
    );
    this.addTest(
      'cdnOptimization',
      'Service worker caching strategy',
      hasServiceWorkerStrategy
    );

    // Check for manifest caching
    const hasManifestStrategy = this.cachingConfig.some(pattern =>
      pattern.pattern.includes('/manifest.json')
    );
    this.addTest(
      'cdnOptimization',
      'Manifest caching strategy',
      hasManifestStrategy
    );

    // Validate cache invalidation patterns
    const hasWildcardPatterns = this.cachingConfig.some(pattern =>
      pattern.pattern.includes('**/*')
    );
    this.addTest(
      'cdnOptimization',
      'Wildcard caching patterns for broad coverage',
      hasWildcardPatterns
    );
  }

  /**
   * Validate performance headers
   */
  validatePerformanceHeaders() {
    console.log('\n⚡ Validating Performance Headers...');

    if (!this.cachingConfig) {
      this.addTest('performanceHeaders', 'Performance config available', false);
      return;
    }

    // Check for Cache-Control headers
    const hasCacheControlHeaders = this.cachingConfig.some(pattern =>
      pattern.headers.some(header => header.key === 'Cache-Control')
    );
    this.addTest(
      'performanceHeaders',
      'Cache-Control headers present',
      hasCacheControlHeaders
    );

    // Check for ETag handling (implicit with CloudFront)
    const hasProperCacheControl = this.cachingConfig.some(pattern =>
      pattern.headers.some(
        header =>
          header.key === 'Cache-Control' &&
          (header.value.includes('public') || header.value.includes('private'))
      )
    );
    this.addTest(
      'performanceHeaders',
      'Proper Cache-Control directives',
      hasProperCacheControl
    );

    // Check for must-revalidate for HTML
    const hasHtmlRevalidation = this.cachingConfig.some(pattern => {
      if (pattern.pattern.includes('*.html')) {
        return pattern.headers.some(
          header =>
            header.key === 'Cache-Control' &&
            header.value.includes('must-revalidate')
        );
      }
      return false;
    });
    this.addTest(
      'performanceHeaders',
      'HTML must-revalidate directive',
      hasHtmlRevalidation
    );

    // Check for Vary header for responsive content
    const hasVaryHeader = this.cachingConfig.some(pattern =>
      pattern.headers.some(header => header.key === 'Vary')
    );
    this.addTest(
      'performanceHeaders',
      'Vary headers for content negotiation',
      hasVaryHeader
    );

    // Validate different max-age values for different content types
    const cacheControlValues = [];
    this.cachingConfig.forEach(pattern => {
      pattern.headers.forEach(header => {
        if (header.key === 'Cache-Control') {
          const maxAgeMatch = header.value.match(/max-age=(\d+)/);
          if (maxAgeMatch) {
            cacheControlValues.push({
              pattern: pattern.pattern,
              maxAge: parseInt(maxAgeMatch[1]),
            });
          }
        }
      });
    });

    const hasDifferentCacheDurations =
      cacheControlValues.length > 1 &&
      new Set(cacheControlValues.map(v => v.maxAge)).size > 1;
    this.addTest(
      'performanceHeaders',
      'Different cache durations for different content',
      hasDifferentCacheDurations
    );

    if (cacheControlValues.length > 0) {
      console.log('  📊 Cache durations found:');
      cacheControlValues.forEach(({ pattern, maxAge }) => {
        const days = Math.round(maxAge / 86400);
        console.log(`    ${pattern}: ${maxAge}s (${days} days)`);
      });
    }
  }

  /**
   * Test cache invalidation scripts
   */
  testCacheInvalidation() {
    console.log('\n🔄 Testing Cache Invalidation Scripts...');

    try {
      // Check if cache invalidation script exists
      const cacheInvalidationPath = path.join(
        process.cwd(),
        'scripts',
        'cache-invalidation.js'
      );
      const hasInvalidationScript = fs.existsSync(cacheInvalidationPath);
      this.addTest(
        'cdnOptimization',
        'Cache invalidation script exists',
        hasInvalidationScript
      );

      if (hasInvalidationScript) {
        const scriptContent = fs.readFileSync(cacheInvalidationPath, 'utf8');

        // Check for CloudFront invalidation functionality
        const hasCloudFrontSupport =
          scriptContent.includes('cloudfront') ||
          scriptContent.includes('CloudFront') ||
          scriptContent.includes('invalidation');
        this.addTest(
          'cdnOptimization',
          'CloudFront invalidation support',
          hasCloudFrontSupport
        );

        // Check for different invalidation strategies
        const hasDeploymentInvalidation = scriptContent.includes('deployment');
        this.addTest(
          'cdnOptimization',
          'Deployment-triggered invalidation',
          hasDeploymentInvalidation
        );

        const hasContentInvalidation = scriptContent.includes('content');
        this.addTest(
          'cdnOptimization',
          'Content-specific invalidation',
          hasContentInvalidation
        );
      }

      // Check if cache optimization script exists
      const cacheOptimizationPath = path.join(
        process.cwd(),
        'scripts',
        'cache-optimization.js'
      );
      const hasOptimizationScript = fs.existsSync(cacheOptimizationPath);
      this.addTest(
        'cdnOptimization',
        'Cache optimization script exists',
        hasOptimizationScript
      );
    } catch (error) {
      this.addTest(
        'cdnOptimization',
        'Cache invalidation testing',
        false,
        error.message
      );
    }
  }

  /**
   * Generate optimization recommendations
   */
  generateOptimizationRecommendations() {
    console.log('\n💡 Caching & CDN Optimization Recommendations:');

    const recommendations = [];

    // Check for missing cache strategies
    if (this.results.cachingRules.failed > 0) {
      recommendations.push(
        'Configure comprehensive caching rules for all content types'
      );
      recommendations.push(
        'Implement long-term caching (1 year) for static assets with immutable directive'
      );
    }

    // Check for compression optimization
    if (this.results.compressionConfig.failed > 0) {
      recommendations.push(
        'Add Vary: Accept-Encoding headers for better compression'
      );
      recommendations.push('Optimize caching for compressed content');
    }

    // Check for CDN optimization
    if (this.results.cdnOptimization.failed > 0) {
      recommendations.push(
        'Implement different caching strategies for different content types'
      );
      recommendations.push(
        'Add special handling for service workers and manifests'
      );
    }

    // Check for performance headers
    if (this.results.performanceHeaders.failed > 0) {
      recommendations.push(
        'Add proper Cache-Control directives (public/private)'
      );
      recommendations.push('Implement must-revalidate for HTML content');
    }

    if (recommendations.length === 0) {
      console.log('  ✅ Caching and CDN configuration is well optimized!');
    } else {
      recommendations.forEach(rec => console.log(`  • ${rec}`));
    }

    // Additional best practices
    console.log('\n🎯 Best Practices:');
    console.log(
      '  • Monitor cache hit rates and adjust strategies accordingly'
    );
    console.log('  • Use cache invalidation sparingly to maintain performance');
    console.log('  • Test caching behavior across different content types');
    console.log('  • Consider implementing cache warming for critical assets');
    console.log('  • Monitor Core Web Vitals impact of caching strategies');
  }

  /**
   * Add test result
   */
  addTest(category, name, passed, details = '') {
    const test = { name, passed, details };
    this.results[category].tests.push(test);

    if (passed) {
      this.results[category].passed++;
      this.results.overall.passed++;
      console.log(`  ✅ ${name}`);
    } else {
      this.results[category].failed++;
      this.results.overall.failed++;
      console.log(`  ❌ ${name}${details ? ` - ${details}` : ''}`);
    }
  }

  /**
   * Generate comprehensive report
   */
  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📦 CACHING & CDN OPTIMIZATION REPORT');
    console.log('='.repeat(60));

    Object.entries(this.results).forEach(([category, result]) => {
      if (category === 'overall') return;

      const categoryName = category
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase());
      const total = result.passed + result.failed;
      const percentage =
        total > 0 ? Math.round((result.passed / total) * 100) : 0;

      console.log(`\n📊 ${categoryName}:`);
      console.log(`   Passed: ${result.passed}/${total} (${percentage}%)`);

      if (result.failed > 0) {
        console.log('   Failed tests:');
        result.tests
          .filter(test => !test.passed)
          .forEach(test => {
            console.log(
              `     • ${test.name}${test.details ? ` - ${test.details}` : ''}`
            );
          });
      }
    });

    this.generateOptimizationRecommendations();

    const overallTotal =
      this.results.overall.passed + this.results.overall.failed;
    const overallPercentage =
      overallTotal > 0
        ? Math.round((this.results.overall.passed / overallTotal) * 100)
        : 0;

    console.log('\n' + '='.repeat(60));
    console.log(
      `📈 OVERALL CACHING SCORE: ${this.results.overall.passed}/${overallTotal} (${overallPercentage}%)`
    );

    if (overallPercentage >= 90) {
      console.log(
        '🎉 Excellent! Caching and CDN configuration is well optimized.'
      );
    } else if (overallPercentage >= 75) {
      console.log('✅ Good caching configuration with room for optimization.');
    } else {
      console.log(
        '⚠️  Caching configuration needs optimization for better performance.'
      );
    }

    console.log('='.repeat(60));

    return overallPercentage >= 75;
  }

  /**
   * Run all validations and optimizations
   */
  async run() {
    console.log('📦 Starting Caching & CDN Optimization...');
    console.log(
      'This will validate and optimize caching rules and CDN configuration.'
    );

    this.validateCachingRules();
    this.validateCompressionConfig();
    this.validateCdnOptimization();
    this.validatePerformanceHeaders();
    this.testCacheInvalidation();

    const success = this.generateReport();

    if (!success) {
      process.exit(1);
    }

    console.log('\n✅ Caching & CDN optimization completed successfully!');
  }
}

// Run optimization if called directly
if (require.main === module) {
  const optimizer = new CachingCdnOptimizer();
  optimizer.run().catch(error => {
    console.error('❌ Caching & CDN optimization failed:', error);
    process.exit(1);
  });
}

module.exports = CachingCdnOptimizer;
