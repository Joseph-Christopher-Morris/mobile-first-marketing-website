/**
 * Deployment Pipeline Sitemap Verification Test
 * 
 * Validates that the deployment pipeline correctly handles sitemap.xml:
 * - Uploads with appropriate cache headers (Cache-Control: public, max-age=3600)
 * - Includes in CloudFront invalidation patterns
 * - Maintains robots.txt reference to sitemap URL
 * 
 * Requirements: 2.8, 3.3, 3.4, 3.5, 3.6, 3.7 from bugfix.md
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Deployment Pipeline - Sitemap Configuration', () => {
  describe('Cache Headers Configuration', () => {
    it('should configure sitemap.xml with Cache-Control: public, max-age=3600', () => {
      const deployScriptPath = path.join(process.cwd(), 'scripts/deploy.js');
      const deployScript = fs.readFileSync(deployScriptPath, 'utf-8');

      // Verify getCacheHeaders function includes sitemap.xml handling
      expect(deployScript).toContain('sitemap.xml');
      expect(deployScript).toContain('robots.txt');
      
      // Verify the cache control header is set correctly
      const cacheHeaderRegex = /sitemap\.xml.*?Cache-Control.*?public.*?max-age=3600/s;
      expect(deployScript).toMatch(cacheHeaderRegex);
    });

    it('should apply same cache headers to robots.txt', () => {
      const deployScriptPath = path.join(process.cwd(), 'scripts/deploy.js');
      const deployScript = fs.readFileSync(deployScriptPath, 'utf-8');

      // Verify robots.txt gets same cache treatment as sitemap
      const robotsCacheRegex = /robots\.txt.*?Cache-Control.*?public.*?max-age=3600/s;
      expect(deployScript).toMatch(robotsCacheRegex);
    });
  });

  describe('CloudFront Invalidation Configuration', () => {
    it('should include wildcard pattern that covers sitemap.xml', () => {
      const deployScriptPath = path.join(process.cwd(), 'scripts/deploy.js');
      const deployScript = fs.readFileSync(deployScriptPath, 'utf-8');

      // Verify invalidation includes patterns that cover sitemap.xml
      // The script uses ['/_next/*', '/*'] which covers all files including sitemap.xml
      expect(deployScript).toContain('pathsToInvalidate');
      expect(deployScript).toContain('/_next/*');
      expect(deployScript).toContain('/*');
    });

    it('should use wildcard invalidation for efficiency', () => {
      const deployScriptPath = path.join(process.cwd(), 'scripts/deploy.js');
      const deployScript = fs.readFileSync(deployScriptPath, 'utf-8');

      // Verify the script uses efficient wildcard patterns
      expect(deployScript).toContain('using wildcards');
      
      // Verify it creates invalidation batch with proper structure
      expect(deployScript).toContain('InvalidationBatch');
      expect(deployScript).toContain('CallerReference');
    });
  });

  describe('Robots.txt Sitemap Reference', () => {
    it('should reference sitemap at correct production URL', () => {
      const robotsPath = path.join(process.cwd(), 'public/robots.txt');
      const robotsContent = fs.readFileSync(robotsPath, 'utf-8');

      // Verify sitemap URL is correct
      expect(robotsContent).toContain('Sitemap: https://vividmediacheshire.com/sitemap.xml');
    });

    it('should allow all search engines to access sitemap', () => {
      const robotsPath = path.join(process.cwd(), 'public/robots.txt');
      const robotsContent = fs.readFileSync(robotsPath, 'utf-8');

      // Verify general crawl permissions
      expect(robotsContent).toContain('User-agent: *');
      expect(robotsContent).toContain('Allow: /');
      
      // Verify sitemap is not blocked
      expect(robotsContent).not.toMatch(/Disallow:.*sitemap/i);
    });
  });

  describe('Build Output Verification', () => {
    it('should have sitemap.xml in out directory after build', () => {
      const sitemapPath = path.join(process.cwd(), 'out/sitemap.xml');
      
      // Verify sitemap exists in build output
      expect(fs.existsSync(sitemapPath)).toBe(true);
    });

    it('should have valid sitemap.xml with blog articles', () => {
      const sitemapPath = path.join(process.cwd(), 'out/sitemap.xml');
      const sitemapContent = fs.readFileSync(sitemapPath, 'utf-8');

      // Verify sitemap is valid XML
      expect(sitemapContent).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(sitemapContent).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
      
      // Verify blog articles are included
      const blogUrlCount = (sitemapContent.match(/\/blog\//g) || []).length;
      expect(blogUrlCount).toBeGreaterThanOrEqual(14); // At least 14 blog articles
    });

    it('should exclude artifact URL /services/hosting/', () => {
      const sitemapPath = path.join(process.cwd(), 'out/sitemap.xml');
      const sitemapContent = fs.readFileSync(sitemapPath, 'utf-8');

      // Verify artifact URL is not present
      expect(sitemapContent).not.toContain('/services/hosting/');
    });

    it('should include canonical URL /services/website-hosting/', () => {
      const sitemapPath = path.join(process.cwd(), 'out/sitemap.xml');
      const sitemapContent = fs.readFileSync(sitemapPath, 'utf-8');

      // Verify canonical URL is present
      expect(sitemapContent).toContain('/services/website-hosting/');
    });
  });

  describe('Content Type Configuration', () => {
    it('should configure XML content type for sitemap.xml', () => {
      const deployScriptPath = path.join(process.cwd(), 'scripts/deploy.js');
      const deployScript = fs.readFileSync(deployScriptPath, 'utf-8');

      // Verify XML content type is configured
      expect(deployScript).toContain('.xml');
      expect(deployScript).toContain('application/xml');
    });
  });

  describe('Deployment Process Integration', () => {
    it('should include sitemap in file upload process', () => {
      const deployScriptPath = path.join(process.cwd(), 'scripts/deploy.js');
      const deployScript = fs.readFileSync(deployScriptPath, 'utf-8');

      // Verify the deployment script walks all files in build directory
      expect(deployScript).toContain('walkDir');
      expect(deployScript).toContain(this.buildDir || 'out');
      
      // Verify it uploads all files found
      expect(deployScript).toContain('uploadFile');
    });

    it('should preserve sitemap during cleanup operations', () => {
      const deployScriptPath = path.join(process.cwd(), 'scripts/deploy.js');
      const deployScript = fs.readFileSync(deployScriptPath, 'utf-8');

      // Verify cleanup only removes files not in current build
      expect(deployScript).toContain('cleanupOldFiles');
      expect(deployScript).toContain('currentFiles');
      
      // Verify it checks against current build files
      const cleanupLogic = deployScript.match(/cleanupOldFiles[\s\S]*?catch/);
      expect(cleanupLogic).toBeTruthy();
    });
  });
});

describe('Deployment Pipeline - S3 + CloudFront Architecture', () => {
  it('should use S3 + CloudFront architecture (not AWS Amplify)', () => {
    const deployScriptPath = path.join(process.cwd(), 'scripts/deploy.js');
    const deployScript = fs.readFileSync(deployScriptPath, 'utf-8');

    // Verify S3 and CloudFront clients are used
    expect(deployScript).toContain('@aws-sdk/client-s3');
    expect(deployScript).toContain('@aws-sdk/client-cloudfront');
    expect(deployScript).toContain('S3Client');
    expect(deployScript).toContain('CloudFrontClient');
    
    // Verify no Amplify references
    expect(deployScript).not.toContain('amplify');
    expect(deployScript).not.toContain('Amplify');
  });

  it('should require S3 bucket and CloudFront distribution configuration', () => {
    const deployScriptPath = path.join(process.cwd(), 'scripts/deploy.js');
    const deployScript = fs.readFileSync(deployScriptPath, 'utf-8');

    // Verify required environment variables
    expect(deployScript).toContain('S3_BUCKET_NAME');
    expect(deployScript).toContain('CLOUDFRONT_DISTRIBUTION_ID');
    expect(deployScript).toContain('AWS_REGION');
  });
});
