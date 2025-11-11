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
  wixAnnual = 550,
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

  // Bar (Wix vs AWS stack)
  const barData = {
    labels: ['Wix bundle', 'AWS + Cloudflare + Zoho'],
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
    labels: ['AWS CloudFront/S3', 'Cloudflare Domain', 'Zoho Mail'],
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
      <div className="relative h-[60vh] min-h-[480px] w-full overflow-hidden rounded-b-3xl pb-16 md:pb-24">
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
        <div className="absolute inset-0 bg-[rgba(0,0,0,0.55)]" />
        <div className="relative z-10 mx-auto flex h-full max-w-6xl flex-col items-center justify-center px-4 text-center text-white">
          <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">
            Faster, smarter websites that work as hard as you do
          </h1>
          <p className="mt-4 max-w-3xl text-base opacity-95 sm:text-lg">
            Vivid Media Cheshire helps local businesses grow with affordable mobile-first web design, secure hosting, and Google Ads campaigns that turn visitors into customers.
          </p>

          <PressStrip variant="dark" />

          <div className="mt-8 flex flex-col sm:flex-row h-auto sm:h-12 items-center justify-center gap-3">
            <a
              href="/contact"
              className="rounded-2xl bg-[#ff2d7a] px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:opacity-90"
            >
              Let's Grow Your Business
            </a>
            <a
              href="/services"
              className="rounded-2xl border border-white/70 px-5 py-3 text-sm font-semibold text-white/95 backdrop-blur-sm transition hover:bg-white/10"
            >
              Explore Services
            </a>
          </div>

        </div>
      </div>

      {/* PROOF CARDS */}
      <div className="mx-auto mt-8 md:mt-10 lg:-mt-16 grid max-w-6xl grid-cols-1 gap-6 px-4 sm:grid-cols-3">
        <h2 className="sr-only">Costs and Performance Results</h2>
        <div className="rounded-2xl bg-white p-4 shadow-xl">
          <h3 className="mb-2 text-sm font-semibold text-[#0b0b0b]">Annual Hosting Cost</h3>
          <div className={`${CARD_H}`}>
            <Bar data={barData} options={barOptions} />
          </div>
          <p className="mt-2 text-xs text-neutral-600">~80% cheaper by moving to AWS + Cloudflare + Zoho.</p>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-xl">
          <h3 className="mb-2 text-sm font-semibold text-[#0b0b0b]">£{awsAnnual.toFixed(2)} Annual Breakdown</h3>
          <div className={`${CARD_H} mx-auto max-w-[260px]`}>
            <Doughnut data={donutData} options={donutOptions} />
          </div>
          <p className="mt-2 text-xs text-neutral-600">Lean, transparent costs you control.</p>
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
              <div className="text-xs font-medium text-gray-700">From 14.2s → 1.8s after AWS migration</div>
            </div>
          </div>
          <p className="mt-2 text-xs text-neutral-600">Faster Pages + Better SEO = More Enquiries</p>
        </div>
      </div>
    </section>
  );
}
