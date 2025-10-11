#!/usr/bin/env node

/**
 * Deployment Validation and Notification Script
 * 
 * This script provides post-deployment validation and notification capabilities
 * for the S3/CloudFront deployment pipeline.
 * 
 * Requirements addressed:
 * - 3.4: Implement post-deployment health checks
 * - 8.2: Add deployment status notifications
 * - 8.2: Configure failure handling and rollback triggers
 */

const https = require('https');
const http = require('http');
const { execSync } = require('child_process');

class DeploymentValidator {
  constructor(options = {}) {
    this.siteUrl = options.siteUrl || process.env.SITE_URL;
    this.environment = options.environment || process.env.DEPLOYMENT_ENVIRONMENT || 'production';
    this.deploymentId = options.deploymentId || process.env.GITHUB_SHA || `deploy-${Date.now()}`;
    this.githubActor = process.env.GITHUB_ACTOR || 'unknown';
    this.githubRef = process.env.GITHUB_REF || 'unknown';
    
    this.validationResults = {
      healthCheck: null,
      securityHeaders: null,
      performance: null,
      functionality: null,
      overall: 'pending'
    };
    
    this.notifications = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: '📋',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      debug: '🔍'
    }[type];
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  /**
   * Perform basic health check on the deployed site
   */
  async performHealthCheck() {
    this.log('Performing health check...', 'info');
    
    if (!this.siteUrl) {
      this.log('Site URL not configured, skipping health check', 'warning');
      this.validationResults.healthCheck = 'skipped';
      return false;
    }
    
    try {
      const response = await this.makeHttpRequest(this.siteUrl);
      
      if (response.statusCode === 200) {
        this.log(`Health check passed - Status: ${response.statusCode}`, 'success');
        this.validationResults.healthCheck = 'passed';
        
        // Check for basic HTML content
        if (response.body.includes('<html') && response.body.includes('</html>')) {
          this.log('HTML structure validation passed', 'success');
        } else {
          this.log('HTML structure validation failed', 'warning');
        }
        
        return true;
      } else {
        this.log(`Health check failed - Status: ${response.statusCode}`, 'error');
        this.validationResults.healthCheck = 'failed';
        return false;
      }
    } catch (error) {
      this.log(`Health check error: ${error.message}`, 'error');
      this.validationResults.healthCheck = 'error';
      return false;
    }
  }

  /**
   * Validate security headers
   */
  async validateSecurityHeaders() {
    this.log('Validating security headers...', 'info');
    
    if (!this.siteUrl) {
      this.log('Site URL not configured, skipping security validation', 'warning');
      this.validationResults.securityHeaders = 'skipped';
      return false;
    }
    
    try {
      const response = await this.makeHttpRequest(this.siteUrl);
      const headers = response.headers;
      
      const requiredHeaders = {
        'strict-transport-security': 'HSTS header',
        'x-content-type-options': 'Content type options',
        'x-frame-options': 'Frame options',
        'x-xss-protection': 'XSS protection'
      };
      
      let passed = 0;
      let total = Object.keys(requiredHeaders).length;
      
      for (const [header, description] of Object.entries(requiredHeaders)) {
        if (headers[header] || headers[header.toLowerCase()]) {
          this.log(`✓ ${description} header present`, 'success');
          passed++;
        } else {
          this.log(`✗ ${description} header missing`, 'warning');
        }
      }
      
      const passRate = passed / total;
      if (passRate >= 0.75) {
        this.log(`Security headers validation passed (${passed}/${total})`, 'success');
        this.validationResults.securityHeaders = 'passed';
        return true;
      } else {
        this.log(`Security headers validation failed (${passed}/${total})`, 'warning');
        this.validationResults.securityHeaders = 'failed';
        return false;
      }
    } catch (error) {
      this.log(`Security headers validation error: ${error.message}`, 'error');
      this.validationResults.securityHeaders = 'error';
      return false;
    }
  }

  /**
   * Validate basic performance metrics
   */
  async validatePerformance() {
    this.log('Validating performance metrics...', 'info');
    
    if (!this.siteUrl) {
      this.log('Site URL not configured, skipping performance validation', 'warning');
      this.validationResults.performance = 'skipped';
      return false;
    }
    
    try {
      const startTime = Date.now();
      const response = await this.makeHttpRequest(this.siteUrl);
      const responseTime = Date.now() - startTime;
      
      // Basic performance thresholds
      const thresholds = {
        responseTime: 3000, // 3 seconds
        contentSize: 1024 * 1024 * 5 // 5MB
      };
      
      let passed = true;
      
      // Check response time
      if (responseTime <= thresholds.responseTime) {
        this.log(`✓ Response time: ${responseTime}ms (under ${thresholds.responseTime}ms)`, 'success');
      } else {
        this.log(`✗ Response time: ${responseTime}ms (over ${thresholds.responseTime}ms)`, 'warning');
        passed = false;
      }
      
      // Check content size
      const contentSize = Buffer.byteLength(response.body, 'utf8');
      if (contentSize <= thresholds.contentSize) {
        this.log(`✓ Content size: ${this.formatBytes(contentSize)} (under ${this.formatBytes(thresholds.contentSize)})`, 'success');
      } else {
        this.log(`✗ Content size: ${this.formatBytes(contentSize)} (over ${this.formatBytes(thresholds.contentSize)})`, 'warning');
        passed = false;
      }
      
      // Check compression
      const compressionHeader = response.headers['content-encoding'];
      if (compressionHeader && (compressionHeader.includes('gzip') || compressionHeader.includes('br'))) {
        this.log('✓ Content compression enabled', 'success');
      } else {
        this.log('✗ Content compression not detected', 'warning');
        passed = false;
      }
      
      this.validationResults.performance = passed ? 'passed' : 'failed';
      return passed;
    } catch (error) {
      this.log(`Performance validation error: ${error.message}`, 'error');
      this.validationResults.performance = 'error';
      return false;
    }
  }

  /**
   * Validate core functionality
   */
  async validateFunctionality() {
    this.log('Validating core functionality...', 'info');
    
    try {
      // Run the existing functionality validation script
      execSync('node scripts/validate-site-functionality-simple.js --skip-server', {
        stdio: 'pipe',
        env: {
          ...process.env,
          SITE_URL: this.siteUrl
        }
      });
      
      this.log('Core functionality validation passed', 'success');
      this.validationResults.functionality = 'passed';
      return true;
    } catch (error) {
      this.log('Core functionality validation failed', 'error');
      this.validationResults.functionality = 'failed';
      return false;
    }
  }

  /**
   * Make HTTP request with timeout
   */
  makeHttpRequest(url, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const client = urlObj.protocol === 'https:' ? https : http;
      
      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port,
        path: urlObj.pathname + urlObj.search,
        method: 'GET',
        timeout: timeout,
        headers: {
          'User-Agent': 'DeploymentValidator/1.0'
        }
      };
      
      const req = client.request(options, (res) => {
        let body = '';
        
        res.on('data', (chunk) => {
          body += chunk;
        });
        
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body
          });
        });
      });
      
      req.on('timeout', () => {
        req.destroy();
        reject(new Error(`Request timeout after ${timeout}ms`));
      });
      
      req.on('error', (error) => {
        reject(error);
      });
      
      req.end();
    });
  }

  /**
   * Format bytes to human readable format
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Generate deployment notification
   */
  generateNotification(success) {
    const status = success ? 'SUCCESS' : 'FAILURE';
    const emoji = success ? '✅' : '❌';
    
    const notification = {
      status: status,
      environment: this.environment,
      deploymentId: this.deploymentId,
      siteUrl: this.siteUrl,
      timestamp: new Date().toISOString(),
      actor: this.githubActor,
      ref: this.githubRef,
      validationResults: this.validationResults
    };
    
    // Console notification
    console.log('\n' + '='.repeat(60));
    console.log(`${emoji} DEPLOYMENT ${status}`);
    console.log('='.repeat(60));
    console.log(`Environment: ${this.environment}`);
    console.log(`Deployment ID: ${this.deploymentId}`);
    console.log(`Site URL: ${this.siteUrl || 'Not configured'}`);
    console.log(`Deployed by: ${this.githubActor}`);
    console.log(`Branch/Ref: ${this.githubRef}`);
    console.log(`Timestamp: ${notification.timestamp}`);
    console.log('\nValidation Results:');
    
    for (const [test, result] of Object.entries(this.validationResults)) {
      if (test === 'overall') continue;
      
      const resultEmoji = {
        passed: '✅',
        failed: '❌',
        error: '⚠️',
        skipped: '⏭️'
      }[result] || '❓';
      
      console.log(`  ${resultEmoji} ${test}: ${result}`);
    }
    
    console.log('='.repeat(60));
    
    return notification;
  }

  /**
   * Send notification to external services (placeholder)
   */
  async sendNotifications(notification) {
    // This is a placeholder for external notification services
    // In a real implementation, you might send to:
    // - Slack webhooks
    // - Discord webhooks
    // - Email services
    // - PagerDuty
    // - Custom monitoring systems
    
    this.log('Notification generated (external services not configured)', 'info');
    
    // Example: Save notification to file for external processing
    const notificationFile = `.kiro/deployment-notifications/${this.deploymentId}.json`;
    const notificationDir = path.dirname(notificationFile);
    
    if (!fs.existsSync(notificationDir)) {
      fs.mkdirSync(notificationDir, { recursive: true });
    }
    
    fs.writeFileSync(notificationFile, JSON.stringify(notification, null, 2));
    this.log(`Notification saved to ${notificationFile}`, 'info');
  }

  /**
   * Determine if rollback should be triggered
   */
  shouldTriggerRollback() {
    const criticalFailures = [
      this.validationResults.healthCheck === 'failed',
      this.validationResults.healthCheck === 'error',
      this.validationResults.functionality === 'failed'
    ];
    
    return criticalFailures.some(failure => failure);
  }

  /**
   * Trigger rollback procedure
   */
  async triggerRollback() {
    this.log('Critical deployment failure detected, triggering rollback...', 'error');
    
    try {
      // Run the rollback script
      execSync('node scripts/rollback.js emergency', {
        stdio: 'inherit',
        env: {
          ...process.env,
          ROLLBACK_REASON: 'Post-deployment validation failure',
          DEPLOYMENT_ID: this.deploymentId
        }
      });
      
      this.log('Rollback completed successfully', 'success');
      return true;
    } catch (error) {
      this.log(`Rollback failed: ${error.message}`, 'error');
      return false;
    }
  }

  /**
   * Run complete validation suite
   */
  async run() {
    this.log(`Starting post-deployment validation for ${this.environment}...`, 'info');
    this.log(`Deployment ID: ${this.deploymentId}`, 'info');
    this.log(`Site URL: ${this.siteUrl || 'Not configured'}`, 'info');
    
    const validations = [
      { name: 'Health Check', fn: () => this.performHealthCheck() },
      { name: 'Security Headers', fn: () => this.validateSecurityHeaders() },
      { name: 'Performance', fn: () => this.validatePerformance() },
      { name: 'Functionality', fn: () => this.validateFunctionality() }
    ];
    
    let overallSuccess = true;
    
    for (const validation of validations) {
      try {
        const result = await validation.fn();
        if (!result) {
          overallSuccess = false;
        }
      } catch (error) {
        this.log(`${validation.name} validation error: ${error.message}`, 'error');
        overallSuccess = false;
      }
    }
    
    this.validationResults.overall = overallSuccess ? 'passed' : 'failed';
    
    // Generate and send notifications
    const notification = this.generateNotification(overallSuccess);
    await this.sendNotifications(notification);
    
    // Check if rollback should be triggered
    if (this.shouldTriggerRollback()) {
      await this.triggerRollback();
      process.exit(1);
    }
    
    if (overallSuccess) {
      this.log('All post-deployment validations passed!', 'success');
      process.exit(0);
    } else {
      this.log('Some post-deployment validations failed', 'warning');
      process.exit(1);
    }
  }
}

// CLI execution
if (require.main === module) {
  const validator = new DeploymentValidator();
  validator.run().catch(error => {
    console.error('❌ Validation failed:', error.message);
    process.exit(1);
  });
}

module.exports = DeploymentValidator;