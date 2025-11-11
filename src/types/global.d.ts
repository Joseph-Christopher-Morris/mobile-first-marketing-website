// Global type declarations for the application

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
    reopenCookieBanner?: () => void;
  }
}

export {};
