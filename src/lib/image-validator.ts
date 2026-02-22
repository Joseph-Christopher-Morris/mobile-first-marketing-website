/**
 * Image validation utilities for social sharing
 * Validates images against platform requirements (1200×630, 1.91:1 ratio, JPG/PNG/WebP)
 */

import { IMAGE_REQUIREMENTS, SITE_CONFIG } from '@/config/metadata.config';
import { ImageValidationResult } from '@/types/metadata';

/**
 * Validates image dimensions meet minimum requirements
 */
export function validateImageDimensions(
  width: number,
  height: number
): { isValid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (width < IMAGE_REQUIREMENTS.minWidth) {
    errors.push(
      `Image width ${width}px is below minimum ${IMAGE_REQUIREMENTS.minWidth}px`
    );
  }

  if (height < IMAGE_REQUIREMENTS.minHeight) {
    errors.push(
      `Image height ${height}px is below minimum ${IMAGE_REQUIREMENTS.minHeight}px`
    );
  }

  // Calculate aspect ratio
  const aspectRatio = width / height;
  const expectedRatio = IMAGE_REQUIREMENTS.aspectRatio;
  const tolerance = 0.05; // 5% tolerance

  if (Math.abs(aspectRatio - expectedRatio) > tolerance) {
    warnings.push(
      `Image aspect ratio ${aspectRatio.toFixed(2)}:1 differs from optimal ${expectedRatio}:1`
    );
  }

  return { isValid: errors.length === 0, errors, warnings };
}

/**
 * Validates image format is supported
 */
export function validateImageFormat(
  imagePath: string
): { isValid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Extract file extension
  const extension = imagePath.split('.').pop()?.toLowerCase();

  if (!extension) {
    errors.push('Image path has no file extension');
    return { isValid: false, errors, warnings };
  }

  if (!IMAGE_REQUIREMENTS.formats.includes(extension)) {
    errors.push(
      `Image format .${extension} is not supported. Use: ${IMAGE_REQUIREMENTS.formats.join(', ')}`
    );
  }

  return { isValid: errors.length === 0, errors, warnings };
}

/**
 * Validates image URL is publicly accessible
 */
export function validateImageAccessibility(
  imageUrl: string
): { isValid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if URL is absolute
  if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
    errors.push('Image URL must be absolute (starting with http:// or https://)');
  }

  // Check if URL uses HTTPS
  if (imageUrl.startsWith('http://')) {
    warnings.push('Image URL should use HTTPS for security');
  }

  // Check if URL is from our domain or CloudFront
  const isOurDomain =
    imageUrl.startsWith(SITE_CONFIG.url) ||
    imageUrl.includes('cloudfront.net');

  if (!isOurDomain) {
    warnings.push('Image URL is from external domain - ensure it is publicly accessible');
  }

  return { isValid: errors.length === 0, errors, warnings };
}

/**
 * Validates complete image requirements for social sharing
 */
export function validateImage(
  imagePath: string,
  dimensions?: { width: number; height: number }
): ImageValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate format
  const formatValidation = validateImageFormat(imagePath);
  errors.push(...formatValidation.errors);
  warnings.push(...formatValidation.warnings);

  // Validate dimensions if provided
  if (dimensions) {
    const dimensionValidation = validateImageDimensions(
      dimensions.width,
      dimensions.height
    );
    errors.push(...dimensionValidation.errors);
    warnings.push(...dimensionValidation.warnings);
  }

  // Build result
  const result: ImageValidationResult = {
    isValid: errors.length === 0,
    errors,
    warnings,
  };

  if (dimensions) {
    result.dimensions = {
      width: dimensions.width,
      height: dimensions.height,
      aspectRatio: dimensions.width / dimensions.height,
    };
  }

  return result;
}

/**
 * Validates image URL for social sharing
 */
export function validateImageUrl(imageUrl: string): ImageValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate accessibility
  const accessibilityValidation = validateImageAccessibility(imageUrl);
  errors.push(...accessibilityValidation.errors);
  warnings.push(...accessibilityValidation.warnings);

  // Validate format from URL
  const formatValidation = validateImageFormat(imageUrl);
  errors.push(...formatValidation.errors);
  warnings.push(...formatValidation.warnings);

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Checks if image meets all social sharing requirements
 */
export function meetsImageRequirements(
  imagePath: string,
  dimensions?: { width: number; height: number }
): boolean {
  const validation = validateImage(imagePath, dimensions);
  return validation.isValid;
}
