'use client';

import React, { useState } from 'react';

export function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter signup logic here
    setIsSubmitted(true);
    setEmail('');

    // Reset after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
    }, 3000);
  };

  return (
    <section className='py-20 bg-brand-black text-white'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
        <h2 className='text-3xl md:text-4xl font-bold mb-4'>
          Stay Updated with Our Latest Insights
        </h2>
        <p className='text-xl text-brand-grey mb-8 max-w-3xl mx-auto'>
          Get exclusive tips, case studies, and industry insights delivered
          directly to your inbox.
        </p>

        {isSubmitted ? (
          <div className='bg-brand-pink text-white px-6 py-3 rounded-lg inline-block'>
            <svg
              className='w-5 h-5 inline mr-2'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M5 13l4 4L19 7'
              />
            </svg>
            Thank you for subscribing!
          </div>
        ) : (
          <form onSubmit={handleSubmit} className='max-w-md mx-auto'>
            <div className='flex flex-col sm:flex-row gap-4'>
              <input
                type='email'
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder='Enter your email address'
                className='flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-pink'
                required
              />
              <button
                type='submit'
                className='bg-brand-pink text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-pink2 transition-colors whitespace-nowrap'
              >
                Subscribe
              </button>
            </div>
            <p className='text-sm text-brand-grey mt-4'>
              No spam, unsubscribe at any time.
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
