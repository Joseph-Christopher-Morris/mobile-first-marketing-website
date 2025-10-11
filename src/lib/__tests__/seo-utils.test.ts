import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  generateCanonicalUrl,
  generateHreflangTags,
  generateBreadcrumbStructuredData,
  generateFAQStructuredData,
  generateOrganizationStructuredData,
  optimizeMetaDescription,
  generateKeywords,
} from '../seo-utils';
import type { BreadcrumbItem, FAQItem } from '../seo-utils';

describe('SEO Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set default environment variable
    process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com';
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.NEXT_PUBLIC_SITE_URL;
  });

  describe('generateCanonicalUrl', () => {
    it('should generate canonical URL with base URL', () => {
      const result = generateCanonicalUrl({ path: '/about' });
      expect(result).toBe('https://example.com/about');
    });

    it('should remove trailing slash by default', () => {
      const result = generateCanonicalUrl({ path: '/about/' });
      expect(result).toBe('https://example.com/about');
    });

    it('should preserve root path trailing slash', () => {
      const result = generateCanonicalUrl({ path: '/' });
      expect(result).toBe('https://example.com/');
    });

    it('should remove query parameters by default', () => {
      const result = generateCanonicalUrl({ path: '/blog?page=2&sort=date' });
      expect(result).toBe('https://example.com/blog');
    });

    it('should preserve query parameters when requested', () => {
      const result = generateCanonicalUrl({
        path: '/blog?page=2',
        removeQueryParams: false,
      });
      expect(result).toBe('https://example.com/blog?page=2');
    });

    it('should preserve trailing slash when requested', () => {
      const result = generateCanonicalUrl({
        path: '/about/',
        removeTrailingSlash: false,
      });
      expect(result).toBe('https://example.com/about/');
    });

    it('should add leading slash if missing', () => {
      const result = generateCanonicalUrl({ path: 'about' });
      expect(result).toBe('https://example.com/about');
    });

    it('should use fallback URL when env var is missing', () => {
      delete process.env.NEXT_PUBLIC_SITE_URL;
      const result = generateCanonicalUrl({ path: '/about' });
      expect(result).toBe('https://example.com/about');
    });
  });

  describe('generateHreflangTags', () => {
    it('should generate hreflang tags for supported locales', () => {
      const result = generateHreflangTags('/about', ['en', 'es', 'fr']);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        hreflang: 'en',
        href: 'https://example.com/about',
      });
      expect(result[1]).toEqual({
        hreflang: 'es',
        href: 'https://example.com/es/about',
      });
      expect(result[2]).toEqual({
        hreflang: 'fr',
        href: 'https://example.com/fr/about',
      });
    });

    it('should handle default locale (en) without prefix', () => {
      const result = generateHreflangTags('/blog');

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        hreflang: 'en',
        href: 'https://example.com/blog',
      });
    });

    it('should handle root path', () => {
      const result = generateHreflangTags('/', ['en', 'es']);

      expect(result[0]).toEqual({
        hreflang: 'en',
        href: 'https://example.com/',
      });
      expect(result[1]).toEqual({
        hreflang: 'es',
        href: 'https://example.com/es/',
      });
    });
  });

  describe('generateBreadcrumbStructuredData', () => {
    it('should generate valid breadcrumb structured data', () => {
      const breadcrumbs: BreadcrumbItem[] = [
        { name: 'Home', url: 'https://example.com' },
        { name: 'Services', url: 'https://example.com/services' },
        {
          name: 'Photography',
          url: 'https://example.com/services/photography',
        },
      ];

      const result = generateBreadcrumbStructuredData(breadcrumbs);

      expect(result['@context']).toBe('https://schema.org');
      expect(result['@type']).toBe('BreadcrumbList');
      expect(result.itemListElement).toHaveLength(3);

      expect(result.itemListElement[0]).toEqual({
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://example.com',
      });

      expect(result.itemListElement[2]).toEqual({
        '@type': 'ListItem',
        position: 3,
        name: 'Photography',
        item: 'https://example.com/services/photography',
      });
    });

    it('should handle empty breadcrumbs', () => {
      const result = generateBreadcrumbStructuredData([]);

      expect(result.itemListElement).toHaveLength(0);
    });
  });

  describe('generateFAQStructuredData', () => {
    it('should generate valid FAQ structured data', () => {
      const faqs: FAQItem[] = [
        {
          question: 'What services do you offer?',
          answer: 'We offer photography, analytics, and ad campaigns.',
        },
        {
          question: 'How much do your services cost?',
          answer: 'Pricing varies based on project scope and requirements.',
        },
      ];

      const result = generateFAQStructuredData(faqs);

      expect(result['@context']).toBe('https://schema.org');
      expect(result['@type']).toBe('FAQPage');
      expect(result.mainEntity).toHaveLength(2);

      expect(result.mainEntity[0]).toEqual({
        '@type': 'Question',
        name: 'What services do you offer?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We offer photography, analytics, and ad campaigns.',
        },
      });
    });

    it('should handle empty FAQ list', () => {
      const result = generateFAQStructuredData([]);

      expect(result.mainEntity).toHaveLength(0);
    });
  });

  describe('generateOrganizationStructuredData', () => {
    it('should generate valid organization structured data', () => {
      const result = generateOrganizationStructuredData();

      expect(result['@context']).toBe('https://schema.org');
      expect(result['@type']).toBe('Organization');
      expect(result.name).toBe('Mobile-First Marketing');
      expect(result.url).toBe('https://example.com');
      expect(result.logo).toBe('https://example.com/images/logo.png');

      expect(result.contactPoint).toHaveProperty('@type', 'ContactPoint');
      expect(result.contactPoint).toHaveProperty('telephone');
      expect(result.contactPoint).toHaveProperty('email');

      expect(result.address).toHaveProperty('@type', 'PostalAddress');
      expect(result.sameAs).toBeInstanceOf(Array);
      expect(result.sameAs.length).toBeGreaterThan(0);
    });
  });

  describe('optimizeMetaDescription', () => {
    it('should return description as-is if within limit', () => {
      const description = 'This is a short description.';
      const result = optimizeMetaDescription(description);

      expect(result).toBe(description);
    });

    it('should truncate long descriptions at word boundary', () => {
      const longDescription =
        'This is a very long description that exceeds the maximum length limit and should be truncated at a word boundary to maintain readability and SEO best practices.';
      const result = optimizeMetaDescription(longDescription, 100);

      expect(result.length).toBeLessThanOrEqual(103); // 100 + '...'
      expect(result.endsWith('...')).toBe(true);
      expect(result).not.toMatch(/\w\.\.\.$/); // Should not cut words
    });

    it('should handle custom max length', () => {
      const description =
        'This is a description that should be truncated at fifty characters.';
      const result = optimizeMetaDescription(description, 50);

      expect(result.length).toBeLessThanOrEqual(53); // 50 + '...'
      expect(result.endsWith('...')).toBe(true);
    });

    it('should truncate even if no good word boundary exists', () => {
      const description =
        'Thisisaverylongwordwithoutanyspacesorwordbound' + 'a'.repeat(200);
      const result = optimizeMetaDescription(description, 100);

      expect(result.length).toBeLessThanOrEqual(103);
      expect(result.endsWith('...')).toBe(true);
    });
  });

  describe('generateKeywords', () => {
    it('should extract keywords from content', () => {
      const content =
        'Mobile marketing photography services analytics campaigns digital advertising social media optimization';
      const result = generateKeywords(content);

      expect(result).toContain('mobile');
      expect(result).toContain('marketing');
      expect(result).toContain('photography');
      expect(result).toContain('services');
      expect(result).toContain('analytics');
      expect(result.length).toBeLessThanOrEqual(10);
    });

    it('should combine with existing keywords', () => {
      const content = 'Digital marketing services for small businesses';
      const existing = ['seo', 'ppc'];
      const result = generateKeywords(content, existing);

      expect(result).toContain('seo');
      expect(result).toContain('ppc');
      expect(result).toContain('digital');
      expect(result).toContain('marketing');
    });

    it('should respect max keywords limit', () => {
      const content =
        'one two three four five six seven eight nine ten eleven twelve';
      const result = generateKeywords(content, [], 5);

      expect(result.length).toBeLessThanOrEqual(5);
    });

    it('should filter out short words', () => {
      const content = 'a an the is at on in of to for marketing services';
      const result = generateKeywords(content);

      expect(result).not.toContain('a');
      expect(result).not.toContain('an');
      expect(result).not.toContain('the');
      expect(result).toContain('marketing');
      expect(result).toContain('services');
    });

    it('should handle empty content', () => {
      const result = generateKeywords('');

      expect(result).toEqual([]);
    });

    it('should remove duplicates', () => {
      const content = 'marketing marketing services services digital digital';
      const result = generateKeywords(content);

      const uniqueKeywords = [...new Set(result)];
      expect(result.length).toBe(uniqueKeywords.length);
    });
  });
});
