/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'inter': ['var(--font-inter)', 'sans-serif'],
        'poppins': ['var(--font-poppins)', 'sans-serif'],
      },
      colors: {
        'quickshift-primary': '#0077B6',
        'quickshift-secondary': '#00B4D8',
        'quickshift-tertiary': '#90E0EF',
        'quickshift-quaternary': '#CAF0F8',
        'quickshift-dark': '#03045E',
        'quickshift-bg': '#F8FAFC',
      },
    },
  },
  plugins: [],
}
