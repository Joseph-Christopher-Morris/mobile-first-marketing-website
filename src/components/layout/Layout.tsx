import React from 'react';
import { Header } from './Header';
import { BottomNavigation } from './BottomNavigation';
import { Footer } from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  showBottomNav?: boolean;
  pageTitle?: string;
  metaDescription?: string;
  className?: string;
}

export function Layout({
  children,
  showBottomNav = true,
  pageTitle,
  metaDescription: _metaDescription,
  className = '',
}: LayoutProps) {
  return (
    <div className='min-h-screen flex flex-col bg-white'>
      {/* Header - responsive design */}
      <Header pageTitle={pageTitle} />

      {/* Main content area */}
      <main
        className={`flex-1 ${showBottomNav ? 'pb-16 md:pb-0' : ''} ${className}`}
        role='main'
        aria-label={pageTitle || 'Main content'}
      >
        {children}
      </main>

      {/* Footer - hidden on mobile when bottom nav is shown */}
      <Footer className={showBottomNav ? 'hidden md:block' : ''} />

      {/* Bottom Navigation - mobile only */}
      {showBottomNav && <BottomNavigation />}
    </div>
  );
}
