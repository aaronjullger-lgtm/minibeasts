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
        // Strict Design Tokens - Premium Noir Palette
        'board-navy': '#050A14',       // Background - The deepest possible matte navy
        'board-surface': '#0F172A',    // Card Backgrounds - Slate 900
        'board-highlight': '#1E293B',  // Borders/Accents - Slate 800
        'board-text': '#E2E8F0',       // Primary Text - Slate 200
        'board-red': '#EF4444',        // Critical Actions/Alerts - Red 500
        'board-gold': '#F59E0B',       // Value/Winning - Amber 500
        // Legacy colors kept for compatibility
        'board-off-white': '#E1E7F5',
        'board-muted-blue': '#1E293B',
        'board-crimson': '#8a1c1c',
      },
      fontFamily: {
        // Typography
        'sans': ['Inter', 'Roobert', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Fira Code', 'monospace'],
        // Legacy font families
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
