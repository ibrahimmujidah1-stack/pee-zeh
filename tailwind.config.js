/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#070709',
          900: '#0B0C10',
          800: '#14161F',
          700: '#1F2333',
        },
        gold: {
          300: '#FDE68A',
          400: '#FCD34D',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          glow: 'rgba(245, 158, 11, 0.45)',
        },
        emerald: {
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          glow: 'rgba(16, 185, 129, 0.35)',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Cabinet Grotesk', 'Plus Jakarta Sans', 'sans-serif'],
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'bill-fall': 'bill-fall 2.5s linear forwards',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': {
            boxShadow: '0 0 25px rgba(245, 158, 11, 0.4), inset 0 0 15px rgba(245, 158, 11, 0.2)',
          },
          '50%': {
            boxShadow: '0 0 45px rgba(245, 158, 11, 0.7), inset 0 0 25px rgba(245, 158, 11, 0.4)',
          },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #FDE68A 0%, #F59E0B 50%, #D97706 100%)',
        'gold-metallic': 'linear-gradient(110deg, #FCD34D 0%, #FFFBEB 25%, #F59E0B 50%, #B45309 75%, #FDE68A 100%)',
        'emerald-gradient': 'linear-gradient(135deg, #34D399 0%, #10B981 50%, #047857 100%)',
        'dark-glass': 'linear-gradient(135deg, rgba(20, 22, 31, 0.75) 0%, rgba(11, 12, 16, 0.85) 100%)',
      }
    },
  },
  plugins: [],
}

