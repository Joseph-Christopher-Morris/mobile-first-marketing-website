#!/usr/bin/env node

/**
 * Compression and Performance Headers Tester
 *
 * This script tests compression settings and performance headers
 * for optimal CDN and browser caching behavior.
 */

const fs = require('fs');
const path = require('path');

class CompressionPerformanceTester {
  constructor() {
    this.results = {
      compressionHeaders: { passed: 0, failed: 0, tests: [] },
      performanceHeaders: { passed: 0, failed: 0, tests: [] },
      cacheValidation: { passed: 0, failed: 0, tests: [] },
      contentTypes: { passed: 0, failed: 0, tests: [] },
      overall: { passed: 0, failed: 0 },
    };
  }

  /**
   * Test compression headers configuration
   */
  testCompressionHeaders() {
    console.log('\n🗜️ Testing Compression Headers...');

    try {
      const amplifyPath = path.join(process.cwd(), 'amplify.yml');
      const amplifyContent = fs.readFileSync(amplifyPath, 'utf8');

      // Check for Vary: Accept-Encoding header
      const hasVaryAcceptEncoding =
        amplifyContent.includes('Vary') &&
        amplifyContent.includes('Accept-Encoding');
      this.addTest(
        'compressionHeaders',
        'Vary: Accept-Encoding header configured',
        hasVaryAcceptEncoding
      );

      // Check for compression-friendly content types
      const compressionFriendlyPatterns = [
        '*.{js,css}',
        '*.html',
        '*.json',
        '*.xml',
        '*.txt',
      ];

      let compressionOptimizedPatterns = 0;
      compressionFriendlyPatterns.forEach(pattern => {
        const hasPattern = amplifyContent.includes(pattern);
        if (hasPattern) {
          compressionOptimizedPatterns++;
          this.addTest(
            'compressionHeaders',
            `Compression optimization for ${pattern}`,
            true
          );
        }
      });

      const hasComprehensiveCompression = compressionOptimizedPatterns >= 2;
      this.addTest(
        'compressionHeaders',
        'Comprehensive compression configuration',
        hasComprehensiveCompression
      );

      // Check for proper cache control with compression
      const hasCacheControlWithVary =
        this.checkCacheControlWithVary(amplifyContent);
      this.addTest(
        'compressionHeaders',
        'Cache-Control with Vary header coordination',
        hasCacheControlWithVary
      );
    } catch (error) {
      this.addTest(
        'compressionHeaders',
        'Compression headers testing',
        false,
        error.message
      );
    }
  }

  /**
   * Check if Cache-Control and Vary headers are properly coordinated
   */
  checkCacheControlWithVary(content) {
    const lines = content.split('\n');
    let inPattern = false;
    let hasCacheControl = false;
    let hasVary = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.startsWith('- pattern:')) {
        // Reset for new pattern
        inPattern = true;
        hasCacheControl = false;
        hasVary = false;
        continue;
      }

      if (inPattern && line.startsWith('- key:')) {
        const key = line.replace('- key:', '').trim().replace(/['"]/g, '');
        if (key === 'Cache-Control') {
          hasCacheControl = true;
        }
        if (key === 'Vary') {
          hasVary = true;
        }
      }

      // End of pattern - check if both headers are present
      if (
        inPattern &&
        (line.startsWith('- pattern:') ||
          (!line.startsWith(' ') && !line.startsWith('-') && line !== ''))
      ) {
        if (hasCacheControl && hasVary) {
          return true;
        }
        inPattern = false;
      }
    }

    return hasCacheControl && hasVary;
  }

  /**
   * Test performance headers
   */
  testPerformanceHeaders() {
    console.log('\n⚡ Testing Performance Headers...');

    try {
      const amplifyPath = path.join(process.cwd(), 'amplify.yml');
      const amplifyContent = fs.readFileSync(amplifyPath, 'utf8');

      // Test Cache-Control header presence and values
      const cacheControlPatterns =
        this.extractCacheControlPatterns(amplifyContent);

      this.addTest(
        'performanceHeaders',
        'Cache-Control headers configured',
        cacheControlPatterns.length > 0
      );

      if (cacheControlPatterns.length > 0) {
        console.log(
          `  📋 Found ${cacheControlPatterns.length} Cache-Control patterns`
        );

        // Test for different cache strategies
        const hasLongTermCaching = cacheControlPatterns.some(pattern =>
          pattern.value.includes('max-age=31536000')
        );
        this.addTest(
          'performanceHeaders',
          'Long-term caching (1 year) configured',
          hasLongTermCaching
        );

        const hasMediumTermCaching = cacheControlPatterns.some(pattern =>
          pattern.value.includes('max-age=3600')
        );
        this.addTest(
          'performanceHeaders',
          'Medium-term caching (1 hour) configured',
          hasMediumTermCaching
        );

        const hasNoCache = cacheControlPatterns.some(pattern =>
          pattern.value.includes('no-cache')
        );
        this.addTest(
          'performanceHeaders',
          'No-cache for dynamic content',
          hasNoCache
        );

        const hasPublicCache = cacheControlPatterns.some(pattern =>
          pattern.value.includes('public')
        );
        this.addTest(
          'performanceHeaders',
          'Public caching directive',
          hasPublicCache
        );

        const hasImmutable = cacheControlPatterns.some(pattern =>
          pattern.value.includes('immutable')
        );
        this.addTest(
          'performanceHeaders',
          'Immutable directive for static assets',
          hasImmutable
        );

        const hasMustRevalidate = cacheControlPatterns.some(pattern =>
          pattern.value.includes('must-revalidate')
        );
        this.addTest(
          'performanceHeaders',
          'Must-revalidate for HTML content',
          hasMustRevalidate
        );
      }

      // Test for ETag handling (implicit with proper Cache-Control)
      const hasProperETagHandling = cacheControlPatterns.some(
        pattern =>
          !pattern.value.includes('no-store') &&
          pattern.value.includes('max-age')
      );
      this.addTest(
        'performanceHeaders',
        'Proper ETag handling configuration',
        hasProperETagHandling
      );
    } catch (error) {
      this.addTest(
        'performanceHeaders',
        'Performance headers testing',
        false,
        error.message
      );
    }
  }

  /**
   * Extract Cache-Control patterns from amplify.yml
   */
  extractCacheControlPatterns(content) {
    const patterns = [];
    const lines = content.split('\n');
    let currentPattern = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.startsWith('- pattern:')) {
        currentPattern = {
          pattern: line.replace('- pattern:', '').trim().replace(/['"]/g, ''),
          value: null,
        };
      }

      if (
        currentPattern &&
        line.startsWith('- key:') &&
        line.includes('Cache-Control')
      ) {
        const nextLine = lines[i + 1];
        if (nextLine && nextLine.trim().startsWith('value:')) {
          currentPattern.value = nextLine
            .trim()
            .replace('value:', '')
            .trim()
            .replace(/['"]/g, '');
          patterns.push(currentPattern);
          currentPattern = null;
        }
      }
    }

    return patterns;
  }

  /**
   * Validate cache behavior for different content types
   */
  validateCacheBehavior() {
    console.log('\n📦 Validating Cache Behavior by Content Type...');

    try {
      const amplifyPath = path.join(process.cwd(), 'amplify.yml');
      const amplifyContent = fs.readFileSync(amplifyPath, 'utf8');

      const contentTypeTests = [
        {
          name: 'Static Assets (JS/CSS/Images)',
          pattern:
            '*.{js,css,png,jpg,jpeg,gif,ico,svg,woff,woff2,ttf,eot,webp,avif}',
          expectedMaxAge: 31536000, // 1 year
          shouldHaveImmutable: true,
          shouldBePublic: true,
        },
        {
          name: 'HTML Files',
          pattern: '*.html',
          expectedMaxAge: 3600, // 1 hour
          shouldHaveMustRevalidate: true,
          shouldBePublic: true,
        },
        {
          name: 'API Routes',
          pattern: '/api/**',
          shouldHaveNoCache: true,
          shouldHaveNoStore: false, // no-store is too aggressive for APIs
        },
        {
          name: 'Service Worker',
          pattern: '/sw.js',
          shouldHaveNoCache: true,
          shouldHaveNoStore: true,
        },
        {
          name: 'Manifest',
          pattern: '/manifest.json',
          expectedMaxAge: 86400, // 1 day
          shouldBePublic: true,
        },
      ];

      contentTypeTests.forEach(test => {
        const hasPattern = amplifyContent.includes(test.pattern);
        this.addTest(
          'contentTypes',
          `${test.name} pattern configured`,
          hasPattern
        );

        if (hasPattern) {
          const cacheConfig = this.getCacheConfigForPattern(
            amplifyContent,
            test.pattern
          );

          if (test.expectedMaxAge) {
            const hasCorrectMaxAge =
              cacheConfig &&
              cacheConfig.includes(`max-age=${test.expectedMaxAge}`);
            this.addTest(
              'contentTypes',
              `${test.name} correct max-age`,
              hasCorrectMaxAge
            );
          }

          if (test.shouldHaveImmutable) {
            const hasImmutable =
              cacheConfig && cacheConfig.includes('immutable');
            this.addTest(
              'contentTypes',
              `${test.name} immutable directive`,
              hasImmutable
            );
          }

          if (test.shouldHaveMustRevalidate) {
            const hasMustRevalidate =
              cacheConfig && cacheConfig.includes('must-revalidate');
            this.addTest(
              'contentTypes',
              `${test.name} must-revalidate directive`,
              hasMustRevalidate
            );
          }

          if (test.shouldBePublic) {
            const isPublic = cacheConfig && cacheConfig.includes('public');
            this.addTest(
              'contentTypes',
              `${test.name} public caching`,
              isPublic
            );
          }

          if (test.shouldHaveNoCache) {
            const hasNoCache = cacheConfig && cacheConfig.includes('no-cache');
            this.addTest(
              'contentTypes',
              `${test.name} no-cache directive`,
              hasNoCache
            );
          }

          if (test.shouldHaveNoStore) {
            const hasNoStore = cacheConfig && cacheConfig.includes('no-store');
            this.addTest(
              'contentTypes',
              `${test.name} no-store directive`,
              hasNoStore
            );
          }
        }
      });
    } catch (error) {
      this.addTest(
        'contentTypes',
        'Content type cache validation',
        false,
        error.message
      );
    }
  }

  /**
   * Get cache configuration for a specific pattern
   */
  getCacheConfigForPattern(content, targetPattern) {
    const lines = content.split('\n');
    let inTargetPattern = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.startsWith('- pattern:') && line.includes(targetPattern)) {
        inTargetPattern = true;
        continue;
      }

      if (
        inTargetPattern &&
        line.startsWith('- key:') &&
        line.includes('Cache-Control')
      ) {
        const nextLine = lines[i + 1];
        if (nextLine && nextLine.trim().startsWith('value:')) {
          return nextLine
            .trim()
            .replace('value:', '')
            .trim()
            .replace(/['"]/g, '');
        }
      }

      // End of current pattern
      if (inTargetPattern && line.startsWith('- pattern:')) {
        break;
      }
    }

    return null;
  }

  /**
   * Test cache validation mechanisms
   */
  testCacheValidation() {
    console.log('\n🔍 Testing Cache Validation Mechanisms...');

    try {
      const amplifyPath = path.join(process.cwd(), 'amplify.yml');
      const amplifyContent = fs.readFileSync(amplifyPath, 'utf8');

      // Test for proper cache validation headers
      const hasETagSupport =
        !amplifyContent.includes('no-store') ||
        amplifyContent.includes('must-revalidate');
      this.addTest('cacheValidation', 'ETag support enabled', hasETagSupport);

      // Test for conditional request support
      const hasConditionalRequests =
        amplifyContent.includes('must-revalidate') ||
        amplifyContent.includes('max-age');
      this.addTest(
        'cacheValidation',
        'Conditional request support',
        hasConditionalRequests
      );

      // Test for proper cache hierarchy
      const cacheControlPatterns =
        this.extractCacheControlPatterns(amplifyContent);
      const maxAges = cacheControlPatterns
        .map(p => {
          const match = p.value.match(/max-age=(\d+)/);
          return match ? parseInt(match[1]) : 0;
        })
        .filter(age => age > 0);

      const hasProperCacheHierarchy =
        maxAges.length > 1 && Math.max(...maxAges) > Math.min(...maxAges) * 10;
      this.addTest(
        'cacheValidation',
        'Proper cache duration hierarchy',
        hasProperCacheHierarchy
      );

      if (maxAges.length > 0) {
        console.log(
          `  📊 Cache durations: ${maxAges.map(age => `${Math.round(age / 86400)}d`).join(', ')}`
        );
      }

      // Test for cache busting strategy
      const hasImmutableAssets = amplifyContent.includes('immutable');
      this.addTest(
        'cacheValidation',
        'Cache busting strategy (immutable assets)',
        hasImmutableAssets
      );
    } catch (error) {
      this.addTest(
        'cacheValidation',
        'Cache validation testing',
        false,
        error.message
      );
    }
  }

  /**
   * Generate performance recommendations
   */
  generatePerformanceRecommendations() {
    console.log('\n💡 Performance Optimization Recommendations:');

    const recommendations = [];

    // Check compression optimization
    if (this.results.compressionHeaders.failed > 0) {
      recommendations.push(
        'Add Vary: Accept-Encoding headers for all compressible content'
      );
      recommendations.push(
        'Coordinate Cache-Control and Vary headers for optimal compression'
      );
    }

    // Check performance headers
    if (this.results.performanceHeaders.failed > 0) {
      recommendations.push('Implement comprehensive Cache-Control strategies');
      recommendations.push(
        'Add immutable directive for static assets with content hashing'
      );
      recommendations.push('Use must-revalidate for HTML to ensure freshness');
    }

    // Check content type optimization
    if (this.results.contentTypes.failed > 0) {
      recommendations.push(
        'Optimize caching strategies for different content types'
      );
      recommendations.push('Implement proper no-cache for dynamic content');
      recommendations.push(
        'Use appropriate cache durations for each content type'
      );
    }

    // Check cache validation
    if (this.results.cacheValidation.failed > 0) {
      recommendations.push('Implement proper cache validation mechanisms');
      recommendations.push(
        'Create cache duration hierarchy for different content types'
      );
      recommendations.push(
        'Enable conditional requests for better cache efficiency'
      );
    }

    if (recommendations.length === 0) {
      console.log(
        '  ✅ Compression and performance configuration is excellent!'
      );
    } else {
      recommendations.forEach(rec => console.log(`  • ${rec}`));
    }

    // Performance best practices
    console.log('\n🎯 Performance Best Practices:');
    console.log('  • Monitor cache hit rates and adjust strategies');
    console.log(
      '  • Use browser caching for static assets, CDN caching for dynamic content'
    );
    console.log('  • Implement proper cache invalidation strategies');
    console.log(
      '  • Test caching behavior across different browsers and devices'
    );
    console.log('  • Monitor Core Web Vitals impact of caching changes');
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
    console.log('⚡ COMPRESSION & PERFORMANCE TESTING REPORT');
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

    this.generatePerformanceRecommendations();

    const overallTotal =
      this.results.overall.passed + this.results.overall.failed;
    const overallPercentage =
      overallTotal > 0
        ? Math.round((this.results.overall.passed / overallTotal) * 100)
        : 0;

    console.log('\n' + '='.repeat(60));
    console.log(
      `📈 OVERALL PERFORMANCE SCORE: ${this.results.overall.passed}/${overallTotal} (${overallPercentage}%)`
    );

    if (overallPercentage >= 90) {
      console.log(
        '🎉 Excellent! Compression and performance configuration is optimal.'
      );
    } else if (overallPercentage >= 75) {
      console.log(
        '✅ Good performance configuration with room for optimization.'
      );
    } else {
      console.log('⚠️  Performance configuration needs optimization.');
    }

    console.log('='.repeat(60));

    return overallPercentage >= 75;
  }

  /**
   * Run all tests
   */
  async run() {
    console.log('⚡ Starting Compression & Performance Testing...');
    console.log('This will test compression settings and performance headers.');

    this.testCompressionHeaders();
    this.testPerformanceHeaders();
    this.validateCacheBehavior();
    this.testCacheValidation();

    const success = this.generateReport();

    if (!success) {
      process.exit(1);
    }

    console.log(
      '\n✅ Compression & performance testing completed successfully!'
    );
  }
}

// Run testing if called directly
if (require.main === module) {
  const tester = new CompressionPerformanceTester();
  tester.run().catch(error => {
    console.error('❌ Compression & performance testing failed:', error);
    process.exit(1);
  });
}

module.exports = CompressionPerformanceTester;
