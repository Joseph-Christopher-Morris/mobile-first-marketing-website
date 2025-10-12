import { Metadata } from 'next';
import { GeneralContactForm } from '@/components/sections/GeneralContactForm';
import { Layout } from '@/components/layout';
import { siteConfig } from '@/config/site';
import { ContactLink } from '@/components/sections/ContactPageClient';

export const metadata: Metadata = {
  title:
    'Contact Vivid Auto Photography | Professional Automotive Photography Services',
  description:
    'Get in touch about professional automotive photography, data analytics, or strategic advertising campaigns in Nantwich & Cheshire. Free consultation available. Response within one business day (UK time).',
  keywords: [
    'contact automotive photographer',
    'automotive photography Nantwich',
    'car photography Cheshire',
    'automotive photography consultation',
    'professional car photographer contact',
    'automotive marketing services contact',
    'vehicle photography enquiry',
    'automotive advertising consultation',
    'car dealership photography contact',
    'automotive photography quote',
  ],
  openGraph: {
    title:
      'Contact Vivid Auto Photography | Professional Automotive Photography Services',
    description:
      'Get in touch about professional automotive photography, data analytics, or strategic advertising campaigns in Nantwich & Cheshire. Free consultation available.',
    type: 'website',
    images: [
      {
        url: '/images/hero/aston-martin-db6-website.webp',
        width: 1200,
        height: 630,
        alt: 'Contact Vivid Auto Photography for professional automotive photography services in Nantwich & Cheshire',
      },
    ],
  },
};

export default function ContactPage() {
  return (
    <Layout pageTitle='Contact'>
      <div className='min-h-screen bg-white'>
        {/* Hero Section */}
        <section className='bg-brand-white py-12 md:py-20'>
          <div className='container mx-auto px-4'>
            <div className='max-w-4xl mx-auto text-center'>
              <h1 className='text-2xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 md:mb-6'>
                Let&apos;s Work Together
              </h1>
              <p className='text-base md:text-lg lg:text-xl text-gray-600 mb-6 md:mb-8'>
                Need professional automotive or event photography, GA4 setup, ad
                campaigns or website hosting support? Share the details of your
                project and I will be in touch within{' '}
                <span className='font-semibold'>one business day</span> (UK
                time).
              </p>
            </div>
          </div>
        </section>

        {/* Contact Form and Info */}
        <section className='py-12 md:py-20'>
          <div className='container mx-auto px-4'>
            <div className='max-w-6xl mx-auto'>
              <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12'>
                {/* Contact Form */}
                <div className='lg:col-span-2 order-2 lg:order-1'>
                  <GeneralContactForm />
                </div>

                {/* Contact Information Sidebar */}
                <div className='order-1 lg:order-2 space-y-8'>
                  <div>
                    <h3 className='text-xl font-bold text-gray-900 mb-6'>
                      Contact details
                    </h3>
                    <div className='space-y-6'>
                      <div className='flex items-start space-x-4'>
                        <div className='flex-shrink-0 w-6 h-6 text-brand-pink mt-1'>
                          <svg
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
                            />
                          </svg>
                        </div>
                        <div>
                          <p className='font-medium text-gray-900 mb-1'>
                            Email
                          </p>
                          <ContactLink
                            type='email'
                            value='joe@vividauto.photography'
                            className='text-brand-pink hover:text-brand-pink2 underline underline-offset-2'
                            aria-label='Email Joe'
                          >
                            joe@vividauto.photography
                          </ContactLink>
                        </div>
                      </div>

                      <div className='flex items-start space-x-4'>
                        <div className='flex-shrink-0 w-6 h-6 text-brand-pink mt-1'>
                          <svg
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'
                            />
                          </svg>
                        </div>
                        <div>
                          <p className='font-medium text-gray-900 mb-1'>
                            Phone
                          </p>
                          <ContactLink
                            type='phone'
                            value='+447586378502'
                            className='text-brand-pink hover:text-brand-pink2 underline underline-offset-2'
                            aria-label='Call me'
                          >
                            (+44) 07586 378502
                          </ContactLink>
                        </div>
                      </div>

                      <div className='flex items-start space-x-4'>
                        <div className='flex-shrink-0 w-6 h-6 text-brand-pink mt-1'>
                          <svg
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
                            />
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M15 11a3 3 0 11-6 0 3 3 0 016 0z'
                            />
                          </svg>
                        </div>
                        <div>
                          <p className='font-medium text-gray-900 mb-1'>
                            Location
                          </p>
                          <address className='text-gray-600 not-italic'>
                            Nantwich, Cheshire UK
                          </address>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className='text-xl font-bold text-gray-900 mb-4'>
                      Hours (UK time)
                    </h3>
                    <div className='space-y-3 text-gray-700'>
                      <div className='flex justify-between items-center'>
                        <span className='font-medium'>Monday – Friday</span>
                        <span>09:00 – 18:00</span>
                      </div>
                      <div className='flex justify-between items-center'>
                        <span className='font-medium'>Saturday</span>
                        <span>10:00 – 14:00</span>
                      </div>
                      <div className='flex justify-between items-center'>
                        <span className='font-medium'>Sunday</span>
                        <span className='text-brand-pink'>Closed</span>
                      </div>
                    </div>
                    <p className='text-xs text-gray-500 mt-2'>
                      Response times may vary on shoot days and auction events.
                    </p>
                  </div>

                  <div>
                    <h3 className='text-xl font-bold text-gray-900 mb-4'>
                      Follow me
                    </h3>
                    <div className='flex space-x-4'>
                      {siteConfig.socialMedia.facebook && (
                        <a
                          href={siteConfig.socialMedia.facebook}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='w-12 h-12 bg-pink-600 text-white rounded-full flex items-center justify-center hover:bg-pink-700 transition-colors'
                          aria-label='Follow on Facebook'
                        >
                          <svg
                            className='w-6 h-6'
                            fill='currentColor'
                            viewBox='0 0 20 20'
                          >
                            <path
                              fillRule='evenodd'
                              d='M20 10C20 4.477 15.523 0 10 0S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z'
                              clipRule='evenodd'
                            />
                          </svg>
                        </a>
                      )}

                      {siteConfig.socialMedia.linkedin && (
                        <a
                          href={siteConfig.socialMedia.linkedin}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='w-12 h-12 bg-pink-600 text-white rounded-full flex items-center justify-center hover:bg-pink-700 transition-colors'
                          aria-label='Connect on LinkedIn'
                        >
                          <svg
                            className='w-6 h-6'
                            fill='currentColor'
                            viewBox='0 0 20 20'
                          >
                            <path
                              fillRule='evenodd'
                              d='M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z'
                              clipRule='evenodd'
                            />
                          </svg>
                        </a>
                      )}
                      {siteConfig.socialMedia.instagram && (
                        <a
                          href={siteConfig.socialMedia.instagram}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='w-12 h-12 bg-pink-600 text-white rounded-full flex items-center justify-center hover:bg-pink-700 transition-colors'
                          aria-label='Follow on Instagram'
                        >
                          <svg
                            className='w-6 h-6'
                            fill='currentColor'
                            viewBox='0 0 20 20'
                          >
                            <path
                              fillRule='evenodd'
                              d='M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z'
                              clipRule='evenodd'
                            />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Urgent Contact */}
                  <div className='bg-brand-white border border-brand-pink rounded-lg p-4'>
                    <h4 className='text-lg font-semibold text-brand-black mb-2'>
                      Urgent project or same-day shoot?
                    </h4>
                    <p className='text-brand-black text-sm mb-3'>
                      For live events, auction days, or time-sensitive
                      campaigns, call me directly.
                    </p>
                    <a
                      href='tel:+447586378502'
                      className='inline-flex items-center space-x-2 text-brand-pink hover:text-brand-pink2 font-semibold'
                      aria-label='Call now'
                    >
                      <svg
                        className='w-4 h-4'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'
                        />
                      </svg>
                      <span>Call now</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className='py-12 md:py-16 bg-gray-50'>
          <div className='container mx-auto px-4'>
            <div className='max-w-4xl mx-auto'>
              <h2 className='text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8'>
                Frequently asked questions
              </h2>

              <div className='space-y-6'>
                <div className='bg-white rounded-lg p-6 shadow-sm'>
                  <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                    How quickly do you respond to enquiries?
                  </h3>
                  <p className='text-gray-700'>
                    I personally reply to all messages within one business day.
                    If something is urgent, you are welcome to call so I can
                    help sooner.
                  </p>
                </div>

                <div className='bg-white rounded-lg p-6 shadow-sm'>
                  <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                    Where do you work?
                  </h3>
                  <p className='text-gray-700'>
                    I mainly work with small businesses in Nantwich and across
                    Cheshire, but I am happy to support nearby areas as well.
                  </p>
                </div>

                <div className='bg-white rounded-lg p-6 shadow-sm'>
                  <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                    What services do you offer?
                  </h3>
                  <p className='text-gray-700'>
                    I provide automotive and event photography, Google Analytics
                    and GA4 implementation, Google Ads, Meta Ads, paid
                    advertising campaigns and website migration to AWS
                    CloudFront.
                  </p>
                </div>

                <div className='bg-white rounded-lg p-6 shadow-sm'>
                  <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                    What information should I include in my message?
                  </h3>
                  <p className='text-gray-700'>
                    Please share details about your project and goals, your
                    timeline or launch date, budget or ad spend range, and
                    access to tools like Google Analytics or ad accounts if
                    available. The more context you give, the easier it is for
                    me to recommend the right approach.
                  </p>
                </div>

                <div className='bg-white rounded-lg p-6 shadow-sm'>
                  <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                    Do you offer free consultations?
                  </h3>
                  <p className='text-gray-700'>
                    Yes. I offer a free 30-minute consultation by phone, video
                    meeting or email review to talk through your goals and
                    explore how I can best support your business.
                  </p>
                </div>

                <div className='bg-white rounded-lg p-6 shadow-sm'>
                  <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                    Can you help if I am not sure what I need yet?
                  </h3>
                  <p className='text-gray-700'>
                    Absolutely. If you are unsure where to start, we can look at
                    your current marketing together and decide on the most
                    helpful next steps during the free consultation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
