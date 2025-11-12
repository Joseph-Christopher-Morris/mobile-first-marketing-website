'use client';

import React, { useState } from 'react';

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  serviceInterest: string;
  message: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  message?: string;
}

export function GeneralContactForm() {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    serviceInterest: '',
    message: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Please enter your full name';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Please enter your email address';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address (e.g., name@example.com)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }

    // Track form input (only non-sensitive fields)
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      const safeValue = name === "serviceInterest" ? value : undefined;

      window.gtag("event", "cta_form_input", {
        field_name: name,
        field_value: safeValue,
        page_path: window.location.pathname,
        form_id: "general_contact_form",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Track form submission
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("event", "lead_form_submit", {
        page_path: window.location.pathname,
        service: formData.serviceInterest || "not_specified",
        form_id: "general_contact_form",
      });
    }

    setIsSubmitting(true);

    try {
      // Submit to Formspree
      const response = await fetch('https://formspree.io/f/xvgvkbjb', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          service: formData.serviceInterest,
          message: formData.message,
          _subject: 'New enquiry from Vivid Media Cheshire',
          _replyto: formData.email,
        }),
      });

      if (response.ok) {
        // Redirect to thank you page
        window.location.href = '/thank-you';
      } else {
        throw new Error('Form submission failed');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      // You could add error state handling here
      alert('There was an error sending your message. Please try again or contact us directly at joe@vividauto.photography');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className='bg-white rounded-xl shadow-lg p-6 md:p-8 text-center'>
        <div className='w-16 h-16 bg-brand-white border-2 border-brand-pink rounded-full flex items-center justify-center mx-auto mb-4'>
          <svg
            className='w-8 h-8 text-brand-pink'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
            aria-hidden='true'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M5 13l4 4L19 7'
            />
          </svg>
        </div>
        <h3 className='text-2xl font-bold text-brand-black mb-2'>Thank You!</h3>
        <p className='text-gray-600 mb-6'>
          We&apos;ve received your message and will get back to you within one
          business day.
        </p>
        <button
          onClick={() => setIsSubmitted(false)}
          className='bg-brand-pink text-white px-6 py-3 rounded-lg font-medium hover:bg-brand-pink2 transition-colors min-h-[48px]'
          aria-label='Send another message'
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <div className='bg-white rounded-xl shadow-lg p-6 md:p-8'>
      <h2 className='text-2xl font-bold text-gray-900 mb-2'>Get in Touch</h2>
      <p className='text-neutral-600 mb-6'>Fill in the form below and I will get back to you personally.</p>
      <form onSubmit={handleSubmit} className='space-y-6' method="POST" action="https://formspree.io/f/xvgvkbjb">
        <input type="hidden" name="_redirect" value="https://vividmediacheshire.com/thank-you" />
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div>
            <label
              htmlFor='fullName'
              className='block text-sm font-medium text-gray-700 mb-2'
            >
              Full Name *
            </label>
            <input
              type='text'
              id='fullName'
              name='fullName'
              value={formData.fullName}
              onChange={handleChange}
              required
              autoComplete='name'
              aria-describedby={errors.fullName ? 'fullName-error' : undefined}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand-pink focus:border-transparent transition-colors ${
                errors.fullName ? 'border-brand-pink bg-brand-white' : 'border-gray-300'
              }`}
              placeholder='Your full name'
            />
            {errors.fullName && (
              <p
                id='fullName-error'
                className='mt-1 text-sm text-brand-pink'
                role='alert'
              >
                {errors.fullName}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor='email'
              className='block text-sm font-medium text-gray-700 mb-2'
            >
              Email Address *
            </label>
            <input
              type='email'
              id='email'
              name='email'
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete='email'
              aria-describedby={errors.email ? 'email-error' : undefined}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand-pink focus:border-transparent transition-colors ${
                errors.email ? 'border-brand-pink bg-brand-white' : 'border-gray-300'
              }`}
              placeholder='your.email@example.com'
            />
            {errors.email && (
              <p
                id='email-error'
                className='mt-1 text-sm text-brand-pink'
                role='alert'
              >
                {errors.email}
              </p>
            )}
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div>
            <label
              htmlFor='phone'
              className='block text-sm font-medium text-gray-700 mb-2'
            >
              Mobile Number *
            </label>
            <input
              type='tel'
              id='phone'
              name='phone'
              value={formData.phone}
              onChange={handleChange}
              required
              autoComplete='tel'
              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-pink focus:border-transparent transition-colors'
              placeholder='+44 123 456 7890'
            />
          </div>

          <div>
            <label
              htmlFor='serviceInterest'
              className='block text-sm font-medium text-gray-700 mb-2'
            >
              Service Interest
            </label>
            <select
              id='serviceInterest'
              name='serviceInterest'
              value={formData.serviceInterest}
              onChange={handleChange}
              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-pink focus:border-transparent transition-colors'
            >
              <option value=''>Select a service</option>
              <option value='hosting'>Website Hosting & Migration</option>
              <option value='ad-campaigns'>Strategic Ad Campaigns</option>
              <option value='analytics'>Data Analytics & Insights</option>
              <option value='photography'>Photography Services</option>
              <option value='consultation'>General Consultation</option>
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor='message'
            className='block text-sm font-medium text-gray-700 mb-2'
          >
            Message <span className='text-gray-500'>(optional)</span>
          </label>
          <textarea
            id='message'
            name='message'
            value={formData.message}
            onChange={handleChange}
            rows={6}
            className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-pink focus:border-transparent transition-colors resize-vertical'
            placeholder='Tell us about your project and how we can help...'
          />
        </div>

        <button
          type='submit'
          disabled={isSubmitting}
          className='w-full bg-brand-pink text-white px-6 py-3 rounded-lg font-medium hover:bg-brand-pink2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-h-[48px]'
        >
          {isSubmitting ? (
            <>
              <svg
                className='animate-spin -ml-1 mr-3 h-5 w-5 text-white'
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
              >
                <circle
                  className='opacity-25'
                  cx='12'
                  cy='12'
                  r='10'
                  stroke='currentColor'
                  strokeWidth='4'
                ></circle>
                <path
                  className='opacity-75'
                  fill='currentColor'
                  d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                ></path>
              </svg>
              Sending...
            </>
          ) : (
            'Send Message'
          )}
        </button>

        <div className="mt-4 text-sm text-slate-500 text-center">
          <p><strong>Hours (UK time)</strong></p>
          <p>Monday to Friday: 09:00 – 18:00</p>
          <p>Saturday: 10:00 – 14:00</p>
          <p>Sunday: 10:00 – 16:00</p>
          <p className="mt-2">I personally reply to all enquiries the same day during these hours.</p>
          <p className="mt-2 font-medium">No spam or sales calls. I personally handle every enquiry.</p>
        </div>
      </form>
    </div>
  );
}
