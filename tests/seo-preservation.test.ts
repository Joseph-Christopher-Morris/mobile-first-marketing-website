import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { buildMetadata, SITE_URL } from '../src/lib/seo';

/**
 * Property 2: Preservation - OpenGraph, Twitter, Canonical, and Robots Metadata
 * 
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4**
 * 
 * These tests establish the baseline behavior for all non-title metadata fields
 * that must remain unchanged after the fix. They should PASS on unfixed code
 * and continue to pass after the fix is implemented.
 * 
 * Testing Strategy: Use property-based testing to generate random inputs and
 * verify that OpenGraph, Twitter card, canonical URL, and robots metadata
 * behave consistently across all inputs.
 */

describe('SEO Preservation Property Tests', () => {
  describe('Property 2.1: OpenGraph Metadata Preservation', () => {
    it('should preserve OpenGraph structure with all required fields', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 5, maxLength: 50 }),
          fc.option(fc.string({ minLength: 3, maxLength: 30 }), { nil: undefined }),
          fc.string({ minLength: 20, maxLength: 200 }),
          fc.string({ minLength: 1, maxLength: 50 }).map(s => `/${s.replace(/\s+/g, '-')}`),
          fc.option(fc.string({ minLength: 5, maxLength: 50 }).map(s => `/${s}.jpg`), { nil: undefined }),
          (intent, qualifier, description, canonicalPath, ogImage) => {
            const metadata = buildMetadata({
              intent,
              qualifier,
              description,
              canonicalPath,
              ogImage,
            });

            // Verify OpenGraph object exists
            expect(metadata.openGraph).toBeDefined();
            
            // Verify all required OpenGraph fields are present
            expect(metadata.openGraph).toHaveProperty('title');
            expect(metadata.openGraph).toHaveProperty('description');
            expect(metadata.openGraph).toHaveProperty('url');
            expect(metadata.openGraph).toHaveProperty('siteName');
            expect(metadata.openGraph).toHaveProperty('locale');
            expect(metadata.openGraph).toHaveProperty('type');
            expect(metadata.openGraph).toHaveProperty('images');

            // Verify OpenGraph field types and values
            expect(typeof metadata.openGraph.title).toBe('string');
            expect(typeof metadata.openGraph.description).toBe('string');
            expect(typeof metadata.openGraph.url).toBe('string');
            expect(metadata.openGraph.siteName).toBe('Vivid Media Cheshire');
            expect(metadata.openGraph.locale).toBe('en_GB');
            expect(metadata.openGraph.type).toBe('website');
            expect(Array.isArray(metadata.openGraph.images)).toBe(true);
            expect(metadata.openGraph.images.length).toBeGreaterThan(0);

            // Verify OpenGraph image structure
            const image = metadata.openGraph.images[0];
            expect(image).toHaveProperty('url');
            expect(image).toHaveProperty('width');
            expect(image).toHaveProperty('height');
            expect(image).toHaveProperty('alt');
            expect(image.width).toBe(1200);
            expect(image.height).toBe(630);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should use provided ogImage or default to /og-image.jpg', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 5, maxLength: 50 }),
          fc.string({ minLength: 20, maxLength: 200 }),
          fc.string({ minLength: 1, maxLength: 50 }).map(s => `/${s.replace(/\s+/g, '-')}`),
          fc.option(fc.string({ minLength: 5, maxLength: 50 }).map(s => `/${s}.jpg`), { nil: undefined }),
          (intent, description, canonicalPath, ogImage) => {
            const metadata = buildMetadata({
              intent,
              description,
              canonicalPath,
              ogImage,
            });

            const expectedImage = ogImage || '/og-image.jpg';
            expect(metadata.openGraph.images[0].url).toBe(expectedImage);
            expect(metadata.twitter.images).toEqual([expectedImage]);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 2.2: Twitter Card Metadata Preservation', () => {
    it('should preserve Twitter card structure with all required fields', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 5, maxLength: 50 }),
          fc.option(fc.string({ minLength: 3, maxLength: 30 }), { nil: undefined }),
          fc.string({ minLength: 20, maxLength: 200 }),
          fc.string({ minLength: 1, maxLength: 50 }).map(s => `/${s.replace(/\s+/g, '-')}`),
          (intent, qualifier, description, canonicalPath) => {
            const metadata = buildMetadata({
              intent,
              qualifier,
              description,
              canonicalPath,
            });

            // Verify Twitter object exists
            expect(metadata.twitter).toBeDefined();
            
            // Verify all required Twitter card fields are present
            expect(metadata.twitter).toHaveProperty('card');
            expect(metadata.twitter).toHaveProperty('title');
            expect(metadata.twitter).toHaveProperty('description');
            expect(metadata.twitter).toHaveProperty('images');

            // Verify Twitter field types and values
            expect(metadata.twitter.card).toBe('summary_large_image');
            expect(typeof metadata.twitter.title).toBe('string');
            expect(typeof metadata.twitter.description).toBe('string');
            expect(Array.isArray(metadata.twitter.images)).toBe(true);
            expect(metadata.twitter.images.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 2.3: Canonical URL Normalization Preservation', () => {
    it('should normalize canonical paths with trailing slashes (except root)', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 5, maxLength: 50 }),
          fc.string({ minLength: 20, maxLength: 200 }),
          fc.string({ minLength: 1, maxLength: 50 }).map(s => s.replace(/\s+/g, '-').replace(/\//g, '')),
          (intent, description, pathSegment) => {
            // Test path without trailing slash
            const pathWithoutSlash = `/${pathSegment}`;
            const metadata1 = buildMetadata({
              intent,
              description,
              canonicalPath: pathWithoutSlash,
            });

            // Test path with trailing slash
            const pathWithSlash = `/${pathSegment}/`;
            const metadata2 = buildMetadata({
              intent,
              description,
              canonicalPath: pathWithSlash,
            });

            // Both should normalize to the same URL with trailing slash
            const expectedUrl = `${SITE_URL}/${pathSegment}/`;
            expect(metadata1.alternates?.canonical).toBe(expectedUrl);
            expect(metadata2.alternates?.canonical).toBe(expectedUrl);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle root path specially (no trailing slash added)', () => {
      const metadata = buildMetadata({
        intent: 'Test',
        description: 'Test description',
        canonicalPath: '/',
      });

      expect(metadata.alternates?.canonical).toBe(`${SITE_URL}/`);
    });

    it('should build absolute URLs from relative paths', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 5, maxLength: 50 }),
          fc.string({ minLength: 20, maxLength: 200 }),
          fc.string({ minLength: 1, maxLength: 50 }).map(s => `/${s.replace(/\s+/g, '-')}`),
          (intent, description, canonicalPath) => {
            const metadata = buildMetadata({
              intent,
              description,
              canonicalPath,
            });

            // Verify canonical URL is absolute
            expect(metadata.alternates?.canonical).toMatch(/^https:\/\//);
            expect(metadata.alternates?.canonical).toContain(SITE_URL);
            
            // Verify OpenGraph URL is absolute
            expect(metadata.openGraph.url).toMatch(/^https:\/\//);
            expect(metadata.openGraph.url).toContain(SITE_URL);
            
            // Verify canonical and OpenGraph URLs match
            expect(metadata.alternates?.canonical).toBe(metadata.openGraph.url);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 2.4: Robots Meta Tags Preservation', () => {
    it('should not include robots meta when noindex is false or undefined', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 5, maxLength: 50 }),
          fc.string({ minLength: 20, maxLength: 200 }),
          fc.string({ minLength: 1, maxLength: 50 }).map(s => `/${s.replace(/\s+/g, '-')}`),
          (intent, description, canonicalPath) => {
            const metadata = buildMetadata({
              intent,
              description,
              canonicalPath,
              noindex: false,
            });

            expect(metadata.robots).toBeUndefined();
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should include correct robots meta when noindex is true', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 5, maxLength: 50 }),
          fc.string({ minLength: 20, maxLength: 200 }),
          fc.string({ minLength: 1, maxLength: 50 }).map(s => `/${s.replace(/\s+/g, '-')}`),
          (intent, description, canonicalPath) => {
            const metadata = buildMetadata({
              intent,
              description,
              canonicalPath,
              noindex: true,
            });

            // Verify robots object exists
            expect(metadata.robots).toBeDefined();
            
            // Verify robots meta structure
            expect(metadata.robots).toHaveProperty('index');
            expect(metadata.robots).toHaveProperty('follow');
            expect(metadata.robots).toHaveProperty('googleBot');
            
            // Verify robots meta values
            expect(metadata.robots.index).toBe(false);
            expect(metadata.robots.follow).toBe(false);
            expect(metadata.robots.googleBot).toEqual({
              index: false,
              follow: false,
            });
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Property 2.5: Description Cleaning Preservation', () => {
    it('should clean and truncate descriptions consistently', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 5, maxLength: 50 }),
          fc.string({ minLength: 20, maxLength: 300 }),
          fc.string({ minLength: 1, maxLength: 50 }).map(s => `/${s.replace(/\s+/g, '-')}`),
          (intent, description, canonicalPath) => {
            const metadata = buildMetadata({
              intent,
              description,
              canonicalPath,
            });

            // Verify description is cleaned (no multiple spaces)
            expect(metadata.description).not.toMatch(/\s{2,}/);
            
            // Verify description is truncated to 155 characters
            expect(metadata.description!.length).toBeLessThanOrEqual(155);
            
            // Verify description is trimmed
            expect(metadata.description).toBe(metadata.description!.trim());
            
            // Verify OpenGraph and Twitter descriptions match
            expect(metadata.openGraph.description).toBe(metadata.description);
            expect(metadata.twitter.description).toBe(metadata.description);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
