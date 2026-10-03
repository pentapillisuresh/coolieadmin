/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff7ed', 100: '#ffedd5', 200: '#fed7aa', 300: '#fdba74',
          400: '#fb923c', 500: '#fd9a00', 600: '#ea8a00', 700: '#c96f00',
          800: '#a85600', 900: '#7c3f00',
        },
      },
    },
  },
  plugins: [],
}