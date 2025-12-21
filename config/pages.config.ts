/**
 * 页面配置文件
 * 定义所有页面的配置，包括基础页面和动态生成的BMS表镜像页面
 */

import { PageConfig, BMSTablePageConfig } from "../src/config/pages";
import { resolve } from "path";
import { readFileSync } from "fs";

/** 基础页面配置（手动定义的页面） */
export const basePages: PageConfig[] = [
  {
    id: "home",
    title: "白喵斯的小屋",
    path: "/",
    component: "App.svelte",
    generateHtml: true,
  },
  {
    id: "bms",
    title: "BMS",
    path: "/bms",
    component: "pages/BMS.svelte",
    generateHtml: true,
  },
  {
    id: "bms",
    title: "BMS难度表镜像",
    path: "/bms/table-mirror",
    component: "pages/BMSTableMirror.svelte",
    generateHtml: true,
  },
  {
    id: "bms-table-self-sp",
    title: "难度表加载中",
    path: "/bms/table/self-sp",
    component: "pages/BMSTable.svelte",
    props: {
      header: "./header.json",
      origin_url: null,
    },
    head: [
      {
        tag: "meta",
        attributes: {
          name: "bmstable",
          content: "./header.json",
        },
      },
    ],
    generateHtml: true,
  },
  {
    id: "bms-table-self-dp",
    title: "难度表加载中",
    path: "/bms/table/self-dp",
    component: "pages/BMSTable.svelte",
    props: {
      header: "./header.json",
      origin_url: null,
    },
    head: [
      {
        tag: "meta",
        attributes: {
          name: "bmstable",
          content: "./header.json",
        },
      },
    ],
    generateHtml: true,
  },
];

/** BMS表镜像数据接口（对应tables_proxy.json的结构） */
interface BMSTableItem {
  dir_name: string;
  url: string;
  url_ori?: string;
}

function warnDuplicatePaths(pages: Array<{ path: string }>): void {
  const pathCounts = pages.reduce<Record<string, number>>((acc, page) => {
    acc[page.path] = (acc[page.path] || 0) + 1;
    return acc;
  }, {});

  const duplicates = Object.entries(pathCounts).filter(([, count]) => count > 1);
  if (duplicates.length === 0) return;

  console.warn("[pages.config] Found duplicate paths:");
  duplicates.forEach(([path, count]) => {
    console.warn(`  "${path}" appears ${count} times`);
  });
}

/**
 * 生成BMS表镜像页面配置
 * 从public/bms/table-mirror/tables_proxy.json读取数据并生成配置
 */
export function generateBMSTablePages(): BMSTablePageConfig[] {
  try {
    const tablesProxyPath = resolve(__dirname, "../public/bms/table-mirror/tables_proxy.json");
    const data: BMSTableItem[] = JSON.parse(readFileSync(tablesProxyPath, "utf-8"));

    const pages = data.map(
      (item): BMSTablePageConfig => ({
        id: `bms-table-mirror-${item.dir_name}`,
        type: "bms-table-mirror",
        title: "难度表加载中",
        path: `/bms/table-mirror/${item.dir_name}`,
        component: "pages/BMSTable.svelte",
        props: {
          header: item.url,
          origin_url: item.url_ori || null,
        },
        head: [
          {
            tag: "meta",
            attributes: {
              name: "bmstable",
              content: item.url,
            },
          },
        ],
        headerUrl: item.url,
        originUrl: item.url_ori,
        dirName: item.dir_name,
        generateHtml: true,
      })
    );

    if (process.env.NODE_ENV === "development") {
      console.log(`[pages.config] Generated ${pages.length} BMS table mirror pages`);
    }
    warnDuplicatePaths(pages);
    return pages;
  } catch (error) {
    console.error("Failed to generate BMS table pages:", error);
    // 开发环境下返回空数组，避免阻塞开发
    if (process.env.NODE_ENV === "development") {
      console.warn("Using empty BMS table pages for development");
      return [];
    }
    throw error;
  }
}

/**
 * 获取所有页面配置
 * 包括基础页面和动态生成的BMS表镜像页面
 */
export function getAllPages(): (PageConfig | BMSTablePageConfig)[] {
  return [...basePages, ...generateBMSTablePages()];
}
