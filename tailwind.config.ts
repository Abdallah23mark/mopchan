// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./client/src/**/*.{ts,tsx}",
    "./client/index.html"
  ],
  theme: {
    extend: {
      colors: {
        neutral: {
          900: "#0f0f0f",
          800: "#1a1a1a",
          700: "#2b2b2b"
        }
      }
    }
  },
  plugins: []
};

export default config;
