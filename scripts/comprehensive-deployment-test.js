#!/usr/bin/env node

/**
 * Comprehensive Deployment Testing Script
 *
 * This script performs end-to-end testing of the deployed website to validate:
 * - All website functionality works correctly
 * - Contact forms work with configured email
 * - Social media links and analytics tracking
 * - Mobile responsiveness and performance
 *
 * Requirements: 2.2, 2.3, 2.4, 2.5
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');
const fs = require('fs');
const path = require('path');

class DeploymentTester {
  constructor() {
    this.siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || process.env.AMPLIFY_APP_URL;
    this.results = {
      timestamp: new Date().toISOString(),
      siteUrl: this.siteUrl,
      tests: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        warnings: 0,
      },
    };

    if (!this.siteUrl) {
      console.error(
        '❌ No site URL configured. Set NEXT_PUBLIC_SITE_URL or AMPLIFY_APP_URL'
      );
      process.exit(1);
    }

    console.log(
      `🚀 Starting comprehensive deployment testing for: ${this.siteUrl}`
    );
  }

  async runAllTests() {
    try {
      // Core functionality tests
      await this.testSiteAccessibility();
      await this.testPageLoading();
      await this.testNavigation();

      // Contact form tests
      await this.testContactForms();

      // Social media and analytics tests
      await this.testSocialMediaLinks();
      await this.testAnalyticsTracking();

      // Mobile responsiveness tests
      await this.testMobileResponsiveness();

      // Performance tests
      await this.testPerformanceMetrics();

      // Security tests
      await this.testSecurityHeaders();

      this.generateReport();
    } catch (error) {
      console.error('❌ Test execution failed:', error.message);
      process.exit(1);
    }
  }

  async makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const client = urlObj.protocol === 'https:' ? https : http;

      const req = client.request(
        url,
        {
          method: options.method || 'GET',
          headers: options.headers || {},
          timeout: options.timeout || 10000,
          ...options,
        },
        res => {
          let data = '';
          res.on('data', chunk => (data += chunk));
          res.on('end', () => {
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              body: data,
              url: url,
            });
          });
        }
      );

      req.on('error', reject);
      req.on('timeout', () => reject(new Error('Request timeout')));

      if (options.body) {
        req.write(options.body);
      }

      req.end();
    });
  }

  addTestResult(testName, status, message, details = {}) {
    const result = {
      test: testName,
      status,
      message,
      details,
      timestamp: new Date().toISOString(),
    };

    this.results.tests.push(result);
    this.results.summary.total++;

    if (status === 'PASS') {
      this.results.summary.passed++;
      console.log(`✅ ${testName}: ${message}`);
    } else if (status === 'FAIL') {
      this.results.summary.failed++;
      console.log(`❌ ${testName}: ${message}`);
    } else if (status === 'WARN') {
      this.results.summary.warnings++;
      console.log(`⚠️  ${testName}: ${message}`);
    }
  }

  async testSiteAccessibility() {
    try {
      const response = await this.makeRequest(this.siteUrl);

      if (response.statusCode === 200) {
        this.addTestResult(
          'Site Accessibility',
          'PASS',
          'Site is accessible and returns 200 OK',
          { statusCode: response.statusCode, responseTime: Date.now() }
        );
      } else {
        this.addTestResult(
          'Site Accessibility',
          'FAIL',
          `Site returned status code ${response.statusCode}`,
          { statusCode: response.statusCode }
        );
      }
    } catch (error) {
      this.addTestResult(
        'Site Accessibility',
        'FAIL',
        `Failed to access site: ${error.message}`,
        { error: error.message }
      );
    }
  }

  async testPageLoading() {
    const pages = ['/', '/about', '/services', '/contact'];

    for (const page of pages) {
      try {
        const url = `${this.siteUrl}${page}`;
        const response = await this.makeRequest(url);

        if (response.statusCode === 200) {
          // Check for essential HTML elements
          const hasTitle = response.body.includes('<title>');
          const hasMetaDescription =
            response.body.includes('name="description"');
          const hasMainContent =
            response.body.includes('<main') ||
            response.body.includes('id="main"');

          if (hasTitle && hasMetaDescription && hasMainContent) {
            this.addTestResult(
              `Page Loading - ${page}`,
              'PASS',
              'Page loads correctly with essential elements',
              { url, statusCode: response.statusCode }
            );
          } else {
            this.addTestResult(
              `Page Loading - ${page}`,
              'WARN',
              'Page loads but missing some essential elements',
              { url, hasTitle, hasMetaDescription, hasMainContent }
            );
          }
        } else {
          this.addTestResult(
            `Page Loading - ${page}`,
            'FAIL',
            `Page returned status ${response.statusCode}`,
            { url, statusCode: response.statusCode }
          );
        }
      } catch (error) {
        this.addTestResult(
          `Page Loading - ${page}`,
          'FAIL',
          `Failed to load page: ${error.message}`,
          { page, error: error.message }
        );
      }
    }
  }

  async testNavigation() {
    try {
      const response = await this.makeRequest(this.siteUrl);

      if (response.statusCode === 200) {
        // Check for navigation elements
        const hasNavigation =
          response.body.includes('<nav') ||
          response.body.includes('navigation') ||
          response.body.includes('menu');

        const hasLinks =
          response.body.includes('href="/') && response.body.includes('<a');

        if (hasNavigation && hasLinks) {
          this.addTestResult(
            'Navigation Structure',
            'PASS',
            'Navigation elements and links are present',
            { hasNavigation, hasLinks }
          );
        } else {
          this.addTestResult(
            'Navigation Structure',
            'WARN',
            'Navigation structure may be incomplete',
            { hasNavigation, hasLinks }
          );
        }
      }
    } catch (error) {
      this.addTestResult(
        'Navigation Structure',
        'FAIL',
        `Failed to test navigation: ${error.message}`,
        { error: error.message }
      );
    }
  }

  async testContactForms() {
    try {
      const contactUrl = `${this.siteUrl}/contact`;
      const response = await this.makeRequest(contactUrl);

      if (response.statusCode === 200) {
        // Check for form elements
        const hasForm = response.body.includes('<form');
        const hasEmailField =
          response.body.includes('type="email"') ||
          response.body.includes('name="email"');
        const hasSubmitButton =
          response.body.includes('type="submit"') ||
          response.body.includes('button');

        if (hasForm && hasEmailField && hasSubmitButton) {
          this.addTestResult(
            'Contact Form Structure',
            'PASS',
            'Contact form has required elements',
            { hasForm, hasEmailField, hasSubmitButton }
          );

          // Check if contact email is configured
          const contactEmail = process.env.CONTACT_EMAIL;
          if (contactEmail) {
            this.addTestResult(
              'Contact Email Configuration',
              'PASS',
              `Contact email configured: ${contactEmail}`,
              { contactEmail }
            );
          } else {
            this.addTestResult(
              'Contact Email Configuration',
              'WARN',
              'CONTACT_EMAIL environment variable not set',
              { contactEmail: null }
            );
          }
        } else {
          this.addTestResult(
            'Contact Form Structure',
            'FAIL',
            'Contact form missing required elements',
            { hasForm, hasEmailField, hasSubmitButton }
          );
        }
      } else {
        this.addTestResult(
          'Contact Form Access',
          'FAIL',
          `Contact page returned status ${response.statusCode}`,
          { statusCode: response.statusCode }
        );
      }
    } catch (error) {
      this.addTestResult(
        'Contact Form Testing',
        'FAIL',
        `Failed to test contact form: ${error.message}`,
        { error: error.message }
      );
    }
  }

  async testSocialMediaLinks() {
    const socialPlatforms = {
      Facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL,
      Twitter: process.env.NEXT_PUBLIC_TWITTER_URL,
      LinkedIn: process.env.NEXT_PUBLIC_LINKEDIN_URL,
      Instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL,
    };

    try {
      const response = await this.makeRequest(this.siteUrl);

      if (response.statusCode === 200) {
        let configuredLinks = 0;
        let workingLinks = 0;

        for (const [platform, url] of Object.entries(socialPlatforms)) {
          if (url) {
            configuredLinks++;

            // Check if link appears in the page
            const linkInPage =
              response.body.includes(url) ||
              response.body.includes(platform.toLowerCase());

            if (linkInPage) {
              workingLinks++;
              this.addTestResult(
                `Social Media - ${platform}`,
                'PASS',
                `${platform} link found in page`,
                { url, linkInPage }
              );
            } else {
              this.addTestResult(
                `Social Media - ${platform}`,
                'WARN',
                `${platform} configured but not found in page`,
                { url, linkInPage }
              );
            }
          }
        }

        if (configuredLinks === 0) {
          this.addTestResult(
            'Social Media Configuration',
            'WARN',
            'No social media links configured',
            { configuredLinks }
          );
        } else {
          this.addTestResult(
            'Social Media Configuration',
            'PASS',
            `${configuredLinks} social media platforms configured`,
            { configuredLinks, workingLinks }
          );
        }
      }
    } catch (error) {
      this.addTestResult(
        'Social Media Links',
        'FAIL',
        `Failed to test social media links: ${error.message}`,
        { error: error.message }
      );
    }
  }

  async testAnalyticsTracking() {
    const analyticsIds = {
      'Google Analytics': process.env.NEXT_PUBLIC_GA_ID,
      'Google Tag Manager': process.env.NEXT_PUBLIC_GTM_ID,
      'Facebook Pixel': process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID,
    };

    try {
      const response = await this.makeRequest(this.siteUrl);

      if (response.statusCode === 200) {
        let configuredTracking = 0;
        let implementedTracking = 0;

        for (const [service, id] of Object.entries(analyticsIds)) {
          if (id) {
            configuredTracking++;

            // Check if tracking code is implemented
            const trackingImplemented =
              response.body.includes(id) ||
              response.body.includes('gtag') ||
              response.body.includes('analytics');

            if (trackingImplemented) {
              implementedTracking++;
              this.addTestResult(
                `Analytics - ${service}`,
                'PASS',
                `${service} tracking implemented`,
                { id, trackingImplemented }
              );
            } else {
              this.addTestResult(
                `Analytics - ${service}`,
                'WARN',
                `${service} configured but tracking code not found`,
                { id, trackingImplemented }
              );
            }
          }
        }

        if (configuredTracking === 0) {
          this.addTestResult(
            'Analytics Configuration',
            'WARN',
            'No analytics tracking configured',
            { configuredTracking }
          );
        } else {
          this.addTestResult(
            'Analytics Configuration',
            'PASS',
            `${configuredTracking} analytics services configured`,
            { configuredTracking, implementedTracking }
          );
        }
      }
    } catch (error) {
      this.addTestResult(
        'Analytics Tracking',
        'FAIL',
        `Failed to test analytics tracking: ${error.message}`,
        { error: error.message }
      );
    }
  }

  async testMobileResponsiveness() {
    try {
      const response = await this.makeRequest(this.siteUrl);

      if (response.statusCode === 200) {
        // Check for mobile-responsive meta tags and CSS
        const hasViewportMeta = response.body.includes('name="viewport"');
        const hasResponsiveCSS =
          response.body.includes('@media') ||
          response.body.includes('responsive') ||
          response.body.includes('mobile');
        const hasMobileOptimization =
          response.body.includes('width=device-width');

        if (hasViewportMeta && hasMobileOptimization) {
          this.addTestResult(
            'Mobile Responsiveness',
            'PASS',
            'Mobile viewport and optimization configured',
            { hasViewportMeta, hasResponsiveCSS, hasMobileOptimization }
          );
        } else {
          this.addTestResult(
            'Mobile Responsiveness',
            'WARN',
            'Mobile responsiveness may not be fully optimized',
            { hasViewportMeta, hasResponsiveCSS, hasMobileOptimization }
          );
        }
      }
    } catch (error) {
      this.addTestResult(
        'Mobile Responsiveness',
        'FAIL',
        `Failed to test mobile responsiveness: ${error.message}`,
        { error: error.message }
      );
    }
  }

  async testPerformanceMetrics() {
    try {
      const startTime = Date.now();
      const response = await this.makeRequest(this.siteUrl);
      const loadTime = Date.now() - startTime;

      if (response.statusCode === 200) {
        // Basic performance checks
        const contentLength =
          response.headers['content-length'] || response.body.length;
        const hasCompression =
          response.headers['content-encoding'] === 'gzip' ||
          response.headers['content-encoding'] === 'br';
        const hasCaching =
          response.headers['cache-control'] || response.headers['etag'];

        // Performance thresholds
        const isLoadTimeFast = loadTime < 3000; // 3 seconds
        const isContentSizeReasonable = contentLength < 500000; // 500KB

        if (isLoadTimeFast && hasCompression && hasCaching) {
          this.addTestResult(
            'Performance Metrics',
            'PASS',
            `Good performance: ${loadTime}ms load time`,
            { loadTime, contentLength, hasCompression, hasCaching }
          );
        } else {
          this.addTestResult(
            'Performance Metrics',
            'WARN',
            `Performance could be improved: ${loadTime}ms load time`,
            {
              loadTime,
              contentLength,
              hasCompression,
              hasCaching,
              isLoadTimeFast,
              isContentSizeReasonable,
            }
          );
        }
      }
    } catch (error) {
      this.addTestResult(
        'Performance Metrics',
        'FAIL',
        `Failed to test performance: ${error.message}`,
        { error: error.message }
      );
    }
  }

  async testSecurityHeaders() {
    try {
      const response = await this.makeRequest(this.siteUrl);

      if (response.statusCode === 200) {
        const securityHeaders = {
          'Strict-Transport-Security':
            response.headers['strict-transport-security'],
          'Content-Security-Policy':
            response.headers['content-security-policy'],
          'X-Frame-Options': response.headers['x-frame-options'],
          'X-Content-Type-Options': response.headers['x-content-type-options'],
          'Referrer-Policy': response.headers['referrer-policy'],
        };

        const presentHeaders = Object.entries(securityHeaders)
          .filter(([name, value]) => value)
          .map(([name]) => name);

        if (presentHeaders.length >= 3) {
          this.addTestResult(
            'Security Headers',
            'PASS',
            `${presentHeaders.length} security headers configured`,
            { securityHeaders: presentHeaders }
          );
        } else {
          this.addTestResult(
            'Security Headers',
            'WARN',
            `Only ${presentHeaders.length} security headers found`,
            { securityHeaders: presentHeaders }
          );
        }
      }
    } catch (error) {
      this.addTestResult(
        'Security Headers',
        'FAIL',
        `Failed to test security headers: ${error.message}`,
        { error: error.message }
      );
    }
  }

  generateReport() {
    const reportPath = path.join(process.cwd(), 'deployment-test-report.json');

    // Calculate success rate
    const successRate =
      this.results.summary.total > 0
        ? Math.round(
            (this.results.summary.passed / this.results.summary.total) * 100
          )
        : 0;

    this.results.summary.successRate = successRate;

    // Write detailed JSON report
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));

    // Generate summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 DEPLOYMENT TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`🌐 Site URL: ${this.siteUrl}`);
    console.log(`📅 Test Date: ${this.results.timestamp}`);
    console.log(`📈 Success Rate: ${successRate}%`);
    console.log(`✅ Passed: ${this.results.summary.passed}`);
    console.log(`❌ Failed: ${this.results.summary.failed}`);
    console.log(`⚠️  Warnings: ${this.results.summary.warnings}`);
    console.log(`📊 Total Tests: ${this.results.summary.total}`);
    console.log(`📄 Detailed Report: ${reportPath}`);
    console.log('='.repeat(60));

    // Exit with appropriate code
    if (this.results.summary.failed > 0) {
      console.log('❌ Some tests failed. Please review the issues above.');
      process.exit(1);
    } else if (this.results.summary.warnings > 0) {
      console.log('⚠️  All tests passed but there are warnings to review.');
      process.exit(0);
    } else {
      console.log('🎉 All tests passed successfully!');
      process.exit(0);
    }
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new DeploymentTester();
  tester.runAllTests().catch(error => {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = DeploymentTester;
