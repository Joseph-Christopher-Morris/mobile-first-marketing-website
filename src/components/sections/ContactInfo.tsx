'use client';

import { siteConfig } from '@/config/site';

interface ContactInfoProps {
  variant?: 'default' | 'compact' | 'horizontal';
  showSocial?: boolean;
  showHours?: boolean;
  className?: string;
}

export function ContactInfo({
  variant = 'default',
  showSocial = true,
  showHours = true,
  className = '',
}: ContactInfoProps) {
  const baseClasses =
    variant === 'horizontal' ? 'flex flex-wrap gap-8' : 'space-y-6';

  return (
    <div className={`${baseClasses} ${className}`}>
      {/* Contact Methods */}
      <div className={variant === 'horizontal' ? 'flex-1 min-w-[200px]' : ''}>
        <h3
          className={`font-bold text-gray-900 mb-4 ${
            variant === 'compact' ? 'text-lg' : 'text-xl'
          }`}
        >
          Contact Information
        </h3>
        <div className='space-y-4'>
          {/* Email */}
          <div className='flex items-start space-x-3'>
            <div className='flex-shrink-0 w-5 h-5 text-blue-600 mt-1'>
              <svg fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
                />
              </svg>
            </div>
            <div>
              <p className='font-medium text-gray-900 text-sm mb-1'>Email</p>
              <a
                href={`mailto:${siteConfig.contact.email}`}
                className='text-blue-600 hover:text-blue-700 transition-colors text-sm'
              >
                {siteConfig.contact.email}
              </a>
            </div>
          </div>

          {/* Phone */}
          <div className='flex items-start space-x-3'>
            <div className='flex-shrink-0 w-5 h-5 text-blue-600 mt-1'>
              <svg fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'
                />
              </svg>
            </div>
            <div>
              <p className='font-medium text-gray-900 text-sm mb-1'>Phone</p>
              <a
                href={`tel:${siteConfig.contact.phone.replace(/\D/g, '')}`}
                className='text-blue-600 hover:text-blue-700 transition-colors text-sm'
              >
                {siteConfig.contact.phone}
              </a>
            </div>
          </div>

          {/* Address */}
          {siteConfig.contact.address && (
            <div className='flex items-start space-x-3'>
              <div className='flex-shrink-0 w-5 h-5 text-blue-600 mt-1'>
                <svg fill='none' stroke='currentColor' viewBox='0 0 24 24'>
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
                <p className='font-medium text-gray-900 text-sm mb-1'>
                  Address
                </p>
                <address className='text-gray-600 not-italic text-sm'>
                  {siteConfig.contact.address}
                </address>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Business Hours */}
      {showHours && (
        <div className={variant === 'horizontal' ? 'flex-1 min-w-[200px]' : ''}>
          <h3
            className={`font-bold text-gray-900 mb-4 ${
              variant === 'compact' ? 'text-lg' : 'text-xl'
            }`}
          >
            Business Hours
          </h3>
          <div className='space-y-2 text-sm text-gray-600'>
            <div className='flex justify-between'>
              <span className='font-medium'>Monday - Friday</span>
              <span>9:00 AM - 6:00 PM</span>
            </div>
            <div className='flex justify-between'>
              <span className='font-medium'>Saturday</span>
              <span>10:00 AM - 4:00 PM</span>
            </div>
            <div className='flex justify-between'>
              <span className='font-medium'>Sunday</span>
              <span className='text-red-600'>Closed</span>
            </div>
          </div>
        </div>
      )}

      {/* Social Media */}
      {showSocial && (
        <div className={variant === 'horizontal' ? 'flex-1 min-w-[200px]' : ''}>
          <h3
            className={`font-bold text-gray-900 mb-4 ${
              variant === 'compact' ? 'text-lg' : 'text-xl'
            }`}
          >
            Follow Us
          </h3>
          <div className='flex space-x-3'>
            {siteConfig.socialMedia.facebook && (
              <a
                href={siteConfig.socialMedia.facebook}
                target='_blank'
                rel='noopener noreferrer'
                className='w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors'
                aria-label='Follow us on Facebook'
              >
                <svg
                  className='w-5 h-5'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                >
                  <path
                    fillRule='evenodd'
                    d='M20 10C20 4.477 15.523 0 10 0S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z'
                    clipRule='evenodd'
                  />
                </svg>
              </a>
            )}
            {siteConfig.socialMedia.twitter && (
              <a
                href={siteConfig.socialMedia.twitter}
                target='_blank'
                rel='noopener noreferrer'
                className='w-10 h-10 bg-blue-400 text-white rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors'
                aria-label='Follow us on Twitter'
              >
                <svg
                  className='w-5 h-5'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                >
                  <path d='M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84' />
                </svg>
              </a>
            )}
            {siteConfig.socialMedia.linkedin && (
              <a
                href={siteConfig.socialMedia.linkedin}
                target='_blank'
                rel='noopener noreferrer'
                className='w-10 h-10 bg-blue-700 text-white rounded-full flex items-center justify-center hover:bg-blue-800 transition-colors'
                aria-label='Follow us on LinkedIn'
              >
                <svg
                  className='w-5 h-5'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                >
                  <path
                    fillRule='evenodd'
                    d='M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z'
                    clipRule='evenodd'
                  />
                </svg>
              </a>
            )}
            {siteConfig.socialMedia.instagram && (
              <a
                href={siteConfig.socialMedia.instagram}
                target='_blank'
                rel='noopener noreferrer'
                className='w-10 h-10 bg-pink-600 text-white rounded-full flex items-center justify-center hover:bg-pink-700 transition-colors'
                aria-label='Follow us on Instagram'
              >
                <svg
                  className='w-5 h-5'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                >
                  <path
                    fillRule='evenodd'
                    d='M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z'
                    clipRule='evenodd'
                  />
                </svg>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
