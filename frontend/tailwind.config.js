/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        notion: {
          dark: '#191919',
          darker: '#0f0f0f',
          light: '#2f2f2f',
          border: '#333333',
          text: '#ffffff',
          'text-secondary': '#8a8d91',
        }
      }
    },
  },
  plugins: [],
}
