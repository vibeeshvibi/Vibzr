/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          pink: '#FC3C44',
          orange: '#FC3C44',
          purple: '#AF52DE',
          dark: '#000000',
          card: '#1C1C1E',
          surface: '#2C2C2E',
          border: 'rgba(255,255,255,0.1)',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      boxShadow: {
        brand: '0 4px 20px rgba(252,60,68,0.15)',
        'brand-lg': '0 8px 40px rgba(252,60,68,0.25)',
        glow: '0 0 15px rgba(252,60,68,0.3)',
        card: '0 2px 8px rgba(0,0,0,0.3)',
        'card-lg': '0 8px 24px rgba(0,0,0,0.4)',
      },
    },
  },
  plugins: [],
};
