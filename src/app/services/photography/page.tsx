import { Metadata } from 'next';
import { Layout } from '@/components/layout';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Professional Automotive Photography Services | Nantwich & Cheshire',
  description:
    'Professional automotive and commercial photography services in Nantwich & Cheshire. Stunning automotive imagery with mobile-optimized delivery and professional storytelling for dealerships, private sales, and marketing campaigns.',
  keywords: [
    'automotive photography services',
    'car photography Nantwich',
    'vehicle photography Cheshire',
    'commercial automotive photography',
    'car dealership photography',
    'automotive marketing photography',
    'professional vehicle photography',
    'automotive showcase photography',
    'car auction photography',
    'automotive advertising photography'
  ],
  openGraph: {
    title: 'Professional Automotive Photography Services | Nantwich & Cheshire',
    description: 'Professional automotive and commercial photography services in Nantwich & Cheshire. Stunning automotive imagery with mobile-optimized delivery and professional storytelling.',
    images: [
      {
        url: '/images/services/250928-hampson-auctions-sunday-11.webp',
        width: 1200,
        height: 630,
        alt: 'Professional automotive photography showcase - Hampson Auctions vehicle presentation with expert lighting and composition',
      },
    ],
  },
};

export default function PhotographyServicesPage() {
  const portfolioImages = [
    {
      src: '/images/services/240217-australia-trip-232.webp',
      alt: 'Professional automotive photography showcase from Australia trip - luxury vehicle in scenic outdoor setting',
      title: 'Automotive Excellence',
      width: 400,
      height: 300,
    },
    {
      src: '/images/services/240219-australia-trip-148.webp',
      alt: 'Commercial automotive photography from Australia - professional vehicle showcase with dramatic lighting',
      title: 'Commercial Precision',
      width: 400,
      height: 300,
    },
    {
      src: '/images/services/240619-london-19.webp',
      alt: 'London automotive photography session - urban vehicle photography with city backdrop',
      title: 'Urban Automotive',
      width: 400,
      height: 300,
    },
    {
      src: '/images/services/240619-london-26.webp',
      alt: 'Professional London automotive photography - metropolitan vehicle showcase with urban styling',
      title: 'Metropolitan Style',
      width: 400,
      height: 300,
    },
    {
      src: '/images/services/240619-london-64.webp',
      alt: 'London commercial photography showcase - professional automotive imagery in urban environment',
      title: 'Commercial Excellence',
      width: 400,
      height: 300,
    },
    {
      src: '/images/services/250125-liverpool-40.webp',
      alt: 'Liverpool automotive photography - regional expertise showcase with professional vehicle presentation',
      title: 'Regional Expertise',
      width: 400,
      height: 300,
    },
    {
      src: '/images/services/250928-hampson-auctions-sunday-11.webp',
      alt: 'Hampson Auctions automotive photography - professional auction vehicle presentation with expert composition',
      title: 'Auction Excellence',
      width: 400,
      height: 300,
    },
  ];

  return (
    <Layout pageTitle='Photography Services'>
      <div className='min-h-screen bg-white'>
        {/* Hero Section */}
        <section className='relative bg-brand-black text-white py-20 lg:py-32'>
          <div className='absolute inset-0 bg-black/20'></div>
          <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
              <div>
                <h1 className='text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6'>
                  Professional{' '}
                  <span className='text-brand-pink'>Photography</span> Services
                </h1>
                <p className='text-xl md:text-2xl text-brand-grey mb-8 leading-relaxed'>
                  Capturing stunning automotive and commercial imagery with
                  mobile-first optimization and professional storytelling.
                </p>
                <div className='flex flex-col sm:flex-row gap-4'>
                  <Link
                    href='/contact'
                    className='bg-brand-pink text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-brand-pink2 transition-colors text-center'
                  >
                    Book a Session
                  </Link>
                  <Link
                    href='/blog'
                    className='border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-gray-900 transition-colors text-center'
                  >
                    View Our Work
                  </Link>
                </div>
              </div>
              <div className='relative'>
                <div className='relative h-96 lg:h-[500px] rounded-lg overflow-hidden shadow-2xl'>
                  <Image
                    src='/images/services/250928-hampson-auctions-sunday-11.webp'
                    alt='Professional automotive photography showcase - Hampson Auctions vehicle presentation with expert lighting and composition'
                    fill
                    className='object-cover'
                    priority
                    sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
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
                Our Photography Services
              </h2>
              <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
                From automotive showcases to commercial projects, we deliver
                exceptional photography that drives results.
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
                  Automotive Photography
                </h3>
                <p className='text-gray-600'>
                  Stunning automotive photography that showcases vehicles in
                  their best light, perfect for dealerships, private sales, and
                  marketing campaigns.
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
                      d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
                    />
                  </svg>
                </div>
                <h3 className='text-xl font-bold text-gray-900 mb-4'>
                  Commercial Photography
                </h3>
                <p className='text-gray-600'>
                  Professional commercial photography for businesses, products,
                  and corporate events with mobile-optimized delivery.
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
                      d='M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z'
                    />
                  </svg>
                </div>
                <h3 className='text-xl font-bold text-gray-900 mb-4'>
                  Mobile-First Delivery
                </h3>
                <p className='text-gray-600'>
                  All images are optimized for mobile viewing and fast loading,
                  ensuring your content looks perfect on any device.
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
                Explore our portfolio of automotive and commercial photography
                projects that showcase our expertise and attention to detail.
              </p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
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
                      sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
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
                Our Photography Process
              </h2>
              <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
                From initial consultation to final delivery, we ensure every
                step meets our high standards of excellence.
              </p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
              <div className='text-center'>
                <div className='w-16 h-16 bg-brand-pink text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold'>
                  1
                </div>
                <h3 className='text-lg font-bold text-gray-900 mb-2'>
                  Consultation
                </h3>
                <p className='text-gray-600'>
                  We discuss your vision, requirements, and objectives to create
                  the perfect photography plan.
                </p>
              </div>

              <div className='text-center'>
                <div className='w-16 h-16 bg-brand-pink text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold'>
                  2
                </div>
                <h3 className='text-lg font-bold text-gray-900 mb-2'>
                  Planning
                </h3>
                <p className='text-gray-600'>
                  Detailed planning including location scouting, equipment
                  preparation, and timeline coordination.
                </p>
              </div>

              <div className='text-center'>
                <div className='w-16 h-16 bg-brand-pink text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold'>
                  3
                </div>
                <h3 className='text-lg font-bold text-gray-900 mb-2'>
                  Shooting
                </h3>
                <p className='text-gray-600'>
                  Professional photography session with attention to detail and
                  creative excellence.
                </p>
              </div>

              <div className='text-center'>
                <div className='w-16 h-16 bg-brand-pink text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold'>
                  4
                </div>
                <h3 className='text-lg font-bold text-gray-900 mb-2'>
                  Delivery
                </h3>
                <p className='text-gray-600'>
                  Professional editing and mobile-optimized delivery of your
                  final images.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className='py-20 bg-brand-black text-white'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
            <h2 className='text-3xl md:text-4xl font-bold mb-4'>
              Ready to Capture Something Amazing?
            </h2>
            <p className='text-xl text-brand-grey mb-8 max-w-3xl mx-auto'>
              Let's work together to create stunning photography that showcases
              your vision and drives results.
            </p>
            <Link
              href='/contact'
              className='inline-flex items-center bg-brand-pink text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-brand-pink2 transition-colors'
            >
              Book Your Session
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
