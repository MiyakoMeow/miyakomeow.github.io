import type { Plugin, ResolvedConfig } from "vite";
import { readFile, writeFile } from "node:fs/promises";

/**
 * Vite插件：在BMS表格页面的HTML中注入bmstable meta标签（作为后备方案）
 *
 * 注意：主要的 meta 标签注入由 hooks.server.ts 和 hooks.ts 处理
 * 这个插件只作为构建时的后备方案，确保不会有遗漏
 */
export function bmstableMetaPlugin(): Plugin {
  let config: ResolvedConfig;

  return {
    name: "bmstable-meta-injection",
    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },
    // 在构建后处理HTML文件（作为后备）
    async writeBundle() {
      // 对于静态站点，最终输出在 build 目录
      const outDir = "build";
      const bmsPaths = [
        `${outDir}/bms/table/self-sp/index.html`,
        `${outDir}/bms/table/self-dp/index.html`,
      ];

      // 处理固定路径（self-sp 和 self-dp）
      for (const filePath of bmsPaths) {
        try {
          const html = await readFile(filePath, "utf-8");
          const bmstableMeta = `<meta name="bmstable" content="./header.json" />`;
          const modifiedHtml = html.replace("%bmstable.meta%", bmstableMeta);
          await writeFile(filePath, modifiedHtml, "utf-8");
          console.log(`[bmstable-meta] Injected meta into ${filePath}`);
        } catch (e) {
          // 文件不存在或已被 hooks 处理，跳过
        }
      }

      // 注意：table-mirror 路径由 hooks.server.ts 处理
      // hooks 会读取 tables_proxy.json 并注入完整的 headerUrl
      // 这里不再需要处理 table-mirror
    },
  };
}
