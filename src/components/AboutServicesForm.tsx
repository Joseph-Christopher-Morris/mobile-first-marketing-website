"use client";

import { useState } from "react";

interface AboutServicesFormProps {
  formspreeId: string;
}

export function AboutServicesForm({ formspreeId }: AboutServicesFormProps) {
  const [status, setStatus] =
    useState<"idle" | "submitting" | "success" | "error">("idle");

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setStatus("submitting");

    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch(`https://formspree.io/f/${formspreeId}`, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });

      if (res.ok) {
        setStatus("success");
        form.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className="mt-12 border border-slate-200 rounded-xl p-6 md:p-8 bg-white shadow-sm">
      <h2 className="text-2xl font-semibold mb-2">
        Let&apos;s Find the Right Service for You
      </h2>
      <p className="text-sm text-slate-600 mb-6">
        Tell me what you&apos;re interested in and I&apos;ll recommend the best mix
        of services for your business.
      </p>

      {status === "success" && (
        <div className="mb-4 rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
          Thank you! Your message has been sent. I&apos;ll be in touch soon with tailored suggestions.
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
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink focus:border-brand-pink"
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
            pattern="[0-9\s\+\-\(\)]+"
            placeholder="07XXX XXXXXX"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink focus:border-brand-pink"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            What are you interested in?
          </label>
          <div className="grid md:grid-cols-2 gap-2 text-sm text-slate-700">
            <label className="flex items-center gap-2">
              <input type="checkbox" name="services[]" value="Website Hosting & Migration" />
              <span>Website Hosting &amp; Migration</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="services[]" value="Website Design & Development" />
              <span>Website Design &amp; Development</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="services[]" value="Photography" />
              <span>Photography</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="services[]" value="Data Analytics & Insights" />
              <span>Data Analytics &amp; Insights</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="services[]" value="Strategic Ad Campaigns" />
              <span>Strategic Ad Campaigns</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Tell me about your business *
          </label>
          <textarea
            name="message"
            rows={4}
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink focus:border-brand-pink"
            placeholder="What are you trying to improve? Website, leads, performance, etc."
          />
        </div>

        <div className="flex items-start gap-2">
          <input
            id="about-consent"
            name="gdpr_consent"
            type="checkbox"
            required
            className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-pink focus:ring-brand-pink"
          />
          <label htmlFor="about-consent" className="text-xs text-slate-600">
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
      </form>
    </section>
  );
}
