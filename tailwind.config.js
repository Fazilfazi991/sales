/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0a",
        card: "#111111",
        cardSecondary: "#1a1a1a",
        primary: "#3b82f6",
        success: "#10b981",
        warning: "#f59e0b",
        danger: "#ef4444",
        textPrimary: "#ffffff",
        textSecondary: "#9ca3af",
      },
      borderRadius: {
        none: '0',
      },
    },
  },
  plugins: [],
}
