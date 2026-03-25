/**
 * Single source of truth for all business identity, contact, route, and social data.
 * Every module that needs business details imports from here.
 * No other file may define independent values for these fields.
 *
 * Covers: Req 14 (canonical hosting route), Req 15 (canonical contact details),
 *         Req 16 (business identity for LocalBusiness/Organization).
 */

export const CANONICAL = {
  business: {
    name: 'Vivid Media Cheshire',
    founder: 'Joe Morris',
    jobTitle: 'Website Redesign and Conversion Specialist',
    areaServed: ['Nantwich', 'Crewe', 'Nantwich and Crewe'],
    address: {
      streetAddress: 'Nantwich',
      addressLocality: 'Nantwich',
      addressRegion: 'Cheshire',
      postalCode: 'CW5',
      addressCountry: 'GB',
    },
    /** Nantwich, Cheshire, UK — verified against the business location. */
    geo: { latitude: 53.0679, longitude: -2.5211 },
    priceRange: '££',
  },
  contact: {
    email: 'joe@vividmediacheshire.com',
    phone: '+447586378502',
    phoneDisplay: '07586 378502',
  },
  urls: {
    site: 'https://vividmediacheshire.com',
    cloudfront: 'https://d15sc9fc739ev2.cloudfront.net',
  },
  routes: {
    home: '/',
    about: '/about/',
    contact: '/contact/',
    pricing: '/pricing/',
    freeAudit: '/free-audit/',
    blog: '/blog/',
    privacyPolicy: '/privacy-policy/',
    services: '/services/',
    websiteDesign: '/services/website-design/',
    websiteHosting: '/services/website-hosting/',
    adCampaigns: '/services/ad-campaigns/',
    analytics: '/services/analytics/',
    photography: '/services/photography/',
    faq: '/faq/',
  },
  social: {
    linkedin: 'https://www.linkedin.com/in/joe-morris-07921a1a0/',
    facebook: 'https://www.facebook.com/VividAutoPhotography',
    instagram: 'https://www.instagram.com/vividautophotography/',
    twitter: 'https://twitter.com/vividautophoto',
  },
  openingHours: [
    { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '09:00', closes: '18:00' },
    { days: ['Saturday'], opens: '10:00', closes: '14:00' },
    { days: ['Sunday'], opens: '10:00', closes: '16:00' },
  ],
  knowsAbout: [
    'Website Redesign',
    'Conversion Rate Optimisation',
    'Content Strategy',
    'Google Ads Management',
    'Website and Marketing Analytics',
    'Commercial and Editorial Photography',
  ],
} as const;
