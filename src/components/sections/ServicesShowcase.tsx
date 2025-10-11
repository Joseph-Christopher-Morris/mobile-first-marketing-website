import React from 'react';
import { Service } from '@/lib/content';
import OptimizedImage from '@/components/ui/OptimizedImage';
import Button from '@/components/ui/Button';
import { SectionHeading, SubsectionHeading } from '@/components/seo';

interface ServicesShowcaseProps {
  services: Service[];
  title?: string;
  subtitle?: string;
  showAll?: boolean;
}

const ServicesShowcase: React.FC<ServicesShowcaseProps> = ({
  services,
  title = 'Our Services',
  subtitle = 'Comprehensive solutions to grow your business',
  showAll = false,
}) => {
  return (
    <section className='py-16 sm:py-20 bg-gray-50'>
      <div className='container mx-auto px-4'>
        {/* Section Header */}
        <div className='text-center mb-12 sm:mb-16'>
          <SectionHeading className='text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4'>
            {title}
          </SectionHeading>
          <p className='text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto'>
            {subtitle}
          </p>
        </div>

        {/* Services Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8'>
          {services.map(service => (
            <ServiceCard key={service.slug} service={service} />
          ))}
        </div>

        {/* View All Services CTA */}
        {!showAll && services.length > 0 && (
          <div className='text-center mt-12'>
            <Button href='/services' variant='outline' size='lg'>
              View All Services
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

interface ServiceCardProps {
  service: Service;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  const iconMap: Record<string, string> = {
    camera: '📷',
    'chart-bar': '📊',
    megaphone: '📢',
  };

  return (
    <div className='bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group'>
      {/* Service Image */}
      <div className='relative h-48 sm:h-56 overflow-hidden rounded-t-xl bg-gradient-to-br from-blue-500 to-purple-600'>
        {service.featuredImage && (
          <OptimizedImage
            src={service.featuredImage}
            alt={`${service.title} - Professional Vivid Auto Photography service`}
            title={`${service.title} service image`}
            width={400}
            height={200}
            className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-300'
          />
        )}
        {/* Icon Overlay */}
        <div className='absolute top-4 left-4 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-2xl'>
          {iconMap[service.icon] || '🔧'}
        </div>
        {/* Fallback content when no image */}
        {!service.featuredImage && (
          <div className='absolute inset-0 flex items-center justify-center'>
            <div className='text-6xl opacity-20'>
              {iconMap[service.icon] || '🔧'}
            </div>
          </div>
        )}
      </div>

      {/* Service Content */}
      <div className='p-6'>
        <SubsectionHeading className='text-xl sm:text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors'>
          {service.title}
        </SubsectionHeading>

        <p className='text-gray-600 mb-4 line-clamp-3'>
          {service.shortDescription}
        </p>

        {/* Features List */}
        <div className='mb-6'>
          <h4 className='text-sm font-semibold text-gray-900 mb-2'>
            Key Features:
          </h4>
          <ul className='space-y-1'>
            {service.features.slice(0, 3).map((feature, index) => (
              <li
                key={index}
                className='text-sm text-gray-600 flex items-center'
              >
                <span className='w-1.5 h-1.5 bg-blue-600 rounded-full mr-2 flex-shrink-0' />
                {feature}
              </li>
            ))}
            {service.features.length > 3 && (
              <li className='text-sm text-gray-500 italic'>
                +{service.features.length - 3} more features
              </li>
            )}
          </ul>
        </div>

        {/* CTA Buttons */}
        <div className='flex flex-col sm:flex-row gap-3'>
          <Button
            href={`/services/${service.slug}`}
            variant='primary'
            size='md'
            className='flex-1 text-center'
          >
            Learn More
          </Button>
          <Button
            href='/contact'
            variant='outline'
            size='md'
            className='flex-1 text-center'
          >
            Get Quote
          </Button>
        </div>
      </div>
    </div>
  );
};

export { ServicesShowcase };
