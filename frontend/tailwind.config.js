/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      backgroundImage: {
        'auth-gradient': 'linear-gradient(to bottom, #111111, #000000)',
      },
    },
  },
  plugins: [],
};
