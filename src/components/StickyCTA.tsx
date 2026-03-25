"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Mail } from "lucide-react";

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export default function StickyCTA() {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();

  // Hide sticky CTA on contact page
  const shouldHide = pathname === '/contact';

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getPageType = () => {
    if (pathname.startsWith("/services/website-design")) return "website_design";
    if (pathname.startsWith("/services/website-hosting")) return "website_hosting";
    if (pathname.startsWith("/services/website-hosting")) return "website_hosting";
    if (pathname.startsWith("/services/ad-campaigns")) return "ad_campaigns";
    if (pathname.startsWith("/services/analytics")) return "analytics";
    if (pathname.startsWith("/services/photography")) return "photography";
    if (pathname.startsWith("/services")) return "services";
    if (pathname.startsWith("/pricing")) return "pricing";
    if (pathname.startsWith("/blog")) return "blog";
    if (pathname.startsWith("/about")) return "about";
    if (pathname.startsWith("/contact")) return "contact";
    if (pathname.startsWith("/thank-you")) return "thank_you";
    if (pathname === "/") return "home";
    return "other";
  };

  const pageType = getPageType();

  const primaryLabel = {
    home: "Send me your website",
    services: "Send me your website",
    website_design: "Send me your website",
    website_hosting: "Send me your website",
    ad_campaigns: "Send me your website",
    analytics: "Send me your website",
    photography: "Book your photoshoot",
    pricing: "Send me your website",
    blog: "Send me your website",
    about: "Send me your website",
    contact: "Send me your website",
    thank_you: "Send me your website",
    other: "Send me your website",
  }[pageType];

  const secondaryLabel = {
    home: "Email me directly",
    services: "Email me directly",
    website_design: "Email me directly",
    website_hosting: "Email me directly",
    ad_campaigns: "Email me directly",
    analytics: "Email me directly",
    photography: "View portfolio",
    pricing: "Email me directly",
    blog: "Email me directly",
    about: "Email me directly",
    contact: "Email me directly",
    thank_you: "Email me directly",
    other: "Email me directly",
  }[pageType];

  const handleCTAClick = () => {
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("event", "sticky_cta_click", {
        page_path: pathname,
        page_type: pageType,
        cta_variant: "primary",
      });
    }
  };

  const primaryHref = pageType === "photography" ? "/services/photography/#contact" : "/contact/";

  if (!isVisible || shouldHide) return null;

  return (
    <>
      <style jsx>{`
        @keyframes slideInUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .sticky-cta {
          animation: slideInUp 0.45s ease-out;
        }
      `}</style>

      {/* Mobile Design */}
      <div className="sticky-cta fixed bottom-0 left-0 right-0 z-50 bg-black p-4 md:hidden">
        <p className="text-white text-center text-sm mb-3 font-medium">
          Not getting enquiries from your website?
        </p>
        <div className="flex flex-col gap-2">
          <a
            href={primaryHref}
            onClick={handleCTAClick}
            className="flex items-center justify-center gap-2 bg-[#FF2B6A] text-white px-6 py-3 rounded-lg font-semibold text-sm min-w-[44px] min-h-[48px] hover:bg-[#E02560] transition-colors"
            aria-label={primaryLabel}
          >
            {primaryLabel}
          </a>
          <a
            href="mailto:joe@vividmediacheshire.com"
            className="flex items-center justify-center gap-2 bg-white text-black px-6 py-3 rounded-lg font-semibold text-sm min-w-[44px] min-h-[48px] hover:bg-gray-100 transition-colors"
            aria-label={secondaryLabel}
          >
            <Mail className="w-5 h-5" />
            {secondaryLabel}
          </a>
        </div>
      </div>

      {/* Desktop Design */}
      <div className="sticky-cta hidden md:block fixed bottom-0 left-0 right-0 z-50 bg-black">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-center gap-6">
            <p className="text-white text-lg font-medium">
              Not getting enquiries from your website?
            </p>
            <div className="flex gap-3">
              <a
                href={primaryHref}
                onClick={handleCTAClick}
                className="flex items-center gap-2 bg-[#FF2B6A] text-white px-6 py-3 rounded-lg font-semibold text-sm min-w-[44px] min-h-[44px] hover:bg-[#E02560] transition-colors shadow-md"
                aria-label={primaryLabel}
              >
                {primaryLabel}
              </a>
              <a
                href="mailto:joe@vividmediacheshire.com"
                className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-lg font-semibold text-sm min-w-[44px] min-h-[44px] hover:bg-gray-100 transition-colors shadow-md"
                aria-label={secondaryLabel}
              >
                <Mail className="w-5 h-5" />
                {secondaryLabel}
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
