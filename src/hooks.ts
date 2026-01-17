import { deLocalizeUrl } from "./lib/paraglide/runtime.js";

export const reroute = ({ url }: { url: URL }) => deLocalizeUrl(url).pathname;

export const transport = {};

// BMS表格路径模式
const BMS_TABLE_PATTERNS = [
  /^\/bms\/table\/self-sp\/?$/,
  /^\/bms\/table\/self-dp\/?$/,
  /^\/bms\/table-mirror\/[^/]+\/?$/,
];

// 检查是否为BMS表格页面
function isBmsTablePath(pathname: string): boolean {
  return BMS_TABLE_PATTERNS.some((pattern) => pattern.test(pathname));
}

// 注意：这个hook主要用于开发模式
// 构建时由 hooks.server.ts 处理，它会读取 tables_proxy.json 并注入完整的 headerUrl
export const handle = async ({ event, resolve }: any) => {
  const response = await resolve(event);

  // 只处理HTML响应
  const contentType = response.headers.get("content-type");
  if (!contentType?.includes("text/html")) {
    return response;
  }

  const pathname = event.url.pathname;

  // 读取并修改HTML
  const html = await response.text();
  let modifiedHtml = html;

  if (isBmsTablePath(pathname)) {
    // BMS表格页面 - 统一使用相对路径
    // 注意：开发模式下 table-mirror 也使用相对路径
    // 构建时由 hooks.server.ts 处理并注入完整的 headerUrl
    const bmstableMeta = `<meta name="bmstable" content="./header.json" />`;
    modifiedHtml = html.replace("%bmstable.meta%", bmstableMeta);
  } else {
    // 非BMS表格页面，移除占位符
    modifiedHtml = html.replace("%bmstable.meta%", "");
  }

  return new Response(modifiedHtml, {
    headers: response.headers,
  });
};
