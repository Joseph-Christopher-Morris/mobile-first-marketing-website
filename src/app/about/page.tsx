import { Metadata } from 'next';
import { Layout } from '@/components/layout';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'About Us | Mobile-First Marketing Agency',
  description:
    'Learn about our mobile-first marketing agency. We specialize in photography, analytics, and ad campaigns designed to help your business grow.',
  openGraph: {
    title: 'About Us | Mobile-First Marketing Agency',
    description:
      'Learn about our mobile-first marketing agency. We specialize in photography, analytics, and ad campaigns designed to help your business grow.',
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
                About Our Agency
              </h1>
              <p className='text-lg md:text-xl text-gray-600 mb-8'>
                We're a mobile-first marketing agency dedicated to helping
                businesses thrive in the digital age.
              </p>
            </div>
          </div>
        </section>

        {/* Our Story Section */}
        <section className='py-16 md:py-24'>
          <div className='container mx-auto px-4'>
            <div className='max-w-6xl mx-auto'>
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
                <div>
                  <h2 className='text-2xl md:text-3xl font-bold text-gray-900 mb-6'>
                    Our Story
                  </h2>
                  <div className='space-y-4 text-gray-600'>
                    <p>
                      Founded with a vision to revolutionize digital marketing,
                      our agency has been at the forefront of mobile-first
                      design and strategy since day one. We recognized early on
                      that the future of marketing lies in creating experiences
                      that work seamlessly across all devices, with mobile
                      leading the way.
                    </p>
                    <p>
                      Our team combines creative expertise with data-driven
                      insights to deliver marketing solutions that not only look
                      great but also drive real results. From stunning
                      photography that captures your brand's essence to
                      sophisticated analytics that reveal actionable insights,
                      we're your partners in growth.
                    </p>
                    <p>
                      Today, we're proud to serve businesses of all sizes,
                      helping them navigate the complex digital landscape and
                      achieve their marketing goals through innovative,
                      mobile-first strategies.
                    </p>
                  </div>
                </div>
                <div className='relative'>
                  <OptimizedImage
                    src='/images/about-team.jpg'
                    alt='Our marketing team at work'
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

        {/* Our Mission & Values */}
        <section className='py-16 md:py-24 bg-gray-50'>
          <div className='container mx-auto px-4'>
            <div className='max-w-6xl mx-auto'>
              <div className='text-center mb-16'>
                <h2 className='text-2xl md:text-3xl font-bold text-gray-900 mb-4'>
                  Our Mission & Values
                </h2>
                <p className='text-lg text-gray-600 max-w-3xl mx-auto'>
                  We're driven by a simple mission: to help businesses succeed
                  in the mobile-first world through innovative marketing
                  strategies and exceptional service.
                </p>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
                {/* Mission */}
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
                        d='M13 10V3L4 14h7v7l9-11h-7z'
                      />
                    </svg>
                  </div>
                  <h3 className='text-xl font-bold text-gray-900 mb-4'>
                    Our Mission
                  </h3>
                  <p className='text-gray-600'>
                    To empower businesses with mobile-first marketing strategies
                    that drive growth, engagement, and lasting success in the
                    digital landscape.
                  </p>
                </div>

                {/* Innovation */}
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
                        d='M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z'
                      />
                    </svg>
                  </div>
                  <h3 className='text-xl font-bold text-gray-900 mb-4'>
                    Innovation
                  </h3>
                  <p className='text-gray-600'>
                    We stay ahead of the curve, constantly exploring new
                    technologies and strategies to deliver cutting-edge
                    marketing solutions.
                  </p>
                </div>

                {/* Results */}
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
                        d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
                      />
                    </svg>
                  </div>
                  <h3 className='text-xl font-bold text-gray-900 mb-4'>
                    Results-Driven
                  </h3>
                  <p className='text-gray-600'>
                    Every strategy we develop is focused on delivering
                    measurable results that contribute to your business growth
                    and success.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Services Overview */}
        <section className='py-16 md:py-24'>
          <div className='container mx-auto px-4'>
            <div className='max-w-6xl mx-auto'>
              <div className='text-center mb-16'>
                <h2 className='text-2xl md:text-3xl font-bold text-gray-900 mb-4'>
                  What We Do
                </h2>
                <p className='text-lg text-gray-600 max-w-3xl mx-auto'>
                  We offer a comprehensive suite of marketing services designed
                  to help your business succeed in the mobile-first world.
                </p>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
                {/* Photography */}
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
                    Professional Photography
                  </h3>
                  <p className='text-gray-600'>
                    High-quality visual content that captures your brand's
                    essence and engages your audience across all platforms.
                  </p>
                </div>

                {/* Analytics */}
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
                    Data Analytics
                  </h3>
                  <p className='text-gray-600'>
                    Comprehensive analytics and insights that help you
                    understand your audience and optimize your marketing
                    efforts.
                  </p>
                </div>

                {/* Ad Campaigns */}
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
                    Strategic Ad Campaigns
                  </h3>
                  <p className='text-gray-600'>
                    Targeted advertising campaigns designed to reach your ideal
                    customers and drive conversions across all channels.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className='py-16 md:py-24 bg-gray-50'>
          <div className='container mx-auto px-4'>
            <div className='max-w-6xl mx-auto'>
              <div className='text-center mb-16'>
                <h2 className='text-2xl md:text-3xl font-bold text-gray-900 mb-4'>
                  Why Choose Us
                </h2>
                <p className='text-lg text-gray-600 max-w-3xl mx-auto'>
                  We're not just another marketing agency. Here's what sets us
                  apart from the competition.
                </p>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
                <div className='text-center'>
                  <div className='text-3xl mb-4'>📱</div>
                  <h3 className='text-lg font-bold text-gray-900 mb-2'>
                    Mobile-First Approach
                  </h3>
                  <p className='text-gray-600 text-sm'>
                    Every strategy is designed with mobile users in mind,
                    ensuring optimal performance across all devices.
                  </p>
                </div>

                <div className='text-center'>
                  <div className='text-3xl mb-4'>📊</div>
                  <h3 className='text-lg font-bold text-gray-900 mb-2'>
                    Data-Driven Decisions
                  </h3>
                  <p className='text-gray-600 text-sm'>
                    We use comprehensive analytics to inform every decision and
                    continuously optimize your campaigns.
                  </p>
                </div>

                <div className='text-center'>
                  <div className='text-3xl mb-4'>🎯</div>
                  <h3 className='text-lg font-bold text-gray-900 mb-2'>
                    Targeted Results
                  </h3>
                  <p className='text-gray-600 text-sm'>
                    Our strategies are tailored to your specific audience and
                    business goals for maximum impact.
                  </p>
                </div>

                <div className='text-center'>
                  <div className='text-3xl mb-4'>🤝</div>
                  <h3 className='text-lg font-bold text-gray-900 mb-2'>
                    Partnership Approach
                  </h3>
                  <p className='text-gray-600 text-sm'>
                    We work as an extension of your team, providing ongoing
                    support and strategic guidance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className='py-16 md:py-24'>
          <div className='container mx-auto px-4'>
            <div className='max-w-6xl mx-auto'>
              <div className='text-center mb-16'>
                <h2 className='text-2xl md:text-3xl font-bold text-gray-900 mb-4'>
                  Meet Our Team
                </h2>
                <p className='text-lg text-gray-600 max-w-3xl mx-auto'>
                  Our diverse team of marketing experts, designers, and
                  strategists work together to deliver exceptional results for
                  our clients.
                </p>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
                {/* Team Member 1 */}
                <div className='text-center'>
                  <div className='w-32 h-32 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center'>
                    <svg
                      className='w-16 h-16 text-gray-400'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path
                        fillRule='evenodd'
                        d='M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z'
                        clipRule='evenodd'
                      />
                    </svg>
                  </div>
                  <h3 className='text-xl font-bold text-gray-900 mb-2'>
                    Sarah Johnson
                  </h3>
                  <p className='text-blue-600 font-medium mb-3'>
                    Creative Director
                  </p>
                  <p className='text-gray-600 text-sm'>
                    With over 10 years of experience in digital marketing, Sarah
                    leads our creative team in developing innovative campaigns
                    that drive results.
                  </p>
                </div>

                {/* Team Member 2 */}
                <div className='text-center'>
                  <div className='w-32 h-32 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center'>
                    <svg
                      className='w-16 h-16 text-gray-400'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path
                        fillRule='evenodd'
                        d='M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z'
                        clipRule='evenodd'
                      />
                    </svg>
                  </div>
                  <h3 className='text-xl font-bold text-gray-900 mb-2'>
                    Mike Chen
                  </h3>
                  <p className='text-blue-600 font-medium mb-3'>
                    Analytics Specialist
                  </p>
                  <p className='text-gray-600 text-sm'>
                    Mike transforms complex data into actionable insights,
                    helping our clients understand their audience and optimize
                    their marketing efforts.
                  </p>
                </div>

                {/* Team Member 3 */}
                <div className='text-center'>
                  <div className='w-32 h-32 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center'>
                    <svg
                      className='w-16 h-16 text-gray-400'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path
                        fillRule='evenodd'
                        d='M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z'
                        clipRule='evenodd'
                      />
                    </svg>
                  </div>
                  <h3 className='text-xl font-bold text-gray-900 mb-2'>
                    Emily Rodriguez
                  </h3>
                  <p className='text-blue-600 font-medium mb-3'>
                    Photography Lead
                  </p>
                  <p className='text-gray-600 text-sm'>
                    Emily captures stunning visuals that tell your brand's story
                    and connect with your audience on an emotional level.
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
                Ready to Grow Your Business?
              </h2>
              <p className='text-lg mb-8 opacity-90'>
                Let's work together to create a mobile-first marketing strategy
                that drives real results for your business.
              </p>
              <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                <a
                  href='/contact'
                  className='inline-flex items-center justify-center px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors'
                >
                  Get Started Today
                </a>
                <a
                  href='/services'
                  className='inline-flex items-center justify-center px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-colors'
                >
                  View Our Services
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
