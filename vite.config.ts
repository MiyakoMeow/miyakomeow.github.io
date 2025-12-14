import {
  defineConfig,
  type Plugin,
  type ViteDevServer,
  type IndexHtmlTransformContext,
  type Connect,
} from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import tailwindcss from "@tailwindcss/vite";
import { resolve, relative, join } from "path";
import { readdirSync, readFileSync, existsSync } from "fs";
import type { ServerResponse } from "node:http";

// Load tables_proxy.json
const projectRoot = resolve(__dirname);
const publicDir = resolve(projectRoot, "public");
const tablesProxyPath = resolve(publicDir, "bms/table-mirror/tables_proxy.json");

interface TableMirrorItem {
  dir_name: string;
  url: string;
  url_ori?: string | null;
}

let tableMirrorItems: TableMirrorItem[] = [];
if (existsSync(tablesProxyPath)) {
  try {
    tableMirrorItems = JSON.parse(readFileSync(tablesProxyPath, "utf-8"));
  } catch (e) {
    console.error("Failed to load tables_proxy.json", e);
  }
}

// Load template
const templatePath = resolve(projectRoot, "entry/bms/table/self-sp/index.html");
let mirrorTemplate = "";
if (existsSync(templatePath)) {
  mirrorTemplate = readFileSync(templatePath, "utf-8");
}

const entryRoot = resolve(__dirname, "entry");

// Helper to normalize paths to forward slashes (Vite uses forward slashes)
function normalizePath(p: string): string {
  return p.replace(/\\/g, "/");
}

// 递归扫描 entry 目录下所有 .html 文件作为构建入口（保持路径不变）
function collectHtmlFiles(dir: string, acc: string[] = []): string[] {
  if (!existsSync(dir)) return acc;
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
  dynamicInputs[key] = normalizePath(file);
}

// Add virtual entries for table mirror
// We use absolute paths that *look* like real files inside entry/bms/table-mirror/
// This way Vite's HTML plugin can handle them (mostly), and we intercept them with a plugin.
const mirrorBaseDir = resolve(entryRoot, "bms/table-mirror");
const mirrorBaseDirNormalized = normalizePath(mirrorBaseDir);

tableMirrorItems.forEach((item) => {
  const dirName = item.dir_name;
  if (dirName) {
    const key = `bms/table-mirror/${dirName}/index`;
    // We use a fake absolute path that would be the location of the file if it existed
    const fakePath = join(mirrorBaseDir, dirName, "index.html");
    if (!dynamicInputs[key]) {
      dynamicInputs[key] = normalizePath(fakePath);
    }
  }
});

// Plugin to intercept the fake absolute paths
const virtualMirrorPlugin = (): Plugin => {
  function getMirrorPageContent(dirName: string): string | undefined {
    const item = tableMirrorItems.find((i) => i.dir_name === dirName);
    if (!item || !mirrorTemplate) return undefined;

    let content = mirrorTemplate;
    // Replace ./header.json with item.url (proxy url)
    content = content.replace(/content="\.\/header\.json"/g, `content="${item.url}"`);
    content = content.replace(/header:\s*"\.\/header\.json"/g, `header: "${item.url}"`);

    // Replace origin_url: null with origin_url: "url_ori"
    const originUrl = item.url_ori ? `"${item.url_ori}"` : "null";
    content = content.replace(/origin_url:\s*null/g, `origin_url: ${originUrl}`);

    // Replace relative import with alias
    content = content.replace(
      /import BMSTable from ".*\/src\/pages\/BMSTable\.tsx"/,
      'import BMSTable from "@/pages/BMSTable.tsx"'
    );

    return content;
  }

  return {
    name: "virtual-bms-mirror-pages",
    enforce: "pre", // Run before Vite's core plugins to intercept the file access
    configureServer(server: ViteDevServer) {
      server.middlewares.use(
        async (req: Connect.IncomingMessage, res: ServerResponse, next: Connect.NextFunction) => {
          const url = decodeURI(req.url || "").split("?")[0];
          // Only handle requests that might map to our virtual pages
          // We expect URLs starting with /bms/table-mirror/
          // And we handle implicit index.html or trailing slash

          let targetPath = url;
          if (targetPath.endsWith("/")) {
            targetPath += "index.html";
          } else if (!targetPath.endsWith(".html")) {
            // If it looks like a directory but no slash, usually we redirect,
            // but here let's just check if adding /index.html matches a virtual page.
            // Or strictly require trailing slash. Let's try adding /index.html
            targetPath += "/index.html";
          }

          // Map URL to absolute path structure
          // root is "entry", so absolute path is join(entryRoot, targetPath.replace(/^\//, ''))
          const absolutePath = resolve(entryRoot, targetPath.replace(/^\//, ""));
          const normalizedAbsPath = normalizePath(absolutePath);

          if (
            normalizedAbsPath.startsWith(mirrorBaseDirNormalized) &&
            normalizedAbsPath.endsWith("index.html")
          ) {
            const isVirtual =
              Object.values(dynamicInputs).includes(normalizedAbsPath) && !existsSync(absolutePath);
            if (isVirtual) {
              // Extract dirName
              const rel = normalizedAbsPath.slice(mirrorBaseDirNormalized.length + 1);
              const dirName = rel.split("/")[0];

              const content = getMirrorPageContent(dirName);
              if (content) {
                try {
                  const transformedHtml = await server.transformIndexHtml(req.url || "/", content);
                  res.setHeader("Content-Type", "text/html");
                  res.end(transformedHtml);
                  return;
                } catch (e) {
                  const err = e as Error;
                  server.ssrFixStacktrace(err);
                  console.error(err);
                  res.statusCode = 500;
                  res.end(err.message);
                  return;
                }
              }
            }
          }
          next();
        }
      );
    },
    resolveId(id: string) {
      // Check if this ID corresponds to one of our virtual mirror pages
      // The id might come in normalized or not, so we check if it starts with the mirror base dir
      // and ends with index.html, and if it's one of the items we added.
      // Note: id here is usually an absolute path.
      const normalizedId = normalizePath(id);
      if (normalizedId.startsWith(mirrorBaseDirNormalized) && normalizedId.endsWith("index.html")) {
        // Extract dirName
        // mirrorBaseDir + separator + dirName + separator + index.html
        // We can just check if it matches one of our dynamicInputs values
        const isVirtual = Object.values(dynamicInputs).includes(normalizedId) && !existsSync(id);
        if (isVirtual) {
          return normalizedId; // Claim this ID
        }
      }
    },
    load(id: string) {
      const normalizedId = normalizePath(id);
      if (normalizedId.startsWith(mirrorBaseDirNormalized) && normalizedId.endsWith("index.html")) {
        // Double check it's virtual
        const isVirtual = Object.values(dynamicInputs).includes(normalizedId) && !existsSync(id);
        if (isVirtual) {
          // Extract dirName to find the item
          // id = .../bms/table-mirror/{dirName}/index.html
          const rel = normalizedId.slice(mirrorBaseDirNormalized.length + 1); // +1 for the slash
          // rel should be {dirName}/index.html
          const dirName = rel.split("/")[0];

          return getMirrorPageContent(dirName);
        }
      }
    },
  };
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    virtualMirrorPlugin(),
    vue(),
    vueJsx(),
    tailwindcss(),
    {
      name: "inject-global-css",
      transformIndexHtml(html: string, ctx: IndexHtmlTransformContext) {
        const cssAbs = resolve(__dirname, "src/styles/main.css").split("\\").join("/");
        const href = ctx?.server ? `/@fs/${cssAbs}` : "@/styles/main.css";
        return [
          {
            tag: "script",
            attrs: { type: "module" },
            children: `import "${href}";`,
            injectTo: "head",
          },
        ];
      },
    },
  ],
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
  appType: "mpa",
  build: {
    outDir: resolve(__dirname, "dist"),
    emptyOutDir: true,
    rollupOptions: {
      input: dynamicInputs,
    },
  },
});
