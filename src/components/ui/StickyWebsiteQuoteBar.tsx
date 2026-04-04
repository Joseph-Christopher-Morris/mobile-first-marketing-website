"use client";

import { useEffect, useState } from "react";

export function StickyWebsiteQuoteBar() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsVisible(window.scrollY > 280);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToForm = () => {
    const target = document.getElementById("website-quote");
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 md:hidden">
      <div className="mx-auto max-w-3xl px-4 pb-4">
        <button
          onClick={scrollToForm}
          className="w-full rounded-full bg-pink-600 px-6 py-3 text-white text-base font-semibold shadow-lg hover:bg-pink-700 focus-visible:ring-2 focus-visible:ring-pink-400 transition"
        >
          Get My Website Quote
        </button>
      </div>
    </div>
  );
}
