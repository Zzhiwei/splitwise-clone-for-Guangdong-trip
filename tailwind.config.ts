import type { Config } from "tailwindcss";

// Tokens from design.md (Binance dark theme).
const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#0b0e11",
        card: "#1e2329",
        elevated: "#2b3139",
        hairline: "#2b3139",
        primary: "#fcd535",
        "primary-active": "#f0b90b",
        ink: "#181a20",
        body: "#eaecef",
        muted: "#707a8a",
        "muted-strong": "#929aa5",
        up: "#0ecb81",
        down: "#f6465d",
        info: "#3b82f6",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        num: ["var(--font-num)", "var(--font-sans)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
