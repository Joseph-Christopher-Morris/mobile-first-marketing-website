import { getAllServices } from '@/lib/content';
import { ServicesShowcase } from '@/components/sections/ServicesShowcase';
import { Layout } from '@/components/layout';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Services | Professional Vivid Auto Photography Solutions',
  description:
    'Explore our comprehensive range of professional services including photography, analytics, and strategic ad campaigns.',
};

export default function ServicesPage() {
  const services = getAllServices();

  return (
    <Layout pageTitle='Services'>
      <div className='min-h-screen bg-white'>
        {/* Hero Section */}
        <section className='bg-gradient-to-br from-blue-50 to-indigo-100 py-16 md:py-24'>
          <div className='container mx-auto px-4'>
            <div className='max-w-4xl mx-auto text-center'>
              <h1 className='text-3xl md:text-5xl font-bold text-gray-900 mb-6'>
                Our Professional Services
              </h1>
              <p className='text-lg md:text-xl text-gray-600 mb-8'>
                Comprehensive solutions to help your business grow and succeed
                in today&apos;s competitive market.
              </p>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className='py-16 md:py-24'>
          <div className='container mx-auto px-4'>
            <ServicesShowcase services={services} showAll={true} />
          </div>
        </section>
      </div>
    </Layout>
  );
}
