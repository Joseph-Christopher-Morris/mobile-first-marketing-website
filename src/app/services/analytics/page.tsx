import { Metadata } from 'next';
import { Layout } from '@/components/layout';
import Image from 'next/image';
import Link from 'next/link';
import { ServiceInquiryForm } from '@/components/ServiceInquiryForm';

export const metadata: Metadata = {
  title: 'Data Analytics & Insights | GA4 & Adobe Analytics Expertise',
  description:
    'Professional data analytics services with GA4 and Adobe Analytics expertise. Transform your business data into actionable insights that drive growth in Nantwich & Cheshire.',
  keywords: [
    'GA4 analytics',
    'Adobe Analytics',
    'Google Analytics 4',
    'data analytics Nantwich',
    'business intelligence',
    'data insights',
    'analytics consulting',
    'performance metrics',
    'conversion tracking',
    'data visualization'
  ],
  openGraph: {
    title: 'Data Analytics & Insights | GA4 & Adobe Analytics Expertise',
    description: 'Professional data analytics services with GA4 and Adobe Analytics expertise. Transform your business data into actionable insights.',
    images: [
      {
        url: '/images/services/screenshot-2025-09-23-analytics-dashboard.webp',
        width: 1200,
        height: 630,
        alt: 'Advanced analytics dashboard showing comprehensive business metrics and performance data',
      },
    ],
  },
};

export default function AnalyticsServicesPage() {
  const portfolioImages = [
    {
      src: '/images/services/WhatsApp Image 2025-11-09 at 7.40.36 PM.webp',
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
                <p className='text-xl md:text-2xl text-brand-grey mb-6 leading-relaxed'>
                  Transform your data into clear, actionable insights that help your business grow faster and perform more effectively.
                </p>
                <div className='mb-8'>
                  <p className='text-lg text-brand-grey mb-2'>
                    Your business data already holds the answers you need. I'll help you uncover what works, what doesn't, and how to make informed decisions that lead to better results. Every report, chart, and insight is built to be simple, visual, and easy to act on.
                  </p>
                </div>
                <div className='flex flex-col sm:flex-row gap-4'>
                  <Link
                    href='/contact'
                    className='bg-brand-pink text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-brand-pink2 transition-colors text-center'
                  >
                    Get Started Today
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

        {/* Results Section */}
        <section className='py-20 bg-white'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='text-center mb-16'>
              <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>
                Results in Action
              </h2>
              <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
                Here's what data-driven decisions have achieved recently:
              </p>
            </div>

            <div className='max-w-4xl mx-auto'>
              <div className='space-y-6'>
                <div className='bg-gray-50 rounded-xl p-6'>
                  <div className='flex items-start'>
                    <div className='w-6 h-6 bg-brand-pink text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-1 flex-shrink-0'>1</div>
                    <p className='text-gray-700 text-lg'>+55% more views in 28 days after optimizing post timing and analytics tracking</p>
                  </div>
                </div>

                <div className='bg-gray-50 rounded-xl p-6'>
                  <div className='flex items-start'>
                    <div className='w-6 h-6 bg-brand-pink text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-1 flex-shrink-0'>2</div>
                    <p className='text-gray-700 text-lg'>+189% engagement increase through data-led content adjustments</p>
                  </div>
                </div>

                <div className='bg-gray-50 rounded-xl p-6'>
                  <div className='flex items-start'>
                    <div className='w-6 h-6 bg-brand-pink text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-1 flex-shrink-0'>3</div>
                    <p className='text-gray-700 text-lg'>+41% growth in followers from consistent performance monitoring</p>
                  </div>
                </div>

                <div className='bg-gray-50 rounded-xl p-6'>
                  <div className='flex items-start'>
                    <div className='w-6 h-6 bg-brand-pink text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-1 flex-shrink-0'>4</div>
                    <p className='text-gray-700 text-lg'>270 new Facebook followers and 475 reactions in 90 days for NYCC, credited to improved social media strategy</p>
                  </div>
                </div>

                <div className='bg-gray-50 rounded-xl p-6'>
                  <div className='flex items-start'>
                    <div className='w-6 h-6 bg-brand-pink text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-1 flex-shrink-0'>5</div>
                    <p className='text-gray-700 text-lg'>Visitors from 8 countries on the NYCC site, including the UK, US, China, and Singapore, are proving that even local projects can reach global audiences</p>
                  </div>
                </div>

                <div className='bg-white rounded-xl p-6 border-2 border-brand-pink'>
                  <p className='text-gray-700 text-lg text-center font-medium'>
                    These results demonstrate how data, when utilized effectively, can enhance performance and visibility.
                  </p>
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
                My Analytics Services
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
                  Get a complete view of your business performance. See which pages, ads, or campaigns are bringing in results and where you can improve.
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
                  Data Visualisation
                </h3>
                <p className='text-gray-600'>
                  Make sense of complex data with precise, visual representations. I'll create interactive dashboards that make performance easy to understand at a glance.
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
                  Find new opportunities hidden in your data. I'll identify patterns and trends that help you plan your next steps with confidence.
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
                  ROI Optimisation
                </h3>
                <p className='text-gray-600'>
                  See exactly where your marketing spend is working hardest. I'll show you which activities drive the best return so you can focus your budget on what matters.
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
                  Get all your key metrics in one place. I'll build dashboards tailored to your goals, allowing you to track results in real-time.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Analytics Pricing */}
        <section className='py-12 bg-white'>
          <div className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='bg-gradient-to-br from-pink-50 to-purple-50 rounded-3xl p-6 md:p-8 shadow-sm'>
              <h2 className='text-2xl md:text-3xl font-bold text-gray-900 mb-6 text-center'>
                Analytics Pricing
              </h2>

              <div className='grid gap-6 md:grid-cols-3 max-w-5xl mx-auto'>
                <div className='bg-white rounded-2xl p-6 shadow-sm'>
                  <h3 className='text-xl font-bold text-gray-900 mb-3'>
                    GA4 Setup
                  </h3>
                  <p className='text-3xl font-bold text-pink-600 mb-4'>
                    £75 <span className='text-base font-normal text-gray-600'>one-time</span>
                  </p>
                  <p className='text-sm text-gray-700'>
                    Complete Google Analytics 4 setup with custom events and conversion tracking
                  </p>
                </div>

                <div className='bg-white rounded-2xl p-6 shadow-sm'>
                  <h3 className='text-xl font-bold text-gray-900 mb-3'>
                    Looker Studio Dashboard
                  </h3>
                  <p className='text-3xl font-bold text-pink-600 mb-4'>
                    from £80 <span className='text-base font-normal text-gray-600'>one-time</span>
                  </p>
                  <p className='text-sm text-gray-700'>
                    Custom data visualisation dashboards that make your metrics easy to understand
                  </p>
                </div>

                <div className='bg-white rounded-2xl p-6 shadow-sm'>
                  <h3 className='text-xl font-bold text-gray-900 mb-3'>
                    Monthly Analytics Reports
                  </h3>
                  <div className='space-y-2 mb-4'>
                    <p className='text-lg font-semibold text-gray-900'>
                      Basic: <span className='text-pink-600'>£40/mo</span>
                    </p>
                    <p className='text-lg font-semibold text-gray-900'>
                      Standard: <span className='text-pink-600'>£75/mo</span>
                    </p>
                    <p className='text-lg font-semibold text-gray-900'>
                      Premium: <span className='text-pink-600'>£120/mo</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className='text-center mt-6'>
                <p className='text-sm text-gray-600'>
                  All packages include clear reporting and actionable insights
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Dashboard Screenshot Section */}
        <section className='py-20 bg-white'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='text-center mb-16'>
              <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>
                Analytics Dashboards in Action
              </h2>
              <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
                See how we transform complex data into clear, actionable insights through custom analytics dashboards and reporting.
              </p>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
              <div>
                <div className='relative h-96 lg:h-[500px] rounded-lg overflow-hidden shadow-2xl'>
                  <Image
                    src='/images/services/screenshot-2025-08-12-analytics-report.webp'
                    alt='Comprehensive analytics dashboard showing key performance metrics and data insights'
                    fill
                    className='object-cover'
                  />
                </div>
              </div>
              <div>
                <h3 className='text-2xl md:text-3xl font-bold text-gray-900 mb-6'>
                  Custom Analytics Reporting
                </h3>
                <div className='space-y-4'>
                  <div className='flex items-start'>
                    <div className='w-2 h-2 bg-brand-pink rounded-full mt-2 mr-4 flex-shrink-0'></div>
                    <p className='text-gray-700'>
                      <span className='font-semibold'>GA4 Implementation:</span> Complete setup and configuration of Google Analytics 4 with custom events and conversions
                    </p>
                  </div>
                  <div className='flex items-start'>
                    <div className='w-2 h-2 bg-brand-pink rounded-full mt-2 mr-4 flex-shrink-0'></div>
                    <p className='text-gray-700'>
                      <span className='font-semibold'>Adobe Analytics:</span> Advanced segmentation and custom reporting for enterprise-level insights
                    </p>
                  </div>
                  <div className='flex items-start'>
                    <div className='w-2 h-2 bg-brand-pink rounded-full mt-2 mr-4 flex-shrink-0'></div>
                    <p className='text-gray-700'>
                      <span className='font-semibold'>Data Visualization:</span> Interactive dashboards that make complex data easy to understand and act upon
                    </p>
                  </div>
                  <div className='flex items-start'>
                    <div className='w-2 h-2 bg-brand-pink rounded-full mt-2 mr-4 flex-shrink-0'></div>
                    <p className='text-gray-700'>
                      <span className='font-semibold'>Automated Reporting:</span> Regular insights delivered directly to your inbox with actionable recommendations
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Portfolio Section */}
        <section className='py-20 bg-gray-50'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='text-center mb-16'>
              <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>
                My Work in Action
              </h2>
              <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
                Explore examples of my analytics work and see how I can transform
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
                My Analytics Process
              </h2>
              <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
                From raw data to clear insights, here's how I help you make smarter decisions:
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
                  Gather and combine data from your website, ads, and social platforms to build a complete picture of performance.
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
                  Identify trends, patterns, and opportunities that show what's really driving results.
                </p>
              </div>

              <div className='text-center'>
                <div className='w-16 h-16 bg-brand-pink text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold'>
                  3
                </div>
                <h3 className='text-lg font-bold text-gray-900 mb-2'>
                  Visualisation
                </h3>
                <p className='text-gray-600'>
                  Turn complex reports into clear charts and dashboards that make insights easy to understand.
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
                  Deliver practical recommendations that help you grow your reach, improve ROI, and make better marketing decisions.
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
              Let's turn your data into results you can see. More leads, stronger performance, and better ROI start with the right insights.
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

        {/* Service Inquiry Form */}
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <ServiceInquiryForm
            serviceName="Data Analytics & Insights"
            formspreeId="xpwaqjqr"
          />
        </div>
      </div>
    </Layout>
  );
}
