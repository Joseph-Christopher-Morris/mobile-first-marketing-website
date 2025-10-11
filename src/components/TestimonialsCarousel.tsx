'use client';

import React, { useState, useEffect, useCallback } from 'react';
import '../styles/testimonials.css';

interface TestimonialData {
  id: string;
  content: string;
  author: string;
  position: string;
  company: string;
  rating: number;
}

const testimonials: TestimonialData[] = [
  {
    id: 'scott',
    content: "Joe was very flexible at the JSCC Scholarships, doing various shots of the teams working on the Citroen Saxos on the paddock, drivers posing with their cars and exciting pictures of the Saxos on track.",
    author: "Scott Beercroft",
    position: "JSCC Day Manager and Social Media Manager",
    company: "JSCC",
    rating: 5
  },
  {
    id: 'lee',
    content: "A huge thank you! Joe Morris is a fantastic photographer from Cheshire who has been providing us with amazing images of our cars for over 18 months at LSH Auto UK!",
    author: "Lee Murfitt",
    position: "Lead Strategist for Digital Growth & SEO",
    company: "SciMed",
    rating: 5
  }
];

interface TestimonialsCarouselProps {
  title?: string;
  subtitle?: string;
  autoRotate?: boolean;
  rotationInterval?: number;
}

const TestimonialsCarousel: React.FC<TestimonialsCarouselProps> = ({
  title = 'What Our Clients Say',
  subtitle = 'Trusted by businesses across Cheshire',
  autoRotate = true,
  rotationInterval = 6000,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoRotate);

  const nextTestimonial = useCallback(() => {
    setCurrentIndex(prevIndex =>
      prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
    );
  }, []);

  const prevTestimonial = useCallback(() => {
    setCurrentIndex(prevIndex =>
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  }, []);

  const goToTestimonial = (index: number) => {
    setCurrentIndex(index);
  };

  // Auto-rotation effect
  useEffect(() => {
    if (!isAutoPlaying || testimonials.length <= 1) return;

    const interval = setInterval(nextTestimonial, rotationInterval);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextTestimonial, rotationInterval]);

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

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section className="testimonials-carousel-section">
      <div className="testimonials-carousel-container">
        {/* Section Header */}
        <div className="testimonials-carousel-header">
          <h2 className="testimonials-carousel-title">
            {title}
          </h2>
          <p className="testimonials-carousel-subtitle">
            {subtitle}
          </p>
        </div>

        {/* Carousel Container */}
        <div
          className="testimonials-carousel-wrapper"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Navigation Arrows */}
          <button
            onClick={prevTestimonial}
            className="testimonials-carousel-nav testimonials-carousel-nav-prev"
            aria-label="Previous testimonial"
          >
            <svg
              className="testimonials-carousel-nav-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {/* Testimonial Card */}
          <div className="testimonials-carousel-card">
            {/* Rating Stars */}
            <div className="testimonials-carousel-stars">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`testimonials-carousel-star ${i < currentTestimonial.rating ? 'active' : ''
                    }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>

            {/* Testimonial Content */}
            <blockquote className="testimonials-carousel-quote">
              "{currentTestimonial.content}"
            </blockquote>

            {/* Author Info */}
            <div className="testimonials-carousel-author">
              <h4 className="testimonials-carousel-author-name">
                {currentTestimonial.author}
              </h4>
              <p className="testimonials-carousel-author-position">
                {currentTestimonial.position}
              </p>
              <p className="testimonials-carousel-author-company">
                {currentTestimonial.company}
              </p>
            </div>
          </div>

          <button
            onClick={nextTestimonial}
            className="testimonials-carousel-nav testimonials-carousel-nav-next"
            aria-label="Next testimonial"
          >
            <svg
              className="testimonials-carousel-nav-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

        {/* Dots Indicator */}
        <div className="testimonials-carousel-dots">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => goToTestimonial(index)}
              className={`testimonials-carousel-dot ${index === currentIndex ? 'active' : ''
                }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>

        {/* CTA Section */}
        <div className="testimonials-carousel-cta">
          <p className="testimonials-carousel-cta-text">
            Ready to work with us?
          </p>
          <button className="testimonials-cta-button">
            Get In Touch
          </button>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsCarousel;