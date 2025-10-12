'use client';

import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className='bg-gray-900 text-white'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
          {/* Company Info */}
          <div className='col-span-1 md:col-span-2'>
            <h3 className='text-lg font-bold mb-4'>Vivid Auto Photography</h3>
            <p className='text-gray-400 text-sm mb-4'>
              Professional Vivid Auto Photography services with mobile-first
              design approach.
            </p>
            <div className='flex space-x-4 mt-6'>
              <a
                href='#'
                className='text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800 min-w-[44px] min-h-[44px] flex items-center justify-center'
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
                className='text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800 min-w-[44px] min-h-[44px] flex items-center justify-center'
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
                className='text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800 min-w-[44px] min-h-[44px] flex items-center justify-center'
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

          {/* Quick Links */}
          <div>
            <h4 className='text-sm font-semibold mb-4'>Quick Links</h4>
            <ul className='space-y-2'>
              <li>
                <Link
                  href='/'
                  className='text-gray-400 hover:text-white text-sm transition-colors'
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href='/services'
                  className='text-gray-400 hover:text-white text-sm transition-colors'
                >
                  Services
                </Link>
              </li>
              <li>
                <Link
                  href='/blog'
                  className='text-gray-400 hover:text-white text-sm transition-colors'
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href='/about'
                  className='text-gray-400 hover:text-white text-sm transition-colors'
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href='/contact'
                  className='text-gray-400 hover:text-white text-sm transition-colors'
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className='text-sm font-semibold mb-4'>Services</h4>
            <ul className='space-y-2'>
              <li>
                <Link
                  href='/services/photography'
                  className='text-gray-400 hover:text-white text-sm transition-colors'
                >
                  Photography Services
                </Link>
              </li>
              <li>
                <Link
                  href='/services/analytics'
                  className='text-gray-400 hover:text-white text-sm transition-colors'
                >
                  Data Analytics & Insights
                </Link>
              </li>
              <li>
                <Link
                  href='/services/ad-campaigns'
                  className='text-gray-400 hover:text-white text-sm transition-colors'
                >
                  Strategic Ad Campaigns
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className='border-t border-gray-800 mt-8 pt-8 text-center'>
          <p className='text-gray-400 text-sm'>
            © 2025 Vivid Auto Photography. All rights reserved.
          </p>

        </div>
      </div>
    </footer>
  );
}
