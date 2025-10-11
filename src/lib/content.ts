import * as fs from 'fs';
import * as path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import remarkHtml from 'remark-html';
import remarkGfm from 'remark-gfm';
import readingTime from 'reading-time';
import { z } from 'zod';

const contentDirectory = path.join(process.cwd(), 'content');

// Zod validation schemas
export const BlogPostSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  author: z.string().min(1, 'Author is required'),
  excerpt: z.string().min(1, 'Excerpt is required'),
  categories: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  featuredImage: z.string().optional(),
  seoTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

export const ServiceSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  shortDescription: z.string().min(1, 'Short description is required'),
  featuredImage: z.string().min(1, 'Featured image is required'),
  icon: z.string().min(1, 'Icon is required'),
  order: z.number().int().min(0, 'Order must be a non-negative integer'),
  features: z.array(z.string()).default([]),
  benefits: z.array(z.string()).default([]),
  pricing: z
    .object({
      startingPrice: z.number().min(0, 'Starting price must be non-negative'),
      currency: z.string().min(1, 'Currency is required'),
      billingPeriod: z.string().min(1, 'Billing period is required'),
    })
    .optional(),
  seoTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

export const TestimonialSchema = z.object({
  author: z.string().min(1, 'Author is required'),
  position: z.string().min(1, 'Position is required'),
  company: z.string().optional(),
  avatar: z.string().optional(),
  content: z.string().min(1, 'Content is required'),
  rating: z.number().int().min(1).max(5, 'Rating must be between 1 and 5'),
  featured: z.boolean().default(false),
  order: z.number().int().min(0, 'Order must be a non-negative integer'),
  serviceRelated: z.array(z.string()).optional(),
});

// Content validation error types
export class ContentValidationError extends Error {
  constructor(
    message: string,
    public filePath: string,
    public validationErrors: z.ZodError
  ) {
    super(message);
    this.name = 'ContentValidationError';
  }
}

export class ContentProcessingError extends Error {
  constructor(
    message: string,
    public filePath: string,
    public cause?: Error
  ) {
    super(message);
    this.name = 'ContentProcessingError';
  }
}

// Content validation functions
export function validateBlogPost(
  data: unknown,
  filePath: string
): z.infer<typeof BlogPostSchema> {
  try {
    return BlogPostSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ContentValidationError(
        `Blog post validation failed for ${filePath}`,
        filePath,
        error
      );
    }
    throw error;
  }
}

export function validateService(
  data: unknown,
  filePath: string
): z.infer<typeof ServiceSchema> {
  try {
    return ServiceSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ContentValidationError(
        `Service validation failed for ${filePath}`,
        filePath,
        error
      );
    }
    throw error;
  }
}

export function validateTestimonial(
  data: unknown,
  filePath: string
): z.infer<typeof TestimonialSchema> {
  try {
    return TestimonialSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ContentValidationError(
        `Testimonial validation failed for ${filePath}`,
        filePath,
        error
      );
    }
    throw error;
  }
}

// Content transformation utilities
export function transformBlogPostData(
  rawData: any,
  slug: string,
  content: string
): BlogPost {
  const readingTimeStats = readingTime(content);

  return {
    slug,
    content,
    readingTime: readingTimeStats.text,
    title: rawData.title,
    date: rawData.date,
    author: rawData.author,
    excerpt: rawData.excerpt,
    categories: rawData.categories || [],
    tags: rawData.tags || [],
    featured: rawData.featured || false,
    featuredImage: rawData.featuredImage,
    seoTitle: rawData.seoTitle,
    metaDescription: rawData.metaDescription,
  };
}

export function transformServiceData(
  rawData: any,
  slug: string,
  content: string
): Service {
  return {
    slug,
    content,
    title: rawData.title,
    shortDescription: rawData.shortDescription,
    featuredImage: rawData.featuredImage,
    icon: rawData.icon,
    order: rawData.order,
    features: rawData.features || [],
    benefits: rawData.benefits || [],
    pricing: rawData.pricing,
    seoTitle: rawData.seoTitle,
    metaDescription: rawData.metaDescription,
  };
}

export function transformTestimonialData(
  rawData: any,
  id: string,
  content: string
): Testimonial {
  return {
    id,
    content: content || rawData.content,
    author: rawData.author,
    position: rawData.position,
    company: rawData.company,
    avatar: rawData.avatar,
    rating: rawData.rating,
    featured: rawData.featured || false,
    order: rawData.order,
    serviceRelated: rawData.serviceRelated,
  };
}

// Enhanced markdown processing with error handling
export async function processMarkdownContent(
  markdown: string,
  filePath: string
): Promise<string> {
  try {
    const result = await remark()
      .use(remarkGfm)
      .use(remarkHtml, { sanitize: false })
      .process(markdown);

    return result.toString();
  } catch (error) {
    throw new ContentProcessingError(
      `Failed to process markdown content for ${filePath}`,
      filePath,
      error as Error
    );
  }
}

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  modifiedDate?: string;
  author: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  categories: string[];
  tags: string[];
  featured: boolean;
  readingTime?: string;
  seoTitle?: string;
  metaDescription?: string;
}

export interface Service {
  slug: string;
  title: string;
  shortDescription: string;
  content: string;
  featuredImage: string;
  icon: string;
  order: number;
  features: string[];
  benefits: string[];
  pricing?: {
    startingPrice: number;
    currency: string;
    billingPeriod: string;
  };
  seoTitle?: string;
  metaDescription?: string;
}

export interface Testimonial {
  id: string;
  author: string;
  position: string;
  company?: string;
  avatar?: string;
  content: string;
  rating: number;
  featured: boolean;
  order: number;
  serviceRelated?: string[];
}

export async function markdownToHtml(
  markdown: string,
  filePath?: string
): Promise<string> {
  return processMarkdownContent(markdown, filePath || 'unknown');
}

export function getAllPosts(): BlogPost[] {
  const postsDirectory = path.join(contentDirectory, 'blog');

  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const fileNames = fs
    .readdirSync(postsDirectory)
    .filter(name => name.endsWith('.md'));

  const allPostsData = fileNames
    .map(fileName => {
      try {
        const slug = fileName.replace(/\.md$/, '');
        const fullPath = path.join(postsDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data, content } = matter(fileContents);

        // Validate frontmatter data
        const validatedData = validateBlogPost(data, fullPath);

        // Transform and return the blog post
        return transformBlogPostData(validatedData, slug, content);
      } catch (error) {
        console.error(`Error processing blog post ${fileName}:`, error);
        return null;
      }
    })
    .filter((post): post is BlogPost => post !== null);

  return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(slug: string): BlogPost | null {
  try {
    const fullPath = path.join(contentDirectory, 'blog', `${slug}.md`);

    if (!fs.existsSync(fullPath)) {
      return null;
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    // Validate frontmatter data
    const validatedData = validateBlogPost(data, fullPath);

    // Transform and return the blog post
    return transformBlogPostData(validatedData, slug, content);
  } catch (error) {
    console.error(`Error processing blog post ${slug}:`, error);
    return null;
  }
}

export function getAllServices(): Service[] {
  const servicesDirectory = path.join(contentDirectory, 'services');

  if (!fs.existsSync(servicesDirectory)) {
    return [];
  }

  const fileNames = fs
    .readdirSync(servicesDirectory)
    .filter(name => name.endsWith('.md'));

  const allServicesData = fileNames
    .map(fileName => {
      try {
        const slug = fileName.replace(/\.md$/, '');
        const fullPath = path.join(servicesDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data, content } = matter(fileContents);

        // Validate frontmatter data
        const validatedData = validateService(data, fullPath);

        // Transform and return the service
        return transformServiceData(validatedData, slug, content);
      } catch (error) {
        console.error(`Error processing service ${fileName}:`, error);
        return null;
      }
    })
    .filter((service): service is Service => service !== null);

  return allServicesData.sort((a, b) => a.order - b.order);
}

export function getServiceBySlug(slug: string): Service | null {
  try {
    const fullPath = path.join(contentDirectory, 'services', `${slug}.md`);

    if (!fs.existsSync(fullPath)) {
      return null;
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    // Validate frontmatter data
    const validatedData = validateService(data, fullPath);

    // Transform and return the service
    return transformServiceData(validatedData, slug, content);
  } catch (error) {
    console.error(`Error processing service ${slug}:`, error);
    return null;
  }
}

export function getAllTestimonials(): Testimonial[] {
  const testimonialsDirectory = path.join(contentDirectory, 'testimonials');

  if (!fs.existsSync(testimonialsDirectory)) {
    return [];
  }

  const fileNames = fs
    .readdirSync(testimonialsDirectory)
    .filter(name => name.endsWith('.md'));

  const allTestimonialsData = fileNames
    .map(fileName => {
      try {
        const id = fileName.replace(/\.md$/, '');
        const fullPath = path.join(testimonialsDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data, content } = matter(fileContents);

        // Validate frontmatter data
        const validatedData = validateTestimonial(data, fullPath);

        // Transform and return the testimonial
        return transformTestimonialData(validatedData, id, content);
      } catch (error) {
        console.error(`Error processing testimonial ${fileName}:`, error);
        return null;
      }
    })
    .filter((testimonial): testimonial is Testimonial => testimonial !== null);

  return allTestimonialsData.sort((a, b) => a.order - b.order);
}

export function getTestimonialById(id: string): Testimonial | null {
  try {
    const fullPath = path.join(contentDirectory, 'testimonials', `${id}.md`);

    if (!fs.existsSync(fullPath)) {
      return null;
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    // Validate frontmatter data
    const validatedData = validateTestimonial(data, fullPath);

    // Transform and return the testimonial
    return transformTestimonialData(validatedData, id, content);
  } catch (error) {
    console.error(`Error processing testimonial ${id}:`, error);
    return null;
  }
}

// Additional utility functions for content validation
export function validateContentFile(filePath: string): boolean {
  try {
    if (!fs.existsSync(filePath)) {
      return false;
    }

    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data } = matter(fileContents);

    // Determine content type based on file path
    if (filePath.includes('/blog/')) {
      validateBlogPost(data, filePath);
    } else if (filePath.includes('/services/')) {
      validateService(data, filePath);
    } else if (filePath.includes('/testimonials/')) {
      validateTestimonial(data, filePath);
    }

    return true;
  } catch (error) {
    console.error(`Content validation failed for ${filePath}:`, error);
    return false;
  }
}

export function validateAllContent(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate all blog posts
  const blogDir = path.join(contentDirectory, 'blog');
  if (fs.existsSync(blogDir)) {
    const blogFiles = fs
      .readdirSync(blogDir)
      .filter(name => name.endsWith('.md'));
    blogFiles.forEach(fileName => {
      const filePath = path.join(blogDir, fileName);
      if (!validateContentFile(filePath)) {
        errors.push(`Invalid blog post: ${fileName}`);
      }
    });
  }

  // Validate all services
  const servicesDir = path.join(contentDirectory, 'services');
  if (fs.existsSync(servicesDir)) {
    const serviceFiles = fs
      .readdirSync(servicesDir)
      .filter(name => name.endsWith('.md'));
    serviceFiles.forEach(fileName => {
      const filePath = path.join(servicesDir, fileName);
      if (!validateContentFile(filePath)) {
        errors.push(`Invalid service: ${fileName}`);
      }
    });
  }

  // Validate all testimonials
  const testimonialsDir = path.join(contentDirectory, 'testimonials');
  if (fs.existsSync(testimonialsDir)) {
    const testimonialFiles = fs
      .readdirSync(testimonialsDir)
      .filter(name => name.endsWith('.md'));
    testimonialFiles.forEach(fileName => {
      const filePath = path.join(testimonialsDir, fileName);
      if (!validateContentFile(filePath)) {
        errors.push(`Invalid testimonial: ${fileName}`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Content caching mechanism
interface ContentCache {
  posts: BlogPost[] | null;
  services: Service[] | null;
  testimonials: Testimonial[] | null;
  lastUpdated: {
    posts: number;
    services: number;
    testimonials: number;
  };
}

const contentCache: ContentCache = {
  posts: null,
  services: null,
  testimonials: null,
  lastUpdated: {
    posts: 0,
    services: 0,
    testimonials: 0,
  },
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

function isCacheValid(lastUpdated: number): boolean {
  return Date.now() - lastUpdated < CACHE_DURATION;
}

function getDirectoryLastModified(dirPath: string): number {
  if (!fs.existsSync(dirPath)) {
    return 0;
  }

  const files = fs.readdirSync(dirPath).filter(name => name.endsWith('.md'));
  let lastModified = 0;

  files.forEach(fileName => {
    const filePath = path.join(dirPath, fileName);
    const stats = fs.statSync(filePath);
    if (stats.mtime.getTime() > lastModified) {
      lastModified = stats.mtime.getTime();
    }
  });

  return lastModified;
}

// Enhanced content fetching with caching
export function getAllPostsCached(): BlogPost[] {
  const postsDir = path.join(contentDirectory, 'blog');
  const dirLastModified = getDirectoryLastModified(postsDir);

  if (
    contentCache.posts &&
    isCacheValid(contentCache.lastUpdated.posts) &&
    dirLastModified <= contentCache.lastUpdated.posts
  ) {
    return contentCache.posts;
  }

  const posts = getAllPosts();
  contentCache.posts = posts;
  contentCache.lastUpdated.posts = Date.now();

  return posts;
}

export function getAllServicesCached(): Service[] {
  const servicesDir = path.join(contentDirectory, 'services');
  const dirLastModified = getDirectoryLastModified(servicesDir);

  if (
    contentCache.services &&
    isCacheValid(contentCache.lastUpdated.services) &&
    dirLastModified <= contentCache.lastUpdated.services
  ) {
    return contentCache.services;
  }

  const services = getAllServices();
  contentCache.services = services;
  contentCache.lastUpdated.services = Date.now();

  return services;
}

export function getAllTestimonialsCached(): Testimonial[] {
  const testimonialsDir = path.join(contentDirectory, 'testimonials');
  const dirLastModified = getDirectoryLastModified(testimonialsDir);

  if (
    contentCache.testimonials &&
    isCacheValid(contentCache.lastUpdated.testimonials) &&
    dirLastModified <= contentCache.lastUpdated.testimonials
  ) {
    return contentCache.testimonials;
  }

  const testimonials = getAllTestimonials();
  contentCache.testimonials = testimonials;
  contentCache.lastUpdated.testimonials = Date.now();

  return testimonials;
}

// Content filtering and sorting functions
export interface BlogPostFilters {
  category?: string;
  tag?: string;
  featured?: boolean;
  author?: string;
  limit?: number;
  offset?: number;
}

export function getFilteredPosts(filters: BlogPostFilters = {}): BlogPost[] {
  let posts = getAllPostsCached();

  // Apply filters
  if (filters.category) {
    posts = posts.filter(post =>
      post.categories.some(
        cat => cat.toLowerCase() === filters.category!.toLowerCase()
      )
    );
  }

  if (filters.tag) {
    posts = posts.filter(post =>
      post.tags.some(tag => tag.toLowerCase() === filters.tag!.toLowerCase())
    );
  }

  if (filters.featured !== undefined) {
    posts = posts.filter(post => post.featured === filters.featured);
  }

  if (filters.author) {
    posts = posts.filter(post =>
      post.author.toLowerCase().includes(filters.author!.toLowerCase())
    );
  }

  // Apply pagination
  if (filters.offset) {
    posts = posts.slice(filters.offset);
  }

  if (filters.limit) {
    posts = posts.slice(0, filters.limit);
  }

  return posts;
}

export function getFeaturedPosts(limit: number = 3): BlogPost[] {
  return getFilteredPosts({ featured: true, limit });
}

export function getRecentPosts(limit: number = 5): BlogPost[] {
  return getFilteredPosts({ limit });
}

export function getPostsByCategory(
  category: string,
  limit?: number
): BlogPost[] {
  return getFilteredPosts({ category, limit });
}

export function getPostsByTag(tag: string, limit?: number): BlogPost[] {
  return getFilteredPosts({ tag, limit });
}

export function getPostsByAuthor(author: string, limit?: number): BlogPost[] {
  return getFilteredPosts({ author, limit });
}

// Service filtering functions
export interface ServiceFilters {
  featured?: boolean;
  limit?: number;
  offset?: number;
}

export function getFilteredServices(filters: ServiceFilters = {}): Service[] {
  let services = getAllServicesCached();

  // Apply filters
  if (filters.featured !== undefined) {
    // Assuming featured services have order < 3 or some other criteria
    services = services.filter(service => service.order < 3);
  }

  // Apply pagination
  if (filters.offset) {
    services = services.slice(filters.offset);
  }

  if (filters.limit) {
    services = services.slice(0, filters.limit);
  }

  return services;
}

export function getFeaturedServices(limit: number = 3): Service[] {
  return getFilteredServices({ featured: true, limit });
}

// Testimonial filtering functions
export interface TestimonialFilters {
  featured?: boolean;
  serviceRelated?: string;
  minRating?: number;
  limit?: number;
  offset?: number;
}

export function getFilteredTestimonials(
  filters: TestimonialFilters = {}
): Testimonial[] {
  let testimonials = getAllTestimonialsCached();

  // Apply filters
  if (filters.featured !== undefined) {
    testimonials = testimonials.filter(
      testimonial => testimonial.featured === filters.featured
    );
  }

  if (filters.serviceRelated) {
    testimonials = testimonials.filter(testimonial =>
      testimonial.serviceRelated?.includes(filters.serviceRelated!)
    );
  }

  if (filters.minRating) {
    testimonials = testimonials.filter(
      testimonial => testimonial.rating >= filters.minRating!
    );
  }

  // Apply pagination
  if (filters.offset) {
    testimonials = testimonials.slice(filters.offset);
  }

  if (filters.limit) {
    testimonials = testimonials.slice(0, filters.limit);
  }

  return testimonials;
}

export function getFeaturedTestimonials(limit: number = 3): Testimonial[] {
  return getFilteredTestimonials({ featured: true, limit });
}

export function getTestimonialsByService(
  serviceSlug: string,
  limit?: number
): Testimonial[] {
  return getFilteredTestimonials({ serviceRelated: serviceSlug, limit });
}

export function getHighRatedTestimonials(
  minRating: number = 4,
  limit?: number
): Testimonial[] {
  return getFilteredTestimonials({ minRating, limit });
}

// Content search functionality
export function searchPosts(query: string, limit?: number): BlogPost[] {
  const posts = getAllPostsCached();
  const searchTerm = query.toLowerCase();

  const matchingPosts = posts.filter(
    post =>
      post.title.toLowerCase().includes(searchTerm) ||
      post.excerpt.toLowerCase().includes(searchTerm) ||
      post.content.toLowerCase().includes(searchTerm) ||
      post.categories.some(cat => cat.toLowerCase().includes(searchTerm)) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
      post.author.toLowerCase().includes(searchTerm)
  );

  return limit ? matchingPosts.slice(0, limit) : matchingPosts;
}

export function searchServices(query: string, limit?: number): Service[] {
  const services = getAllServicesCached();
  const searchTerm = query.toLowerCase();

  const matchingServices = services.filter(
    service =>
      service.title.toLowerCase().includes(searchTerm) ||
      service.shortDescription.toLowerCase().includes(searchTerm) ||
      service.content.toLowerCase().includes(searchTerm) ||
      service.features.some(feature =>
        feature.toLowerCase().includes(searchTerm)
      ) ||
      service.benefits.some(benefit =>
        benefit.toLowerCase().includes(searchTerm)
      )
  );

  return limit ? matchingServices.slice(0, limit) : matchingServices;
}

// Cache management functions
export function clearContentCache(): void {
  contentCache.posts = null;
  contentCache.services = null;
  contentCache.testimonials = null;
  contentCache.lastUpdated = {
    posts: 0,
    services: 0,
    testimonials: 0,
  };
}

export function getCacheStatus(): {
  posts: { cached: boolean; lastUpdated: Date | null };
  services: { cached: boolean; lastUpdated: Date | null };
  testimonials: { cached: boolean; lastUpdated: Date | null };
} {
  return {
    posts: {
      cached: contentCache.posts !== null,
      lastUpdated:
        contentCache.lastUpdated.posts > 0
          ? new Date(contentCache.lastUpdated.posts)
          : null,
    },
    services: {
      cached: contentCache.services !== null,
      lastUpdated:
        contentCache.lastUpdated.services > 0
          ? new Date(contentCache.lastUpdated.services)
          : null,
    },
    testimonials: {
      cached: contentCache.testimonials !== null,
      lastUpdated:
        contentCache.lastUpdated.testimonials > 0
          ? new Date(contentCache.lastUpdated.testimonials)
          : null,
    },
  };
}
