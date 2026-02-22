import { Metadata } from 'next';

interface BuildMetadataParams {
  intent: string;
  qualifier?: string;
  description: string;
  canonicalPath: string;
  ogImage?: string;
  noindex?: boolean;
}

export function buildMetadata({
  intent,
  qualifier,
  description,
  canonicalPath,
  ogImage = '/og-image.jpg',
  noindex = false,
}: BuildMetadataParams): Metadata {
  // Build title: Intent + Optional Qualifier + " | Vivid Media Cheshire"
  // Target: 45-60 characters total
  const titleParts = [intent];
  if (qualifier) {
    titleParts.push(qualifier);
  }
  const title = `${titleParts.join(' ')} | Vivid Media Cheshire`;

  // Normalize whitespace in description and enforce 120-155 character limit
  const normalizedDescription = description.replace(/\s+/g, ' ').trim();

  // Ensure canonical path has trailing slash for consistency
  const normalizedCanonicalPath = canonicalPath.endsWith('/') ? canonicalPath : `${canonicalPath}/`;
  
  // Build absolute canonical URL
  const absoluteCanonicalUrl = `https://vividmediacheshire.com${normalizedCanonicalPath}`;
  
  // Build absolute OpenGraph URL
  const absoluteUrl = `https://vividmediacheshire.com${canonicalPath}`;

  const metadata: Metadata = {
    title,
    description: normalizedDescription,
    alternates: {
      canonical: absoluteCanonicalUrl,
    },
    openGraph: {
      title,
      description: normalizedDescription,
      url: absoluteUrl,
      siteName: 'Vivid Media Cheshire',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'en_GB',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: normalizedDescription,
      images: [ogImage],
    },
  };

  if (noindex) {
    metadata.robots = {
      index: false,
      follow: false,
    };
  }

  return metadata;
}
