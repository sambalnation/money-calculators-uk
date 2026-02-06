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
        // Kept for backwards-compatibility with existing classes, but toned down
        // to feel more "finance tool" than "neon".
        neon: {
          cyan: '#22d3ee', // cyan-400
          pink: '#f472b6', // pink-400
          lime: '#a3e635', // lime-400
          purple: '#a78bfa', // violet-400
        },
      },
      boxShadow: {
        // Subtle accent ring + depth (replaces heavy glow).
        neon: '0 0 0 1px rgba(34,211,238,0.16), 0 14px 34px rgba(0,0,0,0.55)',
      },
    },
  },
  plugins: [],
};
