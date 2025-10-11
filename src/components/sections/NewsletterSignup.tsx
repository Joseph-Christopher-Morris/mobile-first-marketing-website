'use client';

import { useEffect, useState } from 'react';

export function NewsletterSignup() {
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('subscribed') === 'true') {
        setIsSubscribed(true);
        // Clear the URL parameter
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      }
    }
  }, []);

  if (isSubscribed) {
    return (
      <section className='bg-gradient-to-r from-green-500 to-green-600 py-12 md:py-16'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
          <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <svg
              className='w-8 h-8 text-green-600'
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
          </div>
          <h2 className='text-2xl md:text-3xl font-bold text-white mb-4'>
            Thank You for Subscribing!
          </h2>
          <p className='text-green-100 mb-8 max-w-2xl mx-auto'>
            You've successfully subscribed to our newsletter. You'll receive the
            latest photography tips, industry insights, and success stories in
            your inbox.
          </p>
          <button
            onClick={() => setIsSubscribed(false)}
            className='bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors focus:outline-none focus:ring-4 focus:ring-white focus:ring-offset-2 focus:ring-offset-green-600'
          >
            Subscribe Another Email
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className='bg-gradient-to-r from-pink-500 to-pink-600 py-12 md:py-16'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
        <h2 className='text-2xl md:text-3xl font-bold text-white mb-4'>
          Stay Updated with Our Latest Insights
        </h2>
        <p className='text-pink-100 mb-8 max-w-2xl mx-auto'>
          Subscribe to our newsletter and get the latest photography tips,
          industry insights, and success stories delivered to your inbox.
        </p>
        <form
          action='https://formspree.io/f/xovkngyr'
          method='POST'
          className='max-w-md mx-auto flex flex-col sm:flex-row gap-4'
        >
          <input
            type='hidden'
            name='_subject'
            value='Newsletter Subscription'
          />
          <input
            type='hidden'
            name='_next'
            value='https://d15sc9fc739ev2.cloudfront.net/blog?subscribed=true'
          />
          <input type='hidden' name='type' value='newsletter' />

          <label htmlFor='newsletter-email' className='sr-only'>
            Email address for newsletter subscription
          </label>
          <input
            id='newsletter-email'
            name='email'
            type='email'
            placeholder='Enter your email'
            className='flex-1 px-4 py-3 rounded-lg border border-pink-300 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent text-gray-900 placeholder-gray-500'
            aria-label='Enter your email address'
            required
          />
          <button
            type='submit'
            className='bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors focus:outline-none focus:ring-4 focus:ring-white focus:ring-offset-2 focus:ring-offset-pink-600 border-2 border-gray-900 shadow-lg'
            aria-label='Subscribe to newsletter'
          >
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}
