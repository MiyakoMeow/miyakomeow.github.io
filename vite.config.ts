import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: "./",
  define: {
    "process.env": {},
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        "bms/self-table-sp": resolve(__dirname, "bms/self-table-sp/index.html"),
        "bms/self-table-dp": resolve(__dirname, "bms/self-table-dp/index.html"),
      },
    },
  },
});
