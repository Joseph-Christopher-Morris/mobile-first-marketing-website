'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  company: string;
}

interface TestimonialsCarouselProps {
  className?: string;
}

const testimonials: Testimonial[] = [
  {
    id: 'lee',
    quote:
      'A huge thank you! Joe Morris is a Fantastic photographer from Cheshire who has been providing us with amazing images of our cars for over 18 months at LSH Auto UK!',
    author: 'Lee Murfitt',
    role: 'Lead Strategist for Digital Growth & SEO',
    company: 'SciMed',
  },
  {
    id: 'scott',
    quote:
      'Joe was very flexible at the JSCC Scholarships, doing various shots of the teams working on the Citroen Saxos on the paddock, drivers posing with their cars and exciting pictures of the Saxos on track.',
    author: 'Scott Beercroft',
    role: 'JSCC Day Manager and Social Media Manager',
    company: 'JSCC',
  },
];

export function TestimonialsCarousel({
  className = '',
}: TestimonialsCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Auto-advance functionality
  useEffect(() => {
    if (isPaused || prefersReducedMotion) return;

    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % testimonials.length);
    }, 7000);

    return () => clearInterval(interval);
  }, [isPaused, prefersReducedMotion]);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  const goToPrevious = useCallback(() => {
    setCurrentSlide(
      prev => (prev - 1 + testimonials.length) % testimonials.length
    );
  }, []);

  const goToNext = useCallback(() => {
    setCurrentSlide(prev => (prev + 1) % testimonials.length);
  }, []);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          goToPrevious();
          break;
        case 'ArrowRight':
          event.preventDefault();
          goToNext();
          break;
        case 'Home':
          event.preventDefault();
          goToSlide(0);
          break;
        case 'End':
          event.preventDefault();
          goToSlide(testimonials.length - 1);
          break;
      }
    },
    [goToPrevious, goToNext, goToSlide]
  );

  const handleMouseEnter = () => {
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  const handleFocus = () => {
    setIsPaused(true);
  };

  const handleBlur = () => {
    setIsPaused(false);
  };

  return (
    <section
      className={`py-12 sm:py-16 md:py-20 bg-brand-white ${className}`}
      aria-labelledby='testimonials-heading'
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      <div className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8'>
        <h2
          id='testimonials-heading'
          className='text-2xl sm:text-3xl md:text-4xl font-bold text-brand-black mb-6 sm:mb-8 text-center'
        >
          What Our Clients Say
        </h2>

        <div
          className='relative'
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role='region'
          aria-label='Testimonials carousel'
          aria-live='polite'
        >
          {/* Carousel content */}
          <div className='overflow-hidden'>
            <div
              className='flex transition-transform duration-500 ease-in-out'
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {testimonials.map(testimonial => (
                <div
                  key={testimonial.id}
                  className='w-full flex-shrink-0 px-2 sm:px-4'
                  role='tabpanel'
                  aria-label={`Testimonial from ${testimonial.author}`}
                >
                  <div className='max-w-4xl mx-auto'>
                    <blockquote className='bg-brand-white border border-brand-black/10 rounded-lg p-6 sm:p-8 md:p-12 text-center shadow-mobile-md'>
                      <p className='text-base sm:text-lg md:text-xl text-brand-black mb-4 sm:mb-6 leading-relaxed'>
                        &quot;{testimonial.quote}&quot;
                      </p>
                      <figcaption>
                        <div className='font-semibold text-brand-black text-base sm:text-lg'>
                          {testimonial.author}
                        </div>
                        <div className='text-brand-black/70 text-sm mt-1'>
                          {testimonial.role}
                        </div>
                        <div className='text-brand-pink text-sm font-medium mt-1'>
                          {testimonial.company}
                        </div>
                      </figcaption>
                    </blockquote>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation buttons */}
          <div className='flex justify-center items-center mt-6 sm:mt-8 gap-3 sm:gap-4'>
            <button
              onClick={goToPrevious}
              className='touch-target p-2 rounded-full bg-brand-white border border-brand-black/20 text-brand-black hover:bg-brand-pink hover:text-brand-white hover:border-brand-pink transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-pink focus:ring-offset-2'
              aria-label='Previous testimonial'
              type='button'
            >
              <svg
                className='w-4 h-4 sm:w-5 sm:h-5'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
                aria-hidden='true'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M15 19l-7-7 7-7'
                />
              </svg>
            </button>

            {/* Dot indicators */}
            <div
              className='flex gap-2'
              role='tablist'
              aria-label='Testimonial navigation'
            >
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`touch-target w-3 h-3 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-pink focus:ring-offset-2 ${
                    index === currentSlide
                      ? 'bg-brand-pink'
                      : 'bg-brand-black/30 hover:bg-brand-pink'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                  aria-selected={index === currentSlide}
                  role='tab'
                  type='button'
                />
              ))}
            </div>

            <button
              onClick={goToNext}
              className='touch-target p-2 rounded-full bg-brand-white border border-brand-black/20 text-brand-black hover:bg-brand-pink hover:text-brand-white hover:border-brand-pink transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-pink focus:ring-offset-2'
              aria-label='Next testimonial'
              type='button'
            >
              <svg
                className='w-4 h-4 sm:w-5 sm:h-5'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
                aria-hidden='true'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 5l7 7-7 7'
                />
              </svg>
            </button>
          </div>

          {/* Screen reader announcement for current slide */}
          <div className='sr-only' aria-live='polite' aria-atomic='true'>
            Showing testimonial {currentSlide + 1} of {testimonials.length}
          </div>
        </div>
      </div>
    </section>
  );
}
