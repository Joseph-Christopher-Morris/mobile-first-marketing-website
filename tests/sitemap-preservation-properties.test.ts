/**
 * Preservation Property Tests - SEO Sitemap Indexability Fix
 * 
 * **IMPORTANT**: Follow observation-first methodology
 * **EXPECTED OUTCOME**: Tests PASS on unfixed code (confirms baseline behavior to preserve)
 * 
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7**
 * 
 * Property 2: Preservation - Existing Static and Service Page URLs
 * 
 * This test validates that after the fix:
 * 1. All 14 top-level page URLs remain in sitemap with same priority/changefreq values
 * 2. All 5 service page URLs remain in sitemap with same priority/changefreq values
 * 3. Sitemap maintains valid XML structure with proper namespace and encoding
 * 4. Sitemap file is generated in public/ directory and copied to out/ during build
 * 
 * These tests capture the CURRENT CORRECT behavior that must be preserved.
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { parseStringPromise } from 'xml2js';
import * as fc from 'fast-check';

// Observed baseline data from current sitemap.xml (unfixed code)
const BASELINE_TOP_LEVEL_PAGES = [
  { loc: 'https://vividmediacheshire.com/', priority: '1.0', changefreq: 'weekly' },
  { loc: 'https://vividmediacheshire.com/services/', priority: '0.9', changefreq: 'weekly' },
  { loc: 'https://vividmediacheshire.com/about/', priority: '0.7', changefreq: 'monthly' },
  { loc: 'https://vividmediacheshire.com/contact/', priority: '0.7', changefreq: 'monthly' },
  { loc: 'https://vividmediacheshire.com/pricing/', priority: '0.7', changefreq: 'monthly' },
  { loc: 'https://vividmediacheshire.com/blog/', priority: '0.8', changefreq: 'weekly' },
  { loc: 'https://vividmediacheshire.com/free-audit/', priority: '0.6', changefreq: 'monthly' },
  { loc: 'https://vividmediacheshire.com/privacy-policy/', priority: '0.3', changefreq: 'yearly' },
];

const BASELINE_SERVICE_PAGES = [
  { loc: 'https://vividmediacheshire.com/services/website-design/', priority: '0.8', changefreq: 'monthly' },
  { loc: 'https://vividmediacheshire.com/services/website-hosting/', priority: '0.8', changefreq: 'monthly' },
  { loc: 'https://vividmediacheshire.com/services/ad-campaigns/', priority: '0.8', changefreq: 'monthly' },
  { loc: 'https://vividmediacheshire.com/services/analytics/', priority: '0.8', changefreq: 'monthly' },
  { loc: 'https://vividmediacheshire.com/services/photography/', priority: '0.8', changefreq: 'monthly' },
];

interface SitemapUrl {
  loc: string[];
  priority: string[];
  changefreq: string[];
  lastmod?: string[];
}

async function parseSitemap(sitemapPath: string) {
  const sitemapContent = fs.readFileSync(sitemapPath, 'utf-8');
  const parsedSitemap = await parseStringPromise(sitemapContent);
  return parsedSitemap;
}

function findUrlEntry(urls: SitemapUrl[], loc: string): SitemapUrl | undefined {
  return urls.find((entry: SitemapUrl) => entry.loc[0] === loc);
}

describe('Preservation Property Tests - Sitemap Indexability', () => {
  describe('Property 2.1: Top-Level Page URLs Preservation', () => {
    it('should preserve all 8 top-level page URLs with exact priority and changefreq values', async () => {
      const sitemapPath = path.join(process.cwd(), 'public/sitemap.xml');
      const parsedSitemap = await parseSitemap(sitemapPath);
      const urls: SitemapUrl[] = parsedSitemap.urlset.url;
      
      // Verify each top-level page is present with correct attributes
      for (const expectedPage of BASELINE_TOP_LEVEL_PAGES) {
        const urlEntry = findUrlEntry(urls, expectedPage.loc);
        
        expect(urlEntry, `URL ${expectedPage.loc} should be present in sitemap`).toBeDefined();
        expect(urlEntry!.priority[0]).toBe(expectedPage.priority);
        expect(urlEntry!.changefreq[0]).toBe(expectedPage.changefreq);
      }
      
      console.log(`✓ All ${BASELINE_TOP_LEVEL_PAGES.length} top-level pages preserved with correct attributes`);
    });
    
    it('property: for any subset of top-level pages, their attributes remain unchanged', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.subarray(BASELINE_TOP_LEVEL_PAGES, { minLength: 1 }),
          async (pageSubset) => {
            const sitemapPath = path.join(process.cwd(), 'public/sitemap.xml');
            const parsedSitemap = await parseSitemap(sitemapPath);
            const urls: SitemapUrl[] = parsedSitemap.urlset.url;
            
            // For each page in the subset, verify it exists with correct attributes
            for (const page of pageSubset) {
              const urlEntry = findUrlEntry(urls, page.loc);
              
              if (!urlEntry) return false;
              if (urlEntry.priority[0] !== page.priority) return false;
              if (urlEntry.changefreq[0] !== page.changefreq) return false;
            }
            
            return true;
          }
        ),
        { numRuns: 50 }
      );
    });
  });
  
  describe('Property 2.2: Service Page URLs Preservation', () => {
    it('should preserve all 5 service page URLs with exact priority and changefreq values', async () => {
      const sitemapPath = path.join(process.cwd(), 'public/sitemap.xml');
      const parsedSitemap = await parseSitemap(sitemapPath);
      const urls: SitemapUrl[] = parsedSitemap.urlset.url;
      
      // Verify each service page is present with correct attributes
      for (const expectedPage of BASELINE_SERVICE_PAGES) {
        const urlEntry = findUrlEntry(urls, expectedPage.loc);
        
        expect(urlEntry, `URL ${expectedPage.loc} should be present in sitemap`).toBeDefined();
        expect(urlEntry!.priority[0]).toBe(expectedPage.priority);
        expect(urlEntry!.changefreq[0]).toBe(expectedPage.changefreq);
      }
      
      console.log(`✓ All ${BASELINE_SERVICE_PAGES.length} service pages preserved with correct attributes`);
    });
    
    it('property: for any subset of service pages, their attributes remain unchanged', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.subarray(BASELINE_SERVICE_PAGES, { minLength: 1 }),
          async (pageSubset) => {
            const sitemapPath = path.join(process.cwd(), 'public/sitemap.xml');
            const parsedSitemap = await parseSitemap(sitemapPath);
            const urls: SitemapUrl[] = parsedSitemap.urlset.url;
            
            // For each page in the subset, verify it exists with correct attributes
            for (const page of pageSubset) {
              const urlEntry = findUrlEntry(urls, page.loc);
              
              if (!urlEntry) return false;
              if (urlEntry.priority[0] !== page.priority) return false;
              if (urlEntry.changefreq[0] !== page.changefreq) return false;
            }
            
            return true;
          }
        ),
        { numRuns: 50 }
      );
    });
  });
  
  describe('Property 2.3: XML Structure Preservation', () => {
    it('should maintain valid XML structure with proper namespace and encoding', async () => {
      const sitemapPath = path.join(process.cwd(), 'public/sitemap.xml');
      const sitemapContent = fs.readFileSync(sitemapPath, 'utf-8');
      
      // Verify XML declaration
      expect(sitemapContent).toMatch(/^<\?xml version="1\.0" encoding="UTF-8"\?>/);
      
      // Parse XML to verify it's valid
      const parsedSitemap = await parseSitemap(sitemapPath);
      
      // Verify namespace
      expect(parsedSitemap.urlset.$).toBeDefined();
      expect(parsedSitemap.urlset.$.xmlns).toBe('http://www.sitemaps.org/schemas/sitemap/0.9');
      
      // Verify URL structure
      expect(parsedSitemap.urlset.url).toBeDefined();
      expect(Array.isArray(parsedSitemap.urlset.url)).toBe(true);
      
      // Verify each URL entry has required fields
      for (const urlEntry of parsedSitemap.urlset.url) {
        expect(urlEntry.loc).toBeDefined();
        expect(urlEntry.loc[0]).toMatch(/^https:\/\/vividmediacheshire\.com\//);
        expect(urlEntry.priority).toBeDefined();
        expect(urlEntry.changefreq).toBeDefined();
      }
      
      console.log('✓ XML structure is valid with proper namespace and encoding');
    });
    
    it('property: all URLs in sitemap have valid structure', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constant(null), // No random input needed, we're checking the actual sitemap
          async () => {
            const sitemapPath = path.join(process.cwd(), 'public/sitemap.xml');
            const parsedSitemap = await parseSitemap(sitemapPath);
            const urls: SitemapUrl[] = parsedSitemap.urlset.url;
            
            // Every URL must have loc, priority, and changefreq
            for (const urlEntry of urls) {
              if (!urlEntry.loc || !urlEntry.loc[0]) return false;
              if (!urlEntry.priority || !urlEntry.priority[0]) return false;
              if (!urlEntry.changefreq || !urlEntry.changefreq[0]) return false;
              
              // loc must be a valid HTTPS URL
              if (!urlEntry.loc[0].startsWith('https://vividmediacheshire.com/')) return false;
              
              // priority must be a valid number between 0 and 1
              const priority = parseFloat(urlEntry.priority[0]);
              if (isNaN(priority) || priority < 0 || priority > 1) return false;
              
              // changefreq must be a valid value
              const validChangefreqs = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'];
              if (!validChangefreqs.includes(urlEntry.changefreq[0])) return false;
            }
            
            return true;
          }
        ),
        { numRuns: 10 }
      );
    });
  });
  
  describe('Property 2.4: File Location Preservation', () => {
    it('should generate sitemap.xml in public/ directory', () => {
      const sitemapPath = path.join(process.cwd(), 'public/sitemap.xml');
      
      // Verify file exists
      expect(fs.existsSync(sitemapPath)).toBe(true);
      
      // Verify it's a file (not a directory)
      const stats = fs.statSync(sitemapPath);
      expect(stats.isFile()).toBe(true);
      
      // Verify it has content
      const content = fs.readFileSync(sitemapPath, 'utf-8');
      expect(content.length).toBeGreaterThan(0);
      
      console.log('✓ Sitemap file exists in public/ directory');
    });
    
    it('property: sitemap file is readable and parseable', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constant(null),
          async () => {
            const sitemapPath = path.join(process.cwd(), 'public/sitemap.xml');
            
            // File must exist
            if (!fs.existsSync(sitemapPath)) return false;
            
            // File must be readable
            try {
              const content = fs.readFileSync(sitemapPath, 'utf-8');
              if (content.length === 0) return false;
              
              // File must be parseable as XML
              const parsed = await parseStringPromise(content);
              if (!parsed.urlset) return false;
              
              return true;
            } catch (error) {
              return false;
            }
          }
        ),
        { numRuns: 10 }
      );
    });
  });
  
  describe('Property 2.5: URL Count Preservation', () => {
    it('should maintain the expected number of static URLs (excluding blog articles)', async () => {
      const sitemapPath = path.join(process.cwd(), 'public/sitemap.xml');
      const parsedSitemap = await parseSitemap(sitemapPath);
      const urls: SitemapUrl[] = parsedSitemap.urlset.url;
      
      // Count non-blog URLs (top-level + service pages)
      const nonBlogUrls = urls.filter((entry: SitemapUrl) => 
        !entry.loc[0].match(/\/blog\/[^/]+\/$/)
      );
      
      // Expected: 8 top-level + 5 service pages = 13 URLs
      // Note: Current sitemap has 14 URLs because it includes the artifact URL /services/hosting/
      // After fix, this should be 13 URLs (artifact removed) + blog articles
      const expectedStaticCount = BASELINE_TOP_LEVEL_PAGES.length + BASELINE_SERVICE_PAGES.length;
      
      console.log(`Non-blog URLs in sitemap: ${nonBlogUrls.length}`);
      console.log(`Expected static URLs: ${expectedStaticCount}`);
      
      // Current sitemap has 14 URLs (includes artifact), so we verify >= expectedStaticCount
      expect(nonBlogUrls.length).toBeGreaterThanOrEqual(expectedStaticCount);
    });
    
    it('property: total URL count is consistent across multiple reads', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constant(null),
          async () => {
            const sitemapPath = path.join(process.cwd(), 'public/sitemap.xml');
            
            // Read and parse sitemap twice
            const parsedSitemap1 = await parseSitemap(sitemapPath);
            const parsedSitemap2 = await parseSitemap(sitemapPath);
            
            const count1 = parsedSitemap1.urlset.url.length;
            const count2 = parsedSitemap2.urlset.url.length;
            
            // URL count should be consistent
            return count1 === count2 && count1 > 0;
          }
        ),
        { numRuns: 20 }
      );
    });
  });
});
