// Tailwind CSS Brand Color Configuration
// Extends default Tailwind colors with brand colors

module.exports = {
  theme: {
    extend: {
      colors: {
        // Brand Primary Colors (replaces blue)
        brand: {
          50: '#FEF2F5',
          100: '#FDE6EB',
          200: '#FBCCD6',
          300: '#F8A1B4',
          400: '#F56B8A',
          500: '#F5276F', // Primary brand color
          600: '#E01E5F',
          700: '#C8094C', // Hover color
          800: '#B01E56',
          900: '#8B1A47',
        },
        
        // Override default blue with brand colors
        blue: {
          50: '#FEF2F5',
          100: '#FDE6EB',
          200: '#FBCCD6',
          300: '#F8A1B4',
          400: '#F56B8A',
          500: '#F5276F',
          600: '#E01E5F',
          700: '#C8094C',
          800: '#B01E56',
          900: '#8B1A47',
        },
        
        // Primary color alias
        primary: {
          50: '#FEF2F5',
          100: '#FDE6EB',
          200: '#FBCCD6',
          300: '#F8A1B4',
          400: '#F56B8A',
          500: '#F5276F',
          600: '#E01E5F',
          700: '#C8094C',
          800: '#B01E56',
          900: '#8B1A47',
        },
        
        // Accent color alias
        accent: {
          50: '#FEF2F5',
          100: '#FDE6EB',
          200: '#FBCCD6',
          300: '#F8A1B4',
          400: '#F56B8A',
          500: '#F5276F',
          600: '#E01E5F',
          700: '#C8094C',
          800: '#B01E56',
          900: '#8B1A47',
        }
      },
      
      // Custom button styles
      backgroundColor: {
        'btn-primary': '#F5276F',
        'btn-primary-hover': '#C8094C',
      },
      
      // Custom border colors
      borderColor: {
        'primary': '#F5276F',
        'primary-hover': '#C8094C',
      },
      
      // Custom text colors
      textColor: {
        'primary': '#F5276F',
        'primary-hover': '#C8094C',
      },
      
      // Custom ring colors for focus states
      ringColor: {
        'primary': 'rgba(245, 39, 111, 0.3)',
      },
      
      // Custom box shadow colors
      boxShadow: {
        'primary': '0 10px 15px -3px rgba(245, 39, 111, 0.3)',
        'primary-lg': '0 20px 25px -5px rgba(245, 39, 111, 0.2)',
      }
    }
  },
  
  // Custom utilities
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.btn-brand': {
          backgroundColor: '#F5276F',
          color: '#FFFFFF',
          padding: '12px 24px',
          borderRadius: '8px',
          fontWeight: '600',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: '#C8094C',
            transform: 'translateY(-2px)',
            boxShadow: '0 10px 15px -3px rgba(245, 39, 111, 0.3)',
          }
        },
        '.btn-brand-outline': {
          backgroundColor: 'transparent',
          color: '#F5276F',
          border: '2px solid #F5276F',
          padding: '10px 22px',
          borderRadius: '8px',
          fontWeight: '600',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: '#F5276F',
            color: '#FFFFFF',
            transform: 'translateY(-2px)',
          }
        },
        '.text-brand': {
          color: '#F5276F',
        },
        '.text-brand-hover:hover': {
          color: '#C8094C',
        },
        '.bg-brand': {
          backgroundColor: '#F5276F',
        },
        '.bg-brand-hover:hover': {
          backgroundColor: '#C8094C',
        },
        '.border-brand': {
          borderColor: '#F5276F',
        },
        '.ring-brand': {
          '--tw-ring-color': 'rgba(245, 39, 111, 0.3)',
        }
      }
      
      addUtilities(newUtilities)
    }
  ]
}