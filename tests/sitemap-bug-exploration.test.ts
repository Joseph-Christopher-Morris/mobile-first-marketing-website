/**
 * Bug Condition Exploration Test - SEO Sitemap Indexability Fix
 * 
 * **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
 * **DO NOT attempt to fix the test or the code when it fails**
 * **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
 * 
 * **Validates: Requirements 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 2.4, 2.5**
 * 
 * Property 1: Fault Condition - Sitemap Missing Blog Articles and Contains Artifact URL
 * 
 * This test validates that:
 * 1. The sitemap includes all 14 blog article URLs from src/content/blog/
 * 2. The sitemap does NOT contain the artifact URL /services/hosting/
 * 3. The sitemap DOES contain the canonical URL /services/website-hosting/
 * 
 * Expected counterexamples on unfixed code:
 * - Sitemap contains 0 blog article URLs when 14 blog files exist
 * - Sitemap contains both /services/hosting/ and /services/website-hosting/ URLs
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { parseStringPromise } from 'xml2js';

describe('Bug Condition Exploration - Sitemap Indexability', () => {
  it('Property 1: Sitemap should include all blog articles and exclude artifact URL', async () => {
    // Read the current sitemap.xml file
    const sitemapPath = path.join(process.cwd(), 'public/sitemap.xml');
    const sitemapContent = fs.readFileSync(sitemapPath, 'utf-8');
    
    // Parse the XML
    const parsedSitemap = await parseStringPromise(sitemapContent);
    const urls = parsedSitemap.urlset.url.map((entry: any) => entry.loc[0]);
    
    // Count blog article URLs
    const blogUrls = urls.filter((url: string) => 
      url.match(/https:\/\/vividmediacheshire\.com\/blog\/[^/]+\/$/)
    );
    
    // Check for artifact URL
    const artifactUrl = urls.find((url: string) => 
      url === 'https://vividmediacheshire.com/services/hosting/'
    );
    
    // Check for canonical URL
    const canonicalUrl = urls.find((url: string) => 
      url === 'https://vividmediacheshire.com/services/website-hosting/'
    );
    
    // Count actual blog files in src/content/blog/
    const blogDir = path.join(process.cwd(), 'src/content/blog');
    const blogFiles = fs.readdirSync(blogDir).filter(f => f.endsWith('.ts'));
    const expectedBlogCount = blogFiles.length;
    
    // Log counterexamples for debugging
    console.log('\n=== Bug Condition Exploration Results ===');
    console.log(`Expected blog article URLs: ${expectedBlogCount}`);
    console.log(`Actual blog article URLs in sitemap: ${blogUrls.length}`);
    console.log(`Artifact URL (/services/hosting/) present: ${artifactUrl ? 'YES' : 'NO'}`);
    console.log(`Canonical URL (/services/website-hosting/) present: ${canonicalUrl ? 'YES' : 'NO'}`);
    
    if (blogUrls.length === 0) {
      console.log('\n⚠️  COUNTEREXAMPLE 1: Sitemap contains 0 blog URLs when 14 blog files exist');
      console.log('Blog files found:', blogFiles.map(f => f.replace('.ts', '')));
    }
    
    if (artifactUrl) {
      console.log('\n⚠️  COUNTEREXAMPLE 2: Sitemap contains artifact URL /services/hosting/');
      console.log('This conflicts with canonical URL /services/website-hosting/');
    }
    
    console.log('=========================================\n');
    
    // Expected Behavior Assertions (from design.md)
    // These WILL FAIL on unfixed code - that's correct and expected!
    
    // Assert: All blog articles should be included
    expect(blogUrls.length).toBe(expectedBlogCount);
    
    // Assert: Artifact URL should be excluded
    expect(artifactUrl).toBeUndefined();
    
    // Assert: Canonical URL should be present
    expect(canonicalUrl).toBeDefined();
  });
});
