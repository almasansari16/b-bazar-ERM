/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'] },
      colors: {
        brand: { 50: '#EEF2FF', 100: '#E0E7FF', 200: '#C7D2FE', 300: '#A5B4FC', 500: '#6366F1', 600: '#4338CA', 700: '#3730A3', 800: '#312E81', 900: '#1E1B4B' },
        violet: { 50: '#F5F3FF', 100: '#EDE9FE', 500: '#8B5CF6', 600: '#7C3AED', 700: '#6D28D9' },
        accent: { 50: '#ECFEFF', 100: '#CFFAFE', 500: '#06B6D4', 600: '#0891B2', 700: '#0E7490' },
        ink: { DEFAULT: '#111827', soft: '#64748B' },
        line: '#E2E8F0',
        muted: '#F1F5F9',
        canvas: '#F8FAFC',
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,23,42,.04), 0 1px 3px rgba(15,23,42,.04)',
        lift: '0 8px 24px -8px rgba(49,46,129,.18)',
        pop: '0 16px 40px -12px rgba(15,23,42,.25)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #312E81, #7C3AED)',
        'brand-gradient-soft': 'linear-gradient(135deg, #EEF2FF, #F5F3FF)',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0, transform: 'translateY(6px)' }, to: { opacity: 1, transform: 'none' } },
        pop: { '0%': { transform: 'scale(1)' }, '40%': { transform: 'scale(1.3)' }, '100%': { transform: 'scale(1)' } },
        slideIn: { from: { transform: 'translateX(100%)' }, to: { transform: 'none' } },
        slideInL: { from: { transform: 'translateX(-100%)' }, to: { transform: 'none' } },
        slideUp: { from: { transform: 'translateY(100%)' }, to: { transform: 'none' } },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
        bump: { '0%,100%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.25)' } },
      },
      animation: {
        'fade-in': 'fadeIn .3s ease-out both',
        pop: 'pop .35s ease-out',
        'slide-in': 'slideIn .25s ease-out',
        'slide-in-l': 'slideInL .25s ease-out',
        'slide-up': 'slideUp .25s ease-out',
        bump: 'bump .4s ease-out',
      },
    },
  },
  plugins: [],
};
