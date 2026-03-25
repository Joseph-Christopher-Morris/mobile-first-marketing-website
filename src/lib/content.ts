export interface Service {
  id: string;
  title: string;
  description: string;
  image: string;
  href: string;
  features: string[];
}

export function getAllServices(): Service[] {
  return [
    {
      id: 'hosting',
      title: 'Website Hosting & Migration',
      description:
        'Your website is slow. Visitors leave before the page loads. I move it to faster hosting with zero downtime.',
      image: '/images/services/web-hosting-and-migration/hosting-migration-card.webp',
      href: '/services/website-hosting/',
      features: [
        'Faster load times',
        'Transparent annual pricing',
        'Zero downtime migration',
        'Reliable performance',
      ],
    },
    {
      id: 'photography',
      title: 'Photography Services',
      description:
        'Stock photos make your site look like everyone else. I shoot images that match your business and build trust.',
      image: '/images/services/photography-hero.webp',
      href: '/services/photography/',
      features: [
        'Automotive photography',
        'Commercial photography',
        'Mobile-ready delivery',
        'Editing included',
      ],
    },
    {
      id: 'analytics',
      title: 'Analytics & Tracking',
      description:
        'You are spending money on ads but cannot tell what is working. I set up tracking so you see where enquiries come from.',
      image: '/images/services/screenshot-2025-09-23-analytics-dashboard.webp',
      href: '/services/analytics/',
      features: [
        'Conversion tracking',
        'Traffic source reports',
        'Monthly summaries',
        'Clear recommendations',
      ],
    },
    {
      id: 'ad-campaigns',
      title: 'Google Ads Management',
      description:
        'Your ads are running but the phone is not ringing. I fix the targeting, the landing page, and the budget.',
      image: '/images/services/WhatsApp Image 2025-11-11 at 9.27.14 AM.webp',
      href: '/services/ad-campaigns/',
      features: [
        'Campaign setup',
        'Targeting fixes',
        'Budget management',
        'Monthly reporting',
      ],
    },
  ];
}
