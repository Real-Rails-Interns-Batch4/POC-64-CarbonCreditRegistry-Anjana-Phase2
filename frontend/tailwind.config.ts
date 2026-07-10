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
        background: "#020a10",
        foreground: "#f3f4f6",
        surface: "#05121b",
        accent: {
          primary: "#38BDF8",   // Electric Cyan
          secondary: "#818CF8", // Indigo
        },
        border: "#1F2937",
      },
    },
  },
  plugins: [],
};
export default config;
