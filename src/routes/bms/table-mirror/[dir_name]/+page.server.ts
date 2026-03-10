import { readFileSync } from "node:fs";
import { join } from "node:path";

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

export function entries() {
  const tables_proxy = loadTablesProxy();
  const validTables = tables_proxy.filter(
    (item) => item.dir_name && item.dir_name.trim().length > 0
  );
  return validTables.map((item) => ({
    dir_name: encodeURIComponent(item.dir_name),
  }));
}
