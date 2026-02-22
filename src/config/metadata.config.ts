/**
 * Base configuration for social sharing metadata generation
 * Defines constants, defaults, and platform requirements
 */

import { ImageRequirements } from '@/types/metadata';

/**
 * Site-wide constants
 */
export const SITE_CONFIG = {
  name: 'Vivid Media Cheshire',
  url: 'https://vividmediacheshire.com',
  locale: 'en_GB',
  twitter: '@vividmediacheshire',
} as const;

/**
 * Image requirements for social sharing platforms
 * Based on Facebook, LinkedIn, Twitter, and WhatsApp specifications
 */
export const IMAGE_REQUIREMENTS: ImageRequirements = {
  minWidth: 1200,
  minHeight: 630,
  aspectRatio: 1.91, // 1200/630 = 1.904762 ≈ 1.91:1
  formats: ['jpg', 'jpeg', 'png', 'webp'],
  maxFileSize: 8 * 1024 * 1024, // 8MB (Facebook limit)
} as const;

/**
 * Default fallback images for different page types
 * All images must meet IMAGE_REQUIREMENTS specifications
 */
export const DEFAULT_IMAGES = {
  homepage: '/og-image.jpg',
  blog: '/og-image-blog.jpg',
  service: '/og-image-service.jpg',
  general: '/og-image.jpg',
} as const;

/**
 * Default metadata templates for fallback scenarios
 */
export const DEFAULT_METADATA = {
  homepage: {
    title: 'Vivid Media Cheshire',
    description: 'Professional digital marketing, photography, and content creation services in Cheshire. Transform your online presence with expert solutions.',
  },
  blog: {
    title: 'Blog',
    description: 'Insights, tips, and expertise on digital marketing, photography, and content creation from Vivid Media Cheshire.',
  },
  service: {
    title: 'Services',
    description: 'Explore our professional digital marketing, photography, and content creation services designed to elevate your brand.',
  },
  general: {
    title: 'Vivid Media Cheshire',
    description: 'Professional digital marketing and content creation services in Cheshire.',
  },
} as const;

/**
 * Metadata length constraints for optimal social sharing
 */
export const METADATA_CONSTRAINTS = {
  title: {
    min: 10,
    max: 60,
    optimal: 55,
  },
  description: {
    min: 140,
    max: 160,
    optimal: 155,
  },
  ogTitle: {
    min: 10,
    max: 95,
    optimal: 88,
  },
  ogDescription: {
    min: 140,
    max: 200,
    optimal: 155,
  },
} as const;

/**
 * CloudFront distribution configuration
 */
export const CLOUDFRONT_CONFIG = {
  distributionId: 'E2IBMHQ3GCW6ZK',
  domain: 'd15sc9fc739ev2.cloudfront.net',
  region: 'us-east-1',
} as const;

/**
 * Cache invalidation path patterns
 */
export const CACHE_PATTERNS = {
  blog: '/blog/*',
  services: '/services/*',
  homepage: '/',
  all: '/*',
} as const;

/**
 * Social platform validation URLs
 */
export const VALIDATION_URLS = {
  linkedin: 'https://www.linkedin.com/post-inspector/',
  facebook: 'https://developers.facebook.com/tools/debug/',
  twitter: 'https://cards-dev.twitter.com/validator',
  whatsapp: 'https://wa.me/',
} as const;
