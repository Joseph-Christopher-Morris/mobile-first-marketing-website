import { Metadata } from 'next';

interface BuildMetadataParams {
  intent: string;
  qualifier?: string;
  description: string;
  canonicalPath: string;
  ogImage?: string;
  noindex?: boolean;
}

// Constants
const BRAND = 'Vivid Media Cheshire';
export const SITE_URL = 'https://vividmediacheshire.com';

/**
 * Build standardized title with brand appended once
 */
function buildTitle(intent: string, qualifier?: string): string {
  if (qualifier) {
    return `${intent} ${qualifier} | ${BRAND}`;
  }
  return `${intent} | ${BRAND}`;
}

/**
 * Clean and truncate description to prevent keyword stuffing
 */
function cleanDescription(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 155);
}

/**
 * Build metadata for a page with standardized branding
 */
export function buildMetadata({
  intent,
  qualifier,
  description,
  canonicalPath,
  ogImage = '/og-image.jpg',
  noindex = false,
}: BuildMetadataParams): Metadata {
  // Normalize canonical path to always have trailing slash (except root)
  const normalizedPath = canonicalPath === '/' 
    ? '/' 
    : canonicalPath.endsWith('/') 
      ? canonicalPath 
      : `${canonicalPath}/`;
  
  // Build absolute canonical URL
  const canonicalUrl = `${SITE_URL}${normalizedPath}`;

  // Build full title with brand
  const fullTitle = buildTitle(intent, qualifier);
  
  // Clean description
  const cleanedDescription = cleanDescription(description);

  const metadata: Metadata = {
    title: fullTitle,
    description: cleanedDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: fullTitle,
      description: cleanedDescription,
      url: canonicalUrl,
      siteName: BRAND,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
      locale: 'en_GB',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
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
