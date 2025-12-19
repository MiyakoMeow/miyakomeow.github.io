import { defineConfig } from "vite";
import { svelte, vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";
import { readdirSync } from "fs";
import { relative } from "path";

// 递归扫描 entry 目录下所有 .html 文件作为构建入口（保持路径不变）
const entryRoot = resolve(__dirname, "entry");
function collectHtmlFiles(dir: string, acc: string[] = []): string[] {
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = resolve(dir, e.name);
    if (e.isDirectory()) {
      collectHtmlFiles(full, acc);
    } else if (e.isFile() && e.name.endsWith(".html")) {
      acc.push(full);
    }
  }
  return acc;
}

const dynamicInputs: Record<string, string> = {};
for (const file of collectHtmlFiles(entryRoot)) {
  const rel = relative(entryRoot, file).split("\\").join("/");
  const key = rel === "index.html" ? "main" : rel.replace(/\.html$/, "");
  dynamicInputs[key] = file;
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte({ preprocess: vitePreprocess({ script: true }) }), tailwindcss()],
  root: resolve(__dirname, "entry"),
  publicDir: resolve(__dirname, "public"),
  base: "./",
  define: {
    "process.env": {},
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  server: {
    host: "0.0.0.0",
    fs: { allow: [".."] },
  },
  build: {
    outDir: resolve(__dirname, "dist"),
    emptyOutDir: true,
    rollupOptions: {
      input: dynamicInputs,
    },
  },
});
