// Individual Testimonial Components Usage Examples

import React from 'react';
import Testimonials from './Testimonials'; // Both testimonials together
import LeeTestimonial from './LeeTestimonial'; // Lee's testimonial only
import ScottTestimonial from './ScottTestimonial'; // Scott's testimonial only

// Example 1: Use both testimonials together (full section)
const HomePage: React.FC = () => {
  return (
    <div>
      <section>
        <h1>Welcome to Joe Morris Photography</h1>
        <p>Professional photography services across Cheshire</p>
      </section>

      {/* Full testimonials section with both Lee and Scott */}
      <Testimonials />

      <section>
        <h2>Get In Touch</h2>
      </section>
    </div>
  );
};

// Example 2: Use only Lee's testimonial
const ServicesPage: React.FC = () => {
  return (
    <div>
      <section>
        <h1>Our Services</h1>
        <p>Professional photography services</p>
      </section>

      {/* Just Lee's testimonial */}
      <section style={{ padding: '64px 0', backgroundColor: '#f9fafb' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 16px' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '32px' }}>Client Success Story</h2>
          <LeeTestimonial />
        </div>
      </section>
    </div>
  );
};

// Example 3: Use only Scott's testimonial
const AboutPage: React.FC = () => {
  return (
    <div>
      <section>
        <h1>About Joe Morris</h1>
        <p>Your about content here...</p>
      </section>

      {/* Just Scott's testimonial */}
      <section style={{ padding: '64px 0', backgroundColor: '#f9fafb' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 16px' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '32px' }}>What Clients Say</h2>
          <ScottTestimonial />
        </div>
      </section>
    </div>
  );
};

// Example 4: Use testimonials in a custom layout
const CustomTestimonialsSection: React.FC = () => {
  return (
    <section style={{ padding: '64px 0' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '48px' }}>
          Client Testimonials
        </h2>
        
        {/* Custom grid with individual testimonials */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr', 
          gap: '32px',
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          <LeeTestimonial />
          <ScottTestimonial />
        </div>
        
        {/* Custom CTA */}
        <div style={{ textAlign: 'center', marginTop: '48px' }}>
          <button className="testimonials-cta-button">
            Work With Us
          </button>
        </div>
      </div>
    </section>
  );
};

// Example 5: Use testimonials in sidebar or smaller spaces
const TestimonialSidebar: React.FC = () => {
  return (
    <aside style={{ padding: '24px', backgroundColor: '#f9fafb' }}>
      <h3 style={{ marginBottom: '24px', textAlign: 'center' }}>
        Client Feedback
      </h3>
      
      {/* Stack testimonials vertically for sidebar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ transform: 'scale(0.9)' }}>
          <LeeTestimonial />
        </div>
        <div style={{ transform: 'scale(0.9)' }}>
          <ScottTestimonial />
        </div>
      </div>
    </aside>
  );
};

export { 
  HomePage, 
  ServicesPage, 
  AboutPage, 
  CustomTestimonialsSection, 
  TestimonialSidebar 
};