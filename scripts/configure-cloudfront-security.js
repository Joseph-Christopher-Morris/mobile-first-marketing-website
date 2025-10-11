#!/usr/bin/env node

/**
 * CloudFront Security Configuration Script
 * Configures security headers and error handling for CloudFront distribution
 * 
 * Requirements addressed:
 * - 2.4: Custom error pages for SPA routing (404 -> index.html)
 * - 7.3: Security headers in CloudFront responses
 */

const { 
  CloudFrontClient, 
  CreateResponseHeadersPolicyCommand,
  GetResponseHeadersPolicyCommand,
  UpdateDistributionCommand,
  GetDistributionCommand,
  GetDistributionConfigCommand
} = require('@aws-sdk/client-cloudfront');

const fs = require('fs');
const path = require('path');

class CloudFrontSecurityConfig {
  constructor() {
    this.cloudFrontClient = new CloudFrontClient({ 
      region: 'us-east-1' // CloudFront is global but API calls go to us-east-1
    });
    this.distributionId = process.env.CLOUDFRONT_DISTRIBUTION_ID;
    this.environment = process.env.ENVIRONMENT || 'production';
    
    if (!this.distributionId) {
      console.warn('⚠️  CLOUDFRONT_DISTRIBUTION_ID not provided, will create policies only');
    }
  }

  /**
   * Create comprehensive security headers policy
   */
  async createSecurityHeadersPolicy() {
    console.log('Creating security headers policy...');
    
    const policyConfig = {
      Name: `mobile-marketing-security-headers-${this.environment}`,
      Comment: 'Comprehensive security headers for mobile marketing website',
      ResponseHeadersPolicyConfig: {
        Name: `mobile-marketing-security-headers-${this.environment}`,
        Comment: 'Security headers including HSTS, CSP, and other protections',
        
        SecurityHeadersConfig: {
          StrictTransportSecurity: {
            AccessControlMaxAgeSec: 63072000, // 2 years for better security
            IncludeSubdomains: true,
            Preload: true,
            Override: true
          },
          ContentTypeOptions: {
            Override: true
          },
          FrameOptions: {
            FrameOption: 'DENY',
            Override: true
          },
          XSSProtection: {
            ModeBlock: true,
            Protection: true,
            Override: true
          },
          ReferrerPolicy: {
            ReferrerPolicy: 'strict-origin-when-cross-origin',
            Override: true
          },
          ContentSecurityPolicy: {
            ContentSecurityPolicy: this.generateCSP(),
            Override: true
          }
        },
        
        CustomHeadersConfig: {
          Items: [
            {
              Header: 'Permissions-Policy',
              Value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=(), magnetometer=(), gyroscope=(), accelerometer=(), ambient-light-sensor=(), autoplay=(), encrypted-media=(), fullscreen=(), picture-in-picture=()',
              Override: true
            },
            {
              Header: 'X-Robots-Tag',
              Value: 'index, follow',
              Override: false
            },
            {
              Header: 'Cache-Control',
              Value: 'public, max-age=300', // 5 minutes for HTML
              Override: false
            },
            {
              Header: 'Cross-Origin-Embedder-Policy',
              Value: 'unsafe-none',
              Override: true
            },
            {
              Header: 'Cross-Origin-Opener-Policy',
              Value: 'same-origin-allow-popups',
              Override: true
            },
            {
              Header: 'Cross-Origin-Resource-Policy',
              Value: 'cross-origin',
              Override: true
            },
            {
              Header: 'X-DNS-Prefetch-Control',
              Value: 'on',
              Override: true
            }
          ]
        },
        
        RemoveHeadersConfig: {
          Items: [
            {
              Header: 'Server'
            },
            {
              Header: 'X-Powered-By'
            }
          ]
        }
      }
    };

    try {
      const result = await this.cloudFrontClient.send(
        new CreateResponseHeadersPolicyCommand(policyConfig)
      );
      
      console.log('✅ Security headers policy created successfully');
      console.log(`Policy ID: ${result.ResponseHeadersPolicy.Id}`);
      
      return result.ResponseHeadersPolicy;
    } catch (error) {
      if (error.name === 'ResponseHeadersPolicyAlreadyExists') {
        console.log('⚠️  Security headers policy already exists, continuing...');
        return null;
      }
      throw error;
    }
  }

  /**
   * Generate Content Security Policy
   */
  generateCSP() {
    const cspDirectives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://region1.google-analytics.com https://www.gstatic.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com",
      "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com data:",
      "img-src 'self' data: https: blob:",
      "media-src 'self' data: https:",
      "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://region1.google-analytics.com https://stats.g.doubleclick.net",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "frame-src 'none'",
      "worker-src 'self' blob:",
      "manifest-src 'self'",
      "child-src 'self'",
      "prefetch-src 'self'",
      "upgrade-insecure-requests",
      "block-all-mixed-content"
    ];
    
    return cspDirectives.join('; ');
  }

  /**
   * Create CORS headers policy for API endpoints (if needed)
   */
  async createCORSHeadersPolicy() {
    console.log('Creating CORS headers policy...');
    
    const corsConfig = {
      Name: `mobile-marketing-cors-${this.environment}`,
      Comment: 'CORS headers for API endpoints',
      ResponseHeadersPolicyConfig: {
        Name: `mobile-marketing-cors-${this.environment}`,
        Comment: 'CORS configuration for API endpoints',
        
        CorsConfig: {
          AccessControlAllowCredentials: false,
          AccessControlAllowHeaders: {
            Items: [
              'Content-Type',
              'Authorization',
              'X-Requested-With',
              'Accept',
              'Origin',
              'Cache-Control',
              'X-File-Name'
            ]
          },
          AccessControlAllowMethods: {
            Items: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD']
          },
          AccessControlAllowOrigins: {
            Items: ['*'] // Should be restricted to specific domains in production
          },
          AccessControlExposeHeaders: {
            Items: ['Content-Length', 'Date', 'Server', 'ETag']
          },
          AccessControlMaxAgeSec: 86400, // 24 hours
          OriginOverride: true
        }
      }
    };

    try {
      const result = await this.cloudFrontClient.send(
        new CreateResponseHeadersPolicyCommand(corsConfig)
      );
      
      console.log('✅ CORS headers policy created successfully');
      console.log(`Policy ID: ${result.ResponseHeadersPolicy.Id}`);
      
      return result.ResponseHeadersPolicy;
    } catch (error) {
      if (error.name === 'ResponseHeadersPolicyAlreadyExists') {
        console.log('⚠️  CORS headers policy already exists, continuing...');
        return null;
      }
      throw error;
    }
  }

  /**
   * Configure custom error responses for SPA routing
   */
  getCustomErrorResponses() {
    return [
      {
        ErrorCode: 404,
        ResponsePagePath: '/index.html',
        ResponseCode: '200',
        ErrorCachingMinTTL: 300 // 5 minutes
      },
      {
        ErrorCode: 403,
        ResponsePagePath: '/index.html',
        ResponseCode: '200',
        ErrorCachingMinTTL: 300 // 5 minutes
      },
      {
        ErrorCode: 500,
        ResponsePagePath: '/500.html',
        ResponseCode: '500',
        ErrorCachingMinTTL: 0 // Don't cache server errors
      },
      {
        ErrorCode: 502,
        ResponsePagePath: '/500.html',
        ResponseCode: '502',
        ErrorCachingMinTTL: 0
      },
      {
        ErrorCode: 503,
        ResponsePagePath: '/500.html',
        ResponseCode: '503',
        ErrorCachingMinTTL: 0
      },
      {
        ErrorCode: 504,
        ResponsePagePath: '/500.html',
        ResponseCode: '504',
        ErrorCachingMinTTL: 0
      }
    ];
  }

  /**
   * Update distribution with security configuration
   */
  async updateDistributionSecurity(securityPolicyId, corsPolicyId) {
    if (!this.distributionId) {
      console.log('⚠️  No distribution ID provided, skipping distribution update');
      return;
    }

    console.log('Updating CloudFront distribution with security configuration...');
    
    try {
      // Get current distribution configuration
      const getConfigResult = await this.cloudFrontClient.send(
        new GetDistributionConfigCommand({ Id: this.distributionId })
      );
      
      const config = getConfigResult.DistributionConfig;
      const etag = getConfigResult.ETag;
      
      // Update security headers policy
      if (securityPolicyId) {
        config.DefaultCacheBehavior.ResponseHeadersPolicyId = securityPolicyId;
        
        // Update cache behaviors with security headers
        if (config.CacheBehaviors && config.CacheBehaviors.Items) {
          config.CacheBehaviors.Items.forEach(behavior => {
            if (!behavior.PathPattern.includes('/api/')) {
              behavior.ResponseHeadersPolicyId = securityPolicyId;
            } else if (corsPolicyId) {
              behavior.ResponseHeadersPolicyId = corsPolicyId;
            }
          });
        }
      }
      
      // Update custom error responses
      config.CustomErrorResponses = {
        Quantity: this.getCustomErrorResponses().length,
        Items: this.getCustomErrorResponses()
      };
      
      // Update the distribution
      const updateResult = await this.cloudFrontClient.send(
        new UpdateDistributionCommand({
          Id: this.distributionId,
          DistributionConfig: config,
          IfMatch: etag
        })
      );
      
      console.log('✅ CloudFront distribution updated with security configuration');
      console.log(`Distribution Status: ${updateResult.Distribution.Status}`);
      
      return updateResult.Distribution;
      
    } catch (error) {
      console.error('❌ Failed to update distribution:', error.message);
      throw error;
    }
  }

  /**
   * Create error pages for the website
   */
  async createErrorPages() {
    console.log('Creating error page templates...');
    
    const errorPagesDir = path.join(process.cwd(), 'public', 'error-pages');
    if (!fs.existsSync(errorPagesDir)) {
      fs.mkdirSync(errorPagesDir, { recursive: true });
    }
    
    // Create 500 error page
    const error500Html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Server Error - Mobile Marketing</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
        }
        .error-container {
            text-align: center;
            padding: 2rem;
            max-width: 500px;
        }
        .error-code {
            font-size: 6rem;
            font-weight: bold;
            margin: 0;
            opacity: 0.8;
        }
        .error-message {
            font-size: 1.5rem;
            margin: 1rem 0;
        }
        .error-description {
            font-size: 1rem;
            opacity: 0.8;
            margin: 1rem 0 2rem;
        }
        .home-button {
            display: inline-block;
            padding: 12px 24px;
            background: rgba(255, 255, 255, 0.2);
            color: white;
            text-decoration: none;
            border-radius: 6px;
            border: 1px solid rgba(255, 255, 255, 0.3);
            transition: all 0.3s ease;
        }
        .home-button:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-2px);
        }
    </style>
</head>
<body>
    <div class="error-container">
        <h1 class="error-code">500</h1>
        <h2 class="error-message">Server Error</h2>
        <p class="error-description">
            We're experiencing some technical difficulties. Please try again in a few moments.
        </p>
        <a href="/" class="home-button">Return Home</a>
    </div>
</body>
</html>`;
    
    fs.writeFileSync(path.join(errorPagesDir, '500.html'), error500Html);
    
    console.log('✅ Error pages created successfully');
  }

  /**
   * Save security configuration
   */
  async saveSecurityConfig(securityPolicy, corsPolicy) {
    const configDir = path.join(process.cwd(), 'config');
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    
    const securityConfig = {
      environment: this.environment,
      distributionId: this.distributionId,
      createdAt: new Date().toISOString(),
      policies: {
        securityHeaders: securityPolicy ? {
          id: securityPolicy.Id,
          name: securityPolicy.ResponseHeadersPolicyConfig.Name
        } : null,
        corsHeaders: corsPolicy ? {
          id: corsPolicy.Id,
          name: corsPolicy.ResponseHeadersPolicyConfig.Name
        } : null
      },
      customErrorResponses: this.getCustomErrorResponses(),
      securityFeatures: {
        hsts: true,
        csp: true,
        xssProtection: true,
        contentTypeOptions: true,
        frameOptions: true,
        referrerPolicy: true,
        permissionsPolicy: true
      }
    };
    
    const configPath = path.join(configDir, 'cloudfront-security.json');
    fs.writeFileSync(configPath, JSON.stringify(securityConfig, null, 2));
    
    console.log(`✅ Security configuration saved to ${configPath}`);
  }

  /**
   * Main execution function
   */
  async run() {
    try {
      console.log('🔒 Starting CloudFront security configuration...');
      console.log(`Environment: ${this.environment}`);
      console.log(`Distribution ID: ${this.distributionId || 'Not provided'}`);
      
      // Create security policies
      const securityPolicy = await this.createSecurityHeadersPolicy();
      const corsPolicy = await this.createCORSHeadersPolicy();
      
      // Update distribution if ID is provided
      if (this.distributionId && securityPolicy) {
        await this.updateDistributionSecurity(securityPolicy.Id, corsPolicy?.Id);
      }
      
      // Create error pages
      await this.createErrorPages();
      
      // Save configuration
      await this.saveSecurityConfig(securityPolicy, corsPolicy);
      
      console.log('\n🎉 CloudFront security configuration completed successfully!');
      console.log('\n📋 Security features configured:');
      console.log('✅ Strict Transport Security (HSTS)');
      console.log('✅ Content Security Policy (CSP)');
      console.log('✅ X-Content-Type-Options');
      console.log('✅ X-Frame-Options');
      console.log('✅ X-XSS-Protection');
      console.log('✅ Referrer Policy');
      console.log('✅ Permissions Policy');
      console.log('✅ Custom Error Pages for SPA routing');
      
      if (securityPolicy) {
        console.log(`\n🔑 Security Headers Policy ID: ${securityPolicy.Id}`);
      }
      if (corsPolicy) {
        console.log(`🔑 CORS Headers Policy ID: ${corsPolicy.Id}`);
      }
      
      return { securityPolicy, corsPolicy };
      
    } catch (error) {
      console.error('\n❌ CloudFront security configuration failed:', error.message);
      process.exit(1);
    }
  }
}

// Run the script if called directly
if (require.main === module) {
  const securityConfig = new CloudFrontSecurityConfig();
  securityConfig.run();
}

module.exports = CloudFrontSecurityConfig;