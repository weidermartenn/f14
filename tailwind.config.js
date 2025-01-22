/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,vue}",
  ],
  theme: {
    extend: {
      colors: {
        "f14-font": "#160843",
        "f14-font-dark": "#8090F4",
        "bg": "#FFFFFF",
        "bg-dark": "#101011",
        "hover-text": "#C6C7CD",
      },
      fontFamily: {
        "Rubik": ["Rubik", "sans-serif"],
        "Manrope": ["Manrope", "sans-serif"],
        "IBM": ["IBM Plex Sans", "sans-serif"]
      }
    },
  },
  plugins: [],
}

