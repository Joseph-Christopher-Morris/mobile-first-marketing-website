/**
 * TypeScript types for social sharing metadata generation
 * Supports Open Graph and Twitter Card metadata for all page types
 */

/**
 * Page types supported by the metadata generation system
 */
export type PageType = 'blog' | 'service' | 'homepage' | 'general';

/**
 * Open Graph metadata structure
 * Used for social sharing on Facebook, LinkedIn, and other platforms
 */
export interface OpenGraphData {
  type: 'website' | 'article';
  title: string;
  description: string;
  url: string;
  image: string;
  siteName: string;
  locale?: string;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
}

/**
 * Twitter Card metadata structure
 * Used for social sharing on X (formerly Twitter)
 */
export interface TwitterCardData {
  card: 'summary_large_image';
  title: string;
  description: string;
  image: string;
  creator?: string;
  site?: string;
}

/**
 * Complete page metadata including Open Graph and Twitter Card data
 */
export interface PageMetadata {
  title: string;
  description: string;
  image: string;
  url: string;
  type: 'website' | 'article';
  siteName: string;
  openGraph: OpenGraphData;
  twitter: TwitterCardData;
}

/**
 * Blog article metadata extracted from content
 */
export interface BlogMetadata {
  slug: string;
  title: string;
  description: string;
  heroImage: string;
  publishedDate?: string;
  modifiedDate?: string;
  author?: string;
  tags?: string[];
  excerpt?: string;
}

/**
 * Service page metadata
 */
export interface ServiceMetadata {
  name: string;
  title: string;
  description: string;
  image: string;
  features?: string[];
  slug?: string;
}

/**
 * Generic page content structure
 */
export interface PageContent {
  title: string;
  description: string;
  image?: string;
  slug?: string;
  publishedDate?: string;
  modifiedDate?: string;
  author?: string;
  tags?: string[];
  type?: 'website' | 'article';
}

/**
 * Parameters for metadata generation
 */
export interface MetadataGenerationParams {
  pageType: PageType;
  content: PageContent;
  slug?: string;
  canonicalPath: string;
}

/**
 * Image validation requirements for social sharing
 */
export interface ImageRequirements {
  minWidth: number;
  minHeight: number;
  aspectRatio: number;
  formats: string[];
  maxFileSize?: number;
}

/**
 * Image validation result
 */
export interface ImageValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  dimensions?: {
    width: number;
    height: number;
    aspectRatio: number;
  };
}

/**
 * Metadata generation result with validation status
 */
export interface MetadataGenerationResult {
  metadata: PageMetadata;
  isValid: boolean;
  errors: string[];
  warnings: string[];
}
