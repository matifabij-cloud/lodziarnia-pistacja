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
        // Akcent owocowy — malina
        raspberry: {
          50: "#FDF1F5",
          100: "#FBE3EA",
          200: "#F5C6D4",
          400: "#E36B8A",
          500: "#BE2F58", // akcent CTA (biały tekst, WCAG AA)
          600: "#A52949",
          700: "#86203B",
        },
        // Akcent owocowy — jagoda (fioletowe lody)
        blueberry: {
          50: "#F2F0FB",
          100: "#E3DDF6",
          200: "#C9BEEE",
          500: "#6D4AA7",
          700: "#4A3287", // nagłówki / mocny tekst (WCAG AA na jasnym tle)
          800: "#3A2769",
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
