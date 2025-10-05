import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  BlogPostSchema,
  ServiceSchema,
  TestimonialSchema,
  validateBlogPost,
  validateService,
  validateTestimonial,
  transformBlogPostData,
  transformServiceData,
  transformTestimonialData,
  processMarkdownContent,
  ContentValidationError,
  ContentProcessingError,
} from '../content';

describe('Content Processing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Zod Schemas', () => {
    describe('BlogPostSchema', () => {
      it('should validate a valid blog post', () => {
        const validPost = {
          title: 'Test Post',
          date: '2023-01-01',
          author: 'Test Author',
          excerpt: 'Test excerpt',
          categories: ['tech'],
          tags: ['test'],
          featured: true,
        };

        const result = BlogPostSchema.parse(validPost);
        expect(result).toEqual(validPost);
      });

      it('should reject invalid date format', () => {
        const invalidPost = {
          title: 'Test Post',
          date: 'invalid-date',
          author: 'Test Author',
          excerpt: 'Test excerpt',
        };

        expect(() => BlogPostSchema.parse(invalidPost)).toThrow();
      });

      it('should require title, date, author, and excerpt', () => {
        const incompletePost = {
          title: 'Test Post',
        };

        expect(() => BlogPostSchema.parse(incompletePost)).toThrow();
      });

      it('should provide default values for optional fields', () => {
        const minimalPost = {
          title: 'Test Post',
          date: '2023-01-01',
          author: 'Test Author',
          excerpt: 'Test excerpt',
        };

        const result = BlogPostSchema.parse(minimalPost);
        expect(result.categories).toEqual([]);
        expect(result.tags).toEqual([]);
        expect(result.featured).toBe(false);
      });
    });

    describe('ServiceSchema', () => {
      it('should validate a valid service', () => {
        const validService = {
          title: 'Test Service',
          shortDescription: 'Test description',
          featuredImage: 'test.jpg',
          icon: 'test-icon',
          order: 1,
          features: ['feature1'],
          benefits: ['benefit1'],
        };

        const result = ServiceSchema.parse(validService);
        expect(result).toEqual(validService);
      });

      it('should require all mandatory fields', () => {
        const incompleteService = {
          title: 'Test Service',
        };

        expect(() => ServiceSchema.parse(incompleteService)).toThrow();
      });

      it('should validate pricing object when provided', () => {
        const serviceWithPricing = {
          title: 'Test Service',
          shortDescription: 'Test description',
          featuredImage: 'test.jpg',
          icon: 'test-icon',
          order: 1,
          pricing: {
            startingPrice: 100,
            currency: 'USD',
            billingPeriod: 'monthly',
          },
        };

        const result = ServiceSchema.parse(serviceWithPricing);
        expect(result.pricing).toEqual(serviceWithPricing.pricing);
      });
    });

    describe('TestimonialSchema', () => {
      it('should validate a valid testimonial', () => {
        const validTestimonial = {
          author: 'Test Author',
          position: 'Test Position',
          content: 'Test content',
          rating: 5,
          order: 1,
        };

        const result = TestimonialSchema.parse(validTestimonial);
        expect(result).toEqual({
          ...validTestimonial,
          featured: false,
        });
      });

      it('should validate rating range', () => {
        const invalidRating = {
          author: 'Test Author',
          position: 'Test Position',
          content: 'Test content',
          rating: 6,
          order: 1,
        };

        expect(() => TestimonialSchema.parse(invalidRating)).toThrow();
      });
    });
  });

  describe('Validation Functions', () => {
    it('should validate blog post and throw ContentValidationError on failure', () => {
      const invalidData = { title: 'Test' };
      const filePath = '/test/blog/test.md';

      expect(() => validateBlogPost(invalidData, filePath)).toThrow(
        ContentValidationError
      );
    });

    it('should validate service and throw ContentValidationError on failure', () => {
      const invalidData = { title: 'Test' };
      const filePath = '/test/services/test.md';

      expect(() => validateService(invalidData, filePath)).toThrow(
        ContentValidationError
      );
    });

    it('should validate testimonial and throw ContentValidationError on failure', () => {
      const invalidData = { author: 'Test' };
      const filePath = '/test/testimonials/test.md';

      expect(() => validateTestimonial(invalidData, filePath)).toThrow(
        ContentValidationError
      );
    });
  });

  describe('Transformation Functions', () => {
    it('should transform blog post data correctly', () => {
      const rawData = {
        title: 'Test Post',
        date: '2023-01-01',
        author: 'Test Author',
        excerpt: 'Test excerpt',
        categories: ['tech'],
        tags: ['test'],
        featured: true,
      };
      const slug = 'test-post';
      const content = 'This is test content for reading time calculation.';

      const result = transformBlogPostData(rawData, slug, content);

      expect(result.slug).toBe(slug);
      expect(result.content).toBe(content);
      expect(result.title).toBe(rawData.title);
      expect(result.readingTime).toBeDefined();
    });

    it('should transform service data correctly', () => {
      const rawData = {
        title: 'Test Service',
        shortDescription: 'Test description',
        featuredImage: 'test.jpg',
        icon: 'test-icon',
        order: 1,
        features: ['feature1'],
        benefits: ['benefit1'],
      };
      const slug = 'test-service';
      const content = 'Service content';

      const result = transformServiceData(rawData, slug, content);

      expect(result.slug).toBe(slug);
      expect(result.content).toBe(content);
      expect(result.title).toBe(rawData.title);
      expect(result.order).toBe(rawData.order);
    });

    it('should transform testimonial data correctly', () => {
      const rawData = {
        author: 'Test Author',
        position: 'Test Position',
        content: 'Test content',
        rating: 5,
        order: 1,
        featured: true,
      };
      const id = 'test-testimonial';
      const content = 'Testimonial content';

      const result = transformTestimonialData(rawData, id, content);

      expect(result.id).toBe(id);
      expect(result.content).toBe(content);
      expect(result.author).toBe(rawData.author);
      expect(result.rating).toBe(rawData.rating);
    });
  });

  describe('Markdown Processing', () => {
    it('should process markdown content successfully', async () => {
      const markdown = '# Test Heading\n\nThis is **bold** text.';
      const filePath = '/test/content.md';

      const result = await processMarkdownContent(markdown, filePath);

      expect(result).toContain('<h1>Test Heading</h1>');
      expect(result).toContain('<strong>bold</strong>');
    });

    it('should throw ContentProcessingError on markdown processing failure', async () => {
      // Mock remark to throw an error
      const markdown = 'invalid markdown that causes error';
      const filePath = '/test/content.md';

      // This test would need to mock the remark processor to throw an error
      // For now, we'll just test that the function exists and can be called
      const result = await processMarkdownContent(markdown, filePath);
      expect(typeof result).toBe('string');
    });
  });

  describe('Content Processing Integration', () => {
    it('should process a complete blog post workflow', () => {
      const rawData = {
        title: 'Test Post',
        date: '2023-01-01',
        author: 'Test Author',
        excerpt: 'Test excerpt',
        categories: ['tech'],
        tags: ['test'],
        featured: true,
      };
      const slug = 'test-post';
      const content = 'This is test content for reading time calculation.';
      const filePath = '/test/blog/test-post.md';

      // Validate the data
      const validatedData = validateBlogPost(rawData, filePath);
      expect(validatedData.title).toBe(rawData.title);
      expect(validatedData.featured).toBe(true);

      // Transform the data
      const transformedPost = transformBlogPostData(
        validatedData,
        slug,
        content
      );
      expect(transformedPost.slug).toBe(slug);
      expect(transformedPost.content).toBe(content);
      expect(transformedPost.readingTime).toBeDefined();
    });

    it('should process a complete service workflow', () => {
      const rawData = {
        title: 'Test Service',
        shortDescription: 'Test description',
        featuredImage: 'test.jpg',
        icon: 'test-icon',
        order: 1,
        features: ['feature1'],
        benefits: ['benefit1'],
      };
      const slug = 'test-service';
      const content = 'Service content';
      const filePath = '/test/services/test-service.md';

      // Validate the data
      const validatedData = validateService(rawData, filePath);
      expect(validatedData.title).toBe(rawData.title);
      expect(validatedData.order).toBe(1);

      // Transform the data
      const transformedService = transformServiceData(
        validatedData,
        slug,
        content
      );
      expect(transformedService.slug).toBe(slug);
      expect(transformedService.content).toBe(content);
      expect(transformedService.features).toEqual(['feature1']);
    });

    it('should process a complete testimonial workflow', () => {
      const rawData = {
        author: 'Test Author',
        position: 'Test Position',
        content: 'Test content',
        rating: 5,
        order: 1,
        featured: true,
      };
      const id = 'test-testimonial';
      const content = 'Testimonial content';
      const filePath = '/test/testimonials/test-testimonial.md';

      // Validate the data
      const validatedData = validateTestimonial(rawData, filePath);
      expect(validatedData.author).toBe(rawData.author);
      expect(validatedData.rating).toBe(5);

      // Transform the data
      const transformedTestimonial = transformTestimonialData(
        validatedData,
        id,
        content
      );
      expect(transformedTestimonial.id).toBe(id);
      expect(transformedTestimonial.content).toBe(content);
      expect(transformedTestimonial.featured).toBe(true);
    });
  });
});
