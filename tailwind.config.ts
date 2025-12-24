import type { Config } from "tailwindcss";
type CssInJs = {
  [key: string]: string | string[] | CssInJs | CssInJs[];
};

export default {
  content: ["./.temp-html/**/*.html", "./src/**/*.{svelte,js,ts}", "./src/content/**/*.md"],
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
    function ({ addBase }: { addBase: (base: CssInJs) => void }) {
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
        ".markdown-content": {
          "& h1": {
            fontSize: "2.5rem",
            fontWeight: "bold",
            marginTop: "2rem",
            marginBottom: "1rem",
            color: "white",
            textShadow: "0 2px 4px rgba(0,0,0,0.5)",
          },
          "& h2": {
            fontSize: "2rem",
            fontWeight: "bold",
            marginTop: "1.5rem",
            marginBottom: "0.75rem",
            color: "white",
          },
          "& h3": {
            fontSize: "1.5rem",
            fontWeight: "bold",
            marginTop: "1.25rem",
            marginBottom: "0.5rem",
            color: "white",
          },
          "& p": {
            marginBottom: "1rem",
            lineHeight: "1.6",
            color: "rgba(255, 255, 255, 0.9)",
          },
          "& a": {
            color: "#64b5f6",
            textDecoration: "underline",
            "&:hover": {
              color: "#42a5f5",
            },
          },
          "& code": {
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            padding: "0.2rem 0.4rem",
            borderRadius: "0.25rem",
            fontSize: "0.9em",
            fontFamily: "monospace",
          },
          "& pre": {
            backgroundColor: "rgba(0, 0, 0, 0.3)",
            borderRadius: "0.5rem",
            padding: "1rem",
            overflow: "auto",
            marginBottom: "1rem",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          },
          "& blockquote": {
            borderLeft: "4px solid rgba(100, 181, 246, 0.5)",
            paddingLeft: "1rem",
            marginLeft: "0",
            marginRight: "0",
            fontStyle: "italic",
            color: "rgba(255, 255, 255, 0.8)",
          },
          "& ul, & ol": {
            marginBottom: "1rem",
            paddingLeft: "1.5rem",
          },
          "& li": {
            marginBottom: "0.5rem",
            color: "rgba(255, 255, 255, 0.9)",
          },
          "& table": {
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: "1rem",
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            borderRadius: "0.5rem",
            overflow: "hidden",
          },
          "& th, & td": {
            border: "1px solid rgba(255, 255, 255, 0.1)",
            padding: "0.75rem",
            textAlign: "left",
          },
          "& th": {
            backgroundColor: "rgba(100, 181, 246, 0.2)",
            fontWeight: "bold",
            color: "white",
          },
          "& .katex": {
            fontSize: "1.1em",
          },
        },
      });
    },
  ],
} satisfies Config;
