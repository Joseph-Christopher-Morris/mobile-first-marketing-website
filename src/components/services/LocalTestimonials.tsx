"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface LocalTestimonial {
  id: string;
  name: string;
  business: string;
  location: string;
  rating: number;
  review: string;
  businessLogo?: string;
  businessType: string;
  date: string;
}

interface LocalTestimonialsProps {
  testimonials: LocalTestimonial[];
}

const LocalTestimonials: React.FC<LocalTestimonialsProps> = ({ testimonials }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-advance testimonials
  useEffect(() => {
    if (!isAutoPlaying || testimonials.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
      );
    }, 6000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, testimonials.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    // Resume auto-play after 10 seconds
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
    );
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-5 h-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  if (testimonials.length === 0) return null;

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section className='py-20 bg-white'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='text-center mb-16'>
          <span className='inline-block bg-brand-pink/10 text-brand-pink px-4 py-2 rounded-full text-sm font-semibold mb-4'>
            Local Reviews
          </span>
          <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>
            What Nantwich Businesses Say
          </h2>
          <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
            Trusted by local businesses across Nantwich and Cheshire for professional photography services
          </p>
        </div>

        {/* Testimonial Carousel */}
        <div className='relative max-w-4xl mx-auto'>
          <div className='bg-gray-50 rounded-2xl p-8 md:p-12 shadow-lg'>
            {/* Rating Stars */}
            <div className='flex justify-center mb-6'>
              {renderStars(currentTestimonial.rating)}
            </div>

            {/* Review Text */}
            <blockquote className='text-xl md:text-2xl text-gray-900 text-center mb-8 leading-relaxed font-medium'>
              "{currentTestimonial.review}"
            </blockquote>

            {/* Business Info */}
            <div className='flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-6'>
              {/* Business Logo */}
              {currentTestimonial.businessLogo && (
                <div className='w-16 h-16 bg-white rounded-lg shadow-sm flex items-center justify-center p-2'>
                  <Image
                    src={currentTestimonial.businessLogo}
                    alt={`${currentTestimonial.business} logo`}
                    width={48}
                    height={48}
                    className='object-contain'
                  />
                </div>
              )}

              {/* Business Details */}
              <div className='text-center md:text-left'>
                <div className='font-semibold text-gray-900 text-lg'>
                  {currentTestimonial.name}
                </div>
                <div className='text-brand-pink font-medium'>
                  {currentTestimonial.business}
                </div>
                <div className='text-gray-600 text-sm'>
                  {currentTestimonial.businessType} • {currentTestimonial.location}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          {testimonials.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className='absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors'
                aria-label='Previous testimonial'
              >
                <svg className='w-6 h-6 text-gray-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
                </svg>
              </button>
              <button
                onClick={nextSlide}
                className='absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors'
                aria-label='Next testimonial'
              >
                <svg className='w-6 h-6 text-gray-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Dots Indicator */}
        {testimonials.length > 1 && (
          <div className='flex justify-center mt-8 space-x-2'>
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-brand-pink' : 'bg-gray-300'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Schema Markup for Reviews */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": "Vivid Media Cheshire - Photography Services",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Nantwich",
                "addressRegion": "Cheshire",
                "addressCountry": "GB"
              },
              "review": testimonials.map(testimonial => ({
                "@type": "Review",
                "reviewRating": {
                  "@type": "Rating",
                  "ratingValue": testimonial.rating,
                  "bestRating": "5"
                },
                "author": {
                  "@type": "Person",
                  "name": testimonial.name
                },
                "reviewBody": testimonial.review,
                "datePublished": testimonial.date
              })),
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": (testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1),
                "reviewCount": testimonials.length
              }
            })
          }}
        />
      </div>
    </section>
  );
};

export default LocalTestimonials;
