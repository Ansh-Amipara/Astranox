/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          dark: '#4A4A4A',
          light: '#CBCBCB',
          paper: '#FFFFE3',
          blue: '#6D8196',
        },
        silt: {
          khaki: '#CBBD93',
          pale: '#FFF5B8',
          peach: '#FFB16E',
          gold: '#CCA25A',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(204, 162, 90, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(204, 162, 90, 0.6), 0 0 40px rgba(204, 162, 90, 0.2)' },
        }
      }
    },
  },
  plugins: [],
}
