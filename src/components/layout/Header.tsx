'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { MobileMenu } from './MobileMenu';

interface HeaderProps {
  pageTitle?: string;
}

interface NavigationItem {
  label: string;
  href: string;
  mobileOnly?: boolean;
}

const navigationItems: NavigationItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services' },
  { label: 'Blog', href: '/blog' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export function Header({ pageTitle: _pageTitle }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className='sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-16 md:h-20'>
            {/* Logo */}
            <Link
              href='/'
              className='flex items-center text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors'
              aria-label='Go to homepage'
            >
              <Image
                src='/images/icons/vivid-auto-photography-logo.png'
                alt='Vivid Auto Photography Logo'
                width={192}
                height={192}
                className='w-48 h-48 object-contain'
                priority
              />
            </Link>

            {/* Desktop Navigation */}
            <nav
              className='hidden md:flex items-center space-x-6 md:space-x-8'
              role='navigation'
            >
              {navigationItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium transition-colors nav-link-brand ${
                    pathname === item.href ? 'border-b-2 pb-1' : 'text-gray-700'
                  }`}
                  style={
                    pathname === item.href
                      ? {
                          color: '#F5276F',
                          borderBottomColor: '#F5276F',
                        }
                      : {}
                  }
                  aria-current={pathname === item.href ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Desktop CTA Button */}
            <div className='hidden md:flex items-center space-x-4'>
              <Link
                href='/contact'
                className='bg-brand-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-primary-dark transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2'
                style={{
                  backgroundColor: '#F5276F',
                  color: 'white',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = '#C8094C';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = '#F5276F';
                }}
              >
                Get Started
              </Link>
            </div>

            {/* Mobile Menu Button - Only render on mobile (below 768px) */}
            <div className='md:hidden'>
              <button
                onClick={toggleMobileMenu}
                className='p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 min-w-[44px] min-h-[44px] flex items-center justify-center'
                aria-label='Toggle mobile menu'
                aria-expanded={isMobileMenuOpen}
              >
                <svg
                  className='w-6 h-6'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                  aria-hidden='true'
                >
                  {isMobileMenuOpen ? (
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M6 18L18 6M6 6l12 12'
                    />
                  ) : (
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M4 6h16M4 12h16M4 18h16'
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={closeMobileMenu}
        navigationItems={navigationItems}
        currentPath={pathname}
      />
    </>
  );
}
