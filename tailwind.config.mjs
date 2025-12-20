/** @type {import('tailwindcss').Config} */
export default {
  content: ["./entry/**/*.html", "./src/**/*.{svelte,js,ts}"],
  theme: {
    extend: {
      keyframes: {
        fadeIn: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.8s ease-out",
      },
    },
  },
  plugins: [
    function ({ addBase }) {
      addBase({
        ":root": {
          fontFamily: '"Inter", system-ui, Avenir, Helvetica, Arial, sans-serif',
          lineHeight: "1.5",
          fontWeight: "400",
          colorScheme: "dark",
          color: "rgba(255, 255, 255, 0.87)",
          backgroundColor: "#24243e",
          fontSynthesis: "none",
          textRendering: "optimizeLegibility",
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
        },
        body: {
          margin: "0",
          minHeight: "100vh",
          minWidth: "320px",
        },
        a: {
          fontWeight: "500",
          color: "#646cff",
          textDecoration: "none",
        },
        "a:hover": {
          color: "#535bf2",
        },
        h1: {
          fontSize: "3.2em",
          lineHeight: "1.1",
        },
        button: {
          cursor: "pointer",
          borderRadius: "8px",
          borderWidth: "1px",
          borderColor: "transparent",
          backgroundColor: "#1a1a1a",
          padding: "0.6em 1.2em",
          fontSize: "1em",
          fontWeight: "500",
          fontFamily: "inherit",
          transition: "border-color 0.25s",
        },
        "button:hover": {
          borderColor: "#646cff",
        },
        "button:focus, button:focus-visible": {
          outline: "4px auto -webkit-focus-ring-color",
        },
      });
    },
  ],
};
