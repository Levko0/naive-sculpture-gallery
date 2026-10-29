/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gallery: {
          milk: "#FAF8F5",       // Warm Milk / Primary background
          stone: "#F3EFEA",      // Soft Gallery Stone / Card surface
          ink: "#18181B",        // Deep Charcoal Ink / Primary text
          muted: "#71717A",      // Muted Warm Grey / Captions & specs
          border: "#E6E2DD",     // Thin subtle borders
          dark: "#121214",       // Deep background for lightbox / focus
        },
        badge: {
          green: "#2E5A36",
          greenBg: "#EDF5EE",
          ochre: "#B47820",
          ochreBg: "#FCF6ED",
          sold: "#786F6D",
          soldBg: "#F3EFEF",
        }
      },
      fontFamily: {
        serif: ["'Cormorant Garamond'", "Georgia", "serif"],
        sans: ["'Plus Jakarta Sans'", "'Inter'", "system-ui", "-apple-system", "sans-serif"],
      },
      letterSpacing: {
        museum: "0.08em",
        wide: "0.04em",
      },
      boxShadow: {
        subtle: "0 1px 3px rgba(24, 24, 27, 0.04), 0 10px 20px rgba(24, 24, 27, 0.02)",
        elevation: "0 4px 20px rgba(24, 24, 27, 0.08)",
      }
    },
  },
  plugins: [],
}
