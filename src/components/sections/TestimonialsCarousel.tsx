'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Testimonial } from '@/types';
import OptimizedImage from '@/components/ui/OptimizedImage';

interface TestimonialsCarouselProps {
  testimonials: Testimonial[];
  title?: string;
  subtitle?: string;
  autoRotate?: boolean;
  rotationInterval?: number;
}

const TestimonialsCarousel: React.FC<TestimonialsCarouselProps> = ({
  testimonials,
  title = 'What Our Clients Say',
  subtitle = 'Trusted by businesses worldwide',
  autoRotate = true,
  rotationInterval = 5000,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoRotate);

  const nextTestimonial = useCallback(() => {
    setCurrentIndex(prevIndex =>
      prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
    );
  }, [testimonials.length]);

  const prevTestimonial = useCallback(() => {
    setCurrentIndex(prevIndex =>
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  }, [testimonials.length]);

  const goToTestimonial = (index: number) => {
    setCurrentIndex(index);
  };

  // Auto-rotation effect
  useEffect(() => {
    if (!isAutoPlaying || testimonials.length <= 1) return;

    const interval = setInterval(nextTestimonial, rotationInterval);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextTestimonial, rotationInterval, testimonials.length]);

  // Pause auto-rotation on hover/focus
  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(autoRotate);

  // Touch/swipe handling
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextTestimonial();
    } else if (isRightSwipe) {
      prevTestimonial();
    }
  };

  if (testimonials.length === 0) {
    return null;
  }

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section className='py-16 sm:py-20 bg-white'>
      <div className='container mx-auto px-4'>
        {/* Section Header */}
        <div className='text-center mb-12 sm:mb-16'>
          <h2 className='text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4'>
            {title}
          </h2>
          <p className='text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto'>
            {subtitle}
          </p>
        </div>

        {/* Carousel Container */}
        <div
          className='relative max-w-4xl mx-auto'
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Testimonial Card */}
          <div className='bg-gray-50 rounded-2xl p-8 sm:p-12 text-center relative overflow-hidden'>
            {/* Quote Icon */}
            <div className='absolute top-6 left-6 text-4xl text-blue-200 opacity-50'>
              "
            </div>

            {/* Rating Stars */}
            <div className='flex justify-center mb-6'>
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-5 h-5 ${
                    i < currentTestimonial.rating
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                  }`}
                  fill='currentColor'
                  viewBox='0 0 20 20'
                >
                  <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                </svg>
              ))}
            </div>

            {/* Testimonial Content */}
            <blockquote className='text-lg sm:text-xl md:text-2xl text-gray-700 mb-8 leading-relaxed italic'>
              "{currentTestimonial.content}"
            </blockquote>

            {/* Author Info */}
            <div className='flex flex-col sm:flex-row items-center justify-center gap-4'>
              {/* Avatar */}
              <div className='relative w-16 h-16 rounded-full overflow-hidden bg-gray-300 flex-shrink-0'>
                {currentTestimonial.avatar ? (
                  <OptimizedImage
                    src={currentTestimonial.avatar}
                    alt={currentTestimonial.author}
                    width={64}
                    height={64}
                    className='object-cover'
                  />
                ) : (
                  <div className='w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xl font-bold'>
                    {currentTestimonial.author.charAt(0)}
                  </div>
                )}
              </div>

              {/* Author Details */}
              <div className='text-center sm:text-left'>
                <div className='font-semibold text-gray-900 text-lg'>
                  {currentTestimonial.author}
                </div>
                <div className='text-gray-600'>
                  {currentTestimonial.position}
                  {currentTestimonial.company && (
                    <span className='text-gray-500'>
                      {' '}
                      at {currentTestimonial.company}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          {testimonials.length > 1 && (
            <>
              <button
                onClick={prevTestimonial}
                className='absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 sm:-translate-x-12 w-12 h-12 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center text-gray-600 hover:text-blue-600 touch-target'
                aria-label='Previous testimonial'
              >
                <svg
                  className='w-6 h-6'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M15 19l-7-7 7-7'
                  />
                </svg>
              </button>

              <button
                onClick={nextTestimonial}
                className='absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 sm:translate-x-12 w-12 h-12 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center text-gray-600 hover:text-blue-600 touch-target'
                aria-label='Next testimonial'
              >
                <svg
                  className='w-6 h-6'
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
              </button>
            </>
          )}
        </div>

        {/* Dots Indicator */}
        {testimonials.length > 1 && (
          <div className='flex justify-center mt-8 gap-2'>
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToTestimonial(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 touch-target ${
                  index === currentIndex
                    ? 'bg-blue-600 scale-125'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default TestimonialsCarousel;
