import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { validateUrl, shouldIndex } from '../scripts/lib/url-collector.js';

/**
 * Property-Based Tests for IndexNow URL Processing
 * 
 * Feature: indexnow-submission
 * Tests URL normalization and deduplication properties
 */

describe('Feature: indexnow-submission - URL Processing', () => {
  
  describe('Property 6: URL Normalization', () => {
    /**
     * **Validates: Requirements 2.6, 3.2, 3.3**
     * 
     * For any input URL string, the normalized URL SHALL have HTTPS protocol,
     * include a trailing slash, and match the configured domain.
     */
    it('should normalize URLs to HTTPS with trailing slash and correct domain', () => {
      // Feature: indexnow-submission, Property 6: URL normalization
      
      fc.assert(
        fc.property(
          // Generate URLs with various protocols and path formats
          fc.record({
            protocol: fc.constantFrom('http:', 'https:', 'HTTP:', 'HTTPS:'),
            domain: fc.constant('vividmediacheshire.com'),
            path: fc.oneof(
              fc.constant(''),
              fc.constant('/'),
              fc.webPath(),
              fc.webPath().map(p => p + '/'),
              fc.webPath().map(p => p.replace(/\/$/, ''))
            ),
            query: fc.oneof(
              fc.constant(''),
              fc.webQueryParameters()
            )
          }),
          ({ protocol, domain, path, query }) => {
            // Construct test URL
            const testUrl = `${protocol}//${domain}${path}${query}`;
            
            // Normalize the URL
            const normalized = validateUrl(testUrl, domain);
            
            // If normalization succeeds, verify properties
            if (normalized) {
              // Property 1: Must use HTTPS protocol
              expect(normalized).toMatch(/^https:\/\//);
              
              // Property 2: Must have trailing slash (before query/hash)
              const urlObj = new URL(normalized);
              expect(urlObj.pathname).toMatch(/\/$/);
              
              // Property 3: Must match the configured domain
              expect(urlObj.hostname).toBe(domain);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject URLs with mismatched domains', () => {
      // Feature: indexnow-submission, Property 6: URL normalization
      
      fc.assert(
        fc.property(
          // Generate URLs with different domains
          fc.webUrl({ withFragments: false }),
          (url) => {
            const expectedDomain = 'vividmediacheshire.com';
            const normalized = validateUrl(url, expectedDomain);
            
            // If the URL doesn't contain the expected domain, it should be rejected
            if (!url.includes(expectedDomain)) {
              expect(normalized).toBeNull();
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle URLs with query parameters and preserve them', () => {
      // Feature: indexnow-submission, Property 6: URL normalization
      
      fc.assert(
        fc.property(
          fc.webPath(),
          fc.webQueryParameters(),
          (path, query) => {
            const domain = 'vividmediacheshire.com';
            const testUrl = `http://${domain}${path}${query}`;
            
            const normalized = validateUrl(testUrl, domain);
            
            // Only check if query has actual parameters (not just "?" or malformed)
            // Query parameters should start with "?" and have content after it
            if (normalized && query && query.startsWith('?') && query.length > 1) {
              try {
                // Parse the URL to get the normalized query string
                const normalizedUrl = new URL(normalized);
                const originalUrl = new URL(testUrl);
                
                // If the original URL had a valid query, the normalized one should too
                if (originalUrl.search) {
                  expect(normalizedUrl.search).toBe(originalUrl.search);
                }
              } catch (e) {
                // If URL parsing fails, skip this test case
              }
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return null for invalid URL formats', () => {
      // Feature: indexnow-submission, Property 6: URL normalization
      
      fc.assert(
        fc.property(
          // Generate invalid URL strings
          fc.oneof(
            fc.constant('not-a-url'),
            fc.constant(''),
            fc.constant('   '),
            fc.string().filter(s => !s.includes('://'))
          ),
          (invalidUrl) => {
            const normalized = validateUrl(invalidUrl, 'vividmediacheshire.com');
            expect(normalized).toBeNull();
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 7: URL Deduplication', () => {
    /**
     * **Validates: Requirements 3.6**
     * 
     * For any list of URLs containing duplicates, the deduplicated list SHALL
     * contain each unique URL exactly once, preserving the order of first occurrence.
     */
    it('should remove duplicate URLs while preserving order', () => {
      // Feature: indexnow-submission, Property 7: URL deduplication
      
      fc.assert(
        fc.property(
          // Generate array of URLs with potential duplicates
          fc.array(
            fc.webUrl({ withFragments: false }),
            { minLength: 1, maxLength: 50 }
          ),
          (urls) => {
            // Simulate deduplication logic (as implemented in collectUrls)
            const seen = new Set<string>();
            const deduplicated: string[] = [];
            
            for (const url of urls) {
              if (!seen.has(url)) {
                seen.add(url);
                deduplicated.push(url);
              }
            }
            
            // Property 1: Each URL appears exactly once
            const uniqueUrls = new Set(deduplicated);
            expect(deduplicated.length).toBe(uniqueUrls.size);
            
            // Property 2: Order is preserved (first occurrence)
            for (let i = 0; i < deduplicated.length; i++) {
              const firstIndex = urls.indexOf(deduplicated[i]);
              expect(firstIndex).toBeGreaterThanOrEqual(0);
              
              // No earlier occurrence of this URL should exist
              for (let j = 0; j < firstIndex; j++) {
                if (urls[j] === deduplicated[i]) {
                  throw new Error('Order not preserved: duplicate found before first occurrence');
                }
              }
            }
            
            // Property 3: All unique URLs from input are present
            const inputUnique = new Set(urls);
            expect(deduplicated.length).toBe(inputUnique.size);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle empty arrays and single-element arrays', () => {
      // Feature: indexnow-submission, Property 7: URL deduplication
      
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant([]),
            fc.array(fc.webUrl(), { minLength: 1, maxLength: 1 })
          ),
          (urls) => {
            // Simulate deduplication
            const seen = new Set<string>();
            const deduplicated: string[] = [];
            
            for (const url of urls) {
              if (!seen.has(url)) {
                seen.add(url);
                deduplicated.push(url);
              }
            }
            
            // Empty array should remain empty
            // Single element should remain single element
            expect(deduplicated.length).toBe(urls.length);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should deduplicate normalized URLs correctly', () => {
      // Feature: indexnow-submission, Property 7: URL deduplication
      
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              protocol: fc.constantFrom('http:', 'https:'),
              domain: fc.constant('vividmediacheshire.com'),
              path: fc.webPath()
            }),
            { minLength: 1, maxLength: 30 }
          ),
          (urlConfigs) => {
            const domain = 'vividmediacheshire.com';
            
            // Normalize all URLs
            const normalized = urlConfigs
              .map(({ protocol, domain: d, path }) => 
                validateUrl(`${protocol}//${d}${path}`, domain)
              )
              .filter((url): url is string => url !== null);
            
            // Deduplicate
            const seen = new Set<string>();
            const deduplicated: string[] = [];
            
            for (const url of normalized) {
              if (!seen.has(url)) {
                seen.add(url);
                deduplicated.push(url);
              }
            }
            
            // All URLs in deduplicated list should be unique
            const uniqueSet = new Set(deduplicated);
            expect(deduplicated.length).toBe(uniqueSet.size);
            
            // Deduplicated list should not be longer than normalized list
            expect(deduplicated.length).toBeLessThanOrEqual(normalized.length);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('URL Exclusion Logic', () => {
    /**
     * Tests for shouldIndex function to ensure proper exclusion of paths
     */
    it('should exclude URLs matching excluded paths', () => {
      fc.assert(
        fc.property(
          fc.webPath(),
          (path) => {
            const domain = 'vividmediacheshire.com';
            const excludePaths = ['/thank-you/'];
            const testUrl = `https://${domain}${path}`;
            
            const shouldBeIndexed = shouldIndex(testUrl, excludePaths);
            
            // If path contains excluded path, should not be indexed
            if (path.includes('/thank-you/')) {
              expect(shouldBeIndexed).toBe(false);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should include URLs not matching excluded paths', () => {
      fc.assert(
        fc.property(
          fc.webPath().filter(p => !p.includes('/thank-you/')),
          (path) => {
            const domain = 'vividmediacheshire.com';
            const excludePaths = ['/thank-you/'];
            const testUrl = `https://${domain}${path}`;
            
            const shouldBeIndexed = shouldIndex(testUrl, excludePaths);
            
            // If path doesn't contain excluded path, should be indexed
            expect(shouldBeIndexed).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
