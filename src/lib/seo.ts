import { Metadata } from 'next';

interface BuildSEOParams {
  intent: string;
  qualifier?: string;
  description: string;
  canonicalPath: string;
  ogImage?: string;
  noindex?: boolean;
  skipTitleValidation?: boolean;
}

// Constants
const BRAND = 'Vivid Media Cheshire';
export const SITE_URL = 'https://vividmediacheshire.com';

/**
 * Detects if the brand name "Vivid Media Cheshire" appears in the intent or qualifier.
 * This prevents duplicate brand names in titles when the layout template appends the brand.
 * 
 * @param intent - The primary keyword or intent for the page
 * @param qualifier - Optional supporting context or qualifier
 * @returns Object with cleaned intent/qualifier and a warning flag if duplicate detected
 */
function detectDuplicateBrand(intent: string, qualifier?: string): {
  cleanIntent: string;
  cleanQualifier?: string;
  hasDuplicate: boolean;
} {
  const brandRegex = new RegExp(BRAND, 'gi');
  const intentHasBrand = brandRegex.test(intent);
  const qualifierHasBrand = qualifier ? brandRegex.test(qualifier) : false;
  
  if (intentHasBrand || qualifierHasBrand) {
    console.warn(
      `[SEO Warning] Brand name "${BRAND}" detected in ${intentHasBrand ? 'intent' : 'qualifier'}. ` +
      `This may cause duplication since the layout template appends the brand automatically.`
    );
    
    return {
      cleanIntent: intent.replace(brandRegex, '').trim(),
      cleanQualifier: qualifier?.replace(brandRegex, '').trim(),
      hasDuplicate: true,
    };
  }
  
  return {
    cleanIntent: intent,
    cleanQualifier: qualifier,
    hasDuplicate: false,
  };
}

/**
 * Validates that the title length (without brand suffix) is under 36 characters.
 * This ensures the final title with " | Vivid Media Cheshire" (24 chars) stays under 60 characters.
 * 
 * @param title - The title to validate (without brand suffix)
 * @throws Error if title exceeds 36 characters
 */
function validateTitleLength(title: string): void {
  const MAX_TITLE_LENGTH = 36;
  const BRAND_SUFFIX_LENGTH = 24; // " | Vivid Media Cheshire" = 24 chars (space + pipe + space + brand name)
  
  if (title.length > MAX_TITLE_LENGTH) {
    const finalLength = title.length + BRAND_SUFFIX_LENGTH;
    throw new Error(
      `[SEO Error] Title "${title}" is ${title.length} characters (max: ${MAX_TITLE_LENGTH}). ` +
      `Final title with brand will be ${finalLength} characters, exceeding the 60 character limit. ` +
      `Please shorten the title.`
    );
  }
}

/**
 * Builds a clean title without the brand suffix.
 * The brand "| Vivid Media Cheshire" will be appended by the layout template.
 * 
 * @param intent - The primary keyword or intent for the page
 * @param qualifier - Optional supporting context or qualifier
 * @param skipValidation - Skip the 36 character length validation (for blog posts)
 * @returns Clean title without brand suffix
 */
function buildCleanTitle(intent: string, qualifier?: string, skipValidation: boolean = false): string {
  // Detect and remove any duplicate brand names
  const { cleanIntent, cleanQualifier } = detectDuplicateBrand(intent, qualifier);
  
  // Build title without brand suffix and trim whitespace
  const title = cleanQualifier ? `${cleanIntent} ${cleanQualifier}` : cleanIntent;
  const trimmedTitle = title.trim();
  
  // Validate it's not empty
  if (!trimmedTitle) {
    throw new Error('[SEO Error] Title cannot be empty or whitespace-only');
  }
  
  // Validate title length on trimmed title (skip for blog posts)
  if (!skipValidation) {
    validateTitleLength(trimmedTitle);
  }
  
  return trimmedTitle;
}

/**
 * Cleans and validates meta description to prevent keyword stuffing and ensure optimal length.
 * Enforces 140-155 character range for conversion-focused descriptions.
 * 
 * @param text - The raw description text
 * @returns Cleaned and validated description between 140-155 characters
 */
function cleanDescription(text: string): string {
  const MIN_LENGTH = 140;
  const MAX_LENGTH = 155;
  
  // Clean whitespace and trim
  const cleaned = text.replace(/\s+/g, ' ').trim();
  
  // Validate minimum length
  if (cleaned.length < MIN_LENGTH) {
    console.warn(
      `[SEO Warning] Description is ${cleaned.length} characters (min: ${MIN_LENGTH}). ` +
      `Consider adding more conversion-focused content with locality keywords.`
    );
  }
  
  // Truncate to maximum length
  const truncated = cleaned.slice(0, MAX_LENGTH);
  
  // Validate final length is in optimal range
  if (truncated.length >= MIN_LENGTH && truncated.length <= MAX_LENGTH) {
    return truncated;
  }
  
  return truncated;
}

/**
 * Builds standardized SEO metadata for a page with clean titles (no brand duplication).
 * The brand "| Vivid Media Cheshire" is appended by the root layout template, not here.
 * 
 * This function generates:
 * - Clean page title without brand suffix (layout template adds it)
 * - Conversion-focused meta description (140-155 characters)
 * - OpenGraph metadata for social sharing
 * - Twitter card metadata
 * - Canonical URL with proper normalization
 * - Optional robots meta tags for noindex pages
 * 
 * @param params - SEO parameters including intent, qualifier, description, canonical path, etc.
 * @returns Next.js Metadata object with all SEO fields
 * 
 * @example
 * ```typescript
 * export const metadata = buildSEO({
 *   intent: "Digital Marketing Services",
 *   qualifier: "for Small Businesses",
 *   description: "Transform your online presence with expert digital marketing...",
 *   canonicalPath: "/services",
 * });
 * ```
 */
export function buildSEO({
  intent,
  qualifier,
  description,
  canonicalPath,
  ogImage = '/og-image.jpg',
  noindex = false,
  skipTitleValidation = false,
}: BuildSEOParams): Metadata {
  // Normalize canonical path to always have trailing slash (except root)
  const normalizedPath = canonicalPath === '/' 
    ? '/' 
    : canonicalPath.endsWith('/') 
      ? canonicalPath 
      : `${canonicalPath}/`;
  
  // Build absolute canonical URL
  const canonicalUrl = `${SITE_URL}${normalizedPath}`;

  // Build clean title without brand (layout template will append it)
  const cleanTitle = buildCleanTitle(intent, qualifier, skipTitleValidation);
  
  // Clean and validate description
  const cleanedDescription = cleanDescription(description);

  const metadata: Metadata = {
    title: cleanTitle,
    description: cleanedDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: cleanTitle,
      description: cleanedDescription,
      url: canonicalUrl,
      siteName: BRAND,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: cleanTitle,
        },
      ],
      locale: 'en_GB',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: cleanTitle,
      description: cleanedDescription,
      images: [ogImage],
    },
  };

  if (noindex) {
    metadata.robots = {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
      },
    };
  }

  return metadata;
}

// Legacy export for backward compatibility during migration
export const buildMetadata = buildSEO;
