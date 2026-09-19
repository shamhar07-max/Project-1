/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#183444",
        muted: "#61717a",
        line: "#d9e4de",
        teal: "#157a6e",
        navy: "#12324a",
        mint: "#e7f3ef",
        gold: "#c38a33",
        rose: "#af4b34"
      },
      fontFamily: {
        serif: ['"Fraunces"', "serif"],
        sans: ['"Libre Franklin"', "sans-serif"]
      }
    }
  },
  plugins: []
};
