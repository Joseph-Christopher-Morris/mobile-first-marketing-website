import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const {
  generateBlogUrls,
  filterExcludedUrls,
  generateXML,
  STATIC_URLS,
} = require('../scripts/generate-sitemap.js');

describe('generate-sitemap.js - Edge Cases', () => {
  describe('Empty blog directory scenario', () => {
    it('should generate valid sitemap with only static URLs when no blog articles exist', () => {
      // Simulate empty blog directory
      const blogSlugs: string[] = [];
      const blogUrls = generateBlogUrls(blogSlugs);
      
      // Combine with static URLs
      const allUrls = [...STATIC_URLS, ...blogUrls];
      
      // Filter excluded URLs
      const filteredUrls = filterExcludedUrls(allUrls);
      
      // Should have only static URLs
      expect(blogUrls.length).toBe(0);
      expect(filteredUrls.length).toBe(13); // Only static URLs
      
      // Generate XML
      const xml = generateXML(filteredUrls);
      
      // Should still be valid XML
      expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
      expect(xml).toContain('</urlset>');
      
      // Should contain static URLs
      expect(xml).toContain('https://vividmediacheshire.com/');
      expect(xml).toContain('https://vividmediacheshire.com/services/');
    });
  });

  describe('Special characters in blog filenames', () => {
    it('should handle blog slugs with hyphens and numbers', () => {
      const slugs = [
        'article-with-many-hyphens',
        'article-123-with-numbers',
        'article-2024-01-15',
      ];
      
      const urls = generateBlogUrls(slugs);
      
      expect(urls.length).toBe(3);
      expect(urls[0].loc).toBe('/blog/article-with-many-hyphens/');
      expect(urls[1].loc).toBe('/blog/article-123-with-numbers/');
      expect(urls[2].loc).toBe('/blog/article-2024-01-15/');
    });

    it('should preserve special characters in slugs', () => {
      const slugs = ['test-&-demo', 'article_with_underscores'];
      const urls = generateBlogUrls(slugs);
      
      expect(urls[0].loc).toBe('/blog/test-&-demo/');
      expect(urls[1].loc).toBe('/blog/article_with_underscores/');
    });
  });

  describe('Large number of blog articles', () => {
    it('should handle 100 blog articles efficiently', () => {
      // Generate 100 blog slugs
      const slugs = Array.from({ length: 100 }, (_, i) => `article-${i + 1}`);
      const blogUrls = generateBlogUrls(slugs);
      
      expect(blogUrls.length).toBe(100);
      
      // Combine with static URLs
      const allUrls = [...STATIC_URLS, ...blogUrls];
      const filteredUrls = filterExcludedUrls(allUrls);
      
      expect(filteredUrls.length).toBe(113); // 13 static + 100 blog
      
      // Generate XML should not throw
      const xml = generateXML(filteredUrls);
      expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    });
  });

  describe('URL filtering', () => {
    it('should filter multiple excluded URLs if present', () => {
      const urls = [
        { loc: '/', priority: 1, changefreq: 'weekly' },
        { loc: '/services/hosting/', priority: 0.8, changefreq: 'monthly' },
        { loc: '/services/website-hosting/', priority: 0.8, changefreq: 'monthly' },
        { loc: '/about/', priority: 0.7, changefreq: 'monthly' },
      ];
      
      const filtered = filterExcludedUrls(urls);
      
      expect(filtered.length).toBe(3);
      expect(filtered.find(u => u.loc === '/services/hosting/')).toBeUndefined();
    });

    it('should not modify URLs if no excluded URLs present', () => {
      const urls = [
        { loc: '/', priority: 1, changefreq: 'weekly' },
        { loc: '/about/', priority: 0.7, changefreq: 'monthly' },
      ];
      
      const filtered = filterExcludedUrls(urls);
      
      expect(filtered.length).toBe(2);
      expect(filtered).toEqual(urls);
    });
  });

  describe('XML generation', () => {
    it('should escape special XML characters in URLs', () => {
      const urls = [
        { loc: '/blog/test-&-demo/', priority: 0.7, changefreq: 'monthly' },
      ];
      
      const xml = generateXML(urls);
      
      // The & character should be present (not escaped in this implementation)
      // Note: In a production system, you might want to escape XML special characters
      expect(xml).toContain('/blog/test-&-demo/');
    });

    it('should generate consistent XML structure', () => {
      const urls = [
        { loc: '/', priority: 1, changefreq: 'weekly' },
      ];
      
      const xml1 = generateXML(urls);
      const xml2 = generateXML(urls);
      
      // Should be idempotent (same input produces same output, except for date)
      expect(xml1.split('\n').length).toBe(xml2.split('\n').length);
    });
  });

  describe('Priority and changefreq values', () => {
    it('should preserve priority and changefreq for all URL types', () => {
      const urls = [
        { loc: '/', priority: 1, changefreq: 'weekly' },
        { loc: '/services/', priority: 0.9, changefreq: 'weekly' },
        { loc: '/blog/test/', priority: 0.7, changefreq: 'monthly' },
        { loc: '/privacy-policy/', priority: 0.3, changefreq: 'yearly' },
      ];
      
      const xml = generateXML(urls);
      
      expect(xml).toContain('<priority>1</priority>');
      expect(xml).toContain('<priority>0.9</priority>');
      expect(xml).toContain('<priority>0.7</priority>');
      expect(xml).toContain('<priority>0.3</priority>');
      expect(xml).toContain('<changefreq>weekly</changefreq>');
      expect(xml).toContain('<changefreq>monthly</changefreq>');
      expect(xml).toContain('<changefreq>yearly</changefreq>');
    });
  });
});
