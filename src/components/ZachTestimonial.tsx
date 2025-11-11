import React from 'react';
import { StarRating } from './StarRating';
import '../styles/testimonials.css';

const ZachTestimonial: React.FC = () => {
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
        {/* Star Rating */}
        <div className='mb-4'>
          <StarRating rating={5} size="md" showLabel={false} />
        </div>
        
        <blockquote className='testimonial-text'>
          &quot;Joe has been very loyal to Hampson Auctions over the last four years, covering photography consignments across Cheshire and capturing striking images from our sales for promotional use on our email campaigns and social media channels.!&quot;
        </blockquote>

        {/* Author Info */}
        <div className='testimonial-author'>
          <h4 className='testimonial-author-name'>Zach Hamilton</h4>
          <p className='testimonial-author-position'>
            Managing Director
          </p>
          <p className='testimonial-author-company'>Hampson Auctions</p>
        </div>
      </div>
    </div>
  );
};

export default ZachTestimonial;
