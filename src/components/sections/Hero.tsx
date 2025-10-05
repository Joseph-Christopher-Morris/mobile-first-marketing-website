import React from 'react';
import Image from 'next/image';
import { HeroSection } from '@/types';
import Button from '@/components/ui/Button';
import { PageTitle } from '@/components/seo';

interface HeroProps {
  config: HeroSection;
}

const Hero: React.FC<HeroProps> = ({ config }) => {
  const { title, subtitle, ctaButtons, backgroundImage } = config;

  // Debug: Log the background image path
  console.log('Hero backgroundImage:', backgroundImage);

  return (
    <section className='relative min-h-screen flex items-center justify-center overflow-hidden'>
      {/* Background - Gradient fallback with optional image */}
      <div className='absolute inset-0 z-0'>
        {/* Gradient background as fallback */}
        <div className='absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800' />

        {/* Background Image (if available) */}
        {backgroundImage && (
          <>
            <Image
              src={backgroundImage}
              alt={`${title} - Mobile-first Vivid Auto Photography services background`}
              fill
              priority
              className='object-cover'
              sizes='100vw'
            />
            {/* Overlay for better text readability */}
            <div className='absolute inset-0 bg-black/40' />
          </>
        )}
      </div>

      {/* Content */}
      <div className='relative z-10 container mx-auto px-4 py-8 text-center'>
        <div className='max-w-4xl mx-auto'>
          {/* Title - Mobile-first typography with proper SEO */}
          <PageTitle className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight'>
            {title.split('\n').map((line, index) => (
              <React.Fragment key={index}>
                {line}
                {index < title.split('\n').length - 1 && <br />}
              </React.Fragment>
            ))}
          </PageTitle>

          {/* Subtitle - Optimized for mobile reading */}
          <p className='text-lg sm:text-xl md:text-2xl text-gray-200 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed px-2'>
            {subtitle}
          </p>

          {/* CTA Buttons - Mobile-first layout */}
          <div className='flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center'>
            {ctaButtons.map((button, index) => (
              <Button
                key={index}
                href={button.href}
                variant={button.variant}
                size={button.size}
                className='w-full sm:w-auto min-w-[200px] shadow-lg hover:shadow-xl transform hover:scale-105'
              >
                {button.text}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator for mobile */}
      <div className='absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 animate-bounce'>
        <div className='w-6 h-10 border-2 border-white rounded-full flex justify-center'>
          <div className='w-1 h-3 bg-white rounded-full mt-2 animate-pulse' />
        </div>
      </div>
    </section>
  );
};

export default Hero;
