import { SiteConfig } from '@/types';

export const siteConfig: SiteConfig = {
  title: 'Mobile-First Vivid Auto Photography Website',
  description:
    'Professional Vivid Auto Photography services including Photography, Analytics, and Ad Campaigns with mobile-first design.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com',
  logo: '/images/logo.svg',
  favicon: '/favicon.ico',
  socialMedia: {
    facebook: 'https://facebook.com/yourcompany',
    twitter: 'https://twitter.com/yourcompany',
    linkedin: 'https://linkedin.com/company/yourcompany',
    instagram: 'https://instagram.com/yourcompany',
  },
  contact: {
    email: process.env.CONTACT_EMAIL || 'contact@your-domain.com',
    phone: '+1 (555) 123-4567',
    address: '123 Business St, City, State 12345',
  },
  analytics: {
    googleAnalyticsId: process.env.NEXT_PUBLIC_GA_ID,
    facebookPixelId: process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID,
  },
};
