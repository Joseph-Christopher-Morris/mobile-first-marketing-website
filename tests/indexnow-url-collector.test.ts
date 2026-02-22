import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { collectUrls, validateUrl, shouldIndex, parseSitemapXml } from '../scripts/lib/url-collector.js';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Unit Tests for IndexNow URL Collector
 * 
 * Feature: indexnow-submission
 * 
 * Tests specific scenarios for URL collection including:
 * - Sitemap parsing with sample XML
 * - Exclusion of /thank-you/ pages
 * - Domain validation rejecting mismatched domains
 * - Empty sitemap handling
 * 
 * Requirements: 3.2, 3.4, 3.5
 */

describe('Feature: indexnow-submission - URL Collector Unit Tests', () => {
  
  const testDomain = 'vividmediacheshire.com';
  const testSitemapPath = 'test-sitemap.xml';
  
  // Clean up test files after each test
  afterEach(async () => {
    try {
      await fs.unlink(testSitemapPath);
    } catch (error) {
      // File might not exist, ignore error
    }
  });

  describe('parseSitemapXml', () => {
    it('should parse sitemap XML and extract URLs from <loc> tags', () => {
      const sampleXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://vividmediacheshire.com/</loc>
    <lastmod>2026-02-22</lastmod>
  </url>
  <url>
    <loc>https://vividmediacheshire.com/services/</loc>
    <lastmod>2026-02-22</lastmod>
  </url>
  <url>
    <loc>https://vividmediacheshire.com/blog/</loc>
    <lastmod>2026-02-22</lastmod>
  </url>
</urlset>`;

      const urls = parseSitemapXml(sampleXml);
      
      expect(urls).toHaveLength(3);
      expect(urls).toContain('https://vividmediacheshire.com/');
      expect(urls).toContain('https://vividmediacheshire.com/services/');
      expect(urls).toContain('https://vividmediacheshire.com/blog/');
    });

    it('should handle sitemap with whitespace in <loc> tags', () => {
      const sampleXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>  https://vividmediacheshire.com/  </loc>
  </url>
  <url>
    <loc>  https://vividmediacheshire.com/services/  </loc>
  </url>
</urlset>`;

      const urls = parseSitemapXml(sampleXml);
      
      expect(urls).toHaveLength(2);
      expect(urls[0]).toBe('https://vividmediacheshire.com/');
      expect(urls[1]).toBe('https://vividmediacheshire.com/services/');
    });

    it('should return empty array for sitemap with no URLs', () => {
      const sampleXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`;

      const urls = parseSitemapXml(sampleXml);
      
      expect(urls).toHaveLength(0);
      expect(urls).toEqual([]);
    });

    it('should handle malformed XML gracefully', () => {
      const malformedXml = `<urlset>
  <url><loc>https://example.com/</url>
  <url><loc>https://example.com/page/</loc></url>
</urlset>`;

      const urls = parseSitemapXml(malformedXml);
      
      // Should still extract the properly closed <loc> tag
      expect(urls).toContain('https://example.com/page/');
    });
  });

  describe('validateUrl', () => {
    it('should reject URLs with mismatched domains', () => {
      const wrongDomainUrl = 'https://wrongdomain.com/page/';
      const result = validateUrl(wrongDomainUrl, testDomain);
      
      expect(result).toBeNull();
    });

    it('should reject URLs with different subdomains', () => {
      const subdomainUrl = 'https://www.vividmediacheshire.com/page/';
      const result = validateUrl(subdomainUrl, testDomain);
      
      expect(result).toBeNull();
    });

    it('should accept URLs with matching domain', () => {
      const validUrl = 'https://vividmediacheshire.com/page/';
      const result = validateUrl(validUrl, testDomain);
      
      expect(result).not.toBeNull();
      expect(result).toContain('vividmediacheshire.com');
    });

    it('should normalize HTTP to HTTPS', () => {
      const httpUrl = 'http://vividmediacheshire.com/page/';
      const result = validateUrl(httpUrl, testDomain);
      
      expect(result).toBe('https://vividmediacheshire.com/page/');
    });

    it('should add trailing slash if missing', () => {
      const noTrailingSlash = 'https://vividmediacheshire.com/page';
      const result = validateUrl(noTrailingSlash, testDomain);
      
      expect(result).toBe('https://vividmediacheshire.com/page/');
    });

    it('should preserve trailing slash if present', () => {
      const withTrailingSlash = 'https://vividmediacheshire.com/page/';
      const result = validateUrl(withTrailingSlash, testDomain);
      
      expect(result).toBe('https://vividmediacheshire.com/page/');
    });

    it('should handle invalid URL formats', () => {
      const invalidUrls = [
        { url: 'not-a-url', reason: 'not a valid URL format' },
        { url: 'javascript:alert(1)', reason: 'javascript protocol' },
        { url: '', reason: 'empty string' },
        { url: 'https://', reason: 'incomplete URL' }
      ];

      invalidUrls.forEach(({ url, reason }) => {
        const result = validateUrl(url, testDomain);
        expect(result, `Expected ${url} (${reason}) to be null`).toBeNull();
      });
    });

    it('should normalize non-HTTPS protocols to HTTPS', () => {
      // FTP URLs with correct domain should be normalized to HTTPS
      const ftpUrl = 'ftp://vividmediacheshire.com/';
      const result = validateUrl(ftpUrl, testDomain);
      
      expect(result).toBe('https://vividmediacheshire.com/');
    });

    it('should be case-insensitive for domain matching', () => {
      const upperCaseUrl = 'https://VIVIDMEDIACHESHIRE.COM/page/';
      const result = validateUrl(upperCaseUrl, testDomain);
      
      expect(result).not.toBeNull();
      // The implementation normalizes the hostname to lowercase
      expect(result).toBe('https://vividmediacheshire.com/page/');
    });
  });

  describe('shouldIndex', () => {
    it('should exclude /thank-you/ pages', () => {
      const thankYouUrls = [
        'https://vividmediacheshire.com/thank-you/',
        'https://vividmediacheshire.com/contact/thank-you/',
        'https://vividmediacheshire.com/thank-you/success/'
      ];

      thankYouUrls.forEach(url => {
        const result = shouldIndex(url, ['/thank-you/']);
        expect(result).toBe(false);
      });
    });

    it('should include pages that do not match exclusion paths', () => {
      const validUrls = [
        'https://vividmediacheshire.com/',
        'https://vividmediacheshire.com/services/',
        'https://vividmediacheshire.com/blog/',
        'https://vividmediacheshire.com/contact/'
      ];

      validUrls.forEach(url => {
        const result = shouldIndex(url, ['/thank-you/']);
        expect(result).toBe(true);
      });
    });

    it('should handle multiple exclusion paths', () => {
      const excludePaths = ['/thank-you/', '/admin/', '/private/'];
      
      expect(shouldIndex('https://vividmediacheshire.com/admin/', excludePaths)).toBe(false);
      expect(shouldIndex('https://vividmediacheshire.com/private/data/', excludePaths)).toBe(false);
      expect(shouldIndex('https://vividmediacheshire.com/thank-you/', excludePaths)).toBe(false);
      expect(shouldIndex('https://vividmediacheshire.com/public/', excludePaths)).toBe(true);
    });

    it('should handle empty exclusion paths array', () => {
      const url = 'https://vividmediacheshire.com/any-page/';
      const result = shouldIndex(url, []);
      
      expect(result).toBe(true);
    });

    it('should return false for invalid URLs', () => {
      const invalidUrl = 'not-a-valid-url';
      const result = shouldIndex(invalidUrl, ['/thank-you/']);
      
      expect(result).toBe(false);
    });
  });

  describe('collectUrls', () => {
    it('should collect and process URLs from sitemap', async () => {
      const sampleXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://vividmediacheshire.com/</loc>
  </url>
  <url>
    <loc>https://vividmediacheshire.com/services/</loc>
  </url>
  <url>
    <loc>https://vividmediacheshire.com/blog/</loc>
  </url>
</urlset>`;

      await fs.writeFile(testSitemapPath, sampleXml, 'utf-8');

      const urls = await collectUrls({
        domain: testDomain,
        sitemapPath: testSitemapPath
      });

      expect(urls).toHaveLength(3);
      expect(urls).toContain('https://vividmediacheshire.com/');
      expect(urls).toContain('https://vividmediacheshire.com/services/');
      expect(urls).toContain('https://vividmediacheshire.com/blog/');
    });

    it('should exclude /thank-you/ pages from collection', async () => {
      const sampleXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://vividmediacheshire.com/</loc>
  </url>
  <url>
    <loc>https://vividmediacheshire.com/thank-you/</loc>
  </url>
  <url>
    <loc>https://vividmediacheshire.com/services/</loc>
  </url>
</urlset>`;

      await fs.writeFile(testSitemapPath, sampleXml, 'utf-8');

      const urls = await collectUrls({
        domain: testDomain,
        sitemapPath: testSitemapPath
      });

      expect(urls).toHaveLength(2);
      expect(urls).not.toContain('https://vividmediacheshire.com/thank-you/');
      expect(urls).toContain('https://vividmediacheshire.com/');
      expect(urls).toContain('https://vividmediacheshire.com/services/');
    });

    it('should reject URLs with mismatched domains', async () => {
      const sampleXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://vividmediacheshire.com/</loc>
  </url>
  <url>
    <loc>https://wrongdomain.com/page/</loc>
  </url>
  <url>
    <loc>https://vividmediacheshire.com/services/</loc>
  </url>
</urlset>`;

      await fs.writeFile(testSitemapPath, sampleXml, 'utf-8');

      const urls = await collectUrls({
        domain: testDomain,
        sitemapPath: testSitemapPath
      });

      expect(urls).toHaveLength(2);
      expect(urls).not.toContain('https://wrongdomain.com/page/');
      expect(urls).toContain('https://vividmediacheshire.com/');
      expect(urls).toContain('https://vividmediacheshire.com/services/');
    });

    it('should handle empty sitemap', async () => {
      const emptyXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`;

      await fs.writeFile(testSitemapPath, emptyXml, 'utf-8');

      const urls = await collectUrls({
        domain: testDomain,
        sitemapPath: testSitemapPath
      });

      expect(urls).toHaveLength(0);
      expect(urls).toEqual([]);
    });

    it('should deduplicate URLs', async () => {
      const sampleXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://vividmediacheshire.com/</loc>
  </url>
  <url>
    <loc>https://vividmediacheshire.com/</loc>
  </url>
  <url>
    <loc>https://vividmediacheshire.com/services/</loc>
  </url>
  <url>
    <loc>https://vividmediacheshire.com/services/</loc>
  </url>
</urlset>`;

      await fs.writeFile(testSitemapPath, sampleXml, 'utf-8');

      const urls = await collectUrls({
        domain: testDomain,
        sitemapPath: testSitemapPath
      });

      expect(urls).toHaveLength(2);
      expect(urls).toContain('https://vividmediacheshire.com/');
      expect(urls).toContain('https://vividmediacheshire.com/services/');
    });

    it('should normalize URLs (HTTP to HTTPS, add trailing slash)', async () => {
      const sampleXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>http://vividmediacheshire.com/page</loc>
  </url>
  <url>
    <loc>https://vividmediacheshire.com/other</loc>
  </url>
</urlset>`;

      await fs.writeFile(testSitemapPath, sampleXml, 'utf-8');

      const urls = await collectUrls({
        domain: testDomain,
        sitemapPath: testSitemapPath
      });

      expect(urls).toHaveLength(2);
      expect(urls).toContain('https://vividmediacheshire.com/page/');
      expect(urls).toContain('https://vividmediacheshire.com/other/');
    });

    it('should return sorted URLs', async () => {
      const sampleXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://vividmediacheshire.com/zebra/</loc>
  </url>
  <url>
    <loc>https://vividmediacheshire.com/apple/</loc>
  </url>
  <url>
    <loc>https://vividmediacheshire.com/banana/</loc>
  </url>
</urlset>`;

      await fs.writeFile(testSitemapPath, sampleXml, 'utf-8');

      const urls = await collectUrls({
        domain: testDomain,
        sitemapPath: testSitemapPath
      });

      expect(urls).toHaveLength(3);
      expect(urls[0]).toBe('https://vividmediacheshire.com/apple/');
      expect(urls[1]).toBe('https://vividmediacheshire.com/banana/');
      expect(urls[2]).toBe('https://vividmediacheshire.com/zebra/');
    });

    it('should throw error when domain is not provided', async () => {
      const sampleXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://vividmediacheshire.com/</loc>
  </url>
</urlset>`;

      await fs.writeFile(testSitemapPath, sampleXml, 'utf-8');

      await expect(collectUrls({
        domain: '',
        sitemapPath: testSitemapPath
      })).rejects.toThrow('Domain is required');
    });

    it('should throw error when sitemap file does not exist', async () => {
      await expect(collectUrls({
        domain: testDomain,
        sitemapPath: 'non-existent-sitemap.xml'
      })).rejects.toThrow();
    });

    it('should use custom exclude paths', async () => {
      const sampleXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://vividmediacheshire.com/</loc>
  </url>
  <url>
    <loc>https://vividmediacheshire.com/admin/</loc>
  </url>
  <url>
    <loc>https://vividmediacheshire.com/services/</loc>
  </url>
</urlset>`;

      await fs.writeFile(testSitemapPath, sampleXml, 'utf-8');

      const urls = await collectUrls({
        domain: testDomain,
        sitemapPath: testSitemapPath,
        excludePaths: ['/admin/']
      });

      expect(urls).toHaveLength(2);
      expect(urls).not.toContain('https://vividmediacheshire.com/admin/');
      expect(urls).toContain('https://vividmediacheshire.com/');
      expect(urls).toContain('https://vividmediacheshire.com/services/');
    });
  });
});
