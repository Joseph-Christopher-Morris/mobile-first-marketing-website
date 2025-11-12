export function trackPhoneClick(label?: string) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", "phone_click", {
      page_path: window.location.pathname,
      link_label: label || "tel_click"
    });
    window.gtag("event", "conversion", {
      send_to: "AW-17708257497/AtMkCIiD1r4bENmh-vtB"
    });
  }
}
