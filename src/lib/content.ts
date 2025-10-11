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
      image: '/images/services/ad-campaigns-hero.webp',
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
