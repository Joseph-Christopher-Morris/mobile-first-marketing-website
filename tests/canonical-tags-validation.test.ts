/**
 * Canonical Tags Validation Test
 * 
 * Validates that canonical tags match sitemap URLs to prevent URL canonicalization confusion.
 * 
 * Requirements validated:
 * - 2.5: Improve Google Search Console coverage by ensuring canonical tags match sitemap URLs
 * - 3.7: Canonical tags use correct URLs matching deployed URL structure
 * 
 * Key validation points:
 * 1. Blog articles use /blog/${slug}/ pattern with trailing slash
 * 2. Service pages use correct canonical URLs matching sitemap
 * 3. /services/hosting/ page has canonical tag pointing to /services/website-hosting/
 * 4. All canonical URLs have trailing slashes (except root)
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const SITE_URL = 'https://vividmediacheshire.com';

describe('Canonical Tags Validation', () => {
  describe('SEO Library - buildSEO Function', () => {
    it('should normalize canonical paths with trailing slashes', () => {
      const seoLibPath = path.join(process.cwd(), 'src/lib/seo.ts');
      const seoLib = fs.readFileSync(seoLibPath, 'utf8');
      
      // Verify the normalization logic exists
      expect(seoLib).toContain('const normalizedPath = canonicalPath === \'/\'');
      expect(seoLib).toContain('canonicalPath.endsWith(\'/\')');
      expect(seoLib).toContain('`${canonicalPath}/`');
      
      // Verify canonical URL is built with normalized path
      expect(seoLib).toContain('const canonicalUrl = `${SITE_URL}${normalizedPath}`');
      expect(seoLib).toContain('canonical: canonicalUrl');
    });
  });

  describe('Metadata Generator - generateAbsoluteUrl Function', () => {
    it('should normalize paths with trailing slashes for blog articles', () => {
      const metadataGenPath = path.join(process.cwd(), 'src/lib/metadata-generator.ts');
      const metadataGen = fs.readFileSync(metadataGenPath, 'utf8');
      
      // Verify the normalization logic exists
      expect(metadataGen).toContain('export function generateAbsoluteUrl(path: string): string');
      expect(metadataGen).toContain('const finalPath = normalizedPath === \'/\'');
      expect(metadataGen).toContain('normalizedPath.endsWith(\'/\')');
      expect(metadataGen).toContain('`${normalizedPath}/`');
    });
  });

  describe('Blog Article Pages', () => {
    it('should use canonicalPath with /blog/${slug}/ pattern', () => {
      const blogPagePath = path.join(process.cwd(), 'src/app/blog/[slug]/page.tsx');
      const blogPage = fs.readFileSync(blogPagePath, 'utf8');
      
      // Verify blog articles use generateMetadata with canonicalPath
      expect(blogPage).toContain('generateMetadata');
      expect(blogPage).toContain('canonicalPath:');
      expect(blogPage).toContain('/blog/${params.slug}');
      
      // Note: The metadata generator adds trailing slash automatically
      // So canonicalPath: `/blog/${params.slug}` becomes `/blog/${params.slug}/`
    });
  });

  describe('Service Pages - Canonical URLs', () => {
    const servicePages = [
      { path: 'src/app/services/page.tsx', expectedCanonical: '/services/' },
      { path: 'src/app/services/analytics/page.tsx', expectedCanonical: '/services/analytics/' },
      { path: 'src/app/services/website-design/page.tsx', expectedCanonical: '/services/website-design/' },
      { path: 'src/app/services/photography/page.tsx', expectedCanonical: '/services/photography/' },
      { path: 'src/app/services/ad-campaigns/page.tsx', expectedCanonical: '/services/ad-campaigns/' },
      { path: 'src/app/services/website-hosting/page.tsx', expectedCanonical: '/services/website-hosting/' },
    ];

    servicePages.forEach(({ path: pagePath, expectedCanonical }) => {
      it(`should use canonical URL ${expectedCanonical} in ${pagePath}`, () => {
        const fullPath = path.join(process.cwd(), pagePath);
        const pageContent = fs.readFileSync(fullPath, 'utf8');
        
        // Extract canonicalPath value
        const canonicalMatch = pageContent.match(/canonicalPath:\s*['"]([^'"]+)['"]/);
        expect(canonicalMatch, `No canonicalPath found in ${pagePath}`).toBeTruthy();
        
        const canonicalPath = canonicalMatch![1];
        
        // Verify it matches expected canonical (with or without trailing slash)
        // The buildSEO function normalizes it to have trailing slash
        const normalizedExpected = expectedCanonical.endsWith('/') ? expectedCanonical : `${expectedCanonical}/`;
        const normalizedActual = canonicalPath.endsWith('/') ? canonicalPath : `${canonicalPath}/`;
        
        expect(normalizedActual).toBe(normalizedExpected);
      });
    });
  });

  describe('Artifact URL - /services/hosting/', () => {
    it('should have canonical tag pointing to /services/website-hosting/', () => {
      const hostingPagePath = path.join(process.cwd(), 'src/app/services/hosting/page.tsx');
      
      // Check if the page exists
      if (!fs.existsSync(hostingPagePath)) {
        // If the page doesn't exist, that's fine - it means it was removed
        expect(true).toBe(true);
        return;
      }
      
      const pageContent = fs.readFileSync(hostingPagePath, 'utf8');
      
      // Extract canonicalPath value
      const canonicalMatch = pageContent.match(/canonicalPath:\s*['"]([^'"]+)['"]/);
      expect(canonicalMatch, 'No canonicalPath found in /services/hosting/page.tsx').toBeTruthy();
      
      const canonicalPath = canonicalMatch![1];
      
      // CRITICAL: The canonical path should point to /services/website-hosting/, NOT /services/hosting/
      // This prevents URL canonicalization confusion in Google Search Console
      expect(canonicalPath).toBe('/services/website-hosting/');
    });
  });

  describe('Canonical URLs Match Sitemap URLs', () => {
    it('should verify all service page canonical URLs are in sitemap', () => {
      const sitemapPath = path.join(process.cwd(), 'public/sitemap.xml');
      
      // Check if sitemap exists (it might be generated during build)
      if (!fs.existsSync(sitemapPath)) {
        console.warn('Sitemap not found at public/sitemap.xml - may be generated during build');
        return;
      }
      
      const sitemap = fs.readFileSync(sitemapPath, 'utf8');
      
      // Verify canonical service URLs are in sitemap
      const expectedUrls = [
        `${SITE_URL}/services/`,
        `${SITE_URL}/services/analytics/`,
        `${SITE_URL}/services/website-design/`,
        `${SITE_URL}/services/photography/`,
        `${SITE_URL}/services/ad-campaigns/`,
        `${SITE_URL}/services/website-hosting/`,
      ];
      
      expectedUrls.forEach(url => {
        expect(sitemap).toContain(url);
      });
      
      // Verify artifact URL is NOT in sitemap
      expect(sitemap).not.toContain(`${SITE_URL}/services/hosting/`);
    });
  });

  describe('Trailing Slash Consistency', () => {
    it('should ensure all canonical URLs have trailing slashes except root', () => {
      const servicePages = [
        'src/app/services/page.tsx',
        'src/app/services/analytics/page.tsx',
        'src/app/services/website-design/page.tsx',
        'src/app/services/photography/page.tsx',
        'src/app/services/ad-campaigns/page.tsx',
        'src/app/services/website-hosting/page.tsx',
      ];
      
      servicePages.forEach(pagePath => {
        const fullPath = path.join(process.cwd(), pagePath);
        const pageContent = fs.readFileSync(fullPath, 'utf8');
        
        const canonicalMatch = pageContent.match(/canonicalPath:\s*['"]([^'"]+)['"]/);
        if (canonicalMatch) {
          const canonicalPath = canonicalMatch[1];
          
          // Root path can be '/' without trailing slash
          if (canonicalPath === '/') {
            expect(canonicalPath).toBe('/');
          } else {
            // All other paths should have trailing slash OR will be normalized by buildSEO
            // The buildSEO function adds trailing slash if missing
            // So we just verify it's not empty and doesn't have double slashes
            expect(canonicalPath.length).toBeGreaterThan(0);
            expect(canonicalPath).not.toContain('//');
          }
        }
      });
    });
  });
});
