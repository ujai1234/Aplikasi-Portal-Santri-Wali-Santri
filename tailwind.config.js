/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#faf9f6',
        surface: '#ffffff',
        line: '#e2e8f0',
        ink: '#1e293b',
        gold: {
          DEFAULT: '#d97706',
          dark: '#b45309',
          light: '#fbbf24',
          soft: '#fef3c7',
          ink: '#92400e',
        },
        primary: {
          DEFAULT: '#065f46',
          light: '#047857',
          dark: '#044e3a',
          deep: '#022c22',
          soft: '#e3f3ec',
        },
        success: {
          DEFAULT: '#059669',
          soft: '#d1fae5',
        },
        danger: {
          DEFAULT: '#dc2626',
          soft: '#fee2e2',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Sora', 'ui-sans-serif', 'sans-serif'],
        arabic: ['Amiri', 'serif'],
      },
      boxShadow: {
        'soft': '0 4px 12px -2px rgba(6, 95, 70, 0.04), 0 2px 4px -1px rgba(0, 0, 0, 0.02)',
        'card': '0 10px 25px -5px rgba(6, 95, 70, 0.06), 0 8px 10px -6px rgba(6, 95, 70, 0.04)',
        'islamic': '0 12px 30px -8px rgba(6, 95, 70, 0.08)',
        'pop': '0 20px 25px -5px rgba(6, 95, 70, 0.12)',
      },
      animation: {
        'fade-up': 'fadeUp 0.45s cubic-bezier(0.16, 1, 0.3, 1) both',
        'pulse-subtle': 'pulseSubtle 3s infinite ease-in-out',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.85 },
        }
      }
    },
  },
  plugins: [],
}

