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
    <section className='bg-gray-50 py-16 md:py-20'>
      <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='text-center mb-10'>
          <h2 className='text-3xl md:text-4xl font-bold text-slate-900 mb-4'>
            My Services
          </h2>
          <p className='text-base md:text-lg text-slate-700 max-w-3xl mx-auto'>
            Vivid Media Cheshire helps local businesses grow with fast, secure websites, smart advertising, and visuals that tell your story. Each project combines enterprise-level hosting, data-driven design, and photography that delivers real results.
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:justify-items-center'>
          {services.map((service, index) => (
            <div
              key={service.id}
              className={`w-full max-w-sm ${index >= 3 ? 'lg:col-span-1 lg:justify-self-center' : ''}`}
            >
              <Link
                href={service.href}
                className='group block bg-white rounded-2xl shadow-lg p-6 md:p-8 flex flex-col hover:shadow-xl transition-shadow'
              >
                <div className='relative w-full aspect-[4/3] mb-4 rounded-xl overflow-hidden'>
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    className='object-cover group-hover:scale-105 transition-transform duration-300'
                    sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                  />
                </div>
                <h3 className='text-xl font-semibold text-slate-900 mb-3'>{service.title}</h3>
                <p className='text-sm md:text-base text-slate-700 mb-4'>{service.description}</p>
                <div className='inline-flex items-center gap-2 text-brand-pink font-semibold text-sm md:text-base hover:text-brand-pink2 mt-auto'>
                  Learn more →
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
