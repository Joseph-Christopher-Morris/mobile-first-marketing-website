import { Metadata } from 'next';
import { Layout } from '@/components/layout';
import React from 'react';

export const metadata: Metadata = {
  title: 'Privacy Policy | Vivid Auto Photography',
  description:
    'Privacy Policy for Vivid Auto Photography. Learn how we collect, use, and protect your personal data in compliance with GDPR and UK data protection laws.',
  openGraph: {
    title: 'Privacy Policy | Vivid Auto Photography',
    description:
      'Privacy Policy for Vivid Auto Photography. Learn how we collect, use, and protect your personal data in compliance with GDPR and UK data protection laws.',
    type: 'website',
  },
};

/**
 * Vivid Auto Photography — Privacy Policy Page
 *
 * Notes:
 * - Semantic HTML for accessibility (main/article/section/nav/ul/li/address).
 * - Tailwind utility classes for clean, responsive typography.
 * - In-page table of contents with anchor links.
 * - Email addresses use mailto: links.
 */

export default function PrivacyPolicyPage() {
  return (
    <Layout pageTitle='Privacy Policy'>
      <div className='min-h-screen bg-white'>
        <main className='mx-auto max-w-4xl px-6 py-12'>
          <header className='mb-10'>
            <h1 className='text-3xl md:text-4xl font-bold tracking-tight'>
              Privacy Policy
            </h1>
            <p className='mt-2 text-gray-600 text-sm md:text-base'>
              Vivid Auto Photography Privacy Notice
            </p>
          </header>

          {/* Table of Contents */}
          <nav
            aria-label='Table of contents'
            className='mb-12 rounded-2xl border p-5 shadow-sm'
          >
            <h2 className='text-lg font-semibold'>Contents</h2>
            <ul className='mt-3 list-disc pl-5 space-y-1'>
              <li>
                <a href='#intro' className='underline hover:text-brand-pink'>
                  Introduction
                </a>
              </li>
              <li>
                <a
                  href='#what-we-collect'
                  className='underline hover:text-brand-pink'
                >
                  What personal data we collect and why
                </a>
              </li>
              <li>
                <a href='#security' className='underline hover:text-brand-pink'>
                  Data Security
                </a>
              </li>
              <li>
                <a href='#sharing' className='underline hover:text-brand-pink'>
                  Who we share your personal data with
                </a>
              </li>
              <li>
                <a href='#breaches' className='underline hover:text-brand-pink'>
                  Data Breaches
                </a>
              </li>
              <li>
                <a href='#storage' className='underline hover:text-brand-pink'>
                  Data storage location
                </a>
              </li>
              <li>
                <a
                  href='#retention'
                  className='underline hover:text-brand-pink'
                >
                  Retaining your data
                </a>
              </li>
              <li>
                <a href='#rights' className='underline hover:text-brand-pink'>
                  Your Rights
                </a>
              </li>
              <li>
                <a href='#cookies' className='underline hover:text-brand-pink'>
                  Cookies
                </a>
              </li>
              <li>
                <a
                  href='#concerns'
                  className='underline hover:text-brand-pink'
                >
                  Concerns, Comments and Feedback
                </a>
              </li>
            </ul>
          </nav>

          <article className='prose prose-neutral max-w-none'>
            <section id='intro'>
              <p>
                Your personal data is important to both you and us and it
                requires respectful and careful protection. This privacy notice
                informs you of our privacy practices and of the choices you can
                make about the way we hold information about you as a website
                visitor, a client, a subcontractor or you work with us. We are
                committed to complying with the GDPR (2016), the UK GDPR (2021)
                and the Data Protection Act (2018) and good business practices.
                We are both a data controller and a data processor.
              </p>
              <p>
                This is our privacy notice so please be aware that should you
                follow a link to another website, you are no longer covered by
                this notice. It&rsquo;s a good idea to understand the privacy
                notice of any website before sharing personal information with
                it.
              </p>
            </section>

            <section id='what-we-collect'>
              <h2>What personal data we collect and why?</h2>
              <p>
                At Vivid Auto Photography we will only collect the minimum
                personal information from you. This will be at the point you
                contact us, work with us, ask to be included on a newsletter, or
                become a client. This could include your name, address,
                telephone numbers, email address, signature and bank account
                details. We need this information for legitimate interest,
                contractual obligation or legal obligation purposes to provide
                you with the services that you have requested. We will not use
                your data for any other purpose unless we have obtained your
                consent for that specific purpose.
              </p>