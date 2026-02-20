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
  const titleParts = [intent];
  if (qualifier) {
    titleParts.push(qualifier);
  }
  const title = `${titleParts.join(' ')} | Vivid Media Cheshire`;

  // Normalize whitespace in description
  const normalizedDescription = description.replace(/\s+/g, ' ').trim();

  // Build absolute OpenGraph URL
  const absoluteUrl = `https://vividmediacheshire.com${canonicalPath}`;

  const metadata: Metadata = {
    title,
    description: normalizedDescription,
    alternates: {
      canonical: canonicalPath,
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
