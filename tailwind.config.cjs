const animate = require("tailwindcss-animate");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        body: ["Inter", "Microsoft YaHei", "PingFang SC", "sans-serif"],
        display: ["Instrument Serif", "Songti SC", "SimSun", "serif"],
        name: ["Mestain", "Instrument Serif", "Microsoft YaHei", "serif"],
        yahei: ["Microsoft YaHei", "微软雅黑", "PingFang SC", "sans-serif"],
        deihei: ["DeYiHei", "Microsoft YaHei", "sans-serif"],
        ebrima: ["Ebrima", "Segoe UI", "sans-serif"],
        bookman: ['"Bookman Old Style"', "Bookman", "Georgia", "serif"],
      },
      colors: {
        bg: "hsl(var(--bg) / <alpha-value>)",
        surface: "hsl(var(--surface) / <alpha-value>)",
        "text-primary": "hsl(var(--text) / <alpha-value>)",
        muted: "hsl(var(--muted) / <alpha-value>)",
        stroke: "hsl(var(--stroke) / <alpha-value>)",
        accent: "hsl(var(--accent) / <alpha-value>)",
      },
    },
  },
  plugins: [animate],
};
