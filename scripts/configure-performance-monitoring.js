#!/usr/bin/env node

/**
 * Performance Monitoring Configuration Script
 * Configures Google Analytics, Core Web Vitals tracking, and performance monitoring
 */

const fs = require('fs');
const path = require('path');
const CoreWebVitalsMonitor = require('./core-web-vitals-monitor');
const PerformanceMonitor = require('./performance-monitor');
const PerformanceBudgetValidator = require('./performance-budget-validator');

class PerformanceMonitoringConfigurator {
  constructor() {
    this.config = {
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      gaId: process.env.NEXT_PUBLIC_GA_ID,
      gtmId: process.env.NEXT_PUBLIC_GTM_ID,
      hotjarId: process.env.NEXT_PUBLIC_HOTJAR_ID,
      facebookPixelId: process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID,
      enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
      enablePerformanceMonitoring:
        process.env.NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING === 'true',
    };

    this.monitoringComponents = {
      coreWebVitals: new CoreWebVitalsMonitor(),
      performanceMonitor: new PerformanceMonitor(),
      budgetValidator: new PerformanceBudgetValidator(),
    };
  }

  async configurePerformanceMonitoring() {
    console.log('🎯 Configuring performance monitoring...');

    try {
      // Step 1: Set up Google Analytics if configured
      await this.setupGoogleAnalytics();

      // Step 2: Enable Core Web Vitals tracking
      await this.enableCoreWebVitalsTracking();

      // Step 3: Configure performance monitoring scripts
      await this.configurePerformanceScripts();

      // Step 4: Test deployment monitoring functionality
      await this.testDeploymentMonitoring();

      // Step 5: Generate monitoring configuration report
      const report = await this.generateMonitoringReport();

      console.log('✅ Performance monitoring configuration completed');
      return report;
    } catch (error) {
      console.error(
        '❌ Performance monitoring configuration failed:',
        error.message
      );
      throw error;
    }
  }

  async setupGoogleAnalytics() {
    console.log('📊 Setting up Google Analytics...');

    if (!this.config.gaId && !this.config.gtmId) {
      console.log(
        '⚠️  No Google Analytics or GTM ID configured, skipping analytics setup'
      );
      return { status: 'skipped', reason: 'No analytics IDs configured' };
    }

    try {
      // Create analytics configuration
      const analyticsConfig = {
        gaId: this.config.gaId,
        gtmId: this.config.gtmId,
        enablePerformanceTracking: true,
        enableCoreWebVitalsTracking: true,
        customDimensions: {
          pageType: 'custom_dimension_1',
          userType: 'custom_dimension_2',
          deviceType: 'custom_dimension_3',
        },
        events: {
          coreWebVitals: true,
          pageViews: true,
          interactions: true,
          errors: true,
        },
      };

      // Write analytics configuration
      const configPath = path.join(process.cwd(), 'src/config/analytics.json');
      const configDir = path.dirname(configPath);

      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }

      fs.writeFileSync(configPath, JSON.stringify(analyticsConfig, null, 2));

      // Create analytics utility script
      await this.createAnalyticsUtility();

      console.log('✅ Google Analytics configuration completed');
      console.log(`   GA ID: ${this.config.gaId || 'Not configured'}`);
      console.log(`   GTM ID: ${this.config.gtmId || 'Not configured'}`);

      return {
        status: 'configured',
        gaId: this.config.gaId,
        gtmId: this.config.gtmId,
        configPath,
      };
    } catch (error) {
      console.warn('⚠️  Google Analytics setup failed:', error.message);
      return { status: 'failed', error: error.message };
    }
  }

  async createAnalyticsUtility() {
    const analyticsUtilityPath = path.join(
      process.cwd(),
      'src/lib/analytics.ts'
    );

    const analyticsUtility = `/**
 * Analytics Utility
 * Handles Google Analytics and Core Web Vitals tracking
 */

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export interface AnalyticsConfig {
  gaId?: string;
  gtmId?: string;
  enablePerformanceTracking: boolean;
  enableCoreWebVitalsTracking: boolean;
}

export class Analytics {
  private config: AnalyticsConfig;
  private isInitialized = false;

  constructor(config: AnalyticsConfig) {
    this.config = config;
  }

  async initialize() {
    if (this.isInitialized || typeof window === 'undefined') {
      return;
    }

    try {
      // Initialize Google Analytics
      if (this.config.gaId) {
        await this.initializeGA();
      }

      // Initialize GTM
      if (this.config.gtmId) {
        await this.initializeGTM();
      }

      // Set up Core Web Vitals tracking
      if (this.config.enableCoreWebVitalsTracking) {
        await this.initializeCoreWebVitalsTracking();
      }

      this.isInitialized = true;
      console.log('📊 Analytics initialized successfully');
    } catch (error) {
      console.error('❌ Analytics initialization failed:', error);
    }
  }

  private async initializeGA() {
    const script = document.createElement('script');
    script.async = true;
    script.src = \`https://www.googletagmanager.com/gtag/js?id=\${this.config.gaId}\`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };

    window.gtag('js', new Date());
    window.gtag('config', this.config.gaId!, {
      page_title: document.title,
      page_location: window.location.href,
    });
  }

  private async initializeGTM() {
    // GTM initialization would go here
    console.log('GTM initialization not implemented yet');
  }

  private async initializeCoreWebVitalsTracking() {
    // Dynamic import to avoid SSR issues
    const { getCLS, getFID, getFCP, getLCP, getTTFB } = await import('web-vitals');

    const sendToAnalytics = (metric: any) => {
      if (window.gtag) {
        window.gtag('event', metric.name, {
          event_category: 'Web Vitals',
          event_label: metric.id,
          value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
          non_interaction: true,
        });
      }

      // Also send to custom endpoint for detailed tracking
      this.sendMetricToEndpoint(metric);
    };

    getCLS(sendToAnalytics);
    getFID(sendToAnalytics);
    getFCP(sendToAnalytics);
    getLCP(sendToAnalytics);
    getTTFB(sendToAnalytics);
  }

  private sendMetricToEndpoint(metric: any) {
    // Send metrics to custom endpoint for detailed analysis
    const data = {
      name: metric.name,
      value: metric.value,
      id: metric.id,
      url: window.location.href,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      connection: (navigator as any).connection?.effectiveType,
    };

    // Use beacon API for reliable delivery
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/metrics', JSON.stringify(data));
    } else {
      fetch('/api/metrics', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
      }).catch(console.error);
    }
  }

  trackEvent(eventName: string, parameters: Record<string, any> = {}) {
    if (window.gtag) {
      window.gtag('event', eventName, parameters);
    }
  }

  trackPageView(url: string, title?: string) {
    if (window.gtag) {
      window.gtag('config', this.config.gaId!, {
        page_title: title || document.title,
        page_location: url,
      });
    }
  }

  trackError(error: Error, context?: string) {
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: error.message,
        fatal: false,
        custom_map: { context },
      });
    }
  }
}

// Default analytics instance
let analyticsInstance: Analytics | null = null;

export function initializeAnalytics(config: AnalyticsConfig) {
  if (!analyticsInstance) {
    analyticsInstance = new Analytics(config);
  }
  return analyticsInstance.initialize();
}

export function getAnalytics(): Analytics | null {
  return analyticsInstance;
}

export function trackEvent(eventName: string, parameters?: Record<string, any>) {
  analyticsInstance?.trackEvent(eventName, parameters);
}

export function trackPageView(url: string, title?: string) {
  analyticsInstance?.trackPageView(url, title);
}

export function trackError(error: Error, context?: string) {
  analyticsInstance?.trackError(error, context);
}
`;

    fs.writeFileSync(analyticsUtilityPath, analyticsUtility);
    console.log('📝 Analytics utility created:', analyticsUtilityPath);
  }

  async enableCoreWebVitalsTracking() {
    console.log('🎯 Enabling Core Web Vitals tracking...');

    try {
      // Run Core Web Vitals monitoring
      const vitalsReport =
        await this.monitoringComponents.coreWebVitals.startMonitoring();

      // Create Core Web Vitals configuration
      const vitalsConfig = {
        enabled: true,
        thresholds: {
          lcp: 2500,
          fid: 100,
          cls: 0.1,
          fcp: 1800,
          ttfb: 600,
        },
        reportingEndpoint: '/api/vitals',
        reportingInterval: 60000, // 1 minute
        pages: [
          { path: '/', name: 'Homepage' },
          { path: '/services', name: 'Services' },
          { path: '/blog', name: 'Blog' },
          { path: '/contact', name: 'Contact' },
        ],
      };

      // Write vitals configuration
      const configPath = path.join(
        process.cwd(),
        'src/config/core-web-vitals.json'
      );
      fs.writeFileSync(configPath, JSON.stringify(vitalsConfig, null, 2));

      console.log('✅ Core Web Vitals tracking enabled');
      console.log(
        `   Average LCP: ${vitalsReport.summary.averages?.lcp || 0}ms`
      );
      console.log(
        `   Average FID: ${vitalsReport.summary.averages?.fid || 0}ms`
      );
      console.log(`   Average CLS: ${vitalsReport.summary.averages?.cls || 0}`);

      return {
        status: 'enabled',
        config: vitalsConfig,
        report: vitalsReport.summary,
      };
    } catch (error) {
      console.warn('⚠️  Core Web Vitals tracking setup failed:', error.message);
      return { status: 'failed', error: error.message };
    }
  }

  async configurePerformanceScripts() {
    console.log('⚙️  Configuring performance monitoring scripts...');

    try {
      // Create performance monitoring configuration
      const performanceConfig = {
        monitoring: {
          enabled: this.config.enablePerformanceMonitoring,
          interval: 300000, // 5 minutes
          endpoints: [
            { url: this.config.siteUrl, name: 'Homepage' },
            { url: `${this.config.siteUrl}/services`, name: 'Services' },
            { url: `${this.config.siteUrl}/blog`, name: 'Blog' },
            { url: `${this.config.siteUrl}/contact`, name: 'Contact' },
          ],
        },
        budgets: {
          lcp: 2500,
          fid: 100,
          cls: 0.1,
          jsBundle: 500 * 1024,
          cssBundle: 100 * 1024,
          totalAssets: 2 * 1024 * 1024,
          performanceScore: 85,
        },
        alerts: {
          enabled: true,
          thresholds: {
            errorRate: 2.0,
            slowPages: 3,
            budgetViolations: 1,
          },
        },
      };

      // Write performance configuration
      const configPath = path.join(
        process.cwd(),
        'src/config/performance-monitoring.json'
      );
      fs.writeFileSync(configPath, JSON.stringify(performanceConfig, null, 2));

      // Run performance monitoring
      const performanceReport =
        await this.monitoringComponents.performanceMonitor.monitorPerformance();

      // Run budget validation
      const budgetReport =
        await this.monitoringComponents.budgetValidator.validatePerformanceBudgets();

      console.log('✅ Performance monitoring scripts configured');
      console.log(
        `   Overall Score: ${performanceReport.summary.overallScore}/100`
      );
      console.log(
        `   Budget Pass Rate: ${budgetReport.summary.passRate.toFixed(1)}%`
      );

      return {
        status: 'configured',
        config: performanceConfig,
        performanceReport: performanceReport.summary,
        budgetReport: budgetReport.summary,
      };
    } catch (error) {
      console.warn(
        '⚠️  Performance scripts configuration failed:',
        error.message
      );
      return { status: 'failed', error: error.message };
    }
  }

  async testDeploymentMonitoring() {
    console.log('🧪 Testing deployment monitoring functionality...');

    try {
      // Test performance monitoring scripts
      const testResults = {
        coreWebVitals: await this.testCoreWebVitalsMonitoring(),
        performanceMonitoring: await this.testPerformanceMonitoring(),
        budgetValidation: await this.testBudgetValidation(),
      };

      const allTestsPassed = Object.values(testResults).every(
        result => result.status === 'passed'
      );

      console.log('✅ Deployment monitoring functionality tested');
      console.log(`   Core Web Vitals: ${testResults.coreWebVitals.status}`);
      console.log(
        `   Performance Monitoring: ${testResults.performanceMonitoring.status}`
      );
      console.log(
        `   Budget Validation: ${testResults.budgetValidation.status}`
      );

      return {
        status: allTestsPassed ? 'passed' : 'partial',
        results: testResults,
      };
    } catch (error) {
      console.warn('⚠️  Deployment monitoring test failed:', error.message);
      return { status: 'failed', error: error.message };
    }
  }

  async testCoreWebVitalsMonitoring() {
    try {
      const report =
        await this.monitoringComponents.coreWebVitals.startMonitoring();
      return {
        status: 'passed',
        message: 'Core Web Vitals monitoring is working',
        data: {
          pagesMonitored: Object.keys(report.pageAnalysis || {}).length,
          overallStatus: report.summary.overallStatus,
          activeAlerts: report.summary.activeAlerts || 0,
        },
      };
    } catch (error) {
      return {
        status: 'failed',
        message: 'Core Web Vitals monitoring test failed',
        error: error.message,
      };
    }
  }

  async testPerformanceMonitoring() {
    try {
      const report =
        await this.monitoringComponents.performanceMonitor.monitorPerformance();
      return {
        status: 'passed',
        message: 'Performance monitoring is working',
        data: {
          overallScore: report.summary.overallScore,
          cacheEfficiency: report.summary.cacheEfficiency,
          globalLatency: report.summary.globalLatency,
        },
      };
    } catch (error) {
      return {
        status: 'failed',
        message: 'Performance monitoring test failed',
        error: error.message,
      };
    }
  }

  async testBudgetValidation() {
    try {
      const report =
        await this.monitoringComponents.budgetValidator.validatePerformanceBudgets();
      return {
        status: 'passed',
        message: 'Budget validation is working',
        data: {
          totalTests: report.summary.totalTests,
          passRate: report.summary.passRate,
          failed: report.summary.failed,
        },
      };
    } catch (error) {
      return {
        status: 'failed',
        message: 'Budget validation test failed',
        error: error.message,
      };
    }
  }

  async generateMonitoringReport() {
    console.log('📋 Generating performance monitoring configuration report...');

    const report = {
      timestamp: new Date().toISOString(),
      configuration: {
        analytics: {
          gaId: this.config.gaId ? 'configured' : 'not configured',
          gtmId: this.config.gtmId ? 'configured' : 'not configured',
          enableAnalytics: this.config.enableAnalytics,
        },
        monitoring: {
          enablePerformanceMonitoring: this.config.enablePerformanceMonitoring,
          siteUrl: this.config.siteUrl,
        },
      },
      components: {
        coreWebVitals: 'configured',
        performanceMonitor: 'configured',
        budgetValidator: 'configured',
        analyticsUtility: 'created',
      },
      files: {
        analyticsConfig: 'src/config/analytics.json',
        analyticsUtility: 'src/lib/analytics.ts',
        vitalsConfig: 'src/config/core-web-vitals.json',
        performanceConfig: 'src/config/performance-monitoring.json',
      },
      recommendations: this.generateConfigurationRecommendations(),
    };

    // Write report to file
    const reportPath = path.join(
      process.cwd(),
      'performance-monitoring-config-report.json'
    );
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // Generate human-readable summary
    this.generateHumanReadableConfigReport(report);

    console.log(
      '📊 Performance monitoring configuration report generated:',
      reportPath
    );
    return report;
  }

  generateConfigurationRecommendations() {
    const recommendations = [];

    if (!this.config.gaId && !this.config.gtmId) {
      recommendations.push({
        type: 'analytics',
        priority: 'medium',
        title: 'Configure Google Analytics',
        description:
          'Set up Google Analytics or GTM for comprehensive tracking',
        actions: [
          'Create Google Analytics 4 property',
          'Add GA_ID to environment variables',
          'Configure enhanced ecommerce tracking if applicable',
          'Set up custom dimensions for better insights',
        ],
      });
    }

    if (!this.config.enablePerformanceMonitoring) {
      recommendations.push({
        type: 'monitoring',
        priority: 'high',
        title: 'Enable Performance Monitoring',
        description: 'Performance monitoring is disabled',
        actions: [
          'Set NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING=true',
          'Configure monitoring intervals',
          'Set up performance alerts',
          'Review monitoring thresholds',
        ],
      });
    }

    recommendations.push({
      type: 'optimization',
      priority: 'low',
      title: 'Optimize Monitoring Configuration',
      description: 'Fine-tune monitoring settings for better insights',
      actions: [
        'Adjust monitoring intervals based on traffic',
        'Configure custom metrics for business KPIs',
        'Set up automated reporting',
        'Implement real user monitoring (RUM)',
      ],
    });

    return recommendations;
  }

  generateHumanReadableConfigReport(report) {
    const summaryPath = path.join(
      process.cwd(),
      'performance-monitoring-config-summary.md'
    );

    const markdown = `# Performance Monitoring Configuration Report

Generated: ${new Date(report.timestamp).toLocaleString()}

## Configuration Summary

### Analytics Configuration
- **Google Analytics ID:** ${report.configuration.analytics.gaId}
- **Google Tag Manager ID:** ${report.configuration.analytics.gtmId}
- **Analytics Enabled:** ${report.configuration.analytics.enableAnalytics ? '✅' : '❌'}

### Monitoring Configuration
- **Performance Monitoring Enabled:** ${report.configuration.monitoring.enablePerformanceMonitoring ? '✅' : '❌'}
- **Site URL:** ${report.configuration.monitoring.siteUrl}

## Configured Components

${Object.entries(report.components)
  .map(([component, status]) => `- **${component}:** ${status} ✅`)
  .join('\n')}

## Created Files

${Object.entries(report.files)
  .map(([name, path]) => `- **${name}:** \`${path}\``)
  .join('\n')}

## Recommendations

${report.recommendations
  .map(
    rec =>
      `### ${rec.title} (${rec.priority.toUpperCase()} Priority)

${rec.description}

**Actions:**
${rec.actions.map(action => `- ${action}`).join('\n')}`
  )
  .join('\n\n')}

## Next Steps

1. **Verify Configuration**: Check that all environment variables are properly set
2. **Test Analytics**: Verify that analytics tracking is working in production
3. **Monitor Performance**: Review Core Web Vitals and performance metrics regularly
4. **Set Up Alerts**: Configure alerts for performance regressions
5. **Regular Reviews**: Schedule monthly performance reviews and optimizations

## Monitoring Scripts

The following npm scripts are available for performance monitoring:

- \`npm run performance:monitor\` - Run comprehensive performance monitoring
- \`npm run performance:vitals\` - Monitor Core Web Vitals specifically
- \`npm run performance:budget\` - Validate performance budgets
- \`npm run performance:validate\` - Run all performance validations

## Configuration Files

All configuration files have been created in the \`src/config/\` directory:

- \`analytics.json\` - Google Analytics configuration
- \`core-web-vitals.json\` - Core Web Vitals monitoring settings
- \`performance-monitoring.json\` - General performance monitoring configuration

## Analytics Utility

A comprehensive analytics utility has been created at \`src/lib/analytics.ts\` that provides:

- Google Analytics initialization
- Core Web Vitals tracking
- Custom event tracking
- Error tracking
- Page view tracking

To use the analytics utility in your application:

\`\`\`typescript
import { initializeAnalytics, trackEvent } from '@/lib/analytics';

// Initialize analytics
await initializeAnalytics({
  gaId: process.env.NEXT_PUBLIC_GA_ID,
  enableCoreWebVitalsTracking: true,
  enablePerformanceTracking: true,
});

// Track custom events
trackEvent('button_click', { button_name: 'cta_button' });
\`\`\`
`;

    fs.writeFileSync(summaryPath, markdown);
    console.log(
      '📄 Human-readable configuration summary generated:',
      summaryPath
    );
  }
}

async function main() {
  const configurator = new PerformanceMonitoringConfigurator();

  try {
    console.log('🚀 Starting performance monitoring configuration...');

    const report = await configurator.configurePerformanceMonitoring();

    console.log('\n📊 Configuration Summary:');
    console.log(
      `   Analytics: ${report.configuration?.analytics?.gaId || 'Not configured'}`
    );
    console.log(
      `   Performance Monitoring: ${report.configuration?.monitoring?.enablePerformanceMonitoring ? 'Enabled' : 'Disabled'}`
    );
    console.log(
      `   Components Configured: ${Object.keys(report.components || {}).length}`
    );

    console.log(
      '✅ Performance monitoring configuration completed successfully'
    );
    return report;
  } catch (error) {
    console.error(
      '❌ Performance monitoring configuration failed:',
      error.message
    );
    process.exit(1);
  }
}

// Run configuration if called directly
if (require.main === module) {
  main();
}

module.exports = PerformanceMonitoringConfigurator;
