/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#1E6EB7",
          accent: "#4AA9E2",
          light: "#EAF4FC",
        },
      },
    },
  },
  presets: [require("nativewind/preset")],
  plugins: [],
};
