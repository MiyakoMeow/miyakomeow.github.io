/**
 * 页面配置接口定义
 * 用于配置驱动生成HTML入口文件
 */

export interface PageConfig {
  /** 页面唯一标识符 */
  id: string;
  /** 页面标题（显示在浏览器标签页） */
  title: string;
  /** 页面描述（用于SEO） */
  description?: string;
  /** 页面路径（相对于网站根目录，如 '/'、'/bms/table-mirror/xxx'） */
  path: string;
  /** 使用的Svelte组件路径（相对于src目录，如 'App.svelte'、'pages/BMSTable.svelte'） */
  component: string;
  /** 传递给Svelte组件的props */
  props?: Record<string, any>;
  /** 额外的head标签（meta、link等） */
  head?: Array<{
    tag: string;
    attributes: Record<string, string>;
    content?: string;
  }>;
  /** 页面分组（用于组织） */
  group?: string;
  /** 是否生成HTML文件（默认true） */
  generateHtml?: boolean;
}

/** BMS表镜像页面特殊配置 */
export interface BMSTablePageConfig extends PageConfig {
  type: "bms-table-mirror";
  /** BMS表header.json的URL */
  headerUrl: string;
  /** 原始表的URL（可选） */
  originUrl?: string;
  /** 目录名称（用于生成路径） */
  dirName: string;
}

/** 页面配置类型联合 */
export type AnyPageConfig = PageConfig | BMSTablePageConfig;

/** 检查是否为BMS表镜像页面配置 */
export function isBMSTablePageConfig(config: AnyPageConfig): config is BMSTablePageConfig {
  return (config as BMSTablePageConfig).type === "bms-table-mirror";
}
