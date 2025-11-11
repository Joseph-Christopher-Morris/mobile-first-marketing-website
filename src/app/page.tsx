import { Metadata } from 'next';
import { Layout } from '@/components/layout';
import Image from 'next/image';
import Link from 'next/link';
import { getAllBlogPosts } from '@/lib/blog-api';
import { TestimonialsCarousel } from '@/components/sections/TestimonialsCarousel';
import HeroWithCharts from '@/components/HeroWithCharts';
import { PressLogos } from '@/components/PressLogos';
import { GeneralContactForm } from '@/components/sections/GeneralContactForm';
import { FAQAccordion } from '@/components/FAQAccordion';

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
        <section className='bg-gray-50 py-16 md:py-20'>
          <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
            <h2 className='text-3xl md:text-4xl font-bold text-slate-900 mb-4 text-center'>
              My Services
            </h2>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:justify-items-center'>
              {/* Website Design & Development */}
              <div className='bg-white rounded-2xl shadow-lg p-6 md:p-8 flex flex-col w-full max-w-sm'>
                <div className='relative w-full aspect-[4/3] mb-4 rounded-xl overflow-hidden'>
                  <Image
                    src='/images/services/Website Design/PXL_20240222_004124044~2.webp'
                    alt='Website design and development workspace'
                    fill
                    className='object-cover'
                    sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
                  />
                </div>
                <h3 className='text-xl font-semibold text-slate-900 mb-3'>
                  Website Design & Development
                </h3>
                <p className='text-sm md:text-base text-slate-700 mb-4'>
                  Mobile-first websites on AWS CloudFront, built on a modular framework that is ready for SEO, analytics, and ad campaigns.
                </p>
                <Link
                  href='/services/website-design'
                  className='inline-flex items-center gap-2 text-brand-pink font-semibold text-sm md:text-base hover:text-brand-pink2 mt-auto'
                  aria-label='Learn more about website design and development services'
                >
                  Learn more →
                </Link>
              </div>

              {/* Website Hosting & Migration */}
              <div className='bg-white rounded-2xl shadow-lg p-6 md:p-8 flex flex-col w-full max-w-sm'>
                <div className='relative w-full aspect-[4/3] mb-4 rounded-xl overflow-hidden'>
                  <Image
                    src='/images/services/hosting-migration-card.webp'
                    alt='Website hosting and migration performance dashboard'
                    fill
                    className='object-cover'
                    sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
                  />
                </div>
                <h3 className='text-xl font-semibold text-slate-900 mb-3'>
                  Website Hosting & Migration
                </h3>
                <p className='text-sm md:text-base text-slate-700 mb-4'>
                  AWS S3 + CloudFront hosting with 80% cost reduction and 82%
                  faster load times. Professional website migration with zero downtime.
                </p>
                <Link
                  href='/services/hosting'
                  className='inline-flex items-center gap-2 text-brand-pink font-semibold text-sm md:text-base hover:text-brand-pink2 mt-auto'
                  aria-label='Learn more about AWS website hosting and migration services'
                >
                  Learn more →
                </Link>
              </div>

              {/* Strategic Ad Campaigns */}
              <div className='bg-white rounded-2xl shadow-lg p-6 md:p-8 flex flex-col w-full max-w-sm'>
                <div className='relative w-full aspect-[4/3] mb-4 rounded-xl overflow-hidden'>
                  <Image
                    src='/images/services/WhatsApp Image 2025-11-11 at 9.27.14 AM.webp'
                    alt='Strategic advertising campaigns dashboard'
                    fill
                    className='object-cover'
                    sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
                  />
                </div>
                <h3 className='text-xl font-semibold text-slate-900 mb-3'>
                  Strategic Ad Campaigns
                </h3>
                <p className='text-sm md:text-base text-slate-700 mb-4'>
                  Targeted advertising campaigns designed to maximize ROI and
                  reach your ideal customers across all platforms.
                </p>
                <Link
                  href='/services/ad-campaigns'
                  className='inline-flex items-center gap-2 text-brand-pink font-semibold text-sm md:text-base hover:text-brand-pink2 mt-auto'
                  aria-label='Learn more about strategic advertising campaigns and ROI optimization'
                >
                  Learn more →
                </Link>
              </div>

              {/* Data Analytics & Insights */}
              <div className='bg-white rounded-2xl shadow-lg p-6 md:p-8 flex flex-col w-full max-w-sm lg:col-span-1 lg:justify-self-center'>
                <div className='relative w-full aspect-[4/3] mb-4 rounded-xl overflow-hidden'>
                  <Image
                    src='/images/services/screenshot-2025-09-23-analytics-dashboard.webp'
                    alt='Data analytics dashboard showing business insights'
                    fill
                    className='object-cover'
                    sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
                  />
                </div>
                <h3 className='text-xl font-semibold text-slate-900 mb-3'>
                  Data Analytics & Insights
                </h3>
                <p className='text-sm md:text-base text-slate-700 mb-4'>
                  Comprehensive analytics and data-driven insights to optimize
                  your business performance and drive growth.
                </p>
                <Link
                  href='/services/analytics'
                  className='inline-flex items-center gap-2 text-brand-pink font-semibold text-sm md:text-base hover:text-brand-pink2 mt-auto'
                  aria-label='Learn more about data analytics and business insights services'
                >
                  Learn more →
                </Link>
              </div>

              {/* Photography Services */}
              <div className='bg-white rounded-2xl shadow-lg p-6 md:p-8 flex flex-col w-full max-w-sm lg:col-span-1 lg:justify-self-center'>
                <div className='relative w-full aspect-[4/3] mb-4 rounded-xl overflow-hidden'>
                  <Image
                    src='/images/services/photography-hero.webp'
                    alt='Professional photography services'
                    fill
                    className='object-cover'
                    sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
                  />
                </div>
                <h3 className='text-xl font-semibold text-slate-900 mb-3'>
                  Photography Services
                </h3>
                <p className='text-sm md:text-base text-slate-700 mb-4'>
                  Professional automotive and commercial photography with
                  mobile-optimized delivery and stunning visual storytelling.
                </p>
                <Link
                  href='/services/photography'
                  className='inline-flex items-center gap-2 text-brand-pink font-semibold text-sm md:text-base hover:text-brand-pink2 mt-auto'
                  aria-label='Learn more about professional photography services'
                >
                  Learn more →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Case Studies Section */}
        <section className='bg-white py-16 md:py-20'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='text-center mb-16'>
              <h2 className='text-3xl md:text-4xl font-bold text-slate-900 mb-4'>
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
                className='inline-flex items-center justify-center px-8 py-3 rounded-full text-base md:text-lg font-semibold bg-brand-pink text-white shadow-lg hover:bg-brand-pink2 hover:shadow-xl transition'
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

        {/* Pricing Teaser Section */}
        <section className="bg-gray-50 py-16 md:py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <section className="py-16 text-center bg-pink-50 rounded-3xl shadow-sm">
              <h2 className="text-3xl font-bold mb-4 text-slate-900">
                Simple, transparent pricing
              </h2>
              <p className="text-gray-700 max-w-2xl mx-auto mb-6">
                Websites from £300, hosting from £15 per month, Google Ads management from £150 per month, and event photography from £200 per day.
              </p>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-brand-pink text-white text-sm font-semibold shadow-md hover:bg-brand-pink2 focus:outline-none focus:ring-2 focus:ring-brand-pink focus:ring-offset-2 transition"
              >
                View full pricing
              </Link>
            </section>
          </div>
        </section>

        {/* Contact Form Section - Below Pricing CTA */}
        <section className="bg-white py-16 md:py-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Get Started Today
              </h2>
              <p className="text-base md:text-lg text-slate-700">
                Tell us about your project and we'll get back to you within one business day.
              </p>
            </div>
            <GeneralContactForm />
          </div>
        </section>

        {/* FAQ Section */}
        <FAQAccordion
          title="Frequently Asked Questions"
          faqs={[
            {
              question: "How much does AWS CloudFront hosting cost?",
              answer: "Our AWS CloudFront hosting starts from £15 per month, which is 80% cheaper than traditional platforms like Wix. This includes S3 storage, CloudFront CDN, and SSL certificates. We handle all the technical setup and ongoing maintenance."
            },
            {
              question: "Will my website be faster on AWS?",
              answer: "Yes! Our clients see an average 82% improvement in load times after migrating to AWS CloudFront. Faster sites mean better SEO rankings, improved user experience, and more conversions. We've helped sites go from 14+ seconds to under 2 seconds."
            },
            {
              question: "Do you offer website design services?",
              answer: "Yes, we create mobile-first websites from £300. All our sites are built on AWS CloudFront for maximum performance, include SEO optimization, and are ready for Google Ads campaigns. We focus on designs that convert visitors into customers."
            },
            {
              question: "How do your Google Ads campaigns work?",
              answer: "We manage Google Ads campaigns from £150 per month. This includes keyword research, ad creation, landing page optimization, and monthly performance reports. We focus on ROI and only recommend campaigns that make business sense for your budget."
            },
            {
              question: "What areas do you serve?",
              answer: "We're based in Nantwich and primarily serve businesses across Cheshire, including Crewe, Chester, and surrounding areas. However, we work with clients throughout the UK, especially for website hosting, design, and digital marketing services."
            },
            {
              question: "How quickly can you get started?",
              answer: "For website hosting migration, we can typically start within 2-3 business days and complete the migration within a week. New website projects depend on complexity but usually take 2-4 weeks. Google Ads campaigns can launch within 1-2 weeks after initial consultation."
            }
          ]}
        />

        {/* CTA Section */}
        <section className='bg-brand-black text-white py-16 md:py-20'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
            <h2 className='text-3xl md:text-4xl font-bold text-white mb-4'>
              Ready to Grow Your Business?
            </h2>
            <p className='text-base md:text-lg text-white/85 mb-8 max-w-3xl mx-auto'>
              Let's work together to create stunning visuals, gain valuable
              insights, and launch successful campaigns that drive real results.
            </p>
            <Link
              href='/contact'
              className='inline-flex items-center justify-center px-8 py-3 rounded-full text-base md:text-lg font-semibold bg-brand-pink text-white shadow-lg hover:bg-brand-pink2 hover:shadow-xl transition'
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
