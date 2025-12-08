import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  root: resolve(__dirname, "entry"),
  publicDir: resolve(__dirname, "public"),
  base: "./",
  define: {
    "process.env": {},
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    fs: { allow: [".."] },
  },
  build: {
    outDir: resolve(__dirname, "dist"),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "entry/index.html"),
        "bms/index": resolve(__dirname, "entry/bms/index.html"),
        "bms/self-table-sp": resolve(__dirname, "entry/bms/self-table-sp/index.html"),
        "bms/self-table-dp": resolve(__dirname, "entry/bms/self-table-dp/index.html"),
      },
    },
  },
});
