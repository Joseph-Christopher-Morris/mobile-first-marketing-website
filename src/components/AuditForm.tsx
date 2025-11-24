'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';

export function AuditForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    website: '',
    business: '',
    location: ''
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');

    // Track form submission in GA4
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'audit_form_submit', {
        form_name: 'free_audit',
        business_location: formData.location
      });
    }

    try {
      // TODO: Replace with your actual form endpoint (Formspree or similar)
      const response = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus('success');
        
        // Track conversion
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'conversion', {
            send_to: 'AW-CONVERSION_ID/CONVERSION_LABEL',
            value: 1.0,
            currency: 'GBP',
            transaction_id: Date.now().toString()
          });
          
          window.gtag('event', 'generate_lead', {
            currency: 'GBP',
            value: 50.0
          });
        }
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          website: '',
          business: '',
          location: ''
        });
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setStatus('error');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (status === 'success') {
    return (
      <div className="rounded-lg bg-green-50 p-6 text-center">
        <h3 className="mb-2 text-xl font-semibold text-green-900">
          Thank You!
        </h3>
        <p className="text-green-700">
          Your audit request has been received. We'll send your comprehensive website audit to {formData.email} within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-700">
          Your Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          value={formData.name}
          onChange={handleChange}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
          placeholder="Joe Bloggs"
        />
      </div>

      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
          Email Address *
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          value={formData.email}
          onChange={handleChange}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
          placeholder="joe@example.com"
        />
      </div>

      <div>
        <label htmlFor="phone" className="mb-2 block text-sm font-medium text-gray-700">
          Phone Number *
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          required
          value={formData.phone}
          onChange={handleChange}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
          placeholder="07586 378502"
        />
      </div>

      <div>
        <label htmlFor="website" className="mb-2 block text-sm font-medium text-gray-700">
          Website URL *
        </label>
        <input
          type="url"
          id="website"
          name="website"
          required
          value={formData.website}
          onChange={handleChange}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
          placeholder="https://www.example.com"
        />
      </div>

      <div>
        <label htmlFor="business" className="mb-2 block text-sm font-medium text-gray-700">
          Business Name *
        </label>
        <input
          type="text"
          id="business"
          name="business"
          required
          value={formData.business}
          onChange={handleChange}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
          placeholder="Your Business Ltd"
        />
      </div>

      <div>
        <label htmlFor="location" className="mb-2 block text-sm font-medium text-gray-700">
          Location *
        </label>
        <select
          id="location"
          name="location"
          required
          value={formData.location}
          onChange={handleChange}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
        >
          <option value="">Select your location</option>
          <option value="Nantwich">Nantwich</option>
          <option value="Crewe">Crewe</option>
          <option value="Sandbach">Sandbach</option>
          <option value="Congleton">Congleton</option>
          <option value="Middlewich">Middlewich</option>
          <option value="Alsager">Alsager</option>
          <option value="Other Cheshire East">Other Cheshire East</option>
          <option value="Outside Cheshire East">Outside Cheshire East</option>
        </select>
      </div>

      {status === 'error' && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
          Sorry, there was an error submitting your request. Please try again or call us directly on 07586 378502.
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-pink-600 px-6 py-4 font-semibold text-white hover:bg-pink-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-md hover:shadow-lg"
      >
        {status === 'submitting' ? (
          <>
            <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
            Submitting...
          </>
        ) : (
          <>
            <Send className="h-5 w-5" />
            Get My Free Audit
          </>
        )}
      </button>

      <p className="text-center text-xs text-gray-500">
        We respect your privacy. Your information will only be used to send you the audit report.
      </p>
    </form>
  );
}
