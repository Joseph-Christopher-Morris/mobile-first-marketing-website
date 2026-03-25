'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function StickyConversionBar() {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      // Show bar after scrolling 300px
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Get contextual CTA text based on current page
  const getCTAText = () => {
    if (pathname?.includes('/photography')) return 'Book your photoshoot';
    return 'Send me your website';
  };

  // Get contextual message based on current page
  const getMessage = () => {
    if (pathname?.includes('/photography')) return 'Ready to capture your story?';
    if (pathname?.includes('/ad-campaigns') || pathname?.includes('/marketing')) return 'Ready to boost your ROI?';
    if (pathname?.includes('/hosting')) return 'Ready for faster hosting?';
    if (pathname?.includes('/pricing')) return 'Find the right package for you';
    if (pathname?.includes('/about')) return 'Ready to work together?';
    if (pathname?.includes('/blog')) return 'Inspired by these results?';
    return 'Ready to grow your business?';
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 bg-brand-black border-t-2 border-brand-pink shadow-2xl transform transition-transform duration-300"
      role="complementary"
      aria-label="Contact options"
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-white text-sm sm:text-base font-medium text-center sm:text-left">
          {getMessage()}
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <a
            href="mailto:joe@vividmediacheshire.com"
            className="inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-semibold bg-white text-brand-black hover:bg-gray-100 transition-colors shadow-md min-h-[48px] min-w-[48px] w-full sm:w-auto"
            aria-label="Email me directly"
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
            Email me directly
          </a>
          
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-semibold bg-brand-pink text-white hover:bg-brand-pink2 transition-colors shadow-md min-h-[48px] min-w-[48px] w-full sm:w-auto"
            aria-label={getCTAText()}
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
            {getCTAText()}
          </Link>
        </div>
      </div>
    </div>
  );
}
