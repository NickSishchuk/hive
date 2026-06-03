/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#F4A460',
          hover:   '#D48D47',
          light:   '#FFF3E0',
          muted:   '#F5C89E',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
