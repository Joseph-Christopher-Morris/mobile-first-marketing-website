'use client';

import { siteConfig } from '@/config/site';
import Analytics from '@/lib/analytics';

interface QuickContactProps {
  variant?: 'floating' | 'inline' | 'banner';
  className?: string;
}

export function QuickContact({
  variant = 'inline',
  className = '',
}: QuickContactProps) {
  const baseClasses = {
    floating:
      'fixed bottom-4 right-4 z-50 bg-white shadow-lg rounded-lg border border-gray-200 p-4',
    inline: 'bg-blue-50 border border-blue-200 rounded-lg p-6',
    banner: 'bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4',
  };

  const textClasses = {
    floating: 'text-gray-900',
    inline: 'text-blue-900',
    banner: 'text-white',
  };

  const buttonClasses = {
    floating: 'bg-blue-600 hover:bg-blue-700 text-white',
    inline: 'bg-blue-600 hover:bg-blue-700 text-white',
    banner: 'bg-white hover:bg-gray-100 text-blue-600',
  };

  return (
    <div className={`${baseClasses[variant]} ${className}`}>
      <div
        className={
          variant === 'banner'
            ? 'flex flex-col sm:flex-row items-center justify-between gap-4'
            : ''
        }
      >
        <div className={variant === 'floating' ? 'text-center' : ''}>
          <h3
            className={`font-bold mb-2 ${textClasses[variant]} ${
              variant === 'floating'
                ? 'text-lg'
                : variant === 'banner'
                  ? 'text-xl'
                  : 'text-xl'
            }`}
          >
            {variant === 'banner' ? 'Ready to Get Started?' : 'Need Help?'}
          </h3>
          <p
            className={`${textClasses[variant]} ${
              variant === 'floating'
                ? 'text-sm mb-4'
                : variant === 'banner'
                  ? 'text-lg'
                  : 'mb-4'
            }`}
          >
            {variant === 'banner'
              ? 'Contact us today for a free consultation!'
              : 'Get in touch with our team for immediate assistance.'}
          </p>
        </div>

        <div
          className={`flex ${
            variant === 'floating'
              ? 'flex-col space-y-2'
              : variant === 'banner'
                ? 'flex-col sm:flex-row gap-3'
                : 'flex-col sm:flex-row gap-4'
          }`}
        >
          {/* Call Button */}
          <a
            href={`tel:${siteConfig.contact.phone.replace(/\D/g, '')}`}
            onClick={() => Analytics.trackPhoneCall(siteConfig.contact.phone)}
            className={`${buttonClasses[variant]} px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 min-h-[44px] ${
              variant === 'floating' ? 'text-sm' : ''
            }`}
          >
            <svg
              className='w-4 h-4'
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
            <span>{variant === 'floating' ? 'Call' : 'Call Now'}</span>
          </a>

          {/* Email Button */}
          <a
            href={`mailto:${siteConfig.contact.email}`}
            onClick={() => Analytics.trackEmailClick(siteConfig.contact.email)}
            className={`${
              variant === 'banner'
                ? 'bg-transparent hover:bg-white/10 text-white border-2 border-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
            } px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 min-h-[44px] ${
              variant === 'floating' ? 'text-sm' : ''
            }`}
          >
            <svg
              className='w-4 h-4'
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
            <span>{variant === 'floating' ? 'Email' : 'Send Email'}</span>
          </a>
        </div>
      </div>

      {/* Close button for floating variant */}
      {variant === 'floating' && (
        <button
          onClick={() => {
            const element = document.querySelector('[data-quick-contact]');
            if (element) {
              (element as HTMLElement).style.display = 'none';
            }
          }}
          className='absolute top-2 right-2 text-gray-400 hover:text-gray-600'
          aria-label='Close'
        >
          <svg
            className='w-4 h-4'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M6 18L18 6M6 6l12 12'
            />
          </svg>
        </button>
      )}
    </div>
  );
}
