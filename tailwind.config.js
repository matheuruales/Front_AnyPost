/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          bg: "#000000",
          card: "#111111",
          text: "#ffffff",
          textSecondary: "#888888",
          accent: "#0070f3",
          border: "#333333",
          hover: "#222222"
        }
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite"
      },
      backdropBlur: { xs: "2px" },
      boxShadow: { glow: "0 0 20px rgba(0, 112, 243, 0.15)" }
    }
  },
  plugins: []
};