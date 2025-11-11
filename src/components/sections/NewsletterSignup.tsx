'use client';

import React, { useState } from 'react';

export function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit to Formspree
      const response = await fetch('https://formspree.io/f/xvgvkbjb', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          _subject: 'New Newsletter Subscription',
          message: 'Newsletter subscription request',
          type: 'newsletter',
        }),
      });

      if (response.ok) {
        setIsSubmitted(true);
        setEmail('');

        // Reset after 5 seconds
        setTimeout(() => {
          setIsSubmitted(false);
        }, 5000);
      } else {
        throw new Error('Newsletter subscription failed');
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      alert('There was an error subscribing to the newsletter. Please try again or contact us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className='py-20 bg-brand-black text-white'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
        <h2 className='text-3xl md:text-4xl font-bold mb-4'>
          Stay Updated with My Latest Insights
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
          <form onSubmit={handleSubmit} className='max-w-md mx-auto' method="POST" action="https://formspree.io/f/xvgvkbjb">
            <div className='flex flex-col sm:flex-row gap-4'>
              <label htmlFor='newsletter-email' className='sr-only'>
                Email address for newsletter subscription
              </label>
              <input
                type='email'
                id='newsletter-email'
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder='Enter your email address'
                className='flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-pink'
                required
                aria-label='Email address for newsletter subscription'
              />
              <button
                type='submit'
                disabled={isSubmitting}
                className='bg-brand-pink text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-pink2 transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]'
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className='animate-spin -ml-1 mr-2 h-4 w-4 text-white'
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'
                    >
                      <circle
                        className='opacity-25'
                        cx='12'
                        cy='12'
                        r='10'
                        stroke='currentColor'
                        strokeWidth='4'
                      ></circle>
                      <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                      ></path>
                    </svg>
                    Subscribing...
                  </>
                ) : (
                  'Subscribe'
                )}
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
