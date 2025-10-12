import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'Vivid Auto Photography - Data-Driven Automotive Photography | Nantwich & Cheshire',
    template: '%s | Vivid Auto Photography'
  },
  description:
    'Professional data-driven automotive photography services in Nantwich & Cheshire. Specializing in automotive photography, analytics, and strategic advertising campaigns that deliver measurable results.',
  keywords: [
    'automotive photography',
    'car photography',
    'vehicle photography',
    'Nantwich photography',
    'Cheshire photography',
    'data-driven photography',
    'automotive analytics',
    'car dealership photography',
    'commercial automotive photography',
    'professional car photography',
    'automotive advertising',
    'vehicle marketing photography',
  ],
  authors: [{ name: 'Vivid Auto Photography', url: 'https://d15sc9fc739ev2.cloudfront.net' }],
  creator: 'Vivid Auto Photography',
  publisher: 'Vivid Auto Photography',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://d15sc9fc739ev2.cloudfront.net'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: 'https://d15sc9fc739ev2.cloudfront.net',
    siteName: 'Vivid Auto Photography',
    title: 'Vivid Auto Photography - Data-Driven Automotive Photography | Nantwich & Cheshire',
    description:
      'Professional data-driven automotive photography services in Nantwich & Cheshire. Specializing in automotive photography, analytics, and strategic advertising campaigns that deliver measurable results.',
    images: [
      {
        url: '/images/hero/aston-martin-db6-website.webp',
        width: 1200,
        height: 630,
        alt: 'Professional automotive photography showcase - Aston Martin DB6 captured with expert lighting and composition in Nantwich, Cheshire',
        type: 'image/webp',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vivid Auto Photography - Data-Driven Automotive Photography | Nantwich & Cheshire',
    description:
      'Professional data-driven automotive photography services in Nantwich & Cheshire. Specializing in automotive photography, analytics, and strategic advertising campaigns.',
    images: ['/images/hero/aston-martin-db6-website.webp'],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-placeholder',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
