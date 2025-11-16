"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Phone,
  BarChart3,
  LayoutTemplate,
  Server,
  Target,
  LineChart,
  Camera,
  User,
  Mail,
} from "lucide-react";
import { trackPhoneClick } from "@/lib/trackPhone";

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export default function StickyCTA() {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

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
    if (pathname.startsWith("/services/hosting")) return "website_hosting";
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
    home: "Call About Your Project",
    services: "Call About Your Project",
    website_design: "Call about Website Design",
    website_hosting: "Call about Website Hosting",
    ad_campaigns: "Call About Ad Campaigns",
    analytics: "Call about Analytics",
    photography: "Call about Photography",
    pricing: "Call for a Quote",
    blog: "Call Joe",
    about: "Call Joe",
    contact: "Call Joe",
    thank_you: "Call Joe",
    other: "Call Joe",
  }[pageType];

  const secondaryLabel = {
    home: "Book Your Consultation",
    services: "Send Your Project Details",
    website_design: "Request a Website Quote",
    website_hosting: "Request a Speed Review",
    ad_campaigns: "Request a Free Ad Plan",
    analytics: "Request a Tracking Setup",
    photography: "Check Photography Availability",
    pricing: "Request a Quote",
    blog: "Ask a Question",
    about: "Send a Message to Joe",
    contact: "Fill Out the Form Below",
    thank_you: "Return to Homepage",
    other: "Send an Enquiry",
  }[pageType];

  const getSecondaryIcon = () => {
    switch (pageType) {
      case "website_design":
        return LayoutTemplate;
      case "website_hosting":
        return Server;
      case "ad_campaigns":
        return Target;
      case "analytics":
        return LineChart;
      case "photography":
        return Camera;
      case "about":
        return User;
      case "contact":
      case "thank_you":
        return Mail;
      case "home":
      case "services":
      case "pricing":
      case "blog":
      case "other":
      default:
        return BarChart3;
    }
  };

  const SecondaryIcon = getSecondaryIcon();

  const handleCallClick = () => {
    trackPhoneClick("call_joe_sticky");
    
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("event", "sticky_cta_click", {
        page_path: pathname,
        page_type: pageType,
        cta_variant: "call",
      });
    }
  };

  const handleFormClick = () => {
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("event", "sticky_cta_click", {
        page_path: pathname,
        page_type: pageType,
        cta_variant: "form",
      });
    }

    if (pageType === "thank_you") {
      router.push("/");
      return;
    }

    router.push("/contact");
  };

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
          Ready to grow your business?
        </p>
        <div className="flex flex-col gap-2">
          <a
            href="tel:+447586378502"
            onClick={handleCallClick}
            className="flex items-center justify-center gap-2 bg-[#FF2B6A] text-white px-6 py-3 rounded-lg font-semibold text-sm min-h-[48px] hover:bg-[#E02560] transition-colors"
            aria-label={`Call Joe about ${pageType.replace('_', ' ')}`}
          >
            <Phone className="w-5 h-5" />
            {primaryLabel}
          </a>
          <button
            onClick={handleFormClick}
            className="flex items-center justify-center gap-2 bg-white text-black px-6 py-3 rounded-lg font-semibold text-sm min-h-[48px] hover:bg-gray-100 transition-colors"
            aria-label={secondaryLabel}
          >
            <SecondaryIcon className="w-5 h-5" />
            {secondaryLabel}
          </button>
        </div>
      </div>

      {/* Desktop Design */}
      <div className="sticky-cta hidden md:block fixed bottom-0 left-0 right-0 z-50 bg-black">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-center gap-6">
            <p className="text-white text-lg font-medium">
              Ready to grow your business?
            </p>
            <div className="flex gap-3">
              <a
                href="tel:+447586378502"
                onClick={handleCallClick}
                className="flex items-center gap-2 bg-[#FF2B6A] text-white px-6 py-3 rounded-lg font-semibold text-sm min-h-[44px] hover:bg-[#E02560] transition-colors shadow-md"
                aria-label={`Call Joe about ${pageType.replace('_', ' ')}`}
              >
                <Phone className="w-5 h-5" />
                {primaryLabel}
              </a>
              <button
                onClick={handleFormClick}
                className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-lg font-semibold text-sm min-h-[44px] hover:bg-gray-100 transition-colors shadow-md"
                aria-label={secondaryLabel}
              >
                <SecondaryIcon className="w-5 h-5" />
                {secondaryLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
