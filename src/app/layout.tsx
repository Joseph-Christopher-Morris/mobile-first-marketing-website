import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import '../styles/brand-theme.css';
import { AnalyticsProvider } from '@/components/analytics/AnalyticsProvider';
import { StructuredData } from '@/components/seo';

// Optimized font loading with preload and display swap
const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // Ensures text remains visible during font swap
  preload: true,
  variable: '--font-inter',
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: {
    default:
      'Mobile-First Vivid Auto Photography Agency | Photography, Analytics & Ad Campaigns',
    template: '%s | Mobile-First Vivid Auto Photography',
  },
  description:
    'Professional Vivid Auto Photography services with mobile-first approach. Specializing in photography, analytics, and ad campaigns to grow your business.',
  keywords: [
    'mobile Vivid Auto Photography',
    'photography services',
    'analytics',
    'ad campaigns',
    'digital Vivid Auto Photography',
    'mobile-first design',
    'Vivid Auto Photography agency',
    'business growth',
  ],
  authors: [{ name: 'Mobile-First Vivid Auto Photography Team' }],
  creator: 'Mobile-First Vivid Auto Photography',
  publisher: 'Mobile-First Vivid Auto Photography',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'
  ),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title:
      'Mobile-First Vivid Auto Photography Agency | Photography, Analytics & Ad Campaigns',
    description:
      'Professional Vivid Auto Photography services with mobile-first approach. Specializing in photography, analytics, and ad campaigns to grow your business.',
    siteName: 'Mobile-First Vivid Auto Photography',
    images: [
      {
        url: '/images/hero-bg.jpg',
        width: 1200,
        height: 630,
        alt: 'Mobile-First Vivid Auto Photography Agency',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title:
      'Mobile-First Vivid Auto Photography Agency | Photography, Analytics & Ad Campaigns',
    description:
      'Professional Vivid Auto Photography services with mobile-first approach. Specializing in photography, analytics, and ad campaigns to grow your business.',
    images: ['/images/hero-bg.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' className={inter.variable}>
      <head>
        {/* Preload critical fonts */}
        <link
          rel='preload'
          href='/_next/static/media/inter-latin-400-normal.woff2'
          as='font'
          type='font/woff2'
          crossOrigin='anonymous'
        />
        <link
          rel='preload'
          href='/_next/static/media/inter-latin-600-normal.woff2'
          as='font'
          type='font/woff2'
          crossOrigin='anonymous'
        />
        {/* DNS prefetch for external resources */}
        <link rel='dns-prefetch' href='//fonts.googleapis.com' />
        <link rel='dns-prefetch' href='//fonts.gstatic.com' />
      </head>
      <body className={`${inter.className} font-sans antialiased`}>
        <StructuredData type='organization' />
        <StructuredData type='website' />
        <AnalyticsProvider>{children}</AnalyticsProvider>
      </body>
    </html>
  );
}
