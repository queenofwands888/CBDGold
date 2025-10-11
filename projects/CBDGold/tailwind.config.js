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
        md: '1.5rem',
        lg: '2rem',
        xl: '3rem'
      }
    },
    extend: {
      animation: {
        'pulse-slow': 'pulse-slow 12s ease-in-out infinite',
        'spin-slow': 'spin 2.75s linear infinite',
        float: 'float 6s ease-in-out infinite'
      },
      backgroundImage: {
        'noise-soft': "url('https://grainy-gradients.vercel.app/noise.svg')"
      },
      boxShadow: {
        glow: '0 20px 50px -18px rgba(59, 130, 246, 0.35)',
        'glow-green': '0 25px 60px -30px rgba(74, 222, 128, 0.45)'
      },
      fontFamily: {
        sans: ['"DM Sans"', 'Inter', ...defaultTheme.fontFamily.sans],
        display: ['"Space Grotesk"', ...defaultTheme.fontFamily.sans]
      },
      keyframes: {
        'pulse-slow': {
          '0%, 100%': { opacity: 0.55, transform: 'scale(0.99)' },
          '50%': { opacity: 0.9, transform: 'scale(1.02)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' }
        }
      },
      colors: {
        'brand-emerald': '#34d399',
        'brand-purple': '#a855f7',
        'brand-midnight': '#0b1026'
      },
      borderRadius: {
        '4xl': '2.5rem'
      }
    }
  },
  plugins: [],
};
