'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export function StickyConversionBar() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show bar after scrolling 300px
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 bg-brand-black border-t-2 border-brand-pink shadow-2xl transform transition-transform duration-300"
      role="complementary"
      aria-label="Contact options"
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-white text-sm sm:text-base font-medium text-center sm:text-left">
          Ready to grow your business?
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <a
            href="tel:+447123456789"
            className="inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-semibold bg-white text-brand-black hover:bg-gray-100 transition-colors shadow-md min-h-[48px] min-w-[48px] w-full sm:w-auto"
            aria-label="Call Joe to discuss your project"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            Call Joe
          </a>
          
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-semibold bg-brand-pink text-white hover:bg-brand-pink2 transition-colors shadow-md min-h-[48px] min-w-[48px] w-full sm:w-auto"
            aria-label="Send a message through our contact form"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            Send Message
          </Link>
        </div>
      </div>
    </div>
  );
}
