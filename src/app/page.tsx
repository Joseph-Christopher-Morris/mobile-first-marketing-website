import { Metadata } from 'next';
import { Layout } from '@/components/layout';
import Image from 'next/image';
import Link from 'next/link';
import { getAllBlogPosts } from '@/lib/blog-api';
import { TestimonialsCarousel } from '@/components/sections/TestimonialsCarousel';
import HeroWithCharts from '@/components/HeroWithCharts';

export const metadata: Metadata = {
  title: 'Vivid Media Cheshire — Faster, Smarter Websites That Work as Hard as You Do',
  description:
    'Affordable mobile-first web design, secure hosting, and Google Ads campaigns that turn visitors into customers in Cheshire.',
  keywords: [
    'AWS website hosting Cheshire',
    'AWS CloudFront migration',
    'mobile-first web design',
    'Google Ads campaigns Cheshire',
    'digital marketing Nantwich',
    'website performance optimisation',
    'cheaper website hosting UK',
    'data-driven marketing Cheshire',
    'creative web design Cheshire',
    'Vivid Media Cheshire',
  ],
  openGraph: {
    title: 'Vivid Media Cheshire — Faster, Smarter Websites That Work as Hard as You Do',
    description:
      'Affordable mobile-first web design, secure hosting, and Google Ads campaigns that turn visitors into customers in Cheshire.',
    images: [
      {
        url: '/images/hero/230422_Chester_Stock_Photography-84.webp',
        width: 1200,
        height: 630,
        alt: 'Vivid Media Cheshire — premium creative craftsmanship with cloud performance results',
      },
    ],
  },
};

export default async function HomePage() {
  const blogPosts = await getAllBlogPosts();
  const latestPosts = blogPosts.slice(0, 3);

  // Map each blog slug to its hero image path
  const cardCovers: Record<string, string> = {
    'paid-ads-campaign-learnings': '/images/hero/google-ads-analytics-dashboard.webp',
    'flyers-roi-breakdown': '/images/hero/whatsapp-image-2025-07-11-flyers-roi.webp',
    'stock-photography-lessons': '/images/hero/240619-london-19.webp',
    'exploring-istock-data-deepmeta': '/images/hero/screenshot-2025-09-23-analytics-dashboard.webp',
  };

  return (
    <Layout>
      <div className='min-h-screen bg-white'>
        {/* Hero Section with Charts */}
        <HeroWithCharts
          heroSrc="/images/hero/230422_Chester_Stock_Photography-84.webp"
          wixAnnual={550}
          awsAnnual={108.4}
          breakdown={{ aws: 60, cloudflare: 10, zoho: 38.4 }}
          lcpSeries={[14.2, 7.8, 2.3, 1.8]}
        />



        {/* Services Section */}
        <section className='py-20 bg-gray-50'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='text-center mb-16'>
              <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>
                My Services
              </h2>
              <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
                Vivid Media Cheshire helps local businesses grow with fast, secure websites, smart advertising, and visuals that tell your story. Each project combines enterprise-level hosting, data-driven design, and photography that delivers real results.
              </p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
              {/* Website Hosting & Migration */}
              <div className='group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow'>
                <div className='relative h-64'>
                  <Image
                    src='/images/services/hosting-migration-card.webp'
                    alt='AWS website hosting and migration services - 80% cost reduction and 82% faster load times'
                    fill
                    className='object-cover group-hover:scale-105 transition-transform duration-300'
                    sizes='(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw'
                  />
                  <div className='absolute inset-0 bg-black/60'></div>
                  <div className='absolute bottom-4 left-4 text-white'>
                    <h3 className='text-xl font-bold mb-2'>
                      Website Hosting & Migration
                    </h3>
                  </div>
                </div>
                <div className='p-6'>
                  <p className='text-gray-600 mb-4'>
                    AWS S3 + CloudFront hosting with 80% cost reduction and 82%
                    faster load times. Professional website migration with zero downtime.
                  </p>
                  <Link
                    href='/services/hosting'
                    className='inline-flex items-center text-brand-pink hover:text-brand-pink2 font-medium'
                    aria-label='Learn more about AWS website hosting and migration services'
                  >
                    View Hosting Services
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
                    sizes='(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw'
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
                    View Ad Campaign Services
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
                    sizes='(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw'
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
                    View Analytics Services
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

              {/* Photography Services */}
              <div className='group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow'>
                <div className='relative h-64'>
                  <Image
                    src='/images/services/photography-hero.webp'
                    alt='Professional photography services - automotive and commercial photography showcase'
                    fill
                    className='object-cover group-hover:scale-105 transition-transform duration-300'
                    sizes='(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw'
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
                    View Photography Services
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

        {/* Case Studies Section */}
        <section className='py-20 bg-white'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='text-center mb-16'>
              <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>
                My Case Studies
              </h2>
              <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
                Explore real results from my projects, including how I achieved a 2,380% ROI with flyers, analysed iStock earnings data, and what I learned from running my first Paid Ads campaign.
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
                      src={cardCovers[post.slug] || post.image || '/images/hero/230422_Chester_Stock_Photography-84.webp'}
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
                        aria-label={`Read the article: ${post.title}`}
                      >
                        Read Article
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