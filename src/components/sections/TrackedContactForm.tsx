"use client";

import { useState, ChangeEvent, FormEvent } from "react";

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

interface FormData {
  name: string;
  email: string;
  mobile: string;
  service: string;
  message: string;
}

interface TrackedContactFormProps {
  formId?: string;
  formspreeId: string;
  buttonText?: string;
  serviceOptions?: string[];
}

export default function TrackedContactForm({
  formId = "contact_form",
  formspreeId,
  buttonText = "Send Enquiry",
  serviceOptions = [
    "Website Hosting & Migration",
    "Website Design & Development",
    "Photography Services",
    "Data Analytics & Insights",
    "Strategic Ad Campaigns",
  ],
}: TrackedContactFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    mobile: "",
    service: "",
    message: "",
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Track form input (only non-sensitive fields)
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      const safeValue = name === "service" ? value : undefined;

      window.gtag("event", "cta_form_input", {
        field_name: name,
        field_value: safeValue,
        page_path: window.location.pathname,
        form_id: formId,
      });
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    // Track form submission
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("event", "lead_form_submit", {
        page_path: window.location.pathname,
        service: formData.service || "not_specified",
        form_id: formId,
      });
    }
    // Allow normal Formspree submission to continue
  };

  return (
    <form
      action={`https://formspree.io/f/${formspreeId}`}
      method="POST"
      onSubmit={handleSubmit}
      className="space-y-4 max-w-2xl mx-auto"
      id="contact"
    >
      <input type="hidden" name="_redirect" value="https://vividmediacheshire.com/thank-you" />
      
      <div>
        <label htmlFor="name" className="sr-only">
          Full Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          placeholder="Full Name *"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      <div>
        <label htmlFor="email" className="sr-only">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          name="email"
          placeholder="Email Address *"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      <div>
        <label htmlFor="mobile" className="sr-only">
          UK Mobile Number
        </label>
        <input
          type="tel"
          id="mobile"
          name="mobile"
          placeholder="UK Mobile Number *"
          value={formData.mobile}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      <div>
        <label htmlFor="service" className="sr-only">
          Service Interest
        </label>
        <select
          id="service"
          name="service"
          value={formData.service}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
        >
          <option value="">Service Interest *</option>
          {serviceOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="message" className="sr-only">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          placeholder="Tell me about your website, hosting, or goals..."
          value={formData.message}
          onChange={handleChange}
          rows={5}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-all duration-200"
      >
        {buttonText}
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
  );
}
