import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#090909",
        card: "#18181b",
        muted: "#a1a1aa",
        accent: "#facc15",
        success: "#22c55e"
      }
    }
  },
  plugins: []
};

export default config;
