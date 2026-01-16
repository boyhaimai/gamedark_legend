import { nextui } from "@nextui-org/react";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      xs: "300px",
      sm: "400px",
    },
    transitionTimingFunction: {
      expo: "cubic-bezier(0.5, 1.5, 0.8, 1)",
      "expo-in": "cubic-bezier(0.95, 0.05, 0.795, 0.035)",
      "expo-out": "cubic-bezier(0.19, 1, 0.22, 1)",
    },
    keyframes: {
      tableRow: {
        from: {
          opacity: "0%",
          transform: "translateY(1rem) scaleY(110%)",
        },
        to: {
          opacity: "100%",
          transform: "translateY(0)",
        },
      },
      slideLeft: {
        "0%": { transform: "translateX(0%)" },
        "100%": { transform: "translateX(-100%)" },
      },
    },
    animation: {
      tableRow: "tableRow 0.5s forwards",
      slideLeft: "slideLeft 0.5s forwards",
    },
    extend: {
      fontFamily: {
        "ibm-plex": "var(--font-ibm-plex)",
        "lilita-one": "var(--font-lilita-one)",
        "day-ones": "var(--font-day-ones)",
        "korolev-compressed": "var(--font-korolev-compressed)",
        sans: ["'Lilita One'", 'sans-serif'],
      },
      backgroundImage: {
        "custom-gradient-1":
          "linear-gradient(180deg, #FFFFFF 0%, #FFD49C 100%)",
      },
      colors: {
        "ui-background": "var(--ui-background)",
        "ui-background-1": "var(--ui-background-1)",
        "ui-background-2": "var(--ui-background-2)",
        "ui-background-3": "var(--ui-background-3)",
        "t-secondary": "var(--text-secondary)",
        "t-green-70": "var(--green-70)",
        "t-green1": "var(--green1)",
        "t-blue-1": "var(--blue-1)",
        "t-brown-1": "var(--brown-1)",
        "t-yellow-1": "var(--yellow-1)",
        "color-success-full": "var(--success-full)",
      },
    },
  },
  darkMode: "class",
  plugins: [
    nextui(),
    function ({ addUtilities }) {
      const newUtilities = {
        ".text-custom-2xs-regular": {
          fontSize: 10,
          lineHeight: "12px",
          fontWeight: 900,
        },
        ".text-custom-2xs-medium": {
          fontSize: 10,
          lineHeight: "12px",
          fontWeight: 900,
        },
        ".text-custom-2xs-semi-bold": {
          fontSize: 10,
          lineHeight: "12px",
          fontWeight: 900,
        },
        ".text-custom-2xs-bold": {
          fontSize: 10,
          lineHeight: "12px",
          fontWeight: 900,
        },
        ".text-custom-xs-regular": {
          fontSize: 12,
          lineHeight: "16px",
          fontWeight: 900,
        },
        ".text-custom-xs-medium": {
          fontSize: 12,
          lineHeight: "16px",
          fontWeight: 900,
        },
        ".text-custom-xs-semi-bold": {
          fontSize: 12,
          lineHeight: "16px",
          fontWeight: 900,
        },
        ".text-custom-xs-bold": {
          fontSize: 12,
          lineHeight: "16px",
          fontWeight: 900,
        },
        ".text-custom-sm-regular": {
          fontSize: 14,
          lineHeight: "20px",
          fontWeight: 900,
        },
        ".text-custom-sm-medium": {
          fontSize: 14,
          lineHeight: "20px",
          fontWeight: 900,
        },
        ".text-custom-sm-semi-bold": {
          fontSize: 14,
          lineHeight: "20px",
          fontWeight: 900,
        },
        ".text-custom-sm-bold": {
          fontSize: 14,
          lineHeight: "20px",
          fontWeight: 900,
        },
        ".text-custom-base-regular": {
          fontSize: 16,
          lineHeight: "24px",
          fontWeight: 900,
        },
        ".text-custom-base-medium": {
          fontSize: 16,
          lineHeight: "24px",
          fontWeight: 900,
        },
        ".text-custom-base-semi-bold": {
          fontSize: 16,
          lineHeight: "24px",
          fontWeight: 900,
        },
        ".text-custom-base-bold": {
          fontSize: 16,
          lineHeight: "24px",
          fontWeight: 900,
        },
        ".text-custom-lg-regular": {
          fontSize: 18,
          lineHeight: "28px",
          fontWeight: 900,
        },
        ".text-custom-lg-medium": {
          fontSize: 18,
          lineHeight: "28px",
          fontWeight: 900,
        },
        ".text-custom-lg-semi-bold": {
          fontSize: 18,
          lineHeight: "28px",
          fontWeight: 900,
        },
        ".text-custom-lg-bold": {
          fontSize: 18,
          lineHeight: "28px",
          fontWeight: 900,
        },
        ".text-custom-xl-regular": {
          fontSize: 20,
          lineHeight: "28px",
          fontWeight: 900,
        },
        ".text-custom-xl-medium": {
          fontSize: 20,
          lineHeight: "28px",
          fontWeight: 900,
        },
        ".text-custom-xl-semi-bold": {
          fontSize: 20,
          lineHeight: "28px",
          fontWeight: 900,
        },
        ".text-custom-xl-bold": {
          fontSize: 20,
          lineHeight: "28px",
          fontWeight: 900,
        },
        ".text-custom-2xl-regular": {
          fontSize: 24,
          lineHeight: "36px",
          fontWeight: 900,
        },
        ".text-custom-2xl-medium": {
          fontSize: 24,
          lineHeight: "36px",
          fontWeight: 900,
        },
        ".text-custom-2xl-semi-bold": {
          fontSize: 24,
          lineHeight: "36px",
          fontWeight: 900,
        },
        ".text-custom-2xl-bold": {
          fontSize: 24,
          lineHeight: "36px",
          fontWeight: 900,
        },
        ".text-custom-3xl-regular": {
          fontSize: 28,
          lineHeight: "36px",
          fontWeight: 900,
        },
        ".text-custom-3xl-medium": {
          fontSize: 28,
          lineHeight: "36px",
          fontWeight: 900,
        },
        ".text-custom-3xl-semi-bold": {
          fontSize: 28,
          lineHeight: "36px",
          fontWeight: 900,
        },
        ".text-custom-3xl-bold": {
          fontSize: 28,
          lineHeight: "36px",
          fontWeight: 900,
        },
        ".text-custom-4xl-regular": {
          fontSize: 32,
          lineHeight: "38.73px",
          fontWeight: 900,
        },
        ".text-custom-4xl-medium": {
          fontSize: 32,
          lineHeight: "38.73px",
          fontWeight: 900,
        },
        ".text-custom-4xl-semi-bold": {
          fontSize: 32,
          lineHeight: "38.73px",
          fontWeight: 900,
        },
        ".text-custom-4xl-bold": {
          fontSize: 32,
          lineHeight: "38.73px",
          fontWeight: 900,
        },
        ".text-custom-5xl-regular": {
          fontSize: 48,
          lineHeight: "56px",
          fontWeight: 900,
        },
        ".text-custom-5xl-medium": {
          fontSize: 48,
          lineHeight: "56px",
          fontWeight: 900,
        },
        ".text-custom-5xl-semi-bold": {
          fontSize: 48,
          lineHeight: "56px",
          fontWeight: 900,
        },
        ".text-custom-5xl-bold": {
          fontSize: 48,
          lineHeight: "56px",
          fontWeight: 900,
        },
        ".text-custom-40-regular": {
          fontSize: 40,
          lineHeight: "48px",
          fontWeight: 900,
        },
        ".text-custom-40-medium": {
          fontSize: 40,
          lineHeight: "48px",
          fontWeight: 900,
        },
        ".text-custom-40-semi-bold": {
          fontSize: 40,
          lineHeight: "48px",
          fontWeight: 900,
        },
        ".text-custom-40-bold": {
          fontSize: 40,
          lineHeight: "48px",
          fontWeight: 900,
        },
        ".text-custom-96-medium": {
          fontSize: 96,
          lineHeight: "96px",
          fontWeight: 900,
        },
      };
      addUtilities(newUtilities);
    },
  ],
};
