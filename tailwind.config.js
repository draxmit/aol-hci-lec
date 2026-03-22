/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Instrument Serif"', 'serif'],
        sans: ['Barlow', 'sans-serif'],
      },
      colors: {
        warning: '#f59e0b',
        danger:  '#f43f5e',
        positive:'#10b981',
      },
    },
  },
  plugins: [],
}
