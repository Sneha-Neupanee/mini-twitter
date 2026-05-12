/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fdf8f3',
          100: '#faeee0',
          200: '#f4d9bc',
          300: '#ebbc8a',
          400: '#e09a58',
          500: '#d4783a',
          600: '#c0602a',
          700: '#a04b24',
          800: '#823d22',
          900: '#6b341f',
          950: '#3a190d',
        },
        surface: {
          DEFAULT: '#ffffff',
          muted:   '#faf7f4',
          hover:   '#f5ede3',
        }
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
