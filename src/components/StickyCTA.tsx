"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Phone, Calendar, Mail, FileText, BarChart, Megaphone, DollarSign, BookOpen, User, Send } from "lucide-react";

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

  const getCTAConfig = () => {
    if (pathname?.includes("/services/hosting")) return { text: "Get Hosting Quote", icon: FileText };
    if (pathname?.includes("/services/website-design")) return { text: "Build My Website", icon: FileText };
    if (pathname?.includes("/services/photography")) return { text: "Book Your Shoot", icon: Calendar };
    if (pathname?.includes("/services/analytics")) return { text: "View My Data Options", icon: BarChart };
    if (pathname?.includes("/services/ad-campaigns")) return { text: "Start My Campaign", icon: Megaphone };
    if (pathname?.includes("/pricing")) return { text: "See Pricing Options", icon: DollarSign };
    if (pathname?.includes("/blog")) return { text: "Read Case Studies", icon: BookOpen };
    if (pathname?.includes("/about")) return { text: "Work With Me", icon: User };
    if (pathname?.includes("/contact")) return { text: "Send Message", icon: Send };
    return { text: "Book Your Consultation", icon: Calendar };
  };

  const getPageType = () => {
    if (pathname?.includes("/services/hosting")) return "hosting";
    if (pathname?.includes("/services/website-design")) return "design";
    if (pathname?.includes("/services/photography")) return "photography";
    if (pathname?.includes("/services/analytics")) return "analytics";
    if (pathname?.includes("/services/ad-campaigns")) return "ads";
    if (pathname?.includes("/pricing")) return "pricing";
    if (pathname?.includes("/blog")) return "blog";
    if (pathname?.includes("/about")) return "about";
    if (pathname?.includes("/contact")) return "contact";
    if (pathname === "/") return "home";
    return "other";
  };

  const handleCallClick = () => {
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("event", "cta_call_click", {
        cta_text: "Call Joe",
        page_path: pathname,
        page_type: getPageType(),
      });
    }
  };

  const handleFormClick = () => {
    const config = getCTAConfig();
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("event", "cta_form_click", {
        cta_text: config.text,
        page_path: pathname,
        page_type: getPageType(),
      });
    }

    const form = document.querySelector("#contact");
    form?.scrollIntoView({ behavior: "smooth" });
  };

  if (!isVisible || shouldHide) return null;

  const config = getCTAConfig();
  const Icon = config.icon;

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
            className="flex items-center justify-center gap-2 bg-white text-black px-6 py-3 rounded-lg font-semibold text-sm min-h-[44px] hover:bg-gray-100 transition-colors"
            aria-label="Call Joe"
          >
            <Phone className="w-5 h-5" />
            Call Joe
          </a>
          <button
            onClick={handleFormClick}
            className="flex items-center justify-center gap-2 bg-[#FF2B6A] text-white px-6 py-3 rounded-lg font-semibold text-sm min-h-[44px] hover:bg-[#E02560] transition-colors"
            aria-label={config.text}
          >
            <Icon className="w-5 h-5" />
            {config.text}
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
                className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-lg font-semibold text-sm min-h-[44px] hover:bg-gray-100 transition-colors shadow-md"
                aria-label="Call Joe"
              >
                <Phone className="w-5 h-5" />
                Call Joe
              </a>
              <button
                onClick={handleFormClick}
                className="flex items-center gap-2 bg-[#FF2B6A] text-white px-6 py-3 rounded-lg font-semibold text-sm min-h-[44px] hover:bg-[#E02560] transition-colors shadow-md"
                aria-label={config.text}
              >
                <Icon className="w-5 h-5" />
                {config.text}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
