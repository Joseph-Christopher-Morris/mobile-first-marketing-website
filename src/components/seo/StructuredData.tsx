'use client';

import { usePathname } from 'next/navigation';

interface OrganizationSchema {
  '@context': string;
  '@type': string;
  name: string;
  description: string;
  url: string;
  logo: string;
  contactPoint: {
    '@type': string;
    telephone: string;
    email: string;
    contactType: string;
    areaServed?: string;
    availableLanguage?: string;
  };
  address?: {
    '@type': string;
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  sameAs: string[];
  foundingDate?: string;
  numberOfEmployees?: string;
  slogan?: string;
}

interface ServiceSchema {
  name: string;
  description: string;
  provider: string;
  areaServed: string;
  serviceType: string;
}

interface StructuredDataProps {
  type?: 'organization' | 'service' | 'breadcrumb' | 'website';
  data?: any;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';

export default function StructuredData({
  type = 'organization',
  data,
}: StructuredDataProps) {
  const pathname = usePathname();

  const generateOrganizationSchema = (): OrganizationSchema => ({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Mobile-First Vivid Auto Photography',
    description:
      'Professional Vivid Auto Photography services with mobile-first approach specializing in photography, analytics, and ad campaigns.',
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo.png`,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-555-0123',
      email: 'contact@mobilefirstvividautophotography.com',
      contactType: 'Customer Service',
      areaServed: 'US',
      availableLanguage: 'English',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: '123 Vivid Auto Photography Street',
      addressLocality: 'Digital City',
      addressRegion: 'CA',
      postalCode: '90210',
      addressCountry: 'US',
    },
    sameAs: [
      'https://facebook.com/mobilefirstvividautophotography',
      'https://twitter.com/mobilefirstvap',
      'https://linkedin.com/company/mobile-first-vivid-auto-photography',
      'https://instagram.com/mobilefirstmarketing',
    ],
    foundingDate: '2020',
    numberOfEmployees: '10-50',
    slogan: 'Mobile-First Marketing Solutions',
  });

  const generateWebsiteSchema = () => ({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Mobile-First Marketing',
    url: SITE_URL,
    description: 'Professional marketing services with mobile-first approach.',
    publisher: {
      '@type': 'Organization',
      name: 'Mobile-First Marketing',
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/blog?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  });

  const generateServiceSchema = (serviceData: any) => ({
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: serviceData.name || 'Marketing Service',
    description: serviceData.description || 'Professional marketing service',
    provider: {
      '@type': 'Organization',
      name: 'Mobile-First Marketing',
      url: SITE_URL,
    },
    areaServed: 'United States',
    serviceType: serviceData.serviceType || 'Marketing',
    category: 'Digital Marketing',
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      priceCurrency: 'USD',
    },
  });

  const generateBreadcrumbSchema = (
    breadcrumbs: Array<{ name: string; url: string }>
  ) => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  });

  let schema;
  switch (type) {
    case 'organization':
      schema = generateOrganizationSchema();
      break;
    case 'website':
      schema = generateWebsiteSchema();
      break;
    case 'service':
      schema = generateServiceSchema(data);
      break;
    case 'breadcrumb':
      schema = generateBreadcrumbSchema(data);
      break;
    default:
      schema = generateOrganizationSchema();
  }

  return (
    <script
      type='application/ld+json'
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  );
}
