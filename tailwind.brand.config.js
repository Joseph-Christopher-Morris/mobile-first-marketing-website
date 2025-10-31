// Tailwind CSS Brand Color Configuration
// Extends default Tailwind colors with approved brand colors only

module.exports = {
  theme: {
    extend: {
      colors: {
        // Brand colors - only approved colors
        brand: {
          pink: '#ff2d7a',   // Primary brand color
          pink2: '#d81b60',  // Secondary brand color  
          black: '#0b0b0b',  // Brand black
          white: '#ffffff',  // Brand white
        },

        // Override default blue with brand colors
        blue: {
          500: '#ff2d7a',  // Use brand pink as primary blue
          600: '#d81b60',  // Use brand pink2 as darker blue
        },

        // Primary color alias using brand colors
        primary: {
          500: '#ff2d7a',  // Primary brand color
          600: '#d81b60',  // Secondary brand color
        },

        // Accent color alias using brand colors
        accent: {
          500: '#ff2d7a',  // Primary brand color
          600: '#d81b60',  // Secondary brand color
        },
      },

      // Custom button styles using approved brand colors
      backgroundColor: {
        'btn-primary': '#ff2d7a',
        'btn-primary-hover': '#d81b60',
      },

      // Custom border colors using approved brand colors
      borderColor: {
        primary: '#ff2d7a',
        'primary-hover': '#d81b60',
      },

      // Custom text colors using approved brand colors
      textColor: {
        primary: '#ff2d7a',
        'primary-hover': '#d81b60',
      },

      // Custom ring colors for focus states using approved brand colors
      ringColor: {
        primary: 'rgba(255, 45, 122, 0.3)',
      },

      // Custom box shadow colors using approved brand colors
      boxShadow: {
        primary: '0 10px 15px -3px rgba(255, 45, 122, 0.3)',
        'primary-lg': '0 20px 25px -5px rgba(255, 45, 122, 0.2)',
      },
    },
  },

  // Custom utilities using approved brand colors only
  plugins: [
    function ({ addUtilities }) {
      const newUtilities = {
        '.btn-brand': {
          backgroundColor: '#ff2d7a',
          color: '#ffffff',
          padding: '12px 24px',
          borderRadius: '8px',
          fontWeight: '600',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: '#d81b60',
            transform: 'translateY(-2px)',
            boxShadow: '0 10px 15px -3px rgba(255, 45, 122, 0.3)',
          },
        },
        '.btn-brand-outline': {
          backgroundColor: 'transparent',
          color: '#ff2d7a',
          border: '2px solid #ff2d7a',
          padding: '10px 22px',
          borderRadius: '8px',
          fontWeight: '600',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: '#ff2d7a',
            color: '#ffffff',
            transform: 'translateY(-2px)',
          },
        },
        '.text-brand': {
          color: '#ff2d7a',
        },
        '.text-brand-hover:hover': {
          color: '#d81b60',
        },
        '.bg-brand': {
          backgroundColor: '#ff2d7a',
        },
        '.bg-brand-hover:hover': {
          backgroundColor: '#d81b60',
        },
        '.border-brand': {
          borderColor: '#ff2d7a',
        },
        '.ring-brand': {
          '--tw-ring-color': 'rgba(255, 45, 122, 0.3)',
        },
      };

      addUtilities(newUtilities);
    },
  ],
};
