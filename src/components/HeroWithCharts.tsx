'use client';

import React from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,

  Tooltip,
  Legend,
} from 'chart.js';
import { PressStrip } from '@/components/credibility/PressStrip';

// Lazy-load chart renders (keeps JS small and avoids SSR issues)
const Doughnut = dynamic(() => import('react-chartjs-2').then(m => m.Doughnut), { ssr: false });
const Bar = dynamic(() => import('react-chartjs-2').then(m => m.Bar), { ssr: false });

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

// Fixed heights to prevent CLS
const CARD_H = 'h-[220px] sm:h-[240px]';

type Breakdown = { aws: number; cloudflare: number; zoho: number };

export default function HeroWithCharts({
  heroSrc = '/images/hero/230422_Chester_Stock_Photography-84.webp',
  wixAnnual = 108, // Wix Light: £9/month × 12
  awsAnnual = 108.4, // £60 + £10 + £38.4
  breakdown = { aws: 60, cloudflare: 10, zoho: 38.4 },
  lcpSeries = [14.2, 7.8, 2.3, 1.8],
}: {
  heroSrc?: string;
  wixAnnual?: number;
  awsAnnual?: number;
  breakdown?: Breakdown;
  lcpSeries?: number[];
}) {
  const savingsPct = Math.round(((wixAnnual - awsAnnual) / wixAnnual) * 100);

  // Bar (Wix vs secure cloud stack)
  const barData = {
    labels: ['Wix Light (£9/month)', 'Vivid Media (£120/year with same-day support)'],
    datasets: [
      {
        label: 'Annual cost (£)',
        data: [wixAnnual, awsAnnual],
        backgroundColor: ['#cbd5e1', '#ff2d7a'], // grey vs brand pink
        borderRadius: 12,
      },
    ],
  };
  const barOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx: any) => `£${ctx.parsed.y.toLocaleString()}` } },
    },
    scales: { y: { beginAtZero: true, ticks: { callback: (v: any) => `£${v}` } } },
  };

  // Donut (breakdown of £108.40)
  const donutData = {
    labels: ['Enterprise-grade hosting', 'Business domain', 'Professional email'],
    datasets: [
      {
        data: [breakdown.aws, breakdown.cloudflare, breakdown.zoho],
        backgroundColor: ['#ff2d7a', '#0b0b0b', '#d81b60'],
        borderWidth: 0,
      },
    ],
  };
  const donutOptions: any = {
    cutout: '70%',
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 12 } },
      tooltip: { callbacks: { label: (ctx: any) => `${ctx.label}: £${ctx.parsed}` } },
    },
  };



  return (
    <section className="w-full">
      {/* HERO */}
      <div className="relative h-[60vh] min-h-[480px] w-full overflow-hidden rounded-b-3xl pb-24 md:pb-24">
        <Image
          src={heroSrc}
          alt="Vivid Media Cheshire — premium creative craftsmanship with cloud performance results"
          fill
          priority
          fetchPriority="high"
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 1280px, 1600px"
          placeholder="blur"
          blurDataURL="data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA="
          quality={75}
          style={{ objectFit: 'cover' }}
        />
        <div className="absolute inset-0 bg-[rgba(0,0,0,0.60)]" />
        <div className="relative z-10 mx-auto flex h-full max-w-6xl flex-col items-center justify-center px-4 pt-24 pb-8 md:pt-0 md:pb-0 text-center text-white">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-white drop-shadow-lg">
            Cheshire's Practical Performance Marketer
          </h1>
          <p className="mt-2 mb-4 text-xl md:text-2xl text-white font-semibold drop-shadow-md">
            Marketing that pays for itself.
          </p>
          <p className="mb-6 max-w-3xl text-base md:text-lg text-white/90 drop-shadow-md">
            I help local businesses get more leads through clear websites, Google Ads, and analytics that work together.
          </p>

          <PressStrip />

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-5">
            <a
              href="tel:+447123456789"
              className="inline-flex items-center justify-center px-8 py-3 rounded-full text-base md:text-lg font-semibold bg-brand-pink text-white shadow-lg hover:bg-brand-pink2 hover:shadow-xl transition min-h-[48px]"
              onClick={(e) => {
                if (typeof window !== 'undefined' && window.gtag) {
                  window.gtag('event', 'cta_call_click', {
                    page_path: window.location.pathname,
                    service_name: 'home',
                    cta_text: 'Call Joe'
                  });
                }
              }}
              aria-label="Call Joe for immediate assistance"
            >
              Call Joe
            </a>
            <a
              href="#contact"
              className="inline-flex items-center justify-center px-8 py-3 rounded-full text-base md:text-lg font-semibold bg-white text-slate-900 hover:bg-gray-100 transition shadow-md hover:shadow-lg min-h-[48px]"
              onClick={(e) => {
                e.preventDefault();
                const contactForm = document.querySelector('#contact');
                if (contactForm) {
                  contactForm.scrollIntoView({ behavior: 'smooth' });
                }
                if (typeof window !== 'undefined' && window.gtag) {
                  window.gtag('event', 'cta_form_click', {
                    page_path: window.location.pathname,
                    service_name: 'home',
                    cta_text: 'Book Your Consultation'
                  });
                }
              }}
              aria-label="Book your consultation - scroll to contact form"
            >
              Book Your Consultation
            </a>
          </div>

        </div>
      </div>

      {/* PROOF CARDS */}
      <div className="mx-auto mt-12 md:mt-12 lg:mt-16 grid max-w-6xl grid-cols-1 gap-6 px-4 sm:grid-cols-3">
        <h2 className="sr-only">Costs and Performance Results</h2>
        <div className="rounded-2xl bg-white p-6 shadow-xl flex flex-col justify-center">
          <h3 className="mb-3 text-xl font-bold text-[#0b0b0b]">Based in Cheshire</h3>
          <p className="text-base text-neutral-700 leading-relaxed mb-3">
            I help small businesses improve their online presence through measurable marketing and design.
          </p>
          <div className="mt-2 flex items-center gap-2 text-sm text-neutral-600">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Same-day support response</span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-sm text-neutral-600">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Enterprise-grade infrastructure</span>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-xl">
          <h3 className="mb-2 text-sm font-semibold text-[#0b0b0b]">£{awsAnnual.toFixed(2)} Annual Breakdown</h3>
          <div className={`${CARD_H} mx-auto max-w-[260px]`}>
            <Doughnut data={donutData} options={donutOptions} />
          </div>
          <p className="mt-2 text-xs text-neutral-600">Straightforward, transparent costs you control.</p>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-xl">
          <h3 className="mb-2 text-sm font-semibold text-[#0b0b0b]">Performance Improvement</h3>
          <div className={`${CARD_H} flex flex-col justify-center items-center text-center`}>
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-green-600 text-3xl">▼</span>
              <span className="text-2xl font-bold text-gray-900">82% Faster</span>
            </div>
            <div className="flex items-center justify-center mb-4">
              <Image
                src="/images/icons/clock-green.svg"
                alt="Clock icon representing faster loading"
                width={64}
                height={64}
                className="h-16 w-16"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="space-y-1">
              <div className="text-sm font-semibold text-gray-900">Load Time Improvement</div>
              <div className="text-xs font-medium text-gray-700">From 14.2s → 1.8s after secure cloud migration</div>
            </div>
          </div>
          <p className="mt-2 text-xs text-neutral-600">Faster Pages + Better SEO = More Enquiries</p>
        </div>
      </div>
    </section>
  );
}
