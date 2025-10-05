import { Service } from '@/lib/content';
import OptimizedImage from '@/components/ui/OptimizedImage';
import Button from '@/components/ui/Button';

interface ServiceHeroProps {
  service: Service;
}

export function ServiceHero({ service }: ServiceHeroProps) {
  return (
    <section className='relative bg-gradient-to-br from-blue-50 to-indigo-100 py-16 md:py-24 overflow-hidden'>
      {/* Background Image */}
      <div className='absolute inset-0 z-0'>
        <OptimizedImage
          src={service.featuredImage}
          alt={service.title}
          width={1920}
          height={1080}
          className='w-full h-full object-cover opacity-20'
          priority
        />
        <div className='absolute inset-0 bg-gradient-to-br from-blue-900/20 to-indigo-900/20' />
      </div>

      <div className='container mx-auto px-4 relative z-10'>
        <div className='max-w-4xl mx-auto'>
          {/* Breadcrumb */}
          <nav className='mb-6 text-sm'>
            <ol className='flex items-center space-x-2 text-gray-600'>
              <li>
                <a href='/' className='hover:text-blue-600 transition-colors'>
                  Home
                </a>
              </li>
              <li className='text-gray-400'>/</li>
              <li>
                <a
                  href='/services'
                  className='hover:text-blue-600 transition-colors'
                >
                  Services
                </a>
              </li>
              <li className='text-gray-400'>/</li>
              <li className='text-gray-900 font-medium'>{service.title}</li>
            </ol>
          </nav>

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center'>
            {/* Content */}
            <div className='text-center lg:text-left'>
              <h1 className='text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6'>
                {service.title}
              </h1>

              <p className='text-lg md:text-xl text-gray-600 mb-8 leading-relaxed'>
                {service.shortDescription}
              </p>

              {/* CTA Buttons */}
              <div className='flex flex-col sm:flex-row gap-4 justify-center lg:justify-start'>
                <Button
                  href={`/contact?service=${service.slug}`}
                  variant='primary'
                  size='lg'
                  className='w-full sm:w-auto'
                >
                  Get Started
                </Button>
                <Button
                  href='#features'
                  variant='outline'
                  size='lg'
                  className='w-full sm:w-auto'
                >
                  Learn More
                </Button>
              </div>
            </div>

            {/* Featured Image */}
            <div className='order-first lg:order-last'>
              <div className='relative'>
                <OptimizedImage
                  src={service.featuredImage}
                  alt={service.title}
                  width={600}
                  height={400}
                  className='w-full h-64 md:h-80 lg:h-96 object-cover rounded-lg shadow-xl'
                />

                {/* Overlay Badge */}
                <div className='absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium'>
                  Professional Service
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
