import { Service } from '@/lib/content';
import OptimizedImage from '@/components/ui/OptimizedImage';
import Link from 'next/link';

interface ServiceNavigationProps {
  currentService: Service;
  otherServices: Service[];
}

export function ServiceNavigation({ otherServices }: ServiceNavigationProps) {
  if (otherServices.length === 0) {
    return null;
  }

  return (
    <section className='py-16 md:py-24 bg-gray-50'>
      <div className='container mx-auto px-4'>
        <div className='max-w-6xl mx-auto'>
          <div className='text-center mb-12'>
            <h2 className='text-2xl md:text-3xl font-bold text-gray-900 mb-4'>
              Explore Our Other Services
            </h2>
            <p className='text-lg text-gray-600'>
              Discover how our comprehensive solutions can help your business
              grow
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
            {otherServices.map(service => (
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                className='group bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200'
              >
                {/* Service Image */}
                <div className='relative h-48 overflow-hidden'>
                  <OptimizedImage
                    src={service.featuredImage}
                    alt={`${service.title} service overview`}
                    width={400}
                    height={200}
                    className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
                    loading='eager'
                    priority={true}
                    sizes='(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw'
                  />
                  <div className='absolute inset-0 bg-gradient-to-t from-black/20 to-transparent' />
                </div>

                {/* Service Content */}
                <div className='p-6'>
                  <h3 className='text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors'>
                    {service.title}
                  </h3>

                  <p className='text-gray-600 mb-4 line-clamp-2'>
                    {service.shortDescription}
                  </p>

                  {/* Features Preview */}
                  {service.features.length > 0 && (
                    <div className='mb-4'>
                      <div className='flex flex-wrap gap-2'>
                        {service.features.slice(0, 2).map((feature, index) => (
                          <span
                            key={index}
                            className='inline-block px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full'
                          >
                            {feature}
                          </span>
                        ))}
                        {service.features.length > 2 && (
                          <span className='inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full'>
                            +{service.features.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* CTA */}
                  <div className='flex items-center justify-between'>
                    <span className='text-blue-600 font-semibold group-hover:text-blue-700 transition-colors'>
                      Learn More
                    </span>
                    <svg
                      className='w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M17 8l4 4m0 0l-4 4m4-4H3'
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* View All Services CTA */}
          <div className='text-center mt-12'>
            <Link
              href='/services'
              className='inline-flex items-center justify-center px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            >
              View All Services
              <svg
                className='w-5 h-5 ml-2'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M17 8l4 4m0 0l-4 4m4-4H3'
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
