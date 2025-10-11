import React from 'react';
import '../styles/testimonials.css';
import LeeTestimonial from './LeeTestimonial';
import ScottTestimonial from './ScottTestimonial';

const Testimonials: React.FC = () => {
  return (
    <section
      className='testimonials-section'
      style={{ padding: '64px 0', backgroundColor: '#f9fafb' }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
        {/* Section Header */}
        <div className='testimonials-header'>
          <h2 className='testimonials-title'>What Our Clients Say</h2>
          <p className='testimonials-subtitle'>
            Trusted by businesses across Cheshire
          </p>
        </div>

        {/* Testimonials Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
            maxWidth: '1200px',
            margin: '0 auto',
          }}
        >
          <ScottTestimonial />
          <LeeTestimonial />
        </div>

        {/* CTA Section */}
        <div style={{ textAlign: 'center', marginTop: '48px' }}>
          <p
            style={{ color: '#6B7280', marginBottom: '24px', fontSize: '16px' }}
          >
            Ready to work with us?
          </p>
          <button className='testimonials-cta-button'>Get In Touch</button>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
