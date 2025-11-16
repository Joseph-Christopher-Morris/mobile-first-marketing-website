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

  // Decide topic based on current page
  let callTopic = "Your Project";
  if (pathname.includes("/services/website-hosting")) {
    callTopic = "Website Hosting";
  } else if (pathname.includes("/services/photography")) {
    callTopic = "Photography";
  } else if (pathname.includes("/services/website-design")) {
    callTopic = "Website Design";
  } else if (pathname.includes("/services/analytics")) {
    callTopic = "Data & Analytics";
  } else if (pathname.includes("/services/ad-campaigns")) {
    callTopic = "Ad Campaigns";
  }

  const callLabel = `Call Joe About ${callTopic}`;
  const callAriaLabel = `Call Joe about ${callTopic.toLowerCase()} for your business`;

  // Page-specific CTA configuration
  const stickyCtaConfig = [
    {
      match: '/services/website-hosting',
      banner: 'Need faster, more reliable hosting?',
      primaryLabel: 'Call about Hosting',
      secondaryLabel: 'Send Hosting Details',
      secondaryHref: '/services/website-hosting#contact-form'
    },
    {
      match: '/services/hosting',
      banner: 'Need faster, more reliable hosting?',
      primaryLabel: 'Call about Hosting',
      secondaryLabel: 'Send Hosting Details',
      secondaryHref: '/services/hosting#contact'
    },
    {
      match: '/services/photography',
      banner: 'Need better images for your business?',
      primaryLabel: 'Call about Photography',
      secondaryLabel: 'Send Shoot Details',
      secondaryHref: '/services/photography#contact'
    }
  ];

  const defaultStickyCta = {
    banner: 'Ready to grow your business?',
    primaryLabel: 'Call Joe',
    secondaryLabel: 'Send Your Project Details',
    secondaryHref: '/contact/'
  };

  // Select config based on pathname
  const activeConfig =
    stickyCtaConfig.find((item) => pathname?.includes(item.match)) ||
    defaultStickyCta;

  const handleCallClick = () => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'cta_call_click', {
        page_path: pathname,
        service_name: pathname.split('/').pop() || 'home',
        cta_text: activeConfig.primaryLabel
      });
    }
  };

  const handleFormClick = () => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'cta_form_click', {
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
              {/* Call Button - Opens phone dialer */}
              <a
                href="tel:+447586378502"
                onClick={handleCallClick}
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg text-sm font-semibold bg-brand-pink text-white hover:bg-brand-pink2 transition shadow-md hover:shadow-lg min-h-[48px] w-full"
                aria-label={callAriaLabel}
              >
                <svg
                  className="w-4 h-4 mr-2"
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
                {callLabel}
              </a>
              {/* Secondary Button - Links to contact form */}
              <a
                href={activeConfig.secondaryHref}
                onClick={handleFormClick}
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg text-sm font-semibold bg-white text-gray-900 hover:bg-gray-100 transition shadow-md hover:shadow-lg min-h-[48px] w-full"
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
