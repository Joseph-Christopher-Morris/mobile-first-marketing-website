"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export default function Conversion() {
  useEffect(() => {
    const KEY = "vmc_thankyou_conv_fired";
    if (sessionStorage.getItem(KEY)) return;

    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      // GA4 analytics event
      window.gtag("event", "lead_form_submit", {
        page_path: window.location.pathname
      });

      // Google Ads conversion
      window.gtag("event", "conversion", {
        send_to: "AW-17708257497/AtMkCIiD1r4bENmh-vtB"
      });

      sessionStorage.setItem(KEY, "1");
    }
  }, []);

  return null;
}
