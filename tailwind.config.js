/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#06080e',
          900: '#0b0f19',
          850: '#101726',
          800: '#151e32',
          750: '#1b253e',
          700: '#23304e',
          600: '#324268',
        },
        neon: {
          green: '#10b981',
          lime: '#22c55e',
          cyan: '#06b6d4',
          orange: '#f97316',
          amber: '#f59e0b',
          rose: '#f43f5e',
          purple: '#a855f7',
        }
      },
      boxShadow: {
        'neon-green': '0 0 20px -3px rgba(16, 185, 129, 0.45)',
        'neon-cyan': '0 0 20px -3px rgba(6, 182, 212, 0.45)',
        'neon-orange': '0 0 20px -3px rgba(249, 115, 22, 0.45)',
        'neon-rose': '0 0 20px -3px rgba(244, 63, 94, 0.45)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { filter: 'drop-shadow(0 0 4px rgba(16, 185, 129, 0.4))' },
          '100%': { filter: 'drop-shadow(0 0 12px rgba(16, 185, 129, 0.9))' },
        }
      }
    },
  },
  plugins: [],
}
