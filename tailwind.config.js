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
        // Tactical Luxury "Spectre" Palette - Matte Black & Gunmetal
        'tactical-dark': '#0A0A0A',    // Main Background - Matte Black
        'tactical-panel': '#171717',   // Card Backgrounds - Slightly lighter, no transparency
        'tactical-panel-hover': '#222222',   // Card hover state - subtle lighten
        'tactical-panel-active': '#2a2a2a',  // Card active state - more visible lighten
        'tactical-border': '#333333',  // Subtle dividers
        'paper-white': '#F5F5F5',      // Primary Text - Stark, high contrast
        'muted-text': '#A3A3A3',       // Secondary details
        'alert-orange': '#F97316',     // Critical actions - Safety Orange (use sparingly)
        'gold-leaf': '#D4AF37',        // Winning states only - Metallic
        // Legacy aliases for compatibility (mapped to tactical palette)
        'board-navy': '#0A0A0A',       // Alias for tactical-dark
        'board-surface': '#171717',    // Alias for tactical-panel
        'board-highlight': '#222222',  // Alias for tactical-panel-hover
        'board-text': '#F5F5F5',       // Alias for paper-white
        'board-red': '#F97316',        // Alias for alert-orange
        'board-gold': '#D4AF37',       // Alias for gold-leaf
        'board-off-white': '#F5F5F5',  // Alias for paper-white
        'board-muted-blue': '#222222', // Alias for tactical-panel-hover
        'board-crimson': '#F97316',    // Alias for alert-orange
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
