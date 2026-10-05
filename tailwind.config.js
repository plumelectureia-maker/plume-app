/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'selector',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d7ff',
          300: '#a3b9ff',
          400: '#7b8cff',
          500: '#3f51b5',
          600: '#3346c9',
          700: '#2a38a0',
          800: '#212b7d',
          900: '#1a1f5c',
        },
      },
      fontFamily: {
        'serif': ['Literata', 'Georgia', 'serif'],
        'sans': ['Hanken Grotesk', 'system-ui', '-apple-system', 'sans-serif'],
        'hand': ['Kalam', 'cursive'],
      },
    },
  },
  plugins: [],
}
