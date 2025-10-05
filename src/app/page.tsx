import type { Metadata } from 'next';
import { Layout } from '@/components/layout';
import Hero from '@/components/sections/Hero';
import { ServicesShowcase } from '@/components/sections/ServicesShowcase';
import TestimonialsCarousel from '@/components/sections/TestimonialsCarousel';
import BlogPreview from '@/components/sections/BlogPreview';
import { heroConfig } from '@/config/hero';
import {
  getAllServices,
  getFilteredTestimonials,
  getFilteredPosts,
} from '@/lib/content';

export const metadata: Metadata = {
  title: 'Vivid Auto Photography | Photography, Analytics & Ad Campaigns',
  description:
    'Transform your business with our mobile-first Vivid Auto Photography approach. Professional photography, data analytics, and targeted ad campaigns designed for mobile users.',
  keywords: [
    'mobile Vivid Auto Photography agency',
    'photography services',
    'Vivid Auto Photography analytics',
    'ad campaigns',
    'mobile-first design',
    'digital Vivid Auto Photography solutions',
  ],
  openGraph: {
    title: 'Vivid Auto Photography | Photography, Analytics & Ad Campaigns',
    description:
      'Transform your business with our mobile-first Vivid Auto Photography approach. Professional photography, data analytics, and targeted ad campaigns designed for mobile users.',
    images: [
      {
        url: '/images/hero-bg.jpg',
        width: 1200,
        height: 630,
        alt: 'Vivid Auto Photography Hero',
      },
    ],
  },
};

export default function Home() {
  const services = getAllServices();
  const testimonials = getFilteredTestimonials({ featured: true });
  const latestPosts = getFilteredPosts({ limit: 3 });

  return (
    <Layout pageTitle='Home'>
      <Hero config={heroConfig} />
      <ServicesShowcase services={services} />
      <TestimonialsCarousel testimonials={testimonials} />
      <BlogPreview posts={latestPosts} />
    </Layout>
  );
}
