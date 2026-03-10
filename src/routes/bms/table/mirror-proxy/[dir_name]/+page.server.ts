import { readFileSync } from "node:fs";
import { join } from "node:path";

import { error } from "@sveltejs/kit";

import type { PageServerLoad } from "./$types";

interface TableProxyItem {
  dir_name: string;
  url: string;
  url_ori?: string;
}

function loadTablesProxy(): TableProxyItem[] {
  const jsonPath = join("static", "bms", "table", "mirror-proxy", "tables_proxy.json");
  const fileContent = readFileSync(jsonPath, "utf-8");
  return JSON.parse(fileContent) as TableProxyItem[];
}

export const prerender = true;

/**
 * 预渲染配置：告诉 SvelteKit 需要预渲染哪些路由
 * 在构建时执行，返回所有有效的 dir_name
 */
export function entries() {
  const tables_proxy = loadTablesProxy();

  const validTables = tables_proxy.filter(
    (item) => item.dir_name && item.dir_name.trim().length > 0
  );

  console.log(`[Prerender] Found ${validTables.length} tables to prerender`);

  return validTables.map((item) => ({
    dir_name: encodeURIComponent(item.dir_name),
  }));
}

/**
 * 服务端加载数据
 * 在构建时（预渲染）和运行时都会执行
 */
export const load: PageServerLoad = ({ params, locals }) => {
  const { dir_name } = params;

  try {
    const tables_proxy = loadTablesProxy();

    // 查找对应的表格配置（dir_name 已经由 SvelteKit 自动解码）
    const tableItem = tables_proxy.find((item) => item.dir_name === dir_name);

    if (!tableItem) {
      error(404, `Table not found: ${dir_name}`);
    }

    // 设置 locals，告诉 hooks 需要注入完整的 headerUrl
    locals.bmstableMeta = tableItem.url;

    return {
      dir_name,
      headerUrl: tableItem.url,
      originUrl: tableItem.url_ori ?? null,
    };
  } catch (err) {
    console.error(`Failed to load table ${dir_name}:`, err);
    throw err;
  }
};
