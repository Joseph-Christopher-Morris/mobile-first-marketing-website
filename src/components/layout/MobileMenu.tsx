'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

interface NavigationItem {
  label: string;
  href: string;
  mobileOnly?: boolean;
}

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navigationItems: NavigationItem[];
  currentPath: string;
}

export function MobileMenu({
  isOpen,
  onClose,
  navigationItems,
  currentPath,
}: MobileMenuProps) {
  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className='fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden'
        onClick={onClose}
        aria-hidden='true'
      />

      {/* Slide-out Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role='dialog'
        aria-modal='true'
        aria-label='Mobile navigation menu'
      >
        {/* Menu Header */}
        <div className='flex items-center justify-between p-4 border-b border-gray-200'>
          <h2 className='text-lg font-semibold text-gray-900'>Menu</h2>
          <button
            onClick={onClose}
            className='p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 min-w-[44px] min-h-[44px] flex items-center justify-center'
            aria-label='Close menu'
          >
            <svg
              className='w-6 h-6'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
              aria-hidden='true'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className='flex flex-col p-4 space-y-2' role='navigation'>
          {navigationItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-4 py-3 rounded-lg text-base font-medium transition-colors min-h-[48px] ${
                currentPath === item.href
                  ? 'border-l-4'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
              style={
                currentPath === item.href
                  ? {
                      backgroundColor: 'rgba(245, 39, 111, 0.1)',
                      color: '#F5276F',
                      borderLeftColor: '#F5276F',
                    }
                  : {}
              }
              aria-current={currentPath === item.href ? 'page' : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Mobile CTA Section */}
        <div className='absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50'>
          <Link
            href='/contact'
            className='w-full text-white px-4 py-3 rounded-lg text-base font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center min-h-[48px]'
            style={{
              backgroundColor: '#F5276F',
              color: 'white',
              boxShadow: '0 0 0 2px rgba(245, 39, 111, 0.5)',
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
      </div>
    </>
  );
}
