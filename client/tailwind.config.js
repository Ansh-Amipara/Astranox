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
        // Override default colors used in the app to adopt the Ink Wash palette
        white: '#FFFFE3',
        black: '#4A4A4A',
        slate: {
          50: '#FFFFE3',
          100: '#FFFFE3',
          200: '#CBCBCB',
          300: '#CBCBCB',
          400: '#6D8196',
          500: '#6D8196',
          600: '#4A4A4A',
          700: '#4A4A4A',
          800: '#4A4A4A',
          900: '#4A4A4A',
          950: '#4A4A4A',
        },
        red: {
          50: '#FFFFE3',
          100: '#CBCBCB',
          200: '#CBCBCB',
          300: '#6D8196',
          400: '#6D8196',
          500: '#6D8196',
          600: '#4A4A4A',
          700: '#4A4A4A',
          800: '#4A4A4A',
          900: '#4A4A4A',
          950: '#4A4A4A',
        },
        blue: {
          50: '#FFFFE3',
          100: '#CBCBCB',
          200: '#CBCBCB',
          300: '#6D8196',
          400: '#6D8196',
          500: '#6D8196',
          600: '#4A4A4A',
          700: '#4A4A4A',
          800: '#4A4A4A',
          900: '#4A4A4A',
          950: '#4A4A4A',
        },
      }
    },
  },
  plugins: [],
}
