import { Metadata } from 'next';
import { Layout } from '@/components/layout';
import Image from 'next/image';
import Link from 'next/link';
import { getAllBlogPosts } from '@/lib/blog-api';
import { TestimonialsCarousel } from '@/components/sections/TestimonialsCarousel';

export const metadata: Metadata = {
  title: 'Data-Driven Automotive Photography That Delivers | Nantwich & Cheshire',
  description:
    'More than photography. Data-driven automotive photography services helping businesses in Nantwich & Cheshire grow through professional automotive photography, comprehensive analytics, and strategic advertising campaigns that deliver measurable results.',
  keywords: [
    'automotive photography Nantwich',
    'car photography Cheshire', 
    'data-driven photography',
    'automotive analytics',
    'vehicle photography services',
    'car dealership photography',
    'automotive advertising campaigns',
    'professional car photography UK',
    'automotive marketing photography',
    'vehicle showcase photography'
  ],
  openGraph: {
    title: 'Data-Driven Automotive Photography That Delivers | Nantwich & Cheshire',
    description: 'More than photography. Data-driven automotive photography services helping businesses in Nantwich & Cheshire grow through professional automotive photography and strategic campaigns.',
    images: [
      {
        url: '/images/hero/aston-martin-db6-website.webp',
        width: 1200,
        height: 630,
        alt: 'Professional automotive photography showcase - Aston Martin DB6 captured with expert lighting and composition in Nantwich, Cheshire',
      },
    ],
  },
};

export default async function HomePage() {
  const blogPosts = await getAllBlogPosts();
  const latestPosts = blogPosts.slice(0, 3);

  return (
    <Layout>
      <div className='min-h-screen bg-white'>
        {/* Hero Section */}
        <section className='relative bg-brand-black text-white py-28 md:py-40'>
          <div className='absolute inset-0 bg-black/20'></div>
          <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
              <div>
                <h1 className='text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6'>
                  More than Photography.{' '}
                  <span className='text-brand-pink'>
                    Data-Driven Vivid Auto Photography that Delivers!
                  </span>
                </h1>
                <p className='text-xl md:text-2xl text-brand-grey mb-8 leading-relaxed'>
                  Helping businesses in Nantwich & Cheshire grow through
                  professional automotive photography, comprehensive analytics,
                  and strategic advertising campaigns that deliver measurable
                  results.
                </p>
                <div className='flex flex-col sm:flex-row gap-4'>
                  <Link
                    href='/contact/'
                    className='bg-brand-pink text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-brand-pink2 transition-colors text-center'
                  >
                    Get Started
                  </Link>
                  <Link
                    href='/services/'
                    className='border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-brand-black transition-colors text-center'
                  >
                    View Services
                  </Link>
                </div>
              </div>
              <div className='relative'>
                <div className='relative h-96 lg:h-[500px] rounded-lg overflow-hidden shadow-2xl'>
                  <Image
                    src='/images/hero/aston-martin-db6-website.webp'
                    alt='Professional automotive photography showcase - Aston Martin DB6 captured with expert lighting and composition in Nantwich, Cheshire'
                    fill
                    className='object-cover'
                    priority
                    sizes='(max-width: 768px) 100vw, 50vw'
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className='py-20 bg-gray-50'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='text-center mb-16'>
              <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>
                Our Services
              </h2>
              <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
                Comprehensive solutions designed to elevate your business with
                professional photography, data-driven insights, and strategic
                advertising campaigns.
              </p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
              {/* Photography Services */}
              <div className='group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow'>
                <div className='relative h-64'>
                  <Image
                    src='/images/services/photography-hero.webp'
                    alt='Professional photography services - automotive and commercial photography showcase'
                    fill
                    className='object-cover group-hover:scale-105 transition-transform duration-300'
                    sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                  />
                  <div className='absolute inset-0 bg-black/60'></div>
                  <div className='absolute bottom-4 left-4 text-white'>
                    <h3 className='text-xl font-bold mb-2'>
                      Photography Services
                    </h3>
                  </div>
                </div>
                <div className='p-6'>
                  <p className='text-gray-600 mb-4'>
                    Professional automotive and commercial photography with
                    mobile-optimized delivery and stunning visual storytelling.
                  </p>
                  <Link
                    href='/services/photography'
                    className='inline-flex items-center text-brand-pink hover:text-brand-pink2 font-medium'
                    aria-label='Learn more about professional photography services'
                  >
                    Learn More
                    <svg
                      className='ml-2 w-4 h-4'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M9 5l7 7-7 7'
                      />
                    </svg>
                  </Link>
                </div>
              </div>

              {/* Data Analytics & Insights */}
              <div className='group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow'>
                <div className='relative h-64'>
                  <Image
                    src='/images/services/screenshot-2025-09-23-analytics-dashboard.webp'
                    alt='Data analytics and insights dashboard - comprehensive analytics reporting and business intelligence'
                    fill
                    className='object-cover group-hover:scale-105 transition-transform duration-300'
                    sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                  />
                  <div className='absolute inset-0 bg-black/60'></div>
                  <div className='absolute bottom-4 left-4 text-white'>
                    <h3 className='text-xl font-bold mb-2'>
                      Data Analytics & Insights
                    </h3>
                  </div>
                </div>
                <div className='p-6'>
                  <p className='text-gray-600 mb-4'>
                    Comprehensive analytics and data-driven insights to optimize
                    your business performance and drive growth.
                  </p>
                  <Link
                    href='/services/analytics'
                    className='inline-flex items-center text-brand-pink hover:text-brand-pink2 font-medium'
                    aria-label='Learn more about data analytics and business insights services'
                  >
                    Learn More
                    <svg
                      className='ml-2 w-4 h-4'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M9 5l7 7-7 7'
                      />
                    </svg>
                  </Link>
                </div>
              </div>

              {/* Strategic Ad Campaigns */}
              <div className='group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow'>
                <div className='relative h-64'>
                  <Image
                    src='/images/services/ad-campaigns-hero.webp'
                    alt='Strategic ad campaigns - targeted advertising and marketing campaign management'
                    fill
                    className='object-cover group-hover:scale-105 transition-transform duration-300'
                    sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                  />
                  <div className='absolute inset-0 bg-black/60'></div>
                  <div className='absolute bottom-4 left-4 text-white'>
                    <h3 className='text-xl font-bold mb-2'>
                      Strategic Ad Campaigns
                    </h3>
                  </div>
                </div>
                <div className='p-6'>
                  <p className='text-gray-600 mb-4'>
                    Targeted advertising campaigns designed to maximize ROI and
                    reach your ideal customers across all platforms.
                  </p>
                  <Link
                    href='/services/ad-campaigns'
                    className='inline-flex items-center text-brand-pink hover:text-brand-pink2 font-medium'
                    aria-label='Learn more about strategic advertising campaigns and ROI optimization'
                  >
                    Learn More
                    <svg
                      className='ml-2 w-4 h-4'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M9 5l7 7-7 7'
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Latest Insights Section */}
        <section className='py-20 bg-white'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='text-center mb-16'>
              <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>
                Latest Insights
              </h2>
              <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
                Stay updated with our latest insights, tips, and industry
                knowledge to help grow your business.
              </p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
              {latestPosts.map(post => (
                <article
                  key={post.slug}
                  className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow'
                >
                  <div className='relative h-48 sm:h-52 bg-gray-50 overflow-hidden'>
                    <Image
                      src={post.image}
                      alt={`${post.title} - Blog post cover image`}
                      fill
                      className='object-cover group-hover:scale-105 transition-transform duration-300'
                      sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                    />
                    <div className='absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-gray-700 px-3 py-1 rounded-full text-sm font-medium shadow-sm'>
                      {post.readTime} min read
                    </div>
                  </div>
                  <div className='p-6'>
                    <div className='flex items-center text-sm text-gray-500 mb-3'>
                      <time dateTime={post.date}>
                        {new Date(post.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </time>
                      <span className='mx-2'>•</span>
                      <span>{post.category}</span>
                    </div>
                    <h3 className='text-xl font-bold text-gray-900 mb-3'>
                      {post.title}
                    </h3>
                    <p className='text-gray-600 mb-4 leading-relaxed'>
                      {post.excerpt}
                    </p>
                    <div className='flex items-center justify-between'>
                      <Link
                        href={`/blog/${post.slug}`}
                        className='inline-flex items-center text-brand-pink hover:text-brand-pink2 font-medium'
                        aria-label={`Read full article: ${post.title}`}
                      >
                        Read More
                        <svg
                          className='ml-2 w-4 h-4'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M9 5l7 7-7 7'
                          />
                        </svg>
                      </Link>
                      <span className='text-sm text-gray-500'>
                        {post.readTime} min read
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className='text-center mt-12'>
              <Link
                href='/blog'
                className='inline-flex items-center bg-brand-pink text-white px-8 py-3 rounded-lg font-medium hover:bg-brand-pink2 transition-colors'
              >
                View All Posts
                <svg
                  className='ml-2 w-4 h-4'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 5l7 7-7 7'
                  />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* Testimonials Carousel - Home page only */}
        <TestimonialsCarousel />

        {/* CTA Section */}
        <section className='py-20 bg-brand-black text-white'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
            <h2 className='text-3xl md:text-4xl font-bold mb-4'>
              Ready to Grow Your Business?
            </h2>
            <p className='text-xl text-brand-grey mb-8 max-w-3xl mx-auto'>
              Let's work together to create stunning visuals, gain valuable
              insights, and launch successful campaigns that drive real results.
            </p>
            <Link
              href='/contact'
              className='inline-flex items-center bg-brand-pink text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-brand-pink2 transition-colors'
            >
              Get Started Today
              <svg
                className='ml-2 w-5 h-5'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 5l7 7-7 7'
                />
              </svg>
            </Link>
          </div>
        </section>
      </div>
    </Layout>
  );
}
