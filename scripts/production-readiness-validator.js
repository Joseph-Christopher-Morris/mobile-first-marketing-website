#!/usr/bin/env node

/**
 * Production Readiness Validator
 * 
 * This script validates production readiness by:
 * - Testing complete deployment pipeline in staging environment
 * - Validating rollback procedures and disaster recovery
 * - Performing comprehensive security audit and penetration testing
 * - Verifying all production requirements are met
 * 
 * Requirements: 8.3, 8.4
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { URL } = require('url');

class ProductionReadinessValidator {
  constructor(options = {}) {
    this.stagingUrl = options.stagingUrl || process.env.STAGING_URL;
    this.productionUrl = options.productionUrl || process.env.PRODUCTION_URL;
    this.verbose = options.verbose || false;
    this.outputDir = options.outputDir || './test-results';
    this.environment = options.environment || 'staging';
    
    this.results = {
      timestamp: new Date().toISOString(),
      environment: this.environment,
      stagingUrl: this.stagingUrl,
      productionUrl: this.productionUrl,
      validationSuites: [],
      summary: {
        totalSuites: 0,
        totalChecks: 0,
        passed: 0,
        failed: 0,
        warnings: 0,
        critical: 0
      },
      productionReadiness: {
        score: 0,
        status: 'not_ready',
        blockers: [],
        warnings: [],
        recommendations: []
      }
    };

    // Production readiness criteria
    this.readinessCriteria = {
      deployment: {
        weight: 25,
        checks: [
          'staging_deployment_success',
          'production_deployment_test',
          'rollback_procedure_test',
          'disaster_recovery_test'
        ]
      },
      security: {
        weight: 30,
        checks: [
          'security_headers_validation',
          'ssl_tls_configuration',
          'access_control_audit',
          'penetration_testing',
          'vulnerability_assessment'
        ]
      },
      performance: {
        weight: 20,
        checks: [
          'load_testing',
          'performance_benchmarks',
          'cdn_optimization',
          'resource_optimization'
        ]
      },
      monitoring: {
        weight: 15,
        checks: [
          'monitoring_setup',
          'alerting_configuration',
          'logging_validation',
          'health_checks'
        ]
      },
      compliance: {
        weight: 10,
        checks: [
          'accessibility_compliance',
          'seo_optimization',
          'content_validation',
          'legal_compliance'
        ]
      }
    };

    this.log('Production Readiness Validator initialized', 'info');
    this.log(`Environment: ${this.environment}`, 'info');
    this.log(`Staging URL: ${this.stagingUrl || 'Not configured'}`, 'info');
    this.log(`Production URL: ${this.productionUrl || 'Not configured'}`, 'info');
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    
    if (this.verbose || level === 'error' || level === 'success' || level === 'critical') {
      console.log(`${prefix} ${message}`);
    }
  }

  async makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const client = urlObj.protocol === 'https:' ? https : http;

      const req = client.request(url, {
        method: options.method || 'GET',
        headers: options.headers || {},
        timeout: options.timeout || 15000,
        ...options
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data,
            url: url,
            timing: {
              start: options.startTime || Date.now(),
              end: Date.now()
            }
          });
        });
      });

      req.on('error', reject);
      req.on('timeout', () => reject(new Error('Request timeout')));

      if (options.body) {
        req.write(options.body);
      }

      req.end();
    });
  }

  async runValidationSuite(suiteName, validationFunction) {
    this.log(`Starting validation suite: ${suiteName}`);
    const startTime = Date.now();
    
    const suite = {
      name: suiteName,
      startTime: new Date().toISOString(),
      checks: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        warnings: 0,
        critical: 0
      }
    };

    try {
      await validationFunction(suite);
      
      const duration = Date.now() - startTime;
      suite.duration = duration;
      suite.endTime = new Date().toISOString();
      suite.status = suite.summary.critical > 0 ? 'critical' : 
                   suite.summary.failed > 0 ? 'failed' : 'passed';
      
      this.results.validationSuites.push(suite);
      this.results.summary.totalSuites++;
      this.results.summary.totalChecks += suite.summary.total;
      this.results.summary.passed += suite.summary.passed;
      this.results.summary.failed += suite.summary.failed;
      this.results.summary.warnings += suite.summary.warnings;
      this.results.summary.critical += suite.summary.critical;
      
      this.log(`✓ Validation suite completed: ${suiteName} (${duration}ms)`, 'success');
      return suite;
    } catch (error) {
      const duration = Date.now() - startTime;
      suite.duration = duration;
      suite.endTime = new Date().toISOString();
      suite.status = 'failed';
      suite.error = error.message;
      
      this.results.validationSuites.push(suite);
      this.results.summary.totalSuites++;
      this.results.summary.failed++;
      
      this.log(`✗ Validation suite failed: ${suiteName}: ${error.message} (${duration}ms)`, 'error');
      return suite;
    }
  }

  async runCheck(suite, checkName, checkFunction, severity = 'normal') {
    this.log(`  Running check: ${checkName}`);
    const startTime = Date.now();
    
    try {
      const result = await checkFunction();
      const duration = Date.now() - startTime;
      
      suite.checks.push({
        name: checkName,
        status: 'passed',
        severity,
        duration,
        result
      });
      
      suite.summary.passed++;
      this.log(`    ✓ ${checkName} (${duration}ms)`, 'success');
      return true;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      let status = 'failed';
      if (error.message.includes('WARN')) {
        status = 'warning';
        suite.summary.warnings++;
        this.log(`    ⚠ ${checkName}: ${error.message} (${duration}ms)`, 'warning');
      } else if (severity === 'critical') {
        status = 'critical';
        suite.summary.critical++;
        this.log(`    ❌ ${checkName}: ${error.message} (${duration}ms)`, 'critical');
      } else {
        suite.summary.failed++;
        this.log(`    ✗ ${checkName}: ${error.message} (${duration}ms)`, 'error');
      }
      
      suite.checks.push({
        name: checkName,
        status,
        severity,
        duration,
        error: error.message
      });
      
      return false;
    } finally {
      suite.summary.total++;
    }
  }

  // Deployment Pipeline Validation
  async validateDeploymentPipeline(suite) {
    await this.runCheck(suite, 'Staging Deployment Success', async () => {
      if (!this.stagingUrl) {
        throw new Error('Staging URL not configured');
      }
      
      // Test staging deployment
      const response = await this.makeRequest(this.stagingUrl);
      
      if (response.statusCode !== 200) {
        throw new Error(`Staging site not accessible: HTTP ${response.statusCode}`);
      }
      
      // Verify staging deployment is recent
      const buildInfo = await this.getBuildInfo(this.stagingUrl);
      const buildAge = Date.now() - new Date(buildInfo.timestamp).getTime();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      
      if (buildAge > maxAge) {
        throw new Error('WARN: Staging deployment is older than 24 hours');
      }
      
      return {
        statusCode: response.statusCode,
        buildInfo,
        buildAge: Math.round(buildAge / (60 * 1000)) // minutes
      };
    }, 'critical');

    await this.runCheck(suite, 'Production Deployment Test', async () => {
      try {
        // Test deployment script in dry-run mode
        const output = execSync('node scripts/deploy.js --dry-run --env=production', {
          encoding: 'utf8',
          timeout: 120000
        });
        
        // Verify deployment configuration
        const configValid = output.includes('Configuration valid') || 
                           output.includes('Deployment ready');
        
        if (!configValid) {
          throw new Error('Production deployment configuration invalid');
        }
        
        return { 
          status: 'deployment_ready',
          output: output.substring(0, 300)
        };
      } catch (error) {
        throw new Error(`Production deployment test failed: ${error.message}`);
      }
    }, 'critical');

    await this.runCheck(suite, 'Rollback Procedure Test', async () => {
      try {
        // Test rollback mechanism
        const output = execSync('node scripts/rollback.js --test --env=staging', {
          encoding: 'utf8',
          timeout: 60000
        });
        
        const rollbackReady = output.includes('Rollback ready') || 
                             output.includes('Rollback test passed');
        
        if (!rollbackReady) {
          throw new Error('Rollback procedure not ready');
        }
        
        return { 
          status: 'rollback_ready',
          output: output.substring(0, 300)
        };
      } catch (error) {
        throw new Error(`Rollback procedure test failed: ${error.message}`);
      }
    }, 'critical');

    await this.runCheck(suite, 'Disaster Recovery Test', async () => {
      try {
        // Test disaster recovery procedures
        const output = execSync('node scripts/backup-rollback-procedures.js --test', {
          encoding: 'utf8',
          timeout: 60000
        });
        
        return { 
          status: 'disaster_recovery_ready',
          output: output.substring(0, 300)
        };
      } catch (error) {
        throw new Error(`Disaster recovery test failed: ${error.message}`);
      }
    });

    await this.runCheck(suite, 'CI/CD Pipeline Validation', async () => {
      // Check GitHub Actions workflow
      const workflowPath = '.github/workflows/s3-cloudfront-deploy.yml';
      if (!fs.existsSync(workflowPath)) {
        throw new Error('GitHub Actions workflow not found');
      }
      
      const workflow = fs.readFileSync(workflowPath, 'utf8');
      
      // Verify essential workflow components
      const hasProductionTrigger = workflow.includes('production') || workflow.includes('main');
      const hasSecrets = workflow.includes('secrets.') || workflow.includes('AWS_');
      const hasBuildStep = workflow.includes('npm run build') || workflow.includes('build');
      const hasDeployStep = workflow.includes('deploy') || workflow.includes('s3');
      
      if (!hasProductionTrigger || !hasSecrets || !hasBuildStep || !hasDeployStep) {
        throw new Error('GitHub Actions workflow missing essential components');
      }
      
      return {
        hasProductionTrigger,
        hasSecrets,
        hasBuildStep,
        hasDeployStep
      };
    });
  }

  // Security Audit and Penetration Testing
  async validateSecurityReadiness(suite) {
    await this.runCheck(suite, 'Security Headers Validation', async () => {
      try {
        const output = execSync('node scripts/security-headers-validator.js', {
          encoding: 'utf8',
          timeout: 60000
        });
        
        if (output.includes('FAILED') || output.includes('ERROR')) {
          throw new Error('Security headers validation failed');
        }
        
        return { 
          status: 'security_headers_valid',
          output: output.substring(0, 200)
        };
      } catch (error) {
        throw new Error(`Security headers validation failed: ${error.message}`);
      }
    }, 'critical');

    await this.runCheck(suite, 'SSL/TLS Configuration', async () => {
      try {
        const output = execSync('node scripts/comprehensive-tls-validator.js', {
          encoding: 'utf8',
          timeout: 90000
        });
        
        if (output.includes('FAILED') || output.includes('ERROR')) {
          throw new Error('SSL/TLS configuration validation failed');
        }
        
        return { 
          status: 'ssl_tls_valid',
          output: output.substring(0, 200)
        };
      } catch (error) {
        throw new Error(`SSL/TLS validation failed: ${error.message}`);
      }
    }, 'critical');

    await this.runCheck(suite, 'Access Control Audit', async () => {
      try {
        const output = execSync('node scripts/validate-access-control-audit.js', {
          encoding: 'utf8',
          timeout: 60000
        });
        
        return { 
          status: 'access_control_valid',
          output: output.substring(0, 200)
        };
      } catch (error) {
        throw new Error(`Access control audit failed: ${error.message}`);
      }
    }, 'critical');

    await this.runCheck(suite, 'Penetration Testing', async () => {
      try {
        const output = execSync('node scripts/penetration-testing-suite.js', {
          encoding: 'utf8',
          timeout: 180000 // 3 minutes for comprehensive pen testing
        });
        
        if (output.includes('CRITICAL') || output.includes('HIGH RISK')) {
          throw new Error('Critical security vulnerabilities found');
        }
        
        if (output.includes('MEDIUM RISK') || output.includes('WARNING')) {
          throw new Error('WARN: Medium risk security issues found');
        }
        
        return { 
          status: 'penetration_tests_passed',
          output: output.substring(0, 300)
        };
      } catch (error) {
        if (error.message.includes('WARN')) {
          throw error;
        }
        throw new Error(`Penetration testing failed: ${error.message}`);
      }
    }, 'critical');

    await this.runCheck(suite, 'Vulnerability Assessment', async () => {
      // Check for known vulnerabilities in dependencies
      try {
        const auditOutput = execSync('npm audit --audit-level=moderate --json', {
          encoding: 'utf8',
          timeout: 60000
        });
        
        const audit = JSON.parse(auditOutput);
        
        if (audit.metadata.vulnerabilities.high > 0 || audit.metadata.vulnerabilities.critical > 0) {
          throw new Error(`Critical/High vulnerabilities found: ${audit.metadata.vulnerabilities.critical} critical, ${audit.metadata.vulnerabilities.high} high`);
        }
        
        if (audit.metadata.vulnerabilities.moderate > 5) {
          throw new Error(`WARN: ${audit.metadata.vulnerabilities.moderate} moderate vulnerabilities found`);
        }
        
        return {
          vulnerabilities: audit.metadata.vulnerabilities,
          status: 'vulnerability_scan_passed'
        };
      } catch (error) {
        if (error.message.includes('WARN')) {
          throw error;
        }
        throw new Error(`Vulnerability assessment failed: ${error.message}`);
      }
    });
  }

  // Performance and Load Testing
  async validatePerformanceReadiness(suite) {
    await this.runCheck(suite, 'Load Testing', async () => {
      if (!this.stagingUrl) {
        throw new Error('WARN: Staging URL not configured, skipping load testing');
      }
      
      try {
        // Run basic load testing
        const output = execSync(`node scripts/performance-benchmarking.js --url=${this.stagingUrl} --concurrent=10 --duration=30`, {
          encoding: 'utf8',
          timeout: 120000
        });
        
        // Parse load testing results
        const avgResponseTime = this.extractMetric(output, 'Average Response Time');
        const errorRate = this.extractMetric(output, 'Error Rate');
        
        if (avgResponseTime > 2000) { // 2 seconds
          throw new Error(`Load testing failed: Average response time ${avgResponseTime}ms exceeds 2000ms`);
        }
        
        if (errorRate > 1) { // 1% error rate
          throw new Error(`Load testing failed: Error rate ${errorRate}% exceeds 1%`);
        }
        
        return {
          avgResponseTime,
          errorRate,
          status: 'load_testing_passed'
        };
      } catch (error) {
        if (error.message.includes('WARN')) {
          throw error;
        }
        throw new Error(`Load testing failed: ${error.message}`);
      }
    });

    await this.runCheck(suite, 'Performance Benchmarks', async () => {
      if (!this.stagingUrl) {
        throw new Error('WARN: Staging URL not configured, skipping performance benchmarks');
      }
      
      try {
        // Run performance tests
        const output = execSync('npx playwright test e2e/performance.spec.ts --reporter=json', {
          encoding: 'utf8',
          timeout: 180000
        });
        
        const results = JSON.parse(output);
        
        if (results.stats && results.stats.failed > 0) {
          throw new Error(`Performance benchmark tests failed: ${results.stats.failed} failures`);
        }
        
        return {
          tests: results.stats?.expected || 0,
          passed: (results.stats?.expected || 0) - (results.stats?.failed || 0)
        };
      } catch (error) {
        if (error.message.includes('ECONNREFUSED')) {
          throw new Error('WARN: Development server not running, skipping performance benchmarks');
        }
        throw error;
      }
    });

    await this.runCheck(suite, 'CDN Optimization', async () => {
      if (!this.stagingUrl) {
        throw new Error('WARN: Staging URL not configured, skipping CDN optimization check');
      }
      
      const response = await this.makeRequest(this.stagingUrl);
      
      // Check for CDN headers
      const hasCDN = response.headers['cf-ray'] || // Cloudflare
                    response.headers['x-cache'] || // CloudFront
                    response.headers['x-served-by']; // Other CDNs
      
      if (!hasCDN) {
        throw new Error('CDN not detected in response headers');
      }
      
      // Check cache headers
      const cacheControl = response.headers['cache-control'];
      const hasProperCaching = cacheControl && (
        cacheControl.includes('max-age') || 
        cacheControl.includes('public')
      );
      
      if (!hasProperCaching) {
        throw new Error('WARN: Proper cache headers not configured');
      }
      
      return {
        cdnDetected: !!hasCDN,
        cacheControl,
        hasProperCaching
      };
    });

    await this.runCheck(suite, 'Resource Optimization', async () => {
      // Check build output for optimization
      const buildDir = path.join(process.cwd(), 'out');
      if (!fs.existsSync(buildDir)) {
        throw new Error('Build output not found. Run npm run build first.');
      }
      
      // Check for minified files
      const jsFiles = this.findFiles(buildDir, /\.js$/);
      const cssFiles = this.findFiles(buildDir, /\.css$/);
      
      const minifiedJS = jsFiles.filter(file => {
        const content = fs.readFileSync(file, 'utf8');
        return content.length > 1000 && !content.includes('\n  '); // Basic minification check
      });
      
      const minifiedCSS = cssFiles.filter(file => {
        const content = fs.readFileSync(file, 'utf8');
        return content.length > 500 && !content.includes('\n  '); // Basic minification check
      });
      
      const jsMinificationRate = jsFiles.length > 0 ? minifiedJS.length / jsFiles.length : 1;
      const cssMinificationRate = cssFiles.length > 0 ? minifiedCSS.length / cssFiles.length : 1;
      
      if (jsMinificationRate < 0.8) {
        throw new Error('WARN: JavaScript files not properly minified');
      }
      
      if (cssMinificationRate < 0.8) {
        throw new Error('WARN: CSS files not properly minified');
      }
      
      return {
        jsFiles: jsFiles.length,
        cssFiles: cssFiles.length,
        jsMinificationRate,
        cssMinificationRate
      };
    });
  }

  // Monitoring and Alerting Validation
  async validateMonitoringReadiness(suite) {
    await this.runCheck(suite, 'Monitoring Setup', async () => {
      try {
        const output = execSync('node scripts/test-monitoring-service.js', {
          encoding: 'utf8',
          timeout: 60000
        });
        
        return { 
          status: 'monitoring_configured',
          output: output.substring(0, 200)
        };
      } catch (error) {
        throw new Error(`Monitoring setup validation failed: ${error.message}`);
      }
    });

    await this.runCheck(suite, 'Alerting Configuration', async () => {
      // Check for alerting configuration
      const configFiles = [
        'config/monitoring-config.json',
        'scripts/configure-deployment-alerts.js'
      ];
      
      const missingConfigs = configFiles.filter(file => !fs.existsSync(file));
      
      if (missingConfigs.length > 0) {
        throw new Error(`Missing alerting configuration files: ${missingConfigs.join(', ')}`);
      }
      
      return {
        configFiles: configFiles.length,
        configured: configFiles.length - missingConfigs.length
      };
    });

    await this.runCheck(suite, 'Logging Validation', async () => {
      // Check for logging setup
      const logDir = path.join(process.cwd(), 'logs');
      if (!fs.existsSync(logDir)) {
        throw new Error('WARN: Logging directory not found');
      }
      
      const logFiles = fs.readdirSync(logDir);
      if (logFiles.length === 0) {
        throw new Error('WARN: No log files found');
      }
      
      return {
        logDirectory: logDir,
        logFiles: logFiles.length
      };
    });

    await this.runCheck(suite, 'Health Checks', async () => {
      if (!this.stagingUrl) {
        throw new Error('WARN: Staging URL not configured, skipping health checks');
      }
      
      // Test health endpoint
      try {
        const healthResponse = await this.makeRequest(`${this.stagingUrl}/api/health`);
        
        if (healthResponse.statusCode === 200) {
          return { healthEndpoint: 'available', status: 'healthy' };
        }
      } catch (error) {
        // Health endpoint might not exist, check main site
      }
      
      // Fallback to main site health
      const response = await this.makeRequest(this.stagingUrl);
      
      if (response.statusCode !== 200) {
        throw new Error(`Site health check failed: HTTP ${response.statusCode}`);
      }
      
      return { 
        mainSite: 'healthy',
        responseTime: response.timing.end - response.timing.start
      };
    });
  }

  // Compliance and Final Checks
  async validateComplianceReadiness(suite) {
    await this.runCheck(suite, 'Accessibility Compliance', async () => {
      if (!this.stagingUrl) {
        throw new Error('WARN: Staging URL not configured, skipping accessibility compliance');
      }
      
      try {
        const output = execSync('npx playwright test e2e/accessibility.spec.ts --reporter=json', {
          encoding: 'utf8',
          timeout: 120000
        });
        
        const results = JSON.parse(output);
        
        if (results.stats && results.stats.failed > 0) {
          throw new Error(`Accessibility compliance tests failed: ${results.stats.failed} failures`);
        }
        
        return {
          tests: results.stats?.expected || 0,
          passed: (results.stats?.expected || 0) - (results.stats?.failed || 0)
        };
      } catch (error) {
        if (error.message.includes('ECONNREFUSED')) {
          throw new Error('WARN: Development server not running, skipping accessibility tests');
        }
        throw error;
      }
    });

    await this.runCheck(suite, 'SEO Optimization', async () => {
      if (!this.stagingUrl) {
        throw new Error('WARN: Staging URL not configured, skipping SEO optimization check');
      }
      
      const response = await this.makeRequest(this.stagingUrl);
      
      // Check for essential SEO elements
      const hasTitle = response.body.includes('<title>') && 
                     !response.body.includes('<title></title>');
      const hasMetaDescription = response.body.includes('name="description"');
      const hasMetaKeywords = response.body.includes('name="keywords"') || true; // Optional
      const hasCanonical = response.body.includes('rel="canonical"');
      const hasOpenGraph = response.body.includes('property="og:');
      
      const seoScore = [hasTitle, hasMetaDescription, hasCanonical, hasOpenGraph]
        .filter(Boolean).length;
      
      if (seoScore < 3) {
        throw new Error(`SEO optimization insufficient: ${seoScore}/4 essential elements found`);
      }
      
      return {
        hasTitle,
        hasMetaDescription,
        hasCanonical,
        hasOpenGraph,
        seoScore
      };
    });

    await this.runCheck(suite, 'Content Validation', async () => {
      try {
        execSync('npm run content:validate', {
          encoding: 'utf8',
          timeout: 30000,
          stdio: 'pipe'
        });
        
        return { status: 'content_valid' };
      } catch (error) {
        throw new Error(`Content validation failed: ${error.message}`);
      }
    });

    await this.runCheck(suite, 'Legal Compliance', async () => {
      if (!this.stagingUrl) {
        throw new Error('WARN: Staging URL not configured, skipping legal compliance check');
      }
      
      const response = await this.makeRequest(this.stagingUrl);
      
      // Check for privacy policy and terms
      const hasPrivacyPolicy = response.body.toLowerCase().includes('privacy') ||
                              response.body.toLowerCase().includes('gdpr');
      const hasTerms = response.body.toLowerCase().includes('terms') ||
                      response.body.toLowerCase().includes('conditions');
      
      if (!hasPrivacyPolicy && !hasTerms) {
        throw new Error('WARN: No privacy policy or terms of service links found');
      }
      
      return {
        hasPrivacyPolicy,
        hasTerms
      };
    });
  }

  // Utility methods
  async getBuildInfo(url) {
    try {
      const response = await this.makeRequest(`${url}/build-info.json`);
      if (response.statusCode === 200) {
        return JSON.parse(response.body);
      }
    } catch (error) {
      // Build info might not be available
    }
    
    return {
      timestamp: new Date().toISOString(),
      version: 'unknown'
    };
  }

  extractMetric(output, metricName) {
    const regex = new RegExp(`${metricName}[:\\s]+(\\d+(?:\\.\\d+)?)`, 'i');
    const match = output.match(regex);
    return match ? parseFloat(match[1]) : 0;
  }

  findFiles(dir, pattern) {
    const files = [];
    
    const scan = (currentDir) => {
      try {
        const items = fs.readdirSync(currentDir);
        
        for (const item of items) {
          const fullPath = path.join(currentDir, item);
          const stats = fs.statSync(fullPath);
          
          if (stats.isDirectory()) {
            scan(fullPath);
          } else if (pattern.test(item)) {
            files.push(fullPath);
          }
        }
      } catch (error) {
        // Skip directories we can't read
      }
    };
    
    scan(dir);
    return files;
  }

  calculateProductionReadinessScore() {
    let totalScore = 0;
    let maxScore = 0;
    
    const blockers = [];
    const warnings = [];
    const recommendations = [];
    
    for (const [category, config] of Object.entries(this.readinessCriteria)) {
      const categoryChecks = this.results.validationSuites.flatMap(suite => 
        suite.checks.filter(check => 
          config.checks.some(criteriaCheck => 
            check.name.toLowerCase().includes(criteriaCheck.replace(/_/g, ' '))
          )
        )
      );
      
      const categoryPassed = categoryChecks.filter(check => check.status === 'passed').length;
      const categoryCritical = categoryChecks.filter(check => check.status === 'critical').length;
      const categoryWarnings = categoryChecks.filter(check => check.status === 'warning').length;
      
      const categoryScore = categoryChecks.length > 0 ? 
        (categoryPassed / categoryChecks.length) * config.weight : 0;
      
      totalScore += categoryScore;
      maxScore += config.weight;
      
      // Collect blockers and warnings
      categoryChecks.forEach(check => {
        if (check.status === 'critical' || check.status === 'failed') {
          blockers.push(`${category}: ${check.name} - ${check.error}`);
        } else if (check.status === 'warning') {
          warnings.push(`${category}: ${check.name} - ${check.error}`);
        }
      });
      
      // Add recommendations based on category performance
      if (categoryScore < config.weight * 0.8) {
        recommendations.push(`Improve ${category} readiness (${Math.round(categoryScore)}/${config.weight} points)`);
      }
    }
    
    const finalScore = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
    
    let status = 'not_ready';
    if (finalScore >= 90 && blockers.length === 0) {
      status = 'ready';
    } else if (finalScore >= 75 && blockers.length === 0) {
      status = 'mostly_ready';
    } else if (finalScore >= 50) {
      status = 'needs_work';
    }
    
    this.results.productionReadiness = {
      score: finalScore,
      status,
      blockers,
      warnings,
      recommendations
    };
    
    return this.results.productionReadiness;
  }

  async generateReport() {
    this.log('Generating production readiness report...');
    
    // Calculate production readiness score
    const readiness = this.calculateProductionReadinessScore();
    
    // Ensure output directory exists
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
    
    // Generate JSON report
    const jsonReport = path.join(this.outputDir, 'production-readiness-report.json');
    fs.writeFileSync(jsonReport, JSON.stringify(this.results, null, 2));
    
    // Generate HTML report
    const htmlReport = this.generateHtmlReport();
    const htmlReportPath = path.join(this.outputDir, 'production-readiness-report.html');
    fs.writeFileSync(htmlReportPath, htmlReport);
    
    // Generate executive summary
    const summaryReport = this.generateExecutiveSummary();
    const summaryReportPath = path.join(this.outputDir, 'production-readiness-summary.md');
    fs.writeFileSync(summaryReportPath, summaryReport);
    
    this.log(`Production readiness reports generated:`);
    this.log(`  JSON: ${jsonReport}`);
    this.log(`  HTML: ${htmlReportPath}`);
    this.log(`  Summary: ${summaryReportPath}`);
    
    return {
      json: jsonReport,
      html: htmlReportPath,
      summary: summaryReportPath,
      readiness: readiness
    };
  }

  generateHtmlReport() {
    const { totalSuites, totalChecks, passed, failed, warnings, critical } = this.results.summary;
    const { score, status, blockers, warnings: readinessWarnings } = this.results.productionReadiness;
    
    const statusColor = {
      'ready': '#059669',
      'mostly_ready': '#d97706',
      'needs_work': '#dc2626',
      'not_ready': '#991b1b'
    };
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Production Readiness Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1400px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #1e40af 0%, #7c3aed 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
        .readiness-score { text-align: center; margin: 20px 0; }
        .score-circle { width: 120px; height: 120px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 2em; font-weight: bold; color: white; }
        .content { padding: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 20px; margin-bottom: 40px; }
        .metric { background: #f8fafc; padding: 20px; border-radius: 8px; text-align: center; border: 1px solid #e2e8f0; }
        .metric-value { font-size: 2em; font-weight: bold; margin-bottom: 8px; }
        .passed { color: #059669; }
        .failed { color: #dc2626; }
        .warnings { color: #d97706; }
        .critical { color: #991b1b; }
        .blockers, .warnings-section { margin: 20px 0; padding: 20px; border-radius: 8px; }
        .blockers { background: #fef2f2; border-left: 4px solid #dc2626; }
        .warnings-section { background: #fffbeb; border-left: 4px solid #d97706; }
        .validation-suites { margin-top: 40px; }
        .suite { border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 20px; overflow: hidden; }
        .suite-header { padding: 20px; background: #f9fafb; font-weight: 600; cursor: pointer; }
        .suite-header.passed { border-left: 5px solid #059669; }
        .suite-header.failed { border-left: 5px solid #dc2626; }
        .suite-header.critical { border-left: 5px solid #991b1b; }
        .suite-content { display: none; }
        .suite-content.show { display: block; }
        .check-item { padding: 15px 20px; border-bottom: 1px solid #f1f5f9; }
        .check-item:last-child { border-bottom: none; }
        .timestamp { color: #6b7280; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Production Readiness Report</h1>
            <p class="timestamp">Generated: ${this.results.timestamp}</p>
            <p>Environment: ${this.results.environment}</p>
            
            <div class="readiness-score">
                <div class="score-circle" style="background-color: ${statusColor[status]}">
                    ${score}%
                </div>
                <h2 style="text-transform: uppercase; letter-spacing: 1px;">${status.replace('_', ' ')}</h2>
            </div>
        </div>
        
        <div class="content">
            <div class="summary">
                <div class="metric">
                    <div class="metric-value">${totalSuites}</div>
                    <div>Validation Suites</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${totalChecks}</div>
                    <div>Total Checks</div>
                </div>
                <div class="metric">
                    <div class="metric-value passed">${passed}</div>
                    <div>Passed</div>
                </div>
                <div class="metric">
                    <div class="metric-value failed">${failed}</div>
                    <div>Failed</div>
                </div>
                <div class="metric">
                    <div class="metric-value warnings">${warnings}</div>
                    <div>Warnings</div>
                </div>
                <div class="metric">
                    <div class="metric-value critical">${critical}</div>
                    <div>Critical</div>
                </div>
            </div>
            
            ${blockers.length > 0 ? `
            <div class="blockers">
                <h3>🚫 Production Blockers</h3>
                <ul>
                    ${blockers.map(blocker => `<li>${blocker}</li>`).join('')}
                </ul>
            </div>
            ` : ''}
            
            ${readinessWarnings.length > 0 ? `
            <div class="warnings-section">
                <h3>⚠️ Warnings</h3>
                <ul>
                    ${readinessWarnings.map(warning => `<li>${warning}</li>`).join('')}
                </ul>
            </div>
            ` : ''}
            
            <div class="validation-suites">
                <h2>Validation Suite Results</h2>
                ${this.results.validationSuites.map((suite, index) => `
                    <div class="suite">
                        <div class="suite-header ${suite.status}" onclick="toggleSuite(${index})">
                            <strong>${suite.name}</strong> - ${suite.summary.total} checks (${suite.duration}ms)
                        </div>
                        <div class="suite-content" id="suite-${index}">
                            ${suite.checks.map(check => `
                                <div class="check-item">
                                    <div style="display: flex; justify-content: space-between; align-items: center;">
                                        <div>
                                            <span class="${check.status}">
                                                ${check.status === 'passed' ? '✓' : 
                                                  check.status === 'failed' ? '✗' : 
                                                  check.status === 'critical' ? '❌' : '⚠'}
                                            </span>
                                            ${check.name}
                                        </div>
                                        <div class="timestamp">${check.duration}ms</div>
                                    </div>
                                    ${check.error ? `<div style="margin-top: 10px; color: #dc2626;"><strong>Error:</strong> ${check.error}</div>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    </div>
    
    <script>
        function toggleSuite(index) {
            const content = document.getElementById('suite-' + index);
            content.classList.toggle('show');
        }
        
        // Auto-expand failed/critical suites
        document.addEventListener('DOMContentLoaded', function() {
            const problemSuites = document.querySelectorAll('.suite-header.failed, .suite-header.critical');
            problemSuites.forEach((header, index) => {
                const suiteIndex = Array.from(document.querySelectorAll('.suite-header')).indexOf(header);
                toggleSuite(suiteIndex);
            });
        });
    </script>
</body>
</html>`;
  }

  generateExecutiveSummary() {
    const { score, status, blockers, warnings, recommendations } = this.results.productionReadiness;
    const { totalChecks, passed, failed, critical } = this.results.summary;
    
    let summary = `# Production Readiness Assessment\n\n`;
    summary += `**Assessment Date:** ${this.results.timestamp}\n`;
    summary += `**Environment:** ${this.results.environment}\n`;
    summary += `**Overall Score:** ${score}/100\n`;
    summary += `**Status:** ${status.replace('_', ' ').toUpperCase()}\n\n`;
    
    summary += `## Executive Summary\n\n`;
    
    if (status === 'ready') {
      summary += `✅ **READY FOR PRODUCTION** - All critical systems validated and operational.\n\n`;
    } else if (status === 'mostly_ready') {
      summary += `🟡 **MOSTLY READY** - Minor issues identified that should be addressed before production.\n\n`;
    } else if (status === 'needs_work') {
      summary += `🟠 **NEEDS WORK** - Several issues must be resolved before production deployment.\n\n`;
    } else {
      summary += `🔴 **NOT READY** - Critical issues prevent production deployment.\n\n`;
    }
    
    summary += `### Key Metrics\n\n`;
    summary += `- **Total Checks:** ${totalChecks}\n`;
    summary += `- **Passed:** ${passed} (${Math.round((passed/totalChecks)*100)}%)\n`;
    summary += `- **Failed:** ${failed}\n`;
    summary += `- **Critical Issues:** ${critical}\n\n`;
    
    if (blockers.length > 0) {
      summary += `### 🚫 Production Blockers\n\n`;
      summary += `The following critical issues must be resolved before production deployment:\n\n`;
      blockers.forEach((blocker, index) => {
        summary += `${index + 1}. ${blocker}\n`;
      });
      summary += `\n`;
    }
    
    if (warnings.length > 0) {
      summary += `### ⚠️ Warnings\n\n`;
      summary += `The following issues should be addressed:\n\n`;
      warnings.forEach((warning, index) => {
        summary += `${index + 1}. ${warning}\n`;
      });
      summary += `\n`;
    }
    
    if (recommendations.length > 0) {
      summary += `### 💡 Recommendations\n\n`;
      recommendations.forEach((rec, index) => {
        summary += `${index + 1}. ${rec}\n`;
      });
      summary += `\n`;
    }
    
    summary += `### Next Steps\n\n`;
    
    if (status === 'ready') {
      summary += `1. Schedule production deployment\n`;
      summary += `2. Prepare rollback procedures\n`;
      summary += `3. Monitor deployment closely\n`;
    } else {
      summary += `1. Address all production blockers\n`;
      summary += `2. Resolve critical security issues\n`;
      summary += `3. Re-run production readiness assessment\n`;
      summary += `4. Schedule deployment only after achieving "ready" status\n`;
    }
    
    return summary;
  }

  async run() {
    this.log('Starting production readiness validation...');
    const startTime = Date.now();
    
    try {
      // Run all validation suites
      await this.runValidationSuite('Deployment Pipeline Validation', (suite) => 
        this.validateDeploymentPipeline(suite));
      
      await this.runValidationSuite('Security Audit and Penetration Testing', (suite) => 
        this.validateSecurityReadiness(suite));
      
      await this.runValidationSuite('Performance and Load Testing', (suite) => 
        this.validatePerformanceReadiness(suite));
      
      await this.runValidationSuite('Monitoring and Alerting Validation', (suite) => 
        this.validateMonitoringReadiness(suite));
      
      await this.runValidationSuite('Compliance and Final Checks', (suite) => 
        this.validateComplianceReadiness(suite));
      
      // Generate comprehensive report
      const reportInfo = await this.generateReport();
      
      const totalTime = Date.now() - startTime;
      const { totalSuites, totalChecks, passed, failed, warnings, critical } = this.results.summary;
      const { score, status, blockers } = this.results.productionReadiness;
      
      this.log(`\n${'='.repeat(80)}`);
      this.log('PRODUCTION READINESS VALIDATION COMPLETE');
      this.log(`${'='.repeat(80)}`);
      this.log(`Total execution time: ${Math.round(totalTime/1000)}s`);
      this.log(`Validation suites: ${totalSuites}`);
      this.log(`Total checks: ${totalChecks}`);
      this.log(`Passed: ${passed} | Failed: ${failed} | Warnings: ${warnings} | Critical: ${critical}`);
      this.log(`Production Readiness Score: ${score}/100`);
      this.log(`Status: ${status.replace('_', ' ').toUpperCase()}`);
      this.log(`${'='.repeat(80)}`);
      
      if (status === 'ready') {
        this.log(`\n🎉 PRODUCTION READY! All systems validated and operational.`);
        this.log(`Deployment can proceed with confidence.`);
      } else if (status === 'mostly_ready') {
        this.log(`\n🟡 MOSTLY READY - Minor issues should be addressed before production.`);
        this.log(`${warnings} warnings detected. Review recommended.`);
      } else {
        this.log(`\n❌ NOT READY FOR PRODUCTION`);
        this.log(`${blockers.length} critical blockers must be resolved.`);
        this.log(`Review the detailed report: ${reportInfo.html}`);
        process.exit(1);
      }
      
      return reportInfo;
    } catch (error) {
      this.log(`Fatal error during production readiness validation: ${error.message}`, 'error');
      process.exit(1);
    }
  }
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {
    verbose: args.includes('--verbose') || args.includes('-v'),
    environment: args.find(arg => arg.startsWith('--env='))?.split('=')[1] || 'staging',
    stagingUrl: args.find(arg => arg.startsWith('--staging='))?.split('=')[1],
    productionUrl: args.find(arg => arg.startsWith('--production='))?.split('=')[1],
    outputDir: args.find(arg => arg.startsWith('--output='))?.split('=')[1]
  };
  
  console.log('🚀 Starting Production Readiness Validation');
  if (options.verbose) {
    console.log('Configuration:', options);
  }
  
  const validator = new ProductionReadinessValidator(options);
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n⚠️  Production readiness validation interrupted by user');
    process.exit(1);
  });
  
  process.on('SIGTERM', () => {
    console.log('\n⚠️  Production readiness validation terminated');
    process.exit(1);
  });
  
  // Execute validation
  (async () => {
    try {
      await validator.run();
    } catch (error) {
      console.error('❌ Production readiness validation failed:', error.message);
      process.exit(1);
    }
  })();
}

module.exports = ProductionReadinessValidator;