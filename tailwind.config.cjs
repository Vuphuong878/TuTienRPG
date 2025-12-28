/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Merriweather', 'serif'],
        lora: ['Lora', 'serif'],
        mono: ['Roboto Mono', 'monospace'],
        'source-code': ['Source Code Pro', 'monospace'],
      },
    },
  },
  plugins: [],
}