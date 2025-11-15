'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface CTAVariant {
  id: string;
  text: string;
  urgency?: string;
  availability?: string;
}

interface EnhancedCTAProps {
  variants?: CTAVariant[];
  href: string;
  className?: string;
  showUrgency?: boolean;
  showAvailability?: boolean;
  trackingId?: string;
  variant?: 'primary' | 'secondary';
  children?: React.ReactNode;
}

const defaultVariants: CTAVariant[] = [
  {
    id: 'book-photoshoot',
    text: 'Book Your Photoshoot →',
    availability: 'Free consultation included'
  },
  {
    id: 'schedule-session',
    text: 'Schedule Your Session →',
    availability: 'Next available: This week'
  },
  {
    id: 'get-started',
    text: 'Get Started Today →',
    availability: 'Same-week booking available'
  },
  {
    id: 'contact-photographer',
    text: 'Contact Photographer →',
    availability: 'Free consultation included'
  }
];

export default function EnhancedCTA({
  variants = defaultVariants,
  href,
  className = '',
  showUrgency = true,
  showAvailability = true,
  trackingId = 'photography-cta',
  variant = 'primary',
  children
}: EnhancedCTAProps) {
  const [selectedVariant, setSelectedVariant] = useState<CTAVariant>(variants[0]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    // A/B test variant selection based on user session
    const storedVariant = sessionStorage.getItem(`cta-variant-${trackingId}`);

    if (storedVariant) {
      const variant = variants.find(v => v.id === storedVariant);
      if (variant) {
        setSelectedVariant(variant);
      }
    } else {
      // Random variant selection for A/B testing
      const randomIndex = Math.floor(Math.random() * variants.length);
      const randomVariant = variants[randomIndex];
      setSelectedVariant(randomVariant);
      sessionStorage.setItem(`cta-variant-${trackingId}`, randomVariant.id);
    }
  }, [variants, trackingId]);

  const handleClick = () => {
    // Track CTA click event
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'cta_click', {
        event_category: 'conversion',
        event_label: selectedVariant.id,
        custom_parameter_1: trackingId,
        custom_parameter_2: selectedVariant.text,
        value: 1
      });
    }

    // Track variant performance
    const clickData = {
      variantId: selectedVariant.id,
      timestamp: new Date().toISOString(),
      trackingId,
      href
    };

    // Store click data for analysis
    const existingClicks = JSON.parse(localStorage.getItem('cta-clicks') || '[]');
    existingClicks.push(clickData);
    localStorage.setItem('cta-clicks', JSON.stringify(existingClicks));

    console.log('CTA Click Tracked:', clickData);
  };

  const baseClasses = variant === 'primary'
    ? 'bg-brand-pink text-white hover:bg-brand-pink2'
    : 'border-2 border-white text-white hover:bg-white hover:text-gray-900';

  const combinedClasses = `${baseClasses} px-8 py-4 rounded-lg text-lg font-semibold transition-colors text-center inline-flex items-center justify-center ${className}`;

  if (!isClient) {
    // Server-side render with default variant
    return (
      <Link
        href={href}
        className={combinedClasses}
        onClick={handleClick}
      >
        {children || variants[0].text}
      </Link>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-2">
      <Link
        href={href}
        className={combinedClasses}
        onClick={handleClick}
      >
        {children || selectedVariant.text}
      </Link>

      {(showUrgency || showAvailability) && (
        <div className="text-sm text-center space-y-1">
          {showUrgency && selectedVariant.urgency && (
            <div className="text-brand-grey opacity-90">
              {selectedVariant.urgency}
            </div>
          )}
          {showAvailability && selectedVariant.availability && (
            <div className="text-brand-pink font-medium">
              {selectedVariant.availability}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Analytics helper for CTA performance
export const getCTAAnalytics = () => {
  if (typeof window === 'undefined') return null;

  const clicks = JSON.parse(localStorage.getItem('cta-clicks') || '[]');

  // Group by variant
  const variantPerformance = clicks.reduce((acc: any, click: any) => {
    if (!acc[click.variantId]) {
      acc[click.variantId] = {
        clicks: 0,
        lastClick: null
      };
    }
    acc[click.variantId].clicks++;
    acc[click.variantId].lastClick = click.timestamp;
    return acc;
  }, {});

  return {
    totalClicks: clicks.length,
    variantPerformance,
    rawData: clicks
  };
};
