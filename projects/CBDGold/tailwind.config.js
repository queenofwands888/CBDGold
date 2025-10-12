const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
        md: '2rem',
        lg: '2.5rem',
        xl: '3rem',
        '2xl': '4rem'
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1400px'
      }
    },
    extend: {
      animation: {
        'pulse-slow': 'pulse-slow 12s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
        'fadeIn': 'fadeIn 0.5s ease-out forwards',
        'slideUp': 'slideUp 0.6s ease-out forwards',
        'glow': 'glow 2s ease-in-out infinite'
      },
      backgroundImage: {
        'noise-soft': "url('https://grainy-gradients.vercel.app/noise.svg')",
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))'
      },
      boxShadow: {
        'glow': '0 0 20px rgba(52, 211, 153, 0.3)',
        'glow-green': '0 0 30px rgba(52, 211, 153, 0.45)',
        'glow-purple': '0 0 30px rgba(168, 85, 247, 0.45)',
        'glow-blue': '0 0 30px rgba(59, 130, 246, 0.45)',
        'inner-glow': 'inset 0 0 20px rgba(52, 211, 153, 0.2)',
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.15)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)'
      },
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
        display: ['Space Grotesk', 'Inter', ...defaultTheme.fontFamily.sans],
        mono: ['JetBrains Mono', ...defaultTheme.fontFamily.mono]
      },
      fontSize: {
        'xxs': '0.625rem',
        '2xs': '0.6875rem'
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '100': '25rem',
        '112': '28rem',
        '128': '32rem'
      },
      keyframes: {
        'pulse-slow': {
          '0%, 100%': { opacity: '0.6', transform: 'scale(0.98)' },
          '50%': { opacity: '1', transform: 'scale(1.02)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '33%': { transform: 'translateY(-10px) rotate(1deg)' },
          '66%': { transform: 'translateY(-5px) rotate(-1deg)' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' }
        },
        fadeIn: {
          'from': { opacity: '0', transform: 'translateY(10px)' },
          'to': { opacity: '1', transform: 'translateY(0)' }
        },
        slideUp: {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' }
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(52, 211, 153, 0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(52, 211, 153, 0.6)' }
        }
      },
      colors: {
        brand: {
          green: '#10b981',
          emerald: '#34d399',
          purple: '#a855f7',
          midnight: '#0b1026'
        },
        surface: {
          DEFAULT: '#111827',
          elevated: '#1f2937',
          overlay: 'rgba(17, 24, 39, 0.95)'
        }
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem'
      },
      backdropBlur: {
        xs: '2px'
      },
      transitionDuration: {
        '400': '400ms'
      }
    }
  },
  plugins: [],
};
