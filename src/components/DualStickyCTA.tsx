'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export function DualStickyCTA() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);

  // Show sticky CTA after scrolling down 300px
  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Don't show on contact page
  if (pathname === '/contact') {
    return null;
  }

  // Page-specific CTA configuration
  const stickyCtaConfig = [
    {
      match: '/services/photography',
      banner: 'Need better images for your business?',
      primaryLabel: 'Book your photoshoot',
      primaryHref: '/services/photography/#contact',
      secondaryLabel: 'View portfolio',
      secondaryHref: '/services/photography/#gallery'
    }
  ];

  const defaultStickyCta = {
    banner: 'Not getting enquiries from your website?',
    primaryLabel: 'Send me your website',
    primaryHref: '/contact/',
    secondaryLabel: 'Email me directly',
    secondaryHref: 'mailto:joe@vividmediacheshire.com'
  };

  // Select config based on pathname
  const activeConfig =
    stickyCtaConfig.find((item) => pathname?.includes(item.match)) ||
    defaultStickyCta;

  const handleCTAClick = () => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'cta_click', {
        page_path: pathname,
        service_name: pathname.split('/').pop() || 'home',
        cta_text: activeConfig.primaryLabel
      });
    }
  };

  const handleSecondaryClick = () => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'cta_secondary_click', {
        page_path: pathname,
        service_name: pathname.split('/').pop() || 'home',
        cta_text: activeConfig.secondaryLabel
      });
    }
  };

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 md:hidden transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
      role="complementary"
      aria-label="Sticky call-to-action bar"
    >
      <div className="bg-black shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col items-center justify-center gap-3">
            <p className="text-white text-sm font-medium text-center">
              {activeConfig.banner}
            </p>
            <div className="flex flex-col w-full gap-2">
              {/* Primary CTA */}
              <a
                href={activeConfig.primaryHref}
                onClick={handleCTAClick}
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg text-sm font-semibold bg-brand-pink text-white hover:bg-brand-pink2 transition shadow-md hover:shadow-lg min-w-[44px] min-h-[48px] w-full"
                aria-label={activeConfig.primaryLabel}
              >
                {activeConfig.primaryLabel}
              </a>
              {/* Secondary CTA */}
              <a
                href={activeConfig.secondaryHref}
                onClick={handleSecondaryClick}
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg text-sm font-semibold bg-white text-gray-900 hover:bg-gray-100 transition shadow-md hover:shadow-lg min-w-[44px] min-h-[48px] w-full"
              >
                {activeConfig.secondaryLabel}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
