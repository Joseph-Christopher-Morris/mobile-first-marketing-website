'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Service } from '@/lib/content';

interface ServicesShowcaseProps {
  services: Service[];
}

export function ServicesShowcase({ services }: ServicesShowcaseProps) {
  return (
    <section className='py-20 bg-gray-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='text-center mb-16'>
          <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>
            Our Services
          </h2>
          <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
            Comprehensive solutions designed to elevate your business with
            professional photography, data-driven insights, and strategic
            advertising campaigns.
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          {services.map(service => (
            <div
              key={service.id}
              className='group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow'
            >
              <div className='relative h-64'>
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  className='object-cover group-hover:scale-105 transition-transform duration-300'
                  sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                />
                <div className='absolute inset-0 bg-black/60'></div>
                <div className='absolute bottom-4 left-4 text-white'>
                  <h3 className='text-xl font-bold mb-2'>{service.title}</h3>
                </div>
              </div>
              <div className='p-6'>
                <p className='text-gray-600 mb-4'>{service.description}</p>
                <Link
                  href={service.href}
                  className='inline-flex items-center text-brand-pink hover:text-brand-pink2 font-medium'
                  aria-label={`Learn more about ${service.title.toLowerCase()}`}
                >
                  Learn More
                  <svg
                    className='ml-2 w-4 h-4'
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
