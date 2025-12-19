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
        // Tactical Luxury "Spectre" Palette - Strict Definition
        'tactical-dark': '#0A0A0A',    // Main Background - Matte Black
        'tactical-panel': '#171717',   // Card Backgrounds
        'tactical-panel-hover': '#222222',   // Card hover state
        'tactical-panel-active': '#2a2a2a',  // Card active state
        'tactical-border': '#333333',  // Subtle dividers
        'paper-white': '#F5F5F5',      // Primary Text - Stark, high contrast
        'muted-text': '#A3A3A3',       // Secondary details
        'alert-orange': '#F97316',     // Critical actions - Safety Orange (use sparingly)
        'gold-leaf': '#D4AF37',        // Winning states only - Metallic
      },
      fontFamily: {
        'sans': ['Inter', 'Roobert', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      skew: {
        '12': '12deg',
      },
    },
  },
  plugins: [],
}
