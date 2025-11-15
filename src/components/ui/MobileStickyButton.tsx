"use client";

import { useState, useEffect } from "react";

export default function MobileStickyButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Show button when user has scrolled 60% of the page
      const scrollPercentage = (scrolled + windowHeight) / documentHeight;
      setIsVisible(scrollPercentage > 0.6);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToForm = () => {
    const formElement = document.getElementById('form');
    if (formElement) {
      formElement.scrollIntoView({
        behaviour: 'smooth',
        block: 'start'
      });
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:hidden">
      <button
        onClick={scrollToForm}
        className="w-full bg-pink-600 text-white px-6 py-4 rounded-lg font-semibold shadow-lg hover:bg-pink-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
      >
        Get a Free Quote
        <svg className="ml-2 w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </button>
    </div>
  );
}
