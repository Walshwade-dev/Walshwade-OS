import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0f172a", // Dark slate
        foreground: "#f8fafc", // Very light grey
        primary: {
          DEFAULT: "#0ea5e9", // Bluish/Cyan
          dark: "#0284c7",
          glow: "rgba(14, 165, 233, 0.5)",
        },
        warning: {
          DEFAULT: "#f59e0b", // Amber
          dark: "#d97706",
          glow: "rgba(245, 158, 11, 0.5)",
        },
        critical: {
          DEFAULT: "#ea580c", // Dark Orange
          dark: "#c2410c",
          glow: "rgba(234, 88, 12, 0.5)",
        },
        panel: {
          DEFAULT: "rgba(30, 41, 59, 0.7)", // Glassmorphism dark grey
          border: "#334155",
        }
      },
      fontFamily: {
        sans: ['var(--font-rajdhani)', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
