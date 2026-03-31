import type { Config } from "tailwindcss";
const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "#0f1117",
          secondary: "#13161f",
          card: "#1c2035",
        },
        border: {
          subtle: "#2a2d3a",
          card: "#1e2136",
        },
        text: {
          primary: "#e2e8ff",
          secondary: "#9aa0bc",
          muted: "#4a4f6a",
        },
        accent: {
          blue: "#3b6ef5",
          green: "#3fd48a",
          orange: "#f5a623",
          red: "#f05a5a",
          purple: "#8b5cf6",
        },
      },
    },
  },
  plugins: [],
};
export default config;
