import React from 'react';
import Link from 'next/link';

interface FooterProps {
  className?: string;
}

const footerLinks = {
  services: [
    { label: 'Photography', href: '/services/photography' },
    { label: 'Analytics', href: '/services/analytics' },
    { label: 'Ad Campaigns', href: '/services/ad-campaigns' },
  ],
  company: [
    { label: 'About', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contact', href: '/contact' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ],
};

const socialLinks = [
  {
    label: 'Facebook',
    href: '#',
    icon: (
      <svg
        className='w-5 h-5'
        fill='currentColor'
        viewBox='0 0 24 24'
        aria-hidden='true'
      >
        <path
          fillRule='evenodd'
          d='M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z'
          clipRule='evenodd'
        />
      </svg>
    ),
  },
  {
    label: 'Twitter',
    href: '#',
    icon: (
      <svg
        className='w-5 h-5'
        fill='currentColor'
        viewBox='0 0 24 24'
        aria-hidden='true'
      >
        <path d='M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84' />
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    href: '#',
    icon: (
      <svg
        className='w-5 h-5'
        fill='currentColor'
        viewBox='0 0 24 24'
        aria-hidden='true'
      >
        <path
          fillRule='evenodd'
          d='M19 0H5a5 5 0 00-5 5v14a5 5 0 005 5h14a5 5 0 005-5V5a5 5 0 00-5-5zM8 19H5V8h3v11zM6.5 6.732c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zM20 19h-3v-5.604c0-3.368-4-3.113-4 0V19h-3V8h3v1.765c1.396-2.586 7-2.777 7 2.476V19z'
          clipRule='evenodd'
        />
      </svg>
    ),
  },
];

export function Footer({ className = '' }: FooterProps) {
  return (
    <footer className={`bg-gray-900 text-white ${className}`}>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
          {/* Brand Section */}
          <div className='md:col-span-1'>
            <Link
              href='/'
              className='flex items-center space-x-2 text-xl font-bold'
            >
              <img
                src='/images/icons/Vivid Auto Photography Logo.png'
                alt='Vivid Auto Photography Logo'
                className='w-24 h-24 object-contain'
                width={96}
                height={96}
              />
              <span>Vivid Auto Photography</span>
            </Link>
            <p className='mt-4 text-gray-400 text-sm'>
              Professional Vivid Auto Photography services with mobile-first
              design approach.
            </p>

            {/* Social Links */}
            <div className='flex space-x-4 mt-6'>
              {socialLinks.map(social => (
                <a
                  key={social.label}
                  href={social.href}
                  className='text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800 min-w-[44px] min-h-[44px] flex items-center justify-center'
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Services Links */}
          <div>
            <h3 className='text-sm font-semibold text-white uppercase tracking-wider'>
              Services
            </h3>
            <ul className='mt-4 space-y-3'>
              {footerLinks.services.map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className='text-gray-400 hover:text-white transition-colors text-sm'
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className='text-sm font-semibold text-white uppercase tracking-wider'>
              Company
            </h3>
            <ul className='mt-4 space-y-3'>
              {footerLinks.company.map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className='text-gray-400 hover:text-white transition-colors text-sm'
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className='text-sm font-semibold text-white uppercase tracking-wider'>
              Legal
            </h3>
            <ul className='mt-4 space-y-3'>
              {footerLinks.legal.map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className='text-gray-400 hover:text-white transition-colors text-sm'
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className='mt-12 pt-8 border-t border-gray-800'>
          <div className='flex flex-col md:flex-row justify-between items-center'>
            <p className='text-gray-400 text-sm'>
              © {new Date().getFullYear()} Vivid Auto Photography Website. All
              rights reserved.
            </p>
            <p className='text-gray-400 text-sm mt-4 md:mt-0'>
              Built with mobile-first design principles
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
