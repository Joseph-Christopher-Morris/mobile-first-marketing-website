/**
 * Metadata generation utilities for social sharing
 * Central export point for all metadata-related functionality
 */

export {
  generateMetadata,
  generatePageMetadata,
  generateOpenGraphData,
  generateTwitterCardData,
  generateAbsoluteUrl,
  generateImageUrl,
  getFallbackImage,
  getFallbackMetadata,
  toNextMetadata,
} from '../metadata-generator';

export type {
  PageType,
  PageMetadata,
  PageContent,
  MetadataGenerationParams,
  MetadataGenerationResult,
  OpenGraphData,
  TwitterCardData,
  BlogMetadata,
  ServiceMetadata,
  ImageRequirements,
  ImageValidationResult,
} from '@/types/metadata';

export {
  SITE_CONFIG,
  IMAGE_REQUIREMENTS,
  DEFAULT_IMAGES,
  DEFAULT_METADATA,
  METADATA_CONSTRAINTS,
  CLOUDFRONT_CONFIG,
  CACHE_PATTERNS,
  VALIDATION_URLS,
} from '@/config/metadata.config';
