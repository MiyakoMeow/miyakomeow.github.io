/**
 * Vite插件：HTML生成器
 * 在构建前根据页面配置生成HTML文件
 */

import type { Plugin } from "vite";
import { dirname, join, normalize, relative, resolve } from "path";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "fs";
import { getAllPages } from "../config/pages.config";
import type { AnyPageConfig } from "../src/config/pages";

const TEMP_HTML_DIR = resolve(__dirname, "../.temp-html");
const TEMPLATE_PATH = resolve(__dirname, "../config/templates/base.html.template");

const normalizePathForCompare = (pathValue: string) => {
  const normalized = normalize(resolve(pathValue)).split("\\").join("/").replace(/\/+$/, "");
  return process.platform === "win32" ? normalized.toLowerCase() : normalized;
};

function escapeHtml(text: string): string {
  const escapeMap: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return text.replace(/[&<>"']/g, (char) => escapeMap[char] || char);
}

function generateHeadContent(pageConfig: AnyPageConfig): string {
  const lines: string[] = [];

  if (pageConfig.description) {
    lines.push(`<meta name="description" content="${escapeHtml(pageConfig.description)}" />`);
  }

  if (pageConfig.head) {
    for (const headItem of pageConfig.head) {
      const attrs = Object.entries(headItem.attributes)
        .map(([key, value]) => `${key}="${escapeHtml(value)}"`)
        .join(" ");

      if (headItem.content) {
        lines.push(`<${headItem.tag} ${attrs}>${escapeHtml(headItem.content)}</${headItem.tag}>`);
      } else {
        lines.push(`<${headItem.tag} ${attrs} />`);
      }
    }
  }

  return lines.join("\n    ");
}

function generateHtmlContent(pageConfig: AnyPageConfig, templatePath: string): string {
  let template = readFileSync(templatePath, "utf-8");

  template = template.replace("{{PAGE_TITLE}}", pageConfig.title);
  template = template.replace("{{COMPONENT_PATH}}", `@/${pageConfig.component}`);

  const propsJson = JSON.stringify(pageConfig.props || {});
  template = template.replace("{{PROPS_JSON}}", propsJson);

  const headContent = generateHeadContent(pageConfig);
  template = template.replace("{{HEAD_CONTENT}}", headContent);

  return template;
}

function generateHtmlFile(
  pageConfig: AnyPageConfig,
  outputDir: string,
  templatePath: string
): void {
  if (pageConfig.generateHtml === false) {
    return;
  }

  const htmlContent = generateHtmlContent(pageConfig, templatePath);
  const relativePath = pageConfig.path.startsWith("/") ? pageConfig.path.slice(1) : pageConfig.path;
  const outputPath = join(outputDir, relativePath, "index.html");

  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, htmlContent);
}

function generateHtmlFiles(
  pageConfigs: AnyPageConfig[],
  outputDir: string,
  templatePath: string
): void {
  console.log(`Generating ${pageConfigs.length} HTML files to ${outputDir}...`);

  let generatedCount = 0;
  for (const pageConfig of pageConfigs) {
    if (pageConfig.generateHtml !== false) {
      generateHtmlFile(pageConfig, outputDir, templatePath);
      generatedCount++;
    }
  }

  console.log(`Generated ${generatedCount} HTML files.`);
}

/**
 * HTML生成器Vite插件
 */
export default function htmlGeneratorPlugin(): Plugin {
  let generatedInputs: Record<string, string> = {};

  // 生成输入映射的函数
  const generateInputMapping = () => {
    const inputs: Record<string, string> = {};

    // 扫描临时目录下的HTML文件，生成Rollup输入映射
    const scanDir = (dir: string, baseDir: string) => {
      if (!existsSync(dir)) return;

      const items = readdirSync(dir, { withFileTypes: true });
      for (const item of items) {
        const fullPath = resolve(dir, item.name);
        if (item.isDirectory()) {
          scanDir(fullPath, baseDir);
        } else if (item.isFile() && item.name.endsWith(".html")) {
          const relPath = relative(baseDir, fullPath).split("\\").join("/");
          const key = relPath === "index.html" ? "main" : relPath.replace(/\.html$/, "");
          inputs[key] = fullPath;
        }
      }
    };

    scanDir(TEMP_HTML_DIR, TEMP_HTML_DIR);
    generatedInputs = inputs;
  };

  // 生成HTML文件的函数
  const generateHtmlFilesFn = async () => {
    try {
      // 清理临时目录（保留.gitkeep等隐藏文件）
      if (existsSync(TEMP_HTML_DIR)) {
        const items = readdirSync(TEMP_HTML_DIR, { withFileTypes: true });
        for (const item of items) {
          if (!item.name.startsWith(".")) {
            const itemPath = resolve(TEMP_HTML_DIR, item.name);
            if (item.isDirectory()) {
              rmSync(itemPath, { recursive: true, force: true });
            } else {
              rmSync(itemPath, { force: true });
            }
          }
        }
      }

      // 获取所有页面配置
      const allPages = getAllPages();

      // 生成HTML文件
      generateHtmlFiles(allPages, TEMP_HTML_DIR, TEMPLATE_PATH);

      // 更新输入映射
      generateInputMapping();
    } catch (error) {
      console.error("Failed to generate HTML files:", error);
      throw error;
    }
  };

  return {
    name: "html-generator",
    enforce: "pre",

    // 配置钩子：设置开发模式标志并返回构建配置
    async config(config) {
      // 确保临时目录存在
      if (!existsSync(TEMP_HTML_DIR)) {
        mkdirSync(TEMP_HTML_DIR, { recursive: true });
      }

      // 生成HTML文件
      await generateHtmlFilesFn();

      // 生成输入映射
      generateInputMapping();

      return {
        ...config,
        root: TEMP_HTML_DIR,
        build: {
          ...config.build,
          rollupOptions: {
            ...config.build?.rollupOptions,
            input: generatedInputs,
          },
        },
      };
    },

    // 在构建开始时生成HTML文件（已在config钩子中生成，此处留空）
    async buildStart() {
      // HTML文件已在config钩子中生成
    },

    // 配置开发服务器
    configureServer(server) {
      // 开发模式下也生成HTML文件
      generateHtmlFilesFn();

      // 监听页面配置和模板文件变化，重新生成HTML
      server.watcher.add(resolve(__dirname, "../config/pages.config.ts"));
      server.watcher.add(resolve(__dirname, "../config/templates"));
      server.watcher.add(resolve(__dirname, "../public/bms/table-mirror/tables_proxy.json"));
      server.watcher.add(resolve(__dirname, "../src/content/blog"));
      server.watcher.on("change", (file) => {
        if (
          file.includes("pages.config.ts") ||
          file.includes("templates") ||
          file.includes("tables_proxy.json") ||
          file.includes("src/content/blog")
        ) {
          console.log("Pages config or template changed, regenerating HTML files...");
          generateHtmlFilesFn();
          server.restart();
        }
      });
    },

    // 配置解析后确保root正确
    configResolved(config) {
      // 确保root指向临时目录
      if (normalizePathForCompare(config.root) !== normalizePathForCompare(TEMP_HTML_DIR)) {
        // 由于 config.root 是只读属性，无法直接赋值
        // 这里改为在 config 钩子中提前设置 root，或抛出警告提示用户手动调整
        console.warn(
          `[html-generator] 无法将 Vite 的 root 修改为 ${TEMP_HTML_DIR}，` +
            `请在 vite.config.ts 中手动设置 root: "${TEMP_HTML_DIR}"` +
            `当前 root: "${config.root}"`
        );
      }
    },
  };
}
