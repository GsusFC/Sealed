import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        void: "var(--void)",
        violet: {
          DEFAULT: "#8b5cf6",
          light: "#a78bfa",
          dark: "#7c3aed",
        },
        slate: {
          DEFAULT: "#334155",
          light: "#475569",
          dark: "#1e293b",
        },
        cyber: {
          bg: "#0a0a0f",
          void: "#1e1b4b",
          border: "#1e293b",
        },
      },
      fontFamily: {
        mono: [
          "JetBrains Mono",
          "Fira Code",
          "Courier New",
          "monospace",
        ],
      },
      letterSpacing: {
        terminal: "0.1em",
      },
    },
  },
  plugins: [],
};
export default config;
