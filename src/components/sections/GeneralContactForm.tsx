'use client';

import { useState } from 'react';
import { submitContactForm, FormSubmissionResult } from '@/lib/form-handler';
import Analytics from '@/lib/analytics';

interface FormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  subject: string;
  service: string;
  message: string;
}

interface FormErrors {
  [key: string]: string;
}

export function GeneralContactForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    subject: '',
    service: '',
    message: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] =
    useState<FormSubmissionResult | null>(null);

  const services = [
    'Photography Services',
    'Data Analytics & Insights',
    'Strategic Ad Campaigns',
    'General Inquiry',
    'Other',
  ];

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Clear submission result when user starts editing
    if (submissionResult) {
      setSubmissionResult(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    setErrors({});
    setSubmissionResult(null);

    try {
      const result = await submitContactForm(formData);
      setSubmissionResult(result);

      if (result.success) {
        // Track successful form submission
        Analytics.trackFormSubmission('general_contact', {
          service: formData.service,
          submission_id: result.submissionId,
        });

        // Reset form on successful submission
        setFormData({
          name: '',
          email: '',
          phone: '',
          company: '',
          subject: '',
          service: '',
          message: '',
        });
      } else if (result.errors) {
        // Set field-specific errors
        const fieldErrors: FormErrors = {};
        result.errors.forEach(error => {
          fieldErrors[error.field] = error.message;
        });
        setErrors(fieldErrors);
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmissionResult({
        success: false,
        message: 'An unexpected error occurred. Please try again later.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show success message
  if (submissionResult?.success) {
    return (
      <div className='bg-green-50 border border-green-200 rounded-lg p-8 text-center'>
        <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
          <svg
            className='w-8 h-8 text-green-600'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M5 13l4 4L19 7'
            />
          </svg>
        </div>
        <h3 className='text-xl font-bold text-green-900 mb-2'>Thank You!</h3>
        <p className='text-green-700 mb-4'>{submissionResult.message}</p>
        {submissionResult.submissionId && (
          <p className='text-sm text-green-600 mb-4'>
            Reference ID: {submissionResult.submissionId}
          </p>
        )}
        <button
          onClick={() => {
            setSubmissionResult(null);
            setFormData({
              name: '',
              email: '',
              phone: '',
              company: '',
              subject: '',
              service: '',
              message: '',
            });
          }}
          className='text-green-600 hover:text-green-700 font-medium transition-colors'
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <div className='bg-white border border-gray-200 rounded-lg p-8'>
      <div className='mb-6'>
        <h2 className='text-2xl font-bold text-gray-900 mb-2'>
          Send us a Message
        </h2>
        <p className='text-gray-600'>
          We&apos;d love to hear from you. Send us a message and we&apos;ll
          respond as soon as possible.
        </p>
      </div>

      <form onSubmit={handleSubmit} className='space-y-6'>
        {/* Personal Information */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div>
            <label
              htmlFor='name'
              className='block text-sm font-medium text-gray-700 mb-2'
            >
              Full Name *
            </label>
            <input
              type='text'
              id='name'
              name='name'
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder='Enter your full name'
            />
            {errors.name && (
              <p className='mt-1 text-sm text-red-600'>{errors.name}</p>
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
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.email ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder='Enter your email address'
            />
            {errors.email && (
              <p className='mt-1 text-sm text-red-600'>{errors.email}</p>
            )}
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div>
            <label
              htmlFor='phone'
              className='block text-sm font-medium text-gray-700 mb-2'
            >
              Phone Number (Optional)
            </label>
            <input
              type='tel'
              id='phone'
              name='phone'
              value={formData.phone}
              onChange={handleInputChange}
              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors'
              placeholder='Enter your phone number'
            />
          </div>

          <div>
            <label
              htmlFor='company'
              className='block text-sm font-medium text-gray-700 mb-2'
            >
              Company (Optional)
            </label>
            <input
              type='text'
              id='company'
              name='company'
              value={formData.company}
              onChange={handleInputChange}
              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors'
              placeholder='Enter your company name'
            />
          </div>
        </div>

        {/* Inquiry Details */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div>
            <label
              htmlFor='service'
              className='block text-sm font-medium text-gray-700 mb-2'
            >
              Service Interest (Optional)
            </label>
            <select
              id='service'
              name='service'
              value={formData.service}
              onChange={handleInputChange}
              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors'
            >
              <option value=''>Select a service</option>
              {services.map(service => (
                <option key={service} value={service}>
                  {service}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor='subject'
              className='block text-sm font-medium text-gray-700 mb-2'
            >
              Subject *
            </label>
            <input
              type='text'
              id='subject'
              name='subject'
              value={formData.subject}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.subject ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder='Enter message subject'
            />
            {errors.subject && (
              <p className='mt-1 text-sm text-red-600'>{errors.subject}</p>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor='message'
            className='block text-sm font-medium text-gray-700 mb-2'
          >
            Message *
          </label>
          <textarea
            id='message'
            name='message'
            rows={6}
            value={formData.message}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-vertical ${
              errors.message ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder='Tell us how we can help you...'
          />
          {errors.message && (
            <p className='mt-1 text-sm text-red-600'>{errors.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <div>
          {/* Global error message */}
          {submissionResult && !submissionResult.success && (
            <div className='mb-4 p-4 bg-red-50 border border-red-200 rounded-lg'>
              <div className='flex items-start space-x-3'>
                <div className='flex-shrink-0'>
                  <svg
                    className='w-5 h-5 text-red-600 mt-0.5'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                </div>
                <div>
                  <h4 className='text-sm font-medium text-red-800'>
                    Submission Failed
                  </h4>
                  <p className='text-sm text-red-700 mt-1'>
                    {submissionResult.message}
                  </p>
                </div>
              </div>
            </div>
          )}

          <button
            type='submit'
            disabled={isSubmitting}
            className={`w-full px-6 py-4 bg-blue-600 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 min-h-[56px] ${
              isSubmitting
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? (
              <span className='flex items-center justify-center'>
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
                Sending Message...
              </span>
            ) : (
              'Send Message'
            )}
          </button>
        </div>

        <div className='text-center text-sm text-gray-500'>
          <p>
            By submitting this form, you agree to our{' '}
            <a href='/privacy' className='text-blue-600 hover:text-blue-700'>
              Privacy Policy
            </a>{' '}
            and{' '}
            <a href='/terms' className='text-blue-600 hover:text-blue-700'>
              Terms of Service
            </a>
            .
          </p>
        </div>
      </form>
    </div>
  );
}
