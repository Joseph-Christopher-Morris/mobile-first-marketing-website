"use client";

import { useState } from "react";

interface ServiceInquiryFormProps {
  serviceName: string;
  formspreeId: string; // e.g. "xyzabcd"
  customMessage?: string;
}

export function ServiceInquiryForm({
  serviceName,
  formspreeId,
  customMessage,
}: ServiceInquiryFormProps) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setStatus("submitting");

    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch(`https://formspree.io/f/${formspreeId}`, {
        method: "POST",
        body: data,
        headers: {
          Accept: "application/json",
        },
      });

      if (res.ok) {
        // Redirect to thank you page
        window.location.href = '/thank-you';
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  const consentId = `consent-${serviceName.replace(/\s+/g, "-").toLowerCase()}`;

  // Default messages by service type
  const getDefaultMessage = () => {
    if (serviceName.toLowerCase().includes('hosting')) {
      return "Tell me a bit about your website plans, and I'll personally get back to you the same day with ideas and next steps.";
    } else if (serviceName.toLowerCase().includes('design')) {
      return "Share your vision, and I'll reply personally the same day with feedback and a plan to get started.";
    } else if (serviceName.toLowerCase().includes('photography')) {
      return "Let me know what you'd like to capture, and I'll get back to you the same day to plan your shoot.";
    } else if (serviceName.toLowerCase().includes('analytics') || serviceName.toLowerCase().includes('data')) {
      return "Send over a few details about your data goals, and I'll personally reply the same day to discuss how I can help.";
    } else if (serviceName.toLowerCase().includes('ad') || serviceName.toLowerCase().includes('campaign')) {
      return "Tell me about your business goals, and I'll personally reply the same day with ideas to boost your reach.";
    }
    return "Share your vision, and I'll reply personally the same day with feedback and a plan to get started.";
  };

  // Get heading based on service type
  const getHeading = () => {
    if (serviceName.toLowerCase().includes('ad') || serviceName.toLowerCase().includes('campaign')) {
      return "Start My Google Ads Campaign";
    }
    return `Enquire About ${serviceName}`;
  };

  return (
    <section className="mt-12 border border-slate-200 rounded-xl p-6 md:p-8 bg-white shadow-sm">
      <h2 className="text-2xl font-semibold mb-2">
        {getHeading()}
      </h2>
      <p className="text-neutral-600 mb-6">
        {customMessage || getDefaultMessage()}
      </p>

      {status === "success" && (
        <div className="mb-4 rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
          Thank you! Your message has been sent. I&apos;ll be in touch soon.
        </div>
      )}

      {status === "error" && (
        <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
          Something went wrong. Please try again or email{" "}
          <a href="mailto:joe@vividmediacheshire.com" className="underline">
            joe@vividmediacheshire.com
          </a>
          .
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Hidden service name */}
        <input type="hidden" name="service_name" value={serviceName} />

        {/* Hidden page URL */}
        <input
          type="hidden"
          name="page_url"
          value={typeof window !== "undefined" ? window.location.href : ""}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Name *
            </label>
            <input
              name="name"
              type="text"
              required
              autoComplete="name"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink focus:border-brand-pink"
              onFocus={() => {
                if (typeof window !== 'undefined' && window.gtag) {
                  window.gtag('event', 'cta_form_input', {
                    page_path: window.location.pathname,
                    service_name: serviceName,
                    field_name: 'name'
                  });
                }
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email *
            </label>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink focus:border-brand-pink"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            UK Mobile Number *
          </label>
          <input
            name="phone"
            type="tel"
            required
            autoComplete="tel"
            pattern="[0-9\s\+\-\(\)]+"
            placeholder="07XXX XXXXXX"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink focus:border-brand-pink"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Project details *
          </label>
          <textarea
            name="message"
            rows={4}
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink focus:border-brand-pink"
            placeholder={`Tell me about your ${serviceName.toLowerCase()} needs, goals, and timeline.`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Budget (optional)
          </label>
          <input
            name="budget"
            type="text"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink focus:border-brand-pink"
            placeholder="e.g. £500–£1,500 or approximate range"
          />
        </div>

        <div className="flex items-start gap-2">
          <input
            id={consentId}
            name="gdpr_consent"
            type="checkbox"
            required
            className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-pink focus:ring-brand-pink"
          />
          <label htmlFor={consentId} className="text-xs text-slate-600">
            I agree to Vivid Media Cheshire storing and processing my data for the
            purposes of responding to this enquiry. I have read the{" "}
            <a href="/privacy-policy" className="underline" aria-label="Read our Privacy Policy to understand how we handle your data">
              Privacy Policy
            </a>
            .
          </label>
        </div>

        <button
          type="submit"
          disabled={status === "submitting"}
          className="inline-flex items-center justify-center rounded-md bg-brand-pink px-4 py-2 text-sm font-medium text-white hover:bg-brand-pink2 focus:outline-none focus:ring-2 focus:ring-brand-pink focus:ring-offset-2 disabled:opacity-60"
        >
          {status === "submitting" ? "Sending..." : "Send Enquiry"}
        </button>

        <div className="mt-4 text-sm text-slate-500 text-center">
          <p><strong>Hours (UK time)</strong></p>
          <p>Monday to Friday: 09:00 to 18:00</p>
          <p>Saturday: 10:00 to 14:00</p>
          <p>Sunday: 10:00 to 16:00</p>
          <p>I personally reply to all enquiries the same day during these hours.</p>
        </div>
      </form>
    </section>
  );
}
