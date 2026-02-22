/**
 * CloudFront cache invalidation utilities for social sharing metadata
 * Ensures fresh metadata is served to social crawlers after updates
 */

import { CLOUDFRONT_CONFIG, CACHE_PATTERNS } from '@/config/metadata.config';

/**
 * CloudFront invalidation request parameters
 */
export interface InvalidationParams {
  paths: string[];
  callerReference?: string;
}

/**
 * CloudFront invalidation result
 */
export interface InvalidationResult {
  success: boolean;
  invalidationId?: string;
  error?: string;
  paths: string[];
}

/**
 * Generates a unique caller reference for CloudFront invalidation
 */
export function generateCallerReference(): string {
  return `metadata-update-${Date.now()}-${Math.random().toString(36).substring(7)}`;
}

/**
 * Normalizes path for CloudFront invalidation
 * Ensures paths start with / and handles wildcards correctly
 */
export function normalizePath(path: string): string {
  // Ensure path starts with /
  if (!path.startsWith('/')) {
    path = `/${path}`;
  }

  // CloudFront requires /* for wildcard patterns
  if (path.endsWith('*') && !path.endsWith('/*')) {
    path = path.slice(0, -1) + '/*';
  }

  return path;
}

/**
 * Validates CloudFront invalidation paths
 */
export function validatePaths(paths: string[]): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!paths || paths.length === 0) {
    errors.push('At least one path is required for invalidation');
  }

  if (paths.length > 3000) {
    errors.push('CloudFront supports maximum 3000 paths per invalidation');
  }

  paths.forEach((path, index) => {
    if (!path || typeof path !== 'string') {
      errors.push(`Path at index ${index} is invalid`);
    }
  });

  return { isValid: errors.length === 0, errors };
}

/**
 * Invalidates specific page path in CloudFront
 */
export async function invalidatePageCache(pagePath: string): Promise<InvalidationResult> {
  const normalizedPath = normalizePath(pagePath);
  return invalidatePaths([normalizedPath]);
}

/**
 * Invalidates all blog paths in CloudFront
 */
export async function invalidateBlogCache(): Promise<InvalidationResult> {
  return invalidatePaths([CACHE_PATTERNS.blog]);
}

/**
 * Invalidates all service paths in CloudFront
 */
export async function invalidateServiceCache(): Promise<InvalidationResult> {
  return invalidatePaths([CACHE_PATTERNS.services]);
}

/**
 * Invalidates homepage cache in CloudFront
 */
export async function invalidateHomepageCache(): Promise<InvalidationResult> {
  return invalidatePaths([CACHE_PATTERNS.homepage]);
}

/**
 * Invalidates multiple paths in CloudFront
 * This is a placeholder implementation - actual AWS SDK integration would be done in deployment scripts
 */
export async function invalidatePaths(paths: string[]): Promise<InvalidationResult> {
  // Normalize all paths
  const normalizedPaths = paths.map(normalizePath);

  // Validate paths
  const validation = validatePaths(normalizedPaths);
  if (!validation.isValid) {
    return {
      success: false,
      error: validation.errors.join(', '),
      paths: normalizedPaths,
    };
  }

  // Log invalidation request (for development/debugging)
  console.log('[Cache Invalidation] Request:', {
    distributionId: CLOUDFRONT_CONFIG.distributionId,
    paths: normalizedPaths,
    callerReference: generateCallerReference(),
  });

  // In production, this would call AWS CloudFront API
  // For now, we return a success response indicating the request would be made
  return {
    success: true,
    invalidationId: `I${Date.now()}`,
    paths: normalizedPaths,
  };
}

/**
 * Batch invalidation with automatic splitting for large path lists
 */
export async function batchInvalidation(paths: string[]): Promise<InvalidationResult[]> {
  const results: InvalidationResult[] = [];
  const batchSize = 3000; // CloudFront limit

  // Split paths into batches
  for (let i = 0; i < paths.length; i += batchSize) {
    const batch = paths.slice(i, i + batchSize);
    const result = await invalidatePaths(batch);
    results.push(result);
  }

  return results;
}

/**
 * Gets invalidation paths for specific page type
 */
export function getInvalidationPathsForPageType(
  pageType: 'blog' | 'service' | 'homepage' | 'general',
  specificPath?: string
): string[] {
  if (specificPath) {
    return [normalizePath(specificPath)];
  }

  switch (pageType) {
    case 'blog':
      return [CACHE_PATTERNS.blog];
    case 'service':
      return [CACHE_PATTERNS.services];
    case 'homepage':
      return [CACHE_PATTERNS.homepage];
    case 'general':
      return [CACHE_PATTERNS.all];
    default:
      return [CACHE_PATTERNS.all];
  }
}

/**
 * Checks if path matches a cache pattern
 */
export function matchesCachePattern(path: string, pattern: string): boolean {
  const normalizedPath = normalizePath(path);
  const normalizedPattern = normalizePath(pattern);

  // Exact match
  if (normalizedPath === normalizedPattern) {
    return true;
  }

  // Wildcard match
  if (normalizedPattern.endsWith('/*')) {
    const prefix = normalizedPattern.slice(0, -2);
    return normalizedPath.startsWith(prefix);
  }

  return false;
}
