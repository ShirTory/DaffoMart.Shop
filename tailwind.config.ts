import type { Config } from "tailwindcss";
// Brand colors (from the DaffoMart logo): change here to retheme the whole site
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: { extend: {
    colors: {
      primary: { DEFAULT: "#1E3A8A", dark: "#172B6B", deeper: "#0F1D4A", light: "#DBEAFE", soft: "#EFF6FF" },
      accent: { DEFAULT: "#F7941D", dark: "#E07F0A", soft: "#FFF4E5" },
    },
    fontFamily: { sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"] },
    boxShadow: { card: "0 1px 2px rgba(16,24,40,.04), 0 1px 3px rgba(16,24,40,.06)", pop: "0 12px 32px -8px rgba(16,24,40,.18)" },
  } },
  plugins: [],
};
export default config;
