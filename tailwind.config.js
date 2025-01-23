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
        "bg-accent-dark": "#212121",
        "hover-text": "#C6C7CD",
        "input-text": "#5B5BC6",
      },
      fontFamily: {
        "Rubik": ["Rubik", "sans-serif"],
        "Manrope": ["Manrope", "sans-serif"],
        "IBM": ["IBM Plex Sans", "sans-serif"]
      },
      animation: {
        pulse: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}

