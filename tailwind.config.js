/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        calligraphy: ['"Dancing Script"', 'cursive'],
        mono: ['"Space Mono"', 'monospace'],
        // or: calligraphy: ['"Dancing Script"', 'cursive'],
      },
      fontSize: {
        '8xl': '6rem',    // 96px
        '9xl': '8rem',    // 128px
        '10xl': '10rem',  // 160px
      },
    },
  },
  plugins: [],
}