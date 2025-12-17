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
        'board-navy': '#0a1628',      // Deep Navy Blue - main background
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
        'stadium-gradient': 'radial-gradient(ellipse at center, #1a2f4a 0%, #0a1628 70%)',
      },
    },
  },
  plugins: [],
}
