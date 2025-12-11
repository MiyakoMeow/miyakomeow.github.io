/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{ts,tsx}", "./entry/**/*.html"],
  theme: {
    extend: {
      // 从main.pcss的:root变量转换而来
      colors: {
        primary: {
          light: "#646cff",
          DEFAULT: "#535bf2",
          dark: "#1a1a1a",
        },
        background: "#24243e",
        text: {
          primary: "rgba(255, 255, 255, 0.87)",
        },
      },
      fontFamily: {
        sans: ['"Inter"', "system-ui", "Avenir", "Helvetica", "Arial", "sans-serif"],
      },
      fontSize: {
        "3.2em": "3.2em",
        "2.5rem": "2.5rem",
      },
      lineHeight: {
        1.1: "1.1",
      },
      fontWeight: {
        400: "400",
      },
      // 自定义动画
      animation: {
        fadeIn: "fadeIn 0.8s ease-out",
      },
      keyframes: {
        fadeIn: {
          from: {
            opacity: "0",
            transform: "translateY(20px)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
      },
      // 自定义阴影
      boxShadow: {
        glass: "0 8px 32px rgba(0,0,0,0.3)",
        "glass-card": "0 4px 30px rgba(0,0,0,0.1)",
        avatar: "0 0 20px rgba(255,255,255,0.2)",
      },
      // 自定义文本阴影
      textShadow: {
        title: "0 2px 4px rgba(0, 0, 0, 0.5)",
      },
      // 自定义边框半径
      borderRadius: {
        20: "20px",
        16: "16px",
        8: "8px",
      },
      // 自定义间距
      spacing: {
        "1.2em": "1.2em",
        "0.6em": "0.6em",
      },
      // 自定义最小尺寸
      minWidth: {
        320: "320px",
      },
      // 自定义背景模糊
      backdropBlur: {
        10: "10px",
      },
      // 自定义边框
      borderColor: {
        "white/10": "rgba(255, 255, 255, 0.1)",
        "white/20": "rgba(255, 255, 255, 0.2)",
        "white/30": "rgba(255, 255, 255, 0.3)",
      },
      // 自定义背景透明度
      backgroundColor: {
        "white/10": "rgba(255, 255, 255, 0.1)",
        "white/15": "rgba(255, 255, 255, 0.15)",
        "white/20": "rgba(255, 255, 255, 0.2)",
        "black/20": "rgba(0, 0, 0, 0.2)",
      },
    },
  },
  plugins: [
    // 添加文本阴影插件
    function ({ addUtilities }) {
      addUtilities({
        ".text-shadow-title": {
          "text-shadow": "0 2px 4px rgba(0, 0, 0, 0.5)",
        },
      });
    },
  ],
};
