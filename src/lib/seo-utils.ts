/**
 * SEO utility functions for generating canonical URLs, meta tags, and structured data
 */

export interface CanonicalUrlOptions {
  path: string;
  removeTrailingSlash?: boolean;
  removeQueryParams?: boolean;
}

/**
 * Generate canonical URL for a given path
 */
export function generateCanonicalUrl({
  path,
  removeTrailingSlash = true,
  removeQueryParams = true,
}: CanonicalUrlOptions): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';

  // Clean the path
  let cleanPath = path;

  // Remove query parameters if requested
  if (removeQueryParams && cleanPath.includes('?')) {
    cleanPath = cleanPath.split('?')[0];
  }

  // Remove trailing slash if requested (except for root)
  if (removeTrailingSlash && cleanPath !== '/' && cleanPath.endsWith('/')) {
    cleanPath = cleanPath.slice(0, -1);
  }

  // Ensure path starts with /
  if (!cleanPath.startsWith('/')) {
    cleanPath = `/${cleanPath}`;
  }

  return `${baseUrl}${cleanPath}`;
}

/**
 * Generate hreflang tags for multilingual sites
 */
export interface HreflangTag {
  hreflang: string;
  href: string;
}

export function generateHreflangTags(
  currentPath: string,
  supportedLocales: string[] = ['en']
): HreflangTag[] {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';

  return supportedLocales.map(locale => ({
    hreflang: locale,
    href: `${baseUrl}${locale === 'en' ? '' : `/${locale}`}${currentPath}`,
  }));
}

/**
 * Generate breadcrumb structured data
 */
export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function generateBreadcrumbStructuredData(
  breadcrumbs: BreadcrumbItem[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  };
}

/**
 * Generate FAQ structured data
 */
export interface FAQItem {
  question: string;
  answer: string;
}

export function generateFAQStructuredData(faqs: FAQItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generate organization structured data
 */
export function generateOrganizationStructuredData() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Mobile-First Marketing',
    description:
      'Professional marketing services with mobile-first approach specializing in photography, analytics, and ad campaigns.',
    url: baseUrl,
    logo: `${baseUrl}/images/logo.png`,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-555-0123',
      email: 'contact@mobilefirstmarketing.com',
      contactType: 'Customer Service',
      areaServed: 'US',
      availableLanguage: 'English',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: '123 Marketing Street',
      addressLocality: 'Digital City',
      addressRegion: 'CA',
      postalCode: '90210',
      addressCountry: 'US',
    },
    sameAs: [
      'https://facebook.com/mobilefirstmarketing',
      'https://twitter.com/mobilefirstmkt',
      'https://linkedin.com/company/mobile-first-marketing',
      'https://instagram.com/mobilefirstmarketing',
    ],
  };
}

/**
 * Clean and optimize meta description
 */
export function optimizeMetaDescription(
  description: string,
  maxLength: number = 160
): string {
  if (description.length <= maxLength) {
    return description;
  }

  // Truncate at word boundary
  const truncated = description.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');

  if (lastSpace > maxLength * 0.8) {
    return truncated.substring(0, lastSpace) + '...';
  }

  return truncated + '...';
}

/**
 * Generate keywords from content
 */
export function generateKeywords(
  content: string,
  existingKeywords: string[] = [],
  maxKeywords: number = 10
): string[] {
  // Simple keyword extraction (in a real app, you might use a more sophisticated NLP library)
  const words = content
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3);

  // Count word frequency
  const wordCount: Record<string, number> = {};
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });

  // Get most frequent words
  const sortedWords = Object.entries(wordCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, maxKeywords)
    .map(([word]) => word);

  // Combine with existing keywords and remove duplicates
  const allKeywords = [...existingKeywords, ...sortedWords];
  return [...new Set(allKeywords)].slice(0, maxKeywords);
}
