import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';

describe('Sitemap Cloudflare Cache Fix Verification', () => {
  const CANONICAL_DOMAIN = 'https://vividmediacheshire.com';
  const CLOUDFRONT_DOMAIN = 'https://d15sc9fc739ev2.cloudfront.net';

  const fetchSitemap = (domain: string): string => {
    try {
      return execSync(`curl -s ${domain}/sitemap.xml`, {
        encoding: 'utf-8',
        timeout: 10000,
      });
    } catch (error) {
      throw new Error(`Failed to fetch sitemap from ${domain}: ${error}`);
    }
  };

  describe('Canonical Domain Sitemap', () => {
    it('should be accessible at vividmediacheshire.com', () => {
      const sitemap = fetchSitemap(CANONICAL_DOMAIN);
      expect(sitemap).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(sitemap).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    });

    it('should have current lastmod date (not 2026-02-20)', () => {
      const sitemap = fetchSitemap(CANONICAL_DOMAIN);
      const oldDate = '2026-02-20';
      
      // Count occurrences of old date
      const oldDateCount = (sitemap.match(new RegExp(oldDate, 'g')) || []).length;
      
      expect(oldDateCount).toBe(0);
    });

    it('should include blog article URLs', () => {
      const sitemap = fetchSitemap(CANONICAL_DOMAIN);
      
      const requiredBlogPosts = [
        'https://vividmediacheshire.com/blog/exploring-istock-data-deepmeta/',
        'https://vividmediacheshire.com/blog/flyer-marketing-case-study-part-1/',
        'https://vividmediacheshire.com/blog/flyer-marketing-case-study-part-2/',
        'https://vividmediacheshire.com/blog/ebay-model-ford-collection-part-1/',
      ];

      for (const url of requiredBlogPosts) {
        expect(sitemap).toContain(url);
      }
    });

    it('should NOT include /services/hosting/ URL', () => {
      const sitemap = fetchSitemap(CANONICAL_DOMAIN);
      expect(sitemap).not.toContain('https://vividmediacheshire.com/services/hosting/');
    });

    it('should have at least 14 blog article URLs', () => {
      const sitemap = fetchSitemap(CANONICAL_DOMAIN);
      const blogUrlMatches = sitemap.match(/https:\/\/vividmediacheshire\.com\/blog\/[^<]+\//g) || [];
      
      // Filter out the /blog/ index page
      const blogArticles = blogUrlMatches.filter(url => url !== 'https://vividmediacheshire.com/blog/');
      
      expect(blogArticles.length).toBeGreaterThanOrEqual(14);
    });

    it('should have at least 25 total URLs', () => {
      const sitemap = fetchSitemap(CANONICAL_DOMAIN);
      const urlMatches = sitemap.match(/<loc>/g) || [];
      
      expect(urlMatches.length).toBeGreaterThanOrEqual(25);
    });
  });

  describe('CloudFront Domain Sitemap', () => {
    it('should match canonical domain sitemap structure', () => {
      const canonicalSitemap = fetchSitemap(CANONICAL_DOMAIN);
      const cloudfrontSitemap = fetchSitemap(CLOUDFRONT_DOMAIN);

      // Extract URL counts
      const canonicalUrls = (canonicalSitemap.match(/<loc>/g) || []).length;
      const cloudfrontUrls = (cloudfrontSitemap.match(/<loc>/g) || []).length;

      expect(canonicalUrls).toBe(cloudfrontUrls);
    });

    it('should have same blog articles as canonical domain', () => {
      const canonicalSitemap = fetchSitemap(CANONICAL_DOMAIN);
      const cloudfrontSitemap = fetchSitemap(CLOUDFRONT_DOMAIN);

      const canonicalBlogUrls = canonicalSitemap.match(/\/blog\/[^<]+\//g) || [];
      const cloudfrontBlogUrls = cloudfrontSitemap.match(/\/blog\/[^<]+\//g) || [];

      expect(canonicalBlogUrls.length).toBe(cloudfrontBlogUrls.length);
    });
  });

  describe('Cache Headers', () => {
    it('should show Cloudflare is active on canonical domain', () => {
      try {
        const headers = execSync(
          `curl -sI ${CANONICAL_DOMAIN}/sitemap.xml | grep -i "server\\|cf-"`,
          { encoding: 'utf-8', timeout: 10000 }
        );

        expect(headers.toLowerCase()).toMatch(/server.*cloudflare|cf-cache-status|cf-ray/);
      } catch (error) {
        // If grep finds nothing, it exits with code 1
        // This test should fail if no Cloudflare headers found
        throw new Error('No Cloudflare headers found - is Cloudflare proxy disabled?');
      }
    });

    it('should show CloudFront is active on CloudFront domain', () => {
      try {
        const headers = execSync(
          `curl -sI ${CLOUDFRONT_DOMAIN}/sitemap.xml | grep -i "x-cache\\|via"`,
          { encoding: 'utf-8', timeout: 10000 }
        );

        expect(headers.toLowerCase()).toMatch(/x-cache.*cloudfront|via.*cloudfront/);
      } catch (error) {
        throw new Error('No CloudFront headers found');
      }
    });
  });

  describe('Sitemap Content Quality', () => {
    it('should have valid XML structure', () => {
      const sitemap = fetchSitemap(CANONICAL_DOMAIN);
      
      expect(sitemap).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(sitemap).toContain('<urlset');
      expect(sitemap).toContain('</urlset>');
      expect(sitemap).toContain('<url>');
      expect(sitemap).toContain('</url>');
    });

    it('should have required elements for each URL', () => {
      const sitemap = fetchSitemap(CANONICAL_DOMAIN);
      
      const locCount = (sitemap.match(/<loc>/g) || []).length;
      const lastmodCount = (sitemap.match(/<lastmod>/g) || []).length;
      const changefreqCount = (sitemap.match(/<changefreq>/g) || []).length;
      const priorityCount = (sitemap.match(/<priority>/g) || []).length;

      // All URLs should have all required elements
      expect(locCount).toBe(lastmodCount);
      expect(locCount).toBe(changefreqCount);
      expect(locCount).toBe(priorityCount);
    });

    it('should use correct domain in all URLs', () => {
      const sitemap = fetchSitemap(CANONICAL_DOMAIN);
      
      // Should not contain CloudFront domain
      expect(sitemap).not.toContain('d15sc9fc739ev2.cloudfront.net');
      
      // Should contain canonical domain
      expect(sitemap).toContain('vividmediacheshire.com');
    });

    it('should have proper priority values', () => {
      const sitemap = fetchSitemap(CANONICAL_DOMAIN);
      
      // Homepage should have priority 1.0
      expect(sitemap).toMatch(/<loc>https:\/\/vividmediacheshire\.com\/<\/loc>[\s\S]*?<priority>1\.0<\/priority>/);
      
      // Services should have priority 0.9
      expect(sitemap).toMatch(/<loc>https:\/\/vividmediacheshire\.com\/services\/<\/loc>[\s\S]*?<priority>0\.9<\/priority>/);
    });
  });

  describe('Deprecated URLs', () => {
    it('should not include any deprecated service URLs', () => {
      const sitemap = fetchSitemap(CANONICAL_DOMAIN);
      
      const deprecatedUrls = [
        '/services/hosting/',
        '/services/web-hosting/',
        '/hosting/',
      ];

      for (const url of deprecatedUrls) {
        expect(sitemap).not.toContain(url);
      }
    });
  });

  describe('Blog Article Coverage', () => {
    it('should include all expected blog article patterns', () => {
      const sitemap = fetchSitemap(CANONICAL_DOMAIN);
      
      const expectedPatterns = [
        '/blog/exploring-istock-data-deepmeta/',
        '/blog/flyer-marketing-case-study-part-1/',
        '/blog/flyer-marketing-case-study-part-2/',
        '/blog/ebay-model-ford-collection-part-1/',
        '/blog/ebay-photography-workflow-part-2/',
        '/blog/ebay-repeat-buyers-part-4/',
        '/blog/ebay-business-side-part-5/',
      ];

      for (const pattern of expectedPatterns) {
        expect(sitemap).toContain(pattern);
      }
    });
  });
});
