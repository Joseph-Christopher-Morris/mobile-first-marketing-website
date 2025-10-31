import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default:
      'Vivid Media Cheshire - AWS CloudFront Hosting, Web Design & Google Ads | Nantwich & Cheshire',
    template: '%s | Vivid Media Cheshire',
  },
  description:
    'Vivid Media Cheshire helps local businesses grow with cheaper, faster AWS CloudFront hosting and migration, mobile-first web design, and Google Ads campaigns that deliver measurable results.',
  keywords: [
    'AWS website hosting Cheshire',
    'AWS CloudFront migration',
    'mobile-first web design',
    'Google Ads campaigns Cheshire',
    'digital marketing Nantwich',
    'website performance optimisation',
    'cheaper website hosting UK',
    'data-driven marketing Cheshire',
    'creative web design Cheshire',
    'Vivid Media Cheshire',
  ],
  authors: [
    {
      name: 'Vivid Media Cheshire',
      url: 'https://d15sc9fc739ev2.cloudfront.net',
    },
  ],
  creator: 'Vivid Media Cheshire',
  publisher: 'Vivid Media Cheshire',
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
    siteName: 'Vivid Media Cheshire',
    title:
      'Vivid Media Cheshire - AWS CloudFront Hosting, Web Design & Google Ads | Nantwich & Cheshire',
    description:
      'Vivid Media Cheshire helps local businesses grow with cheaper, faster AWS CloudFront hosting and migration, mobile-first web design, and Google Ads campaigns that deliver measurable results.',
    images: [
      {
        url: '/images/hero/aston-martin-db6-website.webp',
        width: 1200,
        height: 630,
        alt: 'Vivid Media Cheshire – AWS CloudFront hosting, mobile-first design, and data-driven marketing based in Nantwich.',
        type: 'image/webp',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title:
      'Vivid Media Cheshire - AWS CloudFront Hosting, Web Design & Google Ads | Nantwich & Cheshire',
    description:
      'Vivid Media Cheshire helps local businesses grow with cheaper, faster AWS CloudFront hosting and migration, mobile-first web design, and Google Ads campaigns.',
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
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-QJXSCJ0L43';
  
  return (
    <html lang='en'>
      <head>
        <link rel="icon" href="/favicon.png" sizes="any" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://d15sc9fc739ev2.cloudfront.net" />
        
        {/* Google Tag (GA4) */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `}
        </Script>
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
