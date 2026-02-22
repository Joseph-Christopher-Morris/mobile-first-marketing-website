/**
 * Core metadata generation utilities for social sharing
 * Generates Open Graph and Twitter Card metadata for all page types
 */

import { Metadata } from 'next';
import {
  PageType,
  PageMetadata,
  PageContent,
  MetadataGenerationParams,
  MetadataGenerationResult,
  OpenGraphData,
  TwitterCardData,
} from '@/types/metadata';
import {
  SITE_CONFIG,
  DEFAULT_IMAGES,
  DEFAULT_METADATA,
  METADATA_CONSTRAINTS,
} from '@/config/metadata.config';

/**
 * Validates metadata title length
 */
function validateTitle(title: string): { isValid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!title || title.trim().length === 0) {
    errors.push('Title cannot be empty');
  }
  
  if (title.length < METADATA_CONSTRAINTS.title.min) {
    warnings.push(`Title is ${title.length} characters (min: ${METADATA_CONSTRAINTS.title.min})`);
  }
  
  if (title.length > METADATA_CONSTRAINTS.title.max) {
    errors.push(`Title is ${title.length} characters (max: ${METADATA_CONSTRAINTS.title.max})`);
  }
  
  return { isValid: errors.length === 0, errors, warnings };
}

/**
 * Validates metadata description length
 */
function validateDescription(description: string): { isValid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!description || description.trim().length === 0) {
    errors.push('Description cannot be empty');
  }
  
  if (description.length < METADATA_CONSTRAINTS.description.min) {
    warnings.push(`Description is ${description.length} characters (min: ${METADATA_CONSTRAINTS.description.min})`);
  }
  
  if (description.length > METADATA_CONSTRAINTS.description.max) {
    warnings.push(`Description is ${description.length} characters (max: ${METADATA_CONSTRAINTS.description.max})`);
  }
  
  return { isValid: errors.length === 0, errors, warnings };
}

/**
 * Generates absolute URL from path
 */
export function generateAbsoluteUrl(path: string): string {
  // Normalize path to always have leading slash
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  // Add trailing slash except for root
  const finalPath = normalizedPath === '/' 
    ? '/' 
    : normalizedPath.endsWith('/') 
      ? normalizedPath 
      : `${normalizedPath}/`;
  
  return `${SITE_CONFIG.url}${finalPath}`;
}

/**
 * Generates absolute image URL
 */
export function generateImageUrl(imagePath: string): string {
  if (!imagePath) {
    return generateAbsoluteUrl(DEFAULT_IMAGES.general);
  }
  
  // If already absolute URL, return as-is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Generate absolute URL from relative path
  return generateAbsoluteUrl(imagePath);
}

/**
 * Gets default fallback image for page type
 */
export function getFallbackImage(pageType: PageType): string {
  const imagePath = DEFAULT_IMAGES[pageType] || DEFAULT_IMAGES.general;
  return generateImageUrl(imagePath);
}

/**
 * Gets default fallback metadata for page type
 */
export function getFallbackMetadata(pageType: PageType): { title: string; description: string } {
  return DEFAULT_METADATA[pageType] || DEFAULT_METADATA.general;
}

/**
 * Generates Open Graph metadata
 */
export function generateOpenGraphData(
  content: PageContent,
  canonicalUrl: string,
  imageUrl: string
): OpenGraphData {
  const ogData: OpenGraphData = {
    type: content.type || 'website',
    title: content.title,
    description: content.description,
    url: canonicalUrl,
    image: imageUrl,
    siteName: SITE_CONFIG.name,
    locale: SITE_CONFIG.locale,
  };
  
  // Add article-specific metadata
  if (content.type === 'article') {
    if (content.publishedDate) {
      ogData.publishedTime = content.publishedDate;
    }
    if (content.modifiedDate) {
      ogData.modifiedTime = content.modifiedDate;
    }
    if (content.author) {
      ogData.author = content.author;
    }
    if (content.tags && content.tags.length > 0) {
      ogData.tags = content.tags;
    }
  }
  
  return ogData;
}

/**
 * Generates Twitter Card metadata
 */
export function generateTwitterCardData(
  content: PageContent,
  imageUrl: string
): TwitterCardData {
  return {
    card: 'summary_large_image',
    title: content.title,
    description: content.description,
    image: imageUrl,
    site: SITE_CONFIG.twitter,
  };
}

/**
 * Generates complete page metadata with validation
 */
export function generatePageMetadata(params: MetadataGenerationParams): MetadataGenerationResult {
  const { pageType, content, canonicalPath } = params;
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Validate title
  const titleValidation = validateTitle(content.title);
  errors.push(...titleValidation.errors);
  warnings.push(...titleValidation.warnings);
  
  // Validate description
  const descValidation = validateDescription(content.description);
  errors.push(...descValidation.errors);
  warnings.push(...descValidation.warnings);
  
  // Generate URLs
  const canonicalUrl = generateAbsoluteUrl(canonicalPath);
  const imageUrl = content.image 
    ? generateImageUrl(content.image) 
    : getFallbackImage(pageType);
  
  // Generate Open Graph and Twitter Card data
  const openGraph = generateOpenGraphData(content, canonicalUrl, imageUrl);
  const twitter = generateTwitterCardData(content, imageUrl);
  
  // Build complete metadata
  const metadata: PageMetadata = {
    title: content.title,
    description: content.description,
    image: imageUrl,
    url: canonicalUrl,
    type: content.type || 'website',
    siteName: SITE_CONFIG.name,
    openGraph,
    twitter,
  };
  
  return {
    metadata,
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Converts PageMetadata to Next.js Metadata format
 */
export function toNextMetadata(pageMetadata: PageMetadata): Metadata {
  const metadata: Metadata = {
    title: pageMetadata.title,
    description: pageMetadata.description,
    alternates: {
      canonical: pageMetadata.url,
    },
    openGraph: {
      type: pageMetadata.openGraph.type,
      title: pageMetadata.openGraph.title,
      description: pageMetadata.openGraph.description,
      url: pageMetadata.openGraph.url,
      siteName: pageMetadata.openGraph.siteName,
      locale: pageMetadata.openGraph.locale,
      images: [
        {
          url: pageMetadata.openGraph.image,
          width: 1200,
          height: 630,
          alt: pageMetadata.openGraph.title,
        },
      ],
    },
    twitter: {
      card: pageMetadata.twitter.card,
      title: pageMetadata.twitter.title,
      description: pageMetadata.twitter.description,
      images: [pageMetadata.twitter.image],
      site: pageMetadata.twitter.site,
    },
  };
  
  // Add article-specific metadata
  if (pageMetadata.openGraph.type === 'article' && metadata.openGraph) {
    const articleMetadata: any = {
      ...metadata.openGraph,
      type: 'article',
    };
    
    if (pageMetadata.openGraph.publishedTime) {
      articleMetadata.publishedTime = pageMetadata.openGraph.publishedTime;
    }
    if (pageMetadata.openGraph.modifiedTime) {
      articleMetadata.modifiedTime = pageMetadata.openGraph.modifiedTime;
    }
    if (pageMetadata.openGraph.author) {
      articleMetadata.authors = [pageMetadata.openGraph.author];
    }
    if (pageMetadata.openGraph.tags) {
      articleMetadata.tags = pageMetadata.openGraph.tags;
    }
    
    metadata.openGraph = articleMetadata;
  }
  
  return metadata;
}

/**
 * Main metadata generation function with fallback handling
 */
export function generateMetadata(params: MetadataGenerationParams): Metadata {
  try {
    const result = generatePageMetadata(params);
    
    // Log warnings if any
    if (result.warnings.length > 0) {
      console.warn('[Metadata Generator] Warnings:', result.warnings);
    }
    
    // Log errors if any
    if (result.errors.length > 0) {
      console.error('[Metadata Generator] Errors:', result.errors);
    }
    
    // Convert to Next.js Metadata format
    return toNextMetadata(result.metadata);
  } catch (error) {
    console.error('[Metadata Generator] Fatal error:', error);
    
    // Return fallback metadata
    const fallback = getFallbackMetadata(params.pageType);
    const fallbackImageUrl = getFallbackImage(params.pageType);
    const canonicalUrl = generateAbsoluteUrl(params.canonicalPath);
    
    return {
      title: fallback.title,
      description: fallback.description,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        type: 'website',
        title: fallback.title,
        description: fallback.description,
        url: canonicalUrl,
        siteName: SITE_CONFIG.name,
        locale: SITE_CONFIG.locale,
        images: [
          {
            url: fallbackImageUrl,
            width: 1200,
            height: 630,
            alt: fallback.title,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: fallback.title,
        description: fallback.description,
        images: [fallbackImageUrl],
        site: SITE_CONFIG.twitter,
      },
    };
  }
}
