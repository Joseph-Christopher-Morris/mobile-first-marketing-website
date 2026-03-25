import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const {
  discoverBlogArticles,
  generateBlogUrls,
  filterExcludedUrls,
  generateXML,
  STATIC_URLS,
  EXCLUDED_URLS,
} = require('../scripts/generate-sitemap.js');

describe('generate-sitemap.js', () => {
  describe('discoverBlogArticles', () => {
    it('should discover all .ts files in src/content/blog/', () => {
      const blogSlugs = discoverBlogArticles();
      
      // Should find 14 blog articles
      expect(blogSlugs.length).toBe(14);
      
      // Should not include .ts extension
      blogSlugs.forEach(slug => {
        expect(slug).not.toContain('.ts');
      });
      
      // Should include known blog articles
      expect(blogSlugs).toContain('stock-photography-breakthrough');
      expect(blogSlugs).toContain('exploring-istock-data-deepmeta');
    });
  });

  describe('generateBlogUrls', () => {
    it('should generate blog URLs with correct pattern', () => {
      const slugs = ['test-article', 'another-article'];
      const urls = generateBlogUrls(slugs);
      
      expect(urls).toEqual([
        { loc: '/blog/test-article/', priority: '0.7', changefreq: 'monthly' },
        { loc: '/blog/another-article/', priority: '0.7', changefreq: 'monthly' },
      ]);
    });

    it('should handle empty array', () => {
      const urls = generateBlogUrls([]);
      expect(urls).toEqual([]);
    });

    it('should handle slugs with special characters', () => {
      const slugs = ['test-&-demo', 'article-with-numbers-123'];
      const urls = generateBlogUrls(slugs);
      
      expect(urls[0].loc).toBe('/blog/test-&-demo/');
      expect(urls[1].loc).toBe('/blog/article-with-numbers-123/');
    });
  });

  describe('filterExcludedUrls', () => {
    it('should exclude artifact URL /services/hosting/', () => {
      const urls = [
        { loc: '/services/website-hosting/', priority: 0.8, changefreq: 'monthly' },
        { loc: '/services/hosting/', priority: 0.8, changefreq: 'monthly' },
        { loc: '/about/', priority: 0.7, changefreq: 'monthly' },
      ];
      
      const filtered = filterExcludedUrls(urls);
      
      expect(filtered.length).toBe(2);
      expect(filtered.find(u => u.loc === '/services/hosting/')).toBeUndefined();
      expect(filtered.find(u => u.loc === '/services/website-hosting/')).toBeDefined();
    });

    it('should not exclude canonical URL /services/website-hosting/', () => {
      const urls = [
        { loc: '/services/website-hosting/', priority: 0.8, changefreq: 'monthly' },
      ];
      
      const filtered = filterExcludedUrls(urls);
      
      expect(filtered.length).toBe(1);
      expect(filtered[0].loc).toBe('/services/website-hosting/');
    });
  });

  describe('generateXML', () => {
    it('should generate valid XML with proper namespace', () => {
      const urls = [
        { loc: '/', priority: 1, changefreq: 'weekly' },
        { loc: '/about/', priority: 0.7, changefreq: 'monthly' },
      ];
      
      const xml = generateXML(urls);
      
      expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
      expect(xml).toContain('<loc>https://vividmediacheshire.com/</loc>');
      expect(xml).toContain('<loc>https://vividmediacheshire.com/about/</loc>');
      expect(xml).toContain('<priority>1</priority>');
      expect(xml).toContain('<priority>0.7</priority>');
      expect(xml).toContain('<changefreq>weekly</changefreq>');
      expect(xml).toContain('<changefreq>monthly</changefreq>');
    });

    it('should include lastmod with current date', () => {
      const urls = [{ loc: '/', priority: 1, changefreq: 'weekly' }];
      const xml = generateXML(urls);
      
      const today = new Date().toISOString().split('T')[0];
      expect(xml).toContain(`<lastmod>${today}</lastmod>`);
    });

    it('should handle empty URL array', () => {
      const xml = generateXML([]);
      
      expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
      expect(xml).toContain('</urlset>');
    });
  });

  describe('STATIC_URLS', () => {
    it('should include all required top-level pages', () => {
      const topLevelPages = ['/', '/services/', '/about/', '/contact/', '/pricing/', '/blog/', '/free-audit/', '/privacy-policy/'];
      
      topLevelPages.forEach(page => {
        const found = STATIC_URLS.find(u => u.loc === page);
        expect(found).toBeDefined();
      });
    });

    it('should include all service pages', () => {
      const servicePages = [
        '/services/website-design/',
        '/services/website-hosting/',
        '/services/ad-campaigns/',
        '/services/analytics/',
        '/services/photography/',
      ];
      
      servicePages.forEach(page => {
        const found = STATIC_URLS.find(u => u.loc === page);
        expect(found).toBeDefined();
      });
    });

    it('should NOT include artifact URL /services/hosting/', () => {
      const found = STATIC_URLS.find(u => u.loc === '/services/hosting/');
      expect(found).toBeUndefined();
    });
  });

  describe('EXCLUDED_URLS', () => {
    it('should include artifact URL /services/hosting/', () => {
      expect(EXCLUDED_URLS).toContain('/services/hosting/');
    });
  });

  describe('Integration: Full sitemap generation', () => {
    it('should generate sitemap with all blog articles and no artifact URLs', () => {
      // Discover blog articles
      const blogSlugs = discoverBlogArticles();
      const blogUrls = generateBlogUrls(blogSlugs);
      
      // Combine with static URLs
      const allUrls = [...STATIC_URLS, ...blogUrls];
      
      // Filter excluded URLs
      const filteredUrls = filterExcludedUrls(allUrls);
      
      // Verify counts
      expect(blogUrls.length).toBe(14);
      expect(STATIC_URLS.length).toBe(13);
      expect(filteredUrls.length).toBe(27); // 13 static + 14 blog
      
      // Verify no artifact URL
      expect(filteredUrls.find(u => u.loc === '/services/hosting/')).toBeUndefined();
      
      // Verify canonical URL present
      expect(filteredUrls.find(u => u.loc === '/services/website-hosting/')).toBeDefined();
      
      // Generate XML
      const xml = generateXML(filteredUrls);
      
      // Verify XML structure
      expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
      
      // Verify blog URLs in XML
      expect(xml).toContain('/blog/stock-photography-breakthrough/');
      expect(xml).toContain('/blog/exploring-istock-data-deepmeta/');
      
      // Verify no artifact URL in XML
      expect(xml).not.toContain('/services/hosting/');
    });
  });
});
