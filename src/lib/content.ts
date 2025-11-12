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
        'secure cloud hosting with global delivery hosting and 82% faster load times. Professional website migration with zero downtime and reliable performance.',
      image: '/images/services/web-hosting-and-migration/hosting-migration-card.webp',
      href: '/services/hosting',
      features: [
        'secure cloud infrastructure Migration',
        'Transparent Annual Pricing',
        '82% Faster Load Times',
        'Zero Downtime Migration',
      ],
    },
    {
      id: 'photography',
      title: 'Photography Services',
      description:
        'Professional automotive and commercial photography with mobile-optimized delivery and stunning visual storytelling.',
      image: '/images/services/photography-hero.webp',
      href: '/services/photography',
      features: [
        'Automotive Photography',
        'Commercial Photography',
        'Mobile-Optimized Delivery',
        'Professional Editing',
      ],
    },
    {
      id: 'analytics',
      title: 'Data Analytics & Insights',
      description:
        'Comprehensive analytics and data-driven insights to optimize your business performance and drive growth.',
      image: '/images/services/screenshot-2025-09-23-analytics-dashboard.webp',
      href: '/services/analytics',
      features: [
        'Performance Analytics',
        'Data Visualization',
        'Growth Insights',
        'ROI Optimization',
      ],
    },
    {
      id: 'ad-campaigns',
      title: 'Strategic Ad Campaigns',
      description:
        'Targeted advertising campaigns designed to maximize ROI and reach your ideal customers across all platforms.',
      image: '/images/services/WhatsApp Image 2025-11-11 at 9.27.14 AM.webp',
      href: '/services/ad-campaigns',
      features: [
        'Campaign Strategy',
        'Multi-Platform Advertising',
        'ROI Optimization',
        'Performance Tracking',
      ],
    },
  ];
}
