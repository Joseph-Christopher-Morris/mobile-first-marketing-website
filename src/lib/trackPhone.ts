/**
 * Track phone click conversions for Google Ads
 * Call this function whenever a user clicks a phone link
 */
export function trackPhoneClick(label?: string) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    // GA4 analytics event
    window.gtag("event", "phone_click", {
      page_path: window.location.pathname,
      link_label: label || "tel_click"
    });
    
    // Google Ads conversion
    window.gtag("event", "conversion", {
      send_to: "AW-17708257497/AtMkCIiD1r4bENmh-vtB"
    });
  }
}
