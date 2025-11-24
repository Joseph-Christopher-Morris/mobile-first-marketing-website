'use client';

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
import { ServiceInquiryForm } from '@/components/ServiceInquiryForm';
import { ServiceSchemas } from '@/components/seo/ServiceSchema';

// Metadata moved to layout or parent component due to 'use client' directive

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
      title: 'Conversion optimisation',
    },
    {
      src: '/images/services/screenshot-2025-08-12-analytics-report.webp',
      alt: 'Comprehensive advertising analytics and reporting dashboard',
      title: 'Analytics & Reporting',
    },
  ];

  return (
    <Layout pageTitle='Strategic Ad Campaigns'>
      {/* Service Schema - Spec requirement: Structured Data */}
      {ServiceSchemas.GoogleAds()}
      <div className='min-h-screen bg-white'>
        {/* Hero Section */}
        <section className='relative bg-brand-black text-white py-20 lg:py-32'>
          <div className='absolute inset-0 bg-black/20'></div>
          <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-centre'>
              <div>
                <h1 className='text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6'>
                  Ads That Bring You Real Leads. Not Wasted Clicks
                </h1>
                <p className='text-xl md:text-2xl text-brand-grey mb-8 leading-relaxed'>
                  Stop paying for clicks that don't turn into customers. I help Cheshire businesses run simple, targeted ad campaigns that actually get your phone ringing.
                </p>
                <div className='mb-8'>
                  <p className='text-lg text-brand-grey mb-4'>
                    Whether you want to grow your customer base or increase bookings, I set up and manage ad campaigns that do the heavy lifting for you.
                  </p>
                  <p className='text-lg text-brand-grey mb-4'>
                    Every campaign is built around your goals, carefully tested, and refined over time to ensure your budget works as efficiently as possible.
                  </p>
                  <p className='text-lg text-brand-grey mb-6'>
                    From Google Ads to Meta Ads, I handle the whole process: strategy, setup, and reporting, so you can focus on your business while I focus on your results.
                  </p>
                </div>
                <div className='flex flex-col sm:flex-row gap-4'>
                  <Link
                    href='/contact'
                    className='bg-brand-pink text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-brand-pink2 transition-colours text-centre'
                  >
                    Get My Free Ad Plan
                  </Link>
                  <Link
                    href='/blog'
                    className='border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-gray-900 transition-colours text-centre'
                  >
                    View Case Studies
                  </Link>
                </div>
                <p className='text-sm text-brand-grey mt-4'>
                  No contracts or jargon, just precise results you can see.
                </p>
              </div>
              <div className='relative'>
                <div className='relative h-96 lg:h-[500px] rounded-lg overflow-hidden shadow-2xl'>
                  <Image
                    src='/images/services/WhatsApp Image 2025-11-11 at 9.27.14 AM.webp'
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
        <section className='py-16 md:py-24 bg-gray-50'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='text-centre mb-12 md:mb-16'>
              <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-6'>
                What's Included
              </h2>
              <p className='text-lg md:text-xl text-gray-600 max-w-3xl mx-auto'>
                Everything you need to run successful ad campaigns that bring in real leads and customers.
              </p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8'>
              <div className='bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow'>
                <div className='w-16 h-16 bg-brand-white border-2 border-brand-pink rounded-lg flex items-centre justify-centre mb-6'>
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
                  Plan That Fits Your Goals
                </h3>
                <p className='text-gray-600'>
                  I create an ad strategy tailored to your specific business needs. Everything is explained clearly, so you always understand how it works.
                </p>
              </div>

              <div className='bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow'>
                <div className='w-16 h-16 bg-brand-white border-2 border-brand-pink rounded-lg flex items-centre justify-centre mb-6'>
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
                  Ads Where Your Customers Are
                </h3>
                <p className='text-gray-600'>
                  I run campaigns across Google, Facebook, and Instagram to reach the audiences most likely to buy from you.
                </p>
              </div>

              <div className='bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow'>
                <div className='w-16 h-16 bg-brand-white border-2 border-brand-pink rounded-lg flex items-centre justify-centre mb-6'>
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
                  Make Every Pound Work Harder
                </h3>
                <p className='text-gray-600'>
                  Your ads are regularly reviewed to improve performance and reduce costs over time.
                </p>
              </div>

              <div className='bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow'>
                <div className='w-16 h-16 bg-brand-white border-2 border-brand-pink rounded-lg flex items-centre justify-centre mb-6'>
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
                  Reach the Right People
                </h3>
                <p className='text-gray-600'>
                  I focus on targeting the customers who are ready to take action, not random clicks.
                </p>
              </div>

              <div className='bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow'>
                <div className='w-16 h-16 bg-brand-white border-2 border-brand-pink rounded-lg flex items-centre justify-centre mb-6'>
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
                  Know What's Working
                </h3>
                <p className='text-gray-600'>
                  You'll receive straightforward reports showing what is bringing in enquiries and what can be improved.
                </p>
              </div>

              <div className='bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow'>
                <div className='w-16 h-16 bg-brand-white border-2 border-brand-pink rounded-lg flex items-centre justify-centre mb-6'>
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
                  Test, Learn, and Improve
                </h3>
                <p className='text-gray-600'>
                  By running small tests and tracking the results, I ensure your campaigns remain effective as they grow.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Microsoft Clarity for Ad Campaigns */}
        <section className='py-16 md:py-20 bg-gradient-to-br from-pink-50 to-purple-50'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='text-centre mb-12'>
              <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>
                Understanding Visitor Behaviour with Microsoft Clarity
              </h2>
              <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
                I use Microsoft Clarity to analyse what visitors do after clicking your ads. Heatmaps, scroll maps and behaviour recordings help identify friction points, improve landing page flow and support stronger conversion rates. These insights guide adjustments to your Google Ads campaigns and landing pages.
              </p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
              <div className='bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow'>
                <div className='w-16 h-16 bg-pink-100 rounded-lg flex items-centre justify-centre mb-6'>
                  <svg className='w-8 h-8 text-pink-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122' />
                  </svg>
                </div>
                <h3 className='text-xl font-bold text-gray-900 mb-4'>
                  Heatmaps & Click Tracking
                </h3>
                <p className='text-gray-600'>
                  See exactly where visitors click, scroll and engage on your landing pages after clicking your ads.
                </p>
              </div>

              <div className='bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow'>
                <div className='w-16 h-16 bg-pink-100 rounded-lg flex items-centre justify-centre mb-6'>
                  <svg className='w-8 h-8 text-pink-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' />
                  </svg>
                </div>
                <h3 className='text-xl font-bold text-gray-900 mb-4'>
                  Scroll Depth Analysis
                </h3>
                <p className='text-gray-600'>
                  Understand how far visitors scroll and where they lose interest, helping optimise page content and layout.
                </p>
              </div>

              <div className='bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow'>
                <div className='w-16 h-16 bg-pink-100 rounded-lg flex items-centre justify-centre mb-6'>
                  <svg className='w-8 h-8 text-pink-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z' />
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                  </svg>
                </div>
                <h3 className='text-xl font-bold text-gray-900 mb-4'>
                  Session Recordings
                </h3>
                <p className='text-gray-600'>
                  Watch real visitor sessions to identify confusion points, navigation issues and conversion barriers.
                </p>
              </div>
            </div>

            <div className='text-centre mt-12'>
              <div className='bg-white rounded-xl p-6 max-w-3xl mx-auto shadow-md'>
                <p className='text-gray-700 text-lg'>
                  <strong>Why this matters:</strong> Understanding how visitors behave after clicking your ads helps reduce wasted spend, improve landing page performance and increase your conversion rate. These insights directly inform campaign optimisation decisions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Portfolio Section */}
        <section className='py-20 bg-white'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='text-centre mb-16'>
              <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>
                My Work in Action
              </h2>
              <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
                Explore examples of my successful advertising campaigns and see
                the results I've achieved for clients.
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

        {/* Ad Campaigns Pricing */}
        <section className='py-16 md:py-20 bg-white'>
          <div className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='bg-gradient-to-br from-pink-50 to-purple-50 rounded-3xl p-8 md:p-12 shadow-sm'>
              <h2 className='text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-centre'>
                Ad Campaigns Pricing
              </h2>

              <div className='grid gap-8 md:grid-cols-2 max-w-4xl mx-auto'>
                <div className='bg-white rounded-2xl p-8 shadow-sm'>
                  <h3 className='text-xl font-bold text-gray-900 mb-4'>
                    Google Ads Setup
                  </h3>
                  <p className='text-3xl font-bold text-pink-600 mb-6'>
                    £90 <span className='text-base font-normal text-gray-600'>one-time</span>
                  </p>
                  <ul className='space-y-3 text-base text-gray-700'>
                    <li className='flex items-start'>
                      <span className='text-green-600 mr-2'>✓</span>
                      Professional campaign setup
                    </li>
                    <li className='flex items-start'>
                      <span className='text-green-600 mr-2'>✓</span>
                      Conversion tracking configured
                    </li>
                    <li className='flex items-start'>
                      <span className='text-green-600 mr-2'>✓</span>
                      Optimised from day one
                    </li>
                  </ul>
                </div>

                <div className='bg-white rounded-2xl p-8 shadow-sm'>
                  <h3 className='text-xl font-bold text-gray-900 mb-4'>
                    Optional Monthly Optimisation
                  </h3>
                  <p className='text-3xl font-bold text-pink-600 mb-6'>
                    from £150 <span className='text-base font-normal text-gray-600'>per month</span>
                  </p>
                  <ul className='space-y-3 text-base text-gray-700'>
                    <li className='flex items-start'>
                      <span className='text-green-600 mr-2'>✓</span>
                      Ongoing campaign optimisation
                    </li>
                    <li className='flex items-start'>
                      <span className='text-green-600 mr-2'>✓</span>
                      Regular performance reviews
                    </li>
                    <li className='flex items-start'>
                      <span className='text-green-600 mr-2'>✓</span>
                      Monthly reporting
                    </li>
                  </ul>
                </div>
              </div>

              <div className='text-centre mt-8'>
                <p className='text-base text-gray-600'>
                  No long contracts. Pricing tailored to your budget and goals.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className='py-20 bg-gray-50'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='text-centre mb-16'>
              <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>
                How I Work
              </h2>
              <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
                A straightforward process that gets results without the complexity.
              </p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
              <div className='text-centre'>
                <div className='w-16 h-16 bg-brand-pink text-white rounded-full flex items-centre justify-centre mx-auto mb-4 text-xl font-bold'>
                  1
                </div>
                <h3 className='text-lg font-bold text-gray-900 mb-2'>
                  Plan
                </h3>
                <p className='text-gray-600'>
                  We define your goals and agree on a realistic budget together.
                </p>
              </div>

              <div className='text-centre'>
                <div className='w-16 h-16 bg-brand-pink text-white rounded-full flex items-centre justify-centre mx-auto mb-4 text-xl font-bold'>
                  2
                </div>
                <h3 className='text-lg font-bold text-gray-900 mb-2'>Launch</h3>
                <p className='text-gray-600'>
                  I design and set up your campaigns to start generating results quickly.
                </p>
              </div>

              <div className='text-centre'>
                <div className='w-16 h-16 bg-brand-pink text-white rounded-full flex items-centre justify-centre mx-auto mb-4 text-xl font-bold'>
                  3
                </div>
                <h3 className='text-lg font-bold text-gray-900 mb-2'>
                  Track
                </h3>
                <p className='text-gray-600'>
                  You'll receive clear performance updates with simple explanations.
                </p>
              </div>

              <div className='text-centre'>
                <div className='w-16 h-16 bg-brand-pink text-white rounded-full flex items-centre justify-centre mx-auto mb-4 text-xl font-bold'>
                  4
                </div>
                <h3 className='text-lg font-bold text-gray-900 mb-2'>
                  Improve
                </h3>
                <p className='text-gray-600'>
                  I optimise your campaigns over time to maximise performance and return.
                </p>
              </div>
            </div>

            <div className='text-centre mt-8'>
              <p className='text-gray-600 max-w-2xl mx-auto'>
                You'll always know where your money is going and what it's earning.
              </p>
            </div>
          </div>
        </section>

        {/* ROI Case Study Results Section */}
        <section className='py-20 bg-white'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='text-centre mb-16'>
              <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>
                Proven Results
              </h2>
              <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
                Here are some examples of what I've achieved for local clients and for myself:
              </p>
            </div>

            <div className='max-w-4xl mx-auto'>
              <div className='space-y-6'>
                <div className='bg-gray-50 rounded-xl p-6'>
                  <div className='flex items-start'>
                    <div className='w-6 h-6 bg-brand-pink text-white rounded-full flex items-centre justify-centre text-sm font-bold mr-4 mt-1 flex-shrink-0'>1</div>
                    <p className='text-gray-700 text-lg'>2,470% average return on investment from targeted campaigns</p>
                  </div>
                </div>

                <div className='bg-gray-50 rounded-xl p-6'>
                  <div className='flex items-start'>
                    <div className='w-6 h-6 bg-brand-pink text-white rounded-full flex items-centre justify-centre text-sm font-bold mr-4 mt-1 flex-shrink-0'>2</div>
                    <p className='text-gray-700 text-lg'>£13,500 generated from a £546 marketing campaign</p>
                  </div>
                </div>

                <div className='bg-gray-50 rounded-xl p-6'>
                  <div className='flex items-start'>
                    <div className='w-6 h-6 bg-brand-pink text-white rounded-full flex items-centre justify-centre text-sm font-bold mr-4 mt-1 flex-shrink-0'>3</div>
                    <p className='text-gray-700 text-lg'>Increased bookings on the NYCC venue pages by 35%</p>
                  </div>
                </div>

                <div className='bg-gray-50 rounded-xl p-6'>
                  <div className='flex items-start'>
                    <div className='w-6 h-6 bg-brand-pink text-white rounded-full flex items-centre justify-centre text-sm font-bold mr-4 mt-1 flex-shrink-0'>4</div>
                    <p className='text-gray-700 text-lg'>4 years of consistent growth helping Cheshire businesses improve visibility and sales</p>
                  </div>
                </div>

                <div className='bg-white rounded-xl p-6 border-2 border-brand-pink'>
                  <p className='text-gray-700 text-lg text-centre'>
                    I assisted in bringing four leads to the Nantwich Youth Community and Centre's (NYCC) venues through the booking page promotions to local Facebook Business Group pages.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className='py-20 bg-brand-black text-white'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-centre'>
            <h2 className='text-3xl md:text-4xl font-bold mb-4'>
              Ready to Get More Local Leads?
            </h2>
            <p className='text-xl text-brand-grey mb-8 max-w-3xl mx-auto'>
              Let's build a campaign that helps your business grow and brings in consistent enquiries without the stress of managing ads yourself.
            </p>
            <Link
              href='/contact'
              className='inline-flex items-centre bg-brand-pink text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-brand-pink2 transition-colours'
            >
              Start My Campaign Plan
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
            <p className='text-sm text-brand-grey mt-4'>
              Free consultation, local support, and results you can measure.
            </p>
          </div>
        </section>

        {/* Service enquiry Form */}
        <div id="contact" className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <ServiceInquiryForm
            serviceName="Strategic Ad Campaigns"
            formspreeId="xpwaqjqr"
          />
        </div>

        {/* Sticky CTA */}
        <div className="fixed bottom-4 w-full flex justify-centre md:justify-end px-4 z-50 pointer-events-none">
          <button
            className="bg-black text-white text-base font-medium px-6 py-3 rounded-full shadow-lg hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colours pointer-events-auto min-h-[48px] min-w-[48px]"
            onClick={() => {
              const form = document.querySelector("#contact");
              form?.scrollIntoView({ behavior: "smooth" });
              if (typeof window !== "undefined" && typeof (window as any).gtag === "function") {
                (window as any).gtag("event", "sticky_cta_click", {
                  cta_text: "Start My Campaign",
                  page_type: "ads",
                });
              }
            }}
            aria-label="Start My Campaign - Scroll to contact form"
          >
            Start My Campaign
          </button>
        </div>
      </div>
    </Layout>
  );
}
