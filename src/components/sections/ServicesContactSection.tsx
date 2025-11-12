"use client";

import Link from "next/link";
import { useState } from "react";

export default function ServicesContactSection() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch('https://formspree.io/f/xvgvkbjb', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        // GA4 conversion tracking
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'form_submission', {
            event_category: 'engagement',
            event_label: 'services_page_enquiry',
            value: 1
          });
        }

        // Redirect to thank-you page
        window.location.href = '/thank-you';
      } else {
        throw new Error('Form submission failed');
      }
    } catch (err) {
      setError('Something went wrong. Please try again or use the contact page.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-r from-pink-50 to-purple-50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          {/* Copy that guides people to the Contact page */}
          <div className="text-center lg:text-left">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Ready to Talk About Your Services?
            </h2>
            <p className="text-lg text-gray-700 mb-6">
              Whether you need faster hosting, a new website, better ads, or
              professional photography, let&apos;s talk about what will move
              the needle for your business.
            </p>
            <p className="text-base text-gray-600 mb-8">
              You can use the quick enquiry form here, or head to the contact
              page if you&apos;d like to share more detail about your project.
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-start gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-3 rounded-lg bg-pink-600 text-white text-base font-semibold shadow-lg hover:bg-pink-700 hover:shadow-xl transition"
              >
                Go to Contact Page
                <svg
                  className="ml-2 h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>

              <p className="text-sm text-gray-500 sm:ml-2">
                Prefer to stay here? Send a quick message below.
              </p>
            </div>
          </div>

          {/* Formspree form, styled like your contact form */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 sm:p-8">
            {isSubmitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Message Sent!</h3>
                <p className="text-gray-600 mb-4">
                  Thanks for your enquiry. I'll get back to you the same day with ideas, options, and next steps.
                </p>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="text-pink-600 hover:text-pink-700 font-medium"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Quick Services Enquiry
                </h3>
                <p className="text-neutral-600 mb-6">
                  Tell me a bit about your website plans, and I'll personally get back to you the same day with ideas and next steps.
                </p>

                <form
                  onSubmit={handleSubmit}
                  className="space-y-6"
                  method="POST"
                  action="https://formspree.io/f/xvgvkbjb"
                >
                  {/* Hidden field so you know it came from the Services page */}
                  <input type="hidden" name="source" value="Services page" />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="fullName"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        required
                        disabled={isSubmitting}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                        placeholder="Your full name"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        disabled={isSubmitting}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Phone (optional)
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        disabled={isSubmitting}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                        placeholder="+44 ..."
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="serviceInterest"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Service Interest
                      </label>
                      <select
                        id="serviceInterest"
                        name="serviceInterest"
                        disabled={isSubmitting}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                        defaultValue=""
                      >
                        <option value="" disabled>
                          Select a service
                        </option>
                        <option value="Website Hosting & Migration">
                          Website Hosting &amp; Migration
                        </option>
                        <option value="Website Design & Development">
                          Website Design &amp; Development
                        </option>
                        <option value="Strategic Ad Campaigns">
                          Strategic Ad Campaigns
                        </option>
                        <option value="Data Analytics & Insights">
                          Data Analytics &amp; Insights
                        </option>
                        <option value="Photography Services">
                          Photography Services
                        </option>
                        <option value="Other">Something else</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Project details *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={4}
                      disabled={isSubmitting}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                      placeholder="Tell me about your website, hosting, photography, or ad campaign goals..."
                    />
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex justify-center items-center rounded-lg bg-pink-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-pink-700 hover:shadow-xl transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </>
                    ) : (
                      'Send Services Enquiry'
                    )}
                  </button>

                  <div className="mt-4 text-sm text-slate-500 text-center">
                    <p><strong>Hours (UK time)</strong></p>
                    <p>Monday to Friday: 09:00 to 18:00</p>
                    <p>Saturday: 10:00 to 14:00</p>
                    <p>Sunday: 10:00 to 16:00</p>
                    <p>I personally reply to all enquiries the same day during these hours.</p>
                  </div>

                  <p className="text-xs text-gray-400 text-center mt-4">
                    This form is powered by Formspree. By submitting, you agree to
                    be contacted about your enquiry.
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
