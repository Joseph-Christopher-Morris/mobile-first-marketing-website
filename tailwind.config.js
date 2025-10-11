/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './content/**/*.{md,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx}',
  ],
  // Enable CSS purging in production
  purge: {
    enabled: process.env.NODE_ENV === 'production',
    content: ['./src/**/*.{js,ts,jsx,tsx,mdx}', './content/**/*.{md,mdx}'],
    options: {
      safelist: [
        // Keep critical classes that might be added dynamically
        'fonts-loaded',
        'loading',
        'loaded',
        /^animate-/,
        /^transition-/,
        /^duration-/,
        /^ease-/,
        /^delay-/,
      ],
    },
  },
  theme: {
    extend: {
      // Mobile-first breakpoints with container queries support
      screens: {
        xs: '475px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
        // Touch device specific breakpoints
        touch: { raw: '(hover: none) and (pointer: coarse)' },
        'no-touch': { raw: '(hover: hover) and (pointer: fine)' },
      },
      // Enhanced spacing for mobile-first design
      spacing: {
        18: '4.5rem',
        88: '22rem',
        // Mobile-specific spacing
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      // Mobile-optimized typography with fluid scaling
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        // Fluid typography for mobile-first
        'fluid-sm': 'clamp(0.875rem, 2.5vw, 1rem)',
        'fluid-base': 'clamp(1rem, 3vw, 1.125rem)',
        'fluid-lg': 'clamp(1.125rem, 4vw, 1.5rem)',
        'fluid-xl': 'clamp(1.25rem, 5vw, 2rem)',
        'fluid-2xl': 'clamp(1.5rem, 6vw, 2.5rem)',
        'fluid-3xl': 'clamp(1.875rem, 7vw, 3rem)',
      },
      // Touch target sizes with enhanced options
      minHeight: {
        44: '44px', // iOS minimum touch target
        48: '48px', // Android comfortable touch target
        56: '56px', // Material Design touch target
        64: '64px', // Large touch target
        touch: '44px', // Semantic touch target
        'touch-lg': '56px', // Large semantic touch target
      },
      minWidth: {
        44: '44px',
        48: '48px',
        56: '56px',
        64: '64px',
        touch: '44px',
        'touch-lg': '56px',
      },
      // Brand colors - only approved colors
      colors: {
        brand: {
          white: '#ffffff',
          pink: '#ff2d7a', // Hot Pink - Primary brand color
          pink2: '#d81b60', // Dark Hot Pink - Hover/active states
          black: '#0b0b0b', // Brand black
          grey: '#969696', // Brand grey
        },
        // Touch feedback colors using brand colors
        'touch-feedback': {
          light: 'rgba(11, 11, 11, 0.04)',
          dark: 'rgba(255, 255, 255, 0.08)',
        },
      },
      // Mobile-optimized shadows
      boxShadow: {
        'mobile-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        mobile:
          '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'mobile-md':
          '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'mobile-lg':
          '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'mobile-xl':
          '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      // Enhanced animations for mobile interactions
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'slide-left': 'slideLeft 0.3s ease-out',
        'slide-right': 'slideRight 0.3s ease-out',
        'bounce-gentle': 'bounceGentle 0.6s ease-in-out',
        'pulse-gentle': 'pulseGentle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'touch-feedback': 'touchFeedback 0.15s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(-5%)' },
          '50%': { transform: 'translateY(0)' },
        },
        pulseGentle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        touchFeedback: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(0.95)', opacity: '0.8' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      // Mobile-first container sizes
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '1.5rem',
          lg: '2rem',
          xl: '2.5rem',
          '2xl': '3rem',
        },
        screens: {
          sm: '640px',
          md: '768px',
          lg: '1024px',
          xl: '1280px',
          '2xl': '1400px',
        },
      },
      // Mobile-optimized border radius
      borderRadius: {
        mobile: '0.5rem',
        'mobile-lg': '0.75rem',
        'mobile-xl': '1rem',
      },
      // Z-index scale for mobile layering
      zIndex: {
        'mobile-dropdown': '1000',
        'mobile-sticky': '1020',
        'mobile-fixed': '1030',
        'mobile-modal-backdrop': '1040',
        'mobile-modal': '1050',
        'mobile-popover': '1060',
        'mobile-tooltip': '1070',
        'mobile-toast': '1080',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    // Custom plugin for mobile-first utilities
    function ({ addUtilities, theme }) {
      const newUtilities = {
        // Touch-friendly utilities
        '.touch-target': {
          minWidth: theme('minWidth.touch'),
          minHeight: theme('minHeight.touch'),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        },
        '.touch-target-lg': {
          minWidth: theme('minWidth.touch-lg'),
          minHeight: theme('minHeight.touch-lg'),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        },
        // Safe area utilities for mobile devices
        '.safe-top': {
          paddingTop: 'env(safe-area-inset-top)',
        },
        '.safe-bottom': {
          paddingBottom: 'env(safe-area-inset-bottom)',
        },
        '.safe-left': {
          paddingLeft: 'env(safe-area-inset-left)',
        },
        '.safe-right': {
          paddingRight: 'env(safe-area-inset-right)',
        },
        '.safe-x': {
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)',
        },
        '.safe-y': {
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        },
        '.safe-all': {
          paddingTop: 'env(safe-area-inset-top)',
          paddingRight: 'env(safe-area-inset-right)',
          paddingBottom: 'env(safe-area-inset-bottom)',
          paddingLeft: 'env(safe-area-inset-left)',
        },
        // Mobile-specific interaction utilities
        '.tap-highlight-none': {
          '-webkit-tap-highlight-color': 'transparent',
        },
        '.touch-pan-x': {
          touchAction: 'pan-x',
        },
        '.touch-pan-y': {
          touchAction: 'pan-y',
        },
        '.touch-pan-none': {
          touchAction: 'none',
        },
        '.touch-manipulation': {
          touchAction: 'manipulation',
        },
        // Mobile scrolling utilities
        '.scroll-smooth-mobile': {
          scrollBehavior: 'smooth',
          '-webkit-overflow-scrolling': 'touch',
        },
        '.overscroll-none': {
          overscrollBehavior: 'none',
        },
        '.overscroll-contain': {
          overscrollBehavior: 'contain',
        },
        // Mobile-optimized text rendering
        '.text-render-mobile': {
          textRendering: 'optimizeLegibility',
          '-webkit-font-smoothing': 'antialiased',
          '-moz-osx-font-smoothing': 'grayscale',
        },
      };

      addUtilities(newUtilities);
    },
  ],
};
