/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        med: {
          bg: "#0B1120",
          card: "#111827",
          border: "#1F2937",
          accent: "#0284C7",
          cyan: "#06B6D4",
          emerald: "#10B981",
          amber: "#F59E0B",
          red: "#EF4444",
          purple: "#8B5CF6",
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace']
      }
    },
  },
  plugins: [],
}
