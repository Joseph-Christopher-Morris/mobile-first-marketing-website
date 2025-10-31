import { Metadata } from 'next';
import { Layout } from '@/components/layout';
import Image from 'next/image';
import Link from 'next/link';
import { 
  RevenueOutcomeCard, 
  ConversionOutcomeCard, 
  LeadsOutcomeCard, 
  ROIOutcomeCard 
} from '@/components/services/OutcomeCard';

export const metadata: Metadata = {
  title: 'Strategic Automotive Advertising Campaigns | Maximize ROI & Reach',
  description:
    'Strategic automotive advertising campaigns designed to maximize ROI and reach your ideal customers. Proven results with 2,470% average ROI across Google Ads, Facebook, and multi-platform campaigns for automotive businesses.',
  keywords: [
    'automotive advertising campaigns',
    'car dealership advertising',
    'automotive digital marketing',
    'vehicle advertising ROI',
    'automotive Google Ads',
    'car sales advertising',
    'automotive Facebook advertising',
    'targeted automotive marketing',
    'automotive lead generation',
    'car dealership marketing campaigns'
  ],
  openGraph: {
    title: 'Strategic Automotive Advertising Campaigns | Maximize ROI & Reach',
    description: 'Strategic automotive advertising campaigns designed to maximize ROI and reach your ideal customers. Proven results with 2,470% average ROI across multiple platforms.',
    images: [
      {
        url: '/images/services/ad-campaigns-hero.webp',
        width: 1200,
        height: 630,
        alt: 'Strategic automotive advertising campaign dashboard showing performance metrics and ROI optimization',
      },
    ],
  },
};

export default function AdCampaignsServicesPage() {
  const portfolioImages = [
    {
      src: '/images/services/accessible-top8-campaigns-source.webp',
      alt: 'Top performing advertising campaigns analysis and results',
      title: 'Campaign Performance',
    },
    {
      src: '/images/services/top-3-mediums-by-conversion-rate.webp',
      alt: 'Conversion rate analysis across different advertising mediums',
      title: 'Conversion Optimization',
    },
    {
      src: '/images/services/screenshot-2025-08-12-analytics-report.webp',
      alt: 'Comprehensive advertising analytics and reporting dashboard',
      title: 'Analytics & Reporting',
    },
  ];

  return (
    <Layout pageTitle='Strategic Ad Campaigns'>
      <div className='min-h-screen bg-white'>
        {/* Hero Section */}
        <section className='relative bg-brand-black text-white py-20 lg:py-32'>
          <div className='absolute inset-0 bg-black/20'></div>
          <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
              <div>
                <h1 className='text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6'>
                  Strategic{' '}
                  <span className='text-brand-pink'>Ad Campaigns</span>
                </h1>
                <p className='text-xl md:text-2xl text-brand-grey mb-8 leading-relaxed'>
                  Maximize ROI with targeted advertising campaigns that reach
                  your ideal customers across all platforms.
                </p>
                <div className='flex flex-col sm:flex-row gap-4'>
                  <Link
                    href='/contact'
                    className='bg-brand-pink text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-brand-pink2 transition-colors text-center'
                  >
                    Launch Campaign
                  </Link>
                  <Link
                    href='/blog'
                    className='border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-gray-900 transition-colors text-center'
                  >
                    View Case Studies
                  </Link>
                </div>
              </div>
              <div className='relative'>
                <div className='relative h-96 lg:h-[500px] rounded-lg overflow-hidden shadow-2xl'>
                  <Image
                    src='/images/services/ad-campaigns-hero.webp'
                    alt='Strategic advertising campaign dashboard showing performance metrics'
                    fill
                    className='object-cover'
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Overview */}
        <section className='py-20 bg-gray-50'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='text-center mb-16'>
              <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>
                Our Campaign Services
              </h2>
              <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
                Comprehensive advertising solutions designed to maximize your
                reach, engagement, and return on investment.
              </p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
              <div className='bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow'>
                <div className='w-16 h-16 bg-brand-white border-2 border-brand-pink rounded-lg flex items-center justify-center mb-6'>
                  <svg
                    className='w-8 h-8 text-brand-pink'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
                    />
                  </svg>
                </div>
                <h3 className='text-xl font-bold text-gray-900 mb-4'>
                  Campaign Strategy
                </h3>
                <p className='text-gray-600'>
                  Comprehensive campaign planning and strategy development
                  tailored to your business goals and target audience.
                </p>
              </div>

              <div className='bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow'>
                <div className='w-16 h-16 bg-brand-white border-2 border-brand-pink rounded-lg flex items-center justify-center mb-6'>
                  <svg
                    className='w-8 h-8 text-brand-pink'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9'
                    />
                  </svg>
                </div>
                <h3 className='text-xl font-bold text-gray-900 mb-4'>
                  Multi-Platform Advertising
                </h3>
                <p className='text-gray-600'>
                  Reach your audience across Google Ads, Facebook, Instagram,
                  LinkedIn, and other major advertising platforms.
                </p>
              </div>

              <div className='bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow'>
                <div className='w-16 h-16 bg-brand-white border-2 border-brand-pink rounded-lg flex items-center justify-center mb-6'>
                  <svg
                    className='w-8 h-8 text-brand-pink'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
                    />
                  </svg>
                </div>
                <h3 className='text-xl font-bold text-gray-900 mb-4'>
                  ROI Optimization
                </h3>
                <p className='text-gray-600'>
                  Continuous optimization to maximize your return on investment
                  and improve campaign performance over time.
                </p>
              </div>

              <div className='bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow'>
                <div className='w-16 h-16 bg-brand-white border-2 border-brand-pink rounded-lg flex items-center justify-center mb-6'>
                  <svg
                    className='w-8 h-8 text-brand-pink'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                    />
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                    />
                  </svg>
                </div>
                <h3 className='text-xl font-bold text-gray-900 mb-4'>
                  Audience Targeting
                </h3>
                <p className='text-gray-600'>
                  Precise audience targeting based on demographics, interests,
                  behaviors, and custom audience segments.
                </p>
              </div>

              <div className='bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow'>
                <div className='w-16 h-16 bg-brand-white border-2 border-brand-pink rounded-lg flex items-center justify-center mb-6'>
                  <svg
                    className='w-8 h-8 text-brand-pink'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z'
                    />
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z'
                    />
                  </svg>
                </div>
                <h3 className='text-xl font-bold text-gray-900 mb-4'>
                  Performance Tracking
                </h3>
                <p className='text-gray-600'>
                  Comprehensive tracking and reporting to monitor campaign
                  performance and identify optimization opportunities.
                </p>
              </div>

              <div className='bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow'>
                <div className='w-16 h-16 bg-brand-white border-2 border-brand-pink rounded-lg flex items-center justify-center mb-6'>
                  <svg
                    className='w-8 h-8 text-brand-pink'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2M9 12l2 2 4-4'
                    />
                  </svg>
                </div>
                <h3 className='text-xl font-bold text-gray-900 mb-4'>
                  A/B Testing
                </h3>
                <p className='text-gray-600'>
                  Systematic testing of ad creatives, copy, and targeting to
                  identify the most effective campaign elements.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Portfolio Section */}
        <section className='py-20 bg-white'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='text-center mb-16'>
              <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>
                Our Work in Action
              </h2>
              <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
                Explore examples of our successful advertising campaigns and see
                the results we've achieved for our clients.
              </p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
              {portfolioImages.map((image, index) => (
                <div
                  key={index}
                  className='group relative bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow'
                >
                  <div className='relative h-64 overflow-hidden'>
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      className='object-cover group-hover:scale-105 transition-transform duration-300'
                    />
                    <div className='absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
                    <div className='absolute bottom-4 left-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                      <h3 className='text-lg font-bold'>{image.title}</h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className='py-20 bg-gray-50'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='text-center mb-16'>
              <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>
                Our Campaign Process
              </h2>
              <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
                From strategy development to optimization, we follow a proven
                process to deliver exceptional campaign results.
              </p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
              <div className='text-center'>
                <div className='w-16 h-16 bg-brand-pink text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold'>
                  1
                </div>
                <h3 className='text-lg font-bold text-gray-900 mb-2'>
                  Strategy
                </h3>
                <p className='text-gray-600'>
                  Develop comprehensive campaign strategy based on your goals,
                  audience, and market analysis.
                </p>
              </div>

              <div className='text-center'>
                <div className='w-16 h-16 bg-brand-pink text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold'>
                  2
                </div>
                <h3 className='text-lg font-bold text-gray-900 mb-2'>Launch</h3>
                <p className='text-gray-600'>
                  Execute campaigns across selected platforms with precise
                  targeting and compelling creative assets.
                </p>
              </div>

              <div className='text-center'>
                <div className='w-16 h-16 bg-brand-pink text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold'>
                  3
                </div>
                <h3 className='text-lg font-bold text-gray-900 mb-2'>
                  Monitor
                </h3>
                <p className='text-gray-600'>
                  Continuously monitor performance metrics and make real-time
                  adjustments for optimal results.
                </p>
              </div>

              <div className='text-center'>
                <div className='w-16 h-16 bg-brand-pink text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold'>
                  4
                </div>
                <h3 className='text-lg font-bold text-gray-900 mb-2'>
                  Optimize
                </h3>
                <p className='text-gray-600'>
                  Analyze results and optimize campaigns for improved
                  performance and maximum ROI.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ROI Case Study Results Section */}
        <section className='py-20 bg-white'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='text-center mb-16'>
              <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>
                ROI Case Study Results
              </h2>
              <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
                Real outcomes from our strategic advertising campaigns, demonstrating
                measurable ROI and business growth for our clients.
              </p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
              <RevenueOutcomeCard
                revenue="£13.5k"
                investment="£546"
                description="Exceptional revenue generation from strategic campaign investment, delivering 2,470% ROI"
                className="h-full"
              />
              
              <ConversionOutcomeCard
                rate="85%"
                description="Above industry average conversion rates achieved through targeted audience segmentation and optimized ad creative"
                className="h-full"
              />
              
              <LeadsOutcomeCard
                count="4"
                source="NYCC"
                description="High-quality leads generated for North Yorkshire County Council campaigns through strategic targeting"
                className="h-full"
              />
              
              <ROIOutcomeCard
                percentage="2,470%"
                description="Average return on investment across all strategic advertising campaigns, demonstrating exceptional performance"
                className="h-full"
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className='py-20 bg-brand-black text-white'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
            <h2 className='text-3xl md:text-4xl font-bold mb-4'>
              Ready to Launch Your Next Campaign?
            </h2>
            <p className='text-xl text-brand-grey mb-8 max-w-3xl mx-auto'>
              Let's create strategic advertising campaigns that deliver
              exceptional ROI and drive real business growth.
            </p>
            <Link
              href='/contact'
              className='inline-flex items-center bg-brand-pink text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-brand-pink2 transition-colors'
            >
              Start Your Campaign
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
