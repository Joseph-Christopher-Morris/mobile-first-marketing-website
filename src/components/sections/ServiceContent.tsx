import { Service } from '@/lib/content';
import OptimizedImage from '@/components/ui/OptimizedImage';

interface ServiceContentProps {
  service: Service;
  contentHtml: string;
}

// Portfolio images for each service - Updated per requirements
function getPortfolioImages(
  serviceSlug: string
): Array<{ src: string; alt: string }> {
  const portfolioImages: Record<string, Array<{ src: string; alt: string }>> = {
    photography: [
      {
        src: '240217-australia-trip-232.webp',
        alt: 'Sydney harbour editorial — automotive travel photography',
      },
      {
        src: '240219-australia-trip-148.webp',
        alt: 'Australia automotive travel photography — scenic landscape',
      },
      {
        src: '240619-london-19.webp',
        alt: 'Central London street photography — automotive',
      },
      {
        src: '240619-london-26.webp',
        alt: 'London urban automotive photography — city streets',
      },
      {
        src: '240619-london-64.webp',
        alt: 'London automotive photography — urban environment',
      },
      {
        src: '250125-liverpool-40.webp',
        alt: 'Liverpool automotive photography — urban environment',
      },
    ],
    analytics: [
      {
        src: 'screenshot-2025-08-12-analytics-report.webp',
        alt: 'Analytics dashboard metrics — performance tracking',
      },
      {
        src: '../hero/stock-photography-samira.webp',
        alt: 'Stock photography analytics — SAMIRA performance data',
      },
      {
        src: 'output-5-analytics-chart.webp',
        alt: 'Analytics data visualization — custom reporting dashboard',
      },
    ],
    'ad-campaigns': [
      {
        src: 'accessible-top8-campaigns-source.webp',
        alt: 'Top 8 advertising campaigns — performance analysis',
      },
      {
        src: 'top-3-mediums-by-conversion-rate.webp',
        alt: 'Top 3 mediums by conversion rate — bar chart analysis',
      },
      {
        src: 'screenshot-2025-08-12-analytics-report.webp',
        alt: 'Analytics report screenshot — campaign performance data',
      },
    ],
  };

  return portfolioImages[serviceSlug] || [];
}

export function ServiceContent({ service, contentHtml }: ServiceContentProps) {
  return (
    <div className='py-16 md:py-24'>
      <div className='container mx-auto px-4'>
        <div className='max-w-4xl mx-auto'>
          {/* Features Section */}
          {service.features.length > 0 && (
            <section id='features' className='mb-16'>
              <h2 className='text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center'>
                What&apos;s Included
              </h2>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                {service.features.map((feature, index) => {
                  const featureIcons = [
                    'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', // Check circle
                    'M13 10V3L4 14h7v7l9-11h-7z', // Lightning bolt
                    'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4', // Adjustments
                    'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z', // Light bulb
                  ];

                  return (
                    <div
                      key={index}
                      className='flex items-start space-x-4 p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 hover:border-blue-200'
                    >
                      <div className='flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center'>
                        <svg
                          className='w-5 h-5 text-blue-600'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d={featureIcons[index % featureIcons.length]}
                          />
                        </svg>
                      </div>
                      <div className='flex-1'>
                        <h3 className='font-semibold text-gray-900 mb-2 text-lg'>
                          {feature}
                        </h3>
                        <p className='text-gray-600 text-sm'>
                          Professional implementation with attention to detail
                          and quality results.
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Benefits Section */}
          {service.benefits.length > 0 && (
            <section className='mb-16'>
              <h2 className='text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center'>
                Key Benefits
              </h2>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
                {service.benefits.map((benefit, index) => {
                  const benefitIcons = [
                    'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6', // Trending up
                    'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', // Currency circle
                    'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', // Shield check
                    'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', // Clock
                  ];

                  return (
                    <div
                      key={index}
                      className='text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105'
                    >
                      <div className='w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg'>
                        <svg
                          className='w-8 h-8 text-white'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d={benefitIcons[index % benefitIcons.length]}
                          />
                        </svg>
                      </div>
                      <h3 className='font-bold text-gray-900 mb-3 text-lg'>
                        {benefit}
                      </h3>
                      <p className='text-gray-600 text-sm leading-relaxed'>
                        Experience the advantage of professional service
                        delivery with measurable results.
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Main Content */}
          <section className='mb-16'>
            <div
              className='prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-600 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900'
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />
          </section>

          {/* Service Gallery/Portfolio Section */}
          <section className='mb-16'>
            <h2 className='text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center'>
              Our Work in Action
            </h2>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {getPortfolioImages(service.slug).map((imageData, index) => (
                <div
                  key={index}
                  className='relative group overflow-hidden rounded-lg bg-gray-200 aspect-video hover:shadow-lg transition-all duration-300'
                >
                  <OptimizedImage
                    src={`/images/services/${imageData.src}`}
                    alt={imageData.alt}
                    width={400}
                    height={225}
                    className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
                    loading={index < 3 ? 'eager' : 'lazy'}
                    priority={index < 3}
                    sizes='(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw'
                  />
                  <div className='absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300' />
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
