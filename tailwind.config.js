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
        'tactical-border': '#333333',  // Subtle dividers
        'paper-white': '#F5F5F5',      // Primary Text - Stark, high contrast
        'muted-text': '#A3A3A3',       // Secondary details
        'alert-orange': '#F97316',     // Critical actions - Safety Orange (use sparingly)
        'gold-leaf': '#D4AF37',        // Winning states only - Metallic
        // Legacy colors kept for compatibility
        'board-navy': '#050A14',
        'board-surface': '#0F172A',
        'board-highlight': '#1E293B',
        'board-text': '#E2E8F0',
        'board-red': '#EF4444',
        'board-gold': '#F59E0B',
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
