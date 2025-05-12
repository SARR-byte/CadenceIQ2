/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        charcoal: {
          50: '#F5F6F6',
          100: '#E5E7E8',
          200: '#CBD0D2',
          300: '#B0B8BB',
          400: '#96A0A5',
          500: '#7B888E',
          600: '#626D73',
          700: '#495257',
          800: '#2F363A',
          900: '#161B1E',
        }
      }
    },
  },
  plugins: [],
};