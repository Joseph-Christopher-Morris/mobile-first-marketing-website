import { Metadata } from 'next';
import { Layout } from '@/components/layout';
import Image from 'next/image';
import Link from 'next/link';
import PhotographyGallery from '@/components/services/PhotographyGallery';

export const metadata: Metadata = {
  title: 'Professional Photography Services | Nantwich & Cheshire',
  description:
    'Professional photography services in Nantwich & Cheshire. Published editorial work for BBC, Forbes, and The Times. Local Nantwich photography and commercial campaign work.',
  keywords: [
    'professional photography services',
    'photography Nantwich',
    'commercial photography Cheshire',
    'editorial photography',
    'published photographer',
    'BBC photographer',
    'Forbes photographer',
    'The Times photographer',
    'local photography Nantwich',
    'campaign photography'
  ],
  openGraph: {
    title: 'Professional Photography Services | Nantwich & Cheshire',
    description: 'Professional photography services with published editorial work for BBC, Forbes, and The Times. Local Nantwich photography and commercial campaigns.',
    images: [
      {
        url: '/images/services/Photography/public/images/services/photography-hero.webp',
        width: 1200,
        height: 630,
        alt: 'General view of a busy Hampson Auctions sale at Oulton Park, shot in July 2024',
      },
    ],
  },
};

export default function PhotographyServicesPage() {
  // Gallery images with balanced mixed aspect ratios
  const galleryImages = [
    // Editorial proof - Financial Times (special formatting)
    {
      src: '/images/services/Photography/5eb6fc44-e1a5-460d-8dea-923fd303f59d.webp',
      alt: 'Editorial proof showing published photography work for BBC, Forbes, and The Times',
      title: 'UK vies with Germany to be European EV champion',
      subtitle: 'Year of record sales was still below government targets',
      caption: 'The share of EV sales in the UK hit 31 per cent in December, often a quiet month for car transactions where last-minute deliveries of EVs can inflate their market position © Vivid Brands/Alamy',
      type: 'clipping' as const,
    },
    // Local Nantwich photography samples
    {
      src: '/images/services/Photography/240427-_Nantwich_Stock_Photography-19.webp',
      title: 'Nantwich Market Photography',
      alt: 'Professional Nantwich market photography showcasing local commerce and community',
      type: 'local' as const,
      caption: 'Local editorial-style photography for Cheshire businesses and community documentation.'
    },
    {
      src: '/images/services/Photography/240427-_Nantwich_Stock_Photography-23.webp',
      title: 'Nantwich Town Center Architecture',
      alt: 'Nantwich town center photography capturing local business and architecture',
      type: 'local' as const,
      caption: 'Architectural and commercial photography showcasing local business environments.'
    },
    {
      src: '/images/services/Photography/240421-Nantwich_Stock_Photography-49.webp',
      title: 'Community Street Photography',
      alt: 'Local Nantwich street photography showing community and daily life',
      type: 'local' as const,
      caption: 'Documentary-style photography capturing authentic community moments and daily life.'
    },
    {
      src: '/images/services/Photography/250331-Nantwich-4.webp',
      title: 'Modern Business Photography',
      alt: 'Contemporary Nantwich photography showcasing modern local business',
      type: 'local' as const,
      caption: 'Contemporary commercial photography for modern local businesses and services.'
    },
    {
      src: '/images/services/Photography/250730-Nantwich_Show-79.webp',
      title: 'Nantwich Show Event Coverage',
      alt: 'Nantwich Show event photography capturing local community celebration',
      type: 'local' as const,
      caption: 'Event photography documenting local community celebrations and cultural activities.'
    },
    {
      src: '/images/services/Photography/250830-Nantwich_Food_Festival-11.webp',
      title: 'Food Festival Documentation',
      alt: 'Nantwich Food Festival photography showcasing local culinary culture',
      type: 'local' as const,
      caption: 'Culinary event photography highlighting local food culture and community gatherings.'
    },
    // Campaign work samples
    {
      src: '/images/services/Photography/photography-sample-1.webp',
      title: 'Commercial Product Campaign',
      alt: 'Professional campaign photography sample showcasing commercial work quality',
      type: 'campaign' as const,
      caption: 'High-end commercial photography used in marketing campaigns and brand communications.'
    },
    {
      src: '/images/services/Photography/photography-sample-2.webp',
      title: 'Creative Campaign Photography',
      alt: 'Campaign photography work demonstrating creative commercial approach',
      type: 'campaign' as const,
      caption: 'Creative commercial photography with artistic approach for brand storytelling.'
    },
    {
      src: '/images/services/Photography/photography-sample-3.webp',
      title: 'Technical Excellence Portfolio',
      alt: 'Professional campaign photography showing technical expertise and composition',
      type: 'campaign' as const,
      caption: 'Technical photography demonstrating professional standards and composition expertise.'
    },
    {
      src: '/images/services/Photography/photography-sample-4.webp',
      title: 'Professional Standards Showcase',
      alt: 'Campaign work sample highlighting professional photography standards',
      type: 'campaign' as const,
      caption: 'Professional campaign photography meeting industry standards for commercial use.'
    }
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
                  Published editorial photographer with work featured in BBC, Forbes, and The Times. 
                  Specializing in local Nantwich photography and commercial campaigns.
                </p>
                <div className='flex flex-col sm:flex-row gap-4'>
                  <Link
                    href='/contact'
                    className='bg-brand-pink text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-brand-pink2 transition-colors text-center'
                  >
                    Book Your Photoshoot →
                  </Link>
                  <Link
                    href='#gallery'
                    className='border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-gray-900 transition-colors text-center'
                  >
                    View Portfolio
                  </Link>
                </div>
              </div>
              <div className='relative'>
                <div className='relative h-96 lg:h-[500px] rounded-lg overflow-hidden shadow-2xl'>
                  <Image
                    src='/images/services/Photography/editorial-proof-bbc-forbes-times.webp'
                    alt='Editorial proof showing published photography work for BBC, Forbes, and The Times'
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

        {/* Service Description */}
        <section className='py-20 bg-gray-50'>
          <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
            <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-6'>
              Published Editorial Photographer
            </h2>
            <p className='text-xl text-gray-600 mb-8 leading-relaxed'>
              With published work featured in major publications including BBC, Forbes, and The Times, 
              I bring editorial-quality photography to local Nantwich businesses and commercial campaigns. 
              From capturing the essence of local markets to creating compelling commercial imagery, 
              every shot tells a story that connects with your audience.
            </p>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-8 text-center'>
              <div>
                <div className='text-3xl font-bold text-brand-pink mb-2'>3+</div>
                <div className='text-gray-600'>Major Publications</div>
              </div>
              <div>
                <div className='text-3xl font-bold text-brand-pink mb-2'>50+</div>
                <div className='text-gray-600'>Local Projects</div>
              </div>
              <div>
                <div className='text-3xl font-bold text-brand-pink mb-2'>100+</div>
                <div className='text-gray-600'>Campaign Images</div>
              </div>
            </div>
          </div>
        </section>

        {/* Photography Gallery */}
        <section id='gallery' className='py-20 bg-white'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='text-center mb-16'>
              <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>
                Portfolio Gallery
              </h2>
              <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
                Real work samples showcasing published editorial photography, local Nantwich projects, 
                and commercial campaign work. Each image represents my commitment to quality and storytelling.
              </p>
            </div>

            <PhotographyGallery images={galleryImages} />
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
                step meets my high standards of excellence.
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
              Ready to Create Editorial-Quality Photography?
            </h2>
            <p className='text-xl text-brand-grey mb-8 max-w-3xl mx-auto'>
              Whether you need local business photography, commercial campaigns, or editorial-style imagery, 
              let's create something that tells your story with the same quality featured in major publications.
            </p>
            <Link
              href='/contact'
              className='inline-flex items-center bg-brand-pink text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-brand-pink2 transition-colors'
            >
              Book Your Photoshoot →
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
