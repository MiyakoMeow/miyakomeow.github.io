import { deLocalizeUrl } from "./lib/paraglide/runtime.js";

export const reroute = ({ url }: { url: URL }) => deLocalizeUrl(url).pathname;

export const transport = {};

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
 * 开发模式下的 hooks 处理
 * 注意：构建时由 hooks.server.ts 处理，它会读取 tables_proxy.json 并注入完整的 headerUrl
 */
export const handle = async ({ event, resolve }: any) => {
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
    const bmstableMeta = `<meta name="bmstable" content="./header.json" />`;
    return new Response(html.replace("%bmstable.meta%", bmstableMeta), {
      headers: response.headers,
    });
  }

  // 非BMS表格页面，移除占位符
  return new Response(html.replace("%bmstable.meta%", ""), {
    headers: response.headers,
  });
};
