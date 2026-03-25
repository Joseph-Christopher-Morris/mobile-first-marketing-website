/**
 * CloudFront Redirect Function Tests
 * 
 * Tests the CloudFront Function that redirects /services/hosting/ to /services/website-hosting/
 * 
 * Requirements validated:
 * - 2.2: Exclude artifact URL /services/hosting/ from sitemap
 * - 2.5: Improve Google Search Console coverage
 * - 2.6: Redirect artifact URL with HTTP 301 status
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('CloudFront Redirect Function', () => {
  const functionPath = path.join(
    process.cwd(),
    'cloudfront-functions',
    'redirect-hosting-to-website-hosting.js'
  );

  describe('Function File', () => {
    it('should exist at expected location', () => {
      expect(fs.existsSync(functionPath)).toBe(true);
    });

    it('should contain valid JavaScript code', () => {
      const code = fs.readFileSync(functionPath, 'utf8');
      expect(code).toBeTruthy();
      expect(code.length).toBeGreaterThan(0);
    });

    it('should define a handler function', () => {
      const code = fs.readFileSync(functionPath, 'utf8');
      expect(code).toContain('function handler(event)');
    });
  });

  describe('Function Logic', () => {
    let handler: (event: any) => any;

    beforeEach(() => {
      // Load and evaluate the CloudFront Function code
      const code = fs.readFileSync(functionPath, 'utf8');
      // Extract the handler function
      const functionMatch = code.match(/function handler\(event\)\s*{[\s\S]*}/);
      if (!functionMatch) {
        throw new Error('Could not extract handler function from CloudFront Function code');
      }
      // Create a function from the code
      handler = new Function('event', functionMatch[0] + '\nreturn handler(event);') as any;
    });

    it('should redirect /services/hosting/ with 301 status', () => {
      const event = {
        request: {
          uri: '/services/hosting/',
          headers: {},
        },
      };

      const result = handler(event);

      expect(result).toHaveProperty('statusCode', 301);
      expect(result).toHaveProperty('statusDescription', 'Moved Permanently');
      expect(result).toHaveProperty('headers');
      expect(result.headers).toHaveProperty('location');
      expect(result.headers.location).toHaveProperty('value', '/services/website-hosting/');
    });

    it('should redirect /services/hosting (without trailing slash) with 301 status', () => {
      const event = {
        request: {
          uri: '/services/hosting',
          headers: {},
        },
      };

      const result = handler(event);

      expect(result).toHaveProperty('statusCode', 301);
      expect(result).toHaveProperty('statusDescription', 'Moved Permanently');
      expect(result).toHaveProperty('headers');
      expect(result.headers).toHaveProperty('location');
      expect(result.headers.location).toHaveProperty('value', '/services/website-hosting/');
    });

    it('should pass through other URLs unchanged', () => {
      const testUrls = [
        '/',
        '/services/',
        '/services/website-hosting/',
        '/services/website-design/',
        '/blog/',
        '/blog/stock-photography-breakthrough/',
        '/about/',
        '/contact/',
      ];

      testUrls.forEach(uri => {
        const event = {
          request: {
            uri,
            headers: {},
          },
        };

        const result = handler(event);

        // Should return the original request unchanged
        expect(result).toEqual(event.request);
        expect(result).not.toHaveProperty('statusCode');
      });
    });

    it('should not redirect similar URLs', () => {
      const testUrls = [
        '/services/hosting-guide/',
        '/services/web-hosting/',
        '/hosting/',
        '/services/hosting-plans/',
      ];

      testUrls.forEach(uri => {
        const event = {
          request: {
            uri,
            headers: {},
          },
        };

        const result = handler(event);

        // Should return the original request unchanged
        expect(result).toEqual(event.request);
        expect(result).not.toHaveProperty('statusCode');
      });
    });

    it('should handle requests with query strings', () => {
      const event = {
        request: {
          uri: '/services/hosting/',
          querystring: 'utm_source=google&utm_medium=cpc',
          headers: {},
        },
      };

      const result = handler(event);

      expect(result).toHaveProperty('statusCode', 301);
      expect(result.headers.location.value).toBe('/services/website-hosting/');
    });

    it('should handle requests with headers', () => {
      const event = {
        request: {
          uri: '/services/hosting/',
          headers: {
            'user-agent': { value: 'Mozilla/5.0' },
            'accept': { value: 'text/html' },
          },
        },
      };

      const result = handler(event);

      expect(result).toHaveProperty('statusCode', 301);
      expect(result.headers.location.value).toBe('/services/website-hosting/');
    });
  });

  describe('Function Syntax', () => {
    it('should use CloudFront Functions compatible syntax', () => {
      const code = fs.readFileSync(functionPath, 'utf8');

      // CloudFront Functions use ES5 syntax
      expect(code).not.toContain('const ');
      expect(code).not.toContain('let ');
      expect(code).not.toContain('=>'); // No arrow functions
      expect(code).not.toContain('async ');
      expect(code).not.toContain('await ');

      // Should use var for variables
      expect(code).toContain('var ');
    });

    it('should not exceed CloudFront Functions size limit', () => {
      const code = fs.readFileSync(functionPath, 'utf8');
      const sizeInBytes = Buffer.byteLength(code, 'utf8');

      // CloudFront Functions have a 10KB limit
      expect(sizeInBytes).toBeLessThan(10 * 1024);
    });

    it('should have proper function structure', () => {
      const code = fs.readFileSync(functionPath, 'utf8');

      // Must have handler function
      expect(code).toContain('function handler(event)');

      // Must return a value
      expect(code).toContain('return ');
    });
  });

  describe('Documentation', () => {
    it('should have deployment documentation', () => {
      const docsPath = path.join(process.cwd(), 'docs', 'cloudfront-redirect-setup.md');
      expect(fs.existsSync(docsPath)).toBe(true);
    });

    it('should have deployment script', () => {
      const scriptPath = path.join(process.cwd(), 'scripts', 'deploy-cloudfront-function.js');
      expect(fs.existsSync(scriptPath)).toBe(true);
    });

    it('should document the redirect in setup guide', () => {
      const docsPath = path.join(process.cwd(), 'docs', 'cloudfront-redirect-setup.md');
      const docs = fs.readFileSync(docsPath, 'utf8');

      expect(docs).toContain('/services/hosting/');
      expect(docs).toContain('/services/website-hosting/');
      expect(docs).toContain('301');
      expect(docs).toContain('redirect');
    });
  });

  describe('Integration with Sitemap', () => {
    it('should complement sitemap exclusion of artifact URL', () => {
      // The redirect handles any direct traffic to /services/hosting/
      // while the sitemap excludes it from search engine discovery
      
      const event = {
        request: {
          uri: '/services/hosting/',
          headers: {},
        },
      };

      const handler = new Function(
        'event',
        fs.readFileSync(functionPath, 'utf8') + '\nreturn handler(event);'
      ) as any;

      const result = handler(event);

      // Verify redirect works
      expect(result.statusCode).toBe(301);
      expect(result.headers.location.value).toBe('/services/website-hosting/');
    });
  });

  describe('SEO Requirements', () => {
    it('should use 301 status code for permanent redirect', () => {
      const code = fs.readFileSync(functionPath, 'utf8');
      
      // Must use 301 for SEO (not 302 temporary redirect)
      expect(code).toContain('statusCode: 301');
      expect(code).toContain('Moved Permanently');
    });

    it('should redirect to canonical URL with trailing slash', () => {
      const code = fs.readFileSync(functionPath, 'utf8');
      
      // Must redirect to URL with trailing slash for consistency
      expect(code).toContain('/services/website-hosting/');
    });

    it('should handle both URL variations (with and without trailing slash)', () => {
      const code = fs.readFileSync(functionPath, 'utf8');
      
      // Must handle both /services/hosting and /services/hosting/
      expect(code).toContain('/services/hosting');
      expect(code).toContain('/services/hosting/');
    });
  });
});
