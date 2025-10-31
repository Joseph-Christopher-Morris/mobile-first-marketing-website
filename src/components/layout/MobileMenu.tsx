'use client';

import React from 'react';
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
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className='fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden'
        onClick={onClose}
      />

      {/* Menu Panel */}
      <div className='fixed top-0 right-0 h-full w-64 bg-white shadow-xl z-50 md:hidden transform transition-transform duration-200 ease-out will-change-transform'>
        <div className='flex flex-col h-full'>
          {/* Header */}
          <div className='flex items-center justify-between p-4 border-b border-gray-200'>
            <span className='text-lg font-semibold text-gray-900'>Menu</span>
            <button
              onClick={onClose}
              className='p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-pink focus:ring-offset-2'
              aria-label='Close menu'
            >
              <svg
                className='w-6 h-6'
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
          </div>

          {/* Navigation Links */}
          <nav className='flex-1 px-4 py-6'>
            <ul className='space-y-2'>
              {navigationItems.map(item => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                      currentPath === item.href
                        ? 'bg-brand-white text-brand-pink border-l-4 border-brand-pink'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    aria-current={
                      currentPath === item.href ? 'page' : undefined
                    }
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* CTA Button */}
          <div className='p-4 border-t border-gray-200'>
            <Link
              href='/contact'
              onClick={onClose}
              className='block w-full bg-brand-pink text-white text-center px-4 py-3 rounded-lg font-medium hover:bg-brand-pink2 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-pink focus:ring-offset-2'
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
