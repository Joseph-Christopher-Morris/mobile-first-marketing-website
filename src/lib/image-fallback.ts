/**
 * Fallback image system for social sharing
 * Provides default branded images when specific images are missing
 */

import { PageType } from '@/types/metadata';
import { DEFAULT_IMAGES, SITE_CONFIG } from '@/config/metadata.config';
import { validateImageUrl } from './image-validator';

/**
 * Generates absolute URL from relative path
 */
function toAbsoluteUrl(path: string): string {
  // If already absolute, return as-is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // Normalize path to always have leading slash
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${SITE_CONFIG.url}${normalizedPath}`;
}

/**
 * Gets fallback image path for page type
 */
export function getFallbackImagePath(pageType: PageType): string {
  return DEFAULT_IMAGES[pageType] || DEFAULT_IMAGES.general;
}

/**
 * Gets fallback image URL for page type
 */
export function getFallbackImageUrl(pageType: PageType): string {
  const imagePath = getFallbackImagePath(pageType);
  return toAbsoluteUrl(imagePath);
}

/**
 * Resolves image URL with fallback handling
 * Returns the provided image if valid, otherwise returns fallback
 */
export function resolveImageUrl(
  imageUrl: string | undefined,
  pageType: PageType
): string {
  // If no image provided, use fallback
  if (!imageUrl || imageUrl.trim() === '') {
    return getFallbackImageUrl(pageType);
  }

  // Convert to absolute URL if relative
  const absoluteUrl = toAbsoluteUrl(imageUrl);

  // Validate the image URL
  const validation = validateImageUrl(absoluteUrl);

  // If validation fails, use fallback
  if (!validation.isValid) {
    console.warn(
      `[Image Fallback] Invalid image URL "${imageUrl}":`,
      validation.errors
    );
    return getFallbackImageUrl(pageType);
  }

  // Log warnings if any
  if (validation.warnings.length > 0) {
    console.warn(`[Image Fallback] Image URL warnings:`, validation.warnings);
  }

  return absoluteUrl;
}

/**
 * Checks if image URL is a fallback image
 */
export function isFallbackImage(imageUrl: string): boolean {
  const fallbackUrls = Object.values(DEFAULT_IMAGES).map((path) =>
    toAbsoluteUrl(path)
  );
  return fallbackUrls.includes(imageUrl);
}

/**
 * Gets all available fallback images
 */
export function getAllFallbackImages(): Record<PageType, string> {
  return {
    homepage: getFallbackImageUrl('homepage'),
    blog: getFallbackImageUrl('blog'),
    service: getFallbackImageUrl('service'),
    general: getFallbackImageUrl('general'),
  };
}
