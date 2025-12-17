/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // The Board Color Palette
        'board-navy': '#050a14',      // Deep Navy Blue - main background
        'board-off-white': '#f5f5f0',  // Off-White - betting cards
        'board-red': '#ff3333',        // Bright Red - action buttons
        'board-crimson': '#8b0000',    // Deep Crimson Red - locked/restricted states
        'board-muted-blue': '#4a5568', // Muted Blue - borders and accents
      },
      fontFamily: {
        'board-header': ['"Archivo Black"', 'sans-serif'],
        'board-grit': ['Courier New', 'monospace'],
      },
      backgroundImage: {
        'stadium-gradient': 'radial-gradient(circle at 50% 0%, rgba(255, 51, 51, 0.08) 0%, rgba(5, 10, 20, 1) 70%)',
      },
      boxShadow: {
        'board-red-glow': '0 0 15px rgba(255, 51, 51, 0.4)',
      },
    },
  },
  plugins: [],
}
