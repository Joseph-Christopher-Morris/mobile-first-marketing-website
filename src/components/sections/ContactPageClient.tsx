'use client';

import React from 'react';

interface ContactLinkProps {
  type: 'email' | 'phone';
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function ContactLink({
  type,
  value,
  children,
  className = '',
}: ContactLinkProps) {
  const href = type === 'email' ? `mailto:${value}` : `tel:${value}`;

  return (
    <a
      href={href}
      className={`text-brand-pink hover:text-brand-pink2 transition-colors ${className}`}
    >
      {children}
    </a>
  );
}

export function ContactPageClient() {
  return (
    <div className='bg-gray-50 py-12'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Contact Information */}
          <div className='lg:col-span-1'>
            <div className='bg-white rounded-xl shadow-lg p-8'>
              <h3 className='text-xl font-bold text-gray-900 mb-6'>
                Contact Information
              </h3>

              <div className='space-y-6'>
                <div className='flex items-start'>
                  <div className='w-10 h-10 bg-brand-white border-2 border-brand-pink rounded-lg flex items-center justify-center mr-4 mt-1'>
                    <svg
                      className='w-5 h-5 text-brand-pink'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className='font-semibold text-gray-900'>Email</h4>
                    <p className='text-gray-600'>hello@vividautophoto.com</p>
                  </div>
                </div>

                <div className='flex items-start'>
                  <div className='w-10 h-10 bg-brand-white border border-brand-pink rounded-lg flex items-center justify-center mr-4 mt-1'>
                    <svg
                      className='w-5 h-5 text-brand-pink'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className='font-semibold text-gray-900'>Phone</h4>
                    <p className='text-gray-600'>+44 123 456 7890</p>
                  </div>
                </div>

                <div className='flex items-start'>
                  <div className='w-10 h-10 bg-brand-white border-2 border-brand-pink rounded-lg flex items-center justify-center mr-4 mt-1'>
                    <svg
                      className='w-5 h-5 text-brand-pink'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
                      />
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M15 11a3 3 0 11-6 0 3 3 0 016 0z'
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className='font-semibold text-gray-900'>Location</h4>
                    <p className='text-gray-600'>London, United Kingdom</p>
                  </div>
                </div>
              </div>

              <div className='mt-8 pt-8 border-t border-gray-200'>
                <h4 className='font-semibold text-gray-900 mb-4'>Follow Us</h4>
                <div className='flex space-x-4'>
                  <a
                    href='#'
                    className='w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 hover:bg-brand-white hover:text-brand-pink transition-colors'
                    aria-label='Facebook'
                  >
                    <svg
                      className='w-5 h-5'
                      fill='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path d='M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' />
                    </svg>
                  </a>
                  <a
                    href='#'
                    className='w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 hover:bg-brand-white hover:text-brand-pink transition-colors'
                    aria-label='Twitter'
                  >
                    <svg
                      className='w-5 h-5'
                      fill='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path d='M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z' />
                    </svg>
                  </a>
                  <a
                    href='#'
                    className='w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 hover:bg-brand-white hover:text-brand-pink transition-colors'
                    aria-label='Instagram'
                  >
                    <svg
                      className='w-5 h-5'
                      fill='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path d='M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987c6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323C5.902 8.198 7.053 7.708 8.35 7.708s2.448.49 3.323 1.297c.897.875 1.387 2.026 1.387 3.323s-.49 2.448-1.297 3.323c-.875.897-2.026 1.387-3.323 1.387z' />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Response Times */}
          <div className='lg:col-span-2'>
            <div className='bg-white rounded-xl shadow-lg p-8 mb-8'>
              <h3 className='text-xl font-bold text-gray-900 mb-6'>
                Response Times
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                <div className='text-center'>
                  <div className='w-12 h-12 bg-brand-white border border-brand-pink rounded-lg flex items-center justify-center mx-auto mb-3'>
                    <svg
                      className='w-6 h-6 text-brand-pink'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                      />
                    </svg>
                  </div>
                  <h4 className='font-semibold text-gray-900'>Email</h4>
                  <p className='text-sm text-gray-600'>Within 24 hours</p>
                </div>
                <div className='text-center'>
                  <div className='w-12 h-12 bg-brand-white border-2 border-brand-pink rounded-lg flex items-center justify-center mx-auto mb-3'>
                    <svg
                      className='w-6 h-6 text-brand-pink'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'
                      />
                    </svg>
                  </div>
                  <h4 className='font-semibold text-gray-900'>Phone</h4>
                  <p className='text-sm text-gray-600'>Same day</p>
                </div>
                <div className='text-center'>
                  <div className='w-12 h-12 bg-brand-white border-2 border-brand-pink rounded-lg flex items-center justify-center mx-auto mb-3'>
                    <svg
                      className='w-6 h-6 text-brand-pink'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0l-2 2m8-2l2 2m-2-2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V9'
                      />
                    </svg>
                  </div>
                  <h4 className='font-semibold text-gray-900'>Projects</h4>
                  <p className='text-sm text-gray-600'>Within 48 hours</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
