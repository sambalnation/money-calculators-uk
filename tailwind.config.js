/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          950: '#05060a',
          900: '#070812',
        },
        neon: {
          cyan: '#26f6ff',
          pink: '#ff2bd6',
          lime: '#a7ff1f',
          purple: '#8a5bff',
        },
      },
      boxShadow: {
        neon: '0 0 0 1px rgba(38,246,255,0.25), 0 0 32px rgba(38,246,255,0.18)',
      },
    },
  },
  plugins: [],
};
