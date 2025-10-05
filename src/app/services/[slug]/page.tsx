import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import {
  getAllServices,
  getServiceBySlug,
  markdownToHtml,
} from '@/lib/content';
import { Layout } from '@/components/layout';
import { ServiceHero } from '@/components/sections/ServiceHero';
import { ServiceContent } from '@/components/sections/ServiceContent';
import { ServiceNavigation } from '@/components/sections/ServiceNavigation';
import { ServiceContactForm } from '@/components/sections/ServiceContactForm';
import { StructuredData } from '@/components/seo';

interface ServicePageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  const services = getAllServices();

  return services.map(service => ({
    slug: service.slug,
  }));
}

export async function generateMetadata({
  params,
}: ServicePageProps): Promise<Metadata> {
  const service = getServiceBySlug(params.slug);

  if (!service) {
    return {
      title: 'Service Not Found',
    };
  }

  const title =
    service.seoTitle ||
    `${service.title} | Professional Vivid Auto Photography Services`;
  const description = service.metaDescription || service.shortDescription;
  const imageUrl = service.featuredImage || '/images/hero-bg.jpg';

  return {
    title,
    description,
    keywords: [
      service.title.toLowerCase(),
      'Vivid Auto Photography service',
      'mobile-first',
      'professional service',
      ...(service.features || []).map(f => f.toLowerCase()),
    ],
    openGraph: {
      title,
      description,
      type: 'website',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${service.title} Service`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: `/services/${params.slug}`,
    },
  };
}

export default async function ServicePage({ params }: ServicePageProps) {
  const service = getServiceBySlug(params.slug);

  if (!service) {
    notFound();
  }

  // Convert markdown content to HTML
  const contentHtml = await markdownToHtml(service.content);

  // Get all services for navigation
  const allServices = getAllServices();
  const otherServices = allServices.filter(s => s.slug !== service.slug);

  // Generate breadcrumb data for structured data
  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Services', url: '/services' },
    { name: service.title, url: `/services/${service.slug}` },
  ];

  return (
    <Layout pageTitle={service.title}>
      <div className='min-h-screen bg-white'>
        {/* Structured Data */}
        <StructuredData type='service' data={service} />
        <StructuredData type='breadcrumb' data={breadcrumbs} />

        {/* Service Hero Section */}
        <ServiceHero service={service} />

        {/* Service Content */}
        <ServiceContent service={service} contentHtml={contentHtml} />

        {/* Contact Form Section */}
        <section className='py-16 md:py-24 bg-gray-50'>
          <div className='container mx-auto px-4'>
            <div className='max-w-4xl mx-auto'>
              <ServiceContactForm service={service} />
            </div>
          </div>
        </section>

        {/* Service Navigation */}
        <ServiceNavigation
          currentService={service}
          otherServices={otherServices}
        />
      </div>
    </Layout>
  );
}
