import type { Plugin, ResolvedConfig } from "vite";
import { readFile, writeFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Vite插件：在BMS表格页面的HTML中注入bmstable meta标签
 * 确保meta标签在所有link标签之前
 */
export function bmstableMetaPlugin(): Plugin {
  let config: ResolvedConfig;

  return {
    name: "bmstable-meta-injection",
    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },
    // 在构建后处理HTML文件
    async writeBundle() {
      // 对于静态站点，最终输出在 build 目录
      const outDir = "build";
      const bmsPaths = [
        `${outDir}/bms/table/self-sp/index.html`,
        `${outDir}/bms/table/self-dp/index.html`,
      ];

      // 处理固定路径
      for (const filePath of bmsPaths) {
        try {
          const html = await readFile(filePath, "utf-8");
          const bmstableMeta = `<meta name="bmstable" content="./header.json" />`;
          const modifiedHtml = html.replace("%bmstable.meta%", bmstableMeta);
          await writeFile(filePath, modifiedHtml, "utf-8");
          console.log(`[bmstable-meta] Injected meta into ${filePath}`);
        } catch (e) {
          // 文件不存在，跳过
        }
      }

      // 处理table-mirror动态路径
      const { readdir } = await import("node:fs/promises");
      try {
        // 读取 tables_proxy.json 获取 headerUrl 映射
        const proxyPath = join("static", "bms", "table-mirror", "tables_proxy.json");
        const tablesProxy = JSON.parse(
          readFileSync(proxyPath, "utf-8")
        ) as Array<{ dir_name: string; url: string }>;

        // 创建 dir_name 到 url 的映射
        const urlMap = new Map<string, string>();
        for (const table of tablesProxy) {
          if (table.dir_name) {
            urlMap.set(table.dir_name, table.url);
          }
        }

        const mirrorDir = `${outDir}/bms/table-mirror`;
        const dirs = await readdir(mirrorDir, { withFileTypes: true });
        for (const dir of dirs) {
          if (dir.isDirectory()) {
            const filePath = `${mirrorDir}/${dir.name}/index.html`;
            try {
              const html = await readFile(filePath, "utf-8");

              // 从映射中查找对应的 headerUrl
              const headerUrl = urlMap.get(dir.name);

              if (headerUrl) {
                // 使用完整的 headerUrl
                const bmstableMeta = `<meta name="bmstable" content="${headerUrl}" />`;

                // 检查占位符是否存在
                if (!html.includes("%bmstable.meta%")) {
                  console.warn(
                    `[bmstable-meta] Placeholder not found in ${filePath}, skipping`,
                  );
                  continue;
                }

                const modifiedHtml = html.replace("%bmstable.meta%", bmstableMeta);
                await writeFile(filePath, modifiedHtml, "utf-8");
                console.log(
                  `[bmstable-meta] Injected meta into ${filePath} with URL: ${headerUrl}`,
                );
              } else {
                // 如果找不到对应的 URL，使用相对路径作为后备
                console.warn(
                  `[bmstable-meta] No URL found for ${dir.name}, using relative path`,
                );
                const bmstableMeta = `<meta name="bmstable" content="./header.json" />`;
                const modifiedHtml = html.replace("%bmstable.meta%", bmstableMeta);
                await writeFile(filePath, modifiedHtml, "utf-8");
              }
            } catch (e) {
              // 文件不存在或读取失败，跳过
              console.error(`[bmstable-meta] Failed to process ${filePath}:`, e);
            }
          }
        }
      } catch (e) {
        // table-mirror目录不存在或读取失败，跳过
        console.error("[bmstable-meta] Failed to process table-mirror:", e);
      }

      // 处理所有其他HTML，移除占位符
      // 这里我们不需要做额外处理，因为如果不存在%bmstable.meta%，replace不会有任何效果
    },
    // 同时也处理开发模式
    transformIndexHtml: {
      order: "pre",
      handler(html, { path }) {
        // 规范化路径
        const normalizedPath = path
          .replace(/^\.\//, "")
          .replace(/\/index\.html$/, "/")
          .replace(/^\/?/, "/");

        // BMS表格路径模式
        const bmsTablePatterns = [
          /^\/bms\/table\/self-sp\/$/,
          /^\/bms\/table\/self-dp\/$/,
          /^\/bms\/table-mirror\/[^/]+\/$/,
        ];

        const isBmsTable = bmsTablePatterns.some((pattern) =>
          pattern.test(normalizedPath)
        );

        if (isBmsTable) {
          console.log(`[bmstable-meta] Processing BMS table: ${normalizedPath}`);
          const bmstableMeta = `<meta name="bmstable" content="./header.json" />`;
          return html.replace("%bmstable.meta%", bmstableMeta);
        }

        return html.replace("%bmstable.meta%", "");
      },
    },
  };
}
