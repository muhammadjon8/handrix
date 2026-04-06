/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-dark': '#0b0c10',
        'primary-accent': '#66fcf1',
        'secondary-accent': '#45a29e',
        'surface': 'rgba(31, 40, 51, 0.7)',
        'surface-hover': 'rgba(51, 60, 71, 0.9)',
      },
      fontFamily: {
        display: ['Outfit', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

