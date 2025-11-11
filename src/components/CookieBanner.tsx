"use client";

import { useState, useEffect } from "react";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      // Small delay to ensure smooth animation
      setTimeout(() => {
        setVisible(true);
        setIsAnimating(true);
      }, 500);
    }
  }, []);

  const handleConsent = (choice: "accepted" | "rejected") => {
    localStorage.setItem("cookieConsent", choice);
    localStorage.setItem("cookieConsentDate", new Date().toISOString());

    // Trigger analytics reload if accepted
    if (choice === "accepted" && typeof window !== "undefined") {
      // Reload GA4 if consent was given
      if (window.gtag) {
        window.gtag("consent", "update", {
          analytics_storage: "granted"
        });
      }
    }

    setIsAnimating(false);
    setTimeout(() => setVisible(false), 300);
  };

  const reopenBanner = () => {
    setVisible(true);
    setIsAnimating(true);
  };

  // Expose function globally for footer link
  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).reopenCookieBanner = reopenBanner;
    }
  }, []);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent banner"
      aria-describedby="cookie-description"
      className={`fixed bottom-0 left-0 w-full bg-slate-50 border-t border-slate-200 p-4 md:p-6 text-slate-700 shadow-lg z-50 transition-all duration-300 ${
        isAnimating ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
      }`}
    >
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex-1">
          <p id="cookie-description" className="text-sm md:text-base leading-relaxed">
            We use essential cookies to make our site work and analytics cookies to improve your experience.{" "}
            <a
              href="/privacy-policy"
              className="underline text-pink-500 hover:text-pink-600 transition-colors"
              aria-label="Read the Vivid Media Cheshire privacy policy about cookie usage"
            >
              Read our Privacy Policy
            </a>
            .
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <button
            onClick={() => handleConsent("rejected")}
            className="border border-slate-300 px-4 py-2 rounded-md text-sm font-medium hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 min-h-[44px]"
            aria-label="Reject non-essential cookies"
          >
            Reject Non-Essential
          </button>
          <button
            onClick={() => handleConsent("accepted")}
            className="bg-pink-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-pink-600 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 min-h-[44px]"
            aria-label="Accept all cookies including analytics"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
