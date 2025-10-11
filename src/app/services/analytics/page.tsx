import { Metadata } from 'next';
import { Layout } from '@/components/layout';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Data Analytics & Business Intelligence | Automotive Industry Insights',
  description:
    'Comprehensive data analytics and business intelligence services for the automotive industry. Transform your automotive business data into actionable insights that optimize performance and drive growth in Nantwich & Cheshire.',
  keywords: [
    'automotive data analytics',
    'business intelligence automotive',
    'car dealership analytics',
    'automotive performance metrics',
    'vehicle sales analytics',
    'automotive market insights',
    'data-driven automotive decisions',
    'automotive business optimization',
    'car industry analytics',
    'automotive ROI analysis'
  ],
  openGraph: {
    title: 'Data Analytics & Business Intelligence | Automotive Industry Insights',
    description: 'Comprehensive data analytics and business intelligence services for the automotive industry. Transform your automotive business data into actionable insights.',
    images: [
      {
        url: '/images/services/screenshot-2025-09-23-analytics-dashboard.webp',
        width: 1200,
        height: 630,
        alt: 'Advanced analytics dashboard showing comprehensive automotive business metrics and performance data',
      },
    ],
  },
};

export default function AnalyticsServicesPage() {
  const portfolioImages = [
    {
      src: '/images/services/screenshot-2025-08-12-analytics-report.webp',
      alt: 'Comprehensive analytics dashboard showing business performance metrics',
      title: 'Performance Analytics',
    },
    {
      src: '/images/hero/stock-photography-samira.webp',
      alt: 'Data visualization and insights dashboard',
      title: 'Data Visualization',
    },
    {
      src: '/images/services/output-5-analytics-chart.webp',
      alt: 'Advanced analytics reporting and insights',
      title: 'Advanced Reporting',
    },
  ];

  return (
    <Layout pageTitle='Data Analytics & Insights'>
      <div className='min-h-screen bg-white'>
        {/* Hero Section */}
        <section className='relative bg-brand-black text-white py-20 lg:py-32'>
          <div className='absolute inset-0 bg-black/20'></div>
          <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
              <div>
                <h1 className='text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6'>
                  Data <span className='text-brand-pink'>Analytics</span> &
                  Insights
                </h1>
                <p className='text-xl md:text-2xl text-brand-grey mb-8 leading-relaxed'>
                  Transform your data into actionable insights that drive
                  business growth and optimize performance.
                </p>
                <div className='flex flex-col sm:flex-row gap-4'>
                  <Link
                    href='/contact'
                    className='bg-brand-pink text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-brand-pink2 transition-colors text-center'
                  >
                    Get Started
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
                    src='/images/services/screenshot-2025-09-23-analytics-dashboard.webp'
                    alt='Advanced analytics dashboard showing comprehensive business metrics'
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
                Our Analytics Services
              </h2>
              <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
                Comprehensive data analysis and insights to help you make
                informed decisions and drive business growth.
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
                  Performance Analytics
                </h3>
                <p className='text-gray-600'>
                  Comprehensive analysis of your business performance with
                  detailed metrics, trends, and actionable insights.
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
                  Data Visualization
                </h3>
                <p className='text-gray-600'>
                  Transform complex data into clear, interactive visualizations
                  that make insights easy to understand and act upon.
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
                  Growth Insights
                </h3>
                <p className='text-gray-600'>
                  Identify growth opportunities and optimization strategies
                  based on data-driven analysis and market trends.
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
                      d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1'
                    />
                  </svg>
                </div>
                <h3 className='text-xl font-bold text-gray-900 mb-4'>
                  ROI Optimization
                </h3>
                <p className='text-gray-600'>
                  Maximize your return on investment with detailed ROI analysis
                  and optimization recommendations.
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
                      d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                </div>
                <h3 className='text-xl font-bold text-gray-900 mb-4'>
                  Quality Assurance
                </h3>
                <p className='text-gray-600'>
                  Ensure data accuracy and reliability with comprehensive
                  quality assurance and validation processes.
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
                      d='M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4'
                    />
                  </svg>
                </div>
                <h3 className='text-xl font-bold text-gray-900 mb-4'>
                  Custom Dashboards
                </h3>
                <p className='text-gray-600'>
                  Personalized analytics dashboards tailored to your specific
                  business needs and key performance indicators.
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
                Explore examples of our analytics work and see how we transform
                data into actionable business insights.
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
                Our Analytics Process
              </h2>
              <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
                From data collection to actionable insights, we follow a proven
                process to deliver maximum value.
              </p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
              <div className='text-center'>
                <div className='w-16 h-16 bg-brand-pink text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold'>
                  1
                </div>
                <h3 className='text-lg font-bold text-gray-900 mb-2'>
                  Data Collection
                </h3>
                <p className='text-gray-600'>
                  Gather and consolidate data from multiple sources to create a
                  comprehensive dataset.
                </p>
              </div>

              <div className='text-center'>
                <div className='w-16 h-16 bg-brand-pink text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold'>
                  2
                </div>
                <h3 className='text-lg font-bold text-gray-900 mb-2'>
                  Analysis
                </h3>
                <p className='text-gray-600'>
                  Apply advanced analytical techniques to identify patterns,
                  trends, and opportunities.
                </p>
              </div>

              <div className='text-center'>
                <div className='w-16 h-16 bg-brand-pink text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold'>
                  3
                </div>
                <h3 className='text-lg font-bold text-gray-900 mb-2'>
                  Visualization
                </h3>
                <p className='text-gray-600'>
                  Create clear, interactive visualizations that make complex
                  data easy to understand.
                </p>
              </div>

              <div className='text-center'>
                <div className='w-16 h-16 bg-brand-pink text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold'>
                  4
                </div>
                <h3 className='text-lg font-bold text-gray-900 mb-2'>
                  Insights
                </h3>
                <p className='text-gray-600'>
                  Deliver actionable insights and recommendations to drive
                  business growth.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className='py-20 bg-brand-black text-white'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
            <h2 className='text-3xl md:text-4xl font-bold mb-4'>
              Ready to Unlock Your Data's Potential?
            </h2>
            <p className='text-xl text-brand-grey mb-8 max-w-3xl mx-auto'>
              Let's transform your data into actionable insights that drive real
              business results and growth.
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
