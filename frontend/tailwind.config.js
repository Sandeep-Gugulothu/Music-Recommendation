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
          900: '#090a0f',
          800: '#11131a',
          700: '#191c26',
          600: '#232736',
          500: '#32374a',
        },
        spotify: {
          green: '#1db954',
          hover: '#1ed760',
          dark: '#121212',
          card: '#181818',
        },
        accent: {
          purple: '#8b5cf6',
          pink: '#ec4899',
          cyan: '#06b6d4',
          amber: '#f59e0b',
        }
      },
      animation: {
        'spin-slow': 'spin 12s linear infinite',
        'spin-paused': 'spin 12s linear infinite paused',
        'pulse-glow': 'pulseGlow 2.5s infinite ease-in-out',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '0.9', transform: 'scale(1.03)' },
        }
      }
    },
  },
  plugins: [],
}
