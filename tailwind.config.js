/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Fredoka", "ui-sans-serif", "system-ui", "sans-serif"],
        body: ["Nunito", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        // Krem / wanilia — tło i powierzchnie
        cream: { 50: "#FFFDF7", 100: "#F7EFDD", 200: "#EFE3C7" },
        // Pistacjowa zieleń — kolor wiodący
        pistachio: {
          50: "#F0F6EA",
          100: "#DDEBCE",
          200: "#C3DBA6",
          300: "#A3C77A",
          400: "#83B156",
          500: "#669A41",
          600: "#477330", // przyciski (biały tekst, WCAG AA)
          700: "#37591F", // nagłówki / mocny tekst
          800: "#2B481D",
        },
        // Akcent owocowy — malina (przyciski „Zadzwoń", plakietki, akcenty)
        raspberry: {
          100: "#FBE3EA",
          400: "#E36B8A",
          500: "#BE2F58", // akcent CTA (biały tekst, WCAG AA)
          600: "#A52949",
          700: "#86203B",
        },
        // Tekst — ciepły grafit
        ink: {
          DEFAULT: "#2B2A26",
          muted: "#5C6657",
        },
      },
      keyframes: {
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.45" },
        },
      },
      animation: {
        "pulse-soft": "pulse-soft 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
