import React from 'react';
import '../styles/testimonials.css';

const LeeTestimonial: React.FC = () => {
  return (
    <div className='testimonial-card'>
      {/* Quote Icon */}
      <svg
        className='testimonial-quote-icon'
        fill='currentColor'
        viewBox='0 0 32 32'
        aria-hidden='true'
      >
        <path d='M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z' />
      </svg>

      {/* Testimonial Content */}
      <div className='testimonial-content'>
        <blockquote className='testimonial-text'>
          &quot;A huge thank you! Joe Morris is a Fantastic photographer from
          Cheshire who has been providing us with amazing images of our cars for
          over 18 months at LSH Auto UK!&quot;
        </blockquote>

        {/* Author Info */}
        <div className='testimonial-author'>
          <h4 className='testimonial-author-name'>Lee Murfitt</h4>
          <p className='testimonial-author-position'>
            Lead Strategist for Digital Growth & SEO
          </p>
          <p className='testimonial-author-company'>SciMed</p>
        </div>
      </div>
    </div>
  );
};

export default LeeTestimonial;
