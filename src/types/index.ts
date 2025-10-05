export interface SiteConfig {
  title: string;
  description: string;
  url: string;
  logo: string;
  favicon: string;
  socialMedia: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
  contact: {
    email: string;
    phone: string;
    address?: string;
  };
  analytics: {
    googleAnalyticsId?: string;
    facebookPixelId?: string;
  };
}

export interface NavigationItem {
  label: string;
  href: string;
  icon?: React.ComponentType;
  mobileOnly?: boolean;
}

export interface CTAButton {
  text: string;
  href: string;
  variant: 'primary' | 'secondary' | 'outline';
  size: 'sm' | 'md' | 'lg';
}

export interface HeroSection {
  title: string;
  subtitle: string;
  ctaButtons: CTAButton[];
  backgroundImage?: string;
  mobileOptimized: boolean;
}

export interface FAQ {
  question: string;
  answer: string;
}

// Re-export content types
export type { BlogPost, Service, Testimonial } from '../lib/content';
