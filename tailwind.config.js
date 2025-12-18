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
        // Elite Noir Color Palette
        'board-navy': '#050A14',      // Background - The deepest possible matte navy, almost black
        'board-off-white': '#E1E7F5',  // Primary Text - Simulates high-end cold-pressed cardstock
        'board-muted-blue': '#1E293B', // Borders/Inactive - A tactical slate blue
        'board-red': '#FF3333',        // Active/Alert - High-visibility neon red for live action
        'board-crimson': '#8a1c1c',    // Depth - Darker dried-blood red for gradients and backgrounds
        'board-gold': '#D4AF37',       // Grail items - Metallic gold
      },
      fontFamily: {
        'board-header': ['Inter', 'Roboto', 'sans-serif'],
        'board-grit': ['"Courier Prime"', '"Fira Code"', '"Roboto Mono"', 'monospace'],
      },
      backgroundImage: {
        'stadium-gradient': 'linear-gradient(#050a14, #050a14)',
        'vignette-top': 'radial-gradient(ellipse at top, rgba(255, 255, 255, 0.05) 0%, transparent 60%)',
        'vignette-center': 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.08) 0%, transparent 70%)',
      },
      skew: {
        '12': '12deg',
      },
    },
  },
  plugins: [],
}
