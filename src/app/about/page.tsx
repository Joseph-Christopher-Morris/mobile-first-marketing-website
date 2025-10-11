import { Metadata } from 'next';
import { Layout } from '@/components/layout';
import OptimizedImage from '@/components/ui/OptimizedImage';


export const metadata: Metadata = {
  title: 'About Me | Digital Marketing & Photography Expert',
  description:
    'Learn about my journey from professional photography to data-driven digital marketing, with expertise in Adobe Experience Cloud and Google Marketing Platform.',
  openGraph: {
    title: 'About Me | Digital Marketing & Photography Expert',
    description:
      'Learn about my journey from professional photography to data-driven digital marketing, with expertise in Adobe Experience Cloud and Google Marketing Platform.',
    type: 'website',
  },
};

export default function AboutPage() {
  return (
    <Layout pageTitle='About'>
      <div className='min-h-screen bg-white'>
        {/* Hero Section */}
        <section className='bg-gradient-to-br from-blue-50 to-indigo-100 py-16 md:py-24'>
          <div className='container mx-auto px-4'>
            <div className='max-w-4xl mx-auto text-center'>
              <h1 className='text-3xl md:text-5xl font-bold text-gray-900 mb-6'>
                About Me
              </h1>
              <p className='text-lg md:text-xl text-gray-600 mb-8'>
                I&apos;m a digital marketer and photographer helping small businesses
                grow through smart strategy, creative visuals, and data-led
                decisions.
              </p>
            </div>
          </div>
        </section>

        {/* My Journey Section */}
        <section className='py-16 md:py-24'>
          <div className='container mx-auto px-4'>
            <div className='max-w-6xl mx-auto'>
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
                <div>
                  <h2 className='text-2xl md:text-3xl font-bold text-gray-900 mb-6'>
                    My Journey
                  </h2>
                  <div className='space-y-4 text-gray-600'>
                    <p>
                      I began with photography, capturing classic cars,
                      auctions, and events, and built a thriving business from
                      scratch. Along the way, I discovered the power of{' '}
                      <strong>analytics and marketing technology</strong>.
                    </p>
                    <p>
                      Now, I combine creative storytelling with tools like{' '}
                      <strong>Adobe Analytics</strong>,{' '}
                      <strong>Meta Ads</strong>, and <strong>Google Ads</strong>{' '}
                      to help brands stand out and reach their target audience.
                    </p>
                    <p>
                      My work has been featured in{' '}
                      <strong>Business Insider</strong> and the{' '}
                      <strong>Daily Mail</strong>, and I&apos;m certified in{' '}
                      <strong>Adobe Experience Cloud</strong> and{' '}
                      <strong>Google Marketing Platform</strong>.
                    </p>
                  </div>
                </div>
                <div className='relative'>
                  <OptimizedImage
                    src='/images/about/A7302858.webp'
                    alt='Professional headshot'
                    width={600}
                    height={400}
                    className='rounded-lg shadow-lg'
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What I Do */}
        <section className='py-16 md:py-24 bg-gray-50'>
          <div className='container mx-auto px-4'>
            <div className='max-w-6xl mx-auto'>
              <div className='text-center mb-16'>
                <h2 className='text-2xl md:text-3xl font-bold text-gray-900 mb-4'>
                  What I Do
                </h2>
                <p className='text-lg text-gray-600 max-w-3xl mx-auto'>
                  I combine creative storytelling with data-driven insights to
                  help brands stand out and reach the right audience.
                </p>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
                {/* Photography */}
                <div className='bg-white rounded-lg p-8 shadow-sm text-center'>
                  <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6'>
                    <svg
                      className='w-8 h-8 text-blue-600'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z'
                      />
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M15 13a3 3 0 11-6 0 3 3 0 016 0z'
                      />
                    </svg>
                  </div>
                  <h3 className='text-xl font-bold text-gray-900 mb-4'>
                    Photography
                  </h3>
                  <p className='text-gray-600'>
                    Professional visuals that connect with your audience
                  </p>
                </div>

                {/* Data Analytics */}
                <div className='bg-white rounded-lg p-8 shadow-sm text-center'>
                  <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6'>
                    <svg
                      className='w-8 h-8 text-green-600'
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
                    Data Analytics
                  </h3>
                  <p className='text-gray-600'>
                    Turn insights into clear actions and growth
                  </p>
                </div>

                {/* Ad Campaigns */}
                <div className='bg-white rounded-lg p-8 shadow-sm text-center'>
                  <div className='w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6'>
                    <svg
                      className='w-8 h-8 text-purple-600'
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
                    Ad Campaigns
                  </h3>
                  <p className='text-gray-600'>
                    Strategy and optimisation across Meta & Google Ads
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Work With Me */}
        <section className='py-16 md:py-24'>
          <div className='container mx-auto px-4'>
            <div className='max-w-6xl mx-auto'>
              <div className='text-center mb-16'>
                <h2 className='text-2xl md:text-3xl font-bold text-gray-900 mb-4'>
                  Why Work With Me
                </h2>
                <p className='text-lg text-gray-600 max-w-3xl mx-auto'>
                  I bring together creative expertise and data-driven insights
                  to deliver marketing solutions that drive real results.
                </p>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
                {/* Creative & Data-Driven */}
                <div className='text-center'>
                  <div className='w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6'>
                    <svg
                      className='w-10 h-10 text-blue-600'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z'
                      />
                    </svg>
                  </div>
                  <h3 className='text-xl font-bold text-gray-900 mb-4'>
                    Creative & Data-Driven
                  </h3>
                  <p className='text-gray-600'>
                    Eye-catching content backed by analytics
                  </p>
                </div>

                {/* Results-Focused */}
                <div className='text-center'>
                  <div className='w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6'>
                    <svg
                      className='w-10 h-10 text-green-600'
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
                    Results-Focused
                  </h3>
                  <p className='text-gray-600'>
                    Measurable improvements and ROI
                  </p>
                </div>

                {/* Client-Centered */}
                <div className='text-center'>
                  <div className='w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6'>
                    <svg
                      className='w-10 h-10 text-purple-600'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
                      />
                    </svg>
                  </div>
                  <h3 className='text-xl font-bold text-gray-900 mb-4'>
                    Client-Centred
                  </h3>
                  <p className='text-gray-600'>
                    Collaborative and tailored to your goals
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Credentials & Recognition */}
        <section className='py-16 md:py-24 bg-gray-50'>
          <div className='container mx-auto px-4'>
            <div className='max-w-6xl mx-auto'>
              <div className='text-center mb-16'>
                <h2 className='text-2xl md:text-3xl font-bold text-gray-900 mb-4'>
                  Credentials & Recognition
                </h2>
                <p className='text-lg text-gray-600 max-w-3xl mx-auto'>
                  My work has been recognized by leading publications and I hold
                  certifications from top marketing platforms.
                </p>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
                <div className='text-center'>
                  <div className='text-3xl mb-4'>📰</div>
                  <h3 className='text-lg font-bold text-gray-900 mb-2'>
                    Business Insider
                  </h3>
                  <p className='text-gray-600 text-sm'>
                    Featured work and insights in leading business publication
                  </p>
                </div>

                <div className='text-center'>
                  <div className='text-3xl mb-4'>📰</div>
                  <h3 className='text-lg font-bold text-gray-900 mb-2'>
                    Daily Mail
                  </h3>
                  <p className='text-gray-600 text-sm'>
                    Photography and marketing work featured in major media
                    outlet
                  </p>
                </div>

                <div className='text-center'>
                  <div className='text-3xl mb-4'>🎯</div>
                  <h3 className='text-lg font-bold text-gray-900 mb-2'>
                    Adobe Experience Cloud
                  </h3>
                  <p className='text-gray-600 text-sm'>
                    Certified in Adobe's comprehensive marketing platform
                  </p>
                </div>

                <div className='text-center'>
                  <div className='text-3xl mb-4'>📊</div>
                  <h3 className='text-lg font-bold text-gray-900 mb-2'>
                    Google Marketing Platform
                  </h3>
                  <p className='text-gray-600 text-sm'>
                    Certified in Google's advanced marketing and analytics tools
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className='py-16 md:py-24 bg-blue-600 text-white'>
          <div className='container mx-auto px-4'>
            <div className='max-w-4xl mx-auto text-center'>
              <h2 className='text-2xl md:text-3xl font-bold mb-6'>
                Ready to take your marketing further?
              </h2>
              <p className='text-lg mb-8 opacity-90'>
                Let's discuss your project and how I can help you achieve your
                marketing goals through creative visuals and data-driven
                strategy.
              </p>
              <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                <a
                  href='/contact'
                  className='inline-flex items-center justify-center px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors'
                >
                  Contact Me
                </a>
                <a
                  href='/services'
                  className='inline-flex items-center justify-center px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-black transition-colors'
                >
                  View My Services
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
