import type { Config } from "tailwindcss";

// Tokens from design-2.md (Wise light theme): sage canvas, white cards, lime CTA.
const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#e8ebe6",
        card: "#ffffff",
        elevated: "#e8ebe6",
        hairline: "#e8ebe6",
        primary: "#9fe870",
        "primary-active": "#cdffad",
        "primary-pale": "#e2f6d5",
        ink: "#0e0f0c",
        body: "#454745",
        muted: "#868685",
        "muted-strong": "#454745",
        up: "#054d28",
        down: "#d03238",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
