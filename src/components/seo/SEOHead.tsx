'use client';

import Head from 'next/head';
import { usePathname } from 'next/navigation';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    section?: string;
    tags?: string[];
  };
  noIndex?: boolean;
  canonicalUrl?: string;
}

const DEFAULT_TITLE =
  'Mobile-First Marketing Agency | Photography, Analytics & Ad Campaigns';
const DEFAULT_DESCRIPTION =
  'Professional marketing services with mobile-first approach. Specializing in photography, analytics, and ad campaigns to grow your business.';
const DEFAULT_IMAGE = '/images/hero-bg.jpg';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';

export default function SEOHead({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = [],
  image = DEFAULT_IMAGE,
  article,
  noIndex = false,
  canonicalUrl,
}: SEOHeadProps) {
  const pathname = usePathname();

  const fullTitle = title ? `${title} | Mobile-First Marketing` : DEFAULT_TITLE;
  const fullImageUrl = image.startsWith('http') ? image : `${SITE_URL}${image}`;
  const fullCanonicalUrl = canonicalUrl || `${SITE_URL}${pathname}`;

  const defaultKeywords = [
    'mobile marketing',
    'photography services',
    'analytics',
    'ad campaigns',
    'digital marketing',
    'mobile-first design',
  ];

  const allKeywords = [...defaultKeywords, ...keywords].join(', ');

  // Generate structured data for the page
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': article ? 'Article' : 'WebPage',
    name: fullTitle,
    description,
    url: fullCanonicalUrl,
    image: fullImageUrl,
    ...(article && {
      headline: title,
      datePublished: article.publishedTime,
      dateModified: article.modifiedTime || article.publishedTime,
      author: {
        '@type': 'Person',
        name: article.author || 'Marketing Team',
      },
      publisher: {
        '@type': 'Organization',
        name: 'Mobile-First Marketing',
        logo: {
          '@type': 'ImageObject',
          url: `${SITE_URL}/images/logo.png`,
        },
      },
      articleSection: article.section,
      keywords: article.tags?.join(', '),
    }),
  };

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name='description' content={description} />
      <meta name='keywords' content={allKeywords} />
      <link rel='canonical' href={fullCanonicalUrl} />

      {/* Robots */}
      {noIndex && <meta name='robots' content='noindex,nofollow' />}

      {/* Open Graph Tags */}
      <meta property='og:type' content={article ? 'article' : 'website'} />
      <meta property='og:title' content={fullTitle} />
      <meta property='og:description' content={description} />
      <meta property='og:image' content={fullImageUrl} />
      <meta property='og:url' content={fullCanonicalUrl} />
      <meta property='og:site_name' content='Mobile-First Marketing' />
      <meta property='og:locale' content='en_US' />

      {/* Article specific Open Graph tags */}
      {article && (
        <>
          {article.publishedTime && (
            <meta
              property='article:published_time'
              content={article.publishedTime}
            />
          )}
          {article.modifiedTime && (
            <meta
              property='article:modified_time'
              content={article.modifiedTime}
            />
          )}
          {article.author && (
            <meta property='article:author' content={article.author} />
          )}
          {article.section && (
            <meta property='article:section' content={article.section} />
          )}
          {article.tags?.map((tag, index) => (
            <meta key={index} property='article:tag' content={tag} />
          ))}
        </>
      )}

      {/* Twitter Card Tags */}
      <meta name='twitter:card' content='summary_large_image' />
      <meta name='twitter:title' content={fullTitle} />
      <meta name='twitter:description' content={description} />
      <meta name='twitter:image' content={fullImageUrl} />

      {/* Additional Meta Tags */}
      <meta
        name='viewport'
        content='width=device-width, initial-scale=1, maximum-scale=5'
      />
      <meta name='theme-color' content='#000000' />
      <meta name='format-detection' content='telephone=no' />

      {/* Structured Data */}
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
    </Head>
  );
}
