/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1B5A7E',
          light: '#2C7AA8',
          dark: '#144561',
        },
        lightBlue: '#B8E5F5',
        darkBlue: '#2C4A5C',
        accent: '#5B9BD5',
      },
    },
  },
  plugins: [],
}