/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        orbitron: ["Orbitron", "sans-serif"],
      },
      colors: {
        // compliments international orange primary color palette
        gray: {
          1: "#fcfcfd",
          2: "#f9f9fb",
          3: "#eff0f3",
          4: "#e7e8ec",
          5: "#e0e1e6",
          6: "#d8d9e0",
          7: "#cdced7",
          8: "#b9bbc6",
          9: "#8b8d98",
          10: "#80828d",
          11: "#62636c",
          12: "#1e1f24",
        },
        // Radix UI International Orange Colorscale 1-12 (light)
        primary: {
          1: "#fefcfb",
          2: "#fff5f1",
          3: "#ffe8de",
          4: "#ffd7c7",
          5: "#ffc9b4",
          6: "#ffb89f",
          7: "#ffa284",
          8: "#fb8765",
          9: "#ff4f00",
          10: "#f14000",
          11: "#de3500",
          12: "#5d291a",
          DEFAULT: "#ff4f00",
          foreground: "#5d291a",
        },
      },
    },
    plugins: [],
    important: true
  }
}