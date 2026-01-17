import type { Handle } from "@sveltejs/kit";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const BMS_TABLE_PATTERNS = [
  /^\/bms\/table\/self-sp\/?$/,
  /^\/bms\/table\/self-dp\/?$/,
  /^\/bms\/table-mirror\/[^/]+\/?$/,
];

/**
 * 检查是否为BMS表格页面
 */
function isBmsTablePath(pathname: string): boolean {
  return BMS_TABLE_PATTERNS.some((pattern) => pattern.test(pathname));
}

/**
 * 从 tables_proxy.json 获取 dir_name 对应的 headerUrl
 */
function getHeaderUrlForDirName(dirName: string): string | null {
  try {
    const proxyPath = join("static", "bms", "table-mirror", "tables_proxy.json");
    const tablesProxy = JSON.parse(
      readFileSync(proxyPath, "utf-8")
    ) as Array<{ dir_name: string; url: string }>;

    const table = tablesProxy.find((t) => t.dir_name === dirName);
    return table?.url || null;
  } catch (error) {
    console.error(`Failed to load headerUrl for ${dirName}:`, error);
    return null;
  }
}

/**
 * 生成 bmstable meta 标签内容
 */
function generateBmstableMeta(pathname: string): string {
  // self-sp 或 self-dp，使用相对路径
  const tableMirrorMatch = pathname.match(/^\/bms\/table-mirror\/([^/]+)\/?$/);
  if (!tableMirrorMatch) {
    return `<meta name="bmstable" content="./header.json" />`;
  }

  // table-mirror 路径，从 tables_proxy.json 获取完整的 headerUrl
  const dirName = decodeURIComponent(tableMirrorMatch[1]);
  const headerUrl = getHeaderUrlForDirName(dirName);

  if (headerUrl) {
    return `<meta name="bmstable" content="${headerUrl}" />`;
  }

  // 找不到对应的 URL，使用相对路径作为后备
  console.warn(`No headerUrl found for ${dirName}, using relative path`);
  return `<meta name="bmstable" content="./header.json" />`;
}

export const handle: Handle = async ({ event, resolve }) => {
  const response = await resolve(event);

  // 非HTML响应，直接返回
  const contentType = response.headers.get("content-type");
  if (!contentType?.includes("text/html")) {
    return response;
  }

  const html = await response.text();
  const pathname = event.url.pathname;

  // BMS表格页面，注入 bmstable meta 标签
  if (isBmsTablePath(pathname)) {
    const bmstableMeta = generateBmstableMeta(pathname);
    return new Response(html.replace("%bmstable.meta%", bmstableMeta), {
      headers: response.headers,
    });
  }

  // 非BMS表格页面，移除占位符
  return new Response(html.replace("%bmstable.meta%", ""), {
    headers: response.headers,
  });
};
