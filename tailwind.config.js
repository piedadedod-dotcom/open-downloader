/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#0b0d12',
        panel: '#12151d',
        line: '#242936',
        muted: '#9299a8',
        accent: '#a78bfa',
        'accent-bright': '#c4b5fd',
      },
      boxShadow: {
        glow: '0 12px 40px rgba(139, 92, 246, 0.18)',
      },
    },
  },
  plugins: [],
}
