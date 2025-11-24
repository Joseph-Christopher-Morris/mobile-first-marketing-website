'use client';

import { X } from 'lucide-react';
import Link from 'next/link';

interface ExitIntentPopupProps {
  show: boolean;
  onClose: () => void;
}

export function ExitIntentPopup({ show, onClose }: ExitIntentPopupProps) {
  if (!show) return null;
  
  const handleCTAClick = () => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exit_intent_cta_click', {
        cta_text: 'Get Free Website Audit',
        page_path: window.location.pathname
      });
    }
  };
  
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative mx-4 max-w-md rounded-lg bg-white p-8 shadow-2xl border border-gray-200">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
          aria-label="Close popup"
        >
          <X className="h-6 w-6" />
        </button>
        
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">
            Wait! Before You Go...
          </h2>
          
          <p className="mb-6 text-gray-600">
            Get a <strong>free 10-point website audit</strong> and discover how your site performs against Cheshire competitors.
          </p>
          
          <div className="space-y-3">
            <Link
              href="/free-audit"
              onClick={handleCTAClick}
              className="block w-full rounded-lg bg-pink-600 px-6 py-3 text-center font-semibold text-white hover:bg-pink-700 transition-colors shadow-md hover:shadow-lg"
            >
              Get Your Free Audit
            </Link>
            
            <button
              onClick={onClose}
              className="block w-full text-sm text-gray-500 hover:text-gray-700"
            >
              No thanks, I'll pass
            </button>
          </div>
          
          <p className="mt-4 text-xs text-gray-400">
            No obligation • Cheshire-focused insights
          </p>
        </div>
      </div>
    </div>
  );
}
