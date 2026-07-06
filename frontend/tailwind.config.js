/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef4ff',
          500: '#4f6df5',
          600: '#3d54d1',
          900: '#1c2560',
        },
      },
    },
  },
  plugins: [],
};
