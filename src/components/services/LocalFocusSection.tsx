import React from 'react';
import Image from 'next/image';

interface LocalStats {
  projectsCompleted: number;
  yearsInArea: number;
  localBusinesses: number;
}

interface LocalFocusSectionProps {
  localStats: LocalStats;
}

const LocalFocusSection: React.FC<LocalFocusSectionProps> = ({ localStats }) => {
  return (
    <section className='py-20 bg-gradient-to-br from-gray-50 to-white'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
          {/* Content Side */}
          <div>
            <div className='mb-6'>
              <span className='inline-block bg-brand-pink/10 text-brand-pink px-4 py-2 rounded-full text-sm font-semibold mb-4'>
                Local Expertise
              </span>
              <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-6'>
                Deeply Connected to{' '}
                <span className='text-brand-pink'>Nantwich & Cheshire</span>
              </h2>
              <p className='text-xl text-gray-600 mb-8 leading-relaxed'>
                As a local photographer with deep roots in the Nantwich and Cheshire community,
                I understand the unique character and charm of our area. From the historic market
                town atmosphere to the vibrant local business scene, I capture the authentic
                essence that makes our community special.
              </p>
            </div>

            {/* Local Statistics */}
            <div className='grid grid-cols-3 gap-6 mb-8'>
              <div className='text-center p-4 bg-white rounded-lg shadow-sm border border-gray-100'>
                <div className='text-2xl md:text-3xl font-bold text-brand-pink mb-1'>
                  {localStats.projectsCompleted}+
                </div>
                <div className='text-sm text-gray-600 font-medium'>
                  Local Projects
                </div>
              </div>
              <div className='text-center p-4 bg-white rounded-lg shadow-sm border border-gray-100'>
                <div className='text-2xl md:text-3xl font-bold text-brand-pink mb-1'>
                  {localStats.yearsInArea}+
                </div>
                <div className='text-sm text-gray-600 font-medium'>
                  Years in Area
                </div>
              </div>
              <div className='text-center p-4 bg-white rounded-lg shadow-sm border border-gray-100'>
                <div className='text-2xl md:text-3xl font-bold text-brand-pink mb-1'>
                  {localStats.localBusinesses}+
                </div>
                <div className='text-sm text-gray-600 font-medium'>
                  Local Businesses
                </div>
              </div>
            </div>

            {/* Local Knowledge Points */}
            <div className='space-y-4'>
              <div className='flex items-start space-x-3'>
                <div className='flex-shrink-0 w-6 h-6 bg-brand-pink rounded-full flex items-center justify-center mt-1'>
                  <svg className='w-3 h-3 text-white' fill='currentColor' viewBox='0 0 20 20'>
                    <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
                  </svg>
                </div>
                <p className='text-gray-700'>
                  <strong>Market Town Heritage:</strong> Understanding Nantwich's historic character and architectural beauty
                </p>
              </div>
              <div className='flex items-start space-x-3'>
                <div className='flex-shrink-0 w-6 h-6 bg-brand-pink rounded-full flex items-center justify-center mt-1'>
                  <svg className='w-3 h-3 text-white' fill='currentColor' viewBox='0 0 20 20'>
                    <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
                  </svg>
                </div>
                <p className='text-gray-700'>
                  <strong>Business Community:</strong> Established relationships with local business owners and venues
                </p>
              </div>
              <div className='flex items-start space-x-3'>
                <div className='flex-shrink-0 w-6 h-6 bg-brand-pink rounded-full flex items-center justify-center mt-1'>
                  <svg className='w-3 h-3 text-white' fill='currentColor' viewBox='0 0 20 20'>
                    <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
                  </svg>
                </div>
                <p className='text-gray-700'>
                  <strong>Seasonal Events:</strong> Expertise in capturing Nantwich Show, Food Festival, and local celebrations
                </p>
              </div>
            </div>
          </div>

          {/* Visual Side - Location Indicator */}
          <div className='relative'>
            <div className='relative h-96 lg:h-[500px] rounded-lg overflow-hidden shadow-xl'>
              <Image
                src='/images/services/photography/240427-_Nantwich_Stock_Photography-19.webp'
                alt='Nantwich market square showing local community and business activity'
                fill
                className='object-cover'
                sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
              />
              {/* Location Badge Overlay */}
              <div className='absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-lg'>
                <div className='flex items-center space-x-3'>
                  <div className='w-10 h-10 bg-brand-pink rounded-full flex items-center justify-center'>
                    <svg className='w-5 h-5 text-white' fill='currentColor' viewBox='0 0 20 20'>
                      <path fillRule='evenodd' d='M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z' clipRule='evenodd' />
                    </svg>
                  </div>
                  <div>
                    <div className='font-semibold text-gray-900'>Nantwich, Cheshire</div>
                    <div className='text-sm text-gray-600'>Local Photography Hub</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className='absolute -bottom-6 -right-6 w-24 h-24 bg-brand-pink/10 rounded-full blur-xl'></div>
            <div className='absolute -top-6 -left-6 w-32 h-32 bg-brand-pink/5 rounded-full blur-xl'></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocalFocusSection;
