'use client';

import { useEffect } from 'react';
import { CheckCircle, Download, TrendingUp, Shield } from 'lucide-react';
import { AuditForm } from '@/components/AuditForm';

export default function FreeAuditClient() {
  useEffect(() => {
    // Mark that user visited the audit page
    sessionStorage.setItem('visited_audit_page', 'true');
  }, []);
  
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="px-6 py-16 md:py-24">
        <div className="mx-auto max-w-4xl text-centre">
          <h1 className="mb-6 text-4xl font-bold text-gray-900 md:text-5xl">
            Free 10-Point Website Audit
          </h1>
          
          <p className="mb-8 text-xl text-gray-600">
            Discover how your website performs against Cheshire East competitors
          </p>
          
          <div className="flex flex-wrap justify-centre gap-4 text-sm text-gray-600">
            <div className="flex items-centre gap-2">
              <CheckCircle className="h-5 w-5 text-pink-600" />
              <span>No Obligation</span>
            </div>
            <div className="flex items-centre gap-2">
              <CheckCircle className="h-5 w-5 text-pink-600" />
              <span>Cheshire-Focused</span>
            </div>
            <div className="flex items-centre gap-2">
              <CheckCircle className="h-5 w-5 text-pink-600" />
              <span>Within 24 Hours</span>
            </div>
          </div>
        </div>
      </section>

      {/* What You'll Get */}
      <section className="bg-white px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-12 text-centre text-3xl font-bold text-gray-900">
            What's Included in Your Audit
          </h2>
          
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-lg border border-gray-200 p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
              <TrendingUp className="mb-4 h-10 w-10 text-pink-600" />
              <h3 className="mb-3 text-xl font-semibold text-gray-900">
                Performance Analysis
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Page load speed assessment</li>
                <li>• Mobile responsiveness check</li>
                <li>• Core Web Vitals review</li>
              </ul>
            </div>
            
            <div className="rounded-lg border border-gray-200 p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
              <Shield className="mb-4 h-10 w-10 text-pink-600" />
              <h3 className="mb-3 text-xl font-semibold text-gray-900">
                SEO & Visibility
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Local SEO opportunities</li>
                <li>• Meta tags evaluation</li>
                <li>• Content structure review</li>
              </ul>
            </div>
            
            <div className="rounded-lg border border-gray-200 p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
              <Download className="mb-4 h-10 w-10 text-pink-600" />
              <h3 className="mb-3 text-xl font-semibold text-gray-900">
                Conversion Optimisation
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Call-to-action effectiveness</li>
                <li>• User experience insights</li>
                <li>• Competitor comparison</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-lg bg-white p-8 shadow-lg">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">
              Get Your Free Audit
            </h2>
            
            <p className="mb-8 text-gray-600">
              Enter your details below and we'll send you a comprehensive 10-point audit of your website within 24 hours.
            </p>
            
            <AuditForm />
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="bg-gray-50 px-6 py-12">
        <div className="mx-auto max-w-4xl text-centre">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">
            Trusted by Cheshire East Businesses
          </h2>
          
          <p className="mb-8 text-gray-600">
            Based in Nantwich, we've helped businesses across Crewe, Sandbach, Congleton, and throughout Cheshire East improve their online presence.
          </p>
          
          <div className="flex flex-wrap justify-centre gap-6 text-sm text-gray-500">
            <span>✓ 10+ years experience</span>
            <span>✓ Local Cheshire focus</span>
            <span>✓ No sales pressure</span>
            <span>✓ Actionable insights</span>
          </div>
        </div>
      </section>
    </main>
  );
}
