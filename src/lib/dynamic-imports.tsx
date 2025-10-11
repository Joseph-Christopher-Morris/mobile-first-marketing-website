import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

/**
 * Utility for creating lazy-loaded components with loading states
 */

interface LazyComponentOptions {
  loading?: ComponentType;
  ssr?: boolean;
}

/**
 * Create a lazy-loaded component with a loading state
 */
export const createLazyComponent = (
  importFn: () => Promise<any>,
  options: LazyComponentOptions = {}
) => {
  const { loading: LoadingComponent, ssr = false } = options;

  return dynamic(importFn, {
    loading: LoadingComponent
      ? (LoadingComponent as any)
      : () => <ComponentSkeleton />,
    ssr,
  });
};

/**
 * Default skeleton loading component
 */
const ComponentSkeleton = () => (
  <div className='animate-pulse'>
    <div className='bg-gray-200 rounded-lg h-32 w-full mb-4'></div>
    <div className='space-y-2'>
      <div className='bg-gray-200 rounded h-4 w-3/4'></div>
      <div className='bg-gray-200 rounded h-4 w-1/2'></div>
    </div>
  </div>
);

/**
 * Skeleton components for different content types
 */
export const SkeletonComponents = {
  Card: () => (
    <div className='animate-pulse bg-white rounded-lg shadow-sm border p-6'>
      <div className='bg-gray-200 rounded-lg h-48 w-full mb-4'></div>
      <div className='space-y-3'>
        <div className='bg-gray-200 rounded h-6 w-3/4'></div>
        <div className='bg-gray-200 rounded h-4 w-full'></div>
        <div className='bg-gray-200 rounded h-4 w-2/3'></div>
      </div>
    </div>
  ),

  Hero: () => (
    <div className='animate-pulse'>
      <div className='bg-gray-200 h-64 md:h-96 w-full mb-8'></div>
      <div className='max-w-4xl mx-auto px-4 space-y-4'>
        <div className='bg-gray-200 rounded h-8 w-2/3 mx-auto'></div>
        <div className='bg-gray-200 rounded h-6 w-1/2 mx-auto'></div>
        <div className='flex justify-center space-x-4 mt-8'>
          <div className='bg-gray-200 rounded h-12 w-32'></div>
          <div className='bg-gray-200 rounded h-12 w-32'></div>
        </div>
      </div>
    </div>
  ),

  BlogPost: () => (
    <div className='animate-pulse space-y-6'>
      <div className='bg-gray-200 rounded-lg h-64 w-full'></div>
      <div className='space-y-4'>
        <div className='bg-gray-200 rounded h-8 w-3/4'></div>
        <div className='bg-gray-200 rounded h-4 w-1/4'></div>
        <div className='space-y-2'>
          <div className='bg-gray-200 rounded h-4 w-full'></div>
          <div className='bg-gray-200 rounded h-4 w-full'></div>
          <div className='bg-gray-200 rounded h-4 w-2/3'></div>
        </div>
      </div>
    </div>
  ),

  Testimonial: () => (
    <div className='animate-pulse bg-white rounded-lg shadow-sm border p-6'>
      <div className='flex items-center space-x-4 mb-4'>
        <div className='bg-gray-200 rounded-full h-12 w-12'></div>
        <div className='space-y-2'>
          <div className='bg-gray-200 rounded h-4 w-24'></div>
          <div className='bg-gray-200 rounded h-3 w-32'></div>
        </div>
      </div>
      <div className='space-y-2'>
        <div className='bg-gray-200 rounded h-4 w-full'></div>
        <div className='bg-gray-200 rounded h-4 w-full'></div>
        <div className='bg-gray-200 rounded h-4 w-3/4'></div>
      </div>
    </div>
  ),

  Form: () => (
    <div className='animate-pulse space-y-4'>
      <div className='bg-gray-200 rounded h-6 w-1/3'></div>
      <div className='space-y-4'>
        <div className='bg-gray-200 rounded h-12 w-full'></div>
        <div className='bg-gray-200 rounded h-12 w-full'></div>
        <div className='bg-gray-200 rounded h-32 w-full'></div>
        <div className='bg-gray-200 rounded h-12 w-32'></div>
      </div>
    </div>
  ),

  Navigation: () => (
    <div className='animate-pulse flex space-x-4'>
      {[...Array(4)].map((_, i) => (
        <div key={i} className='bg-gray-200 rounded h-8 w-20'></div>
      ))}
    </div>
  ),
};

/**
 * Pre-configured lazy components for common sections
 */
export const LazyComponents = {
  // Blog components
  BlogListing: createLazyComponent(
    () => import('@/components/sections/BlogListing'),
    { loading: SkeletonComponents.Card }
  ),

  BlogPostContent: createLazyComponent(
    () => import('@/components/sections/BlogPostContent'),
    { loading: SkeletonComponents.BlogPost }
  ),

  // Service components
  ServicesShowcase: createLazyComponent(
    () => import('@/components/sections/ServicesShowcase'),
    { loading: SkeletonComponents.Card }
  ),

  ServiceContent: createLazyComponent(
    () => import('@/components/sections/ServiceContent'),
    { loading: SkeletonComponents.BlogPost }
  ),

  // Testimonials
  TestimonialsCarousel: createLazyComponent(
    () => import('@/components/sections/TestimonialsCarousel'),
    { loading: SkeletonComponents.Testimonial }
  ),

  // Forms
  GeneralContactForm: createLazyComponent(
    () => import('@/components/sections/GeneralContactForm'),
    { loading: SkeletonComponents.Form }
  ),

  ServiceContactForm: createLazyComponent(
    () => import('@/components/sections/ServiceContactForm'),
    { loading: SkeletonComponents.Form }
  ),

  // Other sections
  BlogSearch: createLazyComponent(
    () => import('@/components/sections/BlogSearch'),
    { ssr: false }
  ),

  SocialShare: createLazyComponent(
    () => import('@/components/sections/SocialShare'),
    { ssr: false }
  ),
};
